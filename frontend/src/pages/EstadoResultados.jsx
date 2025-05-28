import React, { useState } from 'react';
import axios from 'axios';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';

const EstadoResultados = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [estado, setEstado] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const generarEstado = async () => {
    setLoading(true);
    setError(null);
    setEstado(null);
    setDetalles([]);

    if (!fechaInicio || !fechaFin) {
      setError("Debe seleccionar las fechas de inicio y fin.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8800/estado-resultados", {
        Periodo_Inicio: fechaInicio.toISOString().split("T")[0],
        Periodo_Fin: fechaFin.toISOString().split("T")[0],
      });

      const idEstado = response.data.ID_Estado_Resultado;

      const detalleRes = await axios.get(`http://localhost:8800/estado-resultados/${idEstado}`);
      setEstado(detalleRes.data.resumen);
      setDetalles(detalleRes.data.detalles);
    } catch (err) {
      console.error(err);
      setError("Error al generar el estado de resultados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#F2F3F4', color: '#170E11' }}>
      <h1 style={{ textAlign: 'center', color: '#20709C' }}>Estado de Resultados</h1>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <Calendar value={fechaInicio} onChange={(e) => setFechaInicio(e.value)} placeholder="Fecha Inicio" dateFormat="yy-mm-dd" />
        <Calendar value={fechaFin} onChange={(e) => setFechaFin(e.value)} placeholder="Fecha Fin" dateFormat="yy-mm-dd" />
        <Button
          label="Generar"
          icon="pi pi-chart-line"
          style={{ backgroundColor: '#20709C', borderColor: '#20709C' }}
          onClick={generarEstado}
          disabled={loading}
        />
      </div>

      {error && <Message severity="error" text={error} style={{ marginBottom: '20px' }} />}

      {estado && (
        <Card title="Resumen del Estado de Resultados" style={{ marginBottom: '20px' }}>
          <p><strong>Ingresos:</strong> Q{estado.Ingreso.toFixed(2)}</p>
          <p><strong>Costos de Venta:</strong> Q{estado.Costo_Venta.toFixed(2)}</p>
          <p><strong>Gastos de Operación:</strong> Q{estado.Gasto_Operacion.toFixed(2)}</p>
          <p><strong>Impuesto sobre la Renta:</strong> Q{estado.Impuesto_Renta.toFixed(2)}</p>
          <p><strong>Resultado Neto:</strong> <span style={{ color: estado.Resultado_Neto >= 0 ? 'green' : 'red' }}>Q{estado.Resultado_Neto.toFixed(2)}</span></p>
        </Card>
      )}

      {detalles.length > 0 && (
        <div>
          <h3 style={{ color: '#20709C' }}>Detalle de Cuentas</h3>
          <DataTable value={detalles} paginator rows={10} responsiveLayout="scroll">
            <Column field="Codigo_Cuenta" header="Cuenta" sortable></Column>
            <Column field="Tipo_Rubro" header="Tipo" sortable></Column>
            <Column field="Valor" header="Valor" body={(row) => `Q${parseFloat(row.Valor).toFixed(2)}`} sortable></Column>
          </DataTable>
        </div>
      )}
    </div>
  );
};

export default EstadoResultados;
