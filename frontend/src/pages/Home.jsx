import React from 'react';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos de PrimeReact

const Home = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', backgroundColor: '#F2F3F4', color: '#170E11', padding: '20px' }}>
      <h1 style={{ color: '#20709C' }}>Bienvenido al Sistema de Gestión Contable</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px', color: '#507592' }}>
        Selecciona una de las opciones para continuar:
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <Button
          label="Ver Balance de Saldos"
          icon="pi pi-table"
          className="p-button p-button-primary p-button-lg"
          style={{
            backgroundColor: '#20709C',
            borderColor: '#20709C',
            color: '#F2F3F4',
          }}
          onClick={() => window.location.href = '/Balance'}
        />
        <Button
          label="Ver Cuenta Contable"
          icon="pi pi-book"
          className="p-button p-button-primary p-button-lg"
          style={{
            backgroundColor: '#20709C',
            borderColor: '#507592',
            color: '#F2F3F4',
          }}
          onClick={() => window.location.href = '/Cuenta'}
        />
        <Button
          label="Ver Libro Diario"
          icon="pi pi-book"
          className="p-button p-button-primary p-button-lg"
          style={{
            backgroundColor: '#20709C',
            borderColor: '#507592',
            color: '#F2F3F4',
          }}
          onClick={() => window.location.href = '/LibroDiario'}
        />
        <Button
          label="Ver Estado de Resultados"
          icon="pi pi-chart-line"
          className="p-button p-button-primary p-button-lg"
          style={{
            backgroundColor: '#20709C',
            borderColor: '#507592',
            color: '#F2F3F4',
          }}
          onClick={() => window.location.href = '/EstadoResultados'}
        />
      </div>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          className="p-button p-button-primary"
          style={{
            backgroundColor: '#20709C',
            borderColor: '#20709C',
            color: '#F2F3F4',
            marginTop: '10px',
          }}
          onClick={() => window.location.href = '/'}
        />
      </div>
    </div>
  );
};

export default Home;