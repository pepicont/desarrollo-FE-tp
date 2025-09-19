import { useEffect, useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Card, CardContent, Button, Alert, CircularProgress, Radio, Divider, List, ListItemButton, ListItemAvatar, Avatar, ListItemText } from '@mui/material'
import NavBar from '../navBar/navBar'
import mpLogo from '../../assets/mercadopago.png'
import { useLocation, useNavigate } from 'react-router-dom'
import { startCheckout, simulateSuccess, type TipoProducto, mpStartPreference } from '../../services/checkoutService'
import axios from 'axios'
import Footer from '../footer/footer.tsx'

const darkTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#141926', paper: '#1e2532' }, primary: { main: '#4a90e2' } },
  components: { MuiCard: { styleOverrides: { root: { backgroundColor: '#1e2532', borderRadius: 12 } } } },
})

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { tipo, id, nombre, precio, imageUrl } = (location.state || {}) as { tipo: TipoProducto; id: number; nombre?: string; precio?: number; imageUrl?: string }

  const [sessionId, setSessionId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // estado interno para simular sesión
  const [method, setMethod] = useState<'mp' | 'stripe'>('mp')

  useEffect(() => {
    if (!tipo || !id) {
      setError('Checkout inválido')
      return
    }
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const sess = await startCheckout(tipo, id)
        setSessionId(sess.sessionId)
      } catch (e: unknown) {
        const err = e as Error
        setError(err?.message || 'No se pudo iniciar el checkout')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [tipo, id])

  const handleSimulatePay = async () => {
    if (!sessionId) return
    try {
      setLoading(true)
      setError(null)
      
  const r = await simulateSuccess(sessionId)
      navigate('/checkout/success', {
        state: {
          ventaId: r.venta.id,
          codActivacion: r.venta.codActivacion,
          tipo,
          id,
          nombre,
          precio,
          imageUrl: imageUrl || '/vite.svg',
          metodoPago: method,
        }
      })
    } catch (e: unknown) {
      const isAx = axios.isAxiosError(e)
      const msg = isAx ? (e.response?.data?.message || e.message) : (e as Error)?.message
      const cause = isAx ? e.response?.data?.cause : undefined
      setError(cause ? `${msg} — ${JSON.stringify(cause)}` : (msg || 'No se pudo confirmar el pago'))
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    if (method === 'mp') {
      try {
        setLoading(true)
        setError(null)
        if (!tipo || !id) throw new Error('Checkout inválido')
        if (typeof precio === 'number' && precio <= 0) {
          
          await handleSimulatePay()
          return
        }
        
        try {
          sessionStorage.setItem('lastCheckout', JSON.stringify({ tipo, id, nombre, precio, imageUrl, metodoPago: 'mp' as const }))
        } catch {
          // 
        }
        const pref = await mpStartPreference(tipo, id)
        // Redirigir a Mercado Pago
        window.location.href = pref.init_point
      } catch (e: unknown) {
        const isAx = axios.isAxiosError(e)
        const msg = isAx ? (e.response?.data?.message || e.message) : (e as Error)?.message
        const cause = isAx ? e.response?.data?.cause : undefined
        setError(cause ? `${msg} — ${JSON.stringify(cause)}` : (msg || 'No se pudo iniciar el pago'))
      } finally {
        setLoading(false)
      }
      return
    }
    // 
    await handleSimulatePay()
  }
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <NavBar />
        <Container maxWidth="sm" sx={{ py: 4, mt: 8 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>Checkout</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Resumen</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Box
                  component="img"
                  src={imageUrl || '/vite.svg'}
                  alt={nombre || 'Producto'}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.currentTarget as HTMLImageElement).src = '/vite.svg' }}
                  sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 2, bgcolor: '#0f1625', display: 'block' }}
                />
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography fontWeight={600}>{nombre || `${tipo} #${id}`}</Typography>
                  <Typography color="text.secondary">Tipo: {tipo}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary">Total</Typography>
                  <Typography fontWeight={800} variant="h6">{typeof precio === 'number' ? `US$${precio}` : '-'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Método de pago */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Método de pago</Typography>
              <List sx={{ py: 0 }}>
                <ListItemButton
                  selected={method === 'mp'}
                  onClick={() => setMethod('mp')}
                  sx={{ borderRadius: 1, '&.Mui-selected': { bgcolor: 'rgba(74,144,226,0.08)' } }}
                >
                  <ListItemAvatar>
                    <Avatar variant="rounded" sx={{ bgcolor: 'transparent' }}>
                      <Box component="img" src={mpLogo} alt="Mercado Pago" sx={{ height: 22, width: 'auto' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Mercado Pago" secondary="Tarjeta, débito, efectivo" />
                  <Radio edge="end" checked={method === 'mp'} value="mp" />
                </ListItemButton>
                <Divider component="li" sx={{ my: 0.5, opacity: 0.15 }} />
                <ListItemButton disabled sx={{ borderRadius: 1, opacity: 0.6 }}>
                  <ListItemAvatar>
                    <Avatar variant="rounded">O</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Otro" secondary="Próximamente" />
                  <Radio edge="end" disabled value="stripe" />
                </ListItemButton>
              </List>
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Serás redirigido a Mercado Pago para completar tu compra.
              </Typography>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              gap: 2,
              width: '100%',
              alignItems: 'stretch',
              justifyContent: 'center',
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                fontSize: { xs: 15, sm: 16 },
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 0, sm: 2 },
                width: { xs: '100%', sm: '225px' },
                maxWidth: { sm: '225px' },
                fontWeight: 600,
                borderWidth: 2,
                borderRadius: 2,
              }}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              disabled={loading}
              onClick={handlePay}
              sx={{
                fontSize: { xs: 15, sm: 16 },
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 0, sm: 2 },
                width: { xs: '100%', sm: '225px' },
                maxWidth: { sm: '225px' },
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Pagar'}
            </Button>
          </Box>
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  )
}
