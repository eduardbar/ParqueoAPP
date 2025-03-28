import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationPayload {
  id: string;
  type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED' | 'PAYMENT_PROCESSED' | 'PARKING_UPDATED';
  title: string;
  message: string;
  data?: any;
}

class NotificationService {
  private io: Server;
  private connectedUsers: Map<string, { userId: number; userRole: string }>;

  constructor(io: Server) {
    this.io = io;
    this.connectedUsers = new Map();
  }

  // Register a connected user
  registerUser(socketId: string, userId: number, userRole: string) {
    this.connectedUsers.set(socketId, { userId, userRole });
    console.log(`📱 User registered for notifications: ${userId} (${userRole})`);
  }

  // Unregister a disconnected user
  unregisterUser(socketId: string) {
    this.connectedUsers.delete(socketId);
    console.log(`📴 User unregistered from notifications`);
  }

  // Send notification to specific user
  async sendToUser(userId: number, notification: NotificationPayload) {
    const fullNotification = {
      ...notification,
      userId,
      timestamp: new Date(),
      read: false
    };

    // Store notification in database
    await this.storeNotification(fullNotification);

    // Send real-time notification to connected user
    this.io.to(`user_${userId}`).emit('notification', fullNotification);
    
    console.log(`📬 Notification sent to user ${userId}: ${notification.title}`);
  }

  // Send notification to all users with specific role
  async sendToRole(userRole: string, notification: NotificationPayload) {
    const users = await prisma.user.findMany({
      where: { role: userRole as any },
      select: { id: true }
    });

    for (const user of users) {
      await this.sendToUser(user.id, notification);
    }
  }

  // Send notification to parking lot owner
  async sendToOwner(parkingLotId: number, notification: NotificationPayload) {
    const parkingLot = await prisma.parkingLot.findUnique({
      where: { id: parkingLotId },
      include: { owner: true }
    });

    if (parkingLot?.owner) {
      await this.sendToUser(parkingLot.owner.id, notification);
    }
  }

  // Store notification in database
  private async storeNotification(notification: NotificationPayload & { userId: number; timestamp: Date; read: boolean }) {
    try {
      await prisma.notification.create({
        data: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          userId: notification.userId,
          data: notification.data ? JSON.stringify(notification.data) : null,
          read: false
        }
      });
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  // Get user notifications
  async getUserNotifications(userId: number, limit: number = 20) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }

  // Booking-related notifications
  async notifyBookingCreated(bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        parkingLot: {
          include: { owner: true }
        }
      }
    });

    if (!booking) return;

    // Notify parking lot owner
    await this.sendToUser(booking.parkingLot.owner.id, {
      id: `booking_created_${bookingId}`,
      type: 'BOOKING_CREATED',
      title: 'New Booking Request',
      message: `${booking.user.name} has requested to book ${booking.parkingLot.name}`,
      data: {
        bookingId: bookingId,
        parkingLotId: booking.parkingLot.id,
        userId: booking.user.id
      }
    });

    // Notify customer
    await this.sendToUser(booking.user.id, {
      id: `booking_pending_${bookingId}`,
      type: 'BOOKING_CREATED',
      title: 'Booking Request Submitted',
      message: `Your booking request for ${booking.parkingLot.name} is pending approval`,
      data: {
        bookingId: bookingId,
        parkingLotId: booking.parkingLot.id
      }
    });
  }

  async notifyBookingStatusChanged(bookingId: number, newStatus: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        parkingLot: {
          include: { owner: true }
        }
      }
    });

    if (!booking) return;

    const statusMessages = {
      CONFIRMED: 'Your booking has been confirmed!',
      CANCELLED: 'Your booking has been cancelled.',
      COMPLETED: 'Your booking has been completed.'
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] || 'Your booking status has been updated.';

    const notificationTypes = {
      CONFIRMED: 'BOOKING_CONFIRMED',
      CANCELLED: 'BOOKING_CANCELLED',
      COMPLETED: 'BOOKING_COMPLETED'
    };

    const notificationType = notificationTypes[newStatus as keyof typeof notificationTypes] || 'BOOKING_CONFIRMED';

    // Notify customer
    await this.sendToUser(booking.user.id, {
      id: `booking_status_${bookingId}_${newStatus}`,
      type: notificationType as any,
      title: 'Booking Status Updated',
      message: `${message} (${booking.parkingLot.name})`,
      data: {
        bookingId: bookingId,
        parkingLotId: booking.parkingLot.id,
        newStatus: newStatus
      }
    });
  }

  // Parking lot update notifications
  async notifyParkingUpdate(parkingLotId: number, updateType: string, data: any) {
    const parkingLot = await prisma.parkingLot.findUnique({
      where: { id: parkingLotId },
      include: { owner: true }
    });

    if (!parkingLot) return;

    // Notify all users in the parking lot room
    this.io.to(`parking_${parkingLotId}`).emit('parking_update', {
      type: updateType,
      parkingLotId: parkingLotId,
      data: data,
      timestamp: new Date()
    });
  }

  // Payment notifications
  async notifyPaymentProcessed(bookingId: number, amount: number, paymentMethod: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        parkingLot: {
          include: { owner: true }
        }
      }
    });

    if (!booking) return;

    // Notify customer
    await this.sendToUser(booking.user.id, {
      id: `payment_processed_${bookingId}`,
      type: 'PAYMENT_PROCESSED',
      title: 'Payment Processed',
      message: `Payment of $${amount} processed successfully for ${booking.parkingLot.name}`,
      data: {
        bookingId: bookingId,
        amount: amount,
        paymentMethod: paymentMethod
      }
    });

    // Notify owner
    await this.sendToUser(booking.parkingLot.owner.id, {
      id: `payment_received_${bookingId}`,
      type: 'PAYMENT_PROCESSED',
      title: 'Payment Received',
      message: `Payment of $${amount} received for booking at ${booking.parkingLot.name}`,
      data: {
        bookingId: bookingId,
        amount: amount,
        paymentMethod: paymentMethod
      }
    });
  }
}

export default NotificationService;
