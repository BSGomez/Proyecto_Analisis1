import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const EstadosFinancieros = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8800/routes/estados-financieros')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setData(res.data);
        } else {
          // Datos de ejemplo realistas
          setData([
            { Fecha: '2023-01-15', Concepto: 'Venta', Monto: 5000 },
            { Fecha: '2023-01-20', Concepto: 'Compra', Monto: -2000 },
            { Fecha: '2023-02-01', Concepto: 'Ingreso por Servicios', Monto: 3200 },
            { Fecha: '2023-02-10', Concepto: 'Gastos Operativos', Monto: -1500 },
            { Fecha: '2023-02-20', Concepto: 'Pago a Proveedores', Monto: -1800 },
            { Fecha: '2023-03-05', Concepto: 'Venta Internacional', Monto: 7500 },
            { Fecha: '2023-03-15', Concepto: 'Compra de Insumos', Monto: -1200 },
            { Fecha: '2023-03-25', Concepto: 'Ingreso Extraordinario', Monto: 2500 },
            { Fecha: '2023-04-01', Concepto: 'Gastos de Mantenimiento', Monto: -800 },
            { Fecha: '2023-04-10', Concepto: 'Venta Local', Monto: 4100 }
          ]);
        }
      })
      .catch(err => {
        console.error(err);
        // En caso de error se asignan datos de ejemplo
        setData([
          { Fecha: '2023-01-15', Concepto: 'Venta', Monto: 5000 },
          { Fecha: '2023-01-20', Concepto: 'Compra', Monto: -2000 },
          { Fecha: '2023-02-01', Concepto: 'Ingreso por Servicios', Monto: 3200 },
          { Fecha: '2023-02-10', Concepto: 'Gastos Operativos', Monto: -1500 },
          { Fecha: '2023-02-20', Concepto: 'Pago a Proveedores', Monto: -1800 },
          { Fecha: '2023-03-05', Concepto: 'Venta Internacional', Monto: 7500 },
          { Fecha: '2023-03-15', Concepto: 'Compra de Insumos', Monto: -1200 },
          { Fecha: '2023-03-25', Concepto: 'Ingreso Extraordinario', Monto: 2500 },
          { Fecha: '2023-04-01', Concepto: 'Gastos de Mantenimiento', Monto: -800 },
          { Fecha: '2023-04-10', Concepto: 'Venta Local', Monto: 4100 }
        ]);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Estados Financieros</h2>
      <DataTable value={data}>
        <Column field="Fecha" header="Fecha" />
        <Column field="Concepto" header="Concepto" />
        <Column field="Monto" header="Monto" />
      </DataTable>
    </div>
  );
};

export default EstadosFinancieros;
