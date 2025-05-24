# The Wheel: Full Technical Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Directory Structure](#directory-structure)
4. [Core Modules](#core-modules)
    - [Idea Playground / Idea Hub](#idea-playground--idea-hub)
    - [Onboarding](#onboarding)
    - [Tasks](#tasks)
    - [Analytics & Visualization](#analytics--visualization)
    - [Business Operations Hub](#business-operations-hub)
    - [Supporting Infrastructure](#supporting-infrastructure)
5. [Data Models & Migrations](#data-models--migrations)
6. [API & Service Layer](#api--service-layer)
7. [User Flows & Feature Maps](#user-flows--feature-maps)
8. [Known Technical Debt & Cleanup Recommendations](#known-technical-debt--cleanup-recommendations)
9. [Appendix: File/Component Index](#appendix-filecomponent-index)

---

## 1. Project Overview

_The Wheel_ is a modular, extensible platform for business operations, idea management, onboarding, analytics, and more. It is built with a modern TypeScript/React frontend, a Supabase/Postgres backend, and a service-oriented architecture.

---

## 2. High-Level Architecture

- **Frontend:** React (TypeScript), modular component structure, context/state management, hooks, and service layers.
- **Backend:** Supabase (Postgres), with extensive SQL migrations, RLS, and custom functions.
- **State Management:** Context providers, stores, and hooks (some duplication exists).
- **Feature Areas:** Idea management, onboarding, tasks, analytics, business operations, terminology, and more.
- **Documentation:** Extensive markdown docs, migration plans, and implementation guides.

---

## 3. Directory Structure

- `src/components/` — UI components, grouped by feature (idea-playground, onboarding, tasks, analytics, company, business-ops-hub, etc.)
- `src/lib/` — Shared types, hooks, services, stores, and utilities.
- `src/pages/` — Top-level pages/routes.
- `src/enhanced-idea-hub/` — Enhanced/experimental idea hub modules.
- `supabase/migrations/` — SQL migrations for schema evolution.
- `docs/` — Implementation plans, user guides, technical docs, and sprint plans.
- `scripts/` — Utility scripts for data migration, seeding, and testing.
- `public/` — Static assets and HTML files.
- `tests/` — Unit and integration tests.

---

## 4. Core Modules

### Idea Playground / Idea Hub

**Overall Purpose & Architecture:**
The Idea Playground / Idea Hub is a core feature set designed for ideation, development, and management of business concepts. It appears to have evolved through several iterations, resulting in multiple pathways, experimental features, and a mix of state management strategies. The general architecture involves:
-   UI components for capturing, displaying, refining, and organizing ideas.
-   Multiple "pathways" or workflows for guiding users through different ideation processes.
-   An "enhanced" version that seems to incorporate more advanced features like multi-stage AI and complex state machines.
-   Services for AI-driven suggestions, data persistence (likely via Supabase), and business logic.
-   Contexts and stores for managing application state related to ideas.

**Key Directories and Their Roles (Detailed):**

1.  **`src/components/idea-playground/`**: Primary container for UI components related to the various idea generation and refinement pathways.
    *   **`pathway1/`**: Implements a specific ideation workflow.
        *   `BusinessModelScreen.tsx`: UI for defining/refining the business model for an idea.
        *   `GoToMarketScreen.tsx`: UI for planning go-to-market strategies.
        *   `IdeaCaptureScreen.tsx`: Initial screen for capturing basic idea details. (Open in editor)
        *   `ProblemSolutionScreen.tsx`: UI for detailing the problem and proposed solution.
        *   `SuggestionCard.tsx`: Displays an AI-generated or user suggestion.
        *   `SuggestionEditor.tsx`: Allows editing of suggestions. (Has `.backup` file - **Cleanup Candidate**)
        *   `SuggestionMerger.tsx`: UI for merging multiple suggestions or ideas. (Has `.backup` file - **Cleanup Candidate**)
        *   `SuggestionsScreen.tsx`: Displays a list of suggestions for an idea. (Has `.backup` file - **Cleanup Candidate**)
        *   `TargetValueScreen.tsx`: UI for defining the target value proposition.
    *   **`pathway2/`**: Implements another distinct ideation workflow.
        *   `IdeaComparisonScreen.tsx`: UI for comparing multiple ideas side-by-side.
        *   `IdeaRefinementScreen.tsx`: UI for detailed refinement of an idea within this pathway.
        *   `IndustrySelectionScreen.tsx`: UI for selecting or defining the industry for an idea.
    *   **`pathway3/`**: Implements a third ideation workflow.
        *   `IdeaAnalysisScreen.tsx`: UI for analyzing an idea based on various criteria.
        *   `IdeaLibraryScreen.tsx`: UI for browsing or managing a library of ideas.
        *   `IdeaRefinementScreen.tsx`: UI for detailed refinement within this pathway (potential overlap with Pathway 2's `IdeaRefinementScreen.tsx` - **Review for Consolidation**).
    *   **`enhanced/`**: Houses components for a more advanced or refactored version of the Idea Playground. This appears to be a more structured, stage-based approach.
        *   `components/`:
            *   `Dashboard.tsx`: Dashboard specific to the enhanced idea playground.
            *   `EnhancedWorkspace.tsx`: Main workspace UI, likely hosting different stages.
            *   `NavigationSidebar.tsx`: Sidebar for navigating enhanced playground features/stages.
            *   `stages/`: Stage-specific components for a multi-stage workflow:
                *   `BusinessModelStage.tsx`
                *   `CompanyFormationStage.tsx`
                *   `DetailedRefinementStage.tsx`
                *   `GoToMarketStage.tsx`
                *   `IdeaGenerationStage.tsx`
                *   `InitialAssessmentStage.tsx`
                *   `MarketValidationStage.tsx`
        *   `context/IdeaPlaygroundContext.tsx`: React Context for state management within this enhanced version.
        *   `services/`:
            *   `ai-service.factory.ts`: Factory for creating AI service instances.
            *   `ai-service.interface.ts`: Interface for AI services.
            *   `mock-ai.service.ts`: Mock implementation for AI services (for testing/dev).
            *   `multi-tiered-ai.service.ts`: Potentially a more complex AI service implementation.
        *   `state/idea-workflow.machine.ts`: Likely XState or similar for managing complex workflow states in the enhanced playground.
    *   **`landing/LandingPage.tsx`**: Entry page for the Idea Playground.
    *   **`shared/`**: Components potentially used across different pathways or versions.
        *   `ContextualAIPanel.tsx`: A panel for AI-driven contextual help or suggestions.
        *   `ExternalToolsIntegration.tsx`: Component for integrating external tools.
        *   `IdeaDashboard.tsx`: A generic idea dashboard.
        *   `IdeaExportModal.tsx`: Modal for exporting idea data.
        *   `OnboardingContent.tsx` & `OnboardingTutorial.tsx`: Onboarding elements specific to the idea playground.
        *   `SmartSuggestionButton.tsx`: A button that likely triggers AI suggestions.
        *   `TeamCollaboration.tsx`: Components related to team collaboration on ideas.
    *   **Root-level components in `src/components/idea-playground/`**:
        *   `CanvasSelector.tsx`: UI for selecting different ideation canvases or templates.
        *   `CreateCanvasModal.tsx`: Modal for creating new canvases.
        *   `IdeaGenerationForm.tsx`: A generic form for idea generation.
        *   `IdeaList.tsx`: A generic component to list ideas.
        *   `IdeaPlaygroundWorkspace.tsx`: A general workspace for the idea playground (potentially older or a wrapper).
        *   `IdeaRefinementForm.tsx`: A generic form for idea refinement.
        *   `SavedIdeasList.tsx`: Component to list saved ideas.
        *   `SaveIdeaModal.tsx`: Modal for saving an idea. (Potential overlap with `IdeaExportModal.tsx` or save functionalities within pathways).

2.  **`src/enhanced-idea-hub/`**: A module that appears to be a newer, more structured approach to idea management, possibly intended to supersede or integrate parts of `src/components/idea-playground/`.
    *   `components/`:
        *   `ViewManager.tsx`: Manages different views within the enhanced hub.
        *   `common/IdeaCard.tsx`: Reusable UI component to display an idea summary.
        *   `creation/`: Components related to the idea creation process.
        *   `exploration/`: Components for exploring existing ideas.
        *   `refinement/`: Components for refining ideas.
        *   `validation/`: Components for validating ideas.
        *   `views/CardGridView.tsx`: Displays ideas in a card grid format.
    *   `hooks/`: (Directory exists but no files listed in initial scan - may contain custom hooks for this module).
    *   `lib/`: (Directory exists but no files listed - may contain utility functions).
    *   `services/`:
        *   `supabaseClient.ts`: Potentially a Supabase client instance configured specifically for this module.
        *   `adapters/`: (Directory exists - likely for adapting data structures between API and UI).
        *   `api/idea-hub-api.ts`: Service for interacting with the backend API for idea hub functionalities.
    *   `store/idea-hub-store.ts`: Centralized Zustand store for managing state within the `enhanced-idea-hub`.
    *   `types/index.ts`: TypeScript type definitions specific to the `enhanced-idea-hub`.

3.  **`src/pages/idea-hub/`**: Page components that serve as entry points for specific Idea Hub features.
    *   `QuickGeneration.tsx`: Page for a streamlined idea generation flow.
    *   `Refinement.tsx`: Page dedicated to idea refinement activities.
    *   `SavedIdeasPage.tsx`: Page for users to view and manage their saved ideas.

4.  **`src/pages/IdeaHub.tsx`**: Likely the main landing or dashboard page for the broader Idea Hub functionality, potentially integrating components from both `idea-playground` and `enhanced-idea-hub`.

5.  **`src/pages/EnhancedIdeaHubPage.tsx`**: Serves as the main entry point for the features specifically within the `enhanced-idea-hub` module.

6.  **`src/lib/contexts/` (Relevant to Idea Hub):**
    *   `IdeaContext.tsx`: A general React context for idea-related state. Its current usage and relation to other state management solutions need clarification.
    *   `IdeaPlaygroundContext.tsx`: Located in `src/components/idea-playground/enhanced/context/`, specific to the enhanced playground's state.
    *   `UnifiedIdeaContext.tsx`: Appears to be an attempt to consolidate idea state. Its relationship with other contexts and stores needs to be defined or deprecated if superseded. **(High Priority for Review/Refactor)**.

7.  **`src/lib/services/idea-playground/ai/sequential-generation.service.ts`**:
    *   **Purpose:** Provides AI-driven sequential idea generation capabilities.
    *   **Relationships:** Likely consumed by components in `src/components/idea-playground/` pathways that offer AI suggestions.

8.  **`src/lib/types/idea-playground.types.ts`**:
    *   **Purpose:** Contains shared TypeScript type definitions used across the `idea-playground` components and services.
    *   **Note:** Compare with `src/enhanced-idea-hub/types/index.ts` for potential overlap or need for unification.

**State Management Deep Dive (Idea Modules):**
-   The presence of `IdeaContext.tsx`, `IdeaPlaygroundContext.tsx` (in enhanced), `UnifiedIdeaContext.tsx`, `idea-hub-store.ts` (Zustand), and `idea-workflow.machine.ts` (XState) indicates a significant evolution and potential fragmentation in state management for idea-related features.
-   **`IdeaContext.tsx` & `UnifiedIdeaContext.tsx`**: These generic contexts in `src/lib/contexts/` might be older or attempts at broad state sharing. Their current relevance and usage need to be assessed. If `idea-hub-store.ts` and `IdeaPlaygroundContext.tsx` (for the enhanced workflow machine) are the preferred modern solutions, these older contexts might be candidates for deprecation and refactoring.
-   **`enhanced-idea-hub/store/idea-hub-store.ts`**: This Zustand store likely manages the state for the `EnhancedIdeaHubPage` and its sub-components. It's a more modern and scalable approach than context for complex global state.
-   **`components/idea-playground/enhanced/state/idea-workflow.machine.ts`**: The use of a state machine (likely XState) for the `enhanced` playground workflow is suitable for managing complex, multi-step processes with well-defined states and transitions.
-   **`components/idea-playground/enhanced/context/IdeaPlaygroundContext.tsx`**: This context is likely used to provide the state machine and its services to the components within the `enhanced` idea playground.

**User Flows / Pathways (Detailed):**

1.  **Legacy/Basic Idea Playground (`src/components/idea-playground/` - non-enhanced parts):**
    *   Users might start via `IdeaHub.tsx` or `IdeaPlaygroundWorkspace.tsx`.
    *   Can select or create canvases (`CanvasSelector.tsx`, `CreateCanvasModal.tsx`).
    *   Engage in idea generation (`IdeaGenerationForm.tsx`) or refinement (`IdeaRefinementForm.tsx`).
    *   View lists of ideas (`IdeaList.tsx`, `SavedIdeasList.tsx`).
    *   Save ideas (`SaveIdeaModal.tsx`).
    *   **Pathways 1, 2, 3** offer structured, multi-screen workflows:
        *   **Pathway 1:** `IdeaCaptureScreen` -> `ProblemSolutionScreen` -> `TargetValueScreen` -> `BusinessModelScreen` -> `GoToMarketScreen`. Also involves `SuggestionsScreen`, `SuggestionEditor`, `SuggestionMerger`.
        *   **Pathway 2:** `IndustrySelectionScreen` -> `IdeaComparisonScreen` -> `IdeaRefinementScreen`.
        *   **Pathway 3:** `IdeaLibraryScreen` -> `IdeaAnalysisScreen` -> `IdeaRefinementScreen`.

2.  **Enhanced Idea Playground (`src/components/idea-playground/enhanced/`):**
    *   Accessed likely via a specific route or section leading to `EnhancedWorkspace.tsx`.
    *   Workflow managed by `idea-workflow.machine.ts`.
    *   Progresses through defined stages: `IdeaGenerationStage`, `InitialAssessmentStage`, `MarketValidationStage`, `DetailedRefinementStage`, `BusinessModelStage`, `CompanyFormationStage`, `GoToMarketStage`.
    *   Uses `NavigationSidebar.tsx` for stage navigation and `Dashboard.tsx` for overview.

3.  **Enhanced Idea Hub (`src/enhanced-idea-hub/`):**
    *   Accessed via `EnhancedIdeaHubPage.tsx`.
    *   Uses `ViewManager.tsx` to switch between different views (creation, exploration, refinement, validation).
    *   Features `CardGridView.tsx` for displaying ideas.
    *   State managed by `idea-hub-store.ts`.
    *   API interactions via `idea-hub-api.ts`.

4.  **Quick Access Pages (`src/pages/idea-hub/`):**
    *   `QuickGeneration.tsx`: A focused page for users to quickly jot down new ideas.
    *   `Refinement.tsx`: A page specifically for refining existing ideas, possibly outside of a strict pathway.
    *   `SavedIdeasPage.tsx`: A dedicated page to browse and manage previously saved ideas.

**Known Issues & Recommendations (specific to Idea Playground / Idea Hub):**

1.  **Consolidate State Management:**
    *   **High Priority.** The multiple contexts and stores for idea state (`IdeaContext`, `UnifiedIdeaContext`, `IdeaPlaygroundContext`, `idea-hub-store.ts`) create confusion and potential for bugs.
    *   **Recommendation:** Define a primary state management solution for ideas. The `enhanced-idea-hub/store/idea-hub-store.ts` (Zustand) seems like a good candidate for global idea state (lists, CRUD operations). The `idea-workflow.machine.ts` (XState) is excellent for managing the complex state of the *enhanced idea playground workflow itself*. The `IdeaPlaygroundContext` can provide this machine. Older contexts (`IdeaContext`, `UnifiedIdeaContext`) should be refactored out.

2.  **Unify or Clarify Pathways & Modules:**
    *   The distinction and relationship between `idea-playground` (with its pathways), `enhanced-idea-hub`, and the simpler pages in `src/pages/idea-hub/` are unclear.
    *   **Recommendation:**
        *   Clearly document the purpose of each pathway and module.
        *   Identify if the "enhanced" versions are intended to replace older ones. If so, plan for migration and deprecation.
        *   Consolidate overlapping functionalities (e.g., multiple refinement screens, save modals). `src/components/idea-playground/pathway2/IdeaRefinementScreen.tsx` and `src/components/idea-playground/pathway3/IdeaRefinementScreen.tsx` are direct overlaps.

3.  **Component Reusability:**
    *   Components like `IdeaCard.tsx` from `enhanced-idea-hub` should be reviewed for broader use across all idea display areas to ensure consistency.
    *   **Recommendation:** Identify common UI patterns (forms, lists, cards, modals) and create a shared component library within `src/components/common/` or a dedicated `src/components/ideas/common/` directory.

4.  **Legacy Code (`.backup` files):**
    *   Files like `SuggestionEditor.tsx.backup`, `SuggestionMerger.tsx.backup`, `SuggestionsScreen.tsx.backup` in `pathway1/`.
    *   **Recommendation:** Review these files immediately. If the current versions are stable, delete backups. If backups contain useful unmerged changes, prioritize their integration or discard them.

5.  **AI Service Integration:**
    *   The `enhanced/services/ai-service.factory.ts` provides a good pattern for pluggable AI services.
    *   **Recommendation:** Ensure all AI interactions throughout the idea modules utilize this factory or a similar abstraction to maintain consistency and flexibility. Consolidate `src/lib/services/idea-playground/ai/sequential-generation.service.ts` into this pattern if appropriate.

6.  **Type Definitions:**
    *   Types are in `src/lib/types/idea-playground.types.ts` and `src/enhanced-idea-hub/types/index.ts`.
    *   **Recommendation:** Merge these into a single source of truth for all idea-related types, likely within `src/lib/types/` or a more specific `src/types/idea/` directory.

7.  **API Layer:**
    *   The `enhanced-idea-hub` has its own `supabaseClient.ts` and `idea-hub-api.ts`.
    *   **Recommendation:** Standardize backend communication. If this is the preferred pattern, ensure other idea-related modules also use it, or consolidate into a global Supabase client and feature-specific API service files in `src/lib/services/`.

8.  **Navigation and Entry Points:**
    *   Multiple entry pages (`IdeaHub.tsx`, `EnhancedIdeaHubPage.tsx`, `QuickGeneration.tsx`, etc.).
    *   **Recommendation:** Map out the user navigation flows to these different sections. Ensure the routing is clear and intentional. Consider if a unified dashboard or entry point for all "idea" related activities would improve UX.

---

### Onboarding

**Purpose:**  
Guides new users through account setup, company joining/creation, role selection, and preferences. This module features several wizard-driven flows to handle different onboarding scenarios.

**Detailed Documentation:**
For a comprehensive breakdown of the Onboarding module, including its architecture, key components, state management, user flows, and known issues, please see:
[./ONBOARDING_MODULE_DOCS.md](./ONBOARDING_MODULE_DOCS.md)

---

### Tasks

**Purpose:**  
Task management for users and companies, including manual and AI-generated tasks.

**Key Directories:**
- `src/components/tasks/`: TaskManager, TaskList, TaskItem, TaskForm, AITaskGenerator, etc.

**Key Components/Files:**
- `TaskManager.tsx`: Main task dashboard.
- `TaskList.tsx`, `TaskItem.tsx`: List and display tasks.
- `TaskForm.tsx`, `CreateTaskDialog.tsx`, `ManualTaskCreation.tsx`, `AITaskGenerator.tsx`: Task creation flows.

**Props/Usage/Relationships:**
- TaskManager fetches and manages task state, passes to TaskList/TaskItem.
- TaskForm/Dialog used for task creation/editing.

**Known Issues:**
- Multiple task creation flows; needs unification.

---

### Analytics & Visualization

**Purpose:**  
Reporting, dashboards, and data visualization for user/company progress and business operations.

**Key Directories:**
- `src/components/analytics/`: Dashboards, reporting panels, export utilities.
- `src/components/visualization/`: Interactive journey maps, milestone animations.

**Key Components/Files:**
- `AnalyticsDashboard.tsx`, `MultiDimensionalReporting.tsx`, `PredictiveInsightsPanel.tsx`
- `InteractiveJourneyMap.tsx`, `MilestoneCelebrationAnimation.tsx`

**Props/Usage/Relationships:**
- Dashboards aggregate data from services/stores and render panels.
- Visualization components receive data and configuration props.

**Known Issues:**
- Some analytics panels duplicated in company/journey modules.

---

### Business Operations Hub

**Purpose:**  
Advanced business domain/task management, workflow automations, dashboards, and team/knowledge management.

**Key Directories:**
- `src/business-ops-hub/`: Components, services, pages for business ops features.

**Key Components/Files:**
- `DomainCard.tsx`, `DomainEditModal.tsx`, `DomainRelationshipGraph.tsx`: Domain management.
- `Dashboard/`: Executive dashboards, analytics, recommendations.
- `WorkflowAutomation.service.ts`, `WorkspaceTemplateManager.tsx`: Automations and workspace templates.

**Props/Usage/Relationships:**
- Domain/task components interact with business ops services and stores.
- Dashboards aggregate domain/task/analytics data.

**Known Issues:**
- Some dashboard/analytics logic overlaps with company/journey modules.

---

### Supporting Infrastructure

- `src/lib/types/`: Shared TypeScript types for ideas, journeys, profiles, etc.
- `src/lib/services/`: Service layer for API/database access, business logic.
- `src/lib/hooks/`: Custom hooks for state/data management.
- `src/lib/store.ts`: Centralized store (some duplication with enhanced stores).
- `supabase/migrations/`: SQL migrations for schema evolution.
- `tests/`: Unit/integration tests (coverage varies).

---

## 5. Data Models & Migrations

- **Supabase/Postgres** schema managed via `supabase/migrations/`.
- Tables for users, companies, ideas, tasks, journeys, analytics, tools, feedback, etc.
- Extensive use of RLS, policies, and custom functions.
- Ongoing schema evolution; some migrations are for bugfixes or refactoring.

---

## 6. API & Service Layer

- **Service files** in `src/lib/services/` and feature modules.
- API access via Supabase client, REST endpoints, and custom functions.
- Some services are duplicated or experimental (e.g., enhanced vs. legacy).
- Business logic split between frontend services and backend SQL/functions.

---

## 7. User Flows & Feature Maps

- **Onboarding:** Multi-step wizard, company join/create, role selection, preferences.
- **Idea Management:** Pathway-based capture/refinement, enhanced AI flows, export/sharing.
- **Tasks:** Manual/AI creation, assignment, progress tracking.
- **Analytics:** Dashboards, reporting, journey/step analytics, predictive insights.
- **Business Ops:** Domain/task management, automations, team/knowledge management.

---

## 8. Known Technical Debt & Cleanup Recommendations

- Remove backup/legacy files and unused components.
- Unify context/providers and state management.
- Consolidate modal/dialog flows and remove duplicates.
- Document canonical flows and intended architecture.
- Audit and refactor analytics/reporting panels for duplication.
- Clarify boundaries between business-ops, company/journey, and analytics modules.
- Archive or delete experimental/unused code after review.

---

## 9. Appendix: File/Component Index

_This section can be expanded with a full index of all files/components, their purpose, and relationships. For brevity, see the directory structure and key components above. If you need a per-file breakdown, request a specific module or directory._

---

**This document is intended as a living reference for developers, architects, and maintainers of The Wheel. Update as the codebase evolves.**
