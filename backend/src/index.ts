// === IMPORTACIONES DE LIBRERÍAS ===
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// === IMPORTACIONES DE RUTAS ===
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import parkingRoutes from './routes/parking';
import bookingRoutes from './routes/bookings';
import notificationRoutes from './routes/notifications';
import profileRoutes from './routes/profile';
import reviewRoutes from './routes/reviews';
import searchRoutes from './routes/search';
import testNotificationRoutes from './routes/testNotifications';
import quickFixRoutes from './routes/quick-fix';

// Cargar variables de entorno
dotenv.config();

// === CONFIGURACIÓN DE LA APLICACIÓN ===
const app = express();
const PORT = process.env.PORT || 5000;

// === MIDDLEWARE BÁSICO ===
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// === RUTAS BÁSICAS ===
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ParqueoAPP Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '🅿️ Welcome to ParqueoAPP API',
    version: '1.0.0',
    status: 'running'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'ParqueoAPP API',
    version: '1.0.0',
    status: 'active',
    database: 'connected',
    endpoints: {
      auth: ['/api/auth/register', '/api/auth/login', '/api/auth/refresh'],
      parking: ['/api/parking', '/api/parking/:id'],
      bookings: ['/api/bookings', '/api/bookings/:id'],
      profile: ['/api/profile', '/api/profile/update'],
      notifications: ['/api/notifications'],
      search: ['/api/search/parking'],
      reviews: ['/api/reviews']
    }
  });
});

// === REGISTRO DE RUTAS DEL API ===
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/test-notifications', testNotificationRoutes);
app.use('/api/quick-fix', quickFixRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.originalUrl,
    message: 'Endpoint not found'
  });
});

// Start server (only in non-serverless environments)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎯 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel serverless
export default app;