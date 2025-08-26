"use client"
import { useState } from "react"
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
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material"
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import cyberpunkImg from "../../assets/cyberpunk.jpg"
import fifaImg from "../../assets/fifa24.jpg"
import mw3Img from "../../assets/mw3.jpg"
import NavBar from "../navBar/navBar"

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

type ProductThumb = { title: string; image: string }
type PurchaseSingle = {
  id: number
  type: "single"
  product: ProductThumb
  date: string
  amount: number
  status: string
}
type PurchaseMultiple = {
  id: number
  type: "multiple"
  products: ProductThumb[]
  date: string
  amount: number
  status: string
  itemCount: number
}
type Purchase = PurchaseSingle | PurchaseMultiple

// Mock data para las compras (usando imágenes existentes)
const mockPurchases: Purchase[] = [
  {
    id: 1,
    type: "single",
    product: {
      title: "EA Sports FC™ 26",
      image: fifaImg,
    },
    date: "2024-01-15",
    amount: 59.99,
    status: "Completada",
  },
  {
    id: 2,
    type: "multiple",
    products: [
      {
        title: "Call of Duty: Modern Warfare III",
        image: mw3Img,
      },
      {
        title: "Cyberpunk 2077",
        image: cyberpunkImg,
      },
      {
        title: "The Witcher 3",
        image: fifaImg,
      },
    ],
    date: "2024-01-10",
    amount: 149.97,
    status: "Completada",
    itemCount: 3,
  },
  {
    id: 3,
    type: "single",
    product: {
      title: "PlayStation Plus Premium - 12 meses",
      image: fifaImg,
    },
    date: "2024-01-05",
    amount: 119.99,
    status: "Completada",
  },
  {
    id: 4,
    type: "multiple",
    products: [
      {
        title: "Fortnite V-Bucks",
        image: fifaImg,
      },
      {
        title: "Apex Legends Coins",
        image: mw3Img,
      },
    ],
    date: "2023-12-28",
    amount: 39.98,
    status: "Completada",
    itemCount: 2,
  },
]

export default function MisComprasPage() {
  
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")



  const filteredPurchases = mockPurchases.filter((purchase: Purchase) => {
    const matchesSearch =
      searchQuery === "" ||
      (purchase.type === "single"
        ? purchase.product.title.toLowerCase().includes(searchQuery.toLowerCase())
        : purchase.products.some((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesDate = dateFilter === "" || purchase.date.includes(dateFilter)

    return matchesSearch && matchesDate
  })

  const renderPurchaseCard = (purchase: Purchase) => {
    return (
      <Card key={purchase.id} sx={{ mb: 2, p: 2 }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "auto 1fr",
                md: "auto 1fr auto",
              },
              columnGap: 2,
              rowGap: 2,
              alignItems: "center",
            }}
          >
            {/* Imagen(es) del producto */}
            <Box>
              {purchase.type === "single" ? (
                <Box
                  component="img"
                  src={purchase.product.image}
                  alt={purchase.product.title}
                  sx={{
                    width: "100%",
                    maxWidth: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 2,
                  }}
                />
              ) : (
                <Box sx={{ position: "relative" }}>
                  <Stack direction="row" spacing={-2}>
                    {purchase.products.slice(0, 3).map((product: ProductThumb, index: number) => (
                      <Box
                        key={index}
                        component="img"
                        src={product.image}
                        alt={product.title}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "2px solid #141926",
                          zIndex: 3 - index,
                        }}
                      />
                    ))}
                  </Stack>
                  <Chip label={`${purchase.itemCount} productos`} size="small" color="primary" sx={{ mt: 1 }} />
                </Box>
              )}
            </Box>

            {/* Detalles de la compra */}
            <Box>
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {purchase.type === "single"
                    ? purchase.product.title
                    : `Compra múltiple - ${purchase.itemCount} productos`}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CalendarIcon sx={{ fontSize: 16, mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    Fecha de compra: {new Date(purchase.date).toLocaleDateString("es-ES")}
                  </Typography>
                </Box>

                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  US${purchase.amount.toFixed(2)}
                </Typography>

                <Chip label={purchase.status} color="success" size="small" sx={{ mt: 1 }} />
              </Box>
            </Box>

            {/* Botón ver detalles */}
            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<VisibilityIcon />}
                  sx={{
                    minWidth: 140,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                  onClick={() => console.log(`Ver detalles de compra ${purchase.id}`)}
                >
                  Ver detalles
                </Button>
              </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
  {/* Shared NavBar */}
  <NavBar />

        {/* Contenido principal */}
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
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
                Mostrando {filteredPurchases.length} de {mockPurchases.length} compras
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDialogOpen(true)}
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
          <Box>{filteredPurchases.map(renderPurchaseCard)}</Box>

          {filteredPurchases.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron compras
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Intenta ajustar los filtros de búsqueda
              </Typography>
            </Box>
          )}
        </Container>

        {/* Dialog de filtros */}
        <Dialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          PaperProps={{
            sx: { bgcolor: "background.paper", minWidth: 400 },
          }}
        >
          <DialogTitle>Filtrar compras</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Filtrar por fecha</InputLabel>
              <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} label="Filtrar por fecha">
                <MenuItem value="">Todas las fechas</MenuItem>
                <MenuItem value="2024-01">Enero 2024</MenuItem>
                <MenuItem value="2023-12">Diciembre 2023</MenuItem>
                <MenuItem value="2023-11">Noviembre 2023</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button onClick={() => setFilterDialogOpen(false)}>Cancelar</Button>
              <Button variant="contained" onClick={() => setFilterDialogOpen(false)}>
                Aplicar filtros
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}
