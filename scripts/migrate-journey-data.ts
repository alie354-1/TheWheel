/**
 * Journey System Data Migration Script
 * 
 * This script migrates data from the old journey structure (with separate steps and challenges)
 * to the new unified data model. It consolidates data, preserves relationships,
 * and maintains IDs for backward compatibility.
 * 
 * Usage:
 * $ npx ts-node scripts/migrate-journey-data.ts
 */

import { supabase } from '../src/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

/**
 * Logging utilities
 */
const log = {
  info: (message: string) => console.log(chalk.blue(`[INFO] ${message}`)),
  success: (message: string) => console.log(chalk.green(`[SUCCESS] ${message}`)),
  warning: (message: string) => console.log(chalk.yellow(`[WARNING] ${message}`)),
  error: (message: string) => console.log(chalk.red(`[ERROR] ${message}`)),
  step: (message: string) => console.log(chalk.cyan(`\n[STEP] ${message}`))
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
 * Migrate company step progress data
 */
async function migrateCompanyProgress() {
  log.step('Migrating company step progress...');

  try {
    // First, check if the company_journey_steps table is empty
    const { count, error: countError } = await supabase
      .from('company_journey_steps')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      log.error(`Error checking company_journey_steps: ${countError.message}`);
      throw countError;
    }

    // If we already have data in the table, we might be re-running the migration
    if (count && count > 0) {
      log.warning(`company_journey_steps already contains ${count} records. Migration may already have run.`);
      const confirm = process.env.FORCE_MIGRATION === 'true';
      
      if (!confirm) {
        log.info('Skipping company progress migration. Set FORCE_MIGRATION=true to override.');
        return;
      }
      
      log.warning('Forcing migration of company progress...');
    }

    // Get company step progress data
    const { data: stepProgress, error } = await supabase
      .from('company_step_progress')
      .select('*');

    if (error && error.message.includes('does not exist')) {
      log.warning('company_step_progress table does not exist, checking alternative tables...');
    } else if (error) {
      throw error;
    }

    // Process step progress if available
    if (stepProgress && stepProgress.length > 0) {
      stats.companyProgress.processed = stepProgress.length;
      log.info(`Found ${stepProgress.length} step progress records to migrate`);

      for (const progress of stepProgress) {
        // Convert to unified format and insert
        const { error: insertError } = await supabase
          .from('company_journey_steps')
          .insert({
            company_id: progress.company_id,
            step_id: progress.step_id,
            status: progress.status || 'not_started',
            notes: progress.notes || '',
            completion_percentage: progress.status === 'completed' ? 100 : 
                                  progress.status === 'not_started' ? 0 : 
                                  progress.completion_percentage || 50,
            order_index: progress.order_index || 0,
            completed_at: progress.status === 'completed' ? progress.updated_at : null
          });

        if (insertError) {
          stats.companyProgress.errors++;
          log.error(`Failed to insert company progress for step ${progress.step_id}: ${insertError.message}`);
        } else {
          stats.companyProgress.migrated++;
        }
      }

      log.success(`Step progress migration complete: ${stats.companyProgress.migrated} migrated, ${stats.companyProgress.errors} errors`);
    } else {
      log.warning('No step progress data found, skipping');
    }

    // Next, try challenge progress data
    const { data: challengeProgress, error: progressError } = await supabase
      .from('company_challenge_progress')
      .select('*');

    if (progressError && progressError.message.includes('does not exist')) {
      log.warning('company_challenge_progress table does not exist');
      return;
    } else if (progressError) {
      throw progressError;
    }

    if (challengeProgress && challengeProgress.length > 0) {
      stats.challengeProgress.processed = challengeProgress.length;
      log.info(`Found ${challengeProgress.length} challenge progress records to migrate`);

      for (const progress of challengeProgress) {
        // Check if there's already a record for this company/step from step progress migration
        const { data: existing } = await supabase
          .from('company_journey_steps')
          .select('id')
          .eq('company_id', progress.company_id)
          .eq('step_id', progress.challenge_id)
          .single();

        if (existing) {
          // Update existing record with challenge data
          const { error: updateError } = await supabase
            .from('company_journey_steps')
            .update({
              status: progress.status,
              notes: progress.notes,
              completion_percentage: progress.status === 'completed' ? 100 : 
                                    progress.status === 'not_started' ? 0 : 
                                    progress.completion_percentage || 50,
              completed_at: progress.status === 'completed' ? progress.updated_at : null
            })
            .eq('id', existing.id);

          if (updateError) {
            stats.challengeProgress.errors++;
            log.error(`Failed to update company progress from challenge ${progress.challenge_id}: ${updateError.message}`);
          } else {
            stats.challengeProgress.migrated++;
          }
        } else {
          // Insert new record for challenge progress
          const { error: insertError } = await supabase
            .from('company_journey_steps')
            .insert({
              company_id: progress.company_id,
              step_id: progress.challenge_id,
              status: progress.status || 'not_started',
              notes: progress.notes || '',
              completion_percentage: progress.status === 'completed' ? 100 : 
                                    progress.status === 'not_started' ? 0 : 
                                    progress.completion_percentage || 50,
              order_index: progress.order_index || 0,
              completed_at: progress.status === 'completed' ? progress.updated_at : null
            });

          if (insertError) {
            stats.challengeProgress.errors++;
            log.error(`Failed to insert company progress for challenge ${progress.challenge_id}: ${insertError.message}`);
          } else {
            stats.challengeProgress.migrated++;
          }
        }
      }

      log.success(`Challenge progress migration complete: ${stats.challengeProgress.migrated} migrated, ${stats.challengeProgress.errors} errors`);
    } else {
      log.warning('No challenge progress data found, skipping');
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

export { migrateJourneyData };
