import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Avatar,
  Divider,
  CircularProgress,
  Modal as MuiModal,
  Snackbar,
  Alert,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../hooks/useAuth';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ConfirmDialog from '../components/ConfirmDialog';
import { QRCodeCanvas } from 'qrcode.react';
import JSZip from 'jszip';
import jsPDF from 'jspdf';

const drawerWidth = 220;

const sections = [
  { label: 'Módulos', icon: <DashboardIcon /> },
  { label: 'QR', icon: <QrCodeIcon /> },
  { label: 'Cancelaciones', icon: <CancelIcon /> },
  { label: 'Complementos', icon: <AddCircleIcon /> },
  { label: 'Banco', icon: <StoreIcon /> },
];

// Simulación de usuario
const user = {
  nombre: 'Mario Garcia',
  rol: 'admin', // Cambia a 'tienda' para probar el otro icono
};

// Personalización de Alert para usar colores de la app
const CustomAlert = styled(Alert)(({ theme }) => ({
  background: '#FFD700',
  color: '#23272b',
  fontWeight: 700,
  fontSize: 16,
  border: '2px solid #FFD700',
  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15)',
  alignItems: 'center',
  '& .MuiAlert-icon': {
    color: '#23272b',
  },
}));

/**
 * Página de Administrador - Dashboard Principal
 *
 * Esta página es el panel principal para el usuario con rol 'admin'. Permite:
 * - Gestionar módulos de venta (crear, ver, eliminar)
 * - Gestionar productos de cada módulo
 * - Gestionar usuarios banco
 * - Visualizar y administrar códigos QR
 * - Ver y administrar cancelaciones y complementos
 *
 * Estructura principal:
 * - Sidebar de navegación con secciones
 * - Contenido dinámico según sección seleccionada
 * - Modales para creación/edición/eliminación
 * - Uso de RouteGuard para protección de acceso
 *
 * Componentes principales:
 * - ModulosView: Gestión de módulos y productos
 * - QRView: Gestión de códigos QR
 * - CancelacionesView: Visualización de cancelaciones
 * - ComplementosView: Gestión de complementos
 * - BancoAdminView: Gestión de usuarios banco
 *
 * Hooks personalizados:
 * - useAuth: Estado y acciones de autenticación
 *
 * @page
 * @route /admin
 */

function ModulosView({
  isAdmin,
  modalOpen,
  setModalOpen,
  handleModalClose,
  form,
  handleFormChange,
  showPassword,
  setShowPassword,
  viewModule,
  setViewModule,
  viewProducts,
  setViewProducts,
  modulos,
  iglesias,
  setModulos
}) {
  // Datos simulados de módulos
  // const modulos = [
  //   {
  //     id: 1,
  //     nombre: 'Cafetería',
  //     responsable: 'Ana López',
  //     usuario: 'ana.cafe',
  //     productos: 3,
  //     imagen: '/modulo-cafe.png',
  //     productosList: [
  //       { nombre: 'Café Americano', precio: 25, imagen: '/producto-cafe1.png' },
  //       { nombre: 'Café Latte', precio: 30, imagen: '/producto-cafe2.png' },
  //       { nombre: 'Galleta', precio: 15, imagen: '/producto-galleta.png' },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     nombre: 'Librería',
  //     responsable: 'Carlos Ruiz',
  //     usuario: 'carlos.libro',
  //     productos: 2,
  //     imagen: '/modulo-libro.png',
  //     productosList: [
  //       { nombre: 'Biblia', precio: 120, imagen: '/producto-biblia.png' },
  //       { nombre: 'Devocional', precio: 80, imagen: '/producto-devocional.png' },
  //     ],
  //   },
  //   {
  //     id: 3,
  //     nombre: 'Ropa',
  //     responsable: 'María Pérez',
  //     usuario: 'maria.ropa',
  //     productos: 1,
  //     imagen: '/modulo-ropa.png',
  //     productosList: [
  //       { nombre: 'Playera', precio: 100, imagen: '/producto-playera.png' },
  //     ],
  //   },
  //   {
  //     id: 4,
  //     nombre: 'Snacks',
  //     responsable: 'Juan Torres',
  //     usuario: 'juan.snack',
  //     productos: 0,
  //     imagen: '/modulo-snack.png',
  //     productosList: [],
  //   },
  //   {
  //     id: 5,
  //     nombre: 'Juguetes',
  //     responsable: 'Sofía Gómez',
  //     usuario: 'sofia.juguete',
  //     productos: 2,
  //     imagen: '/modulo-juguete.png',
  //     productosList: [
  //       { nombre: 'Pelota', precio: 50, imagen: '/producto-pelota.png' },
  //       { nombre: 'Muñeca', precio: 90, imagen: '/producto-muneca.png' },
  //     ],
  //   },
  // ];

  // Estado para el modal de confirmación de eliminación
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [productosModulo, setProductosModulo] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  // Nuevo estado para productos a agregar al crear módulo
  const [productosForm, setProductosForm] = useState([]);
  const [showProductosForm, setShowProductosForm] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [addProductForm, setAddProductForm] = useState({ nombreProducto: '', precio: '', urlImage: '' });
  const [addingProduct, setAddingProduct] = useState(false);
  const [productosModuloView, setProductosModuloView] = useState([]);
  const [loadingProductosView, setLoadingProductosView] = useState(false);
  // En el componente ModulosView, agrega el estado para el diálogo de confirmación:
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState({ open: false, prod: null });

  // Nueva función local para crear módulo
  const handleCreateModulo = async () => {
    // Obtener usuario logueado desde localStorage
    let usuarioLogueado = null;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('usuario');
      if (stored) {
        try {
          usuarioLogueado = JSON.parse(stored);
        } catch (e) {
          usuarioLogueado = null;
        }
      }
    }
    const idIglesia = usuarioLogueado ? usuarioLogueado.idIglesia : undefined;
    const moduloData = {
      nombreModulo: form.nombre,
      nombreResponsable: form.responsable,
      usuario: form.usuario,
      password: form.password,
      token: 'token-' + form.usuario,
      imagenModulo: null,
      idIglesia: idIglesia
    };
    try {
      // 1. Crear el módulo
      const res = await fetch('https://cool-emus-hammer.loca.lt/modulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduloData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert('Error al crear módulo: ' + (errorData.error || 'Error desconocido'));
        return;
      }
      const nuevoModulo = await res.json();
      // 2. Crear los productos si hay productosForm
      let nuevosProductos = [];
      if (productosForm.length > 0) {
        for (const prod of productosForm) {
          if (prod.nombreProducto && prod.precio) {
            const prodRes = await fetch('https://cool-emus-hammer.loca.lt/productos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idModulo: nuevoModulo.modulo.idModulo || nuevoModulo.idModulo,
                nombreProducto: prod.nombreProducto,
                precio: parseFloat(prod.precio),
                urlImage: prod.urlImage || null
              })
            });
            if (prodRes.ok) {
              const nuevoProd = await prodRes.json();
              nuevosProductos.push(nuevoProd);
            }
          }
        }
      }
      setModulos(prev => [...prev, nuevoModulo.modulo || nuevoModulo]);
      setProductosForm([]);
      setShowProductosForm(false);
      handleModalClose();
      setSnackbarMsg('¡Módulo y productos creados exitosamente!');
      setSnackbarOpen(true);
    } catch (err) {
      alert('Error al crear módulo: ' + err.message);
    }
  };

  const handleVerProductos = async (modulo) => {
    setViewProducts(modulo);
    setLoadingProductos(true);
    setProductosModulo([]);
    try {
      const res = await fetch(`https://cool-emus-hammer.loca.lt/productos?idModulo=${modulo.idModulo}`);
      const data = await res.json();
      setProductosModulo(Array.isArray(data) ? data : []);
    } catch (err) {
      setProductosModulo([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  // Cuando cambia el número de productos en el formulario de módulo
  const handleNumProductosChange = (e) => {
    const num = parseInt(e.target.value, 10) || 0;
    handleFormChange(e);
    if (num > 0) {
      setProductosForm(Array.from({ length: num }, (_, i) => ({ nombreProducto: '', precio: '', urlImage: '' })));
      setShowProductosForm(true);
    } else {
      setProductosForm([]);
      setShowProductosForm(false);
    }
  };

  // Manejar cambios en los campos de productos
  const handleProductoInput = (idx, field, value) => {
    setProductosForm((prev) => prev.map((prod, i) => i === idx ? { ...prod, [field]: value } : prod));
  };

  // Lista de emojis de comida
  const foodEmojis = ['☕', '🍪', '🥪', '🍔', '🍟', '🍕', '🌭', '🍿', '🍩', '🍰', '🍫', '🍦', '🥤', '🍎', '🍊', '🍌', '🍉', '🍇', '🍓', '🍒', '🍍', '🥝', '🥑', '🥕', '🍅', '🥔'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight={700} mb={3} align="center">Módulos de venta</Typography>
        {isAdmin && (
          <Box>
            <button
              style={{
                background: '#FFD700',
                color: '#212121',
                border: 'none',
                borderRadius: 6,
                padding: '8px 20px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              onClick={() => setModalOpen(true)}
            >
              + Crear Módulo
            </button>
          </Box>
        )}
      </Box>
      {/* Modal para crear módulo */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#212121',
          color: '#FFD700',
          p: 4,
          borderRadius: 3,
          boxShadow: 24,
          minWidth: 350,
          width: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" color="primary">Crear Módulo</Typography>
            <IconButton onClick={handleModalClose} sx={{ color: '#FFD700' }}><CloseIcon /></IconButton>
          </Box>
          <TextField
            label="Nombre del módulo"
            name="nombre"
            value={form.nombre}
            onChange={handleFormChange}
            fullWidth
            InputLabelProps={{ style: { color: '#FFD700' } }}
            sx={{ input: { color: '#FFD700' }, label: { color: '#FFD700' } }}
          />
          <TextField
            label="Nombre del responsable"
            name="responsable"
            value={form.responsable}
            onChange={handleFormChange}
            fullWidth
            InputLabelProps={{ style: { color: '#FFD700' } }}
            sx={{ input: { color: '#FFD700' } }}
          />
          <TextField
            label="Usuario"
            name="usuario"
            value={form.usuario}
            onChange={handleFormChange}
            fullWidth
            InputLabelProps={{ style: { color: '#FFD700' } }}
            sx={{ input: { color: '#FFD700' } }}
          />
          <TextField
            label="Contraseña"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleFormChange}
            fullWidth
            InputLabelProps={{ style: { color: '#FFD700' } }}
            sx={{ input: { color: '#FFD700' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    sx={{ color: '#FFD700' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Número de productos"
            name="productos"
            type="number"
            value={form.productos}
            onChange={handleNumProductosChange}
            fullWidth
            InputLabelProps={{ style: { color: '#FFD700' } }}
            sx={{ input: { color: '#FFD700' } }}
          />
          {showProductosForm && productosForm.length > 0 && (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="primary" mb={1}>Agrega los productos:</Typography>
      {productosForm.map((prod, idx) => (
        <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            label={`Nombre producto #${idx + 1}`}
            value={prod.nombreProducto}
            onChange={e => handleProductoInput(idx, 'nombreProducto', e.target.value)}
            size="small"
            sx={{ flex: 2, input: { color: '#FFD700' } }}
            InputLabelProps={{ style: { color: '#FFD700' } }}
          />
          <TextField
            label="Precio"
            type="number"
            value={prod.precio}
            onChange={e => handleProductoInput(idx, 'precio', e.target.value)}
            size="small"
            sx={{ flex: 1, input: { color: '#FFD700' } }}
            InputLabelProps={{ style: { color: '#FFD700' } }}
          />
          <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span style={{ color: '#FFD700', fontWeight: 600, fontSize: 13 }}>Emoji:</span>
            <select
              value={prod.urlImage}
              onChange={e => handleProductoInput(idx, 'urlImage', e.target.value)}
              style={{ fontSize: 18, padding: '1px 4px', borderRadius: 4, border: '1px solid #FFD700', background: '#23272b', color: '#FFD700', minWidth: 36 }}
            >
              <option value="">🙂</option>
              {foodEmojis.map((emoji, i) => (
                <option key={i} value={emoji}>{emoji}</option>
              ))}
            </select>
          </Box>
        </Box>
      ))}
    </Box>
  )}
          <Box>
            {/* Elimina el input de archivo para foto del módulo */}
          </Box>
          <button
            style={{
              background: '#FFD700',
              color: '#212121',
              border: 'none',
              borderRadius: 6,
              padding: '10px 0',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginTop: 8
            }}
            onClick={handleCreateModulo}
          >
            Guardar módulo
          </button>
        </Box>
      </Modal>
      {/* Fin modal */}
      {/* Modal Ver Módulo */}
      <Modal open={!!viewModule} onClose={() => setViewModule(null)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#212121',
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
        }}>
          {viewModule && (
            <>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 215, 0, 0.08)',
                  borderRadius: '50%',
                  boxShadow: '0 4px 24px 0 rgba(255, 215, 0, 0.25)',
                  mb: 2,
                  mt: 1,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <ShoppingCartIcon
                  sx={{
                    fontSize: 60,
                    color: '#FFD700',
                    filter: 'drop-shadow(0 0 8px #FFD70088)'
                  }}
                />
                {/* Efecto de brillo opcional */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #fffbe6 0%, #FFD70044 80%, transparent 100%)',
                    opacity: 0.7,
                    pointerEvents: 'none'
                  }}
                />
              </Box>
              <Typography variant="h6" color="primary" fontWeight={700}>{viewModule.nombre}</Typography>
              <Typography variant="body2">Responsable: {viewModule.responsable || viewModule.nombreResponsable}</Typography>
              <Typography variant="body2">Usuario: {viewModule.usuario}</Typography>
              <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>Productos:</Typography>
              {loadingProductosView ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 40 }}>
                  <CircularProgress sx={{ color: '#FFD700' }} size={30} thickness={4} />
                </Box>
              ) : productosModuloView.length === 0 ? (
                <Typography variant="body2">No hay productos registrados.</Typography>
              ) : (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                  {productosModuloView.map((prod, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#23272b', borderRadius: 2, p: 1 }}>
                      {prod.urlImage && foodEmojis.includes(prod.urlImage) ? (
                        <span style={{ fontSize: 28 }}>{prod.urlImage}</span>
                      ) : (
                        <Image src={prod.urlImage || '/producto-default.png'} alt={prod.nombreProducto} width={28} height={28} style={{ borderRadius: 6, background: '#343a40' }} />
                      )}
                      <Typography variant="body2" fontWeight={600}>{prod.nombreProducto}</Typography>
                      <Typography variant="body2">${prod.precio}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <button
                  style={{
                    background: '#FFD700',
                    color: '#212121',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 20px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                  onClick={() => setViewModule(null)}
                >
                  Cerrar
                </button>
                <button
                  style={{
                    background: 'linear-gradient(90deg, #FFD700 60%, #FFB300 100%)',
                    color: '#23272b',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 20px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15)'
                  }}
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={deleting}
                >
                  Eliminar
                </button>
              </Box>
              {/* Modal de confirmación personalizado */}
              <MuiModal open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
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
                  <Typography variant="h6" color="primary" fontWeight={700} align="center">
                    ¿Eliminar módulo?
                  </Typography>
                  <Typography variant="body2" align="center" sx={{ color: '#FFD700', mb: 2 }}>
                    Esta acción <b>no se puede deshacer</b>.<br />¿Estás seguro de que deseas eliminar el módulo <b>{viewModule.nombre}</b>?
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <button
                      style={{
                        background: '#FFD700',
                        color: '#23272b',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 20px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        minWidth: 90
                      }}
                      onClick={() => setConfirmDeleteOpen(false)}
                      disabled={deleting}
                    >
                      Cancelar
                    </button>
                    <button
                      style={{
                        background: 'linear-gradient(90deg, #FFD700 60%, #FFB300 100%)',
                        color: '#23272b',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 20px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        minWidth: 90,
                        boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15)'
                      }}
                      onClick={async () => {
                        setDeleting(true);
                        try {
                          const res = await fetch(`https://cool-emus-hammer.loca.lt/modulos/${viewModule.idModulo}`, {
                            method: 'DELETE',
                          });
                          if (!res.ok) throw new Error('Error al eliminar módulo');
                          setModulos(prev => prev.filter(m => m.idModulo !== viewModule.idModulo));
                          setViewModule(null);
                          setConfirmDeleteOpen(false);
                          setSnackbarMsg('¡Módulo eliminado exitosamente!');
                          setSnackbarOpen(true);
                        } catch (err) {
                          alert('Error al eliminar módulo: ' + err.message);
                        } finally {
                          setDeleting(false);
                        }
                      }}
                      disabled={deleting}
                    >
                      {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                    </button>
                  </Box>
                </Box>
              </MuiModal>
            </>
          )}
        </Box>
      </Modal>
      {/* Modal Productos */}
      <Modal open={!!viewProducts} onClose={() => setViewProducts(null)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#212121',
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
        }}>
          {viewProducts && (
            <>
              <Typography variant="h6" color="primary" fontWeight={700}>Productos de {viewProducts.nombre}</Typography>
              {loadingProductos ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
                  <CircularProgress sx={{ color: '#FFD700' }} size={40} thickness={4} />
                </Box>
              ) : (!Array.isArray(productosModulo) || productosModulo.length === 0 ? (
                <Typography variant="body2">No hay productos registrados.</Typography>
              ) : (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {productosModulo.map((prod, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#23272b', borderRadius: 2, p: 1, position: 'relative' }}>
                      {prod.urlImage && foodEmojis.includes(prod.urlImage) ? (
                        <span style={{ fontSize: 40 }}>{prod.urlImage}</span>
                      ) : (
                        <Image src={prod.urlImage || '/producto-default.png'} alt={prod.nombreProducto} width={40} height={40} style={{ borderRadius: 6, background: '#343a40' }} />
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{prod.nombreProducto}</Typography>
                        <Typography variant="body2">${prod.precio}</Typography>
                      </Box>
                      <IconButton
                        sx={{ color: '#FFD700', position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                        onClick={() => setConfirmDeleteProduct({ open: true, prod })}
                        size="small"
                        title="Eliminar producto"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ))}
              <button
                style={{
                  background: '#FFD700',
                  color: '#212121',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  marginTop: 8
                }}
                onClick={() => setShowAddProductForm((prev) => !prev)}
              >
                {showAddProductForm ? 'Cancelar' : '+ Agregar producto'}
              </button>
              {showAddProductForm && (
                <Box sx={{ width: '100%', mt: 2, bgcolor: '#23272b', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    label="Nombre del producto"
                    value={addProductForm.nombreProducto}
                    onChange={e => setAddProductForm(f => ({ ...f, nombreProducto: e.target.value }))}
                    size="small"
                    fullWidth
                    InputLabelProps={{ style: { color: '#FFD700' } }}
                    sx={{ input: { color: '#FFD700' } }}
                  />
                  <TextField
                    label="Precio"
                    type="number"
                    value={addProductForm.precio}
                    onChange={e => setAddProductForm(f => ({ ...f, precio: e.target.value }))}
                    size="small"
                    fullWidth
                    InputLabelProps={{ style: { color: '#FFD700' } }}
                    sx={{ input: { color: '#FFD700' } }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: '#FFD700', fontWeight: 600, fontSize: 13 }}>Emoji:</span>
                    <select
                      value={addProductForm.urlImage}
                      onChange={e => setAddProductForm(f => ({ ...f, urlImage: e.target.value }))}
                      style={{ fontSize: 18, padding: '1px 4px', borderRadius: 4, border: '1px solid #FFD700', background: '#23272b', color: '#FFD700', minWidth: 36 }}
                    >
                      <option value="">🙂</option>
                      {foodEmojis.map((emoji, i) => (
                        <option key={i} value={emoji}>{emoji}</option>
                      ))}
                    </select>
                  </Box>
                  <button
                    style={{
                      background: '#FFD700',
                      color: '#212121',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 0',
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: 'pointer',
                      marginTop: 8
                    }}
                    disabled={addingProduct}
                    onClick={async () => {
                      if (!addProductForm.nombreProducto || !addProductForm.precio) return;
                      setAddingProduct(true);
                      try {
                        const res = await fetch('https://cool-emus-hammer.loca.lt/productos', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            idModulo: viewProducts.idModulo,
                            nombreProducto: addProductForm.nombreProducto,
                            precio: parseFloat(addProductForm.precio),
                            urlImage: addProductForm.urlImage || null
                          })
                        });
                        if (!res.ok) throw new Error('Error al agregar producto');
                        // Recargar productos del módulo
                        await handleVerProductos(viewProducts);
                        setShowAddProductForm(false);
                        setAddProductForm({ nombreProducto: '', precio: '', urlImage: '' });
                        setSnackbarMsg('¡Producto agregado exitosamente!');
                        setSnackbarOpen(true);
                      } catch (err) {
                        alert('Error al agregar producto: ' + err.message);
                      } finally {
                        setAddingProduct(false);
                      }
                    }}
                  >
                    {addingProduct ? 'Agregando...' : 'Guardar producto'}
                  </button>
                </Box>
              )}
              <button
                style={{
                  background: '#FFD700',
                  color: '#212121',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  marginTop: 8
                }}
                onClick={() => setViewProducts(null)}
              >
                Cerrar
              </button>
            </>
          )}
        </Box>
      </Modal>
      {/* ConfirmDialog para eliminar producto */}
      <ConfirmDialog
        open={confirmDeleteProduct.open}
        title="¿Eliminar producto?"
        message="Esta acción no se puede deshacer y no podrás recuperar la información de este producto."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={false}
        onConfirm={async () => {
          if (!confirmDeleteProduct.prod) return;
          try {
            const res = await fetch(`https://cool-emus-hammer.loca.lt/productos/${confirmDeleteProduct.prod.idProducto}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar producto');
            await handleVerProductos(viewProducts);
            setSnackbarMsg('¡Producto eliminado exitosamente!');
            setSnackbarOpen(true);
          } catch (err) {
            alert('Error al eliminar producto: ' + err.message);
          } finally {
            setConfirmDeleteProduct({ open: false, prod: null });
          }
        }}
        onCancel={() => setConfirmDeleteProduct({ open: false, prod: null })}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
        {Array.isArray(modulos) && modulos.map((modulo, idx) => {
          // Todas las tarjetas en gris oscuro
          const cardBg = '#212121';
          // Botones: Ver módulo dorado, Productos negro
          const btn1Bg = '#FFD700';
          const btn1Color = '#212121';
          const btn2Bg = '#000000';
          const btn2Color = '#FFD700';
          return (
            <Box
              key={modulo.id}
              sx={{
                bgcolor: cardBg,
                borderRadius: 3,
                boxShadow: 4,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'primary.main',
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 215, 0, 0.08)',
                  borderRadius: '50%',
                  boxShadow: '0 4px 24px 0 rgba(255, 215, 0, 0.25)',
                  mb: 2,
                  mt: 1,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 50, color: '#FFD700', filter: 'drop-shadow(0 0 8px #FFD70088)' }} />
                {/* Efecto de brillo opcional */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #fffbe6 0%, #FFD70044 80%, transparent 100%)',
                    opacity: 0.7,
                    pointerEvents: 'none'
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight={700} align="center" sx={{ mb: 1, color: '#FFD700' }}>
                {modulo.nombre}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'Poppins, Roboto, Arial, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: '#FFD700',
                  letterSpacing: 0.5,
                  mb: 2,
                  mt: 1,
                  textAlign: 'center',
                  textShadow: '0 1px 6px #0008'
                }}
              >
                {modulo.usuario}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                <button
                  style={{
                    background: btn1Bg,
                    color: btn1Color,
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginRight: 4
                  }}
                  onClick={async () => {
                    setViewModule(modulo);
                    setLoadingProductosView(true);
                    setProductosModuloView([]);
                    try {
                      const res = await fetch(`https://cool-emus-hammer.loca.lt/productos?idModulo=${modulo.idModulo}`);
                      const data = await res.json();
                      setProductosModuloView(Array.isArray(data) ? data : []);
                    } catch (err) {
                      setProductosModuloView([]);
                    } finally {
                      setLoadingProductosView(false);
                    }
                  }}
                >
                  Ver módulo
                </button>
                <button
                  style={{
                    background: btn2Bg,
                    color: btn2Color,
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleVerProductos(modulo)}
                >
                  Productos
                </button>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <CustomAlert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMsg}
        </CustomAlert>
      </Snackbar>
    </Box>
  );
}

function QRView({ qrList, setQrList, idIglesiaUsuario }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [generados, setGenerados] = useState([]);
  const [qrSeleccionado, setQrSeleccionado] = useState(null);
  const [confirmDeleteQr, setConfirmDeleteQr] = useState({ open: false, qr: null });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Nueva función para crear varios QRs llamando al backend
  async function crearVariosQr() {
    setLoading(true);
    setError('');
    const nuevos = [];
    try {
      for (let i = 0; i < cantidad; i++) {
        const res = await fetch('https://cool-emus-hammer.loca.lt/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idIglesia: idIglesiaUsuario })
        });
        if (!res.ok) throw new Error('Error al crear QR');
        const qr = await res.json();
        nuevos.push(qr);
      }
      setQrList(prev => [...prev, ...nuevos]);
      setGenerados(nuevos);
      setModalOpen(false);
    } catch (err) {
      setError('No se pudieron crear los QRs. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Descargar un QR individual como PNG (con logo)
  function descargarQrPng(token) {
    const qrCanvas = document.getElementById(`qr-canvas-${token}`);
    if (!qrCanvas) return;
    // Crear un canvas temporal
    const size = qrCanvas.width;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const ctx = tempCanvas.getContext('2d');
    // Dibujar el QR
    ctx.drawImage(qrCanvas, 0, 0, size, size);
    // Dibujar el logo en el centro
    const logo = new window.Image();
    logo.src = '/logo-apay.png';
    logo.onload = () => {
      const logoSize = size * 0.3;
      ctx.drawImage(logo, (size - logoSize) / 2, (size - logoSize) / 2, logoSize, logoSize);
      // Descargar el canvas combinado
      const url = tempCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Qrs_${token}.png`;
      a.click();
    };
  }

  // Descargar todos los QRs generados en un ZIP
  async function descargarTodosZip() {
    const zip = new JSZip();
    for (const qr of generados) {
      const canvas = document.getElementById(`qr-canvas-${qr.token}`);
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const data = url.split(',')[1];
        zip.file(`Qrs_${qr.token}.png`, data, { base64: true });
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Qrs.zip';
    a.click();
  }

  // Renderiza el QR con logo en el centro
  function QrConLogo({ token }) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <QRCodeCanvas
          id={`qr-canvas-${token}`}
          value={token}
          size={160}
          bgColor="#23272b"
          fgColor="#FFD700"
          includeMargin={true}
          level="H"
          renderAs="canvas"
        />
        <img
          src="/logo-apay.png"
          alt="Logo"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 48,
            height: 48,
            transform: 'translate(-50%, -50%)',
            borderRadius: 12,
            background: '#23272b',
            boxShadow: '0 2px 8px #0008',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  // Función para eliminar QR
  async function eliminarQr(idQrPago) {
    try {
      const res = await fetch(`https://cool-emus-hammer.loca.lt/qr/${idQrPago}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar el QR');
      setQrList(prev => prev.filter(qr => qr.idQrPago !== idQrPago));
      setSnackbarMsg('¡QR eliminado exitosamente!');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMsg('Error al eliminar el QR.');
      setSnackbarOpen(true);
    }
  }

  useEffect(() => {
    async function fetchQrs() {
      try {
        let url = 'https://cool-emus-hammer.loca.lt/qr';
        if (idIglesiaUsuario) {
          url += `?idIglesia=${idIglesiaUsuario}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('No se pudieron obtener los QRs');
        const data = await res.json();
        setQrList(data);
      } catch (err) {
        setQrList([]);
      }
    }
    fetchQrs();
  }, [setQrList, idIglesiaUsuario]);

  // Descargar todos los QRs generados en un PDF (centrado, logo pequeño y sin distorsión)
  async function descargarTodosPdf() {
    const doc = new jsPDF();
    const qrPerRow = 3;
    const qrPerCol = 3;
    const qrPerPage = qrPerRow * qrPerCol;
    const qrSize = 55;
    const spacingX = 18;
    const spacingY = 28;
    // Encabezado profesional en vez de logo
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    for (let i = 0; i < generados.length; i++) {
      const idxInPage = i % qrPerPage;
      if (i > 0 && idxInPage === 0) doc.addPage();
      // Encabezado estilizado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 215, 0); // dorado
      doc.text('Códigos QR - A-Pay', pageWidth / 2, 18, { align: 'center' });
      doc.setTextColor(35, 39, 43); // gris oscuro para el resto
      // Calcular posición de la cuadrícula centrada
      const gridWidth = qrPerRow * qrSize + (qrPerRow - 1) * spacingX;
      const startX = (pageWidth - gridWidth) / 2;
      const startY = 18 + 10; // espacio debajo del encabezado
      const row = Math.floor(idxInPage / qrPerRow);
      const col = idxInPage % qrPerRow;
      const x = startX + col * (qrSize + spacingX);
      const y = startY + row * (qrSize + spacingY);
      // Combinar QR y logo en canvas, con mejoras visuales
      const qr = generados[i];
      const qrCanvas = document.getElementById(`qr-canvas-${qr.token}`);
      if (!qrCanvas) continue;
      const size = qrCanvas.width;
      // Crear canvas temporal para fondo blanco, borde y sombra
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size + 24;
      tempCanvas.height = size + 24;
      const ctx = tempCanvas.getContext('2d');
      // Sombra
      ctx.shadowColor = '#8888';
      ctx.shadowBlur = 12;
      // Fondo blanco y borde redondeado
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(size + 12, 0);
      ctx.quadraticCurveTo(size + 24, 0, size + 24, 12);
      ctx.lineTo(size + 24, size + 12);
      ctx.quadraticCurveTo(size + 24, size + 24, size + 12, size + 24);
      ctx.lineTo(12, size + 24);
      ctx.quadraticCurveTo(0, size + 24, 0, size + 12);
      ctx.lineTo(0, 12);
      ctx.quadraticCurveTo(0, 0, 12, 0);
      ctx.closePath();
      ctx.fill();
      // Borde sutil
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
      // QR
      ctx.drawImage(qrCanvas, 12, 12, size, size);
      // Logo en el centro
      await new Promise(resolve => {
        const logo = new window.Image();
        logo.src = '/logo-apay.png';
        logo.onload = () => {
          const logoSize = size * 0.3;
          ctx.drawImage(logo, 12 + (size - logoSize) / 2, 12 + (size - logoSize) / 2, logoSize, logoSize);
          resolve();
        };
      });
      const imgData = tempCanvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
      // Mostrar el idQrPago debajo del QR (o últimos 6 caracteres si es largo)
      let idText = qr.idQrPago ? qr.idQrPago.toString() : '';
      if (idText.length > 8) idText = idText.slice(-6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(35, 39, 43); // gris oscuro
      doc.text(idText, x + qrSize / 2, y + qrSize + 10, { align: 'center' });
    }
    doc.save('Qrs.pdf');
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight={700} mb={3} align="center">Códigos QR</Typography>
        <button
          style={{
            background: '#FFD700',
            color: '#212121',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          onClick={() => { setModalOpen(true); setGenerados([]); }}
        >
          + Generar nuevo QR
        </button>
      </Box>
      {/* Modal para generar QRs */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); }}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#212121',
          color: '#FFD700',
          p: 4,
          borderRadius: 3,
          boxShadow: 24,
          minWidth: 320,
          width: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
          <Typography variant="h6" color="primary" fontWeight={700}>Generar QRs</Typography>
          <Typography variant="body2">¿Cuántos QRs quieres generar?</Typography>
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={e => setCantidad(Number(e.target.value))}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #FFD700',
              marginBottom: 12,
              color: '#FFD700',
              background: '#23272b',
              fontSize: 16
            }}
          />
          <button
            style={{
              background: '#FFD700',
              color: '#212121',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginBottom: 8
            }}
            onClick={crearVariosQr}
            disabled={loading}
          >
            {loading ? 'Creando QRs...' : 'Generar QRs'}
          </button>
          {error && <Typography color="error" variant="body2" mt={1}>{error}</Typography>}
          <button
            style={{
              background: 'transparent',
              color: '#FFD700',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginTop: 8
            }}
            onClick={() => { setModalOpen(false); }}
          >
            Cerrar
          </button>
        </Box>
      </Modal>
      {/* Tabla de QRs generados con QR visual y descarga */}
      {generados.length > 0 && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h6" color="primary" fontWeight={700} mb={2}>QRs generados</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {generados.map((qr, idx) => (
              <Box key={qr.token} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#23272b', p: 2, borderRadius: 3, boxShadow: 2 }}>
                <QrConLogo token={qr.token} />
                <Typography variant="body2" color="primary" mt={1} fontWeight={700}>{qr.token}</Typography>
                <button
                  style={{
                    background: '#FFD700',
                    color: '#23272b',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 12px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    marginTop: 8
                  }}
                  onClick={() => descargarQrPng(qr.token)}
                >
                  Descargar
                </button>
              </Box>
            ))}
          </Box>
          <button
            style={{
              background: '#FFD700',
              color: '#23272b',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginTop: 24,
              marginRight: 12
            }}
            onClick={descargarTodosZip}
          >
            Descargar todos en ZIP
          </button>
          <button
            style={{
              background: '#FFD700',
              color: '#23272b',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginTop: 24
            }}
            onClick={descargarTodosPdf}
          >
            Descargar en PDF
          </button>
        </Box>
      )}
      {/* Tabla de QRs existentes */}
      <Box sx={{ bgcolor: '#23272b', borderRadius: 3, boxShadow: 2, p: 2 }}>
        <table style={{ width: '100%', color: '#FFD700', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#212121' }}>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>QR</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Saldo</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Fecha</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Propietario</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {qrList.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 16, color: '#bdbdbd' }}>No hay QR generados.</td>
              </tr>
            ) : (
              qrList.map((qr, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#212121' : '#343a40' }}>
                  <td style={{ padding: 8, textAlign: 'center' }}>{qr.token}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>${qr.saldo}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{qr.fechaCreacion ? new Date(qr.fechaCreacion).toLocaleDateString() : ''}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{qr.nombre}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>
                    <button
                      style={{ background: '#FFD700', color: '#23272b', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginRight: 8 }}
                      onClick={() => setQrSeleccionado(qr)}
                    >
                      Ver QR
                    </button>
                    <button
                      style={{ background: '#b71c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                      onClick={() => setConfirmDeleteQr({ open: true, qr })}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
      {/* Modal para ver y descargar QR seleccionado */}
      <Modal open={!!qrSeleccionado} onClose={() => setQrSeleccionado(null)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', color: '#FFD700', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 320, width: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {qrSeleccionado && <QrConLogo token={qrSeleccionado.token} />}
          <Typography variant="body2" color="primary" mt={1} fontWeight={700}>{qrSeleccionado?.token}</Typography>
          <button
            style={{ background: '#FFD700', color: '#23272b', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 }}
            onClick={() => descargarQrPng(qrSeleccionado.token)}
          >
            Descargar
          </button>
          <button
            style={{ background: 'transparent', color: '#FFD700', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8 }}
            onClick={() => setQrSeleccionado(null)}
          >
            Cerrar
          </button>
        </Box>
      </Modal>
      {/* Modal de confirmación para eliminar QR */}
      <Modal open={confirmDeleteQr.open} onClose={() => setConfirmDeleteQr({ open: false, qr: null })}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', color: '#FFD700', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 320, width: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" color="primary" fontWeight={700} align="center">¿Eliminar QR?</Typography>
          <Typography variant="body2" align="center" sx={{ color: '#FFD700', mb: 2 }}>
            Esta acción <b>no se puede deshacer</b> y no podrás recuperar la información de este QR.<br />¿Estás seguro de que deseas eliminarlo?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <button
              style={{ background: '#FFD700', color: '#23272b', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 700, fontSize: 16, cursor: 'pointer', minWidth: 90 }}
              onClick={async () => {
                await eliminarQr(confirmDeleteQr.qr.idQrPago);
                setConfirmDeleteQr({ open: false, qr: null });
              }}
            >
              Sí, eliminar
            </button>
            <button
              style={{ background: 'transparent', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 6, padding: '8px 20px', fontWeight: 700, fontSize: 16, cursor: 'pointer', minWidth: 90 }}
              onClick={() => setConfirmDeleteQr({ open: false, qr: null })}
            >
              Cancelar
            </button>
          </Box>
        </Box>
      </Modal>
      {/* Snackbar para mensajes de éxito/error */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <CustomAlert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMsg}
        </CustomAlert>
      </Snackbar>
    </Box>
  );
}

function CancelacionesView({ cancelaciones }) {
  return (
    <Box>
      <Typography variant="h4" color="primary" fontWeight={700} mb={3} align="center">Cancelaciones</Typography>
      <Box sx={{ bgcolor: '#23272b', borderRadius: 3, boxShadow: 2, p: 2 }}>
        <table style={{ width: '100%', color: '#FFD700', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#212121' }}>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}># Cancelación</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Fecha</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>ID Pedido</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Módulo</th>
            </tr>
          </thead>
          <tbody>
            {cancelaciones.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#bdbdbd' }}>No hay cancelaciones registradas.</td>
              </tr>
            ) : (
              cancelaciones.map((c, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#212121' : '#343a40' }}>
                  <td style={{ padding: 8, textAlign: 'center' }}>{c.numero}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{c.fecha}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{c.idPedido}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{c.modulo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}

function ComplementosView({ complementos, setComplementos }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [editIdx, setEditIdx] = useState(null);

  const handleAgregar = () => {
    if (nombre.trim() === '') return;
    if (editIdx !== null) {
      setComplementos(prev => prev.map((c, idx) => idx === editIdx ? { ...c, nombre } : c));
    } else {
      setComplementos(prev => [...prev, { id: prev.length + 1, nombre }]);
    }
    setNombre('');
    setEditIdx(null);
    setModalOpen(false);
  };

  const handleEditar = (idx) => {
    setNombre(complementos[idx].nombre);
    setEditIdx(idx);
    setModalOpen(true);
  };

  const handleEliminar = (idx) => {
    setComplementos(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight={700} mb={3} align="center">Complementos</Typography>
        <button
          style={{
            background: '#FFD700',
            color: '#212121',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          onClick={() => { setNombre(''); setEditIdx(null); setModalOpen(true); }}
        >
          + Agregar complemento
        </button>
      </Box>
      {/* Modal para agregar/editar complemento */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setNombre(''); setEditIdx(null); }}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#212121',
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
        }}>
          <Typography variant="h6" color="primary" fontWeight={700}>{editIdx !== null ? 'Editar' : 'Agregar'} complemento</Typography>
          <input
            type="text"
            placeholder="Nombre del complemento"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #FFD700',
              marginBottom: 12,
              color: '#FFD700',
              background: '#23272b',
              fontSize: 16
            }}
          />
          <button
            style={{
              background: '#FFD700',
              color: '#212121',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginBottom: 8
            }}
            onClick={handleAgregar}
          >
            {editIdx !== null ? 'Guardar cambios' : 'Agregar complemento'}
          </button>
          <button
            style={{
              background: 'transparent',
              color: '#FFD700',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginTop: 8
            }}
            onClick={() => { setModalOpen(false); setNombre(''); setEditIdx(null); }}
          >
            Cancelar
          </button>
        </Box>
      </Modal>
      {/* Tabla de complementos */}
      <Box sx={{ bgcolor: '#23272b', borderRadius: 3, boxShadow: 2, p: 2 }}>
        <table style={{ width: '100%', color: '#FFD700', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#212121' }}>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>#</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Nombre</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {complementos.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: 16, color: '#bdbdbd' }}>No hay complementos registrados.</td>
              </tr>
            ) : (
              complementos.map((c, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#212121' : '#343a40' }}>
                  <td style={{ padding: 8, textAlign: 'center' }}>{c.id}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{c.nombre}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>
                    <button onClick={() => handleEditar(idx)} style={{ background: 'transparent', border: 'none', color: '#FFD700', cursor: 'pointer', marginRight: 8 }} title="Editar"><EditIcon /></button>
                    <button onClick={() => handleEliminar(idx)} style={{ background: 'transparent', border: 'none', color: '#FFD700', cursor: 'pointer' }} title="Eliminar"><DeleteIcon /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}

function BancoAdminView({ idIglesia }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ usuario: '', password: '', responsable: '' });
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, msg: '', error: false });

  // Cargar bancos de la iglesia
  useEffect(() => {
    if (!idIglesia) return;
    fetch(`https://cool-emus-hammer.loca.lt/usuarios`)
      .then(res => res.json())
      .then(data => {
        const bancosIglesia = (Array.isArray(data) ? data : []).filter(u => u.rol === 'banco' && u.idIglesia === idIglesia);
        setBancos(bancosIglesia);
      });
  }, [idIglesia, modalOpen]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.usuario || !form.password || !form.responsable) {
      setAlert({ open: true, msg: 'Todos los campos son obligatorios', error: true });
      return;
    }
    setLoading(true);
    const bancoData = {
      usuario: form.usuario,
      password: form.password,
      nombreResponsable: form.responsable,
      token: 'token-' + form.usuario,
      rol: 'banco',
      idIglesia: idIglesia
    };
    try {
      const res = await fetch('https://cool-emus-hammer.loca.lt/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bancoData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        setAlert({ open: true, msg: errorData.error || 'Error al crear banco', error: true });
        setLoading(false);
        return;
      }
      setAlert({ open: true, msg: '¡Banco creado exitosamente!', error: false });
      setForm({ usuario: '', password: '', responsable: '' });
      setModalOpen(false);
    } catch (err) {
      setAlert({ open: true, msg: 'Error al crear banco: ' + err.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight={700} mb={3} align="center">Bancos registrados</Typography>
        <button
          style={{ background: '#FFD700', color: '#212121', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          onClick={() => setModalOpen(true)}
        >
          + Registrar banco
        </button>
      </Box>
      {/* Modal para registrar banco */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#212121', color: '#FFD700', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 350, width: 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" color="primary">Registrar banco</Typography>
          <TextField label="Usuario" name="usuario" value={form.usuario} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#FFD700' } }} sx={{ input: { color: '#FFD700' } }} />
          <TextField label="Contraseña" name="password" type="password" value={form.password} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#FFD700' } }} sx={{ input: { color: '#FFD700' } }} />
          <TextField label="Nombre del responsable" name="responsable" value={form.responsable} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#FFD700' } }} sx={{ input: { color: '#FFD700' } }} />
          <button style={{ background: '#FFD700', color: '#212121', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8 }} onClick={handleSubmit} disabled={loading}>{loading ? 'Guardando...' : 'Guardar banco'}</button>
        </Box>
      </Modal>
      {/* Lista de bancos */}
      <Box sx={{ bgcolor: '#23272b', borderRadius: 3, boxShadow: 2, p: 2 }}>
        <table style={{ width: '100%', color: '#FFD700', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#212121' }}>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Usuario</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Responsable</th>
              <th style={{ padding: 8, borderBottom: '1px solid #FFD700', textAlign: 'center' }}>Iglesia</th>
            </tr>
          </thead>
          <tbody>
            {bancos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#bdbdbd' }}>No hay bancos registrados.</td>
              </tr>
            ) : (
              bancos.map((b, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#212121' : '#343a40' }}>
                  <td style={{ padding: 8, textAlign: 'center' }}>
                    <AttachMoneyIcon sx={{ color: '#FFD700', fontSize: 32, verticalAlign: 'middle' }} />
                  </td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{b.usuario}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{b.nombreResponsable}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>{b.idIglesia}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert(a => ({ ...a, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setAlert(a => ({ ...a, open: false }))} severity={alert.error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {alert.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function SectionContent({ section, ...props }) {
  switch (section) {
    case 0:
      return <ModulosView {...props} setModulos={props.setModulos} />;
    case 1:
      return <QRView qrList={props.qrList} setQrList={props.setQrList} idIglesiaUsuario={props.idIglesiaUsuario} />;
    case 2:
      return <CancelacionesView cancelaciones={props.cancelaciones} />;
    case 3:
      return <ComplementosView complementos={props.complementos} setComplementos={props.setComplementos} />;
    case 4:
      return <BancoAdminView idIglesia={props.idIglesiaUsuario} />;
    default:
      return null;
  }
}

export default function AdminDashboard() {
  const [selectedSection, setSelectedSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const idIglesiaUsuario = user ? user.idIglesia : '';
  // Estado inicial del formulario (sin idIglesia)
  const [form, setForm] = useState({
    nombre: '',
    responsable: '',
    usuario: '',
    password: '',
    productos: '',
    imagen: null,
    imagenPreview: null
  });
  const [viewModule, setViewModule] = useState(null); // Para modal de ver módulo
  const [viewProducts, setViewProducts] = useState(null); // Para modal de productos
  const [qrList, setQrList] = useState([]);
  const [cancelaciones] = useState([
    { numero: 1, fecha: '2024-06-01', idPedido: 'PED123', modulo: 'Cafetería' },
    { numero: 2, fecha: '2024-06-02', idPedido: 'PED124', modulo: 'Librería' },
  ]);
  const [complementos, setComplementos] = useState([
    { id: 1, nombre: 'Sin azúcar' },
    { id: 2, nombre: 'Extra queso' },
  ]);
  const [modulos, setModulos] = useState([]);
  const [loadingModulos, setLoadingModulos] = useState(false); // Nuevo estado para loader
  // 1. Agregar estado para lista de iglesias
  const [iglesias, setIglesias] = useState([]);

  // 2. Cargar iglesias al iniciar
  useEffect(() => {
    fetch('https://cool-emus-hammer.loca.lt/iglesias')
      .then(res => res.json())
      .then(data => setIglesias(Array.isArray(data) ? data : []));
  }, []);

  // Cargar módulos al iniciar (solo de la iglesia del usuario)
  useEffect(() => {
    if (!idIglesiaUsuario) return;
    setLoadingModulos(true);
    fetch(`https://cool-emus-hammer.loca.lt/modulos?idIglesia=${idIglesiaUsuario}`)
      .then(res => res.json())
      .then(data => {
        let modulosFiltrados = Array.isArray(data) ? data : [];
        if (user && user.rol === 'modulo') {
          modulosFiltrados = modulosFiltrados.filter(m => m.usuario === user.usuario);
        }
        setModulos(modulosFiltrados);
        setLoadingModulos(false);
      })
      .catch(err => {
        console.error('Error al obtener modulos:', err);
        setModulos([]);
        setLoadingModulos(false);
      });
  }, [idIglesiaUsuario, user]);

  // Manejo de formulario
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      const file = files[0];
      setForm((prev) => ({
        ...prev,
        imagen: file,
        imagenPreview: file ? URL.createObjectURL(file) : null,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setForm({
      nombre: '', responsable: '', usuario: '', password: '', productos: '', imagen: null, imagenPreview: null
    });
  };

  // Antes de renderizar el contenido principal, si user es null, muestra null o un loader
  if (!user) {
    return null; // O puedes poner un loader/spinner aquí
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#23272b' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: sidebarOpen ? `${drawerWidth}px` : 0,
          bgcolor: 'background.paper',
          color: 'primary.main',
          boxShadow: 2,
          transition: 'width 0.3s, margin-left 0.3s',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: sidebarOpen ? 'flex-end' : 'space-between' }}>
          {!sidebarOpen && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Image src="/logo-apay.png" alt="Logo" width={40} height={40} />
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: '#FFD700', color: '#212121' }}>
              {user.rol === 'admin' ? <PersonIcon /> : <StoreIcon />}
            </Avatar>
            <Typography variant="subtitle1" color="primary" fontWeight={600}>
              {user ? user.nombreResponsable : 'Usuario'}
            </Typography>
            <button
              style={{
                background: 'transparent',
                color: '#FFE066',
                border: 'none',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                marginLeft: 8
              }}
              onClick={() => setLogoutModalOpen(true)}
            >
              Cerrar sesión
            </button>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Modal de confirmación de cerrar sesión */}
      <Modal open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#23272b',
          color: '#FFE066',
          p: 4,
          borderRadius: 3,
          boxShadow: 24,
          minWidth: 320,
          width: 350,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          border: '2px solid #FFE066',
        }}>
          <Typography variant="h6" color="primary" fontWeight={700} align="center">
            ¿Cerrar sesión?
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: '#FFE066', mb: 2 }}>
            ¿Estás seguro de que deseas cerrar sesión?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <button
              style={{
                background: '#FFE066',
                color: '#23272b',
                border: 'none',
                borderRadius: 6,
                padding: '8px 20px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                minWidth: 90
              }}
              onClick={() => {
                setLogoutModalOpen(false);
                logout(); // Usar la función de logout del hook useAuth
              }}
            >
              Sí, cerrar
            </button>
            <button
              style={{
                background: 'transparent',
                color: '#FFE066',
                border: '1px solid #FFE066',
                borderRadius: 6,
                padding: '8px 20px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                minWidth: 90
              }}
              onClick={() => setLogoutModalOpen(false)}
            >
              Cancelar
            </button>
          </Box>
        </Box>
      </Modal>
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 70,
          flexShrink: 0,
          transition: 'width 0.3s',
          [`& .MuiDrawer-paper`]: {
            width: sidebarOpen ? drawerWidth : 70,
            boxSizing: 'border-box',
            bgcolor: '#212121',
            color: '#FFD700',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'width 0.3s',
            overflowX: 'hidden',
            position: 'relative',
            zIndex: 1201,
          },
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 2 }}>
          <Image src="/logo-apay.png" alt="Logo" width={sidebarOpen ? 80 : 40} height={sidebarOpen ? 80 : 40} />
        </Box>
        {sidebarOpen && <Divider sx={{ bgcolor: '#FFD700', width: '80%', mb: 2 }} />}
        <Box sx={{ overflow: 'auto', width: '100%' }}>
          <List>
            {sections.map((section, index) => (
              <ListItem key={section.label} disablePadding sx={{ justifyContent: 'center' }}>
                <ListItemButton
                  selected={selectedSection === index}
                  onClick={() => setSelectedSection(index)}
                  sx={{
                    justifyContent: 'center',
                    '&.Mui-selected': {
                      bgcolor: '#FFD700',
                      color: '#212121',
                      '& .MuiListItemIcon-root': { color: '#212121' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#FFD700', minWidth: 0, justifyContent: 'center' }}>{section.icon}</ListItemIcon>
                  {sidebarOpen && <ListItemText primary={section.label} />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      {/* Pestaña de flecha para mostrar/ocultar sidebar */}
      <Box
        sx={{
          position: 'fixed',
          left: sidebarOpen ? drawerWidth - 18 : 70 - 18,
          top: 80,
          zIndex: 1300,
          bgcolor: '#000',
          borderRadius: '0 8px 8px 0',
          width: 36,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 2,
          cursor: 'pointer',
          border: '2px solid #23272b',
          transition: 'left 0.3s',
        }}
        onClick={() => setSidebarOpen((open) => !open)}
      >
        {sidebarOpen ? (
          <ChevronLeftIcon sx={{ color: '#FFD700', fontSize: 14 }} />
        ) : (
          <ChevronRightIcon sx={{ color: '#FFD700', fontSize: 14 }} />
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#23272b',
          p: 4,
          mt: 8,
          minHeight: '100vh',
          color: '#FFD700',
          transition: 'margin-left 0.3s',
        }}
      >
        {loadingModulos ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#FFD700' }} size={60} thickness={5} />
          </Box>
        ) : (
          <SectionContent
            section={selectedSection}
            isAdmin={user.rol === 'admin'}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            handleModalClose={handleModalClose}
            form={form}
            handleFormChange={handleFormChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            viewModule={viewModule}
            setViewModule={setViewModule}
            viewProducts={viewProducts}
            setViewProducts={setViewProducts}
            qrList={qrList}
            setQrList={setQrList}
            cancelaciones={cancelaciones}
            complementos={complementos}
            setComplementos={setComplementos}
            modulos={modulos}
            setModulos={setModulos}
            iglesias={iglesias}
            idIglesiaUsuario={idIglesiaUsuario}
          />
        )}
      </Box>
    </Box>
  );
} 
