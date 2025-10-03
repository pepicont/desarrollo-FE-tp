import { useEffect, useRef, useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Card, CardContent, Button, Chip, Avatar, Rating, Alert } from '@mui/material'
import { ArrowBack, Person, CalendarMonth, Category, Edit } from '@mui/icons-material'
import NavBar from '../navBar/navBar'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { productService, type JuegoDetail, type ServicioDetail, type ComplementoDetail, type Foto } from '../../services/productService'
import { getReviewsByProduct, type ProductReview } from '../../services/reseniasService'
import ModernPagination from '../shared-components/ModernPagination'
import { authService } from '../../services/authService'
import Footer from '../footer/footer'

const ESRB_RATING_LABELS: Record<number, string> = {
  0: 'E (Everyone)',
  10: 'E10+ (Everyone 10+)',
  13: 'T (Teen 13+)',
  17: 'M (Mature 17+)',
  18: 'AO (Adults Only 18+)',
}

const getAgeRatingLabel = (value: unknown): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '(clasificación)'
  }
  return ESRB_RATING_LABELS[value] ?? `${value}+`
}

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

type Review = { id: number; user: string; rating: number; date: string; comment: string; avatarUrl?: string }

type ProductoTipo = 'juego' | 'servicio' | 'complemento'

type ProductoData = JuegoDetail | ServicioDetail | ComplementoDetail

export default function Producto() {
  const reviewsRef = useRef<HTMLDivElement>(null)
  const { tipo, id } = useParams<{ tipo: ProductoTipo; id: string }>()
  const navigate = useNavigate()
  const parsedTipo = tipo as ProductoTipo | undefined
  const parsedId = id ? Number(id) : undefined
  // El resto del código puede usar parsedTipo y parsedId

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ProductoData | null>(null)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1)
  const [, setReviewsTotal] = useState(0)
  const reviewsPerPage = 5
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [displayImage, setDisplayImage] = useState<string>('/vite.svg')
  const [isAdmin, setIsAdmin] = useState(false)
  const imageTimeoutRef = useRef<number | null>(null)
  
  const fotos: Foto[] = (
    (tipo === 'juego' && data && 'fotos' in (data as JuegoDetail) ? (data as JuegoDetail).fotos : undefined) ||
    (tipo === 'servicio' && data && 'fotos' in (data as ServicioDetail) ? (data as ServicioDetail).fotos : undefined) ||
    (tipo === 'complemento' && data && 'fotos' in (data as ComplementoDetail) ? (data as ComplementoDetail).fotos : undefined) ||
    []
  ) as Foto[]
  // Ordenar: principal primero, luego las demás
  const fotosOrdenadas = fotos.length > 0
    ? [...fotos].sort((a, b) => (b.esPrincipal ? 1 : 0) - (a.esPrincipal ? 1 : 0))
    : [];

  
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

  // Scroll al inicio cuando se carga el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [parsedTipo, parsedId])

  // Verificar si el usuario es admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await authService.isAdmin()
      setIsAdmin(adminStatus)
    }
    checkAdminStatus()
  }, [])

  useEffect(() => {
    if (!parsedTipo || !parsedId || !['juego','servicio','complemento'].includes(parsedTipo)) {
      setError('Producto no especificado o inexistente')
      return
    }
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        let res: ProductoData
        if (parsedTipo === 'juego') res = await productService.getJuego(parsedId)
        else if (parsedTipo === 'servicio') res = await productService.getServicio(parsedId)
        else res = await productService.getComplemento(parsedId)
        setData(res)
        // Elegir imagen principal del producto si existe
        const fotos: Foto[] | undefined =
          (parsedTipo === 'juego' && (res as JuegoDetail).fotos) ||
          (parsedTipo === 'servicio' && (res as ServicioDetail).fotos) ||
          (parsedTipo === 'complemento' && (res as ComplementoDetail).fotos) ||
          undefined
        if (Array.isArray(fotos) && fotos.length > 0) {
          const principal = fotos.find(f => f.esPrincipal)
          setHeroImage((principal ?? fotos[0]).url)
        } else {
          setHeroImage(null)
        }
      } catch (e) {
        console.error(e)
        setError('No se pudo cargar el producto')
      }
    }
    load()
  }, [parsedTipo, parsedId])

  // Cargar reseñas paginadas
  useEffect(() => {
    if (!parsedTipo || !parsedId || !['juego','servicio','complemento'].includes(parsedTipo)) return
    const loadReviews = async () => {
      try {
        const res = await getReviewsByProduct(parsedTipo, parsedId, reviewsPage, reviewsPerPage)
        setReviews(res.data)
        setReviewsTotalPages(res.totalPages)
        setReviewsTotal(res.total)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setReviews([])
        setReviewsTotalPages(1)
        setReviewsTotal(0)
      } finally {
        setLoading(false)
      }
    }
    setLoading(true)
    loadReviews()
  }, [parsedTipo, parsedId, reviewsPage])

  const reviewsUi: Review[] = reviews.map(r => ({
    id: r.id,
    user: r.usuario?.nombreUsuario ?? 'Usuario',
    rating: r.puntaje,
    date: new Date(r.fecha).toLocaleDateString(),
    comment: r.detalle,
    avatarUrl: r.usuario?.urlFoto,
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
              Volver al catálogo
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
                    to="/productos"
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
                {fotosOrdenadas.length > 0 && (
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
                    {fotosOrdenadas.map((f) => {
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
                {(() => { const ventas = data?.ventasCount ?? 0; return ventas > 0 })() && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                    <Chip
                      label={`+${(() => { const ventas = data?.ventasCount ?? 0; return Math.max(5, Math.floor(ventas / 5) * 5) })()} vendidos`}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                )}

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

                {/* Botón Comprar solo para usuarios normales */}
                {!isAdmin && (
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
                )}

                {/* Botón Modificar Producto para administradores */}
                {isAdmin && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Edit />}
                    sx={{ 
                      mt: 2,
                      py: 1.5, 
                      fontWeight: 700,
                      borderColor: "#4a90e2",
                      color: "#4a90e2",
                      "&:hover": {
                        borderColor: "#357abd",
                        backgroundColor: "rgba(74, 144, 226, 0.1)",
                        color: "#357abd"
                      }
                    }}
                    onClick={() => {
                      if (!tipo || !id) return
                      navigate(`/admin/edit-product/${tipo}/${id}`)
                    }}
                  >
                    Modificar Producto
                  </Button>
                )}

                <Box sx={{ mt: 3 }}>
                  {tipo === 'juego' && data && (
                    <Box sx={{ display: 'grid', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonth fontSize="small" color="disabled" />
                        <Typography>Lanzado el {data && 'fechaLanzamiento' in data && (data as JuegoDetail).fechaLanzamiento ? new Date((data as JuegoDetail).fechaLanzamiento).toLocaleDateString() : '(fecha)'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="disabled" />
                        <Typography>
                          Edad permitida: {getAgeRatingLabel(
                            data && 'edadPermitida' in data ? (data as JuegoDetail).edadPermitida : undefined
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Category fontSize="small" color="disabled" />
                        <Typography>{data && Array.isArray(data.categorias) && data.categorias.length > 0 ? data.categorias.map(c => c.nombre).join(', ') : 'Sin categorías actualmente'}</Typography>
                      </Box>
                    </Box>
                  )}
                  {(tipo === 'servicio' || tipo === 'complemento') && data && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category fontSize="small" color="disabled" />
                      <Typography>{data && Array.isArray(data.categorias) && data.categorias.length > 0 ? data.categorias.map(c => c.nombre).join(', ') : 'Sin categorías actualmente'}</Typography>
                    </Box>
                  )}
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
                        <Avatar src={r.avatarUrl}>{!r.avatarUrl && (r.user?.[0] ?? '?')}</Avatar>
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
                {reviewsTotalPages > 1 && (
                  <ModernPagination
                    currentPage={reviewsPage}
                    totalPages={reviewsTotalPages}
                    onPageChange={setReviewsPage}
                    onScrollAfterChange={() => {
                      reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  />
                )}
              </Box>
            </Box>
          </Container>
        )}
        <Footer />
      </Box>
    </ThemeProvider>
  )
}
