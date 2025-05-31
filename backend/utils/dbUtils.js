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
        const valoresStr = columnas.map(col => `@${col}`).join(", ");
        const query = `INSERT INTO ${tabla} (${columnasStr}) VALUES (${valoresStr});`;
        const request = pool.request();

        columnas.forEach((col, index) => {
            let tipo = mssql.VarChar;

            if (["Nivel", "Cuenta_Padre"].includes(col)) {
                tipo = mssql.Int;
            } else if (["Saldo_Deudor", "Saldo_Acreedor"].includes(col)) {
                tipo = mssql.Decimal(15, 2);
            } else if (col.toLowerCase().includes("fecha")) {
                tipo = mssql.Date;
            }

            request.input(col, tipo, valores[index]);
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
async function ejecutarConsulta(query, params = {}) {
    try {
      const pool = await poolPromise;
      const request = pool.request();
  
      if (typeof params !== 'object' || Array.isArray(params)) {
        throw new Error('Los parámetros deben ser un objeto plano');
      }
  
      for (const key in params) {
        request.input(key, params[key]);
      }
  
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error('Error al ejecutar consulta SQL:', err);
      throw err;
    }
  }
  




// Exportatodas las funciones
export { 
    getData, 
    insertarDatos, 
    actualizarRegistro, 
    eliminarRegistro,
    ejecutarConsulta,
    
};
