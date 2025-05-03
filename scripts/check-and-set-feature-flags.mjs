/**
 * Script to check current feature flags and set them to enable AI features
 */

import { useAuthStore } from '../src/lib/store.js';

// Check current feature flags first
try {
  // Get the current flags
  const currentFlags = useAuthStore.getState().featureFlags;
  
  console.log('Current feature flags:');
  console.log(`- useRealAI: enabled = ${currentFlags.useRealAI.enabled}`);
  console.log(`- useMockAI: enabled = ${currentFlags.useMockAI.enabled}`);
  
  // Get the setFeatureFlags function from the store
  const { setFeatureFlags } = useAuthStore.getState();
  
  // Update the feature flags
  setFeatureFlags({
    useRealAI: { enabled: true },
    useMockAI: { enabled: true }
  });
  
  // Check the updated flags
  const updatedFlags = useAuthStore.getState().featureFlags;
  
  console.log('\nFeature flags after update:');
  console.log(`- useRealAI: enabled = ${updatedFlags.useRealAI.enabled}`);
  console.log(`- useMockAI: enabled = ${updatedFlags.useMockAI.enabled}`);
  
  console.log('\nAI generation should now be working properly with these settings.');
  console.log('Note: This change is only in memory - restart the app to apply the permanent fix in store.ts');
} catch (error) {
  console.error('Error with feature flags:', error);
}
