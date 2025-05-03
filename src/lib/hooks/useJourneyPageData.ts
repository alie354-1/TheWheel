import { useState, useEffect } from 'react';
import { useJourneySteps } from './useJourneySteps';
import { useCompanyJourney } from './useCompanyJourney';
import { StepStatus } from '../../components/company/journey/StepCard/StepCardProps';
import { JourneyPhase, JourneyStep } from '../types/journey-unified.types';

// Create a unified hook that combines data from both hooks
export function useJourneyPageData(companyId: string) {
  const [phases, setPhases] = useState<JourneyPhase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get steps data
  const {
    steps,
    loading: stepsLoading,
    error: stepsError
  } = useJourneySteps({ companyId });

  // Get company journey data
  const {
    companySteps,
    phaseProgress,
    isLoading: companyJourneyLoading,
    error: companyJourneyError
  } = useCompanyJourney(companyId);

  // Extract phases from phase progress
  useEffect(() => {
    if (phaseProgress && phaseProgress.length > 0) {
      const extractedPhases = phaseProgress.map(pp => ({
        id: pp.id,
        name: pp.name,
        description: pp.description || '',
        color: pp.color || '#4F46E5',
        order_index: pp.order_index || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      setPhases(extractedPhases);
    }
  }, [phaseProgress]);

  // Update loading state
  useEffect(() => {
    setIsLoading(stepsLoading || companyJourneyLoading);
  }, [stepsLoading, companyJourneyLoading]);

  // Update error state
  useEffect(() => {
    if (stepsError) {
      setError(stepsError);
    } else if (companyJourneyError) {
      setError(companyJourneyError);
    } else {
      setError(null);
    }
  }, [stepsError, companyJourneyError]);

  // Function to update step status
  const updateStepStatus = async (stepId: string, status: StepStatus) => {
    try {
      // Call the appropriate service method from useCompanyJourney
      // This is a placeholder - replace with actual implementation
      await Promise.resolve(); // Simulate an async operation
      
      // In a real implementation, you would call something like this:
      // await updateStepProgress(stepId, { status });
      
      console.log(`Updated step ${stepId} to status ${status}`);
    } catch (err) {
      console.error('Error updating step status:', err);
      throw err;
    }
  };

  return {
    phases,
    steps,
    companySteps,
    isLoading,
    error,
    updateStepStatus
  };
}
