# Modular Idea Playground Architecture

## Overview

The Idea Playground has been restructured into a modular architecture to improve maintainability, testability, and extensibility. This document outlines the new architecture and provides guidance on how to use it.

## Architecture

The new architecture is organized around the following principles:

1. **Separation of Concerns**: Each module has a specific responsibility
2. **Dependency Injection**: Services receive their dependencies via constructors
3. **Facade Pattern**: A single entry point provides access to all functionality
4. **Adapter Pattern**: LLM implementations are abstracted behind adapters
5. **Context Enrichment**: A system for enhancing LLM requests with relevant context

### Directory Structure

```
src/lib/services/idea-playground/
├── index.ts                      # Barrel exports
├── idea-generation.service.ts    # Idea generation capabilities
├── component.service.ts          # Component management
├── canvas.service.ts             # Business model/value prop canvas generation
├── refinement.service.ts         # Idea refinement
├── feedback.service.ts           # User feedback processing
├── idea-management.service.ts    # Managing ideas (CRUD)
├── llm/                          # LLM integration
│   ├── orchestrator.ts           # Coordinates LLM requests/responses
│   ├── adapters/                 # LLM provider implementations
│   │   ├── interface.ts          # Adapter interface definition
│   │   └── openai.adapter.ts     # OpenAI implementation
│   └── context/                  # Context enrichment system
│       ├── interface.ts          # Context provider interfaces
│       ├── context-manager.ts    # Manages multiple context providers
│       ├── base-context.provider.ts # Base context provider
│       ├── company-context.provider.ts # Company-specific context
│       └── abstraction-context.provider.ts # Abstraction level context
└── utils/                        # Utility functions
    └── response-parsing.ts       # Parse LLM responses into structured data
```

## Facade Service

The new architecture exposes a facade service that provides a single entry point to all idea playground functionality:

```typescript
import { IdeaPlaygroundFacade } from '../../lib/services/idea-playground.service.facade';

// Create the facade service
const ideaPlayground = new IdeaPlaygroundFacade({
  apiKey: 'your-api-key', // Optional
  model: 'gpt-4-turbo' // Optional
});

// Generate ideas
const ideas = await ideaPlayground.generateIdea('A sustainable food delivery app');

// Generate business model canvas
const canvas = await ideaPlayground.generateBusinessModelCanvas(ideas[0].title);

// Generate component variations
const components = await ideaPlayground.generateComponentVariations(ideas[0].title);
```

## Domain Services

Individual domain services can be accessed through the facade if needed:

```typescript
// Get the idea generation service
const ideaGenerationService = ideaPlayground.getIdeaGenerationService();

// Generate multiple ideas
const ideas = await ideaGenerationService.generateIdeas('A new social media platform', 5);

// Generate variations of an existing idea
const variations = await ideaGenerationService.generateIdeaVariations('A platform for connecting pet owners');
```

## LLM Orchestration

The `LLMOrchestrator` coordinates all interactions with language models:

1. It manages the LLM adapter that handles API communication
2. It enriches requests with context through the context manager
3. It processes responses, handling errors and parsing structured data

## Context System

The context system enhances LLM requests with relevant information:

- `CompanyContextProvider`: Adds information about the company (industry, stage, etc.)
- `AbstractionContextProvider`: Controls the abstraction level of responses
- Custom context providers can be added as needed

## Migration

A migration script is available to help transition from the old monolithic architecture to the new modular one:

```bash
# Run the migration script
./scripts/run-modular-idea-playground.sh
```

## Benefits

1. **Maintainability**: Smaller, focused modules are easier to understand and maintain
2. **Testability**: Dependency injection makes unit testing straightforward
3. **Extensibility**: New services and adapters can be added without modifying existing code
4. **Flexibility**: LLM providers can be swapped by implementing new adapters
5. **Robust Error Handling**: Centralized error handling and recovery
6. **Structured Data**: Better parsing and validation of LLM responses
7. **Context Awareness**: Rich context enhances the quality of LLM responses

## Best Practices

1. Always use the facade for high-level access to idea playground functionality
2. When extending the system, create new service modules rather than modifying existing ones
3. Add new LLM providers by implementing the `LLMAdapter` interface
4. Create specialized context providers for specific domains or use cases
5. Use the utilities in `response-parsing.ts` to handle LLM responses safely
