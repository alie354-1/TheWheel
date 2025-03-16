import { 
  IdeaGenerationParams, 
  IdeaPlaygroundIdea, 
  IdeaRefinementParams 
} from '../../../../lib/types/idea-playground.types';

/**
 * AI Service Context
 * This interface defines the context for AI service calls
 */
export interface AIServiceContext {
  userId: string;
  tier: 'free' | 'standard' | 'premium';
  [key: string]: any;
}

/**
 * AI Service Configuration
 * This interface defines the configuration for AI services
 */
export interface AIServiceConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

/**
 * Idea Response
 * This interface defines the response from the idea generation API
 */
export interface IdeaResponse {
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
  [key: string]: any;
}

/**
 * Idea Refinement Response
 * This interface defines the response from the idea refinement API
 */
export interface IdeaRefinementResponse {
  title?: string;
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
  [key: string]: any;
}

/**
 * Idea Enhancement Parameters
 * This interface defines the parameters for idea enhancement
 */
export interface IdeaEnhancementParams {
  title: string;
  description: string;
  problemArea?: string;
  technologyFocus?: string;
  targetAudience?: string;
  industry?: string;
  innovationLevel?: 'incremental' | 'disruptive' | 'radical';
  resourceConstraints?: string[];
  [key: string]: any;
}

/**
 * Idea Enhancement Response
 * This interface defines the response from the idea enhancement API
 */
export interface IdeaEnhancementResponse {
  title: string;
  description: string;
  problemStatement: string;
  solutionConcept: string;
  targetAudience: string;
  uniqueValue: string;
  businessModel: string;
  marketingStrategy: string;
  revenueModel: string;
  goToMarket: string;
  marketSize: string;
  [key: string]: any;
}

/**
 * Market Analysis Parameters
 * This interface defines the parameters for market analysis
 */
export interface MarketAnalysisParams {
  industry?: string;
  target_segments?: string[];
  geography?: string;
  timeframe?: string;
  [key: string]: any;
}

/**
 * Market Analysis Response
 * This interface defines the response from the market analysis API
 */
export interface MarketAnalysisResponse {
  market_size: string;
  target_segments: {
    name: string;
    description: string;
    size: string;
    growth_rate: string;
    pain_points: string[];
  }[];
  competitors: {
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    market_share: string;
  }[];
  trends: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  [key: string]: any;
}

/**
 * Business Model Parameters
 * This interface defines the parameters for business model generation
 */
export interface BusinessModelParams {
  idea_id: string;
  industry_focus: string;
  revenue_preference: string;
  resource_constraints: string[];
  target_segments: string[];
  value_proposition: string;
  [key: string]: any;
}

/**
 * Business Model Response
 * This interface defines the response from the business model API
 */
export interface BusinessModelResponse {
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
  pricing_strategy?: string;
  scalability_assessment?: string;
  [key: string]: any;
}

/**
 * Go-to-Market Parameters
 * This interface defines the parameters for go-to-market planning
 */
export interface GoToMarketParams {
  idea_id: string;
  target_market: string;
  budget_constraint: string;
  timeline: string;
  target_segments: string[];
  value_proposition: string;
  business_model: string;
  [key: string]: any;
}

/**
 * Go-to-Market Response
 * This interface defines the response from the go-to-market API
 */
export interface GoToMarketResponse {
  launch_strategy: string;
  marketing_channels: {
    channel: string;
    approach: string;
    expected_roi: string;
    timeline: string;
  }[];
  sales_strategy: string;
  partnerships: string[];
  milestones: {
    name: string;
    description: string;
    timeline: string;
    success_criteria: string;
  }[];
  kpis: string[];
  budget_allocation: Record<string, string>;
  [key: string]: any;
}

/**
 * Idea Validation Parameters
 * This interface defines the parameters for idea validation
 */
export interface IdeaValidationParams {
  idea_id: string;
  validation_method: 'customer_interviews' | 'surveys' | 'prototype_testing' | 'market_research';
  custom_hypotheses?: string[];
  [key: string]: any;
}

/**
 * Validation Response
 * This interface defines the response from the validation API
 */
export interface ValidationResponse {
  validation_plan: string;
  key_hypotheses: string[];
  experiment_design: string;
  success_criteria: string;
  expected_outcomes: string;
  potential_pivots: string[];
  resources_needed: string[];
  [key: string]: any;
}

/**
 * Milestone Parameters
 * This interface defines the parameters for milestone generation
 */
export interface MilestoneParams {
  idea_id: string;
  timeline: 'short_term' | 'medium_term' | 'long_term';
  [key: string]: any;
}

/**
 * Milestone Response
 * This interface defines the response from the milestone API
 */
export interface MilestoneResponse {
  name: string;
  description: string;
  target_date: string;
  success_criteria: string;
  required_resources: string[];
  dependencies: string[];
  risks: string[];
  [key: string]: any;
}

/**
 * AI Service Interface
 * This interface defines the methods for the AI service
 */
export interface AIServiceInterface {
  /**
   * Generate ideas based on the provided parameters
   * @param params The idea generation parameters
   * @param context The AI service context
   * @returns A promise that resolves to an array of idea responses
   */
  generateIdeas(
    params: IdeaGenerationParams,
    context: AIServiceContext
  ): Promise<IdeaResponse[]>;

  /**
   * Refine an existing idea based on the provided parameters
   * @param idea The idea to refine
   * @param params The idea refinement parameters
   * @param context The AI service context
   * @returns A promise that resolves to an idea refinement response
   */
  refineIdea(
    idea: IdeaPlaygroundIdea,
    params: IdeaRefinementParams,
    context: AIServiceContext
  ): Promise<IdeaRefinementResponse>;

  /**
   * Enhance an idea based on the provided parameters
   * @param params The idea enhancement parameters
   * @param context The AI service context
   * @returns A promise that resolves to an idea enhancement response
   */
  enhanceIdea(
    params: IdeaEnhancementParams,
    context: AIServiceContext
  ): Promise<IdeaEnhancementResponse>;

  /**
   * Analyze the market for an idea
   * @param idea The idea to analyze
   * @param params The market analysis parameters
   * @param context The AI service context
   * @returns A promise that resolves to a market analysis response
   */
  analyzeMarket(
    idea: IdeaPlaygroundIdea,
    params: MarketAnalysisParams,
    context: AIServiceContext
  ): Promise<MarketAnalysisResponse>;

  /**
   * Generate a business model for an idea
   * @param idea The idea to generate a business model for
   * @param params The business model parameters
   * @param context The AI service context
   * @returns A promise that resolves to a business model response
   */
  generateBusinessModel(
    idea: IdeaPlaygroundIdea,
    params: BusinessModelParams,
    context: AIServiceContext
  ): Promise<BusinessModelResponse>;

  /**
   * Create a go-to-market plan for an idea
   * @param idea The idea to create a go-to-market plan for
   * @param params The go-to-market parameters
   * @param context The AI service context
   * @returns A promise that resolves to a go-to-market response
   */
  createGoToMarketPlan(
    idea: IdeaPlaygroundIdea,
    params: GoToMarketParams,
    context: AIServiceContext
  ): Promise<GoToMarketResponse>;

  /**
   * Validate an idea with experiments
   * @param idea The idea to validate
   * @param params The idea validation parameters
   * @param context The AI service context
   * @returns A promise that resolves to a validation response
   */
  validateIdea(
    idea: IdeaPlaygroundIdea,
    params: IdeaValidationParams,
    context: AIServiceContext
  ): Promise<ValidationResponse>;

  /**
   * Generate milestones for an idea
   * @param idea The idea to generate milestones for
   * @param params The milestone parameters
   * @param context The AI service context
   * @returns A promise that resolves to an array of milestone responses
   */
  generateMilestones(
    idea: IdeaPlaygroundIdea,
    params: MilestoneParams,
    context: AIServiceContext
  ): Promise<MilestoneResponse[]>;
}
