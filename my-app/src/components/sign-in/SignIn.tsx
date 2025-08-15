import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import ForgotPassword from './components/ForgotPassword';
import AppTheme from '../shared-theme/AppTheme';
import { SitemarkIcon } from './components/CustomIcons';
import { authService } from '../../services/authService';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  
  // Nuevos estados para la autenticación
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [loginSuccess, setLoginSuccess] = React.useState(false);

  // Debug: Verificar estado de isLoading
  React.useEffect(() => {
    console.log('isLoading estado:', isLoading);
  }, [isLoading]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Función para resetear todos los estados
  const resetForm = () => {
    setIsLoading(false);
    setLoginError('');
    setLoginSuccess(false);
    setEmailError(false);
    setEmailErrorMessage('');
    setPasswordError(false);
    setPasswordErrorMessage('');
    console.log('Formulario reseteado');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevenir reload de página
    
    // Validar inputs antes de enviar
    if (!validateInputs()) {
      return;
    }

    // Limpiar errores previos
    setLoginError('');
    setLoginSuccess(false);
    setIsLoading(true);

    try {
      // Extraer datos del formulario
      const data = new FormData(event.currentTarget);
      const email = data.get('email') as string;
      const password = data.get('password') as string;
      
      // Llamar al servicio de autenticación
      const response = await authService.login({
        mail: email,
        contrasenia: password,
      });

      // Si llegamos aquí, el login fue exitoso
      console.log('Login exitoso:', response);
      
      // Guardar token en localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setLoginSuccess(true);
      setLoginError('');
      
      // Aquí puedes redirigir o actualizar estado global
      alert(`¡Bienvenido ${response.user.nombre}!`);
      
    } catch (error: unknown) {
      console.error('Error en login completo:', error);
      console.error('Tipo de error:', typeof error);
      console.error('Error stringificado:', JSON.stringify(error, null, 2));
      
      // Manejar diferentes tipos de errores
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data?: unknown } };
        console.error('Error de Axios - Status:', axiosError.response?.status);
        console.error('Error de Axios - Data:', axiosError.response?.data);
        
        if (axiosError.response?.status === 401) {
          setLoginError('Email o contraseña incorrectos');
        } else if (axiosError.response?.status === 400) {
          setLoginError('Por favor completa todos los campos');
        } else {
          setLoginError(`Error del servidor (${axiosError.response?.status}). Intenta nuevamente.`);
        }
      } else {
        console.error('Error no es de tipo Axios:', error);
        setLoginError('Error inesperado. Intenta nuevamente.');
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Por favor ingresa una dirección de correo válida.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Iniciar Sesión
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
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
                color={emailError ? 'error' : 'primary'}
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
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                disabled={isLoading}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Recordarme"
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            
            {/* Mostrar errores de login */}
            {loginError && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {loginError}
              </Alert>
            )}
            
            {/* Mostrar éxito de login */}
            {loginSuccess && (
              <Alert severity="success" sx={{ width: '100%' }}>
                ¡Login exitoso! Bienvenido
              </Alert>
            )}
            
            {/* Botón de debug - temporal */}
            {isLoading && (
              <Button 
                onClick={resetForm}
                variant="outlined" 
                color="secondary"
                size="small"
              >
                🔧 Reset (Debug)
              </Button>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 1 }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>
          <Divider>o</Divider>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Typography
                sx={{
                  textAlign: 'center',
                  width: '100%',
                  display: { xs: 'inline', sm: 'inline' }
                }}
              >
                ¿No tienes una cuenta?{' '}
                <Link
                  href="/material-ui/getting-started/templates/sign-in/"
                  variant="body2"
                  sx={{
                  alignSelf: 'center',
                  display: { xs: 'inline', sm: 'inline' }, // Asegura que siempre se muestre
                  }}
                >
                  Regístrate
                </Link>
              </Typography>
            </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
