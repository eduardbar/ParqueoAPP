import { User, NotificationSettings } from '../types';

// API Base URL configuration basada en documentación de Vercel
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://parqueo-app-col.vercel.app/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

interface ProfileUpdateData {
  name: string;
  email: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  // Get user profile
  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener el perfil');
    }

    const data = await response.json();
    return data.user;
  },

  // Update profile
  async updateProfile(token: string, profileData: ProfileUpdateData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar el perfil');
    }

    const data = await response.json();
    return data.user;
  },

  // Upload profile image
  async uploadProfileImage(token: string, imageFile: File): Promise<User> {
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    const response = await fetch(`${API_BASE_URL}/profile/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir la imagen');
    }

    const data = await response.json();
    return data.user;
  },

  // Change password
  async changePassword(token: string, passwordData: PasswordChangeData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/profile/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al cambiar la contraseña');
    }
  },

  // Update notification settings
  async updateNotificationSettings(token: string, settings: NotificationSettings): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/profile/notification-settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar las configuraciones');
    }

    const data = await response.json();
    return data.user;
  },
};
