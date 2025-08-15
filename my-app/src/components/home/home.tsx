import * as React from "react"
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  
  Container,
  Chip,
  Button,
  Paper,
  Fade,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Search as SearchIcon,

  Person as PersonIcon,
  SportsEsports as SportsEsportsIcon, // Cambiado de Gamepad2 a SportsEsportsIcon
  ShoppingBag as ShoppingBagIcon,
  RateReview as ReviewIcon,
  ContactMail as ContactIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  ArrowBackIos,
  ArrowForwardIos,
  
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"

// Styled components siguiendo el estilo del login
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

const SearchContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: theme.zIndex.modal,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: theme.spacing(8),
}))

const SearchBox = styled(Paper)(({ theme }) => ({
  width: "90%",
  maxWidth: 600,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
}))

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



// Datos de ejemplo para el carousel
const carouselItems = [
  {
    id: 1,
    title: "Cyberpunk 2077: Phantom Liberty",
    image: "/cyberpunk-game-screenshot.png",
    description: "La nueva expansión ya disponible",
    badge: "NUEVO",
  },
  {
    id: 2,
    title: "FIFA 24",
    image: "/soccer-game-screenshot.png",
    description: "La experiencia futbolística más realista",
    badge: "POPULAR",
  },
  {
    id: 3,
    title: "Call of Duty: Modern Warfare III",
    image: "/generic-fps-screenshot.png",
    description: "La guerra nunca cambia",
    badge: "OFERTA",
  },
]

// Datos de ejemplo para productos destacados


export default function Home() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null)
  const [currentSlide, setCurrentSlide] = React.useState(0)
  

  // Auto-advance carousel
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null)
  }

  const handleLogout = () => {
    // Lógica de logout
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    handleProfileMenuClose()
    // Redirigir al login
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  const menuItems = [
    { text: "Productos", icon: <SportsEsportsIcon />, action: () => console.log("Productos") }, // Actualizado el icono
    { text: "Mis Compras", icon: <ShoppingBagIcon />, action: () => console.log("Mis Compras") },
    { text: "Mis Reseñas", icon: <ReviewIcon />, action: () => console.log("Mis Reseñas") },
    { text: "Contáctenos", icon: <ContactIcon />, action: () => console.log("Contáctenos") },
    { text: "Cerrar Sesión", icon: <LogoutIcon />, action: handleLogout },
  ]

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <StyledAppBar position="fixed">
        <Toolbar>
          {/* Menu Hamburguesa */}
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          {/* Lupa de Búsqueda */}
          <IconButton color="inherit" aria-label="search" onClick={handleSearchToggle} sx={{ mr: 2 }}>
            <SearchIcon />
          </IconButton>

          {/* Logo Placeholder */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "center" }}>
            GAMING PORTAL
          </Typography>

          

          {/* Perfil */}
          <IconButton color="inherit" onClick={handleProfileMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </StyledAppBar>

      {/* Drawer Menu */}
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 280, pt: 2 }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                key={index}
                onClick={() => {
                  item.action()
                  setDrawerOpen(false)
                }}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Search Overlay */}
      {searchOpen && (
        <SearchContainer onClick={handleSearchToggle}>
          <Fade in={searchOpen}>
            <SearchBox onClick={(e) => e.stopPropagation()}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Buscar Juegos
                </Typography>
                <IconButton onClick={handleSearchToggle}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                placeholder="Buscar videojuegos, DLC, membresías..."
                variant="outlined"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </SearchBox>
          </Fade>
        </SearchContainer>
      )}

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfileMenuClose}>Mi Perfil</MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>Configuración</MenuItem>
        <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
      </Menu>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        {/* Carousel de Novedades */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
          Novedades
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

          {/* Carousel Controls */}
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

        {/* Productos Destacados */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
          Productos Destacados
        </Typography>

      

        {/* About Us Section */}
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
          <Button variant="outlined" size="large" sx={{ mt: 3, textTransform: "none" }}>
            Conoce Más
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}
