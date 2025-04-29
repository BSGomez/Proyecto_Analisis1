// db.js
import mssql from 'mssql';
import cors from 'cors';

// Configuración de la base de datos
const dbConfig = {
    user: "sa",
    password: "1234",
    database: "testAnalisis",
    server: "localhost",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

// Conexión a la base de datos
let poolPromise;
export async function connectDB() {
    try {
        poolPromise = await mssql.connect(dbConfig);
        console.log("Conexión exitosa a SQL Server");
    } catch (err) {
        console.error("Error al conectar a SQL Server:", err);
    }
}

// Exportar la conexión (poolPromise) para usarla en otros archivos
export { poolPromise };

