// Test script to verify the standup bot fix
import { ideaMemoryService } from '../src/lib/services/idea-memory.service.js';

async function testStandupFix() {
  console.log('Testing standup fix...');
  
  try {
    // Test the isFeatureEnabled method with 'standup' context
    const result = await ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', 'test-user', 'standup');
    console.log('Result for standup context:', result);
    
    // Test the isFeatureEnabled method with 'idea_refinement' context
    const result2 = await ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', 'test-user', 'idea_refinement');
    console.log('Result for idea_refinement context:', result2);
    
    // Test the isFeatureEnabled method with no context
    const result3 = await ideaMemoryService.isFeatureEnabled('enhanced_idea_generation', 'test-user');
    console.log('Result for no context:', result3);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testStandupFix();
