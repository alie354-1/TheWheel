/**
 * Test script for the streaming suggestions implementation
 * This script tests the enhanced sequential generation service's ability
 * to stream suggestions and use fallbacks appropriately
 */

const { sequentialGenerationService } = require('../src/lib/services/idea-playground/ai');
const { ideaPathway1AIService } = require('../src/lib/services/idea-pathway1-ai.service');

/**
 * Mock example idea
 */
const testIdea = {
  id: 'test-idea-12345',
  title: 'Smart Home Energy Optimizer',
  description: 'A system that optimizes energy usage in homes by learning patterns and preferences.',
  problem_statement: 'Home energy usage is inefficient and costs homeowners money.',
  solution_concept: 'Using AI to learn patterns and automatically adjust energy usage.',
  target_audience: ['Homeowners', 'Environmentally conscious consumers']
};

/**
 * Test the streaming generation process
 */
async function testStreamingGeneration() {
  console.log('=== Testing Streaming Suggestions Generation ===');
  console.log('This tests the new sequential generation implementation with fallbacks\n');
  
  // Track received suggestions for verification
  const receivedSuggestions = [];
  let lastIndex = -1;
  let totalCount = 0;
  
  // Progress callback to process incoming suggestion streams
  const progressCallback = (suggestion, isMock, index, count) => {
    totalCount = count;
    
    // Verify that suggestions come in a coherent order
    if (index <= lastIndex) {
      console.log(`WARNING: Out of order suggestion at index ${index} (last was ${lastIndex})`);
    }
    lastIndex = index;
    
    // Log the received suggestion
    console.log(`\nReceived suggestion #${index + 1} of ${count}:`);
    console.log(`- Title: ${suggestion.title}`);
    console.log(`- Type: ${isMock ? 'MOCK (fallback)' : 'AI-GENERATED'}`);
    console.log(`- Position: ${index + 1}/${count}`);
    
    // Store for verification
    receivedSuggestions.push({
      suggestion,
      isMock,
      index
    });
    
    // Calculate and display progress
    const progress = Math.round((receivedSuggestions.length / count) * 100);
    process.stdout.write(`\r[${Array(progress/5).fill('█').join('')}${Array(20 - progress/5).fill('░').join('')}] ${progress}% complete`);
  };
  
  try {
    console.log('Testing generation of 4 suggestions...');
    console.log('Each suggestion will arrive as it is generated.\n');
    
    // Generate suggestions using the sequential service
    const result = await sequentialGenerationService.generateSuggestionsSequentially(
      testIdea,
      'test-user-123',
      4,
      progressCallback
    );
    
    console.log('\n\n=== Generation Complete ===');
    console.log(`Total suggestions generated: ${result.length}`);
    console.log(`Real AI suggestions: ${receivedSuggestions.filter(s => !s.isMock).length}`);
    console.log(`Mock fallback suggestions: ${receivedSuggestions.filter(s => s.isMock).length}`);
    
    // Verify all positions are filled
    const positions = new Set(receivedSuggestions.map(s => s.index));
    const expectedPositions = new Set(Array.from({ length: totalCount }, (_, i) => i));
    
    const missingPositions = [...expectedPositions].filter(p => !positions.has(p));
    if (missingPositions.length > 0) {
      console.log(`WARNING: Missing suggestions at positions: ${missingPositions.join(', ')}`);
    } else {
      console.log('All expected positions are filled correctly.');
    }
    
    console.log('\nTest complete!');
    
  } catch (error) {
    console.error('Error during streaming test:', error);
  }
}

// Run the test
testStreamingGeneration();
