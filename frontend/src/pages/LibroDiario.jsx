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
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null); // Estado para el detalle seleccionado
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

   // ✅ CORREGIDO: ahora consulta cuentaContable
   const fetchCuentas = async () => {
    try {
      const response = await axios.get('http://localhost:8800/cuentaContable');
      setCuentas(
        response.data.map((cuenta) => ({
          label: `${cuenta.CNT_codigo} - ${cuenta.CNT_nombre}`,
          value: cuenta.CNT_id_cuenta,
        }))
      );
    } catch (error) {
      console.error('Error al obtener las cuentas:', error);
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

  const seleccionarDetalle = (detalle) => {
    if (!detalle) {
      setDetalleSeleccionado(null); // Si no hay detalle, limpiar la selección
      setDetalle({ Cuenta: '', Debe: '', Haber: '', Descripcion: '' }); // Limpiar los campos del formulario
      return;
    }

    setDetalleSeleccionado(detalle); // Guardar el detalle seleccionado
    setDetalle({
      Cuenta: detalle.Cuenta,
      Debe: detalle.Debe,
      Haber: detalle.Haber,
      Descripcion: detalle.Descripcion,
    }); // Llenar los campos del formulario con los datos del detalle seleccionado
  };

  const actualizarDetalle = () => {
    if (!detalleSeleccionado) {
      alert("Por favor, selecciona un detalle para editar.");
      return;
    }

    const nuevosDetalles = nuevaPartida.Detalles.map((d) =>
      d === detalleSeleccionado ? { ...detalle } : d
    ); // Actualizar el detalle seleccionado con los nuevos datos

    setNuevaPartida({ ...nuevaPartida, Detalles: nuevosDetalles });
    setDetalleSeleccionado(null); // Limpiar la selección
    setDetalle({ Cuenta: '', Debe: '', Haber: '', Descripcion: '' }); // Limpiar los campos del formulario
  };

  const eliminarDetalle = (detalle) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este detalle?")) {
      return;
    }

    const nuevosDetalles = nuevaPartida.Detalles.filter((d) => d !== detalle); // Filtrar el detalle a eliminar
    setNuevaPartida({ ...nuevaPartida, Detalles: nuevosDetalles }); // Actualizar los detalles
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
        await axios.put(`http://localhost:8800/partidas/${nuevaPartida.ID_Partida}`, partidaAEnviar);
        alert('Partida actualizada correctamente');
      } else {
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

      // Manejar error de validación de fecha
      if (error.response?.data?.details?.includes('Invalid date')) {
        alert('Error: La fecha ingresada no es válida. Por favor, utiliza el formato YYYY-MM-DD.');
      } else {
        alert('Error al guardar la partida. Por favor, intenta nuevamente.');
      }
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
      Fecha: partida.Fecha.split('T')[0], // Formatear la fecha para eliminar la parte de la hora
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

  const formatFecha = (fecha) => {
    return fecha ? fecha.split('T')[0] : ''; // Dividir la fecha por 'T' y tomar la primera parte
  };

  const eliminarPartida = async (idPartida) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta partida?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8800/partidas/${idPartida}`);
      alert("Partida eliminada correctamente");
      fetchPartidas(); // Recargar las partidas después de eliminar
    } catch (error) {
      console.error("Error al eliminar la partida:", error);
      alert("Error al eliminar la partida");
    }
  };

  const obtenerNombreCuenta = (codigoCuenta) => {
    const cuenta = cuentas.find((c) => c.value === codigoCuenta);
    return cuenta ? `${codigoCuenta} - ${cuenta.label}` : codigoCuenta; // Combinar código y nombre
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#F2F3F4', color: '#170E11' }}>
      <h1 style={{ textAlign: 'center', color: '#20709C' }}>Libro Diario</h1>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Button
          label="Agregar Partida"
          icon="pi pi-plus"
          className="p-button p-button-success"
          style={{
            backgroundColor: '#20709C',
            borderColor: '#20709C',
            color: '#F2F3F4',
          }}
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
              border: '1px solid #507592',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#ACBFCE',
              color: '#170E11',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <h3 style={{ color: '#20709C' }}>Fecha: {formatFecha(partida.Fecha)}</h3>
            <p><strong>Número de Asiento:</strong> {partida.Numero_Asiento}</p>
            <p><strong>Descripción:</strong> {partida.Descripcion_Partida}</p>
            <Button
              label={detallesVisibles[partida.ID_Partida] ? "Ocultar Detalles" : "Ver Detalles"}
              icon={detallesVisibles[partida.ID_Partida] ? "pi pi-eye-slash" : "pi pi-eye"}
              className="p-button p-button-secondary"
              style={{
                backgroundColor: '#507592',
                borderColor: '#507592',
                color: '#F2F3F4',
                marginBottom: '10px',
              }}
              onClick={() => toggleDetalles(partida.ID_Partida)}
            />
            {detallesVisibles[partida.ID_Partida] && (
              <DataTable
                value={Array.isArray(partida.Detalles) ? partida.Detalles : []}
                scrollable
                scrollHeight="200px"
                emptyMessage="No hay detalles disponibles para esta partida."
                style={{ backgroundColor: '#F2F3F4', color: '#170E11' }}
              >
                <Column field="Cuenta" header="Cuenta" body={(rowData) => obtenerNombreCuenta(rowData.Cuenta)} />
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
                style={{
                  backgroundColor: '#20709C',
                  borderColor: '#20709C',
                  color: '#F2F3F4',
                  marginRight: '10px',
                }}
                onClick={() => editarPartidaExistente(partida)}
              />
              <Button
                label="Eliminar"
                icon="pi pi-trash"
                className="p-button p-button-danger"
                style={{
                  backgroundColor: '#507592',
                  borderColor: '#507592',
                  color: '#F2F3F4',
                }}
                onClick={() => eliminarPartida(partida.ID_Partida)}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog
        header={editarPartida ? "Editar Partida" : "Agregar Partida"}
        visible={mostrarDialogo}
        style={{
          width: '70vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#F2F3F4',
          color: '#170E11',
        }}
        onHide={() => setMostrarDialogo(false)}
      >
        <div style={{ marginBottom: '20px' }}>
          <InputText
            name="Fecha"
            value={nuevaPartida.Fecha}
            onChange={handleChange}
            placeholder="Fecha"
            style={{
              marginBottom: '10px',
              width: '100%',
              borderColor: '#507592',
            }}
          />
          {errores.Fecha && <Message severity="error" text={errores.Fecha} />}
          <InputText
            name="Numero_Asiento"
            value={nuevaPartida.Numero_Asiento}
            onChange={handleChange}
            placeholder="Número de Asiento"
            style={{
              marginBottom: '10px',
              width: '100%',
              borderColor: '#507592',
            }}
          />
          {errores.Numero_Asiento && <Message severity="error" text={errores.Numero_Asiento} />}
          <InputText
            name="Descripcion"
            value={nuevaPartida.Descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            style={{
              marginBottom: '10px',
              width: '100%',
              borderColor: '#507592',
            }}
          />
          {errores.Descripcion && <Message severity="error" text={errores.Descripcion} />}
        </div>

        <h3 style={{ color: '#20709C' }}>Detalles</h3>
        {errores.Detalles && <Message severity="error" text={errores.Detalles} />}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Dropdown
            name="Cuenta"
            value={detalle.Cuenta}
            options={cuentas}
            onChange={(e) => setDetalle({ ...detalle, Cuenta: e.value })}
            placeholder="Selecciona una cuenta"
            style={{
              width: '200px',
              borderColor: '#507592',
            }}
          />
          <InputText
            name="Debe"
            value={detalle.Debe}
            onChange={handleDetalleChange}
            placeholder="Debe"
            style={{ borderColor: '#507592' }}
          />
          <InputText
            name="Haber"
            value={detalle.Haber}
            onChange={handleDetalleChange}
            placeholder="Haber"
            style={{ borderColor: '#507592' }}
          />
          <InputText
            name="Descripcion"
            value={detalle.Descripcion}
            onChange={handleDetalleChange}
            placeholder="Descripción"
            style={{ borderColor: '#507592' }}
          />
          <Button
            label="Agregar Detalle"
            icon="pi pi-plus"
            className="p-button p-button-success"
            style={{
              backgroundColor: '#20709C',
              borderColor: '#20709C',
              color: '#F2F3F4',
            }}
            onClick={agregarDetalle}
          />
        </div>

        <DataTable
          value={nuevaPartida.Detalles}
          scrollable
          scrollHeight="200px"
          selectionMode="single"
          selection={detalleSeleccionado}
          onSelectionChange={(e) => seleccionarDetalle(e.value)}
          emptyMessage="No hay detalles disponibles para esta partida."
          style={{ backgroundColor: '#F2F3F4', color: '#170E11' }}
        >
          <Column
            field="Cuenta"
            header="Cuenta"
            body={(rowData) => obtenerNombreCuenta(rowData.Cuenta)}
          />
          <Column field="Debe" header="Debe" />
          <Column field="Haber" header="Haber" />
          <Column field="Descripcion" header="Descripción" />
          <Column
            header="Acciones"
            body={(rowData) => (
              <Button
                label="Eliminar"
                icon="pi pi-trash"
                className="p-button p-button-danger"
                style={{
                  backgroundColor: '#507592',
                  borderColor: '#507592',
                  color: '#F2F3F4',
                }}
                onClick={() => eliminarDetalle(rowData)}
              />
            )}
          />
        </DataTable>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <p><strong>Total Debe:</strong> {calcularTotales().totalDebe.toFixed(2)}</p>
          <p><strong>Total Haber:</strong> {calcularTotales().totalHaber.toFixed(2)}</p>
        </div>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <Button
            label="Actualizar Detalle"
            icon="pi pi-save"
            className="p-button p-button-primary"
            style={{
              backgroundColor: '#20709C',
              borderColor: '#20709C',
              color: '#F2F3F4',
            }}
            onClick={actualizarDetalle}
          />
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button
            label={editarPartida ? "Actualizar Partida" : "Guardar Partida"}
            icon="pi pi-save"
            className="p-button p-button-primary"
            style={{
              backgroundColor: '#20709C',
              borderColor: '#20709C',
              color: '#F2F3F4',
            }}
            onClick={guardarPartida}
          />
        </div>
      </Dialog>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          className="p-button p-button-primary"
          style={{
            backgroundColor: '#20709C',
            borderColor: '#20709C',
            color: '#F2F3F4',
            marginTop: '10px',
          }}
          onClick={() => window.location.href = '/'}
        />
      </div>
    </div>
  );
};

export default LibroDiario;
