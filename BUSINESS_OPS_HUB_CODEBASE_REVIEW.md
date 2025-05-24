# TheWheel Business Operations Hub: Comprehensive Codebase Review & Cleanup Guide

_Last updated: 2025-05-17_

---

## 1. Overview

This document provides a detailed review of the Business Operations Hub codebase, focusing on the domains/steps/dependencies architecture, code quality, and opportunities for cleanup and refactoring. It is intended as a reference for future development and technical debt reduction.

---

## 2. Global Setup (Admin Section)

### 2.1. BulkDomainStepMapper.tsx

- **Purpose:** Two-panel UI for mapping steps to domains globally (template-level).
- **Features:**
  - Left: Domain selection (global `business_domains`).
  - Right: Step mapping (global `journey_steps`), with batch actions and AI suggestions.
  - Search/filter for both domains and steps.
  - Uses `getDomainSteps`, `batchAddStepsToDomain`, and `getLLMStepSuggestionsForDomain` from `domain.service`.
- **Issues:**
  - All mappings are global; company-specific overrides are handled elsewhere.
  - Some business logic is mixed into the UI.
  - AI suggestions are present but not deeply integrated (stubbed logic).

### 2.2. DomainStepManager (Admin & Company)

- **Purpose:** Manage steps associated with a domain, both at the admin (global) and company (instance) level.
- **Features:**
  - Add/remove steps, bulk add recommendations, refresh recommendations.
  - UI is similar for both admin and company, but logic is duplicated.
- **Issues:**
  - Inconsistent typing (`step.id` vs. `step.step_id`).
  - Some business logic in UI; could be moved to hooks/services.
  - Duplication between admin and company versions.

---

## 3. Data Model (Supabase/Postgres)

### 3.1. domain_steps Table

- **Purpose:** Core mapping between domains and steps.
- **Fields:** `domain_id`, `step_id`, `company_id` (null for global, set for company-specific), customizations (name, description, difficulty, time, notes), priority, timestamps.
- **Constraints:** Unique on `(domain_id, step_id, company_id)`.
- **View:** `domain_steps_status` joins with journey step, domain, and company progress/status.
- **Notes:**
  - Supports both global templates and company-specific customizations.
  - Allows for per-company overrides of step details.

### 3.2. task_dependencies Table

- **Purpose:** Tracks dependencies between tasks (steps).
- **Fields:** `task_id`, `depends_on_task_id`, `type` (e.g., 'blocks', 'relates_to'), timestamps.
- **Notes:**
  - Enables modeling of prerequisites, cross-domain links, and arbitrary relationships.
  - Used for both intra-domain and cross-domain dependencies.

---

## 4. Company Personalization & Usage (Business Operations Hub)

### 4.1. StepDetailPage.tsx

- **Purpose:** Main UI for company users to view and interact with a step.
- **Features:**
  - Step details (name, description, difficulty, time, phase, assignee, status, progress).
  - Comments, notes, editing/deletion controls.
  - Workspace for collaboration.
  - Tools and resources (currently mocked).
  - Dependencies & prerequisites (lists dependencies, allows adding/removing).
  - RecommendationsPanel for related steps/tools/guidance.
- **Issues:**
  - Some data is mocked; should be replaced with real sources.
  - UI and business logic are mixed.

### 4.2. StepList.tsx

- **Purpose:** Displays steps (and subtasks) within a domain, supporting both flat and hierarchical structures.
- **Features:**
  - Status, dependencies, blockers, manual priority overrides.
  - Recursive rendering for subtasks.
- **Issues:**
  - Inconsistent typing and use of `as any`.
  - Dependency/blocker logic could be more robust.
  - Some business logic in UI.

### 4.3. RecommendationsPanel.tsx

- **Purpose:** Surfaces AI-driven recommendations and cross-domain blockers.
- **Features:**
  - Fetches recommendations/blockers from backend API.
  - Supports user feedback and logs decision events.
  - Displays explanations, confidence scores, and allows micro-feedback.
- **Issues:**
  - Mixes UI, API, feedback, and logging logic.
  - Could benefit from separation of concerns and stronger typing.

### 4.4. DomainRelationshipGraph.tsx

- **Purpose:** Intended for visualizing cross-domain/step relationships.
- **Status:** Placeholder; no actual visualization logic implemented.
- **Opportunity:** Implement with vis-network, d3, or similar to provide a visual map of dependencies and relationships.

---

## 5. Supporting Hooks & Services

### 5.1. useDomainSteps.ts

- **Purpose:** Encapsulates logic for fetching, adding, removing, and recommending steps for a domain/company.
- **Features:**
  - Fetches steps and recommendations.
  - Handles add/remove/bulk add actions.
  - Refreshes recommendations.
  - Uses `domain.service` for API calls and `logging.service` for audit logs.
- **Issues:**
  - Could benefit from stronger typing and separation of concerns.
  - Some duplication with admin-side logic.
  - Error handling could be improved.

### 5.2. domain.service.ts

- **Purpose:** Core business logic for domains/steps.
- **Features:**
  - CRUD operations for domains and steps.
  - Batch operations, LLM-powered suggestions (OpenAI integration).
  - Handles both global and company-specific logic.
- **Issues:**
  - Many stubs and incomplete implementations.
  - Inconsistent naming and typing.
  - Some logic is duplicated in other files/components.

---

## 6. Architectural & Code Quality Issues

### 6.1. Inconsistent Typing/Naming

- Frequent use of `as any`, inconsistent use of `id` vs. `step_id`.
- Types are sometimes imported from different files or duplicated.
- Example: StepList, DomainStepManager, and useDomainSteps all use slightly different step types.

### 6.2. Mixing of UI and Business Logic

- Many components handle both UI and business logic (e.g., StepList, DomainStepManager, RecommendationsPanel).
- Should separate concerns for maintainability and testability.

### 6.3. Duplication

- Similar logic exists in both admin and company-facing components/services.
- Example: Step mapping, recommendations, and batch actions are implemented in multiple places.

### 6.4. Placeholder/Unfinished Features

- DomainRelationshipGraph is a placeholder.
- Some stubs in domain.service.ts and other files.
- Tools/resources in StepDetailPage are mocked.

### 6.5. Global vs. Company-Specific Logic

- Not always clear when logic/data is global (template) vs. company-specific (instance).
- Could benefit from clearer separation and documentation.

### 6.6. Error Handling & Logging

- Some error handling is minimal or missing.
- Logging is present but not always consistent.

---

## 7. Cleanup & Refactoring Opportunities

### 7.1. Standardize Typing and Naming

- Use consistent types and naming conventions across all files.
- Avoid `as any` and ensure all data structures are well-typed.
- Centralize type definitions in a single location (e.g., `types/domain.types.ts`).

### 7.2. Separate UI and Business Logic

- Move business logic out of components and into hooks/services.
- Use context/providers where appropriate.
- Example: Move step add/remove logic from UI components to hooks/services.

### 7.3. Deduplicate Logic

- Centralize shared logic between admin and company-facing components/services.
- Example: Step mapping, recommendations, and batch actions.

### 7.4. Implement Missing Features

- Build out DomainRelationshipGraph for visualizing cross-domain/step relationships.
- Replace mocked data with real sources (e.g., tools/resources in StepDetailPage).
- Complete stubs and unfinished implementations in services.

### 7.5. Clarify Global vs. Company-Specific Logic

- Document and enforce clear boundaries between template and instance logic.
- Example: Use explicit flags or separate services for global vs. company data.

### 7.6. Improve Error Handling and Logging

- Ensure all API calls and business logic have robust error handling and logging.
- Standardize logging format and location.

---

## 8. File/Component-Level Notes

### BulkDomainStepMapper.tsx

- Well-structured for batch mapping, but business logic should be moved to a service/hook.
- AI suggestions are a good feature; could be expanded with more context-aware logic.

### StepDetailPage.tsx

- Comprehensive UI for step details, but mixes too much logic.
- Mocked data for tools/resources should be replaced.
- Dependency management is present but could be more robust.

### RecommendationsPanel.tsx

- Good use of AI and feedback, but logic is too tightly coupled to UI.
- Consider splitting into smaller components/services.

### StepList.tsx

- Supports hierarchical steps, but typing and logic could be improved.
- Manual priority controls are a nice feature.

### DomainRelationshipGraph.tsx

- Needs implementation; high value for visualizing complex relationships.

### useDomainSteps.ts

- Centralizes step management logic, but could be more robust and better typed.

### domain.service.ts

- Core business logic, but many stubs and inconsistent naming.
- LLM integration is a strong feature; could be expanded.

---

## 9. Next Steps

1. **Standardize types and naming conventions.**
2. **Separate UI and business logic throughout the codebase.**
3. **Deduplicate logic between admin and company-facing components/services.**
4. **Implement missing features, especially visualization and real data sources.**
5. **Clarify and document global vs. company-specific logic.**
6. **Improve error handling and logging.**
7. **Review and refactor each major component/service as outlined above.**

---

## 10. Appendix: Example Refactoring Plan

- [ ] Centralize all domain/step types in `types/domain.types.ts`.
- [ ] Move all business logic from UI components to hooks/services.
- [ ] Implement DomainRelationshipGraph with d3 or vis-network.
- [ ] Replace all `as any` with proper types.
- [ ] Document global vs. company-specific logic in a dedicated section.
- [ ] Add robust error handling to all API/service calls.
- [ ] Review and refactor RecommendationsPanel for separation of concerns.
- [ ] Replace mocked data in StepDetailPage with real API calls.

---

_This document should be updated as the codebase evolves and as cleanup/refactoring progresses._
