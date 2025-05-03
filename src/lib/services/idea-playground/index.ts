/**
 * Idea Playground Services
 * 
 * This index file exports all components of the modular Idea Playground
 * architecture, making them accessible through a single import.
 */

// Re-export all services
export * from './idea-management.service';
export * from './refinement.service';
export * from './canvas.service';
export * from './feedback.service';
export * from './component.service';

// Re-export LLM components
export * from './llm/orchestrator';
export * from './llm/adapters/interface';
export * from './llm/adapters/openai.adapter';
export * from './llm/context/interface';
export * from './llm/context/context-manager';
export * from './llm/context/base-context.provider';
export * from './llm/context/company-context.provider';
export * from './llm/context/abstraction-context.provider';

// Export AI services
export * from './ai/types';
export * from './ai/ai-service';
export * from './ai/sequential-generation.service';
export * from './ai/idea-merger.service';
export * from './ai/mock-data-generator';

// Export types
export * from './type-compatibility';

// Export facade
export { ideaPlaygroundService } from '../idea-playground.service.facade';
export type { IdeaPlaygroundFacade, IdeaGenerationParams } from '../idea-playground.service.facade';
