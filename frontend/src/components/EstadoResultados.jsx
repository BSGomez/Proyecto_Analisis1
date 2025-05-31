import React, { useState } from 'react';
import axios from 'axios';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';

// Estilos y temas
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '../components/TemaContabilidad.css';

const API_URL = 'http://localhost:8800/routes/estado-resultados';

const EstadoResultados = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const generarEstado = async () => {
    setLoading(true);
    setError(null);
    setResumen(null);
    setDetalles([]);

    if (!fechaInicio || !fechaFin) {
      setError('Debe seleccionar las fechas de inicio y fin.');
      setLoading(false);
      return;
    }

    try {
      const { data: { ID_Estado_Resultado } } = await axios.post(API_URL, {
        Periodo_Inicio: fechaInicio.toISOString().split('T')[0],
        Periodo_Fin:    fechaFin.toISOString().split('T')[0]
      });

      const { data } = await axios.get(`${API_URL}/${ID_Estado_Resultado}`);
      setResumen(data.resumen);
      setDetalles(data.detalles);
    } catch (err) {
      console.error(err);
      setError('Error al generar el estado de resultados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 surface-0 text-900">
      <h1 style={{ textAlign: 'center', color: '#20709C' }}>Estado de Resultados</h1>

      <div className="p-grid p-ai-center p-jc-center mb-4">
        <div className="p-col-12 p-md-4">
          <Calendar
            value={fechaInicio}
            onChange={e => setFechaInicio(e.value)}
            placeholder="Fecha Inicio"
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>
        <div className="p-col-12 p-md-4">
          <Calendar
            value={fechaFin}
            onChange={e => setFechaFin(e.value)}
            placeholder="Fecha Fin"
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>
        <div className="p-col-12 p-md-2">
          <Button
            label="Generar"
            icon="pi pi-chart-line"
            className="w-full"
            loading={loading}
            onClick={generarEstado}
          />
        </div>
      </div>

      {error && (
        <Message severity="error" text={error} className="mb-4" />
      )}

      {resumen && (
        <Card className="mb-4">
          <p><strong>Ingresos:</strong> Q{resumen.Ingresos.toFixed(2)}</p>
          <p><strong>Costos de Venta:</strong> Q{resumen.Costos_Ventas.toFixed(2)}</p>
          <p><strong>Gastos de Operación:</strong> Q{resumen.Gastos_Operacion.toFixed(2)}</p>
          <p><strong>Impuesto sobre la Renta:</strong> Q{resumen.Impuesto_Renta.toFixed(2)}</p>
          <p>
            <strong>Resultado Neto:</strong>{' '}
            <span style={{ color: resumen.Resultado_Neto >= 0 ? 'green' : 'red' }}>
              Q{resumen.Resultado_Neto.toFixed(2)}
            </span>
          </p>
        </Card>
      )}

      {detalles.length > 0 && (
        <div>
          <h3 className="text-xl mb-2">Detalle de Cuentas</h3>
          <DataTable
            value={detalles}
            paginator rows={10}
            responsiveLayout="scroll"
            className="p-datatable-sm"
          >
            <Column field="Codigo_Cuenta" header="Cuenta" sortable />
            <Column field="Tipo_Rubro" header="Tipo" sortable />
            <Column
              field="Valor"
              header="Valor"
              body={row => `Q${row.Valor.toFixed(2)}`}
              sortable
            />
          </DataTable>
        </div>
      )}
    </div>
  );
};

export default EstadoResultados;
