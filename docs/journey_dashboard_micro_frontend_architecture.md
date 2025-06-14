# Journey Dashboard Micro Frontend Architecture

## Overview

This document outlines the architecture for implementing the Journey Dashboard using a micro frontend approach with reusable React components. This approach will:

1. Reduce complexity by breaking down large monolithic components
2. Increase reusability through shared component library
3. Enable precise matching to wireframes in both options
4. Improve maintainability and testability
5. Facilitate future enhancements

The dashboard has two layout options:
- **Option 1 (formerly Option 3)**: Combined Layout with side-by-side panels and right sidebar
- **Option 2 (formerly Option 4)**: Tabbed Layout with tab navigation

## Component Library Structure

```
src/components/company/new_journey/
├── components/                  # Shared component library
│   ├── sidebar/                 # Sidebar components
│   │   ├── StepsSidebar.tsx     # Main sidebar container
│   │   ├── StatsBar.tsx         # Stats grid (Total, Active, etc.)
│   │   ├── StepsList.tsx        # List container for steps
│   │   └── StepItem/            # Step item variants
│   │       ├── index.tsx        # Base component
│   │       ├── UrgentStepItem.tsx
│   │       ├── InProgressStepItem.tsx
│   │       └── CompletedStepItem.tsx
│   ├── filters/                 # Filter components
│   │   ├── SearchBar.tsx        # Search input with icon
│   │   ├── FilterButton.tsx     # Filter toggle button
│   │   └── FilterModal.tsx      # Filter popup modal
│   ├── steps/                   # Step content components
│   │   ├── ActiveStepCard.tsx   # Current work step card
│   │   └── RecommendationCard.tsx # Recommended step card
│   ├── business/                # Business health components
│   │   ├── DomainProgressCard.tsx # Domain card with variants
│   │   └── MaturityIndicator.tsx  # Level indicator
│   ├── community/               # Community components
│   │   └── PeerInsightCard.tsx  # Peer insight/quote card
│   └── ui/                      # Generic UI components
│       ├── ExpandableSection.tsx # Collapsible content
│       └── TabNavigation.tsx    # Tab system
├── layouts/                     # Layout components
│   ├── Option1Layout.tsx        # Combined layout (ex-Option 3)
│   └── Option2Layout.tsx        # Tabbed layout (ex-Option 4)
├── pages/                       # Page components
│   ├── NewJourneyDashboard.tsx  # Main dashboard (removed default)
│   ├── Option1Dashboard.tsx     # Option 1 implementation (ex-Option 3)
│   └── Option2Dashboard.tsx     # Option 2 implementation (ex-Option 4)
└── DashboardOptionsNav.tsx      # Options navigation component
```

## Component Specifications

### Sidebar Components

#### `StepsSidebar`

A container for the sidebar elements with consistent styling.

**Props:**
```typescript
interface StepsSidebarProps {
  width?: string;           // Width of sidebar ("260px" or "280px")
  children?: React.ReactNode; // Optional custom content
}
```

**Usage:**
```jsx
<StepsSidebar width="280px">
  <StatsBar stats={statsData} />
  <SearchBar value={search} onChange={setSearch} />
  <FilterButton onClick={openFiltersModal} />
  <StepsList
    urgentSteps={urgentSteps}
    inProgressSteps={inProgressSteps}
    completedSteps={completedSteps}
    onViewStep={handleViewStep}
  />
</StepsSidebar>
```

#### `StatsBar`

Displays a grid of stats with clickable filters.

**Props:**
```typescript
interface StatsData {
  total: number;
  active: number;
  completed: number;
  urgent: number;
}

interface StatsBarProps {
  stats: StatsData;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  showDetails?: boolean;
}
```

**Usage:**
```jsx
<StatsBar 
  stats={stats}
  activeFilter={activeFilter}
  onFilterChange={setActiveFilter}
  showDetails={true}
/>
```

#### `StepItem` Components

Base component with variants for different step states.

**Props:**
```typescript
interface StepItemProps {
  step: NewCompanyJourneyStep;
  onView: (id: string) => void;
  onOpen?: (id: string) => void;
  onDelete?: (id: string) => void;
}
```

**Variants:**
- `UrgentStepItem`: Red styling with due date
- `InProgressStepItem`: Blue styling with progress bar
- `CompletedStepItem`: Green styling with completion date

**Usage:**
```jsx
<UrgentStepItem 
  step={step} 
  onView={handleViewStep} 
  onOpen={handleOpenStep}
  onDelete={handleDeleteStep}
/>
```

### Filter Components

#### `FilterModal`

Modal with filter options for steps.

**Props:**
```typescript
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterUrgent: boolean;
  setFilterUrgent: (value: boolean) => void;
  filterActive: boolean;
  setFilterActive: (value: boolean) => void;
  filterBlocked: boolean;
  setFilterBlocked: (value: boolean) => void;
  filterCompleted: boolean;
  setFilterCompleted: (value: boolean) => void;
  // Domain filters
  domains: string[];
  selectedDomains: string[];
  setSelectedDomains: (domains: string[]) => void;
}
```

**Usage:**
```jsx
<FilterModal
  isOpen={showFiltersModal}
  onClose={() => setShowFiltersModal(false)}
  filterUrgent={filterUrgent}
  setFilterUrgent={setFilterUrgent}
  // ... other filter props
/>
```

### Step Components

#### `ActiveStepCard`

Card showing a step in progress with expandable details.

**Props:**
```typescript
interface ActiveStepCardProps {
  step: NewCompanyJourneyStep;
  progress: number;
  lastWorkedOn: string;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onContinue: (id: string) => void;
  nextTasks?: Array<{id: string; done: boolean; text: string}>;
  // Additional metadata for expanded view
  startDate?: string;
  dueDate?: string;
  timeSpent?: string;
  tools?: string[];
}
```

**Usage:**
```jsx
<ActiveStepCard
  step={step}
  progress={35}
  lastWorkedOn="Today at 8:45 AM"
  expandable={true}
  expanded={expandedPanel === step.id}
  onToggleExpand={() => togglePanel(step.id)}
  onContinue={handleOpenStep}
  nextTasks={[
    {id: '1', done: true, text: 'Complete 5 more customer interviews (5/10 done)'},
    {id: '2', done: false, text: 'Analyze interview responses for patterns'}
  ]}
  startDate="June 5, 2025"
  dueDate="June 19, 2025"
  timeSpent="4.5 hours"
  tools={['Zoom', 'Google Forms']}
/>
```

#### `RecommendationCard`

Card showing a recommended next step with peer insights.

**Props:**
```typescript
interface RecommendationCardProps {
  title: string;
  domain: string;
  description: string;
  peerPercentage: number;
  estimatedTime: string;
  difficulty?: 'Low' | 'Medium' | 'High';
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onStart: () => void;
  // For expanded view
  whyItMatters?: string;
  recommendedTools?: string[];
  iconColor?: string;
}
```

**Usage:**
```jsx
<RecommendationCard
  title="Create User Personas"
  domain="Product"
  description="Natural next step from your customer interviews"
  peerPercentage={86}
  estimatedTime="3-5 days"
  difficulty="Medium"
  expandable={true}
  expanded={expandedPanel === 'personas'}
  onToggleExpand={() => togglePanel('personas')}
  onStart={() => handleStartStep('personas')}
  whyItMatters="User personas provide a shared reference point for design decisions"
  recommendedTools={['Miro', 'Figma', 'UXPressia']}
  iconColor="blue"
/>
```

### Business Health Components

#### `DomainProgressCard`

Card showing domain progress with maturity indicators.

**Props:**
```typescript
interface DomainProgressCardProps {
  domain: string;
  status: 'Active Focus' | 'Maintaining' | 'Future Focus';
  level: number;
  maxLevel: number;
  stepsEngaged: number;
  daysInvested: number;
  strengths?: string[];
  focusAreas?: string[];
  variant: 'compact' | 'summary' | 'detailed';
  activeSteps?: string[];
  onViewDetails?: () => void;
}
```

**Usage:**
```jsx
<DomainProgressCard
  domain="Product Development"
  status="Active Focus"
  level={3}
  maxLevel={5}
  stepsEngaged={5}
  daysInvested={14}
  strengths={['Strong product-market fit indicators']}
  focusAreas={['Customer validation needs more data']}
  variant="detailed"
  activeSteps={['Customer Interviews', 'Define MVP Features']}
  onViewDetails={() => navigate(`/domain/product`)}
/>
```

### Layout Components

#### `Option1Layout` (Combined Layout)

Three-panel layout with sidebar, main content, and right panel.

**Props:**
```typescript
interface Option1LayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
  rightPanel: React.ReactNode;
}
```

**Usage:**
```jsx
<Option1Layout
  sidebar={<StepsSidebar width="280px">{sidebarContent}</StepsSidebar>}
  mainContent={
    <>
      <PageHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActiveWorkPanel>{activeSteps}</ActiveWorkPanel>
        <RecommendationsPanel>{recommendations}</RecommendationsPanel>
      </div>
    </>
  }
  rightPanel={<BusinessHealthSidebar>{businessHealth}</BusinessHealthSidebar>}
/>
```

#### `Option2Layout` (Tabbed Layout)

Two-panel layout with sidebar and tabbed main content.

**Props:**
```typescript
interface Option2LayoutProps {
  sidebar: React.ReactNode;
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

**Usage:**
```jsx
<Option2Layout
  sidebar={<StepsSidebar width="260px">{sidebarContent}</StepsSidebar>}
  tabs={[
    {
      id: 'current',
      label: 'Current Work',
      content: <CurrentWorkTab>{currentWorkContent}</CurrentWorkTab>
    },
    {
      id: 'recommended',
      label: 'Recommended Next Steps',
      content: <RecommendedStepsTab>{recommendedContent}</RecommendedStepsTab>
    },
    {
      id: 'business',
      label: 'Business Health',
      content: <BusinessHealthTab>{businessHealthContent}</BusinessHealthTab>
    }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

## Implementation Approach

### Step 1: Create Shared Components

Create all shared components first. These can be unit tested in isolation.

### Step 2: Build Layout Components

Implement both layout options using the shared components.

### Step 3: Update Navigation

Modify DashboardOptionsNav to remove the default option and rename:
- Option 3 -> Option 1 (Combined Layout)
- Option 4 -> Option 2 (Tabbed Layout)

### Step 4: Connect to Data Hooks

Both layouts should use the same data hooks for consistency:
- useCompanySteps
- useCompanyProgress
- useAIDashboard

### Step 5: Update Router

Ensure the router redirects properly to the new layout components.

## Data Flow

1. Data is fetched via hooks at the page component level
2. Data is passed down to layout components
3. Layout components distribute data to the appropriate shared components
4. User interactions trigger callbacks that bubble up to the page level

## Testing Strategy

- Unit tests for each shared component
- Integration tests for each layout
- End-to-end tests for full page functionality

## Migration Considerations

- Preserve all existing functionality
- Ensure proper data loading states
- Maintain consistent styling with existing design system
