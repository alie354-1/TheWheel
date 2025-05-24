/**
 * Analytics Service - Consolidated entry point
 * 
 * This module provides a unified API for all analytics operations across the application.
 * It consolidates functionality from multiple analytics implementations into a cohesive service.
 */

export * from './types';
export * from './analytics.service';
export * from './events.service';
export * from './reporting.service';
export * from './dashboardAnalytics.service';
export * from './journeyAnalytics.service';

// Export the singleton instance
export { analyticsService } from './analytics.service';