
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import CircularProgress from '@mui/material/CircularProgress';
import { mailService } from '../../../services/mailService';

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}


export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ open: boolean; success: boolean; message: string }>({ open: false, success: false, message: '' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await mailService.forgotPassword(email);
      setResult({ open: true, success: true, message: 'Email enviado con éxito. Chequea tu bandeja.' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      setResult({ open: true, success: false, message: 'No se encontró un mail asociado a esa cuenta.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResultClose = () => {
    setResult({ open: false, success: false, message: '' });
    handleClose();
    setEmail('');
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: handleSubmit,
            sx: { backgroundImage: 'none' },
          },
        }}
      >
        <DialogTitle>Restablecer contraseña</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <DialogContentText>
            Ingresa la dirección de correo electrónico de tu cuenta y te enviaremos una nueva contraseña si existe una cuenta asociada.
          </DialogContentText>
          <OutlinedInput
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label="Email address"
            placeholder="Aquí mail de tu cuenta de portalvideojuegos"
            type="email"
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading || !email}
            startIcon={loading ? <CircularProgress size={18} sx={{ color: '#111' }} /> : null}
            sx={{
              backgroundColor: '#fff',
              color: '#111',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#f0f0f0',
                color: '#111',
              },
              '&:disabled': {
                backgroundColor: '#eee',
                color: '#888',
              },
            }}
          >
            {loading ? 'Enviando...' : 'Continuar'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal de resultado */}
      <Dialog
        open={result.open}
        onClose={handleResultClose}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'rgba(23,28,38,0.98)',
              border: '1px solid #232b3b',
              borderRadius: 2.5,
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)',
              p: 0,
              overflow: 'hidden',
              minWidth: 340,
            },
          },
        }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', bgcolor: 'rgba(23,28,38,0.98)', p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, textAlign: 'left' }}>
              {result.success ? 'Confirmación de envío' : 'Mail inexistente'}
            </span>
          </Box>
          <DialogContentText
            sx={{
              color: '#B0BEC5',
              fontWeight: 400,
              textAlign: 'left',
              fontSize: 16,
              mt: 0,
            }}
          >
            {result.success ? (
              <>
                Mail enviado exitosamente.<br />
                Por favor, revisa tu bandeja de correo electrónico. No olvides de revisar tu bandeja de spam
              </>
            ) : (
              <>
                No se encontró una cuenta de Portalvideojuegos con ese mail.<br />
                Por favor, valida que el mail ingresado sea el de tu cuenta.
              </>
            )}
          </DialogContentText>
        </DialogContent>
  <DialogActions sx={{ pb: 3, px: 3, bgcolor: 'rgba(23,28,38,0.98)', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleResultClose}
            variant="contained"
            sx={{
              backgroundColor: '#fff',
              color: '#111',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                color: '#111',
              },
              '&:disabled': {
                backgroundColor: '#eee',
                color: '#888',
              },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
