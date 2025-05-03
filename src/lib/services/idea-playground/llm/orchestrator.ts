import { LLMAdapter } from './adapters/interface';
import { OpenAIAdapter } from './adapters/openai.adapter';
import { ContextManager } from './context/context-manager';
import { LLMRequestContext } from './context/interface';

/**
 * Orchestrates LLM interactions using the appropriate adapter and context processing
 */
export class LLMOrchestrator {
  private adapter: LLMAdapter;
  private contextManager: ContextManager;
  
  /**
   * Create a new LLM orchestrator
   * @param adapter The LLM adapter to use
   * @param contextManager The context manager for request enrichment
   */
  constructor(adapter?: LLMAdapter, contextManager?: ContextManager) {
    // Use provided adapter or create default OpenAI adapter
    this.adapter = adapter || new OpenAIAdapter();
    
    // Use provided context manager or create default
    this.contextManager = contextManager || ContextManager.createDefault();
  }
  
  /**
   * Complete a prompt using the configured adapter
   * @param prompt The prompt to send to the LLM
   * @param context Optional additional context
   * @returns Promise resolving to the generated text
   */
  async complete(prompt: string, context?: Partial<LLMRequestContext>): Promise<string> {
    try {
      // Create base context
      const baseContext: LLMRequestContext = {
        userContext: prompt,
        ...(context || {})
      };
      
      // Process context through context manager
      const processedContext = this.contextManager.processContext(baseContext);
      
      // Construct the final prompt
      const finalPrompt = this.constructFinalPrompt(processedContext);
      
      // Complete the prompt using the adapter
      return await this.adapter.complete(finalPrompt, processedContext);
    } catch (error) {
      console.error('Error in LLMOrchestrator.complete:', error);
      throw error;
    }
  }
  
  /**
   * Stream completion tokens
   * @param prompt The prompt to send to the LLM
   * @param callback Function to call with each token
   * @param context Optional additional context
   */
  async streamComplete(
    prompt: string, 
    callback: (token: string) => void,
    context?: Partial<LLMRequestContext>
  ): Promise<void> {
    try {
      // Check if adapter supports streaming
      if (!this.adapter.streamComplete || !this.adapter.getCapabilities().streaming) {
        throw new Error(`Adapter ${this.adapter.getName()} does not support streaming`);
      }
      
      // Create base context
      const baseContext: LLMRequestContext = {
        userContext: prompt,
        ...(context || {})
      };
      
      // Process context through context manager
      const processedContext = this.contextManager.processContext(baseContext);
      
      // Construct the final prompt
      const finalPrompt = this.constructFinalPrompt(processedContext);
      
      // Stream the response
      await this.adapter.streamComplete(finalPrompt, callback, processedContext);
    } catch (error) {
      console.error('Error in LLMOrchestrator.streamComplete:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      callback(`Error: ${errorMessage}`);
    }
  }
  
  /**
   * Generate embeddings for a text
   * @param text The text to generate embeddings for
   * @returns Promise resolving to the embeddings
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Check if adapter supports embeddings
      if (!this.adapter.generateEmbedding || !this.adapter.getCapabilities().embeddings) {
        throw new Error(`Adapter ${this.adapter.getName()} does not support embeddings`);
      }
      
      return await this.adapter.generateEmbedding(text);
    } catch (error) {
      console.error('Error in LLMOrchestrator.generateEmbedding:', error);
      throw error;
    }
  }
  
  /**
   * Get the context manager
   */
  getContextManager(): ContextManager {
    return this.contextManager;
  }
  
  /**
   * Set a new context manager
   */
  setContextManager(contextManager: ContextManager): void {
    this.contextManager = contextManager;
  }
  
  /**
   * Get the current adapter
   */
  getAdapter(): LLMAdapter {
    return this.adapter;
  }
  
  /**
   * Set a new adapter
   */
  setAdapter(adapter: LLMAdapter): void {
    this.adapter = adapter;
  }
  
  /**
   * Construct the final prompt by combining all context elements
   */
  private constructFinalPrompt(context: LLMRequestContext): string {
    // If there's a formatted context, use that
    if (context.formattedContext) {
      return context.formattedContext;
    }
    
    // Otherwise, just use the user context
    return context.userContext || '';
  }
}
