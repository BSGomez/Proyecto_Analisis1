import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Cuenta from "./pages/Cuenta";
import Balance from "./pages/Balance";
import Home from "./pages/Home";
import CatalogoCuentas from "./pages/CatalogoCuentas";
import LibroDiario from "./pages/LibroDiario";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Balance" element={<Balance />} />
        <Route path="/Cuenta" element={<Cuenta />} />
        <Route path="/CatalogoCuentas" element={<CatalogoCuentas />} />
        <Route path="/LibroDiario" element={<LibroDiario />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
