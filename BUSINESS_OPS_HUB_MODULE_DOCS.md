# Business Operations Hub Module: Detailed Technical Documentation

---

## 1. Overall Purpose & Architecture

The Business Operations Hub (BOH) is a major functional area within The Wheel, designed to provide tools and workflows for managing core business domains, tasks, automations, analytics, team collaboration, and knowledge management. It appears to be a sophisticated system with its own set of services, UI components, and potentially API endpoints. The architecture aims to centralize various operational aspects, offering dashboards, task lists, domain management, and AI-driven recommendations.

---

## 2. Key Directories and Their Roles

*   **`src/business-ops-hub/`**: The root directory for all frontend components, services, pages, hooks, and types specific to the BOH.
    *   **`components/`**: Contains UI components used within the BOH.
        *   `dashboard/`: Components specifically for BOH dashboards (e.g., `ExecutiveSummaryPanel.tsx`, `NextActionsPanel.tsx`, `DomainOverviewGrid.tsx`, `ToolRecommendationsPanel.tsx`, `AnalyticsPanel.tsx`).
        *   `team/TeamManager.tsx`: Component for managing teams within the BOH context.
        *   `knowledge/KnowledgeRepository.tsx`: Component for accessing and managing a knowledge base.
        *   `workspace/WorkspaceContainer.tsx`: A container for BOH workspaces.
        *   `DomainCard.tsx`, `DraggableDomainCard.tsx`, `DomainEditModal.tsx`, `DomainList.tsx`, `DomainTaskPreview.tsx`, `QuickAddDomainModal.tsx`: Components for managing business domains.
        *   `StepForm.tsx`, `StepList.tsx`, `StepSelector.tsx`, `DomainStepManager.tsx`, `DomainStepIntegrationPanel.tsx`: Components for managing steps within domains.
        *   `OnboardingTipCard.tsx`: UI for displaying onboarding tips specific to BOH.
        *   `DomainRelationshipGraph.tsx`: Visualizing relationships between domains.
        *   `ProblemBasedToolFinder.tsx`, `ToolSearchBar.tsx`, `ToolComparisonPanel.tsx`, `ToolValueDashboard.tsx`, `ToolImplementationGuide.tsx`: Components related to tool discovery, evaluation, and management within BOH.
        *   `DecisionFeedbackModal.tsx`, `AssigneeSelector.tsx`, `CommentThread.tsx`, `NotificationCenter.tsx`: Utility and collaboration components.
        *   `BusinessOpsSidebar.tsx`: Navigation sidebar for the BOH.
        *   `WorkspaceTemplateManager.tsx`: Component for managing workspace templates.
        *   `RecommendationsPanel.tsx`: Displays recommendations within BOH.
    *   **`hooks/`**: Custom React hooks for BOH.
        *   `useDomains.ts`: Hook for fetching and managing domain data.
        *   `useDomainDetail.ts`: Hook for fetching details of a specific domain.
        *   `useDomainSteps.ts`: Hook for fetching steps related to a domain.
    *   **`pages/`**: Page-level components for BOH.
        *   `BusinessOperationsHubPage.tsx`: Main entry page for the BOH. (Has tests)
        *   `BusinessDomainDashboardPage.tsx`: Dashboard focused on business domains.
        *   `DomainDetail.tsx`: Page displaying details for a specific domain.
        *   `StepDetailPage.tsx`: Page displaying details for a specific step within a domain. (Has tests)
        *   `UnifiedTaskListPage.tsx`: A centralized task list page, likely aggregating tasks from BOH domains.
        *   `BusinessOpsAnalyticsPage.tsx`: Page for BOH-specific analytics.
        *   `BusinessOpsAutomationsPage.tsx`: Page for managing workflow automations.
        *   `dashboard-transitions.css`: CSS for dashboard transitions.
    *   **`services/`**: Client-side services for BOH.
        *   `accessControl.service.ts`: Handles access control logic for BOH features.
        *   `dashboardAnalytics.service.ts`: Service for BOH dashboard analytics (potential overlap with `src/lib/services/dashboardAnalytics.service.ts`).
        *   `domain.service.ts`: CRUD operations and business logic for domains. (Has tests)
        *   `domainJourneyAdapter.service.ts`: Adapts domain data for use with journey components or vice-versa.
        *   `knowledge.service.ts`: Service for interacting with the knowledge repository.
        *   `logging.service.ts`: BOH-specific logging service.
        *   `recommendation.service.ts`: Service for fetching/processing recommendations within BOH.
        *   `workspaceTemplate.service.ts`: Service for managing workspace templates.
        *   `workflowAutomation.service.ts`: Service for workflow automations. (Has tests)
    *   **`types/`**: TypeScript type definitions for BOH.
        *   `domain.types.ts`: Types for business domains.
        *   `domain-extended.types.ts`: Extended types for domains, possibly including related data.

*   **`src/api/business-ops-hub/`**: Contains API route handlers (likely for Next.js or a similar framework if backend routes are defined in `src/api`).
    *   `decision-events.ts`: API for logging decision events.
    *   `recommendation-feedback.ts`: API for submitting feedback on recommendations.
    *   `recommendations.ts`: API for fetching recommendations.
    *   `tool-analytics.ts`: API for tool-related analytics.
    *   `tools.ts`: API for tool management or discovery.

*   **`supabase/migrations/` (Relevant to BOH):** Numerous migrations indicate the creation and evolution of BOH-related tables.
    *   `20250507010000_create_business_ops_hub_tables.sql`: Initial schema setup.
    *   Migrations for `domain_steps`, `task_dependencies`, `step_status_history`, `task_comments`, `task_assignment_fields`, `workflow_automations`, `recommendation_feedback`, `reminders`, `dynamic_priority_adjustment`, `user_roles`, `company_members`, `business_domains`, `domain_step_logs`, etc.
    *   Functions like `get_domain_steps`, `get_domain_step_recommendations`.
    *   Fixes and enhancements to these tables and functions.

*   **`docs/` (Relevant to BOH):** Extensive planning and design documentation.
    *   `BUSINESS_OPERATIONS_HUB_*.md` files: Cover implementation plans, schedules, UI mockups, design decisions, sprint plans, executive summaries, etc.
    *   `BUSINESS_DOMAIN_MANAGEMENT_STORIES.md`, `BUSINESS_DOMAIN_STEP_LINKING_IMPLEMENTATION_PLAN.md`.

---

## 3. File-by-File Breakdown (Selected Key Components & Services)

*   **`src/business-ops-hub/pages/BusinessOperationsHubPage.tsx`**
    *   **Purpose:** The main landing page or dashboard for the Business Operations Hub.
    *   **Functionality:** Likely aggregates key information from different BOH modules (domains, tasks, analytics, recommendations) into a central view. May use components from `src/business-ops-hub/components/dashboard/`.
    *   **Relationships:** Top-level page, orchestrates display of various BOH components.

*   **`src/business-ops-hub/services/domain.service.ts`**
    *   **Purpose:** Handles all business logic and data interactions related to "Business Domains."
    *   **Functionality:** CRUD operations for domains, fetching domain details, steps associated with domains, managing domain relationships.
    *   **Relationships:** Interacts with Supabase (via a client) to persist and retrieve domain data. Used by domain-related components and hooks (`useDomains`, `useDomainDetail`).

*   **`src/business-ops-hub/components/dashboard/ExecutiveSummaryPanel.tsx`**
    *   **Purpose:** A dashboard panel designed to provide a high-level executive summary of key metrics and statuses within the BOH.
    *   **Functionality:** Fetches and displays aggregated data, KPIs, and critical alerts.
    *   **Relationships:** Part of the BOH dashboard(s). Consumes data from `dashboardAnalytics.service.ts` or other relevant services.

*   **`src/business-ops-hub/services/workflowAutomation.service.ts`**
    *   **Purpose:** Manages workflow automations within the BOH.
    *   **Functionality:** Creating, reading, updating, and deleting automation rules. Executing automations based on triggers.
    *   **Relationships:** Interacts with Supabase tables related to workflow automations. Used by `BusinessOpsAutomationsPage.tsx`.

*   **`src/api/business-ops-hub/recommendations.ts`**
    *   **Purpose:** Backend API endpoint for serving recommendations to the BOH frontend.
    *   **Functionality:** Likely queries recommendation data (possibly from `get_domain_step_recommendations` SQL function or other sources) and returns it to the client.
    *   **Relationships:** Called by `recommendation.service.ts` on the client-side.

---

## 4. State Management

*   **Local Component State:** UI components like modals, forms, and individual cards will manage their local presentation state.
*   **Hooks (`src/business-ops-hub/hooks/`)**: Custom hooks like `useDomains`, `useDomainDetail`, `useDomainSteps` are likely used for fetching, caching (possibly with React Query or SWR), and providing domain-specific data to components. This is a good pattern for encapsulating data-fetching logic.
*   **Global/Shared State (Potential):**
    *   While not explicitly clear if a dedicated BOH Zustand store exists (unlike `enhanced-idea-hub`), complex shared state (e.g., selected workspace, global filters for BOH, user permissions within BOH) might warrant one.
    *   Alternatively, React Context might be used for sharing data down component trees (e.g., `WorkspaceContext`, `DomainContext`).
*   **Data Persistence:** Primarily through Supabase, with services abstracting the direct database interactions.

---

## 5. User Flows

1.  **Navigating BOH:** User accesses BOH via `BusinessOpsHubPage.tsx`, navigates using `BusinessOpsSidebar.tsx`.
2.  **Domain Management:**
    *   Viewing domain lists (`DomainList.tsx`).
    *   Viewing domain details (`DomainDetail.tsx` page, `DomainCard.tsx`).
    *   Creating/Editing domains (`QuickAddDomainModal.tsx`, `DomainEditModal.tsx`).
    *   Managing steps within a domain (`DomainStepManager.tsx`, `StepDetailPage.tsx`).
3.  **Task Management:** Viewing and managing tasks, potentially aggregated in `UnifiedTaskListPage.tsx`.
4.  **Analytics:** Accessing BOH-specific analytics via `BusinessOpsAnalyticsPage.tsx` and dashboard panels.
5.  **Automations:** Creating and managing workflow automations in `BusinessOpsAutomationsPage.tsx`.
6.  **Tool Discovery & Evaluation:** Using `ProblemBasedToolFinder.tsx`, `ToolSearchBar.tsx`, `ToolComparisonPanel.tsx`.
7.  **Collaboration:** Using `TeamManager.tsx`, `CommentThread.tsx`, `NotificationCenter.tsx`.

---

## 6. Known Issues & Recommendations (Business Operations Hub Module)

1.  **Service Duplication/Overlap:**
    *   `dashboardAnalytics.service.ts` exists in both `src/lib/services/` and `src/business-ops-hub/services/`.
    *   **Recommendation:** Consolidate into a single service or clearly define the distinct responsibilities if they serve different scopes (e.g., global dashboard vs. BOH-specific dashboard).
2.  **Complexity and Size:** The BOH is a large module with many sub-features.
    *   **Recommendation:** Continue to maintain clear separation of concerns within its subdirectories (components, services, hooks, types, pages). Ensure robust testing for each sub-module.
3.  **API Structure (`src/api/business-ops-hub/`):**
    *   **Recommendation:** Ensure these API routes follow consistent naming conventions and error handling. Document the request/response schemas for each endpoint.
4.  **Integration with other Modules:** BOH likely integrates with Tasks, Journeys, and potentially Ideas.
    *   **Recommendation:** Clearly document these integration points and data flows. The `domainJourneyAdapter.service.ts` is an example of such an adapter; ensure its purpose and usage are well-understood.
5.  **Database Interactions:** The numerous migrations and SQL functions suggest complex backend logic.
    *   **Recommendation:** Ensure all Supabase functions used by BOH services are well-documented (parameters, return values, purpose). Optimize complex queries for performance.
6.  **Onboarding to BOH:** `OnboardingTipCard.tsx` suggests specific onboarding for BOH.
    *   **Recommendation:** Integrate this smoothly with the main onboarding module or document it as a distinct, feature-specific onboarding flow.
7.  **Testing:** Given the module's centrality and complexity:
    *   **Recommendation:** Prioritize comprehensive test coverage, including unit tests for services and hooks, and integration/E2E tests for key user flows (domain management, task interaction, automations). The existing `*.test.tsx` files are a good start.

---

This detailed documentation for the Business Operations Hub module should be reviewed and expanded with specifics from the code (props, exact state variables, detailed service logic, API request/response schemas) as part of a deeper code audit.
