// controllers/estadoResultadosController.js
import { poolPromise } from '../db.js';
import mssql from 'mssql';

export const generarEstadoResultados = async (req, res) => {
  const { Periodo_Inicio, Periodo_Fin } = req.body;
  if (!Periodo_Inicio || !Periodo_Fin) {
    return res.status(400).json({ error: "Periodo_Inicio y Periodo_Fin son requeridos." });
  }

  try {
    const pool = await poolPromise;

    // 0a) Borrar detalles asociados al periodo
    await pool.request()
      .input("Periodo_Inicio", mssql.Date, Periodo_Inicio)
      .input("Periodo_Fin",    mssql.Date, Periodo_Fin)
      .query(`
        DELETE d
        FROM Detalle_Estado_Resultados d
        JOIN Estado_Resultados e
          ON d.ID_Estado_Resultado = e.ID_Estado_Resultado
        WHERE e.Periodo_Inicio = @Periodo_Inicio
          AND e.Periodo_Fin    = @Periodo_Fin
      `);

    // 0b) Borrar encabezado
    await pool.request()
      .input("Periodo_Inicio", mssql.Date, Periodo_Inicio)
      .input("Periodo_Fin",    mssql.Date, Periodo_Fin)
      .query(`
        DELETE
        FROM Estado_Resultados
        WHERE Periodo_Inicio = @Periodo_Inicio
          AND Periodo_Fin    = @Periodo_Fin
      `);

    // 1) Traer solo Ingreso/Costo/Gasto en el rango
    const movimientos = await pool.request()
      .input("inicio", mssql.Date, Periodo_Inicio)
      .input("fin",    mssql.Date, Periodo_Fin)
      .query(`
        SELECT 
          c.Tipo_Cuenta,
          c.Naturaleza_Cuenta,
          dp.Cuenta    AS Codigo_Cuenta,
          dp.Debe,
          dp.Haber
        FROM Detalles_Partida dp
        JOIN Partidas p ON dp.ID_Partida = p.ID_Partida
        JOIN Catalogo_Cuentas c ON c.Codigo_Cuenta = dp.Cuenta
        WHERE p.Fecha BETWEEN @inicio AND @fin
          AND c.Tipo_Cuenta IN ('Ingreso','Costo','Gasto');
      `);

    // 2) Calcular totales
    let ingresos = 0, costos = 0, gastos = 0;
    movimientos.recordset.forEach(row => {
      const monto = parseFloat(row.Debe || 0) - parseFloat(row.Haber || 0);
      if (row.Tipo_Cuenta === "Ingreso") ingresos += row.Naturaleza_Cuenta === "Acreedora" ? -monto : monto;
      if (row.Tipo_Cuenta === "Costo")   costos   += row.Naturaleza_Cuenta === "Deudora"  ? monto : -monto;
      if (row.Tipo_Cuenta === "Gasto")   gastos   += row.Naturaleza_Cuenta === "Deudora"  ? monto : -monto;
    });
    const impuesto     = ingresos > 0 ? ingresos * 0.05 : 0;
    const resultadoNet = ingresos - costos - gastos - impuesto;

    // 3) Insertar encabezado
    const insertEnc = await pool.request()
      .input("Periodo_Inicio",   mssql.Date,    Periodo_Inicio)
      .input("Periodo_Fin",      mssql.Date,    Periodo_Fin)
      .input("Ingresos",         mssql.Decimal(15,2), ingresos)
      .input("Costos_Ventas",    mssql.Decimal(15,2), costos)
      .input("Gastos_Operacion", mssql.Decimal(15,2), gastos)
      .input("Impuesto_Renta",   mssql.Decimal(15,2), impuesto)
      .input("Resultado_Neto",   mssql.Decimal(15,2), resultadoNet)
      .query(`
        INSERT INTO Estado_Resultados
          (Periodo_Inicio, Periodo_Fin, Ingresos, Costos_Ventas, Gastos_Operacion, Impuesto_Renta, Resultado_Neto)
        OUTPUT INSERTED.ID_Estado_Resultado
        VALUES
          (@Periodo_Inicio, @Periodo_Fin, @Ingresos, @Costos_Ventas, @Gastos_Operacion, @Impuesto_Renta, @Resultado_Neto);
      `);

    const idEstado = insertEnc.recordset[0].ID_Estado_Resultado;

    // 4) Insertar detalle
    for (const row of movimientos.recordset) {
      const valor = parseFloat(row.Debe || 0) - parseFloat(row.Haber || 0);
      await pool.request()
        .input("ID_Estado_Resultado", mssql.Int,    idEstado)
        .input("Codigo_Cuenta",       mssql.VarChar(50), row.Codigo_Cuenta)
        .input("Valor",               mssql.Decimal(15,2), valor)
        .input("Tipo_Rubro",          mssql.VarChar(10),   row.Tipo_Cuenta)
        .query(`
          INSERT INTO Detalle_Estado_Resultados
            (ID_Estado_Resultado, Codigo_Cuenta, Valor, Tipo_Rubro)
          VALUES
            (@ID_Estado_Resultado, @Codigo_Cuenta, @Valor, @Tipo_Rubro);
        `);
    }

    res.status(201).json({ ID_Estado_Resultado: idEstado });
  } catch (err) {
    console.error("Error al generar estado de resultados:", err);
    res.status(500).json({ error: "Error al generar estado de resultados", details: err.message });
  }
};

export const obtenerEstadoResultados = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;

    const resumen = await pool.request()
      .input("ID", mssql.Int, id)
      .query(`
        SELECT Periodo_Inicio, Periodo_Fin, Ingresos, Costos_Ventas, Gastos_Operacion,
               Impuesto_Renta, Resultado_Neto, Fecha_Creacion
        FROM Estado_Resultados
        WHERE ID_Estado_Resultado = @ID;
      `);

    if (resumen.recordset.length === 0) {
      return res.status(404).json({ error: "Estado de resultados no encontrado." });
    }

    const detalles = await pool.request()
      .input("ID", mssql.Int, id)
      .query(`
        SELECT Codigo_Cuenta, Valor, Tipo_Rubro
        FROM Detalle_Estado_Resultados
        WHERE ID_Estado_Resultado = @ID;
      `);

    res.json({
      resumen: resumen.recordset[0],
      detalles: detalles.recordset
    });
  } catch (err) {
    console.error("Error al obtener estado de resultados:", err);
    res.status(500).json({ error: "Error al obtener estado de resultados", details: err.message });
  }
};
