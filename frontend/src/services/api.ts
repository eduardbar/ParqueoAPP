import axios, { AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  AuthResponse, 
  ApiResponse, 
  RegisterData, 
  LoginData, 
  ParkingLot, 
  CreateParkingLotData, 
  UpdateSpacesData, 
  User 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get token
const getAuthToken = () => {
  try {
    const authStore = useAuthStore.getState();
    if (authStore.accessToken) {
      return authStore.accessToken;
    }
    
    // Fallback to localStorage
    const storageData = localStorage.getItem('auth-storage');
    if (storageData) {
      const parsed = JSON.parse(storageData);
      return parsed.state?.accessToken || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
    return response.data;
  },
  
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response: AxiosResponse<ApiResponse<{ accessToken: string; refreshToken: string }>> = 
      await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (data: { name: string }): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.put('/users/profile', data);
    return response.data;
  },
};

// Parking API
export const parkingApi = {
  getAll: async (params?: { lat?: number; lng?: number; radius?: number }): Promise<ApiResponse<{ parkingLots: ParkingLot[] }>> => {
    const response: AxiosResponse<ApiResponse<{ parkingLots: ParkingLot[] }>> = 
      await api.get('/parking', { params });
    return response.data;
  },
  
  getById: async (id: number): Promise<ApiResponse<{ parkingLot: ParkingLot }>> => {
    const response: AxiosResponse<ApiResponse<{ parkingLot: ParkingLot }>> = 
      await api.get(`/parking/${id}`);
    return response.data;
  },
  
  create: async (data: CreateParkingLotData): Promise<ApiResponse<{ parkingLot: ParkingLot }>> => {
    const response: AxiosResponse<ApiResponse<{ parkingLot: ParkingLot }>> = 
      await api.post('/parking', data);
    return response.data;
  },
  
  updateSpaces: async (id: number, data: UpdateSpacesData): Promise<ApiResponse<{ parkingLot: ParkingLot }>> => {
    const response: AxiosResponse<ApiResponse<{ parkingLot: ParkingLot }>> = 
      await api.put(`/parking/${id}/spaces`, data);
    return response.data;
  },
  
  getOwnerParkingLots: async (): Promise<ApiResponse<{ parkingLots: ParkingLot[] }>> => {
    const response: AxiosResponse<ApiResponse<{ parkingLots: ParkingLot[] }>> = 
      await api.get('/parking/owner/my-lots');
    return response.data;
  },
};

export default api;
