import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const CatalogoCuentas = () => {
  const [cuentas, setCuentas] = useState([]);
  const [datos, setDatos] = useState({
    Codigo_Cuenta: '',
    Nombre_Cuenta: '',
    Nivel: '',
    Cuenta_Padre: '',
    Tipo_Cuenta: '',
    Naturaleza_Cuenta: ''
  });

  const fetchCuentas = async () => {
    try {
      const response = await axios.get('http://localhost:8800/catalogoCuentas');
      setCuentas(response.data);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
    }
  };

  useEffect(() => {
    fetchCuentas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const agregarCuenta = async () => {
    try {
      await axios.post('http://localhost:8800/catalogoCuentas', datos);
      alert("Cuenta agregada correctamente");
      fetchCuentas();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al agregar la cuenta:", error);
      alert("Error al agregar la cuenta");
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

  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    topButtons: {
      display: 'flex',
      justifyContent: 'flex-start',
      gap: '10px',
      marginBottom: '20px',
      marginLeft: '20px',
    },
    tableContainer: {
      marginBottom: '20px',
    },
    formBox: {
      marginTop: '20px',
      textAlign: 'center',
    },
    inputContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      flexWrap: 'wrap',
    },
  };

  return (
    <div style={{ ...styles.container, backgroundColor: '#F2F3F4', color: '#170E11' }}>
      <h1 style={{ ...styles.title, color: '#20709C' }}>Catálogo de Cuentas</h1>

      <div style={styles.topButtons}>
        <Button
          className="p-button-info"
          label="Buscar Cuenta"
          style={{ backgroundColor: '#507592', borderColor: '#507592', color: '#F2F3F4' }}
        />
        <Button
          className="p-button-success"
          label="Nueva Cuenta"
          onClick={agregarCuenta}
          style={{ backgroundColor: '#20709C', borderColor: '#20709C', color: '#F2F3F4' }}
        />
      </div>

      <div style={styles.tableContainer}>
        <DataTable
          value={cuentas}
          scrollable
          scrollHeight="400px"
          style={{ minWidth: '50rem', backgroundColor: '#F2F3F4', color: '#170E11' }}
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
            body={(rowData) => (
              <>
                <Button
                  className="p-button-warning"
                  label="Editar"
                  onClick={() => console.log("Editar cuenta", rowData)}
                  style={{
                    backgroundColor: '#20709C',
                    borderColor: '#20709C',
                    color: '#F2F3F4',
                    marginRight: '5px',
                  }}
                />
                <Button
                  className="p-button-danger"
                  label="Eliminar"
                  onClick={() => console.log("Eliminar cuenta", rowData.Codigo_Cuenta)}
                  style={{
                    backgroundColor: '#507592',
                    borderColor: '#507592',
                    color: '#F2F3F4',
                  }}
                />
              </>
            )}
          />
        </DataTable>
      </div>

      <div style={styles.formBox}>
        <div style={styles.inputContainer}>
          <InputText name="Codigo_Cuenta" value={datos.Codigo_Cuenta} onChange={handleChange} placeholder="Código de Cuenta" style={{ borderColor: '#507592' }} />
          <InputText name="Nombre_Cuenta" value={datos.Nombre_Cuenta} onChange={handleChange} placeholder="Nombre de Cuenta" style={{ borderColor: '#507592' }} />
          <InputText name="Nivel" value={datos.Nivel} onChange={handleChange} placeholder="Nivel" style={{ borderColor: '#507592' }} />
          <InputText name="Cuenta_Padre" value={datos.Cuenta_Padre} onChange={handleChange} placeholder="Cuenta Padre" style={{ borderColor: '#507592' }} />
          <InputText name="Tipo_Cuenta" value={datos.Tipo_Cuenta} onChange={handleChange} placeholder="Tipo de Cuenta" style={{ borderColor: '#507592' }} />
          <InputText name="Naturaleza_Cuenta" value={datos.Naturaleza_Cuenta} onChange={handleChange} placeholder="Naturaleza" style={{ borderColor: '#507592' }} />
        </div>
      </div>

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

export default CatalogoCuentas;