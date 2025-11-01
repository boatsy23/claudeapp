/**
 * ERROR LOGGER
 * Production-ready error logging for PWA
 * Logs errors with context for debugging
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorLog {
  timestamp: string;
  severity: ErrorSeverity;
  component: string;
  message: string;
  details?: any;
  userAgent?: string;
  url?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  /**
   * Log an error with context
   */
  log(
    severity: ErrorSeverity,
    component: string,
    message: string,
    details?: any
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      severity,
      component,
      message,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Add to in-memory logs
    this.logs.push(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console logging with proper formatting
    const prefix = `[${severity.toUpperCase()}] [${component}]`;
    const style = this.getConsoleStyle(severity);

    if (details) {
      console.groupCollapsed(`%c${prefix} ${message}`, style);
      console.log('Details:', details);
      console.log('Timestamp:', errorLog.timestamp);
      console.log('URL:', errorLog.url);
      console.groupEnd();
    } else {
      console.log(`%c${prefix} ${message}`, style);
    }

    // In production, you would send critical errors to a logging service
    if (severity === 'critical') {
      this.sendToLoggingService(errorLog);
    }
  }

  /**
   * Get console style based on severity
   */
  private getConsoleStyle(severity: ErrorSeverity): string {
    const styles = {
      info: 'color: #3b82f6; font-weight: bold',
      warning: 'color: #f59e0b; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      critical: 'color: #dc2626; font-weight: bold; font-size: 14px',
    };
    return styles[severity];
  }

  /**
   * Send critical errors to logging service
   * Replace with your actual logging service (Sentry, LogRocket, etc.)
   */
  private sendToLoggingService(errorLog: ErrorLog): void {
    // TODO: Implement actual logging service integration
    console.warn('Critical error logged (would send to service):', errorLog);
    
    // Example: Send to backend API
    // fetch('/api/logs/error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog),
    // }).catch(err => console.error('Failed to send error log:', err));
  }

  /**
   * Get all logs (useful for debugging)
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    console.log('%c[ERROR LOGGER] Logs cleared', 'color: #22c55e; font-weight: bold');
  }

  /**
   * Download logs as JSON file (useful for bug reports)
   */
  downloadLogs(): void {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Convenience functions for common use cases
 */
export const logger = {
  info: (component: string, message: string, details?: any) => {
    errorLogger.log('info', component, message, details);
  },
  warning: (component: string, message: string, details?: any) => {
    errorLogger.log('warning', component, message, details);
  },
  error: (component: string, message: string, details?: any) => {
    errorLogger.log('error', component, message, details);
  },
  critical: (component: string, message: string, details?: any) => {
    errorLogger.log('critical', component, message, details);
  },
  apiError: (component: string, endpoint: string, error: any, statusCode?: number) => {
    errorLogger.log('error', component, `API Error: ${endpoint}`, {
      endpoint,
      error: error?.message || error,
      statusCode,
      stack: error?.stack,
    });
  },
  dataError: (component: string, operation: string, data: any, error: any) => {
    errorLogger.log('error', component, `Data Error: ${operation}`, {
      operation,
      data,
      error: error?.message || error,
    });
  },
};

/**
 * Hook into global error handler
 */
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.log('critical', 'Global', 'Uncaught Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log('critical', 'Global', 'Unhandled Promise Rejection', {
      reason: event.reason,
    });
  });
}
