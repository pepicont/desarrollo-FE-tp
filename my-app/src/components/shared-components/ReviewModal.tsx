import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  Box,
  Typography,
  Rating,
  Avatar,
  CircularProgress,
} from "@mui/material";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (reviewData: {
    detalle: string;
    puntaje: number;
    fecha: string;
  }) => Promise<void>;
  onDelete?: () => Promise<void>; // Nueva prop para eliminar
  mode: 'create' | 'edit';
  productName: string;
  productImage: string;
  loading?: boolean;
  deleteLoading?: boolean; // Nueva prop para loading de eliminación
  // Datos para edición
  initialData?: {
    detalle: string;
    puntaje: number;
    fecha: string;
  };
}

export default function ReviewModal({
  open,
  onClose,
  onSave,
  onDelete,
  mode,
  productName,
  productImage,
  loading = false,
  deleteLoading = false,
  initialData,
}: ReviewModalProps) {
  const [detalle, setDetalle] = useState("");
  const [puntaje, setPuntaje] = useState<number>(0);
  const [fecha, setFecha] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setDetalle(initialData.detalle);
        setPuntaje(initialData.puntaje);
        setFecha(initialData.fecha);
      } else {
        // Modo crear - valores por defecto
        setDetalle("");
        setPuntaje(0);
        setFecha(new Date().toISOString());
      }
    }
  }, [open, mode, initialData]);

  const handleSave = async () => {
    try {
      await onSave({
        detalle,
        puntaje,
        fecha: mode === 'create' ? new Date().toISOString() : fecha,
      });
      handleClose();
    } catch (error) {
      console.error('Error al guardar reseña:', error);
    }
  };

  const handleClose = () => {
    onClose();
    // Limpiar estado
    setDetalle("");
    setPuntaje(0);
    setFecha("");
    setShowDeleteConfirmation(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      try {
        await onDelete();
        handleClose();
      } catch (error) {
        console.error('Error al eliminar reseña:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#141926",
          border: "2px solid #4a90e2",
          borderRadius: 3,
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
          width: { xs: '94vw', sm: '85vw', md: '600px' },
          maxWidth: { xs: '94vw', sm: '85vw', md: '600px' },
          maxHeight: { xs: '90vh', md: '92vh' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)",
          color: "white",
          p: { xs: 2.5, sm: 3 },
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={productImage}
              alt="Producto"
              sx={{
                width: { xs: 52, sm: 60 },
                height: { xs: 52, sm: 60 },
                borderRadius: 2,
                border: "3px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
              variant="rounded"
            />
          </Box>
          <Box sx={{ flex: 1, width: "100%" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                mb: 0.5,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              {mode === 'create' ? 'Agregar Reseña' : 'Editar Reseña'}
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.9, fontWeight: 500, fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              {productName}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 3.5, md: 4 },
          bgcolor: "#141926",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {/* Rating Section */}
        <Box
          sx={{
            mt: { xs: 1.5, sm: 3 },
            mb: { xs: 3, sm: 4 },
            p: { xs: 2.5, sm: 3 },
            bgcolor: "#1e2532",
            borderRadius: 2,
            border: "1px solid #2a3441",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#4a90e2",
              boxShadow: "0 4px 12px rgba(74, 144, 226, 0.1)",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "white",
              mb: { xs: 1.5, sm: 2 },
              fontWeight: "bold",
              fontSize: { xs: "1.05rem", sm: "1.15rem" },
            }}
          >
            Calificación
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 2, sm: 3 },
              width: "100%",
            }}
          >
            <Rating
              value={puntaje}
              onChange={(_, value) => setPuntaje(value || 0)}
              size="large"
              sx={{
                "& .MuiRating-iconFilled": {
                  color: "#f59e0b", // Dorado más suave
                  filter: "drop-shadow(0 1px 2px rgba(245, 158, 11, 0.2))", // Sombra más sutil
                },
                "& .MuiRating-iconEmpty": {
                  color: "#2a3441",
                },
                "& .MuiRating-iconHover": {
                  color: "#fbbf24", // Hover más suave
                },
              }}
            />
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: { xs: 0.75, sm: 1 },
                bgcolor: "#1e2532", // Fondo igual al modal
                borderRadius: 1,
                minWidth: { xs: "100%", sm: "120px" },
                textAlign: "center",
                border: "1px solid #f59e0b", // Borde dorado igual a las estrellas
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: "#f59e0b",
                  fontWeight: "bold",
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                }}
              >
                {puntaje} estrella{puntaje !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Date Section - Solo mostrar en modo edición */}
        {mode === 'edit' && (
          <Box
            sx={{
              mb: { xs: 3, sm: 4 },
              p: { xs: 2.5, sm: 3 },
              bgcolor: "#1e2532",
              borderRadius: 2,
              border: "1px solid #2a3441",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                mb: 1,
                fontWeight: "bold",
                fontSize: { xs: "1.05rem", sm: "1.15rem" },
              }}
            >
              Fecha de reseña
            </Typography>
            <Typography variant="body1" sx={{ color: "#b0b0b0" }}>
              {formatDate(fecha)}
            </Typography>
          </Box>
        )}

        {/* Comment Section */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            bgcolor: "#1e2532",
            borderRadius: 2,
            border: "1px solid #2a3441",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#4a90e2",
              boxShadow: "0 4px 12px rgba(74, 144, 226, 0.1)",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "white",
              mb: { xs: 1.5, sm: 2 },
              fontWeight: "bold",
              fontSize: { xs: "1.05rem", sm: "1.15rem" },
            }}
          >
            Tu opinión
          </Typography>
          <TextField
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="Comparte tu experiencia con este producto..."
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                bgcolor: "#141926",
                fontSize: { xs: "0.95rem", sm: "1rem" },
                "& fieldset": {
                  borderColor: "#2a3441",
                  borderWidth: "2px",
                },
                "&:hover fieldset": {
                  borderColor: "#4a90e2",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4a90e2",
                  boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#666",
                opacity: 1,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{
        p: { xs: 2, sm: 3 },
        gap: { xs: 1, sm: 2 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        width: '100%',
        justifyContent: { xs: 'center', sm: 'flex-end' },
        bgcolor: 'transparent',
      }}>
        {mode === 'edit' && onDelete && (
          <Button
            onClick={handleDeleteClick}
            variant="contained"
            color="error"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              fontWeight: "bold",
              boxShadow: "none",
              textTransform: "none",
              m: 0,
            }}
          >
            Eliminar
          </Button>
        )}
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            width: { xs: '100%', sm: 'auto' },
            fontWeight: "bold",
            boxShadow: "none",
            textTransform: "none",
            color: "#b0b0b0",
            borderColor: "#2a3441",
            m: 0,
            "&:hover": {
              borderColor: "#4a90e2",
              color: "#4a90e2",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !puntaje || !detalle.trim()}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            fontWeight: "bold",
            boxShadow: "none",
            textTransform: "none",
            background: "linear-gradient(135deg, #3a7bd5, #2c5aa0)",
            color: "white",
            m: 0,
            "&:hover": {
              background: "linear-gradient(135deg, #2c5aa0, #1e3d6f)",
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>{mode === 'create' ? 'Creando...' : 'Guardando...'}</span>
            </Box>
          ) : (
            mode === 'create' ? 'Crear Reseña' : 'Guardar'
          )}
        </Button>
      </DialogActions>

      {/* Modal de confirmación para eliminar */}
      <Dialog
        open={showDeleteConfirmation}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            bgcolor: "#141926",
            border: "2px solid #ef4444",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: "#ef4444", fontWeight: "bold" }}>
          ⚠️ Eliminar Reseña
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#b0b0b0" }}>
            ¿Estás seguro de que quieres eliminar esta reseña?
            <br /><br />
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{
          p: 3,
          gap: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          width: '100%',
        }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            sx={{
              color: "#b0b0b0",
              borderColor: "#2a3441",
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 1, sm: 0 },
              "&:hover": {
                borderColor: "#4a90e2",
                color: "#4a90e2",
              },
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            disabled={deleteLoading}
            sx={{
              backgroundColor: "#ef4444",
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 1, sm: 0 },
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
          >
            {deleteLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Eliminando...</span>
              </Box>
            ) : (
              "Sí, eliminar"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
