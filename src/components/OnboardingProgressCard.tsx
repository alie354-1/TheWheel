import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { SimpleProgressBar } from './onboarding/SimpleProgressBar';

const OnboardingProgressCard = () => {
  const { profile, user } = useAuthStore();
  const [progress, setProgress] = useState(0);
  const [activeOnboarding, setActiveOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchOnboardingProgress = async () => {
      // Debug logging
      console.log("[OnboardingProgressCard] Starting onboarding progress fetch");
      
      if (!user) {
        console.log("[OnboardingProgressCard] No user found, ending early");
        setIsLoading(false);
        return;
      }

      // Set a safety timeout to force loading to complete in case of hangs
      const safetyTimer = setTimeout(() => {
        if (isLoading) {
          console.log("[OnboardingProgressCard] Safety timeout triggered");
          setIsLoading(false);
          setProgress(100); // Show as completed to avoid blocking UI
        }
      }, 5000);
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("[OnboardingProgressCard] Checking onboarding status from profile");
        
        // Check if onboarding is needed based on profile setup_progress
        const needsOnboarding = !profile?.setup_progress?.completed_steps?.includes('complete');
        
        if (needsOnboarding && profile?.setup_progress) {
          setActiveOnboarding(true);
          
          // Calculate progress based on completed steps and include the current step
          const allSteps = [
            'welcome',
            'role_selection',
            'company_stage',
            'industry_selection',
            'skill_level', 
            'goals_selection',
            'theme_preferences',
            'notification_preferences',
            'recommendations',
            'completion'
          ];
          const totalSteps = allSteps.length - 1; // Excluding welcome step
          
          // If current step is in completion or user has completed all steps
          if (profile.setup_progress.completed_steps?.includes('complete') || 
              profile.setup_progress.current_step === 'completion') {
            setProgress(100);
          } else {
            // Count completed steps, but also count the current step as partial progress
            const completedCount = profile.setup_progress.completed_steps ? 
              profile.setup_progress.completed_steps.length : 0;
            const currentStepIndex = allSteps.indexOf(profile.setup_progress.current_step || '');
            
            // Calculate percentage: completed steps + partial credit for current step
            const calculatedProgress = Math.min(100, Math.round(((completedCount + 0.5) / totalSteps) * 100));
            setProgress(calculatedProgress);
          }
        } else {
          setActiveOnboarding(false);
          setProgress(100); // All onboarding complete
        }
      } catch (error: any) {
        console.error('Error fetching onboarding progress:', error);
        setError(error.message || 'Failed to load onboarding progress');
        // Default values to prevent blank UI
        setActiveOnboarding(false);
        setProgress(100);
      } finally {
        setIsLoading(false);
        clearTimeout(safetyTimer);
      }
    };
    
    fetchOnboardingProgress();
  }, [user, profile]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-base-100 shadow-md rounded-lg p-4 mb-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-base-300 rounded w-3/4"></div>
            <div className="h-4 bg-base-300 rounded w-1/2"></div>
            <div className="h-2 bg-base-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Don't show anything if onboarding is complete and no errors
  if (!activeOnboarding && progress === 100 && !error) {
    return null;
  }
  
  return (
    <div className="bg-base-100 shadow-md rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-base-content">Onboarding Progress</h2>
          <p className="mt-1 text-sm text-base-content/70">
            {progress < 100 
              ? `You're ${progress}% through the onboarding process` 
              : 'Onboarding complete!'}
          </p>
          {error && (
            <p className="mt-1 text-sm text-error">
              {error}
            </p>
          )}
        </div>
        {progress < 100 && (
          <Link 
            to="/onboarding"
            className="btn btn-primary btn-sm"
          >
            Continue Setup
          </Link>
        )}
      </div>
      <SimpleProgressBar progress={progress} height={8} />
    </div>
  );
};

export default OnboardingProgressCard;
