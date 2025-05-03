/**
 * Type definitions for Journey Steps
 * 
 * These types define the enhanced step system that preserves the improved UI
 * while using the original steps data structure.
 */

// Status types for step progress
export type step_status = 'not_started' | 'in_progress' | 'completed' | 'skipped';

// Difficulty level type (1-5)
export type difficulty_level = 1 | 2 | 3 | 4 | 5;

// Base journey step interface
export interface JourneyStep {
  id: string;
  name: string;
  description?: string;
  phase_id: string;
  difficulty_level: difficulty_level;
  estimated_time_min: number; // in minutes
  estimated_time_max: number; // in minutes
  key_outcomes?: string[];
  prerequisite_steps?: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
  is_custom?: boolean;
}

// Enhanced step with additional UI-focused properties
export interface EnhancedJourneyStep extends JourneyStep {
  phase_name?: string;
  phase_color?: string;
  status?: step_status;
  completion_percentage?: number;
  tools?: ToolReference[];
  team_members?: TeamMemberReference[];
}

// Company progress on a step
export interface CompanyStepProgress {
  id: string;
  company_id: string;
  step_id: string;
  status: step_status;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Phase information
export interface JourneyPhase {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

// Tool reference (simplified version of the Tool type)
export interface ToolReference {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logo_url?: string;
}

// Team member reference
export interface TeamMemberReference {
  id: string;
  name: string;
  avatar_url?: string;
  role?: string;
}

// Step filtering options
export interface StepFilterOptions {
  phase_id?: string;
  status?: step_status;
  difficulty_min?: number;
  difficulty_max?: number;
  search_term?: string;
  only_custom?: boolean;
}

// Response from the get_enhanced_step function
export interface EnhancedStepResponse {
  id: string;
  name: string;
  description?: string;
  phase_id: string;
  phase_name?: string;
  difficulty_level: difficulty_level;
  estimated_time_min: number;
  estimated_time_max: number;
  key_outcomes?: string[];
  tools?: ToolReference[];
  status?: step_status;
}

// Personalized tool recommendation
export interface PersonalizedToolRecommendation {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logo_url?: string;
  relevance_score: number;
}

// Functions to help with step data manipulation
export const calculateStepCompletion = (step: EnhancedJourneyStep): number => {
  if (step.status === 'completed') return 100;
  if (step.status === 'not_started') return 0;
  if (step.status === 'skipped') return 100; // Skipped steps count as complete for progress bars
  
  // For in_progress steps, you can implement more sophisticated logic based on
  // checklist items or other metrics. Default to 50% for now.
  return step.completion_percentage || 50;
};

// Map a challenge to a step (for backward compatibility)
export const mapChallengeToStep = (challenge: any): EnhancedJourneyStep => {
  return {
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    phase_id: challenge.phase_id,
    difficulty_level: challenge.difficulty_level || 3,
    estimated_time_min: challenge.estimated_time_min || 30,
    estimated_time_max: challenge.estimated_time_max || 60,
    key_outcomes: challenge.key_outcomes,
    prerequisite_steps: challenge.prerequisite_steps,
    order_index: challenge.order_index,
    created_at: challenge.created_at,
    updated_at: challenge.updated_at,
    is_custom: challenge.is_custom,
    phase_name: challenge.phase_name,
    phase_color: challenge.phase_color,
    status: challenge.status,
    completion_percentage: challenge.completion_percentage,
    tools: challenge.tools,
    team_members: challenge.team_members
  };
};

// Map a step to a challenge (for backward compatibility)
export const mapStepToChallenge = (step: EnhancedJourneyStep): any => {
  return {
    ...step,
    difficulty_level: step.difficulty_level
  };
};

/**
 * Types for the intelligent recommendation engine (Sprint 3)
 */

// Represents a step recommendation with score and reasoning
export interface StepRecommendation {
  id: string;
  name: string;
  description?: string;
  difficulty_level: difficulty_level;
  estimated_time_min: number;
  estimated_time_max: number;
  phase_id: string;
  phase_name?: string;
  relevance_score: number;
  reasoning: string[];
}

// Internal type for scored steps during recommendation calculation
export interface RecommendationScore extends EnhancedJourneyStep {
  score: number;
  reasoning: string[];
}

// Represents a relationship between steps
export interface StepRelationship {
  source_id: string;
  source_name?: string;
  target_id: string;
  target_name?: string;
  relationship_type: 'prerequisite' | 'dependent' | 'related';
}
