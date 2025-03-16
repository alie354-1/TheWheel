import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OnboardingController from '../components/onboarding/OnboardingController';
import { useAuthStore } from '../lib/store';
import { multiPersonaProfileService } from '../lib/services/multi-persona-profile.service';

const OnboardingPage: React.FC = () => {
  const { personaId } = useParams<{ personaId?: string }>();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // We no longer require a personaId to start the onboarding process
  // The controller will handle persona creation during the onboarding flow
  
  return (
    <div className="min-h-screen bg-gray-100">
      <OnboardingController initialPersonaId={personaId} />
    </div>
  );
};

export default OnboardingPage;
