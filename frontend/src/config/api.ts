// Configuración centralizada de URLs para el API basada en documentación de Vercel
export const getApiBaseUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    // En producción de Vercel, usar el dominio completo
    return 'https://parqueo-app-col.vercel.app/api';
  }
  // En desarrollo, usar la URL configurada o localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

export const getSocketUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    // En producción, usar el dominio de Vercel
    return 'https://parqueo-app-col.vercel.app';
  }
  // En desarrollo, usar las variables de entorno o localhost
  return process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
export const SOCKET_URL = getSocketUrl();
