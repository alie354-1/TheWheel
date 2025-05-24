/**
 * Logger Hook
 * 
 * A React hook that provides access to the consolidated logging service.
 */

import { useCallback } from 'react';
import { getServiceRegistry } from '../services/registry';
import { LogLevel } from '../services/logging/types';

/**
 * Hook that provides access to the logging service
 */
export function useLogger() {
  const loggingService = getServiceRegistry().loggingService;

  const log = useCallback((level: LogLevel, message: string, context?: Record<string, any>) => {
    switch (level) {
      case LogLevel.TRACE:
        loggingService.trace(message, context);
        break;
      case LogLevel.DEBUG:
        loggingService.debug(message, context);
        break;
      case LogLevel.INFO:
        loggingService.info(message, context);
        break;
      case LogLevel.WARN:
        loggingService.warn(message, context);
        break;
      case LogLevel.ERROR:
        loggingService.error(message, undefined, context);
        break;
      case LogLevel.FATAL:
        loggingService.fatal(message, undefined, context);
        break;
    }
  }, [loggingService]);

  const logEvent = useCallback((eventType: string, data?: any) => {
    loggingService.logEvent(eventType, data);
  }, [loggingService]);

  const logUserAction = useCallback((action: string, component?: string, data?: any, metadata?: any) => {
    return loggingService.logUserAction(action, component || '', data, metadata);
  }, [loggingService]);

  const logError = useCallback((error: Error | any, context?: any) => {
    loggingService.error('Error', error, context);
  }, [loggingService]);

  const logNavigation = useCallback((path: string, referrer?: string) => {
    loggingService.logNavigation(path, referrer);
  }, [loggingService]);

  return {
    trace: useCallback((message: string, context?: Record<string, any>) => log(LogLevel.TRACE, message, context), [log]),
    debug: useCallback((message: string, context?: Record<string, any>) => log(LogLevel.DEBUG, message, context), [log]),
    info: useCallback((message: string, context?: Record<string, any>) => log(LogLevel.INFO, message, context), [log]),
    warn: useCallback((message: string, context?: Record<string, any>) => log(LogLevel.WARN, message, context), [log]),
    error: useCallback((message: string, error?: Error, context?: Record<string, any>) => {
      loggingService.error(message, error, context);
    }, [loggingService]),
    fatal: useCallback((message: string, error?: Error, context?: Record<string, any>) => {
      loggingService.fatal(message, error, context);
    }, [loggingService]),
    logEvent,
    logUserAction,
    logError,
    logNavigation,
    // Direct access to the logging service
    service: loggingService,
  };
}