import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../components/TemaContabilidad.css'; // Asegúrate de que esté presente

const API_URL = "http://localhost:8800/routes/usuarios";

const CatalogoUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [datos, setDatos] = useState({
    USR_id_usuario: '',
    Nombre_Usuario: '', // Renombrado a Nombre_Usuario para coincidir con la base de datos
    Email: '', // Renombrado a Email para coincidir con la base de datos
    Nombre_Completo: '', // Renombrado a Nombre_Completo para coincidir con la base de datos
    // USR_rol: '', // Este campo no existe en la base de datos. Considera añadirlo o usar otro campo.
  });
  const [filtro, setFiltro] = useState('');

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      alert("No se pudieron cargar los usuarios.");
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const agregarUsuario = async () => {
    if (!datos.Nombre_Usuario || !datos.Email || !datos.Nombre_Completo) { // Modificado para usar los nuevos campos
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      await axios.post(API_URL, datos);
      alert("Usuario agregado correctamente.");
      limpiarFormulario();
      setMostrarFormulario(false);
      cargarUsuarios();
    } catch (error) {
      console.error("Error al agregar usuario:", error);
      alert("Error al agregar usuario.");
    }
  };

  const eliminarUsuario = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("Usuario eliminado.");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("No se pudo eliminar el usuario.");
    }
  };

  const limpiarFormulario = () => {
    setDatos({
      USR_id_usuario: '',
      Nombre_Usuario: '', // Asegúrate de limpiar todos los campos
      Email: '',
      Nombre_Completo: '',
    });
  };

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.Nombre_Usuario.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.Email.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="catalogo-cuentas">
      <h1 className="title"><center>Catálogo de Usuarios</center></h1>

      <div className="top-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginLeft: '20px' }}>
        <InputText
          placeholder="Buscar Usuario..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ width: '300px' }}
        />

        <Button
          className="p-button-success"
          label="Nuevo Usuario"
          onClick={() => setMostrarFormulario(true)}
          style={{ backgroundColor: '#507592', borderColor: '#507592', color: '#fff' }}
        />
      </div>

      <div className="tabla-cuentas">
        <DataTable
          value={usuariosFiltrados}
          scrollable
          scrollHeight="400px"
          responsiveLayout="scroll"
          selectionMode="single"
          onSelectionChange={(e) => setDatos(e.value)}
        >
          <Column field="Nombre_Usuario" header="Nombre" sortable /> {/* Renombrado */}
          <Column field="Email" header="Correo" sortable /> {/* Renombrado */}
          <Column field="Nombre_Completo" header="Nombre Completo" sortable /> {/* Nuevo campo */}
          <Column
            header="Acciones"
            body={(rowData) => (
              <>
                <Button
                  className="p-button-warning"
                  icon="pi pi-pencil"
                  onClick={() => {
                    setDatos(rowData);
                    setMostrarFormulario(true);
                  }}
                  style={{ marginRight: '3px' }}
                />
                <Button
                  className="p-button-danger"
                  icon="pi pi-trash"
                  onClick={() => eliminarUsuario(rowData.USR_id_usuario)}
                  style={{ marginRight: '3px' }}
                />
              </>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header="Agregar Nuevo Usuario"
        visible={mostrarFormulario}
        style={{ width: '400px' }}
        modal
        onHide={() => setMostrarFormulario(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            agregarUsuario();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <InputText
            name="Nombre_Usuario"
            value={datos.Nombre_Usuario}
            onChange={handleChange}
            placeholder="Nombre de Usuario"
          />
          <InputText
            name="Email"
            value={datos.Email}
            onChange={handleChange}
            placeholder="Correo"
          />
          <InputText
            name="Nombre_Completo"
            value={datos.Nombre_Completo}
            onChange={handleChange}
            placeholder="Nombre Completo"
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button type="submit" label="Guardar" className="p-button-success" />
            <Button
              type="button"
              label="Cancelar"
              className="p-button-secondary"
              onClick={() => {
                limpiarFormulario();
                setMostrarFormulario(false);
              }}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default CatalogoUsuarios;
