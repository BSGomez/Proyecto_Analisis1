import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';

const Ajustes = () => {
  const [polizas, setPolizas] = useState([]);
  const [tiposAsiento, setTiposAsiento] = useState([]);
  const [cuentas, setCuentas] = useState([]);

  const [ajuste, setAjuste] = useState({
    ID_Poliza: '',
    ID_Tipo_Asiento: '',
    Fecha: '',
    Numero_Asiento: '',
    Descripcion: '',
    Detalles: []
  });

  const [detalle, setDetalle] = useState({
    Cuenta: '',
    Debe: 0,
    Haber: 0,
    Descripcion: ''
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    // cargar pólizas
    axios.get('http://localhost:8800/routes/polizas')
      .then(res => setPolizas(res.data.map(p => ({ label: p.Numero_Poliza, value: p.ID_Poliza }))))
      .catch(console.error);
    // cargar tipos de asiento
    axios.get('http://localhost:8800/routes/tipos-asiento')
      .then(res => setTiposAsiento(res.data.map(t => ({ label: t.Nombre_Tipo, value: t.ID_Tipo_Asiento }))))
      .catch(console.error);
    // cargar cuentas contables
    axios.get('http://localhost:8800/routes/CON_CUENTAS')
      .then(res => setCuentas(res.data.map(c => ({ label: `${c.Codigo_Cuenta} - ${c.Nombre_Cuenta}`, value: c.Codigo_Cuenta }))))
      .catch(console.error);
  }, []);

  const handleAjusteChange = e => {
    const { name, value } = e.target;
    setAjuste(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [name]: null }));
  };

  const handleDetalleChange = e => {
    const { name, value } = e.target;
    if ((name === 'Debe' || name === 'Haber') && isNaN(value)) return;
    setDetalle(prev => ({ ...prev, [name]: name==='Cuenta'?value:parseFloat(value) || 0 }));
  };

  const validar = () => {
    const errs = {};
    if (!ajuste.ID_Poliza) errs.ID_Poliza = 'Seleccione la póliza.';
    if (!ajuste.ID_Tipo_Asiento) errs.ID_Tipo_Asiento = 'Seleccione el tipo de asiento.';
    if (!ajuste.Fecha) errs.Fecha = 'Fecha obligatoria.';
    if (!ajuste.Numero_Asiento || isNaN(ajuste.Numero_Asiento)) errs.Numero_Asiento = 'Número de asiento numérico.';
    if (!ajuste.Descripcion) errs.Descripcion = 'Descripción obligatoria.';
    if (ajuste.Detalles.length === 0) errs.Detalles = 'Agregue al menos un detalle.';
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const agregarDetalle = () => {
    if (!detalle.Cuenta) return alert('Seleccione una cuenta.');
    if (detalle.Debe===0 && detalle.Haber===0) return alert('Debe o Haber debe ser > 0.');
    setAjuste(prev => ({ ...prev, Detalles: [...prev.Detalles, detalle] }));
    setDetalle({ Cuenta:'', Debe:0, Haber:0, Descripcion:'' });
  };

  const eliminarDetalle = det => {
    setAjuste(prev => ({ ...prev, Detalles: prev.Detalles.filter(d=>d!==det) }));
  };

  const calcularTotales = () => ({
    totalDebe: ajuste.Detalles.reduce((a,d)=>a + d.Debe, 0),
    totalHaber: ajuste.Detalles.reduce((a,d)=>a + d.Haber, 0)
  });

  const guardarAjuste = async () => {
    if (!validar()) return;
    const { totalDebe, totalHaber } = calcularTotales();
    if (totalDebe !== totalHaber) return alert('Debe y Haber deben coincidir.');

    try {
      const payload = { ...ajuste, Numero_Asiento: parseInt(ajuste.Numero_Asiento,10) };
      await axios.post('http://localhost:8800/routes/partidas', payload);
      alert('Ajuste registrado');
      setAjuste({ ID_Poliza:'', ID_Tipo_Asiento:'', Fecha:'', Numero_Asiento:'', Descripcion:'', Detalles:[] });
    } catch(err) {
      console.error(err);
      alert('Error al guardar ajuste');
    }
  };

  return (
    <div style={{ padding:20 }}>
      <h2>Asientos de Ajuste</h2>
      <div style={{ marginBottom:10 }}>
        <Dropdown name="ID_Poliza" value={ajuste.ID_Poliza} options={polizas}
          onChange={handleAjusteChange} placeholder="Póliza" style={{ width:'200px', marginRight:10 }} />
        {errores.ID_Poliza && <Message severity="error" text={errores.ID_Poliza} />}        
      </div>
      <div style={{ marginBottom:10 }}>
        <Dropdown name="ID_Tipo_Asiento" value={ajuste.ID_Tipo_Asiento} options={tiposAsiento}
          onChange={handleAjusteChange} placeholder="Tipo Asiento" style={{ width:'200px', marginRight:10 }} />
        {errores.ID_Tipo_Asiento && <Message severity="error" text={errores.ID_Tipo_Asiento} />}
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:10 }}>
        <InputText name="Fecha" value={ajuste.Fecha} onChange={handleAjusteChange}
          placeholder="YYYY-MM-DD" style={{ width:120 }} />
        <InputText name="Numero_Asiento" value={ajuste.Numero_Asiento} onChange={handleAjusteChange}
          placeholder="Num Asiento" style={{ width:120 }} />
        <InputText name="Descripcion" value={ajuste.Descripcion} onChange={handleAjusteChange}
          placeholder="Descripción" style={{ flex:1 }} />
      </div>
      {errores.Fecha && <Message severity="error" text={errores.Fecha} />}
      {errores.Numero_Asiento && <Message severity="error" text={errores.Numero_Asiento} />}
      {errores.Descripcion && <Message severity="error" text={errores.Descripcion} />}
      <h4>Detalles</h4>
      <div style={{ display:'flex', gap:10, marginBottom:10 }}>
        <Dropdown value={detalle.Cuenta} options={cuentas} name="Cuenta"
          onChange={handleDetalleChange} placeholder="Cuenta" style={{ width:200 }} />
        <InputText name="Debe" value={detalle.Debe} onChange={handleDetalleChange}
          placeholder="Debe" style={{ width:100 }} />
        <InputText name="Haber" value={detalle.Haber} onChange={handleDetalleChange}
          placeholder="Haber" style={{ width:100 }} />
        <InputText name="Descripcion" value={detalle.Descripcion} onChange={handleDetalleChange}
          placeholder="Desc." style={{ flex:1 }} />
        <Button label="+" icon="pi pi-plus" className="p-button-success" onClick={agregarDetalle} />
      </div>
      {errores.Detalles && <Message severity="error" text={errores.Detalles} />}
      <DataTable value={ajuste.Detalles} size="small" style={{ marginBottom:10 }}>
        <Column field="Cuenta" header="Cuenta" />
        <Column field="Debe" header="Debe" />
        <Column field="Haber" header="Haber" />
        <Column field="Descripcion" header="Descripción" />
        <Column body={row => <Button icon="pi pi-trash" className="p-button-danger p-button-text" onClick={()=>eliminarDetalle(row)} />} header="" />
      </DataTable>
      <div style={{ marginBottom:20 }}>
        <strong>Total Debe:</strong> {calcularTotales().totalDebe.toFixed(2)} &nbsp;
        <strong>Total Haber:</strong> {calcularTotales().totalHaber.toFixed(2)}
      </div>
      <Button label="Guardar Ajuste" icon="pi pi-save" onClick={guardarAjuste} className="p-button-primary" />
    </div>
  );
};

export default Ajustes;
