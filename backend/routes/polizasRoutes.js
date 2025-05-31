// routes/polizasRoutes.js
import express from 'express';
import {
  crearPoliza,
  listarPolizas
} from '../controllers/polizasController.js';

const router = express.Router();

router.post('/polizas', crearPoliza);
router.get('/polizas', listarPolizas);

export default router;
