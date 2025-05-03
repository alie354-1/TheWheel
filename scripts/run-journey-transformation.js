/**
 * Journey Transformation Script
 * 
 * This script migrates data from the old step-based journey architecture 
 * to the new challenge-based architecture
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Key. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping dictionary to track ID conversions
const idMappings = {
  steps_to_phases: {},
  tasks_to_challenges: {},
};

// Log file setup
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFile = path.join(logDir, `journey_migration_${new Date().toISOString().replace(/:/g, '-')}.log`);
const logger = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logger.write(logMessage + '\n');
}

async function migrateJourneyPhases() {
  log('Starting migration of journey steps to phases...');

  try {
    // Fetch all journey steps
    const { data: journeySteps, error: stepsError } = await supabase
      .from('journey_steps')
      .select('*')
      .order('order_index', { ascending: true });

    if (stepsError) {
      throw stepsError;
    }
    
    log(`Found ${journeySteps.length} journey steps to migrate.`);

    // Group steps by phase
    const phaseGroups = {};
    journeySteps.forEach(step => {
      const phase = step.phase || 'default';
      if (!phaseGroups[phase]) {
        phaseGroups[phase] = [];
      }
      phaseGroups[phase].push(step);
    });

    // Create phases
    let phaseIndex = 0;
    for (const [phaseName, steps] of Object.entries(phaseGroups)) {
      const { data: phase, error: phaseError } = await supabase
        .from('journey_phases')
        .insert({
          name: phaseName,
          description: `Phase containing steps related to ${phaseName.toLowerCase()}`,
          order_index: phaseIndex++,
        })
        .select()
        .single();

      if (phaseError) {
        throw phaseError;
      }

      log(`Created phase: ${phaseName} with ID: ${phase.id}`);

      // Store mapping from steps to this phase
      steps.forEach(step => {
        idMappings.steps_to_phases[step.id] = phase.id;
      });
    }

    log('Journey phase migration completed successfully.');
    return true;
  } catch (error) {
    log(`ERROR migrating journey phases: ${error.message}`);
    return false;
  }
}

async function migrateJourneyChallenges() {
  log('Starting migration of journey tasks to challenges...');

  try {
    // Fetch all journey tasks
    const { data: journeyTasks, error: tasksError } = await supabase
      .from('journey_tasks')
      .select('*, journey_step:journey_steps(*)')
      .order('order_index', { ascending: true });

    if (tasksError) {
      throw tasksError;
    }
    
    log(`Found ${journeyTasks.length} journey tasks to migrate.`);

    // Create challenges for each task
    for (let i = 0; i < journeyTasks.length; i++) {
      const task = journeyTasks[i];
      const stepId = task.journey_step_id;
      const phaseId = idMappings.steps_to_phases[stepId];

      if (!phaseId) {
        log(`WARNING: No phase mapping found for step ${stepId}, skipping task ${task.id}`);
        continue;
      }

      // Estimate difficulty level based on task complexity or metadata
      const difficultyLevel = task.complexity ? 
        Math.min(Math.max(Math.round(task.complexity * 5), 1), 5) : 
        Math.floor(Math.random() * 3) + 2; // Random between 2-4 if no complexity data

      // Estimate time based on task time_estimate or metadata
      const baseTime = task.time_estimate || 60; // default 1 hour
      const estimatedTimeMin = Math.round(baseTime * 0.8);
      const estimatedTimeMax = Math.round(baseTime * 1.2);

      // Extract key outcomes from task description or objectives
      let keyOutcomes = [];
      if (task.objectives && Array.isArray(task.objectives)) {
        keyOutcomes = task.objectives;
      } else if (task.description) {
        // Extract bullet points or sentences from description
        const bullets = task.description.split(/[•·\n]/).filter(item => 
          item.trim().length > 0
        ).map(item => item.trim());
        
        if (bullets.length > 0) {
          keyOutcomes = bullets.slice(0, 3); // Take up to 3 bullet points
        }
      }

      // Ensure we have at least one outcome
      if (keyOutcomes.length === 0) {
        keyOutcomes = ['Complete the challenge successfully'];
      }

      // Create the challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('journey_challenges')
        .insert({
          name: task.title || task.name || `Challenge ${i + 1}`,
          description: task.description,
          phase_id: phaseId,
          difficulty_level: difficultyLevel,
          estimated_time_min: estimatedTimeMin,
          estimated_time_max: estimatedTimeMax,
          key_outcomes: keyOutcomes,
          order_index: task.order_index || i,
        })
        .select()
        .single();

      if (challengeError) {
        throw challengeError;
      }

      log(`Created challenge: ${challenge.name} with ID: ${challenge.id}`);

      // Store mapping from tasks to challenges
      idMappings.tasks_to_challenges[task.id] = challenge.id;
    }

    log('Journey challenges migration completed successfully.');
    return true;
  } catch (error) {
    log(`ERROR migrating journey challenges: ${error.message}`);
    return false;
  }
}

async function migrateCompanyProgress() {
  log('Starting migration of company progress data...');

  try {
    // Fetch all company progress records
    const { data: progressRecords, error: progressError } = await supabase
      .from('company_progress')
      .select('*');

    if (progressError) {
      throw progressError;
    }
    
    log(`Found ${progressRecords.length} company progress records to migrate.`);

    // Group progress by company and task
    const progressByCompany = {};
    progressRecords.forEach(record => {
      const companyId = record.company_id;
      const taskId = record.task_id;
      
      if (!progressByCompany[companyId]) {
        progressByCompany[companyId] = {};
      }
      
      progressByCompany[companyId][taskId] = record;
    });

    // Create new progress records for each company
    for (const [companyId, tasks] of Object.entries(progressByCompany)) {
      for (const [taskId, record] of Object.entries(tasks)) {
        const challengeId = idMappings.tasks_to_challenges[taskId];
        
        if (!challengeId) {
          log(`WARNING: No challenge mapping found for task ${taskId}, skipping progress record`);
          continue;
        }

        // Map old status to new status format
        let status = 'not_started';
        if (record.completed) {
          status = 'completed';
        } else if (record.in_progress) {
          status = 'in_progress';
        } else if (record.skipped) {
          status = 'skipped';
        }

        // Create new progress record
        const { data: newProgress, error: progressError } = await supabase
          .from('company_challenge_progress')
          .insert({
            company_id: companyId,
            challenge_id: challengeId,
            status,
            notes: record.notes,
          })
          .select()
          .single();

        if (progressError) {
          throw progressError;
        }

        log(`Created progress record for company ${companyId}, challenge ${challengeId} with status ${status}`);
      }
    }

    log('Company progress migration completed successfully.');
    return true;
  } catch (error) {
    log(`ERROR migrating company progress: ${error.message}`);
    return false;
  }
}

async function migrateToolReferences() {
  log('Starting migration of tool references...');

  try {
    // Fetch all tool recommendation records
    const { data: toolRecs, error: toolRecsError } = await supabase
      .from('task_tool_recommendations')
      .select('*');

    if (toolRecsError) {
      throw toolRecsError;
    }
    
    log(`Found ${toolRecs.length} tool recommendation records to migrate.`);

    // Create new tool recommendation records for challenges
    for (const rec of toolRecs) {
      const taskId = rec.task_id;
      const challengeId = idMappings.tasks_to_challenges[taskId];
      
      if (!challengeId) {
        log(`WARNING: No challenge mapping found for task ${taskId}, skipping tool recommendation`);
        continue;
      }
      
      // Create new tool recommendation record
      const { data: newRec, error: recError } = await supabase
        .from('challenge_tool_recommendations')
        .insert({
          challenge_id: challengeId,
          tool_id: rec.tool_id,
          relevance_score: rec.relevance_score,
          notes: rec.notes || 'Migrated from task-based recommendation',
        })
        .select()
        .single();

      if (recError) {
        throw recError;
      }

      log(`Created tool recommendation for challenge ${challengeId}, tool ${rec.tool_id}`);
    }

    log('Tool references migration completed successfully.');
    return true;
  } catch (error) {
    log(`ERROR migrating tool references: ${error.message}`);
    return false;
  }
}

async function runMigration() {
  log('=== Starting Journey Transformation Migration ===');
  
  try {
    // Run the migrations in sequence
    const phasesSuccess = await migrateJourneyPhases();
    if (!phasesSuccess) {
      throw new Error('Phase migration failed, aborting remaining steps');
    }
    
    const challengesSuccess = await migrateJourneyChallenges();
    if (!challengesSuccess) {
      throw new Error('Challenge migration failed, aborting remaining steps');
    }
    
    const progressSuccess = await migrateCompanyProgress();
    if (!progressSuccess) {
      throw new Error('Progress migration failed, aborting remaining steps');
    }
    
    const toolRefsSuccess = await migrateToolReferences();
    if (!toolRefsSuccess) {
      throw new Error('Tool reference migration failed');
    }
    
    // Save ID mappings for reference or rollback
    fs.writeFileSync(
      path.join(process.cwd(), 'migration_mappings.json'),
      JSON.stringify(idMappings, null, 2)
    );
    
    log('=== Journey Transformation Migration completed successfully ===');
    logger.end();
  } catch (error) {
    log(`MIGRATION FAILED: ${error.message}`);
    log('See above logs for details on which step failed');
    logger.end();
    process.exit(1);
  }
}

// Run the migration
runMigration();
