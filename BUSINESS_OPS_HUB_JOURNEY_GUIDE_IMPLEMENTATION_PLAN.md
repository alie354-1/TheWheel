# Business Operations Hub: Journey Guide & Cross-Domain Considerations Implementation Plan

_Last updated: 2025-05-17_

---

## 1. Executive Summary

This document details the comprehensive plan to implement the "Journey Guide" concept in TheWheel's Business Operations Hub, enabling founders to see not only what needs to be done in each business domain, but also the cross-functional considerations and dependencies that ripple across the business. The plan covers admin panel changes, company-facing Biz Ops Hub changes, data model updates, SQL, seed data, and all engineering tasks, with epics, user stories, and acceptance criteria.

---

## 2. High-Level Epics

### Epic 1: Admin Journey Template & Dependency Management

- Enable admins to define journey steps, assign primary domains, and link cross-domain considerations and dependencies.
- Provide UI for mapping, linking, and managing these relationships.

### Epic 2: Company-Facing Journey Guide & Consideration Activation

- Surface core steps and cross-domain considerations to founders in the Biz Ops Hub.
- Allow activation of considerations as actionable tasks in other domains.
- Visualize dependencies and blockers.

### Epic 3: Data Model, SQL, and Seed Data

- Update and extend the data model to support new relationships and activation flows.
- Provide migration scripts and seed data for both templates and company instances.

---

## 3. User Stories & Acceptance Criteria

### 3.1. Admin Panel

#### Story 1: Define Journey Steps and Assign Primary Domain

- **As an admin**, I can create/edit journey steps and assign them to a primary business domain.
- **Acceptance Criteria:**
  - Steps can be created/edited with name, description, difficulty, time estimate, etc.
  - Each step is linked to a primary domain via `domain_steps`.

#### Story 2: Link Cross-Domain Considerations

- **As an admin**, I can link a journey step to other steps in different domains as "considerations" or "related steps."
- **Acceptance Criteria:**
  - UI allows searching/browsing steps across all domains.
  - Admin can create a dependency of type `'relates_to'`, `'consideration'`, or similar in `task_dependencies`.
  - Linked considerations are visible in the admin mapping UI.

#### Story 3: Manage Core Sub-Tasks and Sub-Steps

- **As an admin**, I can define sub-tasks for a primary step (e.g., checklist or formal sub-steps).
- **Acceptance Criteria:**
  - Sub-tasks can be added as child steps (using `parent_task_id` or a dependency type like `'is_sub_task_of'`).
  - Sub-tasks are displayed in the admin UI.

#### Story 4: AI-Assisted Suggestions

- **As an admin**, I can use AI to suggest relevant steps and considerations for a domain or step.
- **Acceptance Criteria:**
  - AI suggestions are available in the mapping UI.
  - Admin can accept/reject suggestions.

---

### 3.2. Biz Ops Hub (Company-Facing)

#### Story 5: View Journey Steps and Core Sub-Tasks

- **As a founder**, I can view all journey steps for my company, organized by domain, with core sub-tasks/checklists.
- **Acceptance Criteria:**
  - Steps are displayed with details, status, and sub-tasks.
  - Progress is tracked per step and domain.

#### Story 6: See and Activate Cross-Domain Considerations

- **As a founder**, I can see linked considerations from other domains when viewing a step, and activate them as actionable tasks.
- **Acceptance Criteria:**
  - Considerations are displayed in a dedicated section.
  - Clicking "Activate" creates a company-specific task/step in the relevant domain.
  - Activated considerations appear in the relevant domain's task list and dashboard widgets.

#### Story 7: Visualize Dependencies and Blockers

- **As a founder**, I can see which tasks are blocked by others, including cross-domain blockers.
- **Acceptance Criteria:**
  - Blocked tasks are visually indicated.
  - Clicking a blocker navigates to its detail page.
  - DomainRelationshipGraph visualizes dependencies.

#### Story 8: Dismiss or Defer Considerations

- **As a founder**, I can dismiss or defer considerations that are not relevant to my business.
- **Acceptance Criteria:**
  - Dismissed considerations are hidden or moved to a "parking lot."
  - Deferred considerations can be re-activated later.

---

### 3.3. Data Model & SQL

#### Story 9: Extend Data Model for Considerations

- **As an engineer**, I can represent cross-domain considerations and sub-tasks in the data model.
- **Acceptance Criteria:**
  - `task_dependencies` supports new types: `'consideration'`, `'relates_to'`, `'is_sub_task_of'`.
  - `domain_steps` and `company_journey_steps` support activation status for considerations.

#### Story 10: Seed Data for Templates and Companies

- **As an engineer**, I can seed the database with example journey steps, domains, dependencies, and considerations.
- **Acceptance Criteria:**
  - Example steps and domains are seeded.
  - Example dependencies and considerations are seeded.
  - Company-specific instances are seeded for demo/testing.

---

## 4. Detailed Engineering Tasks

### 4.1. Admin Panel

- [ ] Update `BulkDomainStepMapper.tsx` and `DomainStepManager.tsx` to support linking steps as considerations (UI for searching, linking, and managing).
- [ ] Add UI for managing sub-tasks (checklist or formal sub-steps).
- [ ] Integrate AI suggestions for both step mapping and consideration linking.
- [ ] Update API endpoints/services to support new dependency types.

### 4.2. Biz Ops Hub

- [ ] Update `StepDetailPage.tsx` to display linked considerations, with "Activate" and "Dismiss" actions.
- [ ] Update company-facing step/task creation logic to support activation of considerations (creates `company_journey_steps` or similar).
- [ ] Update task lists and widgets to include activated considerations.
- [ ] Implement or enhance `DomainRelationshipGraph.tsx` to visualize dependencies and blockers.
- [ ] Add UI for dismissing/defering considerations.

### 4.3. Data Model & SQL

- [ ] Update `task_dependencies` table:
  - Add/validate types: `'consideration'`, `'relates_to'`, `'is_sub_task_of'`.
- [ ] Update `domain_steps` and `company_journey_steps`:
  - Add fields for activation status, dismissed/deferred state if needed.
- [ ] Update or create views to join steps, dependencies, and activation status for efficient querying.
- [ ] Write migration scripts for all schema changes.

### 4.4. Seed Data

- [ ] Create seed scripts for:
  - Example business domains (Operations, Marketing, Legal, Finance, Tech).
  - Example journey steps (e.g., "Get Domain Name," "Check Trademark," etc.).
  - Example dependencies and considerations.
  - Example company-specific instances and activations.

### 4.5. Integration & Migration

- [ ] Ensure no overwriting of existing task logic in TaskManager/dashboard.
- [ ] Plan for future unification of task models (journey steps and ad-hoc tasks).
- [ ] Write migration and backfill scripts for existing data.

---

## 5. SQL & Migration Examples

### 5.1. task_dependencies Table

```sql
ALTER TABLE task_dependencies
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'blocks';

-- Example: Add a consideration link
INSERT INTO task_dependencies (task_id, depends_on_task_id, type)
VALUES ('step_id_get_domain_name', 'step_id_check_trademark', 'consideration');
```

### 5.2. domain_steps Table

```sql
-- Add activation and dismissed fields if needed
ALTER TABLE domain_steps
  ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_dismissed BOOLEAN DEFAULT FALSE;
```

### 5.3. Seed Data Example

```sql
-- Seed business domains
INSERT INTO business_domains (id, name, description)
VALUES
  ('dom_ops', 'Operations', 'Core business operations'),
  ('dom_marketing', 'Marketing', 'Branding and marketing'),
  ('dom_legal', 'Legal', 'Legal and compliance'),
  ('dom_finance', 'Finance', 'Financial management'),
  ('dom_tech', 'Tech', 'Technical/product');

-- Seed journey steps
INSERT INTO journey_steps (id, name, description)
VALUES
  ('step_get_domain', 'Get Domain Name', 'Register a domain for your business'),
  ('step_check_trademark', 'Check Trademark', 'Ensure your domain name is not infringing on trademarks'),
  ('step_align_brand', 'Align Domain with Brand', 'Ensure domain matches brand strategy');

-- Map steps to domains
INSERT INTO domain_steps (domain_id, step_id)
VALUES
  ('dom_ops', 'step_get_domain'),
  ('dom_legal', 'step_check_trademark'),
  ('dom_marketing', 'step_align_brand');

-- Link considerations
INSERT INTO task_dependencies (task_id, depends_on_task_id, type)
VALUES
  ('step_get_domain', 'step_check_trademark', 'consideration'),
  ('step_get_domain', 'step_align_brand', 'consideration');
```

---

## 6. Existing Seed Data

- Existing seed data for domains and steps is present in the database (see `business_domains`, `journey_steps`, `domain_steps`).
- Existing dependencies may be limited to `'blocks'` type; new types will need to be added.
- Company-specific data is present in `company_journey_steps` and related tables.

---

## 7. Additional Notes

- **No Overwriting:** The new logic will not overwrite existing ad-hoc tasks or TaskManager logic; integration will be planned for a future phase.
- **Migration:** All schema changes should be backward-compatible and include migration scripts.
- **Testing:** All new features should be covered by integration and end-to-end tests.
- **Documentation:** Update user and admin guides to reflect new features and workflows.

---

## 8. Appendix: Acceptance Criteria Checklist

- [ ] Admins can define and link cross-domain considerations.
- [ ] Founders can see and activate considerations in the Biz Ops Hub.
- [ ] Activated considerations become actionable tasks in the relevant domain.
- [ ] Dependencies and blockers are visualized.
- [ ] All data model changes are implemented and migrated.
- [ ] Seed data covers all new features.
- [ ] No existing task logic is overwritten.

---

_This document should be updated as implementation progresses and requirements evolve._
