/**
 * useAuth - Hook de Gestión de Autenticación
 * 
 * Este hook proporciona funcionalidades completas para la gestión de autenticación
 * en el sistema A-Pay. Maneja el estado del usuario, login, logout y validaciones.
 * 
 * @hook
 * @returns {Object} Objeto con métodos y estado de autenticación
 * @returns {Object|null} returns.user - Usuario actual (null si no está autenticado)
 * @returns {boolean} returns.loading - Estado de carga
 * @returns {Function} returns.login - Función para iniciar sesión
 * @returns {Function} returns.logout - Función para cerrar sesión
 * @returns {Function} returns.isAuthenticated - Función para verificar autenticación
 * @returns {Function} returns.hasRole - Función para verificar rol específico
 * 
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * // Verificar si está autenticado
 * if (isAuthenticated()) {   // Usuario autenticado
 * }
 * 
 * // Iniciar sesión
 * login(userData);
 * 
 * // Cerrar sesión
 * logout();
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export function useAuth() {
  // Estado del usuario actual
  const [user, setUser] = useState(null);
  
  // Estado de carga (útil para mostrar spinners)
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  /**
   * Efecto para cargar el usuario desde localStorage al inicializar
   * También escucha cambios en localStorage (para sincronización entre pestañas)
   */
  useEffect(() => {
    console.log('[useAuth] useEffect fired');
    /**
     * Función para obtener y parsear el usuario desde localStorage
     */
    const getUser = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('usuario');
        if (stored) {
          try {
            const userData = JSON.parse(stored);
            setUser(userData);
            console.log('[useAuth] User loaded from localStorage:', userData);
          } catch (e) {
            console.error('[useAuth] Error parsing user from localStorage:', e);
            setUser(null);
          }
        } else {
          setUser(null);
          console.log('[useAuth] No user in localStorage');
        }
      } else {
        console.log('[useAuth] Not in browser, skipping localStorage');
      }
      setLoading(false);
    };
    
    // Cargar usuario inicial
    getUser();
    
    /**
     * Manejador para cambios en localStorage (sincronización entre pestañas)
     */
    const handleStorageChange = () => {
      getUser();
    };
    
    // Escuchar cambios en localStorage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  /**
   * Efecto para logging del estado de renderizado
   */
  useEffect(() => {
    console.log('[useAuth] Render: user =', user, 'loading =', loading);
  }, [user, loading]);

  /**
   * Función para iniciar sesión
   * Guarda el usuario en localStorage y actualiza el estado
   * 
   * @param {Object} userData - Datos del usuario a guardar
   * @param {string} userData.usuario - Nombre de usuario
   * @param {string} userData.rol - Rol del usuario (admin, modulo, banco)
   * @param {string} userData.nombreResponsable - Nombre del responsable
   * @param {number} userData.idIglesia - ID de la iglesia
   */
  const login = (userData) => {
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUser(userData);
    console.log('[useAuth] login() called:', userData);
  };

  /**
   * Función para cerrar sesión
   * Elimina el usuario de localStorage y redirige a login
   */
  const logout = () => {
    localStorage.removeItem('usuario');
    setUser(null);
    router.push('/login');
    console.log('[useAuth] logout() called');
  };

  /**
   * Función para verificar si el usuario está autenticado
   * 
   * @returns {boolean} true si hay usuario, false en caso contrario
   */
  const isAuthenticated = () => {
    return user !== null;
  };

  /**
   * Función para verificar si el usuario tiene un rol específico
   * 
   * @param {string} role - Rol a verificar (admin, modulo, banco)
   * @returns {boolean} true si el usuario tiene el rol, false en caso contrario
   */
  const hasRole = (role) => {
    return user && user.rol === role;
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole
  };
} 