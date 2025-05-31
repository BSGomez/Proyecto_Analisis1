import { poolPromise } from '../db.js';
import mssql from 'mssql';
import { insertarDatos, actualizarRegistro, eliminarRegistro} from '../utils/dbUtils.js';

// GET - Obtener todos los registros
export const obtenerBalanceSaldos = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Balance_Saldos;");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener balance de saldos:", err);
        res.status(500).json({ error: "Error al consultar la base de datos" });
    }
};

// POST - Insertar nuevo registro
export const insertarBalanceSaldo = async (req, res) => {
    try {
      const {
        Fecha_Corte,
        Codigo_Cuenta,
        Saldo_Deudor,
        Saldo_Acreedor
      } = req.body;
  
      // Validar y convertir los valores numéricos
      const Saldo_Deudor_Num = isNaN(Number(Saldo_Deudor)) ? 0.00 : parseFloat(Saldo_Deudor);
      const Saldo_Acreedor_Num = isNaN(Number(Saldo_Acreedor)) ? 0.00 : parseFloat(Saldo_Acreedor);
  
      const columnas = [
        "Codigo_Cuenta",
        "Fecha_Corte",
        "Saldo_Deudor",
        "Saldo_Acreedor"
      ];
  
      const valores = [
        Codigo_Cuenta,
        Fecha_Corte,
        Saldo_Deudor_Num,
        Saldo_Acreedor_Num
      ];
  
      await insertarDatos("Balance_Saldos", columnas, valores);
  
      res.status(201).json({ message: "Registro insertado correctamente" });
    } catch (err) {
      console.error("Error al insertar balance de saldos:", err);
      res.status(500).json({ error: "Error al insertar en la base de datos", details: err.message });
    }
  };
  

// PUT - Actualizar un registro
export const actualizarBalanceSaldo = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            Fecha_Corte,
            Codigo_Cuenta,
            Saldo_Deudor,
            Saldo_Acreedor
        } = req.body;

        const columnas = [
            "Fecha_Corte",
            "Codigo_Cuenta",
            "Saldo_Deudor",
            "Saldo_Acreedor"
          ];
          
          const valores = [
            Fecha_Corte,
            Codigo_Cuenta,
            parseFloat(Saldo_Deudor) || 0,
            parseFloat(Saldo_Acreedor) || 0
          ];
          

        const result = await actualizarRegistro("Balance_Saldos", "ID_Balance", id, columnas, valores);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Registro no encontrado" });
        }

        res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
        console.error("Error al actualizar balance de saldos:", err);
        res.status(500).json({ error: "Error al actualizar en la base de datos", details: err.message });
    }
};

// DELETE - Eliminar un registro
export const eliminarBalanceSaldo = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await eliminarRegistro("Balance_Saldos", "ID_Balance", id);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Registro no encontrado" });
        }

        res.json({ message: "Registro eliminado correctamente" });
    } catch (err) {
        console.error("Error al eliminar balance de saldos:", err);
        res.status(500).json({ error: "Error al eliminar en la base de datos", details: err.message });
    }





    
};
// GET - Balance calculado desde Detalles_Partida
export const obtenerBalanceCalculado = async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
  Codigo_Cuenta,
  SUM(Saldo_Deudor) AS Total_Deudor,
  SUM(Saldo_Acreedor) AS Total_Acreedor
FROM Balance_Saldos
GROUP BY Codigo_Cuenta;
      `);
  
      res.json(result.recordset);
    } catch (err) {
      console.error("Error al calcular balance:", err);
      res.status(500).json({ error: "Error al calcular balance", details: err.message });
    }
  };
  