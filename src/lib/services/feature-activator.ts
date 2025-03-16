/**
 * Feature Activator Service
 * 
 * This service ensures that all required features are enabled for the Idea Playground
 * It runs client-side to complement the server-side script
 */

import { useAuthStore } from '../store';

/**
 * Activate all important features for the Idea Playground
 */
export function activateAllFeatures() {
  const { setFeatureFlags } = useAuthStore.getState();
  
  // Enhanced Idea Playground features with proper format for setFeatureFlags
  const updatedFeatures: Record<string, { enabled: boolean; visible: boolean }> = {
    useRealAI: { enabled: true, visible: true },
    multiTieredAI: { enabled: true, visible: true },
    showTeamCollaboration: { enabled: true, visible: true },
    showDashboard: { enabled: true, visible: true },
    showExportTools: { enabled: true, visible: true },
    showExternalTools: { enabled: true, visible: true },
    showPathwayIntegration: { enabled: true, visible: true },
    showIdeaWorkflow: { enabled: true, visible: true },
    useSmartSuggestions: { enabled: true, visible: true },
    useContextualAI: { enabled: true, visible: true },
    useOnboarding: { enabled: true, visible: true },
    enhancedIdeaPlayground: { enabled: false, visible: true },
    useMockAI: { enabled: false, visible: true }, // Set mock AI to false to use real AI
  };
  
  // Apply all feature flags at once
  setFeatureFlags(updatedFeatures);
  
  console.log('All features activated successfully!');
}

/**
 * Checks if required features are enabled, and enables them if not
 * Can be run on app initialization to ensure features are visible
 */
export function ensureFeaturesActivated() {
  const { featureFlags, setFeatureFlags } = useAuthStore.getState();
  
  // Core features that should always be enabled for testing
  const coreFeatures = [
    'showTeamCollaboration',
    'showDashboard',
    'showExportTools',
    'showExternalTools',
  ];
  
  let needsActivation = false;
  const updatedFlags: Record<string, { enabled: boolean; visible: boolean }> = {};
  
  // Check if core features are enabled
  coreFeatures.forEach(feature => {
    if (!featureFlags[feature]?.enabled) {
      needsActivation = true;
      console.log(`Critical feature "${feature}" is disabled, activating...`);
      updatedFlags[feature] = { enabled: true, visible: true };
    }
  });
  
  // Apply any needed changes
  if (Object.keys(updatedFlags).length > 0) {
    setFeatureFlags(updatedFlags);
  }
  
  // If any core features were disabled, ensure all features are activated
  if (needsActivation) {
    activateAllFeatures();
    return true;
  }
  
  return false;
}
