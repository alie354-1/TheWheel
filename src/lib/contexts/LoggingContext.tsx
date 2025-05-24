/**
 * Logging Context
 * 
 * Provides logging methods and error capturing to the entire application.
 */

import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { serviceRegistry } from '../services/registry';
import { ErrorDisplay } from '../../components/feedback';

// Define the context interface
export interface LoggingContextValue {
  logInfo: (message: string, metadata?: Record<string, any>) => void;
  logWarn: (message: string, metadata?: Record<string, any>) => void;
  logError: (error: Error | string, metadata?: Record<string, any>) => void;
  clearErrors: () => void;
  errors: Array<{ id: string; error: Error | string; timestamp: Date; metadata?: Record<string, any> }>;
}

// Create the context with a default value
const LoggingContext = createContext<LoggingContextValue | undefined>(undefined);

// Props interface for the provider component
export interface LoggingProviderProps {
  children: ReactNode;
  captureGlobalErrors?: boolean;
  displayErrors?: boolean;
}

/**
 * Provider component that wraps the app to provide logging methods
 */
export const LoggingProvider: React.FC<LoggingProviderProps> = ({
  children,
  captureGlobalErrors = true,
  displayErrors = false
}) => {
  // Get the logging service from the registry
  const loggingService = serviceRegistry.get('logging');
  
  // Keep track of errors for potential display
  const [errors, setErrors] = useState<Array<{ id: string; error: Error | string; timestamp: Date; metadata?: Record<string, any> }>>([]);
  
  // Set up global error capturing
  React.useEffect(() => {
    if (captureGlobalErrors) {
      const originalOnError = window.onerror;
      
      // Create a handler for global errors
      window.onerror = (message, source, lineno, colno, error) => {
        // Log the error through our service
        const errorToLog = error || new Error(String(message));
        loggingService.logError(errorToLog, {
          source,
          lineno,
          colno,
          context: 'window.onerror'
        });
        
        // Add to our errors array for potential display
        const errorId = Date.now().toString();
        setErrors(prevErrors => [
          ...prevErrors,
          { id: errorId, error: errorToLog, timestamp: new Date() }
        ]);
        
        // Call the original handler if it exists
        if (typeof originalOnError === 'function') {
          return originalOnError(message, source, lineno, colno, error);
        }
        
        return false;
      };
      
      // Capture unhandled promise rejections
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        
        loggingService.logError(error, {
          context: 'unhandledRejection'
        });
        
        // Add to our errors array
        const errorId = Date.now().toString();
        setErrors(prevErrors => [
          ...prevErrors,
          { id: errorId, error, timestamp: new Date() }
        ]);
      };
      
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      
      // Clean up event listeners on unmount
      return () => {
        window.onerror = originalOnError;
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, [captureGlobalErrors]);
  
  // Create context value with logging methods
  const contextValue = useMemo(() => {
    return {
      logInfo: (message: string, metadata?: Record<string, any>) => {
        loggingService.logInfo(message, metadata);
      },
      logWarn: (message: string, metadata?: Record<string, any>) => {
        loggingService.logWarn(message, metadata);
      },
      logError: (error: Error | string, metadata?: Record<string, any>) => {
        // Log the error through the service
        loggingService.logError(error instanceof Error ? error : new Error(String(error)), metadata);
        
        // Add to our errors array for potential display
        const errorId = Date.now().toString();
        setErrors(prevErrors => [
          ...prevErrors,
          { id: errorId, error, timestamp: new Date(), metadata }
        ]);
      },
      clearErrors: () => {
        setErrors([]);
      },
      errors
    };
  }, [loggingService, errors]);
  
  return (
    <LoggingContext.Provider value={contextValue}>
      {children}
      
      {/* Display errors if displayErrors is true */}
      {displayErrors && errors.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          {errors.map(({ id, error, timestamp }) => (
            <div key={id} className="mb-2">
              <ErrorDisplay
                title="Application Error"
                message={error instanceof Error ? error.message : String(error)}
                details={error instanceof Error ? error.stack : undefined}
                showDetails={true}
                dismissible
                onDismiss={() => {
                  setErrors(prevErrors => prevErrors.filter(e => e.id !== id));
                }}
              />
            </div>
          ))}
        </div>
      )}
    </LoggingContext.Provider>
  );
};

/**
 * Hook to use the logging context
 */
export const useLoggingContext = (): LoggingContextValue => {
  const context = useContext(LoggingContext);
  
  if (context === undefined) {
    throw new Error('useLoggingContext must be used within a LoggingProvider');
  }
  
  return context;
};

/**
 * Main hook for using logging throughout the app.
 * Always use this instead of direct context access.
 */
export const useLogging = useLoggingContext;

/**
 * Error boundary component that uses the logging context
 */
export class LoggingErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  static contextType = LoggingContext;
  context!: React.ContextType<typeof LoggingContext>;
  
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error using the logging context
    if (this.context) {
      this.context.logError(error, {
        componentStack: errorInfo.componentStack,
        context: 'ErrorBoundary'
      });
    }
  }
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorDisplay
          title="Component Error"
          message={this.state.error?.message || 'An unexpected error occurred'}
          details={this.state.error?.stack}
          showDetails={true}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    
    return this.props.children;
  }
}