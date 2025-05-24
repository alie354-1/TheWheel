import { supabase } from '@/lib/supabase';
import type {
  StepRecommendation,
  EnhancedJourneyStep,
  // RecommendationScore // Defined below based on usage
} from '@/lib/types/journey-steps.types';

// Define RecommendationScore based on usage in getOptimizedPath and scoreSteps
// Ensure this matches the definition in core.service.ts and journey-steps.types.ts
interface RecommendationScore extends EnhancedJourneyStep {
  score: number;
  reasoning: string[];
}

export class OptimizationRecommendationService {
  /**
   * Get an optimized journey path for a company
   */
  public static async getOptimizedPath(
    companyId: string,
    timeConstraint?: number,
    maxSteps: number = 10
  ): Promise<StepRecommendation[]> {
    try {
      // Get company's current progress
      const { data: progressData, error: progressError } = await supabase
        .from('company_progress')
        .select('step_id, status')
        .eq('company_id', companyId);

      if (progressError) throw progressError;
      const progress = progressData || [];

      // Get company information
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*') // Select necessary fields for scoring
        .eq('id', companyId)
        .single();

      if (companyError && companyError.code !== 'PGRST116') throw companyError;
      const companyInfo = company || {};

      // Get all available steps that aren't completed
      const completedStepIds = progress
        .filter(p => p.status === 'completed')
        .map(p => p.step_id);

      let query = supabase
        .from('journey_steps_enhanced')
        .select('*'); // Select necessary fields for scoring and time calculation

      if (completedStepIds.length > 0) {
         query = query.not('id', 'in', `(${completedStepIds.join(',')})`);
      }
      query = query.order('order_index', { ascending: true });


      const { data: availableStepsData, error: stepsError } = await query;

      if (stepsError) throw stepsError;
      const availableSteps = availableStepsData || [];

      // Calculate estimated time for each step
      const stepsWithTime = availableSteps.map(step => ({
        ...step,
        // Ensure estimated_time_min and estimated_time_max are numbers
        estimated_time: ((step.estimated_time_min || 0) + (step.estimated_time_max || 0)) / 2
      }));

      // If time constraint is set, filter steps that fit within the constraint
      let filteredSteps = stepsWithTime;
      if (timeConstraint) {
        const timeConstraintMinutes = timeConstraint * 24 * 60; // convert days to minutes

        // Sort steps by value (using difficulty_level as a proxy for value, ensure it exists)
        filteredSteps.sort((a, b) => (a.difficulty_level || 0) - (b.difficulty_level || 0));

        // Greedy algorithm to select steps within time constraint
        let selectedSteps: any[] = [];
        let totalTime = 0;

        for (const step of filteredSteps) {
          if (totalTime + step.estimated_time <= timeConstraintMinutes) {
            selectedSteps.push(step);
            totalTime += step.estimated_time;
          }

          if (selectedSteps.length >= maxSteps) break;
        }

        filteredSteps = selectedSteps;
      } else {
        // Just limit to maxSteps
        filteredSteps = filteredSteps.slice(0, maxSteps);
      }

      // Score the filtered steps
      const scoredSteps = await this.scoreSteps(
        filteredSteps,
        progress,
        companyInfo,
        { timeConstraint }
      );

      // Order steps optimally based on prerequisites and priority
      const orderedSteps = this.orderStepsOptimally(scoredSteps);

      // Convert to recommendation format
      return orderedSteps.map(step => ({
        id: step.id,
        name: step.name,
        description: step.description,
        difficulty_level: step.difficulty_level,
        estimated_time_min: step.estimated_time_min,
        estimated_time_max: step.estimated_time_max,
        phase_id: step.phase_id,
        phase_name: step.phase_name,
        relevance_score: step.score,
        reasoning: step.reasoning // Assuming reasoning is string[] from RecommendationScore
      }));
    } catch (error) {
      console.error('Error getting optimized path:', error);
      return [];
    }
  }

   /**
   * Score available steps based on various factors.
   * NOTE: This is a placeholder implementation. Should ideally reuse or call CoreRecommendationService.scoreSteps
   * @private
   */
  private static async scoreSteps(
    availableSteps: EnhancedJourneyStep[],
    completedSteps: any[], // Replace 'any' with actual type if known
    companyData: any, // Replace 'any' with actual type if known
    context?: any // Replace 'any' with actual type if known
  ): Promise<RecommendationScore[]> {
    console.warn('scoreSteps (Optimization): Placeholder implementation.');
    // TODO: Implement actual scoring logic or call CoreRecommendationService.scoreSteps
    return availableSteps.map(step => ({
      ...step,
      score: Math.random(),
      reasoning: ['Placeholder reasoning for optimization path.']
    }));
  }

  /**
   * Order steps optimally based on prerequisites and priority.
   * NOTE: This is a placeholder implementation. Actual logic involves topological sort + priority.
   * @private
   */
  private static orderStepsOptimally(scoredSteps: RecommendationScore[]): RecommendationScore[] {
     console.warn('orderStepsOptimally: Placeholder implementation.');
     // TODO: Implement topological sort based on 'prerequisite_steps' and then sort by 'score'
     // For now, just return sorted by score as a basic approximation
     return scoredSteps.sort((a, b) => b.score - a.score);
  }
}
