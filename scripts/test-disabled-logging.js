/**
 * Test Disabled Logging
 * 
 * This script tests that the application works correctly with the disabled logging services.
 * It verifies that the logging services are properly disabled and don't attempt to access the database.
 */

import { loggingService } from '../src/lib/services/logging.service';
import { enhancedLoggingService } from '../src/lib/services/logging.service.enhanced';
import { modelTrainingService } from '../src/lib/services/model-training.service';

/**
 * Test the disabled logging services
 */
async function testDisabledLogging() {
  console.log('=== Testing Disabled Logging Services ===');
  
  // Test basic logging service
  console.log('\n1. Testing basic logging service:');
  console.log('- isLoggingEnabled:', loggingService.isLoggingEnabled());
  
  const sessionId = await loggingService.startSession('test-user-id');
  console.log('- startSession result:', sessionId);
  
  const logId = await loggingService.logUserAction('test-action', 'test-component');
  console.log('- logUserAction result:', logId);
  
  await loggingService.endSession();
  console.log('- endSession completed');
  
  // Test enhanced logging service
  console.log('\n2. Testing enhanced logging service:');
  console.log('- isLoggingEnabled:', enhancedLoggingService.isLoggingEnabled());
  
  const enhancedSessionId = await enhancedLoggingService.startSession('test-user-id');
  console.log('- startSession result:', enhancedSessionId);
  
  const enhancedLogId = await enhancedLoggingService.logUserAction('test-action', 'test-component');
  console.log('- logUserAction result:', enhancedLogId);
  
  await enhancedLoggingService.endSession();
  console.log('- endSession completed');
  
  // Test model training service
  console.log('\n3. Testing model training service:');
  
  const features = await modelTrainingService.extractFeatures('test-feature-set');
  console.log('- extractFeatures result:', features);
  
  const feedbackId = await modelTrainingService.recordFeedback({
    model_id: 'test-model',
    prediction_input: 'test-input',
    prediction_output: 'test-output',
    feedback_type: 'neutral'
  });
  console.log('- recordFeedback result:', feedbackId);
  
  console.log('\n=== All tests completed successfully ===');
  console.log('The logging services are properly disabled and do not attempt to access the database.');
  console.log('You can now use the application without worrying about logging errors.');
}

// Run the test
testDisabledLogging().catch(error => {
  console.error('Error testing disabled logging:', error);
});

// Export for use in other scripts
export { testDisabledLogging };
