/**
 * Logging Service Types
 * 
 * This file contains all the types and interfaces related to the logging service.
 * It combines functionality from both logging.service.ts and logging.service.enhanced.ts
 */

/**
 * Log level enumeration
 */
export enum LogLevel {
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  companyId?: string;
  sessionId?: string;
  tags?: string[];
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string | number;
  };
}

/**
 * Log format type (how logs are formatted)
 */
export type LogFormat = 'json' | 'text' | 'pretty';

/**
 * Log destination (where logs are sent)
 */
export type LogDestination = 'console' | 'database' | 'file' | 'memory' | 'service';

/**
 * Logging service configuration
 */
export interface LoggingConfig {
  minLevel: LogLevel;
  format: LogFormat;
  destinations: LogDestination[];
  includeTimestamp: boolean;
  bufferSize?: number;
  flushInterval?: number;
  serviceEndpoint?: string;
  includeContext: boolean;
  disabled?: boolean;
}

/**
 * Logging service interface
 * 
 * This interface combines functionality from both logging services
 */
export interface LoggingService {
  /**
   * Configure the logging service
   */
  configure(config: Partial<LoggingConfig>): void;
  
  /**
   * Set global context that will be included in all logs
   */
  setGlobalContext(context: Record<string, any>): void;
  
  /**
   * Set user information for logs
   */
  setUser(userId: string, companyId?: string): void;
  
  /**
   * Log at TRACE level
   */
  trace(message: string, context?: Record<string, any>): void;
  
  /**
   * Log at DEBUG level
   */
  debug(message: string, context?: Record<string, any>): void;
  
  /**
   * Log at INFO level
   */
  info(message: string, context?: Record<string, any>): void;
  
  /**
   * Log at WARN level
   */
  warn(message: string, context?: Record<string, any>): void;
  
  /**
   * Log at ERROR level
   */
  error(message: string, error?: Error | any, context?: Record<string, any>): void;
  
  /**
   * Log at FATAL level
   */
  fatal(message: string, error?: Error | any, context?: Record<string, any>): void;
  
  /**
   * Enable logging
   */
  enable(): void;
  
  /**
   * Disable logging
   */
  disable(): void;
  
  /**
   * Flush log buffer (for buffered logging)
   */
  flush(): Promise<void>;
  
  /**
   * Get logs (for in-memory logging)
   */
  getLogs(filter?: Partial<LogEntry>): LogEntry[];
  
  /**
   * Clear logs (for in-memory logging)
   */
  clearLogs(): void;
}