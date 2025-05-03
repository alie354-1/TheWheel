# The Wheel: Journey System Unified Redesign
## Technical Specification & Implementation Plan

**Document Version:** 1.0  
**Date:** May 2, 2025  
**Status:** Draft  
**Author:** Cline  

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Design Principles](#3-design-principles)
4. [Information Architecture](#4-information-architecture)
5. [Data Model](#5-data-model)
6. [Component Architecture](#6-component-architecture)
7. [UI/UX Specifications](#7-uiux-specifications)
8. [Development Plan](#8-development-plan)
9. [Sprint Schedule](#9-sprint-schedule)
10. [Quality Assurance](#10-quality-assurance)
11. [Risk Management](#11-risk-management)
12. [Metrics & Success Criteria](#12-metrics--success-criteria)
13. [Appendices](#13-appendices)

## 1. Executive Summary

The Journey feature of The Wheel platform is being redesigned to address complexity issues, parallel implementations, and inconsistent user experiences. This document provides a comprehensive plan to unify the system around a step-based architecture with a clean, intuitive interface while preserving all existing functionality.

The redesign will:
- Simplify the UI without sacrificing functionality
- Consolidate parallel implementations (steps/challenges)
- Improve the tool selection and evaluation experience
- Ensure journey customization capabilities
- Implement progressive disclosure techniques
- Enhance performance and maintainability

Implementation will occur over five sprints (10 weeks), from data model consolidation through UI development to testing and refinement.

## 2. Problem Statement

### 2.1 Current State Assessment

The Journey system has evolved into a complex feature set with multiple overlapping implementations:

1. **Parallel Data Models**: Existence of both "steps" and "challenges" representing similar concepts
2. **UI Complexity**: Overwhelming interfaces showing too much information at once
3. **Technical Debt**: Duplicate code, inconsistent patterns, and legacy approach
4. **Performance Issues**: Inefficient data loading patterns
5. **Maintenance Challenges**: Difficult to add features or fix bugs due to complexity

### 2.2 Root Causes

1. **Feature Evolution Without Refactoring**: As functionality expanded, new features were added without restructuring
2. **Multiple Implementation Approaches**: Different teams implemented similar features differently
3. **Lack of Unified Vision**: Absence of a comprehensive design system and architecture
4. **Incremental Changes**: Series of small changes eventually created inconsistent UX

### 2.3 Key Requirements

The redesigned Journey system must:

1. **Maintain All Functionality**: No features can be lost
2. **Simplify User Experience**: Cleaner, more intuitive interface
3. **Unite Data Models**: Single consistent approach
4. **Preserve Customization**: Companies must be able to customize their journey
5. **Support Tool Evaluation**: Full tool comparison and selection workflow

## 3. Design Principles

The redesign will adhere to these principles:

1. **Simplicity First**: Clean interfaces showing only what's needed at any moment
2. **Progressive Disclosure**: Reveal complexity only when needed
3. **Consistent Patterns**: Use repeatable UI patterns that become familiar
4. **Visual Hierarchy**: Make important elements stand out
5. **Performance Focus**: Optimize loading patterns and rendering
6. **Component-Based Architecture**: Modular design with reusable components
7. **Test-Driven Development**: Comprehensive testing at unit and integration levels
8. **Mobile-First Approach**: Design for smaller screens first, then expand
9. **Accessibility Standards**: WCAG 2.1 AA compliance

## 4. Information Architecture

### 4.1 Core Concepts

1. **Phases**: Major stages in the startup journey
2. **Steps**: Individual actions or milestones within phases
3. **Tools**: Software or services that help complete steps
4. **Progress**: Company's advancement through their journey

### 4.2 User Flows

1. **Journey Management Flow**:
   - View journey map
   - Customize steps (add, remove, reorder)
   - Track progress
   - Get recommendations

2. **Step Completion Flow**:
   - View step details
   - Select tools
   - Complete tasks
   - Mark step as done

3. **Tool Selection Flow**:
   - View recommendations
   - Compare tools
   - Evaluate options
   - Select final tool

### 4.3 Navigation Structure

1. **Main Navigation**:
   - Dashboard
   - Journey
   - Tools
   - Analytics

2. **Journey Navigation**:
   - Phase navigation
   - Step list/timeline
   - Step details
   - Tool selection

## 5. Data Model

### 5.1 Core Entities

```typescript
// Primary entities
interface JourneyPhase {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

interface JourneyStep {
  id: string;
  name: string;
  description?: string;
  phase_id: string;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  estimated_time_min: number;
  estimated_time_max: number;
  key_outcomes?: string[];
  prerequisite_steps?: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
  is_custom?: boolean;
}

interface CompanyJourneyStep {
  id: string;
  company_id: string;
  step_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  notes?: string;
  custom_difficulty?: number;
  custom_time_estimate?: number;
  completion_percentage?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface Tool {
  id: string;
  name: string;
  description?: string;
  url?: string;
  logo_url?: string;
  type: string;
  category?: string;
  pricing_model?: string;
  is_premium: boolean;
}

interface StepTool {
  id: string;
  step_id: string;
  tool_id: string;
  relevance_score: number;
  created_at: string;
}

interface CompanyStepTool {
  id: string;
  company_id: string;
  step_id: string;
  tool_id: string;
  is_custom: boolean;
  rating?: number;
  notes?: string;
  selected_at?: string;
  created_at: string;
  updated_at: string;
}
```

### 5.2 Database Schema

The database schema will use the following tables:

1. `journey_phases` - Phases of the journey
2. `journey_steps` - Steps within phases
3. `company_journey_steps` - Company progress on steps
4. `tools` - Available tools
5. `step_tools` - Tools associated with steps
6. `company_step_tools` - Company tool selections and ratings
7. `tool_evaluations` - Company evaluations of tools
8. `tool_comparison_criteria` - Criteria for comparing tools

### 5.3 Data Migration Strategy

1. Create unified schema first
2. Migrate challenge data to step format
3. Preserve IDs for backward compatibility
4. Create compatibility views to support legacy code

## 6. Component Architecture

### 6.1 Core Components

1. **Page Components**:
   - JourneyPage
   - StepDetailsPage
   - ToolSelectorPage
   - JourneyEditorPage

2. **Container Components**:
   - JourneyView
   - StepDetailsView
   - ToolSelectorView
   - JourneyEditorView

3. **Presentation Components**:
   - PhaseNavigation
   - StepCard
   - ToolCard
   - StatusBadge
   - DifficultyIndicator
   - TimeEstimate

### 6.2 Component Hierarchy

```
JourneyPage
├── PhaseNavigation
├── JourneyView
│   ├── TimelineView | ListView (toggleable)
│   │   └── StepCard[]
│   │       ├── StatusBadge
│   │       ├── DifficultyIndicator
│   │       └── TimeEstimate
│   └── ActionPanel
│       ├── NextActions
│       └── FilterControls
└── StepPanel
    ├── QuickActions
    └── ToolPreview

StepDetailsPage
├── StepHeader
├── TabNavigation
├── OverviewTab
├── ToolsTab
│   ├── ToolList
│   │   └── ToolCard[]
│   └── ToolComparisonTable
├── GuidanceTab
├── ResourcesTab
└── NotesTab

JourneyEditorPage
├── PhaseSelector
├── StepLibrary
├── JourneyBuilder
│   └── DraggableStepCard[]
└── StepDetailsSidebar
```

### 6.3 State Management

1. **Local State**:
   - UI state (expanded/collapsed sections)
   - Form values
   - Temporary selections

2. **Context-Based State**:
   - Current phase
   - Selected step
   - Filter settings

3. **Server State**:
   - Journey data
   - Step details
   - Tool information
   - Company progress

4. **Custom Hooks**:
   - `useJourneyData`
   - `useStepDetails`
   - `useToolRecommendations`
   - `useCompanyProgress`

## 7. UI/UX Specifications

### 7.1 Main Journey Page

#### Layout

The main journey page uses a clean two-panel layout with an expandable details panel:

1. **Top Section**:
   - Phase navigation bar (horizontal)
   - View toggle (Timeline/List)

2. **Main Section**:
   - Left: Journey visualization (Timeline or List)
   - Right: Action panel with recommendations and filters

3. **Bottom Section** (expandable):
   - Selected step details
   - Quick actions
   - Tool preview

#### Visual Design

- Clean, minimalist interface with ample whitespace
- Color-coding for phases and status indicators
- Card-based design for steps
- Clear visual hierarchy through typography and spacing
- Responsive layout adapting to screen sizes

### 7.2 Timeline View

- Horizontal, scrollable timeline with steps as cards
- Steps grouped by phase with visual separators
- Card height varies by step importance/status
- Drag handles for reordering
- Compact display focusing on essential information
- Visual indicators for relationships between steps

### 7.3 List View

- Vertical list of steps grouped by phase
- Collapsible phase sections
- More detailed step information
- Quick action buttons
- Sortable by different criteria
- Filtering options

### 7.4 Step Details View

- Tab-based interface to organize information
- Overview tab with key details
- Tools tab with recommendations and comparison
- Guidance tab with instructions
- Resources tab with links and documents
- Notes tab for company-specific information

### 7.5 Tool Selection Experience

- Initial view: Top 3 recommendations
- Expandable to show all available tools
- Add to comparison functionality (up to 5 tools)
- Side-by-side comparison table
- Rating and evaluation interface
- Custom tool addition form

### 7.6 Journey Editor

- Three-panel layout:
  - Left: Available steps library
  - Center: Current journey with drag-drop ordering
  - Right: Step details and actions
- Batch operations for multiple steps
- Filtering and searching
- Add custom steps functionality

## 8. Development Plan

### 8.1 Development Approach

1. **Component-First**: Build and test individual components before integration
2. **Feature Flags**: Implement behind feature flags for controlled rollout
3. **Parallel Development**: Work on UI and data model simultaneously
4. **Regular Integration**: Frequent integration to catch issues early
5. **Continuous Testing**: Automated tests for each component and integration

### 8.2 Development Stages

1. **Foundation** (2 weeks):
   - Data model consolidation
   - Core service layer refactoring
   - Component library setup

2. **Core Components** (2 weeks):
   - Basic UI components
   - Layout structure
   - Navigation system

3. **Main Views** (2 weeks):
   - Main journey page
   - Step details
   - Tool selection

4. **Integration** (2 weeks):
   - Feature integration
   - State management
   - API connections

5. **Refinement** (2 weeks):
   - Performance optimization
   - Edge case handling
   - Visual polish

### 8.3 Technical Considerations

1. **Performance Optimization**:
   - Virtualized lists for large data sets
   - Optimistic UI updates
   - Efficient data loading patterns
   - Caching strategies

2. **Accessibility**:
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation
   - Color contrast compliance

3. **Mobile Optimization**:
   - Responsive layouts
   - Touch-friendly interactions
   - Adaptive content presentation

4. **Browser Compatibility**:
   - Testing across major browsers
   - Graceful degradation for older browsers

## 9. Sprint Schedule

### Sprint 1: Data Foundation (May 5 - May 16)

**Objective**: Consolidate data models and establish services

**Key Deliverables**:
- Unified data model for steps (consolidating steps/challenges)
- Migration scripts for existing data
- Core service layer with consistent API
- Database views for backward compatibility
- Unit tests for data layer

**Tasks**:
1. Create unified schema design (3 days)
2. Implement migration scripts (3 days)
3. Develop core service layer (4 days)
4. Create database compatibility views (2 days)
5. Write unit tests (3 days)

### Sprint 2: UI Components (May 19 - May 30)

**Objective**: Build fundamental UI components

**Key Deliverables**:
- StepCard component with variants
- PhaseNavigation component
- ToolCard component
- Base layouts for main views
- Component storybook documentation

**Tasks**:
1. Develop StepCard and variants (3 days)
2. Create PhaseNavigation component (2 days)
3. Build ToolCard component (2 days)
4. Implement TimelineView and ListView (4 days)
5. Create ActionPanel component (2 days)
6. Storybook documentation (2 days)

### Sprint 3: Main Journey Page (June 2 - June 13)

**Objective**: Implement the main journey page

**Key Deliverables**:
- Complete main journey page
- Timeline and list views
- Action panel with recommendations
- Step panel with preview
- State management for journey views

**Tasks**:
1. Implement main page layout (2 days)
2. Develop timeline view interactions (3 days)
3. Build list view with grouping (3 days)
4. Create action panel functionality (3 days)
5. Implement step panel with preview (2 days)
6. Connect components with state management (2 days)

### Sprint 4: Step Details & Tools (June 16 - June 27)

**Objective**: Complete step details and tool selection functionality

**Key Deliverables**:
- Step details page with tabs
- Tool selection and comparison
- Tool evaluation workflow
- Custom tool addition
- Integration with recommendation engine

**Tasks**:
1. Build step details page framework (2 days)
2. Implement tab navigation system (1 day)
3. Create tool selection interface (3 days)
4. Develop tool comparison table (3 days)
5. Build evaluation workflow (3 days)
6. Implement custom tool addition (2 days)
7. Connect to recommendation engine (1 day)

### Sprint 5: Journey Editor & Refinement (June 30 - July 11)

**Objective**: Complete journey editor and refine the entire system

**Key Deliverables**:
- Journey editor with drag-drop
- Custom journey management
- Performance optimizations
- Visual polish
- Comprehensive testing
- User documentation

**Tasks**:
1. Implement journey editor (4 days)
2. Build custom journey management (3 days)
3. Optimize performance (2 days)
4. Visual refinements (2 days)
5. Integration testing (3 days)
6. Create user documentation (1 day)

## 10. Quality Assurance

### 10.1 Testing Strategy

1. **Unit Testing**:
   - Test individual components in isolation
   - Service layer testing
   - Utility function testing

2. **Integration Testing**:
   - Component integration tests
   - API integration tests
   - State management tests

3. **End-to-End Testing**:
   - Key user flows
   - Cross-browser testing
   - Mobile testing

4. **Performance Testing**:
   - Load time measurement
   - Interaction responsiveness
   - Memory usage monitoring

### 10.2 Testing Automation

- Jest for unit and integration tests
- React Testing Library for component tests
- Cypress for end-to-end testing
- Lighthouse for performance testing

### 10.3 Quality Metrics

- 90%+ code coverage for core components
- < 1s initial load time
- < 100ms interaction response time
- 0 a11y violations (WCAG 2.1 AA)
- Cross-browser compatibility (latest 2 versions)

## 11. Risk Management

### 11.1 Identified Risks

1. **Data Migration Complexity**: Existing data may be more complex than anticipated
   - Mitigation: Thorough data analysis before migration, staged migration approach

2. **Feature Regression**: Important functionality could be lost in redesign
   - Mitigation: Comprehensive feature inventory, thorough testing

3. **Performance Issues**: New UI could introduce performance problems
   - Mitigation: Performance testing throughout development, code review focus

4. **User Resistance**: Users may resist changes to familiar workflows
   - Mitigation: Clear communication, gradual rollout, comprehensive documentation

5. **Timeline Slippage**: Complex integration could delay completion
   - Mitigation: Buffer time in schedule, prioritization of critical features

### 11.2 Contingency Plans

1. **Phased Rollout**: Roll out changes gradually with feature flags
2. **Rollback Plan**: Ability to revert to previous implementation if critical issues arise
3. **Alternative Solutions**: Prepare simplified implementations for complex features if needed

## 12. Metrics & Success Criteria

### 12.1 Success Metrics

1. **User Experience Metrics**:
   - Task completion rate
   - Time on task
   - Error rate
   - User satisfaction score

2. **Technical Metrics**:
   - Page load time
   - Interaction response time
   - Bundle size
   - API response time

3. **Business Metrics**:
   - Journey completion rate
   - Tool selection frequency
   - User retention rate
   - Support ticket volume

### 12.2 KPIs for Launch

- 20% reduction in time to complete common tasks
- 30% reduction in support tickets related to journey features
- 95% of existing functionality successfully migrated
- 90% user satisfaction rating in post-launch survey
- 15% increase in journey step completion rate

## 13. Appendices

### 13.1 Component API Specifications

Detailed API documentation for key components:

```typescript
// StepCard Component
interface StepCardProps {
  step: JourneyStep;
  status?: StepStatus;
  mode?: 'compact' | 'standard' | 'detailed';
  isSelected?: boolean;
  isDraggable?: boolean;
  onClick?: (step: JourneyStep) => void;
  onStatusChange?: (stepId: string, status: StepStatus) => void;
  className?: string;
}

// PhaseNavigation Component
interface PhaseNavigationProps {
  phases: JourneyPhase[];
  activePhaseId?: string;
  onPhaseSelect: (phaseId: string) => void;
  showProgress?: boolean;
  className?: string;
}

// ToolCard Component
interface ToolCardProps {
  tool: Tool;
  isRecommended?: boolean;
  relevanceScore?: number;
  isSelected?: boolean;
  isCompared?: boolean;
  onAddToCompare?: (toolId: string) => void;
  onRemoveFromCompare?: (toolId: string) => void;
  onSelect?: (toolId: string) => void;
  onClick?: (tool: Tool) => void;
  className?: string;
}
```

### 13.2 API Endpoints

Core API endpoints for the journey system:

- `GET /api/journey/phases` - Get all journey phases
- `GET /api/journey/steps` - Get steps (filterable)
- `GET /api/journey/steps/:id` - Get step details
- `GET /api/journey/company/:companyId/progress` - Get company progress
- `POST /api/journey/company/:companyId/reorder` - Reorder steps
- `PATCH /api/journey/company/:companyId/step/:stepId` - Update step status
- `GET /api/tools/step/:stepId` - Get tools for step
- `GET /api/tools/recommendations/:stepId/:companyId` - Get personalized recommendations
- `POST /api/tools/company/:companyId/evaluate` - Save tool evaluation

### 13.3 Design System Integration

The journey redesign will fully leverage The Wheel's design system:

- Color palette adhering to design system specifications
- Typography following established hierarchies
- Spacing using the standardized scale
- Component patterns consistent with global patterns
- Icons from the approved icon set

### 13.4 Accessibility Guidelines

All components will adhere to WCAG 2.1 AA standards:

- Proper semantic HTML structure
- ARIA labels and landmarks
- Keyboard navigation support
- Color contrast compliance (minimum 4.5:1)
- Screen reader compatibility
- Focus management
- Touch target sizing (minimum 44x44px)
