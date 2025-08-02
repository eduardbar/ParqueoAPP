import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService, LoginCredentials, RegisterCredentials } from '../services/authService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login: storeLogin, logout: storeLogout, isAuthenticated, user } = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.status === 'success' && response.data) {
        storeLogin(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(credentials);
      
      if (response.status === 'success' && response.data) {
        storeLogin(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
        return { success: true };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
  };

  return {
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated,
    user,
  };
};
