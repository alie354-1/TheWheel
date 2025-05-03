/**
 * Debug script for troubleshooting the idea-pathway AI functionality
 */

const { ideaPlaygroundPathwayService } = require('../src/lib/services/idea-playground-pathway.service');
const { generalLLMService } = require('../src/lib/services/general-llm.service');
const { supabase } = require('../src/lib/supabase');

// Test user ID and idea ID
const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user';
const TEST_IDEA_ID = process.argv[2]; // Pass idea ID as first argument

if (!TEST_IDEA_ID) {
  console.error('Error: Please provide an idea ID as the first argument');
  console.log('Usage: node debug-idea-pathway-ai.js <idea_id>');
  process.exit(1);
}

// Wrapper to catch and log errors
const runWithErrorHandling = async (fn, ...args) => {
  try {
    console.log(`Running ${fn.name} with args:`, ...args);
    const result = await fn(...args);
    console.log(`${fn.name} result:`, result);
    return result;
  } catch (err) {
    console.error(`Error in ${fn.name}:`, err);
    throw err;
  }
};

// Function to fetch the idea details
const getIdeaDetails = async (ideaId) => {
  console.log(`Fetching idea details for ID: ${ideaId}`);
  
  try {
    const { data: idea, error } = await supabase
      .from('idea_playground_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('Idea details:', idea);
    return idea;
  } catch (err) {
    console.error('Error fetching idea:', err);
    throw err;
  }
};

// Function to test the variation generation
const testVariationGeneration = async (userId, ideaId) => {
  console.log('\n=== Testing Variation Generation ===\n');
  
  const idea = await getIdeaDetails(ideaId);
  
  if (!idea) {
    console.error('Could not find idea with ID:', ideaId);
    return;
  }
  
  console.log('Testing pathway service generateIdeaVariations method...');
  try {
    const params = {
      idea_id: ideaId,
      count: 3
    };
    
    console.log('Calling with params:', params);
    const variations = await runWithErrorHandling(
      ideaPlaygroundPathwayService.generateIdeaVariations,
      userId,
      params
    );
    
    console.log(`Generated ${variations?.length || 0} variations`);
    
    return variations;
  } catch (err) {
    console.error('Failed to generate variations:', err);
  }
};

// Function to test the LLM service directly
const testLLMService = async (userId, idea) => {
  console.log('\n=== Testing LLM Service ===\n');
  
  try {
    const promptTemplate = `
    Create 3 distinct and innovative variations of the following business idea:
    
    Original Idea: ${idea.title}
    Description: ${idea.description || 'Not provided'}
    Problem Statement: ${idea.problem_statement || 'Not provided'}
    Solution Concept: ${idea.solution_concept || 'Not provided'}
    
    Return the variations in JSON format.
    `;
    
    console.log('Testing LLM service with prompt:', promptTemplate);
    
    const response = await runWithErrorHandling(
      generalLLMService.query,
      promptTemplate,
      { userId }
    );
    
    console.log('LLM response:', response);
    
    return response;
  } catch (err) {
    console.error('Failed to query LLM service:', err);
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log(`\n=== Starting Idea Pathway AI Debug ===\n`);
    console.log(`Test User ID: ${TEST_USER_ID}`);
    console.log(`Test Idea ID: ${TEST_IDEA_ID}\n`);
    
    // Fetch idea details
    const idea = await getIdeaDetails(TEST_IDEA_ID);
    
    // Test variation generation
    const variations = await testVariationGeneration(TEST_USER_ID, TEST_IDEA_ID);
    
    // If variation generation failed, test LLM service directly
    if (!variations || variations.length === 0) {
      console.log('\nVariation generation failed or returned empty result. Testing LLM service directly...');
      await testLLMService(TEST_USER_ID, idea);
    }
    
    console.log('\n=== Debug Complete ===\n');
  } catch (err) {
    console.error('Test failed:', err);
  }
};

// Run the tests
runTests();
