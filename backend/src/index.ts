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
    endpoints: ['/health', '/api']
  });
});

// Catch all API routes (temporary)
app.all('/api/*', (req, res) => {
  res.status(503).json({ 
    message: 'API temporarily in maintenance mode',
    endpoint: req.path,
    method: req.method
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