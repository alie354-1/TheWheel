import React from 'react';
import { Link } from 'react-router-dom';
import { SimpleProgressBar } from './onboarding/SimpleProgressBar.tsx';
import { AuthGuard } from './auth/AuthGuard.tsx';
import { useOnboardingProgress } from '../lib/hooks/useOnboardingProgress.ts';

const OnboardingProgressCard = () => {
  const { isLoading, progress, activeOnboarding, error } = useOnboardingProgress();

  // Show loading state
  if (isLoading) {
    return (
      <AuthGuard requireAuth>
        <div className="bg-base-100 shadow-md rounded-lg p-4 mb-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-base-300 rounded w-3/4"></div>
              <div className="h-4 bg-base-300 rounded w-1/2"></div>
              <div className="h-2 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Don't show anything if onboarding is complete and no errors
  if (!activeOnboarding && progress === 100 && !error) {
    return null;
  }

  return (
    <AuthGuard requireAuth>
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
    </AuthGuard>
  );
};

export default OnboardingProgressCard;
