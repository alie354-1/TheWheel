/**
 * Services module
 * 
 * This file exports all services and the service registry.
 * It serves as the main entry point for accessing services.
 */

// Export the service registry
export * from './registry';

// Export service types
export * from './idea/types';
export * from './profile/types';
export * from './logging/types';
export * from './analytics/types';
export * from './auth/types';
export * from './journey/types';
export * from './standup/types';

// Service implementations will be exported once they're created

/**
 * Helper function to get a specific service
 * 
 * This provides a shorter syntax for getting services throughout the app.
 */
import { getServiceRegistry } from './registry';

export const getIdeaService = () => getServiceRegistry().ideaService;
export const getProfileService = () => getServiceRegistry().profileService;
export const getLoggingService = () => getServiceRegistry().loggingService;
export const getAnalyticsService = () => getServiceRegistry().analyticsService;
export const getAuthService = () => getServiceRegistry().authService;
export const getJourneyService = () => getServiceRegistry().journeyService;
export const getStandupService = () => getServiceRegistry().standupService;