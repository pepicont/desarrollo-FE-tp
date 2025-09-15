import { useEffect, useRef, useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Card, CardContent, Button, Chip, Avatar, Rating, Alert } from '@mui/material'
import { ArrowBack, Person, CalendarMonth, Category } from '@mui/icons-material'
import NavBar from '../navBar/navBar'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { productService, type JuegoDetail, type ServicioDetail, type ComplementoDetail, type Foto } from '../../services/productService'
import { getReviewsByProduct, type ProductReview } from '../../services/reseniasService'

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
  const navigate = useNavigate()

  const [tipo, setTipo] = useState<ProductoTipo | null>(null)
  const [id, setId] = useState<number | null>(null)
  
  useEffect(() => {
    const search = new URLSearchParams(location.search)
    const qTipo = search.get('tipo') as ProductoTipo | null
    const qId = search.get('id') ? Number(search.get('id')) : null
    const stTipo = (location.state as { id?: number; tipo?: ProductoTipo } | null)?.tipo ?? qTipo
    const stId = typeof (location.state as { id?: number; tipo?: ProductoTipo } | null)?.id === 'number'
      ? (location.state as { id?: number; tipo?: ProductoTipo })!.id
      : qId
    if (!stTipo || !stId) {
      setError('Producto no especificado')
      return
    }
    setTipo(stTipo)
    setId(stId)
  }, [location])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProductoData | null>(null)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [displayImage, setDisplayImage] = useState<string>('/vite.svg')
  const imageTimeoutRef = useRef<number | null>(null)
  
  const fotos: Foto[] = (
    (tipo === 'juego' && data && 'fotos' in (data as JuegoDetail) ? (data as JuegoDetail).fotos : undefined) ||
    (tipo === 'servicio' && data && 'fotos' in (data as ServicioDetail) ? (data as ServicioDetail).fotos : undefined) ||
    (tipo === 'complemento' && data && 'fotos' in (data as ComplementoDetail) ? (data as ComplementoDetail).fotos : undefined) ||
    []
  ) as Foto[]

  
  useEffect(() => {
    if (!heroImage) {
      setDisplayImage('/vite.svg')
      return
    }
    let cancelled = false
    const img = new Image()

    
    if (imageTimeoutRef.current) window.clearTimeout(imageTimeoutRef.current)
    imageTimeoutRef.current = window.setTimeout(() => {
      if (!cancelled) setDisplayImage('/vite.svg')
    }, 2000) 

    img.onload = () => {
      if (cancelled) return
      if (imageTimeoutRef.current) window.clearTimeout(imageTimeoutRef.current)
      setDisplayImage(heroImage)
    }
    img.onerror = () => {
      if (cancelled) return
      if (imageTimeoutRef.current) window.clearTimeout(imageTimeoutRef.current)
      setDisplayImage('/vite.svg')
    }
    img.src = heroImage

    return () => {
      cancelled = true
      if (imageTimeoutRef.current) window.clearTimeout(imageTimeoutRef.current)
    }
  }, [heroImage])

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
        // Elegir imagen principal del producto si existe
        const fotos: Foto[] | undefined =
          (tipo === 'juego' && (res as JuegoDetail).fotos) ||
          (tipo === 'servicio' && (res as ServicioDetail).fotos) ||
          (tipo === 'complemento' && (res as ComplementoDetail).fotos) ||
          undefined
        if (Array.isArray(fotos) && fotos.length > 0) {
          const principal = fotos.find(f => f.esPrincipal)
          setHeroImage((principal ?? fotos[0]).url)
        } else {
          setHeroImage(null)
        }
        // cargar reseñas reales
        const revs = await getReviewsByProduct(tipo, id)
        setReviews(revs)
      } catch (e) {
        console.error(e)
        setError('No se pudo cargar el producto')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tipo, id])

  const reviewsUi: Review[] = reviews.map(r => ({
    id: r.id,
    user: r.usuario?.nombreUsuario ?? 'Usuario',
    rating: r.puntaje,
    date: new Date(r.fecha).toLocaleDateString(),
    comment: r.detalle,
  }))

  const avgRating = reviews.length
    ? Number((reviews.reduce((acc, r) => acc + (r.puntaje || 0), 0) / reviews.length).toFixed(1))
    : 0

  const goReviews = () => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <NavBar />
        {error ? (
          <Container maxWidth="sm" sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <Alert severity="error" sx={{ fontSize: 20, mb: 4, p: 4, textAlign: 'center' }}>
              En este momento este producto no está disponible.
            </Alert>
            <Button variant="contained" color="primary" size="large" onClick={() => navigate('/productos')}>
              Reintentar
            </Button>
          </Container>
        ) : (
          <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
            {/* ...todo el contenido original aquí... */}
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
                  <Box
                    component="img"
                    src={displayImage}
                    alt={data?.nombre ?? 'Producto'}
                    sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 2, bgcolor: '#0f1625', display: 'block' }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/vite.svg' }}
                  />
                  {tipo && (
                    <Chip
                      label={tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      color="primary"
                      sx={{ position: 'absolute', right: 16, top: 16, zIndex: 1 }}
                    />
                  )}
                </Box> 
                {/* Mini galería de thumbnails */}
                {fotos && fotos.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      overflowX: 'auto',
                      pb: 1,
                      px: 0.5,
                      scrollPaddingLeft: 8,
                      '&::-webkit-scrollbar': { height: 6 },
                      '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
                    }}
                  >
                    {fotos.map((f) => {
                      const isSelected = !!heroImage && f.url === heroImage
                      return (
                        <Box
                          key={f.id}
                          onClick={() => setHeroImage(f.url)}
                          sx={{
                            width: 88,
                            height: 56,
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                            border: isSelected ? '2px solid' : '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.2)',
                            opacity: isSelected ? 1 : 0.85,
                            transition: 'opacity .15s ease, outline-color .15s ease',
                            '&:hover': { opacity: 1 },
                            flex: '0 0 auto',
                            backgroundColor: '#0f1625',
                          }}
                        >
                          <Box
                            component="img"
                            src={f.url}
                            alt="thumbnail"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/vite.svg' }}
                          />
                        </Box>
                      )
                    })}
                  </Box>
                )}
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
                    <Rating name="read-only" value={avgRating} precision={0.5} readOnly />
                  </Button>
                  <Typography>{avgRating ? avgRating.toFixed(1) : '-'}</Typography>
                  <Typography color="text.secondary">{reviews.length} opiniones</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
                  <Typography variant="h4" fontWeight={800}>{data?.monto === 0 ? 'Gratuito' : `US$${data?.monto ?? ''}`}</Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  sx={{ py: 1.5, fontWeight: 700 }}
                  onClick={() => {
                    if (!tipo || !id) return
                    navigate('/checkout', { state: { tipo, id, nombre: data?.nombre, precio: data?.monto, imageUrl: displayImage } })
                  }}
                >
                  Comprar
                </Button>

                <Box sx={{ mt: 3 }}>


                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonth fontSize="small" color="disabled" />
                      <Typography>Lanzado el {data && 'fechaLanzamiento' in data && (data as JuegoDetail).fechaLanzamiento ? new Date((data as JuegoDetail).fechaLanzamiento).toLocaleDateString() : '(fecha)'}</Typography>
                      
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" color="disabled" />
                      <Typography>Edad permitida: {data && 'edadPermitida' in data && typeof (data as JuegoDetail).edadPermitida === 'number' ? (data as JuegoDetail).edadPermitida + '+' : '(edad)+'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category fontSize="small" color="disabled" />
                      <Typography>{data && Array.isArray(data.categorias) && data.categorias.length > 0 ? data.categorias.map(c => c.nombre).join(', ') : '(categorias)'}</Typography>
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
                Información sobre el producto
              </Typography>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr', maxWidth: 600, minWidth: 0, width: '100%', mx: 'auto', textAlign: 'center' }}>
                {tipo === 'juego' && data && 'fechaLanzamiento' in data && (
                  <Card>
                    <CardContent>
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
                      {Array.isArray((data as ServicioDetail).categorias) && (data as ServicioDetail).categorias.length > 0 && (
                        <Typography color="text.secondary">Categorías: {(data as ServicioDetail).categorias.map((c) => c.nombre).join(', ')}</Typography>
                      )}
                    </CardContent>
                  </Card>
                )}
                {tipo === 'complemento' && data && (
                  <Card>
                    <CardContent>
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
                {reviewsUi.length === 0 && (
                  <Typography color="text.secondary">Aún no hay opiniones para este producto.</Typography>
                )}
                {reviewsUi.map((r) => (
                  <Card key={r.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar>{r.user?.[0] ?? '?'}</Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Rating size="small" value={r.rating} readOnly />
                            <Typography color="text.secondary" variant="caption">{r.date}</Typography>
                          </Box>
                          <Box sx={{ mb: 0.5, textAlign: 'left' }}>
                            <Typography fontWeight={600}>@{r.user} dijo:</Typography>
                          </Box>
                          <Typography color="text.secondary">{r.comment}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Container>
        )}
      </Box>
    </ThemeProvider>
  )
}
