/*
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { useEffect, useState, useRef } from "react"; 
import axios from "axios";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

const API_URL = "http://localhost:8800/routes";

function PartidasContables() {
    const [partidas, setPartidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarDialogo, setMostrarDialogo] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [partidaSeleccionada, setPartidaSeleccionada] = useState(null);
    const toast = useRef(null);

    const [formularioPartida, setFormularioPartida] = useState({
        PAR_descripcion: "",
        PAR_fecha: "",
        monto_total: "", 
        telefono: "",
        Tipo: "Ingreso"
    });

    useEffect(() => {
        axios.get(`${API_URL}/CON_PARTIDA_CONTABLE`)
            .then(response => {
                setPartidas(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener las partidas contables:", error);
                setLoading(false);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener las partidas contables', life: 3000 });
            });
    }, []);

    const abrirFormularioAgregar = () => {
        setFormularioPartida({ PAR_descripcion: "", PAR_fecha: "", monto_total: "", telefono: "", Tipo: "Ingreso" });
        setModoEdicion(false);
        setMostrarDialogo(true);
    };

    const abrirFormularioEditar = (partida) => {
        setFormularioPartida(partida);
        setPartidaSeleccionada(partida);
        setModoEdicion(true);
        setMostrarDialogo(true);
    };

    const guardarPartida = () => {
        console.log("Datos enviados:", formularioPartida); // Muestra los datos que se están enviando
    
        // Verificación de campos obligatorios
        if (!formularioPartida.PAR_descripcion || !formularioPartida.PAR_fecha || !formularioPartida.monto_total || !formularioPartida.telefono) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Todos los campos son requeridos', life: 3000 });
            return;
        }
    
        // Preparamos los datos que se enviarán al backend
        const partidaData = {
            PAR_descripcion: formularioPartida.PAR_descripcion,
            PAR_fecha: formularioPartida.PAR_fecha,
            monto_total: formularioPartida.monto_total,
            telefono: formularioPartida.telefono,
            Tipo: formularioPartida.Tipo
        };
    
        // Si estamos en modo edición, usamos PUT
        if (modoEdicion) {
            axios.put(`${API_URL}/CON_PARTIDA_CONTABLE/${partidaSeleccionada.PAR_id_partida}`, partidaData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                toast.current.show({ severity: 'success', summary: 'Partida Editada', detail: response.data.mensaje, life: 3000 });
                setPartidas(partidas.map(p => p.PAR_id_partida === partidaSeleccionada.PAR_id_partida ? response.data.partida : p));
                setMostrarDialogo(false);
            })
            .catch(error => {
                console.error("Error al editar la partida:", error.response || error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo editar la partida', life: 3000 });
            });
        } else {
            // Si estamos agregando una nueva partida, usamos POST
            axios.post(`${API_URL}/CON_PARTIDA_CONTABLE`, partidaData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => {
                toast.current.show({ severity: 'success', summary: 'Partida Agregada', detail: response.data.mensaje, life: 3000 });
                setPartidas([...partidas, response.data.partida || partidaData]);
                setMostrarDialogo(false);
            })
            .catch(error => {
                console.error("Error al agregar la partida:", error.response || error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar la partida', life: 3000 });
            });
        }
    };

    const handleDelete = (partida) => {
        axios.delete(`${API_URL}/CON_PARTIDA_CONTABLE/${partida.PAR_id_partida}`)
            .then(response => {
                toast.current.show({ severity: 'warn', summary: 'Partida Eliminada', detail: response.data.mensaje, life: 3000 });
                setPartidas(partidas.filter(p => p.PAR_id_partida !== partida.PAR_id_partida));
            })
            .catch(error => {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la partida', life: 3000 });
            });
    };

    return (
        <div>
            <h2 className="p-text-center">Lista de Partidas Contables</h2>
            <Toast ref={toast} />
            <Button label="Agregar" icon="pi pi-plus" className="p-button-success p-mb-3" onClick={abrirFormularioAgregar} />

            <DataTable value={partidas} loading={loading} paginator rows={10} responsiveLayout="scroll">
                <Column field="PAR_descripcion" header="Descripción" sortable />
                <Column field="PAR_fecha" header="Fecha" sortable />
                <Column field="monto_total" header="Monto Total" sortable />
                <Column field="telefono" header="Teléfono" sortable />
                <Column field="Tipo" header="Tipo" sortable />
                <Column header="Acciones" body={(rowData) => (
                    <>
                        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => abrirFormularioEditar(rowData)} />
                        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDelete(rowData)} />
                    </>
                )} />
            </DataTable>

            <Dialog header={modoEdicion ? "Editar Partida Contable" : "Agregar Partida Contable"} visible={mostrarDialogo} style={{ width: '30vw' }} modal onHide={() => setMostrarDialogo(false)}>
                <div className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="PAR_descripcion">Descripción</label>
                        <InputText id="PAR_descripcion" value={formularioPartida.PAR_descripcion} onChange={(e) => setFormularioPartida({ ...formularioPartida, PAR_descripcion: e.target.value })} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="PAR_fecha">Fecha</label>
                        <InputText id="PAR_fecha" value={formularioPartida.PAR_fecha} onChange={(e) => setFormularioPartida({ ...formularioPartida, PAR_fecha: e.target.value })} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="monto_total">Monto Total</label>
                        <InputText id="monto_total" value={formularioPartida.monto_total} onChange={(e) => setFormularioPartida({ ...formularioPartida, monto_total: e.target.value })} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="telefono">Teléfono</label>
                        <InputText id="telefono" value={formularioPartida.telefono} onChange={(e) => setFormularioPartida({ ...formularioPartida, telefono: e.target.value })} />
                    </div>
                    <div className="p-field">
                        <label htmlFor="Tipo">Tipo</label>
                        <Dropdown id="Tipo" value={formularioPartida.Tipo} options={["Ingreso", "Egreso"]} onChange={(e) => setFormularioPartida({ ...formularioPartida, Tipo: e.value })} placeholder="Seleccione un tipo" />
                    </div>
                    <Button label="Guardar" icon="pi pi-check" className="p-mt-2" onClick={guardarPartida} />
                </div>
            </Dialog>

        </div>
    );
}

export default PartidasContables;
*/