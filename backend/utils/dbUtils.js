import mssql from 'mssql';   
import { poolPromise } from '../db.js'; 


// obtener datos de cualquier tabla
const getData = async (tabla, columnas = ["*"], condiciones = "") => {
    try {
        const pool = await poolPromise;  // Espera a que se resuelva el poolPromise
        const sqlQuery = `SELECT ${columnas.join(", ")} FROM ${tabla} ${condiciones}`;
        const result = await pool.request().query(sqlQuery);
        return result.recordset;  
    } catch (err) {
        throw new Error(`Error al obtener datos de la tabla ${tabla}: ${err.message}`);
    }
};

// Función para insertar datos en una tabla
const insertarDatos = async (tabla, columnas, valores) => {
    try {
        const pool = await poolPromise;
        const columnasStr = columnas.join(", ");
        const valoresStr = columnas.map((col) => `@${col}`).join(", ");
        const query = `INSERT INTO ${tabla} (${columnasStr}) VALUES (${valoresStr});`;
        const request = pool.request();

        columnas.forEach((col, index) => {
            let tipo = mssql.VarChar;
        
            if (col === "Nivel" || col === "Cuenta_Padre") {
                tipo = mssql.Int; // usa Int para campos numéricos
            }
        
            if (valores[index] === null) {
                request.input(col, tipo, null);
            } else {
                request.input(col, tipo, valores[index]);
            }
        });
        

        await request.query(query);
    } catch (err) {
        throw new Error(`Error al insertar datos en la tabla ${tabla}: ${err.message}`);
    }
};

// Función para actualizar un registro
const actualizarRegistro = async (tabla, columnaId, id, columnas, valores) => {
    try {
        const pool = await poolPromise;  

        let query = `UPDATE ${tabla} SET `;
        query += columnas.map((col, idx) => `${col} = @valor${idx}`).join(", ");
        query += ` WHERE ${columnaId} = @id`;

        const request = pool.request();

        // Añadir los valores como parámetros a la consulta
        columnas.forEach((col, idx) => {
            request.input(`valor${idx}`, valores[idx]);  // Asignamos el valor de cada columna
        });

        request.input('id', id);  // Agregar el ID del usuario

        const result = await request.query(query);  // Ejecutar la consulta

        return result;  // Retornar el resultado de la consulta
    } catch (error) {
        console.error("Error al actualizar el registro:", error);
        throw error;  // Lanzamos el error para manejarlo en el controlador
    }
};

// Función para eliminar un registro
const eliminarRegistro = async (tabla, idColumna, idValor) => {
    try {
        const pool = await poolPromise;
        const query = `DELETE FROM ${tabla} WHERE ${idColumna} = @idValor`;
        const request = pool.request();
        request.input("idValor", mssql.Int, idValor);
        const result = await request.query(query);

        return result;
    } catch (err) {
        throw new Error(`Error al eliminar en la tabla ${tabla}: ${err.message}`);
    }
};



// Exportatodas las funciones
export { 
    getData, 
    insertarDatos, 
    actualizarRegistro, 
    eliminarRegistro,
    
};
