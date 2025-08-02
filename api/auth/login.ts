import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPrismaClient } from '../lib/prisma';

const bcrypt = require('bcryptjs');
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error', 
      message: 'Método no permitido' 
    });
  }

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Get Prisma client (optimized for serverless)
    const prisma = getPrismaClient();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Credenciales inválidas' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Credenciales inválidas' 
      });
    }

    // Verify JWT secrets exist
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error('JWT secrets not configured');
      return res.status(500).json({
        status: 'error',
        message: 'Error de configuración del servidor'
      });
    }

    // Generate JWT tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Success response
    return res.status(200).json({
      status: 'success',
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt.toISOString()
        },
        accessToken: token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Error interno del servidor' 
    });
  }
}
