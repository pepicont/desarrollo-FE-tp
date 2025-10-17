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
import Modal from "@mui/material/Modal"
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
import { signupUser } from '../../services/profileService';
import { mailService } from '../../services/mailService';

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(2.5),
  gap: theme.spacing(2),
  margin: "auto",
  my: 2,
  borderRadius: '24px',
  backdropFilter: 'blur(20px)',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.9)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.3)',
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
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), 0 2px 8px 0 rgba(31, 38, 135, 0.1)',
  ...theme.applyStyles("dark", {
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 2px 8px 0 rgba(0, 0, 0, 0.3)',
  }),
}))

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100dvh",
  minWidth: '100vw',
  width: '100%',
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  overflowY: 'auto',
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
  backgroundColor: 'hsl(210, 100%, 97%)',
  ...theme.applyStyles("dark", {
    backgroundColor: 'hsl(220, 30%, 8%)',
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
  const [termsModalOpen, setTermsModalOpen] = React.useState(false)
  
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

      // Usar el servicio migrado
      const result = await signupUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        username: formData.username,
        birthDate: formData.birthDate
      });

      setRegisterSuccess(true)
      setRegisterError("")
      // Enviar mail de bienvenida
      try {
        await mailService.welcome(result.user.mail, result.user.nombre)
      } catch (e) {
        // No bloquear registro si falla el mail
        console.error('Error enviando mail de bienvenida:', e)
      }
      // Redirigir al login después de 2 segundos para que el usuario pueda iniciar sesión
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (error: unknown) {
      setRegisterError((error as Error)?.message || "Error en el registro")
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
                helperText={emailError ? emailErrorMessage : " "}
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
                FormHelperTextProps={{
                  sx: {
                    minHeight: '1.5em',
                    margin: 0,
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Contraseña</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordError ? passwordErrorMessage : " "}
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
                FormHelperTextProps={{
                  sx: {
                    minHeight: '1.5em',
                    margin: 0,
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="confirmPassword">Confirmar Contraseña</FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordError ? confirmPasswordErrorMessage : " "}
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
                FormHelperTextProps={{
                  sx: {
                    minHeight: '1.5em',
                    margin: 0,
                  },
                }}
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
              label={
                <Box component="span">
                  Acepto los{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      '&:hover': {
                        color: '#1976d2',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    términos y condiciones
                  </Link>
                </Box>
              }
            />
            <Box sx={{ minHeight: '1.5em' }}>
              {termsError && (
                <Typography variant="caption" color="error">
                  Debes aceptar los términos y condiciones
                </Typography>
              )}
            </Box>
          </>
        )
      case 1:
        return (
          <>
            <FormControl>
              <FormLabel htmlFor="username">Nombre de Usuario</FormLabel>
              <TextField
                error={usernameError && (fieldsTouched.username || hasAttemptedSubmit)}
                helperText={(fieldsTouched.username || hasAttemptedSubmit) && usernameError ? usernameErrorMessage : " "}
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
                FormHelperTextProps={{
                  sx: {
                    minHeight: '1.5em',
                    margin: 0,
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="name">Nombre Completo</FormLabel>
              <TextField
                error={nameError && (fieldsTouched.name || hasAttemptedSubmit)}
                helperText={(fieldsTouched.name || hasAttemptedSubmit) && nameError ? nameErrorMessage : " "}
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
                FormHelperTextProps={{
                  sx: {
                    minHeight: '1.5em',
                    margin: 0,
                  },
                }}
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
                    helperText: (fieldsTouched.birthDate || hasAttemptedSubmit) && birthDateError ? birthDateErrorMessage : " ",
                    fullWidth: true,
                    variant: "outlined",
                    required: true,
                    name: "birthDate",
                    id: "birthDate",
                    color: birthDateError && (fieldsTouched.birthDate || hasAttemptedSubmit) ? "error" : "primary",
                    FormHelperTextProps: {
                      sx: {
                        minHeight: '1.5em',
                        margin: 0,
                      },
                    },
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

        {/* Modal de Términos y Condiciones */}
        <Modal
          open={termsModalOpen}
          onClose={() => setTermsModalOpen(false)}
          aria-labelledby="modal-terminos-titulo"
          aria-describedby="modal-terminos-descripcion"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: "80%", md: "70%" },
              maxWidth: "800px",
              maxHeight: "80vh",
              bgcolor: "background.paper",
              border: "2px solid #000",
              borderRadius: 2,
              boxShadow: 24,
              p: 0,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: "1px solid #ddd", textAlign: "center" }}>
              <Typography id="modal-terminos-titulo" variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
                Términos y Condiciones
              </Typography>
            </Box>

            {/* Contenido */}
            <Box sx={{ p: 3, maxHeight: "60vh", overflowY: "auto" }}>
              <Typography variant="body1" paragraph>
                <strong>1. Aceptación de los términos</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                Al registrarte y utilizar nuestro portal de videojuegos, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestros servicios.
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>2. Normas de comportamiento</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                • Mantén un comportamiento respetuoso hacia otros usuarios<br/>
                • No publiques contenido ofensivo, discriminatorio o inapropiado<br/>
                • No uses lenguaje vulgar o amenazante en comentarios y reseñas<br/>
                • Respeta las opiniones de otros usuarios, aunque no las compartas<br/>
                • No hagas spam ni publiques contenido repetitivo
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>3. Uso de la cuenta</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                • Eres responsable de mantener la seguridad de tu cuenta<br/>
                • No compartas tus credenciales con terceros<br/>
                • Notifica inmediatamente cualquier uso no autorizado<br/>
                • Proporciona información veraz y actualizada en tu perfil
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>4. Contenido y reseñas</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                • Las reseñas deben ser honestas y basadas en tu experiencia real<br/>
                • No publiques reseñas falsas o manipuladas<br/>
                • El contenido ofensivo será eliminado sin previo aviso<br/>
                • Nos reservamos el derecho de moderar todas las publicaciones
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>5. Compras y pagos</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                • Todas las transacciones son finales una vez completadas<br/>
                • Los precios pueden cambiar sin previo aviso<br/>
                • Los métodos de pago deben ser legítimos y de tu propiedad<br/>
                • Las claves de productos digitales no son reembolsables
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>6. Privacidad</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                Respetamos tu privacidad y protegemos tus datos personales según nuestra política de privacidad. No compartimos tu información con terceros sin tu consentimiento.
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>7. Suspensión y terminación</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos. Las violaciones graves pueden resultar en la prohibición permanente del servicio.
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>8. Limitación de responsabilidad</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                No somos responsables de daños indirectos, pérdida de datos o interrupciones del servicio. Nuestro servicio se proporciona "tal como está".
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>9. Modificaciones</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                Estos términos pueden modificarse en cualquier momento. Los cambios importantes serán notificados a los usuarios registrados.
              </Typography>
            </Box>

            {/* Footer */}
            <Box sx={{ p: 3, borderTop: "1px solid #ddd", textAlign: "center" }}>
              <Button
                variant="contained"
                onClick={() => setTermsModalOpen(false)}
                sx={{ minWidth: "120px" }}
              >
                Entendido
              </Button>
            </Box>
          </Box>
        </Modal>
      </SignInContainer>
    </AppTheme>
    </LocalizationProvider>
  )
}
