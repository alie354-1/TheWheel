import { useState, useEffect, useCallback } from 'react';
import { JourneyUnifiedService } from '../services/journey-unified.service';
import { Tool, CompanyStepTool } from '../types/journey-unified.types';

interface UseJourneyToolsProps {
  stepId: string;
  companyId?: string;
}

/**
 * React hook for managing tools associated with journey steps,
 * including recommendations and company evaluations
 */
export const useJourneyTools = ({ stepId, companyId }: UseJourneyToolsProps) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [companyEvaluations, setCompanyEvaluations] = useState<CompanyStepTool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluationLoading, setEvaluationLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Loads tools for a specific step
   */
  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const toolsData = await JourneyUnifiedService.getToolsForStep(stepId);
      setTools(toolsData);
      
      // If company ID is provided, load company evaluations
      if (companyId) {
        const evaluations = await JourneyUnifiedService.getCompanyToolEvaluations(companyId, stepId);
        setCompanyEvaluations(evaluations);
      }
    } catch (err) {
      console.error('Error loading tools:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading tools'));
    } finally {
      setLoading(false);
    }
  }, [stepId, companyId]);
  
  /**
   * Updates a tool evaluation for the company
   */
  const updateToolEvaluation = useCallback(async (
    toolId: string,
    evaluation: {
      rating?: number;
      notes?: string;
      is_selected?: boolean;
    }
  ) => {
    if (!companyId) {
      throw new Error('Company ID is required to update tool evaluations');
    }
    
    try {
      setEvaluationLoading(true);
      await JourneyUnifiedService.updateToolEvaluation(
        companyId,
        stepId,
        toolId,
        evaluation
      );
      
      // Refresh evaluations
      const evaluations = await JourneyUnifiedService.getCompanyToolEvaluations(companyId, stepId);
      setCompanyEvaluations(evaluations);
      
      return true;
    } catch (err) {
      console.error('Error updating tool evaluation:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating evaluation'));
      return false;
    } finally {
      setEvaluationLoading(false);
    }
  }, [companyId, stepId]);
  
  /**
   * Gets tool recommendations based on the current step and company context
   */
  const getRecommendations = useCallback(async () => {
    try {
      if (!companyId) {
        return await JourneyUnifiedService.getRecommendedTools(stepId);
      }
      
      return await JourneyUnifiedService.getPersonalizedRecommendedTools(
        companyId,
        stepId
      );
    } catch (err) {
      console.error('Error getting tool recommendations:', err);
      setError(err instanceof Error ? err : new Error('Unknown error getting recommendations'));
      return [];
    }
  }, [companyId, stepId]);
  
  /**
   * Compare multiple tools to help with selection decisions
   */
  const compareTools = useCallback(async (toolIds: string[]) => {
    try {
      return await JourneyUnifiedService.compareTool(toolIds);
    } catch (err) {
      console.error('Error comparing tools:', err);
      setError(err instanceof Error ? err : new Error('Unknown error comparing tools'));
      return [];
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    loadTools();
  }, [loadTools]);
  
  /**
   * Get merged data with tools and company evaluations
   */
  const getToolsWithEvaluations = useCallback(() => {
    if (!companyId || companyEvaluations.length === 0) return tools;
    
    return tools.map(tool => {
      const evaluation = companyEvaluations.find(e => e.tool_id === tool.id);
      
      if (!evaluation) return { ...tool, evaluation: null };
      
      return {
        ...tool,
        evaluation: {
          rating: evaluation.rating,
          notes: evaluation.notes,
          is_selected: evaluation.is_selected,
          created_at: evaluation.created_at,
          updated_at: evaluation.updated_at,
        }
      };
    });
  }, [tools, companyEvaluations, companyId]);
  
  return {
    tools,
    companyEvaluations,
    loading,
    evaluationLoading,
    error,
    refreshTools: loadTools,
    updateToolEvaluation,
    getRecommendations,
    compareTools,
    toolsWithEvaluations: getToolsWithEvaluations(),
  };
};

export default useJourneyTools;
