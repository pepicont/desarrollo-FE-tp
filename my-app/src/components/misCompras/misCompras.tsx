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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Drawer,
} from "@mui/material"
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import { authService } from "../../services/authService"
import { getUserPurchases } from "../../services/comprasService.ts"
import { checkUserReviewForPurchase, createResenia } from "../../services/reseniasService.ts"
import { companyService, type Company } from "../../services/companyService"
import { useNavigate } from "react-router-dom"
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
    contrasenia: string;
    fechaCreacion: string;
    fechaNacimiento: string;
    mail:string;
  };
  juego?: {
    id: number;
    nombre: string;
    detalle:string;
    monto: number;
    edadPermitida: number;
    fechalanzamiento: string;
    compania:number;
    fotos?: Array<{ id: number; url: string; esPrincipal?: boolean }>
  };
  servicio?: {
    id: number;
    nombre: string;
    detalle:string;
    monto: number;
    compania:number;
    fotos?: Array<{ id: number; url: string; esPrincipal?: boolean }>
  };
  complemento?: {
    id: number;
    nombre: string;
    detalle:string;
    monto: number;
    fotos?: Array<{ id: number; url: string; esPrincipal?: boolean }>
  };
}


export default function MisComprasPage() {
  // Estados para manejar los datos
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reviewsStatus, setReviewsStatus] = useState<{[key: number]: { hasReview: boolean; reseniaId?: number } }>({})
  
  // Estados para el modal de crear reseña
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false)
  const [currentVentaForReview, setCurrentVentaForReview] = useState<Venta | null>(null)
  const [createReviewLoading, setCreateReviewLoading] = useState(false)
  
  const navigate = useNavigate()
  // Navegación a la página de producto
  const handleProductClick = (productId: number | null, productName: string) => {
    if (productId !== null) {
      navigate("/producto", { state: { productId, productName } })
    }
  }
  
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  
  // Estados para filtros avanzados
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [productTypeFilter, setProductTypeFilter] = useState("")
  const [companyFilter, setCompanyFilter] = useState("")
  const [companies, setCompanies] = useState<Company[]>([])
  
  const PAGE_SIZE = 24
  const [page, setPage] = useState(1)

//Fetch al back para traerse las compras del usuario
  useEffect(() => {
      const fetchUserPurchases = async () => {
        try {
          const token = authService.getToken();
          if (!token) {
            setError('No estás autenticado');
            setLoading(false);
            return;
          }
          const ventas = await getUserPurchases(token);
          setVentas(ventas);

          // Verificar el estado de las reseñas para cada compra
          const reviewsStatusMap: {[key: number]: { hasReview: boolean; reseniaId?: number } } = {};
          for (const venta of ventas) {
            try {
              const reviewCheck = await checkUserReviewForPurchase(token, venta.id);
              reviewsStatusMap[venta.id] = {
                hasReview: reviewCheck.hasReview || false,
                reseniaId: reviewCheck.reseniaId || undefined
              };
            } catch (error) {
              console.error(`Error al verificar reseña para venta ${venta.id}:`, error);
              reviewsStatusMap[venta.id] = { hasReview: false };
            }
          }
          setReviewsStatus(reviewsStatusMap);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setError('Error al cargar las compras');
        } finally {
          setLoading(false);
        }
      };
      fetchUserPurchases();
    }, []);

  // Cargar compañías para el filtro
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesData = await companyService.getAll();
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error al cargar compañías:', error);
      }
    };
    loadCompanies();
  }, []);


// Funciones auxiliares
  const getProductName = (venta: Venta) => {
    if (venta.juego) return venta.juego.nombre
    if (venta.servicio) return venta.servicio.nombre
    if (venta.complemento) return venta.complemento.nombre
    return "Producto desconocido"
  }

  const getProductPrice = (venta: Venta) => {
    if (venta.juego) return venta.juego.monto
    if (venta.servicio) return venta.servicio.monto
    if (venta.complemento) return venta.complemento.monto
    return 0
  }

  const getProductCategory = (venta: Venta) => {
    if (venta.juego) return "Juego"
    if (venta.servicio) return "Servicio"
    if (venta.complemento) return "Complemento"
    return "Desconocido"
  }

  const getProductImage = (venta: Venta) => {
    // Usa foto principal o primera disponible por tipo; fallback a /vite.svg
    const pick = (fotos?: Array<{ url: string; esPrincipal?: boolean }>) =>
      fotos?.find(f => f.esPrincipal)?.url || fotos?.[0]?.url

    if (venta.juego) return pick(venta.juego.fotos) || '/vite.svg'
    if (venta.servicio) return pick(venta.servicio.fotos) || '/vite.svg'
    if (venta.complemento) return pick(venta.complemento.fotos) || '/vite.svg'
    return '/vite.svg'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
  }

  // Manejar la navegación para agregar/editar reseña
  const handleReviewAction = (venta: Venta) => {
    const reviewInfo = reviewsStatus[venta.id];
    
    if (reviewInfo?.hasReview && reviewInfo.reseniaId) {
      // Editar reseña existente - navegar a mis-reseñas
      navigate('/mis-resenas', { 
        state: { 
          editMode: true, 
          reseniaId: reviewInfo.reseniaId,
          productName: getProductName(venta)
        } 
      });
    } else {
      // Agregar nueva reseña - abrir modal en esta página
      setCurrentVentaForReview(venta);
      setIsCreateReviewModalOpen(true);
    }
  }

  // Funciones para el modal de crear reseña
  const handleCreateReviewSave = async (reviewData: {
    detalle: string;
    puntaje: number;
    fecha: string;
  }) => {
    if (!currentVentaForReview) return;

    setCreateReviewLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }

      await createResenia(token, {
        venta: currentVentaForReview.id,
        detalle: reviewData.detalle,
        puntaje: reviewData.puntaje,
        fecha: reviewData.fecha,
      });

      // Redirigir a mis reseñas con alerta de éxito
      navigate('/mis-resenas', { state: { created: true } });
      return;
    } catch (error) {
      console.error('Error al crear reseña:', error);
      // Mostrar razones de moderación si vienen del backend
      const humanizeReason = (key: string) => {
        const map: Record<string, string> = {
          'harassment': 'acoso',
          'harassment/threatening': 'acoso o amenazas',
          'hate': 'discurso de odio',
          'hate/threatening': 'odio o amenazas',
          'self-harm': 'autolesiones',
          'sexual': 'contenido sexual',
          'sexual/minors': 'contenido sexual relacionado con menores',
          'violence': 'violencia',
          'violence/graphic': 'violencia gráfica',
          'self-harm/intent': 'intención de autolesión',
          'self-harm/instructions': 'instrucciones de autolesión',
        }
        return map[key] || key
      }
      try {
        // error proviene de createResenia: throw await response.json()
        const err = error as unknown as { reasons?: string[]; message?: string }
        const reasons: string[] | undefined = err?.reasons
        const msg: string | undefined = err?.message
        if (Array.isArray(reasons) && reasons.length > 0) {
          const pretty = reasons.map(humanizeReason).join(', ')
          setError(`No pudimos publicar tu reseña porque contiene: ${pretty}. Por favor, reformúlala y vuelve a intentar.`)
        } else if (typeof msg === 'string' && msg.trim().length > 0) {
          setError(msg)
        } else {
          setError("Error al crear la reseña. Intenta nuevamente.")
        }
      } catch {
        setError("Error al crear la reseña. Intenta nuevamente.")
      }
    } finally {
      setCreateReviewLoading(false);
    }
  };

  const handleCreateReviewClose = () => {
    setIsCreateReviewModalOpen(false);
    setCurrentVentaForReview(null);
  };

  // Función de filtrado avanzado
  const getFilteredVentas = () => {
    return ventas.filter((venta: Venta) => {
      const productName = getProductName(venta);
      
      // Filtro por búsqueda de texto
      const matchesSearch = searchQuery === "" || 
        productName.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro por fecha (reutilizando el de reseñas)
      let matchesDate = true;
      if (dateFilter !== "") {
        const ventaDate = new Date(venta.fecha);
        const now = new Date();
        
        switch (dateFilter) {
          case "este-mes":
            matchesDate = ventaDate.getMonth() === now.getMonth() && 
                         ventaDate.getFullYear() === now.getFullYear();
            break;
          case "mes-pasado": {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            matchesDate = ventaDate.getMonth() === lastMonth.getMonth() && 
                         ventaDate.getFullYear() === lastMonth.getFullYear();
            break;
          }
          case String(new Date().getFullYear()):
            matchesDate = ventaDate.getFullYear() === new Date().getFullYear();
            break;
          case "2024":
            matchesDate = ventaDate.getFullYear() === 2024;
            break;
          case "2023":
            matchesDate = ventaDate.getFullYear() === 2023;
            break;
          case "2022":
            matchesDate = ventaDate.getFullYear() === 2022;
            break;
          case "2021":
            matchesDate = ventaDate.getFullYear() === 2021;
            break;
          case "anteriores":
            matchesDate = ventaDate.getFullYear() <= 2020;
            break;
          default:
            matchesDate = venta.fecha.includes(dateFilter);
        }
      }

      // Filtro por tipo de producto
      let matchesProductType = true;
      if (productTypeFilter !== "") {
        switch (productTypeFilter) {
          case "juego":
            matchesProductType = !!venta.juego;
            break;
          case "servicio":
            matchesProductType = !!venta.servicio;
            break;
          case "complemento":
            matchesProductType = !!venta.complemento;
            break;
        }
      }

      // Filtro por compañía
      let matchesCompany = true;
      if (companyFilter !== "") {
        const companyId = parseInt(companyFilter);
        matchesCompany = venta.juego?.compania === companyId || 
                        venta.servicio?.compania === companyId;
        // Los complementos no tienen compañía directa en el modelo actual
      }

      return matchesSearch && matchesDate && matchesProductType && matchesCompany;
    });
  };

  const filteredVentas = getFilteredVentas();
  const totalPages = Math.max(1, Math.ceil(filteredVentas.length / PAGE_SIZE))
  const paginatedVentas = filteredVentas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reiniciar página al cambiar filtros o resultados
  useEffect(() => { setPage(1) }, [searchQuery, dateFilter, productTypeFilter, companyFilter, ventas.length])

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setProductTypeFilter("");
    setCompanyFilter("");
  };

    // Auxiliar para obtener el id del producto
  const getProductId = (venta: Venta): number | null => {
    if (venta.juego?.id) return venta.juego.id
    if (venta.servicio?.id) return venta.servicio.id
    if (venta.complemento?.id) return venta.complemento.id
    return null
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
              onClick={() => setIsFiltersOpen(true)}
              sx={{
                borderColor: "#4b5563",
                color: "white",
                "&:hover": { backgroundColor: "#374151", borderColor: "#6b7280" },
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
              {paginatedVentas.map((venta) => (
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
                          width: 96,
                          height: 96,
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
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/vite.svg' }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
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
                          onClick={() => handleProductClick(
                            getProductId(venta),
                            getProductName(venta)
                          )}
                        >
                          {(getProductName(venta)) ?? "Producto desconocido"}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {formatDate(venta.fecha)}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ color: "primary.main", fontWeight: "bold" }}>
                          ${(getProductPrice(venta) ?? 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Chip
                          label={getProductCategory(venta)}
                          size="small"
                          sx={{ backgroundColor: "#e08a08ff",
                                color: "#fff",
                                fontWeight: "bold",
                                mb: 1,
                              }}
                        />
                        {venta.codActivacion && (
                          <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mb: 1 }}>
                            Código: {venta.codActivacion}
                          </Typography>
                        )}
                        {/* Botón de reseña */}
                        {reviewsStatus[venta.id] ? (
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              background: 'linear-gradient(45deg, #3a7bd5, #3a82f6)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #2563eb, #1d4ed8)',
                              },
                              color: 'white',
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              mt: 1,
                            }}
                            onClick={() => handleReviewAction(venta)}
                          >
                            {reviewsStatus[venta.id].hasReview ? 'Editar reseña' : 'Agregar reseña'}
                          </Button>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <CircularProgress size={16} sx={{ color: '#3a7bd5' }} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {/* Paginación al pie con flechas */}
              {filteredVentas.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
                  <Button variant="outlined" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                    ← Anterior
                  </Button>
                  <Typography variant="body2" color="text.secondary">Página {page} de {totalPages}</Typography>
                  <Button variant="outlined" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                    Siguiente →
                  </Button>
                </Box>
              )}
            </Box>
          )}
            </>
          )}
        </Container>

        {/* Modal para crear reseña */}
        {currentVentaForReview && (
          <ReviewModal
            open={isCreateReviewModalOpen}
            onClose={handleCreateReviewClose}
            onSave={handleCreateReviewSave}
            mode="create"
            productName={getProductName(currentVentaForReview)}
            productImage={getProductImage(currentVentaForReview)}
            loading={createReviewLoading}
          />
        )}

        {/* Drawer de filtros avanzados */}
        <Drawer
          anchor="right"
          open={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          PaperProps={{
            sx: { backgroundColor: "#1a1f2e", color: "white", width: 350 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: "white" }}>
              Filtros avanzados
            </Typography>

            {/* Filtro por rango de fecha */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }}>Fecha</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  label="Fecha"
                  sx={{ color: "white" }}
                >
                  <MenuItem value="">Todas las fechas</MenuItem>
                  <MenuItem value="este-mes">Este mes</MenuItem>
                  <MenuItem value="mes-pasado">Mes pasado</MenuItem>
                  <MenuItem value={String(new Date().getFullYear())}>Año actual</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2023">2023</MenuItem>
                  <MenuItem value="2022">2022</MenuItem>
                  <MenuItem value="2021">2021</MenuItem>
                  <MenuItem value="anteriores">Anteriores</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Filtro por tipo de producto */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }}>Tipo de producto</InputLabel>
                <Select
                  value={productTypeFilter}
                  onChange={(e) => setProductTypeFilter(e.target.value)}
                  label="Tipo de producto"
                  sx={{ color: "white" }}
                >
                  <MenuItem value="">Todos los tipos</MenuItem>
                  <MenuItem value="juego">Juegos</MenuItem>
                  <MenuItem value="servicio">Servicios</MenuItem>
                  <MenuItem value="complemento">Complementos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Filtro por compañía */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }}>Compañía</InputLabel>
                <Select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  label="Compañía"
                  sx={{ color: "white" }}
                >
                  <MenuItem value="">Todas las compañías</MenuItem>
                  {companies.map(company => (
                    <MenuItem key={company.id} value={String(company.id)}>
                      {company.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Botones de acción */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => setIsFiltersOpen(false)}
                sx={{
                  background: "linear-gradient(135deg, #3a7bd5, #2c5aa0)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2c5aa0, #1e3d6f)",
                  },
                }}
              >
                Cerrar filtros
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={clearFilters}
                sx={{ 
                  borderColor: "#4b5563", 
                  color: "white",
                  "&:hover": { backgroundColor: "#374151", borderColor: "#6b7280" },
                }}
              >
                Limpiar filtros
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Box>
    </ThemeProvider>
  )
}
