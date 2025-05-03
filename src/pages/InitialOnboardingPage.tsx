import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store'; // Import fetchProfile
import { supabase } from '../lib/supabase';
import InitialOnboardingWizard from '../components/onboarding/InitialOnboardingWizard';
import Login from '../pages/Login';

const InitialOnboardingPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleOnboardingComplete = async () => {
    if (!user) return;
    
    // Get fetchProfile from the store
    const { fetchProfile } = useAuthStore.getState();

    try {
      console.log("Attempting to mark initial onboarding complete for user:", user.id);
      // Update the profile to mark initial onboarding as started (not fully complete)
      const { error: updateError } = await supabase
        .from('users') // Assuming 'users' table has setup_progress. Check if it should be 'profiles'.
        .update({
          setup_progress: {
            ...profile?.setup_progress,
            // Do NOT add 'complete' to completed_steps for Save & Exit
            completed_steps: [
              ...((profile?.setup_progress?.completed_steps || []).filter((s: string) => s !== 'complete'))
            ],
            form_data: {
              ...(profile?.setup_progress?.form_data || {}),
              initialOnboardingComplete: true
            }
          }
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile in database:', updateError);
        // Optionally: Show an error message to the user
        // For now, we'll still try to navigate, but log the error
      } else {
        console.log("Database update successful. Refreshing profile state...");
        // Explicitly refresh the profile state from the database
        await fetchProfile(user.id); 
        console.log("Profile state refreshed.");
      }

      // Redirect to dashboard after attempting update and refresh
      console.log("Navigating to dashboard...");
      navigate('/dashboard');
    } catch (error) {
      console.error('Critical error during onboarding completion:', error);
      // Fall back to dashboard even if there's a critical error
      navigate('/dashboard');
    }
  };
  
  // If user is not logged in, show login component
  if (!user) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
    
    return <Login />;
  }
  
  // If user is logged in but still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // User is logged in and loaded
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <InitialOnboardingWizard user={user} onComplete={handleOnboardingComplete} />
      </div>
    </div>
  );
};

export default InitialOnboardingPage;
