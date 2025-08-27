"use client"

import { useState } from "react"
import { Button, TextField, Card, CardContent, CardMedia, Chip, Container, Box, Rating, InputAdornment, FormControl, InputLabel, Select, MenuItem, Typography, Drawer } from "@mui/material"
import { Search, FilterList } from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import cyberpunkImg from "../../assets/cyberpunk.jpg"
import fifaImg from "../../assets/fifa24.jpg"
import mw3Img from "../../assets/mw3.jpg"

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
  const [mainSearchQuery, setMainSearchQuery] = useState("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [priceFilter, setPriceFilter] = useState("")
  const [companyFilter, setCompanyFilter] = useState("")
  const [productTypeFilter, setProductTypeFilter] = useState("")
  const [ageFilter, setAgeFilter] = useState("")

  const products = [
    {
      id: 1,
      title: "EA Sports FC™ 26",
      price: 59.99,
      originalPrice: 69.99,
      discount: 15,
  image: fifaImg,
      rating: 4.2,
      category: "Deportes",
      type: "Juego",
    },
    {
      id: 2,
      title: "Fortnite",
      price: 0,
  image: fifaImg,
      rating: 4.5,
      category: "Battle Royale",
      type: "Juego",
    },
    {
      id: 3,
      title: "Pavos de Fortnite - 1000 V-Bucks",
      price: 9.99,
  image: fifaImg,
      rating: 4.8,
      category: "Moneda Virtual",
      type: "Complemento",
    },
    {
      id: 4,
      title: "Xbox Game Pass Ultimate - 1 Mes",
      price: 14.99,
  image: mw3Img,
      rating: 4.7,
      category: "Suscripción",
      type: "Servicio",
    },
    {
      id: 5,
      title: "Call of Duty: Modern Warfare III",
      price: 49.99,
      originalPrice: 69.99,
      discount: 28,
  image: mw3Img,
      rating: 4.0,
      category: "Acción",
      type: "Juego",
    },
    {
      id: 6,
      title: "PlayStation Plus Premium - 3 Meses",
      price: 39.99,
  image: mw3Img,
      rating: 4.6,
      category: "Suscripción",
      type: "Servicio",
    },
    {
      id: 7,
      title: "Cyberpunk 2077",
      price: 29.99,
      originalPrice: 59.99,
      discount: 50,
  image: cyberpunkImg,
      rating: 4.3,
      category: "RPG",
      type: "Juego",
    },
    {
      id: 8,
      title: "FIFA 24 Ultimate Team Points - 2200",
      price: 19.99,
  image: fifaImg,
      rating: 4.1,
      category: "Moneda Virtual",
      type: "Complemento",
    },
    {
      id: 9,
      title: "Netflix Gaming - 1 Mes",
      price: 15.99,
  image: cyberpunkImg,
      rating: 4.4,
      category: "Streaming",
      type: "Servicio",
    },
  ]



  const clearFilters = () => {
    setPriceFilter("")
    setCompanyFilter("")
    setProductTypeFilter("")
    setAgeFilter("")
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
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                Todos los productos
              </Typography>
              <Typography sx={{ color: "#9ca3af" }}>Mostrando {products.length} de 10000 resultados</Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setIsFiltersOpen(true)}
              sx={{
                borderColor: "#4b5563",
                color: "white",
                "&:hover": { backgroundColor: "#374151", borderColor: "#6b7280" },
              }}
            >
              Filtros
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {products.map((product) => (
              <Box key={product.id}>
                <Card sx={{ cursor: "pointer", height: "100%" }}>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia component="img" height="200" image={product.image} alt={product.title} />
                    {product.discount && (
                      <Chip
                        label={`-${product.discount}%`}
                        color="error"
                        size="small"
                        sx={{ position: "absolute", top: 8, left: 8 }}
                      />
                    )}
                    <Chip
                      label={product.type}
                      color="primary"
                      size="small"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "white", mb: 1, minHeight: "3rem" }}>
                      {product.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Rating value={product.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                          {product.rating}
                        </Typography>
                      </Box>
                      <Chip label={product.category} size="small" sx={{ backgroundColor: "#374151", color: "#9ca3af" }} />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {product.price === 0 ? (
                          <Typography sx={{ color: "#10b981", fontWeight: "bold" }}>Gratuito</Typography>
                        ) : (
                          <>
                            <Typography sx={{ color: "white", fontWeight: "bold" }}>US${product.price}</Typography>
                            {product.originalPrice && (
                              <Typography variant="body2" sx={{ color: "#6b7280", textDecoration: "line-through" }}>
                                US${product.originalPrice}
                              </Typography>
                            )}
                          </>
                        )}
                      </Box>
                      <Button variant="contained" size="small">
                        Ver detalles
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
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
                  <MenuItem value="ea">Electronic Arts</MenuItem>
                  <MenuItem value="epic">Epic Games</MenuItem>
                  <MenuItem value="activision">Activision</MenuItem>
                  <MenuItem value="cdpr">CD Projekt Red</MenuItem>
                  <MenuItem value="mojang">Mojang Studios</MenuItem>
                  <MenuItem value="microsoft">Microsoft</MenuItem>
                  <MenuItem value="sony">Sony</MenuItem>
                  <MenuItem value="netflix">Netflix</MenuItem>
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
                  <MenuItem value="juegos">Juegos</MenuItem>
                  <MenuItem value="complementos">Complementos</MenuItem>
                  <MenuItem value="servicios">Servicios</MenuItem>
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
                  <MenuItem value="child">Niño</MenuItem>
                  <MenuItem value="teen">Adolescente (+13)</MenuItem>
                  <MenuItem value="adult">Adulto (+18)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button variant="contained" fullWidth onClick={() => setIsFiltersOpen(false)}>
                Mostrar resultados
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
      </Box>
    </ThemeProvider>
  )
}
