"use client"
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Paper,
  ThemeProvider,
  createTheme,
  Container,
} from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"
import { CheckCircle, AttachMoney, People, SportsEsports, Movie } from "@mui/icons-material"
import Logo from "../../assets/logo.jpg"
import NavBar from "../navBar/navBar.tsx"

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
  },
})

const statsData = [
  { number: "10K+", label: "Usuarios Activos" },
  { number: "500+", label: "Juegos Disponibles" },
  { number: "50+", label: "Desarrolladoras" },
  { number: "24/7", label: "Soporte" },
]

const features = [
  {
    icon: <CheckCircle sx={{ fontSize: 40 }} />,
    title: "Catálogo Completo",
    description:
      "Accede a un extenso catálogo de videojuegos con información detallada sobre requisitos, desarrolladoras y reseñas de la comunidad.",
  },
  {
    icon: <AttachMoney sx={{ fontSize: 40 }} />,
    title: "Códigos Instantáneos",
    description:
      "Recibe códigos de cupón al instante con instrucciones claras para canjear tus productos favoritos de manera rápida y segura.",
  },
  {
    icon: <People sx={{ fontSize: 40 }} />,
    title: "Comunidad Activa",
    description:
      "Únete a una comunidad de gamers que comparten comentarios, reseñas y recomendaciones para enriquecer tu experiencia de juego.",
  },
]

const services = [
  {
    icon: <SportsEsports sx={{ fontSize: 30 }} />,
    title: "Videojuegos",
    items: [
      "Catálogo completo de títulos AAA e indies",
      "Información detallada de requisitos del sistema",
      "Reseñas y puntuaciones de la comunidad",
      "Datos de desarrolladoras y editoras",
    ],
  },
  {
    icon: <Movie sx={{ fontSize: 30 }} />,
    title: "Streaming & Complementos",
    items: [
      "Membresías mensuales de plataformas populares",
      "DLCs y expansiones de tus juegos favoritos",
      "Contenido adicional y season passes",
      "Acceso a servicios premium de gaming",
    ],
  },
]

export default function AboutUs() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, backgroundColor: "background.default", minHeight: "100vh" }}>
        {/* Header */}
        <NavBar />

        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ pt: 15, pb: 8 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Box
              component="img"
              src={Logo}
              alt="Portal Videojuegos"
              sx={{ width: 120, height: 120, mx: "auto", mb: 4 }}
            />
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "#FFFFFF" }}>
              Sobre Nosotros
            </Typography>
            <Typography variant="h5" sx={{ color: "#B0BEC5", maxWidth: "800px", mx: "auto", lineHeight: 1.6 }}>
              Somos tu portal de confianza para videojuegos, donde la pasión por el gaming se encuentra con la mejor
              experiencia de usuario.
            </Typography>
          </Box>

          {/* Mission Section */}
          <Box
            sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 6, alignItems: "center", mb: 10 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: "bold", color: "#FFFFFF" }}>
                Nuestra Misión
              </Typography>
              <Typography variant="body1" sx={{ color: "#B0BEC5", fontSize: "1.1rem", lineHeight: 1.8, mb: 3 }}>
                En Portal Videojuegos, nos dedicamos a conectar a los gamers con los mejores títulos, complementos,
                experiencias de streaming y membresías gaming del mercado. Creemos que cada jugador merece acceso fácil y confiable a su
                contenido favorito.
              </Typography>
              <Typography variant="body1" sx={{ color: "#B0BEC5", fontSize: "1.1rem", lineHeight: 1.8 }}>
                Nuestro sistema de códigos de cupón te permite acceder instantáneamente a tus compras, mientras que
                nuestra comunidad de jugadores comparte reseñas auténticas para ayudarte a tomar las mejores decisiones.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 4, backgroundColor: "#1e2532" }}>
                {/* Stats */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {statsData.map((stat, index) => (
                    <Box key={index} sx={{ flex: "1 1 45%", textAlign: "center" }}>
                      <Typography variant="h3" sx={{ color: "#4A90E2", fontWeight: "bold", mb: 1 }}>
                        {stat.number}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#B0BEC5" }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Features Grid */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, mb: 10 }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ flex: 1 }}>
                <Card sx={{ height: "100%", backgroundColor: "#1e2532", p: 3 }}>
                  <CardContent>
                    <Box sx={{ color: "#4A90E2", mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: "bold", color: "#FFFFFF" }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#B0BEC5", lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Services Section */}
          <Paper elevation={3} sx={{ p: 6, backgroundColor: "#1e2532", mb: 10 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#FFFFFF", textAlign: "center", mb: 6 }}
            >
              Nuestros Servicios
            </Typography>
            {/* Services */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 6 }}>
              {services.map((service, index) => (
                <Box key={index} sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box sx={{ color: "#4A90E2", mr: 2 }}>{service.icon}</Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#FFFFFF" }}>
                      {service.title}
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {service.items.map((item, itemIndex) => (
                      <Typography component="li" key={itemIndex} sx={{ color: "#B0BEC5", mb: 1, fontSize: "1rem" }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: "bold", color: "#FFFFFF" }}>
              ¿Listo para comenzar?
            </Typography>
            <Typography variant="h6" sx={{ color: "#B0BEC5", maxWidth: "600px", mx: "auto", mb: 4, lineHeight: 1.6 }}>
              Únete a miles de gamers que ya disfrutan de la mejor experiencia en Portal Videojuegos. Crea tu cuenta y
              descubre un mundo de posibilidades.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center" }}>
              <Button
                variant="contained"
                size="large"
                sx={{ px: 4, py: 1.5, fontSize: "1.1rem", textTransform: "none" }}
                onClick={() => (window.location.href = "/login")}
              >
                Crear Cuenta
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  borderColor: "#4A90E2",
                  color: "#4A90E2",
                }}
                onClick={() => (window.location.href = "/productos")}
              >
                Explorar Catálogo
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Footer */}
        
      </Box>
    </ThemeProvider>
  )
}
