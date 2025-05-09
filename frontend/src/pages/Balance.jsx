import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos de PrimeReact
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const Balance = () => {
  const [balance, setBalance] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [datos, setDatos] = useState({
    BAL_id_balance: '',
    BAL_cuenta: '',
    BAL_periodo: '',
    BAL_saldo_inicial: '',
    BAL_debito: '',
    BAL_credito: '',
    BAL_saldo_final: ''
  });

  const [selectedBalance, setSelectedBalance] = useState(null); // Para almacenar el registro seleccionado

  // Función para obtener los datos
  const fetchBalance = async () => {
    try {
      const response = await axios.get('http://localhost:8800/balanceSaldos');
      setBalance(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Llama a la función al cargar el componente
  useEffect(() => {
    fetchBalance();
  }, []);

  // Función para manejar el cambio en los inputs
  const handleChange = (e) => {
        const { name, value } = e.target;
    
        // Convierte los valores a los tipos correctos dentro de handleChange
        if (name === 'BAL_id_balance' || name === 'BAL_cuenta') {
          setDatos({
            ...datos,
            [name]: value ? parseInt(value, 10) : ''  // Convertir a entero
          });
        } else if (
          name === 'BAL_saldo_inicial' ||
          name === 'BAL_debito' ||
          name === 'BAL_credito' ||
          name === 'BAL_saldo_final'
        ) {
          setDatos({
            ...datos,
            [name]: value ? parseFloat(value) : ''  // Convertir a float
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
      const response = await axios.post('http://localhost:8800/balanceSaldos', datos);
      console.log("Respuesta del servidor:", response.data);
      alert("Datos enviados correctamente");
      fetchBalance(); // Recarga los datos después de insertar
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Error al enviar los datos");
    }
  };

  // Función para enviar datos por PUT (Modificar)
  const modificarDatos = async () => {
        if (!selectedBalance) {
          alert('Por favor selecciona un registro para modificar');
          return;
        }
        try {
          const response = await axios.put(`http://localhost:8800/balanceSaldos/${selectedBalance.BAL_id_balance}`, datos);
          console.log("Respuesta del servidor:", response.data);
          alert("Datos modificados correctamente");
          fetchBalance(); // Recarga los datos después de modificar
          setSelectedBalance(null); // Limpiar el registro seleccionado después de la actualización
        } catch (error) {
          console.error("Error al modificar los datos:", error);
          alert("Error al modificar los datos");
        }
      };

      // Si no se seleccionó un registro, usaremos el ID proporcionado
    const idBalance = selectedBalance ? selectedBalance.BAL_id_balance : datos.BAL_id_balance;

      //Funcion para eliminar datos
  const eliminarDatos = async (id) => {
        try {
          const response = await axios.delete(`http://localhost:8800/balanceSaldos/${id}`);
          console.log("Respuesta del servidor:", response.data);
          alert("Datos eliminados correctamente");
          fetchBalance(); // Recarga los datos después de eliminar
        } catch (error) {
          console.error("Error al eliminar los datos:", error);
          alert("Error al eliminar los datos");
        }
      };

      // Función para seleccionar el registro a modificar
  const handleEdit = (rowData) => {
        setDatos(rowData); // Cargar datos en el formulario
        setSelectedBalance(rowData); // Guardar el registro seleccionado para actualizarlo
      };


  return (
    <div>
      <h1><center>Balance de saldos</center></h1>

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
        <div className="Balance">
          <DataTable value={balance} paginator rows={10} responsiveLayout="scroll" selectionMode="single" onSelectionChange={(e) => handleEdit(e.value)}>
            <Column field="BAL_id_balance" header="ID" sortable></Column>
            <Column field="BAL_cuenta" header="Cuenta" sortable></Column>
            <Column field="BAL_periodo" header="Periodo" sortable></Column>
            <Column field="BAL_saldo_inicial" header="Saldo Inicial" sortable></Column>
            <Column field="BAL_debito" header="Débito" sortable></Column>
            <Column field="BAL_credito" header="Crédito" sortable></Column>
            <Column field="BAL_saldo_final" header="Saldo Final" sortable></Column>
          </DataTable>
        </div>
      )}

      <br />
      <div className="form-Box" style={{ marginTop: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" value={datos.BAL_id_balance} name="BAL_id_balance" onChange={handleChange} placeholder="ID" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" value={datos.BAL_cuenta} name="BAL_cuenta" onChange={handleChange} placeholder="CUENTA" />
          </div>
          <div className="card flex justify-content-center">
            <InputText value={datos.BAL_periodo} onChange={handleChange} name='BAL_periodo' placeholder="PERIODO" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" value={datos.BAL_saldo_inicial} name='BAL_saldo_inicial' onChange={handleChange} placeholder="SALDO INICIAL" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" value={datos.BAL_debito} name='BAL_debito' onChange={handleChange} placeholder="DEBITO" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" value={datos.BAL_credito} name='BAL_credito' onChange={handleChange} placeholder="CREDITO" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" value={datos.BAL_saldo_final} name='BAL_saldo_final' onChange={handleChange} placeholder="SALDO FINAL" />
          </div>
        </div>
      </div>
      <br />

      <div className="buttons" style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button label="Agregar" icon="pi pi-plus" className="p-button p-button-primary" onClick={enviarDatos} />
        <Button label="Modificar" icon="pi pi-pencil" className="p-button p-button-primary" onClick={modificarDatos} style={{ marginLeft: '10px' }} />
        <Button label="Eliminar" icon="pi pi-trash" className="p-button p-button-primary" onClick={() => eliminarDatos(datos.BAL_id_balance)} style={{ marginLeft: '10px' }} />
        <br />
        <Button label="Volver" icon="pi pi-arrow-left" className="p-button p-button-primary" onClick={() => window.location.href = '/'} style={{ marginTop: '10px' }} />
      </div>
    </div>
  );
};

export default Balance;
