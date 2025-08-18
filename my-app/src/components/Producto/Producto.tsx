import { useRef, useState } from "react"
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Avatar,
  Rating,
  Badge,
} from "@mui/material"
import { ArrowBack, ChevronLeft, ChevronRight, CloudDownload, Person } from "@mui/icons-material"
import NavBar from "../navBar/navBar"
import cyberpunkImg from "../../assets/cyberpunk.jpg"
import fifaImg from "../../assets/fifa24.jpg"
import mw3Img from "../../assets/mw3.jpg"
import { Link } from "react-router-dom"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#141926", paper: "#1e2532" },
    primary: { main: "#4a90e2" },
    text: { primary: "#ffffff", secondary: "#b0b0b0" },
  },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundColor: "#1e2532", borderRadius: 12 } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8 } } },
  },
})

type Review = { id: number; user: string; rating: number; date: string; comment: string }

export default function Producto() {
  const [selectedImage, setSelectedImage] = useState(0)
  const reviewsRef = useRef<HTMLDivElement>(null)

  const images = [cyberpunkImg, fifaImg, mw3Img]

  const complementos = [
    { id: 1, name: "Pase de expansión", price: "$19.99", realPrice: "$24.99", image: fifaImg, discount: "-20%" },
    { id: 2, name: "Paquete de skins", price: "$4.99", realPrice: "$4.99", image: mw3Img, discount: "NEW" },
    { id: 3, name: "Banda sonora", price: "Incluido", realPrice: "$9.99", image: cyberpunkImg, discount: "GRATIS" },
  ]

  const reviews: Review[] = [
    { id: 1, user: "GamerPro2024", rating: 5, date: "21 oct 2024", comment: "Excelente juego." },
    { id: 2, user: "JuanCarlos88", rating: 4, date: "15 may 2024", comment: "Muy bueno, lo recomiendo." },
    { id: 3, user: "TechGamer", rating: 5, date: "02 ago 2024", comment: "Rinde bárbaro en mi PC." },
  ]

  const next = () => setSelectedImage((p) => (p + 1) % images.length)
  const prev = () => setSelectedImage((p) => (p - 1 + images.length) % images.length)
  const goReviews = () => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
            {/* Left - gallery */}
            <Box>
              <Box sx={{ position: "relative", mb: 2 }}>
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<ArrowBack />}
                  sx={{ position: "absolute", top: 16, left: 16, zIndex: 1 }}
                >
                  Volver
                </Button>
                <Box
                  component="img"
                  src={images[selectedImage]}
                  alt="Producto"
                  sx={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 2 }}
                />
                <Badge
                  color="error"
                  badgeContent={"-15%"}
                  sx={{ position: "absolute", right: 16, top: 16, '& .MuiBadge-badge': { fontWeight: 700 } }}
                />
                <Chip label="Juego" color="primary" sx={{ position: "absolute", right: 16, top: 56 }} />

                <IconButton onClick={prev} sx={{ position: "absolute", left: 8, top: "50%", bgcolor: "#0008" }}>
                  <ChevronLeft htmlColor="#fff" />
                </IconButton>
                <IconButton onClick={next} sx={{ position: "absolute", right: 8, top: "50%", bgcolor: "#0008" }}>
                  <ChevronRight htmlColor="#fff" />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
                {images.map((img, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={img}
                    alt={`thumb-${i}`}
                    onClick={() => setSelectedImage(i)}
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, cursor: "pointer", outline: i === selectedImage ? "2px solid #4a90e2" : "2px solid transparent" }}
                  />
                ))}
              </Box>
            </Box>

            {/* Right - details */}
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Cyberpunk 2077
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>(PC / PlayStation®5)</Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Button onClick={goReviews} variant="text" color="inherit" sx={{ p: 0, minWidth: 0 }}>
                  <Rating name="read-only" value={5} readOnly />
                </Button>
                <Typography>4.6</Typography>
                <Typography color="text.secondary">847K ratings</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 2 }}>
                <Typography variant="h4" fontWeight={800}>$39.99</Typography>
                <Typography color="text.secondary" sx={{ textDecoration: "line-through" }}>$46.99</Typography>
              </Box>

              <Button fullWidth variant="contained" color="warning" sx={{ py: 1.5, fontWeight: 700 }}>
                Agregar al carrito
              </Button>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography color="text.secondary">Disponible</Typography>
                  <Typography>06/11/2022</Typography>
                </Box>

                <Box sx={{ display: "grid", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person fontSize="small" color="disabled" />
                    <Typography>Juego offline activado</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person fontSize="small" color="disabled" />
                    <Typography>1 jugador</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                <Typography color="text.secondary">
                  Cyberpunk 2077 es un RPG de acción en un mundo abierto. Explora Night City, mejora a tu personaje y
                  toma decisiones que impactan la historia.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Características */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Características
            </Typography>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
              <Card>
                <CardContent>
                  <Typography fontWeight={600} gutterBottom>Requisitos del Sistema</Typography>
                  <Typography color="text.secondary" component="div">
                    • SO: Windows 10 64-bit<br />• Procesador: Intel Core i5-8400 / AMD Ryzen 5 1600<br />• Memoria: 8 GB de RAM<br />• Gráficos: NVIDIA GTX 960 / AMD R9 280<br />• DirectX: 12<br />• Almacenamiento: 150 GB
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography fontWeight={600} gutterBottom>Información</Typography>
                  <Typography color="text.secondary">Desarrollador: CD Projekt Red</Typography>
                  <Typography color="text.secondary">Editor: CD Projekt</Typography>
                  <Typography color="text.secondary">Fecha de lanzamiento: 10 de dic de 2020</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Complementos */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Complementos sugeridos
            </Typography>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
              {complementos.map((c) => (
                <Card key={c.id} sx={{ position: "relative" }}>
                  <CardContent>
                    <Box component="img" src={c.image} alt={c.name} sx={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 1, mb: 1 }} />
                    <Chip label={c.discount} size="small" color="warning" sx={{ position: "absolute", top: 8, left: 8 }} />
                    <Typography fontWeight={600} variant="body2" gutterBottom>{c.name}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box>
                        <Typography color="success.light" fontWeight={700}>{c.price}</Typography>
                        {c.realPrice !== c.price && (
                          <Typography color="text.secondary" variant="caption" sx={{ ml: 1 }}>{c.realPrice}</Typography>
                        )}
                      </Box>
                      <Button size="small" variant="contained">Agregar</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Opiniones */}
          <Box sx={{ mt: 6 }} ref={reviewsRef}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Opiniones del producto
            </Typography>
            <Box sx={{ display: "grid", gap: 2 }}>
              {reviews.map((r) => (
                <Card key={r.id}>
                  <CardContent>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Avatar>{r.user[0]}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
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
