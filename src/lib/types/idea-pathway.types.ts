import { IdeaPlaygroundIdea } from './idea-playground.types';

export enum IdeaPathwayStep {
  INITIAL_IDEA = 'initial_idea',
  VARIATIONS = 'variations',
  SELECTION = 'selection',
  MERGE = 'merge',
  FINAL_SELECTION = 'final_selection'
}

export interface IdeaVariation {
  id: string;
  parent_idea_id: string;
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
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  is_selected: boolean;
  is_merged: boolean;
  created_at: string;
  updated_at: string;
}

export interface MergedIdea {
  id: string;
  canvas_id: string;
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
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  is_selected: boolean;
  created_at: string;
  updated_at: string;
  source_variations?: string[]; // IDs of source variations
}

export interface IdeaVariationParams {
  idea_id: string;
  count?: number;
  focus_areas?: string[];
  variation_strategy?: 'distinct' | 'iterative' | 'disruptive';
}

export interface IdeaMergeParams {
  variation_ids: string[];
  canvas_id: string;
  count?: number;
  merge_strategy?: 'combine_strengths' | 'address_weaknesses' | 'hybrid';
}

export interface IdeaPathwayState {
  currentStep: IdeaPathwayStep;
  selectedIdea: IdeaPlaygroundIdea | null;
  variations: IdeaVariation[];
  selectedVariations: string[]; // IDs of selected variations
  mergedIdeas: MergedIdea[];
  selectedMergedIdea: string | null; // ID of selected merged idea
  isLoading: boolean;
}
