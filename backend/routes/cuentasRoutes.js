// routes/cuentasRoutes.js
import express from 'express';
import * as cuentasController from '../controllers/cuentasControllers.js';

const router = express.Router();

router.get('/CON_CUENTAS', cuentasController.obtenerTodasLasCuentas);
router.post('/CON_CUENTAS', cuentasController.insertarCuenta);
router.put('/CON_CUENTAS/:id', cuentasController.actualizarCuenta);
router.delete('/CON_CUENTAS/:id', cuentasController.eliminarCuenta);
router.get('/CON_CUENTAS/:id', cuentasController.obtenerCuentaPorId);


export default router;
