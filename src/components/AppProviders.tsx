/**
 * Application Providers
 * 
 * Sets up all the providers needed for the application.
 */

import React, { useEffect, useState } from 'react';
import { FeatureFlagsProvider } from '../lib/contexts/FeatureFlagsContext';
import { ProfileProvider } from '../lib/contexts/ProfileContext';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { getServiceRegistry } from '../lib/services/registry';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Set up logging service
  const loggingService = getServiceRegistry().loggingService;
  
  // Get the current user
  useEffect(() => {
    async function getCurrentUser() {
      try {
        // This would typically use the authService from the registry
        // For now, simulate loading the user
        const { data } = await fetch('/api/auth/me').then(res => res.json());
        setUserId(data?.user?.id || null);
        
        // Start logging session if user is logged in
        if (data?.user?.id) {
          await loggingService.startSession(data.user.id, data.user.company_id);
          loggingService.setUser(data.user.id, data.user.company_id);
        }
      } catch (err) {
        console.error('Error getting current user:', err);
      } finally {
        setLoading(false);
      }
    }
    
    getCurrentUser();
    
    // Clean up logging session on unmount
    return () => {
      loggingService.endSession();
    };
  }, [loggingService]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  
  return (
    <FeatureFlagsProvider>
      {userId ? (
        <ProfileProvider userId={userId}>
          {children}
        </ProfileProvider>
      ) : (
        // If no userId, render without profile provider
        children
      )}
    </FeatureFlagsProvider>
  );
}