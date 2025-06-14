# Journey Dashboard Redesign Implementation Plan

## Overview

This document outlines the plan for redesigning the Journey Dashboard to match the wireframes and enhance it with AI-driven content. The plan involves two major components:

1. **UI Redesign**: Refactoring the UI to align with the wireframes for Options 3 and 4
2. **AI Integration**: Implementing an AI-driven content generation system to replace hardcoded data

## Current Issues

1. **UI Mismatch**: The current React implementations do not match the approved wireframes
   - Option 3: Uses tabs instead of side-by-side panels
   - Option 4: Different layout structure than the wireframe's clean tabbed approach
   
2. **Static Content**: Uses hardcoded data instead of dynamic, personalized AI-generated insights

## UI Redesign Plan

### Step 1: Create Standardized Components

#### 1.1 Standardize Sidebar Component (`NewJourneyStepsSidebar.tsx`)
- Replace current `DashboardSidebar.tsx`
- Features:
  - Compact stats grid (4 buttons) with toggle functionality
  - Search + filter functionality
  - Urgent/In Progress/Completed sections
  - Expandable completed section
  - Filter modal
  - Option for compact (Option 4) or standard (Option 3) mode

#### 1.2 Create Expandable Components
- `ExpandableStepCard.tsx`: For "Pick Up Where You Left Off" section
  - Expandable/collapsible functionality
  - Progress bar
  - Next tasks list
  - Action buttons
  
- `ExpandableRecommendationCard.tsx`: For recommendation cards
  - Domain badge/icon
  - "Why" explanation (AI-generated)
  - Peer adoption percentage
  - Expandable details with tools, difficulty, timeline
  
- `BusinessHealthSidebar.tsx`: For Option 3 right panel
  - Domain progress visualization
  - Maturity level indicators
  - Strength/focus areas
  
- `DomainProgressCard.tsx`: For full domain details in Option 4
  - Expanded version with more details
  - Action buttons

### Step 2: Fix Option 3 - "Side-by-Side Panels" Layout

**Wireframe Structure:**
- Left: Steps sidebar (280px)
- Main: Two side-by-side panels
  - Left panel: "Pick Up Where You Left Off" with expandable active step details
  - Right panel: "Recommended Next Steps" with expandable recommendation cards
- Right: Business Health sidebar (300px)

**Implementation Changes:**
1. Remove all tab functionality from `NewJourneyDashboardOption3.tsx`
2. Create side-by-side grid layout in main area using CSS grid or flexbox
3. Implement expandable/collapsible interactions for step details
4. Move business health to right sidebar
5. Update sidebar to match wireframe exactly
6. Add "Browse All Steps" and "Add Custom Step" buttons at the bottom of recommendations panel

### Step 3: Fix Option 4 - "Clean Tabbed" Layout

**Wireframe Structure:**
- Left: Steps sidebar (260px, more compact than Option 3)
- Main: Full-width tabbed interface with 3 tabs:
  - Current Work: Grid of step cards + domain progress + peer insights
  - Recommended Next Steps: Grid of recommendation cards only
  - Business Health: Full domain detail cards

**Implementation Changes:**
1. Fix tab content to match wireframe exactly
2. Remove right sidebar entirely
3. Make sidebar more compact than Option 3
4. Implement proper tab switching with improved styling
5. Create grid layouts for each tab with proper spacing

### Step 4: Update Navigation

- Update `DashboardOptionsNav.tsx` to show clearer labels
- Add descriptions matching wireframe purposes

## AI Integration Plan

### 1. AI Service Architecture

#### 1.1 AI Dashboard Service (`src/lib/services/ai/aiDashboardService.ts`)

```typescript
// Core generation functions
async function generatePickUpWhereLeftOff(companyId: string, contextData?: any): Promise<StepRecommendation[]>;
async function generateRecommendations(companyId: string, limit: number = 3, contextData?: any): Promise<StepRecommendation[]>;
async function generatePeerInsights(companyId: string, domain?: string, contextData?: any): Promise<PeerInsight[]>;
async function generateBusinessHealthSummary(companyId: string): Promise<BusinessHealthSummary>;

// Helper functions
async function generateStepWhyExplanation(stepId: string, companyId: string): Promise<string>;
async function generateDomainStrengthsAndFocusAreas(domainId: string, companyId: string): Promise<DomainAnalysis>;
```

#### 1.2 Types (`src/lib/types/ai-journey.types.ts`)

```typescript
interface StepRecommendation {
  id: string;
  stepId: string;
  name: string;
  description: string;
  domain: string;
  domainId: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string; // AI-generated explanation
  peerAdoptionPercentage: number;
  estimatedTime: string;
  difficulty: string;
  recommendedTools: string[];
  contextSignature: string; // For recommendation persistence
  generatedAt: Date;
  status: 'fresh' | 'active' | 'completed' | 'stale';
}

interface PeerInsight {
  id: string;
  authorProfile: {
    name: string;
    company: string;
    industry: string;
  };
  content: string; // AI-generated insight
  domainId?: string;
  stepId?: string;
  relevanceScore: number;
  generatedAt: Date;
}

interface BusinessHealthSummary {
  overallStatus: 'Healthy' | 'Needs Attention' | 'At Risk';
  domains: DomainSummary[];
  focusRecommendations: string[];
  generatedAt: Date;
}

interface DomainSummary {
  domainId: string;
  name: string;
  maturityLevel: number;
  currentState: 'active_focus' | 'maintaining' | 'future_focus';
  strengths: string[];
  focusAreas: string[];
  stepsEngaged: number;
  timeInvested: number;
}
```

### 2. Recommendation Persistence Strategy

#### 2.1 Database Schema Updates (`supabase/migrations/20250617_ai_recommendations_persistence.sql`)

```sql
-- Create tables for persisting AI-generated content
CREATE TABLE IF NOT EXISTS ai_generated_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  step_id UUID REFERENCES journey_steps(id) ON DELETE SET NULL,
  content JSONB NOT NULL, -- All recommendation data
  context_hash TEXT NOT NULL, -- Hash of company progress state
  status TEXT NOT NULL CHECK (status IN ('fresh', 'active', 'completed', 'stale')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(company_id, step_id, context_hash)
);

CREATE TABLE IF NOT EXISTS ai_generated_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES journey_domains(id) ON DELETE SET NULL,
  step_id UUID REFERENCES journey_steps(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  author_profile JSONB NOT NULL,
  context_hash TEXT NOT NULL,
  relevance_score FLOAT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ai_business_health_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(company_id)
);
```

#### 2.2 Persistence Service (`src/lib/services/ai/aiPersistenceService.ts`)

```typescript
// Core persistence functions
async function saveRecommendation(companyId: string, recommendation: StepRecommendation): Promise<string>;
async function getRecommendations(companyId: string, status?: string, limit?: number): Promise<StepRecommendation[]>;
async function updateRecommendationStatus(id: string, status: 'fresh' | 'active' | 'completed' | 'stale'): Promise<void>;
async function savePeerInsight(companyId: string, insight: PeerInsight): Promise<string>;
async function getPeerInsights(companyId: string, domainId?: string, limit?: number): Promise<PeerInsight[]>;
async function saveBusinessHealthSummary(companyId: string, summary: BusinessHealthSummary): Promise<string>;
async function getBusinessHealthSummary(companyId: string): Promise<BusinessHealthSummary | null>;

// Helper functions
async function generateContextHash(companyId: string): Promise<string>;
async function shouldRegenerateContent(companyId: string, contextHash: string, contentType: string): Promise<boolean>;
```

### 3. OpenAI Integration

#### 3.1 AI Service Implementation (`src/lib/services/ai/openAiService.ts`)

```typescript
// Core OpenAI functions
async function generateRecommendationsWithOpenAI(
  companyData: any, 
  stepData: any,
  progressData: any,
  limit: number = 3
): Promise<StepRecommendation[]>;

async function generatePeerInsightsWithOpenAI(
  companyData: any,
  domainData: any,
  communityData: any,
  limit: number = 3
): Promise<PeerInsight[]>;

async function generateBusinessHealthSummaryWithOpenAI(
  companyData: any,
  progressData: any
): Promise<BusinessHealthSummary>;

// Helper functions
function buildOpenAIPrompt(promptType: string, contextData: any): string;
function parseOpenAIResponse(response: any, responseType: string): any;
```

### 4. Context Data Pipeline

#### 4.1 Context Collector Service (`src/lib/services/ai/contextCollectorService.ts`)

```typescript
// Core context collection
async function collectCompanyContext(companyId: string): Promise<CompanyContext>;
async function collectStepContext(stepId: string): Promise<StepContext>;
async function collectDomainContext(domainId: string): Promise<DomainContext>;
async function collectPeerContext(companyId: string, limit?: number): Promise<PeerContext[]>;

// Types
interface CompanyContext {
  id: string;
  name: string;
  industry: string;
  size: string;
  stage: string;
  foundedDate: Date;
  progressSummary: {
    totalSteps: number;
    completedSteps: number;
    inProgressSteps: number;
    domains: {
      domainId: string;
      maturityLevel: number;
      completionPercentage: number;
    }[];
  };
  recentActivity: {
    stepId: string;
    action: string;
    timestamp: Date;
  }[];
}

interface StepContext {
  id: string;
  name: string;
  description: string;
  domain: string;
  completionStats: {
    totalCompanies: number;
    completionPercentage: number;
    averageTimeToComplete: string;
    commonNextSteps: {
      stepId: string;
      percentage: number;
    }[];
  };
}

interface DomainContext {
  id: string;
  name: string;
  description: string;
  maturityLevels: {
    level: number;
    description: string;
    commonSteps: string[];
  }[];
  commonPatterns: {
    pattern: string;
    frequency: number;
  }[];
}

interface PeerContext {
  companyProfile: {
    industry: string;
    size: string;
    stage: string;
  };
  journeyProgress: {
    domains: {
      domainId: string;
      maturityLevel: number;
    }[];
    completedSteps: string[];
  };
  outcomes: {
    stepId: string;
    outcome: string;
    learnings: string;
  }[];
}
```

### 5. Implementation Phases

#### Phase 1: Skeleton AI Service
- Implement basic service with mock data while UI is being built
- Build database schema for persistence
- Create TypeScript interfaces for all AI-generated content

#### Phase 2: OpenAI Integration
- Implement OpenAI service with prompt engineering
- Build context collection pipeline
- Implement caching and persistence logic

#### Phase 3: UI Integration
- Connect UI components to AI services
- Implement loading states and error handling
- Add refresh functionality for regenerating content

#### Phase 4: Testing & Refinement
- Test with different company profiles
- Refine prompts based on output quality
- Implement feedback mechanism for improving AI responses

## Technical Constraints

1. **Performance Considerations**
   - AI generation should be cached to avoid repeated API calls
   - Use optimistic UI updates to avoid waiting for AI generation
   - Implement background refresh for stale content

2. **Fallback Mechanisms**
   - Always have default content ready if AI generation fails
   - Implement retry logic with exponential backoff
   - Cache last successful generation for emergency fallback

3. **Security & Privacy**
   - No sensitive company data should be sent to OpenAI
   - All prompts should be sanitized of identifiable information
   - All AI-generated content should be reviewed for appropriateness

## Implementation Timeline

1. **Week 1: UI Redesign**
   - Create standardized components
   - Implement Option 3 layout
   - Implement Option 4 layout
   - Update navigation

2. **Week 2: AI Service Foundation**
   - Create database schema
   - Implement service interfaces
   - Build context collection pipeline
   - Create mock implementations

3. **Week 3: OpenAI Integration**
   - Implement OpenAI service
   - Create prompt templates
   - Build response parsers
   - Implement persistence layer

4. **Week 4: Integration & Testing**
   - Connect UI to AI services
   - Implement loading and error states
   - Test with different company profiles
   - Refine and optimize
