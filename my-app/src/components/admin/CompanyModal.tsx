import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Business as BusinessIcon } from "@mui/icons-material";
import type { Company } from "../../services/companyService";

interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (companyData: {
    nombre: string;
    detalle: string;
  }) => Promise<void>;
  loading?: boolean;
  editingCompany?: Company | null;
}

export default function CompanyModal({
  open,
  onClose,
  onSave,
  loading = false,
  editingCompany = null,
}: CompanyModalProps) {
  const [nombre, setNombre] = useState("");
  const [detalle, setDetalle] = useState("");

  // Actualizar formulario cuando se abre el modal o cambia la compañía a editar
  useEffect(() => {
    if (open) {
      if (editingCompany) {
        setNombre(editingCompany.nombre);
        setDetalle(editingCompany.detalle);
      } else {
        setNombre("");
        setDetalle("");
      }
    }
  }, [open, editingCompany]);

  // Verificar si hay cambios en modo edición
  const hasChanges = editingCompany
    ? nombre.trim() !== editingCompany.nombre || detalle.trim() !== editingCompany.detalle
    : true;

  const handleSave = async () => {
    try {
      await onSave({
        nombre: nombre.trim(),
        detalle: detalle.trim(),
      });
      handleClose();
    } catch (error) {
      console.error('Error al guardar compañía:', error);
    }
  };

  const handleClose = () => {
    onClose();
    // Limpiar estado
    setNombre("");
    setDetalle("");
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
          width: { xs: '95vw', sm: '90vw', md: '600px' },
          maxWidth: { xs: '95vw', sm: '90vw', md: '600px' },
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
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              border: "3px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.1)",
            }}
          >
            <BusinessIcon sx={{ fontSize: 32, color: "white" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
              {editingCompany ? "Editar Compañía" : "Agregar Compañía"}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
              {editingCompany ? "Modificar información de la compañía" : "Crear nueva compañía en el sistema"}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4, bgcolor: "#141926" }}>
        {/* Company Name Section */}
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
            Nombre de la Compañía
          </Typography>
          <TextField
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Ej: Electronic Arts, Ubisoft, Nintendo..."
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

        {/* Company Details Section */}
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
            Descripción
          </Typography>
          <TextField
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="Describe brevemente la compañía..."
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
          disabled={loading || !nombre.trim() || !detalle.trim() || !hasChanges}
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
              <span>{editingCompany ? 'Actualizando...' : 'Creando...'}</span>
            </Box>
          ) : (
            editingCompany ? 'Editar Compañía' : 'Crear Compañía'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}