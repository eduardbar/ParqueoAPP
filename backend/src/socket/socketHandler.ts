import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import NotificationService from '../services/notificationService';

const prisma = new PrismaClient();

interface SocketUser {
  id: string;
  userId?: number;
  userRole?: string;
}

export const initializeSocket = (io: Server) => {
  // Store connected users
  const connectedUsers = new Map<string, SocketUser>();
  
  // Initialize notification service
  const notificationService = new NotificationService(io);

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (userData) => {
      connectedUsers.set(socket.id, {
        id: socket.id,
        userId: userData.userId,
        userRole: userData.userRole
      });
      
      // Register user for notifications
      notificationService.registerUser(socket.id, userData.userId, userData.userRole);
      
      // Join user to their specific room
      socket.join(`user_${userData.userId}`);
      
      console.log(`✅ User authenticated: ${userData.userId} (${userData.userRole})`);
    });

    // Handle joining parking lot updates
    socket.on('join_parking_updates', (data) => {
      const { parkingLotId } = data;
      socket.join(`parking_${parkingLotId}`);
      console.log(`🅿️ User joined parking lot updates: ${parkingLotId}`);
    });

    // Handle leaving parking lot updates
    socket.on('leave_parking_updates', (data) => {
      const { parkingLotId } = data;
      socket.leave(`parking_${parkingLotId}`);
      console.log(`🚪 User left parking lot updates: ${parkingLotId}`);
    });

    // Handle parking space updates (owners only)
    socket.on('update_parking_spaces', async (data) => {
      const user = connectedUsers.get(socket.id);
      
      if (!user || user.userRole !== 'OWNER') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      try {
        const { parkingLotId, availableSpaces } = data;
        
        // Update parking lot in database
        const parkingLot = await prisma.parkingLot.findUnique({
          where: { id: parkingLotId }
        });

        if (!parkingLot || parkingLot.ownerId !== user.userId) {
          socket.emit('error', { message: 'Parking lot not found or unauthorized' });
          return;
        }

        if (availableSpaces > parkingLot.totalSpaces) {
          socket.emit('error', { message: 'Available spaces cannot exceed total spaces' });
          return;
        }

        const updatedParkingLot = await prisma.parkingLot.update({
          where: { id: parkingLotId },
          data: { availableSpaces }
        });

        // Create audit record
        await prisma.parkingUpdate.create({
          data: {
            parkingLotId,
            previousSpaces: parkingLot.availableSpaces,
            newSpaces: availableSpaces
          }
        });

        // Broadcast update to all users watching this parking lot
        io.to(`parking_${parkingLotId}`).emit('parking_spaces_updated', {
          parkingLotId,
          availableSpaces,
          totalSpaces: updatedParkingLot.totalSpaces,
          updatedAt: new Date().toISOString()
        });

        // Send confirmation to the owner
        socket.emit('parking_update_success', {
          parkingLotId,
          availableSpaces
        });

        console.log(`📊 Parking spaces updated: Lot ${parkingLotId} -> ${availableSpaces} spaces`);

      } catch (error) {
        console.error('Error updating parking spaces:', error);
        socket.emit('error', { message: 'Failed to update parking spaces' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      notificationService.unregisterUser(socket.id);
      connectedUsers.delete(socket.id);
    });

    // Handle notification mark as read
    socket.on('mark_notification_read', async (data) => {
      try {
        const { notificationId } = data;
        await notificationService.markAsRead(notificationId);
        socket.emit('notification_marked_read', { notificationId });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Handle get user notifications
    socket.on('get_notifications', async (data) => {
      try {
        const user = connectedUsers.get(socket.id);
        console.log('📧 Getting notifications for user:', user);
        
        if (!user?.userId) {
          console.log('❌ User not authenticated for notifications');
          socket.emit('error', { message: 'User not authenticated' });
          return;
        }

        const { limit = 20 } = data;
        console.log('📧 Fetching notifications for user:', user.userId, 'limit:', limit);
        const notifications = await notificationService.getUserNotifications(user.userId, limit);
        console.log('📧 Found notifications:', notifications.length);
        socket.emit('notifications_loaded', { notifications });
      } catch (error) {
        console.error('Error fetching notifications:', error);
        socket.emit('error', { message: 'Failed to fetch notifications' });
      }
    });
  });

  // Return both io and notification service for use in routes
  return { io, notificationService };
};

// Function to broadcast parking lot updates
export const broadcastParkingUpdate = (io: Server, parkingLotId: number, updateData: any) => {
  io.to(`parking_${parkingLotId}`).emit('parking_spaces_updated', updateData);
};
