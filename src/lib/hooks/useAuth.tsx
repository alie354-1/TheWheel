import { useState, useEffect, useCallback } from 'react';
import { serviceRegistry } from '../services/registry';

export interface UseAuthReturn {
  user: any | null;
  profile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, metadata?: any) => Promise<void>;
  updateProfile: (userId: string, updates: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  // Direct service access implementation
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get auth service from registry
  const authService = serviceRegistry.get('auth');
  
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { user: currentUser, profile: userProfile, error: authError } = await authService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setProfile(userProfile);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        
        if (authError) {
          setError(authError.message || 'Failed to get current user');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error during auth refresh');
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Initialize on component mount
  useEffect(() => {
    refreshUser();
    
    // Subscribe to auth state changes
    const { unsubscribe } = authService.onAuthStateChange(() => {
      refreshUser();
    });
    
    return () => {
      unsubscribe?.();
    };
  }, [authService, refreshUser]);
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.login(email, password);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.logout();
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
  
  const signup = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signup(email, password, metadata);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProfile = async (userId: string, updates: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.updateProfile(userId, updates);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    signup,
    updateProfile,
    refreshUser
  };
};