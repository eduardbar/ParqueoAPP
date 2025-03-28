import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Endpoint simple para resetear y poblar datos básicos
router.post('/reset-demo', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Resetting demo data...');

    // Crear usuario de prueba simple si no existe
    const testUser = await prisma.user.upsert({
      where: { email: 'demo@test.com' },
      update: {},
      create: {
        email: 'demo@test.com',
        password: '$2b$10$rQZ8vQZ8vQZ8vQZ8vQZ8vOvQZ8vQZ8vQZ8vQZ8vQZ8vQZ8vQZ8vQZ8', // password123
        name: 'Demo User',
        role: 'DRIVER'
      }
    });

    // Crear propietario de prueba
    const ownerUser = await prisma.user.upsert({
      where: { email: 'owner@test.com' },
      update: {},
      create: {
        email: 'owner@test.com',
        password: '$2b$10$rQZ8vQZ8vQZ8vQZ8vQZ8vOvQZ8vQZ8vQZ8vQZ8vQZ8vQZ8vQZ8vQZ8', // password123
        name: 'Demo Owner',
        role: 'OWNER'
      }
    });

    console.log('✅ Demo users created');

    res.status(200).json({
      success: true,
      message: 'Demo data reset successfully',
      users: [
        { email: 'demo@test.com', password: 'password123', role: 'DRIVER' },
        { email: 'owner@test.com', password: 'password123', role: 'OWNER' }
      ]
    });

  } catch (error) {
    console.error('❌ Reset demo error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset demo data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint simple para probar conexión
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Backend is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
