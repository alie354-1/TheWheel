# Technical Architecture Document

## 1. System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Application                      │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐    │
│  │    React    │   │   Zustand   │   │     React       │    │
│  │  Components │◄──┤    Store    │◄──┤     Router      │    │
│  └─────────────┘   └─────────────┘   └─────────────────┘    │
│          ▲                 ▲                  ▲             │
└──────────┼─────────────────┼──────────────────┼─────────────┘
           │                 │                  │
┌──────────┼─────────────────┼──────────────────┼─────────────┐
│          │                 │                  │             │
│  ┌───────▼─────┐   ┌───────▼─────┐    ┌───────▼─────────┐   │
│  │   Service   │   │  Feature    │    │     Auth        │   │
│  │    Layer    │   │   Flags     │    │    Service      │   │
│  └─────────────┘   └─────────────┘    └─────────────────┘   │
│          │                 │                  │             │
│  ┌───────▼─────┐   ┌───────▼─────┐    ┌───────▼─────────┐   │
│  │     AI      │   │  Supabase   │    │    OpenAI       │   │
│  │   Service   │◄──┤   Client    │    │     Client      │   │
│  └─────────────┘   └─────────────┘    └─────────────────┘   │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                                                             │
│                        Supabase                             │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐    │
│  │ PostgreSQL  │   │    Auth     │   │     Storage     │    │
│  │  Database   │   │   Service   │   │     Service     │    │
│  └─────────────┘   └─────────────┘   └─────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 System Components

The Wheel99 platform consists of the following major components:

1. **Client Application**: A React-based single-page application that provides the user interface and client-side logic.
2. **Service Layer**: A collection of TypeScript services that handle business logic and external API communication.
3. **AI Services**: Specialized services for AI-assisted features, including idea generation, refinement, and analysis.
4. **Supabase Integration**: Backend-as-a-service providing database, authentication, and storage capabilities.
5. **OpenAI Integration**: External AI service integration for natural language processing and content generation.

### 1.3 Technology Stack

- **Frontend**: React, TypeScript, Zustand, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: OpenAI API
- **Build Tools**: Vite, ESLint, Prettier
- **Deployment**: Vercel (frontend), Supabase Cloud (backend)

## 2. Component Architecture

### 2.1 Frontend Components

#### 2.1.1 Core Components

- **App**: The root component that sets up routing and global providers
- **Layout**: The main layout component that provides consistent structure
- **Router**: Handles navigation between different pages and features

#### 2.1.2 Feature Components

- **Idea Playground**: Components for idea generation and development
  - **Canvas Management**: Components for creating and managing idea canvases
  - **Idea Generation**: Components for AI-assisted idea creation
  - **Idea Refinement**: Components for improving existing ideas
  - **Pathway Components**: Specialized components for different development approaches

- **Admin Features**: Components for system administration
  - **Feature Flags**: UI for managing feature flags
  - **User Management**: Components for user administration

#### 2.1.3 Shared Components

- **UI Components**: Reusable UI elements like buttons, inputs, and cards
- **AI-Assisted Components**: Components that integrate AI capabilities
  - **SmartSuggestionButton**: Provides AI suggestions for form fields
  - **AIAssistedInput**: Text input with integrated AI assistance
  - **AIAssistedTextArea**: Text area with integrated AI assistance
  - **ContextualAIPanel**: Provides context-specific AI guidance

### 2.2 State Management

#### 2.2.1 Zustand Store

The application uses Zustand for state management with the following stores:

- **AuthStore**: Manages authentication state and user information
  ```typescript
  interface AuthState {
    user: User | null;
    isLoading: boolean;
    featureFlags: FeatureFlags;
    setUser: (user: User | null) => void;
    setFeatureFlags: (flags: FeatureFlags) => void;
  }
  ```

- **IdeaPlaygroundStore**: Manages state for the Idea Playground feature
  ```typescript
  interface IdeaPlaygroundState {
    canvases: IdeaPlaygroundCanvas[];
    currentCanvas: IdeaPlaygroundCanvas | null;
    ideas: IdeaPlaygroundIdea[];
    currentIdea: IdeaPlaygroundIdea | null;
    setCurrentCanvas: (canvas: IdeaPlaygroundCanvas | null) => void;
    setCurrentIdea: (idea: IdeaPlaygroundIdea | null) => void;
    // Additional actions...
  }
  ```

#### 2.2.2 Context Providers

React Context is used for specific feature areas:

- **AIContextProvider**: Provides AI capabilities to components
- **IdeaPlaygroundContext**: Provides Idea Playground state and functions
- **StandupContextProvider**: Provides standup-specific AI capabilities

### 2.3 Service Layer

#### 2.3.1 Core Services

- **AuthService**: Handles authentication and user management
- **ProfileService**: Manages user profile information
- **FeatureFlagsService**: Loads and saves feature flag configurations

#### 2.3.2 Feature Services

- **IdeaPlaygroundService**: Manages idea playground functionality
  - Canvas creation and management
  - Idea generation and refinement
  - Component and tag management

- **GeneralLLMService**: Provides general language model capabilities
  - Query handling
  - Context management
  - Response processing

#### 2.3.3 AI Services

- **AIServiceFactory**: Creates appropriate AI service instances
- **MultiTieredAIService**: Implements the AI service interface with tiered capabilities
- **MockAIService**: Provides mock implementations for development and testing

### 2.4 External Integrations

#### 2.4.1 Supabase

- **Authentication**: User authentication and authorization
- **Database**: PostgreSQL database for application data
- **Storage**: File storage for user-generated content
- **Functions**: Serverless functions for complex operations

#### 2.4.2 OpenAI

- **Chat Completions API**: Used for generating and refining ideas
- **Models**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo based on tier

## 3. Data Model

### 3.1 Database Schema

#### 3.1.1 Core Tables

- **profiles**: User profile information
  ```sql
  CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    company_id UUID REFERENCES public.companies(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **companies**: Company information
  ```sql
  CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **app_settings**: Application settings including feature flags
  ```sql
  CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

#### 3.1.2 Idea Playground Tables

- **idea_playground_canvases**: Containers for related ideas
  ```sql
  CREATE TABLE public.idea_playground_canvases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_ideas**: Business ideas with comprehensive details
  ```sql
  CREATE TABLE public.idea_playground_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canvas_id UUID NOT NULL REFERENCES public.idea_playground_canvases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    solution_concept TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    unique_value TEXT NOT NULL,
    business_model TEXT NOT NULL,
    marketing_strategy TEXT NOT NULL,
    revenue_model TEXT NOT NULL,
    go_to_market TEXT NOT NULL,
    market_size TEXT NOT NULL,
    used_company_context BOOLEAN NOT NULL DEFAULT false,
    company_relevance JSONB,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_components**: Modular components of ideas
  ```sql
  CREATE TABLE public.idea_playground_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    component_type TEXT NOT NULL,
    content TEXT NOT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_tags**: Tags for categorizing ideas
  ```sql
  CREATE TABLE public.idea_playground_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_feedback**: Feedback on ideas
  ```sql
  CREATE TABLE public.idea_playground_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

#### 3.1.3 AI-Related Tables

- **llm_query_logs**: Logs of AI queries for analytics and debugging
  ```sql
  CREATE TABLE public.llm_query_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    response_length INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    models_used JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

### 3.2 Database Functions

- **create_idea_playground_canvas**: Creates a new canvas
  ```sql
  CREATE OR REPLACE FUNCTION public.create_idea_playground_canvas(
    p_user_id UUID,
    p_company_id UUID DEFAULT NULL,
    p_name TEXT,
    p_description TEXT DEFAULT NULL
  ) RETURNS UUID AS $$
  DECLARE
    v_canvas_id UUID;
  BEGIN
    INSERT INTO public.idea_playground_canvases (
      user_id,
      company_id,
      name,
      description
    ) VALUES (
      p_user_id,
      p_company_id,
      p_name,
      p_description
    ) RETURNING id INTO v_canvas_id;
    
    RETURN v_canvas_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

- **archive_idea_playground_canvas**: Archives a canvas
  ```sql
  CREATE OR REPLACE FUNCTION public.archive_idea_playground_canvas(
    p_canvas_id UUID
  ) RETURNS BOOLEAN AS $$
  BEGIN
    UPDATE public.idea_playground_canvases
    SET is_archived = true,
        updated_at = NOW()
    WHERE id = p_canvas_id;
    
    RETURN FOUND;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

- **duplicate_idea_playground_idea**: Duplicates an idea with all components
  ```sql
  CREATE OR REPLACE FUNCTION public.duplicate_idea_playground_idea(
    p_idea_id UUID,
    p_new_title TEXT DEFAULT NULL
  ) RETURNS UUID AS $$
  DECLARE
    v_original_idea public.idea_playground_ideas%ROWTYPE;
    v_new_idea_id UUID;
    v_component public.idea_playground_components%ROWTYPE;
    v_tag public.idea_playground_tags%ROWTYPE;
  BEGIN
    -- Get the original idea
    SELECT * INTO v_original_idea
    FROM public.idea_playground_ideas
    WHERE id = p_idea_id;
    
    -- Create a duplicate idea
    INSERT INTO public.idea_playground_ideas (
      canvas_id,
      title,
      description,
      problem_statement,
      solution_concept,
      target_audience,
      unique_value,
      business_model,
      marketing_strategy,
      revenue_model,
      go_to_market,
      market_size,
      used_company_context,
      company_relevance,
      version
    ) VALUES (
      v_original_idea.canvas_id,
      COALESCE(p_new_title, v_original_idea.title || ' (Copy)'),
      v_original_idea.description,
      v_original_idea.problem_statement,
      v_original_idea.solution_concept,
      v_original_idea.target_audience,
      v_original_idea.unique_value,
      v_original_idea.business_model,
      v_original_idea.marketing_strategy,
      v_original_idea.revenue_model,
      v_original_idea.go_to_market,
      v_original_idea.market_size,
      v_original_idea.used_company_context,
      v_original_idea.company_relevance,
      v_original_idea.version
    ) RETURNING id INTO v_new_idea_id;
    
    -- Duplicate components
    FOR v_component IN
      SELECT * FROM public.idea_playground_components
      WHERE idea_id = p_idea_id
    LOOP
      INSERT INTO public.idea_playground_components (
        idea_id,
        component_type,
        content,
        is_selected
      ) VALUES (
        v_new_idea_id,
        v_component.component_type,
        v_component.content,
        v_component.is_selected
      );
    END LOOP;
    
    -- Duplicate tags
    FOR v_tag IN
      SELECT * FROM public.idea_playground_tags
      WHERE idea_id = p_idea_id
    LOOP
      INSERT INTO public.idea_playground_tags (
        idea_id,
        name
      ) VALUES (
        v_new_idea_id,
        v_tag.name
      );
    END LOOP;
    
    RETURN v_new_idea_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

### 3.3 Row-Level Security Policies

- **Canvas Policies**:
  ```sql
  CREATE POLICY "Users can view their own canvases"
    ON public.idea_playground_canvases
    FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can create their own canvases"
    ON public.idea_playground_canvases
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own canvases"
    ON public.idea_playground_canvases
    FOR UPDATE
    USING (auth.uid() = user_id);
  ```

- **Idea Policies**:
  ```sql
  CREATE POLICY "Users can view ideas in their canvases"
    ON public.idea_playground_ideas
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.idea_playground_canvases
        WHERE id = canvas_id AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create ideas in their canvases"
    ON public.idea_playground_ideas
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.idea_playground_canvases
        WHERE id = canvas_id AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update ideas in their canvases"
    ON public.idea_playground_ideas
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.idea_playground_canvases
        WHERE id = canvas_id AND user_id = auth.uid()
      )
    );
  ```

## 4. API Documentation

### 4.1 Service Interfaces

#### 4.1.1 IdeaPlaygroundService

```typescript
interface IdeaPlaygroundService {
  // Canvas Management
  createCanvas(userId: string, name: string, description?: string, companyId?: string): Promise<IdeaPlaygroundCanvas | null>;
  getCanvases(userId: string, includeArchived?: boolean): Promise<IdeaPlaygroundCanvas[]>;
  getCanvas(canvasId: string): Promise<IdeaPlaygroundCanvas | null>;
  updateCanvas(canvasId: string, updates: Partial<IdeaPlaygroundCanvas>): Promise<boolean>;
  archiveCanvas(canvasId: string): Promise<boolean>;
  
  // Idea Management
  generateIdeas(userId: string, canvasId: string, params: IdeaGenerationParams): Promise<IdeaPlaygroundIdea[]>;
  getIdeasForCanvas(canvasId: string, includeArchived?: boolean): Promise<IdeaPlaygroundIdea[]>;
  getIdea(ideaId: string): Promise<IdeaPlaygroundIdea | null>;
  updateIdea(ideaId: string, updates: Partial<IdeaPlaygroundIdea>): Promise<boolean>;
  archiveIdea(ideaId: string): Promise<boolean>;
  duplicateIdea(ideaId: string, newTitle?: string): Promise<IdeaPlaygroundIdea | null>;
  moveIdeaToCanvas(ideaId: string, targetCanvasId: string): Promise<boolean>;
  
  // Component Management
  createComponent(ideaId: string, componentType: string, content: string): Promise<IdeaPlaygroundComponent | null>;
  getComponentsForIdea(ideaId: string, componentType?: string): Promise<IdeaPlaygroundComponent[]>;
  updateComponent(componentId: string, updates: Partial<IdeaPlaygroundComponent>): Promise<boolean>;
  
  // Feedback Management
  createFeedback(ideaId: string, feedback: Partial<IdeaPlaygroundFeedback>): Promise<IdeaPlaygroundFeedback | null>;
  getFeedbackForIdea(ideaId: string): Promise<IdeaPlaygroundFeedback[]>;
  
  // Idea Refinement
  refineIdea(userId: string, params: IdeaRefinementParams): Promise<IdeaPlaygroundIdea | null>;
}
```

#### 4.1.2 AIServiceInterface

```typescript
interface AIServiceInterface {
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

### 4.2 Data Types

#### 4.2.1 Idea Playground Types

```typescript
interface IdeaPlaygroundCanvas {
  id: string;
  user_id: string;
  company_id?: string;
  name: string;
  description?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface IdeaPlaygroundIdea {
  id: string;
  canvas_id: string;
  title: string;
  description: string;
  problem_statement: string;
  solution_concept: string;
  target_audience: string;
  unique_value: string;
  business_model: string;
  marketing_strategy: string;
  revenue_model: string;
  go_to_market: string;
  market_size: string;
  used_company_context: boolean;
  company_relevance?: CompanyRelevance;
  is_archived: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

interface IdeaPlaygroundComponent {
  id: string;
  idea_id: string;
  component_type: string;
  content: string;
  is_selected: boolean;
  created_at: string;
  updated_at: string;
}

interface IdeaPlaygroundTag {
  id: string;
  idea_id: string;
  name: string;
  created_at: string;
}

interface IdeaPlaygroundFeedback {
  id: string;
  idea_id: string;
  feedback_type: string;
  content: string;
  created_at: string;
}
```

#### 4.2.2 AI Service Types

```typescript
interface AIServiceContext {
  userId: string;
  tier: 'free' | 'standard' | 'premium';
  [key: string]: any;
}

interface IdeaGenerationParams {
  count?: number;
  industry?: string;
  target_audience?: string;
  problem_area?: string;
  technology?: string;
  business_model_preference?: string;
  market_size_preference?: string;
  innovation_level?: 'incremental' | 'disruptive' | 'radical';
  resource_constraints?: string[];
  useCompanyContext?: boolean;
}

interface IdeaRefinementParams {
  idea_id: string;
  focus_areas: string[];
  specific_questions?: string[];
  improvement_direction?: string;
}
```

## 5. State Management

### 5.1 Zustand Store

The application uses Zustand for state management, which provides a simple and efficient way to manage global state.

#### 5.1.1 Store Structure

```typescript
// Auth Store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  featureFlags: {},
  setUser: (user) => set({ user }),
  setFeatureFlags: (flags) => set({ featureFlags: flags }),
}));

// Idea Playground Store
export const useIdeaPlaygroundStore = create<IdeaPlaygroundState>((set) => ({
  canvases: [],
  currentCanvas: null,
  ideas: [],
  currentIdea: null,
  setCanvases: (canvases) => set({ canvases }),
  setCurrentCanvas: (currentCanvas) => set({ currentCanvas }),
  setIdeas: (ideas) => set({ ideas }),
  setCurrentIdea: (currentIdea) => set({ currentIdea }),
}));
```

#### 5.1.2 Store Usage

```typescript
// Using the store in components
const { user, featureFlags } = useAuthStore();
const { currentCanvas, setCurrentCanvas } = useIdeaPlaygroundStore();

// Updating the store
setCurrentCanvas(selectedCanvas);
```

### 5.2 Feature Flags

Feature flags are used to control the availability of features and enable/disable functionality.

#### 5.2.1 Feature Flag Structure

```typescript
interface FeatureFlag {
  enabled: boolean;
  visible: boolean;
}

interface FeatureFlags {
  [key: string]: FeatureFlag;
}

// Example feature flags
const defaultFeatureFlags: FeatureFlags = {
  useRealAI: { enabled: false, visible: true },
  useMockAI: { enabled: true, visible: true },
  multiTieredAI: { enabled: false, visible: true },
  enhancedIdeaPlayground: { enabled: false, visible: true },
};
```

#### 5.2.2 Feature Flag Management

```typescript
// Loading feature flags
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

// Saving feature flags
async saveFeatureFlags(flags: Partial<FeatureFlags>): Promise<void> {
  try {
    const { featureFlags } = useAuthStore.getState();
    const updatedFlags = { ...featureFlags };
    
    // Update flags
    Object.entries(flags).forEach(([key, value]) => {
      if (updatedFlags[key]) {
        updatedFlags[key] = { ...updatedFlags[key], ...value };
      } else {
        updatedFlags[key] = value as { enabled: boolean; visible: boolean };
      }
    });
    
    // Save to database
    await supabase
      .from('app_settings')
      .upsert({
        key: 'feature_flags',
        value: updatedFlags,
        updated_at: new Date().toISOString()
      });
    
    // Update store
    const { setFeatureFlags } = useAuthStore.getState();
    setFeatureFlags(updatedFlags);
  } catch (error) {
    console.error('Error saving feature flags:', error);
  }
}
```

## 6. Deployment Architecture

### 6.1 Frontend Deployment

The frontend application is deployed using Vercel, which provides:

- Continuous deployment from Git
- Preview deployments for pull requests
- Global CDN for fast content delivery
- Serverless functions for API endpoints

### 6.2 Backend Deployment

The backend is deployed using Supabase Cloud, which provides:

- PostgreSQL database
- Authentication service
- Storage service
- Realtime subscriptions
- Edge functions

### 6.3 Environment Configuration

The application uses environment variables for configuration:

```
# Frontend environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=your-openai-key

# Backend environment variables (Supabase)
DATABASE_URL=postgres://postgres:postgres@db:5432/postgres
JWT_SECRET=your-jwt-secret
```

## 7. Security Considerations

### 7.1 Authentication and Authorization

- **Authentication**: Supabase Auth provides secure user authentication
- **Authorization**: Row-level security policies control data access
- **JWT Tokens**: Used for secure API communication

### 7.2 Data Protection

- **Encryption**: Sensitive data is encrypted at rest and in transit
- **API Keys**: Stored securely and not exposed to clients
- **Input Validation**: All user inputs are validated before processing

### 7.3 API Security

- **CORS**: Configured to allow only specific origins
- **Rate Limiting**: Prevents abuse of API endpoints
- **Request Validation**: Ensures requests conform to expected formats

### 7.4 AI Service Security

- **Prompt Injection Prevention**: Careful prompt design to prevent injection attacks
- **Content Filtering**: Ensures generated content meets safety standards
- **Usage Monitoring**: Tracks API usage to detect and prevent abuse
