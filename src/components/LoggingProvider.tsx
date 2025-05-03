/**
 * DISABLED Logging Provider
 * 
 * This component has been temporarily disabled to prevent database errors.
 * It now acts as a simple pass-through wrapper with no actual logging functionality.
 */

import React, { createContext, useContext } from 'react';

// Create a mock context with no-op functions
const LoggingContext = createContext<any>({
  logAction: () => 'disabled-log',
  logAIInteraction: () => 'disabled-log',
  logSystemEvent: () => 'disabled-log',
  logBusinessLogic: () => 'disabled-log',
  logDataOperation: () => 'disabled-log',
  recordModelFeedback: () => 'disabled-log',
  basic: {
    logAction: () => 'disabled-log',
    logAIInteraction: () => 'disabled-log',
    logError: () => 'disabled-log'
  },
  enhanced: {
    logInteraction: () => 'disabled-log',
    logAIInteraction: () => 'disabled-log',
    logBusinessLogic: () => 'disabled-log',
    logDataOperation: () => 'disabled-log',
    logComponentLifecycle: () => 'disabled-log',
    getInteractionId: () => 'disabled-interaction',
    options: {
      detailLevel: 'minimal',
      captureUserContext: false,
      captureCompanyContext: false,
      captureAbstractionLayers: false,
      extractFeaturesInRealtime: false,
      enableAutomaticFeedback: false
    }
  }
});

interface LoggingProviderProps {
  children: React.ReactNode;
  enableDetailedLogging?: boolean;
  captureUserContext?: boolean;
  captureCompanyContext?: boolean;
  captureSystemContext?: boolean;
  featureSets?: string[];
}

/**
 * Provider component that makes logging available throughout the app
 * Now acts as a simple pass-through with no actual logging
 */
export const LoggingProvider: React.FC<LoggingProviderProps> = ({
  children,
  // All options are ignored
}) => {
  console.log('Logging provider initialized in disabled mode');
  
  // Create a default value for the context
  const defaultValue = {
    logAction: () => 'disabled-log',
    logAIInteraction: () => 'disabled-log',
    logSystemEvent: () => 'disabled-log',
    logBusinessLogic: () => 'disabled-log',
    logDataOperation: () => 'disabled-log',
    recordModelFeedback: () => 'disabled-log',
    basic: {
      logAction: () => 'disabled-log',
      logAIInteraction: () => 'disabled-log',
      logError: () => 'disabled-log'
    },
    enhanced: {
      logInteraction: () => 'disabled-log',
      logAIInteraction: () => 'disabled-log',
      logBusinessLogic: () => 'disabled-log',
      logDataOperation: () => 'disabled-log',
      logComponentLifecycle: () => 'disabled-log',
      getInteractionId: () => 'disabled-interaction',
      options: {
        detailLevel: 'minimal',
        captureUserContext: false,
        captureCompanyContext: false,
        captureAbstractionLayers: false,
        extractFeaturesInRealtime: false,
        enableAutomaticFeedback: false
      }
    }
  };
  
  return (
    <LoggingContext.Provider value={defaultValue}>
      {children}
    </LoggingContext.Provider>
  );
};

/**
 * Custom hook to use logging throughout the application
 * Now returns no-op functions
 */
export const useLogging = () => {
  return useContext(LoggingContext);
};

/**
 * Higher-order component to add logging capabilities to any component
 * Now just passes through the component with mock logging functions
 */
export function withLogging<P>(
  Component: React.ComponentType<P & { logging: any }>,
  componentName: string
) {
  const WithLogging = (props: P) => {
    const logging = useLogging();
    return <Component {...props} logging={logging} />;
  };
  
  WithLogging.displayName = `WithLogging(${componentName})`;
  
  return WithLogging;
}

/**
 * Filter out sensitive information from props before logging (no-op)
 */
function filterSensitiveProps(props: any) {
  return {};
}
