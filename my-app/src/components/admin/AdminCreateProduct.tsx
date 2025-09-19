"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
} from "@mui/material"
import {
  SportsEsports as GamepadIcon,
  Extension as PackageIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import { authService } from "../../services/authService"
import { productService, type CreateJuegoData, type CreateServicioData, type CreateComplementoData } from "../../services/productService"
import { getAllCategoriesAdmin, type Category } from "../../services/categoryService"
import { getAllCompaniesAdmin, type Company } from "../../services/companyService"

// Reutilizamos el tema compartido igual que otros componentes de admin
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

type ProductType = "juego" | "complemento" | "servicio"

interface JuegoFormData {
  nombre: string
  detalle: string
  monto: string
  categorias: number[]
  compania: string
  fechaLanzamiento: string
  edadPermitida: string
}

interface ServicioFormData {
  nombre: string
  detalle: string
  monto: string
  categorias: number[]
  compania: string
}

interface ComplementoFormData {
  nombre: string
  detalle: string
  monto: string
  categorias: number[]
  compania: string
  juego: string
}

const ageRatings = [
  { value: 0, label: "E (Everyone)" },
  { value: 10, label: "E10+ (Everyone 10+)" },
  { value: 13, label: "T (Teen)" },
  { value: 17, label: "M (Mature 17+)" },
  { value: 18, label: "AO (Adults Only 18+)" }
]

export default function AdminCreateProductPage() {
  // Type selection state
  const [selectedType, setSelectedType] = useState<ProductType | null>(null)
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [juegos, setJuegos] = useState<Array<{id: number, nombre: string}>>([])
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  
  // Form states
  const [juegoForm, setJuegoForm] = useState<JuegoFormData>({
    nombre: "",
    detalle: "",
    monto: "",
    categorias: [],
    compania: "",
    fechaLanzamiento: "",
    edadPermitida: "",
  })
  
  const [servicioForm, setServicioForm] = useState<ServicioFormData>({
    nombre: "",
    detalle: "",
    monto: "",
    categorias: [],
    compania: "",
  })
  
  const [complementoForm, setComplementoForm] = useState<ComplementoFormData>({
    nombre: "",
    detalle: "",
    monto: "",
    categorias: [],
    compania: "",
    juego: "",
  })
  
  // Error and success states - usando el mismo patrón que otros componentes admin
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Load initial data - mismo patrón que AdminCategorias
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = authService.getToken()
        if (!token) {
          setError("No se encontró token de autenticación")
          return
        }

        const [categoriesData, companiesData] = await Promise.all([
          getAllCategoriesAdmin(token),
          getAllCompaniesAdmin(token)
        ])

        setCategories(categoriesData)
        setCompanies(companiesData)
        
        // Load juegos for complemento selection
        const juegosData = await productService.getAllJuegos()
        setJuegos(juegosData)
        
        setDataLoading(false)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar datos")
        setDataLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSubmitJuego = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = authService.getToken()
      if (!token) throw new Error("Token no encontrado")

      const data: CreateJuegoData = {
        nombre: juegoForm.nombre,
        detalle: juegoForm.detalle,
        monto: parseFloat(juegoForm.monto),
        categorias: juegoForm.categorias,
        compania: parseInt(juegoForm.compania),
        fechaLanzamiento: juegoForm.fechaLanzamiento,
        edadPermitida: parseInt(juegoForm.edadPermitida),
      }

      await productService.createJuego(data, token)
      setSuccess("Juego creado exitosamente")
      resetForm()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el juego"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitServicio = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = authService.getToken()
      if (!token) throw new Error("Token no encontrado")

      const data: CreateServicioData = {
        nombre: servicioForm.nombre,
        detalle: servicioForm.detalle,
        monto: parseFloat(servicioForm.monto),
        categorias: servicioForm.categorias,
        compania: parseInt(servicioForm.compania),
      }

      await productService.createServicio(data, token)
      setSuccess("Servicio creado exitosamente")
      resetForm()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el servicio"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComplemento = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = authService.getToken()
      if (!token) throw new Error("Token no encontrado")

      const data: CreateComplementoData = {
        nombre: complementoForm.nombre,
        detalle: complementoForm.detalle,
        monto: parseFloat(complementoForm.monto),
        categorias: complementoForm.categorias,
        compania: parseInt(complementoForm.compania),
        juego: parseInt(complementoForm.juego),
      }

      await productService.createComplemento(data, token)
      setSuccess("Complemento creado exitosamente")
      resetForm()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el complemento"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedType(null)
    setJuegoForm({
      nombre: "",
      detalle: "",
      monto: "",
      categorias: [],
      compania: "",
      fechaLanzamiento: "",
      edadPermitida: "",
    })
    setServicioForm({
      nombre: "",
      detalle: "",
      monto: "",
      categorias: [],
      compania: "",
    })
    setComplementoForm({
      nombre: "",
      detalle: "",
      monto: "",
      categorias: [],
      compania: "",
      juego: "",
    })
    setError("")
    setSuccess("")
  }

  if (dataLoading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <NavBar />
        <Box sx={{ 
          minHeight: "100vh", 
          bgcolor: "background.default", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          pt: 8
        }}>
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    )
  }

  const renderTypeSelector = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" align="center" sx={{ mb: 6, fontWeight: "bold" }}>
        ¿Qué desea crear hoy?
      </Typography>

      <Box sx={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: 4, 
        justifyContent: "center",
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        {/* Juego Card */}
        <Card sx={{ width: 280, height: 240, bgcolor: "background.paper" }}>
          <CardActionArea
            onClick={() => setSelectedType("juego")}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: 3,
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <GamepadIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: "bold" }}>
                Juego
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agregar un nuevo videojuego al catálogo
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Servicio Card */}
        <Card sx={{ width: 280, height: 240, bgcolor: "background.paper" }}>
          <CardActionArea
            onClick={() => setSelectedType("servicio")}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: 3,
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <SettingsIcon sx={{ fontSize: 64, color: "#a855f7", mb: 2 }} />
              <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: "bold" }}>
                Servicio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agregar servicios de gaming o suscripciones
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Complemento Card */}
        <Card sx={{ width: 280, height: 240, bgcolor: "background.paper" }}>
          <CardActionArea
            onClick={() => setSelectedType("complemento")}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: 3,
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <PackageIcon sx={{ fontSize: 64, color: "#34d399", mb: 2 }} />
              <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: "bold" }}>
                Complemento
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agregar DLC, expansiones o contenido adicional
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Container>
  )

  const renderJuegoForm = () => (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper" }}>
        <Box sx={{ 
          background: "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)",
          color: "white",
          p: 3,
          mb: 4,
          borderRadius: 3,
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
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: "rgba(255,255,255,0.1)", 
              borderRadius: 2,
              border: "2px solid rgba(255,255,255,0.2)",
            }}>
              <GamepadIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Crear Nuevo Juego
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Agrega un videojuego completo al catálogo
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmitJuego}>
          {/* Información Básica */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#4a90e2",
                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              📋 Información Básica
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <TextField
                label="Nombre del Juego"
                value={juegoForm.nombre}
                onChange={(e) => setJuegoForm({ ...juegoForm, nombre: e.target.value })}
                required
                sx={{ 
                  flex: "1 1 300px", 
                  minWidth: "300px",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#141926",
                    "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover fieldset": { borderColor: "#4a90e2" },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#4a90e2",
                      boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                    },
                  },
                }}
              />
              <TextField
                label="Precio (US$)"
                type="number"
                value={juegoForm.monto}
                onChange={(e) => setJuegoForm({ ...juegoForm, monto: e.target.value })}
                required
                sx={{ 
                  flex: "1 1 200px", 
                  minWidth: "200px",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#141926",
                    "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover fieldset": { borderColor: "#4a90e2" },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#4a90e2",
                      boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Descripción */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#4a90e2",
                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              📝 Descripción
            </Typography>
            <TextField
              fullWidth
              label="Descripción del Juego"
              multiline
              rows={4}
              value={juegoForm.detalle}
              onChange={(e) => setJuegoForm({ ...juegoForm, detalle: e.target.value })}
              required
              placeholder="Describe las características, historia y jugabilidad del videojuego..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#141926",
                  "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                  "&:hover fieldset": { borderColor: "#4a90e2" },
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

          {/* Compañía y Categorías */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#4a90e2",
                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              🏢 Compañía y Categorización
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <FormControl sx={{ flex: "1 1 250px", minWidth: "250px" }} required>
                <InputLabel sx={{ color: "#b0b0b0" }}>Compañía</InputLabel>
                <Select
                  value={juegoForm.compania}
                  label="Compañía"
                  onChange={(e) => setJuegoForm({ ...juegoForm, compania: e.target.value })}
                  sx={{
                    bgcolor: "#141926",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4a90e2" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                      borderColor: "#4a90e2",
                      boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                    },
                  }}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id.toString()}>
                      {company.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: "1 1 250px", minWidth: "250px" }} required>
                <InputLabel sx={{ color: "#b0b0b0" }}>Categorías</InputLabel>
                <Select
                  multiple
                  value={juegoForm.categorias}
                  label="Categorías"
                  onChange={(e) => setJuegoForm({ ...juegoForm, categorias: e.target.value as number[] })}
                  sx={{
                    bgcolor: "#141926",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4a90e2" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                      borderColor: "#4a90e2",
                      boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                    },
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const category = categories.find(c => c.id === value)
                        return <Chip 
                          key={value} 
                          label={category?.nombre} 
                          size="small"
                          sx={{ 
                            bgcolor: "#4a90e2", 
                            color: "white",
                            fontWeight: "bold"
                          }}
                        />
                      })}
                    </Box>
                  )}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Detalles del Juego */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#4a90e2",
                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              📅 Detalles del Lanzamiento
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <TextField
                label="Fecha de Lanzamiento"
                type="date"
                value={juegoForm.fechaLanzamiento}
                onChange={(e) => setJuegoForm({ ...juegoForm, fechaLanzamiento: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
                sx={{ 
                  flex: "1 1 250px", 
                  minWidth: "250px",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#141926",
                    "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover fieldset": { borderColor: "#4a90e2" },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#4a90e2",
                      boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                    },
                  },
                }}
              />

              <FormControl sx={{ flex: "1 1 250px", minWidth: "250px" }} required>
                <InputLabel sx={{ color: "#b0b0b0" }}>Clasificación por Edad</InputLabel>
                <Select
                  value={juegoForm.edadPermitida}
                  label="Clasificación por Edad"
                  onChange={(e) => setJuegoForm({ ...juegoForm, edadPermitida: e.target.value })}
                  sx={{
                    bgcolor: "#141926",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4a90e2" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                      borderColor: "#4a90e2",
                      boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                    },
                  }}
                >
                  {ageRatings.map((rating) => (
                    <MenuItem key={rating.value} value={rating.value.toString()}>
                      {rating.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 3, justifyContent: "center", pt: 2 }}>
            <Button
              type="button"
              variant="outlined"
              size="large"
              onClick={resetForm}
              disabled={loading}
              sx={{
                minWidth: "120px",
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                color: "#b0b0b0",
                borderColor: "#2a3441",
                borderWidth: "2px",
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
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              sx={{
                minWidth: "180px",
                px: 3,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                background: "linear-gradient(135deg, #4a90e2, #357abd)",
                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #357abd, #2c5aa0)",
                  boxShadow: "0 6px 16px rgba(74, 144, 226, 0.4)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  background: "#4b5563",
                  color: "white",
                  boxShadow: "none",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Creando Juego..." : "🎮 Crear Juego"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )

  const renderServicioForm = () => (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper" }}>
        <Box sx={{ 
          background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
          color: "white",
          p: 3,
          mb: 4,
          borderRadius: 3,
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
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: "rgba(255,255,255,0.1)", 
              borderRadius: 2,
              border: "2px solid rgba(255,255,255,0.2)",
            }}>
              <SettingsIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Crear Nuevo Servicio
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Agrega servicios de gaming o suscripciones
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmitServicio}>
          {/* Información Básica */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#a855f7",
                boxShadow: "0 4px 12px rgba(168, 85, 247, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              📋 Información Básica
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <TextField
                label="Nombre del Servicio"
                value={servicioForm.nombre}
                onChange={(e) => setServicioForm({ ...servicioForm, nombre: e.target.value })}
                required
                sx={{ 
                  flex: "1 1 300px", 
                  minWidth: "300px",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#141926",
                    "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover fieldset": { borderColor: "#a855f7" },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#a855f7",
                      boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)",
                    },
                  },
                }}
              />
              <TextField
                label="Precio (US$)"
                type="number"
                value={servicioForm.monto}
                onChange={(e) => setServicioForm({ ...servicioForm, monto: e.target.value })}
                required
                sx={{ 
                  flex: "1 1 200px", 
                  minWidth: "200px",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#141926",
                    "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover fieldset": { borderColor: "#a855f7" },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#a855f7",
                      boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Descripción */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#a855f7",
                boxShadow: "0 4px 12px rgba(168, 85, 247, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              📝 Descripción del Servicio
            </Typography>
            <TextField
              fullWidth
              label="Descripción detallada"
              multiline
              rows={3}
              value={servicioForm.detalle}
              onChange={(e) => setServicioForm({ ...servicioForm, detalle: e.target.value })}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#141926",
                  "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                  "&:hover fieldset": { borderColor: "#a855f7" },
                  "&.Mui-focused fieldset": { 
                    borderColor: "#a855f7",
                    boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)",
                  },
                },
              }}
            />
          </Box>

          {/* Clasificación y Categorización */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#a855f7",
                boxShadow: "0 4px 12px rgba(168, 85, 247, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              🏢 Clasificación
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <FormControl sx={{ flex: "1 1 250px", minWidth: "250px" }} required>
                <InputLabel sx={{ color: "#b0b0b0" }}>Compañía</InputLabel>
                <Select
                  value={servicioForm.compania}
                  label="Compañía"
                  onChange={(e) => setServicioForm({ ...servicioForm, compania: e.target.value })}
                  sx={{
                    bgcolor: "#141926",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a855f7" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                      borderColor: "#a855f7",
                      boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)",
                    },
                  }}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id.toString()}>
                      {company.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: "1 1 250px", minWidth: "250px" }} required>
                <InputLabel sx={{ color: "#b0b0b0" }}>Categorías</InputLabel>
                <Select
                  multiple
                  value={servicioForm.categorias}
                  label="Categorías"
                  onChange={(e) => setServicioForm({ ...servicioForm, categorias: e.target.value as number[] })}
                  sx={{
                    bgcolor: "#141926",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a855f7" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                      borderColor: "#a855f7",
                      boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)",
                    },
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const category = categories.find(c => c.id === value)
                        return <Chip 
                          key={value} 
                          label={category?.nombre} 
                          size="small"
                          sx={{ 
                            bgcolor: "#a855f7", 
                            color: "white",
                            fontWeight: "bold"
                          }}
                        />
                      })}
                    </Box>
                  )}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 3, justifyContent: "center", pt: 2 }}>
            <Button
              type="button"
              variant="outlined"
              size="large"
              onClick={resetForm}
              disabled={loading}
              sx={{
                minWidth: "120px",
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                color: "#b0b0b0",
                borderColor: "#2a3441",
                borderWidth: "2px",
                "&:hover": {
                  borderColor: "#a855f7",
                  color: "#a855f7",
                  bgcolor: "rgba(168, 85, 247, 0.05)",
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              sx={{
                minWidth: "180px",
                px: 3,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 6px 16px rgba(168, 85, 247, 0.4)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  background: "#4b5563",
                  color: "white",
                  boxShadow: "none",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Creando Servicio..." : "⚙️ Crear Servicio"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )

  const renderComplementoForm = () => (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "background.paper" }}>
        <Box sx={{ 
          background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
          color: "white",
          p: 3,
          mb: 4,
          borderRadius: 3,
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
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: "rgba(255,255,255,0.1)", 
              borderRadius: 2,
              border: "2px solid rgba(255,255,255,0.2)",
            }}>
              <PackageIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Crear Nuevo Complemento
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Agrega DLC, expansiones o contenido adicional
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmitComplemento}>
          {/* Información Básica */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#34d399",
                boxShadow: "0 4px 12px rgba(52, 211, 153, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              📋 Información Básica
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <TextField
                label="Nombre del Complemento"
                value={complementoForm.nombre}
                onChange={(e) => setComplementoForm({ ...complementoForm, nombre: e.target.value })}
                required
                sx={{ 
                  flex: "1 1 300px", 
                  minWidth: "300px",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#141926",
                    "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover fieldset": { borderColor: "#34d399" },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#34d399",
                      boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.1)",
                    },
                  },
                }}
              />
              <TextField
                label="Precio (US$)"
                type="number"
                value={complementoForm.monto}
                onChange={(e) => setComplementoForm({ ...complementoForm, monto: e.target.value })}
                required
                sx={{ 
                  flex: "1 1 200px", 
                  minWidth: "200px",
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#141926",
                    "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover fieldset": { borderColor: "#34d399" },
                    "&.Mui-focused fieldset": { 
                      borderColor: "#34d399",
                      boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.1)",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Descripción */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#34d399",
                boxShadow: "0 4px 12px rgba(52, 211, 153, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              📝 Descripción del Complemento
            </Typography>
            <TextField
              fullWidth
              label="Descripción detallada"
              multiline
              rows={3}
              value={complementoForm.detalle}
              onChange={(e) => setComplementoForm({ ...complementoForm, detalle: e.target.value })}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#141926",
                  "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                  "&:hover fieldset": { borderColor: "#34d399" },
                  "&.Mui-focused fieldset": { 
                    borderColor: "#34d399",
                    boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.1)",
                  },
                },
              }}
            />
          </Box>

          {/* Relaciones y Clasificación */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 3,
              border: "1px solid #2a3441",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "#34d399",
                boxShadow: "0 4px 12px rgba(52, 211, 153, 0.1)",
              },
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: "bold" }}>
              🔗 Relaciones y Clasificación
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
              <FormControl sx={{ flex: "1 1 250px", minWidth: "250px" }} required>
                <InputLabel sx={{ color: "#b0b0b0" }}>Juego Base</InputLabel>
                <Select
                  value={complementoForm.juego}
                  label="Juego Base"
                  onChange={(e) => setComplementoForm({ ...complementoForm, juego: e.target.value })}
                  sx={{
                    bgcolor: "#141926",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#34d399" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                      borderColor: "#34d399",
                      boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.1)",
                    },
                  }}
                >
                  {juegos.map((juego) => (
                    <MenuItem key={juego.id} value={juego.id.toString()}>
                      {juego.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: "1 1 250px", minWidth: "250px" }} required>
                <InputLabel sx={{ color: "#b0b0b0" }}>Compañía</InputLabel>
                <Select
                  value={complementoForm.compania}
                  label="Compañía"
                  onChange={(e) => setComplementoForm({ ...complementoForm, compania: e.target.value })}
                  sx={{
                    bgcolor: "#141926",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a3441", borderWidth: "2px" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#34d399" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                      borderColor: "#34d399",
                      boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.1)",
                    },
                  }}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id.toString()}>
                      {company.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth required>
              <InputLabel sx={{ color: "#b0b0b0" }}>Categorías</InputLabel>
              <Select
                multiple
                value={complementoForm.categorias}
                label="Categorías"
                onChange={(e) => setComplementoForm({ ...complementoForm, categorias: e.target.value as number[] })}
                sx={{
                  bgcolor: "#141926",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2a3441", borderWidth: "2px" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#34d399" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                    borderColor: "#34d399",
                    boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.1)",
                  },
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const category = categories.find(c => c.id === value)
                      return <Chip 
                        key={value} 
                        label={category?.nombre} 
                        size="small"
                        sx={{ 
                          bgcolor: "#34d399", 
                          color: "white",
                          fontWeight: "bold"
                        }}
                      />
                    })}
                  </Box>
                )}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 3, justifyContent: "center", pt: 2 }}>
            <Button
              type="button"
              variant="outlined"
              size="large"
              onClick={resetForm}
              disabled={loading}
              sx={{
                minWidth: "120px",
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                color: "#b0b0b0",
                borderColor: "#2a3441",
                borderWidth: "2px",
                "&:hover": {
                  borderColor: "#34d399",
                  color: "#34d399",
                  bgcolor: "rgba(52, 211, 153, 0.05)",
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              sx={{
                minWidth: "180px",
                px: 3,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                background: "linear-gradient(135deg, #34d399, #059669)",
                boxShadow: "0 4px 12px rgba(52, 211, 153, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #059669, #047857)",
                  boxShadow: "0 6px 16px rgba(52, 211, 153, 0.4)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": {
                  background: "#4b5563",
                  color: "white",
                  boxShadow: "none",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Creando Complemento..." : "📦 Crear Complemento"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* Reutilizamos NavBar igual que otros componentes admin */}
      <NavBar />
      
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pt: 8 }}>
        {!selectedType && renderTypeSelector()}
        {selectedType === "juego" && renderJuegoForm()}
        {selectedType === "servicio" && renderServicioForm()}
        {selectedType === "complemento" && renderComplementoForm()}

        {/* Reutilizamos el patrón de Snackbar de otros componentes admin */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setError("")}
            severity="error"
            variant="filled"
          >
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSuccess("")}
            severity="success"
            variant="filled"
          >
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  )
}
