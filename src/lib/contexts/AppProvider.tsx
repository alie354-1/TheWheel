/**
 * App Provider
 * 
 * Combines all application contexts into a single provider component.
 * This component should wrap the entire application to provide all services
 * and contexts to all components.
 */

import React, { ReactNode } from 'react';

// Import all context providers
import { AuthProvider } from './AuthContext';
import { FeatureFlagsProvider } from './FeatureFlagsContext';
import { AnalyticsProvider } from './AnalyticsContext';
import { LoggingProvider } from './LoggingContext';
import { NotificationProvider } from './NotificationContext';

// Props interface for the provider component
export interface AppProviderProps {
  children: ReactNode;
  captureErrors?: boolean;
  displayErrors?: boolean;
}

/**
 * Combined provider component that wraps the app to provide all contexts
 */
export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  captureErrors = true,
  displayErrors = false
}) => {
  return (
    <LoggingProvider captureGlobalErrors={captureErrors} displayErrors={displayErrors}>
      <AuthProvider>
        <FeatureFlagsProvider>
          <AnalyticsProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AnalyticsProvider>
        </FeatureFlagsProvider>
      </AuthProvider>
    </LoggingProvider>
  );
};