import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos de PrimeReact
import { InputText } from 'primereact/inputtext';
        

const Balance = () => {
  const [balance, setBalance] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [datos, setDatos] = useState({
    BAL_id_balance: 222,
    BAL_cuenta: 2222,
    BAL_periodo: '2000-02-02',
    BAL_saldo_inicial: 20,
    BAL_debito: 20,
    BAL_credito: 20,
    BAL_saldo_final: 20
  });

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

  // Función para enviar datos por POST
  const enviarDatos = async () => {
    try {
      const response = await axios.post('http://localhost:8800/balanceSaldos', datos);
      console.log("Respuesta del servidor:", response.data);
      alert("Datos enviados correctamente");
      fetchBalance(); // 👈 Recarga los datos después de insertar
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Error al enviar los datos");
    }
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
          <DataTable value={balance} paginator rows={10} responsiveLayout="scroll">
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
            <InputText keyfilter="int" values={datos.BAL_id_balance} placeholder="ID" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" values={datos.BAL_cuenta} placeholder="CUENTA" />
          </div>
          <div className="card flex justify-content-center">
            <InputText values={datos.BAL_periodo} placeholder="PERIODO" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" values={datos.BAL_saldo_inicial} placeholder="SALDO INICIAL" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" values={datos.BAL_debito} placeholder="DEBITO" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" values={datos.BAL_credito} placeholder="CREDITO" />
          </div>
          <div className="card flex justify-content-center">
            <InputText keyfilter="int" values={datos.BAL_saldo_final} placeholder="SALDO FINAL" />
          </div>
        </div>
      </div>
      <br />

      <div className="buttons" style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={enviarDatos} className="btn btn-primary">Agregar</button>
        <button className="btn btn-secondary">Modificar</button>
        <button className="btn btn-danger">Eliminar</button>
      </div>
    </div>
  );
};

export default Balance;
