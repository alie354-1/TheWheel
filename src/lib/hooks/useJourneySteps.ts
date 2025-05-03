import { useState, useEffect, useCallback } from 'react';
import { JourneyUnifiedService } from '../services/journey-unified.service';
import { JourneyStep, CompanyJourneyStep } from '../types/journey-unified.types';

interface UseJourneyStepsProps {
  companyId?: string;
  phaseId?: string;
  refreshInterval?: number; // milliseconds
}

/**
 * React hook for accessing journey steps with optional filtering and auto-refresh
 * @param props Configuration options
 * @returns Journey steps data and management functions
 */
export const useJourneySteps = (props?: UseJourneyStepsProps) => {
  const { companyId, phaseId, refreshInterval } = props || {};
  
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [companyProgress, setCompanyProgress] = useState<CompanyJourneyStep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Loads steps with optional filtering
   */
  const loadSteps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let stepsData: JourneyStep[];
      
      if (phaseId) {
        stepsData = await JourneyUnifiedService.getSteps({ phaseId });
      } else {
        stepsData = await JourneyUnifiedService.getSteps();
      }
      
      setSteps(stepsData);
      
      // If company ID is provided, load progress data
      if (companyId) {
        const progressData = await JourneyUnifiedService.getCompanyProgress(companyId);
        setCompanyProgress(progressData);
      }
    } catch (err) {
      console.error('Error loading journey steps:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading steps'));
    } finally {
      setLoading(false);
    }
  }, [phaseId, companyId]);
  
  /**
   * Updates step progress and refreshes data
   */
  const updateStepProgress = useCallback(async (
    stepId: string,
    data: { 
      status?: 'not_started' | 'in_progress' | 'completed' | 'skipped';
      notes?: string;
      completion_percentage?: number;
    }
  ) => {
    if (!companyId) {
      throw new Error('Company ID is required to update step progress');
    }
    
    try {
      await JourneyUnifiedService.updateStepProgress(companyId, stepId, data);
      
      // Refresh data
      loadSteps();
      
      return true;
    } catch (err) {
      console.error('Error updating step progress:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating progress'));
      return false;
    }
  }, [companyId, loadSteps]);
  
  // Initial load
  useEffect(() => {
    loadSteps();
  }, [loadSteps]);
  
  // Setup refresh interval if specified
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      loadSteps();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, loadSteps]);
  
  /**
   * Get merged data with steps and company progress
   */
  const getStepsWithProgress = useCallback(() => {
    if (!companyId || companyProgress.length === 0) return steps;
    
    return steps.map(step => {
      const progress = companyProgress.find(p => p.step_id === step.id);
      
      if (!progress) return { ...step, progress: null };
      
      return {
        ...step,
        progress: {
          status: progress.status,
          completion_percentage: progress.completion_percentage,
          notes: progress.notes,
          completed_at: progress.completed_at,
        }
      };
    });
  }, [steps, companyProgress, companyId]);
  
  return {
    steps,
    companyProgress,
    loading,
    error,
    refreshSteps: loadSteps,
    updateStepProgress,
    stepsWithProgress: getStepsWithProgress(),
  };
};

export default useJourneySteps;
