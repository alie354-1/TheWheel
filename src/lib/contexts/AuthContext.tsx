/**
 * Auth Context
 * 
 * Provides authentication state and methods to the entire application.
 */

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { User } from '../types/profile.types';
import { LoadingSpinner } from '../../components/feedback';
import { getAuthService, serviceRegistry } from '../services/registry'; // Import getAuthService

// Define the context interface
export interface AuthContextValue {
  user: User | null;
  profile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, metadata?: any) => Promise<void>;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>; // Alias for backward compatibility
  signOut: () => Promise<void>; // Alias for backward compatibility
}

// Create the context with a default value
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Props interface for the provider component
export interface AuthProviderProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  unauthorizedFallback?: ReactNode;
}

/**
 * Provider component that wraps the app to provide auth state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  loadingFallback = <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" text="Loading..." /></div>,
  unauthorizedFallback = null
}) => {
  // State for authentication
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get auth service from registry
  const authService = getAuthService(); // Use typed getter
  
  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current session
      const { data: sessionData } = await authService.getSession();
      
      if (sessionData.session) {
        // If we have a session, get the user data
        const { data: userData } = await authService.getUser();
        
        if (userData.user) {
          // We have a user, now get their profile from the users table
          const { data: userProfile } = await serviceRegistry.get('supabase').supabase
            .from('users')
            .select('*')
            .eq('id', userData.user.id)
            .single();
          
          setUser(userData.user);
          setProfile(userProfile || userData.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error('Error refreshing user:', err);
      setError(err.message || 'Unknown error during auth refresh');
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user: signedInUser, error: signInError } = await authService.signIn(email, password);
      
      if (signInError) {
        setError(signInError.message || 'Failed to login');
        throw signInError;
      }
      
      await refreshUser(); // Refresh the user state with the latest data
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error: signOutError } = await authService.signOut();
      
      if (signOutError) {
        setError(signOutError.message || 'Failed to logout');
        throw signOutError;
      }
      
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Signup function - we need to implement this as it's not in the auth service
  const signup = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use Supabase to sign up
      const { data, error } = await serviceRegistry.get('supabase').supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        setError(error.message || 'Failed to sign up');
        throw error;
      }
      
      // If sign up successful, refresh user
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update profile function
  const updateProfile = async (userId: string, updates: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update profile in the users table
      const { error } = await serviceRegistry.get('supabase').supabase
        .from('users')
        .update(updates)
        .eq('id', userId);
      
      if (error) {
        setError(error.message || 'Failed to update profile');
        throw error;
      }
      
      await refreshUser(); // Refresh the user state with the latest data
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize on mount and subscribe to auth changes
  useEffect(() => {
    refreshUser();
    
    // Subscribe to auth state changes
    const { data } = authService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      refreshUser();
    });
    
    return () => {
      data?.subscription?.unsubscribe();
    };
  }, [authService, refreshUser]);
  
  // Prepare context value
  const contextValue: AuthContextValue = {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    signup,
    updateProfile,
    refreshUser,
    fetchProfile: async (userId: string) => refreshUser(),  // Alias for backward compatibility
    signOut: logout  // Alias for backward compatibility
  };
  
  // Show loading state while authentication is being determined
  if (isLoading) {
    return <>{loadingFallback}</>;
  }
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use the auth context
 */
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Main hook for using authentication throughout the app.
 * Always use this instead of direct context access.
 */
export const useAuth = useAuthContext;

/**
 * Higher-order component that requires authentication
 * Redirects to login if user is not authenticated
 */
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const WithAuth: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuthContext();
    
    if (isLoading) {
      return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" text="Checking authentication..." /></div>;
    }
    
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
  
  WithAuth.displayName = `WithAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return WithAuth;
};
