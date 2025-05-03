# Idea Playground Rebuild: Architecture

## System Architecture Overview

The Idea Playground rebuild adopts a comprehensive domain-driven architecture with clear separation of concerns, robust error handling, and optimal performance characteristics. The following diagram illustrates the high-level system architecture:

```mermaid
graph TD
    Client[Client Application] --> APIGateway[API Gateway]
    
    subgraph "Application Layer"
        APIGateway --> ApplicationServices[Application Services]
        ApplicationServices --> CommandHandlers[Command Handlers]
        ApplicationServices --> QueryHandlers[Query Handlers]
        CommandHandlers --> DomainServices[Domain Services]
        QueryHandlers --> ReadModels[Read Models]
    end
    
    subgraph "Domain Layer"
        DomainServices --> Entities[Domain Entities]
        DomainServices --> ValueObjects[Value Objects]
        DomainServices --> DomainEvents[Domain Events]
        Entities --> AggregateRoots[Aggregate Roots]
    end
    
    subgraph "Infrastructure Layer"
        DomainServices --> Repositories[Repositories]
        ApplicationServices --> AIService[AI Service]
        AIService --> AIO[AI Orchestrator]
        AIO --> AIProviders[AI Providers]
        Repositories --> Database[(Database)]
        ApplicationServices --> EventBus[Event Bus]
        ApplicationServices --> Caching[Caching]
        ApplicationServices --> Logging[Logging]
    end
```

## Component Architecture

### Client Application

The client application is a React-based single-page application (SPA) with the following key architectural components:

1. **State Management**: Uses Zustand for global state management with slice pattern for modularity
2. **API Communication**: React Query for data fetching, caching, and synchronization
3. **UI Components**: Composite component pattern with composition for flexibility
4. **Routing**: React Router with typed routes for navigation and deep linking
5. **Error Boundary**: Hierarchical error boundaries for isolated error handling

```mermaid
graph TD
    ReactApp[React Application] --> GlobalState[Global State - Zustand]
    ReactApp --> Routing[React Router]
    ReactApp --> ApiLayer[API Layer - React Query]
    ReactApp --> UIComponents[UI Components]
    
    UIComponents --> CanvasComponents[Canvas Components]
    UIComponents --> IdeaComponents[Idea Components]
    UIComponents --> VariationComponents[Variation Components]
    UIComponents --> RefinementComponents[Refinement Components]
    UIComponents --> SharedComponents[Shared Components]
    
    GlobalState --> UserSlice[User Slice]
    GlobalState --> CanvasSlice[Canvas Slice]
    GlobalState --> IdeaSlice[Idea Slice]
    GlobalState --> UISlice[UI Slice]
    
    ApiLayer --> ApiHooks[Custom API Hooks]
    ApiLayer --> QueryCache[Query Cache]
    ApiLayer --> MutationHandlers[Mutation Handlers]
```

### Application Layer

The application layer coordinates use cases by delegating to domain services:

1. **Command Handlers**: Process user actions that modify state
2. **Query Handlers**: Process read operations optimized for specific views
3. **Application Services**: Orchestrate use cases spanning multiple domain services
4. **DTOs**: Data Transfer Objects for API communication

```mermaid
graph TD
    AppServices[Application Services] --> CanvasAppService[Canvas Application Service]
    AppServices --> IdeaAppService[Idea Application Service]
    AppServices --> VariationAppService[Variation Application Service]
    AppServices --> MergeAppService[Merge Application Service]
    AppServices --> RefinementAppService[Refinement Application Service]
    
    CanvasAppService --> CanvasCommands[Canvas Commands]
    CanvasAppService --> CanvasQueries[Canvas Queries]
    
    IdeaAppService --> IdeaCommands[Idea Commands]
    IdeaAppService --> IdeaQueries[Idea Queries]
    
    VariationAppService --> VariationCommands[Variation Commands]
    VariationAppService --> VariationQueries[Variation Queries]
    
    MergeAppService --> MergeCommands[Merge Commands]
    MergeAppService --> MergeQueries[Merge Queries]
    
    RefinementAppService --> RefinementCommands[Refinement Commands]
    RefinementAppService --> RefinementQueries[Refinement Queries]
```

### Domain Layer

The domain layer contains the business logic and domain rules:

1. **Aggregate Roots**: Canvas, Idea, Variation, MergedIdea (enforce invariants)
2. **Entities**: Objects with identity and lifecycle
3. **Value Objects**: Immutable objects without identity
4. **Domain Events**: Represent significant state changes in the domain
5. **Domain Services**: Implement domain logic that doesn't fit naturally in entities

```mermaid
graph TD
    subgraph "Domain Model"
        Canvas[Canvas] --> Idea[Idea]
        Idea --> Variation[Variation]
        Variation --> MergedIdea[Merged Idea]
        
        Canvas --> User[User]
        Canvas --> Collaborator[Collaborator]
        Idea --> Comment[Comment]
        Idea --> Component[Component]
        Variation --> SWOT[SWOT Analysis]
        MergedIdea --> Source[Source Relationship]
    end
    
    subgraph "Domain Services"
        CanvasService[Canvas Service]
        IdeaService[Idea Service]
        VariationService[Variation Service]
        MergeService[Merge Service]
        RefinementService[Refinement Service]
        ValidationService[Validation Service]
    end
    
    subgraph "Domain Events"
        CanvasCreated[Canvas Created]
        IdeaGenerated[Idea Generated]
        VariationsCreated[Variations Created]
        IdeasMerged[Ideas Merged]
        IdeaRefined[Idea Refined]
    end
    
    Canvas -.-> CanvasCreated
    Idea -.-> IdeaGenerated
    Variation -.-> VariationsCreated
    MergedIdea -.-> IdeasMerged
```

### Infrastructure Layer

The infrastructure layer provides technical capabilities:

1. **Repositories**: Data access abstractions for domain objects
2. **AI Service**: API client and orchestration for AI operations
3. **Event Bus**: Publish-subscribe mechanism for domain events
4. **Caching**: Performance optimization for frequently accessed data
5. **Logging**: Comprehensive logging for monitoring and debugging

#### AI Service Architecture

The AI Service is a critical component with specialized architecture:

```mermaid
graph TD
    AIService[AI Service] --> AIOrchestrator[AI Orchestrator]
    AIOrchestrator --> PromptManager[Prompt Manager]
    AIOrchestrator --> ResponseProcessor[Response Processor]
    AIOrchestrator --> ErrorHandler[Error Handler]
    
    PromptManager --> PromptTemplates[(Prompt Templates)]
    PromptManager --> ContextEnrichment[Context Enrichment]
    PromptManager --> TokenOptimization[Token Optimization]
    
    ResponseProcessor --> SchemaValidation[Schema Validation]
    ResponseProcessor --> ResponseParsing[Response Parsing]
    ResponseProcessor --> ResponseTransformation[Response Transformation]
    
    ErrorHandler --> RetryMechanism[Retry Mechanism]
    ErrorHandler --> Fallbacks[Fallbacks]
    ErrorHandler --> ErrorReporting[Error Reporting]
    
    AIOrchestrator --> OpenAI[OpenAI Provider]
    AIOrchestrator -.-> AlternateProvider[Alternate Provider]
```

## Database Schema

```mermaid
erDiagram
    users ||--o{ canvases : owns
    users ||--o{ collaborators : is
    canvases ||--o{ ideas : contains
    canvases ||--o{ collaborators : has
    ideas ||--o{ variations : generates
    variations ||--o{ merged_ideas : contributes-to
    ideas ||--o{ components : has
    ideas ||--o{ comments : receives
    
    users {
        uuid id PK
        string email
        string name
        timestamp created_at
        timestamp updated_at
    }
    
    canvases {
        uuid id PK
        uuid owner_id FK
        string name
        string description
        string[] tags
        timestamp created_at
        timestamp updated_at
    }
    
    collaborators {
        uuid canvas_id FK
        uuid user_id FK
        string permission_level
        timestamp created_at
    }
    
    ideas {
        uuid id PK
        uuid canvas_id FK
        string title
        text description
        text problem_statement
        text target_audience
        text unique_value
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
    
    variations {
        uuid id PK
        uuid parent_idea_id FK
        string title
        text description
        text problem_statement
        text target_audience
        text unique_value
        jsonb swot
        boolean is_selected
        timestamp created_at
        timestamp updated_at
    }
    
    merged_ideas {
        uuid id PK
        uuid canvas_id FK
        string title
        text description
        text problem_statement
        text target_audience
        text unique_value
        jsonb swot
        boolean is_selected
        timestamp created_at
        timestamp updated_at
    }
    
    merge_sources {
        uuid merged_idea_id FK
        uuid variation_id FK
        timestamp created_at
    }
    
    components {
        uuid id PK
        uuid idea_id FK
        string type
        string name
        jsonb content
        timestamp created_at
        timestamp updated_at
    }
    
    comments {
        uuid id PK
        uuid idea_id FK
        uuid user_id FK
        text content
        timestamp created_at
        timestamp updated_at
    }
```

## Integration Points

### 1. Authentication System

The Idea Playground integrates with the existing authentication system:

- JWT token-based authentication
- Role-based access control
- Session management

### 2. OpenAI Integration

Integration with OpenAI's API for AI-powered features:

- GPT-4 for idea generation and refinement
- Function calling for structured output
- Input validation and output parsing
- Context management for coherent AI operations

### 3. Event System

Event-based architecture for loose coupling:

- Domain events published through event bus
- Subscribers consume events for side effects
- Cross-domain communication via events

### 4. Logging System

Integration with the comprehensive logging system:

- Structured logging for all operations
- Error tracking and reporting
- Performance monitoring
- AI interaction logging

## Data Flow

### 1. Idea Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Components
    participant AppService as Application Service
    participant DomainService as Domain Service
    participant AI as AI Service
    participant DB as Database
    
    User->>UI: Request idea generation
    UI->>AppService: GenerateIdea command
    AppService->>DomainService: Create idea draft
    DomainService->>DB: Save draft
    DB-->>DomainService: Draft saved
    DomainService-->>AppService: Return draft
    AppService->>AI: Request idea generation
    
    AI->>AI: Process request
    AI-->>AppService: Generated content
    
    AppService->>DomainService: Update idea
    DomainService->>DB: Save complete idea
    DB-->>DomainService: Idea saved
    DomainService->>DomainService: Publish IdeaCreated event
    DomainService-->>AppService: Return complete idea
    AppService-->>UI: Return result
    UI-->>User: Display generated idea
```

### 2. Variation Generation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Components
    participant AppService as Application Service
    participant VarService as Variation Service
    participant IdeaService as Idea Service
    participant AI as AI Service
    participant DB as Database
    
    User->>UI: Request variations
    UI->>AppService: GenerateVariations command
    AppService->>IdeaService: Get original idea
    IdeaService->>DB: Fetch idea
    DB-->>IdeaService: Idea data
    IdeaService-->>AppService: Return idea
    
    AppService->>AI: Generate variations
    AI->>AI: Process request
    AI-->>AppService: Generated variations
    
    loop For Each Variation
        AppService->>VarService: Create variation
        VarService->>DB: Save variation
        DB-->>VarService: Variation saved
    end
    
    VarService->>VarService: Publish VariationsCreated event
    VarService-->>AppService: Return all variations
    AppService-->>UI: Return results
    UI-->>User: Display variations
```

## Performance Considerations

1. **Lazy Loading**: Components and data loaded on-demand
2. **Caching Strategy**:
   - Short-term cache for AI results
   - Long-term cache for reference data
   - Cache invalidation on updates
3. **Pagination**:
   - Client-side pagination for small datasets
   - Server-side pagination for large datasets
4. **Connection Pooling**:
   - Database connection pooling
   - API client pooling for external services

## Security Architecture

1. **Authentication**:
   - JWT-based authentication
   - Short-lived access tokens
   - Refresh token rotation

2. **Authorization**:
   - Role-based access control
   - Object-level permissions
   - Permission checks in application services

3. **Data Protection**:
   - Data encryption at rest
   - Secure API communication (HTTPS)
   - Input validation and output sanitization

4. **API Security**:
   - Rate limiting
   - Request validation
   - CSRF protection

## Error Handling Strategy

1. **Domain Errors**:
   - Rich domain error types
   - Error classification by severity
   - Error translation for UI

2. **Infrastructure Errors**:
   - Retry mechanisms for transient failures
   - Circuit breakers for external services
   - Fallback mechanisms for degraded operation

3. **UI Error Handling**:
   - Component-level error boundaries
   - Contextual error messages
   - Recovery options for users

## Monitoring and Observability

1. **Performance Metrics**:
   - Response times
   - Error rates
   - Resource utilization

2. **Business Metrics**:
   - User engagement
   - Feature usage
   - Conversion rates

3. **AI Operation Metrics**:
   - Token usage
   - Response quality
   - Error classification
