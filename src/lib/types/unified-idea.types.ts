/**
 * Types for the Unified Idea Workspace feature
 */

/**
 * Represents a workspace for idea exploration and refinement
 */
export interface IdeaWorkspace {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed' | 'archived';
  active_idea_id?: string;
  settings?: Record<string, any>;
}

/**
 * Represents an idea in the unified system
 */
export interface UnifiedIdea {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  problem_statement?: string;
  solution_concept?: string;
  target_audience?: string;
  unique_value?: string;
  business_model?: string;
  marketing_strategy?: string;
  revenue_model?: string;
  go_to_market?: string;
  market_size?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  refinement_stage: 'draft' | 'concept' | 'business_model' | 'detailed' | 'components' | 'complete';
  is_merged: boolean;
  parent_ideas?: string[];
  version: number;
  analysis?: IdeaAnalysis;
  ai_feedback?: any;
  selected_suggestions?: any;
  concept_variations?: any[];
  selected_variation?: any;
  merged_variation?: any;
  competition?: string[];
  revenue_streams?: string[];
  cost_structure?: string[];
  key_metrics?: string[];
  key_features?: string[];
  implementation_steps?: string[];
  success_metrics?: string[];
  risks_challenges?: string[];
  component_variations?: ComponentVariation[];
}

/**
 * Represents a component variation for an idea
 */
export interface ComponentVariation {
  name: string;
  description: string;
  benefits: string[];
  implementation_notes: string;
}

/**
 * Represents the analysis of an idea
 */
export interface IdeaAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  suggestions: string[];
  market_insights: string[];
  validation_tips: string[];
  created_at?: string;
}

/**
 * Represents a comparison between ideas
 */
export interface IdeaComparison {
  id: string;
  workspace_id: string;
  idea_ids: string[];
  comparison_result: IdeaComparisonResult;
  user_id: string;
  created_at: string;
}

/**
 * Represents the result of comparing multiple ideas
 */
export interface IdeaComparisonResult {
  common_strengths: string[];
  unique_strengths: Record<string, string[]>;
  common_weaknesses: string[];
  unique_weaknesses: Record<string, string[]>;
  complementary_aspects: string[];
  conflicting_aspects: string[];
  merger_potential: number;
  merger_suggestions: string[];
}

/**
 * Represents a merge operation between ideas
 */
export interface IdeaMerge {
  id: string;
  workspace_id: string;
  source_ideas: string[];
  result_idea: string;
  merge_rationale?: string;
  user_id: string;
  created_at: string;
}

/**
 * Parameters for generating new ideas
 */
export interface IdeaGenerationParams {
  topic?: string;
  industry?: string;
  audience?: string;
  problem?: string;
  constraints?: string[];
  count?: number;
  context?: string;
  target_audience?: string;
  problem_area?: string;
  technology?: string;
  business_model_preference?: string;
  market_size_preference?: string;
  innovation_level?: string;
  resource_constraints?: string[];
  title?: string;
}

/**
 * Context for idea operations
 */
export interface IdeaContext {
  userId: string;
  context: string;
  workspaceId?: string;
}
