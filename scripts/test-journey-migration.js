/**
 * Journey System Migration Test Script
 * 
 * This script tests the migration from the old challenge system to the unified journey system.
 * It compares results from both systems to ensure data integrity after migration.
 */

const { supabase } = require('./supabase-client');
const { JourneyChallengesService } = require('../src/lib/services/journeyChallenges.service');
const { CompanyJourneyService } = require('../src/lib/services/companyJourney.service');
const { JourneyUnifiedService } = require('../src/lib/services/journey-unified.service');

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Compares results from old and new systems
 * @param {string} testName - The name of the test being performed
 * @param {Array|Object} oldResult - Result from the old system
 * @param {Array|Object} newResult - Result from the new system
 * @param {Function} comparisonFn - Custom comparison function (optional)
 */
function compareResults(testName, oldResult, newResult, comparisonFn = null) {
  console.log(`\n${colors.blue}Testing: ${testName}${colors.reset}`);
  
  try {
    let success = false;
    
    if (comparisonFn) {
      success = comparisonFn(oldResult, newResult);
    } else if (Array.isArray(oldResult) && Array.isArray(newResult)) {
      // Compare count for arrays
      if (oldResult.length !== newResult.length) {
        console.log(`${colors.red}❌ Count mismatch: ${oldResult.length} vs ${newResult.length}${colors.reset}`);
        success = false;
      } else {
        console.log(`${colors.green}✓ Count match: ${oldResult.length}${colors.reset}`);
        success = true;
      }
    } else {
      // Basic equality check for objects
      success = JSON.stringify(oldResult) === JSON.stringify(newResult);
    }
    
    if (success) {
      console.log(`${colors.green}✓ Test passed!${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Test failed!${colors.reset}`);
      console.log(`${colors.yellow}Old system result:${colors.reset}`, oldResult?.slice?.(0, 1) || oldResult);
      console.log(`${colors.yellow}New system result:${colors.reset}`, newResult?.slice?.(0, 1) || newResult);
    }
  } catch (error) {
    console.error(`${colors.red}Error comparing results:${colors.reset}`, error);
  }
}

/**
 * Run all migration tests
 */
async function runTests() {
  try {
    console.log(`${colors.magenta}=== Journey System Migration Tests ===${colors.reset}`);
    console.log(`${colors.cyan}Started at: ${new Date().toLocaleString()}${colors.reset}`);
    
    // Test 1: Compare phase lists
    const oldPhases = await JourneyChallengesService.getPhases();
    const newPhases = await JourneyUnifiedService.getPhases();
    compareResults('Phase Lists', oldPhases, newPhases, (old, next) => {
      return old.length === next.length && 
        old.every(p1 => next.some(p2 => p1.name === p2.name));
    });
    
    // Test 2: Compare challenge/step lists
    const oldChallenges = await JourneyChallengesService.getChallenges();
    const newSteps = await JourneyUnifiedService.getSteps();
    compareResults('Challenge/Step Lists', oldChallenges, newSteps, (old, next) => {
      return old.length === next.length && 
        old.every(c1 => next.some(s1 => c1.name === s1.name));
    });
    
    // Get a test company ID for company-specific tests
    const testCompanyId = await getTestCompanyId();
    if (!testCompanyId) {
      console.log(`${colors.red}❌ No test company found. Skipping company-specific tests.${colors.reset}`);
      return;
    }
    
    console.log(`${colors.blue}Using test company ID: ${testCompanyId}${colors.reset}`);
    
    // Test 3: Compare company progress
    if (oldChallenges.length > 0) {
      const testChallengeId = oldChallenges[0].id;
      const oldProgress = await CompanyJourneyService.getChallengeProgress(testCompanyId, testChallengeId);
      const newProgress = await JourneyUnifiedService.getStepProgress(testCompanyId, testChallengeId);
      
      compareResults('Company Progress', oldProgress, newProgress, (old, next) => {
        // Compare essential fields
        if (!old || !next) return false;
        return old.status === next.status && 
               old.completion_percentage === next.completion_percentage;
      });
    }
    
    // Test 4: Compare tools for steps/challenges
    if (oldChallenges.length > 0) {
      const testChallengeId = oldChallenges[0].id;
      const oldTools = await JourneyChallengesService.getToolsForChallenge(testChallengeId);
      const newTools = await JourneyUnifiedService.getToolsForStep(testChallengeId);
      
      compareResults('Tools for Steps/Challenges', oldTools, newTools, (old, next) => {
        return old.length === next.length && 
          old.every(t1 => next.some(t2 => t1.id === t2.id));
      });
    }
    
    // Test 5: Compare tool evaluations
    if (oldChallenges.length > 0 && await hasToolEvaluations(testCompanyId)) {
      const testChallengeId = oldChallenges[0].id;
      const oldEvals = await CompanyJourneyService.getToolEvaluations(testCompanyId, testChallengeId);
      const newEvals = await JourneyUnifiedService.getCompanyToolEvaluations(testCompanyId, testChallengeId);
      
      compareResults('Tool Evaluations', oldEvals, newEvals, (old, next) => {
        return old.length === next.length && 
          old.every(e1 => next.some(e2 => e1.tool_id === e2.tool_id && e1.rating === e2.rating));
      });
    }
    
    console.log(`\n${colors.magenta}=== Test Run Completed ===${colors.reset}`);
    console.log(`${colors.cyan}Completed at: ${new Date().toLocaleString()}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error running tests:${colors.reset}`, error);
  }
}

/**
 * Helper to get a valid company ID for testing
 */
async function getTestCompanyId() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
      
    if (error || !data || data.length === 0) {
      return null;
    }
    
    return data[0].id;
  } catch (error) {
    console.error(`${colors.red}Error getting test company:${colors.reset}`, error);
    return null;
  }
}

/**
 * Check if there are tool evaluations for testing
 */
async function hasToolEvaluations(companyId) {
  try {
    const { data, error } = await supabase
      .from('company_step_tools')
      .select('id')
      .eq('company_id', companyId)
      .limit(1);
      
    return !error && data && data.length > 0;
  } catch (error) {
    return false;
  }
}

// Run tests if this script is called directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log(`${colors.green}Migration test complete${colors.reset}`);
      process.exit(0);
    })
    .catch(err => {
      console.error(`${colors.red}Migration test failed:${colors.reset}`, err);
      process.exit(1);
    });
}

module.exports = { runTests, compareResults };
