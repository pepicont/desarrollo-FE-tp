import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Card, CardContent, Button, Chip } from '@mui/material'
import NavBar from '../navBar/navBar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'

const darkTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#141926', paper: '#1e2532' }, primary: { main: '#4a90e2' } },
  components: { MuiCard: { styleOverrides: { root: { backgroundColor: '#1e2532', borderRadius: 12 } } } },
})

export default function CheckoutSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state || {}) as {
    ventaId?: number
    codActivacion?: string
    tipo?: 'juego' | 'servicio' | 'complemento'
    id?: number
    nombre?: string
    precio?: number
    imageUrl?: string
    metodoPago?: 'mp' | 'stripe'
  }

  const fechaStr = useMemo(() => new Date().toLocaleString(), [])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <NavBar />
        <Container maxWidth="sm" sx={{ py: 4, mt: 8 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>¡Compra exitosa!</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Gracias por tu compra. Aquí está tu comprobante.</Typography>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Box component="img" src={state.imageUrl || '/vite.svg'} alt={state.nombre || 'Producto'} sx={{ width: 96, height: 96, objectFit: 'contain', borderRadius: 2, bgcolor: '#0f1625', p: 1 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700}>{state.nombre || `${state.tipo} #${state.id}`}</Typography>
                  <Typography color="text.secondary">{state.tipo}</Typography>
                </Box>
                <Typography fontWeight={800} variant="h6">{typeof state.precio === 'number' ? `US$${state.precio}` : '-'}</Typography>
              </Box>

              <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                <Typography color="text.secondary">Fecha: {fechaStr}</Typography>
                <Typography color="text.secondary">Método de pago: {state.metodoPago === 'mp' ? 'Mercado Pago' : 'Stripe'}</Typography>
                {state.ventaId && (
                  <Typography color="text.secondary">N° de venta: {state.ventaId}</Typography>
                )}
              </Box>

              <Box sx={{ p: 2, bgcolor: '#141926', borderRadius: 2, textAlign: 'center' }}>
                <Typography color="text.secondary" sx={{ mb: 1 }}>Código de activación</Typography>
                <Chip color="primary" variant="outlined" label={state.codActivacion || '—'} sx={{ fontFamily: 'monospace', fontSize: 16, py: 2 }} />
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/mis-compras')}>Mis compras</Button>
            <Button variant="contained" onClick={() => navigate('/')}>Ir al inicio</Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
