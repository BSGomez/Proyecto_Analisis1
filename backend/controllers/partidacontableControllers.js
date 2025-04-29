
/*
import { getData, insertarDatos, actualizarRegistro, eliminarRegistro } from '../utils/dbutils.js';

import { poolPromise } from '../db.js';

// Usa las funciones aquí

// Función para obtener las partidas contables
export const obtenerPartidas = async (req, res) => {
    try {
        const { tipo } = req.query;  // Puedes recibir parámetros de consulta como 'tipo'

        // Si el parámetro 'tipo' es pasado en la URL, agregar una condición para filtrar las partidas por tipo
        let condiciones = "";
        if (tipo) {
            condiciones = `WHERE Tipo = '${tipo}'`;  // Filtra las partidas por tipo
        }

        // Obtener las partidas contables utilizando la función getData
        const partidas = await getData("CON_PARTIDA_CONTABLE", ["PAR_id_partida", "PAR_descripcion", "PAR_fecha", "monto_total", "telefono",  "Tipo"], condiciones);
        
        // Si no se encuentran partidas, devolver un error 404
        if (partidas.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron partidas contables." });
        }

        // Devolver las partidas contables obtenidas
        res.status(200).json(partidas);
    } catch (err) {
        console.error("Error al obtener partidas contables:", err);
        res.status(500).json({ error: "Error al obtener partidas contables de la base de datos." });
    }
};


    
// Función para insertar una partida contable

export const insertarPartida = async (req, res) => {
    try {
        const { PAR_descripcion, PAR_fecha, monto_total, telefono, Tipo } = req.body;

        // Validación de los campos necesarios
        if (!PAR_descripcion || !PAR_fecha || !monto_total || !telefono || !Tipo) {
            return res.status(400).json({ error: "Todos los campos son necesarios." });
        }

        // Asegurarse de que monto_total sea un número decimal válido
        let montoDecimal = parseFloat(monto_total);
        if (isNaN(montoDecimal)) {
            return res.status(400).json({ error: "El campo monto_total debe ser un número válido." });
        }

        // Asegurarse de que el valor tenga dos decimales para que sea compatible con DECIMAL(18,2)
        montoDecimal = montoDecimal.toFixed(2);  // Esto garantiza que tenga 2 decimales

        // Validar que USR_id_usuario sea un número entero
      

        // Verificar que la fecha tenga el formato adecuado para la base de datos
        const fechaValida = new Date(PAR_fecha);
        if (isNaN(fechaValida.getTime())) {
            return res.status(400).json({ error: "El campo PAR_fecha debe ser una fecha válida." });
        }

        // Definir las columnas y los valores para la inserción
        const columnas = ["PAR_descripcion", "PAR_fecha", "monto_total", "telefono", "Tipo"];
        const valores = [PAR_descripcion, fechaValida.toISOString().split('T')[0], montoDecimal, telefono, Tipo];

        // Llamar a la función insertarDatos para insertar la partida contable
        await insertarDatos("CON_PARTIDA_CONTABLE", columnas, valores);

        res.status(201).json({ mensaje: "Partida contable insertada exitosamente" });
    } catch (err) {
        console.error("Error al insertar partida contable:", err);
        res.status(500).json({ error: "Error al insertar partida contable en la base de datos" });
    }
};








// Función para actualizar una partida contable
export const actualizarPartida = async (req, res) => {
    try {
        const { id } = req.params;  // ID de la partida contable a actualizar
        const { PAR_descripcion, PAR_fecha, monto_total, telefono, Tipo } = req.body;

        // Validación de los campos necesarios
        if (!PAR_descripcion || !PAR_fecha || !monto_total || !telefono || !Tipo) {
            return res.status(400).json({ error: "Todos los campos son necesarios." });
        }

        // Asegurarse de que monto_total sea un número decimal válido
        let montoDecimal = parseFloat(monto_total);
        
        if (isNaN(montoDecimal)) {
            return res.status(400).json({ error: "El campo monto_total debe ser un número válido." });
        }

        // Asegurarse de que el valor tenga dos decimales para que sea compatible con DECIMAL(18,2)
        montoDecimal = montoDecimal.toFixed(2);  // Esto garantiza que tenga 2 decimales

        // Verificar que la fecha tenga el formato adecuado para la base de datos
        const fechaValida = new Date(PAR_fecha);
        if (isNaN(fechaValida.getTime())) {
            return res.status(400).json({ error: "El campo PAR_fecha debe ser una fecha válida." });
        }

        // Definir las columnas y los valores para la actualización
        const columnas = ["PAR_descripcion", "PAR_fecha", "monto_total", "telefono", "Tipo"];
        const valores = [PAR_descripcion, fechaValida.toISOString().split('T')[0], montoDecimal, telefono, Tipo];

        // Llamar a la función actualizarRegistro para actualizar la partida contable
        const result = await actualizarRegistro("CON_PARTIDA_CONTABLE", "PAR_id_partida", id, columnas, valores);

        // Si no se actualizó ningún registro, devolver un error
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Partida contable no encontrada" });
        }

        res.status(200).json({ mensaje: "Partida contable actualizada exitosamente" });
    } catch (err) {
        console.error("Error al actualizar partida contable:", err);
        res.status(500).json({ error: "Error al actualizar partida contable en la base de datos" });
    }
};


export const eliminarPartida = async (req, res) => {
    try {
        const { id } = req.params;  // Obtener el ID de la partida contable desde los parámetros de la URL

        // Llamar a la función eliminarRegistro para eliminar la partida contable
        const result = await eliminarRegistro("CON_PARTIDA_CONTABLE", "PAR_id_partida", id);

        // Si no se eliminó ningún registro, devolver un error
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Partida contable no encontrada" });
        }

        res.status(200).json({ mensaje: "Partida contable eliminada exitosamente" });
    } catch (err) {
        console.error("Error al eliminar partida contable:", err);
        res.status(500).json({ error: "Error al eliminar partida contable en la base de datos" });
    }
};
*/