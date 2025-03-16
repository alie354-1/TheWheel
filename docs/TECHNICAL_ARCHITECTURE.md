# Wheel99 Technical Architecture

## Table of Contents
1. [System Overview](#system-overview)
   - [Architecture Diagram](#architecture-diagram)
   - [Major Components](#major-components)
   - [Technology Stack](#technology-stack)
2. [Component Architecture](#component-architecture)
   - [Core Components](#core-components)
   - [Feature Components](#feature-components)
   - [Service Layer](#service-layer)
   - [Context Providers](#context-providers)
3. [Data Architecture](#data-architecture)
   - [Database Schema](#database-schema)
   - [TypeScript Type Definitions](#typescript-type-definitions)
4. [API Interfaces](#api-interfaces)
   - [Authentication API](#authentication-api)
   - [Idea Playground API](#idea-playground-api)
   - [AI Services API](#ai-services-api)
   - [Feature Flags API](#feature-flags-api)
5. [State Management](#state-management)
   - [Zustand Store](#zustand-store)
   - [React Context](#react-context)
   - [XState State Machines](#xstate-state-machines)
6. [Security Model](#security-model)
   - [Authentication & Authorization](#authentication--authorization)
   - [Data Privacy](#data-privacy)
   - [API Security](#api-security)
   - [Environment Security](#environment-security)

## System Overview

Wheel99 follows a modern web application architecture with clear separation of concerns:

### Architecture Diagram

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

### Major Components

1. **Client Application**: React-based SPA with modular components
   - React components form the UI layer
   - Zustand provides global state management
   - React Router handles navigation

2. **Service Layer**: TypeScript services for business logic
   - Domain-specific services for feature functionality
   - Abstraction layer between UI and data access

3. **AI Services**: Specialized AI capabilities integration
   - Multi-tiered AI service architecture
   - OpenAI API integration
   - Context management and prompt engineering

4. **Supabase Integration**: Backend-as-a-service for database and auth
   - PostgreSQL database
   - Authentication service
   - Storage service for files and assets

5. **OpenAI Integration**: AI services integration
   - API clients for different models
   - Prompt template management
   - Response processing

### Technology Stack

#### Frontend
- **Framework**: React 18
- **Language**: TypeScript 5.0+
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Routing**: React Router 6
- **Form Handling**: React Hook Form
- **UI Components**: Custom components with Headless UI

#### Backend
- **BaaS**: Supabase
- **Database**: PostgreSQL 14
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Serverless Functions**: Supabase Edge Functions

#### AI Integration
- **Provider**: OpenAI API
- **Models**: GPT-4, GPT-3.5-Turbo
- **Integration**: Custom AI service layer

#### Build Tools
- **Bundler**: Vite
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest, React Testing Library

#### Deployment
- **Frontend**: Vercel
- **Backend**: Supabase Cloud

## Component Architecture

### Core Components

- **App**: Root component with routing and global providers
  - Implementation: `App.tsx`
  - Responsibility: Global providers, authentication state, main routing

- **Layout**: Main layout structure
  - Implementation: `Layout.tsx`
  - Responsibility: Header, footer, navigation, content areas

- **Router**: Navigation management
  - Implementation: React Router configuration
  - Responsibility: Route definitions, guards, redirects

### Feature Components

The application is organized into feature-specific components:

#### Idea Playground Components

- **Canvas Management**:
  - `CreateCanvasModal.tsx`: Modal for creating new canvases
  - `CanvasSelector.tsx`: Interface for selecting between canvases

- **Idea Generation**:
  - `IdeaGenerationForm.tsx`: Form for AI-assisted idea generation
  - `IdeaPlaygroundWorkspace.tsx`: Container for the idea workspace
  - `IdeaCaptureScreen.tsx`: Interface for manual idea capture

- **Idea Organization**:
  - `IdeaList.tsx`: Component for displaying idea lists
  - `IdeaCard.tsx`: Card display for individual ideas
  - `IdeaExportModal.tsx`: Interface for exporting ideas

- **Idea Refinement**:
  - `IdeaRefinementForm.tsx`: Form for AI-assisted refinement
  - `SuggestionCard.tsx`: Display component for AI suggestions
  - `SuggestionEditor.tsx`: Interface for editing suggestions
  - `SuggestionMerger.tsx`: Tool for merging multiple suggestions

#### Pathway Components

- **Pathway 1** (Problem-Solution):
  - `ProblemSolutionScreen.tsx`: Interface for problem definition and solution ideation
  - `TargetValueScreen.tsx`: Interface for target audience and value proposition
  - `BusinessModelScreen.tsx`: Interface for business model development
  - `GoToMarketScreen.tsx`: Interface for go-to-market strategy
  - `SuggestionsScreen.tsx`: Display for AI-generated suggestions

- **Pathway 2** (Industry-Based):
  - `IndustrySelectionScreen.tsx`: Interface for industry selection and analysis
  - `IdeaComparisonScreen.tsx`: Interface for comparing multiple approaches
  - `IdeaRefinementScreen.tsx`: Refinement interface for Pathway 2

- **Pathway 3** (Idea Library):
  - `IdeaLibraryScreen.tsx`: Interface for browsing idea templates
  - `IdeaAnalysisScreen.tsx`: Interface for analyzing templates
  - `IdeaRefinementScreen.tsx`: Refinement interface for Pathway 3

#### Enhanced Workflow Components

- **Workspace Components**:
  - `EnhancedWorkspace.tsx`: Container for the enhanced workflow
  - `Dashboard.tsx`: Overview of ideas and progress
  - `NavigationSidebar.tsx`: Navigation through workflow stages

- **Stage Components**:
  - `IdeaGenerationStage.tsx`: Stage for initial idea creation
  - `InitialAssessmentStage.tsx`: Stage for first-pass assessment
  - `DetailedRefinementStage.tsx`: Stage for in-depth refinement
  - `MarketValidationStage.tsx`: Stage for market analysis
  - `BusinessModelStage.tsx`: Stage for business model development
  - `GoToMarketStage.tsx`: Stage for go-to-market planning
  - `CompanyFormationStage.tsx`: Stage for implementation planning

#### Shared Components

- **UI Components**:
  - AI-assisted form inputs (`AIAssistedInput.tsx`, `AIAssistedTextArea.tsx`)
  - Smart suggestion controls (`SmartSuggestionButton.tsx`)
  - Contextual AI panels (`ContextualAIPanel.tsx`)
  - Shared idea components (`BaseIdeaCard.tsx`, `BaseSuggestionCard.tsx`)

- **Utility Components**:
  - Onboarding components (`OnboardingTutorial.tsx`, `OnboardingContent.tsx`, `OnboardingWizard.tsx`)
  - Feature flag controls (`FeatureFlagsToggle.tsx`)

### Service Layer

#### Core Services

- **AuthService**: Authentication management
  - Implementation: `auth.service.ts`
  - Functionality: User sign-up, sign-in, session management
  - Mock Implementation: `mock-auth.service.ts`

- **ProfileService**: User profile management
  - Implementation: `profile.service.ts`
  - Functionality: Profile creation, retrieval, updates
  - Mock Implementation: `mock-profile.service.ts`

- **FeatureFlagsService**: Feature management
  - Implementation: `feature-flags.service.ts`
  - Functionality: Flag loading, toggling, user-specific access
  - Mock Implementation: N/A

#### Feature Services

- **IdeaPlaygroundService**: Core idea management
  - Implementation: `idea-playground.service.ts`
  - Functionality: Canvas and idea CRUD operations, component management
  - Mock Implementation: `mock-idea-playground.service.ts`

- **GeneralLLMService**: Language model integration
  - Implementation: `general-llm.service.ts`
  - Functionality: OpenAI API communication, context management
  - Mock Implementation: `mock-general-llm.service.ts`

#### AI Services

- **AIServiceFactory**: Service creation based on configuration
  - Implementation: `ai-service.factory.ts`
  - Functionality: Service instance management based on configuration

- **MultiTieredAIService**: Tiered AI capabilities
  - Implementation: `multi-tiered-ai.service.ts`
  - Functionality: Model selection based on user tier
  - Mock Implementation: `mock-ai.service.ts`

- **StandupService**: AI for standup interactions
  - Implementation: `standup-ai.service.ts`
  - Functionality: Standup feedback, summarization, task generation
  - Mock Implementation: Included in general mock service

### Context Providers

- **AIContextProvider**: AI capabilities for components
  - Implementation: `ai-context-provider.tsx`
  - Functionality: Smart suggestions, contextual help
  - Base Implementation: `BaseAIContextProvider.tsx`

- **IdeaPlaygroundContext**: Idea playground state and functions
  - Implementation: `IdeaPlaygroundContext.tsx`
  - Functionality: Workflow management, stage transitions

- **StandupContextProvider**: Standup-specific AI capabilities
  - Implementation: `standup-context-provider.tsx`
  - Functionality: Feedback generation, summary creation
  - Base Implementation: Extends `BaseAIContextProvider.tsx`

## Data Architecture

### Database Schema

The database is implemented in PostgreSQL via Supabase with the following key tables:

#### Core Tables

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

#### Idea Playground Tables

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

- **idea_playground_ideas**: Business ideas with details
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
    status TEXT,
    current_stage_id TEXT,
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
    rating INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_tags**: Tags for categorizing ideas
  ```sql
  CREATE TABLE public.idea_playground_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_idea_tags**: Many-to-many relationship between ideas and tags
  ```sql
  CREATE TABLE public.idea_playground_idea_tags (
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.idea_playground_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (idea_id, tag_id)
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

#### Enhanced Workflow Tables

- **idea_playground_stages**: Stages in the idea development workflow
  ```sql
  CREATE TABLE public.idea_playground_stages (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
  );
  ```

- **idea_playground_progress**: Tracking progress through stages
  ```sql
  CREATE TABLE public.idea_playground_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL REFERENCES public.idea_playground_stages(id),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completion_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

#### Additional Workflow Tables

- **idea_playground_validation_experiments**: Experiments for idea validation
  ```sql
  CREATE TABLE public.idea_playground_validation_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    methodology TEXT NOT NULL,
    success_criteria TEXT NOT NULL,
    results TEXT,
    is_successful BOOLEAN,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_customer_segments**: Customer segment definitions
  ```sql
  CREATE TABLE public.idea_playground_customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    pain_points TEXT NOT NULL,
    needs TEXT NOT NULL,
    demographics JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_competitors**: Competitor analysis
  ```sql
  CREATE TABLE public.idea_playground_competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    strengths TEXT,
    weaknesses TEXT,
    market_share TEXT,
    pricing_model TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_business_models**: Business model details
  ```sql
  CREATE TABLE public.idea_playground_business_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    revenue_streams TEXT[] NOT NULL,
    cost_structure TEXT[] NOT NULL,
    key_resources TEXT[] NOT NULL,
    key_activities TEXT[] NOT NULL,
    key_partners TEXT[],
    channels TEXT[],
    customer_relationships TEXT[],
    unit_economics JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

- **idea_playground_milestones**: Implementation milestones
  ```sql
  CREATE TABLE public.idea_playground_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id UUID NOT NULL REFERENCES public.idea_playground_ideas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    target_date TIMESTAMPTZ,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completion_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

#### AI-Related Tables

- **llm_query_logs**: Logs of AI queries
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

### TypeScript Type Definitions

The type system is well-defined with interfaces that match the database schema:

```typescript
// Core Canvas and Idea types
export interface IdeaPlaygroundCanvas {
  id: string;
  user_id: string;
  company_id?: string;
  name: string;
  description?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundIdea {
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
  status?: string;
  current_stage_id?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

// Component and Tag types
export interface IdeaPlaygroundComponent {
  id: string;
  idea_id: string;
  component_type: string;
  content: string;
  is_selected: boolean;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IdeaPlaygroundTag {
  id: string;
  name: string;
  created_at: string;
}

// Enhanced workflow types
export interface IdeaPlaygroundStage {
  id: string;
  key: string;
  name: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at?: string;
}

export interface IdeaPlaygroundProgress {
  id: string;
  idea_id: string;
  stage_id: string;
  is_completed: boolean;
  completion_data?: any;
  created_at: string;
  updated_at: string;
}

// Parameter types for API calls
export interface IdeaGenerationParams {
  topic?: string;
  industry?: string;
  problem_area?: string;
  target_audience?: string;
  technology?: string;
  business_model_preference?: string;
  market_size_preference?: string;
  innovation_level?: string;
  resource_constraints?: string[];
  count?: number;
  useCompanyContext?: boolean;
  market_focus?: 'existing' | 'adjacent' | 'new';
}

export interface IdeaRefinementParams {
  idea_id: string;
  focus_areas: ('problem' | 'solution' | 'market' | 'business_model' | 'go_to_market')[];
  specific_questions?: string[];
  improvement_direction?: string;
  detailed_feedback?: string;
}

// Additional business logic types
export interface CompanyRelevance {
  existingMarkets: string[];
  customerSynergies: string[];
  complementaryProducts: string[];
  strategicFit: string;
}
```

## API Interfaces

### Authentication API

The Authentication API is implemented through Supabase's Auth service and provides the following endpoints:

#### User Management

- **Sign Up**: Create a new user account
  ```typescript
  async signUp(email: string, password: string): Promise<AuthResponse>
  ```

- **Sign In**: Authenticate an existing user
  ```typescript
  async signIn(email: string, password: string): Promise<AuthResponse>
  ```

- **Sign Out**: End a user session
  ```typescript
  async signOut(): Promise<void>
  ```

- **Reset Password**: Initiate password reset process
  ```typescript
  async resetPassword(email: string): Promise<ResetPasswordResponse>
  ```

#### Session Management

- **Get Session**: Retrieve the current user session
  ```typescript
  async getSession(): Promise<Session | null>
  ```

- **Refresh Session**: Refresh an existing session
  ```typescript
  async refreshSession(): Promise<Session>
  ```

- **Get User**: Get the current authenticated user
  ```typescript
  async getUser(): Promise<User | null>
  ```

### Idea Playground API

The Idea Playground API provides endpoints for managing canvases, ideas, and related components:

#### Canvas Management

- **Create Canvas**: Create a new idea canvas
  ```typescript
  async createCanvas(data: CreateCanvasParams): Promise<IdeaPlaygroundCanvas>
  ```

- **Get Canvases**: Get all canvases for the current user
  ```typescript
  async getCanvases(): Promise<IdeaPlaygroundCanvas[]>
  ```

- **Update Canvas**: Update an existing canvas
  ```typescript
  async updateCanvas(id: string, data: UpdateCanvasParams): Promise<IdeaPlaygroundCanvas>
  ```

- **Archive Canvas**: Archive a canvas
  ```typescript
  async archiveCanvas(id: string): Promise<void>
  ```

#### Idea Management

- **Generate Ideas**: Generate new ideas using AI
  ```typescript
  async generateIdeas(params: IdeaGenerationParams): Promise<IdeaPlaygroundIdea[]>
  ```

- **Create Idea**: Create a new idea manually
  ```typescript
  async createIdea(data: CreateIdeaParams): Promise<IdeaPlaygroundIdea>
  ```

- **Get Ideas**: Get all ideas for a canvas
  ```typescript
  async getIdeas(canvasId: string): Promise<IdeaPlaygroundIdea[]>
  ```

- **Update Idea**: Update an existing idea
  ```typescript
  async updateIdea(id: string, data: UpdateIdeaParams): Promise<IdeaPlaygroundIdea>
  ```

- **Refine Idea**: Refine specific aspects of an idea
  ```typescript
  async refineIdea(params: IdeaRefinementParams): Promise<IdeaRefinementResult>
  ```

#### Component Management

- **Create Component**: Create a new idea component
  ```typescript
  async createComponent(data: CreateComponentParams): Promise<IdeaPlaygroundComponent>
  ```

- **Get Components**: Get all components for an idea
  ```typescript
  async getComponents(ideaId: string): Promise<IdeaPlaygroundComponent[]>
  ```

- **Update Component**: Update an existing component
  ```typescript
  async updateComponent(id: string, data: UpdateComponentParams): Promise<IdeaPlaygroundComponent>
  ```

#### Workflow Management

- **Get Stages**: Get all stages in the idea workflow
  ```typescript
  async getStages(): Promise<IdeaPlaygroundStage[]>
  ```

- **Update Idea Stage**: Update the current stage of an idea
  ```typescript
  async updateIdeaStage(ideaId: string, stageId: string): Promise<void>
  ```

- **Complete Stage**: Mark a stage as completed for an idea
  ```typescript
  async completeStage(ideaId: string, stageId: string, data?: any): Promise<void>
  ```

- **Get Idea Progress**: Get progress tracking for an idea
  ```typescript
  async getIdeaProgress(ideaId: string): Promise<IdeaPlaygroundProgress[]>
  ```

### AI Services API

The AI Services API provides endpoints for interacting with AI capabilities:

#### General LLM Service

- **Generate Text**: Generate text using language models
  ```typescript
  async generateText(prompt: string, options?: GenerateTextOptions): Promise<string>
  ```

- **Generate With Structure**: Generate text with structured output
  ```typescript
  async generateWithStructure<T>(prompt: string, schema: Schema<T>, options?: GenerateOptions): Promise<T>
  ```

- **Generate Variations**: Generate multiple variations
  ```typescript
  async generateVariations(prompt: string, count: number, options?: GenerateOptions): Promise<string[]>
  ```

#### AI Context Provider

- **Get Suggestions**: Get suggestions for a given input
  ```typescript
  async getSuggestions(text: string, contextType: string): Promise<string[]>
  ```

- **Get Contextual Help**: Get contextual help for a UI element
  ```typescript
  async getContextualHelp(elementId: string, currentState: any): Promise<string>
  ```

- **Enhance Content**: Enhance existing content
  ```typescript
  async enhanceContent(content: string, enhancementType: string): Promise<string>
  ```

### Feature Flags API

The Feature Flags API provides endpoints for managing feature flags:

#### Flag Management

- **Get Feature Flags**: Get all feature flags
  ```typescript
  async getFeatureFlags(): Promise<FeatureFlags>
  ```

- **Update Feature Flag**: Update a feature flag
  ```typescript
  async updateFeatureFlag(key: string, value: boolean): Promise<void>
  ```

- **Is Feature Enabled**: Check if a feature is enabled
  ```typescript
  async isFeatureEnabled(key: string): Promise<boolean>
  ```

## State Management

Wheel99 uses a combination of Zustand, React Context, and XState for state management.

### Zustand Store

Zustand is used for global application state that needs to be accessed across different components. The store is defined in `src/lib/store.ts`:

```typescript
interface AppState {
  // User state
  user: User | null;
  profile: Profile | null;
  
  // Feature flag state
  featureFlags: Record<string, boolean>;
  
  // UI state
  activeIdea: string | null;
  sidebarOpen: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setFeatureFlags: (flags: Record<string, boolean>) => void;
  setActiveIdea: (ideaId: string | null) => void;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  profile: null,
  featureFlags: {},
  activeIdea: null,
  sidebarOpen: true,
  
  // Actions
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setFeatureFlags: (flags) => set({ featureFlags: flags }),
  setActiveIdea: (ideaId) => set({ activeIdea: ideaId }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

#### Store Selectors

Selectors are used to derive specific parts of the state:

```typescript
// Select user with profile
export const useUserWithProfile = () => 
  useStore(state => ({ 
    user: state.user, 
    profile
