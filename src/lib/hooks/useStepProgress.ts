import { useState, useEffect, useCallback } from 'react';
import { 
  JourneyStepComplete, 
  CompanyJourneyStep,
  CompanyStepTool,
  Tool
} from '../types/journey-unified.types';
import { JourneyUnifiedService } from '../services/journey-unified.service';
import { ValidationError } from '../errors/journey-errors';

/**
 * Hook for managing a single step's progress
 * Includes tool selection and evaluation
 */
export function useStepProgress(companyId: string, stepId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stepDetails, setStepDetails] = useState<JourneyStepComplete | null>(null);
  const [stepProgress, setStepProgress] = useState<CompanyJourneyStep | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolEvaluations, setToolEvaluations] = useState<CompanyStepTool[]>([]);
  const [recommendedTools, setRecommendedTools] = useState<Tool[]>([]);
  
  /**
   * Load all data for this step
   */
  const loadStepData = useCallback(async () => {
    if (!companyId || !stepId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load complete step details
      const details = await JourneyUnifiedService.getStepComplete(stepId, companyId);
      setStepDetails(details);
      
      // Set progress and selected tool from the details
      setStepProgress(details.company_progress || null);
      setSelectedTool(details.selected_tool || null);
      
      // Load tool evaluations
      const evaluations = await JourneyUnifiedService.getCompanyToolEvaluations(companyId, stepId);
      setToolEvaluations(evaluations);
      
      // Load recommended tools
      const recommendations = await JourneyUnifiedService.getPersonalizedRecommendedTools(companyId, stepId, 5);
      setRecommendedTools(recommendations);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading step data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading step data'));
      setIsLoading(false);
    }
  }, [companyId, stepId]);
  
  // Load data on initial render
  useEffect(() => {
    loadStepData();
  }, [loadStepData]);
  
  /**
   * Update step progress
   */
  const updateProgress = useCallback(async (
    updates: {
      status?: 'not_started' | 'in_progress' | 'completed' | 'skipped';
      notes?: string;
      completion_percentage?: number;
      custom_difficulty?: number;
      custom_time_estimate?: number;
    }
  ) => {
    try {
      const updatedProgress = await JourneyUnifiedService.updateStepProgress(companyId, stepId, updates);
      setStepProgress(updatedProgress);
      
      // Refresh full step details if status changed to "completed"
      if (updates.status === 'completed') {
        loadStepData();
      }
      
      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }
      throw new Error(`Error updating step progress: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [companyId, stepId, loadStepData]);
  
  /**
   * Select a tool for this step
   */
  const selectTool = useCallback(async (toolId: string) => {
    try {
      await JourneyUnifiedService.updateToolEvaluation(companyId, stepId, toolId, {
        is_selected: true
      });
      
      // Refresh data to get the updated selected tool
      loadStepData();
      
      return true;
    } catch (err) {
      throw new Error(`Error selecting tool: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [companyId, stepId, loadStepData]);
  
  /**
   * Rate a tool for this step
   */
  const rateTool = useCallback(async (toolId: string, rating: number, notes?: string) => {
    try {
      await JourneyUnifiedService.updateToolEvaluation(companyId, stepId, toolId, {
        rating,
        notes
      });
      
      // Update local state
      setToolEvaluations(prev => {
        const updated = [...prev];
        const index = updated.findIndex(e => e.tool_id === toolId);
        
        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            rating,
            notes: notes || updated[index].notes
          };
        }
        
        return updated;
      });
      
      return true;
    } catch (err) {
      throw new Error(`Error rating tool: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [companyId, stepId]);
  
  /**
   * Add a custom tool for this step
   */
  const addCustomTool = useCallback(async (
    toolData: {
      name: string;
      description?: string;
      url?: string;
      type?: string;
      category?: string;
    },
    selectAsActive: boolean = false
  ) => {
    try {
      const toolId = await JourneyUnifiedService.addCustomTool(
        companyId,
        toolData,
        stepId,
        selectAsActive
      );
      
      // Refresh data to include the new tool
      loadStepData();
      
      return toolId;
    } catch (err) {
      throw new Error(`Error adding custom tool: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [companyId, stepId, loadStepData]);
  
  /**
   * Compare tools to help with selection
   */
  const compareTools = useCallback(async (toolIds: string[]) => {
    try {
      return await JourneyUnifiedService.compareTools(toolIds);
    } catch (err) {
      console.error('Error comparing tools:', err);
      return [];
    }
  }, []);
  
  return {
    // Data
    stepDetails,
    stepProgress,
    selectedTool,
    toolEvaluations,
    recommendedTools,
    
    // Status
    isLoading,
    error,
    
    // Methods
    loadStepData,
    updateProgress,
    selectTool,
    rateTool,
    addCustomTool,
    compareTools,
    
    // Helpers
    isComplete: stepProgress?.status === 'completed',
    hasSelectedTool: Boolean(selectedTool)
  };
}
