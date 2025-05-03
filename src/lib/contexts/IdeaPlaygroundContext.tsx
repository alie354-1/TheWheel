import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { IdeaPlaygroundFacade } from '../services/idea-playground.service.facade';
import { 
  Idea,
  RefinementLevel,
  RefinementResult,
  BusinessModelCanvas,
  ValuePropositionCanvas
} from '../services/idea-playground';

// Define the context value type
interface IdeaPlaygroundContextValue {
  // Core facade instance
  facade: IdeaPlaygroundFacade;
  
  // Global state
  isLoading: boolean;
  error: Error | null;
  
  // Common state setters
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  
  // Helper methods that combine facade calls with state management
  generateIdeas: (topic?: string, count?: number, context?: any) => Promise<Idea[]>;
  refineIdea: (idea: string, level?: RefinementLevel, context?: any) => Promise<RefinementResult>;
  generateBusinessModelCanvas: (idea: string, context?: any) => Promise<BusinessModelCanvas>;
  generateValuePropositionCanvas: (idea: string, context?: any) => Promise<ValuePropositionCanvas>;
  saveIdea: (idea: Idea) => Promise<Idea & { id: string }>;
}

// Create the context with a null default value
const IdeaPlaygroundContext = createContext<IdeaPlaygroundContextValue | null>(null);

// Provider component
export const IdeaPlaygroundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize the facade (only once)
  const facade = React.useMemo(() => new IdeaPlaygroundFacade(), []);
  
  // Global state
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Helper method: Generate ideas with error handling
  const generateIdeas = useCallback(async (topic?: string, count: number = 3, context?: any) => {
    setLoading(true);
    setError(null);
    try {
      const ideas = await facade.generateIdeas(topic, count, context);
      return ideas;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate ideas');
      setError(error);
      console.error('Error generating ideas:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [facade]);
  
  // Helper method: Refine idea with error handling
  const refineIdea = useCallback(async (idea: string, level?: RefinementLevel, context?: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await facade.refineIdea(idea, level, context);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refine idea');
      setError(error);
      console.error('Error refining idea:', err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [facade]);
  
  // Helper method: Generate business model canvas with error handling
  const generateBusinessModelCanvas = useCallback(async (idea: string, context?: any) => {
    setLoading(true);
    setError(null);
    try {
      const canvas = await facade.generateBusinessModelCanvas(idea, context);
      return canvas;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate business model canvas');
      setError(error);
      console.error('Error generating business model canvas:', err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [facade]);
  
  // Helper method: Generate value proposition canvas with error handling
  const generateValuePropositionCanvas = useCallback(async (idea: string, context?: any) => {
    setLoading(true);
    setError(null);
    try {
      const canvas = await facade.generateValuePropositionCanvas(idea, context);
      return canvas;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate value proposition canvas');
      setError(error);
      console.error('Error generating value proposition canvas:', err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [facade]);
  
  // Helper method: Save idea with error handling
  const saveIdea = useCallback(async (idea: Idea) => {
    setLoading(true);
    setError(null);
    try {
      const savedIdea = await facade.saveIdea(idea);
      return savedIdea;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save idea');
      setError(error);
      console.error('Error saving idea:', err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [facade]);
  
  // Combine facade and helper methods into context value
  const contextValue: IdeaPlaygroundContextValue = {
    facade,
    isLoading,
    error,
    setLoading,
    setError,
    generateIdeas,
    refineIdea,
    generateBusinessModelCanvas,
    generateValuePropositionCanvas,
    saveIdea
  };
  
  return (
    <IdeaPlaygroundContext.Provider value={contextValue}>
      {children}
    </IdeaPlaygroundContext.Provider>
  );
};

// Custom hook for consuming the context
export const useIdeaPlayground = () => {
  const context = useContext(IdeaPlaygroundContext);
  if (!context) {
    throw new Error('useIdeaPlayground must be used within an IdeaPlaygroundProvider');
  }
  return context;
};
