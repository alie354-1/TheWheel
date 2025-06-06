/**
 * AuthGuard Component
 * 
 * Provides a wrapper that ensures authentication state is properly loaded
 * before rendering child components. Prevents the "no user found" errors.
 */

import React, { ReactNode } from 'react';
import { useAuthContext } from '../../lib/contexts/AuthContext.tsx';
import { LoadingSpinner } from '../feedback/index.ts';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean; // If true, redirects to login when not authenticated
  fallback?: ReactNode; // Custom loading fallback
  unauthorizedFallback?: ReactNode; // Custom unauthorized fallback
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  fallback,
  unauthorizedFallback
}) => {
  const { 
    isLoading, 
    isInitialized, 
    isAuthenticated, 
    connectionStatus, 
    error, 
    retry 
  } = useAuthContext();

  // Show loading state while auth is being initialized
  if (!isInitialized || isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    const loadingText = connectionStatus === 'reconnecting' 
      ? 'Reconnecting...' 
      : connectionStatus === 'disconnected' 
        ? 'Connection issues detected...' 
        : 'Initializing...';

    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <LoadingSpinner size="lg" text={loadingText} />
        {connectionStatus === 'disconnected' && (
          <button 
            onClick={retry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry Connection
          </button>
        )}
        {error && (
          <div className="text-red-600 text-sm text-center max-w-md">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Handle authentication requirement
  if (requireAuth && !isAuthenticated) {
    if (unauthorizedFallback) {
      return <>{unauthorizedFallback}</>;
    }

    // Default unauthorized fallback
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-gray-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p>Please log in to access this feature.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Auth is initialized and requirements are met - render children
  return <>{children}</>;
};

/**
 * Higher-order component version of AuthGuard
 */
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  );

  WrappedComponent.displayName = `WithAuthGuard(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};

export default AuthGuard;
