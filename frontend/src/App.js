import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Cuenta from "./pages/Cuenta";
import Balance from "./pages/Balance";
import Home from "./pages/Home";
import CatalogoCuentas from "./pages/CatalogoCuentas";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Balance" element={<Balance />} />
        <Route path="/Cuenta" element={<Cuenta />} />
        <Route path="/CatalogoCuentas" element={<CatalogoCuentas />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
