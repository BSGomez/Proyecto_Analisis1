import { ejecutarConsulta } from '../utils/dbUtils.js';
import PDFDocument from 'pdfkit';
import getStream from 'get-stream';

export const obtenerLibroMayor = async (req, res) => {
  try {
    const { cuenta, fechaInicio, fechaFin, periodo, referencia, exportar } = req.query;

    let condiciones = [];
    let params = {};

    if (cuenta) {
      const cuentas = Array.isArray(cuenta) ? cuenta : [cuenta];
      const cuentasStr = cuentas.map(c => `'${c}'`).join(", ");
      condiciones.push(`dp.Cuenta IN (${cuentasStr})`);
    }

    if (fechaInicio && fechaFin) {
      condiciones.push('p.Fecha BETWEEN @fechaInicio AND @fechaFin');
      params.fechaInicio = fechaInicio;
      params.fechaFin = fechaFin;
    }

    if (periodo) {
      const [q, year] = periodo.split('_');
      const trimestre = q.replace('Q', '');
      condiciones.push(`YEAR(p.Fecha) = ${year} AND DATEPART(QUARTER, p.Fecha) = ${trimestre}`);
    }

    if (referencia) {
      condiciones.push('dp.Ref LIKE @referencia');
      params.referencia = `%${referencia}%`;
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const query = `
      SELECT 
        dp.Cuenta AS codigoCuenta,
        cc.Nombre_Cuenta AS nombreCuenta,
        cc.Nivel AS nivel,
        cc.Cuenta_Padre AS cuentaPadre,
        p.Numero_Asiento AS numeroAsiento,
        p.Fecha AS fecha,
        pol.Tipo_Poliza AS tipoPoliza,
        dp.Ref AS referencia,
        dp.Descripcion AS descripcion,
        dp.Debe AS debe,
        dp.Haber AS haber
      FROM 
        Detalles_Partida dp
      INNER JOIN 
        Partidas p ON dp.ID_Partida = p.ID_Partida
      INNER JOIN 
        Catalogo_Cuentas cc ON dp.Cuenta = cc.Codigo_Cuenta
      LEFT JOIN 
        Polizas pol ON p.ID_Poliza = pol.ID_Poliza
      ${whereClause}
      ORDER BY 
        cc.Nivel, cc.Cuenta_Padre, dp.Cuenta, p.Fecha, p.Numero_Asiento;
    `;

    const resultados = await ejecutarConsulta(query, params);

    if (!Array.isArray(resultados)) {
      return res.status(500).json({ mensaje: 'Error en la consulta' });
    }

    const cuentasMap = {};
    resultados.forEach(mov => {
      if (!cuentasMap[mov.codigoCuenta]) {
        cuentasMap[mov.codigoCuenta] = {
          codigoCuenta: mov.codigoCuenta,
          nombreCuenta: mov.nombreCuenta,
          nivel: mov.nivel,
          cuentaPadre: mov.cuentaPadre,
          movimientos: [],
          totalDebe: 0,
          totalHaber: 0,
          saldoFinal: 0,
        };
      }
      cuentasMap[mov.codigoCuenta].movimientos.push(mov);
      cuentasMap[mov.codigoCuenta].totalDebe += mov.debe;
      cuentasMap[mov.codigoCuenta].totalHaber += mov.haber;
    });

    function acumularTotales(cuenta) {
      if (cuenta.cuentaPadre && cuentasMap[cuenta.cuentaPadre]) {
        const padre = cuentasMap[cuenta.cuentaPadre];
        padre.totalDebe += cuenta.totalDebe;
        padre.totalHaber += cuenta.totalHaber;
        acumularTotales(padre);
      }
    }

    Object.values(cuentasMap).forEach(cuenta => acumularTotales(cuenta));
    Object.values(cuentasMap).forEach(cuenta => {
      cuenta.saldoFinal = cuenta.totalDebe - cuenta.totalHaber;
    });

    const cuentasArray = Object.values(cuentasMap);
    const jerarquia = [];

    cuentasArray.forEach(cuenta => {
      if (!cuenta.cuentaPadre || !cuentasMap[cuenta.cuentaPadre]) {
        jerarquia.push(cuenta);
      } else {
        const padre = cuentasMap[cuenta.cuentaPadre];
        if (!padre.hijos) padre.hijos = [];
        padre.hijos.push(cuenta);
      }
    });

    if (exportar === 'pdf') {
      const PDFTable = await import('pdfkit-table');
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=LibroMayor.pdf');
      doc.pipe(res);

      doc.fontSize(18).fillColor('#003366').text('LIBRO MAYOR', { align: 'center', underline: true });
      doc.moveDown(1.5);

      for (const cuenta of jerarquia) {
        doc.fillColor('#000000')
          .fontSize(14)
          .text(`${cuenta.codigoCuenta} - ${cuenta.nombreCuenta}`, { bold: true })
          .moveDown(0.2)
          .fillColor('#666666')
          .text(`Saldo Final: $${cuenta.saldoFinal.toFixed(2)}`, { align: 'right' })
          .moveDown(0.5);

        doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        await doc.table({
          headers: [
            { label: 'Fecha', property: 'fecha', align: 'left', headerColor: '#20709C', headerOpacity: 1 },
            { label: 'Descripción', property: 'descripcion', align: 'left', headerColor: '#20709C' },
            { label: 'Ref', property: 'referencia', align: 'left', headerColor: '#20709C' },
            { label: 'Debe', property: 'debe', align: 'right', headerColor: '#20709C' },
            { label: 'Haber', property: 'haber', align: 'right', headerColor: '#20709C' }
          ],
          datas: cuenta.movimientos.map(mov => ({
            fecha: mov.fecha instanceof Date ? mov.fecha.toISOString().split('T')[0] : mov.fecha,
            descripcion: mov.descripcion || '',
            referencia: mov.referencia || '',
            debe: `$${parseFloat(mov.debe).toFixed(2)}`,
            haber: `$${parseFloat(mov.haber).toFixed(2)}`
          })),
        }, {
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff'),
          prepareRow: (row, i) => doc.font('Helvetica').fontSize(9).fillColor('#000000'),
          columnSpacing: 5,
          padding: 5,
          width: 500,
        });

        doc.moveDown(1);
      }

      doc.moveDown(2);
      doc.fontSize(9).fillColor('#888888').text(`Generado el: ${new Date().toLocaleDateString()}`, {
        align: 'right',
      });

      doc.end();
    } else {
      res.json(jerarquia);
    }
  } catch (error) {
    console.error('Error en obtenerLibroMayor:', error);
    if (!res.headersSent) {
      res.status(500).json({ mensaje: 'Error al obtener el libro mayor', error });
    }
  }
};
