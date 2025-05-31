import express from 'express';
import * as partidasController from '../controllers/partidasController.js';

const router = express.Router();

router.post('/partidas', partidasController.insertarPartida);
router.get('/libro-diario', partidasController.obtenerLibroDiario);
router.put('/partidas/:id', partidasController.actualizarPartida);
router.delete('/partidas/:id', partidasController.eliminarPartida);

export default router;
