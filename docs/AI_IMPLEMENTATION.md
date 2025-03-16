# Wheel99 AI Implementation

## Table of Contents
1. [Overview](#overview)
2. [Three-Tiered Contextual Model](#three-tiered-contextual-model)
   - [General-Purpose Tier](#general-purpose-tier)
   - [Domain-Specific Tier](#domain-specific-tier)
   - [User-Specific Tier](#user-specific-tier)
3. [AI Services Architecture](#ai-services-architecture)
   - [Service Interfaces](#service-interfaces)
   - [Implementation Classes](#implementation-classes)
   - [Factory Pattern](#factory-pattern)
   - [Mock Services](#mock-services)
4. [UI Integration Points](#ui-integration-points)
   - [AI-Assisted Components](#ai-assisted-components)
   - [Smart Suggestion Buttons](#smart-suggestion-buttons)
   - [Contextual AI Panels](#contextual-ai-panels)
   - [AI Context Providers](#ai-context-providers)
5. [Prompt Engineering](#prompt-engineering)
   - [Prompt Templates](#prompt-templates)
   - [Context Management](#context-management)
   - [Response Processing](#response-processing)
   - [Error Handling](#error-handling)

## Overview

Wheel99 incorporates advanced AI capabilities to assist users throughout the business ideation and development process. The AI implementation is designed to be context-aware, adaptable to user needs, and seamlessly integrated into the user interface. A three-tiered contextual model ensures that AI assistance is relevant to the specific domain, feature, and user context.

The AI capabilities are implemented through a modular architecture that includes:

1. **AI Service Layer**: A set of TypeScript services that handle communication with language models
2. **Context Providers**: React context components that provide AI capabilities to UI components
3. **AI-Assisted UI Components**: Form inputs, text areas, and other components with built-in AI assistance
4. **Smart Suggestion Controls**: UI elements that provide contextual suggestions
5. **Prompt Engineering**: Carefully crafted prompts to guide the language models' responses

## Three-Tiered Contextual Model

Wheel99 employs a three-tiered contextual model that provides progressively more specific and personalized AI assistance:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                 User-Specific Context Tier                │
│                                                           │
│   • User's company information                            │
│   • User's previous ideas and interactions                │
│   • User's industry and focus areas                       │
│   • User preferences and patterns                         │
│                                                           │
└───────────────────────────────────────────────────────────┘
                           ▲
                           │
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                Domain-Specific Context Tier               │
│                                                           │
│   • Business ideation and development domain knowledge    │
│   • Industry-specific knowledge and trends                │
│   • Business model patterns and best practices            │
│   • Market analysis frameworks                            │
│                                                           │
└───────────────────────────────────────────────────────────┘
                           ▲
                           │
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                 General-Purpose Context Tier              │
│                                                           │
│   • General language understanding                        │
│   • Broad knowledge base                                  │
│   • Common sense reasoning                                │
│   • Basic creative capabilities                           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### General-Purpose Tier

The General-Purpose Tier forms the foundation of Wheel99's AI capabilities, providing broad knowledge and language understanding. This tier is implemented through GPT models with default settings.

- **Implementation**: Base models (GPT-3.5-Turbo or GPT-4) with minimal prompting
- **Use Cases**:
  - General text generation and completion
  - Initial brainstorming without specific constraints
  - Answering general knowledge questions
  - Basic formatting and structuring of content

- **Example Prompts**:
  ```
  Generate 5 potential business ideas without any specific constraints.
  ```

### Domain-Specific Tier

The Domain-Specific Tier adds business ideation and entrepreneurship knowledge to guide the AI responses toward practical, well-formed business concepts. This tier is implemented through specialized prompts that encode domain knowledge and best practices.

- **Implementation**: Base models with domain-specific prompts and system messages
- **Use Cases**:
  - Structured business idea generation
  - Industry-specific recommendations
  - Business model pattern application
  - Market analysis and competitive positioning

- **Example Prompts**:
  ```
  You are an expert business strategist with experience in technology startups. Generate 3 business ideas in the healthcare technology sector, focusing on preventative care. For each idea, include:
  1. Problem statement
  2. Solution concept
  3. Target audience
  4. Unique value proposition
  5. Preliminary business model
  ```

### User-Specific Tier

The User-Specific Tier incorporates the user's company information, previous ideas, and preferences to deliver highly personalized AI assistance. This tier is implemented through context-aware prompts that include user-specific data.

- **Implementation**: Base models with user context injection and history awareness
- **Use Cases**:
  - Company-contextual idea generation
  - Personalized recommendations based on user history
  - Adapting to user's industry and focus areas
  - Aligning suggestions with user's patterns and preferences

- **Example Prompts**:
  ```
  As an expert business strategist, generate 3 business ideas relevant to a company with the following profile:
  
  Company: Acme Healthcare Solutions
  Industry: Medical equipment manufacturing
  Size: 120 employees
  Focus areas: Patient monitoring, diagnostic tools, telemedicine
  
  The ideas should leverage the company's existing capabilities while exploring adjacent markets. The user has previously shown interest in AI-powered diagnostics and remote patient monitoring.
  ```

## AI Services Architecture

Wheel99's AI capabilities are implemented through a modular service architecture designed for flexibility, testability, and extensibility.

### Service Interfaces

The core of the AI service architecture is a set of TypeScript interfaces that define the contract for AI services:

#### AIServiceInterface

```typescript
export interface AIServiceInterface {
  // Core idea generation
  generateIdeas(params: IdeaGenerationParams): Promise<IdeaPlaygroundIdea[]>;
  
  // Refinement capabilities
  refineIdea(params: IdeaRefinementParams): Promise<IdeaRefinementResult>;
  
  // Component-level operations
  generateComponent(
    ideaId: string, 
    componentType: ComponentType, 
    context?: any
  ): Promise<IdeaPlaygroundComponent>;
  
  enhanceComponent(
    component: IdeaPlaygroundComponent, 
    direction: string
  ): Promise<IdeaPlaygroundComponent>;
  
  // Suggestion capabilities
  getSuggestions(
    context: any, 
    count?: number
  ): Promise<Suggestion[]>;
  
  // AI-assisted text capabilities
  completeText(
    text: string, 
    fieldType: string, 
    context?: any
  ): Promise<string>;
}
```

#### General LLM Service Interface

```typescript
export interface GeneralLLMServiceInterface {
  // General text generation
  generateText(
    prompt: string, 
    options?: GenerateOptions
  ): Promise<string>;
  
  // Structured output generation
  generateWithStructure<T>(
    prompt: string, 
    schema: any, 
    options?: GenerateOptions
  ): Promise<T>;
  
  // Multiple generations
  generateVariations(
    prompt: string, 
    count: number, 
    options?: GenerateOptions
  ): Promise<string[]>;
  
  // Stream responses
  streamText(
    prompt: string, 
    callback: (text: string, done: boolean) => void, 
    options?: GenerateOptions
  ): Promise<void>;
}
```

### Implementation Classes

The interfaces are implemented by concrete classes that handle the actual AI functionality:

#### Multi-Tiered AI Service

```typescript
export class MultiTieredAIService implements AIServiceInterface {
  private readonly generalLLMService: GeneralLLMServiceInterface;
  private readonly userContext: UserContext | null;
  private readonly tier: UserTier;
  
  constructor(
    generalLLMService: GeneralLLMServiceInterface,
    userContext: UserContext | null = null,
    tier: UserTier = 'standard'
  ) {
    this.generalLLMService = generalLLMService;
    this.userContext = userContext;
    this.tier = tier;
  }
  
  // Implementation of core methods
  async generateIdeas(params: IdeaGenerationParams): Promise<IdeaPlaygroundIdea[]> {
    // Build prompt based on tier and params
    const prompt = this.buildIdeaGenerationPrompt(params);
    
    // Generate structured output
    const ideas = await this.generalLLMService.generateWithStructure<IdeaPlaygroundIdea[]>(
      prompt,
      ideaSchema,
      this.getModelOptionsForTier()
    );
    
    return ideas;
  }
  
  // Private helper methods
  private buildIdeaGenerationPrompt(params: IdeaGenerationParams): string {
    let prompt = "Generate business ideas";
    
    // Add domain context
    prompt += this.addDomainContext();
    
    // Add user context if available and appropriate for tier
    if (this.userContext && (this.tier === 'premium' || this.tier === 'enterprise')) {
      prompt += this.addUserContext(params.useCompanyContext);
    }
    
    // Add parameter-specific constraints
    prompt += this.addParameterConstraints(params);
    
    return prompt;
  }
  
  private getModelOptionsForTier(): GenerateOptions {
    switch (this.tier) {
      case 'enterprise':
        return { model: 'gpt-4', temperature: 0.7, maxTokens: 2000 };
      case 'premium':
        return { model: 'gpt-4', temperature: 0.7, maxTokens: 1500 };
      case 'standard':
      default:
        return { model: 'gpt-3.5-turbo', temperature: 0.7, maxTokens: 1000 };
    }
  }
  
  // Additional implementations...
}
```

#### General LLM Service

```typescript
export class GeneralLLMService implements GeneralLLMServiceInterface {
  private readonly openAIClient: OpenAIClient;
  private readonly logger: Logger;
  
  constructor(
    openAIClient: OpenAIClient,
    logger: Logger = console
  ) {
    this.openAIClient = openAIClient;
    this.logger = logger;
  }
  
  async generateText(
    prompt: string, 
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const completion = await this.openAIClient.createCompletion({
        model: options.model || 'gpt-3.5-turbo',
        prompt,
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        // Additional OpenAI parameters
      });
      
      return completion.choices[0]?.text || '';
    } catch (error) {
      this.logger.error('Error generating text', error);
      throw new AIServiceError('Failed to generate text', error as Error);
    }
  }
  
  // Additional implementations...
}
```

### Factory Pattern

A factory pattern is used to create the appropriate AI service based on configuration and user tier:

```typescript
export class AIServiceFactory {
  private readonly generalLLMService: GeneralLLMServiceInterface;
  private readonly userContextProvider: UserContextProvider;
  private readonly featureFlagsService: FeatureFlagsService;
  
  constructor(
    generalLLMService: GeneralLLMServiceInterface,
    userContextProvider: UserContextProvider,
    featureFlagsService: FeatureFlagsService
  ) {
    this.generalLLMService = generalLLMService;
    this.userContextProvider = userContextProvider;
    this.featureFlagsService = featureFlagsService;
  }
  
  async createService(feature: string): Promise<AIServiceInterface> {
    // Get user info
    const user = await this.userContextProvider.getCurrentUser();
    const userContext = user ? await this.userContextProvider.getUserContext(user.id) : null;
    const tier = user?.subscription?.tier || 'standard';
    
    // Check for mock mode
    const useMock = await this.featureFlagsService.isFeatureEnabled('use_mock_ai');
    
    if (useMock) {
      return new MockAIService(feature);
    }
    
    // Create the appropriate service based on feature and tier
    return new MultiTieredAIService(
      this.generalLLMService,
      userContext,
      tier
    );
  }
}
```

### Mock Services

For development and testing purposes, mock implementations of the AI services are provided:

```typescript
export class MockAIService implements AIServiceInterface {
  private readonly feature: string;
  
  constructor(feature: string) {
    this.feature = feature;
  }
  
  async generateIdeas(params: IdeaGenerationParams): Promise<IdeaPlaygroundIdea[]> {
    // Return predefined mock ideas
    return [
      {
        id: 'mock-idea-1',
        canvas_id: 'mock-canvas',
        title: 'AI-Powered Health Diagnostics',
        description: 'A mobile app that uses AI to diagnose common health issues based on symptoms and medical history.',
        problem_statement: 'People often delay seeking medical help due to inconvenience, cost, or uncertainty about their symptoms.',
        solution_concept: 'An AI-powered mobile app that provides preliminary diagnoses, risk assessments, and guidance on when to seek professional medical help.',
        target_audience: 'Health-conscious individuals aged 25-55 who value convenience and preemptive healthcare.',
        unique_value: 'Immediate health insights without appointment waiting times or doctor visits for minor concerns.',
        business_model: 'Freemium model with basic diagnostics free and premium features requiring subscription.',
        marketing_strategy: 'Partner with health insurance providers to offer as a benefit to their customers.',
        revenue_model: 'Subscription fees, partnerships with healthcare providers, and anonymized data insights.',
        go_to_market: 'Launch in select markets with high smartphone penetration and healthcare costs.',
        market_size: 'The global digital health market is projected to reach $500 billion by 2025.',
        used_company_context: false,
        is_archived: false,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // Additional mock ideas...
    ];
  }
  
  // Other mock implementations...
}
```

## UI Integration Points

Wheel99 integrates AI capabilities directly into the user interface through specialized components and patterns.

### AI-Assisted Components

AI-assisted components enhance standard form inputs with intelligent suggestions and completions.

#### AI Assisted Input

```typescript
export interface AIAssistedInputProps extends Omit<InputProps, 'onChange'> {
  label: string;
  contextType: string;
  onValueChange: (value: string) => void;
  useAI?: boolean;
  showSuggestions?: boolean;
}

export const AIAssistedInput: React.FC<AIAssistedInputProps> = ({
  label,
  contextType,
  onValueChange,
  useAI = true,
  showSuggestions = true,
  ...props
}) => {
  const [value, setValue] = useState(props.value?.toString() || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { getSuggestions, completeText } = useAIContext();
  
  // Get suggestions when the input changes
  useEffect(() => {
    if (useAI && showSuggestions && value.length > 0) {
      const fetchSuggestions = async () => {
        const newSuggestions = await getSuggestions(value, contextType);
        setSuggestions(newSuggestions);
      };
      
      const timer = setTimeout(fetchSuggestions, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [value, useAI, showSuggestions, contextType, getSuggestions]);
  
  // Handle value changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange(newValue);
  };
  
  // Apply a suggestion
  const applySuggestion = (suggestion: string) => {
    setValue(suggestion);
    onValueChange(suggestion);
    setSuggestions([]);
  };
  
  // Complete the input
  const handleComplete = async () => {
    if (useAI && value.length > 0) {
      const completed = await completeText(value, contextType);
      setValue(completed);
      onValueChange(completed);
    }
  };
  
  return (
    <div className="relative">
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <input
          {...props}
          type="text"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          value={value}
          onChange={handleChange}
        />
        {useAI && (
          <button
            type="button"
            className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleComplete}
          >
            Complete
          </button>
        )}
      </div>
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-50"
              onClick={() => applySuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### AI Assisted Text Area

Similar to AIAssistedInput but for multi-line text inputs, with additional features like section-by-section AI enhancement.

### Smart Suggestion Buttons

Smart suggestion buttons provide context-aware suggestions for specific actions or content.

```typescript
export interface SmartSuggestionButtonProps {
  contextType: string;
  contextData?: any;
  onSuggestionAccepted: (suggestion: string) => void;
  buttonText?: string;
  buttonClassName?: string;
}

export const SmartSuggestionButton: React.FC<SmartSuggestionButtonProps> = ({
  contextType,
  contextData,
  onSuggestionAccepted,
  buttonText = "Get Suggestion",
  buttonClassName = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSuggestions } = useAIContext();
  
  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const suggestions = await getSuggestions(contextData, contextType);
      
      if (suggestions && suggestions.length > 0) {
        onSuggestionAccepted(suggestions[0]);
      } else {
        setError("No suggestions available");
      }
    } catch (err) {
      setError("Failed to get suggestions");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <button
        type="button"
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${buttonClassName}`}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          buttonText
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
```

### Contextual AI Panels

Contextual AI panels provide in-context assistance and explanations to users.

```typescript
export interface ContextualAIPanelProps {
  contextType: string;
  contextData: any;
  title?: string;
  collapsed?: boolean;
}

export const ContextualAIPanel: React.FC<ContextualAIPanelProps> = ({
  contextType,
  contextData,
  title = "AI Insights",
  collapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getContextualHelp } = useAIContext();
  
  useEffect(() => {
    if (!isCollapsed && !insights) {
      const loadInsights = async () => {
        setIsLoading(true);
        try {
          const help = await getContextualHelp(contextType, contextData);
          setInsights(help);
        } catch (error) {
          console.error("Failed to load AI insights", error);
          setInsights("Unable to load AI insights at this time.");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadInsights();
    }
  }, [isCollapsed, insights, contextType, contextData, getContextualHelp]);
  
  return (
    <div className="bg-blue-50 rounded-lg shadow-sm p-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-blue-800">{title}</h3>
        <button
          type="button"
          className="text-blue-600 hover:text-blue-800"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="mt-2">
          {isLoading ? (
            <div className="flex justify-center">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : insights ? (
            <div className="prose max-w-none text-blue-700">
              {/* Use a markdown component to render insights */}
              <ReactMarkdown>{insights}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-blue-700">No insights available.</p>
          )}
        </div>
      )}
    </div>
  );
};
```

### AI Context Providers

AI context providers make AI capabilities available to React components through the Context API.

```typescript
export interface AIContextValue {
  // Suggestion capabilities
  getSuggestions: (context: any, contextType: string) => Promise<string[]>;
  
  // Text completion
  completeText: (text: string, contextType: string) => Promise<string>;
  
  // Content enhancement
  enhanceContent: (content: string, enhancementType: string) => Promise<string>;
  
  // Contextual help
  getContextualHelp: (contextType: string, contextData: any) => Promise<string>;
  
  // Loading state
  isLoading: boolean;
}

export const AIContext = createContext<AIContextValue>({
  getSuggestions: async () => [],
  completeText: async (text) => text,
  enhanceContent: async (content) => content,
  getContextualHelp: async () => "",
  isLoading: false,
});

export interface AIContextProviderProps {
  children: React.ReactNode;
  feature: string;
}

export const AIContextProvider: React.FC<AIContextProviderProps> = ({
  children,
  feature,
}) => {
  const [aiService, setAIService] = useState<AIServiceInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const aiServiceFactory = useAIServiceFactory();
  
  // Initialize the AI service
  useEffect(() => {
    const initService = async () => {
      try {
        const service = await aiServiceFactory.createService(feature);
        setAIService(service);
      } catch (error) {
        console.error("Failed to initialize AI service", error);
        // Fallback to mock service
        setAIService(new MockAIService(feature));
      }
    };
    
    initService();
  }, [feature, aiServiceFactory]);
  
  // AI context methods
  const getSuggestions = async (context: any, contextType: string): Promise<string[]> => {
    if (!aiService) return [];
    
    setIsLoading(true);
    try {
      const suggestions = await aiService.getSuggestions({ context, contextType });
      return suggestions.map(s => s.text);
    } catch (error) {
      console.error("Error getting suggestions", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  const completeText = async (text: string, contextType: string): Promise<string> => {
    if (!aiService) return text;
    
    setIsLoading(true);
    try {
      return await aiService.completeText(text, contextType);
    } catch (error) {
      console.error("Error completing text", error);
      return text;
    } finally {
      setIsLoading(false);
    }
  };
  
  const enhanceContent = async (content: string, enhancementType: string): Promise<string> => {
    if (!aiService) return content;
    
    setIsLoading(true);
    try {
      const component = {
        id: 'temp',
        idea_id: 'temp',
        component_type: enhancementType,
        content,
        is_selected: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const enhanced = await aiService.enhanceComponent(component, "improve");
      return enhanced.content;
    } catch (error) {
      console.error("Error enhancing content", error);
      return content;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getContextualHelp = async (contextType: string, contextData: any): Promise<string> => {
    if (!aiService) return "";
    
    setIsLoading(true);
    try {
      const suggestions = await aiService.getSuggestions({
        context: contextData,
        contextType: `help_${contextType}`,
      });
      
      return suggestions.length > 0 ? suggestions[0].text : "";
    } catch (error) {
      console.error("Error getting contextual help", error);
      return "";
    } finally {
      setIsLoading(false);
    }
  };
  
  const value: AIContextValue = {
    getSuggestions,
    completeText,
    enhanceContent,
    getContextualHelp,
    isLoading,
  };
  
  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// Custom hook for using the AI context
export const useAIContext = () => useContext(AIContext);
```

## Prompt Engineering

The effectiveness of the AI capabilities depends heavily on well-crafted prompts that guide the language models toward useful responses.

### Prompt Templates

Prompt templates define the structure of prompts used for different AI operations.

```typescript
export interface PromptTemplate {
  system: string;
  user: string;
}

export const IDEA_GENERATION_TEMPLATE: PromptTemplate = {
  system: `
    You are an expert business strategist and innovation consultant with experience across multiple industries.
    Your task is to generate innovative, practical, and market-viable business ideas based on the user's parameters.
    
    For each idea, provide:
    1. A concise title
    2. A brief description (2-3 sentences)
    3. A clear problem statement
    4. A solution concept that addresses the problem
    5. A defined target audience/customer segment
    6. A unique value proposition
    7. A potential business model
    8. A preliminary marketing strategy
    9. A revenue model
    10. A go-to-market approach
    11. An estimate of the potential market size
    
    Ensure that each idea is:
    - Specific and actionable
    - Addresses a real market need
    - Differentiated from obvious competitors
    - Realistic given current technology and market conditions
    - Scalable and potentially profitable
    
    Format your response as JSON object that can be parsed.
  `,
  
  user: `
    Generate {{count
