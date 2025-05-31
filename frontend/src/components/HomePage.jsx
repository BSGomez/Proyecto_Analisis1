// src/components/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Estilos locales
import './HomePage.css';
import { Card } from 'primereact/card';
// Chart.js auto import necesario para primereact chart
import 'chart.js/auto';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  // Simular carga de datos
  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalCuentas: 120,
        movimientosHoy: 45,
        usuariosActivos: 8,
        // datos para gráfico de balance
        balanceData: {
          labels: ['Ingresos', 'Gastos'],
          datasets: [{
            data: [30000, 12000],
            backgroundColor: ['#42A5F5', '#FFA726']
          }]
        }
      });
    }, 500);
  }, []);

  if (!stats) {
    return <div className="p-d-flex p-jc-center p-ai-center" style={{height:'60vh'}}><ProgressSpinner /></div>;
  }

  return (
    <div className="p-grid p-m-4 homepage-container">
      {/* Bienvenida y fecha */}
      <div className="p-col-12">
        <Card className="welcome-card">
          <h2>Bienvenido de nuevo</h2>
          <p>{new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</p>
        </Card>
      </div>

      {/* Estadísticas rápidas */}
      <div className="p-col-12 p-md-4">
        <Card className="stat-card" title="Total de Cuentas">
          <h3>{stats.totalCuentas}</h3>
        </Card>
      </div>
      <div className="p-col-12 p-md-4">
        <Card className="stat-card" title="Movimientos Hoy">
          <h3>{stats.movimientosHoy}</h3>
        </Card>
      </div>
      <div className="p-col-12 p-md-4">
        <Card className="stat-card" title="Usuarios Activos">
          <h3>{stats.usuariosActivos}</h3>
        </Card>
      </div>

      {/* Gráfico de Balance */}
      <div className="p-col-12 p-md-6">
        <Card className="chart-card" title="Distribución de Balance">
          <div className="chart-wrapper">
            <Chart 
              type="doughnut" 
              data={stats.balanceData} 
              className="balance-chart"
            />
          </div>
        </Card>
      </div>

      {/* Accesos directos */}
      <div className="p-col-12 p-md-6">
        <Card className="shortcut-card" title="Accesos Rápidos">
          <div className="p-grid p-nogutter shortcuts">
            <div className="p-col-6 shortcut" onClick={() => navigate('/catalogo-cuentas')}>
              <i className="pi pi-table shortcut-icon" />
              <span>Catálogo Cuentas</span>
            </div>
            <div className="p-col-6 shortcut" onClick={() => navigate('/libro-mayor')}>
              <i className="pi pi-book shortcut-icon" />
              <span>Libro Mayor</span>
            </div>
            <div className="p-col-6 shortcut" onClick={() => navigate('/balance')}>
              <i className="pi pi-chart-line shortcut-icon" />
              <span>Balance</span>
            </div>
            <div className="p-col-6 shortcut" onClick={() => navigate('/login-page')}>
              <i className="pi pi-sign-in shortcut-icon" />
              <span>Login</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
