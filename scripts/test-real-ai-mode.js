/**
 * Test Real AI Mode in Idea Playground
 * 
 * This script tests the Real AI generation capability in the Idea Playground
 * by enabling the Real AI feature flag and then initiating a test generation.
 */

const { featureFlagsService } = require('../src/lib/services/feature-flags.service');
const { sequentialGenerationService } = require('../src/lib/services/idea-playground/ai');

// Mock idea for testing
const testIdea = {
  id: 'test-idea-' + Date.now(),
  title: 'Test Idea for Real AI Generation',
  description: 'This is a test idea to verify that real AI generation is working correctly.',
  problem_statement: 'The problem is testing AI generation without mock data.',
  solution_concept: 'Use the sequential generation service directly to generate ideas.'
};

/**
 * Enable Real AI and run a test generation
 */
async function testRealAIMode() {
  console.log('==== IDEA PLAYGROUND REAL AI MODE TEST ====');
  console.log('Enabling Real AI feature flag...');
  
  try {
    // First, enable the Real AI feature flag
    await featureFlagsService.saveFeatureFlags({
      useRealAI: { enabled: true, visible: true },
      useMockAI: { enabled: false, visible: true }
    });
    
    // Reset the LLM service to use the new feature flags
    featureFlagsService.resetLLMService();
    console.log('✓ Real AI feature flag enabled successfully');
    
    // Wait a moment to make sure services are initialized
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\nStarting test generation with test idea:');
    console.log(`Title: ${testIdea.title}`);
    console.log(`Description: ${testIdea.description}`);
    console.log('\nGenerating ideas sequentially...');
    
    // Set up a progress callback to show realtime progress
    const progressCallback = (suggestion, isMock, index, total) => {
      console.log(`\n✓ Generated suggestion #${index + 1}/${total}:`);
      console.log(`  Title: ${suggestion.title}`);
      console.log(`  Type: ${isMock ? 'MOCK (Error!)' : 'AI-GENERATED (Correct)'}`);
    };
    
    // Run the sequential generation
    const startTime = Date.now();
    const suggestions = await sequentialGenerationService.generateSuggestionsSequentially(
      testIdea,
      'test-user',
      3, // Generate 3 suggestions for the test
      progressCallback
    );
    const endTime = Date.now();
    
    console.log('\n==== GENERATION RESULTS ====');
    console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log(`Total suggestions generated: ${suggestions.length}`);
    
    if (suggestions.length > 0) {
      console.log('\nSUCCESS: Ideas were generated successfully using Real AI');
      
      // Print summaries of all generated suggestions
      console.log('\nGenerated Suggestions:');
      suggestions.forEach((suggestion, i) => {
        console.log(`\n[${i + 1}] ${suggestion.title}`);
        console.log(`    ${suggestion.description}`);
      });
    } else {
      console.log('\nWARNING: No suggestions were generated. This could indicate an issue with the AI service.');
    }
    
  } catch (error) {
    console.error('\nERROR: Test failed with error:', error);
  }
  
  console.log('\n==== TEST COMPLETE ====');
}

// Run the test
testRealAIMode();
