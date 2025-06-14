# New Journey System: Frontend Component Architecture Plan

This document outlines the complete frontend architecture for the new Journey System. It details the file structure, component hierarchy, state management, and data flow, ensuring a modular and maintainable implementation that aligns with the MRD/PRD wireframes and existing application patterns.

## 1. Guiding Principles

- **Component-Based Architecture**: The UI is broken down into small, reusable components, each with a single responsibility.
- **Strict Separation**: All new frontend code will reside in `src/components/company/new_journey/`. No new code will be placed in the legacy `journey` directory.
- **Centralized Routing**: A new router, `NewJourneyRouter.tsx`, will manage all navigation within the new module.
- **Hook-Based Logic**: Business logic and state management will be extracted into custom hooks (e.g., `useNewJourneyDashboard`, `useNewStepDetails`) to keep components clean and focused on rendering.
- **Existing Patterns**: We will leverage existing UI components (modals, buttons, tables) and hooks (`useCompany`, `useAuth`) wherever possible to maintain UI consistency and development speed.

---

## 2. Directory Structure

The entire new module will live inside `src/components/company/new_journey/`.

```
src/components/company/new_journey/
├── NewJourneyRouter.tsx         # Main router for the new journey module

├── pages/
│   ├── NewJourneyDashboard.tsx    # Main dashboard page (Wireframe 3.1)
│   ├── BrowseStepsPage.tsx      # Page for browsing all framework steps (Wireframe 3.2)
│   └── StepDetailPage.tsx         # Detailed view of a single step (Wireframe 3.3)

├── components/
│   ├── DashboardSidebar.tsx       # Left sidebar with stats and filters (Wireframe 3.1)
│   ├── RecommendedNextStep.tsx    # "Recommended Next Step" card on dashboard
│   ├── PeerInsights.tsx           # "Peer Insights" card on dashboard
│   ├── YourProgress.tsx           # "Your Progress" chart on dashboard
│   ├── BrowseStepsTable.tsx       # Table for the "Browse Available Steps" page
│   ├── StepDetailPanels.tsx       # Container for all panels on the step detail page
│   ├── OutcomeCaptureModal.tsx    # Modal for capturing results (Wireframe 3.4)
│   ├── StandupBotWidget.tsx       # WebSocket chat widget for standups
│   └── AdaptiveSuggestions.tsx    # Displays AI-generated suggestions post-outcome

└── hooks/
    ├── useNewJourneyDashboard.ts  # Fetches all data for the main dashboard
    ├── useBrowseSteps.ts          # Logic for the browse steps page (fetching, filtering)
    ├── useStepDetails.ts          # Fetches all data for a single step
    └── useOutcomeCapture.ts       # Manages state and submission for the outcome modal
```

---

## 3. Component Specifications & Wireframe Mapping

### 3.1. Main Pages

**`pages/NewJourneyDashboard.tsx`** (Maps to Wireframe 3.1)
- **Responsibility**: Renders the main dashboard layout.
- **State Management**: Uses the `useNewJourneyDashboard` hook to fetch all necessary data.
- **Children**:
    - `DashboardSidebar`
    - `RecommendedNextStep`
    - `PeerInsights`
    - `YourProgress`
- **Data Flow**: Passes fetched data down to child components as props.

**`pages/BrowseStepsPage.tsx`** (Maps to Wireframe 3.2)
- **Responsibility**: Allows users to browse, filter, and start steps from the canonical framework.
- **State Management**: Uses the `useBrowseSteps` hook.
- **Children**: `BrowseStepsTable`.

**`pages/StepDetailPage.tsx`** (Maps to Wireframe 3.3)
- **Responsibility**: Displays the complete view of a single company step.
- **State Management**: Uses the `useStepDetails` hook, which takes a `stepId` from the URL.
- **Children**: `StepDetailPanels`, `StandupBotWidget`.
- **Actions**: Contains "Mark Complete" and "Skip" buttons. Clicking "Mark Complete" will open the `OutcomeCaptureModal`.

### 3.2. Dashboard Components (Wireframe 3.1)

**`components/DashboardSidebar.tsx`**
- **Props**: `stats: { total, active, complete, urgent }`, `filters`, `onFilterChange`
- **Responsibility**: Displays real-time stats and filter controls. Fetches data via its parent.

**`components/RecommendedNextStep.tsx`**
- **Props**: `step: NewJourneyStep`
- **Responsibility**: Displays the single highest-priority recommended step.
- **Action**: "Start Step" button calls `new_company_journey.service.ts`.

**`components/PeerInsights.tsx`**
- **Props**: `insights: { averageTime, topTool, usagePercent }`
- **Responsibility**: Displays anonymized community data for context.

**`components/YourProgress.tsx`**
- **Props**: `progress: { [domainName: string]: number }`
- **Responsibility**: Renders a chart (e.g., bar chart) showing completion percentage by domain.

### 3.3. Core Feature Components

**`components/BrowseStepsTable.tsx`** (Maps to Wireframe 3.2)
- **Props**: `steps: NewJourneyStep[]`, `onStartStep: (stepId) => void`
- **Responsibility**: Renders a filterable, searchable table of framework steps.
- **Pattern**: Will reuse the existing `Table` component from the application's design system.

**`components/StepDetailPanels.tsx`** (Maps to Wireframe 3.3)
- **Props**: `step: NewCompanyJourneyStep`, `tasks: NewStepTask[]`
- **Responsibility**: A container component that renders all the individual panels for a step.
- **Children**:
    - `WhyThisMattersPanel`
    - `DeliverablesPanel`
    - `DependenciesPanel`
    - `InteractiveTaskList` (with checkboxes that call `new_company_journey.service.ts` to update task status)
    - `AIPanel` (for suggestions)
    - `ToolsPanel`
    - `TemplatesPanel`
    - `CommunityIntelligencePanel`

**`components/OutcomeCaptureModal.tsx`** (Maps to Wireframe 3.4)
- **Responsibility**: Provides the form for capturing step outcomes.
- **State Management**: Uses the `useOutcomeCapture` hook to manage form state.
- **Action**: The "Submit" button calls the `captureOutcome` method from the hook, which in turn calls `new_journey_features.service.ts`.
- **Children**: `AdaptiveSuggestions` component is displayed within this modal as the user fills out the form.

---

## 4. Hooks (Business Logic)

**`hooks/useNewJourneyDashboard.ts`**
- **Responsibility**: A single hook to encapsulate all data fetching for the main dashboard.
- **Logic**:
    1.  Uses `useCompany()` to get the `companyId`.
    2.  Calls `new_company_journey.service.ts` to get step stats.
    3.  Calls `new_journey_features.service.ts` to get the recommended step and peer insights.
    4.  Returns a single object: `{ isLoading, stats, recommendedStep, insights, progress }`.

**`hooks/useStepDetails.ts`**
- **Input**: `companyStepId: string`
- **Responsibility**: Fetches all data related to a single step.
- **Logic**:
    1.  Fetches the core step data from `company_journey_steps_new`.
    2.  Fetches associated tasks from `step_tasks_new`.
    3.  Fetches community insights, tools, templates, etc.
    4.  Returns `{ isLoading, step, tasks, ... }`.

---

## 5. Routing

**`NewJourneyRouter.tsx`**
- **Responsibility**: Defines all routes for the module.
- **Integration**: This router will be lazy-loaded in the main `App.tsx` under the path `/new-journey`.
- **Routes**:
    - `/`: Renders `NewJourneyDashboard`.
    - `/browse`: Renders `BrowseStepsPage`.
    - `/step/:stepId`: Renders `StepDetailPage`.

This architecture provides a clear separation of concerns, aligns directly with the MRD, and sets a solid, scalable foundation for the new Journey System's user interface.
