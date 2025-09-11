"use client"

import { useState, useEffect } from "react"
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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import NavBar from "../navBar/navBar"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import MailIcon from "@mui/icons-material/Mail"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import EditIcon from "@mui/icons-material/Edit"
import KeyIcon from '@mui/icons-material/Key';
import avatar1 from "../../assets/cyberpunk.jpg"
import avatar2 from "../../assets/fifa24.jpg"
import avatar3 from "../../assets/mw3.jpg"
import { authService } from "../../services/authService"
import { getUserProfile, updateUserProfile } from "../../services/profileService"

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
  // Estado para mostrar los campos de contraseña
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  // Estados para el cambio de contraseña

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
  
  // Handlers para los campos de contraseña
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setNewPasswordError("");
  };
  const handleConfirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmNewPassword(e.target.value);
    setConfirmNewPasswordError("");
  };

  const [isEditing, setIsEditing] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>(preloadedAvatars[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showEmailWarning, setShowEmailWarning] = useState(false)
  const [pendingEmailChange, setPendingEmailChange] = useState("")
  const [emailWarningShown, setEmailWarningShown] = useState(false)

  const [userData, setUserData] = useState({
    username: "",
    realName: "",
    email: "",
    birthDate: "",
    accountCreated: "",
  })

  const [editData, setEditData] = useState(userData)

  // Cargar datos del perfil cuando el componente se monta
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = authService.getToken()
        if (!token) {
          setError('No estás autenticado')
          setLoading(false)
          return
        }
        const profile = await getUserProfile(token)
        const formatUTCDate = (dateString: string) => {
          const date = new Date(dateString)
          return date.toISOString().split('T')[0]
        }
        const updatedUserData = {
          username: profile.nombreUsuario,
          realName: profile.nombre,
          email: profile.mail,
          birthDate: formatUTCDate(profile.fechaNacimiento),
          accountCreated: formatUTCDate(profile.fechaCreacion),
        }
        setUserData(updatedUserData)
        setEditData(updatedUserData)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError('Error al cargar el perfil')
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setUsernameError('')
      setEmailError('')
      setSuccessMessage('')
      
      // Validar campos obligatorios
      if (!editData.realName.trim() || !editData.username.trim() || !editData.email.trim()) {
        setError('Todos los campos son obligatorios')
        return
      }
      
      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editData.email)) {
        setEmailError('Por favor ingresa un email válido')
        return
      }
      
      const token = authService.getToken()

      // Validar contraseña solo si el campo está visible y tiene contenido
      if (showPasswordFields && (newPassword || confirmNewPassword)) {
        
        let valid = true;
        if (newPassword.length < 6) {
          setNewPasswordError('La contraseña debe tener al menos 6 caracteres.')
          valid = false;
        } else {
          setNewPasswordError("");
        }
        if (confirmNewPassword !== newPassword) {
          setConfirmNewPasswordError('Las contraseñas no coinciden.')
          valid = false;
        } else {
          setConfirmNewPasswordError("");
        }
        if (!valid) return;
      } 

      if (!token) {
        setError('No estás autenticado')
        return
      }

      // Primero obtenemos el ID del usuario actual
      // Usar getUserProfile para obtener el id
      const profile = await getUserProfile(token)
      const userId = profile.id
      const updateData = {
        nombre: editData.realName,
        nombreUsuario: editData.username,
        mail: editData.email,
        fechaNacimiento: editData.birthDate,
      }

      // Usar el servicio updateUserProfile
        if (showPasswordFields && newPassword) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updateData as any).contrasenia = newPassword
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let error: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = null;
      try {
        result = await updateUserProfile(token, userId, updateData);
      } catch (err) {
        error = err;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      {showPasswordFields ? "Ocultar campos" : "Cambiar contraseña"}
      const errorMessage = error?.message || error?.error || result?.message || result?.error || "Error al guardar los cambios";
      if (error || result?.error) {
        if (errorMessage.includes('Duplicate entry') && errorMessage.includes('usuario_nombre_usuario_unique')) {
          setUsernameError("El nombre de usuario ya está en uso");
        } else if (errorMessage.includes('Duplicate entry') && errorMessage.includes('usuario_mail_unique')) {
          setEmailError("El email ya está registrado");
        } else {
          setError(errorMessage);
        }
        return;
      }
      // Si todo ok
      setUserData(editData);
      setIsEditing(false);
      setSuccessMessage('Perfil actualizado correctamente');
      setNewPassword("");
      setConfirmNewPassword("");
      setNewPasswordError("");
      setConfirmNewPasswordError("");
      setShowPasswordFields(false);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Actualizar la variable 'user' en localStorage o sessionStorage
      const storage = localStorage.getItem('user') ? localStorage : sessionStorage.getItem('user') ? sessionStorage : null;
      if (storage) {
        try {
          const userRaw = storage.getItem('user');
          if (userRaw) {
            const userObj = JSON.parse(userRaw);
            userObj.mail = editData.email;
            userObj.nombre = editData.realName;
            storage.setItem('user', JSON.stringify(userObj));
          }
        } catch (e) {
          // Si hay error, no romper la app
          console.error('No se pudo actualizar la variable user en storage:', e);
        }
      }
    } catch (error: unknown) {
      console.error('Error saving profile:', error)
      setError('Error de conexión al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
  setEditData(userData)
  setIsEditing(false)
  setEmailWarningShown(false) // Resetear la bandera al cancelar
  setShowPasswordFields(false) // Oculta los campos de contraseña y vuelve a mostrar el botón
  setNewPassword("");
  setConfirmNewPassword("");
  setNewPasswordError("");
  setConfirmNewPasswordError("");
  }

  // Función para manejar el cambio de email con advertencia
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    
    // Limpiar error de email cuando el usuario empiece a escribir
    if (emailError) {
      setEmailError('')
    }
    
    if (newEmail !== userData.email && userData.email && !emailWarningShown) {
      // Si el email es diferente al actual y no se ha mostrado la advertencia, mostrarla
      setPendingEmailChange(newEmail)
      setShowEmailWarning(true)
      setEmailWarningShown(true)
    } else {
      // Si es el mismo email, es la primera vez, o ya se mostró la advertencia, permitir el cambio directo
      setEditData({ ...editData, email: newEmail })
    }
  }

  // Confirmar el cambio de email
  const confirmEmailChange = () => {
    setEditData({ ...editData, email: pendingEmailChange })
    setShowEmailWarning(false)
    setPendingEmailChange("")
  }

  // Cancelar el cambio de email
  const cancelEmailChange = () => {
    setShowEmailWarning(false)
    setPendingEmailChange("")
    setEmailWarningShown(false) // Resetear para permitir mostrar la advertencia de nuevo
  }

  const formatDate = (dateString: string) => {
    // Crear fecha asegurándose de que se interprete correctamente
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
  }

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <NavBar />
          <Container maxWidth="lg" sx={{ py: 4, mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} />
          </Container>
        </Box>
      </ThemeProvider>
    )
  }

  // Mostrar error si ocurrió algún problema crítico (no errores de validación)
  if (error && (error.includes('autenticado') || error.includes('conexión') || error.includes('cargar'))) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <NavBar />
          <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}
          </Container>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
          <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 4 }}>
            Mi Perfil
          </Typography>

          {/* Mensajes de error y éxito */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}

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
                            onChange={(e) => {
                              setEditData({ ...editData, username: e.target.value })
                              if (usernameError) setUsernameError('')
                            }}
                            error={!!usernameError}
                            helperText={usernameError}
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
                            onChange={handleEmailChange}
                            error={!!emailError}
                            helperText={emailError}
                          />
                        ) : (
                          <Typography sx={{ color: "white" }}>{userData.email}</Typography>
                        )}
                      </Box>
                    </Box>


                    {/* Contraseña */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mt: 2 }}>
                      <KeyIcon sx={{ color: "#FFA726", mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Contraseña
                        </Typography>
                        {!isEditing && (
                          <Typography sx={{ color: "white", fontWeight: 500 }}>••••••••••</Typography>
                        )}
                        {isEditing && !showPasswordFields && (
                          <Box sx={{ mt: 1 }}>
                            <Button 
                              variant="contained" 
                              sx={{ width: '100%', bgcolor: '#455A64', color: '#fff', '&:hover': { bgcolor: '#607D8B' } }}
                              onClick={() => {
                                setNewPassword("");
                                setConfirmNewPassword("");
                                setNewPasswordError("");
                                setConfirmNewPasswordError("");
                                setShowPasswordFields(true);
                              }}
                            >
                              Cambiar contraseña
                            </Button>
                          </Box>
                        )}
                        {isEditing && showPasswordFields && (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                            <TextField
                              label="Nueva contraseña"
                              type="password"
                              size="small"
                              value={newPassword}
                              onChange={handleNewPasswordChange}
                              error={!!newPasswordError}
                              helperText={newPasswordError}
                              placeholder="••••••••"
                              fullWidth
                            />
                            <TextField
                              label="Confirmar contraseña"
                              type="password"
                              size="small"
                              value={confirmNewPassword}
                              onChange={handleConfirmNewPasswordChange}
                              error={!!confirmNewPasswordError}
                              helperText={confirmNewPasswordError}
                              placeholder="••••••••"
                              fullWidth
                            />
                          </Box>
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
                        <Button 
                          variant="contained" 
                          color="success" 
                          onClick={handleSave} 
                          fullWidth
                          disabled={saving}
                        >
                          {saving ? <CircularProgress size={20} /> : 'Guardar'}
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="inherit" 
                          onClick={handleCancel} 
                          fullWidth
                          disabled={saving}
                        >
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

      {/* Modal de confirmación para cambio de email */}
      <Dialog
        open={showEmailWarning}
        onClose={cancelEmailChange}
        aria-labelledby="email-warning-dialog-title"
        aria-describedby="email-warning-dialog-description"
      >
        <DialogTitle id="email-warning-dialog-title">
          ⚠️ Cambio de Email
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="email-warning-dialog-description">
            Al cambiar tu dirección de email, también se modificarán tus credenciales de login. 
            Tendrás que iniciar sesión con la nueva dirección de email.
            <br /><br />
            ¿Estás seguro de que quieres continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEmailChange} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmEmailChange} color="warning" variant="contained">
            Sí, cambiar email
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}
