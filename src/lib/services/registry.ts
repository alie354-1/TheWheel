/**
 * Service Registry
 * 
 * Central registry for all services in the application.
 * Provides typed access to services and prevents circular dependencies.
 */

import { featureFlagsService } from './feature-flags.service'; // Corrected import
import { loggingService } from './logging.service';
import { analyticsService } from './analytics.service'; // Corrected import
import { supabaseService } from './supabase';
import { companyAccessService } from './company-access.service';
import { notificationService } from './notification.service'; // Corrected import
import { preferencesService } from './preferences'; // Corrected import path
import { authService } from './auth.service';

/**
 * ServiceRegistry class provides a central place to register and access services
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Register core services
    this.registerCoreServices();
  }

  /**
   * Get singleton instance of ServiceRegistry
   */
  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register a service in the registry
   */
  public register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get a service from the registry
   */
  public get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service "${name}" not found in registry`);
    }
    return service as T;
  }

  /**
   * Check if a service exists in the registry
   */
  public has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  public getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Register core services
   */
  private registerCoreServices(): void {
    // Register feature flags service
    this.register('featureFlags', featureFlagsService);
    
    // Register logging service
    this.register('logging', loggingService);
    
    // Register analytics service
    this.register('analytics', analyticsService);
    
    // Register Supabase client service
    this.register('supabase', supabaseService);
    
    // Register auth service
    this.register('auth', authService);
    
    // Register company access service
    this.register('companyAccess', companyAccessService);
    
    // Register notification service
    this.register('notification', notificationService);
    
    // Register preferences service
    this.register('preferences', preferencesService);
  }
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Export function to get the service registry instance
export const getServiceRegistry = () => serviceRegistry;

// Type-safe access functions for common services
export const getFeatureFlagsService = () => serviceRegistry.get<typeof featureFlagsService>('featureFlags');
export const getLoggingService = () => serviceRegistry.get<typeof loggingService>('logging');
export const getAnalyticsService = () => serviceRegistry.get<typeof analyticsService>('analytics'); // Ensure typeof matches imported service
export const getSupabaseService = () => serviceRegistry.get<typeof supabaseService>('supabase');
export const getAuthService = () => serviceRegistry.get<typeof authService>('auth');
export const getCompanyAccessService = () => serviceRegistry.get<typeof companyAccessService>('companyAccess');
<<<<<<< HEAD
export const getNotificationService = () => serviceRegistry.get<typeof notificationService>('notification'); // Ensure typeof matches
export const getPreferencesService = () => serviceRegistry.get<typeof preferencesService>('preferences'); // Ensure typeof matches
=======
export const getNotificationService = () => serviceRegistry.get<typeof notificationService>('notification');
export const getPreferencesService = () => serviceRegistry.get<typeof preferencesService>('preferences');
>>>>>>> origin/desktop
