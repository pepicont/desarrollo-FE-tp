"use client"

import { Box, Container, Typography, Card, CardContent, Rating, Avatar, IconButton } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import cyberpunkImg from "../../assets/cyberpunk.jpg"
import fifaImg from "../../assets/fifa24.jpg"
import mw3Img from "../../assets/mw3.jpg"
import EditIcon from "@mui/icons-material/Edit"
import { useNavigate } from "react-router-dom"

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

// Datos de ejemplo para las reseñas (usando assets locales)
const reviewsData = [
  {
    id: 1,
    productName: "EA Sports FC™ 26",
    productImage: fifaImg,
    rating: 4,
    reviewDate: "15/12/2024",
    reviewText: "Excelente juego, muy realista",
  },
  {
    id: 2,
    productName: "Cyberpunk 2077",
    productImage: cyberpunkImg,
    rating: 5,
    reviewDate: "10/12/2024",
    reviewText: "Increíble experiencia de juego",
  },
  {
    id: 3,
    productName: "PlayStation Plus Premium",
    productImage: mw3Img,
    rating: 4,
    reviewDate: "5/12/2024",
    reviewText: "Buen servicio, vale la pena",
  },
  {
    id: 4,
    productName: "The Witcher 3: Wild Hunt",
    productImage: cyberpunkImg,
    rating: 5,
    reviewDate: "28/11/2024",
    reviewText: "Obra maestra del gaming",
  },
  {
    id: 5,
    productName: "Red Dead Redemption 2",
    productImage: fifaImg,
    rating: 4,
    reviewDate: "20/11/2024",
    reviewText: "Historia increíble y gráficos espectaculares",
  },
]

export default function MisResenasPage() {
  const navigate = useNavigate()

  const handleProductClick = (productId: number, productName: string) => {
    // Navega a la página de producto; enviamos estado por si se quiere usar luego
    navigate("/producto", { state: { productId, productName } })
  }

  const handleEditReview = (reviewId: number, productName: string) => {
    // Punto de entrada para edición de reseña (pendiente de definir destino)
    // Por ahora dejamos un placeholder
    console.log(`Editar reseña ${reviewId} de ${productName}`)
  }
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
        {/* NavBar compartida */}
        <NavBar />

        {/* Contenido principal */}
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
          {/* Mensaje de agradecimiento */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h5" sx={{ color: "primary.main", fontWeight: "bold" }}>
              Gracias por contribuir a la comunidad
            </Typography>
          </Box>

          {/* Título y contador */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                Mis reseñas
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Mostrando {reviewsData.length} de {reviewsData.length} reseñas
              </Typography>
            </Box>
          </Box>

          {/* Lista de reseñas */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {reviewsData.map((review) => (
              <Card
                key={review.id}
                sx={{
                  bgcolor: "#1e2532",
                  borderRadius: 2,
                  border: "1px solid #2a3441",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    {/* Imagen del producto */}
                    <Avatar
                      src={review.productImage}
                      alt={review.productName}
                      sx={{ width: 80, height: 80, borderRadius: 2 }}
                      variant="rounded"
                    />

                    {/* Información de la reseña */}
                    <Box sx={{ flex: 1 }}>
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
                        onClick={() => handleProductClick(review.id, review.productName)}
                      >
                        {review.productName}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <Rating
                          value={review.rating}
                          readOnly
                          size="small"
                          sx={{
                            "& .MuiRating-iconFilled": {
                              color: "#ffd700",
                            },
                          }}
                        />
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {review.rating} estrellas
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          Fecha de reseña: {review.reviewDate}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                        "{review.reviewText}"
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <IconButton
                        onClick={() => handleEditReview(review.id, review.productName)}
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": { bgcolor: "#3a7bc8" },
                          mb: 1,
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Editar
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
  </Container>
      </Box>
    </ThemeProvider>
  )
}
