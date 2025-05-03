import huggingFaceClient, { ModelType } from '../huggingface-client';
import { supabase } from '../supabase';
import { loggingService } from './logging.service';
import { GeneralLLMService, QueryContext } from './general-llm.service';

/**
 * Implementation of GeneralLLMService using Hugging Face LLM microservice
 */
export class HuggingFaceGeneralLLMService implements GeneralLLMService {
  constructor() {}
  
  async query(input: string, context: QueryContext): Promise<any> {
    const startTime = Date.now();
    
    // Log the AI interaction start
    const interactionId = await loggingService.logAIInteraction(
      'query_start',
      {
        model: "huggingface-llm",
        input_text: input,
        context_type: context.context || 'general',
        user_id: context.userId,
        company_id: context.companyId,
        features: {
          useCompanyModel: context.useCompanyModel || false,
          useAbstraction: context.useAbstraction || false,
          useExistingModels: context.useExistingModels || false
        },
        conversation_length: context.conversationHistory?.length || 1
      }
    );
    
    try {
      // Determine which model to use
      let modelType: ModelType = 'base';
      if (context.useCompanyModel) {
        modelType = 'company';
      } else if (context.useAbstraction) {
        modelType = 'abstraction';
      }
      
      // Format conversation history if available
      let conversationHistoryText = '';
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        conversationHistoryText = context.conversationHistory
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
      }
      
      // Generate response using Hugging Face client
      const response = await huggingFaceClient.generate(
        input,
        modelType,
        {
          companyId: context.companyId,
          // Include additional context information if available
          ...(context.context ? { context: context.context } : {})
        },
        {
          temperature: context.temperature || 0.7,
          conversationHistory: conversationHistoryText
        }
      );
      
      const responseContent = response.generated_text || '';
      const duration = Date.now() - startTime;
      
      // Log successful interaction
      await loggingService.logAIInteraction(
        'query_complete',
        {
          interaction_id: interactionId,
          model: `huggingface-${modelType}`,
          input_text: input,
          output_text: responseContent,
          tokens_used: {
            // Estimate token count, since we don't get exact counts from HF
            prompt_tokens: Math.ceil(input.length / 4),
            completion_tokens: Math.ceil(responseContent.length / 4),
            total_tokens: Math.ceil((input.length + responseContent.length) / 4)
          },
          duration_ms: duration,
          status: 'success',
          model_version: response.model_version
        }
      );
      
      // Also log to the original database for backward compatibility
      try {
        await supabase.from('llm_query_logs').insert({
          user_id: context.userId,
          company_id: context.companyId,
          query_text: input,
          response_length: responseContent.length,
          duration_ms: duration,
          models_used: {
            useCompanyModel: context.useCompanyModel || false,
            useAbstraction: context.useAbstraction || false,
            useExistingModels: context.useExistingModels || false,
            context: context.context || 'general'
          }
        });
      } catch (logError) {
        // Just log the error but don't let it affect the response
        console.error('Error logging LLM query to legacy storage:', logError);
      }
      
      // Return in the format expected by the system (to match OpenAI's response structure)
      return {
        content: responseContent,
        role: 'assistant'
      };
    } catch (error: any) {
      console.error('Error in Hugging Face LLM query:', error);
      
      // Log the error
      await loggingService.logAIInteraction(
        'query_error',
        {
          interaction_id: interactionId,
          model: "huggingface-llm",
          input_text: input,
          error_message: error.message,
          error_details: {
            name: error.name,
            code: error.code,
            status: error.status,
            type: error.type
          },
          duration_ms: Date.now() - startTime,
          status: 'error'
        }
      );
      
      // Also log to the original database for backward compatibility
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
        console.error('Error logging LLM query error to legacy storage:', logError);
      }
      
      throw error;
    }
  }
}

// Export a singleton instance
export const huggingFaceGeneralLLMService = new HuggingFaceGeneralLLMService();
