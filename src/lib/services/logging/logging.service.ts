/**
 * Enhanced Logging Service
 * 
 * This is a consolidated logging service that combines functionality from
 * both logging.service.ts and logging.service.enhanced.ts.
 */

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../supabase';
import {
  LogLevel,
  LogEntry,
  LogFormat,
  LogDestination,
  LoggingConfig,
  LoggingService
} from './types';

/**
 * Default logging configuration
 */
const DEFAULT_CONFIG: LoggingConfig = {
  minLevel: LogLevel.INFO,
  format: 'json',
  destinations: ['console'],
  includeTimestamp: true,
  includeContext: true,
  bufferSize: 50,
  flushInterval: 10000, // 10 seconds
  disabled: false
};

/**
 * Enhanced Logging Service Implementation
 */
export class EnhancedLoggingService implements LoggingService {
  private config: LoggingConfig;
  private globalContext: Record<string, any> = {};
  private userId: string | null = null;
  private companyId: string | null = null;
  private sessionId: string | null = null;
  private buffer: LogEntry[] = [];
  private flushTimerId: NodeJS.Timeout | null = null;
  private memoryLogs: LogEntry[] = [];
  private isEnabled = true;

  constructor(config: Partial<LoggingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isEnabled = !this.config.disabled;
    
    // Setup flush interval if buffering is enabled
    if (this.config.destinations.includes('database') && this.config.flushInterval) {
      this.setupFlushInterval();
    }
    
    console.log(`[LoggingService] Initialized with level: ${this.config.minLevel}`);
  }

  /**
   * Configure the logging service
   */
  configure(config: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...config };
    this.isEnabled = !this.config.disabled;
    
    // Update flush interval if changed
    if (this.config.destinations.includes('database') && this.config.flushInterval) {
      this.setupFlushInterval();
    }
    
    console.log(`[LoggingService] Reconfigured with level: ${this.config.minLevel}`);
  }

  /**
   * Setup flush interval for buffered logging
   */
  private setupFlushInterval(): void {
    // Clear existing timer if any
    if (this.flushTimerId) {
      clearInterval(this.flushTimerId);
    }
    
    // Set up new timer
    this.flushTimerId = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush().catch(err => {
          console.error('[LoggingService] Error flushing logs:', err);
        });
      }
    }, this.config.flushInterval);
  }

  /**
   * Set global context for all logs
   */
  setGlobalContext(context: Record<string, any>): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Set user information for logs
   */
  setUser(userId: string, companyId?: string): void {
    this.userId = userId;
    if (companyId) {
      this.companyId = companyId;
    }
  }

  /**
   * Create a log entry
   */
  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context ? { ...this.globalContext, ...context } : this.globalContext,
      userId: this.userId || undefined,
      companyId: this.companyId || undefined,
      sessionId: this.sessionId || undefined
    };
  }

  /**
   * Format a log entry based on configuration
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry);
    } else if (this.config.format === 'pretty') {
      const timestamp = this.config.includeTimestamp ? `[${new Date(entry.timestamp).toLocaleTimeString()}] ` : '';
      const level = `[${entry.level}]`;
      const user = entry.userId ? `[User: ${entry.userId}] ` : '';
      const context = entry.context && this.config.includeContext ? ` ${JSON.stringify(entry.context)}` : '';
      return `${timestamp}${level} ${user}${entry.message}${context}`;
    } else {
      // Default text format
      const timestamp = this.config.includeTimestamp ? `${new Date(entry.timestamp).toISOString()} ` : '';
      const context = entry.context && this.config.includeContext ? ` ${JSON.stringify(entry.context)}` : '';
      return `${timestamp}${entry.level}: ${entry.message}${context}`;
    }
  }

  /**
   * Log entry to appropriate destinations
   */
  private async logToDestinations(entry: LogEntry): Promise<void> {
    // Skip if logging is disabled
    if (!this.isEnabled) {
      return;
    }
    
    // Skip if below minimum level
    if (this.getLevelValue(entry.level) < this.getLevelValue(this.config.minLevel)) {
      return;
    }
    
    // Log to each configured destination
    for (const destination of this.config.destinations) {
      switch (destination) {
        case 'console':
          this.logToConsole(entry);
          break;
        case 'database':
          this.buffer.push(entry);
          // Flush if buffer is full
          if (this.buffer.length >= (this.config.bufferSize || 50)) {
            await this.flush();
          }
          break;
        case 'memory':
          this.memoryLogs.push(entry);
          // Limit memory logs size
          if (this.memoryLogs.length > 1000) {
            this.memoryLogs = this.memoryLogs.slice(-1000);
          }
          break;
        // Additional destinations can be implemented here
      }
    }
  }

  /**
   * Log to console with appropriate level
   */
  private logToConsole(entry: LogEntry): void {
    const formattedMessage = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage);
        break;
    }
  }

  /**
   * Get numeric value for log level comparison
   */
  private getLevelValue(level: LogLevel): number {
    const levels: Record<LogLevel, number> = {
      [LogLevel.TRACE]: 0,
      [LogLevel.DEBUG]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.WARN]: 3,
      [LogLevel.ERROR]: 4,
      [LogLevel.FATAL]: 5
    };
    return levels[level];
  }

  /**
   * Flush logs to database
   */
  async flush(): Promise<void> {
    // Skip if no logs to flush or database destination not configured
    if (this.buffer.length === 0 || !this.config.destinations.includes('database')) {
      return;
    }
    
    const logsToFlush = [...this.buffer];
    this.buffer = [];
    
    try {
      // Store logs in database
      const { error } = await supabase
        .from('logs')
        .insert(logsToFlush.map(entry => ({
          level: entry.level,
          message: entry.message,
          context: entry.context,
          user_id: entry.userId,
          company_id: entry.companyId,
          session_id: entry.sessionId,
          created_at: entry.timestamp
        })));
      
      if (error) {
        console.error('[LoggingService] Error storing logs:', error);
        // Put logs back in buffer to retry later
        this.buffer = [...logsToFlush, ...this.buffer];
      }
    } catch (err) {
      console.error('[LoggingService] Error flushing logs:', err);
      // Put logs back in buffer to retry later
      this.buffer = [...logsToFlush, ...this.buffer];
    }
  }

  /**
   * Start a session
   */
  async startSession(userId?: string, companyId?: string): Promise<string> {
    const sessionId = `session-${uuidv4()}`;
    this.sessionId = sessionId;
    
    if (userId) {
      this.userId = userId;
    }
    
    if (companyId) {
      this.companyId = companyId;
    }
    
    // Log session start
    await this.info('Session started', { sessionId });
    
    return sessionId;
  }

  /**
   * End the current session
   */
  async endSession(): Promise<void> {
    if (this.sessionId) {
      await this.info('Session ended', { sessionId: this.sessionId });
      this.sessionId = null;
    }
  }

  /**
   * Log at TRACE level
   */
  trace(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.TRACE, message, context);
    this.logToDestinations(entry);
  }

  /**
   * Log at DEBUG level
   */
  debug(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.logToDestinations(entry);
  }

  /**
   * Log at INFO level
   */
  info(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.logToDestinations(entry);
  }

  /**
   * Log at WARN level
   */
  warn(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.logToDestinations(entry);
  }

  /**
   * Log at ERROR level
   */
  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    let errorContext = context || {};
    
    // Extract error information if provided
    if (error) {
      errorContext = {
        ...errorContext,
        error: {
          name: error.name || 'Error',
          message: error.message || String(error),
          stack: error.stack,
          code: error.code
        }
      };
    }
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, errorContext);
    this.logToDestinations(entry);
  }

  /**
   * Log at FATAL level
   */
  fatal(message: string, error?: Error | any, context?: Record<string, any>): void {
    let errorContext = context || {};
    
    // Extract error information if provided
    if (error) {
      errorContext = {
        ...errorContext,
        error: {
          name: error.name || 'Error',
          message: error.message || String(error),
          stack: error.stack,
          code: error.code
        }
      };
    }
    
    const entry = this.createLogEntry(LogLevel.FATAL, message, errorContext);
    this.logToDestinations(entry);
  }

  /**
   * Enable logging
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable logging
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Get logs (for in-memory logging)
   */
  getLogs(filter?: Partial<LogEntry>): LogEntry[] {
    if (!filter) {
      return [...this.memoryLogs];
    }
    
    return this.memoryLogs.filter(entry => {
      for (const [key, value] of Object.entries(filter)) {
        if (entry[key as keyof LogEntry] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Clear logs (for in-memory logging)
   */
  clearLogs(): void {
    this.memoryLogs = [];
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  // Compatibility methods with the original logging service

  /**
   * Log event (compatibility with original logging service)
   */
  async logEvent(eventType: string | any, data: any = {}): Promise<void> {
    if (typeof eventType === 'string') {
      this.info(eventType, data);
    } else {
      // Object format
      const eventData = eventType;
      this.info(eventData.event_type || 'unknown', eventData);
    }
  }

  /**
   * Log navigation (compatibility with original logging service)
   */
  async logNavigation(path: string, referrer: string = 'unknown'): Promise<void> {
    this.info('Navigation', { path, referrer });
  }

  /**
   * Log interaction (compatibility with original logging service)
   */
  async logInteraction(elementId: string, action: string, data: any = {}): Promise<void> {
    this.info('Interaction', { elementId, action, ...data });
  }

  /**
   * Log performance (compatibility with original logging service)
   */
  async logPerformance(metric: string, value: number, context: any = {}): Promise<void> {
    this.info('Performance', { metric, value, ...context });
  }

  /**
   * Log system event (compatibility with enhanced logging service)
   */
  async logSystemEvent(category: string, source: string, action: string, data: any = {}): Promise<void> {
    this.info(`System ${category}.${action}`, { source, ...data });
  }

  /**
   * Log user action (compatibility with enhanced logging service)
   */
  async logUserAction(action: string, component: string, data: any = {}, metadata: any = {}): Promise<string> {
    const eventId = uuidv4();
    this.info(`UserAction: ${action}`, { component, eventId, data, ...metadata });
    return eventId;
  }

  /**
   * Log AI interaction (compatibility with enhanced logging service)
   */
  async logAIInteraction(action: string, data: any = {}, metadata: any = {}): Promise<string> {
    const eventId = uuidv4();
    this.info(`AIInteraction: ${action}`, { eventId, data, ...metadata });
    return eventId;
  }
}

// Export a singleton instance of the enhanced logging service
export const loggingServiceInstance = new EnhancedLoggingService();