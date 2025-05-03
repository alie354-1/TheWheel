/**
 * Direct Tool Migration Script
 * 
 * This script directly migrates tool associations from journey_step_tools to step_tools
 * without any complex checking or RPC functions.
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

async function migrateToolAssociations() {
  log.step('Starting direct tool association migration');
  
  try {
    // First get all tool associations from journey_step_tools
    const { data: sourceAssociations, error: sourceError } = await supabase
      .from('journey_step_tools')
      .select('*');
      
    if (sourceError) {
      log.error(`Could not fetch tool associations: ${sourceError.message}`);
      return false;
    }
    
    if (!sourceAssociations || sourceAssociations.length === 0) {
      log.warning('No tool associations found to migrate');
      return true;
    }
    
    log.info(`Found ${sourceAssociations.length} tool associations to migrate`);
    
    // Batch insert all associations into step_tools
    // Create insert array with formatted records
    const insertRecords = sourceAssociations.map(assoc => ({
      step_id: assoc.step_id,
      tool_id: assoc.tool_id,
      relevance_score: assoc.relevance_score || 0.5,
      created_at: assoc.created_at || new Date()
    }));
    
    // Perform batch insert with upsert option to avoid duplicate key conflicts
    const { data: insertResult, error: insertError } = await supabase
      .from('step_tools')
      .upsert(insertRecords, { 
        onConflict: 'step_id,tool_id',
        returning: 'minimal'
      });
      
    if (insertError) {
      log.error(`Error migrating tool associations: ${insertError.message}`);
      return false;
    }
    
    log.success(`Successfully migrated ${insertRecords.length} tool associations`);
    
    // Verify the migration
    const { count: targetCount, error: countError } = await supabase
      .from('step_tools')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      log.warning(`Could not verify migration result: ${countError.message}`);
    } else {
      log.success(`Verification: step_tools now contains ${targetCount} records`);
    }
    
    return true;
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    return false;
  }
}

// Run the migration
migrateToolAssociations()
  .then(success => {
    if (success) {
      log.success('Tool association migration completed successfully');
    } else {
      log.warning('Tool association migration completed with warnings or errors');
      process.exit(1);
    }
  })
  .catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
