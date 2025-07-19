/**
 * useIsClient - Hook para Detección de Cliente
 * 
 * Este hook resuelve problemas de hidratación en Next.js detectando si el código
 * se está ejecutando en el cliente (navegador) o en el servidor. Es especialmente
 * útil para componentes que necesitan acceder a APIs del navegador como localStorage.
 * 
 * @hook
 * @returns {boolean} true si se está ejecutando en el cliente, false en el servidor
 * 
 * @example
 * const isClient = useIsClient();
 * 
 * if (isClient) {
 *   // Código que solo debe ejecutarse en el cliente
 *   const user = localStorage.getItem('usuario');
 * }
 */

import { useEffect, useState } from 'react';

export function useIsClient() {
  // Estado inicial es false (servidor)
  const [isClient, setIsClient] = useState(false);
  
  // Al montar el componente, se ejecuta en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
} 