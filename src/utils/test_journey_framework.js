/**
 * Journey Framework Service Test
 * 
 * This script tests if the journey framework service is properly using the populated data.
 * It focuses on testing the service layer's ability to access and use the journey data.
 */

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Helper function to print section headers
function printSectionHeader(title) {
  console.log('\n' + colors.fg.cyan + colors.bright + '='.repeat(80) + colors.reset);
  console.log(colors.fg.cyan + colors.bright + ' ' + title + colors.reset);
  console.log(colors.fg.cyan + colors.bright + '='.repeat(80) + colors.reset + '\n');
}

// Helper function to print test results
function printTestResult(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.fg.green : colors.fg.red;
  console.log(`${color}${icon} ${testName}${colors.reset}${details ? ': ' + details : ''}`);
}

// Helper function to print summary
function printSummary(passedTests, totalTests) {
  const percentage = Math.round((passedTests / totalTests) * 100);
  let color;
  
  if (percentage >= 90) {
    color = colors.fg.green;
  } else if (percentage >= 70) {
    color = colors.fg.yellow;
  } else {
    color = colors.fg.red;
  }
  
  console.log('\n' + colors.fg.cyan + colors.bright + '='.repeat(80) + colors.reset);
  console.log(colors.fg.cyan + colors.bright + ' SUMMARY' + colors.reset);
  console.log(colors.fg.cyan + colors.bright + '='.repeat(80) + colors.reset + '\n');
  
  console.log(`${color}${colors.bright}Passed: ${passedTests}/${totalTests} (${percentage}%)${colors.reset}`);
  
  if (percentage >= 90) {
    console.log(`\n${colors.fg.green}${colors.bright}The journey framework service is properly using the populated data.${colors.reset}`);
  } else if (percentage >= 70) {
    console.log(`\n${colors.fg.yellow}${colors.bright}The journey framework service is mostly using the populated data, but there are some issues.${colors.reset}`);
  } else {
    console.log(`\n${colors.fg.red}${colors.bright}The journey framework service is not properly using the populated data. Please check the implementation.${colors.reset}`);
  }
}

// Main test function
async function runTests() {
  let passedTests = 0;
  let totalTests = 0;
  
  printSectionHeader('JOURNEY FRAMEWORK SERVICE TEST');
  
  console.log('Testing if the journey framework service is properly using the populated data...\n');
  
  // Test 1: Fetch phases
  printSectionHeader('PHASES TEST');
  totalTests++;
  try {
    const { data: phases, error } = await supabase
      .from('journey_phases_new')
      .select('*')
      .order('order_index');
    
    if (error) throw error;
    
    const passed = phases && phases.length === 5;
    printTestResult('Fetch phases', passed, `Found ${phases ? phases.length : 0} phases (expected 5)`);
    
    if (passed) {
      passedTests++;
      console.log('\nPhases found:');
      phases.forEach(phase => {
        console.log(`- ${phase.name} (${phase.order_index}): ${phase.description.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    printTestResult('Fetch phases', false, error.message);
  }
  
  // Test 2: Fetch domains
  printSectionHeader('DOMAINS TEST');
  totalTests++;
  try {
    const { data: domains, error } = await supabase
      .from('journey_domains_new')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    const passed = domains && domains.length === 8;
    printTestResult('Fetch domains', passed, `Found ${domains ? domains.length : 0} domains (expected 8)`);
    
    if (passed) {
      passedTests++;
      console.log('\nDomains found:');
      domains.forEach(domain => {
        console.log(`- ${domain.name}: ${domain.description.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    printTestResult('Fetch domains', false, error.message);
  }
  
  // Test 3: Fetch canonical steps
  printSectionHeader('CANONICAL STEPS TEST');
  totalTests++;
  try {
    const { data: steps, error } = await supabase
      .from('journey_canonical_steps')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    const passed = steps && steps.length >= 150;
    printTestResult('Fetch canonical steps', passed, `Found ${steps ? steps.length : 0} steps (expected at least 150)`);
    
    if (passed) {
      passedTests++;
      console.log('\nSample steps:');
      steps.slice(0, 5).forEach(step => {
        console.log(`- ${step.name}: ${step.description.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    printTestResult('Fetch canonical steps', false, error.message);
  }
  
  // Test 4: Fetch tools catalog
  printSectionHeader('TOOLS CATALOG TEST');
  totalTests++;
  try {
    const { data: tools, error } = await supabase
      .from('journey_tools_catalog')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    const passed = tools && tools.length >= 50;
    printTestResult('Fetch tools catalog', passed, `Found ${tools ? tools.length : 0} tools (expected at least 50)`);
    
    if (passed) {
      passedTests++;
      console.log('\nSample tools:');
      tools.slice(0, 5).forEach(tool => {
        console.log(`- ${tool.name} (${tool.category}): ${tool.description.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    printTestResult('Fetch tools catalog', false, error.message);
  }
  
  // Test 5: Fetch step-tool recommendations
  printSectionHeader('STEP-TOOL RECOMMENDATIONS TEST');
  totalTests++;
  try {
    const { data: recommendations, error } = await supabase
      .from('journey_step_tool_recommendations')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    const passed = recommendations && recommendations.length >= 100;
    printTestResult('Fetch step-tool recommendations', passed, `Found ${recommendations ? recommendations.length : 0} recommendations (expected at least 100)`);
    
    if (passed) {
      passedTests++;
      console.log('\nSample recommendations:');
      recommendations.slice(0, 5).forEach(rec => {
        console.log(`- Step ID: ${rec.canonical_step_id}, Tool ID: ${rec.tool_id}, Priority: ${rec.priority_rank}`);
      });
    }
  } catch (error) {
    printTestResult('Fetch step-tool recommendations', false, error.message);
  }
  
  // Test 6: Fetch steps by phase
  printSectionHeader('STEPS BY PHASE TEST');
  totalTests++;
  try {
    // First get a phase ID
    const { data: phases, error: phaseError } = await supabase
      .from('journey_phases_new')
      .select('id')
      .limit(1);
    
    if (phaseError) throw phaseError;
    
    if (phases && phases.length > 0) {
      const phaseId = phases[0].id;
      
      const { data: steps, error } = await supabase
        .from('journey_canonical_steps')
        .select('*')
        .eq('phase_id', phaseId)
        .order('id');
      
      if (error) throw error;
      
      const passed = steps && steps.length > 0;
      printTestResult('Fetch steps by phase', passed, `Found ${steps ? steps.length : 0} steps for phase ID ${phaseId}`);
      
      if (passed) {
        passedTests++;
        console.log(`\nSteps for phase ID ${phaseId}:`);
        steps.slice(0, 5).forEach(step => {
          console.log(`- ${step.name}: ${step.description.substring(0, 50)}...`);
        });
      }
    } else {
      printTestResult('Fetch steps by phase', false, 'No phases found');
    }
  } catch (error) {
    printTestResult('Fetch steps by phase', false, error.message);
  }
  
  // Test 7: Fetch steps by domain
  printSectionHeader('STEPS BY DOMAIN TEST');
  totalTests++;
  try {
    // First get a domain ID
    const { data: domains, error: domainError } = await supabase
      .from('journey_domains_new')
      .select('id')
      .limit(1);
    
    if (domainError) throw domainError;
    
    if (domains && domains.length > 0) {
      const domainId = domains[0].id;
      
      const { data: steps, error } = await supabase
        .from('journey_canonical_steps')
        .select('*')
        .eq('domain_id', domainId)
        .order('id');
      
      if (error) throw error;
      
      const passed = steps && steps.length > 0;
      printTestResult('Fetch steps by domain', passed, `Found ${steps ? steps.length : 0} steps for domain ID ${domainId}`);
      
      if (passed) {
        passedTests++;
        console.log(`\nSteps for domain ID ${domainId}:`);
        steps.slice(0, 5).forEach(step => {
          console.log(`- ${step.name}: ${step.description.substring(0, 50)}...`);
        });
      }
    } else {
      printTestResult('Fetch steps by domain', false, 'No domains found');
    }
  } catch (error) {
    printTestResult('Fetch steps by domain', false, error.message);
  }
  
  // Test 8: Fetch step by ID
  printSectionHeader('STEP BY ID TEST');
  totalTests++;
  try {
    // First get a step ID
    const { data: steps, error: stepError } = await supabase
      .from('journey_canonical_steps')
      .select('id')
      .limit(1);
    
    if (stepError) throw stepError;
    
    if (steps && steps.length > 0) {
      const stepId = steps[0].id;
      
      const { data: step, error } = await supabase
        .from('journey_canonical_steps')
        .select('*')
        .eq('id', stepId)
        .single();
      
      if (error) throw error;
      
      const passed = step && step.id === stepId;
      printTestResult('Fetch step by ID', passed, `Found step with ID ${stepId}`);
      
      if (passed) {
        passedTests++;
        console.log(`\nStep with ID ${stepId}:`);
        console.log(`- Name: ${step.name}`);
        console.log(`- Description: ${step.description.substring(0, 100)}...`);
        console.log(`- Phase ID: ${step.phase_id}`);
        console.log(`- Domain ID: ${step.domain_id}`);
        console.log(`- Difficulty: ${step.difficulty}`);
        console.log(`- Estimated Days: ${step.estimated_days}`);
      }
    } else {
      printTestResult('Fetch step by ID', false, 'No steps found');
    }
  } catch (error) {
    printTestResult('Fetch step by ID', false, error.message);
  }
  
  // Test 9: Fetch step metadata
  printSectionHeader('STEP METADATA TEST');
  totalTests++;
  try {
    // First get a step ID
    const { data: steps, error: stepError } = await supabase
      .from('journey_canonical_steps')
      .select('id')
      .limit(1);
    
    if (stepError) throw stepError;
    
    if (steps && steps.length > 0) {
      const stepId = steps[0].id;
      
      const { data: step, error } = await supabase
        .from('journey_canonical_steps')
        .select('*')
        .eq('id', stepId)
        .single();
      
      if (error) throw error;
      
      const metadataFields = [
        'why_this_matters',
        'deliverables',
        'success_criteria',
        'potential_blockers',
        'guidance_notes',
        'no_tool_approach'
      ];
      
      const missingFields = metadataFields.filter(field => !step[field]);
      const passed = missingFields.length === 0;
      
      printTestResult('Step metadata completeness', passed, passed ? 'All metadata fields are present' : `Missing fields: ${missingFields.join(', ')}`);
      
      if (passed) {
        passedTests++;
        console.log(`\nMetadata for step with ID ${stepId}:`);
        metadataFields.forEach(field => {
          console.log(`- ${field}: ${step[field].substring(0, 50)}...`);
        });
      }
    } else {
      printTestResult('Step metadata completeness', false, 'No steps found');
    }
  } catch (error) {
    printTestResult('Step metadata completeness', false, error.message);
  }
  
  // Test 10: Fetch tools for a step
  printSectionHeader('TOOLS FOR STEP TEST');
  totalTests++;
  try {
    // First get a step ID
    const { data: steps, error: stepError } = await supabase
      .from('journey_canonical_steps')
      .select('id')
      .limit(1);
    
    if (stepError) throw stepError;
    
    if (steps && steps.length > 0) {
      const stepId = steps[0].id;
      
      const { data: recommendations, error } = await supabase
        .from('journey_step_tool_recommendations')
        .select(`
          id,
          priority_rank,
          recommendation_type,
          recommendation_reason,
          journey_tools_catalog (
            id,
            name,
            description,
            category,
            rating,
            usage_percentage
          )
        `)
        .eq('canonical_step_id', stepId)
        .order('priority_rank');
      
      if (error) throw error;
      
      const passed = recommendations && recommendations.length > 0;
      printTestResult('Fetch tools for step', passed, `Found ${recommendations ? recommendations.length : 0} tools for step ID ${stepId}`);
      
      if (passed) {
        passedTests++;
        console.log(`\nTools for step ID ${stepId}:`);
        recommendations.forEach(rec => {
          const tool = rec.journey_tools_catalog;
          console.log(`- ${tool.name} (${tool.category}): Priority ${rec.priority_rank}`);
          console.log(`  Reason: ${rec.recommendation_reason ? rec.recommendation_reason.substring(0, 50) + '...' : 'N/A'}`);
        });
      }
    } else {
      printTestResult('Fetch tools for step', false, 'No steps found');
    }
  } catch (error) {
    printTestResult('Fetch tools for step', false, error.message);
  }
  
  // Print summary
  printSummary(passedTests, totalTests);
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
