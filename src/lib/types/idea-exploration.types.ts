/**
 * Types for the Idea Exploration feature
 */

/**
 * Represents a session for idea exploration
 */
export interface IdeaExplorationSession {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed' | 'archived';
  context: string;
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
 * Represents an idea merge operation
 */
export interface IdeaMerge {
  id: string;
  session_id: string;
  source_idea_ids: string[];
  result_idea_id: string;
  created_at: string;
  user_id: string;
}

/**
 * Represents an idea comparison operation
 */
export interface IdeaComparison {
  id: string;
  session_id: string;
  idea_ids: string[];
  result: IdeaComparisonResult;
  created_at: string;
  user_id: string;
}

/**
 * Represents an idea in the exploration system
 */
export interface ExplorationIdea {
  id: string;
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
  created_at: string;
  updated_at: string;
  user_id?: string;
  session_id?: string;
  version: number;
  is_merged: boolean;
  parent_ideas: string[];
  competition: string[];
  revenue_streams: string[];
  cost_structure: string[];
  key_metrics: string[];
  analysis?: IdeaAnalysis | null;
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
 * Represents the result of comparing multiple ideas
 */
export interface IdeaComparisonResult {
  merger_potential: number;
  common_strengths: string[];
  common_weaknesses: string[];
  unique_strengths: Record<string, string[]>;
  unique_weaknesses: Record<string, string[]>;
  complementary_aspects: string[];
  conflicting_aspects: string[];
  merger_suggestions: string[];
  created_at?: string;
}

/**
 * Represents a filter for idea exploration
 */
export interface IdeaFilter {
  searchTerm?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortDirection?: 'asc' | 'desc';
  showMerged?: boolean;
  showAnalyzed?: boolean;
}

/**
 * Represents the context for idea exploration operations
 */
export interface IdeaExplorationContext {
  userId: string;
  context: string;
  sessionId?: string;
}
