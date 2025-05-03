const { featureFlagsService } = require('../src/lib/services/feature-flags.service');

/**
 * Enable Real AI for the Idea Playground
 * This script enables the Real AI feature flag and disables the Mock AI flag
 */
async function enableRealAI() {
  try {
    console.log('Enabling Real AI and disabling Mock AI...');
    
    // Enable the Real AI feature flag
    await featureFlagsService.saveFeatureFlags({
      useRealAI: { enabled: true, visible: true },
      useMockAI: { enabled: false, visible: true }
    });
    
    // Reset the LLM service to use the new feature flags
    featureFlagsService.resetLLMService();
    
    console.log('Feature flags updated successfully.');
    console.log('Real AI is now enabled!');
  } catch (error) {
    console.error('Error enabling Real AI:', error);
  }
}

// Run the function
enableRealAI();
