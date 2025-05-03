/**
 * Migration Status Check Script
 * 
 * This script checks the status of the journey unification migration
 * It verifies which tables exist and their record counts
 */

const { supabase } = require('./supabase-client.cjs');

// Simple colored output
const colors = {
  blue: (str) => `\x1b[34m${str}\x1b[0m`,
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  cyan: (str) => `\x1b[36m${str}\x1b[0m`
};

// Logging utilities
const log = {
  info: (message) => console.log(colors.blue(`[INFO] ${message}`)),
  success: (message) => console.log(colors.green(`[SUCCESS] ${message}`)),
  warning: (message) => console.log(colors.yellow(`[WARNING] ${message}`)),
  error: (message) => console.log(colors.red(`[ERROR] ${message}`)),
  step: (message) => console.log(colors.cyan(`\n[STEP] ${message}`))
};

async function checkTableCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.message.includes('does not exist')) {
        log.warning(`Table ${tableName} does not exist`);
        return 0;
      }
      log.error(`Error checking ${tableName}: ${error.message}`);
      return -1;
    }
    
    log.success(`Table ${tableName} exists with ${count} records`);
    return count;
  } catch (e) {
    log.error(`Exception checking ${tableName}: ${e.message}`);
    return -1;
  }
}

async function checkMigration() {
  log.step('Checking Journey System Migration Status');
  
  // Check core tables
  const tablesCore = [
    'journey_phases',
    'journey_steps',
    'journey_challenges', // Old structure
    'company_journey_steps'
  ];
  
  for (const table of tablesCore) {
    await checkTableCount(table);
  }
  
  // Check tool-related tables
  log.step('Checking Tool-Related Tables');
  
  const tablesTool = [
    'tools',
    'step_tools',
    'journey_step_tools', // Potential source table
    'company_step_tools'
  ];
  
  for (const table of tablesTool) {
    await checkTableCount(table);
  }
  
  // Check views
  log.step('Checking Views');
  
  const views = [
    'journey_challenges_view',
    'company_challenge_progress_view'
  ];
  
  for (const view of views) {
    await checkTableCount(view);
  }
  
  log.success('Migration check complete');
}

// Run the check
checkMigration().catch(error => {
  log.error(`Migration check failed: ${error.message}`);
});
