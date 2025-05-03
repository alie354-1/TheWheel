import { useState, useEffect, useCallback } from 'react';
import { 
  CompanyJourneyStep, 
  JourneyStep, 
  JourneyPhase,
  PhaseWithProgress,
  JourneyStepComplete
} from '../types/journey-unified.types';
import { JourneyUnifiedService } from '../services/journey-unified.service';
import { StepNotFoundError, ValidationError } from '../errors/journey-errors';

/**
 * Hook for interacting with a company's journey
 * Provides methods for accessing and updating journey data
 */
export function useCompanyJourney(companyId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [phases, setPhases] = useState<JourneyPhase[]>([]);
  const [phaseProgress, setPhaseProgress] = useState<PhaseWithProgress[]>([]);
  const [companySteps, setCompanySteps] = useState<CompanyJourneyStep[]>([]);

  /**
   * Load all journey data for the company
   */
  const loadJourneyData = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load phases
      const phasesData = await JourneyUnifiedService.getPhases();
      setPhases(phasesData);
      
      // Load phase progress
      const progressData = await JourneyUnifiedService.getPhaseCompletionStats(companyId);
      
      // Convert to PhaseWithProgress format
      const phaseProgressData: PhaseWithProgress[] = progressData.map(stats => {
        const phase = phasesData.find(p => p.id === stats.phase_id);
        if (!phase) return null;
        
        return {
          ...phase,
          steps_count: stats.total_steps,
          completed_steps: stats.completed_steps,
          in_progress_steps: stats.in_progress_steps,
          completion_percentage: stats.completion_percentage
        };
      }).filter(Boolean) as PhaseWithProgress[];
      
      setPhaseProgress(phaseProgressData);
      
      // Load company step progress
      const stepsData = await JourneyUnifiedService.getCompanyProgress(companyId);
      setCompanySteps(stepsData);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading journey data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading journey data'));
      setIsLoading(false);
    }
  }, [companyId]);
  
  // Load data on initial render
  useEffect(() => {
    loadJourneyData();
  }, [loadJourneyData]);
  
  /**
   * Get a step with complete details including company progress
   */
  const getStepDetails = useCallback(async (stepId: string): Promise<JourneyStepComplete> => {
    try {
      return await JourneyUnifiedService.getStepComplete(stepId, companyId);
    } catch (err) {
      if (err instanceof StepNotFoundError) {
        throw err;
      }
      throw new Error(`Error fetching step details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [companyId]);
  
  /**
   * Update step progress
   */
  const updateStepProgress = useCallback(async (
    stepId: string,
    updates: {
      status?: 'not_started' | 'in_progress' | 'completed' | 'skipped';
      notes?: string;
      completion_percentage?: number;
      custom_difficulty?: number;
      custom_time_estimate?: number;
    }
  ) => {
    try {
      await JourneyUnifiedService.updateStepProgress(companyId, stepId, updates);
      
      // Update local state
      setCompanySteps(prevSteps => {
        const updatedSteps = [...prevSteps];
        const index = updatedSteps.findIndex(s => s.step_id === stepId);
        
        if (index >= 0) {
          updatedSteps[index] = {
            ...updatedSteps[index],
            ...updates,
            // Handle completed_at field based on status
            completed_at: (() => {
              if (updates.status === 'completed') {
                return new Date().toISOString();
              } else if (updates.status) {
                // Any other status should clear the completed date
                return undefined;
              } else {
                // Status not included in update, keep existing
                return updatedSteps[index].completed_at;
              }
            })()
          };
        }
        
        return updatedSteps;
      });
      
      // Refresh phase progress
      const progressData = await JourneyUnifiedService.getPhaseCompletionStats(companyId);
      const phaseProgressData: PhaseWithProgress[] = progressData.map(stats => {
        const phase = phases.find(p => p.id === stats.phase_id);
        if (!phase) return null;
        
        return {
          ...phase,
          steps_count: stats.total_steps,
          completed_steps: stats.completed_steps,
          in_progress_steps: stats.in_progress_steps,
          completion_percentage: stats.completion_percentage
        };
      }).filter(Boolean) as PhaseWithProgress[];
      
      setPhaseProgress(phaseProgressData);
      
      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }
      throw new Error(`Error updating step progress: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [companyId, phases]);
  
  /**
   * Get next recommended steps
   */
  const getNextRecommendedSteps = useCallback(async (limit: number = 3): Promise<JourneyStep[]> => {
    try {
      // For now, this is a placeholder implementation
      // It returns steps that are not started, ordered by phase/order_index
      const allSteps = await JourneyUnifiedService.getSteps();
      
      const notStartedSteps = allSteps
        .filter(step => {
          const progress = companySteps.find(s => s.step_id === step.id);
          return !progress || progress.status === 'not_started';
        })
        .sort((a, b) => {
          // First sort by phase order
          const phaseA = phases.find(p => p.id === a.phase_id);
          const phaseB = phases.find(p => p.id === b.phase_id);
          
          if (phaseA && phaseB) {
            if (phaseA.order_index !== phaseB.order_index) {
              return phaseA.order_index - phaseB.order_index;
            }
          }
          
          // Then by step order
          return a.order_index - b.order_index;
        })
        .slice(0, limit);
      
      return notStartedSteps;
    } catch (err) {
      console.error('Error getting next recommended steps:', err);
      return [];
    }
  }, [companySteps, phases]);
  
  return {
    // Data
    phases,
    phaseProgress,
    companySteps,
    
    // Status
    isLoading,
    error,
    
    // Methods
    loadJourneyData,
    getStepDetails,
    updateStepProgress,
    getNextRecommendedSteps,
    
    // Helper derived data
    completionPercentage: phaseProgress.length > 0 
      ? phaseProgress.reduce((sum, phase) => sum + (phase.completion_percentage || 0), 0) / phaseProgress.length
      : 0
  };
}
