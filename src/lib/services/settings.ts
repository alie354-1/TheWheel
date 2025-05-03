/**
 * Global settings for the application
 * 
 * This file contains configuration settings that can be used throughout the application.
 */

/**
 * Idea Playground specific settings
 */
export const ideaPlaygroundSettings = {
  /**
   * OpenAI API key (should be set via environment variable in production)
   */
  openAIApiKey: process.env.OPENAI_API_KEY || '',
  
  /**
   * Default model to use for AI operations
   */
  defaultModel: 'gpt-4o',
  
  /**
   * Mock mode - uses mock data instead of real API calls when true
   */
  useMockData: true,
  
  /**
   * Feature flags for enabling/disabling specific features
   */
  features: {
    streamingResponses: true,
    embeddingsSearch: false,
    advancedPrompting: true,
    multipleModels: false,
    mockResponses: true
  },
  
  /**
   * Default temperature for AI requests
   */
  temperature: 0.7,
  
  /**
   * Maximum number of tokens for AI completions
   */
  maxTokens: 2000,
  
  /**
   * Base URL for API requests
   */
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.openai.com/v1'
};

/**
 * General application settings
 */
export const appSettings = {
  /**
   * Enable debug logging
   */
  debug: process.env.NODE_ENV === 'development',
  
  /**
   * Application version
   */
  version: '1.0.0',
  
  /**
   * API timeout in milliseconds
   */
  apiTimeout: 30000,
  
  /**
   * Default language
   */
  language: 'en'
};
