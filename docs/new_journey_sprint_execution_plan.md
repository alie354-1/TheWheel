# New Journey System: 8-Week Sprint Execution Plan

This document provides a detailed, week-by-week execution plan for building the new Journey System. It integrates the tasks outlined in the Database, Frontend, MRD Features, and Admin Integration plans into a cohesive 8-week timeline.

## Phase 1: Backend Foundation & Core Services (Weeks 1-2)

**Goal**: Establish a rock-solid backend, including the database schema and all foundational data access services.

### Week 1: Database, Types, and Framework Service
- **Day 1**:
    - **Task**: Create the database migration file.
    - **File**: `supabase/migrations/20250612_create_new_journey_schema.sql`.
    - **Action**: Write the SQL for all `_new` tables as specified in the Database & Backend Plan. Run the migration.
- **Day 2**:
    - **Task**: Create the data seeding script.
    - **File**: `supabase/migrations/20250613_seed_new_journey_data.sql`.
    - **Action**: Write SQL `INSERT` statements to populate `journey_phases_new`, `journey_domains_new`, and `journey_steps_new` with initial framework data.
- **Day 3**:
    - **Task**: Define all new TypeScript types.
    - **File**: `src/lib/types/new_journey.types.ts`.
    - **Action**: Create an interface for every new table (e.g., `NewJourneyPhase`, `NewCompanyJourneyStep`).
- **Day 4-5**:
    - **Task**: Build the framework and company journey services.
    - **Files**: `src/lib/services/new_journey/new_journey_framework.service.ts`, `src/lib/services/new_journey/new_company_journey.service.ts`.
    - **Action**: Implement all methods specified in the backend plan, ensuring they correctly query the `_new` tables.

### Week 2: Advanced Feature Services & AI Layer
- **Day 1-2**:
    - **Task**: Build the AI Abstraction Layer.
    - **File**: `src/lib/services/ai/new_journey_ai.service.ts`.
    - **Action**: Implement the service with methods for `generateAdaptiveSuggestions` and `analyzeStandupMessage`, including prompt engineering.
- **Day 3-4**:
    - **Task**: Build the MRD Features Service.
    - **File**: `src/lib/services/new_journey/new_journey_features.service.ts`.
    - **Action**: Implement the `captureOutcome` and `processStandupMessage` methods, orchestrating calls to the database and the new AI service.
- **Day 5**:
    - **Task**: Unit Testing.
    - **Action**: Write unit tests for all new services, mocking database and AI calls to verify business logic.

## Phase 2: Admin & Frontend Foundation (Weeks 3-4)

**Goal**: Integrate with the admin panel and build the core frontend pages and navigation.

### Week 3: Admin Panel Integration
- **Day 1-2**:
    - **Task**: Build the new Admin Service.
    - **File**: `src/lib/services/admin/new_journey_admin.service.ts`.
    - **Action**: Implement all data management methods (`getPhases`, `upsertDomain`, etc.) that target the `_new` tables.
- **Day 3-4**:
    - **Task**: Make existing admin components "System-Aware".
    - **Files**: `PhaseManager.tsx`, `DomainManager.tsx`, `StepTemplateManager.tsx`.
    - **Action**: Add the state toggle and conditional logic to call the appropriate service based on user selection.
- **Day 5**:
    - **Task**: Build and route the new admin analytics pages.
    - **Files**: `NewJourneyAnalytics.tsx`, `NewOutcomeAnalytics.tsx`, `AdminPanel.tsx`, `App.tsx`.
    - **Action**: Create the new components and add the routes and navigation links.

### Week 4: Core Frontend Pages & Routing
- **Day 1**:
    - **Task**: Set up the new module's directory and router.
    - **Directory**: `src/components/company/new_journey/`.
    - **File**: `NewJourneyRouter.tsx`.
    - **Action**: Create the file structure and define the routes for the dashboard, browse, and step detail pages. Integrate the router into `App.tsx`.
- **Day 2-3**:
    - **Task**: Build the hooks for the main pages.
    - **Files**: `useNewJourneyDashboard.ts`, `useBrowseSteps.ts`.
    - **Action**: Implement the data-fetching logic as specified in the frontend plan.
- **Day 4-5**:
    - **Task**: Build the main dashboard and browse pages.
    - **Files**: `NewJourneyDashboard.tsx`, `BrowseStepsPage.tsx`, and their child components (`DashboardSidebar`, `BrowseStepsTable`, etc.).
    - **Action**: Create the components and have them consume the data from the new hooks.

## Phase 3: Core User Experience (Weeks 5-6)

**Goal**: Build the step detail view and the interactive feature components.

### Week 5: Step Detail Experience
- **Day 1-2**:
    - **Task**: Build the Step Detail hook and page.
    - **Files**: `useStepDetails.ts`, `StepDetailPage.tsx`.
    - **Action**: Implement the hook to fetch all data for a single step and build the page component to display it.
- **Day 3-5**:
    - **Task**: Build the Step Detail Panels.
    - **File**: `StepDetailPanels.tsx`.
    - **Action**: Create all the individual panels (Why This Matters, Deliverables, etc.), including the `InteractiveTaskList` with its checkbox functionality.

### Week 6: Interactive Feature Components
- **Day 1-2**:
    - **Task**: Build the Outcome Capture Modal.
    - **Files**: `useOutcomeCapture.ts`, `OutcomeCaptureModal.tsx`.
    - **Action**: Implement the hook and the modal form.
- **Day 3**:
    - **Task**: Build the Adaptive Suggestions component.
    - **File**: `AdaptiveSuggestions.tsx`.
    - **Action**: Create the component to display suggestions within the outcome modal.
- **Day 4-5**:
    - **Task**: Build the Standup Bot.
    - **File**: `StandupBotWidget.tsx`.
    - **Action**: Implement the chat UI and the WebSocket connection logic.

## Phase 4: Testing, Polish, and Launch (Weeks 7-8)

**Goal**: Ensure a high-quality, bug-free launch.

### Week 7: End-to-End Testing & Optimization
- **Day 1-2**:
    - **Task**: Integration Testing.
    - **Action**: Write tests that cover the full flow from UI interaction to backend service call and database update. Test the "system-aware" admin components thoroughly.
- **Day 3-4**:
    - **Task**: User Acceptance Testing (UAT).
    - **Action**: Manually go through every user story and wireframe. Test all edge cases (e.g., no data, API errors).
- **Day 5**:
    - **Task**: Performance Optimization.
    - **Action**: Use browser dev tools to identify slow components or queries. Add database indexes where necessary.

### Week 8: Launch Preparation
- **Day 1**:
    - **Task**: Final Bug Bash.
    - **Action**: Address all P0 and P1 bugs found during testing.
- **Day 2**:
    - **Task**: Documentation Review.
    - **Action**: Ensure all code is commented and all plans are up-to-date.
- **Day 3**:
    - **Task**: Feature Flag Implementation.
    - **Action**: Wrap the `NewJourneyRouter` in `App.tsx` with a feature flag from your provider.
- **Day 4**:
    - **Task**: Production Deployment.
    - **Action**: Merge all code to the main branch. Run database migrations. Deploy the application.
- **Day 5**:
    - **Task**: Beta Launch & Monitoring.
    - **Action**: Enable the feature flag for the initial beta cohort. Closely monitor error logs, performance dashboards, and user feedback channels.
