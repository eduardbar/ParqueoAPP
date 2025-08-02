import io, { Socket } from 'socket.io-client';

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(token: string, userId: number, userRole: string) {
    if (this.socket) {
      this.disconnect();
    }

    // Configurar URL del socket según el entorno
    const getSocketUrl = () => {
      if (process.env.NODE_ENV === 'production') {
        return window.location.origin; // Usar el mismo dominio en producción
      }
      return process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';
    };

    const socketUrl = getSocketUrl();

    this.socket = io(socketUrl, {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      this.isConnected = true;
      
      // Authenticate user
      this.socket?.emit('authenticate', {
        userId: userId,
        userRole: userRole
      });
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Notification methods
  onNotification(callback: (notification: NotificationData) => void) {
    this.socket?.on('notification', callback);
  }

  getNotifications(limit: number = 20) {
    this.socket?.emit('get_notifications', { limit });
  }

  markNotificationAsRead(notificationId: string) {
    this.socket?.emit('mark_notification_read', { notificationId });
  }

  onNotificationsLoaded(callback: (data: { notifications: NotificationData[] }) => void) {
    this.socket?.on('notifications_loaded', callback);
  }

  onNotificationMarkedRead(callback: (data: { notificationId: string }) => void) {
    this.socket?.on('notification_marked_read', callback);
  }

  // Parking lot methods
  joinParkingUpdates(parkingLotId: number) {
    this.socket?.emit('join_parking_updates', { parkingLotId });
  }

  leaveParkingUpdates(parkingLotId: number) {
    this.socket?.emit('leave_parking_updates', { parkingLotId });
  }

  onParkingUpdate(callback: (data: any) => void) {
    this.socket?.on('parking_update', callback);
  }

  onParkingSpacesUpdated(callback: (data: any) => void) {
    this.socket?.on('parking_spaces_updated', callback);
  }

  // Update parking spaces (owners only)
  updateParkingSpaces(parkingLotId: number, availableSpaces: number) {
    this.socket?.emit('update_parking_spaces', {
      parkingLotId,
      availableSpaces
    });
  }

  onParkingUpdateSuccess(callback: (data: any) => void) {
    this.socket?.on('parking_update_success', callback);
  }

  // Error handling
  onError(callback: (error: any) => void) {
    this.socket?.on('error', callback);
  }

  // Check connection status
  get connected() {
    return this.isConnected;
  }
}

const socketService = new SocketService();
export default socketService;
