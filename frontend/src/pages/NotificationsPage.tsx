import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, DollarSign, Calendar, Eye, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import socketService from '../services/socketService';
import { notificationService as restNotificationService, NotificationData } from '../services/notificationService';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { user, token } = useAuthStore() as any;

  useEffect(() => {
    // Cargar notificaciones inmediatamente sin requerir autenticación
    alert('NotificationsPage useEffect is running! - UPDATED');
    console.log('📧 NotificationsPage useEffect is running! - UPDATED');
    setLoading(true);
    
    const loadNotifications = async () => {
      try {
        console.log('📧 Loading notifications via REST API...');
        const timestamp = Date.now();
        const response = await fetch(`http://localhost:5000/api/test-notifications/test?t=${timestamp}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const data = await response.json();
        console.log('📧 Raw response:', data);
        
        if (data.status === 'success' && data.data && data.data.notifications) {
          console.log('📧 Notifications loaded:', data.data.notifications);
          setNotifications(data.data.notifications);
        } else {
          console.log('📧 No notifications found or invalid response');
          setNotifications([]);
        }
      } catch (error) {
        console.error('📧 Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // También intentar con socket si el usuario está autenticado
    if (user && token) {
      socketService.connect(token, user.id, user.role);

      // Listen for new notifications
      socketService.onNotification((notification: NotificationData) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      });

      // Listen for notifications loaded
      socketService.onNotificationsLoaded((data: { notifications: NotificationData[] }) => {
        console.log('📧 Socket notifications loaded:', data.notifications);
        if (data.notifications && data.notifications.length > 0) {
          setNotifications(data.notifications);
        }
      });

      // Listen for notification marked as read
      socketService.onNotificationMarkedRead((data: { notificationId: string }) => {
        setNotifications(prev => 
          prev.map(n => 
            n.id === data.notificationId ? { ...n, read: true } : n
          )
        );
      });

      // Load initial notifications via socket
      socketService.getNotifications(50);

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        socketService.disconnect();
      };
    }
  }, [user, token]);

  const handleMarkAsRead = async (notificationId: string) => {
    // Try socket first, then REST API
    const success = await restNotificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    }
    
    // Also try via socket
    socketService.markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      await restNotificationService.markAsRead(notification.id);
      socketService.markNotificationAsRead(notification.id);
    }
    
    // Update local state
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CREATED':
        return <Calendar className="w-6 h-6 text-blue-500" />;
      case 'BOOKING_CONFIRMED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'BOOKING_CANCELLED':
        return <X className="w-6 h-6 text-red-500" />;
      case 'BOOKING_COMPLETED':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'PAYMENT_PROCESSED':
        return <DollarSign className="w-6 h-6 text-green-500" />;
      case 'PARKING_UPDATED':
        return <Info className="w-6 h-6 text-yellow-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CREATED':
        return 'bg-blue-50 border-blue-200';
      case 'BOOKING_CONFIRMED':
        return 'bg-green-50 border-green-200';
      case 'BOOKING_CANCELLED':
        return 'bg-red-50 border-red-200';
      case 'BOOKING_COMPLETED':
        return 'bg-blue-50 border-blue-200';
      case 'PAYMENT_PROCESSED':
        return 'bg-green-50 border-green-200';
      case 'PARKING_UPDATED':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getFullDateTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your parking activities</p>
        </div>

        {/* Stats and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {notifications.length} total notifications
                </span>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-600">
                    {unreadCount} unread
                  </span>
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'read' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'You\'ll receive notifications about bookings, payments, and parking updates here.' 
                  : `You don't have any ${filter} notifications.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${
                  !notification.read ? 'ring-2 ring-blue-50' : ''
                } ${getNotificationColor(notification.type)}`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2">
                        {notification.message}
                      </p>
                      <div className="mt-4 flex items-center space-x-4">
                        <button
                          onClick={() => {
                            setSelectedNotification(notification);
                            setShowModal(true);
                          }}
                          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View details</span>
                        </button>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-800"
                          >
                            <Check className="w-4 h-4" />
                            <span>Mark as read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Details Modal */}
        {showModal && selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getNotificationIcon(selectedNotification.type)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedNotification.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedNotification.message}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedNotification.type}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getFullDateTime(selectedNotification.timestamp)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedNotification.read 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedNotification.read ? 'Read' : 'Unread'}
                    </span>
                  </div>

                  {selectedNotification.data && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Additional Data</label>
                      <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {JSON.stringify(selectedNotification.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Close
                  </button>
                  {!selectedNotification.read && (
                    <button
                      onClick={() => {
                        handleMarkAsRead(selectedNotification.id);
                        setShowModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
