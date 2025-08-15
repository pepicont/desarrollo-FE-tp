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
  Paper,
  Fade,
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

const menuItems = [
  { text: "Mis Compras", icon: <ShoppingBagIcon />, action: () => console.log("Mis Compras") },
  { text: "Mis Reseñas", icon: <ReviewIcon />, action: () => console.log("Mis Reseñas") },
  { text: "Contáctenos", icon: <ContactIcon />, action: () => console.log("Contáctenos") },
  { text: "Cerrar Sesión", icon: <LogoutIcon />, action: () => { localStorage.removeItem("authToken"); localStorage.removeItem("user"); } },
]

export default function NavBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="search" onClick={handleSearchToggle} sx={{ mr: 2 }}>
            <SearchIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "center" }}>
            GAMING PORTAL
          </Typography>
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
      {searchOpen && (
        <SearchContainer onClick={handleSearchToggle}>
          <Fade in={searchOpen}>
            <SearchBox onClick={e => e.stopPropagation()}>
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
