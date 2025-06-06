/**
 * Enhanced Auth Context
 * 
 * Provides robust authentication state and methods with enhanced error handling,
 * retry logic, and better synchronization with the auth store.
 */

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../types/profile.types.ts';
import { LoadingSpinner } from '../../components/feedback/index.ts';
import { getAuthService, getProfileService, serviceRegistry } from '../services/registry.ts';
import { useAuthStore } from '../store.ts';

// Enhanced context interface with additional state and recovery methods
export interface AuthContextValue {
  user: User | null;
  profile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean; // New: indicates if auth has been initialized
  error: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'; // New: connection monitoring
  lastSync: Date | null; // New: last successful sync timestamp
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, metadata?: any) => Promise<void>;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void; // New: manual error clearing
  retry: () => Promise<void>; // New: manual retry mechanism
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
 * Enhanced Provider component with improved state management and error handling
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  loadingFallback = <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" text="Loading..." /></div>,
  unauthorizedFallback = null
}) => {
  // Enhanced state for authentication
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  // Refs for preventing race conditions and duplicate operations
  const isRefreshingRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  
  // Get services from registry with error handling
  const authService = getAuthService();
  const profileService = getProfileService();
  
  // Get store setters for synchronization
  const { setUser: setStoreUser, setProfile: setStoreProfile } = useAuthStore();
  
  // Enhanced error clearing
  const clearError = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
  }, []);
  
  // Connection monitoring
  const updateConnectionStatus = useCallback((status: 'connected' | 'disconnected' | 'reconnecting') => {
    setConnectionStatus(status);
    console.log(`[AuthContext] Connection status changed to: ${status}`);
  }, []);
  
  // Enhanced refresh user data with retry logic and better error handling
  const refreshUser = useCallback(async () => {
    // Prevent concurrent refreshes
    if (isRefreshingRef.current) {
      console.log('[AuthContext] Refresh already in progress, skipping...');
      return;
    }
    
    isRefreshingRef.current = true;
    
    try {
      console.log('[AuthContext] Starting user refresh...');
      setIsLoading(true);
      setError(null);
      updateConnectionStatus('connected');
      
      // Add timeout to prevent hanging
      const refreshPromise = Promise.race([
        (async () => {
          // Get current session with retry logic
          let sessionData, userData;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`[AuthContext] Session attempt ${attempt}/${maxRetries}`);
              const sessionResult = await authService.getSession();
              sessionData = sessionResult.data;
              break;
            } catch (sessionError: any) {
              console.warn(`[AuthContext] Session attempt ${attempt} failed:`, sessionError.message);
              if (attempt === maxRetries) throw sessionError;
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
          }
          
          if (sessionData?.session) {
            // Get user data with retry logic
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                console.log(`[AuthContext] User data attempt ${attempt}/${maxRetries}`);
                const userResult = await authService.getUser();
                userData = userResult.data;
                break;
              } catch (userError: any) {
                console.warn(`[AuthContext] User data attempt ${attempt} failed:`, userError.message);
                if (attempt === maxRetries) throw userError;
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
              }
            }
            
            if (userData?.user) {
              // Get or create user profile with enhanced error handling
              let userProfile = null;
              try {
                console.log('[AuthContext] Fetching user profile...');
                userProfile = await profileService.getOrCreateProfile(userData.user.id, userData.user) as User | null;
              } catch (profileError: any) {
                console.error('[AuthContext] Profile creation/fetch failed:', profileError);
                // Don't fail auth if profile fails - allow partial auth
                console.warn('[AuthContext] Continuing with partial auth (no profile)');
              }
              
              // Set user state
              setUser(userData.user);
              setProfile(userProfile);
              setIsAuthenticated(true);
              setLastSync(new Date());
              
              // Sync with store
              setStoreUser(userData.user);
              setStoreProfile(userProfile);
              
              console.log('[AuthContext] User refresh successful');
              retryCountRef.current = 0; // Reset retry count on success
            } else {
              console.log('[AuthContext] No user data in session');
              setUser(null);
              setProfile(null);
              setIsAuthenticated(false);
              setStoreUser(null);
              setStoreProfile(null);
            }
          } else {
            console.log('[AuthContext] No active session');
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
            setStoreUser(null);
            setStoreProfile(null);
          }
        })(),
        // Timeout after 10 seconds
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth refresh timeout after 10 seconds')), 10000)
        )
      ]);
      
      await refreshPromise;
      
    } catch (err: any) {
      console.error('[AuthContext] Error refreshing user:', err);
      
      // Update retry count and connection status
      retryCountRef.current++;
      updateConnectionStatus('disconnected');
      
      // Set appropriate error message
      let errorMessage = 'Authentication service unavailable';
      if (err.message?.includes('timeout')) {
        errorMessage = 'Connection timeout - please check your internet connection';
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error - please try again';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Only clear user state if this isn't a temporary network issue
      if (retryCountRef.current >= maxRetries) {
        console.log('[AuthContext] Max retries reached, clearing user state');
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setStoreUser(null);
        setStoreProfile(null);
      }
    } finally {
      isRefreshingRef.current = false;
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [authService, profileService, setStoreUser, setStoreProfile, updateConnectionStatus]);
  
  // Manual retry mechanism
  const retry = useCallback(async () => {
    console.log('[AuthContext] Manual retry initiated');
    retryCountRef.current = 0; // Reset retry count
    updateConnectionStatus('reconnecting');
    clearError();
    await refreshUser();
  }, [refreshUser, clearError, updateConnectionStatus]);
  
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
      // Sync with store
      setStoreUser(null);
      setStoreProfile(null);
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
      const { data, error } = await (serviceRegistry.get('supabase') as any).supabase.auth.signUp({
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
      
      // Use profile service to update
      const updatedProfile = await profileService.updateProfile(userId, updates);
      
      if (!updatedProfile) {
        setError('Failed to update profile');
        throw new Error('Failed to update profile');
      }
      
      await refreshUser(); // Refresh the user state with the latest data
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enhanced initialization with proper error handling and connection monitoring
  useEffect(() => {
    // Prevent duplicate initialization
    if (initializationPromiseRef.current) {
      console.log('[AuthContext] Initialization already in progress');
      return;
    }
    
    console.log('[AuthContext] Starting initialization...');
    
    // Create initialization promise
    initializationPromiseRef.current = (async () => {
      try {
        await refreshUser();
        console.log('[AuthContext] Initial auth check completed');
      } catch (error) {
        console.error('[AuthContext] Initial auth check failed:', error);
      }
    })();
    
    // Subscribe to auth state changes with enhanced event handling
    const { data } = authService.onAuthStateChange((event: any, session: any) => {
      console.log(`[AuthContext] Auth state change: ${event}`, { 
        hasSession: !!session, 
        userId: session?.user?.id 
      });
      
      // Handle different auth events appropriately
      switch (event) {
        case 'SIGNED_IN':
          console.log('[AuthContext] User signed in, refreshing...');
          refreshUser();
          break;
        case 'SIGNED_OUT':
          console.log('[AuthContext] User signed out, clearing state...');
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          setStoreUser(null);
          setStoreProfile(null);
          setLastSync(null);
          clearError();
          break;
        case 'USER_UPDATED':
          console.log('[AuthContext] User updated, refreshing...');
          refreshUser();
          break;
        case 'TOKEN_REFRESHED':
          // Silent refresh - no need to log or trigger full refresh
          setLastSync(new Date());
          break;
        case 'PASSWORD_RECOVERY':
          console.log('[AuthContext] Password recovery initiated');
          break;
        default:
          if (event) {
            console.log(`[AuthContext] Unhandled auth event: ${event}`);
          }
      }
    });
    
    // Set up connection monitoring (check every 30 seconds)
    const connectionCheckInterval = setInterval(async () => {
      if (!isRefreshingRef.current && isInitialized) {
        try {
          // Quick session check to verify connection
          await authService.getSession();
          if (connectionStatus !== 'connected') {
            updateConnectionStatus('connected');
          }
        } catch (error) {
          console.warn('[AuthContext] Connection check failed:', error);
          if (connectionStatus === 'connected') {
            updateConnectionStatus('disconnected');
          }
        }
      }
    }, 30000);
    
    return () => {
      // Clean up subscriptions and intervals
      if (data?.subscription) {
        data.subscription.unsubscribe();
        console.log('[AuthContext] Unsubscribed from auth state changes');
      }
      
      clearInterval(connectionCheckInterval);
      
      // Reset initialization promise
      initializationPromiseRef.current = null;
    };
  }, [authService, refreshUser, connectionStatus, isInitialized, updateConnectionStatus, clearError]);
  
  // Prepare enhanced context value
  const contextValue: AuthContextValue = {
    user,
    profile,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    connectionStatus,
    lastSync,
    login,
    logout,
    signup,
    updateProfile,
    refreshUser,
    clearError,
    retry,
    fetchProfile: async (userId: string) => refreshUser(),  // Alias for backward compatibility
    signOut: logout  // Alias for backward compatibility
  };
  
  // Enhanced loading state with connection status
  if (isLoading && !isInitialized) {
    const loadingText = connectionStatus === 'reconnecting' 
      ? 'Reconnecting...' 
      : connectionStatus === 'disconnected' 
        ? 'Connection issues detected...' 
        : 'Loading...';
        
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <LoadingSpinner size="lg" text={loadingText} />
        {connectionStatus === 'disconnected' && (
          <button 
            onClick={retry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
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
