/**
 * Business Operations Hub Domain Types
 */

export enum DomainStepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  BLOCKED = 'blocked',
  WAITING = 'waiting',
  REVIEW = 'review'
}

/**
 * Business domain entity
 */
export interface BusinessDomain {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

/**
 * Domain to journey step mapping
 */
export interface DomainJourneyMapping {
  id: string;
  domain_id: string;
  journey_id: string;
  relevance_score: number;
  primary_domain: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Task comment entity (for real-time comments and mentions)
 */
export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  message: string;
  mentions: string[] | null;
  created_at: string;
}

/**
 * Domain step entity
 */
export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  type: string; // e.g., 'blocks', 'relates_to'
  created_at: string;
}

export interface DomainStep {
  id: string;
  domain_id: string;
  step_id: string;
  company_id: string | null;
  priority: number;
  custom_name: string | null;
  custom_description: string | null;
  custom_difficulty: number | null;
  custom_time_estimate: number | null;
  notes: string | null;
  parent_task_id?: string | null; // Self-referencing FK for subtask hierarchy
  subtasks?: DomainStep[]; // For frontend tree structure (not persisted)
  dependencies?: TaskDependency[]; // Tasks this step depends on
  blockers?: TaskDependency[]; // Tasks that block this step (reverse lookup)
  assigned_to?: string | null; // User ID assigned to this task
  assigned_team?: string | null; // Team ID assigned to this task (optional)
  is_priority_locked?: boolean;
  priority_order?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Domain step with additional details from journey steps
 */
export interface DomainStepDetail {
  id: string;
  step_id: string;
  name: string;
  description: string;
  difficulty: number;
  time_estimate: number;
  status: DomainStepStatus;
  completion_percentage: number;
  phase_name: string | null;
  phase_order: number | null;
  step_order: number;
  has_custom_fields: boolean;
  is_priority_locked?: boolean;
  priority_order?: number;
}

/**
 * Domain statistics for a company
 */
export interface DomainStatistics {
  domain_id: string;
  domain_name: string;
  company_id: string;
  company_name: string;
  total_steps: number;
  completed_steps: number;
  in_progress_steps: number;
  not_started_steps: number;
  skipped_steps: number;
  completion_percentage: number;
}

/**
 * Parameters for creating a domain
 */
export interface CreateDomainParams {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index?: number;
}

/**
 * Parameters for updating a domain step
 */
export interface UpdateStepParams {
  name?: string;
  description?: string;
  priority?: number;
  status?: DomainStepStatus;
  difficulty?: number;
  timeEstimate?: number;
  completedAt?: string | null;
  notes?: string;
  custom_name?: string | null;
  custom_description?: string | null;
  custom_difficulty?: number | null;
  custom_time_estimate?: number | null;
}

/**
 * Decision event tracking
 */
export interface DecisionEvent {
  id?: string;
  company_id?: string;
  user_id: string;
  event_type: string;
  context?: Record<string, any>;
  data?: Record<string, any>;
  created_at?: string;
}

/**
 * Workspace configuration
 */
export interface WorkspaceConfiguration {
  id?: string;
  company_id: string;
  user_id: string;
  domain_id: string;
  name: string;
  configuration: Record<string, any>;
  is_shared: boolean;
  created_at?: string;
  updated_at?: string;
}
