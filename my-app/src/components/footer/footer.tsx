import { Box, Typography, Stack } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import './footer.css';


export default function Footer() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const checkAdmin = async () => {
      setIsAdmin(await authService.isAdmin());
    };
    checkAdmin();
  }, []);

  // Función para marcar Productos como activo también en /producto y /producto/:id
  const isProductosActive = () => {
    return (
      location.pathname.startsWith('/producto')
    );
  };

  return (
    <>
      <Box component="div" sx={{ height: 40, pointerEvents: 'none' }} aria-hidden />
      <Box
        component="footer"
        sx={{
          bgcolor: '#000',
          color: '#fff',
          py: 4,
          px: { xs: 2, md: 4 },
          width: '100%',
          mt: 'auto',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.2)',
          overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 4,
            maxWidth: '1200px',
            mx: 'auto',
            width: '100%',
          }}
        >
        {/* Izquierda: Contacto */}
        <Stack spacing={1} sx={{ minWidth: 180, alignSelf: { xs: 'flex-start', md: 'flex-start' } }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon fontSize="small" />
            <Typography variant="body2">+54 11 1234-5678</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon fontSize="small" />
            <Typography variant="body2">info@portalvideojuegos.com</Typography>
          </Box>
        </Stack>
        {/* Centro: Menú */}
        <Box display="flex" flexDirection="column" alignItems="center" flex={1} sx={{ alignSelf: 'center' }}>
          <Box display="flex" gap={3} flexWrap="wrap" justifyContent="center">
            <NavLink
              to="/productos"
              className={({ isActive }) =>
                isProductosActive() || isActive ? 'footer-link active-footer-link' : 'footer-link'
              }
            >
              Productos
            </NavLink>
            {!isAdmin ? (
              <>
                <NavLink to="/mis-compras" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Mis Compras</NavLink>
                <NavLink to="/mis-resenas" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Mis Reseñas</NavLink>
                <NavLink to="/perfil" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Perfil</NavLink>
                <NavLink to="/about-us" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Sobre Nosotros</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/admin/ventas" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Ventas</NavLink>
                <NavLink to="/admin/usuarios" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Usuarios</NavLink>
                <NavLink to="/admin/resenias" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Reseñas</NavLink>
                <NavLink to="/admin/companias" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Compañías</NavLink>
                <NavLink to="/admin/categorias" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Categorías</NavLink>
                <NavLink to="/perfil" className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}>Perfil</NavLink>
              </>
            )}
          </Box>
        </Box>
        {/* Derecha: Marca y copyright */}
          <Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', md: 'center' }} minWidth={180} sx={{ alignSelf: 'center' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Portal Videojuegos</Typography>
          <Typography variant="caption" color="grey.400">&copy; 2025 Todos los derechos reservados</Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
