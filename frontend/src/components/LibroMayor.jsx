import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '../components/TemaContabilidad.css';

const LibroMayor = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState([]);
  const [periodo, setPeriodo] = useState('');
  const [referencia, setReferencia] = useState('');
  const dt = useRef(null);

  useEffect(() => {
    const obtenerCuentas = async () => {
      try {
        const response = await fetch('http://localhost:8800/routes/CON_CUENTAS');
        const data = await response.json();
        setCuentas(data);
      } catch (error) {
        console.error('Error al obtener cuentas:', error);
      }
    };
    obtenerCuentas();
  }, []);

  const construirMapaCuentas = (cuentas) => {
    const mapa = {};
    cuentas.forEach(cuenta => {
      if (!mapa[cuenta.Cuenta_Padre]) {
        mapa[cuenta.Cuenta_Padre] = [];
      }
      mapa[cuenta.Cuenta_Padre].push(cuenta.Codigo_Cuenta);
    });
    return mapa;
  };

  const obtenerSubcuentas = (codigoCuenta, mapa) => {
    let subcuentas = [];
    if (mapa[codigoCuenta]) {
      mapa[codigoCuenta].forEach(hija => {
        subcuentas.push(hija);
        subcuentas = subcuentas.concat(obtenerSubcuentas(hija, mapa));
      });
    }
    return subcuentas;
  };

  const flattenData = (data) => {
    let result = [];
    data.forEach(cuenta => {
      result.push({
        ...cuenta,
        indent: (cuenta.nivel - 1) * 20,
        isCuenta: true,
      });
      if (cuenta.movimientos) {
        cuenta.movimientos.forEach(mov => {
          result.push({
            ...mov,
            indent: cuenta.nivel * 20,
            isCuenta: false,
          });
        });
      }
      if (cuenta.hijos) {
        result = result.concat(flattenData(cuenta.hijos));
      }
    });
    return result;
  };

  const obtenerMovimientos = async () => {
    try {
      const params = new URLSearchParams();

      if (cuentaSeleccionada.length > 0) {
        cuentaSeleccionada.forEach(cuenta => params.append('cuenta', cuenta));
      }
      if (periodo) params.append('periodo', periodo);
      if (referencia) params.append('referencia', referencia);

      const response = await fetch(`http://localhost:8800/routes/libro-mayor?${params.toString()}`);
      const data = await response.json();
      const flattened = flattenData(data);
      setMovimientos(flattened);
    } catch (error) {
      console.error('Error al obtener movimientos del libro mayor:', error);
    }
  };

  const exportarPDF = () => {
    const params = new URLSearchParams();

    if (cuentaSeleccionada.length > 0) {
      cuentaSeleccionada.forEach(cuenta => params.append('cuenta', cuenta));
    }
    if (periodo) params.append('periodo', periodo);
    if (referencia) params.append('referencia', referencia);
    params.append('exportar', 'pdf');

    window.open(`http://localhost:8800/routes/libro-mayor?${params.toString()}`, '_blank');
  };

  return (
    <div className="catalogo-cuentas">
      <h1 style={{ textAlign: 'center', color: '#20709C' }}>Libro Mayor</h1>

      <div className="p-grid p-formgrid p-fluid top-buttons" style={{ marginBottom: '1rem' }}>
        <div className="p-field p-col-12 p-md-4">
          <MultiSelect
            value={cuentaSeleccionada}
            options={cuentas.map(c => ({
              label: `${c.Codigo_Cuenta} - ${c.Nombre_Cuenta}`,
              value: c.Codigo_Cuenta
            }))}
            onChange={(e) => {
              const seleccionadas = e.value;
              const mapa = construirMapaCuentas(cuentas);
              let resultado = new Set();

              seleccionadas.forEach(cuenta => {
                resultado.add(cuenta);
                const hijas = obtenerSubcuentas(cuenta, mapa);
                hijas.forEach(h => resultado.add(h));
              });

              setCuentaSeleccionada([...resultado]);
            }}
            placeholder="Selecciona cuentas"
            filter
            display="chip"
            className="w-full"
          />
        </div>

        <div className="p-field p-col-12 p-md-4">
          <Dropdown
            value={periodo}
            options={[
              { label: 'Q1 - Ene-Mar', value: 'Q1_2025' },
              { label: 'Q2 - Abr-Jun', value: 'Q2_2025' },
              { label: 'Q3 - Jul-Sep', value: 'Q3_2025' },
              { label: 'Q4 - Oct-Dic', value: 'Q4_2025' },
            ]}
            onChange={(e) => setPeriodo(e.value)}
            placeholder="Selecciona un periodo"
            showClear
          />
        </div>

        <div className="p-field p-col-12 p-md-4">
          <InputText
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Filtrar por Referencia"
            className="w-full"
          />
        </div>

        <div className="p-field p-col-12 p-md-4">
          <Button label="Aplicar Filtros" icon="pi pi-filter" onClick={obtenerMovimientos} />
        </div>
        <div className="p-field p-col-12 p-md-4">
          <Button label="Exportar PDF" icon="pi pi-file-pdf" onClick={exportarPDF} severity="danger" />
        </div>
      </div>

      <div className="tabla-cuentas">
        <DataTable
          ref={dt}
          value={movimientos}
          scrollable
          scrollHeight="400px"
          responsiveLayout="scroll"
          selectionMode="single"
        >
          <Column
            header="Cuenta / Movimiento"
            body={(row) =>
              row.isCuenta ? (
                <span style={{ paddingLeft: `${row.indent}px`, fontWeight: 'bold' }}>
                  {row.codigoCuenta} - {row.nombreCuenta}
                </span>
              ) : (
                <span style={{ paddingLeft: `${row.indent}px` }}>
                  {row.fecha} | {row.descripcion} | Ref: {row.referencia}
                </span>
              )
            }
          />
          <Column
            field="debe"
            header="Debe"
            body={(row) =>
              row.isCuenta
                ? `$${row.totalDebe?.toFixed(2)}`
                : `$${row.debe?.toFixed(2)}`
            }
          />
          <Column
            field="haber"
            header="Haber"
            body={(row) =>
              row.isCuenta
                ? `$${row.totalHaber?.toFixed(2)}`
                : `$${row.haber?.toFixed(2)}`
            }
          />
          <Column
            field="saldo"
            header="Saldo"
            body={(row) => {
              if (row.isCuenta) {
                return `$${row.saldoFinal?.toFixed(2)}`;
              } else {
                const saldoMov = row.debe - row.haber;
                return `$${saldoMov.toFixed(2)}`;
              }
            }}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default LibroMayor;
