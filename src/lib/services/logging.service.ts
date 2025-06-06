/**
 * DISABLED Logging Service
 * 
 * This service has been temporarily disabled to prevent database errors.
 * All operations are now no-ops (they do nothing).
 */

/**
 * Logging Service Interface
 */
export interface LoggingService {
  trace: (message: string, context?: any) => Promise<void>; // Added
  debug: (message: string, context?: any) => Promise<void>; // Added
  info: (message: string, context?: any) => Promise<void>; // Changed from logInfo and made mandatory
  warn: (message: string, context?: any) => Promise<void>; // Changed from logWarning and made mandatory
  error: (message: string, error?: Error, context?: any) => Promise<void>; // Signature updated to match useLogger
  fatal: (message: string, error?: Error, context?: any) => Promise<void>; // Added

  logEvent: (eventType: string | any, data?: any) => Promise<void>;
  startSession: (userId?: string, companyId?: string) => Promise<string>;
  endSession: (sessionId?: string) => Promise<void>;
  // logError: (error: Error, context?: any) => Promise<void>; // Replaced by new error signature
  logNavigation: (path: string, referrer?: string) => Promise<void>;
  logInteraction: (elementId: string, action: string, data?: any) => Promise<void>;
  logPerformance: (metric: string, value: number, context?: any) => Promise<void>;
  getSessionId: () => string | null;

  // Additional methods used by hooks
  logSystemEvent: (category: string, source: string, action: string, data?: any) => Promise<void>;
  logUserAction: (action: string, component: string, data?: any, metadata?: any) => Promise<string>;
  logAIInteraction: (action: string, data?: any, metadata?: any) => Promise<string>;
}

/**
 * No-op implementation of Logging Service
 */
class DisabledLoggingService implements LoggingService {
  private sessionId: string | null = null;
  
  constructor() {
    console.log('[LoggingService] Initialized in DISABLED mode');
  }

  /**
   * Log an event (no-op)
   * Accepts either a string event type or an object with event details
   */
  async logEvent(eventType: string | any, data: any = {}): Promise<void> {
    // Handle both string event type and object format
    if (typeof eventType === 'string') {
      // Only log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[LoggingService] Event (DISABLED): ${eventType}`, data);
      }
    } else {
      // Object format
      const eventData = eventType;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[LoggingService] Event (DISABLED): ${eventData.event_type || 'unknown'}`, eventData);
      }
    }
    return Promise.resolve();
  }

  /**
   * Start a new session (no-op)
   */
  async startSession(userId?: string, companyId?: string): Promise<string> {
    const mockSessionId = `mock-session-${Date.now()}`;
    this.sessionId = mockSessionId;
    console.log(`[LoggingService] Session started (DISABLED): ${mockSessionId}`, { userId, companyId });
    return Promise.resolve(mockSessionId);
  }

  /**
   * End a session (no-op)
   */
  async endSession(sessionId?: string): Promise<void> {
    console.log(`[LoggingService] Session ended (DISABLED): ${sessionId || this.sessionId}`);
    this.sessionId = null;
    return Promise.resolve();
  }

  /**
   * Log an error (no-op)
   */
  async trace(message: string, context: any = {}): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoggingService] Trace (DISABLED): ${message}`, context);
    }
    return Promise.resolve();
  }

  async debug(message: string, context: any = {}): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoggingService] Debug (DISABLED): ${message}`, context);
    }
    return Promise.resolve();
  }
  
  async info(message: string, context: any = {}): Promise<void> { // Renamed from logInfo
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoggingService] Info (DISABLED): ${message}`, context);
    }
    return Promise.resolve();
  }

  async warn(message: string, context: any = {}): Promise<void> { // Renamed from logWarning
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[LoggingService] Warning (DISABLED): ${message}`, context);
    }
    return Promise.resolve();
  }

  async error(message: string, error?: Error, context: any = {}): Promise<void> { // Updated signature
    console.error(`[LoggingService] Error (DISABLED): ${message}`, error || '', context);
    return Promise.resolve();
  }

  async fatal(message: string, error?: Error, context: any = {}): Promise<void> {
    console.error(`[LoggingService] Fatal (DISABLED): ${message}`, error || '', context);
    return Promise.resolve();
  }

  /**
   * Log navigation (no-op)
   */
  async logNavigation(path: string, referrer: string = 'unknown'): Promise<void> {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoggingService] Navigation (DISABLED): ${path} from ${referrer}`);
    }
    return Promise.resolve();
  }

  /**
   * Log interaction (no-op)
   */
  async logInteraction(elementId: string, action: string, data: any = {}): Promise<void> {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoggingService] Interaction (DISABLED): ${action} on ${elementId}`, data);
    }
    return Promise.resolve();
  }

  /**
   * Log performance (no-op)
   */
  async logPerformance(metric: string, value: number, context: any = {}): Promise<void> {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoggingService] Performance (DISABLED): ${metric} = ${value}ms`, context);
    }
    return Promise.resolve();
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Log system event (no-op)
   */
  async logSystemEvent(category: string, source: string, action: string, data: any = {}): Promise<void> {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoggingService] System Event (DISABLED): ${category}.${action} from ${source}`, data);
    }
    return Promise.resolve();
  }

  /**
   * Log user action (no-op)
   * Returns a mock event ID
   */
  async logUserAction(action: string, component: string, data: any = {}, metadata: any = {}): Promise<string> {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoggingService] User Action (DISABLED): ${action} in ${component}`, { data, metadata });
    }
    return Promise.resolve(`mock-event-${Date.now()}`);
  }

  /**
   * Log AI interaction (no-op)
   * Returns a mock event ID
   */
  async logAIInteraction(action: string, data: any = {}, metadata: any = {}): Promise<string> {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LoggingService] AI Interaction (DISABLED): ${action}`, { data, metadata });
    }
    return Promise.resolve(`mock-ai-event-${Date.now()}`);
  }
}

// Export singleton instance
export const loggingService = new DisabledLoggingService();
