"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import ModernPagination from "../shared-components/ModernPagination"
import { authService } from "../../services/authService"
import { getAllUsuarios, deleteUsuario, type Usuario as UsuarioAPI } from "../../services/usuarioService"

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

// Usar la interface del servicio
type Usuario = UsuarioAPI

export default function UsuariosPage() {
  // Estados para manejar los datos
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Estados para el modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState("")
  const [tempSearchQuery, setTempSearchQuery] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc') // Por defecto más recientes primero

  // Función para alternar el orden de clasificación
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    setPage(1) // Reset page when changing sort
  }

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
  }

  // Función para obtener iniciales del nombre
  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Función de filtrado y ordenado
  const getFilteredUsuarios = () => {
    return usuarios
      .filter((usuario: Usuario) => {
        const matchesSearch = searchQuery === "" || 
          usuario.nombreUsuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
          usuario.mail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          usuario.nombre.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesSearch
      })
      .sort((a, b) => {
        const dateA = new Date(a.fechaCreacion).getTime()
        const dateB = new Date(b.fechaCreacion).getTime()
        
        // Si las fechas son exactamente iguales, ordenar por ID como segundo criterio
        if (dateA === dateB) {
          return sortOrder === 'desc' ? b.id - a.id : a.id - b.id
        }
        
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      })
  }

  const filteredUsuarios = getFilteredUsuarios()
  const totalPages = Math.max(1, Math.ceil(filteredUsuarios.length / itemsPerPage))
  const paginatedUsuarios = filteredUsuarios.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Resetear página al cambiar filtros
  useEffect(() => { setPage(1) }, [searchQuery, usuarios.length, itemsPerPage, sortOrder])

  // Sincronizar búsqueda temporal
  useEffect(() => {
    if (searchQuery === "") {
      setTempSearchQuery("")
    }
  }, [searchQuery])

  // Cargar usuarios desde el backend
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = authService.getToken()
        if (!token) {
          setError("No estás autenticado")
          setLoading(false)
          return
        }
        
        const usuariosData = await getAllUsuarios(token)
        setUsuarios(usuariosData)
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'status' in error) {
          if (error.status === 401) {
            setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
          } else if (error.status === 403) {
            setError("No tienes permisos para acceder a esta información.")
          } else {
            setError("Error al cargar los usuarios. Intenta nuevamente.")
          }
        } else {
          setError("Error al cargar los usuarios. Intenta nuevamente.")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUsuarios()
  }, [])

  // Función para abrir modal de confirmación
  const handleDeleteUser = (userId: number) => {
    const usuario = usuarios.find(u => u.id === userId)
    if (usuario) {
      setUserToDelete(usuario)
      setDeleteModalOpen(true)
    }
  }

  // Función para confirmar eliminación
  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setDeleteLoading(true)
    try {
      const token = authService.getToken()
      
      if (!token) {
        setError("No estás autenticado")
        return
      }
      
      await deleteUsuario(token, userToDelete.id)
      setUsuarios(prev => prev.filter(user => user.id !== userToDelete.id))
      
      // Cerrar modal y limpiar
      setDeleteModalOpen(false)
      setUserToDelete(null)
      
    } catch (error: unknown) {
      console.error('Error al eliminar usuario:', error)
      setError("Error al eliminar el usuario")
    } finally {
      setDeleteLoading(false)
    }
  }

  // Función para cancelar eliminación
  const cancelDeleteUser = () => {
    setDeleteModalOpen(false)
    setUserToDelete(null)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
        {/* NavBar compartida */}
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
                <Box sx={{ maxWidth: 600, mx: "auto" }}>
                  <TextField
                    fullWidth
                    placeholder="Buscar usuarios..."
                    value={tempSearchQuery}
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSearchQuery(tempSearchQuery)
                      }
                    }}
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
                        height: 48,
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Header con título y controles */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Usuarios
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                  {/* Selector de items por página */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      Mostrar:
                    </Typography>
                    <FormControl size="small">
                      <Select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setPage(1)
                          setItemsPerPage(Number(e.target.value))
                        }}
                        sx={{
                          minWidth: 70,
                          height: 32,
                          backgroundColor: '#2a3441',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                          },
                          '& .MuiSelect-select': {
                            color: '#9ca3af',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            padding: '6px 8px',
                          },
                          '& .MuiSvgIcon-root': {
                            color: '#6b7280',
                          },
                          '&:hover': {
                            backgroundColor: '#374151',
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: '#1e2532',
                              border: '1px solid #374151',
                              borderRadius: 2,
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
                        <MenuItem value={15}>15</MenuItem>
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={sortOrder === 'desc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    onClick={toggleSortOrder}
                    sx={{
                      borderColor: "#4b5563",
                      color: "white",
                      "&:hover": { backgroundColor: "#374151", borderColor: "#6b7280" },
                    }}
                  >
                    {sortOrder === 'desc' ? 'Más antiguos' : 'Más recientes'}
                  </Button>
                </Box>
              </Box>

              {/* Lista de usuarios */}
              {filteredUsuarios.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
                    No se encontraron usuarios
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Intenta con otro término de búsqueda
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {paginatedUsuarios.map((usuario) => (
                    <Card
                      key={usuario.id}
                      sx={{
                        bgcolor: "#1e2532",
                        borderRadius: 2,
                        border: "1px solid #2a3441",
                        p: 3,
                      }}
                    >
                      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flex: 1 }}>
                            <Avatar 
                              sx={{ 
                                width: 48, 
                                height: 48, 
                                bgcolor: '#4a90e2',
                                fontSize: '1.1rem',
                                fontWeight: 600 
                              }}
                            >
                              {getInitials(usuario.nombre)}
                            </Avatar>

                            <Box sx={{ 
                              flex: 1, 
                              display: { xs: 'flex', md: 'grid' }, 
                              flexDirection: { xs: 'column', md: 'unset' },
                              gridTemplateColumns: { md: '1fr 1fr 1fr' }, 
                              gap: 3 
                            }}>
                              <Box>
                                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5 }}>
                                  Nombre de usuario
                                </Typography>
                                <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                                  {usuario.nombreUsuario}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5 }}>
                                  Email
                                </Typography>
                                <Typography variant="body1" sx={{ color: "white" }}>
                                  {usuario.mail}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5 }}>
                                  Fecha de creación
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <CalendarIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                                  <Typography variant="body1" sx={{ color: "white" }}>
                                    {formatDate(usuario.fechaCreacion)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>

                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteUser(usuario.id)}
                            sx={{
                              bgcolor: '#dc2626',
                              '&:hover': { bgcolor: '#b91c1c' },
                              textTransform: 'none',
                            }}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Paginación moderna */}
                  {filteredUsuarios.length > 0 && (
                    <ModernPagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  )}
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Modal de confirmación para eliminar usuario */}
      <Dialog
        open={deleteModalOpen}
        onClose={cancelDeleteUser}
        PaperProps={{
          sx: {
            bgcolor: "#141926",
            border: "2px solid #ef4444",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: "#ef4444", fontWeight: "bold" }}>
          ⚠️ Eliminar Usuario
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#b0b0b0" }}>
            ¿Estás seguro de que quieres eliminar a <strong style={{ color: "#ffffff" }}>{userToDelete?.nombreUsuario}</strong>?
            <br /><br />
            Esta acción no se puede deshacer y eliminará todos los datos asociados al usuario.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{
          p: 3,
          gap: 2,
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          width: '100%',
        }}>
          <Button 
            onClick={cancelDeleteUser}
            variant="outlined"
            sx={{
              color: "#b0b0b0",
              borderColor: "#2a3441",
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 1, sm: 0 },
              "&:hover": {
                borderColor: "#4a90e2",
                color: "#4a90e2",
              },
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDeleteUser}
            variant="contained"
            disabled={deleteLoading}
            sx={{
              backgroundColor: "#ef4444",
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 1, sm: 0 },
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
          >
            {deleteLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Eliminando...</span>
              </Box>
            ) : (
              "Sí, eliminar"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}