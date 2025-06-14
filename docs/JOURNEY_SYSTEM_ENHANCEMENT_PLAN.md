# Enhanced Startup Journey System: A Comprehensive Guide

## 1. High-Level Vision

The goal is to transform the existing startup journey into a highly functional, user-friendly, and dynamic system that provides real, actionable guidance to founders. This enhanced system will be modular, customizable, and managed through a comprehensive admin interface with robust feature flagging to ensure stability and controlled rollouts.

## 2. Feature Flag Infrastructure

A flexible feature flag system is essential for iterative development, controlled rollouts, and A/B testing.

### 2.1. Database Schema

A new `feature_flags` table will be created to manage all toggleable features.

```sql
-- supabase/migrations/YYYYMMDD_add_feature_flags_table.sql
CREATE TABLE feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  enabled boolean DEFAULT false,
  dependencies text[], -- Array of feature flag names this one depends on
  category text, -- e.g., 'journey', 'analytics', 'ai', 'admin'
  settings jsonb DEFAULT '{}', -- Feature-specific settings (e.g., algorithm variant)
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### 2.2. Feature Flag Service (Backend)

A service will provide a simple interface for checking and managing feature flags.

```typescript
// src/lib/services/feature-flag.service.ts
import { supabase } from './supabaseClient';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  dependencies: string[];
  settings: Record<string, any>;
}

class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();

  async loadFlags() {
    const { data, error } = await supabase.from('feature_flags').select('*');
    if (error) {
      console.error('Error loading feature flags:', error);
      return;
    }
    this.flags = new Map(data.map(flag => [flag.name, flag]));
  }

  isEnabled(featureName: string): boolean {
    const flag = this.flags.get(featureName);
    if (!flag || !flag.enabled) return false;

    // Check dependencies recursively
    if (flag.dependencies && flag.dependencies.length > 0) {
      return flag.dependencies.every(dep => this.isEnabled(dep));
    }

    return true;
  }

  getSettings<T>(featureName: string): T | {} {
    return this.flags.get(featureName)?.settings || {};
  }
}

export const featureFlagService = new FeatureFlagService();
```

### 2.3. React Hook and HOC (Frontend)

These will make it easy to use feature flags in components.

```typescript
// src/lib/hooks/useFeatureFlags.ts
import { useContext } from 'react';
import { FeatureFlagContext } from '../providers/FeatureFlagProvider'; // To be created

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

// src/components/FeatureWrapper.tsx
import React from 'react';
import { useFeatureFlags } from '../lib/hooks/useFeatureFlags';

interface FeatureWrapperProps {
  featureName: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureWrapper: React.FC<FeatureWrapperProps> = ({ featureName, fallback = null, children }) => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(featureName) ? <>{children}</> : <>{fallback}</>;
};
```

## 3. Enhanced Data Model for Journey Management

To support a dynamic and manageable journey, the data model needs to be expanded.

```sql
-- supabase/migrations/YYYYMMDD_add_journey_management_tables.sql

-- Phases (e.g., Company Setup, Planning, Pre-launch)
CREATE TABLE phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_index integer NOT NULL,
  is_active boolean DEFAULT true
);

-- Domains (e.g., Marketing, Finance, Product)
CREATE TABLE domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true
);

-- Master step templates (reusable definitions)
CREATE TABLE step_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  base_description text,
  category text,
  is_active boolean DEFAULT true
);

-- Steps (specific instances at the intersection of phase and domain)
CREATE TABLE steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES step_templates(id),
  phase_id uuid REFERENCES phases(id),
  domain_id uuid REFERENCES domains(id),
  name text NOT NULL, -- Can be customized from template
  description text, -- Can be customized from template
  why_this_now text,
  estimated_time text,
  effort_difficulty text,
  order_index integer NOT NULL,
  depends_on uuid[], -- Array of step IDs
  is_active boolean DEFAULT true,
  UNIQUE(phase_id, domain_id, template_id)
);

-- Tasks within steps
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid REFERENCES steps(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL,
  is_required boolean DEFAULT true
);

-- Tools library
CREATE TABLE tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  website_url text,
  logo_url text,
  is_active boolean DEFAULT true
);

-- Step-Tool relationships (many-to-many)
CREATE TABLE step_tools (
  step_id uuid REFERENCES steps(id) ON DELETE CASCADE,
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  is_recommended boolean DEFAULT false,
  usage_notes text,
  PRIMARY KEY (step_id, tool_id)
);
```

## 4. Admin UI for Journey Management

A dedicated section in the admin panel for managing the entire journey structure.

### 4.1. Component Architecture

```
src/pages/admin/journey/
├── JourneyAdminDashboard.tsx    // Overview & navigation
├── phases/
│   ├── PhaseManager.tsx         // List, create, edit phases
├── domains/
│   ├── DomainManager.tsx        // List, create, edit domains
├── steps/
│   ├── StepManager.tsx          // Grid view of steps by phase/domain
│   ├── StepTemplateManager.tsx  // Manage reusable templates
│   └── StepEditor.tsx           // Edit step details, tasks, tools, dependencies
├── tools/
│   ├── ToolManager.tsx          // Tool library management
└── feature-flags/
    └── FeatureFlagManager.tsx   // UI to toggle features
```

### 4.2. Key Admin Components

*   **FeatureFlagManager**: A UI to view, toggle, and configure all feature flags. It will show dependencies and warn admins if enabling a flag would violate a dependency.
*   **StepManager**: A matrix view with Phases as columns and Domains as rows. Each cell will show the number of steps and provide a link to the `StepEditor` for that specific phase/domain combination.
*   **StepEditor**: A comprehensive form for a single step. It will use tabs to manage:
    *   Basic Info (Name, Description, Time, Difficulty)
    *   Guidance Content ("Why This Now", "Key Considerations")
    *   Dependencies (a visual or list-based editor to link to other steps)
    *   Tasks (a re-orderable list of tasks for the step)
    *   Tools (a searchable interface to link tools from the library)
*   **ToolManager**: A library of all available tools, allowing admins to add, edit, and categorize tools that can then be assigned to steps.

## 5. Founder-Facing Journey Enhancement

The user-facing journey will be rebuilt as a set of modular, feature-flagged components.

### 5.1. Component Architecture

```
src/components/journey/enhanced/
├── core/
│   ├── JourneyProvider.tsx          # Context for journey state, feature flags
│   ├── StepCard.tsx                 # Base display for a step
│   └── StepPageLayout.tsx           # Main layout for a step page
├── features/
│   ├── StepDependencies.tsx         # Shows required steps
│   ├── ContextualGuidance.tsx       # "Why this now", "Risk Assessment" panels
│   ├── ToolHub.tsx                  # Recommended tools for the step
│   ├── PeerInsights.tsx             # "Founders doing this now", success stories
│   ├── EnhancedProgress.tsx         # Velocity tracking, blocker identification
│   └── AIAssistant.tsx              # Step-specific prompts, document generation
└── FounderCentricStepPage.tsx       # Assembles all components
```

### 5.2. Example: `FounderCentricStepPage.tsx`

This page will dynamically assemble itself based on active feature flags.

```tsx
// src/components/journey/enhanced/FounderCentricStepPage.tsx
import React from 'react';
import { FeatureWrapper } from '../FeatureWrapper';
import { StepPageLayout } from './core/StepPageLayout';
import { StepHeader } from './core/StepHeader'; // Contains title, description
import { StepDependencies } from './features/StepDependencies';
import { ContextualGuidance } from './features/ContextualGuidance';
import { ToolHub } from './features/ToolHub';
import { PeerInsights } from './features/PeerInsights';
import { EnhancedProgress } from './features/EnhancedProgress';
import { AIAssistant } from './features/AIAssistant';

export const FounderCentricStepPage: React.FC = () => {
  // ... logic to fetch step data ...

  return (
    <StepPageLayout>
      <StepHeader step={step} />

      <FeatureWrapper featureName="journey.dependencies">
        <StepDependencies step={step} />
      </FeatureWrapper>

      <FeatureWrapper featureName="journey.contextual_guidance">
        <ContextualGuidance step={step} />
      </FeatureWrapper>
      
      <FeatureWrapper featureName="journey.tool_hub">
        <ToolHub step={step} />
      </FeatureWrapper>

      <FeatureWrapper featureName="journey.peer_insights">
        <PeerInsights step={step} />
      </FeatureWrapper>

      <FeatureWrapper featureName="journey.ai_assistant">
        <AIAssistant step={step} />
      </FeatureWrapper>

      <FeatureWrapper featureName="journey.enhanced_progress">
        <EnhancedProgress step={step} />
      </FeatureWrapper>
    </StepPageLayout>
  );
};
```

## 6. Implementation & Migration Strategy

1.  **Phase 1: Infrastructure Setup**
    *   Create and apply the new database migrations for feature flags and journey management tables.
    *   Implement the `FeatureFlagService` and the `useFeatureFlags` hook.
    *   Create the basic Admin UI for managing feature flags.

2.  **Phase 2: Data Migration**
    *   Write a script to migrate the data from the existing `phases and steps.csv` into the new normalized database structure (`phases`, `domains`, `steps`, `tasks`, `tools`).

3.  **Phase 3: Admin Panel Development**
    *   Build the admin UI components for managing Phases, Domains, Steps, Tasks, and Tools as outlined above.

4.  **Phase 4: Founder-Facing Component Development**
    *   Build the new, modular `enhanced` journey components. Each new feature (e.g., `ToolHub`, `PeerInsights`) will be built within its own component and wrapped in a `FeatureWrapper`.

5.  **Phase 5: Staged Rollout**
    *   In the main application, use a top-level feature flag (`journey.use_enhanced_view`) to switch between the old `JourneyStepPage` and the new `FounderCentricStepPage`.
    *   Use the admin panel to selectively enable the new sub-features for internal testing, then for a subset of users, and finally for everyone.
    *   This ensures a safe, controlled transition with zero downtime and the ability to instantly revert if issues are found.

## 7. Advanced Implementation Considerations

### 7.1. Real-time Feature Flag Propagation

To ensure changes from the admin panel are reflected immediately without a service restart, we will use Supabase Realtime subscriptions.

**Enhanced `FeatureFlagService` with Real-time Updates:**

```typescript
// src/lib/services/feature-flag.service.ts (Enhanced)
import { supabase, RealtimeChannel } from './supabaseClient';
import { EventEmitter } from 'events';

class FeatureFlagService extends EventEmitter {
  private flags: Map<string, FeatureFlag> = new Map();
  private subscription: RealtimeChannel | null = null;

  async initialize() {
    await this.loadFlags();
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = supabase
      .channel('feature_flags_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'feature_flags'
      }, (payload) => {
        this.handleFlagChange(payload);
      })
      .subscribe();
  }

  private handleFlagChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        this.flags.set(newRecord.name, newRecord);
        break;
      case 'DELETE':
        this.flags.delete(oldRecord.name);
        break;
    }
    this.emit('flags-updated');
  }
  // ... other methods
}
```

### 7.2. Dependency Management User Experience

A visual editor is crucial for managing complex step dependencies.

**Visual Dependency Editor Component:**

```typescript
// src/components/admin/journey/steps/DependencyGraphEditor.tsx
import React, { useState } from 'react';
import Graph from 'react-graph-vis'; // Example library
import { toast } from 'react-toastify';

// ... (props and other imports)

export const DependencyGraphEditor: React.FC<DependencyGraphEditorProps> = ({
  currentStep,
  allSteps,
  onUpdate
}) => {
  // ... logic to format steps and edges for the graph library ...

  const handleUpdateDependencies = (newDeps) => {
    if (hasCircularDependency(currentStep.id, newDeps)) {
      toast.error('Circular dependency detected!');
    } else {
      onUpdate(newDeps);
    }
  };

  return (
    <div className="dependency-editor">
      <h4>Visual Dependency Editor for: {currentStep.name}</h4>
      <Graph
        graph={graphData}
        options={options}
        events={{ select: handleNodeSelect }}
      />
      <p>Select nodes to add or remove dependencies.</p>
    </div>
  );
};
```

**Database-level Circular Dependency Check:**

```sql
-- supabase/migrations/YYYYMMDD_add_dependency_check_trigger.sql
CREATE OR REPLACE FUNCTION check_step_dependencies()
RETURNS TRIGGER AS $$
DECLARE
  has_circular BOOLEAN;
BEGIN
  WITH RECURSIVE dependency_path AS (
    SELECT id, depends_on, ARRAY[id] as path
    FROM steps
    WHERE id = NEW.id
    UNION ALL
    SELECT s.id, s.depends_on, dp.path || s.id
    FROM steps s
    JOIN dependency_path dp ON s.id = ANY(dp.depends_on)
    WHERE NOT s.id = ANY(dp.path)
  )
  SELECT EXISTS (
    SELECT 1 FROM dependency_path 
    WHERE NEW.id = ANY(depends_on)
  ) INTO has_circular;
  
  IF has_circular THEN
    RAISE EXCEPTION 'Circular dependency detected for step %', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_dependencies_before_update
  BEFORE UPDATE ON steps
  FOR EACH ROW
  WHEN (OLD.depends_on IS DISTINCT FROM NEW.depends_on)
  EXECUTE FUNCTION check_step_dependencies();
```

### 7.3. Performance Optimization Strategies

To avoid performance bottlenecks from complex joins, we will use a combination of database views and RPC functions.

**Materialized View for General-Purpose Reading:**

```sql
-- supabase/migrations/YYYYMMDD_create_step_details_view.sql
CREATE MATERIALIZED VIEW step_details_view AS
SELECT 
  s.id as step_id,
  s.name as step_name,
  s.description as step_description,
  p.name as phase_name,
  d.name as domain_name,
  (SELECT json_agg(t.*) FROM tasks t WHERE t.step_id = s.id) as tasks,
  (SELECT json_agg(tools.*) 
   FROM tools 
   JOIN step_tools st ON st.tool_id = tools.id 
   WHERE st.step_id = s.id) as tools
FROM steps s
JOIN phases p ON s.phase_id = p.id
JOIN domains d ON s.domain_id = d.id;

-- Function to refresh the view
CREATE OR REPLACE FUNCTION refresh_step_details_view()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY step_details_view;
  RETURN NULL;
END;
$$;

-- Trigger to refresh on changes
CREATE TRIGGER refresh_view_on_change
  AFTER INSERT OR UPDATE OR DELETE ON steps
  FOR EACH STATEMENT EXECUTE PROCEDURE refresh_step_details_view();
-- (Additional triggers on tasks, tools, etc. are also needed)
```

**RPC Function for Single-Page Data Fetching:**

For the `FounderCentricStepPage`, a dedicated RPC function will gather all data in one call.

```sql
-- supabase/migrations/YYYYMMDD_create_get_step_page_data_rpc.sql
CREATE OR REPLACE FUNCTION get_step_page_data(p_step_id uuid)
RETURNS json AS $$
DECLARE
  step_data json;
BEGIN
  SELECT json_build_object(
    'step', row_to_json(s.*),
    'phase', row_to_json(p.*),
    'domain', row_to_json(d.*),
    'tasks', (SELECT json_agg(t.*) FROM tasks t WHERE t.step_id = s.id),
    'tools', (SELECT json_agg(tools.*) FROM tools JOIN step_tools st ON st.tool_id = tools.id WHERE st.step_id = s.id),
    'dependencies', (SELECT json_agg(dep.*) FROM steps dep WHERE dep.id = ANY(s.depends_on))
  )
  INTO step_data
  FROM steps s
  JOIN phases p ON s.phase_id = p.id
  JOIN domains d ON s.domain_id = d.id
  WHERE s.id = p_step_id;
  
  RETURN step_data;
END;
$$ LANGUAGE plpgsql;
```
