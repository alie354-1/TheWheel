import React, { createContext, useContext, useState, useCallback } from 'react';
import { generalLLMService } from '../general-llm.service';
import { useAuthStore } from '../../store';

interface AIResponse {
  content: string;
  type?: 'suggestion' | 'analysis' | 'validation' | 'enhancement';
}

interface AIContextType {
  generateContextualHelp: (stage: string, ideaId?: string) => Promise<string>;
  getSmartSuggestions: (fieldType: string, currentValue: string) => Promise<string[]>;
  enhanceIdea: (ideaData: any) => Promise<any>;
  validateIdea: (ideaData: any, validationType: string) => Promise<any>;
  isLoading: boolean;
}

// Create context with default values
const AIContext = createContext<AIContextType>({
  generateContextualHelp: async () => '',
  getSmartSuggestions: async () => [],
  enhanceIdea: async (data) => data,
  validateIdea: async () => ({ valid: true, feedback: [] }),
  isLoading: false,
});

/**
 * AI Context Provider component
 * Provides AI capabilities to all child components
 */
export const AIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, featureFlags } = useAuthStore();
  const useMockAI = featureFlags?.useMockAI?.enabled || false;
  const useMultiTieredAI = featureFlags?.useMultiTieredAI?.enabled || false;

  /**
   * Generate contextual help based on the current stage
   */
  const generateContextualHelp = useCallback(async (stage: string, ideaId?: string): Promise<string> => {
    setIsLoading(true);
    try {
      let prompt = '';
      switch (stage) {
        case 'idea_generation':
          prompt = `You are assisting a user in generating business ideas. Provide helpful guidance on brainstorming and evaluating ideas.`;
          break;
        case 'problem_solution':
          prompt = `You are assisting a user in defining problems and solutions. Provide helpful guidance on problem analysis and solution development.`;
          break;
        case 'target_value':
          prompt = `You are assisting a user in identifying target audiences and value propositions. Provide helpful guidance on market segmentation and value creation.`;
          break;
        case 'business_model':
          prompt = `You are assisting a user in developing a business model. Provide helpful guidance on revenue streams, cost structures, and key resources.`;
          break;
        case 'go_to_market':
          prompt = `You are assisting a user in planning a go-to-market strategy. Provide helpful guidance on customer acquisition, marketing channels, and launch planning.`;
          break;
        default:
          prompt = `You are assisting a user in developing a business idea. Provide helpful guidance on business planning and development.`;
      }

      // Add some detailed instructions for better results
      prompt += `\n\nProvide 3-5 actionable tips that are specific, practical, and insightful. Format your response with bullet points and brief explanations.`;

      const response = await generalLLMService.query(prompt, {
        userId: user?.id || 'anonymous',
        useCompanyModel: false,
        useAbstraction: false,
        useExistingModels: true,
        context: stage
      });

      return response.content;
    } catch (error) {
      console.error('Error generating contextual help:', error);
      return 'Unable to generate assistance at this time. Please try again later.';
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, useMockAI]);

  /**
   * Get field-specific AI suggestions
   */
  const getSmartSuggestions = useCallback(async (fieldType: string, currentValue: string): Promise<string[]> => {
    setIsLoading(true);
    try {
      let prompt = '';
      
      if (!currentValue || currentValue.trim().length < 5) {
        // Generic suggestions for empty/short input
        prompt = `Generate 3 example high-quality ${fieldType} entries for a business plan. Make them diverse and compelling.`;
      } else {
        // Enhance existing content
        prompt = `Enhance the following ${fieldType} to make it more compelling and effective: "${currentValue}". 
                  Provide 3 improved versions that are diverse in approach but maintain the core concept.`;
      }

      const response = await generalLLMService.query(prompt, {
        userId: user?.id || 'anonymous',
        useCompanyModel: false,
        useAbstraction: false,
        useExistingModels: true,
        context: fieldType
      });

      // Extract suggestions from response
      const suggestions: string[] = [];
      const text = response.content;
      
      // Try to find numbered or bulleted suggestions
      const numberedMatches = text.match(/\d+[\)\.]\s*([^\n\d]+)/g);
      if (numberedMatches && numberedMatches.length > 0) {
        numberedMatches.forEach((match: string) => {
          const suggestion = match.replace(/^\d+[\)\.]\s*/, '').trim();
          if (suggestion) suggestions.push(suggestion);
        });
      } else {
        // If no numbered format, try bullet points
        const bulletMatches = text.match(/[•\-\*]\s*([^\n•\-\*]+)/g);
        if (bulletMatches && bulletMatches.length > 0) {
          bulletMatches.forEach((match: string) => {
            const suggestion = match.replace(/^[•\-\*]\s*/, '').trim();
            if (suggestion) suggestions.push(suggestion);
          });
        } else {
          // If no structured format, split by newlines
          const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
          if (lines.length > 0) {
            suggestions.push(...lines.slice(0, 3));
          } else {
            // Last resort - just return the whole text
            suggestions.push(text);
          }
        }
      }

      return suggestions.length > 0 ? suggestions : [`No specific suggestions found. Try adding more details to your ${fieldType}.`];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return ['Failed to generate suggestions. Please try again.'];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, useMockAI]);

  /**
   * Enhance an entire idea with AI
   */
  const enhanceIdea = useCallback(async (ideaData: any): Promise<any> => {
    setIsLoading(true);
    try {
      const prompt = `Enhance this business idea to make it more compelling, feasible, and market-ready:\n\n
                      Title: ${ideaData.title || 'Untitled'}\n
                      Description: ${ideaData.description || 'No description provided'}\n
                      Problem: ${ideaData.problem || 'No problem defined'}\n
                      Solution: ${ideaData.solution || 'No solution defined'}\n
                      Target Audience: ${ideaData.audience || 'No target audience defined'}\n
                      Value Proposition: ${ideaData.value || 'No value proposition defined'}\n\n
                      Provide improvements for each section while maintaining the core concept.`;

      const response = await generalLLMService.query(prompt, {
        userId: user?.id || 'anonymous',
        useCompanyModel: false,
        useAbstraction: false,
        useExistingModels: true,
        context: 'idea_enhancement'
      });

      // Try to extract structured data from the response
      // This is a simple implementation and might need more robust parsing
      const enhancedData = { ...ideaData };
      const text = response.content;

      // Look for section markers
      const titleMatch = text.match(/Title:([^\n]+)/i);
      const descriptionMatch = text.match(/Description:([^]*?)(?=Problem:|$)/i);
      const problemMatch = text.match(/Problem:([^]*?)(?=Solution:|$)/i);
      const solutionMatch = text.match(/Solution:([^]*?)(?=Target Audience:|$)/i);
      const audienceMatch = text.match(/Target Audience:([^]*?)(?=Value Proposition:|$)/i);
      const valueMatch = text.match(/Value Proposition:([^]*?)(?=$)/i);

      if (titleMatch) enhancedData.title = titleMatch[1].trim();
      if (descriptionMatch) enhancedData.description = descriptionMatch[1].trim();
      if (problemMatch) enhancedData.problem = problemMatch[1].trim();
      if (solutionMatch) enhancedData.solution = solutionMatch[1].trim();
      if (audienceMatch) enhancedData.audience = audienceMatch[1].trim();
      if (valueMatch) enhancedData.value = valueMatch[1].trim();

      return enhancedData;
    } catch (error) {
      console.error('Error enhancing idea:', error);
      return ideaData; // Return original data on error
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, useMockAI]);

  /**
   * Validate an idea or components of it
   */
  const validateIdea = useCallback(async (ideaData: any, validationType: string): Promise<any> => {
    setIsLoading(true);
    try {
      let prompt = '';
      switch (validationType) {
        case 'market':
          prompt = `Evaluate this business idea for market viability:\n\n
                    Title: ${ideaData.title || 'Untitled'}\n
                    Description: ${ideaData.description || 'No description provided'}\n
                    Target Audience: ${ideaData.audience || 'No target audience defined'}\n\n
                    Provide an analysis of market potential, competition, and target audience fit. Include strengths and weaknesses.`;
          break;
        case 'feasibility':
          prompt = `Evaluate this business idea for implementation feasibility:\n\n
                    Title: ${ideaData.title || 'Untitled'}\n
                    Description: ${ideaData.description || 'No description provided'}\n
                    Solution: ${ideaData.solution || 'No solution defined'}\n\n
                    Provide an analysis of technical feasibility, resource requirements, and implementation challenges. Include strengths and weaknesses.`;
          break;
        case 'business_model':
          prompt = `Evaluate this business model for sustainability and profitability:\n\n
                    Title: ${ideaData.title || 'Untitled'}\n
                    Description: ${ideaData.description || 'No description provided'}\n
                    Value Proposition: ${ideaData.value || 'No value proposition defined'}\n
                    Business Model: ${ideaData.model || 'No business model defined'}\n\n
                    Provide an analysis of revenue potential, cost structure, and overall business model viability. Include strengths and weaknesses.`;
          break;
        default:
          prompt = `Evaluate this business idea:\n\n
                    Title: ${ideaData.title || 'Untitled'}\n
                    Description: ${ideaData.description || 'No description provided'}\n\n
                    Provide a general analysis of the idea's potential, strengths, and weaknesses.`;
      }

      const response = await generalLLMService.query(prompt, {
        userId: user?.id || 'anonymous',
        useCompanyModel: false,
        useAbstraction: false,
        useExistingModels: true,
        context: `validation_${validationType}`
      });

      // Extract strengths and weaknesses
      const text = response.content;
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      
      // Look for strengths section
      const strengthsSection = text.match(/strengths?:([^]*?)(?=weaknesses?:|$)/i);
      if (strengthsSection) {
        const strengthsText = strengthsSection[1];
        // Extract bullet points
        const strengthBullets = strengthsText.match(/[•\-\*]\s*([^\n•\-\*]+)/g);
        if (strengthBullets) {
          strengthBullets.forEach((bullet: string) => {
            const strength = bullet.replace(/^[•\-\*]\s*/, '').trim();
            if (strength) strengths.push(strength);
          });
        }
      }
      
      // Look for weaknesses section
      const weaknessesSection = text.match(/weaknesses?:([^]*?)(?=$)/i);
      if (weaknessesSection) {
        const weaknessesText = weaknessesSection[1];
        // Extract bullet points
        const weaknessBullets = weaknessesText.match(/[•\-\*]\s*([^\n•\-\*]+)/g);
        if (weaknessBullets) {
          weaknessBullets.forEach((bullet: string) => {
            const weakness = bullet.replace(/^[•\-\*]\s*/, '').trim();
            if (weakness) weaknesses.push(weakness);
          });
        }
      }

      return {
        valid: strengths.length > weaknesses.length, // Simple heuristic
        feedback: text,
        strengths,
        weaknesses
      };
    } catch (error) {
      console.error('Error validating idea:', error);
      return { 
        valid: true, 
        feedback: 'Unable to validate at this time. Please try again later.',
        strengths: [],
        weaknesses: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, useMockAI]);

  const contextValue: AIContextType = {
    generateContextualHelp,
    getSmartSuggestions,
    enhanceIdea,
    validateIdea,
    isLoading
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};

/**
 * Custom hook to use the AI context
 */
export const useAIContext = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
};


// Export AIContextProvider as AIProvider for backward compatibility
export { AIContextProvider as AIProvider };
