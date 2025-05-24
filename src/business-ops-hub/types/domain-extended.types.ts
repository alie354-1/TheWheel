export enum ExtendedDomainStepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export interface ExtendedDomainStep extends DomainStep {
  notes?: string | null;
}

export interface DomainStep {
  id: string;
  step_id: string;
  name: string;
  description: string;
  domain_specific_description: string | null;
  difficulty: number;
  time_estimate: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  completion_percentage: number;
  phase_name: string;
  phase_order: number;
  step_order: number;
  relevance_score: number;
  is_required: boolean;
  is_recommended: boolean;
}

export interface DomainStepMetadata {
  id: string;
  domain_step_id: string;
  key: string;
  value: any;
}

export interface DomainStepAssignment {
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  due_date: string | null;
}
