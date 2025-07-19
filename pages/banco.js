/**
 * Página de Banco - Gestión Financiera
 *
 * Esta página es la interfaz principal para el usuario con rol 'banco'. Permite:
 * - Visualizar y gestionar transacciones financieras
 * - Validar y procesar códigos QR
 * - Consultar reportes de movimientos
 * - Acceder a funcionalidades bancarias específicas
 *
 * Estructura principal:
 * - Panel de transacciones y validación de QR
 * - Visualización de reportes y movimientos
 * - Modales para detalles y confirmaciones
 * - Integración con el backend para operaciones financieras
 *
 * Hooks personalizados:
 * - useAuth: Estado y acciones de autenticación
 *
 * @page
 * @route /banco
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
  Button,
  TextField,
  Alert,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../hooks/useAuth';
import { Html5QrcodeScanner } from 'html5-qrcode';

const drawerWidth = 220;
const bancoNombre = 'Banco';

const sections = [
  { label: 'Saldo', icon: <AddCircleOutlineIcon /> },
  { label: 'Caja', icon: <MonetizationOnIcon /> },
  { label: 'Traspaso', icon: <SwapHorizIcon /> },
  { label: 'Activar QR', icon: <QrCodeScannerIcon /> },
];

// --- FUNCIONES DE INTEGRACIÓN QR ---
// Activar QR
async function activarQr(idQrPago, nombre) {
  try {
    const res = await fetch(`https://cool-emus-hammer.loca.lt/qr/${idQrPago}/activar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    });
    if (!res.ok) throw new Error('No se pudo activar el QR');
    const data = await res.text();
    if (!data) throw new Error('Respuesta vacía del servidor');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error de conexión: ${error.message}`);
  }
}
// Recargar saldo
async function recargarSaldo(idQrPago, monto) {
  try {
    const res = await fetch(`https://cool-emus-hammer.loca.lt/qr/${idQrPago}/recargar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto })
    });
    if (!res.ok) throw new Error('No se pudo recargar el saldo');
    const data = await res.text();
    if (!data) throw new Error('Respuesta vacía del servidor');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error de conexión: ${error.message}`);
  }
}
// Consultar saldo
async function consultarSaldo(token) {
  try {
    const res = await fetch(`https://cool-emus-hammer.loca.lt/qr/${token}/saldo`);
    if (!res.ok) throw new Error('QR no encontrado');
    const data = await res.text();
    if (!data) throw new Error('Respuesta vacía del servidor');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error de conexión: ${error.message}`);
  }
}

function SectionContent({ section }) {
  // Estados para el flujo de recarga
  const [monto, setMonto] = useState('');
  const [montoError, setMontoError] = useState('');
  const [scanOpen, setScanOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [qrError, setQrError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Nuevo estado para manejo de carga

  // Estados para el flujo de consulta de saldo
  const [modalOpen, setModalOpen] = useState(false);
  const [qrConsulta, setQrConsulta] = useState('');
  const [qrConsultaError, setQrConsultaError] = useState('');
  const [saldo, setSaldo] = useState(null);

  // Estados para traspaso
  const [qrEnvia, setQrEnvia] = useState('');
  const [saldoEnvia, setSaldoEnvia] = useState(null);
  const [qrRecibe, setQrRecibe] = useState('');
  const [saldoRecibe, setSaldoRecibe] = useState(null);
  const [modalEnvia, setModalEnvia] = useState(false);
  const [modalRecibe, setModalRecibe] = useState(false);
  const [confirmTraspaso, setConfirmTraspaso] = useState(false);
  const [successTraspaso, setSuccessTraspaso] = useState(false);
  // Simulación de saldo random al capturar QR
  const handleCapturarEnvia = () => {
    if (!qrEnvia) return;
    setSaldoEnvia(Math.floor(Math.random() * 1000) + 1);
    setModalEnvia(false);
  };
  const handleCapturarRecibe = () => {
    if (!qrRecibe) return;
    setSaldoRecibe(Math.floor(Math.random() * 1000) + 1);
    setModalRecibe(false);
  };
  const handleLimpiar = () => {
    setQrEnvia(''); setSaldoEnvia(null); setQrRecibe(''); setSaldoRecibe(null);
  };
  const handleTraspaso = () => {
    setConfirmTraspaso(false);
    setSuccessTraspaso(true);
    setQrEnvia(''); setSaldoEnvia(null); setQrRecibe(''); setSaldoRecibe(null);
  };

  const customInputStyles = {
    '& .MuiInputBase-root': {
      bgcolor: '#212121',
      color: '#FFE066',
      borderRadius: 1,
    },
    '& .MuiInputLabel-root': {
      color: '#FFE066',
      background: 'transparent',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FFE066',
    },
    '& .MuiInputBase-input': {
      color: '#FFE066',
    },
    '& .MuiInputLabel-shrink': {
      color: '#FFE066',
      background: 'transparent',
    },
    '& .MuiFormHelperText-root': {
      color: '#FFE066',
    },
  };

  // Mover handleConsultar aquí
  const handleConsultar = async () => {
    if (!qrConsulta) {
      setQrConsultaError('Debes ingresar el ID del QR');
      return;
    }
    setLoading(true);
    try {
      const qrInfo = await consultarSaldo(qrConsulta);
      setSaldo(qrInfo.saldo);
    } catch (err) {
      setQrConsultaError(err.message);
      setSaldo(null);
    } finally {
      setLoading(false);
    }
  };

  // En el flujo de recarga, reemplaza la simulación por la llamada real:
  const handleRecargar = async () => {
    if (!qrValue) {
      setQrError('Debes ingresar el ID del QR');
      return;
    }
    if (!monto || isNaN(monto) || parseInt(monto) < 1) {
      setMontoError('Ingresa una cantidad válida (entero mayor a 0)');
      return;
    }
    setLoading(true);
    try {
      // Buscar QR por token para obtener idQrPago
      const qrInfo = await consultarSaldo(qrValue);
      if (!qrInfo) throw new Error('QR no encontrado');
      // Recargar saldo
      await recargarSaldo(qrInfo.idQrPago, monto);
      setSuccess(true);
      setMonto('');
      setQrValue('');
    } catch (err) {
      setQrError(err.message);
    } finally {
      setLoading(false);
      setScanOpen(false);
      setConfirmOpen(false);
    }
  };

  // En el flujo de activación, elimina cualquier input manual de ID QR. El flujo debe ser:
  // 1. Botón para escanear QR (con ícono)
  // 2. Al escanear, guardar en qrEscaneado y mostrar input para nombre del propietario
  // 3. Botón para activar solo si ambos valores están presentes
  // 4. Modal de confirmación y modal de éxito
  const handleActivar = async () => {
    if (!qrEscaneado) {
      setErrorQr('Debes escanear el QR a activar');
      return;
    }
    if (!nombreUsuario) {
      setErrorNombre('Debes ingresar el nombre del propietario');
      return;
    }
    setLoading(true);
    try {
      // Buscar QR por token para obtener idQrPago
      const qrInfo = await consultarSaldo(qrEscaneado);
      if (!qrInfo) throw new Error('QR no encontrado');
      await activarQr(qrInfo.idQrPago, nombreUsuario);
      setSuccessActivar(true);
      setQrEscaneado('');
      setNombreUsuario('');
    } catch (err) {
      setErrorQr(err.message);
    } finally {
      setLoading(false);
      setModalActivar(false);
      setConfirmActivar(false);
    }
  };

  // En SectionContent, agrega estados para mostrar el escáner en cada flujo
  const [showScannerRecarga, setShowScannerRecarga] = useState(false);
  const [showScannerActivar, setShowScannerActivar] = useState(false);
  const [showScannerTraspasoEnvia, setShowScannerTraspasoEnvia] = useState(false);
  const [showScannerTraspasoRecibe, setShowScannerTraspasoRecibe] = useState(false);

  // 1. Define todos los estados necesarios para el flujo de activación de QR:
  const [modalActivar, setModalActivar] = useState(false);
  const [qrEscaneado, setQrEscaneado] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [errorNombre, setErrorNombre] = useState('');
  const [errorQr, setErrorQr] = useState('');
  const [confirmActivar, setConfirmActivar] = useState(false);
  const [successActivar, setSuccessActivar] = useState(false);
  // 2. Elimina cualquier input manual de ID QR.
  // 3. El flujo debe ser: botón para escanear QR (con ícono), al escanear guardar en qrEscaneado, mostrar input para nombre del propietario, y botón para activar solo si ambos valores están presentes.
  // 4. Elimina cualquier referencia a variables no definidas.

  // Estado para Snackbar de éxito y error de escaneo
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarError, setSnackbarError] = useState(false);

  switch (section) {
    case 0:
      return (
        <Box>
          <Typography variant="h4" color="primary" fontWeight={700} align="center" mb={2}>Saldo</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, boxShadow: 1, ':hover': { bgcolor: '#FFD700' }, minWidth: 0, px: 1.5, py: 0.2, fontSize: 13, height: 28, borderRadius: 2, textTransform: 'none' }}
              onClick={() => {
                setModalOpen(true);
                setQrConsulta('');
                setQrConsultaError('');
                setSaldo(null);
              }}
            >
              Consultar saldo
            </Button>
          </Box>
          <Box sx={{ maxWidth: 340, mx: 'auto', bgcolor: '#23272b', p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography align="center" mb={2}>¿Cuánto deseas recargar?</Typography>
            <TextField
              fullWidth
              label="Cantidad a recargar"
              type="number"
              variant="outlined"
              value={monto}
              onChange={e => {
                setMonto(e.target.value);
                setMontoError('');
              }}
              InputProps={{ inputProps: { min: 1, step: 1 } }}
              sx={{ mb: 2, ...customInputStyles }}
              error={!!montoError}
              helperText={montoError}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, boxShadow: 1, ':hover': { bgcolor: '#FFD700' }, mb: 2 }}
              onClick={() => {
                if (!monto || isNaN(monto) || parseInt(monto) < 1) {
                  setMontoError('Ingresa una cantidad válida (entero mayor a 0)');
                  return;
                }
                setScanOpen(true);
              }}
            >
              Recargar
            </Button>
          </Box>
          {/* Modal de escaneo de QR (simulado con input) */}
          <Modal open={scanOpen} onClose={() => setScanOpen(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>Escanea el QR a recargar</Typography>
              {showScannerRecarga ? (
                <QRScanner onScan={(val) => { setQrValue(val); setShowScannerRecarga(false); setScanOpen(false); }} onClose={() => setShowScannerRecarga(false)} />
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="ID QR (simulado)"
                    variant="outlined"
                    value={qrValue}
                    onChange={e => { setQrValue(e.target.value); setQrError(''); }}
                    sx={{ mb: 2, ...customInputStyles }}
                    error={!!qrError}
                    helperText={qrError}
                  />
                  <Button fullWidth variant="contained" sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, mt: 1 }} onClick={() => setShowScannerRecarga(true)}>Usar cámara</Button>
                </>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button fullWidth variant="outlined" sx={{ color: '#FFE066', borderColor: '#FFE066' }} onClick={() => setScanOpen(false)}>Cancelar</Button>
                <Button fullWidth variant="contained" sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700 }} onClick={handleRecargar}>Continuar</Button>
              </Box>
            </Box>
          </Modal>
          {/* Modal de confirmación */}
          <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>Confirmar recarga</Typography>
              <Typography align="center" mb={3}>¿Recargar ${monto} al QR {qrValue}?</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ color: '#FFE066', borderColor: '#FFE066', ':hover': { borderColor: '#FFD700' } }}
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                  onClick={() => {
                    setConfirmOpen(false);
                    setSuccess(true);
                    setMonto('');
                    setQrValue('');
                  }}
                >
                  Confirmar
                </Button>
              </Box>
            </Box>
          </Modal>
          {/* Modal de éxito */}
          <Modal open={success} onClose={() => setSuccess(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>¡Recarga exitosa!</Typography>
              <Typography align="center" mb={3}>Se han recargado ${monto} al QR {qrValue}</Typography>
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                onClick={() => setSuccess(false)}
              >
                Aceptar
              </Button>
            </Box>
          </Modal>
          {/* Modal de consulta de saldo */}
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>Consultar saldo</Typography>
              <TextField
                fullWidth
                label="ID QR"
                variant="outlined"
                value={qrConsulta}
                onChange={e => {
                  setQrConsulta(e.target.value);
                  setQrConsultaError('');
                }}
                sx={{ mb: 2, ...customInputStyles }}
                error={!!qrConsultaError}
                helperText={qrConsultaError}
              />
              {saldo !== null && (
                <Alert severity="info" sx={{ mb: 2, bgcolor: '#FFE066', color: '#212121' }}>
                  Saldo actual: ${saldo}
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ color: '#FFE066', borderColor: '#FFE066', ':hover': { borderColor: '#FFD700' } }}
                  onClick={() => setModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                  onClick={handleConsultar}
                >
                  Consultar
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      );
    case 1:
      return (
        <Box>
          <Typography variant="h4" color="primary" fontWeight={700} align="center" mb={3}>Caja</Typography>
          <Box sx={{ maxWidth: 600, mx: 'auto', bgcolor: '#23272b', p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6" color="primary" mb={2}>Resumen de caja</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box sx={{ bgcolor: '#212121', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">Total recargas</Typography>
                <Typography variant="h4" color="primary" fontWeight={700}>$1,250</Typography>
              </Box>
              <Box sx={{ bgcolor: '#212121', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">QR activos</Typography>
                <Typography variant="h4" color="primary" fontWeight={700}>15</Typography>
              </Box>
              <Box sx={{ bgcolor: '#212121', p: 2, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">Traspasos</Typography>
                <Typography variant="h4" color="primary" fontWeight={700}>8</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    case 2:
      return (
        <Box>
          <Typography variant="h4" color="primary" fontWeight={700} align="center" mb={3}>Traspaso</Typography>
          <Box sx={{ maxWidth: 600, mx: 'auto', bgcolor: '#23272b', p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6" color="primary" mb={2}>Traspaso entre QR</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
              <Box>
                <Typography variant="subtitle1" color="primary" mb={1}>QR que envía</Typography>
                <TextField
                  fullWidth
                  label="ID QR origen"
                  variant="outlined"
                  value={qrEnvia}
                  onChange={e => setQrEnvia(e.target.value)}
                  sx={{ mb: 2, ...customInputStyles }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                  onClick={() => setModalEnvia(true)}
                >
                  Capturar QR
                </Button>
                {saldoEnvia && (
                  <Alert severity="info" sx={{ mt: 2, bgcolor: '#FFE066', color: '#212121' }}>
                    Saldo: ${saldoEnvia}
                  </Alert>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle1" color="primary" mb={1}>QR que recibe</Typography>
                <TextField
                  fullWidth
                  label="ID QR destino"
                  variant="outlined"
                  value={qrRecibe}
                  onChange={e => setQrRecibe(e.target.value)}
                  sx={{ mb: 2, ...customInputStyles }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                  onClick={() => setModalRecibe(true)}
                >
                  Capturar QR
                </Button>
                {saldoRecibe && (
                  <Alert severity="info" sx={{ mt: 2, bgcolor: '#FFE066', color: '#212121' }}>
                    Saldo: ${saldoRecibe}
                  </Alert>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                sx={{ color: '#FFE066', borderColor: '#FFE066', ':hover': { borderColor: '#FFD700' } }}
                onClick={handleLimpiar}
              >
                Limpiar
              </Button>
              <Button
                variant="contained"
                disabled={!qrEnvia || !qrRecibe}
                sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                onClick={() => setConfirmTraspaso(true)}
              >
                Realizar traspaso
              </Button>
            </Box>
          </Box>
          {/* Modal capturar QR que envía */}
          <Modal open={modalEnvia} onClose={() => setModalEnvia(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>Capturar QR origen</Typography>
              {showScannerTraspasoEnvia ? (
                <QRScanner onScan={(val) => { setQrEnvia(val); setShowScannerTraspasoEnvia(false); setModalEnvia(false); }} onClose={() => setShowScannerTraspasoEnvia(false)} />
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="ID QR (simulado)"
                    variant="outlined"
                    value={qrEnvia}
                    onChange={e => setQrEnvia(e.target.value)}
                    sx={{ mb: 2, ...customInputStyles }}
                  />
                  <Button fullWidth variant="contained" sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, mt: 1 }} onClick={() => setShowScannerTraspasoEnvia(true)}>Usar cámara</Button>
                </>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button fullWidth variant="outlined" sx={{ color: '#FFE066', borderColor: '#FFE066' }} onClick={() => setModalEnvia(false)}>Cancelar</Button>
                <Button fullWidth variant="contained" sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700 }} onClick={handleCapturarEnvia}>Capturar</Button>
              </Box>
            </Box>
          </Modal>
          {/* Modal capturar QR que recibe */}
          <Modal open={modalRecibe} onClose={() => setModalRecibe(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>Capturar QR destino</Typography>
              {showScannerTraspasoRecibe ? (
                <QRScanner onScan={(val) => { setQrRecibe(val); setShowScannerTraspasoRecibe(false); setModalRecibe(false); }} onClose={() => setShowScannerTraspasoRecibe(false)} />
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="ID QR (simulado)"
                    variant="outlined"
                    value={qrRecibe}
                    onChange={e => setQrRecibe(e.target.value)}
                    sx={{ mb: 2, ...customInputStyles }}
                  />
                  <Button fullWidth variant="contained" sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, mt: 1 }} onClick={() => setShowScannerTraspasoRecibe(true)}>Usar cámara</Button>
                </>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button fullWidth variant="outlined" sx={{ color: '#FFE066', borderColor: '#FFE066' }} onClick={() => setModalRecibe(false)}>Cancelar</Button>
                <Button fullWidth variant="contained" sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700 }} onClick={handleCapturarRecibe}>Capturar</Button>
              </Box>
            </Box>
          </Modal>
          {/* Modal confirmar traspaso */}
          <Modal open={confirmTraspaso} onClose={() => setConfirmTraspaso(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>Confirmar traspaso</Typography>
              <Typography align="center" mb={3}>¿Realizar traspaso de ${saldoEnvia} del QR {qrEnvia} al QR {qrRecibe}?</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ color: '#FFE066', borderColor: '#FFE066', ':hover': { borderColor: '#FFD700' } }}
                  onClick={() => setConfirmTraspaso(false)}
                >
                  Cancelar
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                  onClick={handleTraspaso}
                >
                  Confirmar
                </Button>
              </Box>
            </Box>
          </Modal>
          {/* Modal éxito traspaso */}
          <Modal open={successTraspaso} onClose={() => setSuccessTraspaso(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>¡Traspaso exitoso!</Typography>
              <Typography align="center" mb={3}>Se ha realizado el traspaso correctamente</Typography>
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                onClick={() => setSuccessTraspaso(false)}
              >
                Aceptar
              </Button>
            </Box>
          </Modal>
        </Box>
      );
    case 3:
      return (
        <Box>
          <Typography variant="h4" color="primary" fontWeight={700} align="center" mb={3}>Activar QR</Typography>
          <Box sx={{ maxWidth: 600, mx: 'auto', bgcolor: '#23272b', p: 3, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6" color="primary" mb={2}>Activar nuevo QR</Typography>
            {/* 1. Elimina el estado y el input manual de qrNuevo. */}
            {/* 2. Agrega un estado showScannerActivar para mostrar el QRScanner. */}
            {/* 3. Al escanear, guarda el valor en un estado (por ejemplo, qrEscaneado) y muestra solo el input para el nombre del propietario. */}
            {/* 4. El botón para activar QR solo debe estar habilitado si hay un valor escaneado y un nombre de propietario. */}
            {/* 5. Elimina cualquier referencia a qrNuevo y su set. */}
            <TextField
              fullWidth
              label="Nombre del propietario"
              variant="outlined"
              value={nombreUsuario}
              onChange={e => {
                setNombreUsuario(e.target.value);
                setErrorNombre('');
              }}
              sx={{ mb: 2, ...customInputStyles }}
              error={!!errorNombre}
              helperText={errorNombre}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
              onClick={() => {
                if (!nombreUsuario) {
                  setErrorNombre('Debes ingresar el nombre del propietario');
                  return;
                }
                setModalActivar(true);
                setShowScannerActivar(true);
              }}
            >
              Continuar
            </Button>
          </Box>
          {/* Modal activar QR */}
          <Modal open={modalActivar} onClose={() => setModalActivar(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>Escanea el QR a activar</Typography>
              {showScannerActivar ? (
                <QRScanner
                  onScan={(val) => {
                    setQrEscaneado(val);
                    setShowScannerActivar(false);
                    setConfirmActivar(true);
                  }}
                  onClose={() => setShowScannerActivar(false)}
                />
              ) : null}
            </Box>
          </Modal>
          {/* Modal confirmar activación */}
          <Modal open={confirmActivar} onClose={() => setConfirmActivar(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>Confirmar activación</Typography>
              <Typography align="center" mb={3}>¿Estás seguro de activar el QR {qrEscaneado}?</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ color: '#FFE066', borderColor: '#FFE066', ':hover': { borderColor: '#FFD700' } }}
                  onClick={() => setConfirmActivar(false)}
                >
                  Cancelar
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                  onClick={() => {
                    setConfirmActivar(false);
                    setSuccessActivar(true);
                    setQrEscaneado('');
                    setNombreUsuario('');
                  }}
                >
                  Confirmar
                </Button>
              </Box>
            </Box>
          </Modal>
          {/* Modal éxito activación */}
          <Modal open={successActivar} onClose={() => setSuccessActivar(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#23272b', p: 4, borderRadius: 3, boxShadow: 4, minWidth: 300 }}>
              <Typography align="center" mb={2} color="primary" fontWeight={700}>¡QR activado!</Typography>
              <Typography align="center" mb={3}>El QR ha sido activado correctamente</Typography>
              <Button
                fullWidth
                variant="contained"
                sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700, ':hover': { bgcolor: '#FFD700' } }}
                onClick={() => setSuccessActivar(false)}
              >
                Aceptar
              </Button>
            </Box>
          </Modal>
        </Box>
      );
    default:
      return null;
  }
}

// Componente reutilizable para escanear QR
function QRScanner({ onScan, onClose }) {
  const [cameraError, setCameraError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const scannerRef = useRef(null);

  // Función para obtener y seleccionar la cámara principal
  const getMainCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // Buscar la cámara principal (no ultra-wide)
      const mainCamera = videoDevices.find(device => 
        !device.label.toLowerCase().includes('ultra') &&
        !device.label.toLowerCase().includes('wide') &&
        !device.label.toLowerCase().includes('gran angular') &&
        device.label.toLowerCase().includes('back')
      ) || videoDevices[0]; // Fallback a la primera cámara trasera
      
      if (mainCamera) {
        setSelectedDeviceId(mainCamera.deviceId);
      }
    } catch (error) {
      console.log('No se pudo enumerar dispositivos:', error);
    }
  };

  useEffect(() => {
    getMainCamera();
  }, []);

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
        <Button 
          fullWidth 
          variant="contained" 
          sx={{ bgcolor: '#FFE066', color: '#212121', fontWeight: 700 }}
          onClick={onClose}
        >
          Entendido
        </Button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div id="qr-reader" style={{ width: '100%', maxWidth: 320, borderRadius: 8 }} />
      <Button fullWidth variant="outlined" sx={{ mt: 2, color: '#FFE066', borderColor: '#FFE066' }} onClick={onClose}>Cancelar</Button>
    </div>
  );
}

export default function BancoView() {
  const [selectedSection, setSelectedSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#23272b' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          color: 'primary.main',
          boxShadow: 2,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {(!sidebarOpen || isMobile) && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => isMobile ? setMobileOpen(true) : setSidebarOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" color="primary" fontWeight={700}>
            Banco - Panel
          </Typography>
          <button
            style={{
              background: 'transparent',
              color: '#FFD700',
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
              <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
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
              <AccountBalanceWalletIcon sx={{ fontSize: sidebarOpen ? 48 : 24 }} />
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
        <SectionContent section={selectedSection} />
      </Box>
    </Box>
  );
} 