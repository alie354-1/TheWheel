# Business Domain to Step Linking: Complete Implementation Plan

This document details the implementation plan for:
1. Completing the domain service functions for domain-step management
2. Designing SQL queries for flexible domain-step relationships
3. Outlining UI components for domain-step management

---

## 1. Complete Implementation of Domain Service Functions

### 1.1. Overview

The domain service functions are the backend logic for managing the relationships between business domains and journey steps/tasks. These functions must support:
- Adding/removing steps to/from domains
- Fetching all steps (and recommendations) for a domain
- Bulk operations
- Step recommendations

### 1.2. Required Functions

#### 1.2.1. `getDomainSteps(domainId, companyId, includeRecommended)`
- **Purpose:** Fetch all steps linked to a domain, optionally including recommended steps.
- **Implementation:**
  - Call the `get_domain_steps` SQL function with the provided parameters.
  - Map the result to the `DomainStep` type.
  - Split results into `steps` and `recommendedSteps` based on the `is_recommended` flag.

#### 1.2.2. `addStepToDomain(domainId, stepId, companyId, options)`
- **Purpose:** Link a step to a domain for a company, with optional metadata.
- **Implementation:**
  - Insert or upsert into `domain_steps` with fields:
    - `domain_id`, `step_id`, `company_id`
    - `is_required`, `relevance_score`, `domain_specific_description`
    - Set `added_by` and `added_at`
  - Enforce uniqueness on `(domain_id, step_id, company_id)`.

#### 1.2.3. `removeStepFromDomain(domainId, stepId, companyId)`
- **Purpose:** Unlink a step from a domain for a company.
- **Implementation:**
  - Delete from `domain_steps` where `domain_id`, `step_id`, and `company_id` match.

#### 1.2.4. `batchAddStepsToDomain(domainId, companyId, stepIds)`
- **Purpose:** Bulk add multiple steps to a domain.
- **Implementation:**
  - Insert multiple rows into `domain_steps` in a single transaction.
  - Use upsert to avoid duplicates.

#### 1.2.5. `generateStepRecommendations(domainId)`
- **Purpose:** Generate and store recommended steps for a domain.
- **Implementation:**
  - Analyze existing steps, company data, and tool usage.
  - Insert recommendations into `domain_step_recommendations`.

#### 1.2.6. Additional Functions
- `updateDomainStepMetadata(domainStepId, key, value)`
- `getDomainStepMetadata(domainStepId)`
- `reorderDomainSteps(domainId, companyId, newOrderArray)`

### 1.3. Error Handling & Validation

- Validate that `domainId`, `stepId`, and `companyId` exist.
- Handle duplicate entries gracefully.
- Ensure referential integrity for all operations.

---

## 2. SQL Queries for Flexible Domain-Step Relationships

### 2.1. Table Structure

- **domain_steps**
  - `id`, `domain_id`, `step_id`, `company_id`, `relevance_score`, `domain_specific_description`, `is_required`, `display_order`, `added_by`, `added_at`
- **domain_step_recommendations**
  - `id`, `domain_id`, `step_id`, `relevance_score`, `recommendation_reason`, `created_at`
- **domain_step_metadata**
  - `id`, `domain_step_id`, `key`, `value`, `created_at`, `updated_at`

### 2.2. Key SQL Operations

#### 2.2.1. Fetch Steps for a Domain

```sql
SELECT
  ds.id,
  ds.step_id,
  js.name,
  js.description,
  ds.domain_specific_description,
  js.difficulty,
  js.time_estimate,
  COALESCE(cjs.status, 'not_started') AS status,
  COALESCE(cjs.completion_percentage, 0) AS completion_percentage,
  jp.name AS phase_name,
  jp.order AS phase_order,
  js.order AS step_order,
  ds.relevance_score,
  ds.is_required,
  false AS is_recommended
FROM
  domain_steps ds
JOIN
  journey_steps js ON ds.step_id = js.id
JOIN
  journey_phases jp ON js.phase_id = jp.id
LEFT JOIN
  company_journey_steps cjs ON ds.step_id = cjs.step_id AND ds.company_id = cjs.company_id
WHERE
  ds.domain_id = $1 AND ds.company_id = $2
```

#### 2.2.2. Fetch Recommended Steps

```sql
SELECT
  gen_random_uuid() AS id,
  js.id AS step_id,
  js.name,
  js.description,
  NULL AS domain_specific_description,
  js.difficulty,
  js.time_estimate,
  'not_started' AS status,
  0 AS completion_percentage,
  jp.name AS phase_name,
  jp.order AS phase_order,
  js.order AS step_order,
  dsr.relevance_score,
  false AS is_required,
  true AS is_recommended
FROM
  domain_step_recommendations dsr
JOIN
  journey_steps js ON dsr.step_id = js.id
JOIN
  journey_phases jp ON js.phase_id = jp.id
WHERE
  dsr.domain_id = $1
  AND NOT EXISTS (
    SELECT 1 FROM domain_steps ds WHERE ds.domain_id = $1 AND ds.step_id = js.id AND ds.company_id = $2
  )
```

#### 2.2.3. Add/Upsert Domain Step

```sql
INSERT INTO domain_steps (
  domain_id, step_id, company_id, is_required, relevance_score, domain_specific_description, added_by, added_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, NOW()
)
ON CONFLICT (domain_id, step_id, company_id) DO UPDATE
SET
  is_required = EXCLUDED.is_required,
  relevance_score = EXCLUDED.relevance_score,
  domain_specific_description = EXCLUDED.domain_specific_description,
  added_by = EXCLUDED.added_by,
  added_at = NOW()
RETURNING id;
```

#### 2.2.4. Remove Domain Step

```sql
DELETE FROM domain_steps
WHERE domain_id = $1 AND step_id = $2 AND company_id = $3;
```

#### 2.2.5. Bulk Add Steps

```sql
-- Use a single INSERT ... ON CONFLICT for all stepIds
```

#### 2.2.6. Metadata Management

```sql
INSERT INTO domain_step_metadata (domain_step_id, key, value)
VALUES ($1, $2, $3)
ON CONFLICT (domain_step_id, key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();
```

---

## 3. UI Components for Domain-Step Management

### 3.1. Domain Step Manager

- **Purpose:** Central UI for managing steps linked to a domain.
- **Features:**
  - List all steps for a domain (with status, relevance, required flag)
  - Add/remove steps (with search/filter)
  - Edit step metadata (description, relevance, required)
  - Drag-and-drop to reorder steps
  - View and add recommended steps

### 3.2. Step Selector

- **Purpose:** UI for searching and selecting steps to add to a domain.
- **Features:**
  - Search by name, phase, difficulty, etc.
  - Filter by recommended, not yet added, etc.
  - Bulk select and add

### 3.3. Domain Step Integration Panel

- **Purpose:** Panel for integrating steps with other domain features.
- **Features:**
  - Show linked tools/resources for each step
  - Show step dependencies and prerequisites
  - Inline editing of domain-specific step details

### 3.4. Recommendations Panel

- **Purpose:** Suggest steps to add to a domain.
- **Features:**
  - List recommended steps with relevance score and reason
  - One-click add to domain
  - Option to dismiss or mark as not relevant

### 3.5. Step Metadata Editor

- **Purpose:** Edit metadata for a domain-step link.
- **Features:**
  - Edit custom description, relevance, required flag, notes
  - Add custom metadata fields

### 3.6. Bulk Operations UI

- **Purpose:** Support bulk add/remove/reorder of steps.
- **Features:**
  - Multi-select steps for batch actions
  - Import/export mappings (CSV/Excel)

---

## 4. Summary

This plan provides a comprehensive approach to:
- Completing backend service logic for domain-step management
- Designing SQL for flexible, metadata-rich relationships
- Outlining robust UI components for admin and end-user management

**Next Steps:**  
- Review and approve this plan  
- Begin implementation in the order above, starting with backend service completion, then SQL, then UI
