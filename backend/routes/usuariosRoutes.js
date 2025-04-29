import express from 'express';
import * as usuariosController from '../controllers/usuariosControllers.js';

const router = express.Router();

router.get('/usuarios', usuariosController.obtenerTodosLosUsuarios);
//router.post('/usuarios', usuariosController.crearUsuario);
//router.put('/usuarios/:id', usuariosController.actualizarUsuario);
//router.delete('/usuarios/:id', usuariosController.eliminarUsuario);

// Nueva ruta para obtener roles
//router.get('/roles', usuariosController.obtenerRoles);

export default router;