/**
 * Página de Módulo de Venta
 *
 * Esta página es la interfaz principal para el usuario con rol 'modulo'. Permite:
 * - Visualizar y gestionar los productos del módulo asignado
 * - Procesar ventas y registrar transacciones
 * - Visualizar el inventario y el historial de ventas
 * - Acceder a funcionalidades específicas del módulo
 *
 * Estructura principal:
 * - Panel de productos y acciones de venta
 * - Modales para agregar/editar productos
 * - Visualización de ventas recientes
 * - Integración con el backend para operaciones CRUD
 *
 * Hooks personalizados:
 * - useAuth: Estado y acciones de autenticación
 *
 * @page
 * @route /modulo
 */
import { useState, useEffect, useRef } from 'react';
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
  IconButton,
  useTheme,
  useMediaQuery,
  Modal,
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HistoryIcon from '@mui/icons-material/History';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../hooks/useAuth';
import { Html5QrcodeScanner } from 'html5-qrcode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

const drawerWidth = 220;
const moduloNombre = 'Cafetería';

const sections = [
  { label: 'Crear pedido', icon: <AddShoppingCartIcon /> },
  { label: 'Ver pedido', icon: <ListAltIcon /> },
  { label: 'Histórico de ventas', icon: <HistoryIcon /> },
];

// --- FUNCIONES DE INTEGRACIÓN QR ---
// Pagar con QR
async function pagarConQr(idQrPago, monto, descripcion) {
  const res = await fetch(`https://cool-emus-hammer.loca.lt/qr/${idQrPago}/pagar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monto, descripcion })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al pagar');
  }
  return await res.json();
}

// Componente reutilizable para escanear QR
function QRScanner({ onScan, onClose }) {
  const [cameraError, setCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const scannerRef = useRef(null);

  const handleScan = (decodedText, decodedResult) => {
    if (decodedText) {
      onScan(decodedText);
      onClose && onClose();
    }
  };

  const handleError = (err) => {
    setCameraError(true);
    setErrorMessage('Error al acceder a la cámara. Verifica los permisos.');
  };

  useEffect(() => {
    if (scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: 250,
          facingMode: "environment"
        },
        false
      );
      
      scanner.render(handleScan, handleError);
      scannerRef.current = scanner;
      
      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      };
    }
  }, []);

  if (cameraError) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error de cámara
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          Soluciones:
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mb: 1, fontSize: '0.9rem' }}>
          • Accede usando https:// en vez de http://
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mb: 1, fontSize: '0.9rem' }}>
          • Usa localhost desde el mismo dispositivo
        </Typography>
        <Typography variant="body2" color="primary" sx={{ mb: 2, fontSize: '0.9rem' }}>
          • Verifica los permisos de cámara en tu navegador
        </Typography>
        <button 
          style={{ 
            background: '#FFE066', 
            color: '#212121', 
            border: 'none', 
            borderRadius: 6, 
            padding: '8px 20px', 
            fontWeight: 700, 
            fontSize: 16, 
            cursor: 'pointer',
            width: '100%'
          }}
          onClick={onClose}
        >
          Entendido
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div id="qr-reader" style={{ width: '100%', maxWidth: 320, borderRadius: 8 }} />
      <button style={{ marginTop: 16, background: '#FFE066', color: '#212121', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={onClose}>Cancelar</button>
    </div>
  );
}

function SectionContent({ section, productosModulo, pedidosActivos, setPedidosActivos, historicoVentas, setHistoricoVentas }) {
  const [pedido, setPedido] = useState([]);
  const [entregados, setEntregados] = useState([]);
  // Usar productosModulo en vez de productos de ejemplo
  const productos = productosModulo || [];

  // Datos random de pedidos activos
  const pedidosActivosData = [
    { id: 101, articulos: 3, nombre: 'Juan Pérez', entregado: false },
    { id: 102, articulos: 1, nombre: 'Ana López', entregado: false },
    { id: 103, articulos: 2, nombre: 'Carlos Ruiz', entregado: false },
  ];

  const handleAgregar = (prod) => {
    setPedido((prev) => {
      const existe = prev.find((p) => p.idProducto === prod.idProducto);
      if (existe) {
        return prev.map((p) =>
          p.idProducto === prod.idProducto ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      } else {
        return [...prev, { ...prod, cantidad: 1 }];
      }
    });
  };

  const handleEliminar = (idProducto) => {
    setPedido((prev) => prev.filter((p) => p.idProducto !== idProducto));
  };

  const handleEntregar = (id) => {
    setEntregados((prev) => [...prev, id]);
  };

  const total = pedido.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  // En el flujo de pago, elimina cualquier input manual para el ID del QR y deja solo el botón con ícono de cámara para abrir el QRScanner.
  // Ejemplo:
  const handlePagar = async (qrToken, monto, descripcion) => {
    try {
      // Buscar QR por token para obtener idQrPago
      const qrInfo = await fetch(`https://cool-emus-hammer.loca.lt/qr/${qrToken}/saldo`).then(r => r.json());
      if (!qrInfo || !qrInfo.idQrPago) throw new Error('QR no encontrado');
      await pagarConQr(qrInfo.idQrPago, monto, descripcion);
      window.alert('¡Pago realizado con éxito!');
    } catch (err) {
      window.alert(err.message);
    }
  };

  const marcarComoEntregado = (pedido) => {
    setPedidosActivos(prev => prev.filter(p => p.id !== pedido.id));
    setHistoricoVentas(prev => [...prev, { ...pedido, entregado: true }]);
  };

  const [showScannerCobro, setShowScannerCobro] = useState(false);

  switch (section) {
    case 0:
      return (
        <Box>
          <Typography variant="h4" color="primary" fontWeight={700} align="center" mb={3}>Crear pedido</Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'center', md: 'center' },
              gap: { xs: 2, sm: 3, md: 4 },
              mb: 4,
            }}
          >
            {productos.map((prod) => (
              <Box
                key={prod.idProducto || prod.id}
                sx={{
                  bgcolor: '#212121',
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 2,
                  width: { xs: '35%', sm: 140, md: 160 },
                  flexBasis: { xs: '35%', sm: 'auto' },
                  boxSizing: 'border-box',
                  mb: { xs: 0, sm: 0 },
                }}
              >
                <Box sx={{ width: 60, height: 60, borderRadius: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#212121' }}>
                  {/* Mostrar emoji/icono si hay */}
                  {prod.urlImage && typeof prod.urlImage === 'string' && prod.urlImage.length <= 3 ? (
                    <span style={{ fontSize: 40 }}>{prod.urlImage}</span>
                  ) : prod.icon ? (
                    prod.icon
                  ) : (
                    <StoreIcon sx={{ fontSize: 40, color: '#FFE066' }} />
                  )}
                </Box>
                {/* Nombre y precio debajo del icono */}
                <Typography fontWeight={700} align="center" fontSize={{ xs: 14, sm: 16 }}>{prod.nombreProducto || prod.nombre}</Typography>
                <Typography align="center" fontSize={{ xs: 13, sm: 15 }}>${prod.precio}</Typography>
                <button
                  style={{
                    background: '#FFE066',
                    color: '#212121',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    marginTop: 8,
                    width: '100%',
                  }}
                  onClick={() => handleAgregar(prod)}
                >
                  Agregar
                </button>
              </Box>
            ))}
          </Box>
          <Typography variant="h6" color="primary" align="center" mb={2}>Productos en el pedido</Typography>
          <Box sx={{ bgcolor: '#23272b', borderRadius: 3, boxShadow: 2, p: 2, width: { xs: '100%', sm: 600 }, maxWidth: 600, mx: 'auto', overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', minWidth: 400, color: '#FFE066', borderCollapse: 'collapse', fontSize: { xs: 13, sm: 15 } }}>
              <Box component="thead">
                <Box component="tr" sx={{ background: '#212121' }}>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Producto</Box>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Cantidad</Box>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Precio</Box>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Total</Box>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Eliminar</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {pedido.length === 0 ? (
                  <Box component="tr">
                    <Box component="td" colSpan={5} sx={{ textAlign: 'center', p: 2, color: '#bdbdbd' }}>No hay productos en el pedido.</Box>
                  </Box>
                ) : (
                  pedido.map((p) => (
                    <Box component="tr" key={p.idProducto} sx={{ background: '#212121' }}>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>{p.nombreProducto || p.nombre}</Box>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>{p.cantidad}</Box>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>${p.precio}</Box>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>${p.precio * p.cantidad}</Box>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>
                        <button
                          style={{ background: 'transparent', border: 'none', color: '#FFE066', cursor: 'pointer', fontWeight: 700 }}
                          onClick={() => handleEliminar(p.idProducto)}
                        >
                          Eliminar
                        </button>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
            {pedido.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography fontWeight={700} color="primary" mb={1}>Total: ${total}</Typography>
                {showScannerCobro ? (
                  <QRScanner onScan={(val) => { handlePagar(val, total, 'Pago de productos'); setShowScannerCobro(false); }} onClose={() => setShowScannerCobro(false)} />
                ) : (
                  <>
                    <button
                      style={{ background: '#FFE066', color: '#212121', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                      onClick={() => setShowScannerCobro(true)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}><QrCodeScannerIcon style={{ marginRight: 6 }} />Escanear QR para pagar</span>
                    </button>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>
      );
    case 1:
      return (
        <Box>
          <Typography variant="h4" color="primary" fontWeight={700} align="center" mb={3}>Ver pedido</Typography>
          <Box sx={{ bgcolor: '#23272b', borderRadius: 3, boxShadow: 2, p: 2, maxWidth: 600, mx: 'auto', overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', minWidth: 400, color: '#FFE066', borderCollapse: 'collapse', fontSize: { xs: 13, sm: 15 } }}>
              <Box component="thead">
                <Box component="tr" sx={{ background: '#212121' }}>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}># Pedido</Box>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Productos</Box>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Total</Box>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Acción</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {pedidosActivos.length === 0 ? (
                  <Box component="tr">
                    <Box component="td" colSpan={4} sx={{ textAlign: 'center', p: 2, color: '#bdbdbd' }}>No hay pedidos activos.</Box>
                  </Box>
                ) : (
                  pedidosActivos.map((pedido) => (
                    <Box component="tr" key={pedido.id} sx={{ background: '#212121' }}>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>{pedido.id}</Box>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>
                        {pedido.productos.map((prod, idx) => (
                          <span key={prod.idProducto || prod.nombreProducto}>
                            {prod.cantidad} x {prod.nombreProducto || prod.nombre} (${prod.precio}){idx < pedido.productos.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </Box>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>${pedido.total}</Box>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>
                        <button
                          style={{ background: '#FFE066', color: '#212121', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => marcarComoEntregado(pedido)}
                        >
                          Marcar como entregado
                        </button>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      );
    case 2:
      // Histórico de ventas
      const totalVentas = historicoVentas.reduce((acc, p) => acc + (p.total || 0), 0);
      return (
        <Box>
          <Typography variant="h4" color="primary" fontWeight={700} align="center" mb={3}>Histórico de ventas</Typography>
          <Box sx={{ bgcolor: '#23272b', borderRadius: 3, boxShadow: 2, p: 2, maxWidth: 600, mx: 'auto', overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', minWidth: 400, color: '#FFE066', borderCollapse: 'collapse', fontSize: { xs: 13, sm: 15 } }}>
              <Box component="thead">
                <Box component="tr" sx={{ background: '#212121' }}>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}># Pedido</Box>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Productos</Box>
                  <Box component="th" sx={{ p: 1, borderBottom: '1px solid #FFE066', textAlign: 'center' }}>Total</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {historicoVentas.length === 0 ? (
                  <Box component="tr">
                    <Box component="td" colSpan={3} sx={{ textAlign: 'center', p: 2, color: '#bdbdbd' }}>No hay ventas registradas.</Box>
                  </Box>
                ) : (
                  historicoVentas.map((pedido) => (
                    <Box component="tr" key={pedido.id} sx={{ background: '#212121' }}>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>{pedido.id}</Box>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>
                        {pedido.productos.map((prod, idx) => (
                          <span key={prod.idProducto || prod.nombreProducto}>
                            {prod.cantidad} x {prod.nombreProducto || prod.nombre} (${prod.precio}){idx < pedido.productos.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </Box>
                      <Box component="td" sx={{ p: 1, textAlign: 'center' }}>${pedido.total}</Box>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
            <Typography fontWeight={700} color="primary" align="center" mt={3}>
              Total vendido: ${totalVentas}
            </Typography>
          </Box>
        </Box>
      );
    default:
      return null;
  }
}

export default function ModuloView() {
  const [selectedSection, setSelectedSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productosModulo, setProductosModulo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [historicoVentas, setHistoricoVentas] = useState([]);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Obtener módulo del usuario
    fetch(`https://cool-emus-hammer.loca.lt/modulos?usuario=${user.usuario}`)
      .then(res => res.json())
      .then(mods => {
        if (Array.isArray(mods) && mods.length > 0) {
          const modulo = mods[0];
          // Obtener productos del módulo
          fetch(`https://cool-emus-hammer.loca.lt/productos?idModulo=${modulo.idModulo}`)
            .then(res => res.json())
            .then(prods => {
              setProductosModulo(Array.isArray(prods) ? prods : []);
              setLoading(false);
            });
        } else {
          setProductosModulo([]);
          setLoading(false);
        }
      });
  }, [user]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Typography color="primary">Cargando productos...</Typography></Box>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#23272b' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: isMobile ? '100%' : sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: isMobile ? 0 : sidebarOpen ? `${drawerWidth}px` : 0,
          bgcolor: 'background.paper',
          color: 'primary.main',
          boxShadow: 2,
          transition: 'width 0.3s, margin-left 0.3s',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" color="primary" fontWeight={700}>
            {moduloNombre} - Panel de Módulo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#FFE066', color: '#212121' }}>
              <StoreIcon />
            </Avatar>
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
                logout();
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
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              bgcolor: '#212121',
              color: '#FFE066',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            },
          }}
        >
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: '#FFE066', color: '#212121', width: 60, height: 60 }}>
              <StoreIcon sx={{ fontSize: 32 }} />
            </Avatar>
          </Box>
          <Divider sx={{ bgcolor: '#FFE066', width: '80%', mb: 2, mx: 'auto' }} />
          <Box sx={{ overflow: 'auto', width: '100%' }}>
            <List>
              {sections.map((section, index) => (
                <ListItem key={section.label} disablePadding sx={{ justifyContent: 'center' }}>
                  <ListItemButton
                    selected={selectedSection === index}
                    onClick={() => {
                      setSelectedSection(index);
                      setMobileOpen(false);
                    }}
                    sx={{
                      justifyContent: 'center',
                      '&.Mui-selected': {
                        bgcolor: '#FFE066',
                        color: '#212121',
                        '& .MuiListItemIcon-root': { color: '#212121' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#FFE066', minWidth: 0, justifyContent: 'center' }}>{section.icon}</ListItemIcon>
                    <ListItemText primary={section.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      ) : (
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
              color: '#FFE066',
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
            <Avatar sx={{ bgcolor: '#FFE066', color: '#212121', width: sidebarOpen ? 80 : 40, height: sidebarOpen ? 80 : 40 }}>
              <StoreIcon sx={{ fontSize: sidebarOpen ? 48 : 24 }} />
            </Avatar>
          </Box>
          <Divider sx={{ bgcolor: '#FFE066', width: '80%', mb: 2, mx: 'auto', display: sidebarOpen ? 'block' : 'none' }} />
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
                        bgcolor: '#FFE066',
                        color: '#212121',
                        '& .MuiListItemIcon-root': { color: '#212121' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#FFE066', minWidth: 0, justifyContent: 'center' }}>{section.icon}</ListItemIcon>
                    {sidebarOpen && <ListItemText primary={section.label} />}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}
      {!isMobile && (
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
            <ChevronLeftIcon sx={{ color: '#FFE066', fontSize: 14 }} />
          ) : (
            <ChevronRightIcon sx={{ color: '#FFE066', fontSize: 14 }} />
          )}
        </Box>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#23272b',
          p: 4,
          mt: 8,
          minHeight: '100vh',
          color: '#FFE066',
          transition: 'margin-left 0.3s',
          width: '100%',
          maxWidth: '100vw',
          px: { xs: 1, sm: 4 },
        }}
      >
        <SectionContent section={selectedSection} productosModulo={productosModulo} pedidosActivos={pedidosActivos} setPedidosActivos={setPedidosActivos} historicoVentas={historicoVentas} setHistoricoVentas={setHistoricoVentas} />
      </Box>
    </Box>
  );
} 