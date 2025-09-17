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
import { useEffect } from 'react';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(2.5),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: 420,
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: 480,
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 520,
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100dvh',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  backgroundImage:
    'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
  backgroundRepeat: 'no-repeat',
  ...theme.applyStyles('dark', {
    backgroundImage:
      'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
  }),
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [loginSuccess, setLoginSuccess] = React.useState(false);

  // Debug opcional
  React.useEffect(() => {
    // console.log('isLoading estado:', isLoading);
  }, [isLoading]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEmailError(false);
    setEmailErrorMessage('');
    setPasswordError(false);
    setPasswordErrorMessage('');
  };

  // Forzar logout al entrar a la pantalla
  useEffect(() => {
    authService.logout();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) return;

    setLoginError('');
    setLoginSuccess(false);
    setIsLoading(true);

    try {
      const data = new FormData(event.currentTarget);
      const email = data.get('email') as string;
      const password = data.get('password') as string;
      const remember = data.get('rememberMe') === 'remember';

      const response = await authService.login({
        mail: email,
        contrasenia: password,
      });

      authService.saveToken(response.token, remember);
      if (remember) {
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(response.user));
      }

      setLoginSuccess(true);
      setLoginError('');
      window.location.href = '/';
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data?: unknown } };
        if (axiosError.response?.status === 401) {
          setLoginError('Email o contraseña incorrectos');
        } else if (axiosError.response?.status === 400) {
          setLoginError('Por favor completa todos los campos');
        } else {
          setLoginError(`Error del servidor (${axiosError.response?.status}). Intenta nuevamente.`);
        }
      } else {
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
            sx={{ width: '100%', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.15rem' } }}
          >
            Iniciar Sesión
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: { xs: 1.5, sm: 2 } }}
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
            <FormControlLabel control={<Checkbox value="remember" name="rememberMe" color="primary" />} label="Recordarme" />
            <ForgotPassword open={open} handleClose={handleClose} />

            {loginError && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {loginError}
              </Alert>
            )}

            {loginSuccess && (
              <Alert severity="success" sx={{ width: '100%' }}>
                ¡Login exitoso! Bienvenido
              </Alert>
            )}

            <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ mt: 1 }}>
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
            <Link component="button" type="button" onClick={handleClickOpen} variant="body2" sx={{ alignSelf: 'center', mt: 1 }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>
          <Divider sx={{ my: { xs: 1, sm: 2 } }}>o</Divider>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Typography sx={{ textAlign: 'center', width: '100%', display: { xs: 'inline', sm: 'inline' } }}>
              ¿No tienes una cuenta?{' '}
              <Link href="/register" variant="body2" sx={{ alignSelf: 'center', display: { xs: 'inline', sm: 'inline' } }}>
                Regístrate
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
