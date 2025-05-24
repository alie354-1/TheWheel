/**
 * Profile Context
 * 
 * React context for accessing user profile data throughout the application.
 * Uses the consolidated profile service from the service registry.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getServiceRegistry } from '../services/registry';
import { UserProfile, ProfilePersona } from '../services/profile/types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorDisplay } from '../../components/shared/ErrorDisplay';

interface ProfileContextValue {
  profile: UserProfile | null;
  activePersona: ProfilePersona | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  switchPersona: (personaId: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

interface ProfileProviderProps {
  userId: string;
  children: React.ReactNode;
}

export function ProfileProvider({ userId, children }: ProfileProviderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activePersona, setActivePersona] = useState<ProfilePersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the profile service from the service registry
  const profileService = getServiceRegistry().profileService;

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get profile data
      const profileData = await profileService.getProfile(userId);
      let personaData = null;

      if (profileData?.activePersonaId) {
        personaData = await profileService.getActivePersona(userId);
      }

      setProfile(profileData);
      setActivePersona(personaData);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, profileService]);

  // Load profile data on mount and when userId changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Switch to a different persona
  const switchPersona = useCallback(async (personaId: string) => {
    try {
      setLoading(true);
      await profileService.setActivePersona(userId, personaId);
      await loadProfile(); // Refresh profile data after switch
    } catch (err: any) {
      console.error('Error switching persona:', err);
      setError(err.message || 'Failed to switch persona');
      setLoading(false);
    }
  }, [userId, profileService, loadProfile]);

  const contextValue: ProfileContextValue = {
    profile,
    activePersona,
    loading,
    error,
    refreshProfile: loadProfile,
    switchPersona,
  };

  // Show loading state if still loading and not an error
  if (loading && !error) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="p-4">
        <ErrorDisplay
          message="Error loading profile"
          details={error}
          onRetry={loadProfile}
        />
      </div>
    );
  }

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Hook to use the profile context
 */
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}