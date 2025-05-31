import React from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import Polizas from './components/Polizas';

const AppSidebar = ({ visible, setVisible }) => {
  return (
    <>
      <Sidebar visible={visible} onHide={() => setVisible(false)} position="left">
        <h2>Contabilidad</h2>
        <ul className="p-menu-list" style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>
            <Link to="/libro-mayor" className="p-menuitem-link" onClick={() => setVisible(false)}>
              <i className="pi pi-book mr-2" /> Libro Mayor
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to="/catalogo-cuentas" className="p-menuitem-link" onClick={() => setVisible(false)}>
              <i className="pi pi-folder mr-2" /> Catálogo de Cuentas
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to="/balance" className="p-menuitem-link" onClick={() => setVisible(false)}>
              <i className="pi pi-chart-line mr-2" /> Balance de Saldos
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to="/libro-diario" className="p-menuitem-link" onClick={() => setVisible(false)}>
              <i className="pi pi-calendar mr-2" /> Libro Diario
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to="/login-page" className="p-menuitem-link" onClick={() => setVisible(false)}>
              <i className="pi pi-user" /> Login
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
  <Link to="/polizas" className="p-menuitem-link" onClick={() => setVisible(false)}>
    <i className="pi pi-file" /> Pólizas
  </Link>
</li>
<li style={{ marginBottom: '1rem' }}>
    <Link to="/ajustes" className="p-menuitem-link" onClick={() => setVisible(false)}>
      <i className="pi pi-sync mr-2" /> Asientos de Ajuste
    </Link>
  </li>


          
          
        </ul>
      </Sidebar>

      <Button icon="pi pi-bars" onClick={() => setVisible(true)} className="p-button-text p-m-2" />
    </>
  );
};

export default AppSidebar;
