/**
 * Journey Recommendations Service
 * 
 * Provides intelligent step recommendations based on:
 * - Company profile and stage
 * - Progress patterns and analytics
 * - Community data and best practices
 * - Expert insights and feedback
 */

import { supabase } from '../supabase';
import {
  JourneyStep,
  CompanyJourneyStep,
  step_status,
  difficulty_level
} from '../types/journey-unified.types';

export interface RecommendationContext {
  companyId: string;
  companyStage?: 'idea' | 'prototype' | 'mvp' | 'launched' | 'scaling';
  industry?: string;
  teamSize?: number;
  currentPhaseId?: string;
  completedStepIds?: string[];
  preferences?: {
    difficulty?: difficulty_level;
    timeAvailable?: 'low' | 'medium' | 'high';
    focusAreas?: string[];
  };
}

export interface StepRecommendation {
  step: JourneyStep;
  score: number;
  reasoning: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedImpact: string;
  prerequisites: string[];
  suggestedOrder: number;
  communityAdoptionRate?: number;
  expertEndorsement?: boolean;
}

export interface RecommendationSet {
  nextSteps: StepRecommendation[];
  quickWins: StepRecommendation[];
  strategicSteps: StepRecommendation[];
  communityFavorites: StepRecommendation[];
  expertRecommended: StepRecommendation[];
}

export const journeyRecommendationsService = {
  /**
   * Get comprehensive step recommendations for a company
   */
  async getRecommendations(context: RecommendationContext): Promise<RecommendationSet> {
    // Get all available framework steps
    const { data: allSteps } = await supabase
      .from('journey_canonical_steps')
      .select(`
        *,
        journey_phases_new!phase_id(name, order_index),
        journey_domains_new!domain_id(name)
      `)
      .eq('is_active', true);

    if (!allSteps) {
      return {
        nextSteps: [],
        quickWins: [],
        strategicSteps: [],
        communityFavorites: [],
        expertRecommended: []
      };
    }

    // Get company's existing steps to avoid duplicates
    const { data: existingSteps } = await supabase
      .from('company_journey_steps_new')
      .select('framework_step_id')
      .eq('company_id', context.companyId);

    const existingStepIds = new Set(existingSteps?.map(s => s.framework_step_id).filter(Boolean) || []);

    // Filter out already adopted steps
    const availableSteps = allSteps.filter(step => !existingStepIds.has(step.id));

    // Get community adoption data
    const communityData = await this.getCommunityAdoptionData(availableSteps.map(s => s.id));

    // Score and categorize recommendations
    const scoredRecommendations = await Promise.all(
      availableSteps.map(step => this.scoreStepRecommendation(step, context, communityData))
    );

    // Sort by score
    const sortedRecommendations = scoredRecommendations.sort((a, b) => b.score - a.score);

    // Categorize recommendations
    return {
      nextSteps: this.getNextSteps(sortedRecommendations, context),
      quickWins: this.getQuickWins(sortedRecommendations),
      strategicSteps: this.getStrategicSteps(sortedRecommendations),
      communityFavorites: this.getCommunityFavorites(sortedRecommendations),
      expertRecommended: this.getExpertRecommended(sortedRecommendations)
    };
  },

  /**
   * Score a step recommendation based on multiple factors
   */
  async scoreStepRecommendation(
    step: JourneyStep, 
    context: RecommendationContext, 
    communityData: Record<string, { adoptionRate: number; successRate: number }>
  ): Promise<StepRecommendation> {
    let score = 0;
    const reasoning: string[] = [];

    // Base score from community adoption
    const adoptionData = communityData[step.id];
    if (adoptionData) {
      score += adoptionData.adoptionRate * 10;
      score += adoptionData.successRate * 5;
      if (adoptionData.adoptionRate > 0.7) {
        reasoning.push('Highly adopted by similar companies');
      }
    }

    // Company stage relevance
    if (context.companyStage && step.applicable_startup_stages?.includes(context.companyStage)) {
      score += 15;
      reasoning.push(`Perfect fit for ${context.companyStage} stage companies`);
    }

    // Phase progression logic
    if (context.currentPhaseId === step.phase_id) {
      score += 10;
      reasoning.push('Aligns with your current phase focus');
    }

    // Difficulty preference matching
    if (context.preferences?.difficulty && step.difficulty === context.preferences.difficulty) {
      score += 5;
      reasoning.push('Matches your preferred difficulty level');
    }

    // Time availability matching
    if (context.preferences?.timeAvailable) {
      const timeScore = this.getTimeScore(step.estimated_time_days || 7, context.preferences.timeAvailable);
      score += timeScore;
      if (timeScore > 0) {
        reasoning.push('Fits your available time commitment');
      }
    }

    // Prerequisites check
    const prerequisites = step.dependencies || [];
    const unmetPrerequisites = prerequisites.filter(prereq => 
      !context.completedStepIds?.includes(prereq)
    );

    if (unmetPrerequisites.length === 0) {
      score += 8;
      reasoning.push('All prerequisites are met');
    } else {
      score -= unmetPrerequisites.length * 3;
      reasoning.push(`${unmetPrerequisites.length} prerequisites need to be completed first`);
    }

    // Determine priority based on score and factors
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
    if (score > 30) priority = 'urgent';
    else if (score > 20) priority = 'high';
    else if (score > 10) priority = 'medium';

    return {
      step,
      score,
      reasoning,
      priority,
      estimatedImpact: this.getEstimatedImpact(step, score),
      prerequisites: unmetPrerequisites,
      suggestedOrder: this.getSuggestedOrder(step, context),
      communityAdoptionRate: adoptionData?.adoptionRate,
      expertEndorsement: Math.random() > 0.7 // Mock expert endorsement
    };
  },

  /**
   * Get community adoption data for steps
   */
  async getCommunityAdoptionData(stepIds: string[]): Promise<Record<string, { adoptionRate: number; successRate: number }>> {
    // This would query actual community data
    // For now, return mock data
    const data: Record<string, { adoptionRate: number; successRate: number }> = {};
    
    stepIds.forEach(stepId => {
      data[stepId] = {
        adoptionRate: Math.random() * 0.8 + 0.2, // 20-100%
        successRate: Math.random() * 0.6 + 0.4   // 40-100%
      };
    });

    return data;
  },

  /**
   * Get next logical steps based on company progress
   */
  getNextSteps(recommendations: StepRecommendation[], context: RecommendationContext): StepRecommendation[] {
    return recommendations
      .filter(rec => rec.prerequisites.length === 0) // Only steps with no unmet prerequisites
      .filter(rec => rec.priority === 'high' || rec.priority === 'urgent')
      .slice(0, 5);
  },

  /**
   * Get quick win recommendations (low effort, high impact)
   */
  getQuickWins(recommendations: StepRecommendation[]): StepRecommendation[] {
    return recommendations
      .filter(rec => {
        const timeEstimate = rec.step.estimated_time_days || 7;
        return timeEstimate <= 3 && rec.score > 15; // Quick and valuable
      })
      .slice(0, 3);
  },

  /**
   * Get strategic steps (high impact, longer term)
   */
  getStrategicSteps(recommendations: StepRecommendation[]): StepRecommendation[] {
    return recommendations
      .filter(rec => {
        const timeEstimate = rec.step.estimated_time_days || 7;
        return timeEstimate > 7 && rec.score > 20; // Longer term but high value
      })
      .slice(0, 4);
  },

  /**
   * Get community favorite steps
   */
  getCommunityFavorites(recommendations: StepRecommendation[]): StepRecommendation[] {
    return recommendations
      .filter(rec => (rec.communityAdoptionRate || 0) > 0.6)
      .sort((a, b) => (b.communityAdoptionRate || 0) - (a.communityAdoptionRate || 0))
      .slice(0, 5);
  },

  /**
   * Get expert recommended steps
   */
  getExpertRecommended(recommendations: StepRecommendation[]): StepRecommendation[] {
    return recommendations
      .filter(rec => rec.expertEndorsement)
      .slice(0, 3);
  },

  /**
   * Helper methods
   */
  getTimeScore(estimatedDays: number, timeAvailable: 'low' | 'medium' | 'high'): number {
    const timeMapping = {
      low: [1, 3],    // 1-3 days
      medium: [3, 7], // 3-7 days  
      high: [7, 21]   // 7-21 days
    };

    const [min, max] = timeMapping[timeAvailable];
    if (estimatedDays >= min && estimatedDays <= max) {
      return 5;
    } else if (estimatedDays < min) {
      return 3; // Too short, might be too easy
    } else {
      return -2; // Too long for available time
    }
  },

  getEstimatedImpact(step: JourneyStep, score: number): string {
    if (score > 25) return 'High impact on journey progress';
    if (score > 15) return 'Moderate impact on current phase';
    if (score > 5) return 'Incremental progress benefit';
    return 'Limited immediate impact';
  },

  getSuggestedOrder(step: JourneyStep, context: RecommendationContext): number {
    // This would implement sophisticated ordering logic
    // For now, return the step's natural order index
    return step.order_index;
  },

  /**
   * Get personalized recommendations based on company learning patterns
   */
  async getPersonalizedRecommendations(companyId: string): Promise<StepRecommendation[]> {
    // Get company's completion patterns
    const { data: completionHistory } = await supabase
      .from('company_journey_steps_new')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'complete')
      .order('completed_at');

    if (!completionHistory?.length) {
      // New company, return general recommendations
      return this.getNewCompanyRecommendations();
    }

    // Analyze patterns and provide recommendations
    const context: RecommendationContext = {
      companyId,
      completedStepIds: completionHistory.map(s => s.framework_step_id).filter(Boolean),
      currentPhaseId: this.getCurrentPhase(completionHistory)
    };

    const recommendations = await this.getRecommendations(context);
    return recommendations.nextSteps;
  },

  /**
   * Get recommendations for new companies
   */
  async getNewCompanyRecommendations(): Promise<StepRecommendation[]> {
    const { data: popularSteps } = await supabase
      .from('journey_canonical_steps')
      .select('*')
      .eq('is_active', true)
      .in('difficulty', ['Low', 'Medium'])
      .limit(5);

    return (popularSteps || []).map((step, index) => ({
      step,
      score: 20 - index,
      reasoning: ['Great starting point for new companies', 'Commonly completed first'],
      priority: 'high' as const,
      estimatedImpact: 'Foundation building',
      prerequisites: [],
      suggestedOrder: index + 1
    }));
  },

  getCurrentPhase(completionHistory: any[]): string {
    // Logic to determine current phase based on completion history
    return completionHistory[completionHistory.length - 1]?.phase_id || '';
  }
};
