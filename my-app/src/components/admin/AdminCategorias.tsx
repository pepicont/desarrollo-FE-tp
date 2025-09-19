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
  Category as CategoryIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import ModernPagination from "../shared-components/ModernPagination"
import CategoryModal from "./CategoryModal"
import { authService } from "../../services/authService"
import { getAllCategoriesAdmin, deleteCategoryAsAdmin, createCategory, type Category } from "../../services/categoryService"

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

export default function AdminCategoriasPage() {
  // Estados para manejar los datos
  const [categorias, setCategorias] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Estados para el modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Estados para el modal de agregar categoría
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  
  // Estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState("")
  const [tempSearchQuery, setTempSearchQuery] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc') // Alfabéticamente A-Z por defecto

  // Función para alternar el orden de clasificación
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    setPage(1) // Reset page when changing sort
  }

  // Función de filtrado y ordenado
  const getFilteredCategorias = () => {
    return categorias
      .filter((categoria: Category) => {
        const matchesSearch = searchQuery === "" || 
          categoria.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          categoria.detalle.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesSearch
      })
      .sort((a, b) => {
        const nameA = a.nombre.toLowerCase()
        const nameB = b.nombre.toLowerCase()
        
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      })
  }

  const filteredCategorias = getFilteredCategorias()
  const totalPages = Math.max(1, Math.ceil(filteredCategorias.length / itemsPerPage))
  const paginatedCategorias = filteredCategorias.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Resetear página al cambiar filtros
  useEffect(() => { setPage(1) }, [searchQuery, categorias.length, itemsPerPage, sortOrder])

  // Sincronizar búsqueda temporal
  useEffect(() => {
    if (searchQuery === "") {
      setTempSearchQuery("")
    }
  }, [searchQuery])

  // Cargar categorías desde el backend
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = authService.getToken()
        if (!token) {
          setError("No estás autenticado")
          setLoading(false)
          return
        }
        
        const categoriasData = await getAllCategoriesAdmin(token)
        setCategorias(categoriasData)
      } catch (error: unknown) {
        console.error('Error detallado al cargar categorías:', error)
        if (error && typeof error === 'object' && 'status' in error) {
          if (error.status === 401) {
            setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
          } else if (error.status === 403) {
            setError("No tienes permisos para acceder a esta información.")
          } else {
            setError(`Error al cargar las categorías. Status: ${error.status}`)
          }
        } else {
          setError(`Error al cargar las categorías: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCategorias()
  }, [])

  // Función para abrir modal de confirmación
  const handleDeleteCategory = (categoryId: number) => {
    const categoria = categorias.find(c => c.id === categoryId)
    if (categoria) {
      setCategoryToDelete(categoria)
      setDeleteModalOpen(true)
    }
  }

  // Función para confirmar eliminación
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    setDeleteLoading(true)
    try {
      const token = authService.getToken()
      
      if (!token) {
        setError("No estás autenticado")
        return
      }
      
      await deleteCategoryAsAdmin(token, categoryToDelete.id)
      setCategorias(prev => prev.filter(category => category.id !== categoryToDelete.id))
      
      // Cerrar modal y limpiar
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
      
    } catch (error: unknown) {
      console.error('Error detallado al eliminar categoría:', error)
      
      // Mostrar error más específico
      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        } else if (error.status === 403) {
          setError("No tienes permisos para eliminar categorías")
        } else if (error.status === 400 || error.status === 409) {
          setError("No se puede eliminar esta categoría porque tiene productos asociados")
        } else {
          setError(`Error al eliminar la categoría (${error.status})`)
        }
      } else {
        setError(`Error al eliminar la categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    } finally {
      setDeleteLoading(false)
      // Cerrar modal siempre, incluso cuando hay error
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
    }
  }

  // Función para cancelar eliminación
  const cancelDeleteCategory = () => {
    setDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  // Función para agregar categoría
  const handleAddCategory = async (categoryData: { nombre: string; detalle: string }) => {
    setAddLoading(true)
    try {
      const token = authService.getToken()
      
      if (!token) {
        setError("No estás autenticado")
        return
      }
      
      const newCategory = await createCategory(token, categoryData)
      setCategorias(prev => [...prev, newCategory])
      
    } catch (error: unknown) {
      console.error('Error al crear categoría:', error)
      setError("Error al crear la categoría")
    } finally {
      setAddLoading(false)
    }
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
                    placeholder="Buscar categorías..."
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
                    Categorías
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Mostrando {filteredCategorias.length} de {categorias.length} categorías
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {/* Selector de items por página */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                      Mostrar:
                    </Typography>
                    <FormControl size="small">
                      <Select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        sx={{
                          bgcolor: "background.paper",
                          minWidth: 80,
                          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        }}
                      >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={15}>15</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Botón de ordenamiento */}
                  <Button
                    variant="outlined"
                    onClick={toggleSortOrder}
                    startIcon={sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    sx={{
                      textTransform: "none",
                      bgcolor: "background.paper",
                      borderColor: "#2a3441",
                      color: "text.primary",
                      "&:hover": {
                        bgcolor: "#141926",
                        borderColor: "#4a90e2",
                      },
                    }}
                  >
                    {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                  </Button>

                  {/* Botón de agregar categoría */}
                  <Button
                    variant="contained"
                    onClick={() => setAddModalOpen(true)}
                    startIcon={<CategoryIcon />}
                    sx={{
                      background: "#3a7bd5",
                      color: "white",
                      fontWeight: "bold",
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "#2c5aa0",
                        boxShadow: "none",
                        transform: "none",
                      },
                    }}
                  >
                    Agregar Categoría
                  </Button>
                </Box>
              </Box>

              {/* Lista de categorías */}
              {filteredCategorias.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
                    No se encontraron categorías
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Intenta con otro término de búsqueda
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {paginatedCategorias.map((categoria) => (
                    <Card
                      key={categoria.id}
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
                            <Box sx={{ 
                              flex: 1, 
                              display: { xs: 'flex', md: 'grid' }, 
                              flexDirection: { xs: 'column', md: 'unset' },
                              gridTemplateColumns: { md: '200px 1fr' }, 
                              gap: 3 
                            }}>
                              <Box>
                                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5 }}>
                                  Nombre de la categoría
                                </Typography>
                                <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                                  {categoria.nombre}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5 }}>
                                  Detalle
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <CategoryIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                                  <Typography variant="body1" sx={{ color: "white" }}>
                                    {categoria.detalle}
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
                            onClick={() => handleDeleteCategory(categoria.id)}
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
                  {filteredCategorias.length > 0 && (
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

      {/* Modal para agregar categoría */}
      <CategoryModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddCategory}
        loading={addLoading}
      />

      {/* Modal de confirmación para eliminar categoría */}
      <Dialog
        open={deleteModalOpen}
        onClose={cancelDeleteCategory}
        PaperProps={{
          sx: {
            bgcolor: "#141926",
            border: "2px solid #ef4444",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: "#ef4444", fontWeight: "bold" }}>
          ⚠️ Eliminar Categoría
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#b0b0b0" }}>
            ¿Estás seguro de que quieres eliminar la categoría <strong style={{ color: "#ffffff" }}>{categoryToDelete?.nombre}</strong>?
            <br /><br />
            Esta acción no se puede deshacer y eliminará todos los datos asociados a la categoría.
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
            onClick={cancelDeleteCategory}
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
            onClick={confirmDeleteCategory}
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