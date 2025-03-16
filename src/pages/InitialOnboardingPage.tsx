import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
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
    
    try {
      // Update the profile to mark initial onboarding as complete
      const { error } = await supabase
        .from('profiles')
        .update({
          setup_progress: {
            ...profile?.setup_progress,
            form_data: {
              ...(profile?.setup_progress?.form_data || {}),
              initialOnboardingComplete: true
            }
          }
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating profile:', error);
      }
      
      // Redirect to the regular onboarding flow
      navigate('/onboarding');
    } catch (error) {
      console.error('Error in onboarding completion:', error);
      // Fall back to dashboard if there's an error
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
