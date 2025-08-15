import * as React from "react"
import { Container, Typography, Box, Button, Chip, Paper, IconButton } from "@mui/material"
import { styled } from "@mui/material/styles"
import ArrowBackIos from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos"
import NavBar from "../navBar/navBar"
import mw3Img from "../../assets/mw3.jpg"
import fifa24Img from "../../assets/fifa24.jpg"
import cyberpunkImg from "../../assets/cyberpunk.jpg"

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: 400,
  overflow: "hidden",
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(4),
}))

const CarouselSlide = styled(Box)({
  position: "absolute",
  width: "100%",
  height: "100%",
  transition: "transform 0.5s ease-in-out",
})

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
    image: fifa24Img,
    description: "La experiencia futbolística más realista",
    badge: "POPULAR",
  },
  {
    id: 3,
    title: "Call of Duty: Modern Warfare III",
    image: mw3Img,
    description: "La guerra nunca cambia",
    badge: "CLÁSICO",
  },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = React.useState(0)

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

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
          Productos Destacados
        </Typography>
        <CarouselContainer>
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
          <IconButton
            sx={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.8)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
            }}
            onClick={prevSlide}
          >
            <ArrowBackIos />
          </IconButton>
          <IconButton
            sx={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.8)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
            }}
            onClick={nextSlide}
          >
            <ArrowForwardIos />
          </IconButton>
        </CarouselContainer>
        <Paper elevation={2} sx={{ p: 4, textAlign: "center", bgcolor: "background.paper" }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: "bold" }}>
            Sobre Nosotros
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 800, mx: "auto", lineHeight: 1.8 }}>
            Somos tu portal de confianza para videojuegos, donde encontrarás los mejores títulos, DLC exclusivos y
            membresías premium para las plataformas de streaming más populares. Nuestro sistema de códigos de cupón te
            permite acceder instantáneamente a tus compras, mientras que nuestra comunidad de jugadores comparte reseñas
            auténticas para ayudarte a tomar las mejores decisiones. Únete a miles de gamers que ya confían en nosotros
            para vivir las mejores experiencias de juego.
          </Typography>
          <Button onClick={() => window.location.href = '/about'} variant="outlined" size="large" sx={{ mt: 3, textTransform: "none" }}>
            Conoce Más
          </Button>
        </Paper>
      </Container>
    </>
  )
}


