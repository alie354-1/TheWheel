import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIServiceInterface } from '../../../components/idea-playground/enhanced/services/ai-service.interface';
import { AIServiceFactory } from '../../../components/idea-playground/enhanced/services/ai-service.factory';
import { useAuthStore } from '../../store';
import { resetGeneralLLMService } from '../general-llm.service';

interface AIContextType {
  aiService: AIServiceInterface | null;
  isUsingRealAI: boolean;
  isUsingMultiTieredAI: boolean;
  currentTier: 'free' | 'standard' | 'premium';
  isLoading: boolean;
  lastError: string | null;
  clearError: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const { featureFlags, user } = useAuthStore();
  const [aiService, setAIService] = useState<AIServiceInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Determine if real AI is enabled
  const isUsingRealAI = featureFlags.useRealAI?.enabled || false;
  
  // Determine if multi-tiered AI is enabled
  const isUsingMultiTieredAI = featureFlags.multiTieredAI?.enabled || false;
  
  // Determine current tier based on user role or default to standard
  const currentTier = user?.role === 'admin' ? 'premium' : 'standard';
  
  // Initialize AI service based on feature flags
  useEffect(() => {
    const service = AIServiceFactory.createService({
      useMock: !isUsingRealAI,
      tier: currentTier
    });
    
    setAIService(service);
    
    // Reset when unmounted or flags change
    return () => {
      resetGeneralLLMService();
    };
  }, [isUsingRealAI, isUsingMultiTieredAI, currentTier]);
  
  // Clear error method
  const clearError = () => setLastError(null);
  
  // Context value
  const contextValue: AIContextType = {
    aiService,
    isUsingRealAI,
    isUsingMultiTieredAI,
    currentTier,
    isLoading,
    lastError,
    clearError
  };
  
  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
}

// Custom hook to use AI context
export function useAIContext() {
  const context = useContext(AIContext);
  
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  
  return context;
}
