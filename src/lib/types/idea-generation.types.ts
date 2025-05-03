/**
 * Type definitions for idea generation and refinement
 */

/**
 * Result from idea generation
 */
export interface IdeaGenerationResult {
  /** Idea title */
  title: string;
  
  /** Idea description */
  description: string;
  
  /** Problem statement */
  problem_statement: string;
  
  /** Solution concept */
  solution_concept: string;
  
  /** Target audience */
  target_audience: string[];
  
  /** Unique value proposition */
  unique_value: string;
  
  /** Business model */
  business_model: string;
  
  /** Optional tags */
  tags?: string[];
}

/**
 * Result from idea refinement
 */
export interface RefinementResult extends IdeaGenerationResult {
  /** Feedback that led to this refinement */
  feedback: string;
  
  /** Timestamp of refinement */
  refinement_timestamp: string;
}
