import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Props for the BaseAIContextProvider component
 */
export interface BaseAIContextProviderProps {
  /** Children to render inside the provider */
  children: ReactNode;
  /** Service to use for AI operations */
  service: AIService;
  /** Context name for debugging */
  contextName?: string;
}

/**
 * Interface for AI service
 */
export interface AIService {
  /** Generate a response based on the prompt */
  generateResponse: (prompt: string) => Promise<string>;
  /** Generate suggestions based on the prompt */
  generateSuggestions?: (prompt: string) => Promise<string[]>;
  /** Analyze text and provide feedback */
  analyzeText?: (text: string) => Promise<string>;
}

/**
 * Context for AI operations
 */
export interface BaseAIContext {
  /** Generate a response based on the prompt */
  generateResponse: (prompt: string) => Promise<string>;
  /** Generate suggestions based on the prompt */
  generateSuggestions: (prompt: string) => Promise<string[]>;
  /** Analyze text and provide feedback */
  analyzeText: (text: string) => Promise<string>;
  /** Whether the AI is currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Clear the error message */
  clearError: () => void;
}

/**
 * Create a context for AI operations
 */
export function createAIContext() {
  return createContext<BaseAIContext | null>(null);
}

/**
 * Base component for AI context providers
 * This component provides the common functionality for AI context providers
 */
export function BaseAIContextProvider({
  children,
  service,
  contextName = 'BaseAIContext'
}: BaseAIContextProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateResponse = useCallback(
    async (prompt: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await service.generateResponse(prompt);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error generating response: ${errorMessage}`);
        return '';
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  const generateSuggestions = useCallback(
    async (prompt: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (service.generateSuggestions) {
          const suggestions = await service.generateSuggestions(prompt);
          return suggestions;
        }
        // Fallback to generating a single response and splitting it
        const response = await service.generateResponse(prompt);
        return response.split('\n').filter(Boolean);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error generating suggestions: ${errorMessage}`);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  const analyzeText = useCallback(
    async (text: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (service.analyzeText) {
          const analysis = await service.analyzeText(text);
          return analysis;
        }
        // Fallback to generating a response with a prompt
        const response = await service.generateResponse(`Analyze the following text:\n${text}`);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error analyzing text: ${errorMessage}`);
        return '';
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  // Create the context value
  const contextValue: BaseAIContext = {
    generateResponse,
    generateSuggestions,
    analyzeText,
    isLoading,
    error,
    clearError
  };

  // Create a dynamic context
  const Context = createAIContext();

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

/**
 * Create a hook to use the AI context
 */
export function createUseAIContext(Context: React.Context<BaseAIContext | null>) {
  return function useAIContext() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useAIContext must be used within an AIContextProvider');
    }
    return context;
  };
}
