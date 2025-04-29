import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '../components/TemaContabilidad.css'; // Asegúrate de ajustar la ruta según tu proyecto

const LibroMayor = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [filtroCuenta, setFiltroCuenta] = useState('');

  useEffect(() => {
    const datosMock = [
      {
        codigoCuenta: '1001',
        nombreCuenta: 'Caja',
        fecha: '2025-04-01',
        descripcion: 'Ingreso inicial',
        debe: 1000,
        haber: 0,
        saldo: 1000
      },
      {
        codigoCuenta: '1001',
        nombreCuenta: 'Caja',
        fecha: '2025-04-02',
        descripcion: 'Compra de insumos',
        debe: 0,
        haber: 300,
        saldo: 700
      },
      {
        codigoCuenta: '2001',
        nombreCuenta: 'Proveedores',
        fecha: '2025-04-03',
        descripcion: 'Deuda con proveedor',
        debe: 0,
        haber: 500,
        saldo: -500
      }
    ];
    setMovimientos(datosMock);
  }, []);

  const movimientosFiltrados = movimientos.filter((mov) =>
    mov.codigoCuenta.includes(filtroCuenta)
  );

  return (
    <div className="catalogo-cuentas">
      <h1 className="title"><center>Libro Mayor</center></h1>

      <div className="top-buttons">
        <InputText
          placeholder="Filtrar por Código de Cuenta..."
          value={filtroCuenta}
          onChange={(e) => setFiltroCuenta(e.target.value)}
          style={{ width: '300px' }}
        />
      </div>

      <div className="tabla-cuentas">
        <DataTable
          value={movimientosFiltrados}
          paginator
          rows={5}
          scrollable
          scrollHeight="400px"
          responsiveLayout="scroll"
        >
          <Column field="codigoCuenta" header="Código de Cuenta" sortable />
          <Column field="nombreCuenta" header="Nombre de Cuenta" sortable />
          <Column field="fecha" header="Fecha" sortable />
          <Column field="descripcion" header="Descripción" />
          <Column field="debe" header="Debe" body={(row) => `$${row.debe}`} />
          <Column field="haber" header="Haber" body={(row) => `$${row.haber}`} />
          <Column field="saldo" header="Saldo" body={(row) => `$${row.saldo}`} />
        </DataTable>
      </div>
    </div>
  );
};

export default LibroMayor;
