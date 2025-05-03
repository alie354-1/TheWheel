/**
 * Journey Tool Migration Script
 * 
 * This script migrates tool associations from journey_step_tools to the new step_tools table structure.
 * It specifically handles the journey_step_tools table which appears to contain the actual tool associations.
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

/**
 * Migrate tool associations from journey_step_tools to step_tools
 */
async function migrateJourneyStepTools() {
  log.step('Migrating journey_step_tools data...');

  // First check if journey_step_tools exists
  try {
    const { data, error } = await supabase.rpc('does_table_exist', { table_name: 'journey_step_tools' });
    
    if (error || !data) {
      log.warning('journey_step_tools table does not exist or could not be checked');
      return false;
    }
  } catch (e) {
    log.warning(`Error checking journey_step_tools table: ${e.message}`);
    log.info('Creating the RPC function for table existence check...');
    
    // Try to create the RPC function if it doesn't exist
    try {
      await supabase.rdb`
        CREATE OR REPLACE FUNCTION does_table_exist(table_name text)
        RETURNS boolean AS $$
        BEGIN
          RETURN EXISTS (
            SELECT FROM information_schema.tables
            WHERE  table_schema = 'public'
            AND    table_name = $1
          );
        END; $$ LANGUAGE plpgsql;
      `;
      log.success('Created does_table_exist RPC function');
    } catch (err) {
      log.error(`Failed to create RPC function: ${err.message}`);
      return false;
    }
  }

  // Now get the journey_step_tools data
  try {
    const { data: journeyStepTools, error } = await supabase
      .from('journey_step_tools')
      .select('*');

    if (error) {
      log.error(`Could not fetch journey_step_tools data: ${error.message}`);
      return false;
    }

    if (!journeyStepTools || journeyStepTools.length === 0) {
      log.warning('No tool associations found in journey_step_tools table');
      return false;
    }

    log.info(`Found ${journeyStepTools.length} tool associations in journey_step_tools`);

    // Migrate each tool association
    let migratedCount = 0;
    let errorCount = 0;

    for (const association of journeyStepTools) {
      // Check if this association already exists in step_tools
      const { data: existingRecord, error: checkError } = await supabase
        .from('step_tools')
        .select('id')
        .eq('step_id', association.step_id)
        .eq('tool_id', association.tool_id)
        .maybeSingle();

      if (checkError) {
        log.error(`Error checking for existing tool association: ${checkError.message}`);
        errorCount++;
        continue;
      }

      if (existingRecord) {
        log.info(`Tool association for step ${association.step_id} and tool ${association.tool_id} already exists`);
        continue;
      }

      // Insert the tool association into step_tools
      const { error: insertError } = await supabase
        .from('step_tools')
        .insert({
          step_id: association.step_id,
          tool_id: association.tool_id,
          relevance_score: association.relevance_score || 0.5,
          created_at: association.created_at || new Date()
        });

      if (insertError) {
        log.error(`Failed to insert tool association: ${insertError.message}`);
        errorCount++;
      } else {
        migratedCount++;
        log.info(`Migrated tool association for step ${association.step_id}`);
      }
    }

    log.success(`Tool association migration complete: ${migratedCount} migrated, ${errorCount} errors`);
    return true;
  } catch (error) {
    log.error(`Tool association migration failed: ${error.message}`);
    return false;
  }
}

// Run the migration if executed directly
if (require.main === module) {
  log.info('Starting journey tool migration...');
  migrateJourneyStepTools()
    .then(success => {
      if (success) {
        log.success('Journey tool migration successfully completed');
      } else {
        log.warning('Journey tool migration completed with warnings or errors');
      }
    })
    .catch(error => {
      log.error(`Journey tool migration failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { migrateJourneyStepTools };
