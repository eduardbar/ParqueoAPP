import { VercelResponse } from '@vercel/node';

/**
 * Configuración CORS centralizada basada en la documentación de Vercel
 * https://vercel.com/guides/how-to-enable-cors
 */
export function setCorsHeaders(res: VercelResponse, methods: string = 'GET, POST, PUT, DELETE, OPTIONS'): void {
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? 'https://parqueo-app-col.vercel.app' 
    : '*';
    
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
}

/**
 * Maneja las requests OPTIONS (preflight)
 */
export function handleCorsPrelight(res: VercelResponse, methods?: string): boolean {
  setCorsHeaders(res, methods);
  res.status(200).end();
  return true;
}
