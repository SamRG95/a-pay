/**
 * RouteGuard - Componente de Protección de Rutas
 * 
 * Este componente implementa un sistema de protección de rutas basado en roles
 * y autenticación. Controla el acceso a las diferentes páginas según el rol
 * del usuario y su estado de autenticación.
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido a renderizar si está autorizado
 * 
 * @example
 * <RouteGuard>
 *   <AdminDashboard />
 * </RouteGuard>
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useIsClient } from '../hooks/useIsClient';

// Configuración de rutas permitidas por rol
// Define qué rutas puede acceder cada tipo de usuario
const ROUTE_PERMISSIONS = {
  admin: ['/admin'],      // Admin puede acceder solo al dashboard de admin
  modulo: ['/modulo'],    // Módulo puede acceder solo a su interfaz de venta
  banco: ['/banco']       // Banco puede acceder solo a su interfaz bancaria
};

/**
 * Componente principal de protección de rutas
 * 
 * Funcionalidades:
 * - Verifica si el usuario está autenticado
 * - Valida que el usuario tenga permisos para la ruta actual
 * - Redirige automáticamente según el rol
 * - Muestra loading mientras verifica autenticación
 * - Permite acceso a /login sin autenticación
 */
export default function RouteGuard({ children }) {
  const isClient = useIsClient();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isClient) return;
    
    console.log('[RouteGuard] useEffect fired. router.isReady:', router.isReady, 'pathname:', router.pathname);
    
    /**
     * Función principal de verificación de autenticación
     * Se ejecuta cada vez que cambia la ruta o el estado del router
     */
    const authCheck = () => {
      // Obtener usuario del localStorage
      let user = null;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('usuario');
        if (stored) {
          try {
            user = JSON.parse(stored);
          } catch (e) {
            console.error('[RouteGuard] Error parsing user from localStorage:', e);
            user = null;
          }
        }
      }

      const currentPath = router.pathname;
      console.log('[RouteGuard] currentPath:', currentPath, 'user:', user);

      // CASO1: No hay usuario y está en /login - PERMITIR ACCESO
      if (!user && currentPath === '/login') {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // CASO2: No hay usuario y no está en login - REDIRIGIR A LOGIN
      if (!user && currentPath !== '/login') {
        console.log('[RouteGuard] No user, redirecting to /login');
        setAuthorized(false);
        setLoading(false);
        router.push('/login');
        return;
      }

      // CASO 3: Hay usuario pero está en login - REDIRIGIR SEGÚN ROL
      if (user && currentPath === '/login') {
        console.log('[RouteGuard] User already logged in, redirecting by role:', user.rol);
        setAuthorized(false);
        setLoading(false);
        
        // Redirigir según el rol del usuario
        if (user.rol === 'admin') {
          router.push('/admin');
        } else if (user.rol === 'modulo') {
          router.push('/modulo');
        } else if (user.rol === 'banco') {
          router.push('/banco');
        }
        return;
      }

      // CASO 4: Hay usuario - VERIFICAR PERMISOS DE RUTA
      if (user) {
        const userRole = user.rol;
        const allowedRoutes = ROUTE_PERMISSIONS[userRole] || [];
        console.log('[RouteGuard] User role:', userRole, 'allowedRoutes:', allowedRoutes, 'isRouteAllowed:', allowedRoutes.includes(currentPath));
        
        // Verificar si la ruta actual está permitida para el rol
        const isRouteAllowed = allowedRoutes.includes(currentPath);
        
        if (!isRouteAllowed) {
          console.log('[RouteGuard] Route not allowed for role, redirecting.');
          setAuthorized(false);
          setLoading(false);
          
          // Redirigir a la página correspondiente según el rol
          if (userRole === 'admin') {
            router.push('/admin');
          } else if (userRole === 'modulo') {
            router.push('/modulo');
          } else if (userRole === 'banco') {
            router.push('/banco');
          }
          return;
        }
        
        console.log('[RouteGuard] Authorized!');
        setAuthorized(true);
        setLoading(false);
      } else {
        setAuthorized(false);
        setLoading(false);
      }
    };

    // Solo ejecutar authCheck si el router está listo
    if (router.isReady) {
      authCheck();
    }
  }, [router.pathname, router.isReady, isClient]);

  // Renderizado condicional basado en el estado del cliente
  if (!isClient) {
    console.log('[RouteGuard] Esperando a que sea cliente...');
    return null;
  }
  
  // Renderizado condicional basado en el estado del router
  if (!router.isReady) {
    console.log('[RouteGuard] Waiting for router.isReady...');
    return null;
  }
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    console.log('[RouteGuard] Loading...');
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#23272b',
          color: '#FFE066'
        }}
      >
        <CircularProgress sx={{ color: '#FFE066', mb: 2 }} />
        <Typography variant="h6">Verificando autenticación...</Typography>
      </Box>
    );
  }

  // Si está autorizado, mostrar el contenido
  return authorized ? children : null;
} 