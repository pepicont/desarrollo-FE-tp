"use client"
import { Box, Button, Typography, useTheme, alpha } from "@mui/material"
import { ChevronLeft, ChevronRight, MoreHoriz } from "@mui/icons-material"

interface ModernPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

export default function ModernPagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: ModernPaginationProps) {
  const theme = useTheme()

  // Función para cambiar página y hacer scroll hacia arriba
  const handlePageChange = (page: number) => {
    onPageChange(page)
    // Scroll suave hacia arriba
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Generar números de página visibles
  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = []

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    // Siempre mostrar página 1
    pages.push(1)

    // Calcular rango alrededor de la página actual
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    // Agregar ellipsis si hay gap después del 1
    if (start > 2) {
      pages.push("ellipsis")
    }

    // Agregar páginas del rango
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }

    // Agregar ellipsis si hay gap antes del último
    if (end < totalPages - 1) {
      pages.push("ellipsis")
    }

    // Siempre mostrar última página (si no es la primera)
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  const buttonStyle = {
    minWidth: 40,
    height: 40,
    borderRadius: 2,
    fontWeight: 600,
    textTransform: "none" as const,
    transition: "all 0.2s ease-in-out",
  }

  const pageButtonStyle = (isActive: boolean) => ({
    ...buttonStyle,
    backgroundColor: isActive ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.08),
    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
    border: `1px solid ${isActive ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.2)}`,
    "&:hover": {
      backgroundColor: isActive ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.15),
      transform: "translateY(-1px)",
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  })

  const navButtonStyle = (disabled: boolean) => ({
    ...buttonStyle,
    backgroundColor: disabled ? alpha(theme.palette.background.paper, 0.5) : theme.palette.background.paper,
    color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
    border: `1px solid ${alpha(theme.palette.text.primary, disabled ? 0.1 : 0.2)}`,
    "&:hover": !disabled
      ? {
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          transform: "translateY(-1px)",
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}`,
        }
      : {},
    "&:disabled": {
      backgroundColor: alpha(theme.palette.background.paper, 0.3),
      color: theme.palette.text.disabled,
      cursor: "not-allowed",
    },
  })

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        py: 3,
        flexWrap: "wrap",
      }}
    >
      {/* Botón Anterior */}
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        startIcon={<ChevronLeft sx={{ ml: 0, mr: 0 }} />}
        sx={{ ...navButtonStyle(currentPage === 1), '& .MuiButton-startIcon': { mr: 0 } }}
      >
        <Box sx={{ display: { xs: 'none', sm: 'inline' }, p: 0, m: 0 }}>Anterior</Box>
      </Button>

      {/* Números de página */}
      {visiblePages.map((page, index) =>
        page === "ellipsis" ? (
          <Box key={`ellipsis-${index}`} sx={{ display: "flex", alignItems: "center", px: 1 }}>
            <MoreHoriz sx={{ color: theme.palette.text.disabled }} />
          </Box>
        ) : (
          <Button key={page} onClick={() => handlePageChange(page)} sx={pageButtonStyle(page === currentPage)}>
            {page}
          </Button>
        ),
      )}

      {/* Botón Siguiente */}
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        endIcon={<ChevronRight sx={{ ml: 0, mr: 0 }} />}
        sx={{ ...navButtonStyle(currentPage === totalPages), '& .MuiButton-endIcon': { ml: 0 } }}
      >
        <Box sx={{ display: { xs: 'none', sm: 'inline' }, p: 0, m: 0 }}>Siguiente</Box>
      </Button>

      {/* Información de página */}
      <Box sx={{ width: '100%', mt: 1, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Página {currentPage} de {totalPages}
        </Typography>
      </Box>
    </Box>
  )
}