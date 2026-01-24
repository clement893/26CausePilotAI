/**
 * Error Logger
 * 
 * Centralized error logging system for frontend.
 * Logs errors to console and can be extended to send to monitoring services.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  url?: string;
}

class ErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  log(level: LogLevel, message: string, error?: Error, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      error,
      context: {
        ...context,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      timestamp: new Date(),
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console
    const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                         level === LogLevel.WARN ? 'warn' : 
                         level === LogLevel.DEBUG ? 'debug' : 'info';
    
    if (error) {
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, error, context);
    } else {
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context);
    }

    // In production, you could send to monitoring service here
    if (process.env.NODE_ENV === 'production' && level === LogLevel.ERROR) {
      // Example: Send to Sentry, LogRocket, etc.
      // this.sendToMonitoringService(entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  warn(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, error, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, error, context);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Get error message for user-friendly display
  getUserFriendlyMessage(error: unknown): string {
    if (error instanceof Error) {
      // Check for common error patterns
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        return 'Erreur de connexion. Vérifiez votre connexion internet.';
      }
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return 'Session expirée. Veuillez vous reconnecter.';
      }
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
      }
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return 'Ressource introuvable.';
      }
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      }
      if (error.message.includes('database') || error.message.includes('migration')) {
        return 'Erreur de base de données. Les migrations peuvent être nécessaires.';
      }
      return error.message || 'Une erreur est survenue';
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Une erreur inattendue est survenue';
  }
}

export const errorLogger = new ErrorLogger();
