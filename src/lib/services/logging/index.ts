/**
 * Logging Service exports
 */
export * from './types';
export * from './logging.service';

// Export singleton instance for direct usage
import { loggingServiceInstance } from './logging.service';
export const loggingService = loggingServiceInstance;