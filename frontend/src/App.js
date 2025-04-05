import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Cuenta from "./pages/Cuenta";
import Balance from "./pages/Balance";
import Home from "./pages/Home";
import Addbalance from "./pages/Addbalance";
import Deletebalance from "./pages/Deletebalance";
import Editbalance from "./pages/Editbalance";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Balance" element={<Balance />} />
        <Route path="/Addbalance" element={<Addbalance />} />
        <Route path="/Deletebalance" element={<Deletebalance />} />
        <Route path="/Editbalance" element={<Editbalance />} />
        <Route path="/Cuenta" element={<Cuenta />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
