/**
 * Feature Route Component
 * 
 * A component that conditionally renders children based on feature flag status.
 * Unlike ProtectedRoute, it can show alternative content instead of redirecting.
 */

import React, { ReactNode } from 'react';
import { useFeatureFlagsContext } from '../../lib/contexts/FeatureFlagsContext';

export interface FeatureRouteProps {
  children: ReactNode;
  featureFlag: string;
  fallback?: ReactNode;
}

/**
 * Route component that renders based on feature flag status
 */
export const FeatureRoute: React.FC<FeatureRouteProps> = ({
  children,
  featureFlag,
  fallback = null
}) => {
  const { isEnabled, initialized } = useFeatureFlagsContext();
  
  // If feature flags aren't initialized yet, don't render anything
  if (!initialized) {
    return null;
  }
  
  // Render children if feature is enabled, otherwise render fallback
  return isEnabled(featureFlag) ? <>{children}</> : <>{fallback}</>;
};