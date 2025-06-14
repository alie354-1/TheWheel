/**
 * Types for the new journey system
 */

// Core Journey Structure
export interface NewJourneyPhase {
  id: string;
  name: string;
  description: string;
  order_index: number;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface NewJourneyDomain {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  created_at: string;
}

// Enum Types
export type NewDifficulty = 'Low' | 'Medium' | 'High';
export type NewStepStatus = 'not_started' | 'active' | 'complete' | 'skipped';
export type NewSuggestionPriority = 'low' | 'medium' | 'high';

// Dashboard Types
export interface DashboardStats {
  total: number;
  active: number;
  complete: number;
  skipped: number;
}

// Framework Steps (canonical 150 steps)
export interface NewJourneyStep {
  id: string;
  name: string;
  description: string;
  primary_phase_id: string;
  primary_domain_id: string;
  order_index: number;
  difficulty: NewDifficulty;
  estimated_days: number;
  
  // Rich content
  deliverables?: string[];
  success_criteria?: string[];
  potential_blockers?: string[];
  guidance_notes?: string;
  target_company_types?: string[];
  recommended_tools?: string[];
  dependencies?: string[]; 
  follow_up_steps?: string[];
  
  // Framework management
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  phase?: NewJourneyPhase;
  domain?: NewJourneyDomain;
}

// Company Implementation
export interface NewCompanyJourney {
  id: string;
  company_id: string;
  name: string;
  status: string;
  customization_level: string;
  custom_phases?: any;
  custom_domains?: any;
  created_at: string;
  updated_at: string;
}

export interface NewCompanyJourneyStep {
  id: string;
  journey_id: string;
  framework_step_id?: string;
  
  // Core step data
  name: string;
  description?: string;
  phase_id?: string;
  domain_id?: string;
  
  // Company-specific customization
  custom_deliverables?: string[];
  custom_success_criteria?: string[];
  custom_guidance?: string;
  estimated_days?: number;
  difficulty?: NewDifficulty;
  
  // Progress tracking
  status: NewStepStatus;
  started_at?: string;
  completed_at?: string;
  skipped_at?: string;
  due_date?: string;
  
  // Customization metadata
  is_custom_step: boolean;
  customized_fields?: string[];
  order_index?: number;
  
  created_at: string;
  updated_at: string;
  
  // Relationships
  phase?: NewJourneyPhase;
  domain?: NewJourneyDomain;
  framework_step?: NewJourneyStep;
  
  // Rich content (from framework or custom)
  deliverables?: string[];
  success_criteria?: string[];
  potential_blockers?: string[];
  recommended_tools?: string[];
  dependencies?: string[];
}

// Step Tasks
export interface NewStepTask {
  id: string;
  step_id: string;
  title: string;
  description?: string;
  status: string;
  result_data?: any;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Outcome Capture
export interface NewStepOutcome {
  id: string;
  company_step_id: string;
  
  // Task-level results
  task_results: Record<string, string>;
  
  // Overall metrics
  time_taken_days: number;
  confidence_level: number;
  
  // Qualitative feedback
  notes?: string;
  key_learnings?: string[];
  blockers_encountered?: string[];
  tools_used?: string[];
  
  // Sharing preferences
  share_anonymously: boolean;
  community_contribution_id?: string;
  
  created_at: string;
  updated_at?: string;
}

// Adaptive suggestions
export interface NewAdaptiveSuggestion {
  id: string;
  outcome_id: string;
  suggestion_text: string;
  suggestion_type: string;
  priority: NewSuggestionPriority;
  reasoning?: string;
  shown_to_user: boolean;
  accepted?: boolean;
  acted_upon?: boolean;
  user_feedback?: string;
  generated_at: string;
  expires_at?: string;
}

// Community Insights
export interface NewAnonymizedOutcome {
  id: string;
  framework_step_id: string;
  industry_category?: string;
  company_stage?: string;
  team_size_range?: string;
  success_level: number;
  time_taken_days: number;
  confidence_level: number;
  tools_used?: string[];
  common_blockers?: string[];
  key_insights?: string[];
  created_at: string;
}

// Standup Bot
export interface NewStandupSession {
  id: string;
  company_id: string;
  step_id?: string;
  session_start: string;
  session_end?: string;
  messages: any[];
  extracted_progress?: any;
  suggested_actions?: any;
  confidence_scores?: any;
  actions_taken?: any[];
  followup_needed: boolean;
  followup_questions?: string[];
}

// AI Recommendations
export interface NewAIQuestion {
  id: string;
  company_id: string;
  step_id?: string;
  question_type: string;
  priority: string;
  question_text: string;
  context_data?: any;
  followup_questions?: string[];
  schedule_for?: string;
  asked_at?: string;
  answered_at?: string;
  skipped_at?: string;
  answer_text?: string;
  answer_structured_data?: any;
  processing_result?: any;
  created_at: string;
}

// Maturity and State types for new progress tracking
export type MaturityLevel = 'exploring' | 'learning' | 'practicing' | 'refining' | 'teaching';
export type CurrentState = 'active_focus' | 'maintaining' | 'future_focus' | 'dormant';
export type TeamInvolvement = 'solo' | 'collaborative' | 'delegated';

// Domain Progress tracking
export interface NewCompanyDomainProgress {
  id: string;
  company_journey_id: string;
  domain_id: string;
  maturity_level: MaturityLevel;
  current_state: CurrentState;
  total_steps_engaged: number;
  engagement_streak: number;
  time_invested_days: number;
  first_engaged_date?: string;
  last_activity_date?: string;
  primary_owner_id?: string;
  team_involvement_level: TeamInvolvement;
  created_at: string;
  updated_at: string;
  
  // Relationships
  domain?: NewJourneyDomain;
  primary_owner?: any; // User type
}

// Dashboard Data (updated for new progress system)
export interface NewDomainProgress {
  domain_id: string;
  domain_name: string;
  maturity_level: MaturityLevel;
  current_state: CurrentState;
  total_steps_engaged: number;
  time_invested_days: number;
  days_since_last_activity?: number;
  team_involvement_level?: TeamInvolvement;
  color?: string;
}

export interface NewPeerInsight {
  id: string;
  text: string;
  type: 'tool' | 'time' | 'success' | 'blocker' | 'tip';
  percentage?: number;
  source: 'community' | 'ai' | 'expert';
  related_step_id?: string;
  related_domain_id?: string;
}
