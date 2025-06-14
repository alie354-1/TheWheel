# New Journey System Implementation Plan
**Complete MRD/PRD Implementation with Admin Integration**

## Phase 1: Database Schema & Core Infrastructure (Week 1)

### 1.1 Database Migration
**File:** `supabase/migrations/20250612_new_journey_system_complete.sql`

- Create all new tables with a `_new` suffix to avoid conflicts with the existing system.
- Define tables for phases, domains, the 150 canonical steps, and company-specific journey data.
- Add tables for MRD-specific features: detailed outcome capture, adaptive suggestions, standup bot integration, community intelligence, and VC portfolio management.
- Implement indexes for performance and basic Row Level Security (RLS) policies.

### 1.2 Data Seeding
**File:** `supabase/migrations/20250612_seed_new_journey_framework.sql`

- Seed the 5 MRD phases (Ideation, Validation, Build, Launch, Scale).
- Seed the 8 MRD domains (Strategy, Product, Marketing, etc.).
- Seed a sample of the 150 canonical framework steps with rich content from the MRD.
- Seed sub-tasks for the initial steps to provide a complete example.

### 1.3 Type Definitions
**File:** `src/lib/types/new-journey.types.ts`

- Create a dedicated TypeScript definitions file for the new journey system.
- Define interfaces for all new database tables and data structures (e.g., `NewJourneyStep`, `NewStepOutcome`, `NewAdaptiveSuggestion`).
- Include types for dashboard analytics and AI service configurations.

## Phase 2: Core Services Layer (Week 2)

### 2.1 AI Service Abstraction
**File:** `src/lib/services/ai/newJourneyAI.service.ts`

- Create a flexible AI service class that abstracts the AI provider.
- Implement the initial provider for OpenAI (`gpt-4`), with a clear structure to add other providers (Anthropic, local models) in the future.
- Develop methods for:
    - Generating adaptive suggestions based on step outcomes.
    - Recommending next steps based on company progress.
    - Analyzing standup bot messages to extract progress.
- Include prompt engineering helpers and response parsers.

### 2.2 Framework & Company Journey Services
**File:** `src/lib/services/newJourneyFramework.service.ts`
**File:** `src/lib/services/newCompanyJourney.service.ts`

- Create new services dedicated to the new journey system to ensure separation from the legacy system.
- `newJourneyFramework.service.ts`: Manages the canonical 150-step framework, including fetching phases, domains, and steps.
- `newCompanyJourney.service.ts`: Manages company-specific journeys, including creating journeys, adding/updating steps, and tracking progress.

### 2.3 MRD Feature Services
**File:** `src/lib/services/newJourneyFeatures.service.ts`

- Create a service to handle the logic for the new MRD features.
- **Outcome Service**: Logic for capturing and processing detailed step outcomes.
- **Suggestions Service**: Integrates with the AI service to generate, store, and retrieve adaptive suggestions.
- **Standup Bot Service**: Manages WebSocket connections and orchestrates standup message analysis with the AI service.
- **Community Service**: Handles anonymization of outcome data for community insights.

## Phase 3: Admin Integration (Week 3)

### 3.1 Admin Content Service
**File:** `src/lib/services/admin/newJourneyAdmin.service.ts`

- Create a new admin service to interact with the new journey tables (`_new` suffix).
- Mirror the methods of the existing `journeyContentService` but point to the new tables.
- Include functions for bulk importing and managing the 150 canonical steps.

### 3.2 Extend Existing Admin Components
**Files:**
- `src/pages/admin/journey/PhaseManager.tsx`
- `src/pages/admin/journey/DomainManager.tsx`
- `src/pages/admin/journey/StepTemplateManager.tsx`

- Modify the existing admin components to be system-aware.
- Add a toggle (radio button) to switch between managing the "Legacy Journey System" and the "New Journey System".
- Use conditional logic to call the appropriate service (`journeyContentService` or `newJourneyAdmin.service.ts`) based on the selected system.

### 3.3 New Admin Pages
**File:** `src/pages/admin/newjourney/`

- Create a new directory for admin pages specific to the new journey system.
- **NewStepTemplateManager.tsx**: An enhanced version for managing the 150-step framework with all MRD fields.
- **NewOutcomeAnalytics.tsx**: A dashboard to view and analyze captured step outcomes.
- **NewJourneyAnalytics.tsx**: A high-level analytics dashboard for the new journey system.

### 3.4 Admin Routing
**File:** `src/App.tsx`

- Add new routes under `/admin/new-journey/` to link to the new admin pages.
- Update the main `AdminPanel.tsx` to include navigation links to the new journey system management sections.

## Phase 4: Frontend Implementation (Weeks 4-6)

### 4.1 Dashboard & Core UI
**Files:**
- `src/components/company/newjourney/pages/NewJourneyDashboard.tsx`
- `src/components/company/newjourney/components/DashboardSidebar.tsx`
- `src/components/company/newjourney/components/BrowseStepsTable.tsx`

- Build the main dashboard page based on the MRD wireframes.
- Implement the real-time stats sidebar with filtering capabilities.
- Create the "Browse Available Steps" table with search and filtering, allowing users to add steps to their journey.

### 4.2 Step Detail & Outcome Capture
**Files:**
- `src/components/company/newjourney/pages/StepDetail.tsx`
- `src/components/company/newjourney/components/StepDetailPanels.tsx`
- `src/components/company/newjourney/components/OutcomeCaptureModal.tsx`

- Develop the comprehensive step detail view with all panels from the MRD wireframes (Why This Matters, Deliverables, Dependencies, etc.).
- Build the interactive task list within each step.
- Create the detailed outcome capture modal with fields for metrics, notes, and learnings.

### 4.3 AI & Community Features
**Files:**
- `src/components/company/newjourney/components/AdaptiveSuggestions.tsx`
- `src/components/company/newjourney/components/StandupBotWidget.tsx`
- `src/components/company/newjourney/components/CommunityIntelligencePanel.tsx`

- Integrate the adaptive suggestions component to display AI-generated recommendations.
- Build the WebSocket-based standup bot widget for real-time progress updates.
- Implement the community intelligence panel to show anonymized peer insights.

## Phase 5: Testing & Deployment (Weeks 7-8)

### 5.1 Testing
- **Unit Tests**: Write unit tests for all new services, focusing on data manipulation and AI service integration logic.
- **Integration Tests**: Test the flow of data from the UI to the database, ensuring all components and services work together correctly.
- **End-to-End (E2E) Tests**: Create E2E tests for critical user flows:
    - Starting a new journey.
    - Completing a step and capturing the outcome.
    - Receiving and acting on an adaptive suggestion.
    - Using the standup bot.
- **Admin Interface Testing**: Verify that the admin toggle works correctly and that both systems can be managed without interference.

### 5.2 Deployment & Go-to-Market
- Deploy the new database schema and data seeds to production.
- Deploy the new application code behind a feature flag.
- Enable the feature flag for a select group of beta users as per the GTM strategy.
- Monitor system performance, user engagement, and feedback.
- Execute the full Product Hunt launch and marketing campaigns.
