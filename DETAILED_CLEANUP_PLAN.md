# TheWheel Detailed Cleanup Plan

## Phase 1: Foundation (Weeks 1-2)

### 1. Service Layer Consolidation

#### 1.1 Service Registry Implementation

**Steps:**
1. Create service registry pattern
2. Define interfaces for all services
3. Create implementation factory

**Files:**
```
src/lib/services/registry.ts        // New file for service registry
src/lib/services/registry.test.ts  // Tests for registry
```

**Implementation:**
```typescript
// src/lib/services/registry.ts
export interface ServiceRegistry {
  ideaService: IdeaService;
  profileService: ProfileService;
  loggingService: LoggingService;
  analyticsService: AnalyticsService;
  journeyService: JourneyService;
  authService: AuthService;
  standupService: StandupService;
  // ... other services
}

let registry: ServiceRegistry | null = null;

export const getServiceRegistry = (): ServiceRegistry => {
  if (!registry) {
    registry = createServiceRegistry();
  }
  return registry;
};

export const createServiceRegistry = (): ServiceRegistry => ({
  ideaService: new EnhancedIdeaService(),
  profileService: new MultiPersonaProfileService(),
  loggingService: new EnhancedLoggingService(),
  analyticsService: new UnifiedAnalyticsService(),
  journeyService: new JourneyService(),
  authService: new AuthService(),
  standupService: new StandupService(),
  // ... other service implementations
});

// For testing
export const resetServiceRegistry = () => {
  registry = null;
};

export const setMockServiceRegistry = (mockRegistry: Partial<ServiceRegistry>) => {
  registry = {...createServiceRegistry(), ...mockRegistry};
};
```

#### 1.2 Idea Services Consolidation

**Services to Consolidate:**
- `src/lib/services/idea-generation.service.ts`
- `src/lib/services/idea-playground/idea-generation.service.ts`

**Steps:**
1. Create unified interface
2. Implement consolidated service
3. Update references

**Files:**
```
src/lib/services/idea/types.ts           // New interface definitions
src/lib/services/idea/index.ts           // Barrel export file
src/lib/services/idea/idea.service.ts    // Consolidated implementation
src/lib/services/idea/idea.test.ts       // Tests for idea service
```

**Implementation:**
```typescript
// src/lib/services/idea/types.ts
export interface IdeaGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  // ... other options
}

export interface IdeaService {
  generateIdeas(prompt: string, options?: IdeaGenerationOptions): Promise<string[]>;
  saveIdea(idea: any): Promise<any>;
  getIdeas(companyId: string): Promise<any[]>;
  // ... other methods from both services
}
```

```typescript
// src/lib/services/idea/idea.service.ts
import { IdeaService, IdeaGenerationOptions } from './types';
import { supabase } from '../../supabase';
// ... other imports

export class EnhancedIdeaService implements IdeaService {
  // Combine functionality from both services
  // Choose best implementation for each method
  // Ensure proper error handling and typing
}
```

#### 1.3 Profile Services Consolidation

**Services to Consolidate:**
- `src/lib/services/profile.service.ts`
- `src/lib/services/multi-persona-profile.service.ts`

**Steps:**
1. Create unified interface
2. Implement consolidated service with multi-persona capability
3. Update references

**Files:**
```
src/lib/services/profile/types.ts            // Interface definitions
src/lib/services/profile/index.ts            // Barrel export file
src/lib/services/profile/profile.service.ts  // Consolidated implementation
src/lib/services/profile/profile.test.ts     // Tests
```

#### 1.4 Logging Services Consolidation

**Services to Consolidate:**
- `src/lib/services/logging.service.ts`
- `src/lib/services/logging.service.enhanced.ts`

**Steps:**
1. Keep enhanced version as primary implementation
2. Create unified interface
3. Update references

**Files:**
```
src/lib/services/logging/types.ts             // Interface definitions
src/lib/services/logging/index.ts             // Barrel export file
src/lib/services/logging/logging.service.ts   // Enhanced implementation
src/lib/services/logging/logging.test.ts      // Tests
```

#### 1.5 Analytics Services Consolidation

**Services to Consolidate:**
- `src/lib/services/analytics.service.ts`
- `src/lib/services/recommendation/analytics.service.ts`

**Steps:**
1. Create unified interface
2. Implement consolidated service with domain-specific collectors
3. Update references

**Files:**
```
src/lib/services/analytics/types.ts               // Interface definitions
src/lib/services/analytics/index.ts               // Barrel export file
src/lib/services/analytics/analytics.service.ts   // Consolidated implementation
src/lib/services/analytics/analytics.test.ts      // Tests
```

### 2. Type System Enhancements

#### 2.1 Core Data Models

**Steps:**
1. Define comprehensive types for all data models
2. Replace 'any' usage
3. Implement proper error types

**Files:**
```
src/lib/types/index.ts               // Barrel export file
src/lib/types/journey.types.ts       // Journey-related types
src/lib/types/company.types.ts       // Company-related types
src/lib/types/profile.types.ts       // Profile-related types
src/lib/types/idea.types.ts          // Idea-related types
src/lib/types/tools.types.ts         // Tool-related types
src/lib/types/errors.types.ts        // Error types
```

#### 2.2 Service Response Types

**Steps:**
1. Define response types for all services
2. Implement proper error handling

**Files:**
```
src/lib/types/responses.types.ts     // Response type definitions
src/lib/types/errors.types.ts        // Error type definitions
```

**Implementation:**
```typescript
// src/lib/types/responses.types.ts
export interface ServiceResponse<T> {
  data: T | null;
  error: ServiceError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// src/lib/types/errors.types.ts
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  origError?: any;
}

export class ApiError extends Error {
  code: string;
  details?: any;
  origError?: any;
  
  constructor(message: string, code: string, details?: any, origError?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.origError = origError;
    this.name = 'ApiError';
  }
}
```

#### 2.3 Utility Helper Types

**Steps:**
1. Create utility types for common patterns

**Files:**
```
src/lib/types/utils.types.ts         // Utility type definitions
```

**Implementation:**
```typescript
// src/lib/types/utils.types.ts
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
// ... other utility types
```

### 3. Feature Inventory and Triage

#### 3.1 Feature Flagging System Enhancement

**Steps:**
1. Create robust feature flag system
2. Persist flags in database
3. Admin UI improvements

**Files:**
```
src/lib/services/feature-flags/types.ts               // Interface definitions
src/lib/services/feature-flags/index.ts               // Barrel export file
src/lib/services/feature-flags/feature-flags.service.ts // Implementation
src/components/admin/FeatureFlagsManager.tsx         // Enhanced admin UI
```

#### 3.2 Incomplete Features Documentation

**Steps:**
1. Document all incomplete features
2. Prioritize for completion or removal

**Files:**
```
docs/FEATURE_INVENTORY.md           // New documentation file
```

## Phase 2: Component Refactoring (Weeks 3-4)

### 1. Component Library Standardization

#### 1.1 Shadcn/UI + Radix UI Integration

**Steps:**
1. Setup shadcn/ui
2. Create unified UI components
3. Replace existing UI components gradually

**Files:**
```
src/components/ui/                  // Shadcn component library
src/components/ui/button.tsx        // Button component
src/components/ui/card.tsx          // Card component
src/components/ui/input.tsx         // Input component
// ... other UI components
```

#### 1.2 Shared Component Extraction

**Steps:**
1. Identify repeated UI patterns
2. Extract into shared components
3. Replace inline implementations

**Files:**
```
src/components/shared/              // Shared higher-level components
src/components/shared/LoadingSpinner.tsx    // Loading spinner component
src/components/shared/ErrorDisplay.tsx      // Error display component
src/components/shared/EmptyState.tsx        // Empty state component
// ... other shared components
```

### 2. State Management Consolidation

#### 2.1 Zustand Store Restructuring

**Steps:**
1. Refactor existing Zustand stores
2. Create domain-specific stores
3. Implement proper selectors and actions

**Files:**
```
src/lib/stores/                     // Store directory 
src/lib/stores/auth.store.ts        // Auth store
src/lib/stores/journey.store.ts     // Journey store
src/lib/stores/company.store.ts     // Company store
src/lib/stores/ui.store.ts          // UI state store
// ... other domain-specific stores
```

**Implementation:**
```typescript
// src/lib/stores/auth.store.ts
import { create } from 'zustand';
import { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Login logic
      set({ isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  logout: async () => {
    // Logout logic
    set({ user: null, isAuthenticated: false });
  },
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
```

## Phase 3: Business Ops Hub and Journey System (Weeks 5-6)

### 1. Business Ops Hub Completion

#### 1.1 Complete Core Components

**Steps:**
1. Complete ExecutiveSummaryPanel
2. Complete DomainOverviewGrid
3. Complete ToolRecommendationsPanel
4. Complete ProblemBasedToolFinder

**Files:**
```
src/business-ops-hub/components/dashboard/ExecutiveSummaryPanel.tsx
src/business-ops-hub/components/dashboard/DomainOverviewGrid.tsx
src/business-ops-hub/components/dashboard/ToolRecommendationsPanel.tsx
src/business-ops-hub/components/ProblemBasedToolFinder.tsx
```

#### 1.2 Integration with Consolidated Services

**Steps:**
1. Update service references to use service registry
2. Fix type issues
3. Ensure feature flags work correctly

**Files:**
```
src/business-ops-hub/services/       // Update service usage
src/business-ops-hub/components/     // Fix component dependencies
```

### 2. Journey System Improvement

#### 2.1 Complete AI Integration

**Steps:**
1. Complete AI enrichment in JourneyService
2. Implement actual AI answers in JourneyBoardService
3. Complete tool submissions in ToolSubmissionService

**Files:**
```
src/lib/services/journey/company-journey.service.ts
src/lib/services/journey/journey-board.service.ts
src/lib/services/tools/tool-submission.service.ts
```

#### 2.2 Fix Journey UI Components

**Steps:**
1. Complete any placeholder components
2. Ensure proper loading and error states
3. Fix type issues

**Files:**
```
src/components/company/journey/      // Journey UI components
src/pages/company/JourneyPage.tsx     // Journey page
src/pages/company/JourneyChallengeDetailPage.tsx  // Challenge detail page
```

### 3. Standup Feature Preservation

#### 3.1 Update Service References

**Steps:**
1. Update to use consolidated services
2. Fix type issues
3. Ensure compatibility with changes

**Files:**
```
src/lib/services/standup/standup-ai.service.ts
src/lib/services/standup/conversation-memory.service.ts
src/components/standup/          // Standup components
```

## Phase 4: Security and Configuration (Weeks 7-8)

### 1. Environment Variable Management

#### 1.1 Extract Hardcoded Values

**Steps:**
1. Identify all hardcoded configuration
2. Move to environment variables
3. Create configuration validation

**Files:**
```
src/lib/config.ts                  // Configuration management
src/lib/supabaseClient.ts          // Supabase configuration
src/lib/services/openai.ts         // OpenAI configuration
src/lib/services/huggingface-llm.service.ts // HuggingFace configuration
// ... other files with hardcoded values
```

**Implementation:**
```typescript
// src/lib/config.ts
export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  openai: {
    apiKey: string;
    organization?: string;
  };
  huggingface: {
    apiKey?: string;
  };
  // ... other configuration
}

const validateConfig = (config: Partial<AppConfig>): AppConfig => {
  // Validation logic
  if (!config.supabase?.url) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }
  // ... other validation
  
  return config as AppConfig;
};

export const getConfig = (): AppConfig => {
  return validateConfig({
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      organization: import.meta.env.VITE_OPENAI_ORGANIZATION,
    },
    huggingface: {
      apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY,
    },
    // ... other configuration
  });
};
```

### 2. Authentication Improvement

#### 2.1 Enhance Auth Service

**Steps:**
1. Refactor auth service
2. Implement proper session management
3. Fix type issues

**Files:**
```
src/lib/services/auth/types.ts          // Auth types
src/lib/services/auth/auth.service.ts   // Auth service implementation
```

## Phase 5: Testing and Documentation (Weeks 9-10)

### 1. Test Coverage Expansion

#### 1.1 Service Tests

**Steps:**
1. Add unit tests for all services
2. Create test utilities
3. Setup mock services

**Files:**
```
src/lib/services/**/**.test.ts      // Service tests
src/lib/test-utils.ts               // Test utilities
```

#### 1.2 Component Tests

**Steps:**
1. Add tests for critical components
2. Create component test utilities

**Files:**
```
src/components/**/*.test.tsx        // Component tests
src/lib/component-test-utils.tsx    // Component test utilities
```

### 2. Documentation Updates

#### 2.1 Architecture Documentation

**Steps:**
1. Create unified architecture documentation
2. Document service boundaries
3. Create data flow diagrams

**Files:**
```
docs/ARCHITECTURE.md                 // Architecture documentation
docs/SERVICE_BOUNDARIES.md           // Service boundary documentation
docs/DATA_FLOW.md                    // Data flow documentation
```

#### 2.2 Developer Guides

**Steps:**
1. Create onboarding documentation
2. Document coding standards
3. API documentation

**Files:**
```
docs/ONBOARDING.md                   // Onboarding documentation
docs/CODING_STANDARDS.md             // Coding standards documentation
docs/API.md                          // API documentation
```

## Implementation Order

### Week 1: Service Registry and Core Services
1. Implement service registry pattern
2. Consolidate idea services
3. Consolidate profile services

### Week 2: More Services and Type System
1. Consolidate logging services
2. Consolidate analytics services
3. Enhance type system
4. Create feature inventory

### Week 3: Component Library and UI Standardization
1. Setup shadcn/ui components
2. Extract shared components
3. Begin component replacement

### Week 4: State Management and More Components
1. Restructure Zustand stores
2. Continue component replacement
3. Fix component type issues

### Week 5: Business Ops Hub Focus
1. Complete core Business Ops Hub components
2. Integrate with consolidated services
3. Fix type issues

### Week 6: Journey System Focus
1. Complete AI integration in Journey System
2. Fix Journey UI components
3. Update Standup service references

### Week 7: Security and Configuration
1. Extract hardcoded values to environment variables
2. Create configuration validation
3. Update service implementations

### Week 8: Authentication and Final Service Updates
1. Enhance auth service
2. Fix remaining service issues
3. Final service integration

### Week 9: Testing Focus
1. Add service tests
2. Add component tests
3. Create test utilities

### Week 10: Documentation and Finalization
1. Create architecture documentation
2. Create developer guides
3. Final testing and bug fixes

## Progress Tracking

Track progress using the following metrics:

1. **Services Consolidated**: Count of services properly migrated
2. **Components Refactored**: Count of components refactored
3. **Type Coverage**: Percentage of code with proper typing
4. **Test Coverage**: Percentage of code covered by tests
5. **Documentation Completeness**: Percentage of required documentation completed

## Conclusion

This detailed cleanup plan provides a comprehensive approach to transforming TheWheel codebase. By following this structured plan over the course of 10 weeks, you will consolidate duplicate services, improve type safety, enhance component structure, and create proper documentation. The result will be a more maintainable, robust, and scalable codebase that supports the business goals of TheWheel platform.