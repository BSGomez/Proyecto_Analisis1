// index.js
import express from "express";
import { connectDB } from "./db.js";  // Importar la función de conexión a la base de datos
import usuariosRoutes from "./routes/usuariosRoutes.js";
import partidasRoutes from "./routes/partidasRoutes.js";

// Conectar a la base de datos
connectDB();

const app = express();

// Configurar el middleware para procesar JSON y URL-encoded
app.use(express.json()); // Asegúrate de que este esté antes de las rutas
app.use(express.urlencoded({ extended: true })); // Para procesar datos de formularios con URL-encoded

// Usar las rutas
app.use("/routes", usuariosRoutes);
 app.use("/routes", partidasRoutes);



 
// Ruta de prueba para asegurarse de que el servidor está corriendo
app.get("/routes", (req, res) => {
    res.json("Hola, este es el backend");
});

// Configurar el puerto y escuchar las solicitudes
const PORT = 8800;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
