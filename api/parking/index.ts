import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPrismaClient } from '../lib/prisma';

const jwt = require('jsonwebtoken');

// Function to calculate distance between two geographic points (in km)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get Prisma client (optimized for serverless)
    const prisma = getPrismaClient();

    if (req.method === 'GET') {
      // Get all parking lots or filter by location
      const { lat, lng, radius } = req.query;

      const whereClause = {
        isActive: true
      };

      const parkingLots = await prisma.parkingLot.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          pricePerHour: true,
          totalSpaces: true,
          availableSpaces: true,
          operatingHours: true,
          amenities: true,
          averageRating: true,
          totalReviews: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Si se proporcionan coordenadas, filtrar por proximidad en el lado del servidor
      let filteredLots = parkingLots;
      if (lat && lng) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const searchRadius = radius ? parseFloat(radius as string) : 5; // 5km por defecto

        filteredLots = parkingLots.filter(lot => {
          const distance = getDistance(latitude, longitude, lot.latitude, lot.longitude);
          return distance <= searchRadius;
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { parkingLots }
      });

    } else if (req.method === 'POST') {
      // Crear nuevo estacionamiento (requiere autenticación)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autorización requerido' });
      }

      const token = authHeader.substring(7);
      let decoded;
      
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!);
      } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const {
        name,
        address,
        latitude,
        longitude,
        pricePerHour,
        totalSpaces,
        operatingHours,
        amenities
      } = req.body;

      // Validaciones
      if (!name || !address || !latitude || !longitude || !pricePerHour || !totalSpaces || !operatingHours) {
        return res.status(400).json({
          error: 'Todos los campos requeridos deben ser proporcionados'
        });
      }

      const newParkingLot = await prisma.parkingLot.create({
        data: {
          name,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          pricePerHour: parseFloat(pricePerHour),
          totalSpaces: parseInt(totalSpaces),
          availableSpaces: parseInt(totalSpaces), // Inicialmente todos disponibles
          operatingHours,
          amenities: amenities || null,
          ownerId: decoded.userId
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return res.status(201).json({
        status: 'success',
        message: 'Estacionamiento creado exitosamente',
        data: { parkingLot: newParkingLot }
      });

    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error en parking API:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
