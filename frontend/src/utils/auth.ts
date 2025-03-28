// Crear un interceptor específico para el OwnerDashboard
import { useAuthStore } from '../store/authStore';

export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const { accessToken } = useAuthStore.getState();
  
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
