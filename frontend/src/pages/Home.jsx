import React from 'react';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos de PrimeReact

const Home = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Bienvenido al Sistema de Gestión Contable</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px' }}>
        Selecciona una de las opciones para continuar:
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <Button
          label="Ver Balance de Saldos"
          icon="pi pi-table"
          className="p-button p-button-primary p-button-lg"
          onClick={() => window.location.href = '/Balance'}
        />
        <Button
          label="Ver Cuenta Contable"
          icon="pi pi-book"
          className="p-button p-button-primary p-button-lg"
          onClick={() => window.location.href = '/Cuenta'}
        />
      </div>
    </div>
  );
};

export default Home;