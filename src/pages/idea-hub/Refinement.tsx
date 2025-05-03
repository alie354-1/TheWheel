import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store';
import { IdeaProvider } from '../../lib/contexts/IdeaContext';
import IdeaRefinementWorkflow from '../../components/idea-refinement/IdeaRefinementWorkflow';
import { useLocation } from 'react-router-dom';

// Mock user for testing
const mockUser = {
  id: 'test-user-id',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'test@example.com',
  role: 'authenticated'
};

// Mock profile for testing
const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  role: 'admin' as 'admin',
  is_public: true,
  allows_messages: true,
  settings: {}
};

export default function Refinement() {
  // Set the mock user and profile in the auth store if user is not logged in
  const { user, profile, setUser, setProfile } = useAuthStore();
  const [key, setKey] = useState(0);
  const location = useLocation();
  const [initialStep, setInitialStep] = useState(0);
  
  // Parse the step and ideaId from the URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const stepParam = searchParams.get('step');
    const ideaIdParam = searchParams.get('ideaId');
    
    if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (!isNaN(step) && step >= 0 && step < 5) {
        console.log('Setting initial step from URL:', step);
        setInitialStep(step);
      }
    }
    
    // If ideaId is provided, store it in localStorage for the IdeaContext to use
    if (ideaIdParam) {
      console.log('Setting ideaId from URL:', ideaIdParam);
      localStorage.setItem('refinement_idea_id', ideaIdParam);
    }
  }, [location.search]);
  
  useEffect(() => {
    if (!user) {
      console.log('Setting mock user and profile');
      setUser(mockUser);
      setProfile(mockProfile);
    }
  }, [user, profile, setUser, setProfile]);
  
  // Force re-render when the component mounts
  useEffect(() => {
    // Increment the key to force a re-render
    setKey(prevKey => prevKey + 1);
  }, []);
  
  return (
    <IdeaProvider key={`idea-provider-${key}`} initialStep={initialStep}>
      <IdeaRefinementWorkflow key={`idea-workflow-${key}`} />
    </IdeaProvider>
  );
}
