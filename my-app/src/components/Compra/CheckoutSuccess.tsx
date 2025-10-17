import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Card, CardContent, Button, Chip, Alert, CircularProgress } from '@mui/material'
import NavBar from '../navBar/navBar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { mpConfirm, mpResult, getVenta } from '../../services/checkoutService'
import { mailService } from '../../services/mailService'
import Footer from '../footer/footer.tsx'


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
      } catch (e: any) {
        const err = e as Error
        if (e.status === 404) setError('No se pudo recuperar una venta con ese identificador')
          else setError(err?.message || 'No se pudo confirmar el pago')
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

  // Enviar mail de confirmación de compra al usuario una sola vez
  const [mailSent, setMailSent] = useState(false);
  useEffect(() => {
    if (mailSent) return;
    if (!venta || !venta.codActivacion) return;
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    } catch { /* empty */ }
    const email = user?.mail;
    const nombre = user?.nombre;
    const producto = state?.nombre || persisted?.nombre || `${(state?.tipo ?? persisted?.tipo) || '—'} #${(state?.id ?? persisted?.id) ?? '—'}`;
    const codigo = venta.codActivacion;
    if (email && nombre && producto && codigo) {
      mailService.paymentConfirmation(email, nombre, producto, codigo)
        .then(() => setMailSent(true))
        .catch(() => {});
    }
  }, [venta, mailSent, state?.nombre, state?.tipo, state?.id, persisted?.nombre, persisted?.tipo, persisted?.id]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <NavBar />
        <Container maxWidth="sm" sx={{ py: 4, mt: 8 }}>
          {!error ? (
            <>
              <Typography variant="h4" fontWeight={700} gutterBottom>¡Compra exitosa!</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>Gracias por tu compra. Aquí está tu comprobante.</Typography>
              {(() => {
                const tipo = ((state?.tipo ?? persisted?.tipo ?? '').toLowerCase());
                if (tipo === 'juego' || tipo === 'complemento') {
                  return <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>Recuerda: los Juegos y Complementos se canjean en el apartado Canjear Productos de Steam</Typography>;
                }
                if (tipo === 'servicio') {
                  return <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>Recuerda dirigirte a la página del servicio adquirido y canjear este código en el apartado Canjear Productos</Typography>;
                }
                return null;
              })()}
            </>
          ) : (
            <>
              <Typography variant="h4" fontWeight={700} gutterBottom>Ocurrió un error en tu compra</Typography>
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              {noParams && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No recibimos identificadores de pago en la URL. Si venís de Mercado Pago, verificá que el pago haya finalizado y que el botón “Volver al sitio” te redirija aquí.
                </Alert>
              )}
            </>
          )}

          {noParams && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No recibimos identificadores de pago en la URL. Si venís de Mercado Pago, verificá que el pago haya finalizado y que el botón “Volver al sitio” te redirija aquí.
            </Alert>
          )}

          {!error && (<Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Box component="img" src={state.imageUrl || persisted?.imageUrl || '/vite.svg'} alt={state.nombre || persisted?.nombre || 'Producto'} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/vite.svg' }} sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 2, bgcolor: '#0f1625' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700}>{state?.nombre || persisted?.nombre || `${(state?.tipo ?? persisted?.tipo) || '—'} #${(state?.id ?? persisted?.id) ?? '—'}`}</Typography>
                    <Typography color="text.secondary">{((state?.tipo ?? persisted?.tipo ?? '—') as string).charAt(0).toUpperCase() + ((state?.tipo ?? persisted?.tipo ?? '—') as string).slice(1)}</Typography>
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
          </Card>)}

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mt: 3,
              width: '100%',
              alignItems: 'stretch',
              justifyContent: 'center',
            }}
          >
              {/* En mobile: Inicio arriba, Mis compras abajo. En desktop: Mis compras izquierda, Inicio derecha */}
              <Button
                variant="outlined"
                onClick={() => navigate('/mis-compras')}
                sx={{
                  fontSize: { xs: 15, sm: 16 },
                  py: { xs: 1.2, sm: 1.5 },
                  px: { xs: 0, sm: 2 },
                  width: { xs: '100%', sm: 'auto' },
                  fontWeight: 600,
                  borderWidth: 2,
                  borderRadius: 2,
                  order: { xs: 2, sm: 1 },
                }}
              >
                Mis compras
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{
                  fontSize: { xs: 15, sm: 16 },
                  py: { xs: 1.2, sm: 1.5 },
                  px: { xs: 0, sm: 2 },
                  width: { xs: '100%', sm: 'auto' },
                  fontWeight: 600,
                  borderRadius: 2,
                  order: { xs: 1, sm: 2 },
                }}
              >
                Ir al inicio
              </Button>
          </Box>
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  )
}
