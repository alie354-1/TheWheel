import { useState, useEffect } from 'react';
import { newJourneyFeaturesService } from '../../../../lib/services/new_journey/new_journey_features.service';
import { NewDomainProgress, TeamInvolvement, MaturityLevel, CurrentState } from '../../../../lib/types/new_journey.types';

// Interface for the YourProgress component
export interface DomainMaturityItem {
  domain: string;
  domainColor?: string;
  maturityLevel: MaturityLevel;
  currentState: CurrentState;
  stepsEngaged: number;
  timeInvested: number;
  teamInvolvement?: TeamInvolvement;
}

/**
 * Hook for fetching and managing company journey progress data
 * using the new maturity-based tracking system
 */
export const useCompanyProgress = (journeyId: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<NewDomainProgress[]>([]);
  
  // Extract fetchProgress function to make it reusable
  const fetchProgress = async () => {
    try {
      // Skip if journeyId is empty
      if (!journeyId) {
        console.error('Error fetching domain progress: Empty journey ID');
        setLoading(false);
        return;
      }
      
      // Only show loading state on initial fetch
      if (progressData.length === 0) {
        setLoading(true);
      }
      const data = await newJourneyFeaturesService.getProgressByDomain(journeyId);
      setProgressData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching domain progress:', err);
      setError('Failed to load domain progress data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch progress data with polling
  useEffect(() => {
    // Skip if journeyId is empty
    if (!journeyId) {
      console.log('Empty journeyId provided to useCompanyProgress, skipping fetch');
      setLoading(false);
      return;
    }
    
    // Initial fetch
    fetchProgress();
    
    // Set up polling interval (every 30 seconds)
    const pollingInterval = setInterval(() => {
      fetchProgress();
    }, 30000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [journeyId]);

  // Group domains by maturity level
  const domainsByMaturity = progressData.reduce((acc, domain) => {
    const level = domain.maturity_level;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(domain);
    return acc;
  }, {} as Record<string, NewDomainProgress[]>);

  // Group domains by current state
  const domainsByState = progressData.reduce((acc, domain) => {
    const state = domain.current_state;
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(domain);
    return acc;
  }, {} as Record<string, NewDomainProgress[]>);

  // Calculate engagement metrics
  const engagementMetrics = {
    totalDomainsEngaged: progressData.filter(d => d.total_steps_engaged > 0).length,
    activeFocusDomains: progressData.filter(d => d.current_state === 'active_focus').length,
    mostMatureDomain: progressData.length > 0 
      ? progressData.reduce((prev, current) => {
          const maturityRanking = {
            'exploring': 1,
            'learning': 2,
            'practicing': 3,
            'refining': 4,
            'teaching': 5
          };
          return maturityRanking[current.maturity_level] > maturityRanking[prev.maturity_level] 
            ? current : prev;
        })
      : null,
    totalTimeInvested: progressData.reduce((sum, domain) => sum + domain.time_invested_days, 0)
  };

  // Format data for the YourProgress component
  const formatForProgressComponent = (): DomainMaturityItem[] => {
    return progressData.map(domain => ({
      domain: domain.domain_name,
      domainColor: domain.color,
      maturityLevel: domain.maturity_level,
      currentState: domain.current_state,
      stepsEngaged: domain.total_steps_engaged,
      timeInvested: domain.time_invested_days,
      // Use the team_involvement_level from the domain progress data, or default to 'solo'
      teamInvolvement: domain.team_involvement_level || 'solo' as TeamInvolvement 
    }));
  };

  return {
    loading,
    error,
    progressData,
    domainsByMaturity,
    domainsByState,
    engagementMetrics,
    // Formatted data for the YourProgress component
    formattedProgressData: formatForProgressComponent(),
    refresh: fetchProgress
  };
};
