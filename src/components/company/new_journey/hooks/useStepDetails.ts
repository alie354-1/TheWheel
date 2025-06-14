import { useState, useEffect } from 'react';

export interface StepDetails {
  id: string;
  name: string;
  description: string;
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
  deliverables: string[];
  dependencies: string[];
  potentialBlockers: string[];
  recommendedTools: string[];
}

export interface StepTask {
  id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
}

/**
 * Hook to fetch and manage the details of a specific journey step.
 */
const useStepDetails = (stepId?: string, userId?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepDetails, setStepDetails] = useState<StepDetails | null>(null);
  const [tasks, setTasks] = useState<StepTask[]>([]);

  // Extract fetchStepDetails function to make it reusable
  const fetchStepDetails = async (showLoading = true) => {
    if (!stepId || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Only show loading state on initial fetch or when explicitly requested
      if (showLoading && (stepDetails === null || tasks.length === 0)) {
        setIsLoading(true);
      }
      
      // In a real implementation, these would be API calls
      // For now, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock step details
      const mockStep: StepDetails = {
        id: stepId,
        name: stepId === 'step-1' 
          ? 'Define Vision & Mission' 
          : (stepId === 'step-2' 
            ? 'Conduct Market Research' 
            : 'Define Pricing Strategy'),
        description: stepId === 'step-1' 
          ? 'A clear vision and mission aligns your team and stakeholders around a core purpose. This foundational step guides all future decisions and helps maintain focus during challenges.'
          : (stepId === 'step-2'
            ? 'Understanding your market is critical to validate your business idea. Thorough research helps identify customer needs, competitive landscape, and potential opportunities.'
            : 'Your pricing strategy directly impacts revenue, positioning, and market perception. A well-defined approach balances profitability with market competitiveness.'),
        domain: stepId === 'step-1' 
          ? { id: 'domain-1', name: 'Strategy' }
          : (stepId === 'step-2'
            ? { id: 'domain-2', name: 'Product' }
            : { id: 'domain-4', name: 'Sales' }),
        phase: stepId === 'step-1'
          ? { id: 'phase-1', name: 'Ideation' }
          : { id: 'phase-2', name: 'Validation' },
        difficulty: stepId === 'step-1' ? 'Low' : 'Medium',
        estimatedDays: stepId === 'step-1' ? 2 : (stepId === 'step-2' ? 5 : 3),
        deliverables: stepId === 'step-1'
          ? ['Vision statement draft', 'Mission framework', 'Stakeholder approval ≥80%']
          : (stepId === 'step-2'
            ? ['Market research report', 'Competitor analysis', 'Customer persona documents', 'Market size estimation']
            : ['Pricing model document', 'Competitive pricing analysis', 'Profitability projections']),
        dependencies: stepId === 'step-1'
          ? []
          : (stepId === 'step-2' 
            ? ['Define Vision & Mission']
            : ['Conduct Market Research']),
        potentialBlockers: stepId === 'step-1'
          ? ['Stakeholder availability', 'Lack of consensus']
          : (stepId === 'step-2'
            ? ['Limited data access', 'Budget constraints for research tools']
            : ['Incomplete market research', 'Unclear value proposition']),
        recommendedTools: stepId === 'step-1'
          ? ['Miro', 'Figma', 'Google Docs']
          : (stepId === 'step-2'
            ? ['SurveyMonkey', 'Google Trends', 'SEMrush', 'UserTesting']
            : ['Price Intelligently', 'ProfitWell', 'Competitors Price Tracker'])
      };
      
      // Mock tasks
      const mockTasks: StepTask[] = stepId === 'step-1'
        ? [
            { id: 'task-1-1', name: 'Draft vision statement', description: 'Create a concise description of what the company aspires to become in the future.', isCompleted: false },
            { id: 'task-1-2', name: 'Draft mission statement', description: 'Define the company\'s core purpose and focus.', isCompleted: false },
            { id: 'task-1-3', name: 'Gather stakeholder input', description: 'Collect feedback from key stakeholders on vision and mission drafts.', isCompleted: false },
            { id: 'task-1-4', name: 'Refine based on feedback', description: 'Incorporate stakeholder feedback to improve vision and mission.', isCompleted: false },
            { id: 'task-1-5', name: 'Finalize and document', description: 'Formalize the approved vision and mission statements.', isCompleted: false }
          ]
        : (stepId === 'step-2'
          ? [
              { id: 'task-2-1', name: 'Define research objectives', description: 'Clearly outline what you aim to learn from market research.', isCompleted: false },
              { id: 'task-2-2', name: 'Identify target audience', description: 'Define the specific customer segments to focus on.', isCompleted: false },
              { id: 'task-2-3', name: 'Conduct competitor analysis', description: 'Research direct and indirect competitors in your market.', isCompleted: false },
              { id: 'task-2-4', name: 'Perform customer interviews', description: 'Gather qualitative insights from potential customers.', isCompleted: false },
              { id: 'task-2-5', name: 'Analyze industry trends', description: 'Research market growth, disruptions, and opportunities.', isCompleted: false },
              { id: 'task-2-6', name: 'Compile research report', description: 'Consolidate findings into actionable insights.', isCompleted: false }
            ]
          : [
              { id: 'task-9-1', name: 'Research competitor pricing', description: 'Analyze pricing structures of direct competitors.', isCompleted: false },
              { id: 'task-9-2', name: 'Calculate cost structure', description: 'Determine your product costs and overhead.', isCompleted: false },
              { id: 'task-9-3', name: 'Analyze customer willingness to pay', description: 'Survey target customers on price sensitivity.', isCompleted: false },
              { id: 'task-9-4', name: 'Create pricing model options', description: 'Develop 2-3 potential pricing approaches.', isCompleted: false },
              { id: 'task-9-5', name: 'Test pricing with focus group', description: 'Gather feedback on different pricing options.', isCompleted: false },
              { id: 'task-9-6', name: 'Finalize pricing strategy', description: 'Document final pricing approach and implementation plan.', isCompleted: false }
            ]);
      
      setStepDetails(mockStep);
      setTasks(mockTasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching step details:', err);
      setError('Failed to load step details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling for step details
  useEffect(() => {
    // Initial fetch with loading indicator
    fetchStepDetails(true);
    
    // Set up polling interval (every 20 seconds)
    const pollingInterval = setInterval(() => {
      fetchStepDetails(false); // Don't show loading indicator on polling updates
    }, 20000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [stepId, userId]);

  const completedTaskCount = tasks.filter(task => task.isCompleted).length;

  const markTaskComplete = async (taskId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just update the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, isCompleted: !task.isCompleted } 
            : task
        )
      );
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`Marked task ${taskId} as complete`);
      return true;
    } catch (err) {
      console.error('Error marking task as complete:', err);
      setError('Failed to update task. Please try again later.');
      return false;
    }
  };

  const markStepComplete = async (): Promise<boolean> => {
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just simulate success
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Marked step ${stepId} as complete`);
      return true;
    } catch (err) {
      console.error('Error marking step as complete:', err);
      setError('Failed to complete step. Please try again later.');
      return false;
    }
  };

  const skipStep = async (): Promise<boolean> => {
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just simulate success
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Skipped step ${stepId}`);
      return true;
    } catch (err) {
      console.error('Error skipping step:', err);
      setError('Failed to skip step. Please try again later.');
      return false;
    }
  };

  return {
    isLoading,
    error,
    stepDetails,
    tasks,
    completedTaskCount,
    markTaskComplete,
    markStepComplete,
    skipStep,
    refreshStepDetails: () => fetchStepDetails(true) // Expose refresh function with loading indicator
  };
};

export { useStepDetails };
