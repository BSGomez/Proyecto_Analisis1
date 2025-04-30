import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message'; // Importar componente Message

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
  const [errores, setErrores] = useState({}); // Estado para almacenar errores

  const fetchPartidas = async () => {
    try {
      const response = await axios.get('http://localhost:8800/libro-diario');
      setPartidas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al obtener el libro diario:', error);
      setPartidas([]);
    }
  };

  const fetchCuentas = async () => {
    try {
      const response = await axios.get('http://localhost:8800/CatalogoCuentas'); // Cambiar al endpoint correcto
      setCuentas(response.data.map(cuenta => ({ label: cuenta.Nombre_Cuenta, value: cuenta.Codigo_Cuenta }))); // Usar los campos de Catalogo_Cuenta
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

    // Validar que solo se permitan números en los campos Debe y Haber
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
      // Validar que todas las cuentas existan en el catálogo
      const cuentasCatalogo = cuentas.map(cuenta => cuenta.value); // Obtener los códigos de las cuentas del catálogo
      const cuentasInvalidas = nuevaPartida.Detalles.filter(detalle => !cuentasCatalogo.includes(detalle.Cuenta));

      if (cuentasInvalidas.length > 0) {
        alert(`Las siguientes cuentas no existen en el catálogo: ${cuentasInvalidas.map(c => c.Cuenta).join(', ')}. Por favor, agréguelas.`);
        return;
      }

      // Validar y convertir los datos antes de enviarlos
      const partidaAEnviar = {
        ...nuevaPartida,
        Numero_Asiento: parseInt(nuevaPartida.Numero_Asiento, 10),
        Fecha: /^\d{4}-\d{2}-\d{2}$/.test(nuevaPartida.Fecha) ? nuevaPartida.Fecha : null, // Validar formato de fecha
        Detalles: nuevaPartida.Detalles.map(detalle => ({
          ...detalle,
          Debe: isNaN(parseFloat(detalle.Debe)) ? '0.00' : parseFloat(detalle.Debe).toFixed(2), // Convertir a número con dos decimales
          Haber: isNaN(parseFloat(detalle.Haber)) ? '0.00' : parseFloat(detalle.Haber).toFixed(2), // Convertir a número con dos decimales
        })),
      };

      if (!partidaAEnviar.Fecha) {
        alert('La fecha debe estar en formato YYYY-MM-DD.');
        return;
      }

      console.log("Datos enviados al backend:", partidaAEnviar); // Log para depuración
      await axios.post('http://localhost:8800/partidas', partidaAEnviar);
      alert('Partida guardada correctamente');
      fetchPartidas();
      setNuevaPartida({ Fecha: '', Numero_Asiento: '', Descripcion: '', Detalles: [] });
      setMostrarDialogo(false);
      setErrores({});
    } catch (error) {
      console.error('Error al guardar la partida:', error.response?.data || error.message); // Mostrar detalles del error
      alert('Error al guardar la partida');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Libro Diario</h1>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Button
          label="Agregar Partida"
          icon="pi pi-plus"
          className="p-button p-button-success"
          onClick={() => setMostrarDialogo(true)}
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
            <DataTable value={Array.isArray(partida.Detalles) ? partida.Detalles : []} scrollable scrollHeight="200px">
              <Column field="Cuenta" header="Cuenta" />
              <Column field="Debe" header="Debe" />
              <Column field="Haber" header="Haber" />
              <Column field="Descripcion" header="Descripción" />
            </DataTable>
          </div>
        ))}
      </div>

      <Dialog
        header="Agregar Partida"
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
            options={cuentas} // Mostrar solo las cuentas del catálogo
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
            label="Guardar Partida"
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
