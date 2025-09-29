import { Box, Typography, Stack } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { NavLink, useLocation } from 'react-router-dom';
import './footer.css';

const navLinks = [
  { to: '/productos', label: 'Productos' },
  { to: '/mis-compras', label: 'Mis Compras' },
  { to: '/mis-resenas', label: 'Mis Reseñas' },
  { to: '/perfil', label: 'Perfil' },
  { to: '/about-us', label: 'Sobre Nosotros' },
];

export default function Footer() {
  const location = useLocation();

  // Función para marcar Productos como activo también en /producto y /producto/:id
  const isProductosActive = () => {
    return (
      location.pathname.startsWith('/producto')
    );
  };

  return (
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
            {navLinks.slice(1).map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => isActive ? 'footer-link active-footer-link' : 'footer-link'}
              >
                {link.label}
              </NavLink>
            ))}
          </Box>
        </Box>
        {/* Derecha: Marca y copyright */}
        <Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', md: 'center' }} minWidth={180} sx={{ alignSelf: 'center' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Portal Videojuegos</Typography>
          <Typography variant="caption" color="grey.400">&copy; 2025 Todos los derechos reservados</Typography>
        </Box>
      </Box>
    </Box>
  );
}
