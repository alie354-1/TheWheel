import { useState, useEffect } from 'react';
import { newJourneyFrameworkService } from '../../../../lib/services/new_journey/new_journey_framework.service';
import { newCompanyJourneyService } from '../../../../lib/services/new_journey/new_company_journey.service';
import { NewDifficulty } from '../../../../lib/types/new_journey.types';

export interface NewJourneyStep {
  id: string;
  name: string;
  domain: {
    id: string;
    name: string;
  };
  phase: {
    id: string;
    name: string;
  };
  difficulty: 'Low' | 'Medium' | 'High';
  estimatedDays: number;
  usagePercentage: number;
}

export interface PhaseFilter {
  id: string;
  name: string;
  count: number;
}

export interface DomainFilter {
  id: string;
  name: string;
  count: number;
}

export interface BrowseStepsFilters {
  domain?: string;
  phase?: string;
  difficulty?: string;
  searchQuery?: string;
}

/**
 * Hook to fetch and filter available steps for the journey system.
 */
const useBrowseSteps = (userId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSteps, setAvailableSteps] = useState<NewJourneyStep[]>([]);
  const [filteredSteps, setFilteredSteps] = useState<NewJourneyStep[]>([]);
  const [availablePhases, setAvailablePhases] = useState<PhaseFilter[]>([]);
  const [availableDomains, setAvailableDomains] = useState<DomainFilter[]>([]);
  const [filters, setFilters] = useState<BrowseStepsFilters>({});

  useEffect(() => {
    const fetchAvailableSteps = async () => {
      // Remove userId check to allow fetching canonical steps without a user
      console.log('DEBUG: useBrowseSteps - Fetching canonical steps');

      try {
        setIsLoading(true);
        console.log('DEBUG: useBrowseSteps - Starting data fetch for userId:', userId);
        
        // Fetch real data from the database using the framework service
        console.log('DEBUG: useBrowseSteps - Calling Promise.all for steps, domains, phases');
        let steps, domains, phases;
        
        try {
          // Call the simplified getFrameworkSteps method that doesn't take filters
          [steps, domains, phases] = await Promise.all([
            newJourneyFrameworkService.getFrameworkSteps(),
            newJourneyFrameworkService.getDomains(),
            newJourneyFrameworkService.getPhases()
          ]);
          console.log('DEBUG: useBrowseSteps - Promise.all completed successfully');
        } catch (fetchError) {
          console.error('DEBUG: useBrowseSteps - Error in Promise.all:', fetchError);
          throw fetchError;
        }
        
        console.log('DEBUG: useBrowseSteps - Data received:');
        console.log('DEBUG: useBrowseSteps - Steps count:', steps ? steps.length : 0);
        console.log('DEBUG: useBrowseSteps - Domains count:', domains ? domains.length : 0);
        console.log('DEBUG: useBrowseSteps - Phases count:', phases ? phases.length : 0);
        
        if (!steps || steps.length === 0) {
          console.log('DEBUG: useBrowseSteps - No steps returned from service');
          console.log('DEBUG: useBrowseSteps - Raw steps data:', steps);
        }
        
        // Transform the data to match our interface
        console.log('DEBUG: useBrowseSteps - Starting data transformation');
        let transformedSteps: NewJourneyStep[] = [];
        
        try {
          transformedSteps = steps.map((step: any) => {
            console.log('DEBUG: useBrowseSteps - Transforming step:', step.id);
            
            // Check for missing fields - using correct field names from schema
            if (!step.primary_domain_id) {
              console.warn('DEBUG: useBrowseSteps - Missing primary_domain_id for step:', step.id);
            }
            if (!step.primary_phase_id) {
              console.warn('DEBUG: useBrowseSteps - Missing primary_phase_id for step:', step.id);
            }
            if (!step.journey_domains_new) {
              console.warn('DEBUG: useBrowseSteps - Missing journey_domains_new for step:', step.id);
            }
            if (!step.journey_phases_new) {
              console.warn('DEBUG: useBrowseSteps - Missing journey_phases_new for step:', step.id);
            }
            
            return {
              id: step.id,
              name: step.name,
              domain: { 
                id: step.primary_domain_id || 'unknown', 
                name: step.journey_domains_new?.name || 'Unknown' 
              },
              phase: { 
                id: step.primary_phase_id || 'unknown', 
                name: step.journey_phases_new?.name || 'Unknown' 
              },
              difficulty: step.difficulty as 'Low' | 'Medium' | 'High',
              estimatedDays: step.estimated_days || 0,
              usagePercentage: step.usage_percentage || 0
            };
          });
          console.log('DEBUG: useBrowseSteps - Transformation completed, steps count:', transformedSteps.length);
        } catch (transformError) {
          console.error('DEBUG: useBrowseSteps - Error transforming steps:', transformError);
          console.error('DEBUG: useBrowseSteps - Raw steps data that caused error:', steps);
          throw transformError;
        }
        
        console.log('DEBUG: useBrowseSteps - Creating domain filters with counts');
        // Create domain filters with counts
        const domainCounts: Record<string, number> = {};
        transformedSteps.forEach(step => {
          domainCounts[step.domain.id] = (domainCounts[step.domain.id] || 0) + 1;
        });
        
        let domainFilters: DomainFilter[] = [];
        try {
          domainFilters = domains.map((domain: any) => ({
            id: domain.id,
            name: domain.name,
            count: domainCounts[domain.id] || 0
          }));
          console.log('DEBUG: useBrowseSteps - Domain filters created:', domainFilters.length);
        } catch (domainError) {
          console.error('DEBUG: useBrowseSteps - Error creating domain filters:', domainError);
          console.error('DEBUG: useBrowseSteps - Raw domains data:', domains);
        }
        
        console.log('DEBUG: useBrowseSteps - Creating phase filters with counts');
        // Create phase filters with counts
        const phaseCounts: Record<string, number> = {};
        transformedSteps.forEach(step => {
          phaseCounts[step.phase.id] = (phaseCounts[step.phase.id] || 0) + 1;
        });
        
        let phaseFilters: PhaseFilter[] = [];
        try {
          phaseFilters = phases.map((phase: any) => ({
            id: phase.id,
            name: phase.name,
            count: phaseCounts[phase.id] || 0
          }));
          console.log('DEBUG: useBrowseSteps - Phase filters created:', phaseFilters.length);
        } catch (phaseError) {
          console.error('DEBUG: useBrowseSteps - Error creating phase filters:', phaseError);
          console.error('DEBUG: useBrowseSteps - Raw phases data:', phases);
        }
        
        console.log('DEBUG: useBrowseSteps - Setting state with fetched data');
        setAvailableSteps(transformedSteps);
        setFilteredSteps(transformedSteps);
        setAvailableDomains(domainFilters);
        setAvailablePhases(phaseFilters);
        setError(null);
        console.log('DEBUG: useBrowseSteps - State updated successfully');
      } catch (err) {
        console.error('DEBUG: useBrowseSteps - Error in fetchAvailableSteps:', err);
        console.error('DEBUG: useBrowseSteps - Error details:', JSON.stringify(err, null, 2));
        setError('Failed to load available steps. Please try again later.');
      } finally {
        console.log('DEBUG: useBrowseSteps - Fetch completed, setting isLoading to false');
        setIsLoading(false);
      }
    };

    fetchAvailableSteps();
  }, [userId]);

  useEffect(() => {
    // Apply filters
    let result = [...availableSteps];
    
    if (filters.domain) {
      result = result.filter(step => step.domain.name === filters.domain);
    }
    
    if (filters.phase) {
      result = result.filter(step => step.phase.name === filters.phase);
    }
    
    if (filters.difficulty) {
      result = result.filter(step => step.difficulty === filters.difficulty);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(step => 
        step.name.toLowerCase().includes(query) || 
        step.domain.name.toLowerCase().includes(query) ||
        step.phase.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredSteps(result);
  }, [availableSteps, filters]);

  const updateFilters = (newFilters: Partial<BrowseStepsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const startStep = async (stepId: string): Promise<boolean> => {
    console.log('DEBUG: useBrowseSteps - startStep called with stepId:', stepId);
    
    if (!userId) {
      console.error('DEBUG: useBrowseSteps - No userId provided for startStep');
      setError('User ID is required to start a step.');
      return false;
    }
    
    try {
      console.log('DEBUG: useBrowseSteps - Getting or creating company journey for userId:', userId);
      // Get or create the company journey
      const journey = await newCompanyJourneyService.getOrCreateCompanyJourney(userId);
      console.log('DEBUG: useBrowseSteps - Journey retrieved/created:', journey.id);
      
      console.log('DEBUG: useBrowseSteps - Adding step to journey:', {
        journeyId: journey.id,
        stepId: stepId
      });
      
      // Add the step to the journey
      await newCompanyJourneyService.addStepToJourney(journey.id, stepId);
      
      console.log(`DEBUG: useBrowseSteps - Successfully started step ${stepId} for journey ${journey.id}`);
      return true;
    } catch (err) {
      console.error('DEBUG: useBrowseSteps - Error in startStep:', err);
      console.error('DEBUG: useBrowseSteps - Error details:', JSON.stringify(err, null, 2));
      setError('Failed to start step. Please try again later.');
      return false;
    }
  };

  return {
    isLoading,
    error,
    availableSteps,
    filteredSteps,
    availablePhases,
    availableDomains,
    filters,
    updateFilters,
    startStep
  };
};

export { useBrowseSteps };
