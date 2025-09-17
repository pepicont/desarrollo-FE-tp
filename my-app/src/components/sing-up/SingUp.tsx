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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import AppTheme from '../shared-theme/AppTheme'
import { SitemarkIcon } from "../sign-in/components/CustomIcons"
import { useEffect } from "react"
import { authService } from "../../services/authService.ts"

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(2.5),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: 480,
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up("md")]: {
    maxWidth: 560,
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up("xl")]: {
    maxWidth: 600,
  },
  boxShadow: "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow: "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}))

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100dvh",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
  backgroundImage: "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundRepeat: "no-repeat",
  ...theme.applyStyles("dark", {
    backgroundImage: "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
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

    //Funcion para prevenir que un usuario entre, vuelva para atrás y siga logueado
    useEffect(() => {
    authService.logout();
  }, []);
  
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
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false)
  
  // Estados para rastrear si el usuario ha interactuado con los campos
  const [fieldsTouched, setFieldsTouched] = React.useState({
    username: false,
    name: false,
    birthDate: false
  })

  // Función para validar el segundo paso
  const validateSecondStep = React.useCallback(() => {
    let isValid = true

    // Validar username solo si está vacío o si tiene contenido pero es muy corto
    if (!formData.username) {
      setUsernameError(true)
      setUsernameErrorMessage("El nombre de usuario es requerido.")
      isValid = false
    } else if (formData.username.length < 3) {
      setUsernameError(true)
      setUsernameErrorMessage("El nombre de usuario debe tener al menos 3 caracteres.")
      isValid = false
    } else {
      setUsernameError(false)
      setUsernameErrorMessage("")
    }

    // Validar nombre solo si está vacío o si tiene contenido pero es muy corto
    if (!formData.name) {
      setNameError(true)
      setNameErrorMessage("El nombre es requerido.")
      isValid = false
    } else if (formData.name.length < 2) {
      setNameError(true)
      setNameErrorMessage("El nombre debe tener al menos 2 caracteres.")
      isValid = false
    } else {
      setNameError(false)
      setNameErrorMessage("")
    }

    // Validar fecha de nacimiento solo si está vacía
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

  // Nota: Se removió la validación automática para evitar errores prematuros
  // La validación solo se ejecutará cuando el usuario intente registrarse

  // Función para manejar cambios en inputs
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Marcar el campo como tocado cuando el usuario interactúa
    if (field === 'username' || field === 'name' || field === 'birthDate') {
      setFieldsTouched(prev => ({ ...prev, [field]: true }))
    }
    
    // Limpiar errores cuando el usuario empiece a escribir (solo para los campos del primer paso)
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
    
    // Para los campos del segundo paso, solo validar si ya se intentó enviar O si el campo tenía un error previo
    const hadError = (field === 'username' && usernameError) || 
                    (field === 'name' && nameError) || 
                    (field === 'birthDate' && birthDateError)
    
    const shouldValidate = hasAttemptedSubmit || hadError
    
    if (shouldValidate) {
      if (field === 'username') {
        const newValue = value as string
        if (!newValue) {
          setUsernameError(true)
          setUsernameErrorMessage("El nombre de usuario es requerido.")
        } else if (newValue.length < 3) {
          setUsernameError(true)
          setUsernameErrorMessage("El nombre de usuario debe tener al menos 3 caracteres.")
        } else {
          setUsernameError(false)
          setUsernameErrorMessage("")
        }
      }
      
      if (field === 'name') {
        const newValue = value as string
        if (!newValue) {
          setNameError(true)
          setNameErrorMessage("El nombre es requerido.")
        } else if (newValue.length < 2) {
          setNameError(true)
          setNameErrorMessage("El nombre debe tener al menos 2 caracteres.")
        } else {
          setNameError(false)
          setNameErrorMessage("")
        }
      }
      
      if (field === 'birthDate') {
        const newValue = value as string
        if (!newValue) {
          setBirthDateError(true)
          setBirthDateErrorMessage("La fecha de nacimiento es requerida.")
        } else {
          setBirthDateError(false)
          setBirthDateErrorMessage("")
        }
      }
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

  const handleNext = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault() // Prevenir el submit del formulario
    const isValid = validateFirstStep()
    if (isValid) {
      setActiveStep(1)
    }
  }

  const handleBack = () => {
    setActiveStep(0)
    setHasAttemptedSubmit(false) // Resetear cuando vuelve atrás
    setFieldsTouched({ username: false, name: false, birthDate: false }) // Resetear campos tocados
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Solo procesar el submit si estamos en el último paso
    if (activeStep !== steps.length - 1) {
      return // No hacer nada si no estamos en el último paso
    }

    // Marcar que se ha intentado enviar el formulario
    setHasAttemptedSubmit(true)

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
        // Enviar mail de bienvenida
        try {
          await import('../../services/mailService').then(({ mailService }) =>
            mailService.welcome(formData.email, formData.name)
          )
        } catch (e) {
          // No bloquear registro si falla el mail
          console.error('Error enviando mail de bienvenida:', e)
        }
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
                error={usernameError && (fieldsTouched.username || hasAttemptedSubmit)}
                helperText={(fieldsTouched.username || hasAttemptedSubmit) && usernameError ? usernameErrorMessage : ""}
                id="username"
                name="username"
                placeholder="mi_usuario"
                autoComplete="username"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                color={usernameError && (fieldsTouched.username || hasAttemptedSubmit) ? "error" : "primary"}
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="name">Nombre Completo</FormLabel>
              <TextField
                error={nameError && (fieldsTouched.name || hasAttemptedSubmit)}
                helperText={(fieldsTouched.name || hasAttemptedSubmit) && nameError ? nameErrorMessage : ""}
                id="name"
                name="name"
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                color={nameError && (fieldsTouched.name || hasAttemptedSubmit) ? "error" : "primary"}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="birthDate">Fecha de Nacimiento</FormLabel>
              <DatePicker
                value={formData.birthDate ? dayjs(formData.birthDate) : null}
                onChange={(newValue) => {
                  const dateString = newValue ? newValue.format('YYYY-MM-DD') : ''
                  handleInputChange("birthDate", dateString)
                }}
                disabled={isLoading}
                slotProps={{
                  textField: {
                    error: birthDateError && (fieldsTouched.birthDate || hasAttemptedSubmit),
                    helperText: (fieldsTouched.birthDate || hasAttemptedSubmit) && birthDateError ? birthDateErrorMessage : "",
                    fullWidth: true,
                    variant: "outlined",
                    required: true,
                    name: "birthDate",
                    id: "birthDate",
                    color: birthDateError && (fieldsTouched.birthDate || hasAttemptedSubmit) ? "error" : "primary"
                  }
                }}
                format="DD/MM/YYYY"
                label=""
              />
            </FormControl>
          </>
        )
      default:
        return "Paso desconocido"
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <SignInContainer direction="column" justifyContent="space-between">
          <Card variant="outlined">
            <SitemarkIcon />
            <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: { xs: '1.75rem', sm: '2rem', md: '2.15rem' } }}>
              Registrarse
            </Typography>
          
          {/* Stepper para mostrar progreso */}
          <Stepper activeStep={activeStep} sx={{ pt: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 5 } }}>
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
              sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: { xs: 1.5, sm: 2 } }}
            >
              {registerError && (
                <Alert severity="error" sx={{ width: "100%" }}>
                  {registerError}
                </Alert>
              )}

              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', flexDirection: 'row', pt: { xs: 1.5, sm: 2 } }}>
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
                    onClick={(e) => handleNext(e)}
                    variant="contained"
                    disabled={isLoading}
                  >
                    Siguiente
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, mt: { xs: 1.5, sm: 2 } }}>
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
    </LocalizationProvider>
  )
}
