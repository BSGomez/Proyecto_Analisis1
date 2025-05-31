// index.js
import express from "express";
import cors from 'cors';

import { connectDB } from "./db.js";  // Importar la función de conexión a la base de datos
import usuariosRoutes from "./routes/usuariosRoutes.js";
//import partidasRoutes from "./routes/partidasRoutes.js";
import cuentasRoutes from "./routes/cuentasRoutes.js";
import libroMayorRoutes from './routes/libroMayorRoutes.js';
import pdfLibroMayor from './routes/pdfLibroMayor.js';
import balanceSaldosRoutes from './routes/balanceSaldosRoutes.js';
import partidasRoutes from './routes/partidasRoutes.js';
import estadoResultadosRoutes from './routes/estadoResultadosRoutes.js';
import polizasRoutes from './routes/polizasRoutes.js';






// Conectar a la base de datos
connectDB();

const app = express();


 //app.use(cors());

 app.use(cors({
    origin: 'http://localhost:3000',  // Asegúrate de que esta URL coincida con tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'],  // Encabezados permitidos
}));

// Configurar el middleware para procesar JSON y URL-encoded
app.use(express.json()); // Asegúrate de que este esté antes de las rutas
app.use(express.urlencoded({ extended: true })); // Para procesar datos de formularios con URL-encoded

// Usar las rutas
app.use("/routes", usuariosRoutes);
//app.use("/routes", partidasRoutes);
app.use("/routes", cuentasRoutes);
app.use("/routes", libroMayorRoutes);
app.use("/routes", libroMayorRoutes);
app.use("/routes", pdfLibroMayor);
app.use("/routes", balanceSaldosRoutes);
app.use("/routes", partidasRoutes);
app.use('/routes', estadoResultadosRoutes);
app.use('/routes', polizasRoutes);



 
// Ruta de prueba para asegurarse de que el servidor está corriendo
app.get("/routes", (req, res) => {
    res.json("Hola, este es el backend");
});

// Configurar el puerto y escuchar las solicitudes
const PORT = 8800;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

 

 