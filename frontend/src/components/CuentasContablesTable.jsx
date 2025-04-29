import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../components/CatalogoCuentas.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '../components/TemaContabilidad.css';

const API_URL = "http://localhost:8800/routes/CON_CUENTAS";

const CatalogoCuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [datos, setDatos] = useState({
    Codigo_Cuenta: '',
    Nombre_Cuenta: '',
    Nivel: '',
    Cuenta_Padre: '',
    Tipo_Cuenta: '',
    Naturaleza_Cuenta: ''
  });
  const [filtro, setFiltro] = useState('');

  const naturalezaOpciones = [
    { label: 'Acreedora', value: 'Acreedora' },
    { label: 'Deudora', value: 'Deudora' }
  ];

  const tipoCuentaOpciones = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Pasivo', value: 'Pasivo' },
    { label: 'Patrimonio', value: 'Patrimonio' },
    { label: 'Ingreso', value: 'Ingreso' },
    { label: 'Costo', value: 'Costo' },
    { label: 'Gasto', value: 'Gasto' }
  ];

  const cargarCuentas = async () => {
    try {
      const response = await axios.get(API_URL);
      setCuentas(response.data);
    } catch (error) {
      console.error("Error al cargar cuentas:", error);
      alert("No se pudieron cargar las cuentas.");
    }
  };

  useEffect(() => {
    cargarCuentas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const agregarCuenta = async () => {
    if (!datos.Codigo_Cuenta || !datos.Nombre_Cuenta || !datos.Nivel || !datos.Tipo_Cuenta || !datos.Naturaleza_Cuenta) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      await axios.post(API_URL, datos);
      alert("Cuenta agregada correctamente.");
      limpiarFormulario();
      setMostrarFormulario(false);
      cargarCuentas(); // Refrescar la tabla
    } catch (error) {
      console.error("Error al agregar cuenta:", error);
      alert("Error al agregar cuenta.");
    }
  };

  const eliminarCuenta = async (codigo) => {
    try {
      await axios.delete(`${API_URL}/${codigo}`);
      alert("Cuenta eliminada.");
      cargarCuentas();
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      alert("No se pudo eliminar la cuenta.");
    }
  };

  const limpiarFormulario = () => {
    setDatos({
      Codigo_Cuenta: '',
      Nombre_Cuenta: '',
      Nivel: '',
      Cuenta_Padre: '',
      Tipo_Cuenta: '',
      Naturaleza_Cuenta: ''
    });
  };

  const cuentasFiltradas = cuentas.filter(cuenta =>
    cuenta.Codigo_Cuenta.toLowerCase().includes(filtro.toLowerCase()) ||
    cuenta.Nombre_Cuenta.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="catalogo-cuentas">
      <h1 className="title"><center>Catálogo de Cuentas</center></h1>

      <div className="top-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginLeft: '20px' }}>
        <InputText
          placeholder="Buscar Cuenta..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ width: '300px' }}
        />

        <Button
          className="p-button-success"
          label="Nueva Cuenta"
          onClick={() => setMostrarFormulario(true)}
          style={{ backgroundColor: '#507592', borderColor: '#507592', color: '#fff' }}
        />
      </div>

      <div className="tabla-cuentas">
        <DataTable
          value={cuentasFiltradas}
          scrollable
          scrollHeight="400px"
          responsiveLayout="scroll"
          selectionMode="single"
          onSelectionChange={(e) => setDatos(e.value)}
        >
          <Column field="Codigo_Cuenta" header="Código de Cuenta" sortable />
          <Column field="Nombre_Cuenta" header="Nombre de Cuenta" sortable />
          <Column field="Nivel" header="Nivel" sortable />
          <Column field="Cuenta_Padre" header="Cuenta Padre" sortable />
          <Column field="Tipo_Cuenta" header="Tipo de Cuenta" sortable />
          <Column field="Naturaleza_Cuenta" header="Naturaleza" sortable />
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
                  onClick={() => eliminarCuenta(rowData.Codigo_Cuenta)}
                  style={{ marginRight: '3px' }}
                />
              </>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header="Agregar Nueva Cuenta"
        visible={mostrarFormulario}
        style={{ width: '400px' }}
        modal
        onHide={() => setMostrarFormulario(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            agregarCuenta();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <InputText
            name="Codigo_Cuenta"
            value={datos.Codigo_Cuenta}
            onChange={handleChange}
            placeholder="Código de Cuenta"
          />
          <InputText
            name="Nombre_Cuenta"
            value={datos.Nombre_Cuenta}
            onChange={handleChange}
            placeholder="Nombre de Cuenta"
          />
          <InputText
            name="Nivel"
            value={datos.Nivel}
            onChange={handleChange}
            placeholder="Nivel"
          />
          <InputText
            name="Cuenta_Padre"
            value={datos.Cuenta_Padre}
            onChange={handleChange}
            placeholder="Cuenta Padre"
          />
          <Dropdown
            name="Tipo_Cuenta"
            value={datos.Tipo_Cuenta}
            options={tipoCuentaOpciones}
            onChange={(e) => setDatos({ ...datos, Tipo_Cuenta: e.value })}
            placeholder="Selecciona Tipo de Cuenta"
          />
          <Dropdown
            name="Naturaleza_Cuenta"
            value={datos.Naturaleza_Cuenta}
            options={naturalezaOpciones}
            onChange={(e) => setDatos({ ...datos, Naturaleza_Cuenta: e.value })}
            placeholder="Selecciona Naturaleza"
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

export default CatalogoCuentas;

