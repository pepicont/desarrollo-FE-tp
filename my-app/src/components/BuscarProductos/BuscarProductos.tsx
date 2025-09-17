"use client"

import { useEffect, useMemo, useState } from "react"
import { Button, TextField, Card, CardContent, Chip, Container, Box, InputAdornment, FormControl, InputLabel, Select, MenuItem, Typography, Drawer } from "@mui/material"
import { Search, FilterList } from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import { useLocation, useNavigate } from "react-router-dom"
import { searchService, type SearchItem, type SearchParams } from "../../services/searchService"
import { companyService, type Company } from "../../services/companyService"
import Footer from "../footer/footer.tsx"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#4a90e2" },
    background: { default: "#141926", paper: "#1e2532" },
    text: { primary: "#ffffff", secondary: "#9ca3af" },
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
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            borderRadius: 3,
            fontSize: "1.125rem",
            padding: "12px",
            "& fieldset": {
              borderColor: "#4b5563",
            },
            "&:hover fieldset": {
              borderColor: "#6b7280",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3b82f6",
            },
          },
        },
      },
    },
  },
})

export default function BuscarProductos() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [mainSearchQuery, setMainSearchQuery] = useState(params.get("q") ?? "")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [priceFilter, setPriceFilter] = useState(params.get("priceRange") ?? "")
  const [companyFilter, setCompanyFilter] = useState(params.get("companiaId") ?? "")
  const [productTypeFilter, setProductTypeFilter] = useState(params.get("tipo") ?? "")
  const [ageFilter, setAgeFilter] = useState(params.get("edadMax") ?? "")
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [page, setPage] = useState<number>(Number(params.get('page')) || 1)
  const LIMIT = 24
  const [totalCount, setTotalCount] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mapear filtros de UI a params del backend
        const params: SearchParams = {}
        const q = (new URLSearchParams(location.search)).get('q') ?? ''
        if (q) params.q = q

        const tipo = productTypeFilter || ''
        if (tipo === 'juego' || tipo === 'servicio' || tipo === 'complemento' || tipo === 'todos') {
          params.tipo = tipo
        }

        const companiaId = companyFilter ? Number(companyFilter) : undefined
        if (companiaId) params.companiaId = companiaId

        // priceFilter sintético a rango
        if (priceFilter === 'under-10') { params.priceMax = 10 }
        else if (priceFilter === '10-50') { params.priceMin = 10; params.priceMax = 50 }
        else if (priceFilter === '50-100') { params.priceMin = 50; params.priceMax = 100 }
        else if (priceFilter === 'over-100') { params.priceMin = 100 }

        const edad = ageFilter ? Number(ageFilter) : undefined
        if (!Number.isNaN(edad!) && edad !== undefined) params.edadMax = edad

  params.page = page
  params.limit = LIMIT

    const res = await searchService.search(params)
    setItems(res.data)
    setTotalCount(res.count)
      } catch (e: unknown) {
        console.error('Error buscando productos', e)
        setError('No se pudieron cargar los productos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [location.search, priceFilter, companyFilter, productTypeFilter, ageFilter, page])

  
  useEffect(() => {
    setPage(1)
  }, [location.search, priceFilter, companyFilter, productTypeFilter, ageFilter])

  // Cargar compañías para el Select
  useEffect(() => {
    companyService.getAll().then(setCompanies).catch(() => {})
  }, [])



  const clearFilters = () => {
    setPriceFilter("")
    setCompanyFilter("")
    setProductTypeFilter("")
    setAgeFilter("")
  const sp = new URLSearchParams(location.search)
  ;['priceRange','companiaId','tipo','edadMax'].forEach(k => sp.delete(k))
  navigate({ pathname: '/productos', search: sp.toString() ? `?${sp.toString()}` : '' })
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
        {/* NavBar compartida */}
        <NavBar />
      <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ maxWidth: "600px", mx: "auto" }}>
              <TextField
                fullWidth
                placeholder="Buscar juegos, complementos o servicios por nombre..."
                value={mainSearchQuery}
                onChange={(e) => setMainSearchQuery(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1.125rem",
                    padding: "12px",
                    borderRadius: 3,
                  },
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const sp = new URLSearchParams(location.search)
                    if (mainSearchQuery.trim()) sp.set('q', mainSearchQuery.trim())
                    else sp.delete('q')
                    navigate({ pathname: '/productos', search: sp.toString() ? `?${sp.toString()}` : '' })
                  }
                }}
              />
            </Box>
          </Box>

          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                {productTypeFilter === 'servicio' && 'Todos los servicios'}
                {productTypeFilter === 'juego' && 'Todos los juegos'}
                {productTypeFilter === 'complemento' && 'Todos los complementos'}
                {(productTypeFilter !== 'servicio' && productTypeFilter !== 'juego' && productTypeFilter !== 'complemento') && 'Todos los productos'}
              </Typography>
              <Typography sx={{ color: "#9ca3af" }}>
                {loading ? 'Cargando resultados...' : `Mostrando ${items.length} resultados`}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setIsFiltersOpen(true)}
              sx={{
                borderColor: "#4b5563",
                color: "white",
                mt: { xs: 2, sm: 0 },
                "&:hover": { backgroundColor: "#374151", borderColor: "#6b7280" },
              }}
            >
              FILTROS
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {error && (
              <Typography sx={{ color: '#ef4444' }}>{error}</Typography>
            )}
            {!loading && !error && items.length === 0 && (
              <Typography sx={{ color: '#9ca3af' }}>Sin resultados</Typography>
            )}
            {!loading && !error && items.map((product) => (
              <Box key={`${product.tipo}-${product.id}`}>
                <Card sx={{ cursor: "pointer", height: "100%" }} onClick={() => navigate('/producto', { state: { id: product.id, tipo: product.tipo } })}>
                  <Box sx={{ position: "relative" }}>
                    <Box
                      component="img"
                      src={product.imageUrl || '/vite.svg'}
                      alt={product.nombre}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.currentTarget as HTMLImageElement).src = '/vite.svg' }}
                      sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#0f1625' }}
                    />
                    <Chip
                      label={product.tipo.charAt(0).toUpperCase() + product.tipo.slice(1)}
                      color="primary"
                      size="small"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "white", mb: 1, minHeight: "3rem" }}>
                      {product.nombre}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Chip label={product.compania?.nombre ?? 'S/D'} size="small" sx={{ backgroundColor: "#374151", color: "#9ca3af" }} />
                      {product.categorias && product.categorias[0] && (
                        <Chip label={product.categorias[0].nombre} size="small" sx={{ backgroundColor: "#374151", color: "#9ca3af" }} />
                      )}
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {product.monto === 0 ? (
                          <Typography sx={{ color: "#10b981", fontWeight: "bold" }}>Gratuito</Typography>
                        ) : (
                          <>
                            <Typography sx={{ color: "white", fontWeight: "bold" }}>US$ {product.monto}</Typography>
                          </>
                        )}
                      </Box>
                      <Button variant="contained" size="small" onClick={(e) => { e.stopPropagation(); navigate('/producto', { state: { id: product.id, tipo: product.tipo } }) }}>
                        Ver detalles
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          
          {!loading && !error && items.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Anterior
              </Button>
              <Typography sx={{ color: 'white' }}>Página {page}</Typography>
              <Button
                variant="outlined"
                disabled={page * LIMIT >= totalCount || items.length < LIMIT}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente →
              </Button>
            </Box>
          )}
        </Container>

        <Drawer
          anchor="right"
          open={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          PaperProps={{
            sx: { backgroundColor: "#1a1f2e", color: "white", width: 350 },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Filtros
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }}>Precio</InputLabel>
                <Select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  label="Precio"
                  sx={{ color: "white" }}
                >
                  <MenuItem value="under-10">Menor a $10</MenuItem>
                  <MenuItem value="10-50">Mayor a $10 y menor a $50</MenuItem>
                  <MenuItem value="50-100">Mayor a $50 y menor a $100</MenuItem>
                  <MenuItem value="over-100">Mayor a $100</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }}>Compañía</InputLabel>
                <Select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  label="Compañía"
                  sx={{ color: "white" }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {companies.map(c => (
                    <MenuItem key={c.id} value={String(c.id)}>{c.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }}>Tipo de producto</InputLabel>
                <Select
                  value={productTypeFilter}
                  onChange={(e) => setProductTypeFilter(e.target.value)}
                  label="Tipo de producto"
                  sx={{ color: "white" }}
                >
                  <MenuItem value="juego">Juegos</MenuItem>
                  <MenuItem value="complemento">Complementos</MenuItem>
                  <MenuItem value="servicio">Servicios</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }}>Edad</InputLabel>
                <Select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  label="Edad"
                  sx={{ color: "white" }}
                >
                  <MenuItem value="8">Niño</MenuItem>
                  <MenuItem value="13">Adolescente (+13)</MenuItem>
                  <MenuItem value="18">Adulto (+18)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button variant="contained" fullWidth onClick={() => setIsFiltersOpen(false)}>
                Cerrar filtros
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={clearFilters}
                sx={{ borderColor: "#4b5563", color: "white" }}
              >
                Borrar filtros
              </Button>
            </Box>
          </Box>
        </Drawer>
        <Footer />
      </Box>
    </ThemeProvider>
  )
}
