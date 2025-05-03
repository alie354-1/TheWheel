# Idea Playground Modular Architecture

## Overview

The Idea Playground has been refactored into a modular architecture that separates concerns, improves maintainability, and allows for better extensibility. This document outlines the structure and key components of the new architecture.

## Architecture Components

```
idea-playground/
├── service.facade.ts       # Public API facade for frontend components
├── feature-flags.service.ts # Feature flag management
└── idea-playground/        # Domain services
    ├── index.ts            # Export all services
    ├── idea-generation.service.ts
    ├── idea-management.service.ts
    ├── refinement.service.ts
    ├── canvas.service.ts
    ├── feedback.service.ts
    ├── llm/               # LLM integration
    │   ├── orchestrator.ts
    │   ├── adapters/      # LLM provider adapters
    │   │   ├── interface.ts
    │   │   └── openai.adapter.ts
    │   └── context/       # Context enhancement
    │       ├── interface.ts
    │       ├── context-manager.ts
    │       └── base-context.provider.ts
    ├── ai/                # AI-specific services
    │   ├── index.ts
    │   ├── ai-service.ts
    │   └── mock-data-generator.ts
    └── utils/             # Utility functions
        └── response-parsing.ts
```

## Key Components

### Service Facade

The `IdeaPlaygroundServiceFacade` serves as the primary interface for frontend components. It coordinates between different services and handles feature flag checking. This facade pattern simplifies frontend integration and hides the complexity of the underlying services.

```typescript
// src/lib/services/idea-playground.service.facade.ts
import { IdeaPlaygroundIdea } from '../types/idea-playground.types';
import { IdeaGenerationService } from './idea-playground/idea-generation.service';
// ...more imports

export class IdeaPlaygroundServiceFacade {
  // Services initialization
  
  async generateIdea(prompt: string, userId: string): Promise<IdeaPlaygroundIdea> {
    // Check feature flag and delegate to idea generation service
  }
  
  // Other methods that delegate to specific services
}
```

### Domain Services

Each domain service focuses on a specific aspect of the Idea Playground functionality:

1. **IdeaGenerationService**: Handles generating new ideas using AI
2. **IdeaManagementService**: CRUD operations for ideas
3. **RefinementService**: Refines ideas based on feedback
4. **CanvasService**: Manages different canvas types for ideas
5. **FeedbackService**: Collects and processes user feedback

### LLM Integration

The LLM (Large Language Model) integration is modularized to support multiple AI providers:

1. **LLMOrchestrator**: Coordinates between different AI providers and context enhancers
2. **Adapters**: Implementations for specific AI providers (OpenAI, etc.)
3. **Context Providers**: Enhance prompts with additional context

```typescript
// src/lib/services/idea-playground/llm/orchestrator.ts
export class LLMOrchestrator {
  private adapters: Record<string, LLMAdapter>;
  private contextManager: ContextManager;
  private activeAdapter: string;
  
  // Methods for generating text, ideas, etc.
}
```

### Feature Flags

The architecture includes a feature flag system that allows for gradual rollout of features:

```typescript
// src/lib/services/feature-flags.service.ts
export enum FeatureFlag {
  IDEA_PLAYGROUND = 'idea_playground',
  IP_PROTECTION = 'ip_protection',
  AI_REFINEMENT = 'ai_refinement',
  // ...more flags
}

export class FeatureFlagsService {
  // Methods for checking if features are enabled
}
```

## Type Definitions

The architecture includes comprehensive type definitions for domain objects:

```typescript
// src/lib/types/idea-playground.types.ts
export interface IdeaPlaygroundIdea {
  id: string;
  title: string;
  description: string;
  // ...more properties
}

export interface IdeaVariation {
  // ...properties
}

// ...more interfaces
```

## Integration with React Components

To use the new services in React components, import and use the facade:

```typescript
// Example component
import { useEffect, useState } from 'react';
import { IdeaPlaygroundServiceFacade } from '../lib/services/idea-playground.service.facade';
import { IdeaPlaygroundIdea } from '../lib/types/idea-playground.types';

const IdeaGenerator = () => {
  const [ideas, setIdeas] = useState<IdeaPlaygroundIdea[]>([]);
  const serviceFacade = new IdeaPlaygroundServiceFacade();
  
  const generateIdea = async (prompt: string) => {
    try {
      const newIdea = await serviceFacade.generateIdea(prompt, userId);
      setIdeas(prev => [newIdea, ...prev]);
    } catch (error) {
      console.error('Error generating idea:', error);
    }
  };
  
  // Rest of component
};
```

## Benefits of the New Architecture

1. **Separation of Concerns**: Each service has a clear, single responsibility
2. **Testability**: Services can be tested in isolation
3. **Extensibility**: New features can be added without modifying existing code
4. **Maintainability**: Easier to understand and modify specific parts of the system
5. **Feature Flags**: Gradual rollout and A/B testing capabilities
6. **AI Provider Agnostic**: Support for multiple AI providers through adapters

## Migration Strategy

For existing components using the old architecture, gradually update them to use the new facade. The service adapter provides backward compatibility during the transition period.
