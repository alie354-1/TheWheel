/**
 * OpenAI LLM adapter implementation
 * 
 * This adapter provides integration with OpenAI's API for the Idea Playground's LLM services.
 */

import { LLMAdapter, LLMAdapterCapabilities } from './interface';
import { LLMRequestContext } from '../context/interface';
import { ideaPlaygroundSettings } from '../../../settings';

/**
 * OpenAI API configuration
 */
interface OpenAIConfig {
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: OpenAIConfig = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2000
};

/**
 * Adapter for OpenAI API integration
 */
export class OpenAIAdapter implements LLMAdapter {
  private config: OpenAIConfig;

  /**
   * Create a new OpenAI adapter
   * @param config Optional custom configuration
   */
  constructor(config?: Partial<OpenAIConfig>) {
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      // Use API key from environment or settings
      apiKey: config?.apiKey || process.env.OPENAI_API_KEY || ideaPlaygroundSettings.openAIApiKey
    };

    // Validate configuration
    if (!this.config.apiKey) {
      console.warn('OpenAI API key not provided. API calls will fail.');
    }
  }

  /**
   * Get the adapter name
   */
  getName(): string {
    return 'OpenAI';
  }

  /**
   * Get adapter capabilities
   */
  getCapabilities(): LLMAdapterCapabilities {
    // Capabilities depend on the model being used
    if (this.config.model.includes('gpt-4')) {
      return {
        streaming: true,
        embeddings: true,
        maxPromptTokens: 8000,
        maxCompletionTokens: 4000
      };
    } else {
      // Default for gpt-3.5-turbo
      return {
        streaming: true,
        embeddings: true,
        maxPromptTokens: 4000,
        maxCompletionTokens: 2000
      };
    }
  }

  /**
   * Complete a prompt using the OpenAI API
   * @param prompt The prompt to send
   * @param context Optional context for the request
   */
  async complete(prompt: string, context?: LLMRequestContext): Promise<string> {
    try {
      // In a real implementation, this would make an API call to OpenAI
      // For demo purposes, we're simulating a response
      
      if (!this.config.apiKey) {
        return this.generateMockResponse(prompt);
      }
      
      // Simulate API call delay
      await this.simulateApiDelay();
      
      // If this were a real implementation, we would make a fetch call to the OpenAI API:
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        })
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
      */
      
      return this.generateMockResponse(prompt);
    } catch (error) {
      console.error('Error in OpenAI completion:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Stream completions token by token
   * @param prompt The prompt to send
   * @param callback Function to call with each token
   * @param context Optional context for the request
   */
  async streamComplete(
    prompt: string,
    callback: (token: string) => void,
    context?: LLMRequestContext
  ): Promise<void> {
    try {
      // In a real implementation, this would set up a streaming connection to OpenAI
      // For demo purposes, we're simulating a token-by-token response
      
      if (!this.config.apiKey) {
        const mockResponse = this.generateMockResponse(prompt);
        this.simulateTokenStream(mockResponse, callback);
        return;
      }
      
      // If this were a real implementation, we would use the OpenAI streaming API:
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: true
        })
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        // Parse SSE format and extract token
        // Call callback with token
      }
      */
      
      // For demo, simulate streaming with mock response
      const mockResponse = this.generateMockResponse(prompt);
      this.simulateTokenStream(mockResponse, callback);
    } catch (error) {
      console.error('Error in OpenAI streaming:', error);
      callback(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate embeddings for text
   * @param text The text to embed
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // In a real implementation, this would call the OpenAI embeddings API
      // For demo purposes, we're returning a mock embedding
      
      if (!this.config.apiKey) {
        return this.generateMockEmbedding(text);
      }
      
      // Simulate API call delay
      await this.simulateApiDelay();
      
      // If this were a real implementation, we would call the embeddings API:
      /*
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text
        })
      });
      
      const data = await response.json();
      return data.data[0].embedding;
      */
      
      return this.generateMockEmbedding(text);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`OpenAI embeddings error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate a mock response for demonstration purposes
   */
  private generateMockResponse(prompt: string): string {
    // Extract keywords from prompt
    const keywords = this.extractKeywords(prompt.toLowerCase());
    
    // Generate different responses based on prompt content
    if (prompt.includes('business idea') || prompt.includes('generate idea')) {
      return JSON.stringify({
        title: "EcoTrack: Sustainable Resource Management Platform",
        description: "A comprehensive platform that helps businesses track, manage, and optimize their resource usage to minimize environmental impact while maximizing cost efficiency.",
        problem_statement: "Businesses struggle to efficiently track and reduce their environmental footprint while also managing costs associated with resource consumption.",
        solution_concept: "An integrated dashboard utilizing IoT sensors and AI analytics to provide real-time monitoring, predictive insights, and automated optimization suggestions for energy, water, and material usage.",
        target_audience: ["Medium to large enterprises", "Sustainability-focused organizations", "Manufacturing companies", "Commercial real estate managers"],
        unique_value: "Combines environmental impact reduction with cost savings in one platform, providing actionable insights rather than just data collection.",
        business_model: "SaaS subscription with tiered pricing based on company size and feature access. Additional revenue from consulting services and custom implementation."
      }, null, 2);
    }
    
    if (prompt.includes('refine') || prompt.includes('feedback')) {
      return JSON.stringify({
        title: "EcoTrack+: Enhanced Resource Optimization Platform",
        description: "A comprehensive solution that transforms how businesses monitor, analyze, and optimize their resource usage across energy, water, and materials to drive both sustainability goals and cost efficiency.",
        problem_statement: "Organizations face increasing pressure to reduce environmental impact while controlling operational costs, but lack integrated tools that connect resource usage data to actionable business insights.",
        solution_concept: "A cloud-based platform with IoT integration that provides real-time monitoring, advanced AI analytics, and automated optimization recommendations tailored to specific industry requirements.",
        target_audience: ["Manufacturing companies", "Commercial real estate managers", "Hospitality chains", "Healthcare facilities", "Municipal governments"],
        unique_value: "Unique ROI-focused approach that demonstrates environmental improvements alongside financial benefits, with industry benchmarking and regulatory compliance features.",
        business_model: "Tiered SaaS subscription model with industry-specific packages, implementation services, and data analysis consulting offerings."
      }, null, 2);
    }
    
    // Default response
    return "I've processed your request. Here are some thoughts on that topic...";
  }

  /**
   * Generate a mock embedding for demonstration purposes
   */
  private generateMockEmbedding(text: string): number[] {
    // Generate a consistent but seemingly random embedding based on the text
    const embedding: number[] = [];
    let hash = 0;
    
    // Simple hash of the text
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Generate a 1536-dimension embedding (standard for OpenAI)
    for (let i = 0; i < 1536; i++) {
      // Use the hash and position to generate a seemingly random but consistent value
      const value = Math.sin(hash + i) / 10;
      embedding.push(value);
    }
    
    return embedding;
  }

  /**
   * Simulate token-by-token streaming
   */
  private async simulateTokenStream(text: string, callback: (token: string) => void): Promise<void> {
    // Split text into tokens (words for simplicity)
    const tokens = text.split(/(\s+|[.,!?;:])/);
    
    // Stream tokens with a small delay between each
    for (const token of tokens) {
      await new Promise(resolve => setTimeout(resolve, 50));
      callback(token);
    }
  }

  /**
   * Simulate API call delay
   */
  private async simulateApiDelay(): Promise<void> {
    // Random delay between 500-1500ms
    const delay = 500 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Extract keywords from a prompt string
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'a', 'an']);
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
  }
}
