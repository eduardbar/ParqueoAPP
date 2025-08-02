import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPrismaClient } from '../lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      status: 'error', 
      message: 'Método no permitido' 
    });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'ID del estacionamiento es requerido' 
      });
    }

    // Get Prisma client (optimized for serverless)
    const prisma = getPrismaClient();

    const parkingLot = await prisma.parkingLot.findUnique({
      where: { 
        id: parseInt(id as string),
        isActive: true 
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Últimas 10 reseñas
        }
      }
    });

    if (!parkingLot) {
      return res.status(404).json({ error: 'Estacionamiento no encontrado' });
    }

    return res.status(200).json({
      status: 'success',
      data: { parkingLot }
    });

  } catch (error) {
    console.error('Error obteniendo estacionamiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
