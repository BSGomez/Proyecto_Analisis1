import express from 'express';
import {
  generarEstadoResultados,
  obtenerEstadoResultados
} from '../controllers/estadoResultadosController.js';

const router = express.Router();

// Agrega aquí el prefijo en cada ruta:
router.post('/estado-resultados', generarEstadoResultados);
router.get('/estado-resultados/:id', obtenerEstadoResultados);

export default router;
