import axios from 'axios';
import { appSettingsService } from './services/app-settings.service';

// Use the official Hugging Face Inference API URL
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

// Default model to use if none specified in settings
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

export type ModelType = 'base' | 'company' | 'abstraction' | 'user';

export interface GenerateOptions {
  maxLength?: number;
  temperature?: number;
  provider?: string;
  useCompanyModel?: boolean;
  useAbstractionModel?: boolean;
  context?: Record<string, any>;
  conversationHistory?: string;
}

export interface HuggingFaceResponse {
  generated_text: string;
  model_version?: string;
  context_applied?: boolean;
  abstraction_applied?: boolean;
}

/**
 * Client for interacting with the Hugging Face Inference API directly
 */
const huggingFaceClient = {
  /**
   * Validate API key format (Hugging Face keys start with "hf_")
   */
  validateApiKey(apiKey: string): boolean {
    return typeof apiKey === 'string' && apiKey.trim().startsWith('hf_') && apiKey.length > 5;
  },

  /**
   * Get the API key and model ID for a specific model type
   */
  async getAuthAndModel(modelType: ModelType = 'base'): Promise<{ apiKey: string, modelId: string }> {
    // Get Hugging Face settings from app settings
    const settings = await appSettingsService.getGlobalSettings('huggingface');
    
    if (!settings || !settings.api_key) {
      throw new Error('Hugging Face API key not configured. Please set it in the Settings page.');
    }
    
    const apiKey = settings.api_key.trim();
    
    // Validate API key format
    if (!this.validateApiKey(apiKey)) {
      throw new Error('Invalid Hugging Face API key format. Keys should start with "hf_".');
    }
    
    let modelId = DEFAULT_MODEL;
    
    // Select the appropriate model based on modelType
    if (settings.spaces && modelType in settings.spaces) {
      modelId = settings.spaces[modelType]?.model_id || DEFAULT_MODEL;
    }
    
    return {
      apiKey,
      modelId
    };
  },
  
  /**
   * Generate text based on a prompt
   */
  async generate(
    prompt: string,
    modelType: ModelType = 'base',
    context?: Record<string, any>,
    options: Partial<GenerateOptions> = {}
  ): Promise<HuggingFaceResponse> {
    try {
      // Get API key and model ID
      const { apiKey, modelId } = await this.getAuthAndModel(modelType);
      
      // Build the full context/prompt with any provided conversation history
      let fullPrompt = prompt;
      if (options.conversationHistory) {
        fullPrompt = `${options.conversationHistory}\n\n${prompt}`;
      }
      
      // If we have context, add it to the prompt
      if (context && Object.keys(context).length > 0) {
        fullPrompt = `Context: ${JSON.stringify(context)}\n\nPrompt: ${fullPrompt}`;
      }
      
      // Make the request to the Hugging Face API
      const response = await axios.post(
        `${HUGGINGFACE_API_URL}/${encodeURIComponent(modelId)}`, 
        { 
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: options.maxLength || 1024,
            temperature: options.temperature || 0.7,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Format the response to match our expected structure
      return {
        generated_text: response.data[0]?.generated_text || '',
        model_version: modelId,
        context_applied: !!context
      };
    } catch (error: any) {
      console.error('Error generating text:', error);
      
      // Provide more helpful error messages for common API issues
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Hugging Face API key is invalid or expired. Please update it in Settings.');
        } else if (error.response.status === 404) {
          throw new Error(`Model ${modelType} not found. Please check the model ID in Settings.`);
        } else if (error.response.status === 429) {
          throw new Error('Too many requests to Hugging Face API. Please try again later.');
        }
      }
      
      throw error;
    }
  },

  /**
   * Generate structured output based on a prompt and schema
   */
  async generateStructure<T>(
    prompt: string,
    schema: Record<string, any>,
    modelType: ModelType = 'base',
    context?: Record<string, any>,
    options: Partial<GenerateOptions> = {}
  ): Promise<T> {
    try {
      // First, generate raw text response
      const schemaPrompt = `${prompt}\n\nRespond with a valid JSON object matching this schema: ${JSON.stringify(schema)}`;
      const response = await this.generate(
        schemaPrompt, 
        modelType, 
        context, 
        { 
          ...options,
          temperature: options.temperature || 0.2 // Lower temperature for structured output
        }
      );
      
      // Extract JSON from the response
      const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to generate valid JSON structure');
      }
      
      // Parse the JSON
      return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
      console.error('Error generating structured output:', error);
      throw error;
    }
  },

  /**
   * Generate multiple variations of a response
   */
  async generateVariations(
    prompt: string,
    count: number,
    modelType: ModelType = 'base',
    context?: Record<string, any>,
    options: Partial<GenerateOptions> = {}
  ): Promise<string[]> {
    try {
      // Generate multiple responses in parallel
      const promises = Array(count).fill(0).map(() => 
        this.generate(prompt, modelType, context, {
          ...options,
          temperature: options.temperature || 0.7 + Math.random() * 0.3 // Add some randomness
        })
      );
      
      const responses = await Promise.all(promises);
      return responses.map(resp => resp.generated_text);
    } catch (error) {
      console.error('Error generating variations:', error);
      throw error;
    }
  },

  /**
   * Stream text generation with callback
   * @returns An abort controller to stop the stream
   */
  streamText(
    prompt: string,
    callback: (text: string, done: boolean) => void,
    modelType: ModelType = 'base',
    context?: Record<string, any>,
    options: Partial<GenerateOptions> = {}
  ): AbortController {
    const controller = new AbortController();
    
    // Start the generation process
    this.generate(prompt, modelType, context, options)
      .then(response => {
        // For simplicity, we're not doing actual streaming since the Hugging Face
        // Inference API doesn't support it natively without extra setup
        callback(response.generated_text, true);
      })
      .catch(error => {
        console.error('Error in text stream:', error);
        callback(`Error: ${error.message}`, true);
      });
    
    return controller;
  }
};

export default huggingFaceClient;
