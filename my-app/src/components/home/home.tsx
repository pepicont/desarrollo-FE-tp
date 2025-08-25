"use client"

import * as React from "react"
import { 
  IconButton,
  Typography,
  Box,
  Drawer,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Paper,
  ThemeProvider,
  createTheme,
} from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"

import {
  Close as CloseIcon,
  Star,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material"
import styled from "@emotion/styled"
import cyberpunkImg from "../../assets/cyberpunk.jpg"
import fifaImg from "../../assets/fifa24.jpg"
import mw3Img from "../../assets/mw3.jpg"
import NavBar from "../navBar/navBar"

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

// Removed page-specific AppBar and search overlay; using shared NavBar instead

const CarouselContainer = styled(Box)`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 32px;
`

const CarouselSlide = styled(Box)`
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
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
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  z-index: 2;
  width: 48px;
  height: 48px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
  & .MuiSvgIcon-root {
    font-size: 1.5rem;
  }
`

const carouselItems = [
  {
    id: 1,
    title: "Cyberpunk 2077: Phantom Liberty",
  image: cyberpunkImg,
    description: "La nueva expansión ya disponible",
    badge: "NUEVO",
  },
  {
    id: 2,
    title: "FIFA 24",
  image: fifaImg,
    description: "La experiencia futbolística más realista",
    badge: "POPULAR",
  },
  {
    id: 3,
    title: "Call of Duty: Modern Warfare III",
  image: mw3Img,
    description: "La guerra nunca cambia",
    badge: "OFERTA",
  },
]

const featuredProducts = [
  {
    id: 1,
    title: "The Legend of Zelda: Tears of the Kingdom",
    price: "$59.99",
    originalPrice: "$69.99",
  image: cyberpunkImg,
    rating: 4.9,
    discount: 15,
  },
  {
    id: 2,
    title: "Spider-Man 2",
    price: "$49.99",
    originalPrice: "$59.99",
  image: fifaImg,
    rating: 4.8,
    discount: 17,
  },
  {
    id: 3,
    title: "Baldur's Gate 3",
    price: "$39.99",
    originalPrice: "$59.99",
  image: mw3Img,
    rating: 4.9,
    discount: 33,
  },
  {
    id: 4,
    title: "Hogwarts Legacy",
    price: "$29.99",
    originalPrice: "$49.99",
  image: cyberpunkImg,
    rating: 4.7,
    discount: 40,
  },
]



export default function Home() {
  const [cartOpen, setCartOpen] = React.useState(false)
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [cartCount] = React.useState(3)

  const cartItems = [
    {
      id: 1,
      title: "Cyberpunk 2077: Phantom Liberty",
      price: "$29.99",
  image: cyberpunkImg,
      quantity: 1,
    },
    {
      id: 2,
      title: "FIFA 24",
      price: "$59.99",
  image: fifaImg,
      quantity: 1,
    },
    {
      id: 3,
      title: "Spider-Man 2",
      price: "$49.99",
  image: mw3Img,
      quantity: 1,
    },
  ]

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  const handleCartToggle = () => {
    setCartOpen(!cartOpen)
  }

  return (
    <ThemeProvider theme={darkTheme}>
  <CssBaseline />
  <Box sx={{ flexGrow: 1, backgroundColor: "background.default", minHeight: "100vh" }}>
  <NavBar onCartClick={handleCartToggle} cartCount={cartCount} />

        <Drawer anchor="right" open={cartOpen} onClose={handleCartToggle}>
          <Box sx={{ width: 350, backgroundColor: "#1E2A3A", height: "100%" }}>
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid #2A3441",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" sx={{ color: "#FFFFFF", fontWeight: "bold" }}>
                Carrito de Compras
              </Typography>
              <IconButton onClick={handleCartToggle} sx={{ color: "#FFFFFF" }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ p: 2 }}>
              {cartItems.length === 0 ? (
                <Typography sx={{ color: "#B0BEC5", textAlign: "center", mt: 4 }}>Tu carrito está vacío</Typography>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{ display: "flex", mb: 2, p: 2, backgroundColor: "#141926", borderRadius: 2 }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.title}
                        sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1, mr: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ color: "#FFFFFF", fontWeight: "bold", mb: 1 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#4A90E2", fontWeight: "bold" }}>
                          {item.price}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                          Cantidad: {item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                  ))}

                  <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #2A3441" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="h6" sx={{ color: "#FFFFFF" }}>
                        Total:
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#4A90E2", fontWeight: "bold" }}>
                        $139.97
                      </Typography>
                    </Box>
                    <Button variant="contained" fullWidth size="large" sx={{ textTransform: "none", mb: 1 }}>
                      Proceder al Pago
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      sx={{ textTransform: "none", borderColor: "#4A90E2", color: "#4A90E2" }}
                      onClick={handleCartToggle}
                    >
                      Seguir Comprando
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Drawer>

  {/* Profile menu and left drawer now handled by NavBar */}

  <Box sx={{ pt: 12, pb: 4, px: { xs: 2, sm: 3, md: 4 }, backgroundColor: "background.paper", width: "100%" }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: "bold", color: "#FFFFFF" }}>
            Novedades
          </Typography>

          <CarouselContainer>
            <CarouselArrow onClick={prevSlide} sx={{ left: 16 }} aria-label="Previous slide">
              <ArrowBackIos />
            </CarouselArrow>

            <CarouselArrow onClick={nextSlide} sx={{ right: 16 }} aria-label="Next slide">
              <ArrowForwardIos />
            </CarouselArrow>

            {carouselItems.map((item, index) => (
              <CarouselSlide
                key={item.id}
                sx={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "flex-end",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                      width: "100%",
                      p: 4,
                      color: "white",
                    }}
                  >
                    <Chip label={item.badge} color="primary" sx={{ mb: 2 }} />
                    <Typography variant="h3" component="h3" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="h6">{item.description}</Typography>
                  </Box>
                </Box>
              </CarouselSlide>
            ))}
          </CarouselContainer>

          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: "bold", color: "#FFFFFF" }}>
            Productos Destacados
          </Typography>

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
            {featuredProducts.map((product) => (
              <Box key={product.id}>
                <ProductCard>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="300"
                      image={product.image}
                      alt={product.title}
                      sx={{ width: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                    {product.discount > 0 && (
                      <Chip
                        label={`-${product.discount}%`}
                        color="error"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          fontWeight: "bold",
                        }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography gutterBottom variant="h6" component="h3" sx={{ fontSize: "1rem", color: "#FFFFFF" }}>
                      {product.title}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Star sx={{ color: "gold", fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: "#B0BEC5" }}>
                        {product.rating}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: "auto" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                          {product.price}
                        </Typography>
                        {product.originalPrice !== product.price && (
                          <Typography variant="body2" sx={{ textDecoration: "line-through", color: "#B0BEC5" }}>
                            {product.originalPrice}
                          </Typography>
                        )}
                      </Box>
                      <Button variant="contained" fullWidth size="small" sx={{ textTransform: "none" }}>
                        Ver Detalles
                      </Button>
                    </Box>
                  </CardContent>
                </ProductCard>
              </Box>
            ))}
          </Box>

          <Paper elevation={2} sx={{ p: 4, textAlign: "center", backgroundColor: "#1E2A3A", color: "#FFFFFF" }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: "bold" }}>
              Sobre Nosotros
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: "#B0BEC5" }}>
              Somos tu portal de confianza para videojuegos, donde encontrarás los mejores títulos, DLC exclusivos y
              membresías premium para las plataformas de streaming más populares. Nuestro sistema de códigos de cupón te
              permite acceder instantáneamente a tus compras, mientras que nuestra comunidad de jugadores comparte
              reseñas auténticas para ayudarte a tomar las mejores decisiones.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              sx={{ mt: 3, textTransform: "none", borderColor: "#4A90E2", color: "#4A90E2" }}
            >
              Conoce Más
            </Button>
          </Paper>
        </Box>
      
      </Box>
    </ThemeProvider>
  )
}