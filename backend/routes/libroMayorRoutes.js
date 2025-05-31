import express from 'express';
import * as libroMayorController from '../controllers/libroMayorController.js';

const router = express.Router();

// Ruta principal para obtener los movimientos del Libro Mayor
router.get('/libro-mayor', libroMayorController.obtenerLibroMayor);


export default router;
