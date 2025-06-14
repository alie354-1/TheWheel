/**
 * Unified Journey System Type Definitions
 * 
 * This file defines the TypeScript interfaces for the unified journey system,
 * consolidating the previous steps and challenges models into a single, consistent system.
 */

/**
 * =============================
 * CANONICAL FRAMEWORK ENTITIES
 * =============================
 */

export interface JourneyPhase {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  icon_url?: string;
  color?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface JourneyDomain {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  color?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface JourneyStepTemplate {
  id: string;
  name: string;
  description?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  category?: string;
  tags?: string[];
  version: number;
  is_latest: boolean;
  previous_version_id?: string;
  content_markdown?: string;
  expected_outcomes?: string[];
  prerequisites?: string[];
  checklist?: any[];
  resources?: any[];
  applicable_stages?: string[];
  applicable_industries?: string[];
  is_active?: boolean;
  is_community_created?: boolean;
  creator_id?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface JourneyStep {
  id: string;
  template_id?: string; // Link to canonical template
  phase_id: string;
  domain_id: string;
  name: string;
  description?: string;
  estimated_time_days?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  order_index: number;
  is_required?: boolean;
  dependencies?: string[];
  release_conditions?: Record<string, any>;
  applicable_startup_stages?: string[];
  content_override_markdown?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * =============================
 * COMPANY-SPECIFIC ENTITIES
 * =============================
 */

export interface CompanyJourneyStep {
  id: string;
  company_id: string;
  canonical_step_id: string; // Link to canonical step
  name: string;
  description?: string;
  phase_id: string;
  domain_id: string;
  order_index: number;
  status: step_status;
  notes?: string;
  custom_difficulty?: string;
  custom_time_estimate?: number;
  completion_percentage?: number;
  is_custom?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  // Customization fields
  content_override_markdown?: string;
  checklist_override?: any[];
  resources_override?: any[];
}

export interface CompanyJourneyPath {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyStepArrangement {
  id: string;
  company_id: string;
  path_id: string;
  step_id: string;
  order_index: number;
  custom_phase_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyStepProgress {
  id: string;
  company_id: string;
  step_id: string;
  status: step_status;
  notes?: string;
  completion_percentage?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyCustomTool {
  id: string;
  company_id: string;
  step_id: string;
  name: string;
  url: string;
  description?: string;
  functionality?: string;
  ai_generated_description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * =============================
 * SHARED/UTILITY TYPES
 * =============================
 */

export type step_status = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type difficulty_level = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

export interface Tool {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logo_url?: string;
  type?: string;
  category?: string;
  pricing_model?: string;
  is_premium?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StepTool {
  id: string;
  step_id: string;
  tool_id: string;
  relevance_score?: number;
  created_at?: string;
  updated_at?: string;
}

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
 * =============================
 * LEGACY/ALIAS TYPES (for backward compatibility)
 * =============================
 */

export type JourneyChallenge = JourneyStep;
export type CompanyChallengeProgress = CompanyStepProgress;

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
 * Shared Journey Report
 * Represents a shareable journey progress report
 */
export interface SharedJourneyReport {
  id: string;
  company_id: string;
  creator_id: string;
  title: string;
  description?: string;
  included_phases?: string[];
  included_steps?: string[];
  access_type: 'public' | 'company' | 'private' | 'specific_users';
  allowed_users?: string[];
  display_options?: Record<string, any>;
  expiration_date?: string;
  public_token?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Step Recommendation
 * Represents a step recommendation from one user to another
 */
export interface StepRecommendation {
  id: string;
  company_id: string;
  sender_id: string;
  recipient_id: string;
  step_id: string;
  context_note?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  response_note?: string;
  viewed_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Notification
 * Represents a user notification
 */
export interface Notification {
  id: string;
  user_id: string;
  company_id: string;
  event_type: string;
  title: string;
  body: string;
  resource_type?: string;
  resource_id?: string;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  read_at?: string;
  delivered_channels: string[];
  created_at: string;
}
