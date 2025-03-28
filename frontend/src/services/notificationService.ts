import { makeAuthenticatedRequest } from '../utils/auth';

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

export const notificationService = {
  async getNotifications(limit: number = 20): Promise<NotificationData[]> {
    try {
      // Temporalmente usar el endpoint de test
      const response = await fetch('http://localhost:5000/api/test-notifications/test');
      const data = await response.json();
      return data.data.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await makeAuthenticatedRequest(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
};
