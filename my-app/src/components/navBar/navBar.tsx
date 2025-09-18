import * as React from "react"
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  /*Badge,*/
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Typography,
  Modal,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  /*ShoppingCart as ShoppingCartIcon,*/
  ShoppingBag as ShoppingBagIcon,
  RateReview as ReviewIcon,
  ContactMail as ContactIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  SportsEsports as SportsEsportsIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Close,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import imgLogo from "../../assets/logo-navbar.png"
import { useState } from "react"
import CircularProgress from "@mui/material/CircularProgress"
import { mailService } from "../../services/mailService"
import {authService} from "../../services/authService"




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

// Menú para usuarios normales
const userMenuItems = [
  { text: "Home", icon: <HomeIcon />, href: "/" },
  { text: "Productos", icon: <SportsEsportsIcon />, href: "/productos" },
  { text: "Mis compras", icon: <ShoppingBagIcon />, href: "/mis-compras" },
  { text: "Mis reseñas", icon: <ReviewIcon />, href: "/mis-resenas" },
  { text: "Acerca de nosotros", icon: <InfoIcon />, href: "/about-us" },
  { text: "Contáctenos", icon: <ContactIcon /> },
  { text: "Cerrar sesión", icon: <LogoutIcon />, href: "__logout__", isLogout: true },
]

// Menú para administradores
const adminMenuItems = [
  { text: "Home", icon: <HomeIcon />, href: "/" },
  { text: "Productos", icon: <SportsEsportsIcon />, href: "/productos" },
  { text: "Usuarios", icon: <PersonIcon />, href: "/admin/usuarios" },
  { text: "Reseñas", icon: <ReviewIcon />, href: "/admin/resenias" },
  { text: "Compañías", icon: <BusinessIcon />, href: "/admin/companias" },
  { text: "Categorías", icon: <CategoryIcon />, href: "/admin/categorias" },
  { text: "Cerrar sesión", icon: <LogoutIcon />, href: "__logout__", isLogout: true },
]

/*type NavBarProps = {
  onCartClick?: () => void
  cartCount?: number
}*/



export default function NavBar(/*{ onCartClick, cartCount = 0 }: NavBarProps*/) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null)
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    if (!user || !token) {
      const sessionUser = sessionStorage.getItem("user");
      const sessionToken = sessionStorage.getItem("authToken");
      return !!sessionUser && !!sessionToken;
    }
    return !!user && !!token;
  });
  const [isAdmin, setIsAdmin] = React.useState(false);
  
  React.useEffect(() => {
    if (!isLoggedIn) {
      setIsAdmin(false);
      return;
    }
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setIsAdmin(parsed.tipoUsuario === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [isLoggedIn]);

  // Elimina el estado local 'nombre' y usa una función para obtener el nombre actual
  function getNombreUsuario() {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      const fullName = parsed.nombre || "Usuario sin nombre";
      return fullName.split(" ")[0];
    }
    return "Usuario sin nombre";
  }


  // Función para obtener el menú según el tipo de usuario
  const getCurrentMenuItems = () => {
    return isAdmin ? adminMenuItems : userMenuItems;
  };

  // Actualizar activeItem cuando cambie el tipo de usuario
  React.useEffect(() => {
    try {
      const path = window.location.pathname
      if (path.startsWith("/productos") || path.startsWith("/producto")) {
        setActiveItem("Productos")
        return
      }
      
      const currentMenu = isAdmin ? adminMenuItems : userMenuItems
      const items = currentMenu.filter((i) => i.href && !i.isLogout)
      const match = items
        .slice()
        .sort((a, b) => (b.href!.length - a.href!.length))
        .find((i) => (i.href === "/" ? path === "/" : path.startsWith(i.href!)))
      setActiveItem(match?.text ?? "Home")
    } catch {
      setActiveItem("Home")
    }
  }, [isAdmin]);

  const [activeItem, setActiveItem] = React.useState<string>(() => {
    try {
      const path = window.location.pathname
      if (path.startsWith("/productos") || path.startsWith("/producto")) {
        return "Productos"
      }
      // Usar menú de usuario por defecto en la inicialización
      const items = userMenuItems.filter((i) => i.href && !i.isLogout)
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
    authService.logout();
    setIsLoggedIn(false)
    handleProfileMenuClose()
    window.location.href = "/"  //manda al home cuando cierra sesión


    
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery("")
  }

  const onSubmitSearch = () => {
    const q = searchQuery.trim()
    if (!q) return
    // Navegar a la página de productos con el parámetro de búsqueda
    const url = `/productos?q=${encodeURIComponent(q)}`
    window.location.href = url
    closeSearch()
  }

  const handleMenuClick = (text: string, href?: string, isLogout?: boolean) => {
    if (isLogout) {
      handleLogout()
      return
    }
    if (text === "Contáctenos") {
      handleOpenModal()
      setDrawerOpen(false)
      return
    }
    setActiveItem(text)
    if (href) {
      // Simple navigation without depending on router context
      window.location.href = href
    }
    setDrawerOpen(false)
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    asunto: "",
    descripcion: "",
  })
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultModal, setResultModal] = useState<{ open: boolean; success: boolean }>({ open: false, success: false });
    const handleOpenModal = () => setModalOpen(true)
     // Función de validación de email
     const validateEmail = (email: string) => {
       if (!email || !/\S+@\S+\.\S+/.test(email)) {
         setEmailError(true);
         setEmailErrorMessage("Por favor ingresa una dirección de correo válida.");
         return false;
       } else {
         setEmailError(false);
         setEmailErrorMessage("");
         return true;
       }
     };
    const handleCloseModal = () => {
      setModalOpen(false)
      setFormData({ email: "", asunto: "", descripcion: "" })
    }
  
    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    }
  
    const handleSubmit = async () => {
      const emailToSend = userEmail || formData.email;
      if (!validateEmail(emailToSend)) return;
      setLoading(true);
      try {
        await mailService.sendMail({
          mail: emailToSend,
          asunto: formData.asunto,
          detalle: formData.descripcion,
        });
        setLoading(false);
        handleCloseModal();
        setResultModal({ open: true, success: true });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setLoading(false);
        handleCloseModal();
        setResultModal({ open: true, success: false });
      }
    }

    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let userEmail = "";
    let avatarUrl: string | undefined = undefined;
    if (user) {
       try {
    const parsed = JSON.parse(user);
    userEmail = parsed.mail || parsed.email || "";
    avatarUrl = parsed.avatarUrl || parsed.urlFoto;
  } catch {console.log("Error parsing user data")}
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
          {isLoggedIn && <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            {/* {onCartClick && (
              <IconButton color="inherit" sx={{ mr: 1 }} onClick={onCartClick} aria-label="Abrir carrito">
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )} */}
            <Typography variant="body1" className="hide-on-mobile" sx={{ mr: 1 }}>
              Hola, {getNombreUsuario()}!
            </Typography>
            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              {/* Mostrar siempre el avatar del usuario */}
              <Avatar src={avatarUrl} sx={{ width: 32, height: 32 }} />
            </IconButton>
          </Box>}

          {/* Acá debería ir un botón de iniciar sesión si no está logueado */}
          {!isLoggedIn && (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>

              <Button color ="inherit" variant="contained"size="large"sx={{ textTransform: "none", borderColor: "#ffffffff", color: "#ffffffff", "&:hover": { backgroundColor: "#003e7cff" } }}
               onClick={() => (window.location.href = "/login")}>
                Iniciar Sesión
              </Button>
            </Box>
          )}
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
            {getCurrentMenuItems()
              .filter((item) => !item.isLogout || isLoggedIn)
              .map((item) => (
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
        <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
      </Menu>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-consulta-titulo"
        aria-describedby="modal-consulta-descripcion"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "500px" },
            bgcolor: "#232b3b",
            border: "1px solid #2A3441",
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#293042", p: 2 }}>
            <Typography id="modal-consulta-titulo" variant="h5" component="h2" sx={{ color: "#FFFFFF", fontWeight: "bold" }}>
              Enviar Consulta
            </Typography>
            <IconButton onClick={handleCloseModal} sx={{ color: "#B0BEC5", "&:hover": { color: "#FFFFFF" } }}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ borderBottom: "1px solid #3a4256" }} />

          {/* Formulario */}
          <Box sx={{ bgcolor: "#1e2532", p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                fullWidth
                label="Email para contactarte"
                type="email"
                value={userEmail || formData.email}
                onChange={handleInputChange("email")}
                variant="outlined"
                disabled={!!userEmail}
                error={emailError}
                helperText={emailErrorMessage}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#FFFFFF",
                    "& fieldset": {
                      borderColor: "#2A3441",
                    },
                    "&:hover fieldset": {
                      borderColor: "#4A90E2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4A90E2",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#B0BEC5",
                    "&.Mui-focused": {
                      color: "#4A90E2",
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Asunto de la consulta"
                value={formData.asunto}
                onChange={handleInputChange("asunto")}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#FFFFFF",
                    "& fieldset": {
                      borderColor: "#2A3441",
                    },
                    "&:hover fieldset": {
                      borderColor: "#4A90E2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4A90E2",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#B0BEC5",
                    "&.Mui-focused": {
                      color: "#4A90E2",
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={4}
                value={formData.descripcion}
                onChange={handleInputChange("descripcion")}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#FFFFFF",
                    "& fieldset": {
                      borderColor: "#2A3441",
                    },
                    "&:hover fieldset": {
                      borderColor: "#4A90E2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4A90E2",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#B0BEC5",
                    "&.Mui-focused": {
                      color: "#4A90E2",
                    },
                  },
                }}
              />
            </Box>
          </Box>
          <Box sx={{ borderBottom: "1px solid #3a4256" }} />
          {/* Botones */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", bgcolor: "#293042", p: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderColor: "#bdbdbd",
                color: "#bdbdbd",
                backgroundColor: "transparent",
                fontWeight: 400,
                boxShadow: "none",
                '&:hover': {
                  borderColor: "#757575",
                  backgroundColor: "rgba(189,189,189,0.08)",
                  color: "#757575",
                },
              }}
            >
              Cerrar
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                loading ||
                (!userEmail && !formData.email) ||
                !formData.asunto ||
                !formData.descripcion
              }
              sx={{
                backgroundColor: "#4A90E2",
                "&:hover": {
                  backgroundColor: "#357ABD",
                },
                "&:disabled": {
                  backgroundColor: "#2A3441",
                  color: "#666",
                },
              }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </Box>
        </Box>
      </Modal>
        {/* Modal de resultado de envío */}
      <Modal
        open={resultModal.open}
        onClose={() => setResultModal({ open: false, success: false })}
        aria-labelledby="modal-resultado-envio"
        aria-describedby="modal-resultado-envio-desc"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "500px" },
            bgcolor: "#232b3b",
            border: "1px solid #2A3441",
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#293042", p: 2 }}>
            <Typography id="modal-resultado-envio" variant="h5" component="h2" sx={{ color: "#FFFFFF", fontWeight: "bold" }}>
              Confirmación de envío
            </Typography>
            <IconButton onClick={() => setResultModal({ open: false, success: false })} sx={{ color: "#B0BEC5", "&:hover": { color: "#FFFFFF" } }}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ borderBottom: "1px solid #3a4256" }} />

          {/* Cuerpo */}
          <Box sx={{ bgcolor: "#1e2532", p: 3, textAlign: "left" }}>
            <Typography sx={{ color: "#B0BEC5", fontWeight: 400, mb: 2 }}>
              Consulta enviada con éxito.<br></br> Recibirás una respuesta por parte de nuestros administradores a la brevedad.
            </Typography>
          </Box>
          <Box sx={{ borderBottom: "1px solid #3a4256" }} />
          {/* Botón */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", bgcolor: "#293042", p: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setResultModal({ open: false, success: false })}
              sx={{
                borderColor: "#bdbdbd",
                color: "#bdbdbd",
                backgroundColor: "transparent",
                fontWeight: 400,
                boxShadow: "none",
                '&:hover': {
                  borderColor: "#757575",
                  backgroundColor: "rgba(189,189,189,0.08)",
                  color: "#757575",
                },
              }}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
    
  )
}

