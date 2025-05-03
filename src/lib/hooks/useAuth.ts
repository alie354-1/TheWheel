import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { mockAuthService } from '../services/mock-auth.service';
import { mockProfileService } from '../services/mock-profile.service';
import { ExtendedUserProfile } from '../types/extended-profile.types';
import { useAuthStore } from '../store';
import { loggingService } from '../services/logging.service';

// Set to false to use real authentication services
const USE_MOCK_SERVICES = false;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use either real or mock services based on the flag
  const auth = USE_MOCK_SERVICES ? mockAuthService : authService;
  const profileSvc = USE_MOCK_SERVICES ? mockProfileService : profileService;

  useEffect(() => {
    async function loadUserAndProfile() {
      try {
        setLoading(true);
        
        // Get the current session
        const { data, error } = await auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const sessionUser = data.session?.user || null;
        setUser(sessionUser);
        
        // If we have a user, get their profile
        if (sessionUser) {
          const userProfile = await profileSvc.getProfile(sessionUser.id);
          setProfile(userProfile);
        }
      } catch (err: any) {
        console.error('Error loading user:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserAndProfile();
    
    // Set up auth state change listener
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          const userProfile = await profileSvc.getProfile(currentUser.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      const { user, error } = await auth.signIn(email, password);
      
      if (error) {
        // Log the failed sign-in attempt
        loggingService.logAuth('login', undefined, 'password', false, error.message);
        throw error;
      }
      
      setUser(user);
      
      if (user) {
        const userProfile = await profileSvc.getProfile(user.id);
        setProfile(userProfile);
        
        // Log the successful sign-in
        loggingService.logAuth('login', user.id, 'password', true);
        
        // Start a new session
        loggingService.startSession(user.id, undefined, userProfile?.company_id);
      }
      
      return { user, error: null };
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  }
  
  async function signOut() {
    try {
      setLoading(true);
      
      // Log the sign-out event and end the session before actual signout
      if (user) {
        loggingService.logAuth('logout', user.id);
        await loggingService.endSession();
      }
      
      const { error } = await auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setProfile(null);
      
      return { error: null };
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }
  
  // Helper function to calculate profile completion percentage
  const calculateProfileCompletion = (profile: ExtendedUserProfile | null): number => {
    if (!profile) return 0;
    
    const requiredFields = [
      'full_name',
      'email',
      'avatar_url'
    ];
    
    const optionalFields = [
      'company_id',
      'company_name',
      'company_role',
      'company_logo_url',
      'company_description',
      'company_industry',
      'company_size',
      'company_stage'
    ];
    
    // Count required fields
    const completedRequired = requiredFields.filter(
      field => profile[field as keyof ExtendedUserProfile]
    ).length;
    
    // Count optional fields
    const completedOptional = optionalFields.filter(
      field => profile[field as keyof ExtendedUserProfile]
    ).length;
    
    // Calculate weighted score (required fields count more)
    const requiredWeight = 0.7;
    const optionalWeight = 0.3;
    
    const requiredScore = completedRequired / requiredFields.length * requiredWeight;
    const optionalScore = completedOptional / optionalFields.length * optionalWeight;
    
    // Total score (0-1)
    const totalScore = requiredScore + optionalScore;
    
    // Return as percentage
    return Math.round(totalScore * 100);
  };
  
  async function updateProfile(updates: Partial<ExtendedUserProfile>) {
    if (!user) {
      return { profile: null, error: new Error('No user logged in') };
    }
    
    try {
      setLoading(true);
      
      // Log the profile update attempt
      loggingService.logEvent({
        event_type: 'user_action',
        event_source: 'profile',
        action: 'profile_update_attempt',
        data: {
          update_fields: Object.keys(updates),
          user_id: user.id
        }
      });
      
      const updatedProfile = await profileSvc.updateProfile(user.id, updates);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        
        // Log successful profile update
        loggingService.logEvent({
          event_type: 'user_action',
          event_source: 'profile',
          action: 'profile_updated',
          data: {
            update_fields: Object.keys(updates),
            profile_completion: calculateProfileCompletion(updatedProfile)
          }
        });
      }
      
      return { profile: updatedProfile, error: null };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err);
      
      // Log the error
      loggingService.logError(err, 'ProfileUpdate', {
        update_fields: Object.keys(updates),
        user_id: user.id
      });
      
      return { profile: null, error: err };
    } finally {
      setLoading(false);
    }
  }
  
  async function updateSetupProgress(progress: any) {
    if (!user) {
      return { error: new Error('No user logged in') };
    }
    
    try {
      setLoading(true);
      
      // Update the profile with the new setup progress
      const updates = {
        setup_progress: progress
      };
      
      const updatedProfile = await profileSvc.updateProfile(user.id, updates);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        
        // Also update the Zustand store to keep it in sync
        const { setProfile: setStoreProfile } = useAuthStore.getState();
        setStoreProfile(updatedProfile);
      }
      
      return { error: null };
    } catch (err: any) {
      console.error('Error updating setup progress:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }
  
  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signOut,
    updateProfile,
    updateSetupProgress
  };
}
