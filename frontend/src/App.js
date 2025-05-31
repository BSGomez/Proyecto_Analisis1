import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// PrimeReact imports
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { Menubar } from 'primereact/menubar';

// Tus componentes
import LibroMayor from './components/LibroMayor';
import CatalogoCuentas from './components/CuentasContablesTable';
import Balance from './components/Balance';
import LibroDiario from './components/LibroDiario';
import LoginPage from './components/LoginPage';
import EstadoResultados from './components/EstadoResultados';
import HomePage from './components/HomePage';
import Polizas from './components/Polizas';
import Ajustes from './components/Ajustes';
import EstadosFinancieros from './components/EstadosFinancieros';
import Cuenta from "./pages/Cuenta";

function App() {
  const navigate = useNavigate();

  // Items del menú
  const items = [
    { label: 'Catálogo Cuentas', icon: 'pi pi-table', command: () => navigate('/catalogo-cuentas') },
    { label: 'Poliza', icon: 'pi pi-file-edit', command: () => navigate('/Polizas') },
    { label: 'Libro Diario', icon: 'pi pi-book', command: () => navigate('/libro-diario') },
    { label: 'Libro Mayor', icon: 'pi pi-book', command: () => navigate('/libro-mayor') },
    { label: 'Balance', icon: 'pi pi-chart-line', command: () => navigate('/balance') },
    { label: 'Estado Resultados', icon: 'pi pi-chart-bar', command: () => navigate('/estado-resultados') },
    { label: 'Login', icon: 'pi pi-sign-in', command: () => navigate('/Ajustes') },
    { label: 'Login', icon: 'pi pi-sign-in', command: () => navigate('/login-page') },
    { label: 'Estados Financieros', icon: 'pi pi-money-bill', command: () => navigate('/estados-financieros') },
    
    
  ];

  // Logo o título clicable
  const start = (
    <span className="p-menubar-start" style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/home-page')}>Mi App Contable</span>
  );

  // No hay sidebar externo: el menú superior es suficiente
  return (
    <>
      <Menubar model={items} start={start} />
      <div className="p-m-4">
        <Routes>
          <Route path="/" element={<h2>Bienvenido a tu aplicación contable</h2>} />
          <Route path="/home-page" element={<HomePage />} />
          <Route path="/catalogo-cuentas" element={<CatalogoCuentas />} />
          <Route path="/libro-mayor" element={<LibroMayor />} />
          <Route path="/libro-diario" element={<LibroDiario />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/estado-resultados" element={<EstadoResultados />} />
          <Route path="/login-page" element={<LoginPage />} />
          <Route path="/polizas" element={<Polizas />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="/estados-financieros" element={<EstadosFinancieros />} />
          <Route path="/cuenta" element={<Cuenta />} />
        </Routes>
      </div>
    </>
  );
}

// Envolver App en Router
export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
