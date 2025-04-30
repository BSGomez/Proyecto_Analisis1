import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';

const LibroDiario = () => {
  const [partidas, setPartidas] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [nuevaPartida, setNuevaPartida] = useState({
    Fecha: '',
    Numero_Asiento: '',
    Descripcion: '',
    Detalles: [],
  });
  const [detalle, setDetalle] = useState({
    Cuenta: '',
    Debe: '',
    Haber: '',
    Descripcion: '',
  });
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const [editarPartida, setEditarPartida] = useState(false); // Estado para identificar si se está editando
  const [errores, setErrores] = useState({});
  const [detallesVisibles, setDetallesVisibles] = useState({}); // Estado para controlar qué detalles están visibles

  const fetchPartidas = async () => {
    try {
      const response = await axios.get('http://localhost:8800/libro-diario');
      setPartidas(response.data); // Asignar directamente las partidas con sus detalles
    } catch (error) {
      console.error('Error al obtener el libro diario:', error);
      setPartidas([]);
    }
  };

  const fetchCuentas = async () => {
    try {
      const response = await axios.get('http://localhost:8800/CatalogoCuentas');
      setCuentas(response.data.map(cuenta => ({ label: cuenta.Nombre_Cuenta, value: cuenta.Codigo_Cuenta })));
    } catch (error) {
      console.error('Error al obtener las cuentas del catálogo:', error);
    }
  };

  useEffect(() => {
    fetchPartidas();
    fetchCuentas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaPartida({ ...nuevaPartida, [name]: value });
  };

  const handleDetalleChange = (e) => {
    const { name, value } = e.target;

    if ((name === 'Debe' || name === 'Haber') && isNaN(value)) {
      alert('Por favor, ingrese solo números en los campos Debe y Haber.');
      return;
    }

    setDetalle({ ...detalle, [name]: value });
  };

  const validarCampos = () => {
    const errores = {};
    if (!nuevaPartida.Fecha) {
      errores.Fecha = 'La fecha es obligatoria. Ejemplo: 2023-10-01';
    }
    if (!nuevaPartida.Numero_Asiento || isNaN(nuevaPartida.Numero_Asiento)) {
      errores.Numero_Asiento = 'El número de asiento es obligatorio y debe ser un número.';
    }
    if (!nuevaPartida.Descripcion) {
      errores.Descripcion = 'La descripción es obligatoria.';
    }
    if (nuevaPartida.Detalles.length === 0) {
      errores.Detalles = 'Debe agregar al menos un detalle.';
    }
    setErrores(errores);
    return Object.keys(errores).length === 0;
  };

  const agregarDetalle = () => {
    if (!detalle.Cuenta) {
      alert('Debe seleccionar una cuenta.');
      return;
    }
    if (detalle.Debe === 0 && detalle.Haber === 0) {
      alert('Debe ingresar un valor en Debe o Haber.');
      return;
    }
    setNuevaPartida({
      ...nuevaPartida,
      Detalles: [...nuevaPartida.Detalles, detalle],
    });
    setDetalle({ Cuenta: '', Debe: 0, Haber: 0, Descripcion: '' });
  };

  const calcularTotales = () => {
    const totalDebe = nuevaPartida.Detalles.reduce((sum, d) => sum + parseFloat(d.Debe || 0), 0);
    const totalHaber = nuevaPartida.Detalles.reduce((sum, d) => sum + parseFloat(d.Haber || 0), 0);
    return { totalDebe, totalHaber };
  };

  const guardarPartida = async () => {
    if (!validarCampos()) {
      return;
    }

    const { totalDebe, totalHaber } = calcularTotales();
    if (totalDebe !== totalHaber) {
      alert('El total del Debe y el Haber deben ser iguales.');
      return;
    }

    try {
      const partidaAEnviar = {
        ...nuevaPartida,
        Numero_Asiento: parseInt(nuevaPartida.Numero_Asiento, 10),
        Fecha: /^\d{4}-\d{2}-\d{2}$/.test(nuevaPartida.Fecha) ? nuevaPartida.Fecha : null,
        Detalles: nuevaPartida.Detalles.map(detalle => ({
          ...detalle,
          Debe: isNaN(parseFloat(detalle.Debe)) ? '0.00' : parseFloat(detalle.Debe).toFixed(2),
          Haber: isNaN(parseFloat(detalle.Haber)) ? '0.00' : parseFloat(detalle.Haber).toFixed(2),
        })),
      };

      if (!partidaAEnviar.Fecha) {
        alert('La fecha debe estar en formato YYYY-MM-DD.');
        return;
      }

      if (editarPartida) {
        // Actualizar partida existente
        await axios.put(`http://localhost:8800/partidas/${nuevaPartida.ID_Partida}`, partidaAEnviar);
        alert('Partida actualizada correctamente');
      } else {
        // Crear nueva partida
        await axios.post('http://localhost:8800/partidas', partidaAEnviar);
        alert('Partida guardada correctamente');
      }

      fetchPartidas();
      setNuevaPartida({ Fecha: '', Numero_Asiento: '', Descripcion: '', Detalles: [] });
      setMostrarDialogo(false);
      setEditarPartida(false);
      setErrores({});
    } catch (error) {
      console.error('Error al guardar la partida:', error.response?.data || error.message);
      alert('Error al guardar la partida');
    }
  };

  const editarPartidaExistente = (partida) => {
    let detallesProcesados;

    try {
      // Verificar si Detalles es un string y convertirlo a un array si es necesario
      detallesProcesados = typeof partida.Detalles === 'string'
        ? JSON.parse(partida.Detalles)
        : Array.isArray(partida.Detalles)
        ? partida.Detalles
        : [];
    } catch (error) {
      console.error('Error al procesar los detalles:', error);
      detallesProcesados = []; // Si ocurre un error, inicializar como un array vacío
    }

    setNuevaPartida({
      ID_Partida: partida.ID_Partida,
      Fecha: partida.Fecha,
      Numero_Asiento: partida.Numero_Asiento,
      Descripcion: partida.Descripcion_Partida,
      Detalles: detallesProcesados, // Usar los detalles procesados
    });
    setEditarPartida(true);
    setMostrarDialogo(true);
  };

  const toggleDetalles = (idPartida) => {
    setDetallesVisibles((prevState) => ({
      ...prevState,
      [idPartida]: !prevState[idPartida], // Alternar visibilidad de los detalles
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Libro Diario</h1>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Button
          label="Agregar Partida"
          icon="pi pi-plus"
          className="p-button p-button-success"
          onClick={() => {
            setNuevaPartida({ Fecha: '', Numero_Asiento: '', Descripcion: '', Detalles: [] });
            setEditarPartida(false);
            setMostrarDialogo(true);
          }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {partidas.map((partida) => (
          <div
            key={partida.ID_Partida}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '15px',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <h3>Fecha: {partida.Fecha}</h3>
            <p><strong>Número de Asiento:</strong> {partida.Numero_Asiento}</p>
            <p><strong>Descripción:</strong> {partida.Descripcion_Partida}</p>
            <Button
              label={detallesVisibles[partida.ID_Partida] ? "Ocultar Detalles" : "Ver Detalles"}
              icon={detallesVisibles[partida.ID_Partida] ? "pi pi-eye-slash" : "pi pi-eye"}
              className="p-button p-button-secondary"
              onClick={() => toggleDetalles(partida.ID_Partida)}
              style={{ marginBottom: '10px' }}
            />
            {detallesVisibles[partida.ID_Partida] && (
              <DataTable
                value={Array.isArray(partida.Detalles) ? partida.Detalles : []} // Asegurar que siempre sea un array
                scrollable
                scrollHeight="200px"
                emptyMessage="No hay detalles disponibles para esta partida." // Mensaje si no hay detalles
              >
                <Column field="Cuenta" header="Cuenta" />
                <Column field="Debe" header="Debe" />
                <Column field="Haber" header="Haber" />
                <Column field="Descripcion" header="Descripción" />
              </DataTable>
            )}
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <Button
                label="Editar"
                icon="pi pi-pencil"
                className="p-button p-button-warning"
                onClick={() => editarPartidaExistente(partida)}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog
        header={editarPartida ? "Editar Partida" : "Agregar Partida"}
        visible={mostrarDialogo}
        style={{ width: '70vw', maxHeight: '90vh', overflowY: 'auto' }}
        onHide={() => setMostrarDialogo(false)}
      >
        <div style={{ marginBottom: '20px' }}>
          <InputText
            name="Fecha"
            value={nuevaPartida.Fecha}
            onChange={handleChange}
            placeholder="Fecha"
            style={{ marginBottom: '10px', width: '100%' }}
          />
          {errores.Fecha && <Message severity="error" text={errores.Fecha} />}
          <InputText
            name="Numero_Asiento"
            value={nuevaPartida.Numero_Asiento}
            onChange={handleChange}
            placeholder="Número de Asiento"
            style={{ marginBottom: '10px', width: '100%' }}
          />
          {errores.Numero_Asiento && <Message severity="error" text={errores.Numero_Asiento} />}
          <InputText
            name="Descripcion"
            value={nuevaPartida.Descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            style={{ marginBottom: '10px', width: '100%' }}
          />
          {errores.Descripcion && <Message severity="error" text={errores.Descripcion} />}
        </div>

        <h3>Detalles</h3>
        {errores.Detalles && <Message severity="error" text={errores.Detalles} />}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Dropdown
            name="Cuenta"
            value={detalle.Cuenta}
            options={cuentas}
            onChange={(e) => setDetalle({ ...detalle, Cuenta: e.value })}
            placeholder="Selecciona una cuenta"
            style={{ width: '200px' }}
          />
          <InputText
            name="Debe"
            value={detalle.Debe}
            onChange={handleDetalleChange}
            placeholder="Debe"
          />
          <InputText
            name="Haber"
            value={detalle.Haber}
            onChange={handleDetalleChange}
            placeholder="Haber"
          />
          <InputText
            name="Descripcion"
            value={detalle.Descripcion}
            onChange={handleDetalleChange}
            placeholder="Descripción"
          />
          <Button
            label="Agregar Detalle"
            icon="pi pi-plus"
            className="p-button p-button-success"
            onClick={agregarDetalle}
          />
        </div>

        <DataTable value={nuevaPartida.Detalles} scrollable scrollHeight="200px">
          <Column field="Cuenta" header="Cuenta" />
          <Column field="Debe" header="Debe" />
          <Column field="Haber" header="Haber" />
          <Column field="Descripcion" header="Descripción" />
        </DataTable>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button
            label={editarPartida ? "Actualizar Partida" : "Guardar Partida"}
            icon="pi pi-save"
            className="p-button p-button-primary"
            onClick={guardarPartida}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default LibroDiario;
