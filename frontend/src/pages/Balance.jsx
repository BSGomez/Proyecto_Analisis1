import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos de PrimeReact

const Balance = () => {
  const [balance, setBalance] = useState([]);
  const [error, setError] = useState(null); // Estado para manejar errores
  const [loading, setLoading] = useState(true); // Estado para manejar el indicador de carga

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get('http://localhost:8800/balanceSaldos');
        console.log(response.data);
        setBalance(response.data);
        setError(null); // Limpia cualquier error previo
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('No se pudo conectar con el servidor. Verifica tu conexión o que el servidor esté en ejecución.');
      } finally {
        setLoading(false); // Finaliza el indicador de carga
      }
    };
    fetchBalance();
  }, []);

  return (
    <div>
      <h1>
        <center>Balance de saldos</center>
      </h1>

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
            <Column field="BAL_debito" header="Debito" sortable></Column>
            <Column field="BAL_credito" header="Credito" sortable></Column>
            <Column field="BAL_saldo_final" header="Saldo Final" sortable></Column>
          </DataTable>
        </div>
      )}

      <div className="buttons">
        <button className="btn btn-primary">Agregar</button>
        <button className="btn btn-secondary">Modificar</button>
        <button className="btn btn-danger">Eliminar</button>
      </div>
    </div>
  );
};

export default Balance;