import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/utils/supabaseClient';
import { newCompanyJourneyService } from '../../../../lib/services/new_journey/new_company_journey.service';
import { newJourneyFrameworkService } from '../../../../lib/services/new_journey/new_journey_framework.service';
import { journeyStatusService, StepStatusType } from '../../../../lib/services/new_journey/journey-status.service';
import { 
  NewCompanyJourneyStep, 
  NewStepStatus,
  NewJourneyPhase,
  NewJourneyDomain
} from '../../../../lib/types/new_journey.types';

// Type for step with additional UI metadata
export interface CompanyStepWithMeta {
  step: NewCompanyJourneyStep;
  isUrgent: boolean;
  completion?: number; // 0-1 value
  dueDate?: string;
}

export interface UseCompanyStepsReturn {
  loading: boolean;
  companySteps: CompanyStepWithMeta[];
  filteredSteps: CompanyStepWithMeta[];
  urgentSteps: CompanyStepWithMeta[];
  inProgressSteps: CompanyStepWithMeta[];
  completedSteps: CompanyStepWithMeta[];
  mostRecentSteps: CompanyStepWithMeta[];
  search: string;
  setSearch: (search: string) => void;
  filterUrgent: boolean;
  setFilterUrgent: (filter: boolean) => void;
  filterActive: boolean;
  setFilterActive: (filter: boolean) => void;
  filterBlocked: boolean;
  setFilterBlocked: (filter: boolean) => void;
  phases: NewJourneyPhase[];
  domains: NewJourneyDomain[];
  handleViewStep: (stepId: string) => void;
  handleOpenStep: (stepId: string) => void;
  handleAddStep: () => void;
  handleDeleteStep: (stepId: string) => Promise<void>;
  fetchCompanySteps: () => Promise<void>;
}

/**
 * Hook for managing company journey steps
 * Provides filtering, search, and actions for steps
 */
export const useCompanySteps = (journeyId: string): UseCompanyStepsReturn => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companySteps, setCompanySteps] = useState<CompanyStepWithMeta[]>([]);
  const [search, setSearch] = useState('');
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [filterBlocked, setFilterBlocked] = useState(false);
  const [phases, setPhases] = useState<NewJourneyPhase[]>([]);
  const [domains, setDomains] = useState<NewJourneyDomain[]>([]);

  // Fetch company steps
  useEffect(() => {
    // Only fetch if we have a valid journeyId
    if (!journeyId) {
      console.log('DEBUG: useBrowseSteps - No journeyId provided, skipping fetch');
      setLoading(false);
      return;
    }
    
    // Initial fetch
    fetchCompanySteps();
    
    // Set up polling interval (every 15 seconds)
    const pollingInterval = setInterval(() => {
      fetchCompanySteps();
    }, 15000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [journeyId]);
  
  // Function to fetch company steps - extracted so it can be called after delete
  const fetchCompanySteps = async () => {
      try {
        // Skip if journeyId is empty
        if (!journeyId) {
          console.error('Error fetching company steps: Empty journey ID');
          setLoading(false);
          return;
        }
        
        // Only show loading state if we don't have any data yet
        if (companySteps.length === 0) {
          setLoading(true);
        }
        
        const [steps, phases, domains] = await Promise.all([
          newCompanyJourneyService.getCompanySteps(journeyId),
          newJourneyFrameworkService.getPhases(),
          newJourneyFrameworkService.getDomains(),
        ]);

        // Get all step IDs to fetch tasks in bulk
        const stepIds = steps.map(step => step.id);
        
        // Fetch tasks for all steps in one query
        const { data: tasksData, error: tasksError } = await supabase
          .from("standup_tasks")
          .select("id, title, status, step_id")
          .in("step_id", stepIds);
          
        if (tasksError) {
          console.error("Error fetching tasks:", tasksError);
        }
        
        // Group tasks by step_id
        const tasksByStepId: Record<string, { id: string; title: string; status: string }[]> = {};
        if (tasksData) {
          tasksData.forEach(task => {
            if (!tasksByStepId[task.step_id]) {
              tasksByStepId[task.step_id] = [];
            }
            tasksByStepId[task.step_id].push(task);
          });
        }
        
        const stepsWithMeta: CompanyStepWithMeta[] = steps.map(step => {
          // Get tasks for this step
          const stepTasks = tasksByStepId[step.id] || [];
          
          // Calculate completion based on tasks
          const totalTasks = stepTasks.length;
          const completedTasks = stepTasks.filter(task => task.status === 'completed').length;
          const completion = totalTasks > 0 ? completedTasks / totalTasks : 0;
          
          return {
            step,
            isUrgent: step.due_date ? new Date(step.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : false,
            completion: completion,
            dueDate: step.due_date
          };
        });
        setCompanySteps(stepsWithMeta);
        setPhases(phases);
        setDomains(domains);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching company steps:', error);
        setLoading(false);
      }
    };

  // Apply filters and search
  const filteredSteps = companySteps.filter(s => {
    if (search && !s.step.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterUrgent && !s.isUrgent) {
      return false;
    }
    if (filterActive && s.step.status !== 'active') {
      return false;
    }
    if (filterBlocked && s.step.status !== 'not_started') {
      return false;
    }
    return true;
  });

  // Categorized steps based on status configuration
  const [sidePanelStatuses, setSidePanelStatuses] = useState<StepStatusType[]>([]);
  const [mostRecentStatuses, setMostRecentStatuses] = useState<StepStatusType[]>([]);
  
  // Fetch status configurations
  useEffect(() => {
    const fetchStatusConfigs = async () => {
      const sidePanel = await journeyStatusService.getSidePanelStatuses();
      const mostRecent = await journeyStatusService.getMostRecentStatuses();
      
      setSidePanelStatuses(sidePanel);
      setMostRecentStatuses(mostRecent);
    };
    
    fetchStatusConfigs();
  }, []);
  
  // Categorized steps
  const urgentSteps = filteredSteps.filter(s => s.isUrgent);
  const inProgressSteps = filteredSteps.filter(s => 
    sidePanelStatuses.includes(s.step.status as StepStatusType) && !s.isUrgent
  );
  const completedSteps = filteredSteps.filter(s => s.step.status === 'complete');
  
  // Get the most recent steps for "Pick up where you left off" section
  const mostRecentSteps = filteredSteps
    .filter(s => mostRecentStatuses.includes(s.step.status as StepStatusType))
    .sort((a, b) => {
      const dateA = new Date(a.step.updated_at || a.step.created_at);
      const dateB = new Date(b.step.updated_at || b.step.created_at);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 2); // Get only the 2 most recent steps

  // Handle step actions
  const handleViewStep = (stepId: string) => {
    // For now, just log the action
    console.log('View step details for step', stepId);
    // In a real implementation, this would open a modal with step details
  };

  const handleOpenStep = (stepId: string) => {
    navigate(`/company/new-journey/step/${stepId}`);
  };

  const handleAddStep = () => {
    navigate('/company/new-journey/browse');
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      // First update local state for immediate feedback
      setCompanySteps(steps => steps.filter(s => s.step.id !== stepId));
      
      // Call the API to delete the step
      await newCompanyJourneyService.deleteCompanyStep(stepId);
      
      console.log('Successfully deleted step', stepId);
    } catch (error) {
      console.error('Failed to delete step:', error);
      
      // Refresh steps to ensure UI is in sync with backend
      fetchCompanySteps();
    }
  };

  return {
    loading,
    companySteps,
    filteredSteps,
    urgentSteps,
    inProgressSteps,
    completedSteps,
    mostRecentSteps,
    search,
    setSearch,
    filterUrgent,
    setFilterUrgent,
    filterActive,
    setFilterActive,
    filterBlocked,
    setFilterBlocked,
    phases,
    domains,
    handleViewStep,
    handleOpenStep,
    handleAddStep,
    handleDeleteStep,
    fetchCompanySteps
  };
};
