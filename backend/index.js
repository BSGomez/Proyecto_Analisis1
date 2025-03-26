import express from "express";
import mssql from "mssql";


const dbConfig = {
    user: "sa",
    password: "1234",
    database: "testAnalisis",
    server: "127.0.0.1",
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};


let pool;
async function connectDB() {
    try {
        pool = await mssql.connect(dbConfig);
        console.log("Conexión exitosa a SQL Server");
    } catch (err) {
        console.error("Error al conectar a SQL Server:", err);
    }
}

connectDB();


const app = express();


app.get("/", (req, res) => {
    res.json("Hola, este es el backend");
});

app.get("/presupuesto", async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ error: "No hay conexión con la base de datos" });
        }

        const result = await pool.request().query("SELECT * FROM Presupuesto;");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error en la consulta:", err);
        res.status(500).json({ error: "Error en la consulta a la base de datos" });
    }
});


const PORT = 8800;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

