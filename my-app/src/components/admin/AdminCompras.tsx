"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from "@mui/material"
import {
  Search as SearchIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import ModernPagination from "../shared-components/ModernPagination"
import Footer from "../footer/footer.tsx"
import { authService } from "../../services/authService"
import { getAllPurchasesAdmin, type AdminCompra } from "../../services/comprasService"

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
})

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type ProductTypeFilter = "todas" | "juego" | "servicio" | "complemento"

type SortByOption = "fecha" | "monto"

type SortOrderOption = "asc" | "desc"

export default function AdminComprasPage() {
  const [compras, setCompras] = useState<AdminCompra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [canRetry, setCanRetry] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [tempSearchQuery, setTempSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("todas")
  const [productTypeFilter, setProductTypeFilter] = useState<ProductTypeFilter>("todas")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortByOption>("fecha")
  const [sortOrder, setSortOrder] = useState<SortOrderOption>("desc")

  const errorAlertRef = useRef<HTMLDivElement | null>(null)

  const fetchCompras = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const token = authService.getToken()
      if (!token) {
        setError("No estás autenticado")
        setCanRetry(false)
        return
      }

      const comprasData = await getAllPurchasesAdmin(token)
      setCompras(comprasData)
      setCanRetry(true)
    } catch (error) {
      console.error("Error al cargar las compras:", error)
      if (error instanceof Response) {
        if (error.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
          setCanRetry(false)
        } else if (error.status === 403) {
          setError("No tienes permisos para acceder a esta información.")
          setCanRetry(false)
        } else {
          setError("Error al cargar las compras. Intenta nuevamente.")
          setCanRetry(true)
        }
      } else if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: string }).message
        setError(message && message.trim().length > 0 ? message : "Error al cargar las compras. Intenta nuevamente.")
        setCanRetry(true)
      } else {
        setError("Error al cargar las compras. Intenta nuevamente.")
        setCanRetry(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompras()
  }, [fetchCompras])

  useEffect(() => {
    if (error && errorAlertRef.current) {
      errorAlertRef.current.focus()
    }
  }, [error])

  useEffect(() => {
    if (searchQuery === "") {
      setTempSearchQuery("")
    }
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, dateFilter, productTypeFilter, itemsPerPage, sortOrder, sortBy])

  const getProductName = (venta: AdminCompra) => {
    if (venta.juego) return venta.juego.nombre
    if (venta.servicio) return venta.servicio.nombre
    if (venta.complemento) return venta.complemento.nombre
    return "Producto desconocido"
  }

  const getProductPrice = (venta: AdminCompra) => {
    const precio = venta.juego?.monto ?? venta.servicio?.monto ?? venta.complemento?.monto
    return typeof precio === "number" ? precio : 0
  }

  const getProductType = (venta: AdminCompra): Exclude<ProductTypeFilter, "todas"> | "Desconocido" => {
    if (venta.juego) return "juego"
    if (venta.servicio) return "servicio"
    if (venta.complemento) return "complemento"
    return "Desconocido"
  }

  const getProductDetail = (venta: AdminCompra) => {
    return (
      venta.juego?.detalle ??
      venta.servicio?.detalle ??
      venta.complemento?.detalle ??
      ""
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const filteredCompras = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const filtered = compras.filter((venta) => {
      const productName = getProductName(venta).toLowerCase()
      const buyerName = (venta.usuario.nombre ?? "").toLowerCase()
      const buyerUsername = venta.usuario.nombreUsuario.toLowerCase()
      const buyerEmail = (venta.usuario.mail ?? "").toLowerCase()
      const code = (venta.codActivacion ?? "").toLowerCase()

      const matchesSearch =
        query === "" ||
        productName.includes(query) ||
        buyerName.includes(query) ||
        buyerUsername.includes(query) ||
        buyerEmail.includes(query) ||
        code.includes(query)

      let matchesDate = true
      if (dateFilter !== "todas") {
        const ventaDate = new Date(venta.fecha)
        const now = new Date()

        switch (dateFilter) {
          case "este-mes":
            matchesDate =
              ventaDate.getMonth() === now.getMonth() &&
              ventaDate.getFullYear() === now.getFullYear()
            break
          case "mes-pasado": {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
            matchesDate =
              ventaDate.getMonth() === lastMonth.getMonth() &&
              ventaDate.getFullYear() === lastMonth.getFullYear()
            break
          }
          case "anteriores":
            matchesDate = ventaDate.getFullYear() <= now.getFullYear() - 4
            break
          default:
            matchesDate = ventaDate.getFullYear() === Number(dateFilter)
        }
      }

      let matchesType = true
      if (productTypeFilter !== "todas") {
        matchesType =
          (productTypeFilter === "juego" && !!venta.juego) ||
          (productTypeFilter === "servicio" && !!venta.servicio) ||
          (productTypeFilter === "complemento" && !!venta.complemento)
      }

      return matchesSearch && matchesDate && matchesType
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "fecha") {
        const dateA = new Date(a.fecha).getTime()
        const dateB = new Date(b.fecha).getTime()
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB
      }

      const montoA = getProductPrice(a)
      const montoB = getProductPrice(b)
      return sortOrder === "desc" ? montoB - montoA : montoA - montoB
    })

    return sorted
  }, [compras, searchQuery, dateFilter, productTypeFilter, sortBy, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filteredCompras.length / itemsPerPage))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedCompras = useMemo(
    () => filteredCompras.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredCompras, page, itemsPerPage],
  )

  const totalRevenue = useMemo(
    () => filteredCompras.reduce((acc, venta) => acc + getProductPrice(venta), 0),
    [filteredCompras],
  )

  const handleSearchSubmit = () => {
    setSearchQuery(tempSearchQuery.trim())
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setTempSearchQuery("")
    setDateFilter("todas")
    setProductTypeFilter("todas")
    setSortBy("fecha")
    setSortOrder("desc")
    setItemsPerPage(15)
    setPage(1)
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
  }

  const handleRetry = () => {
    fetchCompras()
  }

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
          <NavBar />
          <Container
            maxWidth="lg"
            sx={{
              py: 4,
              mt: 8,
              minHeight: "60vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={60} />
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    )
  }

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
                  <Button color="inherit" size="small" onClick={handleRetry}>
                    Reintentar
                  </Button>
                ) : (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      authService.logout()
                      window.location.href = "/login"
                    }}
                  >
                    Iniciar sesión
                  </Button>
                )
              }
              ref={errorAlertRef}
              tabIndex={-1}
            >
              {error}
            </Alert>
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 4, mt: 8, px: { xs: 1, sm: 2, md: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "white", mb: 1 }}>
                Gestión de Compras
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Mostrando {paginatedCompras.length} de {filteredCompras.length} compras registradas
              </Typography>
            </Box>
            <Chip
              label={`Ingresos filtrados: ${currencyFormatter.format(totalRevenue)}`}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              gap: 2,
              mb: 3,
              alignItems: { xs: "stretch", lg: "flex-end" },
            }}
          >
            <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Buscar por producto, usuario, mail o código..."
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit()
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
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearchSubmit}
                sx={{
                  height: 56,
                  px: 3,
                  borderRadius: 3,
                  fontWeight: 600,
                }}
              >
                Buscar
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                justifyContent: { xs: "flex-start", lg: "flex-end" },
              }}
            >
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={productTypeFilter}
                  onChange={(e) => setProductTypeFilter(e.target.value as ProductTypeFilter)}
                  displayEmpty
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    '& .MuiSelect-select': { py: 1.2 },
                  }}
                >
                  <MenuItem value="todas">Todos los tipos</MenuItem>
                  <MenuItem value="juego">Juegos</MenuItem>
                  <MenuItem value="servicio">Servicios</MenuItem>
                  <MenuItem value="complemento">Complementos</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    '& .MuiSelect-select': { py: 1.2 },
                  }}
                >
                  <MenuItem value="todas">Todas las fechas</MenuItem>
                  <MenuItem value="este-mes">Este mes</MenuItem>
                  <MenuItem value="mes-pasado">Mes pasado</MenuItem>
                  <MenuItem value={String(new Date().getFullYear())}>{new Date().getFullYear()}</MenuItem>
                  <MenuItem value={String(new Date().getFullYear() - 1)}>{new Date().getFullYear() - 1}</MenuItem>
                  <MenuItem value={String(new Date().getFullYear() - 2)}>{new Date().getFullYear() - 2}</MenuItem>
                  <MenuItem value={String(new Date().getFullYear() - 3)}>{new Date().getFullYear() - 3}</MenuItem>
                  <MenuItem value="anteriores">Años anteriores</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    '& .MuiSelect-select': { py: 1.2 },
                  }}
                >
                  <MenuItem value={10}>10 por página</MenuItem>
                  <MenuItem value={15}>15 por página</MenuItem>
                  <MenuItem value={25}>25 por página</MenuItem>
                  <MenuItem value={50}>50 por página</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant={sortBy === "fecha" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSortBy("fecha")}
                startIcon={<ArrowDownIcon sx={{ transform: "rotate(180deg)" }} />}
              >
                Ordenar por fecha
              </Button>
              <Button
                variant={sortBy === "monto" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSortBy("monto")}
                startIcon={<ArrowUpIcon />}
              >
                Ordenar por monto
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={toggleSortOrder}
                startIcon={sortOrder === "desc" ? <ArrowDownIcon /> : <ArrowUpIcon />}
              >
                {sortOrder === "desc" ? "Descendente" : "Ascendente"}
              </Button>
            </Box>
            <Button
              variant="text"
              color="inherit"
              onClick={handleResetFilters}
              startIcon={<RefreshIcon />}
              sx={{ color: "text.secondary" }}
            >
              Reestablecer filtros
            </Button>
          </Box>

          {paginatedCompras.length === 0 ? (
            <Alert severity="info" sx={{ bgcolor: "rgba(74,144,226,0.1)", borderRadius: 3 }}>
              No se encontraron compras con los filtros seleccionados.
            </Alert>
          ) : (
            paginatedCompras.map((venta) => {
              const productType = getProductType(venta)
              const displayType =
                productType === "juego"
                  ? "Juego"
                  : productType === "servicio"
                    ? "Servicio"
                    : productType === "complemento"
                      ? "Complemento"
                      : "Producto"

              return (
                <Card
                  key={venta.id}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    border: "1px solid rgba(74, 144, 226, 0.12)",
                    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.35)",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
                          {getProductName(venta)}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          <Chip
                            label={displayType}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: 2 }}
                          />
                          <Chip
                            label={`Compra #${venta.id}`}
                            variant="outlined"
                            sx={{
                              borderColor: "rgba(255,255,255,0.2)",
                              color: "text.secondary",
                              borderRadius: 2,
                            }}
                          />
                          {venta.codActivacion && (
                            <Chip
                              label={`Código: ${venta.codActivacion}`}
                              color="secondary"
                              sx={{ borderRadius: 2, fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          Fecha de compra
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "white" }}>
                          {formatDate(venta.fecha)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                          Monto total
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                          {currencyFormatter.format(getProductPrice(venta))}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2.5,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: "text.secondary", textTransform: "uppercase", mb: 0.5 }}>
                          Comprador
                        </Typography>
                        <Typography variant="body1" sx={{ color: "white", fontWeight: 600 }}>
                          {venta.usuario.nombre ?? venta.usuario.nombreUsuario}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          Usuario: {venta.usuario.nombreUsuario}
                        </Typography>
                        {venta.usuario.mail && (
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Email: {venta.usuario.mail}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          ID Usuario: {venta.usuario.id}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: "text.secondary", textTransform: "uppercase", mb: 0.5 }}>
                          Detalle del producto
                        </Typography>
                        {getProductDetail(venta) ? (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 3,
                              overflow: "hidden",
                            }}
                          >
                            {getProductDetail(venta)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Sin descripción disponible.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )
            })
          )}

          <ModernPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  )
}
