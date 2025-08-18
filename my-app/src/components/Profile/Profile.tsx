"use client"

import { useState } from "react"
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import MailIcon from "@mui/icons-material/Mail"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import EditIcon from "@mui/icons-material/Edit"
import avatar1 from "../../assets/cyberpunk.jpg"
import avatar2 from "../../assets/fifa24.jpg"
import avatar3 from "../../assets/mw3.jpg"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#141926", paper: "#1e2532" },
    primary: { main: "#4a90e2" },
    text: { primary: "#ffffff", secondary: "#b0b0b0" },
  },
})

const preloadedAvatars = [avatar1, avatar2, avatar3]

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>(preloadedAvatars[0])

  const [userData, setUserData] = useState({
    username: "GamerPro2024",
    realName: "Juan Carlos Pérez",
    email: "juan.perez@email.com",
    birthDate: "1995-03-15",
    accountCreated: "2023-01-10",
  })

  const [editData, setEditData] = useState(userData)

  const handleSave = () => {
    setUserData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(userData)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
          <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 4 }}>
            Mi Perfil
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
              gap: 3,
            }}
          >
            {/* Columna izquierda - Foto de perfil */}
            <Box>
              <Card sx={{ bgcolor: "background.paper", border: "1px solid #2a3441" }}>
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Box sx={{ mb: 3 }}>
                    <Avatar src={selectedAvatar} alt="Foto de perfil" sx={{ width: 128, height: 128, mx: "auto" }} />
                    {isEditing && (
                      <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="avatar-label">Seleccionar foto</InputLabel>
                          <Select
                            labelId="avatar-label"
                            label="Seleccionar foto"
                            value={selectedAvatar}
                            onChange={(e) => setSelectedAvatar(e.target.value as string)}
                          >
                            {preloadedAvatars.map((avatar, index) => (
                              <MenuItem key={avatar} value={avatar}>
                                Avatar {index + 1}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                  </Box>

                  {!isEditing && (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      fullWidth
                    >
                      Editar Perfil
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Columna derecha - Información del usuario */}
            <Box>
              <Card sx={{ bgcolor: "background.paper", border: "1px solid #2a3441" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Nombre de usuario */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountCircleIcon sx={{ color: "primary.main" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Nombre de usuario
                        </Typography>
                        {isEditing ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                          />
                        ) : (
                          <Typography sx={{ color: "white", fontWeight: 500 }}>{userData.username}</Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Nombre real */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon sx={{ color: "success.main" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Nombre real
                        </Typography>
                        {isEditing ? (
                          <TextField
                            size="small"
                            fullWidth
                            value={editData.realName}
                            onChange={(e) => setEditData({ ...editData, realName: e.target.value })}
                          />
                        ) : (
                          <Typography sx={{ color: "white" }}>{userData.realName}</Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Email */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MailIcon sx={{ color: "error.main" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Correo electrónico
                        </Typography>
                        {isEditing ? (
                          <TextField
                            size="small"
                            fullWidth
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          />
                        ) : (
                          <Typography sx={{ color: "white" }}>{userData.email}</Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Fecha de nacimiento */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarMonthIcon sx={{ color: "#b388ff" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Fecha de nacimiento
                        </Typography>
                        {isEditing ? (
                          <TextField
                            size="small"
                            fullWidth
                            type="date"
                            value={editData.birthDate}
                            onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                          />
                        ) : (
                          <Typography sx={{ color: "white" }}>{formatDate(userData.birthDate)}</Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Fecha de creación de cuenta (no editable) */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarMonthIcon sx={{ color: "#ffd54f" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Cuenta creada
                        </Typography>
                        <Typography sx={{ color: "white" }}>{formatDate(userData.accountCreated)}</Typography>
                      </Box>
                    </Box>

                    {/* Botones de acción */}
                    {isEditing && (
                      <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                        <Button variant="contained" color="success" onClick={handleSave} fullWidth>
                          Guardar
                        </Button>
                        <Button variant="outlined" color="inherit" onClick={handleCancel} fullWidth>
                          Cancelar
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
