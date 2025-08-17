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
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  RateReview as ReviewIcon,
  ContactMail as ContactIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import imgLogo from "../../assets/logo.jpg"

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  borderBottom: `1px solid ${theme.palette.divider}`,
}))



const menuItems = [
  { text: "Mis Compras", icon: <ShoppingBagIcon />, action: () => console.log("Mis Compras") },
  { text: "Mis Reseñas", icon: <ReviewIcon />, action: () => console.log("Mis Reseñas") },
  { text: "Contáctenos", icon: <ContactIcon />, action: () => console.log("Contáctenos") },
  { text: "Cerrar Sesión", icon: <LogoutIcon />, action: () => { localStorage.removeItem("authToken"); localStorage.removeItem("user"); } },
]

export default function NavBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null)

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          {!searchOpen && (
            <IconButton color="inherit" aria-label="search" onClick={handleSearchToggle} sx={{ mr: 2 }}>
              <SearchIcon />
            </IconButton>
          )}
          {searchOpen ? (
            <Box sx={{ flexGrow: 1, mx: 2 }}>
              <TextField
                fullWidth
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
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
              <IconButton
                onClick={() => window.location.href = "/"}
                sx={{ p: 0 }}
                aria-label="Ir al inicio"
              >
                <img
                  src={imgLogo}
                  alt="Gaming Portal Logo"
                  style={{ height: 40, objectFit: "contain" }}
                />
              </IconButton>
            </Box>
          )}
          <IconButton color="inherit" onClick={handleProfileMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </StyledAppBar>
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
                sx={{ cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
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
        <MenuItem onClick={handleProfileMenuClose}>Mi Perfil</MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>Configuración</MenuItem>
        <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
      </Menu>
    </Box>
  )
}
