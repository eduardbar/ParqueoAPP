import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPrismaClient } from '../lib/prisma';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuración CORS específica para el dominio de Vercel
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? 'https://parqueo-app-col.vercel.app' 
    : '*';
    
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
    const { name, email, password, role = 'DRIVER' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Nombre, email y contraseña son requeridos' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Formato de email inválido' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Validate role
    if (role && !['DRIVER', 'OWNER'].includes(role)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Rol inválido' 
      });
    }

    // Get Prisma client (optimized for serverless)
    const prisma = getPrismaClient();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({ 
        status: 'error', 
        message: 'El usuario ya existe' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role === 'OWNER' ? 'OWNER' : 'DRIVER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

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
    return res.status(201).json({
      status: 'success',
      message: 'Usuario creado exitosamente',
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
    console.error('Error en registro:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Error interno del servidor' 
    });
  }
}
