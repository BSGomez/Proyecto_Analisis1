

import { getData, insertarDatos, actualizarRegistro, eliminarRegistro } from '../utils/dbutils.js';

import { poolPromise } from '../db.js';
// Usa las funciones aquí




export const obtenerTodosLosUsuarios = async (req, res) => {
    try {
        const pool = await poolPromise;  
        const result = await pool.request().query("SELECT * FROM CON_USUARIO");
        res.json(result.recordset); 
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios de la base de datos' });
    }
};





export const obtenerUsuarios = async (req, res) => {
    try {
        const { correo } = req.query;
        let condiciones = "";
        if (correo) {
            condiciones = `WHERE USR_correo = '${correo}'`;
        }
        const usuarios = await getData("CON_USUARIO", ["USR_nombre", "USR_correo", "USR_rol", "USR_estado"], condiciones);
        
        if (usuarios.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json(usuarios);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ error: err.message });
    }
};

// Función para crear un usuario
export const crearUsuario = async (req, res) => {
    try {
        const { nombre, correo, contraseña, rol, estado } = req.body;

        // Verificar si todos los campos están presentes
        if (!nombre || !correo || !contraseña || !rol || !estado) {
            return res.status(400).json({ error: "Todos los campos son requeridos." });
        }

        // Llamar a la función para insertar el usuario en la base de datos usando insertarDatos
        const columnas = ["USR_nombre", "USR_correo", "USR_contraseña", "USR_rol", "USR_estado"];
        const valores = [nombre, correo, contraseña, rol, estado];
        
        await insertarDatos("CON_USUARIO", columnas, valores);

        // Responder con un mensaje de éxito
        res.status(201).json({ mensaje: "Usuario creado exitosamente" });
    } catch (err) {
        console.error("Error al insertar usuario:", err);
        res.status(500).json({ error: `Error al insertar usuario: ${err.message}` });
    }
};

// Función para actualizar un usuario
export const actualizarUsuario = async (req, res) => {
    try {
        // Extraer el ID del usuario y los datos a actualizar
        const { id } = req.params;
        const { nombre, correo, contraseña, rol, estado } = req.body;

        // Validar que todos los campos necesarios estén presentes
        if (!nombre || !correo || !contraseña || !rol || !estado) {
            return res.status(400).json({ error: "Todos los campos son requeridos." });
        }

        // Definir las columnas y los valores que vamos a actualizar
        const columnas = ["USR_nombre", "USR_correo", "USR_contraseña", "USR_rol", "USR_estado"];
        const valores = [nombre, correo, contraseña, rol, estado];

        // Llamar al servicio para actualizar el usuario en la base de datos
        const result = await actualizarRegistro(
            "CON_USUARIO",          // Nombre de la tabla
            "USR_id_usuario",       // Nombre de la columna que se utiliza como ID
            id,                     // ID del usuario a actualizar
            columnas,               // Columnas a actualizar
            valores                 // Valores a actualizar
        );

        // Si no se actualizó ningún registro, devolver un error
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Usuario actualizado exitosamente" });
    } catch (err) {
        console.error("Error al actualizar usuario:", err);
        res.status(500).json({ error: `Error al actualizar usuario: ${err.message}` });
    }
};

// Función para eliminar un usuario
export const eliminarUsuario = async (req, res) => {
    try {
        // Extraer el ID del usuario a eliminar
        const { id } = req.params;

        // Llamamos al servicio para eliminar el usuario de la base de datos
        const result = await eliminarRegistro(
            "CON_USUARIO",          // Nombre de la tabla
            "USR_id_usuario",       // Nombre de la columna que se utiliza como ID
            id                      // ID del usuario a eliminar
        );

        // Si no se eliminó ningún registro, devolver un error
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Usuario eliminado exitosamente" });
    } catch (err) {
        console.error("Error al eliminar usuario:", err);
        res.status(500).json({ error: `Error al eliminar usuario: ${err.message}` });
    }
};
