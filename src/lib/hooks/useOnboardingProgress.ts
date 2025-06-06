import { useState, useEffect } from 'react';
import { useAuthStore } from '../store.ts';

const ONBOARDING_STEPS = [
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

export function useOnboardingProgress() {
  const { user, profile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeOnboarding, setActiveOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user || !profile) {
        setIsLoading(false);
        setActiveOnboarding(false);
        setProgress(0);
        return;
      }

      const setup = profile.setup_progress;
      if (!setup) {
        setActiveOnboarding(true);
        setProgress(0);
        setIsLoading(false);
        return;
      }

      // Calculate progress
      let completedSteps = Array.isArray(setup.completed_steps)
        ? setup.completed_steps
        : [];
      // Remove duplicates and filter only known steps
      completedSteps = [...new Set(completedSteps)].filter((step) =>
        ONBOARDING_STEPS.includes(step)
      );

      // If onboarding is marked as complete, progress is 100
      const isComplete =
        setup.initialOnboardingComplete ||
        completedSteps.includes('complete') ||
        setup.current_step === 'completion';

      let progressValue = 0;
      if (isComplete) {
        progressValue = 100;
      } else {
        // Progress is based on index of current_step or completed steps
        const currentStepIndex = ONBOARDING_STEPS.indexOf(
          setup.current_step || ''
        );
        if (currentStepIndex >= 0) {
          progressValue = Math.round(
            (currentStepIndex / (ONBOARDING_STEPS.length - 1)) * 100
          );
        } else if (completedSteps.length > 0) {
          progressValue = Math.round(
            (completedSteps.length / (ONBOARDING_STEPS.length - 1)) * 100
          );
        }
      }

      setProgress(progressValue);
      setActiveOnboarding(!isComplete);
      setIsLoading(false);
    } catch (e: unknown) {
      let errorMsg = "Failed to load onboarding progress";
      if (typeof e === "string") {
        errorMsg = e;
      } else if (e instanceof Error) {
        errorMsg = e.message || "Failed to load onboarding progress";
      }
      setError(errorMsg);
      setIsLoading(false);
      setActiveOnboarding(false);
      setProgress(0);
    }
  }, [user, profile]);

  return { isLoading, progress, activeOnboarding, error };
}
