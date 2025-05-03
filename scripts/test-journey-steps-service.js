/**
 * Test script for Journey Steps Service Implementation
 * 
 * This script tests the new journey steps service implementation
 * against the existing data structure to verify compatibility.
 */

import { supabase } from "../src/lib/supabase.js";
import journeyStepsService from "../src/lib/services/journeySteps.service.js";

async function runTests() {
  console.log("🔍 Running Journey Steps Service Tests");
  console.log("======================================");

  try {
    // Test 1: Verify database views exist
    console.log("\n📊 Test 1: Verifying database views...");
    await testDatabaseViews();

    // Test 2: Verify mapping functions work
    console.log("\n🔄 Test 2: Verifying mapping functions...");
    await testMappingFunctions();
    
    // Test 3: Test service methods with real data
    console.log("\n⚙️ Test 3: Testing service methods...");
    await testServiceMethods();

    // Test 4: Test tool recommendations with steps
    console.log("\n🛠️ Test 4: Testing tool recommendations...");
    await testToolRecommendations();

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

async function testDatabaseViews() {
  // Check if journey_steps_enhanced view exists
  const { data: stepsEnhanced, error: stepsError } = await supabase
    .from("journey_steps_enhanced")
    .select("id")
    .limit(1);
    
  if (stepsError) {
    throw new Error(`journey_steps_enhanced view error: ${stepsError.message}`);
  }
  console.log(`✓ journey_steps_enhanced view exists and returns data`);

  // Check if company_step_progress view exists
  const { data: progressView, error: progressError } = await supabase
    .from("company_step_progress")
    .select("id")
    .limit(1);
    
  if (progressError) {
    throw new Error(`company_step_progress view error: ${progressError.message}`);
  }
  console.log(`✓ company_step_progress view exists and returns data`);
}

async function testMappingFunctions() {
  // Check if get_enhanced_step function exists
  const stepId = await getFirstStepId();
  if (!stepId) {
    throw new Error("No step IDs found in the database to test with");
  }
  
  const { data: enhancedStep, error: enhancedError } = await supabase
    .rpc("get_enhanced_step", { step_id: stepId });
    
  if (enhancedError) {
    throw new Error(`get_enhanced_step function error: ${enhancedError.message}`);
  }
  
  console.log(`✓ get_enhanced_step returns data for step ${stepId}`);
  console.log(`  - Step name: ${enhancedStep.name}`);
  
  // Check if get_personalized_step_tools function exists
  const companyId = await getFirstCompanyId();
  if (!companyId) {
    console.log(`⚠️ No company IDs found to test tool recommendations`);
    return;
  }
  
  const { data: toolRecs, error: toolRecsError } = await supabase
    .rpc("get_personalized_step_tools", { 
      company_id: companyId,
      step_id: stepId
    });
    
  if (toolRecsError) {
    throw new Error(`get_personalized_step_tools function error: ${toolRecsError.message}`);
  }
  
  console.log(`✓ get_personalized_step_tools returns recommendations for step ${stepId}`);
  console.log(`  - Number of recommendations: ${toolRecs?.length || 0}`);
}

async function testServiceMethods() {
  // Test getEnhancedSteps
  const steps = await journeyStepsService.getEnhancedSteps()
    .catch(error => {
      throw new Error(`getEnhancedSteps error: ${error.message}`);
    });
  
  console.log(`✓ getEnhancedSteps returns ${steps.length} steps`);
  
  // Test getStepsByPhase if there are steps
  if (steps.length > 0) {
    const phaseId = steps[0].phase_id;
    const phaseSteps = await journeyStepsService.getStepsByPhase(phaseId)
      .catch(error => {
        throw new Error(`getStepsByPhase error: ${error.message}`);
      });
    
    console.log(`✓ getStepsByPhase returns ${phaseSteps.length} steps for phase ${phaseId}`);
  }
  
  // Test getJourneyPhases
  const phases = await journeyStepsService.getJourneyPhases()
    .catch(error => {
      throw new Error(`getJourneyPhases error: ${error.message}`);
    });
  
  console.log(`✓ getJourneyPhases returns ${phases.length} phases`);
  
  // Test getEnhancedStep if there are steps
  if (steps.length > 0) {
    const stepId = steps[0].id;
    const stepDetail = await journeyStepsService.getEnhancedStep(stepId)
      .catch(error => {
        throw new Error(`getEnhancedStep error: ${error.message}`);
      });
    
    console.log(`✓ getEnhancedStep returns details for step ${stepId}`);
    console.log(`  - Step name: ${stepDetail.name}`);
  }
  
  // Test backward compatibility methods
  if (steps.length > 0) {
    const stepId = steps[0].id;
    const asChallenge = await journeyStepsService.getChallengeById(stepId)
      .catch(error => {
        throw new Error(`getChallengeById error: ${error.message}`);
      });
    
    console.log(`✓ Backward compatibility: getChallengeById works for step ${stepId}`);
    console.log(`  - Challenge name: ${asChallenge.name}`);
  }
}

async function testToolRecommendations() {
  const companyId = await getFirstCompanyId();
  const stepId = await getFirstStepId();
  
  if (!companyId || !stepId) {
    console.log(`⚠️ Missing data to test tool recommendations`);
    return;
  }
  
  try {
    const recommendations = await journeyStepsService.getPersonalizedToolRecommendations(companyId, stepId);
    console.log(`✓ getPersonalizedToolRecommendations returns ${recommendations.length} tools`);
    
    if (recommendations.length > 0) {
      console.log(`  - First recommendation: ${recommendations[0].name} (score: ${recommendations[0].relevance_score})`);
    }
  } catch (error) {
    throw new Error(`getPersonalizedToolRecommendations error: ${error.message}`);
  }
}

// Helper functions
async function getFirstStepId() {
  const { data } = await supabase
    .from("journey_steps")
    .select("id")
    .limit(1);
  
  return data && data.length > 0 ? data[0].id : null;
}

async function getFirstCompanyId() {
  const { data } = await supabase
    .from("companies")
    .select("id")
    .limit(1);
  
  return data && data.length > 0 ? data[0].id : null;
}

// Run the tests
runTests().catch(console.error);
