/**
 * Test Script for Tool Selection Service
 * 
 * This script tests the functionality of the toolSelection.service.ts methods
 * to verify they correctly work with the journey steps data model.
 */

import { supabase } from '../src/lib/supabase';
import * as toolSelectionService from '../src/lib/services/toolSelection.service';

// Configuration
const TEST_COMPANY_ID = 'test-company-123';
const TEST_STEP_ID = 'test-step-456';
const TEST_USER_ID = 'test-user-789';

// Utility function to log test results
function logTestResult(testName, success, details = null) {
  if (success) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.log(`❌ FAIL: ${testName}`);
    if (details) {
      console.error(`   Error details: ${details}`);
    }
  }
}

// Test getStepTools
async function testGetStepTools() {
  try {
    console.log('\n📋 Testing getStepTools...');
    const result = await toolSelectionService.getStepTools(TEST_STEP_ID);
    
    const success = 
      result && 
      result.data !== undefined && 
      Array.isArray(result.data) && 
      !result.error;
    
    logTestResult('getStepTools', success);
    
    // Log response data
    console.log(`   Found ${result.data?.length || 0} tools for step ${TEST_STEP_ID}`);
    return success;
  } catch (error) {
    logTestResult('getStepTools', false, error.message);
    return false;
  }
}

// Test getPersonalizedToolRecommendations
async function testPersonalizedRecommendations() {
  try {
    console.log('\n📋 Testing getPersonalizedToolRecommendations...');
    const result = await toolSelectionService.getPersonalizedToolRecommendations(
      TEST_COMPANY_ID,
      TEST_STEP_ID
    );
    
    const success = 
      result && 
      result.data !== undefined && 
      Array.isArray(result.data) && 
      !result.error;
    
    logTestResult('getPersonalizedToolRecommendations', success);
    
    // Check if tools have relevance_score property
    const hasRelevanceScores = 
      result.data?.length > 0 && 
      result.data.every(tool => typeof tool.relevance_score === 'number');
    
    logTestResult('Tools have relevance_score', hasRelevanceScores);
    
    // Log response data
    console.log(`   Found ${result.data?.length || 0} personalized recommendations`);
    
    return success;
  } catch (error) {
    logTestResult('getPersonalizedToolRecommendations', false, error.message);
    return false;
  }
}

// Test custom tool functionality
async function testCustomToolFunctionality() {
  try {
    console.log('\n📋 Testing custom tool functionality...');
    
    // Get existing custom tools first
    const existingResult = await toolSelectionService.getCompanyCustomTools(
      TEST_COMPANY_ID, 
      TEST_STEP_ID
    );
    
    const initialCount = existingResult.data?.length || 0;
    console.log(`   Initially found ${initialCount} custom tools`);
    
    // Add a custom tool
    const testTool = {
      name: 'Test Custom Tool ' + Date.now(),
      url: 'https://example.com/test-tool',
      description: 'This is a test custom tool created by the test script'
    };
    
    const addResult = await toolSelectionService.addCompanyCustomTool(
      TEST_COMPANY_ID,
      TEST_STEP_ID,
      testTool
    );
    
    const addSuccess = 
      addResult && 
      addResult.data && 
      !addResult.error;
    
    logTestResult('addCompanyCustomTool', addSuccess);
    
    // Get custom tools again to verify addition
    const updatedResult = await toolSelectionService.getCompanyCustomTools(
      TEST_COMPANY_ID, 
      TEST_STEP_ID
    );
    
    const updatedCount = updatedResult.data?.length || 0;
    const verifySuccess = updatedCount > initialCount;
    
    logTestResult('Verify custom tool addition', verifySuccess);
    console.log(`   Found ${updatedCount} custom tools after addition`);
    
    return addSuccess && verifySuccess;
  } catch (error) {
    logTestResult('Custom tool functionality', false, error.message);
    return false;
  }
}

// Test scorecard functionality
async function testScorecardFunctionality() {
  try {
    console.log('\n📋 Testing scorecard functionality...');
    
    // Create test scorecard
    const criteria = [
      { name: 'Ease of Use', weight: 3 },
      { name: 'Features', weight: 4 },
      { name: 'Value', weight: 5 }
    ];
    
    const scorecardResult = await toolSelectionService.saveScorecardDefinition(
      TEST_COMPANY_ID,
      '', // No specific tool ID for this test
      TEST_STEP_ID,
      criteria,
      TEST_USER_ID,
      'Test Scorecard ' + Date.now()
    );
    
    const createSuccess = 
      scorecardResult && 
      !scorecardResult.error;
    
    logTestResult('saveScorecardDefinition', createSuccess);
    
    // Get scorecards to verify
    const getResult = await toolSelectionService.getScorecardDefinitions(
      TEST_COMPANY_ID,
      TEST_STEP_ID
    );
    
    const getSuccess = 
      getResult && 
      getResult.data && 
      Array.isArray(getResult.data) && 
      getResult.data.length > 0 && 
      !getResult.error;
    
    logTestResult('getScorecardDefinitions', getSuccess);
    console.log(`   Found ${getResult.data?.length || 0} scorecards`);
    
    return createSuccess && getSuccess;
  } catch (error) {
    logTestResult('Scorecard functionality', false, error.message);
    return false;
  }
}

// Test tool selection
async function testToolSelection() {
  try {
    console.log('\n📋 Testing tool selection...');
    
    // Get step tools to find a valid tool ID
    const toolsResult = await toolSelectionService.getStepTools(TEST_STEP_ID);
    if (!toolsResult.data || toolsResult.data.length === 0) {
      console.log('   No tools found for testing tool selection');
      return false;
    }
    
    const testToolId = toolsResult.data[0].id;
    
    // Select the tool for the step
    const selectResult = await toolSelectionService.selectCompanyToolForStep(
      TEST_COMPANY_ID,
      TEST_STEP_ID,
      testToolId
    );
    
    const selectSuccess = 
      selectResult && 
      !selectResult.error;
    
    logTestResult('selectCompanyToolForStep', selectSuccess);
    
    return selectSuccess;
  } catch (error) {
    logTestResult('Tool selection', false, error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Tool Selection Service Tests');
  console.log('=======================================');
  
  let passCount = 0;
  let totalTests = 5;
  
  // Run all tests
  if (await testGetStepTools()) passCount++;
  if (await testPersonalizedRecommendations()) passCount++;
  if (await testCustomToolFunctionality()) passCount++;
  if (await testScorecardFunctionality()) passCount++;
  if (await testToolSelection()) passCount++;
  
  // Print summary
  console.log('\n=======================================');
  console.log(`Test Summary: ${passCount}/${totalTests} tests passed`);
  
  // Check if all tests passed
  if (passCount === totalTests) {
    console.log('✅ All tests passed! Tool Selection Service is working correctly with steps data model.');
  } else {
    console.log(`❌ ${totalTests - passCount} tests failed. Please check the errors above.`);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});

// Export for use in other scripts if needed
export {
  testGetStepTools,
  testPersonalizedRecommendations,
  testCustomToolFunctionality,
  testScorecardFunctionality,
  testToolSelection,
  runTests
};
