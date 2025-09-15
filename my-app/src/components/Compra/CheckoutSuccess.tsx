import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Card, CardContent, Button, Chip, Alert, CircularProgress } from '@mui/material'
import NavBar from '../navBar/navBar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { mpConfirm, mpResult, getVenta } from '../../services/checkoutService'

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

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [venta, setVenta] = useState<{ id: number; codActivacion: string } | null>(null)
  const [noParams, setNoParams] = useState(false)

  // Si volvemos desde Mercado Pago, vendrá venta_id y/o payment_id/collection_id en la URL.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const ventaIdStr = params.get('venta_id')
    const paymentId = params.get('payment_id') || params.get('collection_id')
    if (!paymentId && !ventaIdStr) {
      setNoParams(true)
      return
    }
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        // 1) Si tenemos venta_id, pedimos la venta directa
        if (ventaIdStr) {
          const vId = Number(ventaIdStr)
          if (Number.isFinite(vId)) {
            const v = await getVenta(vId)
            setVenta({ id: v.id, codActivacion: v.codActivacion })
            return
          }
        }
        // 2) Si no tenemos venta_id pero sí payment_id, intentamos recuperar el resultado (no requiere auth)
        if (paymentId) {
          const res = await mpResult(paymentId)
          if (res.status === 'paid' && res.venta) {
            setVenta({ id: res.venta.id, codActivacion: res.venta.codActivacion })
            return
          }
          // 3) Fallback autenticado: confirmar explícitamente (requiere token)
          const r = await mpConfirm(paymentId)
          setVenta({ id: r.venta.id, codActivacion: r.venta.codActivacion })
          return
        }
        setError('No se recibieron identificadores válidos')
      } catch (e: unknown) {
        const err = e as Error
        setError(err?.message || 'No se pudo confirmar el pago')
      } finally {
        setLoading(false)
      }
    }
    run()
    // 
  }, [location.search])

  // Cargar detalles de producto desde sessionStorage si no vinieron por state
  const persisted = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('lastCheckout')
      if (!raw) return null
      return JSON.parse(raw) as { tipo?: 'juego' | 'servicio' | 'complemento'; id?: number; nombre?: string; precio?: number; imageUrl?: string; metodoPago?: 'mp' | 'stripe' }
    } catch {
      return null
    }
  }, [])

  // Determinar método de pago mostrado (si venimos de MP, forzamos 'Mercado Pago')
  const methodLabel = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const paymentId = params.get('payment_id')
    if (paymentId || (new URLSearchParams(location.search).get('provider') === 'mp')) return 'Mercado Pago'
    return state.metodoPago === 'mp' ? 'Mercado Pago' : 'Stripe'
  }, [location.search, state.metodoPago])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <NavBar />
        <Container maxWidth="sm" sx={{ py: 4, mt: 8 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>¡Compra exitosa!</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Gracias por tu compra. Aquí está tu comprobante.</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {noParams && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No recibimos identificadores de pago en la URL. Si venís de Mercado Pago, verificá que el pago haya finalizado y que el botón “Volver al sitio” te redirija aquí.
            </Alert>
          )}

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Box component="img" src={state.imageUrl || persisted?.imageUrl || '/vite.svg'} alt={state.nombre || persisted?.nombre || 'Producto'} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/vite.svg' }} sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 2, bgcolor: '#0f1625' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700}>{state?.nombre || persisted?.nombre || `${(state?.tipo ?? persisted?.tipo) || '—'} #${(state?.id ?? persisted?.id) ?? '—'}`}</Typography>
                    <Typography color="text.secondary">{state?.tipo ?? persisted?.tipo ?? '—'}</Typography>
                </Box>
                <Typography fontWeight={800} variant="h6">{typeof state.precio === 'number' ? `US$${state.precio}` : (typeof persisted?.precio === 'number' ? `US$${persisted?.precio}` : '-')}</Typography>
              </Box>

              <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                <Typography color="text.secondary">Fecha: {fechaStr}</Typography>
                <Typography color="text.secondary">Método de pago: {methodLabel}</Typography>
                {(venta?.id || state?.ventaId) && (
                  <Typography color="text.secondary">N° de venta: {venta?.id ?? state?.ventaId}</Typography>
                )}
              </Box>

              <Box sx={{ p: 2, bgcolor: '#141926', borderRadius: 2, textAlign: 'center' }}>
                <Typography color="text.secondary" sx={{ mb: 1 }}>Código de activación</Typography>
                {loading ? (
                  <CircularProgress size={22} />
                ) : (
                  <Chip color="primary" variant="outlined" label={venta?.codActivacion || state?.codActivacion || '—'} sx={{ fontFamily: 'monospace', fontSize: 16, py: 2 }} />
                )}
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
