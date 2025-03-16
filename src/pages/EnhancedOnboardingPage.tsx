import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { EnhancedOnboardingWizard } from '../components/onboarding/EnhancedOnboardingWizard';

export const EnhancedOnboardingPage: React.FC = () => {
  const isAuthenticated = useAuthStore(state => !!state.user);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedOnboardingWizard />
    </div>
  );
};

export default EnhancedOnboardingPage;
