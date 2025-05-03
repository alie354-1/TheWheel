
/**
 * Simple script to fix AI feature flags and ensure AI generation works
 */

// Import the store - using ES module syntax
import { useAuthStore } from '../src/lib/store.js';

// Set the feature flags directly
try {
  // Get the setFeatureFlags function from the store
  const { setFeatureFlags } = useAuthStore.getState();
  
  // Update the feature flags
  setFeatureFlags({
    useRealAI: { enabled: true },
    useMockAI: { enabled: true }
  });
  
  console.log('Feature flags updated:');
  console.log('- useRealAI: enabled = true');
  console.log('- useMockAI: enabled = true');
  console.log('AI generation should now be working properly.');
  console.log('Note: This change is only in memory - restart the app to apply permanently.');
} catch (error) {
  console.error('Error setting feature flags:', error);
}
