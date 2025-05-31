import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const Balance = () => {
  const [balance, setBalance] = useState([]);
  const [balanceCalculado, setBalanceCalculado] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [datos, setDatos] = useState({
    Fecha_Corte: '',
    Codigo_Cuenta: '',
    Saldo_Deudor: '0',
    Saldo_Acreedor: '0'
  });

  const [selectedBalance, setSelectedBalance] = useState(null);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('http://localhost:8800/routes/balanceSaldos');
      setBalance(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceCalculado = async () => {
    try {
      const response = await axios.get('http://localhost:8800/routes/balanceSaldos/calculado');
      setBalanceCalculado(response.data);
    } catch (error) {
      console.error('Error fetching balance calculado:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchBalanceCalculado();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: ['Saldo_Deudor', 'Saldo_Acreedor'].includes(name)
        ? value.replace(/[^0-9.]/g, '') // solo números y punto
        : value
    }));
  };

  const enviarDatos = async () => {
    try {
      const datosConvertidos = {
        Fecha_Corte: datos.Fecha_Corte,
        Codigo_Cuenta: datos.Codigo_Cuenta,
        Saldo_Deudor: datos.Saldo_Deudor === '' ? 0 : parseFloat(datos.Saldo_Deudor),
        Saldo_Acreedor: datos.Saldo_Acreedor === '' ? 0 : parseFloat(datos.Saldo_Acreedor)
      };
      await axios.post('http://localhost:8800/routes/balanceSaldos', datosConvertidos);
      alert("Datos enviados correctamente");
      fetchBalance();
      fetchBalanceCalculado();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Error al enviar los datos");
    }
  };

  const modificarDatos = async () => {
    if (!selectedBalance) {
      alert('Selecciona un registro para modificar');
      return;
    }
    try {
      await axios.put(`http://localhost:8800/routes/balanceSaldos/${selectedBalance.ID_Balance}`, {
        ...datos,
        Saldo_Deudor: parseFloat(datos.Saldo_Deudor) || 0,
        Saldo_Acreedor: parseFloat(datos.Saldo_Acreedor) || 0
      });
      alert("Datos modificados correctamente");
      fetchBalance();
      fetchBalanceCalculado();
      setSelectedBalance(null);
    } catch (error) {
      console.error("Error al modificar los datos:", error);
      alert("Error al modificar los datos");
    }
  };

  const eliminarDatos = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/routes/balanceSaldos/${id}`);
      alert("Datos eliminados correctamente");
      fetchBalance();
      fetchBalanceCalculado();
    } catch (error) {
      console.error("Error al eliminar los datos:", error);
      alert("Error al eliminar los datos");
    }
  };

  const handleEdit = (rowData) => {
    setDatos({
      Fecha_Corte: rowData.Fecha_Corte || '',
      Codigo_Cuenta: rowData.Codigo_Cuenta || '',
      Saldo_Deudor: String(rowData.Saldo_Deudor || '0'),
      Saldo_Acreedor: String(rowData.Saldo_Acreedor || '0')
    });
    setSelectedBalance(rowData);
  };

  return (
    <div style={{ backgroundColor: '#F2F3F4', color: '#170E11', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#20709C' }}>Balance de Saldos</h1>

      {loading && <p style={{ textAlign: 'center' }}>Cargando...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && !error && (
        <DataTable
          value={balance}
          paginator
          rows={10}
          responsiveLayout="scroll"
          selectionMode="single"
          onSelectionChange={(e) => handleEdit(e.value)}
        >
          <Column field="ID_Balance" header="ID" />
          <Column field="Fecha_Corte" header="Fecha de Corte" />
          <Column field="Codigo_Cuenta" header="Código de Cuenta" />
          <Column field="Saldo_Deudor" header="Saldo Deudor" />
          <Column field="Saldo_Acreedor" header="Saldo Acreedor" />
        </DataTable>
      )}

      <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        <InputText name="Fecha_Corte" value={datos.Fecha_Corte} onChange={handleChange} placeholder="Fecha Corte (YYYY-MM-DD)" />
        <InputText name="Codigo_Cuenta" value={datos.Codigo_Cuenta} onChange={handleChange} placeholder="Código Cuenta" />
        <InputText name="Saldo_Deudor" value={datos.Saldo_Deudor} onChange={handleChange} placeholder="Saldo Deudor" />
        <InputText name="Saldo_Acreedor" value={datos.Saldo_Acreedor} onChange={handleChange} placeholder="Saldo Acreedor" />
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button label="Agregar" icon="pi pi-plus" onClick={enviarDatos} style={{ marginRight: '10px' }} />
        <Button label="Modificar" icon="pi pi-pencil" onClick={modificarDatos} style={{ marginRight: '10px' }} />
        <Button label="Eliminar" icon="pi pi-trash" onClick={() => eliminarDatos(selectedBalance?.ID_Balance)} />
      </div>

      <h2 style={{ textAlign: 'center', marginTop: '40px', color: '#20709C' }}>Balance Agrupado por Cuenta</h2>
      <DataTable value={balanceCalculado} responsiveLayout="scroll" rows={10}>
        <Column field="Codigo_Cuenta" header="Código Cuenta" />
        <Column field="Total_Deudor" header="Total Deudor" />
        <Column field="Total_Acreedor" header="Total Acreedor" />
      </DataTable>
    </div>
  );
};

export default Balance;
