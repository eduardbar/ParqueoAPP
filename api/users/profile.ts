import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPrismaClient } from '../lib/prisma';

const jwt = require('jsonwebtoken');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuración CORS para aceptar el dominio principal de Vercel
  const allowedOrigins = [
    'https://parqueo-app-col.vercel.app',
    'https://parqueo-hdp7lap3q-eduardbars-projects.vercel.app'
  ];
  
  const origin = req.headers.origin;
  const allowedOrigin = (origin && allowedOrigins.includes(origin)) ? origin : 'https://parqueo-app-col.vercel.app';
    
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify authorization token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Token de autorización requerido' 
    });
  }

  // Verify JWT secret exists
  if (!process.env.JWT_SECRET) {
    console.error('JWT secret not configured');
    return res.status(500).json({
      status: 'error',
      message: 'Error de configuración del servidor'
    });
  }

  const token = authHeader.substring(7);
  let decoded;
  
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Token inválido' 
    });
  }

  try {
    // Get Prisma client (optimized for serverless)
    const prisma = getPrismaClient();

    if (req.method === 'GET') {
      // Get user profile
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Usuario no encontrado' 
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { user }
      });

    } else if (req.method === 'PUT') {
      // Update user profile
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'El nombre es requerido' 
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          name: name.trim()
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      return res.status(200).json({
        status: 'success',
        message: 'Perfil actualizado exitosamente',
        data: { user: updatedUser }
      });

    } else {
      return res.status(405).json({ 
        status: 'error', 
        message: 'Método no permitido' 
      });
    }

  } catch (error) {
    console.error('Error en perfil de usuario:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Error interno del servidor' 
    });
  }
}
