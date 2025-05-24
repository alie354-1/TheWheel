# Business Operations Hub: Sprint 9 Implementation Plan

## Sprint Goal

Lay the foundation for the advanced dashboard and intelligence layer by enhancing the dashboard layout, navigation, and integrating the first version of the priority-driven task engine. All work must extend the existing codebase from Sprints 1-8.

---

## Context

- The current dashboard is functional but lacks a clear, modular layout and advanced prioritization.
- The domain/task system exists but does not yet support multi-factor prioritization or a true executive overview.
- This sprint focuses on UI/UX improvements, dashboard modularity, and the first iteration of the new task engine.

---

## User Stories & Acceptance Criteria

### Story 9.1: Modular Dashboard Layout

**As** a founder  
**I want** a dashboard with clear, modular sections (executive summary, next actions, domains, tools, analytics)  
**So that** I can quickly understand my company’s status and what to do next

**Acceptance Criteria (Gherkin):**
```
Feature: Modular Dashboard Layout
  Scenario: Dashboard displays modular sections
    Given I am on the Business Operations Hub dashboard
    Then I see an executive summary section at the top
    And I see a prioritized "Next Actions" panel
    And I see a grid of business domains
    And I see a tools/recommendations panel
    And I see analytics/metrics panels
```

---

### Story 9.2: Enhanced Navigation & State

**As** a user  
**I want** improved navigation and state preservation  
**So that** I can move between dashboard sections and domains without losing context

**Acceptance Criteria (Gherkin):**
```
Feature: Dashboard Navigation
  Scenario: Navigation preserves state
    Given I navigate between dashboard sections or domains
    Then my scroll position and selected filters are preserved
    And the UI transitions smoothly
```

---

### Story 9.3: Priority-Driven Task Engine v1

**As** a founder  
**I want** my task list to be prioritized by business impact, dependencies, and timing  
**So that** I always know what’s most important to do next

**Acceptance Criteria (Gherkin):**
```
Feature: Priority-Driven Task Engine
  Scenario: Task list is prioritized
    Given I have multiple tasks in a domain
    When I view the dashboard
    Then tasks are ordered by calculated priority
    And the priority factors are visible on hover or click
```

---

## Technical Tasks

- Refactor `BusinessOperationsHubPage.tsx` to use a grid-based, modular layout (extend, do not duplicate)
- Create/extend `ExecutiveSummaryPanel`, `NextActionsPanel`, `DomainOverviewGrid`, `ToolRecommendationsPanel`, `AnalyticsPanel` components
- Implement dashboard state management (filters, scroll, selection) using React context or Redux
- Integrate the first version of the priority-driven task engine:
  - Add priority calculation logic to the task service (business impact, dependencies, timing)
  - Display priority scores and explanations in the UI
- Update database schema if needed for new priority fields (additive only)
- Add/extend unit and integration tests for new dashboard and task engine logic

---

## Implementation Notes

- All new components must be placed in `src/business-ops-hub/components/dashboard/` or appropriate subfolders
- Extend existing domain/task components; do not create new ones unless required
- Use MUI or existing design system for all UI elements
- Reference and build on the modularization patterns from Sprints 1-8
- Document all new props, context, and service methods

---

## References to Extend/Modify

- `src/business-ops-hub/pages/BusinessOperationsHubPage.tsx`
- `src/business-ops-hub/components/DomainCard.tsx`
- `src/business-ops-hub/components/RecommendationsPanel.tsx`
- `src/business-ops-hub/services/domain.service.ts`
- `src/business-ops-hub/services/domain-extended.types.ts`
- `src/business-ops-hub/services/domain.service.ts`
- `src/business-ops-hub/components/ToolValueDashboard.tsx`

---

## Do Not Duplicate

- Do not create new dashboard or domain card components from scratch; extend the existing ones.
- Do not create a new task service; enhance the current one.
- Do not fork the design system; use and extend the current styles.

---

## Testing

- Add/extend unit tests for dashboard layout and state
- Add integration tests for priority-driven task engine
- Manual QA: Verify dashboard modularity, navigation, and task prioritization
