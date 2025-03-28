/**
 * 🔐 Middleware de Autenticación y Autorización - ParqueoAPP
 * 
 * Este middleware maneja la autenticación basada en JWT y la autorización
 * basada en roles para proteger las rutas de la API.
 * 
 * Funcionalidades:
 * - Verificación de tokens JWT
 * - Validación de usuarios en base de datos
 * - Control de acceso basado en roles (RBAC)
 * - Logging de seguridad para auditoría
 * 
 * @author ParqueoAPP Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authLogger } from '../utils/logger';

// Instancia de Prisma para consultas a la base de datos
const prisma = new PrismaClient();

/**
 * Interfaz extendida de Request que incluye información del usuario autenticado
 * Facilita el acceso a los datos del usuario en los controladores
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

/**
 * Extensión global del namespace Express para TypeScript
 * Permite el acceso tipado a req.user en toda la aplicación
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware de Autenticación
 * 
 * Verifica que el usuario tenga un token JWT válido y que el usuario
 * exista en la base de datos. Añade la información del usuario al objeto request.
 * 
 * @param req - Request extendido con información de usuario
 * @param res - Response object
 * @param next - Función para continuar al siguiente middleware
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // === VALIDACIÓN DEL HEADER DE AUTORIZACIÓN ===
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      authLogger.security('Intento de acceso sin header de autorización', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });
      return res.status(401).json({
        status: 'error',
        message: 'Token de acceso requerido'
      });
    }

    // === EXTRACCIÓN DEL TOKEN ===
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      authLogger.security('Header de autorización sin token válido', { 
        ip: req.ip, 
        authHeader: authHeader.substring(0, 20) + '...' 
      });
      return res.status(401).json({
        status: 'error',
        message: 'Token de acceso requerido'
      });
    }

    // Logging de seguridad - Solo primeros caracteres del token por seguridad
    authLogger.debug('Token recibido para validación', { tokenPrefix: token.substring(0, 20) + '...' });

    // === VERIFICACIÓN DE CONFIGURACIÓN ===
    if (!process.env.JWT_SECRET) {
      authLogger.error('JWT_SECRET no configurado en variables de entorno', new Error('Missing JWT_SECRET'));
      return res.status(500).json({
        status: 'error',
        message: 'Error de configuración del servidor'
      });
    }

    // === VERIFICACIÓN Y DECODIFICACIÓN DEL TOKEN ===
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    authLogger.debug('Token decodificado exitosamente', { userId: decoded.id });

    // === VALIDACIÓN DEL USUARIO EN BASE DE DATOS ===
    /**
     * Verificamos que el usuario del token aún existe en la base de datos
     * Esto es importante para casos donde el usuario fue eliminado después
     * de la emisión del token
     */
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        role: true 
      }
    });

    if (!user) {
      authLogger.security('Usuario no encontrado en base de datos para token válido', { 
        tokenUserId: decoded.id,
        ip: req.ip 
      });
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido'
      });
    }

    // Logging exitoso de autenticación
    authLogger.info('Usuario autenticado exitosamente', { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    // Agregar información del usuario al request para uso en controladores
    req.user = user;
    next();

  } catch (error) {
    // === MANEJO DE ERRORES DE AUTENTICACIÓN ===
    authLogger.error('Error en proceso de autenticación', error);
    
    // Determinar tipo de error para respuesta apropiada
    if (error instanceof jwt.JsonWebTokenError) {
      authLogger.security('Token JWT malformado o inválido detectado', { 
        error: error.message,
        ip: req.ip 
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      authLogger.security('Token JWT expirado detectado', { 
        error: error.message,
        ip: req.ip 
      });
    }
    
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware de Autorización (Control de Acceso Basado en Roles)
 * 
 * Verifica que el usuario autenticado tenga los permisos necesarios
 * para acceder a un recurso específico basado en su rol.
 * 
 * Principio KISS: Simple verificación de roles sin complicaciones adicionales
 * 
 * @param roles - Array de roles permitidos para acceder al recurso
 * @returns Middleware function para usar en rutas protegidas
 * 
 * @example
 * // Solo propietarios pueden crear estacionamientos
 * router.post('/parking', authenticate, authorize(['OWNER']), createParking);
 * 
 * // Solo conductores pueden hacer reservas
 * router.post('/bookings', authenticate, authorize(['DRIVER']), createBooking);
 * 
 * // Administradores y propietarios pueden ver estadísticas
 * router.get('/stats', authenticate, authorize(['ADMIN', 'OWNER']), getStats);
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // === VERIFICACIÓN DE AUTENTICACIÓN PREVIA ===
    if (!req.user) {
      authLogger.security('Intento de autorización sin autenticación previa', { 
        ip: req.ip,
        route: req.path 
      });
      return res.status(401).json({
        status: 'error',
        message: 'Autenticación requerida'
      });
    }

    // === VERIFICACIÓN DE PERMISOS POR ROL ===
    if (!roles.includes(req.user.role)) {
      authLogger.security('Acceso denegado por rol insuficiente', { 
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        route: req.path,
        ip: req.ip 
      });
      return res.status(403).json({
        status: 'error',
        message: 'Permisos insuficientes para acceder a este recurso'
      });
    }

    // Logging exitoso de autorización
    authLogger.audit('Acceso autorizado a recurso protegido', { 
      route: req.path,
      method: req.method,
      userRole: req.user.role,
      allowedRoles: roles 
    }, { userId: req.user.id });
    
    next();
  };
};
