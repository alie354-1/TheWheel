const { featureFlagsService } = require('../src/lib/services/feature-flags.service');

/**
 * Toggle between Real AI and Mock AI for the Idea Playground
 * This script allows switching between AI generation modes
 */
async function toggleAIMode() {
  try {
    // First check current state to determine which way to toggle
    const { featureFlags } = require('../src/lib/store').useAuthStore.getState();
    
    // Determine current state
    const isRealAIEnabled = featureFlags.useRealAI?.enabled === true;
    const isMockAIEnabled = featureFlags.useMockAI?.enabled === true;
    
    if (isRealAIEnabled) {
      // If Real AI is currently enabled, switch to Mock AI
      console.log('Current mode: Real AI (pure AI-generated suggestions, no examples)');
      console.log('Switching to Mock AI mode...');
      
      await featureFlagsService.saveFeatureFlags({
        useRealAI: { enabled: false, visible: true },
        useMockAI: { enabled: true, visible: true }
      });
      
      console.log('✓ Mock AI mode activated');
      console.log('Now using mock examples when needed to ensure you always get the requested number of suggestions');
    } else {
      // If Real AI is not enabled, switch to Real AI mode
      console.log('Current mode: Mock AI (includes examples when needed)');
      console.log('Switching to Real AI mode...');
      
      await featureFlagsService.saveFeatureFlags({
        useRealAI: { enabled: true, visible: true },
        useMockAI: { enabled: false, visible: true }
      });
      
      console.log('✓ Real AI mode activated');
      console.log('Now using only genuine AI-generated suggestions, no examples');
    }
    
    // Reset the LLM service to use the new feature flags
    featureFlagsService.resetLLMService();
    console.log('LLM service reset to use new settings');
    
  } catch (error) {
    console.error('Error toggling AI mode:', error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  const mode = args[0].toLowerCase();
  
  if (mode === 'real' || mode === 'realai') {
    // Explicitly enable Real AI
    enableRealAI();
  } else if (mode === 'mock' || mode === 'mockai') {
    // Explicitly enable Mock AI
    enableMockAI();
  } else {
    console.log(`Unrecognized mode: ${mode}`);
    console.log('Available options: "real" or "mock". Default: toggle between modes.');
    console.log('Toggling current mode instead...');
    toggleAIMode();
  }
} else {
  // No arguments, just toggle
  toggleAIMode();
}

/**
 * Explicitly enable Real AI
 */
async function enableRealAI() {
  try {
    console.log('Enabling Real AI mode...');
    
    // Enable the Real AI feature flag
    await featureFlagsService.saveFeatureFlags({
      useRealAI: { enabled: true, visible: true },
      useMockAI: { enabled: false, visible: true }
    });
    
    // Reset the LLM service to use the new feature flags
    featureFlagsService.resetLLMService();
    
    console.log('✓ Real AI mode activated');
    console.log('Now using only genuine AI-generated suggestions, no examples');
  } catch (error) {
    console.error('Error enabling Real AI:', error);
  }
}

/**
 * Explicitly enable Mock AI
 */
async function enableMockAI() {
  try {
    console.log('Enabling Mock AI mode...');
    
    // Enable the Mock AI feature flag
    await featureFlagsService.saveFeatureFlags({
      useRealAI: { enabled: false, visible: true },
      useMockAI: { enabled: true, visible: true }
    });
    
    // Reset the LLM service to use the new feature flags
    featureFlagsService.resetLLMService();
    
    console.log('✓ Mock AI mode activated');
    console.log('Now using mock examples when needed to ensure you always get suggestions');
  } catch (error) {
    console.error('Error enabling Mock AI:', error);
  }
}
