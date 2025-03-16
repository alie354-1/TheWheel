import openai from '../openai-client';
import { supabase } from '../supabase';

export interface QueryContext {
  userId: string;
  companyId?: string;
  useCompanyModel?: boolean;
  useAbstraction?: boolean;
  useExistingModels?: boolean;
  context?: string;
}

export interface GeneralLLMService {
  query: (input: string, context: QueryContext) => Promise<any>;
}

export class OpenAIGeneralLLMService implements GeneralLLMService {
  constructor() {}
  
  async query(input: string, context: QueryContext): Promise<any> {
    const startTime = Date.now();
    let completion;
    
    try {
      // Generate response using OpenAI
      completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant specialized in business idea generation and refinement.
                     ${context.useCompanyModel ? 'Use the company-specific context provided to tailor your response.' : ''}
                     ${context.useAbstraction ? 'Use patterns and insights from similar companies to inform your response.' : ''}
                     ${context.useExistingModels ? 'Use your general knowledge to provide a comprehensive response.' : ''}
                     
                     Provide a detailed and thoughtful response that is creative, specific, and actionable.`
          },
          { role: "user", content: input }
        ]
      });
      
      // Try to log the query, but don't block if it fails
      try {
        await supabase.from('llm_query_logs').insert({
          user_id: context.userId,
          company_id: context.companyId,
          query_text: input,
          response_length: completion.choices[0].message.content?.length || 0,
          duration_ms: Date.now() - startTime,
          models_used: {
            useCompanyModel: context.useCompanyModel || false,
            useAbstraction: context.useAbstraction || false,
            useExistingModels: context.useExistingModels || false,
            context: context.context || 'general'
          }
        });
      } catch (logError) {
        // Just log the error but don't let it affect the response
        console.error('Error logging LLM query:', logError);
      }
      
      return completion.choices[0].message;
    } catch (error: any) {
      console.error('Error in general LLM query:', error);
      
      // Try to log the error, but don't block if logging fails
      try {
        await supabase.from('llm_query_logs').insert({
          user_id: context.userId,
          company_id: context.companyId,
          query_text: input,
          response_length: 0,
          duration_ms: Date.now() - startTime,
          models_used: { error: error.message }
        });
      } catch (logError) {
        console.error('Error logging LLM query error:', logError);
      }
      
      throw error;
    }
  }
}

// Import mock service and store
import { mockGeneralLLMService } from './mock-general-llm.service';
import { useAuthStore } from '../store';

// Import multi-tiered AI service class
import { MultiTieredAIService } from '../../components/idea-playground/enhanced/services/multi-tiered-ai.service';

// Create an instance of the MultiTieredAIService
const multiTieredAIServiceInstance = new MultiTieredAIService();

// Create a service factory that returns the appropriate service based on feature flags
const getLLMService = (): GeneralLLMService => {
  const { featureFlags } = useAuthStore.getState();
  
  console.log('Feature flags state:', {
    useRealAI: featureFlags.useRealAI?.enabled,
    useMockAI: featureFlags.useMockAI?.enabled,
    useMultiTieredAI: featureFlags.useMultiTieredAI?.enabled
  });
  
  // Check if real AI should be used (this takes precedence)
  if (featureFlags.useRealAI?.enabled) {
    // Use multi-tiered AI if that feature flag is also enabled
    if (featureFlags.useMultiTieredAI?.enabled) {
      console.log('Using Multi-Tiered General LLM Service');
      // We need to adapt the multi-tiered AI service to the GeneralLLMService interface
      // This is a simple adapter that maps the query method to the enhanceIdea method
      return {
        query: async (input: string, context: QueryContext) => {
          const result = await multiTieredAIServiceInstance.enhanceIdea(
            {
              description: input,
              // Add other required fields with default values
              title: 'Query',
              industry: context.context || 'general',
              problemArea: '',
              targetAudience: '',
              technologyFocus: '',
              innovationLevel: 'incremental',
              resourceConstraints: []
            },
            {
              userId: context.userId,
              tier: 'standard'
            }
          );
          
          // Return in the format expected by the GeneralLLMService interface
          return {
            content: result.description || result.solutionConcept || 'No response generated',
            role: 'assistant'
          };
        }
      };
    }
    
    // Default to the real OpenAI service if multi-tiered is not enabled
    console.log('Using Real OpenAI General LLM Service');
    return new OpenAIGeneralLLMService();
  }
  
  // If real AI is not enabled, use mock AI
  console.log('Using Mock General LLM Service (Real AI is disabled)');
  return mockGeneralLLMService;
};

// Create a singleton instance of the LLM service
let llmServiceInstance: GeneralLLMService | null = null;

/**
 * Get the LLM service instance
 * This ensures we use the same instance throughout the application
 */
export const getGeneralLLMService = (): GeneralLLMService => {
  if (!llmServiceInstance) {
    llmServiceInstance = getLLMService();
  }
  return llmServiceInstance;
};

/**
 * Reset the LLM service instance
 * This is useful when feature flags change and we need to recreate the service
 */
export const resetGeneralLLMService = (): void => {
  llmServiceInstance = null;
};

// For backward compatibility, export the service as a getter function
// This ensures we always get the latest instance
export const generalLLMService = {
  query: async (input: string, context: QueryContext) => {
    return getGeneralLLMService().query(input, context);
  }
};
