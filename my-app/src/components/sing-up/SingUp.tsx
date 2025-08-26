"use client"

import * as React from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import CssBaseline from "@mui/material/CssBaseline"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormLabel from "@mui/material/FormLabel"
import FormControl from "@mui/material/FormControl"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import MuiCard from "@mui/material/Card"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepLabel from "@mui/material/StepLabel"
import { styled } from "@mui/material/styles"
import AppTheme from '../shared-theme/AppTheme'
import { SitemarkIcon } from "../sign-in/components/CustomIcons"

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("xl")]: {
    maxWidth: "500px",
  },
  boxShadow: "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow: "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}))

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("xl")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage: "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage: "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}))

const steps = ['Datos de cuenta', 'Información personal']

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const [activeStep, setActiveStep] = React.useState(0)
  
  // Estados para los valores del formulario
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    username: "",
    name: "",
    birthDate: "",
  })
  
  // Estados de validación por paso
  const [emailError, setEmailError] = React.useState(false)
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("")
  const [passwordError, setPasswordError] = React.useState(false)
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("")
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false)
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState("")
  const [termsError, setTermsError] = React.useState(false)
  
  // Estados del segundo paso
  const [usernameError, setUsernameError] = React.useState(false)
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("")
  const [nameError, setNameError] = React.useState(false)
  const [nameErrorMessage, setNameErrorMessage] = React.useState("")
  const [birthDateError, setBirthDateError] = React.useState(false)
  const [birthDateErrorMessage, setBirthDateErrorMessage] = React.useState("")

  const [isLoading, setIsLoading] = React.useState(false)
  const [registerError, setRegisterError] = React.useState("")
  const [registerSuccess, setRegisterSuccess] = React.useState(false)

  // Función para validar el segundo paso
  const validateSecondStep = React.useCallback(() => {
    let isValid = true

    if (!formData.username || formData.username.length < 3) {
      setUsernameError(true)
      setUsernameErrorMessage("El nombre de usuario debe tener al menos 3 caracteres.")
      isValid = false
    } else {
      setUsernameError(false)
      setUsernameErrorMessage("")
    }

    if (!formData.name || formData.name.length < 2) {
      setNameError(true)
      setNameErrorMessage("El nombre debe tener al menos 2 caracteres.")
      isValid = false
    } else {
      setNameError(false)
      setNameErrorMessage("")
    }

    if (!formData.birthDate) {
      setBirthDateError(true)
      setBirthDateErrorMessage("La fecha de nacimiento es requerida.")
      isValid = false
    } else {
      setBirthDateError(false)
      setBirthDateErrorMessage("")
    }

    return isValid
  }, [formData.username, formData.name, formData.birthDate])

  // Validar automáticamente el segundo paso cuando esté en esa página
  React.useEffect(() => {
    if (activeStep === 1) {
      validateSecondStep()
    }
  }, [activeStep, validateSecondStep])

  // Función para manejar cambios en inputs
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error cuando el usuario empiece a escribir
    if (field === 'email' && emailError) {
      setEmailError(false)
      setEmailErrorMessage("")
    }
    if (field === 'password' && passwordError) {
      setPasswordError(false)
      setPasswordErrorMessage("")
    }
    if (field === 'confirmPassword' && confirmPasswordError) {
      setConfirmPasswordError(false)
      setConfirmPasswordErrorMessage("")
    }
    if (field === 'username' && usernameError) {
      setUsernameError(false)
      setUsernameErrorMessage("")
    }
    if (field === 'name' && nameError) {
      setNameError(false)
      setNameErrorMessage("")
    }
    if (field === 'birthDate' && birthDateError) {
      setBirthDateError(false)
      setBirthDateErrorMessage("")
    }
  }

  const validateFirstStep = () => {
    let isValid = true

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailError(true)
      setEmailErrorMessage("Por favor ingresa una dirección de correo válida.")
      isValid = false
    } else {
      setEmailError(false)
      setEmailErrorMessage("")
    }

    if (!formData.password || formData.password.length < 6) {
      setPasswordError(true)
      setPasswordErrorMessage("La contraseña debe tener al menos 6 caracteres.")
      isValid = false
    } else {
      setPasswordError(false)
      setPasswordErrorMessage("")
    }

    if (!formData.confirmPassword || formData.confirmPassword !== formData.password) {
      setConfirmPasswordError(true)
      setConfirmPasswordErrorMessage("Las contraseñas no coinciden.")
      isValid = false
    } else {
      setConfirmPasswordError(false)
      setConfirmPasswordErrorMessage("")
    }

    if (!formData.acceptTerms) {
      setTermsError(true)
      isValid = false
    } else {
      setTermsError(false)
    }

    return isValid
  }

  const handleNext = () => {
    const isValid = validateFirstStep()
    if (isValid) {
      setActiveStep(1)
    }
  }

  const handleBack = () => {
    setActiveStep(0)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Solo procesar el submit si estamos en el último paso
    if (activeStep !== steps.length - 1) {
      return
    }

    if (!validateSecondStep()) {
      return
    }

    setRegisterError("")
    setRegisterSuccess(false)
    setIsLoading(true)

    try {
      console.log("Registration attempt:", formData)

      // Llamada real al backend
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: formData.email,
          contrasenia: formData.password,
          nombre: formData.name,
          nombreUsuario: formData.username,
          fechaNacimiento: formData.birthDate
        })
      })

      const result = await response.json()

      if (response.ok) {
        setRegisterSuccess(true)
        setRegisterError("")
        
        // Guardar token en localStorage
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        // Redirigir al login después de 2 segundos para que el usuario pueda iniciar sesión
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setRegisterError(result.message || "Error en el registro")
      }
    } catch (error: unknown) {
      console.error("Error en registro:", error)
      setRegisterError("Error de conexión. Verifica que el servidor esté ejecutándose.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <FormControl>
              <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                color={emailError ? "error" : "primary"}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Contraseña</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                color={passwordError ? "error" : "primary"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="confirmPassword">Confirmar Contraseña</FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                name="confirmPassword"
                placeholder="••••••"
                type="password"
                id="confirmPassword"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                color={confirmPasswordError ? "error" : "primary"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  value="accept"
                  color="primary"
                  disabled={isLoading}
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                />
              }
              label="Acepto los términos y condiciones"
              sx={{ color: termsError ? 'error.main' : 'inherit' }}
            />
            {termsError && (
              <Typography variant="caption" color="error">
                Debes aceptar los términos y condiciones
              </Typography>
            )}
          </>
        )
      case 1:
        return (
          <>
            <FormControl>
              <FormLabel htmlFor="username">Nombre de Usuario</FormLabel>
              <TextField
                error={usernameError}
                helperText={usernameErrorMessage}
                id="username"
                name="username"
                placeholder="mi_usuario"
                autoComplete="username"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                color={usernameError ? "error" : "primary"}
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="name">Nombre Completo</FormLabel>
              <TextField
                error={nameError}
                helperText={nameErrorMessage}
                id="name"
                name="name"
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                color={nameError ? "error" : "primary"}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="birthDate">Fecha de Nacimiento</FormLabel>
              <TextField
                error={birthDateError}
                helperText={birthDateErrorMessage}
                id="birthDate"
                name="birthDate"
                type="date"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                color={birthDateError ? "error" : "primary"}
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
          </>
        )
      default:
        return "Paso desconocido"
    }
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Registrarse
          </Typography>
          
          {/* Stepper para mostrar progreso */}
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {registerSuccess ? (
            <Alert severity="success" sx={{ width: "100%" }}>
              ¡Registro exitoso! Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...
            </Alert>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 2,
              }}
            >
              {registerError && (
                <Alert severity="error" sx={{ width: "100%" }}>
                  {registerError}
                </Alert>
              )}

              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0 || isLoading}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Atrás
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      position: "relative",
                    }}
                  >
                    {isLoading && (
                      <CircularProgress
                        size={16}
                        sx={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          marginLeft: "-8px",
                          marginTop: "-8px",
                        }}
                      />
                    )}
                    {isLoading ? "Registrando..." : "Registrarse"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    variant="contained"
                    disabled={isLoading}
                  >
                    Siguiente
                  </Button>
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Typography
                  component="p"
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    width: "100%",
                    display: { xs: "inline", sm: "inline" },
                  }}
                >
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href="/login"
                    variant="body2"
                    sx={{
                      alignSelf: "center",
                      display: { xs: "inline", sm: "inline" },
                    }}
                  >
                    Iniciar Sesión
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}
        </Card>
      </SignInContainer>
    </AppTheme>
  )
}
