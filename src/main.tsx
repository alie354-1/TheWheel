import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { authService } from './lib/services/auth.service';
import { useAuthStore } from './lib/store';
import { featureFlagsService } from './lib/services/feature-flags.service';
import App from './App.tsx';
import './index.css';

// Initialize auth state and feature flags
const initApp = async () => {
  try {
    console.log('Initializing application...');
    
    // Get initial session with improved error handling
    const { data: { session }, error: sessionError } = await authService.getSession();
    
    if (sessionError) {
      console.error('Session error during initialization:', sessionError);
      // Continue initialization even with session error
    }

    const { setUser, fetchProfile } = useAuthStore.getState();

    if (session?.user) {
      console.log('User session found, setting up user state');
      // Cast the Supabase user to our User type with required fields
      const appUser = {
        ...session.user,
        email: session.user.email || '', // Ensure email is never undefined
        created_at: session.user.created_at || new Date().toISOString(),
        updated_at: session.user.updated_at || new Date().toISOString()
      };
      setUser(appUser);
      
      try {
        await fetchProfile(session.user.id);
        console.log('User profile loaded successfully');
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Continue with partial user data
      }
    } else {
      console.log('No active user session found');
    }

    // Listen for auth changes with improved error handling
    const authListener = authService.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          console.log('User signed in or token refreshed');
          // Cast the Supabase user to our User type with required fields
          const appUser = {
            ...session.user,
            email: session.user.email || '', // Ensure email is never undefined
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: session.user.updated_at || new Date().toISOString()
          };
          setUser(appUser);
          
          try {
            await fetchProfile(session.user.id);
          } catch (profileError) {
            console.error('Error fetching profile after auth change:', profileError);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
      }
    });
    
    // Check for error in auth listener setup
    if ('error' in authListener && authListener.error) {
      console.error('Error setting up auth listener:', authListener.error);
    }
    
    // Load feature flags with error handling
    try {
      await featureFlagsService.loadFeatureFlags();
      console.log('Feature flags loaded successfully');
      
      // Reset the LLM service to use the latest feature flags
      featureFlagsService.resetLLMService();
    } catch (flagsError) {
      console.error('Error loading feature flags:', flagsError);
      // Continue with default flags
    }
    
    console.log('Application initialization completed');
  } catch (error) {
    console.error('Critical error during app initialization:', error);
    // Display error UI if needed
  }
};

// Initialize app and render with error boundary
initApp().then(() => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found!');
    return;
  }
  
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <Router>
          <App />
        </Router>
      </StrictMode>
    );
    console.log('React application rendered successfully');
  } catch (renderError) {
    console.error('Error rendering React application:', renderError);
    
    // Fallback error display
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Application Error</h2>
        <p>There was a problem starting the application. Please try refreshing the page.</p>
        <button onclick="window.location.reload()">Refresh Page</button>
      </div>
    `;
  }
});
