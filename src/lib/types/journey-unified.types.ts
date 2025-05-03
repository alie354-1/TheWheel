/**
 * Unified Journey System Type Definitions
 * 
 * This file defines the TypeScript interfaces for the unified journey system,
 * consolidating the previous steps and challenges models into a single, consistent system.
 */

export type step_status = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type StepStatus = step_status; // Alias for backward compatibility
export type difficulty_level = 1 | 2 | 3 | 4 | 5;

/**
 * Tool definition
 */
export interface Tool {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logo_url?: string;
  type: string;
  category?: string;
  pricing_model?: string;
  is_premium: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Filter parameters for steps
 */
export interface StepFilterParams {
  phaseId?: string;
  status?: step_status | step_status[];
  includeCustom?: boolean;
  difficulty?: difficulty_level | difficulty_level[];
  search?: string;
  searchTerm?: string; // Alias for search for backward compatibility
  limit?: number;
  estimatedTimeMax?: number;
  orderBy?: 'order_index' | 'name' | 'created_at' | 'difficulty_level';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Filter parameters for tools
 */
export interface ToolFilterParams {
  stepId?: string;
  type?: string;
  category?: string;
  search?: string;
  searchTerm?: string; // Alias for search for backward compatibility
  isPremium?: boolean;
  minRelevanceScore?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Data for updating company step progress
 */
export interface CompanyStepProgressUpdate {
  status?: step_status;
  notes?: string;
  completion_percentage?: number;
  custom_difficulty?: number;
  custom_time_estimate?: number;
}

/**
 * Data for updating company tool evaluation
 */
export interface CompanyToolEvaluationUpdate {
  notes?: string;
  rating?: number;
  is_selected?: boolean;
}

/**
 * Journey Phase
 * Represents a group of related steps in the startup journey
 */
export interface JourneyPhase {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Journey Step
 * Represents a specific task or milestone in the startup journey
 * (Combines previous step and challenge concepts)
 */
export interface JourneyStep {
  id: string;
  name: string;
  description?: string;
  phase_id: string;
  difficulty_level: difficulty_level;
  estimated_time_min: number;
  estimated_time_max: number;
  key_outcomes?: string[];
  prerequisite_steps?: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
  is_custom?: boolean;
}

/**
 * Company's progress/customization for a journey step
 */
export interface CompanyJourneyStep {
  id: string;
  company_id: string;
  step_id: string;
  status: step_status;
  notes?: string;
  custom_difficulty?: number;
  custom_time_estimate?: number;
  completion_percentage?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/**
 * Tool recommendation or selection for a step
 */
export interface StepTool {
  id: string;
  step_id: string;
  tool_id: string;
  relevance_score: number;
  created_at: string;
}

/**
 * Company's tool selection and evaluation for a specific step
 */
export interface CompanyStepTool {
  id: string;
  company_id: string;
  step_id: string;
  tool_id: string;
  is_custom: boolean;
  rating?: number;
  notes?: string;
  is_selected: boolean;
  selected_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Journey step with additional company-specific information
 */
export interface CompanyJourneyStepWithDetails extends JourneyStep {
  phase_name?: string;
  phase_color?: string;
  company_progress?: {
    status: step_status;
    notes?: string;
    completion_percentage?: number;
    completed_at?: string;
  };
  recommended_tools?: Array<{
    id: string;
    name: string;
    description?: string;
    relevance_score: number;
  }>;
}

/**
 * Step with phase information
 */
export interface JourneyStepWithPhase extends JourneyStep {
  phase_name: string;
  phase_color?: string;
}

/**
 * Complete step with all associated data
 */
export interface JourneyStepComplete extends JourneyStepWithPhase {
  tools?: Tool[];
  prerequisites?: JourneyStep[];
  prerequisite_step_details?: JourneyStep[];
  company_progress?: CompanyJourneyStep;
  progress?: CompanyJourneyStep; // Alias for company_progress
  phase?: JourneyPhase;
  selected_tool?: Tool;
}

/**
 * Phase with progress information for a specific company
 */
export interface PhaseWithProgress extends JourneyPhase {
  steps_count: number;
  completed_steps: number;
  in_progress_steps: number;
  completion_percentage: number;
}

/**
 * Legacy type aliases for backward compatibility
 */
export type JourneyChallenge = JourneyStep;
export type CompanyChallengeProgress = CompanyJourneyStep;
