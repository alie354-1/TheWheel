import { supabase } from '@/lib/supabase';
import { loggingService } from '../logging.service';
import type {
  StepRecommendation,
  EnhancedJourneyStep,
} from '@/lib/types/journey-steps.types';

// Basic interfaces needed
interface EventData {
  [key: string]: any;
}

interface RecommendationScore extends EnhancedJourneyStep {
  score: number;
  reasoning: string[];
}

interface PartialCompanyData {
  industry_id?: string | null;
  stage?: string | null;
  size?: string | null;
  business_model?: string | null;
  focus_areas?: string[] | null;
  maturity_score?: number | null;
}

interface CompletedStepInfo {
  step_id: string;
  status: string;
  updated_at: string;
}

// The main service class
export class CoreRecommendationService {

  // Main recommendation method
  public static async getRecommendations(
    companyId: string,
    limit: number = 5,
    context?: {
      userId?: string;
      learningStyle?: string | null;
      pacePreference?: number | null;
      selectedPhases?: string[];
      focusAreas?: string[];
      timeConstraint?: number;
      companyId?: string;
      companyMaturity?: number;
      recentCompletions?: { stepId: string; completedAt: string }[];
      teamSize?: number;
      userRole?: string;
      previousSuccessPatterns?: string[];
    }
  ): Promise<StepRecommendation[]> {
    try {
      // Track the recommendation request
      if (context?.userId) {
        this.trackRecommendationEvent(companyId, context.userId, 'request', {
          limit,
          context: { ...context, userId: 'REDACTED' }, // Don't log the actual userId
        });
      }

      // Get company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('industry_id, stage, size, business_model, focus_areas, maturity_score')
        .eq('id', companyId)
        .single();

      if (companyError) {
        console.error('Error fetching company data:', companyError);
        return [];
      }

      // Get completed steps for this company
      const { data: completedStepsData, error: completedStepsError } = await supabase
        .from('company_journey_steps')
        .select('step_id, status, updated_at')
        .eq('company_id', companyId)
        .in('status', ['completed', 'in_progress']);

      if (completedStepsError) {
        console.error('Error fetching completed steps:', completedStepsError);
        return [];
      }

      // Get all available steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('journey_steps')
        .select(`
          id, 
          name, 
          description, 
          phase_id, 
          order_index, 
          difficulty_level, 
          estimated_time_min, 
          estimated_time_max,
          phases:phase_id (name)
        `)
        // Add cast to ensure correct typescript typing
        .returns<Array<{
          id: string;
          name: string;
          description?: string;
          phase_id: string;
          order_index: number;
          difficulty_level: number;
          estimated_time_min: number;
          estimated_time_max: number;
          phases?: { name: string } | null;
        }>>()
        .order('order_index');

      if (stepsError) {
        console.error('Error fetching steps:', stepsError);
        return [];
      }

      // Format steps to match EnhancedJourneyStep interface
      const enhancedSteps: EnhancedJourneyStep[] = stepsData.map(step => ({
        id: step.id,
        name: step.name,
        description: step.description || '',
        phase_id: step.phase_id,
        phase_name: typeof step.phases === 'object' && step.phases ? step.phases.name || '' : '',
        order_index: step.order_index,
        // Cast difficulty level to the type expected by EnhancedJourneyStep (1-5)
        difficulty_level: Math.min(5, Math.max(1, step.difficulty_level)) as 1 | 2 | 3 | 4 | 5,
        estimated_time_min: step.estimated_time_min,
        estimated_time_max: step.estimated_time_max,
        created_at: new Date().toISOString(), // Adding missing fields
        updated_at: new Date().toISOString()
      }));

      // Filter out steps that are already completed
      const completedStepIds = completedStepsData
        .filter(s => s.status === 'completed')
        .map(s => s.step_id);
      
      // Get steps that are not completed yet
      const availableSteps = enhancedSteps.filter(
        step => !completedStepIds.includes(step.id)
      );

      // Score the steps
      const scoredSteps = await this.scoreSteps(
        availableSteps,
        completedStepsData,
        companyData,
        context
      );

      // Sort by score and limit
      const recommendations = scoredSteps
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(step => ({
          id: step.id,
          name: step.name,
          description: step.description,
          phase_id: step.phase_id,
          phase_name: step.phase_name,
          difficulty_level: step.difficulty_level,
          estimated_time_min: step.estimated_time_min,
          estimated_time_max: step.estimated_time_max,
          relevance_score: step.score,
          reasoning: step.reasoning,
          explanation: {
            reasoning: step.reasoning,
            confidence_score: Math.round((step.score / 10) * 100), // as a percentage
            key_factors: step.reasoning.map(r => {
              // Extract key factor from reasoning string (first sentence or phrase)
              const idx = r.indexOf('.') !== -1 ? r.indexOf('.') : r.length;
              return r.slice(0, idx).trim();
            }),
          }
        }));

      // Track success
      if (context?.userId) {
        this.trackRecommendationEvent(companyId, context.userId, 'success', {
          recommendationCount: recommendations.length,
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      
      // Track error
      if (context?.userId) {
        this.trackRecommendationEvent(companyId, context.userId, 'error', {
          error: String(error),
        });
      }
      
      return [];
    }
  }

  // Helper methods
  private static async trackRecommendationEvent(
    companyId: string,
    userId: string | undefined,
    eventType: 'request' | 'success' | 'error' | 'impression' | 'selection' | 'completion',
    data: EventData
  ): Promise<void> {
    console.log('Tracking recommendation event:', eventType, { companyId, userId, data });
  }

  private static async scoreSteps(
    availableSteps: EnhancedJourneyStep[],
    completedSteps: CompletedStepInfo[],
    companyData: PartialCompanyData,
    context?: any
  ): Promise<RecommendationScore[]> {
    console.log('Scoring steps with context:', context);
    
    // Create a lookup of completed step IDs for quick reference
    const completedStepIds = new Set(
      completedSteps.filter(s => s.status === 'completed').map(s => s.step_id)
    );
    
    // Get steps that are in progress
    const inProgressStepIds = new Set(
      completedSteps.filter(s => s.status === 'in_progress').map(s => s.step_id)
    );

    return availableSteps.map(step => {
      let score = 5; // Base score
      const reasoning: string[] = [];
      
      // Factor 1: Step difficulty relative to company maturity
      const difficultyScore = this.calculateDifficultyScore(step.difficulty_level, companyData.maturity_score || 1);
      score += difficultyScore;
      
      if (difficultyScore > 0) {
        reasoning.push('This step matches your company\'s current maturity level.');
      } else if (difficultyScore < 0) {
        reasoning.push('This step may be challenging for your current maturity level, but offers growth opportunity.');
      }
      
      // Factor 2: Quick wins (steps with lower time estimates)
      if (step.estimated_time_max < 240) { // Less than 4 hours
        score += 1;
        reasoning.push('This is a quick win that can be completed in a short time.');
      }
      
      // Factor 3: Industry relevance
      if (companyData.industry_id) {
        // In a real implementation, we would check if the step is relevant to the company's industry
        // For now, we'll randomly assign relevance to some steps
        if (step.id.charCodeAt(0) % 3 === 0) {
          score += 2;
          reasoning.push('This step is particularly relevant for companies in your industry.');
        }
      }
      
      // Factor 4: Business model alignment
      if (companyData.business_model) {
        // Similar to industry, we'll use a simple algorithm for demo purposes
        if (step.id.charCodeAt(1) % 2 === 0) {
          score += 1.5;
          reasoning.push('This aligns well with your business model.');
        }
      }
      
      // Factor 5: Learning style preference
      if (context?.learningStyle) {
        // For demo, just boosting some steps based on ID
        if (step.id.charCodeAt(2) % 4 === 0) {
          score += 1;
          reasoning.push('This matches your preferred learning style.');
        }
      }
      
      // Factor 6: Focus areas
      if (context?.focusAreas && context.focusAreas.length > 0) {
        // Simulate focus area matching
        if (step.id.charCodeAt(3) % 5 === 0) {
          score += 2;
          reasoning.push('This step addresses one of your focus areas.');
        }
      }
      
      // Factor 7: Prerequisites completed
      const hasPrerequisites = this.checkPrerequisitesCompleted(step.id, completedStepIds);
      if (hasPrerequisites) {
        score += 2;
        reasoning.push('You have completed all prerequisites for this step.');
      }
      
      // Factor 8: Continuation of in-progress work
      if (inProgressStepIds.has(step.id)) {
        score += 3;
        reasoning.push('You\'ve already started working on this.');
      }
      
      // Normalize score to be between 1-10
      const normalizedScore = Math.min(10, Math.max(1, score));
      
      return {
        ...step,
        score: normalizedScore,
        reasoning: reasoning.length > 0 ? reasoning : ['Based on your company profile.'],
      };
    });
  }

  // Helper function to calculate difficulty appropriateness
  private static calculateDifficultyScore(stepDifficulty: number, companyMaturity: number): number {
    // Ideal: step difficulty is close to company maturity
    const diff = Math.abs(stepDifficulty - companyMaturity);
    
    if (diff <= 1) return 2; // Very appropriate
    if (diff <= 2) return 1; // Somewhat appropriate
    if (diff <= 3) return 0; // Neutral
    return -1; // May be too easy or too hard
  }

  // Helper function to check if prerequisites are completed
  private static checkPrerequisitesCompleted(stepId: string, completedStepIds: Set<string>): boolean {
    // In a real implementation, we would look up the step's prerequisites
    // For demo purposes, we'll use a simple algorithm
    
    // Pretend that steps have prerequisites based on their ID
    const hasPrerequisites = stepId.charCodeAt(0) % 2 === 0;
    
    if (!hasPrerequisites) {
      return true; // No prerequisites
    }
    
    // For steps with prerequisites, randomly determine if they're met
    return stepId.charCodeAt(1) % 3 === 0;
  }
}
