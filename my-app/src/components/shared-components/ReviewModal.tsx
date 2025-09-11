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
          p: 3,
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={productImage}
              alt="Producto"
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                border: "3px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
              variant="rounded"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
              {mode === 'create' ? 'Agregar Reseña' : 'Editar Reseña'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
              {productName}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4, bgcolor: "#141926" }}>
        {/* Rating Section */}
        <Box
          sx={{
            mt: 3,
            mb: 4,
            p: 3,
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
          <Typography variant="h6" sx={{ color: "white", mb: 2, fontWeight: "bold" }}>
            Calificación
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
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
                px: 2,
                py: 1,
                bgcolor: "#3a7bd5", // Color más suave
                borderRadius: 1,
                minWidth: "100px",
                textAlign: "center",
              }}
            >
              <Typography variant="body1" sx={{ color: "white", fontWeight: "bold" }}>
                {puntaje} estrella{puntaje !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Date Section - Solo mostrar en modo edición */}
        {mode === 'edit' && (
          <Box
            sx={{
              mb: 4,
              p: 3,
              bgcolor: "#1e2532",
              borderRadius: 2,
              border: "1px solid #2a3441",
            }}
          >
            <Typography variant="h6" sx={{ color: "white", mb: 1, fontWeight: "bold" }}>
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
            p: 3,
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
          <Typography variant="h6" sx={{ color: "white", mb: 2, fontWeight: "bold" }}>
            Tu opinión
          </Typography>
          <TextField
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            multiline
            rows={5}
            fullWidth
            variant="outlined"
            placeholder="Comparte tu experiencia con este producto..."
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                bgcolor: "#141926",
                fontSize: "1rem",
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

      <DialogActions
        sx={{
          p: 4,
          bgcolor: "#1e2532",
          borderTop: "2px solid #2a3441",
          gap: 2,
          justifyContent: "space-between", // Cambiar para distribuir los botones
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Botón de eliminar - solo en modo edición */}
          {mode === 'edit' && onDelete && (
            <Button
              onClick={handleDeleteClick}
              variant="outlined"
              size="large"
              disabled={loading || deleteLoading}
              sx={{
                color: "#ef4444",
                borderColor: "#ef4444",
                borderWidth: "2px",
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  borderColor: "#dc2626",
                  color: "#dc2626",
                  bgcolor: "rgba(239, 68, 68, 0.05)",
                },
              }}
            >
              {deleteLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            size="large"
            disabled={loading || deleteLoading}
            sx={{
              color: "#b0b0b0",
              borderColor: "#2a3441",
              borderWidth: "2px",
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                borderColor: "#4a90e2",
                color: "#4a90e2",
                bgcolor: "rgba(74, 144, 226, 0.05)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            size="large"
            disabled={loading || deleteLoading || !detalle.trim() || puntaje === 0}
            sx={{
              background: "linear-gradient(135deg, #3a7bd5 0%, #2c5aa0 100%)", // Más suave
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              minWidth: 120,
              boxShadow: "0 2px 8px rgba(74, 144, 226, 0.2)", // Sombra más sutil
              "&:hover": {
                background: "linear-gradient(135deg, #2c5aa0 0%, #1e4080 100%)",
                boxShadow: "0 4px 12px rgba(74, 144, 226, 0.25)", // Sombra hover más sutil
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "#2a3441",
                color: "#666",
              },
              transition: "all 0.3s ease",
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
        </Box>
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
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            sx={{
              color: "#b0b0b0",
              borderColor: "#2a3441",
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
