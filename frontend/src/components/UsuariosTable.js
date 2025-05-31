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

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarDialogo, setMostrarDialogo] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const toast = useRef(null);

    const [formularioUsuario, setFormularioUsuario] = useState({
        USR_nombre: "",
        USR_correo: "",
        USR_contraseña: "", 
        USR_rol: "Usuario",
        USR_estado: "Activo"
    });

    useEffect(() => {
        axios.get(`${API_URL}/CON_USUARIO`)
            .then(response => {
                setUsuarios(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener los usuarios:", error);
                setLoading(false);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener los usuarios', life: 3000 });
            });
    }, []);

    const abrirFormularioAgregar = () => {
        setFormularioUsuario({ USR_nombre: "", USR_correo: "", USR_rol: "Usuario", USR_estado: "Activo" });
        setModoEdicion(false);
        setMostrarDialogo(true);
    };

    const abrirFormularioEditar = (usuario) => {
        setFormularioUsuario(usuario);
        setUsuarioSeleccionado(usuario);
        setModoEdicion(true);
        setMostrarDialogo(true);
    };

    const guardarUsuario = () => {
        console.log("Datos enviados:", formularioUsuario); // Muestra los datos que se están enviando
    
        // Verificación de campos obligatorios
        if (!formularioUsuario.USR_nombre || !formularioUsuario.USR_correo || !formularioUsuario.USR_contraseña) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Todos los campos son requeridos', life: 3000 });
            return;
        }
    
        // Preparamos los datos que se enviarán al backend
        const usuarioData = {
            nombre: formularioUsuario.USR_nombre,      // Cambié "USR_nombre" por "nombre"
            correo: formularioUsuario.USR_correo,      // Cambié "USR_correo" por "correo"
            contraseña: formularioUsuario.USR_contraseña,  // Cambié "USR_contraseña" por "contraseña"
            rol: formularioUsuario.USR_rol,            // Cambié "USR_rol" por "rol"
            estado: formularioUsuario.USR_estado       // Cambié "USR_estado" por "estado"
        };
    
        // Si estamos en modo edición, usamos PUT
        if (modoEdicion) {
            axios.put(`${API_URL}/CON_USUARIO/${usuarioSeleccionado.USR_id_usuario}`, usuarioData, {
                headers: {
                    'Content-Type': 'application/json', // Asegúrate de que el backend sepa que estamos enviando JSON
                }
            })
            .then(response => {
                toast.current.show({ severity: 'success', summary: 'Usuario Editado', detail: response.data.mensaje, life: 3000 });
                setUsuarios(usuarios.map(u => u.USR_id_usuario === usuarioSeleccionado.USR_id_usuario ? response.data.usuario : u));
                setMostrarDialogo(false);
            })
            .catch(error => {
                console.error("Error al editar el usuario:", error.response || error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo editar el usuario', life: 3000 });
            });
        } else {
            // Si estamos agregando un nuevo usuario, usamos POST
            axios.post(`${API_URL}/CON_USUARIO`, usuarioData, {
                headers: {
                    'Content-Type': 'application/json', // Asegúrate de que el backend sepa que estamos enviando JSON
                }
            })
            .then(response => {
                toast.current.show({ severity: 'success', summary: 'Usuario Agregado', detail: response.data.mensaje, life: 3000 });
                setUsuarios([...usuarios, response.data.usuario || usuarioData]); // Agrega el nuevo usuario al estado
                setMostrarDialogo(false);
            })
            .catch(error => {
                console.error("Error al agregar el usuario:", error.response || error); // Muestra el error completo en consola
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el usuario', life: 3000 });
            });
        }
    };
    
    
    

    

    const handleDelete = (usuario) => {
        axios.delete(`${API_URL}/CON_USUARIO/${usuario.USR_id_usuario}`)
            .then(response => {
                toast.current.show({ severity: 'warn', summary: 'Usuario Eliminado', detail: response.data.mensaje, life: 3000 });
                setUsuarios(usuarios.filter(u => u.USR_id_usuario !== usuario.USR_id_usuario));
            })
            .catch(error => {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario', life: 3000 });
            });
    };

    return (
        <div>
            <h2 className="p-text-center">Lista de Usuarios</h2>
            <Toast ref={toast} />
            <Button label="Agregar" icon="pi pi-plus" className="p-button-success p-mb-3" onClick={abrirFormularioAgregar} />

            <DataTable value={usuarios} loading={loading} paginator rows={10} responsiveLayout="scroll">
                <Column field="USR_nombre" header="Nombre" sortable />
                <Column field="USR_correo" header="Correo" sortable />
                <Column field="USR_rol" header="Rol" sortable />
                <Column field="USR_estado" header="Estado" sortable />
                <Column header="Acciones" body={(rowData) => (
                    <>
                        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => abrirFormularioEditar(rowData)} />
                        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDelete(rowData)} />
                    </>
                )} />
            </DataTable>

            <Dialog header={modoEdicion ? "Editar Usuario" : "Agregar Usuario"} visible={mostrarDialogo} style={{ width: '30vw' }} modal onHide={() => setMostrarDialogo(false)}>
    <div className="p-fluid">
        <div className="p-field">
            <label htmlFor="USR_nombre">Nombre</label>
            <InputText id="USR_nombre" value={formularioUsuario.USR_nombre} onChange={(e) => setFormularioUsuario({ ...formularioUsuario, USR_nombre: e.target.value })} />
        </div>
        <div className="p-field">
            <label htmlFor="USR_correo">Correo</label>
            <InputText id="USR_correo" value={formularioUsuario.USR_correo} onChange={(e) => setFormularioUsuario({ ...formularioUsuario, USR_correo: e.target.value })} />
        </div>
        <div className="p-field">
            <label htmlFor="USR_contraseña">Contraseña</label>
            <InputText id="USR_contraseña" type="password" value={formularioUsuario.USR_contraseña} onChange={(e) => setFormularioUsuario({ ...formularioUsuario, USR_contraseña: e.target.value })} />
        </div>
        <div className="p-field">
            <label htmlFor="USR_rol">Rol</label>
            <Dropdown id="USR_rol" value={formularioUsuario.USR_rol} options={["Administrador", "Usuario"]} onChange={(e) => setFormularioUsuario({ ...formularioUsuario, USR_rol: e.value })} placeholder="Seleccione un rol" />
        </div>
        <div className="p-field">
            <label htmlFor="USR_estado">Estado</label>
            <Dropdown id="USR_estado" value={formularioUsuario.USR_estado} options={["Activo", "Inactivo"]} onChange={(e) => setFormularioUsuario({ ...formularioUsuario, USR_estado: e.value })} placeholder="Seleccione estado" />
        </div>
        <Button label="Guardar" icon="pi pi-check" className="p-mt-2" onClick={guardarUsuario} />
    </div>
</Dialog>

        </div>
    );
}

export default Usuarios;
*/