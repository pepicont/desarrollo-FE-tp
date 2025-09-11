"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Rating,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import cyberpunkImg from "../../assets/cyberpunk.jpg"
import fifaImg from "../../assets/fifa24.jpg"
import mw3Img from "../../assets/mw3.jpg"
import EditIcon from "@mui/icons-material/Edit"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "../../services/authService"
import { updateResenia, deleteResenia } from "../../services/reseniasService"
import { getUserResenias } from "../../services/reseniasService"
import ReviewModal from "../shared-components/ReviewModal"

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
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
})

// Interfaces para los datos del backend
interface Resenia {
  id: number
  detalle: string
  puntaje: number
  fecha: string
  usuario: {
    id: number
    nombre: string
    nombreUsuario: string
  }
  venta: {
    id: number
    fecha: string
    juego?: {
      id: number
      nombre: string
      imagen?: string // Campo opcional para imagen del juego
    }
    servicio?: {
      id: number
      nombre: string
      imagen?: string // Campo opcional para imagen del servicio
    }
    complemento?: {
      id: number
      nombre: string
      imagen?: string // Campo opcional para imagen del complemento
    }
  }
}

export default function MisResenasPage() {
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Estados para el modal reutilizable
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewModalMode, setReviewModalMode] = useState<'create' | 'edit'>('edit')
  const [currentProductData, setCurrentProductData] = useState<{
    name: string;
    image: string;
    ventaId?: number;
    reseniaId?: number;
  } | null>(null)
  
  const navigate = useNavigate()
  const location = useLocation()

  // Estados para manejar los datos
  const [resenias, setResenias] = useState<Resenia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [canRetry, setCanRetry] = useState(true)
  
  // Estado para el filtro de fecha
  const [dateFilter, setDateFilter] = useState<string>("todas")

  // Cargar reseñas del usuario autenticado
  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const token = authService.getToken()
        if (!token) {
          setError("No estás autenticado")
          setLoading(false)
          return
        }
        const resenasData = await getUserResenias(token)
        setResenias(resenasData.data)
        setCanRetry(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
          setCanRetry(false)
        } else if (error.status === 403) {
          setError("No tienes permisos para acceder a esta información.")
          setCanRetry(false)
        } else if (error.status === 404) {
          setError("Servicio no disponible. Contacta al administrador.")
          setCanRetry(false)
        } else {
          setError("Error al cargar las reseñas. Intenta nuevamente.")
          setCanRetry(true)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUserReviews()
  }, [])

  // Verificar si viene información desde misCompras para editar una reseña
  useEffect(() => {
    if (location.state && resenias.length > 0) { // Asegurar que las reseñas estén cargadas
      const { editMode, productName, reseniaId } = location.state;
      
      if (editMode && reseniaId) {
        // Buscar la reseña específica
        const resenia = resenias.find(r => r.id === reseniaId);
        if (resenia) {
          setCurrentProductData({
            name: productName,
            image: getProductImage(resenia.venta),
            reseniaId: reseniaId
          });
          setReviewModalMode('edit');
          setIsReviewModalOpen(true);
        }
      }
      
      // Limpiar el estado de navegación para evitar que se abra nuevamente
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, resenias, navigate, location.pathname]); // Depende de resenias para ejecutarse cuando estén cargadas

  // Función para formatear fechas, convierte una fecha en formato string a formato español legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
  }

  // Función para filtrar reseñas por fecha
  const filterReseniasByDate = (resenias: Resenia[]) => {
    if (dateFilter === "todas") return resenias;

    const now = new Date();
    
    return resenias.filter((resenia) => {
      const reseniaDate = new Date(resenia.fecha);
      switch (dateFilter) {
        case "este-mes":
          return reseniaDate.getMonth() === now.getMonth() && 
                 reseniaDate.getFullYear() === now.getFullYear();
        case "mes-pasado": {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          return reseniaDate.getMonth() === lastMonth.getMonth() && 
                 reseniaDate.getFullYear() === lastMonth.getFullYear();
        }
        case String(new Date().getFullYear()):
          return reseniaDate.getFullYear() === new Date().getFullYear();
        case "2024":
          return reseniaDate.getFullYear() === 2024;
        case "2023":
          return reseniaDate.getFullYear() === 2023;
        case "2022":
          return reseniaDate.getFullYear() === 2022;
        case "2021":
          return reseniaDate.getFullYear() === 2021;
        case "anteriores":
          return reseniaDate.getFullYear() <= 2020;
        default:
          return true;
      }
    });
  };

  // Obtener reseñas filtradas
  const filteredResenias = filterReseniasByDate(resenias);

  // Extrae el nombre del producto de una venta
  const getProductName = (venta: Resenia["venta"]) => {
    if (venta.juego) return venta.juego.nombre
    if (venta.servicio) return venta.servicio.nombre
    if (venta.complemento) return venta.complemento.nombre
    return "Producto desconocido"
  }

  // Función para obtener imagen del producto con sistema de fallback inteligente (significa que el sistema tiene múltiples niveles de respaldo que se ejecutan en orden de prioridad, tomando decisiones automáticas según el contexto (cuando lo conectemos a la base que tiene imagenes se va a ejecutar lo primero))
  const getProductImage = (venta: Resenia["venta"]) => {
    //  FUTURO: Imagen específica desde backend (cuando esté implementado)
    if (venta.juego?.imagen) return venta.juego.imagen
    if (venta.servicio?.imagen) return venta.servicio.imagen
    if (venta.complemento?.imagen) return venta.complemento.imagen

    //  PRESENTE: Imágenes por defecto según tipo (funciona ahora)
    if (venta.juego) return cyberpunkImg
    if (venta.servicio) return mw3Img
    if (venta.complemento) return fifaImg

    // Fallback final (es la última opción de respaldo cuando todas las demás condiciones fallan, para que no rompa la UI)
    return cyberpunkImg
  }

  const handleProductClick = (productId: number, productName: string) => {
    // Navega a la página de producto; enviamos estado por si se quiere usar luego
    navigate("/producto", { state: { productId, productName } })
  }

  // Funciones para el modal reutilizable
  const handleEditClick = (reseniaId: number) => {
    const resenia = resenias.find((r) => r.id === reseniaId)
    if (resenia) {
      const productName = resenia.venta.juego?.nombre || 
                         resenia.venta.servicio?.nombre || 
                         resenia.venta.complemento?.nombre || 
                         "Producto desconocido"
      
      const productImage = resenia.venta.juego?.imagen || 
                          resenia.venta.servicio?.imagen || 
                          resenia.venta.complemento?.imagen || 
                          cyberpunkImg // imagen por defecto
      
      setCurrentProductData({
        name: productName,
        image: productImage,
        reseniaId: reseniaId
      })
      setReviewModalMode('edit')
      setIsReviewModalOpen(true)
    }
  }

  const handleReviewModalClose = () => {
    setIsReviewModalOpen(false)
    setCurrentProductData(null)
  }

  const handleReviewModalSave = async (reviewData: { detalle: string; puntaje: number; fecha: string }) => {
    if (!currentProductData?.reseniaId) return

    try {
      const token = authService.getToken()
      if (!token) {
        setError("No estás autenticado")
        return
      }

      await updateResenia(token, currentProductData.reseniaId, reviewData)
      
      // Actualizar en UI local
      setResenias((prev) =>
        prev.map((r) => 
          r.id === currentProductData.reseniaId 
            ? { ...r, detalle: reviewData.detalle, puntaje: reviewData.puntaje, fecha: reviewData.fecha } 
            : r
        )
      )
      
      handleReviewModalClose()
    } catch (error) {
      console.error('Error al guardar la reseña:', error)
      setError("Error al guardar la reseña")
    }
  }

  const handleDeleteReview = async (reseniaId: number) => {
    setDeleteLoading(true)
    try {
      const token = authService.getToken()
      if (!token) {
        setError("No estás autenticado")
        return
      }

      await deleteResenia(token, reseniaId)
      
      // Remover de UI local
      setResenias((prev) => prev.filter((r) => r.id !== reseniaId))
      
      handleReviewModalClose()
    } catch (error) {
      console.error('Error al eliminar la reseña:', error)
      setError("Error al eliminar la reseña")
    } finally {
      setDeleteLoading(false)
    }
  }

  // Mostrar loading
  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
          <NavBar />
          <Container
            maxWidth="lg"
            sx={{ py: 4, mt: 8, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}
          >
            <CircularProgress size={60} />
          </Container>
        </Box>
      </ThemeProvider>
    )
  }

  // Mostrar error y  botón "Reintentar" en caso de error de conexión
  if (error) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
          <NavBar />
          <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
            <Alert
              severity="error"
              sx={{ width: "100%" }}
              action={
                canRetry ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setError("")
                      setLoading(true)
                      const fetchUserReviews = async () => {
                        try {
                          const token = authService.getToken()
                          if (!token) {
                            setError("No estás autenticado")
                            setLoading(false)
                            return
                          }
                          const resenasData = await getUserResenias(token)
                          setResenias(resenasData.data)
                          setCanRetry(true)
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } catch (error: any) {
                          if (error.status === 401) {
                            setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
                            setCanRetry(false)
                          } else if (error.status === 403) {
                            setError("No tienes permisos para acceder a esta información.")
                            setCanRetry(false)
                          } else if (error.status === 404) {
                            setError("Servicio no disponible. Contacta al administrador.")
                            setCanRetry(false)
                          } else {
                            setError("Error al cargar las reseñas. Intenta nuevamente.")
                            setCanRetry(true)
                          }
                        } finally {
                          setLoading(false)
                        }
                      }
                      fetchUserReviews()
                    }}
                  >
                    Reintentar
                  </Button>
                ) : // Para errores de sesión expirada, mostrar botón de login
                error.includes("Sesión expirada") ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      authService.logout()
                      window.location.href = "/login"
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                ) : null
              }
            >
              {error}
            </Alert>
          </Container>
        </Box>
      </ThemeProvider>
    )
  }
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
        {/* NavBar compartida */}
        <NavBar />

        {/* Contenido principal */}
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
          {/* Mensaje de agradecimiento */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h5" sx={{ color: "primary.main", fontWeight: "bold" }}>
              Gracias por contribuir a la comunidad
            </Typography>
          </Box>

          {/* Título con filtro centrado y botón Nueva reseña */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", flexGrow: 1 }}>
              Mis reseñas
            </Typography>
            
            {/* Filtro centrado */}
            <Box sx={{ mx: 4 }}>
              <FormControl size="small">
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  displayEmpty
                  variant="outlined"
                  sx={{
                    minWidth: 120,
                    height: 32,
                    backgroundColor: '#2a3441',
                    borderRadius: 3,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '& .MuiSelect-select': {
                      color: '#9ca3af',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#6b7280',
                      fontSize: '1.2rem',
                    },
                    '&:hover': {
                      backgroundColor: '#374151',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#1e2532',
                        border: '1px solid #374151',
                        borderRadius: 2,
                        mt: 0.5,
                        '& .MuiMenuItem-root': {
                          color: 'white',
                          fontSize: '0.875rem',
                          '&:hover': {
                            backgroundColor: '#374151',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#3a7bd5',
                            '&:hover': {
                              backgroundColor: '#2c5aa0',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="todas">📅 Todas</MenuItem>
                  <MenuItem value="este-mes">📅 Este mes</MenuItem>
                  <MenuItem value="mes-pasado">📅 Mes pasado</MenuItem>
                  <MenuItem value={String(new Date().getFullYear())}>📅 Año actual</MenuItem>
                  <MenuItem value="2024">📅 2024</MenuItem>
                  <MenuItem value="2023">📅 2023</MenuItem>
                  <MenuItem value="2022">📅 2022</MenuItem>
                  <MenuItem value="2021">📅 2021</MenuItem>
                  <MenuItem value="anteriores">📅 Anteriores</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Button
              variant="contained"
              onClick={() => navigate("/mis-compras")}
              sx={{
                background: "#3a7bd5",
                color: "white",
                fontWeight: "bold",
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  background: "#2c5aa0",
                  boxShadow: "none",
                  transform: "none",
                },
                transition: "all 0.3s ease",
              }}
            >
              Nueva reseña
            </Button>
          </Box>

          {/* Contador */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Mostrando {filteredResenias.length} de {resenias.length} reseñas
            </Typography>
          </Box>

          {/* Lista de reseñas */}
          {filteredResenias.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
                {resenias.length === 0 ? "No tienes reseñas aún" : "No hay reseñas para el filtro seleccionado"}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {resenias.length === 0 ? "¡Compra algunos productos y deja tus primeras reseñas!" : "Prueba con otro filtro de fecha"}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredResenias.map((resenia) => (
                <Card
                  key={resenia.id}
                  sx={{
                    bgcolor: "#1e2532",
                    borderRadius: 2,
                    border: "1px solid #2a3441",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      {/* Imagen del producto */}
                      <Avatar
                        src={getProductImage(resenia.venta)}
                        alt={getProductName(resenia.venta)}
                        sx={{ width: 80, height: 80, borderRadius: 1 }}
                        variant="rounded"
                      />

                      {/* Información de la reseña */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "primary.main",
                            fontWeight: "bold",
                            mb: 1,
                            cursor: "pointer",
                            textDecoration: "underline",
                            "&:hover": { color: "#6ba3f0" },
                          }}
                          onClick={() => handleProductClick(resenia.venta.id, getProductName(resenia.venta))}
                        >
                          {getProductName(resenia.venta)}
                        </Typography>

                        {/* Vista normal de la reseña */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                          <Rating
                            value={resenia.puntaje}
                            readOnly
                            size="small"
                            sx={{
                              "& .MuiRating-iconFilled": {
                                color: "#ffd700",
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {resenia.puntaje} estrellas
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Fecha de reseña: {formatDate(resenia.fecha)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                          "{resenia.detalle}"
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <IconButton
                          onClick={() => handleEditClick(resenia.id)}
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            "&:hover": { bgcolor: "#3a7bc8" },
                            mb: 1,
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Editar
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      {/* Modal Reutilizable */}
      {currentProductData && (
        <ReviewModal
          open={isReviewModalOpen}
          onClose={handleReviewModalClose}
          onSave={handleReviewModalSave}
          onDelete={reviewModalMode === 'edit' && currentProductData?.reseniaId ? 
            () => handleDeleteReview(currentProductData.reseniaId!) : undefined}
          mode={reviewModalMode}
          productName={currentProductData.name}
          productImage={currentProductData.image}
          loading={false}
          deleteLoading={deleteLoading}
          initialData={
            reviewModalMode === 'edit' && currentProductData.reseniaId ? (() => {
              const resenia = resenias.find(r => r.id === currentProductData.reseniaId);
              return resenia ? {
                detalle: resenia.detalle,
                puntaje: resenia.puntaje,
                fecha: resenia.fecha,
              } : undefined;
            })() : undefined
          }
        />
      )}
    </ThemeProvider>
  )
}
