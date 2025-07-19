/**
 * ConfirmDialog - Componente de Diálogo de Confirmación
 * 
 * Este componente crea un modal de confirmación personalizado con el estilo
 * visual del sistema A-Pay. Es reutilizable y permite personalizar el título,
 * mensaje y texto de los botones.
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Estado de apertura del modal
 * @param {string} props.title - Título del diálogo
 * @param {string} props.message - Mensaje de confirmación
 * @param {string} props.confirmText - Texto del botón de confirmación (default:Sí
 * @param {string} props.cancelText - Texto del botón de cancelación (default: 'Cancelar')
 * @param {Function} props.onConfirm - Función a ejecutar al confirmar
 * @param {Function} props.onCancel - Función a ejecutar al cancelar
 * @param {boolean} props.loading - Estado de carga (deshabilita botones)
 * 
 * @example
 * <ConfirmDialog
 *   open={showConfirm}
 *   title="¿Eliminar producto?"
 *   message=Estaacción no se puede deshacer. *   confirmText="Sí, eliminar
 * onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */

import { Modal, Box, Typography, Button } from '@mui/material';

export default function ConfirmDialog({ 
  open, 
  title, 
  message, 
  confirmText = 'Sí', 
  cancelText = 'Cancelar', 
  onConfirm, 
  onCancel, 
  loading = false 
}) {
  return (
    <Modal open={open} onClose={onCancel}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: '#23272b',
        color: '#FFD700',
        p: 4,
        borderRadius: 3,
        boxShadow: 24,
        minWidth: 320,
        width: 350,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        border: '2px solid #FFD700',
      }}>
        {/* Título del diálogo */}
        <Typography variant="h6" color="primary" fontWeight={700} align="center">
          {title}
        </Typography>
        
        {/* Mensaje de confirmación */}
        <Typography variant="body2" align="center" sx={{ color: '#FFD700', mb: 2 }}>
          {message}
        </Typography>
        
        {/* Contenedor de botones */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {/* Botón de confirmación - Estilo primario */}
          <Button
            variant="contained"
            sx={{ 
              bgcolor: '#FFD700',
              color: '#23272b',
              fontWeight: 700,
              minWidth: 90,
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15)'
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmText}
          </Button>
          
          {/* Botón de cancelación - Estilo secundario */}
          <Button
            variant="outlined"
            sx={{ 
              borderColor: '#FFD700',
              color: '#FFD700',
              fontWeight: 700,
              minWidth: 90
            }}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
} 