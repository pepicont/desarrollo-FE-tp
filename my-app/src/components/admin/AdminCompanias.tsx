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
  Business as BusinessIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import ModernPagination from "../shared-components/ModernPagination"
import CompanyModal from "./CompanyModal"
import { authService } from "../../services/authService"
import { getAllCompaniesAdmin, deleteCompanyAsAdmin, createCompany, type Company } from "../../services/companyService"
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

export default function AdminCompaniasPage() {
  // Estados para manejar los datos
  const [companias, setCompanias] = useState<Company[]>([])
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
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // Estados para el modal de agregar compañía
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
  const getFilteredCompanias = () => {
    return companias
      .filter((compania: Company) => {
        const matchesSearch = searchQuery === "" || 
          compania.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          compania.detalle.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesSearch
      })
      .sort((a, b) => {
        const nameA = a.nombre.toLowerCase()
        const nameB = b.nombre.toLowerCase()
        
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      })
  }

  const filteredCompanias = getFilteredCompanias()
  const totalPages = Math.max(1, Math.ceil(filteredCompanias.length / itemsPerPage))
  const paginatedCompanias = filteredCompanias.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  // Resetear página al cambiar filtros
  useEffect(() => { setPage(1) }, [searchQuery, companias.length, itemsPerPage, sortOrder])

  // Sincronizar búsqueda temporal
  useEffect(() => {
    if (searchQuery === "") {
      setTempSearchQuery("")
    }
  }, [searchQuery])

  // Cargar compañías desde el backend
  useEffect(() => {
    const fetchCompanias = async () => {
      try {
        const token = authService.getToken()
        if (!token) {
          setError("No estás autenticado")
          setLoading(false)
          return
        }
        
        const companiasData = await getAllCompaniesAdmin(token)
        setCompanias(companiasData)
      } catch (error: unknown) {
        console.error('Error detallado al cargar compañías:', error)
        if (error && typeof error === 'object' && 'status' in error) {
          if (error.status === 401) {
            setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
          } else if (error.status === 403) {
            setError("No tienes permisos para acceder a esta información.")
          } else {
            setError(`Error al cargar las compañías. Status: ${error.status}`)
          }
        } else {
          setError(`Error al cargar las compañías: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCompanias()
  }, [])

  // Función para abrir modal de confirmación
  const handleDeleteCompany = (companyId: number) => {
    const compania = companias.find(c => c.id === companyId)
    if (compania) {
      setCompanyToDelete(compania)
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
  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return;
    setDeleteLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }
      await deleteCompanyAsAdmin(token, companyToDelete.id);
      setCompanias(prev => prev.filter(company => company.id !== companyToDelete.id));
      setDeleteSuccess("Compañía eliminada correctamente");
      setTimeout(() => setDeleteSuccess("") , 3000);
      setDeleteModalOpen(false);
      setCompanyToDelete(null);
    } catch (error: unknown) {
      console.error('Error detallado al eliminar compañía:', error);
      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else if (error.status === 403) {
          setError("No tienes permisos para eliminar compañías");
        } else if (error.status === 400 || error.status === 409) {
          setError("No se puede eliminar esta compañía porque tiene productos asociados");
        } else {
          setError(`Error al eliminar la compañía (${error.status})`);
        }
      } else {
        setError(`Error al eliminar la compañía: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setCompanyToDelete(null);
    }
  }

  // Función para cancelar eliminación
  const cancelDeleteCompany = () => {
    setDeleteModalOpen(false)
    setCompanyToDelete(null)
  }

  // Alerta de éxito de creación
  const [createSuccess, setCreateSuccess] = useState("");
  // Función para agregar compañía
  const handleAddCompany = async (companyData: { nombre: string; detalle: string }) => {
    setAddLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }
      const newCompany = await createCompany(token, companyData);
      setCompanias(prev => [...prev, newCompany]);
      setCreateSuccess("Compañía creada correctamente");
      setTimeout(() => setCreateSuccess("") , 3000);
    } catch (error: unknown) {
      console.error('Error al crear compañía:', error);
      setError("Error al crear la compañía");
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
                    placeholder="Buscar compañías..."
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
                    Compañías
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Mostrando {filteredCompanias.length} de {companias.length} compañías
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
                    startIcon={sortOrder === 'asc' ? <ArrowDownIcon /> : <ArrowUpIcon />}
                    onClick={toggleSortOrder}
                    sx={{
                      borderColor: "#4b5563",
                      color: "white",
                      "&:hover": { backgroundColor: "#374151", borderColor: "#6b7280" },
                    }}
                  >
                    {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                  </Button>

                  {/* Botón Agregar Compañía */}
                  <Button
                    variant="contained"
                    onClick={() => setAddModalOpen(true)}
                    startIcon={<BusinessIcon />}
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
                    Agregar Compañía
                  </Button>
                </Box>
              </Box>

              {/* Lista de compañías */}
              {filteredCompanias.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
                    No se encontraron compañías
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Intenta con otro término de búsqueda
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {paginatedCompanias.map((compania) => (
                    <Card
                      key={compania.id}
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
                                  Nombre de la compañía
                                </Typography>
                                <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                                  {compania.nombre}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5, textAlign: 'center' }}>
                                  Detalle
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: 'center' }}>
                                  <BusinessIcon sx={{ fontSize: 16, color: "#6b7280" }} />
                                  <Typography variant="body1" sx={{ color: "white", textAlign: 'center' }}>
                                    {compania.detalle}
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
                            onClick={() => handleDeleteCompany(compania.id)}
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
                  {filteredCompanias.length > 0 && (
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
        <Footer />
      </Box>

      {/* Modal para agregar compañía */}
      <CompanyModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddCompany}
        loading={addLoading}
      />

      {/* Modal de confirmación para eliminar compañía */}
      <Dialog
        open={deleteModalOpen}
        onClose={cancelDeleteCompany}
        PaperProps={{
          sx: {
            bgcolor: "#141926",
            border: "2px solid #ef4444",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: "#ef4444", fontWeight: "bold" }}>
          ⚠️ Eliminar Compañía
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#b0b0b0" }}>
            ¿Estás seguro de que quieres eliminar la compañía <strong style={{ color: "#ffffff" }}>{companyToDelete?.nombre}</strong>?
            <br /><br />
            Esta acción no se puede deshacer y eliminará todos los datos asociados a la compañía.
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
            onClick={cancelDeleteCompany}
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
            onClick={confirmDeleteCompany}
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