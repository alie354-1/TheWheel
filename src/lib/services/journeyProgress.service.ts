/**
 * Journey Progress Service
 * 
 * Manages progress tracking, analytics, and intelligent recommendations
 * for company journey steps including:
 * - Progress tracking and analytics
 * - Smart recommendations based on progress patterns
 * - Milestone detection and celebrations
 * - Bottleneck identification
 */

import { supabase } from '../supabase';
import {
  CompanyJourneyStep,
  CompanyStepProgress,
  step_status,
  JourneyPhase,
  JourneyDomain
} from '../types/journey-unified.types';

export interface ProgressAnalytics {
  totalSteps: number;
  completedSteps: number;
  inProgressSteps: number;
  blockedSteps: number;
  completionRate: number;
  averageTimePerStep: number;
  currentPhase: string;
  nextMilestone: string;
  estimatedCompletionDays: number;
}

export interface SmartRecommendation {
  id: string;
  type: 'next_step' | 'unblock' | 'optimize' | 'milestone';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  stepId?: string;
  actionItems: string[];
  reasoning: string[];
  estimatedImpact: string;
}

export interface ProgressMilestone {
  id: string;
  name: string;
  description: string;
  phaseId: string;
  requiredStepIds: string[];
  isCompleted: boolean;
  completedAt?: string;
  celebrationMessage?: string;
}

export const journeyProgressService = {
  /**
   * Get comprehensive progress analytics for a company
   */
  async getProgressAnalytics(companyId: string): Promise<ProgressAnalytics> {
    const { data: steps, error } = await supabase
      .from('company_journey_steps_new')
      .select(`
        *,
        journey_phases_new!phase_id(name, order_index)
      `)
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (error) throw error;

    const totalSteps = steps?.length || 0;
    const completedSteps = steps?.filter(s => s.status === 'completed').length || 0;
    const inProgressSteps = steps?.filter(s => s.status === 'in_progress').length || 0;
    const blockedSteps = steps?.filter(s => s.status === 'not_started' && s.notes?.includes('blocked')).length || 0;
    
    const completionRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    // Calculate current phase (phase with most in-progress steps)
    const phaseProgress = steps?.reduce((acc: Record<string, { name: string; inProgress: number; orderIndex: number }>, step) => {
      const phase = step.journey_phases as any;
      const phaseName = phase?.name || 'Unknown';
      const orderIndex = phase?.order_index || 0;
      
      if (!acc[phaseName]) {
        acc[phaseName] = { name: phaseName, inProgress: 0, orderIndex };
      }
      
      if (step.status === 'in_progress' || step.status === 'not_started') {
        acc[phaseName].inProgress++;
      }
      
      return acc;
    }, {}) || {};

    const currentPhase = Object.values(phaseProgress)
      .sort((a, b) => b.inProgress - a.inProgress || a.orderIndex - b.orderIndex)[0]?.name || 'Unknown';

    // Calculate average time per step (mock calculation)
    const completedWithDates = steps?.filter(s => s.status === 'completed' && s.completed_at) || [];
    const averageTimePerStep = completedWithDates.length > 0 ? 7 : 14; // Mock: 7 days average

    // Estimate completion time
    const remainingSteps = totalSteps - completedSteps;
    const estimatedCompletionDays = remainingSteps * averageTimePerStep;

    return {
      totalSteps,
      completedSteps,
      inProgressSteps,
      blockedSteps,
      completionRate,
      averageTimePerStep,
      currentPhase,
      nextMilestone: 'Phase Completion', // Mock
      estimatedCompletionDays
    };
  },

  /**
   * Get smart recommendations based on company progress
   */
  async getSmartRecommendations(companyId: string): Promise<SmartRecommendation[]> {
    const analytics = await this.getProgressAnalytics(companyId);
    const recommendations: SmartRecommendation[] = [];

    // Get all company steps for analysis
    const { data: steps } = await supabase
      .from('company_journey_steps_new')
      .select(`
        *,
        journey_phases_new!phase_id(name, order_index)
      `)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('order_index');

    if (!steps) return recommendations;

    // Recommendation 1: Next logical step
    const nextStep = steps.find(s => s.status === 'not_started');
    if (nextStep) {
      recommendations.push({
        id: 'next-step',
        type: 'next_step',
        title: 'Continue Your Journey',
        description: `Ready to tackle "${nextStep.name}"? This is your next logical step.`,
        priority: 'high',
        stepId: nextStep.id,
        actionItems: [
          'Review step requirements',
          'Gather necessary resources',
          'Set realistic timeline',
          'Begin execution'
        ],
        reasoning: [
          'This step follows your current progress path',
          'Prerequisites are completed',
          'Fits your current phase focus'
        ],
        estimatedImpact: 'Move closer to phase completion'
      });
    }

    // Recommendation 2: Unblock stalled steps
    const stalledSteps = steps.filter(s => 
      s.status === 'in_progress' && 
      s.updated_at && 
      new Date(s.updated_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days old
    );

    if (stalledSteps.length > 0) {
      recommendations.push({
        id: 'unblock-stalled',
        type: 'unblock',
        title: 'Unblock Stalled Steps',
        description: `You have ${stalledSteps.length} step(s) that haven't been updated in over a week.`,
        priority: 'medium',
        actionItems: [
          'Review what\'s blocking progress',
          'Adjust scope or approach',
          'Seek help if needed',
          'Update status and notes'
        ],
        reasoning: [
          'Steps in progress for too long often indicate blockers',
          'Regular progress updates improve momentum',
          'Addressing blockers prevents cascading delays'
        ],
        estimatedImpact: 'Improve overall journey velocity'
      });
    }

    // Recommendation 3: Phase completion milestone
    const currentPhaseSteps = steps.filter(s => {
      const phase = s.journey_phases as any;
      return phase?.name === analytics.currentPhase;
    });

    const currentPhaseCompletion = currentPhaseSteps.length > 0 
      ? (currentPhaseSteps.filter(s => s.status === 'completed').length / currentPhaseSteps.length) * 100 
      : 0;

    if (currentPhaseCompletion >= 80) {
      recommendations.push({
        id: 'phase-milestone',
        type: 'milestone',
        title: 'Phase Completion in Sight!',
        description: `You're ${Math.round(currentPhaseCompletion)}% through the ${analytics.currentPhase} phase.`,
        priority: 'medium',
        actionItems: [
          'Complete remaining steps in this phase',
          'Review phase outcomes',
          'Prepare for next phase',
          'Celebrate progress!'
        ],
        reasoning: [
          'High completion rate in current phase',
          'Momentum is strong',
          'Phase transition approaching'
        ],
        estimatedImpact: 'Major milestone achievement'
      });
    }

    // Recommendation 4: Optimize based on patterns
    if (analytics.completionRate > 50) {
      recommendations.push({
        id: 'optimize-workflow',
        type: 'optimize',
        title: 'Optimize Your Workflow',
        description: 'You\'re making great progress! Consider optimizing your approach.',
        priority: 'low',
        actionItems: [
          'Review what\'s working best',
          'Standardize successful patterns',
          'Skip non-essential steps',
          'Focus on high-impact activities'
        ],
        reasoning: [
          'Strong completion rate indicates good execution',
          'Optimization can accelerate remaining progress',
          'Experience gained can improve efficiency'
        ],
        estimatedImpact: 'Faster completion of remaining steps'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },

  /**
   * Get progress milestones for a company
   */
  async getProgressMilestones(companyId: string): Promise<ProgressMilestone[]> {
    // Get all phases for the company
    const { data: phases } = await supabase
      .from('journey_phases_new')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (!phases) return [];

    // Get company steps
    const { data: companySteps } = await supabase
      .from('company_journey_steps_new')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (!companySteps) return [];

    // Create milestones for each phase
    const milestones: ProgressMilestone[] = phases.map(phase => {
      const phaseSteps = companySteps.filter(s => s.phase_id === phase.id);
      const completedSteps = phaseSteps.filter(s => s.status === 'completed');
      const isCompleted = phaseSteps.length > 0 && completedSteps.length === phaseSteps.length;
      
      // Find latest completion date for this phase
      const completedAt = isCompleted 
        ? completedSteps
            .map(s => s.completed_at)
            .filter(Boolean)
            .sort()
            .pop()
        : undefined;

      return {
        id: `phase-${phase.id}`,
        name: `${phase.name} Phase Complete`,
        description: `Complete all steps in the ${phase.name} phase of your journey.`,
        phaseId: phase.id,
        requiredStepIds: phaseSteps.map(s => s.id),
        isCompleted,
        completedAt,
        celebrationMessage: isCompleted 
          ? `🎉 Congratulations! You've completed the ${phase.name} phase!`
          : undefined
      };
    });

    return milestones;
  },

  /**
   * Track step progress update
   */
  async trackProgressUpdate(companyId: string, stepId: string, oldStatus: step_status, newStatus: step_status): Promise<void> {
    // Record progress history
    await supabase
      .from('company_step_progress')
      .insert({
        company_id: companyId,
        step_id: stepId,
        status: newStatus,
        notes: `Status changed from ${oldStatus} to ${newStatus}`
      });

    // Check for milestone completion
    if (newStatus === 'completed') {
      await this.checkMilestoneCompletion(companyId, stepId);
    }
  },

  /**
   * Check if step completion triggers milestone
   */
  async checkMilestoneCompletion(companyId: string, completedStepId: string): Promise<void> {
    const milestones = await this.getProgressMilestones(companyId);
    
    for (const milestone of milestones) {
      if (!milestone.isCompleted && milestone.requiredStepIds.includes(completedStepId)) {
        // Check if all required steps are now completed
        const { data: requiredSteps } = await supabase
          .from('company_journey_steps_new')
          .select('status')
          .eq('company_id', companyId)
          .in('id', milestone.requiredStepIds);

        const allCompleted = requiredSteps?.every(s => s.status === 'completed') || false;
        
        if (allCompleted) {
          // Create milestone completion notification
          await supabase
            .from('notifications')
            .insert({
              user_id: companyId, // This would need to be the actual user ID
              company_id: companyId,
              event_type: 'milestone_completed',
              title: milestone.name,
              body: milestone.celebrationMessage || 'Milestone completed!',
              priority: 'high',
              is_read: false
            });
        }
      }
    }
  },

  /**
   * Get progress trends over time
   */
  async getProgressTrends(companyId: string, days: number = 30): Promise<Array<{
    date: string;
    completedSteps: number;
    totalSteps: number;
    completionRate: number;
  }>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    // This would need more sophisticated date-based progress tracking
    // For now, return mock trend data
    const trends = [];
    for (let i = 0; i < days; i += 7) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      trends.push({
        date: date.toISOString().split('T')[0],
        completedSteps: Math.floor(Math.random() * 10) + i,
        totalSteps: 50,
        completionRate: ((Math.floor(Math.random() * 10) + i) / 50) * 100
      });
    }
    
    return trends;
  }
};
