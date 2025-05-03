/**
 * Journey System Data Migration Script
 * 
 * This script migrates data from the old journey structure (with separate steps and challenges)
 * to the new unified data model. It consolidates data, preserves relationships,
 * and maintains IDs for backward compatibility.
 * 
 * Usage:
 * $ node scripts/migrate-journey-data.cjs
 */

const { supabase } = require('./supabase-client.cjs');
const { v4: uuidv4 } = require('uuid');
// Simple colored output without the chalk library (using ANSI escape codes)
const colors = {
  blue: (str) => `\x1b[34m${str}\x1b[0m`,
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  cyan: (str) => `\x1b[36m${str}\x1b[0m`
};

/**
 * Logging utilities
 */
const log = {
  info: (message) => console.log(colors.blue(`[INFO] ${message}`)),
  success: (message) => console.log(colors.green(`[SUCCESS] ${message}`)),
  warning: (message) => console.log(colors.yellow(`[WARNING] ${message}`)),
  error: (message) => console.log(colors.red(`[ERROR] ${message}`)),
  step: (message) => console.log(colors.cyan(`\n[STEP] ${message}`))
};

/**
 * Migration statistics
 */
const stats = {
  phases: { processed: 0, updated: 0, errors: 0 },
  steps: { processed: 0, migrated: 0, updated: 0, errors: 0 },
  challenges: { processed: 0, migrated: 0, errors: 0 },
  companyProgress: { processed: 0, migrated: 0, errors: 0 },
  challengeProgress: { processed: 0, migrated: 0, errors: 0 },
  tools: { processed: 0, migrated: 0, errors: 0 }
};

/**
 * Migrate phase data (update with new fields)
 */
async function migratePhases() {
  log.step('Migrating phases...');

  try {
    // Get all phases
    const { data: phases, error } = await supabase
      .from('journey_phases')
      .select('*');

    if (error) throw error;

    stats.phases.processed = phases.length;
    log.info(`Found ${phases.length} phases to process`);

    // Update each phase with default color if missing
    for (const phase of phases) {
      if (!phase.color) {
        // Assign a default color based on the phase index
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        const color = colors[phase.order_index % colors.length];

        const { error: updateError } = await supabase
          .from('journey_phases')
          .update({ color })
          .eq('id', phase.id);

        if (updateError) {
          stats.phases.errors++;
          log.error(`Failed to update phase ${phase.id}: ${updateError.message}`);
        } else {
          stats.phases.updated++;
          log.info(`Updated phase ${phase.name} with color ${color}`);
        }
      }
    }

    log.success(`Phases migration complete: ${stats.phases.updated} updated, ${stats.phases.errors} errors`);
  } catch (error) {
    log.error(`Phase migration failed: ${error.message}`);
    throw error;
  }
}

/**
 * Migrate steps data (add fields from challenges structure)
 */
async function migrateSteps() {
  log.step('Migrating steps...');

  try {
    // Get all existing steps
    const { data: steps, error } = await supabase
      .from('journey_steps')
      .select('*');

    if (error) throw error;

    stats.steps.processed = steps.length;
    log.info(`Found ${steps.length} steps to process`);

    // Update each step with default values for new fields
    for (const step of steps) {
      const { error: updateError } = await supabase
        .from('journey_steps')
        .update({
          difficulty_level: step.difficulty_level || 3,
          estimated_time_min: step.estimated_time_min || 30,
          estimated_time_max: step.estimated_time_max || 60,
          key_outcomes: step.key_outcomes || [],
          prerequisite_steps: step.prerequisite_steps || [],
          is_custom: step.is_custom || false
        })
        .eq('id', step.id);

      if (updateError) {
        stats.steps.errors++;
        log.error(`Failed to update step ${step.id}: ${updateError.message}`);
      } else {
        stats.steps.updated++;
        log.info(`Updated step ${step.name}`);
      }
    }

    log.success(`Steps updates complete: ${stats.steps.updated} updated, ${stats.steps.errors} errors`);
  } catch (error) {
    log.error(`Steps migration failed: ${error.message}`);
    throw error;
  }
}

/**
 * Migrate challenges to steps format
 */
async function migrateChallenges() {
  log.step('Migrating challenges to steps format...');

  try {
    // Get all challenges
    const { data: challenges, error } = await supabase
      .from('journey_challenges')
      .select('*');

    if (error || !challenges) {
      // If the table doesn't exist, this is ok - just skip
      if (error && error.message.includes('does not exist')) {
        log.warning('journey_challenges table does not exist, skipping challenges migration');
        return;
      }
      throw error || new Error('No challenges data returned');
    }

    stats.challenges.processed = challenges.length;
    log.info(`Found ${challenges.length} challenges to migrate`);

    // Process each challenge
    for (const challenge of challenges) {
      // Check if a step with this ID already exists
      const { data: existingStep } = await supabase
        .from('journey_steps')
        .select('id')
        .eq('id', challenge.id)
        .single();

      if (existingStep) {
        // Update existing step with challenge data
        const { error: updateError } = await supabase
          .from('journey_steps')
          .update({
            difficulty_level: challenge.difficulty_level || 3,
            estimated_time_min: challenge.estimated_time_min || 30,
            estimated_time_max: challenge.estimated_time_max || 60,
            key_outcomes: challenge.key_outcomes || [],
            prerequisite_steps: challenge.prerequisite_challenges || [],
            is_custom: challenge.is_custom || false
          })
          .eq('id', challenge.id);

        if (updateError) {
          stats.challenges.errors++;
          log.error(`Failed to update step from challenge ${challenge.id}: ${updateError.message}`);
        } else {
          stats.challenges.migrated++;
          log.info(`Updated step with challenge data for: ${challenge.name}`);
        }
      } else {
        // Insert new step from challenge
        const { error: insertError } = await supabase
          .from('journey_steps')
          .insert({
            id: challenge.id, // Preserve the ID
            name: challenge.name,
            description: challenge.description,
            phase_id: challenge.phase_id,
            order_index: challenge.order_index,
            difficulty_level: challenge.difficulty_level || 3,
            estimated_time_min: challenge.estimated_time_min || 30,
            estimated_time_max: challenge.estimated_time_max || 60,
            key_outcomes: challenge.key_outcomes || [],
            prerequisite_steps: challenge.prerequisite_challenges || [],
            is_custom: challenge.is_custom || false
          });

        if (insertError) {
          stats.challenges.errors++;
          log.error(`Failed to insert step from challenge ${challenge.id}: ${insertError.message}`);
        } else {
          stats.challenges.migrated++;
          log.info(`Migrated challenge to step: ${challenge.name}`);
        }
      }
    }

    log.success(`Challenges migration complete: ${stats.challenges.migrated} migrated, ${stats.challenges.errors} errors`);
  } catch (error) {
    log.error(`Challenges migration failed: ${error.message}`);
    
    // If the table doesn't exist, we can consider this a non-fatal error
    if (error.message.includes('does not exist')) {
      log.warning('Challenges table not found, skipping challenge migration');
    } else {
      throw error;
    }
  }
}

/**
 * Refresh schema cache to ensure new tables are recognized
 */
async function refreshSchemaCache() {
  log.info('Refreshing schema cache...');
  
  try {
    // Force a query that will refresh the schema cache
    await supabase.from('journey_phases').select('id').limit(1);
    await supabase.from('journey_steps').select('id').limit(1);
    
    // Try to directly access company_journey_steps to force cache refresh
    try {
      await supabase.from('company_journey_steps').select('id').limit(1);
    } catch (e) {
      log.warning(`Initial company_journey_steps query failed: ${e.message}`);
      log.info('This is expected if the table was just created. Continuing...');
    }
    
    log.success('Schema cache refreshed');
  } catch (error) {
    log.warning(`Schema refresh warning: ${error.message}`);
    log.info('Continuing with migration despite schema refresh issue');
  }
}

/**
 * Migrate company step progress data using direct SQL
 */
async function migrateCompanyProgress() {
  log.step('Migrating company step progress...');

  try {
    // First check if the progress should be migrated or if we're re-running
    const confirm = process.env.FORCE_MIGRATION === 'true';
    
    if (!confirm) {
      // Check if company_journey_steps exists and has data
      try {
        const { data, count, error } = await supabase
          .rpc('get_table_row_count', { table_name: 'company_journey_steps' });
          
        if (!error && count > 0) {
          log.warning(`company_journey_steps already contains ${count} records.`);
          log.info('Skipping company progress migration. Set FORCE_MIGRATION=true to override.');
          return;
        }
      } catch (e) {
        log.warning(`Could not check company_journey_steps count: ${e.message}`);
        log.info('Continuing with migration anyway...');
      }
    } else {
      log.warning('Forcing migration of company progress...');
    }

    // Check if we have step progress data
    let stepProgressCount = 0;
    try {
      const { data, error } = await supabase
        .rpc('does_table_exist', { table_name: 'company_step_progress' });
      
      if (!error && data) {
        const { count, error: countError } = await supabase
          .rpc('get_table_row_count', { table_name: 'company_step_progress' });
          
        if (!countError) {
          stepProgressCount = count;
        }
      }
    } catch (e) {
      log.warning(`Error checking company_step_progress table: ${e.message}`);
    }

    // Process step progress data using direct SQL
    if (stepProgressCount > 0) {
      stats.companyProgress.processed = stepProgressCount;
      log.info(`Found ${stepProgressCount} step progress records to migrate`);

      // Run direct SQL insertion
      const { error: insertError } = await supabase.rpc('migrate_step_progress');

      if (insertError) {
        stats.companyProgress.errors += stepProgressCount;
        log.error(`Failed to migrate step progress: ${insertError.message}`);
      } else {
        stats.companyProgress.migrated += stepProgressCount;
        log.success(`Step progress migration complete: ${stepProgressCount} migrated`);
      }
    } else {
      log.warning('No step progress data found or table does not exist');
    }

    // Check for challenge progress data
    let challengeProgressCount = 0;
    try {
      const { data, error } = await supabase
        .rpc('does_table_exist', { table_name: 'company_challenge_progress' });
      
      if (!error && data) {
        const { count, error: countError } = await supabase
          .rpc('get_table_row_count', { table_name: 'company_challenge_progress' });
          
        if (!countError) {
          challengeProgressCount = count;
        }
      }
    } catch (e) {
      log.warning(`Error checking company_challenge_progress table: ${e.message}`);
    }

    // Process challenge progress data using direct SQL
    if (challengeProgressCount > 0) {
      stats.challengeProgress.processed = challengeProgressCount;
      log.info(`Found ${challengeProgressCount} challenge progress records to migrate`);

      // Run direct SQL insertion for challenges
      const { error: insertError } = await supabase.rpc('migrate_challenge_progress');

      if (insertError) {
        stats.challengeProgress.errors += challengeProgressCount;
        log.error(`Failed to migrate challenge progress: ${insertError.message}`);
      } else {
        stats.challengeProgress.migrated += challengeProgressCount;
        log.success(`Challenge progress migration complete: ${challengeProgressCount} migrated`);
      }
    } else {
      log.warning('No challenge progress data found or table does not exist');
    }
    
  } catch (error) {
    log.error(`Company progress migration failed: ${error.message}`);
    
    // Non-fatal error if tables don't exist
    if (error.message.includes('does not exist')) {
      log.warning('Progress tables may not exist yet, skipping company progress migration');
    } else {
      throw error;
    }
  }
}

/**
 * Migrate tool data and associations
 */
async function migrateToolAssociations() {
  log.step('Migrating tool associations...');

  try {
    // First check if the step_tools table has data
    const { count, error: countError } = await supabase
      .from('step_tools')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      log.error(`Error checking step_tools: ${countError.message}`);
      throw countError;
    }

    // If we already have data, we might be re-running the migration
    if (count && count > 0) {
      log.warning(`step_tools already contains ${count} records. Migration may already have run.`);
      const confirm = process.env.FORCE_MIGRATION === 'true';
      
      if (!confirm) {
        log.info('Skipping tool associations migration. Set FORCE_MIGRATION=true to override.');
        return;
      }
      
      log.warning('Forcing migration of tool associations...');
    }

    // Get step tool data
    const { data: stepTools, error } = await supabase
      .from('step_tool_mapping')
      .select('*');

    if (error && error.message.includes('does not exist')) {
      log.warning('step_tool_mapping table does not exist, checking alternative tables...');
    } else if (error) {
      throw error;
    }

    // Process step tools if available
    if (stepTools && stepTools.length > 0) {
      stats.tools.processed = stepTools.length;
      log.info(`Found ${stepTools.length} step tool mappings to migrate`);

      for (const mapping of stepTools) {
        // Insert into new format
        const { error: insertError } = await supabase
          .from('step_tools')
          .insert({
            step_id: mapping.step_id,
            tool_id: mapping.tool_id,
            relevance_score: mapping.relevance_score || 0.5
          });

        if (insertError) {
          stats.tools.errors++;
          log.error(`Failed to insert tool mapping for step ${mapping.step_id}: ${insertError.message}`);
        } else {
          stats.tools.migrated++;
        }
      }

      log.success(`Step tool migration complete: ${stats.tools.migrated} migrated, ${stats.tools.errors} errors`);
    } else {
      log.warning('No step tool mappings found');
    }

    // Check for challenge tool mappings
    const { data: challengeTools, error: challengeError } = await supabase
      .from('challenge_tool_mapping')
      .select('*');

    if (challengeError && challengeError.message.includes('does not exist')) {
      log.warning('challenge_tool_mapping table does not exist');
      return;
    } else if (challengeError) {
      throw challengeError;
    }

    if (challengeTools && challengeTools.length > 0) {
      log.info(`Found ${challengeTools.length} challenge tool mappings to migrate`);

      for (const mapping of challengeTools) {
        // Check if this association already exists (from step_tool_mapping)
        const { data: existing } = await supabase
          .from('step_tools')
          .select('id')
          .eq('step_id', mapping.challenge_id)
          .eq('tool_id', mapping.tool_id)
          .single();

        if (!existing) {
          // Insert new association
          const { error: insertError } = await supabase
            .from('step_tools')
            .insert({
              step_id: mapping.challenge_id,
              tool_id: mapping.tool_id,
              relevance_score: mapping.relevance_score || 0.5
            });

          if (insertError) {
            stats.tools.errors++;
            log.error(`Failed to insert tool mapping for challenge ${mapping.challenge_id}: ${insertError.message}`);
          } else {
            stats.tools.migrated++;
          }
        }
      }

      log.success(`Challenge tool migration complete: ${stats.tools.migrated} total mappings migrated, ${stats.tools.errors} errors`);
    } else {
      log.warning('No challenge tool mappings found');
    }
  } catch (error) {
    log.error(`Tool associations migration failed: ${error.message}`);
    
    // Non-fatal error if tables don't exist
    if (error.message.includes('does not exist')) {
      log.warning('Tool mapping tables may not exist yet, skipping tool associations migration');
    } else {
      throw error;
    }
  }
}

/**
 * Main migration function
 */
async function migrateJourneyData() {
  log.info('Starting journey data migration...');
  
  try {
    // Step 1: Migrate phases (update with new fields)
    await migratePhases();

    // Step 2: Migrate steps (add fields from challenges structure)
    await migrateSteps();

    // Step 3: Migrate challenges to steps format
    await migrateChallenges();

    // Step 4: Migrate company progress data
    await migrateCompanyProgress();

    // Step 5: Migrate tool associations
    await migrateToolAssociations();

    // Final summary
    log.step('Migration Complete!');
    log.success('Summary:');
    log.info(`Phases: ${stats.phases.processed} processed, ${stats.phases.updated} updated, ${stats.phases.errors} errors`);
    log.info(`Steps: ${stats.steps.processed} processed, ${stats.steps.updated} updated, ${stats.steps.errors} errors`);
    log.info(`Challenges: ${stats.challenges.processed} processed, ${stats.challenges.migrated} migrated, ${stats.challenges.errors} errors`);
    log.info(`Company Progress: ${stats.companyProgress.processed + stats.challengeProgress.processed} processed, ${stats.companyProgress.migrated + stats.challengeProgress.migrated} migrated, ${stats.companyProgress.errors + stats.challengeProgress.errors} errors`);
    log.info(`Tool Associations: ${stats.tools.processed} processed, ${stats.tools.migrated} migrated, ${stats.tools.errors} errors`);
    
    const totalErrors = stats.phases.errors + stats.steps.errors + stats.challenges.errors + 
                        stats.companyProgress.errors + stats.challengeProgress.errors + stats.tools.errors;
    
    if (totalErrors > 0) {
      log.warning(`Migration completed with ${totalErrors} errors. See log for details.`);
    } else {
      log.success('Migration completed successfully with no errors!');
    }
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateJourneyData().catch(console.error);
}

module.exports = { migrateJourneyData };
