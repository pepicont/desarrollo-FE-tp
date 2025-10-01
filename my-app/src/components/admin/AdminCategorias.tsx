"use client"

import { useState, useEffect, useRef } from "react"
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
import Footer from "../footer/footer.tsx"

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
  const errorAlertRef = useRef<HTMLDivElement | null>(null)
  // Focus en alerta de error
  useEffect(() => {
    if (error && errorAlertRef.current) {
      errorAlertRef.current.focus();
    }
  }, [error]);
  
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

  // Alerta de éxito de borrado
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const deleteSuccessRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (deleteSuccess && deleteSuccessRef.current) {
      deleteSuccessRef.current.focus();
    }
  }, [deleteSuccess]);
  // Función para confirmar eliminación
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }
      await deleteCategoryAsAdmin(token, categoryToDelete.id);
      setCategorias(prev => prev.filter(category => category.id !== categoryToDelete.id));
      setDeleteSuccess("Categoría eliminada correctamente");
      setTimeout(() => setDeleteSuccess("") , 3000);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error: unknown) {
      console.error('Error detallado al eliminar categoría:', error);
      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else if (error.status === 403) {
          setError("No tienes permisos para eliminar categorías");
        } else if (error.status === 400 || error.status === 409) {
          setError("No se puede eliminar esta categoría porque tiene productos asociados");
        } else {
          setError(`Error al eliminar la categoría (${error.status})`);
        }
      } else {
        setError(`Error al eliminar la categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  }

  // Función para cancelar eliminación
  const cancelDeleteCategory = () => {
    setDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  // Alerta de éxito de creación
  const [createSuccess, setCreateSuccess] = useState("");
  // Función para agregar categoría
  const handleAddCategory = async (categoryData: { nombre: string; detalle: string }) => {
    setAddLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }
      const newCategory = await createCategory(token, categoryData);
      setCategorias(prev => [...prev, newCategory]);
      setCreateSuccess("Categoría creada correctamente");
      setTimeout(() => setCreateSuccess("") , 3000);
    } catch (error: unknown) {
      console.error('Error al crear categoría:', error);
      setError("Error al crear la categoría");
    } finally {
      setAddLoading(false);
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
              <Alert severity="error" sx={{ mb: 2 }} ref={errorAlertRef} tabIndex={-1}>
                {error}
              </Alert>
            </Box>
          ) : (
            <>
              {deleteSuccess && (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Alert severity="success" sx={{ mb: 2 }} ref={deleteSuccessRef} tabIndex={-1}>
                    {deleteSuccess}
                  </Alert>
                </Box>
              )}
              {createSuccess && (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {createSuccess}
                  </Alert>
                </Box>
              )}
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 2, md: 0 },
                  mb: 3,
                  textAlign: { xs: "center", md: "left" }
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: "white",
                      fontSize: { xs: "1.5rem", md: "2rem" }
                    }}
                  >
                    Categorías
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6b7280",
                      fontSize: { xs: "0.85rem", md: "0.95rem" }
                    }}
                  >
                    Mostrando {paginatedCategorias.length} de {filteredCategorias.length} categorías
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 1.5, md: 2 },
                    flexWrap: { xs: "wrap", md: "nowrap" },
                    justifyContent: { xs: "center", md: "flex-end" },
                    width: { xs: "100%", md: "auto" }
                  }}
                >
                  {/* Selector de items por página */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#6b7280",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" }
                    }}
                  >
                    <Typography sx={{ display: { xs: "none", sm: "block" } }}>
                      Mostrar:
                    </Typography>
                    <FormControl size="small">
                      <Select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        sx={{
                          minWidth: { xs: 60, sm: 80 },
                          height: { xs: 28, sm: 32 },
                          backgroundColor: '#2a3441',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                          },
                          '& .MuiSelect-select': {
                            color: '#9ca3af',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
                    startIcon={
                      sortOrder === 'asc'
                        ? <ArrowDownIcon sx={{ fontSize: 18 }} />
                        : <ArrowUpIcon sx={{ fontSize: 18 }} />
                    }
                    size="small"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      borderColor: "#4b5563",
                      color: "white",
                      minWidth: 80,
                      px: 2,
                      whiteSpace: 'nowrap',
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      textTransform: 'none',
                      '& .MuiButton-startIcon': {
                        marginRight: 0.7,
                      },
                      '&:hover': {
                        backgroundColor: "#374151",
                        borderColor: "#6b7280",
                      },
                    }}
                  >
                    {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                  </Button>

                  {/* Botón de agregar categoría */}
                  <Button
                    variant="contained"
                    onClick={() => setAddModalOpen(true)}
                    sx={{
                      background: "#3a7bd5",
                      color: "white",
                      fontWeight: "bold",
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1, sm: 1.5 },
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "none",
                      transition: "all 0.3s ease",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      width: { xs: "100%", sm: "auto" },
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
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", mx: "auto" }}>
                  {paginatedCategorias.map((categoria) => (
                    <Card
                      key={categoria.id}
                      sx={{
                        bgcolor: "#1e2532",
                        borderRadius: 2,
                        border: "1px solid #2a3441",
                        p: { xs: 2, sm: 3 },
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        "&:hover": {
                          borderColor: "#374151",
                        },
                        transition: "border-color 0.2s",
                      }}
                    >
                      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            alignItems: { xs: "flex-start", md: "center" },
                            gap: { xs: 2, sm: 3 },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              width: { xs: "100%", md: "auto" },
                            }}
                          >
                            <Box sx={{ 
                              flex: 1, 
                              display: { xs: 'flex', md: 'grid' }, 
                              flexDirection: { xs: 'column', md: 'unset' },
                              gridTemplateColumns: { md: '200px 1fr' }, 
                              gap: { xs: 1.5, sm: 3 },
                              textAlign: { xs: 'center', md: 'left' }
                            }}>
                              <Box>
                                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5 }}>
                                  Nombre de la categoría
                                </Typography>
                                <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                                  {categoria.nombre}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5, textAlign: 'center' }}>
                                  Detalle
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: 'center' }}>
                                  <CategoryIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                                  <Typography variant="body1" sx={{ color: "white", textAlign: 'center' }}>
                                    {categoria.detalle}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: { xs: "center", md: "flex-end" },
                              alignItems: "center",
                              width: { xs: "100%", md: "auto" },
                              flexShrink: 0,
                              ml: { md: "auto" }
                            }}
                          >
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
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                px: { xs: 2, sm: 2.5 },
                                py: { xs: 1, sm: 0.75 },
                                width: { xs: "100%", sm: "auto" },
                                minWidth: { md: 120 }
                              }}
                            >
                              Eliminar
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Paginación moderna */}
                  {filteredCategorias.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                      <ModernPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </Container>
        <Footer />
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