import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './components/home/home.tsx';
import SignIn from './components/sign-in/SignIn.tsx';
import MisCompras from './components/misCompras/misCompras.tsx'
import Compra from './components/Compra/Compra.tsx'
import Producto from './components/Producto/Producto.tsx'
import MisResenias from './components/Mis resenias/MisResenias.tsx'
import Profile from './components/Profile/Profile.tsx'
import BuscarProductos from './components/BuscarProductos/BuscarProductos.tsx'
function App() {
  return (
    
      <Router>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<div>Acerca de nosotros</div>} />
  <Route path="/mis-compras" element={<MisCompras />} />
  <Route path="/compra" element={<Compra />} />
  <Route path="/producto" element={<Producto />} />
  <Route path="/productos" element={<BuscarProductos />} />
  <Route path="/mis-resenas" element={<MisResenias />} />
  <Route path="/perfil" element={<Profile />} />
      </Routes>
      </Router>
    
  );
}
export default App;




