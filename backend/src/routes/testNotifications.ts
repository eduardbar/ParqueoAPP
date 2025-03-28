import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Simple test endpoint without authentication
router.get('/test', async (req, res) => {
  try {
    console.log('📧 ===== TEST ENDPOINT CALLED =====');
    console.log('📧 Request headers:', req.headers);
    console.log('📧 Request origin:', req.get('Origin'));
    
    const notifications = await prisma.notification.findMany({
      where: { userId: 2 }, // Carlos
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('📧 Found notifications:', notifications.length);
    console.log('📧 Notifications:', notifications.map(n => ({ id: n.id, title: n.title })));
    
    res.json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    console.error('📧 Error in test endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications'
    });
  }
});

export default router;
