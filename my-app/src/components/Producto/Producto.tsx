import { useEffect, useRef, useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Card, CardContent, Button, Chip, Avatar, Rating } from '@mui/material'
import { ArrowBack, CloudDownload, Person } from '@mui/icons-material'
import NavBar from '../navBar/navBar'
import { Link, useLocation } from 'react-router-dom'
import { productService, type JuegoDetail, type ServicioDetail, type ComplementoDetail } from '../../services/productService'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#141926', paper: '#1e2532' },
    primary: { main: '#4a90e2' },
    text: { primary: '#ffffff', secondary: '#b0b0b0' },
  },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundColor: '#1e2532', borderRadius: 12 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } },
  },
})

type Review = { id: number; user: string; rating: number; date: string; comment: string }

type ProductoTipo = 'juego' | 'servicio' | 'complemento'

type ProductoData = JuegoDetail | ServicioDetail | ComplementoDetail

export default function Producto() {
  const reviewsRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navState = location.state as { id?: number; tipo?: ProductoTipo } | null

  const [tipo, setTipo] = useState<ProductoTipo | null>(null)
  const [id, setId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProductoData | null>(null)

  useEffect(() => {
    const search = new URLSearchParams(location.search)
    const qTipo = search.get('tipo') as ProductoTipo | null
    const qId = search.get('id') ? Number(search.get('id')) : null
    const stTipo = navState?.tipo ?? qTipo
    const stId = typeof navState?.id === 'number' ? navState!.id : qId
    if (!stTipo || !stId) {
      setError('Producto no especificado')
      return
    }
    setTipo(stTipo)
    setId(stId)
  }, [location, navState])

  useEffect(() => {
    const load = async () => {
      if (!tipo || !id) return
      try {
        setLoading(true)
        setError(null)
        let res: ProductoData
        if (tipo === 'juego') res = await productService.getJuego(id)
        else if (tipo === 'servicio') res = await productService.getServicio(id)
        else res = await productService.getComplemento(id)
        setData(res)
      } catch (e) {
        console.error(e)
        setError('No se pudo cargar el producto')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tipo, id])

  const reviews: Review[] = [
    { id: 1, user: 'GamerPro2024', rating: 5, date: '21 oct 2024', comment: 'Excelente juego.' },
    { id: 2, user: 'JuanCarlos88', rating: 4, date: '15 may 2024', comment: 'Muy bueno, lo recomiendo.' },
    { id: 3, user: 'TechGamer', rating: 5, date: '02 ago 2024', comment: 'Rinde bárbaro en mi PC.' },
  ]

  const goReviews = () => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
            {/* Left - media */}
            <Box>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<ArrowBack />}
                  sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}
                >
                  Volver
                </Button>
                <Box component="img" src={'/vite.svg'} alt="Producto" sx={{ width: '100%', height: 400, objectFit: 'contain', borderRadius: 2, p: 6, bgcolor: '#0f1625' }} />
                {tipo && <Chip label={tipo} color="primary" sx={{ position: 'absolute', right: 16, top: 56 }} />}
              </Box>
            </Box>

            {/* Right - details */}
            <Box>
              {error && (
                <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>
              )}
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {loading ? 'Cargando…' : (data?.nombre ?? 'Producto')}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>{data?.compania?.nombre ?? ''}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Button onClick={goReviews} variant="text" color="inherit" sx={{ p: 0, minWidth: 0 }}>
                  <Rating name="read-only" value={5} readOnly />
                </Button>
                <Typography>4.6</Typography>
                <Typography color="text.secondary">847K ratings</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
                <Typography variant="h4" fontWeight={800}>{data?.monto === 0 ? 'Gratuito' : `US$${data?.monto ?? ''}`}</Typography>
              </Box>

              <Button fullWidth variant="contained" color="warning" sx={{ py: 1.5, fontWeight: 700 }}>
                Comprar
              </Button>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography color="text.secondary">Disponible</Typography>
                  <Typography>06/11/2022</Typography>
                </Box>

                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" color="disabled" />
                    <Typography>Juego offline activado</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" color="disabled" />
                    <Typography>1 jugador</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudDownload fontSize="small" color="disabled" />
                    <Typography>(plataforma)</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Descripción */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Descripción
            </Typography>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{data?.detalle ?? 'Sin descripción'}</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Características */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Características
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              {tipo === 'juego' && data && 'fechaLanzamiento' in data && (
                <Card>
                  <CardContent>
                    <Typography fontWeight={600} gutterBottom>Información</Typography>
                    {'fechaLanzamiento' in data && (data as JuegoDetail).fechaLanzamiento && (
                      <Typography color="text.secondary">Lanzamiento: {new Date((data as JuegoDetail).fechaLanzamiento).toLocaleDateString()}</Typography>
                    )}
                    {'edadPermitida' in data && typeof (data as JuegoDetail).edadPermitida === 'number' && (
                      <Typography color="text.secondary">Edad permitida: {(data as JuegoDetail).edadPermitida}+</Typography>
                    )}
                    {Array.isArray((data as JuegoDetail).categorias) && (data as JuegoDetail).categorias.length > 0 && (
                      <Typography color="text.secondary">Categorías: {(data as JuegoDetail).categorias.map((c) => c.nombre).join(', ')}</Typography>
                    )}
                  </CardContent>
                </Card>
              )}
              {tipo === 'servicio' && data && (
                <Card>
                  <CardContent>
                    <Typography fontWeight={600} gutterBottom>Información</Typography>
                    {Array.isArray((data as ServicioDetail).categorias) && (data as ServicioDetail).categorias.length > 0 && (
                      <Typography color="text.secondary">Categorías: {(data as ServicioDetail).categorias.map((c) => c.nombre).join(', ')}</Typography>
                    )}
                  </CardContent>
                </Card>
              )}
              {tipo === 'complemento' && data && (
                <Card>
                  <CardContent>
                    <Typography fontWeight={600} gutterBottom>Información</Typography>
                    {'juego' in data && (data as ComplementoDetail).juego && (
                      <Typography color="text.secondary">Juego: {(data as ComplementoDetail).juego.nombre}</Typography>
                    )}
                    {Array.isArray((data as ComplementoDetail).categorias) && (data as ComplementoDetail).categorias.length > 0 && (
                      <Typography color="text.secondary">Categorías: {(data as ComplementoDetail).categorias.map((c) => c.nombre).join(', ')}</Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>

          {/* Opiniones */}
          <Box sx={{ mt: 6 }} ref={reviewsRef}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Opiniones del producto
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              {reviews.map((r) => (
                <Card key={r.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar>{r.user[0]}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Rating size="small" value={r.rating} readOnly />
                          <Typography color="text.secondary" variant="caption">{r.date}</Typography>
                        </Box>
                        <Typography fontWeight={600}>{r.user}</Typography>
                        <Typography color="text.secondary">{r.comment}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
