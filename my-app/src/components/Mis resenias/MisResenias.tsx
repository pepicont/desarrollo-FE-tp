"use client"

import { useState, useEffect } from "react"
import { Box, Container, Typography, Card, CardContent, Rating, Avatar, IconButton, CircularProgress, Alert, Button } from "@mui/material"
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
  id: number;
  detalle: string;
  puntaje: number;
  fecha: string;
  usuario: {
    id: number;
    nombre: string;
    nombreUsuario: string;
  };
  venta: {
    id: number;
    fecha: string;
    juego?: {
      id: number;
      nombre: string;
      imagen?: string; // Campo opcional para imagen del juego
    };
    servicio?: {
      id: number;
      nombre: string;
      imagen?: string; // Campo opcional para imagen del servicio
    };
    complemento?: {
      id: number;
      nombre: string;
      imagen?: string; // Campo opcional para imagen del complemento
    };
  };
}

export default function MisResenasPage() {
  const [editId, setEditId] = useState<number | null>(null)
  const [editDetalle, setEditDetalle] = useState("")
  const [editPuntaje, setEditPuntaje] = useState<number>(0)
  const [editFecha, setEditFecha] = useState("")
  const [editLoading, setEditLoading] = useState(false)
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
          setError('No estás autenticado')
          setLoading(false)
          return
        }
        const resenasData = await getUserResenias(token)
        setResenias(resenasData.data)
        setCanRetry(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
          setCanRetry(false)
        } else if (error.status === 403) {
          setError('No tienes permisos para acceder a esta información.')
          setCanRetry(false)
        } else if (error.status === 404) {
          setError('Servicio no disponible. Contacta al administrador.')
          setCanRetry(false)
        } else {
          setError('Error al cargar las reseñas. Intenta nuevamente.')
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
  const getProductName = (venta: Resenia['venta']) => {
    if (venta.juego) return venta.juego.nombre
    if (venta.servicio) return venta.servicio.nombre
    if (venta.complemento) return venta.complemento.nombre
    return "Producto desconocido"
  }

  // Función para obtener imagen del producto con sistema de fallback inteligente (significa que el sistema tiene múltiples niveles de respaldo que se ejecutan en orden de prioridad, tomando decisiones automáticas según el contexto (cuando lo conectemos a la base que tiene imagenes se va a ejecutar lo primero))
  const getProductImage = (venta: Resenia['venta']) => {
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
    const review = resenias.find(r => r.id === reviewId)
    if (review) {
      setEditId(reviewId)
      setEditDetalle(review.detalle)
      setEditPuntaje(review.puntaje)
      setEditFecha(review.fecha)
    }
  }

  // Mostrar loading
  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
          <NavBar />
          <Container maxWidth="lg" sx={{ py: 4, mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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
                      setError('')
                      setLoading(true)
                      const fetchUserReviews = async () => {
                        try {
                          const token = authService.getToken()
                          if (!token) {
                            setError('No estás autenticado')
                            setLoading(false)
                            return
                          }
                          const resenasData = await getUserResenias(token)
                          setResenias(resenasData.data)
                          setCanRetry(true)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } catch (error: any) {
                          if (error.status === 401) {
                            setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
                            setCanRetry(false)
                          } else if (error.status === 403) {
                            setError('No tienes permisos para acceder a esta información.')
                            setCanRetry(false)
                          } else if (error.status === 404) {
                            setError('Servicio no disponible. Contacta al administrador.')
                            setCanRetry(false)
                          } else {
                            setError('Error al cargar las reseñas. Intenta nuevamente.')
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
                ) : (
                  // Para errores de sesión expirada, mostrar botón de login
                  error.includes('Sesión expirada') ? (
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={() => {
                        authService.logout()
                        window.location.href = '/login'
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                  ) : null
                )
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
            <Box sx={{ textAlign: 'center', py: 4 }}>
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
                        sx={{ width: 80, height: 80, borderRadius: 12 }}
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

                        {editId === resenia.id ? (
                          <>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                              <Rating
                                value={editPuntaje}
                                onChange={(_, value) => setEditPuntaje(value || 0)}
                                size="small"
                                sx={{
                                  "& .MuiRating-iconFilled": {
                                    color: "#ffd700",
                                  },
                                }}
                              />
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {editPuntaje} estrellas
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Fecha de reseña: {formatDate(editFecha)}
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <textarea
                                value={editDetalle}
                                onChange={e => setEditDetalle(e.target.value)}
                                rows={3}
                                style={{ width: "100%", borderRadius: 8, padding: 8, fontSize: "1rem" }}
                              />
                            </Box>
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Button
                                variant="contained"
                                size="small"
                                disabled={editLoading}
                                onClick={async () => {
                                  setEditLoading(true)
                                  try {
                                    const token = authService.getToken()
                                    if (!token) {
                                      setError('No estás autenticado')
                                      setLoading(false)
                                      return
                                    }
                                    const now = new Date().toISOString()
                                    await updateResenia(token, resenia.id, {
                                      detalle: editDetalle,
                                      puntaje: editPuntaje,
                                      fecha: now,
                                    })
                                    // Actualizar en UI local
                                    setResenias(prev => prev.map(r => r.id === resenia.id ? { ...r, detalle: editDetalle, puntaje: editPuntaje, fecha: now } : r))
                                    setEditId(null)
                                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                  } catch (err) {
                                    setError("Error al guardar la reseña")
                                  } finally {
                                    setEditLoading(false)
                                  }
                                }}
                              >Guardar</Button>
                              <Button variant="outlined" size="small" onClick={() => setEditId(null)}>Cancelar</Button>
                            </Box>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {editId === resenia.id ? null : (
                          <>
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
                          </>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  )
}
