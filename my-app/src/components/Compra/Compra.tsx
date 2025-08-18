"use client"

import { useState } from "react"
import {
  ThemeProvider,
  createTheme,
  Container,
  CssBaseline,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
} from "@mui/material"
import { CalendarToday as CalendarIcon, Numbers as NumbersIcon, Star as StarIcon } from "@mui/icons-material"
import NavBar from "../navBar/navBar"
import cyberpunkImg from "../../assets/cyberpunk.jpg"
import fifaImg from "../../assets/fifa24.jpg"
import mw3Img from "../../assets/mw3.jpg"
import { Link } from "react-router-dom"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#141926", paper: "#1e2532" },
    primary: { main: "#4a90e2" },
    text: { primary: "#ffffff", secondary: "#b0b0b0" },
  },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundColor: "#1e2532", borderRadius: 12 } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8 } } },
  },
})

type Product = {
  key: "cyberpunk" | "fifa" | "netflix"
  title: string
  code: string
  image: string
}

const products: Product[] = [
  { key: "cyberpunk", title: "Cyberpunk 2077", code: "CYBER-2077-XK9P-M4RT", image: cyberpunkImg },
  { key: "fifa", title: "EA Sports FC™ 24", code: "FIFA-24-QW8R-T5YU", image: fifaImg },
  { key: "netflix", title: "Netflix Premium - 1 mes", code: "NETF-PREM-A7B9-C3D1", image: mw3Img },
]

export default function PurchaseDetailPage() {
  const [ratings, setRatings] = useState<Record<Product["key"], number>>({ cyberpunk: 0, fifa: 0, netflix: 0 })

  const handleRating = (key: Product["key"], value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }))
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // no-op fallback
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Detalles de la compra
          </Typography>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CalendarIcon sx={{ color: "primary.light" }} />
                  <Box>
                    <Typography color="text.secondary">Fecha de compra</Typography>
                    <Typography fontWeight={600}>09/01/2024 - 14:32</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <NumbersIcon sx={{ color: "primary.light" }} />
                  <Box>
                    <Typography color="text.secondary">ID de compra</Typography>
                    <Typography fontWeight={600}>#ORD-2024-001</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Productos adquiridos
          </Typography>

          <Box sx={{ display: "grid", gap: 2 }}>
            {products.map((p) => (
              <Card key={p.key}>
                <CardContent>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <Box component="img" src={p.image} alt={p.title} sx={{ width: 120, height: 120, borderRadius: 2, objectFit: "cover" }} />
                    <Box sx={{ flex: 1, minWidth: 260 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>{p.title}</Typography>
                      <Box sx={{ p: 2, bgcolor: "#141926", borderRadius: 2 }}>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>Código de activación:</Typography>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                          <Chip label={p.code} color="primary" variant="outlined" sx={{ fontFamily: "monospace", fontSize: 14 }} />
                          <Button variant="contained" size="small" onClick={() => copy(p.code)}>Copiar</Button>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>Califica este producto:</Typography>
                        <Box>
                          {[1,2,3,4,5].map((i) => (
                            <IconButton key={i} onClick={() => handleRating(p.key, i)} size="small">
                              <StarIcon sx={{ color: i <= ratings[p.key] ? "warning.main" : "action.disabled" }} />
                            </IconButton>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ mt: 4 }}>
            <Button component={Link} to="/mis-compras" variant="outlined">← Volver a mis compras</Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
