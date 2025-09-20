"use client"

import React, { useState, useEffect, useRef } from "react"
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
  CircularProgress,
  Chip,
  FormLabel,
} from "@mui/material"
import {
  SportsEsports as GamepadIcon,
  Extension as PackageIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from "@mui/icons-material"
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import { useParams } from "react-router-dom"
import { authService } from "../../services/authService"
import { productService, type CreateJuegoData, type CreateServicioData, type CreateComplementoData, type CategoriaRef } from "../../services/productService"
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
  juego: string
}

const ageRatings = [
  { value: 0, label: "E (Everyone)" },
  { value: 10, label: "E10+ (Everyone 10+)" },
  { value: 13, label: "T (Teen)" },
  { value: 17, label: "M (Mature 17+)" },
  { value: 18, label: "AO (Adults Only 18+)" }
]

// Función para mapear cualquier edad a la clasificación más cercana
const mapAgeToRating = (age: number): number => {
  if (age <= 5) return 0;        // Everyone
  if (age <= 12) return 10;      // Everyone 10+
  if (age <= 16) return 13;      // Teen
  if (age <= 17) return 17;      // Mature 17+
  return 18;                     // Adults Only 18+
}

export default function AdminCreateProductPage() {
  
  // Error and success states - usando el mismo patrón que otros componentes admin
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  // Ref para la alerta (ya no se usa para focus, pero se deja por si se quiere scrollIntoView)
  const alertRef = useRef<HTMLDivElement | null>(null)
  
  const params = useParams<{ tipo: string; id: string }>()
  const isEditMode = !!(params.tipo && params.id)
  const editTipo = params.tipo as ProductType
  const editId = params.id ? parseInt(params.id) : null
  
  
  // Type selection state
  const [selectedType, setSelectedType] = useState<ProductType | null>(
    isEditMode ? editTipo : null
  )
  
  // Auto-hide alerts in type selector after 4s y scroll al top para todos los tipos (forzado)
  useEffect(() => {
    if (!selectedType && (success || error)) {
      // Forzar el scroll después de que el DOM se actualiza
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [selectedType, success, error]);

  
  // Data states
  const [categories, setCategories] = useState<Category[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [juegos, setJuegos] = useState<Array<{id: number, nombre: string, compania: { id: number, nombre: string }}>>([])
  
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
    juego: "",
  })
  


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

  // Load product data for edit mode
  useEffect(() => {
    if (!isEditMode || !editId || !editTipo) return

    const loadProductData = async () => {
      try {
        setLoading(true)

        if (editTipo === 'juego') {
          const productData = await productService.getJuego(editId)
          // Mapear la edad de la BD a la clasificación más cercana
          const mappedAge = mapAgeToRating(productData.edadPermitida)
          
          setJuegoForm({
            nombre: productData.nombre || "",
            detalle: productData.detalle || "",
            monto: productData.monto?.toString() || "",
            categorias: productData.categorias?.map((c: CategoriaRef) => c.id) || [],
            compania: productData.compania?.id?.toString() || "",
            fechaLanzamiento: productData.fechaLanzamiento || "",
            edadPermitida: mappedAge.toString(),
          })
        } else if (editTipo === 'servicio') {
          const productData = await productService.getServicio(editId)
          setServicioForm({
            nombre: productData.nombre || "",
            detalle: productData.detalle || "",
            monto: productData.monto?.toString() || "",
            categorias: productData.categorias?.map((c: CategoriaRef) => c.id) || [],
            compania: productData.compania?.id?.toString() || "",
          })
        } else if (editTipo === 'complemento') {
          const productData = await productService.getComplemento(editId)
          setComplementoForm({
            nombre: productData.nombre || "",
            detalle: productData.detalle || "",
            monto: productData.monto?.toString() || "",
            categorias: productData.categorias?.map((c: CategoriaRef) => c.id) || [],
            juego: productData.juego?.id?.toString() || "",
          })
        }

        setLoading(false)
      } catch (err: unknown) {
        setError("Error al cargar datos del producto: " + (err instanceof Error ? err.message : "Error desconocido"))
        setLoading(false)
      }
    }

    loadProductData()
  }, [isEditMode, editId, editTipo])

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

      if (isEditMode && editId) {
        await productService.updateJuego(editId, data, token)
        setSuccess("Juego actualizado exitosamente")
      } else {
        await productService.createJuego(data, token)
        resetForm(() => setSuccess("Juego creado exitosamente"))
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `Error al ${isEditMode ? 'actualizar' : 'crear'} el juego`
      resetForm(() => setError(errorMessage))
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

      if (isEditMode && editId) {
        await productService.updateServicio(editId, data, token)
        setSuccess("Servicio actualizado exitosamente")
      } else {
        await productService.createServicio(data, token)
        resetForm(() => setSuccess("Servicio creado exitosamente"))
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `Error al ${isEditMode ? 'actualizar' : 'crear'} el servicio`
      resetForm(() => setError(errorMessage))
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
        compania: (() => {
          const selectedJuego = juegos.find(j => j.id === parseInt(complementoForm.juego));
          return selectedJuego ? selectedJuego.compania.id : 0;
        })(),
        juego: parseInt(complementoForm.juego),
      }

      if (isEditMode && editId) {
        await productService.updateComplemento(editId, data, token)
        setSuccess("Complemento actualizado exitosamente")
      } else {
        await productService.createComplemento(data, token)
        resetForm(() => setSuccess("Complemento creado exitosamente"))
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `Error al ${isEditMode ? 'actualizar' : 'crear'} el complemento`
      resetForm(() => setError(errorMessage))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = (callback?: () => void) => {
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
      juego: "",
    })
    setError("")
    setSuccess("")
    setTimeout(() => {
      if (callback) callback()
    }, 0)
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
      {/* Alertas arriba del título */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, fontSize: 18, fontWeight: 600, textAlign: 'center' }}
          ref={alertRef}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, fontSize: 18, fontWeight: 600, textAlign: 'center' }}
          ref={alertRef}
        >
          {success}
        </Alert>
      )}
      <Typography variant="h3" component="h1" align="center" sx={{ mb: 6, fontWeight: "bold" }}>
        {isEditMode ? `Editar ${editTipo?.charAt(0).toUpperCase()}${editTipo?.slice(1)}` : "¿Qué desea crear hoy?"}
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
                {isEditMode ? "Editar Juego" : "Crear Nuevo Juego"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {isEditMode ? "Modifica los datos del videojuego" : "Agrega un videojuego completo al catálogo"}
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
                Información Básica
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
              Descripción
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
              Compañía y Categorización
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
              Detalles del Lanzamiento
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <FormControl sx={{ flex: "1 1 250px", minWidth: "250px" }}>
                <FormLabel sx={{ color: "#b0b0b0", mb: 1, fontSize: "0.875rem" }}>Fecha de Lanzamiento</FormLabel>
                <DatePicker
                  value={juegoForm.fechaLanzamiento ? dayjs(juegoForm.fechaLanzamiento) : null}
                  onChange={(newValue) => {
                    const dateString = newValue ? newValue.format('YYYY-MM-DD') : ''
                    setJuegoForm({ ...juegoForm, fechaLanzamiento: dateString })
                  }}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      variant: "outlined",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#141926",
                          "& fieldset": { borderColor: "#2a3441", borderWidth: "2px" },
                          "&:hover fieldset": { borderColor: "#4a90e2" },
                          "&.Mui-focused fieldset": { 
                            borderColor: "#4a90e2",
                            boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                          },
                        },
                      }
                    }
                  }}
                  format="DD/MM/YYYY"
                />
              </FormControl>

              <FormControl sx={{ flex: "1 1 250px", minWidth: "250px" }} required>
                <FormLabel sx={{ color: "#b0b0b0", mb: 1, fontSize: "0.875rem" }}>Clasificación por Edad</FormLabel>
                <Select
                  value={juegoForm.edadPermitida}
                  onChange={(e) => setJuegoForm({ ...juegoForm, edadPermitida: e.target.value })}
                  displayEmpty
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
              onClick={() => resetForm()}
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
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (!isEditMode && <AddIcon />)}
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
              {loading 
                ? (isEditMode ? "Actualizando Juego..." : "Creando Juego...") 
                : (isEditMode ? "Actualizar Juego" : "Crear Juego")
              }
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
                {isEditMode ? "Editar Servicio" : "Crear Nuevo Servicio"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {isEditMode ? "Modifica los datos del servicio" : "Agrega servicios de gaming o suscripciones"}
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
              Información Básica
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
              Descripción del Servicio
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
              Clasificación
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
              onClick={() => resetForm()}
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
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (!isEditMode && <AddIcon />)}
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
              {loading 
                ? (isEditMode ? "Actualizando Servicio..." : "Creando Servicio...") 
                : (isEditMode ? "Actualizar Servicio" : "Crear Servicio")
              }
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
                {isEditMode ? "Editar Complemento" : "Crear Nuevo Complemento"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {isEditMode ? "Modifica los datos del complemento" : "Agrega DLC, expansiones o contenido adicional"}
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
              Información Básica
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
              Descripción del Complemento
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
              Relaciones y Clasificación
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
              onClick={() => resetForm()}
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
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (!isEditMode && <AddIcon />)}
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
              {loading 
                ? (isEditMode ? "Actualizando Complemento..." : "Creando Complemento...") 
                : (isEditMode ? "Actualizar Complemento" : "Crear Complemento")
              }
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {/* Reutilizamos NavBar igual que otros componentes admin */}
        <NavBar />
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pt: 8 }}>
          {!selectedType && renderTypeSelector()}
          {selectedType === "juego" && renderJuegoForm()}
          {selectedType === "servicio" && renderServicioForm()}
          {selectedType === "complemento" && renderComplementoForm()}
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  )
}
