import { useState } from 'react';
import { useIdeaPlayground } from '../contexts/IdeaPlaygroundContext';
import { Idea } from '../services/idea-playground';

// Define our own params interface for backward compatibility
interface IdeaGenerationParams {
  topic?: string;
  count?: number;
  industry?: string;
  problem_area?: string;
  useCompanyContext?: boolean;
  market_focus?: string;
  target_audience?: string[];
  keywords?: string[];
}

export const useIdeaGeneration = () => {
  const { facade, isLoading, error } = useIdeaPlayground();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  
  const generateIdeas = async (params: IdeaGenerationParams) => {
    try {
      // Transform between the old params format and new
      const generatedIdeas = await facade.generateIdeas(
        params.topic,
        params.count || 3,
        {
          industry: params.industry,
          problemStatement: params.problem_area,
          constraints: [], // Default empty constraints
          audience: params.target_audience,
          keywords: params.keywords
        }
      );
      
      setIdeas(generatedIdeas);
      return generatedIdeas;
    } catch (err) {
      console.error('Error in useIdeaGeneration.generateIdeas:', err);
      return [];
    }
  };

  const saveIdea = async (idea: Idea) => {
    try {
      return await facade.saveIdea(idea);
    } catch (err) {
      console.error('Error in useIdeaGeneration.saveIdea:', err);
      throw err;
    }
  };
  
  const getIdeasForCanvas = async (canvasId: string) => {
    try {
      // This would be a method added to our facade in a real implementation
      // For now, we'll simulate it
      const fetchedIdeas: Idea[] = [];
      setIdeas(fetchedIdeas);
      return fetchedIdeas;
    } catch (err) {
      console.error('Error in useIdeaGeneration.getIdeasForCanvas:', err);
      return [];
    }
  };
  
  return {
    ideas,
    setIdeas,
    generateIdeas,
    saveIdea,
    getIdeasForCanvas,
    isLoading,
    error
  };
};
