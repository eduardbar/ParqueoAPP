// ...existing code...

// Endpoint de health check (después de declarar app)
// Esto permite verificar si el backend está corriendo en producción
/**
 * 🅿️ ParqueoAPP - Servidor Principal
 * 
 * Servidor Express.js con TypeScript que gestiona el sistema de estacionamientos.
 * Implementa autenticación JWT, pagos con Stripe, notificaciones en tiempo real
 * con Socket.IO y una API RESTful completa.
 * 
 * @author ParqueoAPP Team
 * @version 1.0.0
 * @description Sistema integral de gestión de estacionamientos con funcionalidades avanzadas
 */

// === IMPORTACIONES DE LIBRERÍAS ===
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// === IMPORTACIONES LOCALES ===
// Middleware personalizado
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Rutas de la API
import authRoutes from './routes/auth';           // Autenticación y autorización
import userRoutes from './routes/users';         // Gestión de usuarios
import parkingRoutes from './routes/parking';    // Gestión de estacionamientos
import bookingRoutes from './routes/bookings';   // Gestión de reservas
import reviewRoutes from './routes/reviews';     // Sistema de calificaciones
import searchRoutes from './routes/search';      // Búsqueda avanzada
import notificationRoutes from './routes/notifications';     // Notificaciones
import testNotificationRoutes from './routes/testNotifications'; // Testing
import profileRoutes from './routes/profile';    // Perfiles de usuario
import quickFixRoutes from './routes/quick-fix'; // Soluciones rápidas
import { createPaymentRoutes } from './routes/paymentRoutes'; // Pagos con Stripe

// Servicios de tiempo real
import { initializeSocket } from './socket/socketHandler';

// Cargar variables de entorno desde archivo .env
dotenv.config();

// === CONFIGURACIÓN DEL SERVIDOR ===
const app = express();
const server = createServer(app);

// Configuración de Socket.IO para comunicación en tiempo real
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// === CONFIGURACIÓN DE SEGURIDAD Y RENDIMIENTO ===

/**
 * Limitador de tasa de peticiones
 * Protege contra ataques de fuerza bruta y spam
 */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // máximo 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP, inténtalo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// === MIDDLEWARE DE LA APLICACIÓN ===
// Seguridad: Headers de seguridad HTTP
app.use(helmet());

// CORS: Permitir peticiones desde el frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Compresión: Mejora el rendimiento
app.use(compression());

// Logging: Registro de peticiones HTTP
app.use(morgan('combined'));

// Rate limiting: Aplicar limitación de tasa
app.use(limiter);

// Parseo de datos: JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos: Servir imágenes de perfil y uploads
app.use('/uploads', express.static('uploads'));

// === ENDPOINT DE SALUD ===
/**
 * Endpoint para verificar el estado del servidor
 * Útil para monitoreo y health checks en producción
 */
// Health check endpoint

// Endpoint raíz ("/") para mensaje de bienvenida
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Bienvenido a la API de ParqueoAPP',
    docs: 'Consulta /health para estado o /api para endpoints.'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API ParqueoAPP funcionando' });
});

// === RUTAS DE LA API ===
// Configuración modular de rutas por funcionalidad
app.use('/api/quick-fix', quickFixRoutes);        // Soluciones rápidas de desarrollo
app.use('/api/auth', authRoutes);                 // Autenticación y autorización
app.use('/api/users', userRoutes);                // Gestión de usuarios
app.use('/api/parking', parkingRoutes);           // Gestión de estacionamientos
app.use('/api/bookings', bookingRoutes);          // Gestión de reservas
app.use('/api/reviews', reviewRoutes);            // Sistema de calificaciones
app.use('/api/search', searchRoutes);             // Búsqueda avanzada
app.use('/api/notifications', notificationRoutes); // Notificaciones
app.use('/api/test-notifications', testNotificationRoutes); // Testing de notificaciones
app.use('/api/profile', profileRoutes);           // Perfiles de usuario
app.use('/api/payments', createPaymentRoutes(io)); // Procesamiento de pagos con Stripe

// === INICIALIZACIÓN DE SOCKET.IO ===
/**
 * Configuración del servicio de tiempo real
 * Maneja notificaciones, actualizaciones de estado y comunicación bidireccional
 */
const { io: socketIo, notificationService } = initializeSocket(io);

// === SERVICIO DE NOTIFICACIONES GLOBAL ===
/**
 * Registro del servicio de notificaciones como variable global
 * Permite acceso desde cualquier parte de la aplicación para enviar notificaciones
 */
declare global {
  var notificationService: any;
}
global.notificationService = notificationService;

// === MIDDLEWARE DE MANEJO DE ERRORES ===
// Importante: Los middleware de error deben estar al final
app.use(notFoundHandler);  // Maneja rutas no encontradas (404)
app.use(errorHandler);     // Maneja errores del servidor (500+)

// === INICIALIZACIÓN DEL SERVIDOR ===
const PORT = process.env.PORT || 5000;

/**
 * Inicia el servidor HTTP con Socket.IO
 * Muestra información útil de estado en la consola
 */
server.listen(PORT, () => {
  console.log(`🚀 Servidor ParqueoAPP ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Socket.IO habilitado para tiempo real`);
  console.log(`💳 Integración con Stripe activa`);
  console.log(`🔐 Seguridad y rate limiting configurados`);
  console.log(`📊 Logging y monitoreo activos`);
  console.log(`\n🎯 API disponible en: http://localhost:${PORT}/health`);
});

// Exportar instancias para testing y uso externo
export { app, server, io };