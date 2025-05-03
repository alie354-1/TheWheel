/**
 * Type definitions for the Journey Challenges system
 */

export type difficulty_level = 1 | 2 | 3 | 4 | 5;

export type challenge_status = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface JourneyChallenge {
  id: string;
  name: string;
  description?: string;
  phase_id: string;
  difficulty_level: difficulty_level;
  estimated_time_min: number;
  estimated_time_max: number;
  key_outcomes?: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyChallengeProgress {
  id: string;
  company_id: string;
  challenge_id: string;
  status: challenge_status;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface JourneyPhase {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface ChallengeToolRecommendation {
  id: string;
  challenge_id: string;
  tool_id: string;
  relevance_score: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  tool?: Tool;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  url?: string;
  pricing_type?: 'free' | 'freemium' | 'paid' | 'subscription' | 'one-time';
  pricing_details?: string;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}
