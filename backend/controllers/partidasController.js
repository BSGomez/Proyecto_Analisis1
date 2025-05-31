import { poolPromise } from '../db.js';
import mssql from 'mssql';

// POST - Insertar una partida y sus detalles
export const insertarPartida = async (req, res) => {
    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);

    try {
        const {
            Fecha,
            Numero_Asiento,
            Descripcion,
            ID_Usuario_Creacion = null,
            ID_Tipo_Asiento = null,
            ID_Poliza = null,
            Detalles
        } = req.body;

        if (!Fecha || !Numero_Asiento || !Descripcion || !Detalles || Detalles.length === 0) {
            return res.status(400).json({ error: "Datos principales y al menos un detalle son requeridos." });
        }

        await transaction.begin();
        const request = new mssql.Request(transaction);

        const resultPartida = await request
            .input("Fecha", mssql.Date, Fecha)
            .input("Numero_Asiento", mssql.Int, Numero_Asiento)
            .input("Descripcion", mssql.VarChar(255), Descripcion)
            .input("ID_Usuario_Creacion", mssql.Int, ID_Usuario_Creacion)
            .input("ID_Tipo_Asiento", mssql.Int, ID_Tipo_Asiento)
            .input("ID_Poliza", mssql.Int, ID_Poliza)
            .query(`
                INSERT INTO Partidas (Fecha, Numero_Asiento, Descripcion, ID_Usuario_Creacion, ID_Tipo_Asiento, ID_Poliza)
                OUTPUT INSERTED.ID_Partida
                VALUES (@Fecha, @Numero_Asiento, @Descripcion, @ID_Usuario_Creacion, @ID_Tipo_Asiento, @ID_Poliza);
            `);

        const ID_Partida = resultPartida.recordset[0].ID_Partida;

        // 🔹 INSERTAR DETALLES EN Detalles_Partida
        for (const detalle of Detalles) {
            const detalleReq = new mssql.Request(transaction);
            await detalleReq
                .input("ID_Partida", mssql.Int, ID_Partida)
                .input("Cuenta", mssql.VarChar(50), detalle.Cuenta)
                .input("Debe", mssql.Decimal(15, 2), detalle.Debe || 0)
                .input("Haber", mssql.Decimal(15, 2), detalle.Haber || 0)
                .input("Descripcion", mssql.VarChar(255), detalle.Descripcion || null)
                .input("ID_Impuesto", mssql.Int, detalle.ID_Impuesto || null)
                .query(`
                    INSERT INTO Detalles_Partida (ID_Partida, Cuenta, Debe, Haber, Descripcion, ID_Impuesto)
                    VALUES (@ID_Partida, @Cuenta, @Debe, @Haber, @Descripcion, @ID_Impuesto);
                `);
        }

        // 🔹 ACTUALIZAR O INSERTAR EN Balance_Saldos
        for (const detalle of Detalles) {
            const checkReq = new mssql.Request(transaction);
            const existe = await checkReq
                .input("Codigo_Cuenta", mssql.VarChar(50), detalle.Cuenta)
                .input("Fecha_Corte", mssql.Date, Fecha)
                .query(`
                    SELECT * FROM Balance_Saldos 
                    WHERE Codigo_Cuenta = @Codigo_Cuenta AND Fecha_Corte = @Fecha_Corte
                `);

            if (existe.recordset.length > 0) {
                const saldoActual = existe.recordset[0];
                const updateReq = new mssql.Request(transaction);
                await updateReq
                    .input("Codigo_Cuenta", mssql.VarChar(50), detalle.Cuenta)
                    .input("Fecha_Corte", mssql.Date, Fecha)
                    .input("Saldo_Deudor", mssql.Decimal(15, 2), saldoActual.Saldo_Deudor + parseFloat(detalle.Debe || 0))
                    .input("Saldo_Acreedor", mssql.Decimal(15, 2), saldoActual.Saldo_Acreedor + parseFloat(detalle.Haber || 0))
                    .query(`
                        UPDATE Balance_Saldos 
                        SET Saldo_Deudor = @Saldo_Deudor, Saldo_Acreedor = @Saldo_Acreedor, Fecha_Modificacion = GETDATE()
                        WHERE Codigo_Cuenta = @Codigo_Cuenta AND Fecha_Corte = @Fecha_Corte
                    `);
            } else {
                const insertReq = new mssql.Request(transaction);
                await insertReq
                    .input("Codigo_Cuenta", mssql.VarChar(50), detalle.Cuenta)
                    .input("Fecha_Corte", mssql.Date, Fecha)
                    .input("Saldo_Deudor", mssql.Decimal(15, 2), parseFloat(detalle.Debe || 0))
                    .input("Saldo_Acreedor", mssql.Decimal(15, 2), parseFloat(detalle.Haber || 0))
                    .query(`
                        INSERT INTO Balance_Saldos (Codigo_Cuenta, Fecha_Corte, Saldo_Deudor, Saldo_Acreedor)
                        VALUES (@Codigo_Cuenta, @Fecha_Corte, @Saldo_Deudor, @Saldo_Acreedor)
                    `);
            }
        }

        await transaction.commit();
        res.status(201).json({ message: "Partida y detalles insertados correctamente", ID_Partida });

    } catch (err) {
        await transaction.rollback();
        console.error("Error al insertar partida:", err);
        res.status(500).json({ error: "Error al insertar partida", details: err.message });
    }
};

// GET - Obtener el libro diario (Partidas + Detalles)
export const obtenerLibroDiario = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                p.ID_Partida, p.Fecha, p.Numero_Asiento, p.Descripcion AS Descripcion_Partida,
                d.ID_Detalle, d.Cuenta, d.Debe, d.Haber, d.Descripcion AS Descripcion_Detalle
            FROM Partidas p
            LEFT JOIN Detalles_Partida d ON p.ID_Partida = d.ID_Partida
            ORDER BY p.Fecha, p.Numero_Asiento;
        `);

        const partidas = {};
        result.recordset.forEach(record => {
            if (!partidas[record.ID_Partida]) {
                partidas[record.ID_Partida] = {
                    ID_Partida: record.ID_Partida,
                    Fecha: record.Fecha,
                    Numero_Asiento: record.Numero_Asiento,
                    Descripcion_Partida: record.Descripcion_Partida,
                    Detalles: []
                };
            }
            if (record.ID_Detalle) {
                partidas[record.ID_Partida].Detalles.push({
                    ID_Detalle: record.ID_Detalle,
                    Cuenta: record.Cuenta,
                    Debe: record.Debe,
                    Haber: record.Haber,
                    Descripcion: record.Descripcion_Detalle
                });
            }
        });

        res.json(Object.values(partidas));
    } catch (err) {
        console.error("Error al obtener libro diario:", err);
        res.status(500).json({ error: "Error al obtener libro diario", details: err.message });
    }
};

// PUT - Actualizar partida y sus detalles
export const actualizarPartida = async (req, res) => {
    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);

    try {
        const { id } = req.params;
        const { Fecha, Numero_Asiento, Descripcion, Detalles } = req.body;

        await transaction.begin();

        await new mssql.Request(transaction)
            .input("ID_Partida", mssql.Int, id)
            .input("Fecha", mssql.Date, Fecha)
            .input("Numero_Asiento", mssql.Int, Numero_Asiento)
            .input("Descripcion", mssql.VarChar(255), Descripcion)
            .query(`
                UPDATE Partidas
                SET Fecha = @Fecha, Numero_Asiento = @Numero_Asiento, Descripcion = @Descripcion
                WHERE ID_Partida = @ID_Partida;
            `);

        await new mssql.Request(transaction)
            .input("ID_Partida", mssql.Int, id)
            .query(`DELETE FROM Detalles_Partida WHERE ID_Partida = @ID_Partida;`);

        for (const detalle of Detalles) {
            const validacion = await new mssql.Request(transaction)
                .input("Cuenta", mssql.VarChar(50), detalle.Cuenta)
                .query(`SELECT Codigo_Cuenta FROM Catalogo_Cuentas WHERE Codigo_Cuenta = @Cuenta;`);

            if (validacion.recordset.length === 0) {
                throw new Error(`Cuenta '${detalle.Cuenta}' no existe.`);
            }

            await new mssql.Request(transaction)
                .input("ID_Partida", mssql.Int, id)
                .input("Cuenta", mssql.VarChar(50), detalle.Cuenta)
                .input("Debe", mssql.Decimal(15, 2), detalle.Debe || 0)
                .input("Haber", mssql.Decimal(15, 2), detalle.Haber || 0)
                .input("Descripcion", mssql.VarChar(255), detalle.Descripcion || null)
                .input("ID_Impuesto", mssql.Int, detalle.ID_Impuesto || null)
                .query(`
                    INSERT INTO Detalles_Partida (ID_Partida, Cuenta, Debe, Haber, Descripcion, ID_Impuesto)
                    VALUES (@ID_Partida, @Cuenta, @Debe, @Haber, @Descripcion, @ID_Impuesto);
                `);
        }

        await transaction.commit();
        res.json({ message: "Partida y detalles actualizados correctamente." });
    } catch (err) {
        await transaction.rollback();
        console.error("Error al actualizar partida:", err);
        res.status(500).json({ error: "Error al actualizar partida", details: err.message });
    }
};

// DELETE - Eliminar partida y sus detalles
export const eliminarPartida = async (req, res) => {
    const pool = await poolPromise;
    const transaction = new mssql.Transaction(pool);

    try {
        const { id } = req.params;

        await transaction.begin();

        await new mssql.Request(transaction)
            .input("ID_Partida", mssql.Int, id)
            .query("DELETE FROM Detalles_Partida WHERE ID_Partida = @ID_Partida;");

        await new mssql.Request(transaction)
            .input("ID_Partida", mssql.Int, id)
            .query("DELETE FROM Partidas WHERE ID_Partida = @ID_Partida;");

        await transaction.commit();

        res.json({ message: "Partida y detalles eliminados correctamente." });
    } catch (err) {
        await transaction.rollback();
        console.error("Error al eliminar partida:", err);
        res.status(500).json({ error: "Error al eliminar partida", details: err.message });
    }
};
