import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { getFeatureFlagsService } from './lib/services/registry.ts';
import App from './App.tsx';
import './index.css';

// Initialize feature flags only
const initApp = async () => {
  try {
    console.log('Initializing application...');
    
    // Load feature flags with error handling
    try {
      const featureFlagsService = getFeatureFlagsService();
      await featureFlagsService.loadFeatureFlags();
      console.log('Feature flags loaded successfully');
      
      // Feature flags loaded successfully - no need to reset LLM service
      console.log('Feature flags service initialized');
    } catch (flagsError) {
      console.error('Feature flags initialization error:', flagsError);
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
