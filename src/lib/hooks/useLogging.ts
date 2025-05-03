/**
 * useLogging Hook
 * 
 * A React hook that provides convenient access to logging functionality for components.
 * This hook makes it easy to log user actions, errors, navigation, and feature usage
 * while maintaining component context information.
 */

import { useCallback } from 'react';
import { loggingService } from '../services/logging.service';

/**
 * React hook for component-level logging
 * 
 * @param componentName The name of the component using the hook (for context)
 * @returns Object with logging methods scoped to the component
 */
export function useLogging(componentName: string) {
  /**
   * Log a user action
   * 
   * @param action The action being performed
   * @param data Additional data about the action
   * @param metadata Optional metadata
   * @returns The ID of the logged event
   */
  const logAction = useCallback((
    action: string, 
    data: any = {}, 
    metadata: any = {}
  ) => {
    return loggingService.logUserAction(action, componentName, data, metadata);
  }, [componentName]);
  
  /**
   * Log an error
   * 
   * @param error The error object or message
   * @param context Additional context about where/why the error occurred
   * @returns The ID of the logged event
   */
  const logError = useCallback((
    error: Error | string,
    context: any = {}
  ) => {
    return loggingService.logError(error, componentName, context);
  }, [componentName]);
  
  /**
   * Log a navigation event
   * 
   * @param fromPath Path navigated from
   * @param toPath Path navigated to
   * @param method Method of navigation
   * @returns The ID of the logged event
   */
  const logNavigation = useCallback((
    fromPath: string,
    toPath: string,
    method: 'link' | 'button' | 'redirect' | 'back' | 'forward' | 'manual' = 'link'
  ) => {
    return loggingService.logNavigation(fromPath, toPath, method);
  }, []);
  
  /**
   * Log feature usage
   * 
   * @param featureName Name of the feature
   * @param action Action performed with the feature
   * @param data Additional data about the feature usage
   * @returns The ID of the logged event
   */
  const logFeatureUsage = useCallback((
    featureName: string,
    action: string,
    data: any = {}
  ) => {
    return loggingService.logFeatureUsage(featureName, action, data);
  }, []);
  
  /**
   * Log an AI interaction
   * 
   * @param action Action performed
   * @param data Interaction data
   * @param metadata Additional metadata
   * @returns The ID of the logged event
   */
  const logAIInteraction = useCallback((
    action: string,
    data: any = {},
    metadata: any = {}
  ) => {
    return loggingService.logAIInteraction(action, data, metadata);
  }, []);
  
  /**
   * Log a page view
   * 
   * @param pagePath Path of the viewed page
   * @param pageTitle Title of the viewed page
   * @param referrer Referrer URL (optional)
   * @returns The ID of the logged event
   */
  const logPageView = useCallback((
    pagePath: string,
    pageTitle: string,
    referrer?: string
  ) => {
    return loggingService.logPageView(pagePath, pageTitle, referrer);
  }, []);
  
  /**
   * Log performance metrics
   * 
   * @param metricName Name of the metric
   * @param value Metric value
   * @param unit Unit of measurement (optional)
   * @param context Additional context (optional)
   * @returns The ID of the logged event
   */
  const logPerformance = useCallback((
    metricName: string,
    value: number,
    unit?: string,
    context: any = {}
  ) => {
    return loggingService.logPerformance(metricName, value, unit, {
      component: componentName,
      ...context
    });
  }, [componentName]);

  /**
   * Create a wrapped handler that logs an action and then calls the original handler
   * 
   * @param handler The original event handler
   * @param action The action to log
   * @param extraData Additional data to include in the log
   * @returns A wrapped handler that logs and then calls the original
   */
  const withLogging = useCallback(<T extends (...args: any[]) => any>(
    handler: T,
    action: string,
    extraData: Record<string, any> = {}
  ) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      // Log the action with component context
      logAction(action, {
        ...extraData,
        args: args.length > 0 ? args : undefined
      });
      
      // Call the original handler
      return handler(...args);
    };
  }, [logAction]);

  return {
    logAction,
    logError,
    logNavigation,
    logFeatureUsage,
    logAIInteraction,
    logPageView,
    logPerformance,
    withLogging
  };
}
