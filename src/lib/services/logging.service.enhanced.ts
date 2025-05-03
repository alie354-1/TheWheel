/**
 * DISABLED Enhanced Logging Service
 * 
 * This service has been temporarily disabled to prevent database errors.
 * All logging operations are now no-ops (they do nothing).
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  LogEvent, 
  UserActionEvent, 
  AIInteractionEvent,
  LoggingSession,
  ClientInfo
} from '../types/logging.types';

class EnhancedLoggingService {
  private initialized = true; // Always initialized
  private currentSessionId: string | null = null;
  private userId: string | null = null;
  private companyId: string | null = null;
  private clientInfo: ClientInfo | null = null;
  private isEnabled = false; // Always disabled
  private hasPermissionIssues = true; // Always assume permission issues
  private localLogs: LogEvent[] = [];
  private maxLocalLogSize = 100; // Maximum number of logs to keep in memory
  
  constructor() {
    console.log('Enhanced logging service initialized in disabled mode');
  }

  /**
   * Initialize the logging service (no-op)
   */
  async initialize(): Promise<void> {
    // Do nothing - service is disabled
    return;
  }

  /**
   * Start a new user session (no-op)
   * @param userId User ID (optional)
   * @param companyId Company ID (optional)
   * @returns Session ID
   */
  async startSession(
    userId?: string,
    companyId?: string
  ): Promise<string> {
    // Generate a fake session ID but don't store anything
    return 'logging-disabled-' + uuidv4().substring(0, 8);
  }

  /**
   * End the current user session (no-op)
   */
  async endSession(): Promise<void> {
    // Do nothing - service is disabled
    return;
  }

  /**
   * Get the current session duration in milliseconds (no-op)
   */
  private getSessionDuration(): number | null {
    return 0;
  }

  /**
   * Simplified client info collection (no-op)
   */
  private collectClientInfo(): ClientInfo {
    return {
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Set the current user context (no-op)
   */
  setUserContext(
    userId: string | null,
    companyId?: string | null
  ): void {
    // Store locally but don't do anything with it
    this.userId = userId;
    if (companyId !== undefined) {
      this.companyId = companyId;
    }
  }

  /**
   * Log a general event to the system (no-op)
   * @returns Fake event ID
   */
  async logEvent(event: Omit<LogEvent, 'id' | 'created_at'>): Promise<string | null> {
    // Return a fake event ID but don't log anything
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  /**
   * Simplified local storage (no-op)
   */
  private storeLogLocally(event: LogEvent): void {
    // Do nothing - service is disabled
  }

  /**
   * Log a system event locally (no-op)
   */
  private logSystemEventLocally(
    category: string,
    source: string,
    action: string,
    data: any = {}
  ): string {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  /**
   * Determine the required consent type (no-op)
   */
  private getRequiredConsentType(eventType: string): string | null {
    return 'essential';
  }

  /**
   * All logging methods are no-ops that return fake IDs
   */
  async logUserAction(action: string, component?: string, data: any = {}, metadata: any = {}): Promise<string | null> {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  async logAIInteraction(action: string, data: any, metadata: any = {}): Promise<string | null> {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  async logPageView(pagePath: string, pageTitle: string, referrer?: string, metadata: any = {}): Promise<string | null> {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  async logNavigation(fromPath: string, toPath: string, navigationMethod: any, metadata: any = {}): Promise<string | null> {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  async logError(error: Error | string, component?: string, context: any = {}): Promise<string | null> {
    // Still log to console for debugging
    console.error('[Disabled Logging]', error, component, context);
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  async logAPIRequest(endpoint: string, method: string, requestData?: any, responseData?: any, statusCode?: number, duration?: number): Promise<string | null> {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  async logSystemEvent(category: string, source: string, action: string, data: any = {}): Promise<string | null> {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  async logFeatureUsage(featureName: string, action: string, data: any = {}): Promise<string | null> {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  async logPerformance(metricName: string, value: number, unit?: string, context: any = {}): Promise<string | null> {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  async logAuth(action: string, userId?: string, method?: string, success?: boolean, reason?: string): Promise<string | null> {
    return 'disabled-' + uuidv4().substring(0, 8);
  }

  /**
   * Enable or disable logging (no-op)
   */
  setEnabled(enabled: boolean): void {
    // Always disabled
    this.isEnabled = false;
  }

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled(): boolean {
    return false; // Always disabled
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string | null {
    return 'disabled-session';
  }

  /**
   * Check if we're using local logging
   */
  isUsingLocalLogging(): boolean {
    return true; // Always using local logging
  }

  /**
   * Get locally stored logs
   */
  getLocalLogs(): LogEvent[] {
    return []; // Return empty array
  }

  /**
   * Get logs for a user (no-op)
   */
  async getUserLogs(userId: string, startDate: string, endDate: string, eventTypes?: string[]): Promise<LogEvent[]> {
    return []; // Return empty array
  }

  /**
   * Get session logs (no-op)
   */
  async getSessionLogs(sessionId: string): Promise<LogEvent[]> {
    return []; // Return empty array
  }

  /**
   * Apply retention policies (no-op)
   */
  async applyRetentionPolicies(): Promise<void> {
    return; // Do nothing
  }
}

// Export a singleton instance
export const enhancedLoggingService = new EnhancedLoggingService();

// Export as a drop-in replacement for the original logging service
export const loggingService = enhancedLoggingService;
