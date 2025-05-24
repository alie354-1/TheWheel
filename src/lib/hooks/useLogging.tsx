import { useCallback } from 'react';
import { serviceRegistry } from '../services/registry';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface UseLoggingReturn {
  debug: (message: string, context?: Record<string, any>) => void;
  info: (message: string, context?: Record<string, any>) => void;
  warn: (message: string, context?: Record<string, any>) => void;
  error: (message: string, error?: Error, context?: Record<string, any>) => void;
  fatal: (message: string, error?: Error, context?: Record<string, any>) => void;
  withErrorLogging: <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorMessage?: string,
    context?: Record<string, any>
  ) => (...args: Parameters<T>) => Promise<ReturnType<T>>;
}

export const useLogging = (): UseLoggingReturn => {
  // Direct service access implementation
  const loggingService = serviceRegistry.get('logging');
  
  const log = useCallback(
    (level: LogLevel, message: string, errorOrContext?: Error | Record<string, any>, context?: Record<string, any>) => {
      let error: Error | undefined;
      let contextData: Record<string, any> | undefined;
      
      if (errorOrContext instanceof Error) {
        error = errorOrContext;
        contextData = context;
      } else {
        contextData = errorOrContext;
      }
      
      loggingService.log(level, message, error, contextData);
    },
    [loggingService]
  );
  
  const debug = useCallback(
    (message: string, context?: Record<string, any>) => {
      log('debug', message, context);
    },
    [log]
  );
  
  const info = useCallback(
    (message: string, context?: Record<string, any>) => {
      log('info', message, context);
    },
    [log]
  );
  
  const warn = useCallback(
    (message: string, context?: Record<string, any>) => {
      log('warn', message, context);
    },
    [log]
  );
  
  const error = useCallback(
    (message: string, error?: Error, context?: Record<string, any>) => {
      log('error', message, error, context);
    },
    [log]
  );
  
  const fatal = useCallback(
    (message: string, error?: Error, context?: Record<string, any>) => {
      log('fatal', message, error, context);
    },
    [log]
  );
  
  const withErrorLogging = useCallback(
    <T extends (...args: any[]) => Promise<any>>(
      fn: T,
      errorMessage = 'Operation failed',
      context?: Record<string, any>
    ) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        try {
          return await fn(...args);
        } catch (err: any) {
          error(errorMessage, err, {
            ...context,
            arguments: args.map(arg => 
              // Try to safely stringify arguments for logging
              typeof arg === 'object' ? 
                (arg === null ? 'null' : Object.prototype.toString.call(arg)) : 
                String(arg)
            ),
          });
          throw err;
        }
      };
    },
    [error]
  );
  
  return {
    debug,
    info,
    warn,
    error,
    fatal,
    withErrorLogging,
  };
};