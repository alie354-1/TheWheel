/**
 * Authentication and User Profile Hook
 * 
 * A consolidated hook for accessing auth state and user profile information.
 */

import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/profile.types';
import { useAuthStore } from '../store';
import { serviceRegistry } from '../services/registry';

interface UseAuthReturn {
  user: User | null;
  profile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Hook for accessing authentication and user profile state
 */
export function useAuth(): UseAuthReturn {
  const { user, profile, fetchProfile, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabaseService = serviceRegistry.get('supabase');
        const { authenticated, session, error } = await supabaseService.isAuthenticated();
        
        if (error) {
          console.error('Auth error:', error);
          setError('Authentication error. Please try logging in again.');
        }
        
        if (authenticated && session?.user && !user) {
          // Update auth store if we have a session but no user in store
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            // Add other fields as needed
          } as User;
          
          setUser(userData);
          
          // Fetch the full profile if we have a user ID
          if (userData.id && !profile) {
            await fetchProfile(userData.id);
          }
        }
      } catch (err: any) {
        console.error('Error checking auth:', err);
        setError(err.message || 'Unknown authentication error');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Update full profile data
  const updateProfile = useCallback(async (userId: string, data: Partial<User>) => {
    if (!userId) {
      setError('User ID is required to update profile');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const profileService = serviceRegistry.get('profile');
      await profileService.updateProfile(userId, data);
      
      // Refresh profile data after update
      await fetchProfile(userId);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);
  
  // Sign out the user
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabaseService = serviceRegistry.get('supabase');
      await supabaseService.resetAuth();
      
      // Clear user from store
      setUser(null);
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);
  
  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    error,
    fetchProfile,
    updateProfile,
    signOut
  };
}