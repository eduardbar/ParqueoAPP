// Nuevo servicio de autenticación usando fetch nativo sin axios
// para evitar problemas de codificación y BOM

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: 'DRIVER' | 'OWNER';
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: {
      id: number;
      name: string;
      email: string;
      role: 'DRIVER' | 'OWNER';
      profileImage?: string;
      createdAt: string;
      updatedAt?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  private readonly baseUrl: string;

  constructor() {
    // Configuración para Vercel basada en la documentación oficial
    if (process.env.NODE_ENV === 'production') {
      // En producción, usar el dominio completo de Vercel
      this.baseUrl = 'https://parqueo-app-col.vercel.app/api';
    } else {
      // En desarrollo local, usar localhost
      this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getProfile(token: string): Promise<any> {
    return this.makeRequest<any>('/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const authService = new AuthService();
