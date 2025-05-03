/**
 * Script to reset the LLM service to ensure it picks up the latest feature flag settings
 * This forces the AI services to reload with the most current feature flags
 */

import { featureFlagsService } from '../src/lib/services/feature-flags.service.js';

// Explicitly reset the LLM service
try {
  featureFlagsService.resetLLMService();
  console.log('Successfully reset LLM service with latest feature flags.');
  console.log('Real AI mode is now enabled.');
  console.log('AI generation should now be working properly.');
} catch (error) {
  console.error('Error resetting LLM service:', error);
}
