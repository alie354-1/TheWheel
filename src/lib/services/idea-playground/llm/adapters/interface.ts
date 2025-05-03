/**
 * Interface for LLM adapters to standardize interactions with different language model providers
 */
export interface LLMAdapter {
  /**
   * Complete a prompt using the language model
   * @param prompt The prompt to send to the language model
   * @param context Optional additional context for the request
   * @returns A promise resolving to the generated completion text
   */
  complete(prompt: string, context?: any): Promise<string>;
  
  /**
   * Generate embeddings for a text (optional capability)
   * @param text The text to generate embeddings for
   * @returns A promise resolving to an array of numbers representing the embeddings
   */
  generateEmbedding?(text: string): Promise<number[]>;
  
  /**
   * Stream completions token by token (optional capability)
   * @param prompt The prompt to send to the language model
   * @param callback Function to call with each token as it's generated
   * @param context Optional additional context for the request
   * @returns A promise resolving when the stream is complete
   */
  streamComplete?(prompt: string, callback: (token: string) => void, context?: any): Promise<void>;
  
  /**
   * Get the name of this adapter
   * @returns The adapter name
   */
  getName(): string;
  
  /**
   * Get the capabilities of this adapter
   * @returns An object describing the capabilities
   */
  getCapabilities(): LLMAdapterCapabilities;
}

/**
 * Capabilities that an LLM adapter may support
 */
export interface LLMAdapterCapabilities {
  /** Whether the adapter supports streaming completions */
  streaming: boolean;
  
  /** Whether the adapter supports generating embeddings */
  embeddings: boolean;
  
  /** Maximum prompt tokens supported */
  maxPromptTokens: number;
  
  /** Maximum completion tokens supported */
  maxCompletionTokens: number;
}
