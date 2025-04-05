import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos de PrimeReact
import { InputText } from 'primereact/inputtext';

const Cuenta = () => {
  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [datos, setDatos] = useState({
    CNT_id_cuenta: '',
    CNT_codigo: '',
    CNT_nombre: '',
    CNT_tipo: '',
    CNT_nivel: '',
    CNT_id_padre: ''
  });

  const [selectedCuenta, setSelectedCuenta] = useState(null); // Para almacenar el registro seleccionado

  // Función para obtener los datos
  const fetchCuentas = async () => {
    try {
      const response = await axios.get('http://localhost:8800/cuentaContable');
      setCuentas(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching cuentas:', error);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Llama a la función al cargar el componente
  useEffect(() => {
    fetchCuentas();
  }, []);

  // Función para manejar el cambio en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convierte los valores a los tipos correctos dentro de handleChange
    if (name === 'CNT_id_cuenta') {
      setDatos({
        ...datos,
        [name]: value ? parseInt(value, 10) : ''  // Convertir a entero
      });
    } else if (name === 'CNT_nivel') {
      setDatos({
        ...datos,
        [name]: value ? parseFloat(value) : ''  // Convertir a decimal
      });
    } else {
      setDatos({
        ...datos,
        [name]: value // Dejar el campo de texto como está
      });
    }
  };

  // Función para enviar datos por POST
  const enviarDatos = async () => {
    try {
      const response = await axios.post('http://localhost:8800/cuentaContable', datos);
      console.log("Respuesta del servidor:", response.data);
      alert("Datos enviados correctamente");
      fetchCuentas(); // Recarga los datos después de insertar
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Error al enviar los datos");
    }
  };

  // Función para enviar datos por PUT (Modificar)
  const modificarDatos = async () => {
    if (!selectedCuenta) {
      alert('Por favor selecciona un registro para modificar');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8800/cuentaContable/${selectedCuenta.CNT_id_cuenta}`, datos);
      console.log("Respuesta del servidor:", response.data);
      alert("Datos modificados correctamente");
      fetchCuentas(); // Recarga los datos después de modificar
      setSelectedCuenta(null); // Limpiar el registro seleccionado después de la actualización
    } catch (error) {
      console.error("Error al modificar los datos:", error);
      alert("Error al modificar los datos");
    }
  };

  // Función para eliminar datos
  const eliminarDatos = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:8800/cuentaContable/${id}`);
      console.log("Respuesta del servidor:", response.data);
      alert("Datos eliminados correctamente");
      fetchCuentas(); // Recarga los datos después de eliminar
    } catch (error) {
      console.error("Error al eliminar los datos:", error);
      alert("Error al eliminar los datos");
    }
  };

  // Función para seleccionar el registro a modificar
  const handleEdit = (rowData) => {
    setDatos(rowData); // Cargar datos en el formulario
    setSelectedCuenta(rowData); // Guardar el registro seleccionado para actualizarlo
  };

  return (
    <div>
      <h1><center>Cuenta Contable</center></h1>

      {loading && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p>Cargando datos...</p>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="Cuenta">
          <DataTable value={cuentas} paginator rows={10} responsiveLayout="scroll" selectionMode="single" onSelectionChange={(e) => handleEdit(e.value)}>
            <Column field="CNT_id_cuenta" header="ID" sortable></Column>
            <Column field="CNT_codigo" header="Código" sortable></Column>
            <Column field="CNT_nombre" header="Nombre" sortable></Column>
            <Column field="CNT_tipo" header="Tipo" sortable></Column>
            <Column field="CNT_nivel" header="Nivel" sortable></Column>
            <Column field="CNT_id_padre" header="ID Padre" sortable></Column>
          </DataTable>
        </div>
      )}

      <br />
      <div className="form-Box" style={{ marginTop: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="card flex justify-content-center">
            <InputText value={datos.CNT_id_cuenta} name="CNT_id_cuenta" onChange={handleChange} placeholder="ID Cuenta" />
          </div>
          <div className="card flex justify-content-center">
            <InputText value={datos.CNT_codigo} name="CNT_codigo" onChange={handleChange} placeholder="Código" />
          </div>
          <div className="card flex justify-content-center">
            <InputText value={datos.CNT_nombre} name="CNT_nombre" onChange={handleChange} placeholder="Nombre" />
          </div>
          <div className="card flex justify-content-center">
            <InputText value={datos.CNT_tipo} name="CNT_tipo" onChange={handleChange} placeholder="Tipo" />
          </div>
          <div className="card flex justify-content-center">
            <InputText value={datos.CNT_nivel} name="CNT_nivel" onChange={handleChange} placeholder="Nivel" />
          </div>
          <div className="card flex justify-content-center">
            <InputText value={datos.CNT_id_padre} name="CNT_id_padre" onChange={handleChange} placeholder="ID Padre" />
          </div>
        </div>
      </div>
      <br />

      <div className="buttons" style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={enviarDatos} className="btn btn-primary">Agregar</button>
        <button onClick={modificarDatos} className="btn btn-secondary">Modificar</button>
        <button className="btn btn-danger" onClick={() => eliminarDatos(datos.CNT_id_cuenta)}>Eliminar</button>
      </div>
    </div>
  );
};

export default Cuenta;