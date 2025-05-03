/**
 * Journey Steps Service
 * 
 * Service for working with journey steps in the enhanced UI format
 * while preserving compatibility with the original data structure.
 */

import { supabase } from "../supabase";
import { 
  JourneyStep, 
  EnhancedJourneyStep, 
  JourneyPhase, 
  CompanyStepProgress, 
  StepFilterOptions,
  step_status,
  EnhancedStepResponse,
  PersonalizedToolRecommendation,
  mapChallengeToStep
} from '../types/journey-steps.types';

/**
 * Get all journey steps with enhanced data
 */
export async function getEnhancedSteps() {
  const { data, error } = await supabase.from("journey_steps_enhanced").select("*").order("order_index");
  
  if (error) {
    console.error("Error fetching enhanced steps:", error);
    throw error;
  }
  
  return data as EnhancedJourneyStep[];
}

/**
 * Get steps for a specific phase
 */
export async function getStepsByPhase(phaseId: string) {
  const { data, error } = await supabase
    .from("journey_steps_enhanced")
    .select("*")
    .eq("phase_id", phaseId)
    .order("order_index");
  
  if (error) {
    console.error("Error fetching steps by phase:", error);
    throw error;
  }
  
  return data as EnhancedJourneyStep[];
}

/**
 * Get a single step with all its enhanced data
 */
export async function getEnhancedStep(stepId: string) {
  const { data, error } = await supabase.rpc("get_enhanced_step", { step_id: stepId });
  
  if (error) {
    console.error("Error fetching enhanced step:", error);
    throw error;
  }
  
  return data as EnhancedStepResponse;
}

/**
 * Get steps with applied filters
 */
export async function getFilteredSteps(
  companyId: string,
  options?: StepFilterOptions
) {
  let query = supabase
    .from("journey_steps_enhanced")
    .select("*, company_step_progress!inner(*)")
    .eq("company_step_progress.company_id", companyId);
  
  // Apply filters if provided
  if (options?.phase_id) {
    query = query.eq("phase_id", options.phase_id);
  }
  
  if (options?.status) {
    query = query.eq("company_step_progress.status", options.status);
  }
  
  if (options?.difficulty_min !== undefined) {
    query = query.gte("difficulty_level", options.difficulty_min);
  }
  
  if (options?.difficulty_max !== undefined) {
    query = query.lte("difficulty_level", options.difficulty_max);
  }
  
  if (options?.search_term) {
    query = query.or(`name.ilike.%${options.search_term}%,description.ilike.%${options.search_term}%`);
  }
  
  if (options?.only_custom) {
    query = query.eq("is_custom", true);
  }
  
  const { data, error } = await query.order("order_index");
  
  if (error) {
    console.error("Error fetching filtered steps:", error);
    throw error;
  }
  
  return data as EnhancedJourneyStep[];
}

/**
 * Get company progress for steps
 */
export async function getCompanyStepProgress(companyId: string) {
  const { data, error } = await supabase
    .from("company_step_progress")
    .select("*")
    .eq("company_id", companyId);
  
  if (error) {
    console.error("Error fetching company step progress:", error);
    throw error;
  }
  
  return data as CompanyStepProgress[];
}

/**
 * Update step progress status
 */
export async function updateStepProgress(
  companyId: string,
  stepId: string,
  status: step_status,
  notes?: string
) {
  const { data, error } = await supabase
    .from("company_progress") // Use original table name
    .upsert({
      company_id: companyId,
      step_id: stepId,
      status,
      notes,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    }, { 
      onConflict: "company_id,step_id" 
    });
  
  if (error) {
    console.error("Error updating step progress:", error);
    throw error;
  }
  
  return data;
}

/**
 * Create a custom step
 */
export async function createCustomStep(
  companyId: string,
  phaseId: string,
  name: string,
  description: string,
  difficultyLevel: number,
  estimatedTimeMin: number,
  estimatedTimeMax: number,
  keyOutcomes: string[] = []
) {
  const { data, error } = await supabase
    .from("journey_steps") // Use original table name
    .insert({
      company_id: companyId,
      phase_id: phaseId,
      name,
      description,
      difficulty: difficultyLevel, // Map to existing column
      estimated_time_min: estimatedTimeMin,
      estimated_time_max: estimatedTimeMax,
      key_outcomes: keyOutcomes,
      is_custom: true
    });
  
  if (error) {
    console.error("Error creating custom step:", error);
    throw error;
  }
  
  return data;
}

/**
 * Update an existing step
 */
export async function updateStep(
  stepId: string,
  updates: Partial<JourneyStep>
) {
  const { data, error } = await supabase
    .from("journey_steps")
    .update({
      ...updates,
      // Map specific fields if needed
      difficulty: updates.difficulty_level
    })
    .eq("id", stepId);
  
  if (error) {
    console.error("Error updating step:", error);
    throw error;
  }
  
  return data;
}

/**
 * Get all journey phases
 */
export async function getJourneyPhases() {
  const { data, error } = await supabase
    .from("journey_phases")
    .select("*")
    .order("order_index");
  
  if (error) {
    console.error("Error fetching journey phases:", error);
    throw error;
  }
  
  return data as JourneyPhase[];
}

/**
 * Get personalized tool recommendations for a step
 */
export async function getPersonalizedToolRecommendations(
  companyId: string,
  stepId: string
) {
  const { data, error } = await supabase.rpc(
    "get_personalized_step_tools", 
    { company_id: companyId, step_id: stepId }
  );
  
  if (error) {
    console.error("Error fetching personalized tool recommendations:", error);
    throw error;
  }
  
  return data as PersonalizedToolRecommendation[];
}

/**
 * Mark a step as irrelevant/skipped
 */
export async function markStepAsSkipped(
  companyId: string,
  stepId: string,
  reason?: string
) {
  return updateStepProgress(companyId, stepId, 'skipped', reason);
}

/**
 * Calculate overall progress percentage across all steps
 */
export async function calculateOverallProgress(companyId: string) {
  const progressData = await getCompanyStepProgress(companyId);
  const totalSteps = progressData.length;
  
  if (totalSteps === 0) return 0;
  
  const completedOrSkipped = progressData.filter(
    p => p.status === 'completed' || p.status === 'skipped'
  ).length;
  
  return Math.round((completedOrSkipped / totalSteps) * 100);
}

/**
 * Calculate progress percentage for a specific phase
 */
export async function calculatePhaseProgress(
  companyId: string,
  phaseId: string
) {
  const { data: phaseSteps, error } = await supabase
    .from("company_step_progress")
    .select("*")
    .eq("company_id", companyId)
    .eq("phase_id", phaseId);
  
  if (error) {
    console.error("Error fetching phase progress:", error);
    throw error;
  }
  
  const totalSteps = phaseSteps.length;
  
  if (totalSteps === 0) return 0;
  
  const completedOrSkipped = phaseSteps.filter(
    p => p.status === 'completed' || p.status === 'skipped'
  ).length;
  
  return Math.round((completedOrSkipped / totalSteps) * 100);
}

/**
 * Get next recommended step based on company's progress
 */
export async function getNextRecommendedStep(companyId: string) {
  const { data, error } = await supabase
    .from("journey_steps_enhanced")
    .select(`
      *,
      company_progress:company_progress(status)
    `)
    .eq("company_progress.company_id", companyId)
    .eq("company_progress.status", "not_started")
    .order("order_index")
    .limit(1);
  
  if (error) {
    console.error("Error fetching next recommended step:", error);
    throw error;
  }
  
  return data && data.length > 0 ? data[0] as EnhancedJourneyStep : null;
}

/**
 * Backward compatibility function to work with challenge-based code
 */
export async function getChallengeById(challengeId: string) {
  const step = await getEnhancedStep(challengeId);
  return step; // The shape is compatible enough for most usages
}

/**
 * Backward compatibility function for challenges API
 */
export async function getChallenges(companyId: string, options?: StepFilterOptions) {
  const steps = await getFilteredSteps(companyId, options);
  return steps; // No transformation needed as the shape is compatible
}

/**
 * Update the order of steps
 * 
 * This allows for reordering of steps within a phase
 */
export async function updateStepOrder(
  companyId: string,
  steps: Array<{id: string, order_index: number}>
) {
  // Build an array of update operations
  const updates = steps.map(step => ({
    id: step.id,
    order_index: step.order_index
  }));
  
  // Execute batch update
  const { data, error } = await supabase
    .from("journey_steps")
    .upsert(updates, { 
      onConflict: "id"
    });
  
  if (error) {
    console.error("Error updating step order:", error);
    throw error;
  }
  
  return { success: true };
}

export default {
  getEnhancedSteps,
  getStepsByPhase,
  getEnhancedStep,
  getFilteredSteps,
  getCompanyStepProgress,
  updateStepProgress,
  createCustomStep,
  updateStep,
  getJourneyPhases,
  getPersonalizedToolRecommendations,
  markStepAsSkipped,
  calculateOverallProgress,
  calculatePhaseProgress,
  getNextRecommendedStep,
  updateStepOrder,
  // Backward compatibility
  getChallengeById,
  getChallenges
};
