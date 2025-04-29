// Controlador para Catálogo de Cuentas
import { getData, insertarDatos, actualizarRegistro, eliminarRegistro } from '../utils/dbutils.js';
import { poolPromise } from '../db.js';
import mssql from 'mssql'; // Importar la librería mssql


// Obtener cuentas del catálogo
export const obtenerTodasLasCuentas = async (req, res) => {
    try {
        const { tipoCuenta } = req.query;  // Puedes filtrar por tipo de cuenta si se pasa en la URL, por ejemplo ?tipoCuenta=Activo

        // Si el parámetro 'tipoCuenta' es pasado en la URL, agregar una condición para filtrar las cuentas por tipo
        let condiciones = "";
        if (tipoCuenta) {
            condiciones = `WHERE Tipo_Cuenta = '${tipoCuenta}'`;  // Filtra las cuentas por tipo
        }

        // Obtener las cuentas utilizando la función getData
        const cuentas = await getData(
            "Catalogo_Cuentas",
            ["Codigo_Cuenta", "Nombre_Cuenta", "Nivel", "Cuenta_Padre", "Tipo_Cuenta", "Naturaleza_Cuenta"],
            condiciones
        );

        // Si no se encuentran cuentas, devolver un error 404
        if (cuentas.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron cuentas en el catálogo." });
        }

        // Devolver las cuentas obtenidas
        res.status(200).json(cuentas);
    } catch (err) {
        console.error("Error al obtener las cuentas del catálogo:", err);
        res.status(500).json({ error: "Error al obtener las cuentas del catálogo de la base de datos." });
    }
};





export const insertarCuenta = async (req, res) => {
    try {
        const { Codigo_Cuenta, Nombre_Cuenta, Nivel, Cuenta_Padre, Tipo_Cuenta, Naturaleza_Cuenta } = req.body;

        if (!Codigo_Cuenta || !Nombre_Cuenta || !Nivel || !Tipo_Cuenta || !Naturaleza_Cuenta) {
            return res.status(400).json({ error: "Todos los campos obligatorios deben ser completados." });
        }

        // Verificar si el Codigo_Cuenta ya existe
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input('Codigo_Cuenta', mssql.VarChar, Codigo_Cuenta)
            .query('SELECT * FROM Catalogo_Cuentas WHERE Codigo_Cuenta = @Codigo_Cuenta');

        if (result.recordset.length > 0) {
            return res.status(400).json({ error: `El Codigo_Cuenta ${Codigo_Cuenta} ya existe.` });
        }

        const columnas = ["Codigo_Cuenta", "Nombre_Cuenta", "Nivel", "Cuenta_Padre", "Tipo_Cuenta", "Naturaleza_Cuenta"];
        const valores = [Codigo_Cuenta, Nombre_Cuenta, Nivel, Cuenta_Padre || null, Tipo_Cuenta, Naturaleza_Cuenta];

        await insertarDatos("Catalogo_Cuentas", columnas, valores);

        res.status(201).json({ mensaje: "Cuenta insertada exitosamente en el catálogo." });
    } catch (err) {
        console.error("Error al insertar cuenta:", err);
        res.status(500).json({ error: "Error al insertar cuenta en el catálogo." });
    }
};


// Actualizar cuenta existente
export const actualizarCuenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre_Cuenta, Nivel, Cuenta_Padre, Tipo_Cuenta, Naturaleza_Cuenta } = req.body;

        if (!Nombre_Cuenta || !Nivel || !Tipo_Cuenta || !Naturaleza_Cuenta) {
            return res.status(400).json({ error: "Todos los campos obligatorios deben ser completados." });
        }

        const columnas = ["Nombre_Cuenta", "Nivel", "Cuenta_Padre", "Tipo_Cuenta", "Naturaleza_Cuenta"];
        const valores = [Nombre_Cuenta, Nivel, Cuenta_Padre || null, Tipo_Cuenta, Naturaleza_Cuenta];

        const result = await actualizarRegistro("Catalogo_Cuentas", "Codigo_Cuenta", id, columnas, valores);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Cuenta no encontrada." });
        }

        res.status(200).json({ mensaje: "Cuenta actualizada exitosamente." });
    } catch (err) {
        console.error("Error al actualizar cuenta:", err);
        res.status(500).json({ error: "Error al actualizar cuenta del catálogo." });
    }
};

// Eliminar cuenta del catálogo
export const eliminarCuenta = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await eliminarRegistro("Catalogo_Cuentas", "Codigo_Cuenta", id);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Cuenta no encontrada." });
        }

        res.status(200).json({ mensaje: "Cuenta eliminada exitosamente del catálogo." });
    } catch (err) {
        console.error("Error al eliminar cuenta:", err);
        res.status(500).json({ error: "Error al eliminar cuenta del catálogo." });
    }
};

//obtener una sola cuenta
export const obtenerCuentaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input('Codigo_Cuenta', mssql.VarChar, id)
            .query('SELECT * FROM Catalogo_Cuentas WHERE Codigo_Cuenta = @Codigo_Cuenta');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Cuenta no encontrada." });
        }

        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error("Error al obtener cuenta:", err);
        res.status(500).json({ error: "Error al consultar la cuenta." });
    }
};
