/**
 * Type compatibility utilities for the Idea Playground
 * 
 * This module provides helper functions and type definitions to ensure compatibility
 * between different versions of the idea playground data structures and APIs.
 */

import { IdeaPlaygroundIdea } from '../../types/idea-playground.types';
import { IdeaGenerationResult, RefinementResult } from '../../types/idea-generation.types';

/**
 * Legacy idea data format
 */
export interface LegacyIdeaData {
  id?: string;
  title: string;
  description: string;
  problem?: string;
  solution?: string;
  audience?: string | string[];
  value_prop?: string;
  business_model?: string;
  tags?: string[];
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Convert legacy idea data to the current IdeaPlaygroundIdea format
 */
export function convertLegacyIdeaToCurrentFormat(legacyData: LegacyIdeaData): Partial<IdeaPlaygroundIdea> {
  // Convert audience to target_audience if it exists
  let targetAudience: string[] = [];
  if (legacyData.audience) {
    if (Array.isArray(legacyData.audience)) {
      targetAudience = legacyData.audience;
    } else {
      targetAudience = [legacyData.audience];
    }
  }
  
  // Map legacy fields to current format
  return {
    id: legacyData.id,
    title: legacyData.title,
    description: legacyData.description,
    problem_statement: legacyData.problem || '',
    solution_concept: legacyData.solution || '',
    target_audience: targetAudience,
    unique_value: legacyData.value_prop || '',
    business_model: legacyData.business_model || '',
    status: legacyData.status || 'draft',
    user_id: legacyData.created_by || '',
    created_at: legacyData.created_at || new Date().toISOString(),
    updated_at: legacyData.updated_at || new Date().toISOString(),
    protection_level: 'public'
  };
}

/**
 * Convert current IdeaPlaygroundIdea to the generation result format
 */
export function convertIdeaToGenerationResult(idea: IdeaPlaygroundIdea): IdeaGenerationResult {
  return {
    title: idea.title,
    description: idea.description,
    problem_statement: idea.problem_statement,
    solution_concept: idea.solution_concept,
    target_audience: idea.target_audience,
    unique_value: idea.unique_value,
    business_model: idea.business_model,
    tags: [] // Optional field, initialize with empty array
  };
}

/**
 * Convert current IdeaPlaygroundIdea to the refinement result format
 */
export function convertIdeaToRefinementResult(
  idea: IdeaPlaygroundIdea, 
  feedback: string
): RefinementResult {
  return {
    title: idea.title,
    description: idea.description,
    problem_statement: idea.problem_statement,
    solution_concept: idea.solution_concept,
    target_audience: idea.target_audience,
    unique_value: idea.unique_value,
    business_model: idea.business_model,
    feedback: feedback,
    refinement_timestamp: new Date().toISOString(),
    tags: []
  };
}

/**
 * Create an empty idea template
 */
export function createEmptyIdea(userId: string): Partial<IdeaPlaygroundIdea> {
  return {
    title: 'New Idea',
    description: 'Enter your idea description here',
    problem_statement: '',
    solution_concept: '',
    target_audience: [],
    unique_value: '',
    business_model: '',
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    protection_level: 'public',
    status: 'draft'
  };
}

/**
 * Industry-specific templates
 */
export const industryTemplates: Record<string, Partial<IdeaPlaygroundIdea>> = {
  technology: {
    title: 'Tech Innovation Idea',
    description: 'A technology solution that addresses a specific market need',
    problem_statement: 'Current technology solutions for [problem area] are inefficient or inadequate',
    solution_concept: 'Develop a [technology] platform that solves [problem] through [approach]',
    target_audience: ['Early adopters', 'Tech enthusiasts', 'Industry professionals'],
    unique_value: 'Our solution is [faster/more efficient/more user-friendly] than existing alternatives',
    business_model: 'SaaS subscription model with tiered pricing'
  },
  healthcare: {
    title: 'Healthcare Innovation Idea',
    description: 'A healthcare solution that improves patient outcomes or healthcare delivery',
    problem_statement: 'Current healthcare processes for [area] are inefficient and lead to [negative outcome]',
    solution_concept: 'Develop a [solution type] that [improves/enables] [process/outcome]',
    target_audience: ['Healthcare providers', 'Patients', 'Insurance companies'],
    unique_value: 'Our solution improves [metric] by [percentage] while reducing [cost/time/effort]',
    business_model: 'B2B sales to healthcare institutions with implementation services'
  },
  education: {
    title: 'Education Innovation Idea',
    description: 'An educational solution that enhances learning outcomes',
    problem_statement: 'Current educational approaches to [subject/skill] are ineffective for many learners',
    solution_concept: 'Create a [platform/method] that teaches [subject/skill] through [approach]',
    target_audience: ['Students', 'Educators', 'Educational institutions'],
    unique_value: 'Our approach improves learning outcomes by [percentage] while increasing engagement',
    business_model: 'Freemium model with premium features for institutions and advanced users'
  }
};

/**
 * Get an industry-specific template
 */
export function getIndustryTemplate(industry: string, userId: string): Partial<IdeaPlaygroundIdea> {
  const template = industryTemplates[industry.toLowerCase()] || industryTemplates.technology;
  
  return {
    ...template,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    protection_level: 'public',
    status: 'draft'
  };
}
