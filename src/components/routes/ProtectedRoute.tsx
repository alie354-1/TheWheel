/**
 * Protected Route Component
 * 
 * A component that only renders its children if the user is authenticated
 * and has access to the specified feature flags.
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../lib/contexts/AuthContext';
import { useFeatureFlagsContext } from '../../lib/contexts/FeatureFlagsContext';
import { LoadingSpinner } from '../feedback';

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredFeatureFlags?: string[];
  redirectPath?: string;
  requireAuth?: boolean;
}

/**
 * Protected Route component that checks authentication and feature flags
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredFeatureFlags = [],
  redirectPath = '/login',
  requireAuth = true
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { isEnabled, initialized: flagsInitialized } = useFeatureFlagsContext();
  
  // Show loading spinner while checking auth and feature flags
  if (authLoading || !flagsInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  // Check authentication if required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with current location as return URL
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  // Check required feature flags
  const missingFlags = requiredFeatureFlags.filter(flag => !isEnabled(flag));
  
  if (missingFlags.length > 0) {
    // Redirect to a 404 or feature not available page
    return <Navigate to="/feature-unavailable" state={{ missingFlags }} replace />;
  }
  
  // All checks passed, render the children
  return <>{children}</>;
};