# New Journey System: Database & Backend Architecture Plan

This document provides the complete technical specification for the database schema, backend services, and API layer for the new Journey System. All entities follow the `new_` naming convention for strict separation from the legacy system.

## 1. Guiding Principles

- **Total Separation**: All database tables are suffixed with `_new`. All services are located in `src/lib/services/new_journey/`. This prevents any accidental interaction with the legacy system.
- **MRD-Driven Schema**: Every table and column directly maps to a functional or non-functional requirement outlined in the MRD/PRD.
- **Service-Oriented**: Logic is encapsulated in services (`new_journey_framework.service.ts`, `new_company_journey.service.ts`, etc.), mirroring the existing application's architecture.
- **Type Safety**: All new database tables and data structures will have corresponding TypeScript interfaces defined in `src/lib/types/new_journey.types.ts`.

---

## 2. Database Schema (Supabase/PostgreSQL)

This schema will be implemented in a new migration file: `supabase/migrations/20250612_create_new_journey_schema.sql`.

### 2.1. Core Framework Tables (Platform-Managed)

These tables define the canonical 150-step framework.

```sql
-- Defines the 5 high-level phases of a startup journey (e.g., Ideation, Validation).
CREATE TABLE journey_phases_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Defines the 8 core business domains (e.g., Strategy, Product, Marketing).
CREATE TABLE journey_domains_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- The canonical 150+ framework steps, managed by the platform.
CREATE TABLE journey_steps_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  primary_phase_id UUID REFERENCES journey_phases_new(id),
  primary_domain_id UUID REFERENCES journey_domains_new(id),
  order_index INTEGER NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('Low', 'Medium', 'High')),
  estimated_days INTEGER DEFAULT 1,
  deliverables TEXT[],
  success_criteria TEXT[],
  guidance_notes TEXT,
  version VARCHAR(20) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2. Company Implementation Tables

These tables store how a specific company customizes and progresses through the journey.

```sql
-- A company's instance of a journey, allowing for future multi-journey support.
CREATE TABLE company_journeys_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(200) DEFAULT 'My First Journey',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A company's specific instance of a step, which can be customized.
CREATE TABLE company_journey_steps_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES company_journeys_new(id),
  framework_step_id UUID REFERENCES journey_steps_new(id), -- Null for fully custom steps
  name VARCHAR(200) NOT NULL,
  description TEXT,
  phase_id UUID REFERENCES journey_phases_new(id),
  domain_id UUID REFERENCES journey_domains_new(id),
  custom_deliverables TEXT[],
  custom_success_criteria TEXT[],
  status VARCHAR(50) DEFAULT 'not_started', -- e.g., not_started, active, complete, skipped
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER,
  is_custom_step BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- The individual tasks within a company's step.
CREATE TABLE step_tasks_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_step_id UUID NOT NULL REFERENCES company_journey_steps_new(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0
);
```

### 2.3. Outcome, Learning & AI Tables

These tables support the advanced features from the MRD, like outcome capture and adaptive suggestions.

```sql
-- Stores the detailed results captured when a company completes a step.
CREATE TABLE step_outcomes_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_step_id UUID NOT NULL REFERENCES company_journey_steps_new(id),
  task_results JSONB NOT NULL DEFAULT '{}', -- {'task_id': 'result_string', ...}
  time_taken_days INTEGER,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  notes TEXT,
  key_learnings TEXT[],
  share_anonymously BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores the AI-generated suggestions based on a step's outcome.
CREATE TABLE adaptive_suggestions_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome_id UUID NOT NULL REFERENCES step_outcomes_new(id),
  suggestion_text TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL, -- e.g., 'low', 'medium', 'high'
  reasoning TEXT,
  shown_to_user BOOLEAN DEFAULT false,
  user_feedback VARCHAR(50), -- e.g., 'accepted', 'dismissed'
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anonymized data for community intelligence features.
CREATE TABLE anonymized_outcomes_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_step_id UUID NOT NULL REFERENCES journey_steps_new(id),
  industry_category VARCHAR(100),
  company_stage VARCHAR(50),
  time_taken_days INTEGER,
  confidence_level INTEGER,
  success_rating INTEGER, -- Could be derived from confidence/feedback
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores conversations with the Standup Bot.
CREATE TABLE standup_sessions_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  company_step_id UUID REFERENCES company_journey_steps_new(id),
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  messages JSONB DEFAULT '[]', -- [{speaker: 'bot'/'user', text: '...', timestamp: '...'}]
  extracted_progress JSONB,
  suggested_actions JSONB
);
```

### 2.4. VC Portfolio Tables

These tables are for the VC Portfolio Management features (MRD Section 2.3.7).

```sql
-- Associates companies with VC firms.
CREATE TABLE vc_portfolios_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vc_firm_id UUID NOT NULL, -- This would reference a 'vc_firms' table
  company_id UUID NOT NULL REFERENCES companies(id),
  -- Controls what level of data the VC firm can see.
  data_sharing_level VARCHAR(20) DEFAULT 'basic' -- e.g., 'basic', 'detailed', 'full'
);

-- Stores aggregated, privacy-safe insights for a VC's portfolio.
CREATE TABLE vc_portfolio_insights_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vc_firm_id UUID NOT NULL,
  total_companies INTEGER,
  average_progress_by_domain JSONB,
  risk_indicators JSONB, -- e.g., { "stalled_steps": 5, "low_confidence": 2 }
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. Backend Services Architecture

All new services will be created within the `src/lib/services/new_journey/` directory.

### 3.1. `new_journey_framework.service.ts`
*   **Responsibility**: Manages the canonical framework data.
*   **Pattern**: Copy `src/lib/services/journeyFramework.service.ts` and adapt all function bodies to query the `_new` tables.
*   **Key Methods**:
    *   `getPhases()`: Fetches from `journey_phases_new`.
    *   `getDomains()`: Fetches from `journey_domains_new`.
    *   `getFrameworkSteps(filters)`: Fetches from `journey_steps_new`.

### 3.2. `new_company_journey.service.ts`
*   **Responsibility**: Manages a company's specific journey instance, steps, and progress.
*   **Pattern**: Create a new service file following the existing service object pattern.
*   **Key Methods**:
    *   `getOrCreateCompanyJourney(companyId)`: Fetches or creates a record in `company_journeys_new`.
    *   `getCompanySteps(journeyId, filters)`: Fetches steps from `company_journey_steps_new`.
    *   `addStepToJourney(journeyId, frameworkStepId)`: Imports a framework step into `company_journey_steps_new`.
    *   `updateStepStatus(companyStepId, status)`: Updates the status in `company_journey_steps_new`.
    *   `getStepTasks(companyStepId)`: Fetches tasks from `step_tasks_new`.
    *   `updateTaskStatus(taskId, isCompleted)`: Updates `step_tasks_new`.

### 3.3. `new_journey_features.service.ts`
*   **Responsibility**: Orchestrates the advanced MRD features (Outcomes, AI, Community).
*   **Pattern**: New service to handle complex, cross-table operations.
*   **Key Methods**:
    *   `captureOutcome(outcomeData)`:
        1.  Validates `outcomeData`.
        2.  Inserts a record into `step_outcomes_new`.
        3.  If `share_anonymously` is true, inserts a record into `anonymized_outcomes_new`.
        4.  Calls `new_journey_ai.service.ts` to generate suggestions.
        5.  Saves suggestions to `adaptive_suggestions_new`.
    *   `getAdaptiveSuggestions(outcomeId)`: Fetches from `adaptive_suggestions_new`.
    *   `getCommunityInsights(frameworkStepId)`: Aggregates data from `anonymized_outcomes_new` to provide benchmarks.
    *   `processStandupMessage(sessionId, message)`:
        1.  Appends message to `standup_sessions_new`.
        2.  Calls `new_journey_ai.service.ts` to analyze the message for task completion keywords.
        3.  Returns suggested actions (e.g., "Mark task X as complete?").

### 3.4. `new_journey_ai.service.ts`
*   **Location**: `src/lib/services/ai/new_journey_ai.service.ts`
*   **Responsibility**: All interactions with third-party AI models.
*   **Pattern**: Abstracted service to allow for future model swapping.
*   **Key Methods**:
    *   `generateAdaptiveSuggestions(outcome)`: Constructs a detailed prompt with outcome data and asks the AI to generate 3-5 actionable next steps.
    *   `analyzeStandupMessage(message)`: Uses function calling or keyword extraction prompts to identify tasks the user claims to have completed.

---

## 4. API Layer & Type Definitions

### 4.1. API Endpoints
While the application will primarily use the Supabase client SDK via these services, conceptual API endpoints that map to the MRD are:

*   `GET /api/new_journey/steps/stats`: Handled by `new_company_journey.service.ts` to get counts of steps by status.
*   `GET /api/new_journey/steps/available`: Handled by `new_journey_framework.service.ts`.
*   `POST /api/new_journey/steps/:stepId/start`: Handled by `new_company_journey.service.ts`.
*   `POST /api/new_journey/steps/:id/outcome`: Handled by `new_journey_features.service.ts`.
*   `WebSocket /ws/new_journey/standup`: Connects to a backend function that uses `new_journey_features.service.ts`.

### 4.2. Type Definitions
A new file `src/lib/types/new_journey.types.ts` will be created to hold all interfaces for the new system.

```typescript
// In src/lib/types/new_journey.types.ts

export interface NewJourneyPhase {
  id: string;
  name: string;
  // ... all columns from journey_phases_new
}

export interface NewJourneyStep {
  id:string;
  name: string;
  // ... all columns from journey_steps_new
}

export interface NewCompanyJourneyStep {
  id: string;
  journey_id: string;
  // ... all columns from company_journey_steps_new
}

export interface NewStepOutcome {
  id: string;
  company_step_id: string;
  // ... all columns from step_outcomes_new
}

// ... and so on for every new table.
```

This foundational plan provides a complete blueprint for the backend. The next plan will detail the frontend architecture that consumes these services and data structures.
