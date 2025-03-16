export interface IdeaPlaygroundCanvas {
  id: string;
  user_id: string;
  company_id?: string;
  name: string;
  description?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundIdea {
  id: string;
  canvas_id: string;
  title: string;
  description: string;
  problem_statement: string;
  solution_concept: string;
  target_audience: string;
  unique_value: string;
  business_model: string;
  marketing_strategy: string;
  revenue_model: string;
  go_to_market: string;
  market_size: string;
  used_company_context: boolean;
  company_relevance?: CompanyRelevance;
  is_archived: boolean;
  version: number;
  status?: string;
  current_stage_id?: string;
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundComponent {
  id: string;
  idea_id: string;
  component_type: string;
  content: string;
  is_selected: boolean;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundTag {
  id: string;
  name: string;
  created_at: string;
}

export interface IdeaPlaygroundIdeaTag {
  idea_id: string;
  tag_id: string;
  created_at: string;
}

export interface IdeaPlaygroundFeedback {
  id: string;
  idea_id: string;
  feedback_type: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'general' | 'refinement';
  content: string;
  created_at: string;
}

export interface CompanyRelevance {
  existingMarkets: string[];
  customerSynergies: string[];
  complementaryProducts: string[];
  strategicFit: string;
}

// New types for the enhanced Idea Playground
export interface IdeaPlaygroundStage {
  id: string;
  key: string;
  name: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at?: string;
}

export interface IdeaPlaygroundProgress {
  id: string;
  idea_id: string;
  stage_id: string;
  is_completed: boolean;
  completion_data?: any;
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundValidationExperiment {
  id: string;
  idea_id: string;
  name: string;
  hypothesis: string;
  methodology: string;
  success_criteria: string;
  results?: string;
  is_successful?: boolean;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundCustomerSegment {
  id: string;
  idea_id: string;
  name: string;
  description: string;
  pain_points: string;
  needs: string;
  demographics?: {
    age_range?: string;
    gender?: string;
    income_level?: string;
    location?: string;
    education?: string;
    occupation?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundCompetitor {
  id: string;
  idea_id: string;
  name: string;
  description: string;
  strengths?: string;
  weaknesses?: string;
  market_share?: string;
  pricing_model?: string;
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundBusinessModel {
  id: string;
  idea_id: string;
  revenue_streams: string[];
  cost_structure: string[];
  key_resources: string[];
  key_activities: string[];
  key_partners?: string[];
  channels?: string[];
  customer_relationships?: string[];
  unit_economics?: {
    cac?: number;
    ltv?: number;
    margin?: number;
    payback_period?: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundMilestone {
  id: string;
  idea_id: string;
  name: string;
  description: string;
  target_date?: string;
  is_completed: boolean;
  completion_date?: string;
  created_at: string;
  updated_at: string;
}

// Parameter interfaces for API calls
export interface IdeaGenerationParams {
  topic?: string;
  industry?: string;
  problem_area?: string;
  target_audience?: string;
  technology?: string;
  business_model_preference?: string;
  market_size_preference?: string;
  innovation_level?: string;
  resource_constraints?: string[];
  count?: number;
  useCompanyContext?: boolean;
  market_focus?: 'existing' | 'adjacent' | 'new';
}

export interface IdeaRefinementParams {
  idea_id: string;
  focus_areas: ('problem' | 'solution' | 'market' | 'business_model' | 'go_to_market')[];
  specific_questions?: string[];
  improvement_direction?: string;
  detailed_feedback?: string;
}

export interface IdeaExportParams {
  idea_id: string;
  format: 'pdf' | 'docx' | 'slides' | 'canvas';
  include_sections: string[];
}

export interface StageAdvanceParams {
  idea_id: string;
  completion_data?: any;
}

export interface ValidationExperimentParams {
  idea_id: string;
  name: string;
  hypothesis: string;
  methodology: string;
  success_criteria: string;
}

export interface ValidationExperimentResultParams {
  experiment_id: string;
  results: string;
  is_successful: boolean;
}

export interface CustomerSegmentParams {
  idea_id: string;
  name: string;
  description: string;
  pain_points: string;
  needs: string;
  demographics?: any;
}

export interface CompetitorParams {
  idea_id: string;
  name: string;
  description: string;
  strengths?: string;
  weaknesses?: string;
  market_share?: string;
  pricing_model?: string;
}

export interface BusinessModelParams {
  idea_id: string;
  revenue_streams: string[];
  cost_structure: string[];
  key_resources: string[];
  key_activities: string[];
  key_partners?: string[];
  channels?: string[];
  customer_relationships?: string[];
  unit_economics?: any;
}

export interface MilestoneParams {
  idea_id: string;
  name: string;
  description: string;
  target_date?: string;
}

export interface MilestoneCompletionParams {
  milestone_id: string;
  completion_date?: string;
}
