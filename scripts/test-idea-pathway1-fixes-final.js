// Test script to verify the fixes for the idea-pathway1-ai.service.ts and SuggestionsScreen component
// This test focuses on handling null/undefined values properly

// Using CommonJS require since we're running directly with node
const { ideaPathway1AIService } = require('../src/lib/services/idea-pathway1-ai.service');

// Test with valid idea
const validIdea = {
  id: 'test-idea-1',
  title: 'Test Idea',
  description: 'This is a test idea',
  problem_statement: 'Testing problem',
  solution_concept: 'Testing solution',
  used_company_context: false,
  canvas_id: 'test-canvas'
};

// Test with undefined idea
const undefinedIdeaTest = async () => {
  console.log('=== Testing with undefined idea ===');
  try {
    const result = await ideaPathway1AIService.generateCompanySuggestions(
      undefined, 
      'test-user', 
      3
    );
    console.log('Result with undefined idea:', result.length, 'mock suggestions generated');
    console.log('✅ Test passed: Service handles undefined idea gracefully');
  } catch (error) {
    console.error('❌ Test failed with undefined idea:', error);
  }
};

// Test with null idea
const nullIdeaTest = async () => {
  console.log('\n=== Testing with null idea ===');
  try {
    const result = await ideaPathway1AIService.generateCompanySuggestions(
      null, 
      'test-user', 
      3
    );
    console.log('Result with null idea:', result.length, 'mock suggestions generated');
    console.log('✅ Test passed: Service handles null idea gracefully');
  } catch (error) {
    console.error('❌ Test failed with null idea:', error);
  }
};

// Test with incomplete idea (missing fields)
const incompleteIdeaTest = async () => {
  console.log('\n=== Testing with incomplete idea ===');
  const incompleteIdea = {
    id: 'test-idea-2',
    title: 'Incomplete Idea',
    // Missing most fields
  };
  
  try {
    const result = await ideaPathway1AIService.generateCompanySuggestions(
      incompleteIdea, 
      'test-user', 
      3
    );
    console.log('Result with incomplete idea:', result.length, 'suggestions generated');
    console.log('✅ Test passed: Service handles incomplete idea gracefully');
  } catch (error) {
    console.error('❌ Test failed with incomplete idea:', error);
  }
};

// Test with valid idea
const validIdeaTest = async () => {
  console.log('\n=== Testing with valid idea ===');
  try {
    const result = await ideaPathway1AIService.generateCompanySuggestions(
      validIdea, 
      'test-user', 
      3
    );
    console.log('Result with valid idea:', result.length, 'suggestions generated');
    console.log('✅ Test passed: Service handles valid idea correctly');
  } catch (error) {
    console.error('❌ Test failed with valid idea:', error);
  }
};

// Run all tests sequentially
const runAllTests = async () => {
  console.log('Starting idea-pathway1-ai service tests...\n');
  
  await undefinedIdeaTest();
  await nullIdeaTest();
  await incompleteIdeaTest();
  await validIdeaTest();
  
  console.log('\nAll tests completed!');
};

// Execute tests
runAllTests();
