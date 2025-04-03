import express from 'express';
import * as usuariosController from '../controllers/usuariosControllers.js'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

 
router.get('/CON_USUARIO', usuariosController.obtenerTodosLosUsuarios);
router.post('/CON_USUARIO', usuariosController.crearUsuario);
router.put('/CON_USUARIO/:id', usuariosController.actualizarUsuario);
router.delete('/CON_USUARIO/:id', usuariosController.eliminarUsuario);

 
export default router;
