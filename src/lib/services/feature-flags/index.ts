/**
 * Feature Flags Service - Consolidated entry point
 * 
 * This module provides a unified API for all feature flag operations across the application.
 */

export * from './types';
export * from './defaults';
export * from './feature-flags.service';

// Export the singleton instance
export { featureFlagsService } from './feature-flags.service';