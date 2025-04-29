import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

const LibroDiario = () => {
  const [partidas, setPartidas] = useState([]);
  const [datos, setDatos] = useState({
    Fecha: '',
    Numero_Asiento: '',
    Descripcion: '',
    Detalles: [],
  });

  const [selectedPartida, setSelectedPartida] = useState(null);

  // Función para obtener las partidas
  const fetchPartidas = async () => {
    try {
      const response = await axios.get('http://localhost:8800/libro-diario');
      setPartidas(response.data);
    } catch (error) {
      console.error('Error al obtener el libro diario:', error);
    }
  };

  useEffect(() => {
    fetchPartidas();
  }, []);

  // Función para manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  // Función para agregar una nueva partida
  const agregarPartida = async () => {
    try {
      await axios.post('http://localhost:8800/partidas', datos);
      alert('Partida agregada correctamente');
      fetchPartidas();
      limpiarFormulario();
    } catch (error) {
      console.error('Error al agregar la partida:', error);
      alert('Error al agregar la partida');
    }
  };

  // Función para modificar una partida existente
  const modificarPartida = async () => {
    if (!selectedPartida) {
      alert('Por favor selecciona una partida para modificar');
      return;
    }
    try {
      await axios.put(`http://localhost:8800/partidas/${selectedPartida.ID_Partida}`, datos);
      alert('Partida modificada correctamente');
      fetchPartidas();
      setSelectedPartida(null);
    } catch (error) {
      console.error('Error al modificar la partida:', error);
      alert('Error al modificar la partida');
    }
  };

  // Función para eliminar una partida
  const eliminarPartida = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/partidas/${id}`);
      alert('Partida eliminada correctamente');
      fetchPartidas();
    } catch (error) {
      console.error('Error al eliminar la partida:', error);
      alert('Error al eliminar la partida');
    }
  };

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setDatos({
      Fecha: '',
      Numero_Asiento: '',
      Descripcion: '',
      Detalles: [],
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Libro Diario</h1>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Button
          label="Agregar"
          icon="pi pi-plus"
          className="p-button p-button-success"
          onClick={agregarPartida}
        />
        <Button
          label="Modificar"
          icon="pi pi-pencil"
          className="p-button p-button-warning"
          onClick={modificarPartida}
          style={{ marginLeft: '10px' }}
        />
        <Button
          label="Eliminar"
          icon="pi pi-trash"
          className="p-button p-button-danger"
          onClick={() => eliminarPartida(selectedPartida?.ID_Partida)}
          style={{ marginLeft: '10px' }}
        />
      </div>

      <DataTable
        value={partidas}
        scrollable
        scrollHeight="400px"
        style={{ minWidth: '50rem' }}
        selectionMode="single"
        onSelectionChange={(e) => setSelectedPartida(e.value)}
      >
        <Column field="Fecha" header="Fecha" sortable />
        <Column field="Numero_Asiento" header="Número de Asiento" sortable />
        <Column field="Descripcion_Partida" header="Descripción" />
        <Column
          field="Detalles"
          header="Detalles"
          body={(rowData) => (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {rowData.Detalles}
            </pre>
          )}
        />
      </DataTable>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <InputText
            name="Fecha"
            value={datos.Fecha}
            onChange={handleChange}
            placeholder="Fecha"
          />
          <InputText
            name="Numero_Asiento"
            value={datos.Numero_Asiento}
            onChange={handleChange}
            placeholder="Número de Asiento"
          />
          <InputText
            name="Descripcion"
            value={datos.Descripcion}
            onChange={handleChange}
            placeholder="Descripción"
          />
        </div>
      </div>
    </div>
  );
};

export default LibroDiario;
