import express from 'express';
import * as balanceSaldosController from '../controllers/balanceSaldosController.js';
import { obtenerBalanceCalculado } from '../controllers/balanceSaldosController.js';


const router = express.Router();

router.get('/balanceSaldos', balanceSaldosController.obtenerBalanceSaldos);
router.post('/balanceSaldos', balanceSaldosController.insertarBalanceSaldo);
router.put('/balanceSaldos/:id', balanceSaldosController.actualizarBalanceSaldo);
router.delete('/balanceSaldos/:id', balanceSaldosController.eliminarBalanceSaldo);
router.get('/balanceSaldos/calculado', obtenerBalanceCalculado);

export default router;
