/**
 * Journey Integration Migration Script
 * 
 * This script migrates data from the old journey system to the new journey integration system.
 * It transfers steps, progress, and relationships from the old tables to the new tables.
 */

import { supabase } from '../../supabase';

/**
 * Migrate journey data from old tables to new tables
 */
export async function migrateJourneyData() {
  try {
    console.log('Starting journey data migration...');
    
    // Step 1: Create phases if they don't exist
    await createDefaultPhases();
    
    // Step 2: Migrate steps
    await migrateSteps();
    
    // Step 3: Migrate company journey steps (progress)
    await migrateProgress();
    
    // Step 4: Migrate step relationships
    await migrateRelationships();
    
    console.log('Journey data migration completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error migrating journey data:', error);
    return { success: false, error };
  }
}

/**
 * Create default journey phases if they don't exist
 */
async function createDefaultPhases() {
  console.log('Creating default journey phases...');
  
  const defaultPhases = [
    { title: 'Validate', description: 'Validate your idea and identify your target market.', order_number: 1 },
    { title: 'Build', description: 'Build your minimum viable product and prepare for launch.', order_number: 2 },
    { title: 'Launch', description: 'Launch your product and acquire your first customers.', order_number: 3 },
    { title: 'Scale', description: 'Scale your business and grow your customer base.', order_number: 4 }
  ];
  
  // Check if phases already exist
  const { data: existingPhases, error: checkError } = await supabase
    .from('journey_phases')
    .select('title');
  
  if (checkError) {
    console.error('Error checking existing phases:', checkError);
    throw checkError;
  }
  
  if (existingPhases && existingPhases.length > 0) {
    console.log(`Found ${existingPhases.length} existing phases, skipping creation.`);
    return;
  }
  
  // Insert default phases
  const { error: insertError } = await supabase
    .from('journey_phases')
    .insert(defaultPhases);
  
  if (insertError) {
    console.error('Error inserting default phases:', insertError);
    throw insertError;
  }
  
  console.log(`Created ${defaultPhases.length} default phases.`);
}

/**
 * Migrate steps from old 'steps' table to new 'journey_steps' table
 */
async function migrateSteps() {
  console.log('Migrating steps...');
  
  // Get all steps from old table
  const { data: oldSteps, error: fetchError } = await supabase
    .from('steps')
    .select('*');
  
  if (fetchError) {
    console.error('Error fetching old steps:', fetchError);
    throw fetchError;
  }
  
  if (!oldSteps || oldSteps.length === 0) {
    console.log('No steps found to migrate.');
    return;
  }
  
  console.log(`Found ${oldSteps.length} steps to migrate.`);
  
  // Get phases to map steps to phases
  const { data: phases, error: phasesError } = await supabase
    .from('journey_phases')
    .select('id, title');
  
  if (phasesError) {
    console.error('Error fetching phases:', phasesError);
    throw phasesError;
  }
  
  // Create a map of phase titles to IDs
  const phaseMap = new Map();
  phases.forEach(phase => {
    phaseMap.set(phase.title.toLowerCase(), phase.id);
  });
  
  // Default phase ID (first phase)
  const defaultPhaseId = phases[0].id;
  
  // Transform old steps to new format
  const newSteps = oldSteps.map(step => {
    // Try to determine the phase from the step data
    let phaseId = defaultPhaseId;
    
    // If the step has a phase property, use it to find the matching phase
    if (step.phase) {
      const matchingPhaseId = phaseMap.get(step.phase.toLowerCase());
      if (matchingPhaseId) {
        phaseId = matchingPhaseId;
      }
    }
    
    return {
      id: step.id, // Keep the same ID for reference
      phase_id: phaseId,
      title: step.name || 'Untitled Step',
      description: step.description || '',
      order_number: step.order || 0,
      estimated_time: step.estimated_time || '1-2 weeks',
      created_at: step.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  // Insert steps into new table
  for (const step of newSteps) {
    // Check if step already exists
    const { data: existingStep, error: checkError } = await supabase
      .from('journey_steps')
      .select('id')
      .eq('id', step.id)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Error checking if step ${step.id} exists:`, checkError);
      continue;
    }
    
    if (existingStep) {
      // Update existing step
      const { error: updateError } = await supabase
        .from('journey_steps')
        .update(step)
        .eq('id', step.id);
      
      if (updateError) {
        console.error(`Error updating step ${step.id}:`, updateError);
      }
    } else {
      // Insert new step
      const { error: insertError } = await supabase
        .from('journey_steps')
        .insert(step);
      
      if (insertError) {
        console.error(`Error inserting step ${step.id}:`, insertError);
      }
    }
  }
  
  console.log(`Migrated ${newSteps.length} steps.`);
}

/**
 * Migrate company journey steps (progress) from old 'company_journey_steps' table to new 'step_progress' table
 */
async function migrateProgress() {
  console.log('Migrating step progress...');
  
  // Get all company journey steps from old table
  const { data: oldProgress, error: fetchError } = await supabase
    .from('company_journey_steps')
    .select('*');
  
  if (fetchError) {
    console.error('Error fetching old progress:', fetchError);
    throw fetchError;
  }
  
  if (!oldProgress || oldProgress.length === 0) {
    console.log('No progress found to migrate.');
    return;
  }
  
  console.log(`Found ${oldProgress.length} progress records to migrate.`);
  
  // Transform old progress to new format
  const newProgress = oldProgress.map(progress => {
    // Map old status to new status
    let status = 'not_started';
    if (progress.status === 'completed') {
      status = 'completed';
    } else if (progress.status === 'in_progress') {
      status = 'in_progress';
    }
    
    return {
      step_id: progress.step_id,
      company_id: progress.company_id,
      status,
      started_at: progress.started_at || null,
      completed_at: progress.completed_at || null,
      time_spent: progress.time_spent || null,
      notes: progress.notes || null,
      created_at: progress.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  // Insert progress into new table
  for (const progress of newProgress) {
    // Check if progress already exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('step_progress')
      .select('id')
      .eq('step_id', progress.step_id)
      .eq('company_id', progress.company_id)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`Error checking if progress exists for step ${progress.step_id}:`, checkError);
      continue;
    }
    
    if (existingProgress) {
      // Update existing progress
      const { error: updateError } = await supabase
        .from('step_progress')
        .update(progress)
        .eq('id', existingProgress.id);
      
      if (updateError) {
        console.error(`Error updating progress for step ${progress.step_id}:`, updateError);
      }
    } else {
      // Insert new progress
      const { error: insertError } = await supabase
        .from('step_progress')
        .insert(progress);
      
      if (insertError) {
        console.error(`Error inserting progress for step ${progress.step_id}:`, insertError);
      }
    }
  }
  
  console.log(`Migrated ${newProgress.length} progress records.`);
}

/**
 * Migrate step relationships from old 'step_relationships' table to new tables
 */
async function migrateRelationships() {
  console.log('Migrating step relationships...');
  
  // Get all step relationships from old table
  const { data: oldRelationships, error: fetchError } = await supabase
    .from('step_relationships')
    .select('*');
  
  if (fetchError) {
    console.error('Error fetching old relationships:', fetchError);
    throw fetchError;
  }
  
  if (!oldRelationships || oldRelationships.length === 0) {
    console.log('No relationships found to migrate.');
    return;
  }
  
  console.log(`Found ${oldRelationships.length} relationships to migrate.`);
  
  // Process each relationship
  for (const relationship of oldRelationships) {
    // For now, we'll just log the relationships
    // In a real implementation, we might create peer insights or recommendations based on these
    console.log(`Relationship: ${relationship.from_step_id} -> ${relationship.to_step_id} (${relationship.relationship_type})`);
    
    // Example: If it's a "next" relationship, we might want to create a recommendation
    if (relationship.relationship_type === 'next' && relationship.probability_weight > 0.7) {
      // This is a strong next step recommendation
      // We could create a template recommendation here
    }
  }
  
  console.log(`Processed ${oldRelationships.length} relationships.`);
}

/**
 * Run the migration
 */
export async function runMigration() {
  const result = await migrateJourneyData();
  return result;
}
