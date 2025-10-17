"use client"

import * as React from "react"
import { 
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  ThemeProvider,
  createTheme,
} from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"

import {
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material"
import styled from "@emotion/styled"
import NavBar from "../navBar/navBar"
import juegos from "../../assets/carousel-juegos.png"
import servicios from "../../assets/carousel-servicios.jpg"
import complementos from "../../assets/carousel-complementos.png"
import { useNavigate } from "react-router-dom"
import Footer from "../footer/footer"
import { getTopSellers, type TopSeller } from "../../services/topSellersService"
import logo from "../../assets/logo.jpg"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4A90E2",
    },
    background: {
  default: "#141926",
  paper: "#1e2532",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B0BEC5",
    },
    error: {
      main: "#FF5252",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#141926",
          boxShadow: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1E2A3A",
          borderRight: "1px solid #2A3441",
        },
      },
    },
  },
})



const CarouselContainer = styled(Box)`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 32px;
  touch-action: pan-y;

  @media (max-width: 900px) {
    height: 360px;
  }

  @media (max-width: 600px) {
    height: 320px;
    border-radius: 16px;
    margin-bottom: 28px;
  }

  @media (max-width: 420px) {
    height: 300px;
  }
`

const CarouselSlide = styled(Box)`
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s ease, opacity 0.6s ease;
`

const ProductCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1e2532;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.4);
  }
`

const CarouselArrow = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(15, 20, 30, 0.65);
  color: #ffffff;
  z-index: 2;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  &:hover {
    background-color: rgba(22, 28, 40, 0.85);
  }
  & .MuiSvgIcon-root {
    font-size: 1.5rem;
  }

  @media (max-width: 600px) {
    width: 42px;
    height: 42px;
    top: auto;
    bottom: 22px;
    transform: translateY(0);
    & .MuiSvgIcon-root {
      font-size: 1.2rem;
    }
  }
`

const OverlayCard = styled(Box)<{ accent: string }>(({ accent }) => ({
  width: "100%",
  maxWidth: 640,
  padding: "clamp(1.5rem, 3vw, 2.5rem)",
  background: "rgba(20, 25, 38, 0.72)",
  borderRadius: 20,
  border: `1px solid ${accent}33`,
  backdropFilter: "blur(16px)",
  boxShadow: "0 24px 48px rgba(0, 0, 0, 0.45)",
  display: "flex",
  flexDirection: "column",
  gap: "clamp(0.85rem, 2vw, 1.6rem)",
  color: "#ffffff",
  transition: "transform 0.45s ease, box-shadow 0.45s ease",
  position: "relative",
  overflow: "hidden",
  borderTop: `1px solid ${accent}55`,
  borderLeft: `1px solid ${accent}22`,
  '& > *': {
    position: "relative",
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 65%)",
    pointerEvents: "none",
  },
  '@media (max-width: 600px)': {
    maxWidth: "100%",
    padding: "1.5rem",
    borderRadius: 18,
    boxShadow: "0 16px 32px rgba(0,0,0,0.4)",
    gap: "1.1rem",
  },
  '@media (max-width: 420px)': {
    padding: "1.3rem",
    gap: "0.9rem",
  },
}))

const IndicatorWrapper = styled(Box)`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 3;

  @media (max-width: 600px) {
    bottom: 12px;
    gap: 10px;
  }
`

const IndicatorButton = styled("button")<{ active?: boolean }>(({ active }) => ({
  position: "relative",
  width: active ? 48 : 24,
  height: 6,
  borderRadius: 999,
  background: "rgba(255,255,255,0.25)",
  overflow: "hidden",
  border: 0,
  padding: 0,
  cursor: "pointer",
  transition: "all 0.35s ease",
  outline: "none",
  opacity: active ? 1 : 0.7,
  '&:hover': {
    opacity: 1,
  },
  '&:focus-visible': {
    boxShadow: "0 0 0 3px rgba(74,144,226,0.5)",
  },
  '@media (max-width: 600px)': {
    width: active ? 36 : 18,
    height: 5,
  },
}))

const IndicatorFill = styled("span")<{ gradient: string }>(({ gradient }) => ({
  position: "absolute",
  inset: 0,
  background: gradient,
  transform: "scaleX(0)",
  transformOrigin: "left",
  transition: "transform 0.2s linear",
}))

const carouselItems = [
  {
    id: 1,
    title: "Juegos",
  image: juegos,
    description: "Los juegos del momento al alcance de tu mano",
    badge: "NUEVO",
    accent: "#4A90E2",
    accentGradient: "linear-gradient(135deg, rgba(74,144,226,0.95) 0%, rgba(44,90,160,0.85) 100%)",
    eyebrow: "Colección gamer esencial",
  },
  {
    id: 2,
    title: "Complementos",
  image: complementos,
    description: "Complementos adicionales sobre los juegos que más te gustan",
    badge: "POPULAR",
    accent: "#FF7A59",
    accentGradient: "linear-gradient(135deg, rgba(255,122,89,0.95) 0%, rgba(206,78,50,0.85) 100%)",
    eyebrow: "Accesorios imprescindibles",
  },
  {
    id: 3,
    title: "Servicios",
  image: servicios,
    description: "Los mejores servicios de streaming y gaming",
    badge: "OFERTA",
    accent: "#9B6CFF",
    accentGradient: "linear-gradient(135deg, rgba(155,108,255,0.95) 0%, rgba(111,74,214,0.85) 100%)",
    eyebrow: "Experiencias premium",
  },
]

const SLIDE_DURATION = 7000


export default function Home() {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const navigate = useNavigate()
  const [topSellers, setTopSellers] = React.useState<TopSeller[]>([])
  const [loadingTop, setLoadingTop] = React.useState<boolean>(true)
  const [errorTop, setErrorTop] = React.useState<string | null>(null)

  const touchStartX = React.useRef<number | null>(null)
  const touchDeltaX = React.useRef(0)
  const touchStartTime = React.useRef<number | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, SLIDE_DURATION)
    return () => clearTimeout(timeout)
  }, [currentSlide])

  React.useEffect(() => {
    setProgress(0)
    let frameId: number
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const ratio = Math.min(elapsed / SLIDE_DURATION, 1)
      setProgress(ratio)
      if (elapsed < SLIDE_DURATION) {
        frameId = requestAnimationFrame(animate)
      }
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [currentSlide])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoadingTop(true)
        const data = await getTopSellers({ tipo: 'todos', limit: 8 })
        if (!cancelled) {
          setTopSellers(data)
          setErrorTop(null)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const hasMessage = (e: unknown): e is { message: string } => {
            if (typeof e !== 'object' || e === null) return false
            const maybe = e as Record<string, unknown>
            return typeof maybe.message === 'string'
          }
          const msg = hasMessage(err)
            ? err.message
            : 'No se pudieron cargar los productos destacados'
          setErrorTop(msg)
        }
      } finally {
        if (!cancelled) setLoadingTop(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const nextSlide = () => {
    setProgress(0)
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setProgress(0)
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
    touchDeltaX.current = 0
    touchStartTime.current = performance.now()
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const currentX = event.touches[0]?.clientX
    if (typeof currentX !== "number") return
    touchDeltaX.current = currentX - touchStartX.current
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return
    const deltaX = touchDeltaX.current
    const elapsed = touchStartTime.current ? performance.now() - touchStartTime.current : 0
    const SWIPE_THRESHOLD = 45
    const MAX_DURATION = 650

    if (Math.abs(deltaX) > SWIPE_THRESHOLD && elapsed < MAX_DURATION) {
      if (deltaX > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
    }

    touchStartX.current = null
    touchDeltaX.current = 0
    touchStartTime.current = null
  }


  return (
    <ThemeProvider theme={darkTheme}>
  <CssBaseline />
  <Box sx={{ flexGrow: 1, backgroundColor: "background.default", minHeight: "100vh" }}>
   <NavBar />
  <Box sx={{ pt: 12, pb: 4, px: { xs: 2, sm: 3, md: 4 }, backgroundColor: "background.default", width: "100%" }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: "bold", color: "#FFFFFF" }}>
            Atravesá el Portal y disfrutá de 
          </Typography>

          <CarouselContainer
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <CarouselArrow onClick={prevSlide} sx={{ left: 16 }} aria-label="Previous slide">
              <ArrowBackIos />
            </CarouselArrow>

            <CarouselArrow onClick={nextSlide} sx={{ right: 16 }} aria-label="Next slide">
              <ArrowForwardIos />
            </CarouselArrow>

            {carouselItems.map((item, index) => {
              // Determinar el tipo para el filtro
              let tipoFiltro = ""
              if (item.title === "Juegos") tipoFiltro = "juego"
              if (item.title === "Complementos") tipoFiltro = "complemento"
              if (item.title === "Streaming" || item.title === "Servicios") tipoFiltro = "servicio"
              const isActive = index === currentSlide
              return (
                <CarouselSlide
                  key={item.id}
                  sx={{
                    transform: `translateX(${(index - currentSlide) * 100}%) scale(${isActive ? 1 : 0.9})`,
                    filter: isActive ? "brightness(1)" : "brightness(0.6)",
                    opacity: Math.abs(index - currentSlide) <= 1 ? 1 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                    cursor: "default",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(120deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 100%)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        p: { xs: 2.5, sm: 3, md: 4.5 },
                      }}
                    >
                      <OverlayCard
                        accent={item.accent}
                        sx={{
                          maxWidth: { xs: "100%", sm: "75%", md: "55%" },
                          transform: isActive ? "translateY(0)" : "translateY(24px)",
                          opacity: isActive ? 1 : 0,
                          mx: "auto",
                        }}
                      >
                        <Box
                          sx={{
                            alignSelf: { xs: "center", sm: "flex-start" },
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.5,
                            py: 0.55,
                            borderRadius: 999,
                            background: `${item.accent}1f`,
                            border: `1px solid ${item.accent}55`,
                            color: "rgba(255,255,255,0.92)",
                            fontSize: "0.72rem",
                            letterSpacing: 0.8,
                            textTransform: "uppercase",
                            fontWeight: 600,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: item.accentGradient,
                              boxShadow: `0 0 0 3px ${item.accent}14`,
                            }}
                          />
                          {item.eyebrow}
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, md: 1.4 } }}>
                          <Typography
                            variant="h3"
                            component="h3"
                            sx={{
                              fontSize: { xs: "1.85rem", sm: "2.35rem", md: "2.8rem" },
                              lineHeight: { xs: 1.1, md: 1.2 },
                              fontWeight: 700,
                              letterSpacing: "-0.02em",
                              textAlign: { xs: "center", sm: "left" },
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.15rem" },
                              lineHeight: { xs: 1.38, md: 1.5 },
                              color: "rgba(255,255,255,0.86)",
                              maxWidth: { xs: "100%", md: 520 },
                              mx: { xs: "auto", sm: 0 },
                              textAlign: { xs: "center", sm: "left" },
                              '@media (max-width: 600px)': {
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                              '@media (max-width: 420px)': {
                                fontSize: "0.9rem",
                                lineHeight: 1.32,
                              },
                            }}
                          >
                            {item.description}
                          </Typography>
                        </Box>
                        {tipoFiltro && (
                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              justifyContent: { xs: "center", sm: "flex-start" },
                            }}
                          >
                            <Button
                              variant="contained"
                              disableElevation
                              size="medium"
                              sx={{
                                textTransform: "none",
                                borderRadius: 999,
                                background: item.accentGradient,
                                px: { xs: 3.1, sm: 3.4 },
                                py: { xs: 0.9, sm: 1.05 },
                                fontSize: { xs: "0.95rem", sm: "1rem" },
                                boxShadow: "0 18px 32px rgba(0,0,0,0.38)",
                                '&:hover': {
                                  background: item.accentGradient,
                                  filter: "brightness(1.08)",
                                },
                              }}
                              onClick={() => {
                                navigate(`/productos?tipo=${tipoFiltro}`)
                              }}
                            >
                              Explorar más
                            </Button>
                          </Box>
                        )}
                      </OverlayCard>
                    </Box>
                  </Box>
                </CarouselSlide>
              )
            })}
            <IndicatorWrapper>
              {carouselItems.map((item, index) => (
                <IndicatorButton
                  key={item.id}
                  type="button"
                  active={currentSlide === index}
                  aria-label={`Ir al slide ${item.title}`}
                  onClick={() => {
                    setProgress(0)
                    setCurrentSlide(index)
                  }}
                >
                  <IndicatorFill
                    gradient={item.accentGradient}
                    style={{ transform: `scaleX(${currentSlide === index ? progress : 0})` }}
                  />
                </IndicatorButton>
              ))}
            </IndicatorWrapper>
          </CarouselContainer>

          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: "bold", color: "#FFFFFF" }}>
            Productos Destacados
          </Typography>
          {loadingTop && (
            <Typography sx={{ color: '#B0BEC5', mb: 2 }}>Cargando destacados…</Typography>
          )}
          {errorTop && !loadingTop && (
            <Typography color="error" sx={{ mb: 2 }}>{errorTop}</Typography>
          )}
          {!loadingTop && !errorTop && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
                mb: 6,
              }}
            >
              {topSellers.map((product) => (
                <Box key={`${product.tipo}-${product.id}`}>
                  <ProductCard sx={{ cursor: 'pointer' }} onClick={() => navigate(`/producto/${product.tipo}/${product.id}`)}>
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="300"
                        image={product.imageUrl || logo}
                        alt={product.nombre}
                        sx={{ width: "100%", objectFit: "cover" }}
                        loading="lazy"
                      />
                      
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Typography gutterBottom variant="h6" component="h3" sx={{ fontSize: "1rem", color: "#FFFFFF" }}>
                        {product.nombre}
                      </Typography>

                      {product.compania?.nombre && (
                        <Typography variant="body2" sx={{ color: "#B0BEC5", mb: 1 }}>
                          {product.compania.nombre}
                        </Typography>
                      )}

                      <Box sx={{ mt: "auto" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                            {`$${Number(product.monto).toFixed(2)}`}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          sx={{ textTransform: "none" }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/producto/${product.tipo}/${product.id}`) }}
                        >
                          Ver Detalles
                        </Button>
                      </Box>
                    </CardContent>
                  </ProductCard>
                </Box>
              ))}
            </Box>
          )}

          <Paper elevation={2} sx={{ p: 4, textAlign: "center", backgroundColor: "#1E2A3A", color: "#FFFFFF" }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: "bold" }}>
              Sobre Nosotros
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: "#B0BEC5" }}>
              Somos tu portal de confianza para videojuegos, donde encontrarás los mejores títulos, DLC exclusivos y
              membresías premium para servicios de streaming y gaming. Nuestro sistema de códigos de cupón te
              permite acceder instantáneamente a tus juegos y complementos en Steam y a los servicios en sus plataformas, mientras que nuestra comunidad de jugadores comparte
              reseñas auténticas para ayudarte a tomar las mejores decisiones.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              sx={{ mt: 3, textTransform: "none", borderColor: "#4A90E2", color: "#4A90E2" }}
              onClick={() => (window.location.href = "/about-us")}
            >
              Conoce Más
            </Button>
          </Paper>
        </Box>
        <Footer />  
      </Box>
    </ThemeProvider>
  )
}