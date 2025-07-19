/**
 * Página de Login - Autenticación de Usuarios
 * 
 * Esta página proporciona la interfaz de autenticación para todos los usuarios
 * del sistema A-Pay. Valida credenciales contra el backend y redirige según el rol.
 * 
 * Características:
 * - Validación de campos requeridos
 * - Manejo de errores de autenticación
 * - Redirección automática según rol
 * - Diseño responsivo y accesible
 * - Integración con el hook useAuth
 * 
 * @page
 * @route /login
 */

import { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

export default function Login() {
  // Estados del formulario
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Hooks personalizados
  const { login } = useAuth();
  const router = useRouter();

  /**
   * Manejador del envío del formulario de login
   * Valida credenciales y redirige según el rol del usuario
   * 
   * @param {Event} e - Evento del formulario
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validación de campos requeridos
    if (!usuario || !password) {
      setError('Por favor, completa ambos campos.');
      return;
    }
    
    // Limpiar errores previos y mostrar loading
    setError('');
    setLoading(true);
    
    try {
      // Llamada al endpoint de autenticación
      const res = await fetch('https://cool-emus-hammer.loca.lt/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });
      
      // Manejo de respuesta de error
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al iniciar sesión');
        return;
      }
      
      // Login exitoso - obtener datos del usuario
      const user = await res.json();
      
      // Guardar usuario en el estado global y localStorage
      login(user);
      
      // Redirigir según el rol del usuario
      if (user.rol === 'admin') {
        router.replace('/admin');
      } else if (user.rol === 'modulo') {
        router.replace('/modulo');
      } else if (user.rol === 'banco') {
        router.replace('/banco');
      }
      
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#424242', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Contenedor principal del formulario */}
      <Box
        sx={{
          width: 370,
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo de la aplicación */}
        <Image
          src="/logo-apay.png"
          alt="Logo A PAY"
          width={120}
          height={120}
          style={{ marginBottom: 16 }}
        />
        
        {/* Título del formulario */}
        <Typography variant="h5" color="primary" mb={2} align="center">
          Iniciar Sesión
        </Typography>
        
        {/* Formulario de login */}
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          {/* Campo de usuario */}
          <TextField
            label="Usuario"
            fullWidth
            margin="normal"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            disabled={loading}
            InputProps={{ style: { color: '#FFD700' } }}
            InputLabelProps={{ style: { color: '#FFD700' } }}
          />
          
          {/* Campo de contraseña */}
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            InputProps={{ style: { color: '#FFD700' } }}
            InputLabelProps={{ style: { color: '#FFD700' } }}
          />
          
          {/* Mensaje de error */}
          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
          
          {/* Botón de envío */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </Button>
        </form>
      </Box>
    </Box>
  );
} 