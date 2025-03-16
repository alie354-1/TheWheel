import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore } from './lib/store';
import { featureFlagsService } from './lib/services/feature-flags.service';
import App from './App.tsx';
import './index.css';

// Initialize auth state and feature flags
const initApp = async () => {
  try {
    // Get initial session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const { setUser, fetchProfile } = useAuthStore.getState();

    if (session?.user) {
      setUser(session.user);
      await fetchProfile(session.user.id);
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    // Load feature flags from the database
    await featureFlagsService.loadFeatureFlags();
    
    // Reset the LLM service to use the latest feature flags
    featureFlagsService.resetLLMService();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

// Initialize app and render
initApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Router>
        <App />
      </Router>
    </StrictMode>
  );
});
