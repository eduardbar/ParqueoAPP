import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/notifications - Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📧 Notifications endpoint called');
    console.log('📧 User from request:', req.user);
    
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    
    console.log('📧 Fetching notifications for user:', userId, 'limit:', limit);
    
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    console.log('📧 Found notifications:', notifications.length);
    
    res.json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications'
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const notification = await prisma.notification.findUnique({
      where: { id }
    });
    
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }
    
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    
    res.json({
      status: 'success',
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as read'
    });
  }
});

export default router;
