"use client"
import { useState, useEffect } from "react"
import {
  Typography,
  Box,
  Container,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import cyberpunkImg from "../../assets/cyberpunk.jpg"
import fifaImg from "../../assets/fifa24.jpg"
import mw3Img from "../../assets/mw3.jpg"
import NavBar from "../navBar/navBar"
import { authService } from "../../services/authService"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#141926",
      paper: "#1e2532",
    },
    primary: {
      main: "#4a90e2",
    },
    secondary: {
      main: "#f39c12",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e2532",
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
  },
})

// Interface para los datos del backend
interface Venta {
  id: number;
  fecha: string;
  idVenta: number;
  codActivacion?: string;
  usuario: {
    id: number;
    nombre: string;
    nombreUsuario: string;
  };
  juego?: {
    id: number;
    titulo: string;
    precio: number;
  };
  servicio?: {
    id: number;
    nombre: string;
    precio: number;
  };
  complemento?: {
    id: number;
    nombre: string;
    precio: number;
  };
}

export default function MisComprasPage() {
  // Estados para manejar los datos
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  // Cargar ventas del usuario autenticado
  useEffect(() => {
    const fetchUserPurchases = async () => {
      try {
        const token = authService.getToken()
        
        if (!token) {
          setError('No estás autenticado')
          setLoading(false)
          return
        }

        // Ahora obtenemos directamente las ventas del usuario
        const ventasResponse = await fetch('http://localhost:3000/api/venta/my-ventas', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (ventasResponse.ok) {
          const ventasData = await ventasResponse.json()
          
          // Ya no necesitamos filtrar - el backend nos envía solo las del usuario
          setVentas(ventasData.data)
        } else {
          setError('Error al cargar las compras')
        }
      } catch (error) {
        console.error('Error fetching purchases:', error)
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    fetchUserPurchases()
  }, [])



  const filteredVentas = ventas.filter((venta: Venta) => {
    const productName = getProductName(venta)
    const matchesSearch = searchQuery === "" || 
      productName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate = dateFilter === "" || venta.fecha.includes(dateFilter)

    return matchesSearch && matchesDate
  })

  // Funciones auxiliares
  const getProductName = (venta: Venta) => {
    if (venta.juego) return venta.juego.titulo
    if (venta.servicio) return venta.servicio.nombre
    if (venta.complemento) return venta.complemento.nombre
    return "Producto desconocido"
  }

  const getProductPrice = (venta: Venta) => {
    if (venta.juego) return venta.juego.precio
    if (venta.servicio) return venta.servicio.precio
    if (venta.complemento) return venta.complemento.precio
    return 0
  }

  const getProductImage = (venta: Venta) => {
    // Por ahora usamos imágenes por defecto, más adelante se puede mejorar
    if (venta.juego) return cyberpunkImg
    if (venta.servicio) return mw3Img
    if (venta.complemento) return fifaImg
    return cyberpunkImg
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
  {/* Shared NavBar */}
  <NavBar />

        {/* Contenido principal */}
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </Box>
          ) : (
            <>
              {/* Barra de búsqueda */}
              <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Buscar en mis compras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {/* Header con título y filtros */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Mis compras
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Mostrando {filteredVentas.length} de {ventas.length} compras
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDialogOpen(true)}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.light",
                  bgcolor: "primary.main",
                  color: "white",
                },
              }}
            >
              FILTROS
            </Button>
          </Box>

          {/* Lista de compras */}
          {filteredVentas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
                No tienes compras aún
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                ¡Explora nuestro catálogo y realiza tu primera compra!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredVentas.map((venta) => (
                <Card
                  key={venta.id}
                  sx={{
                    bgcolor: "#1e2532",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={getProductImage(venta)}
                          alt={getProductName(venta)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                          {getProductName(venta)}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {formatDate(venta.fecha)}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ color: "primary.main", fontWeight: "bold" }}>
                          ${getProductPrice(venta).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Chip
                          label="Completada"
                          color="success"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        {venta.codActivacion && (
                          <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                            Código: {venta.codActivacion}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
            </>
          )}
        </Container>

        {/* Dialog de filtros */}
        <Dialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          PaperProps={{
            sx: { bgcolor: "background.paper", minWidth: 400 },
          }}
        >
          <DialogTitle>Filtrar compras</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Filtrar por fecha</InputLabel>
              <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} label="Filtrar por fecha">
                <MenuItem value="">Todas las fechas</MenuItem>
                <MenuItem value="2024-01">Enero 2024</MenuItem>
                <MenuItem value="2023-12">Diciembre 2023</MenuItem>
                <MenuItem value="2023-11">Noviembre 2023</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button onClick={() => setFilterDialogOpen(false)}>Cancelar</Button>
              <Button variant="contained" onClick={() => setFilterDialogOpen(false)}>
                Aplicar filtros
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}
