# AI Integration Document

## 1. AI Architecture Overview

### 1.1 High-Level Architecture

The Wheel99 platform integrates AI capabilities throughout its Idea Playground feature, providing intelligent assistance for business idea generation, refinement, and development. The AI integration follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Components                          │
│  (SmartSuggestionButton, AIAssistedInput, ContextualPanel)  │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                    React Context Providers                   │
│         (AIContextProvider, StandupContextProvider)         │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                      AI Service Layer                        │
│    (AIServiceFactory, MultiTieredAIService, MockAIService)   │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                    OpenAI API Integration                    │
│              (OpenAIGeneralLLMService, openai-client)        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Integration Points

The AI capabilities are integrated at multiple points in the application:

1. **Form Inputs**: AI-assisted text inputs and textareas that provide smart suggestions
2. **Idea Generation**: AI-powered business idea generation based on user parameters
3. **Idea Refinement**: AI assistance for refining and improving existing ideas
4. **Contextual Help**: Stage-specific guidance and suggestions
5. **Business Analysis**: Market analysis, validation, and business model generation
6. **Go-to-Market Planning**: Strategy development and milestone generation

### 1.3 Data Flow

```
┌──────────┐    ┌───────────────┐    ┌────────────┐    ┌──────────────┐
│  User    │───►│ UI Components │───►│ AI Context │───►│ AI Service   │
│ Inputs   │    │ & Forms       │    │ Providers  │    │ Factory      │
└──────────┘    └───────────────┘    └────────────┘    └──────┬───────┘
                                                             │
┌──────────┐    ┌───────────────┐    ┌────────────┐    ┌──────▼───────┐
│ Response │◄───│ UI Components │◄───│ AI Context │◄───│ OpenAI API   │
│ Display  │    │ & Forms       │    │ Providers  │    │ Integration  │
└──────────┘    └───────────────┘    └────────────┘    └──────────────┘
```

## 2. Three-Tiered Contextual Model

The AI system in Wheel99 uses a three-tiered contextual model that provides different levels of context awareness:

### 2.1 Company-Specific Context (`useCompanyModel: true`)

This tier leverages company-specific data to provide highly tailored responses:

- Accesses company data from the database
- Personalizes suggestions based on the company's:
  - Existing markets and customers
  - Current products and services
  - Strategic goals and initiatives
  - Core competencies and strengths
- Used when generating ideas that need to align with a company's specific business domain
- Implemented in the system prompt with: `Use the company-specific context provided to tailor your response.`

### 2.2 Abstraction/Pattern Context (`useAbstraction: true`)

This tier uses patterns and insights from similar companies/industries:

- Applies industry best practices and common patterns
- Provides suggestions based on what works in similar contexts
- Bridges the gap between company-specific and general knowledge
- Useful when company data is limited but industry patterns are relevant
- Implemented in the system prompt with: `Use patterns and insights from similar companies to inform your response.`

### 2.3 General Knowledge Context (`useExistingModels: true`)

This tier leverages the AI's general knowledge base:

- Provides broad, comprehensive responses not tied to specific company data
- Offers creative, diverse suggestions based on wide-ranging knowledge
- Used for general ideation and when company context isn't available
- Implemented in the system prompt with: `Use your general knowledge to provide a comprehensive response.`

The system can combine these context levels as needed, with the prompt construction in `OpenAIGeneralLLMService.query()` showing how they're integrated:

```typescript
content: `You are an AI assistant specialized in business idea generation and refinement.
         ${context.useCompanyModel ? 'Use the company-specific context provided to tailor your response.' : ''}
         ${context.useAbstraction ? 'Use patterns and insights from similar companies to inform your response.' : ''}
         ${context.useExistingModels ? 'Use your general knowledge to provide a comprehensive response.' : ''}
         
         Provide a detailed and thoughtful response that is creative, specific, and actionable.`
```

## 3. AI Service Components

### 3.1 AIServiceInterface

The `AIServiceInterface` defines the contract for all AI services in the system:

```typescript
export interface AIServiceInterface {
  generateIdeas(params: IdeaGenerationParams, context: AIServiceContext): Promise<IdeaResponse[]>;
  refineIdea(idea: IdeaPlaygroundIdea, params: IdeaRefinementParams, context: AIServiceContext): Promise<IdeaRefinementResponse>;
  enhanceIdea(params: IdeaEnhancementParams, context: AIServiceContext): Promise<IdeaEnhancementResponse>;
  analyzeMarket(idea: IdeaPlaygroundIdea, params: MarketAnalysisParams, context: AIServiceContext): Promise<MarketAnalysisResponse>;
  validateIdea(idea: IdeaPlaygroundIdea, params: IdeaValidationParams, context: AIServiceContext): Promise<ValidationResponse>;
  generateBusinessModel(idea: IdeaPlaygroundIdea, params: BusinessModelParams, context: AIServiceContext): Promise<BusinessModelResponse>;
  createGoToMarketPlan(idea: IdeaPlaygroundIdea, params: GoToMarketParams, context: AIServiceContext): Promise<GoToMarketResponse>;
  generateMilestones(idea: IdeaPlaygroundIdea, params: MilestoneParams, context: AIServiceContext): Promise<MilestoneResponse[]>;
}
```

This interface ensures that all AI service implementations provide the same capabilities, allowing them to be swapped out as needed.

### 3.2 MockAIService

The `MockAIService` provides mock implementations of all AI capabilities for development and testing:

- Returns predefined responses for all methods
- Useful for development without API costs
- Enables testing without external dependencies
- Simulates all AI capabilities with realistic but static data

### 3.3 MultiTieredAIService

The `MultiTieredAIService` implements the AI service interface using different OpenAI models based on configuration:

```typescript
export class MultiTieredAIService implements AIServiceInterface {
  private mockService: MockAIService;
  private config: MultiTieredAIServiceConfig;

  constructor(config: MultiTieredAIServiceConfig = {}) {
    this.mockService = new MockAIService();
    this.config = {
      apiKey: config.apiKey || import.meta.env.VITE_OPENAI_API_KEY,
      endpoint: config.endpoint || 'https://api.openai.com/v1',
      tier: config.tier || 'standard',
    };
  }

  private getModelForTier(tier: string): string {
    switch (tier) {
      case 'free':
        return 'gpt-3.5-turbo';
      case 'standard':
        return 'gpt-4';
      case 'premium':
        return 'gpt-4-turbo';
      default:
        return 'gpt-3.5-turbo';
    }
  }
  
  // Implementation of AIServiceInterface methods...
}
```

While the service is designed to use different models based on user tiers, the current implementation delegates to the `MockAIService` for development purposes.

### 3.4 AIServiceFactory

The `AIServiceFactory` creates and returns the appropriate AI service based on feature flags and configuration:

```typescript
export class AIServiceFactory {
  // Store a singleton instance of each service type
  private static mockService: MockAIService | null = null;
  private static multiTieredService: MultiTieredAIService | null = null;
  
  static createService(config?: {
    useMock?: boolean;
    apiKey?: string;
    endpoint?: string;
    tier?: 'free' | 'standard' | 'premium';
  }): AIServiceInterface {
    // Get feature flags from the store
    const { featureFlags } = useAuthStore.getState();
    
    // Check if we should use real AI
    const useRealAI = featureFlags.useRealAI?.enabled;
    
    // If we're not using real AI, return the mock service
    if (!useRealAI || config?.useMock) {
      return this.mockService || (this.mockService = new MockAIService());
    }
    
    // Check if we should use multi-tiered AI
    const useMultiTiered = featureFlags.multiTieredAI?.enabled;
    
    // Create a new multi-tiered service instance or use the existing one
    if (!this.multiTieredService) {
      this.multiTieredService = new MultiTieredAIService({
        apiKey: config?.apiKey,
        endpoint: config?.endpoint,
        tier: config?.tier || 'standard'
      });
    }
    
    // Return the appropriate service
    return useMultiTiered ? this.multiTieredService : this.multiTieredService;
  }
  
  static resetServices(): void {
    this.mockService = null;
    this.multiTieredService = null;
  }
}
```

This factory pattern ensures that the appropriate AI service is used based on the current configuration and feature flags.

## 4. AI Context Providers

### 4.1 BaseAIContextProvider

The `BaseAIContextProvider` serves as the foundation for all AI context providers:

- Manages the AI service lifecycle
- Handles loading states
- Provides error handling
- Implements common AI functionality

### 4.2 AIContextProvider

The `AIContextProvider` is a React context provider that makes AI capabilities available to UI components:

```typescript
export const AIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, featureFlags } = useAuthStore();
  
  // AI methods implementation...
  
  const contextValue: AIContextType = {
    generateContextualHelp,
    getSmartSuggestions,
    enhanceIdea,
    validateIdea,
    isLoading
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};
```

The provider exposes methods like:
- `generateContextualHelp`: Provides stage-specific guidance
- `getSmartSuggestions`: Generates field-specific suggestions
- `enhanceIdea`: Improves an existing idea
- `validateIdea`: Validates an idea against various criteria

### 4.3 StandupContextProvider

The `StandupContextProvider` is a specialized context provider for standup-related AI capabilities:

- Provides AI assistance for standup meetings
- Generates meeting agendas and summaries
- Offers suggestions for blockers and progress updates

### 4.4 React Hooks

The AI context providers expose custom hooks for easy access to AI capabilities:

```typescript
export const useAIContext = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
};
```

These hooks allow components to access AI capabilities without directly depending on the implementation details.

## 5. AI-Assisted Features

### 5.1 Idea Generation

The AI system can generate business ideas based on user parameters:

- Industry focus
- Target audience
- Problem area
- Technology focus
- Business model preferences
- Resource constraints
- Innovation level

The generated ideas include:
- Title and description
- Problem statement and solution concept
- Target audience and unique value proposition
- Business model and marketing strategy
- Revenue model and go-to-market strategy
- Market size and competition analysis

### 5.2 Idea Refinement

The AI can refine existing ideas based on user feedback:

- Focus on specific aspects (problem, solution, market, etc.)
- Address specific questions or concerns
- Improve clarity, feasibility, or market fit
- Enhance specific sections of the idea

### 5.3 Market Analysis

The AI can analyze markets for specific ideas:

- Market size and growth potential
- Target segment analysis
- Competitor analysis
- Trends, opportunities, and threats
- Recommendations for market entry

### 5.4 Business Model Generation

The AI can generate business models for ideas:

- Revenue streams
- Cost structure
- Key resources and activities
- Key partners and channels
- Customer relationships
- Unit economics and pricing strategy

### 5.5 Go-to-Market Planning

The AI can create go-to-market plans:

- Launch strategy
- Marketing channels and approaches
- Sales strategy
- Partnerships
- Milestones and KPIs
- Budget allocation

### 5.6 Milestone Generation

The AI can generate milestones for idea implementation:

- Short-term, medium-term, and long-term milestones
- Target dates and success criteria
- Required resources
- Dependencies and risks

## 6. AI Integration in UI Components

### 6.1 SmartSuggestionButton

The `SmartSuggestionButton` component provides AI-generated suggestions for form fields:

```tsx
<SmartSuggestionButton
  fieldType="problem_statement"
  currentValue={formData.problem}
  onSuggestionSelect={(suggestion) => updateField('problem', suggestion)}
/>
```

This component:
- Requests suggestions from the AI based on the field type and current value
- Displays suggestions in a dropdown
- Allows users to select and apply suggestions

### 6.2 AIAssistedInput and AIAssistedTextArea

These components enhance standard form inputs with AI capabilities:

```tsx
<AIAssistedInput
  label="Problem Statement"
  value={formData.problem}
  onChange={(e) => updateField('problem', e.target.value)}
  fieldType="problem_statement"
/>

<AIAssistedTextArea
  label="Solution Concept"
  value={formData.solution}
  onChange={(e) => updateField('solution', e.target.value)}
  fieldType="solution_concept"
  rows={4}
/>
```

These components:
- Integrate the `SmartSuggestionButton`
- Provide inline suggestions
- Allow users to request AI assistance while typing

### 6.3 ContextualAIPanel

The `ContextualAIPanel` provides stage-specific AI assistance:

```tsx
<ContextualAIPanel stage="idea_generation" ideaId={currentIdea?.id} />
```

This component:
- Displays contextual help based on the current stage
- Provides actionable tips and guidance
- Updates automatically when the stage changes

## 7. AI Service Configuration and Customization

### 7.1 Feature Flag Management

The AI services use feature flags to control behavior:

- `useRealAI`: Controls whether to use real AI or mock services
- `useMockAI`: Forces the use of mock services
- `multiTieredAI`: Enables the multi-tiered AI service

These flags are managed through the `featureFlagsService`:

```typescript
async loadFeatureFlags(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'feature_flags')
      .maybeSingle();
    
    if (data?.value) {
      const { setFeatureFlags } = useAuthStore.getState();
      setFeatureFlags(data.value);
    }
  } catch (error) {
    console.error('Error loading feature flags:', error);
  }
}
```

### 7.2 API Key and Endpoint Configuration

The AI services can be configured with custom API keys and endpoints:

```typescript
const multiTieredService = new MultiTieredAIService({
  apiKey: 'your-api-key',
  endpoint: 'https://api.openai.com/v1',
  tier: 'standard'
});
```

This allows for flexibility in deployment and testing.

### 7.3 Model Parameter Tuning

The OpenAI integration can be customized with different parameters:

- Model selection based on tier
- Temperature for controlling randomness
- Max tokens for controlling response length
- Other OpenAI-specific parameters

## 8. AI Service Logging and Analytics

### 8.1 Query Logging

All AI queries are logged to the database:

```typescript
await supabase.from('llm_query_logs').insert({
  user_id: context.userId,
  company_id: context.companyId,
  query_text: input,
  response_length: completion.choices[0].message.content?.length || 0,
  duration_ms: Date.now() - startTime,
  models_used: {
    useCompanyModel: context.useCompanyModel || false,
    useAbstraction: context.useAbstraction || false,
    useExistingModels: context.useExistingModels || false,
    context: context.context || 'general'
  }
});
```

This logging enables:
- Usage tracking
- Performance monitoring
- Cost analysis
- Quality assessment

### 8.2 Performance Metrics

The system tracks performance metrics for AI operations:

- Response time
- Response length
- Success/failure rate
- Model usage

### 8.3 Usage Tracking

Usage is tracked at various levels:

- Per user
- Per company
- Per feature
- Per model

## 9. Future AI Enhancements

### 9.1 Contextual Model Improvements

Future enhancements to the contextual model could include:

- More sophisticated company context integration
- Better abstraction from similar companies
- Improved context mixing strategies
- Dynamic context selection based on query type

### 9.2 Additional AI-Assisted Features

Potential new AI-assisted features include:

- Competitive analysis
- Financial projections
- Risk assessment
- Team composition recommendations
- Product roadmap generation
- Customer persona development

### 9.3 Performance Optimization

Performance optimizations could include:

- Response caching for common queries
- Parallel query processing
- Batch processing for related queries
- Model quantization for faster inference
- Client-side model integration for simple tasks
