import { useEffect, useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Card, CardContent, Button, Alert, CircularProgress } from '@mui/material'
import NavBar from '../navBar/navBar'
import { useLocation, useNavigate } from 'react-router-dom'
import { startCheckout, simulateSuccess, type TipoProducto } from '../../services/checkoutService'

const darkTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#141926', paper: '#1e2532' }, primary: { main: '#4a90e2' } },
  components: { MuiCard: { styleOverrides: { root: { backgroundColor: '#1e2532', borderRadius: 12 } } } },
})

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { tipo, id, nombre, precio } = (location.state || {}) as { tipo: TipoProducto; id: number; nombre?: string; precio?: number }

  const [sessionId, setSessionId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'pending' | 'paid' | 'cancelled'>('pending')
  const [ventaId, setVentaId] = useState<number | undefined>(undefined)

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
      // NOTA: Pago simulado. Reemplazamos luego por redirección a Mercado Pago
      const r = await simulateSuccess(sessionId)
      setStatus(r.status)
      setVentaId(r.venta.id)
    } catch (e: unknown) {
      const err = e as Error
      setError(err?.message || 'No se pudo confirmar el pago')
    } finally {
      setLoading(false)
    }
  }

  const goMisCompras = () => navigate('/mis-compras')

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
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>{nombre || `${tipo} #${id}`}</Typography>
                <Typography fontWeight={700}>{typeof precio === 'number' ? `US$${precio}` : '-'}</Typography>
              </Box>
            </CardContent>
          </Card>

          {status === 'pending' && (
            <>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Esta es una simulación de pago. Proximamente se redireccionará a la pasarela (Mercado Pago).
              </Typography>
              <Button variant="contained" fullWidth disabled={!sessionId || loading} onClick={handleSimulatePay}>
                {loading ? <CircularProgress size={20} /> : 'Simular pago y confirmar compra'}
              </Button>
            </>
          )}

          {status === 'paid' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ¡Pago confirmado! Tu compra fue registrada. Verifica "Mis compras" para ver tu código de activación.
              {ventaId ? ` (Venta #${ventaId})` : ''}
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>Volver</Button>
            <Button variant="contained" onClick={goMisCompras}>Ir a Mis compras</Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
