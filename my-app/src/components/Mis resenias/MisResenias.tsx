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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import cyberpunkImg from "../../assets/cyberpunk.jpg"
import fifaImg from "../../assets/fifa24.jpg"
import mw3Img from "../../assets/mw3.jpg"
import EditIcon from "@mui/icons-material/Edit"
import { useNavigate } from "react-router-dom"
import { authService } from "../../services/authService"
import { updateResenia } from "../../services/reseniasService"
import { getUserResenias } from "../../services/reseniasService"

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
  const [editId, setEditId] = useState<number | null>(null)
  const [editDetalle, setEditDetalle] = useState("")
  const [editPuntaje, setEditPuntaje] = useState<number>(0)
  const [editFecha, setEditFecha] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const navigate = useNavigate()

  // Estados para manejar los datos
  const [resenias, setResenias] = useState<Resenia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [canRetry, setCanRetry] = useState(true)

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

  // Función para formatear fechas, convierte una fecha en formato string a formato español legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
  }

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

  const handleEditReview = (reviewId: number) => {
    const review = resenias.find((r) => r.id === reviewId)
    if (review) {
      setEditId(reviewId)
      setEditDetalle(review.detalle)
      setEditPuntaje(review.puntaje)
      setEditFecha(review.fecha)
      setIsEditModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditId(null)
    setEditDetalle("")
    setEditPuntaje(0)
    setEditFecha("")
  }

  const handleSaveReview = async () => {
    if (!editId) return

    setEditLoading(true)
    try {
      const token = authService.getToken()
      if (!token) {
        setError("No estás autenticado")
        return
      }
      const now = new Date().toISOString()
      await updateResenia(token, editId, {
        detalle: editDetalle,
        puntaje: editPuntaje,
        fecha: now,
      })
      // Actualizar en UI local
      setResenias((prev) =>
        prev.map((r) => (r.id === editId ? { ...r, detalle: editDetalle, puntaje: editPuntaje, fecha: now } : r)),
      )
      handleCloseModal()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Error al guardar la reseña")
    } finally {
      setEditLoading(false)
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

          {/* Título y contador */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                Mis reseñas
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Mostrando {resenias.length} de {resenias.length} reseñas
              </Typography>
            </Box>
          </Box>

          {/* Lista de reseñas */}
          {resenias.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
                No tienes reseñas aún
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                ¡Compra algunos productos y deja tus primeras reseñas!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {resenias.map((resenia) => (
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
                          onClick={() => handleEditReview(resenia.id)}
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

      {/* Modal de edición de reseña */}
      <Dialog
        open={isEditModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#141926",
            border: "2px solid #4a90e2",
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
          },
        }}
        BackdropProps={{
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)",
            color: "white",
            p: 3,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {editId &&
              (() => {
                const resenia = resenias.find((r) => r.id === editId)
                return resenia ? (
                  <>
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={getProductImage(resenia.venta)}
                        alt="Producto"
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          border: "3px solid rgba(255,255,255,0.2)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        }}
                        variant="rounded"
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
                        Editar Reseña
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        {getProductName(resenia.venta)}
                      </Typography>
                    </Box>
                  </>
                ) : null
              })()}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: "#141926" }}>
          {/* Rating Section */}
          <Box
            sx={{
              mt: 3,
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 2,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#4a90e2",
                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 2, fontWeight: "bold" }}>
              Calificación
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Rating
                value={editPuntaje}
                onChange={(_, value) => setEditPuntaje(value || 0)}
                size="large"
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#ffd700",
                    filter: "drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))",
                  },
                  "& .MuiRating-iconEmpty": {
                    color: "#2a3441",
                  },
                  "& .MuiRating-iconHover": {
                    color: "#ffed4e",
                  },
                }}
              />
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: "#4a90e2",
                  borderRadius: 1,
                  minWidth: "100px",
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" sx={{ color: "white", fontWeight: "bold" }}>
                  {editPuntaje} estrella{editPuntaje !== 1 ? "s" : ""}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Date Section */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 2,
              border: "1px solid #2a3441",
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 1, fontWeight: "bold" }}>
              Fecha de reseña
            </Typography>
            <Typography variant="body1" sx={{ color: "#b0b0b0" }}>
              {formatDate(editFecha)}
            </Typography>
          </Box>

          {/* Comment Section */}
          <Box
            sx={{
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 2,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#4a90e2",
                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 2, fontWeight: "bold" }}>
              Tu opinión
            </Typography>
            <TextField
              value={editDetalle}
              onChange={(e) => setEditDetalle(e.target.value)}
              multiline
              rows={5}
              fullWidth
              variant="outlined"
              placeholder="Comparte tu experiencia con este producto..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  bgcolor: "#141926",
                  fontSize: "1rem",
                  "& fieldset": {
                    borderColor: "#2a3441",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4a90e2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4a90e2",
                    boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#666",
                  opacity: 1,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 4,
            bgcolor: "#1e2532",
            borderTop: "2px solid #2a3441",
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            size="large"
            disabled={editLoading}
            sx={{
              color: "#b0b0b0",
              borderColor: "#2a3441",
              borderWidth: "2px",
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                borderColor: "#4a90e2",
                color: "#4a90e2",
                bgcolor: "rgba(74, 144, 226, 0.05)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveReview}
            variant="contained"
            size="large"
            disabled={editLoading}
            sx={{
              background: "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)",
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              minWidth: 120,
              boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #357abd 0%, #2968a3 100%)",
                boxShadow: "0 6px 16px rgba(74, 144, 226, 0.4)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "#2a3441",
                color: "#666",
              },
              transition: "all 0.3s ease",
            }}
          >
            {editLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Guardando...</span>
              </Box>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}
