import * as React from "react"
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  ShoppingBag as ShoppingBagIcon,
  RateReview as ReviewIcon,
  ContactMail as ContactIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  SportsEsports as SportsEsportsIcon,
  Home as HomeIcon,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import imgLogo from "../../assets/logo.jpg"

const StyledAppBar = styled(AppBar)(() => ({
  backgroundColor: "#000000ff",
  color: "#ffffff",
  boxShadow: "none",
  border: "none",
}))

const StyledListItem = styled(ListItem)<{ isActive?: boolean }>(() => ({
  margin: "4px 8px",
  borderRadius: 8,
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  "& .MuiListItemIcon-root": {
    minWidth: 40,
  },
}))



const baseMenuItems = [
  { text: "Home", icon: <HomeIcon />, href: "/" },
  { text: "Productos", icon: <SportsEsportsIcon />, href: "/productos" },
  { text: "Mis compras", icon: <ShoppingBagIcon />, href: "/mis-compras" },
  { text: "Mis reseñas", icon: <ReviewIcon />, href: "/mis-resenas" },
  { text: "Contáctenos", icon: <ContactIcon />, href: "/contacto" },
  { text: "Cerrar sesión", icon: <LogoutIcon />, href: "__logout__", isLogout: true },
]

type NavBarProps = {
  onCartClick?: () => void
  cartCount?: number
}

export default function NavBar({ onCartClick, cartCount = 0 }: NavBarProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null)
  const [activeItem, setActiveItem] = React.useState<string>(() => {
    try {
      const path = window.location.pathname
      const items = baseMenuItems.filter((i) => i.href && !i.isLogout)
      const match = items
        .slice()
        .sort((a, b) => (b.href!.length - a.href!.length))
        .find((i) => (i.href === "/" ? path === "/" : path.startsWith(i.href!)))
      return match?.text ?? "Home"
    } catch {
      return "Home"
    }
  })

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen)
  const handleSearchToggle = () => setSearchOpen(!searchOpen)
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProfileMenuAnchor(event.currentTarget)
  const handleProfileMenuClose = () => setProfileMenuAnchor(null)
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    handleProfileMenuClose()
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery("")
  }

  const onSubmitSearch = () => {

    if (searchQuery.trim()) {
      console.log("Buscar:", searchQuery.trim())
    }
  }

  const handleMenuClick = (text: string, href?: string, isLogout?: boolean) => {
    if (isLogout) {
      handleLogout()
      return
    }
    setActiveItem(text)
    if (href) {
      // Simple navigation without depending on router context
      window.location.href = href
    }
    setDrawerOpen(false)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="fixed">
        <Toolbar sx={{ minHeight: 72, position: "relative" }}>
          {/* Left: menu + search (or search field when open) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
            {!searchOpen ? (
              <IconButton color="inherit" aria-label="search" onClick={handleSearchToggle}>
                <SearchIcon />
              </IconButton>
            ) : (
              <TextField
                placeholder="Buscar videojuegos, DLC, membresías..."
                variant="outlined"
                autoFocus
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch()
                  if (e.key === "Enter") onSubmitSearch()
                }}
                sx={{ width: { xs: "60vw", sm: "45vw", md: 440 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="Cerrar búsqueda" onClick={closeSearch} edge="end" size="small">
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Box>

          {/* Center: logo stays centered regardless */}
          <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <IconButton onClick={() => (window.location.href = "/")} sx={{ p: 0 }} aria-label="Ir al inicio">
              <img src={imgLogo} alt="Gaming Portal Logo" style={{ height: 56, objectFit: "contain" }} />
            </IconButton>
          </Box>

          {/* Right: cart (optional) + profile */}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            {onCartClick && (
              <IconButton color="inherit" sx={{ mr: 1 }} onClick={onCartClick} aria-label="Abrir carrito">
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}
            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 280, pt: 2, backgroundColor: "#1E2A3A", height: "100%" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #2A3441" }}>
            <Typography variant="h6" sx={{ color: "#FFFFFF", fontWeight: "bold" }}>
              Menú
            </Typography>
          </Box>
          <List sx={{ pt: 1 }}>
            {baseMenuItems.map((item) => (
              <StyledListItem
                key={item.text}
                isActive={!item.isLogout && activeItem === item.text}
                onClick={() => handleMenuClick(item.text, item.href, item.isLogout)}
                sx={{
                  backgroundColor: !item.isLogout && activeItem === item.text ? "#4A90E2" : "transparent",
                  color: !item.isLogout && activeItem === item.text ? "#FFFFFF" : "#B0BEC5",
                  "&:hover": {
                    backgroundColor:
                      !item.isLogout && activeItem === item.text ? "#4A90E2" : "rgba(74, 144, 226, 0.1)",
                  },
                  ...(item.isLogout && {
                    color: "#FF5252",
                    "& .MuiListItemIcon-root": {
                      color: "#FF5252",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(255, 82, 82, 0.1)",
                    },
                  }),
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </StyledListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            handleProfileMenuClose()
            window.location.href = "/perfil"
          }}
        >
          Mi Perfil
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleProfileMenuClose()
            window.location.href = "/productos"
          }}
        >
          Productos
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>Configuración</MenuItem>
        <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
      </Menu>
    </Box>
  )
}
