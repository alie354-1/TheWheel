# System Admin UI for Domain-Step-Tool Mapping

## Executive Summary

This document outlines the implementation plan for a System Administrator UI that will manage the relationships between business domains, journey steps, and tools, including their phase mappings. The UI will enable administrators to configure default mappings and setup dropdowns throughout the system. The solution leverages existing components and services from the journey system but adapts them for administrative use.

---

## Background

The current system has tables and relationships for domains, steps, tools, and phases, but lacks a dedicated administrative interface to manage these mappings comprehensively. Administrators need the ability to:
1. Map domains to relevant steps
2. Organize steps within phases
3. Associate appropriate tools with steps
4. Configure default settings for these relationships
5. Set tool rankings (on a 1-3 scale, not 1-10)
6. Configure initial step cards

---

## Technical Architecture

### Data Model

The solution will primarily work with these existing data structures:

- **Domains**: `business_domains` and `company_domains` tables
- **Steps**: `journey_steps` table with its related metadata
- **Tools**: Journey step tools and their rankings
- **Phases**: Journey phases for organization
- **Mappings**: `domain_steps` for domain-step relationships

### Component Architecture

```
src/
└── admin/
    ├── pages/
    │   ├── DomainStepMappingPage.tsx      # Main admin page
    │   └── ToolRankingConfigPage.tsx      # Tool configuration page
    ├── components/
    │   ├── domain-mapping/
    │   │   ├── DomainList.tsx             # List of domains with search/filter
    │   │   ├── DomainDetail.tsx           # Domain details and settings
    │   │   ├── DomainStepManager.tsx      # Map steps to domains
    │   │   └── BatchOperationsPanel.tsx   # Bulk operations UI
    │   ├── step-configuration/
    │   │   ├── StepCardEditor.tsx         # Configure step cards
    │   │   ├── StepPhaseOrganizer.tsx     # Organize steps by phase
    │   │   ├── PhaseList.tsx              # Phase management
    │   │   └── StepDetail.tsx             # Step details and settings
    │   └── tool-mapping/
    │       ├── ToolRankingEditor.tsx      # Set tool rankings (1-3)
    │       ├── ToolSelector.tsx           # Tool selection interface
    │       ├── ToolCategoryManager.tsx    # Manage tool categories
    │       └── DefaultToolConfigurator.tsx # Set default tools
    └── services/
        ├── adminMappingService.ts         # Service for admin mapping operations
        ├── defaultConfigService.ts        # Manage default configurations
        └── adminToolService.ts            # Tool ranking and association
```

---

## User Stories & Engineering Tasks

### Epic 1: Domain Management Interface

#### User Story 1.1: Domain Listing and Navigation
**As a** system administrator  
**I want to** view a list of all business domains  
**So that** I can navigate to manage their mappings

**Acceptance Criteria:**
- List displays all business domains with name, description, and basic stats
- Search and filter capabilities by domain name and attributes
- Sorting options by various criteria
- Visual indicators showing domains with/without mapped steps

**Engineering Tasks:**
- Create `DomainList.tsx` component with search and filter functionality
- Implement search by domain name and description
- Add filters for domains with/without steps
- Create sorting options by name, creation date, number of steps
- Implement domain statistics service to show mapping metrics
- Integrate with existing domain service from `domain.service.ts`
- Create responsive layout with pagination for large domain lists
- Add quick-action buttons for "Add Domain", "Edit", "Delete"

#### User Story 1.2: Domain Detail and Settings
**As a** system administrator  
**I want to** view and edit details for a specific domain  
**So that** I can configure its properties and mappings

**Acceptance Criteria:**
- Editable fields for domain name, description, icon, color, order
- Display of all steps mapped to the domain
- Button to open step mapping interface

**Engineering Tasks:**
- Create `DomainDetail.tsx` component
- Integrate with domain update and delete services
- Display domain metadata and allow editing
- Show list of mapped steps with quick links to step configuration

---

### Epic 2: Step Mapping and Configuration

#### User Story 2.1: Map Steps to Domain
**As a** system administrator  
**I want to** add, remove, and reorder steps for a domain  
**So that** I can define the journey for each domain

**Acceptance Criteria:**
- Add steps from a searchable dropdown (populated from all journey steps)
- Remove steps from domain
- Drag-and-drop to reorder steps
- Batch add/remove steps

**Engineering Tasks:**
- Create `DomainStepManager.tsx` with add/remove/reorder UI
- Use `getDomainSteps`, `addStepToDomain`, `removeStepFromDomain`, `batchAddStepsToDomain` from `domain.service.ts`
- Implement drag-and-drop using existing journey components
- Add batch operations panel for multi-step actions

#### User Story 2.2: Step Card Configuration
**As a** system administrator  
**I want to** configure the details of each step card  
**So that** I can set custom names, descriptions, priorities, and initial settings

**Acceptance Criteria:**
- Editable fields for custom name, description, difficulty, time estimate, notes
- Preview of step card as it will appear to users
- Option to set as required/optional
- Ability to set initial status and phase

**Engineering Tasks:**
- Create `StepCardEditor.tsx` for editing step card details
- Integrate with domain step update service
- Implement live preview of step card
- Add validation for required fields

#### User Story 2.3: Organize Steps by Phase
**As a** system administrator  
**I want to** organize steps into phases  
**So that** the journey is structured and visualized by phase

**Acceptance Criteria:**
- Steps can be assigned to phases via dropdown or drag-and-drop
- Phases are displayed in order with their steps
- Visual indicators for phase completion

**Engineering Tasks:**
- Create `StepPhaseOrganizer.tsx` and `PhaseList.tsx`
- Integrate with journey phase data and update services
- Implement drag-and-drop for phase assignment
- Display phase progress and completion stats

---

### Epic 3: Tool Mapping and Ranking

#### User Story 3.1: Associate Tools with Steps
**As a** system administrator  
**I want to** associate tools with each step  
**So that** users have recommended tools for each step

**Acceptance Criteria:**
- Add/remove tools from a searchable dropdown (populated from all tools)
- Display tool details (name, description, logo, url, category)
- Set tool as default for step

**Engineering Tasks:**
- Create `ToolSelector.tsx` and `ToolCategoryManager.tsx`
- Integrate with tool mapping services
- Display tool details and allow editing
- Add/remove tool association for steps

#### User Story 3.2: Tool Ranking (1-3 Scale)
**As a** system administrator  
**I want to** set the ranking of each tool for a step (1-3 scale)  
**So that** the best tools are surfaced to users

**Acceptance Criteria:**
- Visual ranking selector (1-3) for each tool
- Rankings are saved and displayed in order
- Validation to ensure only 1-3 scale is used

**Engineering Tasks:**
- Create `ToolRankingEditor.tsx` with 1-3 scale UI
- Integrate with tool ranking update service
- Display rankings in tool list
- Add validation and error handling

#### User Story 3.3: Set Default Tools
**As a** system administrator  
**I want to** set default tools for steps and categories  
**So that** new domains/steps inherit recommended tools

**Acceptance Criteria:**
- UI to set default tools for each step/category
- Defaults are applied when new mappings are created

**Engineering Tasks:**
- Create `DefaultToolConfigurator.tsx`
- Integrate with default config service
- Apply defaults on new domain/step creation

---

### Epic 4: Bulk Operations and Templates

#### User Story 4.1: Bulk Import/Export
**As a** system administrator  
**I want to** import/export mappings in bulk  
**So that** I can manage large sets of data efficiently

**Acceptance Criteria:**
- Import from CSV/Excel for domains, steps, tools, phases
- Export current mappings to CSV/Excel

**Engineering Tasks:**
- Create `BatchOperationsPanel.tsx` for import/export
- Integrate with backend import/export endpoints
- Add file validation and error reporting

#### User Story 4.2: Template Management
**As a** system administrator  
**I want to** create and apply templates for common domain/step/tool configurations  
**So that** I can quickly setup new domains

**Acceptance Criteria:**
- Save current mappings as a template
- Apply template to new/existing domains

**Engineering Tasks:**
- Extend `defaultConfigService.ts` for template management
- UI for saving/applying templates
- Integrate with domain/step/tool mapping services

---

### Epic 5: Audit, Versioning, and History

#### User Story 5.1: Change History
**As a** system administrator  
**I want to** view the history of changes to mappings  
**So that** I can audit and revert changes if needed

**Acceptance Criteria:**
- Display change log for domains, steps, tools
- Option to revert to previous state

**Engineering Tasks:**
- Integrate with logging/audit services
- UI for viewing and reverting changes

---

## Additional Notes

- Tool rankings must use a 1-3 scale (not 1-10)
- Leverage as much as possible from existing journey and tool selector components
- Dropdowns and search fields should be populated from live data
- All admin actions should be permission-gated
- Use existing Supabase services for data operations

---

## Implementation Timeline (Suggested)

1. Domain management UI (listing, detail, CRUD)
2. Step mapping and configuration (mapping, card editor, phase organizer)
3. Tool mapping and ranking (selector, ranking, default config)
4. Bulk operations and template management
5. Audit and versioning features

---

## References

- `src/business-ops-hub/services/domain.service.ts`
- `src/business-ops-hub/services/recommendation.service.ts`
- `src/lib/types/journey.types.ts`
- `src/components/company/journey/ToolSelector/`
- `src/components/company/journey/StepCard/`
- `docs/TOOL_SELECTION_AND_EVALUATION_FLOW.md`
- `docs/JOURNEY_STEP_PAGE_IMPLEMENTATION.md`
- `docs/BUSINESS_OPERATIONS_HUB_IMPLEMENTATION_PLAN.md`
