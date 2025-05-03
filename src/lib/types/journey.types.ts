/**
 * Journey Map Types
 * Types related to the startup journey map functionality
 */

/**
 * Journey step status enum
 * Represents the possible states of a journey step for a company
 */
export type journey_step_status = 'not_started' | 'in_progress' | 'completed' | 'skipped';

/**
 * Journey phase
 * Represents a major phase in the startup journey
 */
export interface JourneyPhase {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  icon?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Journey step
 * Represents a specific step within a journey phase
 */
export interface JourneyStep {
  id: string;
  phase_id: string;
  name: string;
  description?: string;
  guidance?: string;
  order_index: number;
  estimated_duration?: string;
  required: boolean;
  is_company_formation_step: boolean;
  ask_wheel_enabled: boolean;
  ask_expert_enabled: boolean;
  use_tool_enabled: boolean;
  diy_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Journey step option
 * Represents a specific approach or option for completing a journey step
 */
export interface JourneyStepOption {
  id: string;
  step_id: string;
  name: string;
  description?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Journey step tool
 * Represents a tool that can be used to complete a journey step
 */
export interface JourneyStepTool {
  id: string;
  step_id: string;
  name: string;
  description?: string;
  url: string;
  logo_url?: string;
  type: string;
  category?: string;
  ranking: number;
  is_premium: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Company progress
 * Tracks a company's progress on a specific journey step
 */
export interface CompanyProgress {
  id: string;
  company_id: string;
  step_id: string;
  status: journey_step_status;
  notes?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Company focus area
 * Represents a journey step that a company is currently focusing on
 */
export interface CompanyFocusArea {
  id: string;
  company_id: string;
  step_id: string;
  created_at?: string;
}

/**
 * Journey step feedback
 * Feedback from a user about a specific journey step
 */
export interface JourneyStepFeedback {
  id: string;
  step_id: string;
  user_id: string;
  rating?: number;
  comment?: string;
  created_at?: string;
}

/**
 * Custom company tool
 * A tool added by a company for a specific journey step
 */
export interface CompanyCustomTool {
  id: string;
  company_id: string;
  step_id: string;
  name: string;
  url: string;
  description?: string;
  functionality?: string;
  ai_generated_description?: string;
  created_at?: string;
  updated_at?: string;
}
