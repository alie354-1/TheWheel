import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingController from '../components/onboarding/OnboardingController';
import { useAuthStore } from '../lib/store';

const OnboardingPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Log for debugging purposes
  useEffect(() => {
    console.log('Starting onboarding flow');
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <OnboardingController />
    </div>
  );
};

export default OnboardingPage;
