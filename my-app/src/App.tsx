import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './components/home/home.tsx';
import SignIn from './components/sign-in/SignIn.tsx';
import SignUp from './components/sing-up/SingUp.tsx';
import MisCompras from './components/misCompras/misCompras.tsx'
import Producto from './components/Producto/Producto.tsx'
import Checkout from './components/Compra/Checkout.tsx'
import CheckoutSuccess from './components/Compra/CheckoutSuccess.tsx'
import MisResenias from './components/Mis resenias/MisResenias.tsx'
import Profile from './components/Profile/Profile.tsx'
import BuscarProductos from './components/BuscarProductos/BuscarProductos.tsx'
import AboutUs from './components/aboutUs/aboutUs.tsx';
import AdminUsuarios from './components/admin/AdminUsuarios.tsx';
import AdminResenias from './components/admin/AdminResenias.tsx';
import AdminCompanias from './components/admin/AdminCompanias.tsx';
import ProtectedRoute from './components/shared-theme/ProtectedRoute.tsx';
import ProtectedAdminRoute from './components/shared-theme/ProtectedAdminRoute.tsx';



function App() {
  return (
      <Router>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/mis-compras" element={
          <ProtectedRoute>
            <MisCompras />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/checkout/success" element={
          <ProtectedRoute>
            <CheckoutSuccess />
          </ProtectedRoute>
        } />
        <Route path="/producto" element={<Producto />} />
        <Route path="/productos" element={<BuscarProductos />} />
        <Route path="/mis-resenas" element={
          <ProtectedRoute>
            <MisResenias />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/admin/usuarios" element={
          <ProtectedAdminRoute>
            <AdminUsuarios />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/resenias" element={
          <ProtectedAdminRoute>
            <AdminResenias />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/companias" element={
          <ProtectedAdminRoute>
            <AdminCompanias />
          </ProtectedAdminRoute>
        } />
      </Routes>
      </Router>
    
  );
}
export default App;




