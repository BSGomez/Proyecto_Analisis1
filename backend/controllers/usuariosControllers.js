import { getData } from '../utils/dbutils.js';
import { poolPromise } from '../db.js';
import mssql from 'mssql'; // Importar la librería mssql
export const obtenerTodosLosUsuarios = async (req, res) => {
    try {
        const { nombre } = req.query;
        const pool = await poolPromise;

        let result;

        if (nombre) {
            result = await pool.request()
                .input('nombre', mssql.VarChar, nombre)
                .query(`
                    SELECT ID_Usuario, Nombre_Usuario, Nombre_Completo, Email, Fecha_Creacion, Fecha_Modificacion
                    FROM Usuario
                    WHERE Nombre_Usuario = @nombre
                `);
        } else {
            result = await pool.request().query(`
                SELECT ID_Usuario, Nombre_Usuario, Nombre_Completo, Email, Fecha_Creacion, Fecha_Modificacion
                FROM Usuario
            `);
        }

        const usuarios = result.recordset;

        if (!usuarios || usuarios.length === 0) {
            return res.status(200).json([]);  // Mejor que 404, especialmente para el frontend
        }

        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios desde la base de datos.' });
    }
};
