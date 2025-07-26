// === IMPORTACIONES DE LIBRERÍAS ===
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

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
  credentials: true
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
    endpoints: ['/health', '/api', '/api/auth/*', '/api/parking/*']
  });
});

// === MOCK API ENDPOINTS ===
// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  res.status(503).json({ 
    status: 'error',
    message: 'Registration temporarily unavailable - Database not configured',
    code: 'SERVICE_UNAVAILABLE'
  });
});

app.post('/api/auth/login', (req, res) => {
  res.status(503).json({ 
    status: 'error',
    message: 'Login temporarily unavailable - Database not configured',
    code: 'SERVICE_UNAVAILABLE'
  });
});

app.post('/api/auth/refresh', (req, res) => {
  res.status(503).json({ 
    status: 'error',
    message: 'Token refresh temporarily unavailable',
    code: 'SERVICE_UNAVAILABLE'
  });
});

// Parking endpoints
app.get('/api/parking', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Mock parking data - Database not configured',
    data: {
      parkingLots: [],
      pagination: { page: 1, pages: 0, total: 0 }
    }
  });
});

app.get('/api/parking/:id', (req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Parking lot not found - Database not configured',
    code: 'NOT_FOUND'
  });
});

app.get('/api/parking/owner/my-lots', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Mock owner data - Database not configured',
    data: { parkingLots: [] }
  });
});

app.post('/api/parking', (req, res) => {
  res.status(503).json({ 
    status: 'error',
    message: 'Creating parking lots temporarily unavailable',
    code: 'SERVICE_UNAVAILABLE'
  });
});

// Test notifications endpoint
app.get('/api/test-notifications/test', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Mock notifications - Database not configured',
    data: {
      notifications: [
        {
          id: '1',
          title: 'Sistema en Mantenimiento',
          message: 'La aplicación está temporalmente en modo de mantenimiento. Las funcionalidades completas estarán disponibles próximamente.',
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false
        }
      ]
    }
  });
});

// Catch all other API routes
app.all('/api/*', (req, res) => {
  res.status(503).json({ 
    message: 'API endpoint temporarily in maintenance mode',
    endpoint: req.path,
    method: req.method,
    note: 'Database and full backend functionality not yet configured for production'
  });
});

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
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎯 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel serverless
export default app;