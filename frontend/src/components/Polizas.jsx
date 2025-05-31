import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const tipoOptions = [
  { label: 'Diario', value: 'Diario' },
  { label: 'Ingreso', value: 'Ingreso' },
  { label: 'Egreso', value: 'Egreso' },
  { label: 'Cheque', value: 'Cheque' }
];

const Polizas = () => {
  const [polizas, setPolizas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    Numero_Poliza: '',
    Fecha: null,
    Tipo_Poliza: null,
    Descripcion: ''
  });
  const [errors, setErrors] = useState({});

  const loadPolizas = async () => {
    setLoading(true);
    try {
      const resp = await axios.get('http://localhost:8800/routes/polizas');
      setPolizas(resp.data);
    } catch (err) {
      console.error('Error al cargar pólizas', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolizas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async () => {
    // Validaciones
    const errs = {};
    if (!formData.Numero_Poliza) errs.Numero_Poliza = 'Requerido';
    if (!formData.Fecha) errs.Fecha = 'Requerida';
    if (!formData.Tipo_Poliza) errs.Tipo_Poliza = 'Requerido';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      await axios.post('http://localhost:8800/routes/polizas', {
        Numero_Poliza: formData.Numero_Poliza,
        Fecha: formData.Fecha.toISOString().split('T')[0],
        Tipo_Poliza: formData.Tipo_Poliza,
        Descripcion: formData.Descripcion
      });
      setShowDialog(false);
      setFormData({ Numero_Poliza: '', Fecha: null, Tipo_Poliza: null, Descripcion: '' });
      loadPolizas();
    } catch (err) {
      console.error('Error al crear póliza', err);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#F2F3F4', color: '#170E11' }}>
      <h1 style={{ textAlign: 'center', color: '#20709C' }}>Pólizas</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        
        <Button label="Nueva Póliza" icon="pi pi-plus" className="p-button-success" onClick={() => setShowDialog(true)} />
      </div>
      <DataTable value={polizas} loading={loading} paginator rows={10} responsiveLayout="scroll">
        <Column field="numero" header="Número" sortable />
        <Column field="Fecha" header="Fecha" body={row => new Date(row.Fecha).toLocaleDateString()} sortable />
        <Column field="tipo" header="Tipo" sortable />
        <Column field="Descripcion" header="Descripción" />
      </DataTable>

      <Dialog header="Nueva Póliza" visible={showDialog} onHide={() => setShowDialog(false)} style={{ width: '400px' }}>
        <div className="p-fluid">
          <div className="p-field">
            <InputText name="Numero_Poliza" value={formData.Numero_Poliza} onChange={handleChange} placeholder="Número de Póliza" />
            {errors.Numero_Poliza && <Message severity="error" text={errors.Numero_Poliza} />}
          </div>
          <div className="p-field">
            <Calendar value={formData.Fecha} onChange={(e) => handleChange({ target: { name: 'Fecha', value: e.value } })} dateFormat="yy-mm-dd" placeholder="Fecha" />
            {errors.Fecha && <Message severity="error" text={errors.Fecha} />}
          </div>
          <div className="p-field">
            <Dropdown name="Tipo_Poliza" options={tipoOptions} value={formData.Tipo_Poliza} onChange={(e) => handleChange({ target: { name: 'Tipo_Poliza', value: e.value } })} placeholder="Tipo de Póliza" />
            {errors.Tipo_Poliza && <Message severity="error" text={errors.Tipo_Poliza} />}
          </div>
          <div className="p-field">
            <InputText name="Descripcion" value={formData.Descripcion} onChange={handleChange} placeholder="Descripción (opcional)" />
          </div>
          <div style={{ textAlign: 'right' }}>
            <Button label="Guardar" icon="pi pi-save" className="p-button-primary" onClick={handleSubmit} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Polizas;
