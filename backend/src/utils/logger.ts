/**
 * 📝 Servicio de Logging Profesional - ParqueoAPP
 * 
 * Sistema centralizado de logging que proporciona:
 * - Diferentes niveles de log (DEBUG, INFO, WARN, ERROR)
 * - Formato consistente con timestamps y contexto
 * - Colores para mejor legibilidad en desarrollo
 * - Preparado para integración con servicios externos (Sentry, LogRocket)
 * 
 * Principios aplicados:
 * - KISS: Interfaz simple y clara
 * - Extensible: Fácil agregar nuevos transportes
 * - Configurable: Diferentes niveles según entorno
 * 
 * @author ParqueoAPP Team
 * @version 1.0.0
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  userId?: number;
  requestId?: string;
}

class Logger {
  private environment: string;
  private colors = {
    DEBUG: '\x1b[36m', // Cyan
    INFO: '\x1b[32m',  // Green
    WARN: '\x1b[33m',  // Yellow
    ERROR: '\x1b[31m', // Red
    RESET: '\x1b[0m'   // Reset
  };

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Registra un mensaje de debug
   * Usado para información detallada durante desarrollo
   */
  debug(module: string, message: string, data?: any, context?: { userId?: number; requestId?: string }) {
    this.log('DEBUG', module, message, data, context);
  }

  /**
   * Registra un mensaje informativo
   * Usado para eventos importantes del sistema
   */
  info(module: string, message: string, data?: any, context?: { userId?: number; requestId?: string }) {
    this.log('INFO', module, message, data, context);
  }

  /**
   * Registra una advertencia
   * Usado para situaciones que requieren atención pero no son errores
   */
  warn(module: string, message: string, data?: any, context?: { userId?: number; requestId?: string }) {
    this.log('WARN', module, message, data, context);
  }

  /**
   * Registra un error
   * Usado para errores que afectan la funcionalidad
   */
  error(module: string, message: string, error?: Error | any, context?: { userId?: number; requestId?: string }) {
    this.log('ERROR', module, message, error, context);
  }

  /**
   * Método principal de logging
   * Formatea y envía el log según la configuración
   */
  private log(level: LogLevel, module: string, message: string, data?: any, context?: { userId?: number; requestId?: string }) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      userId: context?.userId,
      requestId: context?.requestId
    };

    // En desarrollo, mostrar logs con colores en consola
    if (this.environment === 'development') {
      this.logToConsole(logEntry);
    }

    // En producción, enviar a servicio de logging externo
    if (this.environment === 'production') {
      this.logToExternalService(logEntry);
    }

    // Persistir logs críticos
    if (level === 'ERROR') {
      this.persistCriticalLog(logEntry);
    }
  }

  /**
   * Muestra el log en consola con formato y colores
   */
  private logToConsole(entry: LogEntry) {
    const color = this.colors[entry.level];
    const reset = this.colors.RESET;
    
    let logMessage = `${color}[${entry.level}]${reset} ${entry.timestamp} [${entry.module}] ${entry.message}`;
    
    if (entry.userId) {
      logMessage += ` (User: ${entry.userId})`;
    }
    
    if (entry.requestId) {
      logMessage += ` (Request: ${entry.requestId})`;
    }

    console.log(logMessage);
    
    if (entry.data) {
      console.log(`${color}Data:${reset}`, entry.data);
    }
  }

  /**
   * Envía logs a servicio externo (Sentry, LogRocket, etc.)
   * TODO: Implementar integración según necesidades
   */
  private logToExternalService(entry: LogEntry) {
    // Ejemplo de integración con Sentry
    // if (entry.level === 'ERROR') {
    //   Sentry.captureException(new Error(entry.message), {
    //     tags: { module: entry.module },
    //     extra: entry.data,
    //     user: entry.userId ? { id: entry.userId } : undefined
    //   });
    // }
  }

  /**
   * Persiste logs críticos para auditoría
   * TODO: Implementar persistencia en base de datos o archivo
   */
  private persistCriticalLog(entry: LogEntry) {
    // Ejemplo de persistencia
    // await logRepository.save(entry);
  }

  /**
   * Crea un logger específico para un módulo
   * Facilita el tracking por contexto
   */
  createModuleLogger(moduleName: string) {
    return {
      debug: (message: string, data?: any, context?: { userId?: number; requestId?: string }) => 
        this.debug(moduleName, message, data, context),
      info: (message: string, data?: any, context?: { userId?: number; requestId?: string }) => 
        this.info(moduleName, message, data, context),
      warn: (message: string, data?: any, context?: { userId?: number; requestId?: string }) => 
        this.warn(moduleName, message, data, context),
      error: (message: string, error?: Error | any, context?: { userId?: number; requestId?: string }) => 
        this.error(moduleName, message, error, context),
      performance: (operation: string, duration: number, context?: { userId?: number; requestId?: string }) => 
        this.performance(moduleName, operation, duration, context),
      security: (event: string, details: any, context?: { userId?: number; requestId?: string }) => 
        this.security(moduleName, event, details, context),
      audit: (action: string, details: any, context: { userId: number; requestId?: string }) => 
        this.audit(moduleName, action, details, context)
    };
  }

  /**
   * Registra métricas de rendimiento
   */
  performance(module: string, operation: string, duration: number, context?: { userId?: number; requestId?: string }) {
    this.info(module, `Performance: ${operation} completado en ${duration}ms`, { duration, operation }, context);
  }

  /**
   * Registra eventos de seguridad
   */
  security(module: string, event: string, details: any, context?: { userId?: number; requestId?: string }) {
    this.warn(module, `Security Event: ${event}`, details, context);
  }

  /**
   * Registra eventos de auditoría
   */
  audit(module: string, action: string, details: any, context: { userId: number; requestId?: string }) {
    this.info(module, `Audit: ${action}`, details, context);
  }
}

// Instancia singleton del logger
const logger = new Logger();

// Loggers específicos por módulo para fácil uso
export const authLogger = logger.createModuleLogger('AUTH');
export const paymentLogger = logger.createModuleLogger('PAYMENT');
export const bookingLogger = logger.createModuleLogger('BOOKING');
export const notificationLogger = logger.createModuleLogger('NOTIFICATION');
export const apiLogger = logger.createModuleLogger('API');
export const dbLogger = logger.createModuleLogger('DATABASE');

export default logger;
