// pdfLibroMayor.js
import express from 'express';
import { poolPromise } from '../db.js'; // Solo importamos poolPromise
import PDFDocument from 'pdfkit';

const router = express.Router();

router.get('/generar-libro-mayor-pdf', async (req, res) => {
    try {
        // Usamos la conexión poolPromise
        const pool = await poolPromise;  // Esto te dará la conexión a la base de datos

        const result = await pool.request().query(`
            SELECT D.Ref, D.Cuenta, C.Nombre_Cuenta, D.Debe, D.Haber, D.Descripcion, P.Fecha
            FROM Detalles_Partida D
            JOIN Catalogo_Cuentas C ON C.Codigo_Cuenta = D.Cuenta
            JOIN Partidas P ON P.ID_Partida = D.ID_Partida
            ORDER BY D.Ref, P.Fecha
        `);

        const movimientos = result.recordset;

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=LibroMayor.pdf');
        doc.pipe(res);

        let refActual = '';
        movimientos.forEach((mov) => {
            if (mov.Ref !== refActual) {
                refActual = mov.Ref;
                doc.addPage().fontSize(14).text(`Referencia: ${refActual}`, { underline: true });
            }

            doc.fontSize(10).text(`${mov.Fecha} | ${mov.Cuenta} - ${mov.Nombre_Cuenta}`);
            doc.text(`  Descripción: ${mov.Descripcion}`);
            doc.text(`  Debe: $${mov.Debe.toFixed(2)}  |  Haber: $${mov.Haber.toFixed(2)}\n`);
        });

        doc.end();
    } catch (err) {
        console.error('Error al generar PDF:', err);
        res.status(500).send('Error generando PDF');
    }
});

export default router;

