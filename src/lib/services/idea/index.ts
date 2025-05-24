/**
 * Idea Service exports
 */
export * from './types';
export * from './idea.service';

// Export singleton instance for direct usage
import { ideaServiceInstance } from './idea.service';
export const ideaService = ideaServiceInstance;