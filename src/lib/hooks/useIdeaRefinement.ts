import { useState } from 'react';
import { useIdeaPlayground } from '../contexts/IdeaPlaygroundContext';
import { RefinementLevel, RefinementResult } from '../services/idea-playground';

// Define our own params interface for backward compatibility
interface IdeaRefinementParams {
  idea_id: string;
  focus_areas?: string[];
  additional_notes?: string;
}

export const useIdeaRefinement = () => {
  const { facade, isLoading, error } = useIdeaPlayground();
  const [refinementResults, setRefinementResults] = useState<RefinementResult[]>([]);
  
  const refineIdea = async (idea: string, level: RefinementLevel = RefinementLevel.MEDIUM) => {
    try {
      const result = await facade.refineIdea(idea, level);
      setRefinementResults(prev => [...prev, result]);
      return result;
    } catch (err) {
      console.error('Error in useIdeaRefinement.refineIdea:', err);
      throw err;
    }
  };
  
  const refineIdeaWithParams = async (params: IdeaRefinementParams) => {
    try {
      // In a full implementation, we would get the idea from the database
      // For now, we'll use a placeholder approach
      const ideaText = `Idea with ID: ${params.idea_id}`;
      const level = RefinementLevel.MEDIUM;
      
      const context = {
        focusAreas: params.focus_areas,
        additionalNotes: params.additional_notes
      };
      
      const result = await facade.refineIdea(ideaText, level, context);
      setRefinementResults(prev => [...prev, result]);
      return result;
    } catch (err) {
      console.error('Error in useIdeaRefinement.refineIdeaWithParams:', err);
      throw err;
    }
  };
  
  const compareRefinements = (results: RefinementResult[]) => {
    return facade.compareRefinements(results);
  };
  
  const generateVariations = async (idea: string, count: number = 3) => {
    try {
      return await facade.generateVariations(idea, count);
    } catch (err) {
      console.error('Error in useIdeaRefinement.generateVariations:', err);
      return [];
    }
  };
  
  return {
    refinementResults,
    refineIdea,
    refineIdeaWithParams,
    compareRefinements,
    generateVariations,
    isLoading,
    error
  };
};
