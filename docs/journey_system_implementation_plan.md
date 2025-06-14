# Journey System Implementation Plan

## Executive Summary

This plan outlines the migration from the current journey system to the new comprehensive Journey System design, leveraging 80% of existing code while adding customization, learning, and community intelligence capabilities.

## Project Overview

- **Timeline**: 4-6 weeks
- **Code Reuse**: ~80% of existing journey/community components
- **Approach**: Incremental enhancement rather than rewrite
- **Risk Level**: Low (preserving proven UX patterns)

## Phase 1: Database Schema & Foundation (Week 1)

### 1.1 Core Architecture: Base Framework vs Company Steps

The Journey System uses a two-tier architecture that separates the canonical 150-step framework from company-specific implementations:

```
┌─────────────────────────────────────────┐
│           CANONICAL FRAMEWORK           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        journey_steps            │   │
│  │     (~150 base steps)           │   │
│  │                                 │   │
│  │  - Master template steps        │   │
│  │  - Maintained by platform      │   │
│  │  - Read-only for companies     │   │
│  │  - Source of truth             │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
                    │
                    │ Templates/Imports
                    ▼
┌─────────────────────────────────────────┐
│         COMPANY IMPLEMENTATIONS         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    company_journey_steps        │   │
│  │   (company-specific steps)      │   │
│  │                                 │   │
│  │  - Customized for each company  │   │
│  │  - Can be modified/reordered    │   │
│  │  - Progress tracking           │   │
│  │  - Custom fields              │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 1.2 Schema Implementation

#### Core Framework Tables (Platform-Managed)

```sql
-- Core journey structure
CREATE TABLE journey_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE journey_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  primary_phases TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Master template of ~150 steps - maintained by platform
CREATE TABLE journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  primary_phase_id UUID REFERENCES journey_phases(id),
  primary_domain_id UUID REFERENCES journey_domains(id),
  secondary_phase_id UUID REFERENCES journey_phases(id),
  secondary_domain_id UUID REFERENCES journey_domains(id),
  order_index INTEGER,
  difficulty VARCHAR(20),
  estimated_days INTEGER,
  deliverables TEXT[],
  success_criteria TEXT[],
  common_blockers TEXT[],
  coverage_notes TEXT,
  howto_without_tools TEXT,
  audience TEXT,
  resource_links TEXT[],
  snippet_references TEXT[],
  
  -- Template metadata
  is_required BOOLEAN DEFAULT false,
  prerequisites TEXT[], -- Step IDs that should come before
  suggested_next TEXT[], -- Step IDs commonly done after
  
  -- Framework management
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active', -- active, deprecated, draft
  created_by UUID, -- Platform admin who created
  updated_by UUID, -- Platform admin who last updated
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step relationships in the canonical framework
CREATE TABLE step_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_step_id UUID REFERENCES journey_steps(id),
  to_step_id UUID REFERENCES journey_steps(id),
  relationship_type VARCHAR(50), -- 'prerequisite', 'suggested_next', 'alternative'
  probability_weight DECIMAL(3,2), -- 0.00 to 1.00
  conditions JSONB, -- When this relationship applies
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tool recommendations for base steps
CREATE TABLE step_tools (
  step_id UUID REFERENCES journey_steps(id),
  tool_id UUID REFERENCES journey_tools(id),
  relevance_score DECIMAL(2,1), -- 0-1
  use_case TEXT,
  is_required BOOLEAN DEFAULT false,
  PRIMARY KEY (step_id, tool_id)
);
```

#### Company Implementation Tables

```sql
-- Company journey management
CREATE TABLE company_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  based_on_template_id UUID,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company's customized version of steps
CREATE TABLE company_journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES company_journeys(id),
  
  -- Step content (can be customized)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phase_id UUID REFERENCES journey_phases(id),
  domain_id UUID REFERENCES journey_domains(id),
  order_index INTEGER,
  
  -- Company-specific customizations
  status VARCHAR(50) DEFAULT 'not_started',
  custom_deliverables TEXT[], -- Company can add their own
  custom_success_criteria TEXT[],
  custom_notes TEXT,
  estimated_days INTEGER, -- Company can override
  difficulty VARCHAR(20), -- Company can override
  
  -- Source tracking
  source VARCHAR(50), -- 'template', 'custom', 'community'
  source_id UUID, -- Points to journey_steps.id if from template
  source_version INTEGER, -- Version of template when imported
  
  -- Customization metadata
  is_customized BOOLEAN DEFAULT false,
  customized_fields TEXT[], -- Track which fields were changed
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced task management
CREATE TABLE step_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES company_journey_steps(id),
  name VARCHAR(255),
  description TEXT,
  task_type VARCHAR(50),
  estimated_hours INTEGER,
  is_required BOOLEAN DEFAULT true,
  assigned_to UUID,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  custom_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company-specific progress tracking
CREATE TABLE company_step_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  step_id UUID REFERENCES company_journey_steps(id),
  status VARCHAR(50),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent_hours INTEGER,
  notes TEXT,
  blockers TEXT[],
  success_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Migration Scripts
```sql
-- Migrate existing phases and domains
INSERT INTO journey_phases (id, name, description, order_index)
SELECT id, name, COALESCE(description, ''), 
       ROW_NUMBER() OVER (ORDER BY created_at) - 1
FROM phases;

INSERT INTO journey_domains (id, name, description)
SELECT id, name, COALESCE(description, '')
FROM domains;

-- Populate the canonical 150-step framework
-- This will be done via data import from the complete framework design
INSERT INTO journey_steps (name, description, primary_phase_id, primary_domain_id, ...)
VALUES 
  -- Phase 1: Ideation & Validation (25 steps)
  ('Identify & Define Problem', 'Articulate the core problem you''re solving...', 'ideation_phase', 'idea_validation_domain', ...),
  ('Conduct Customer Discovery Interviews', 'Talk to 50+ potential customers...', 'ideation_phase', 'idea_validation_domain', ...),
  -- ... (continue with all 150 steps from the design)
  
-- Create default journeys for existing companies
INSERT INTO company_journeys (company_id, name)
SELECT id, name || ' Journey'
FROM companies;

-- Companies start with empty journeys - they choose which framework steps to import
-- This allows for full customization from the beginning
```

### 1.3 Framework Population Strategy

#### Base Framework Implementation
The 150-step framework will be populated in `journey_steps` following the complete design structure:

- **Phase 1: Ideation & Validation** (25 steps)
  - Problem Discovery & Validation (5 steps)
  - Company Formation & Legal (10 steps)  
  - Financial Foundation (5 steps)
  - Basic Operations Setup (5 steps)

- **Phase 2: Planning & Preparation** (35 steps)
  - Product Strategy & Design (10 steps)
  - Business Operations (15 steps)
  - Market & Strategy (10 steps)

- **Phase 3: Build & Develop** (40 steps)
  - Technical Development (15 steps)
  - Brand & Marketing (15 steps)
  - Legal & Compliance (5 steps)
  - Team Building (5 steps)

- **Phase 4: Validate & Launch** (30 steps)
  - Customer Validation (10 steps)
  - Business Validation (10 steps)
  - Launch Preparation (10 steps)

- **Phase 5: Scale & Optimize** (20 steps)
  - Growth & Marketing (10 steps)
  - Operations Scaling (10 steps)

### 1.4 Type System Updates

#### Base Framework Types
```typescript
// src/lib/types/journey.types.ts
export interface JourneyPhase {
  id: string;
  name: string;
  description: string;
  order_index: number;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface JourneyDomain {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  primary_phases?: string[];
  created_at: string;
}

// Base framework step (read-only template)
export interface JourneyStep {
  id: string;
  name: string;
  description: string;
  primary_phase_id: string;
  primary_domain_id: string;
  secondary_phase_id?: string;
  secondary_domain_id?: string;
  order_index: number;
  difficulty: 'Low' | 'Medium' | 'High';
  estimated_days: number;
  deliverables: string[];
  success_criteria: string[];
  common_blockers: string[];
  coverage_notes: string;
  howto_without_tools: string;
  audience: string;
  resource_links: string[];
  snippet_references: string[];
  is_required: boolean;
  prerequisites: string[];
  suggested_next: string[];
  version: number;
  status: 'active' | 'deprecated' | 'draft';
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyJourney {
  id: string;
  company_id: string;
  based_on_template_id?: string;
  name: string;
  created_at: string;
}

// Company-specific step implementation
export interface CompanyJourneyStep {
  id: string;
  journey_id: string;
  name: string;
  description: string;
  phase_id: string;
  domain_id: string;
  order_index: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  custom_deliverables: string[];
  custom_success_criteria: string[];
  custom_notes: string;
  estimated_days: number;
  difficulty: 'Low' | 'Medium' | 'High';
  source: 'template' | 'custom' | 'community';
  source_id?: string;
  source_version?: number;
  is_customized: boolean;
  customized_fields: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateUpdate {
  companyStepId: string;
  templateStepId: string;
  currentVersion: number;
  availableVersion: number;
}
```

### 1.5 Service Layer Foundation

#### Base Framework Management Service
```typescript
// src/lib/services/journeyFramework.service.ts
export class JourneyFrameworkService {
  /**
   * Get all base framework steps (read-only)
   * These are the canonical ~150 steps
   */
  static async getFrameworkSteps(): Promise<JourneyStep[]> {
    const { data, error } = await supabase
      .from('journey_steps')
      .select(`
        *,
        primary_phase:journey_phases!primary_phase_id(*),
        primary_domain:journey_domains!primary_domain_id(*),
        secondary_phase:journey_phases!secondary_phase_id(*),
        secondary_domain:journey_domains!secondary_domain_id(*)
      `)
      .eq('status', 'active')
      .order('order_index');

    if (error) throw error;
    return data;
  }

  /**
   * Get framework step by ID
   */
  static async getFrameworkStep(stepId: string): Promise<JourneyStep | null> {
    const { data, error } = await supabase
      .from('journey_steps')
      .select('*')
      .eq('id', stepId)
      .eq('status', 'active')
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get framework steps filtered by criteria
   */
  static async getFrameworkStepsFiltered(filters: {
    phase_id?: string;
    domain_id?: string;
    difficulty?: string;
    search?: string;
  }): Promise<JourneyStep[]> {
    let query = supabase
      .from('journey_steps')
      .select('*')
      .eq('status', 'active');

    if (filters.phase_id) {
      query = query.or(`primary_phase_id.eq.${filters.phase_id},secondary_phase_id.eq.${filters.phase_id}`);
    }
    
    if (filters.domain_id) {
      query = query.or(`primary_domain_id.eq.${filters.domain_id},secondary_domain_id.eq.${filters.domain_id}`);
    }
    
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data } = await query.order('order_index');
    return data || [];
  }

  /**
   * ADMIN ONLY: Update framework step
   */
  static async updateFrameworkStep(
    stepId: string,
    updates: Partial<JourneyStep>,
    adminUserId: string
  ): Promise<JourneyStep> {
    const { data, error } = await supabase
      .from('journey_steps')
      .update({
        ...updates,
        updated_by: adminUserId,
        updated_at: new Date().toISOString(),
        version: supabase.rpc('increment_version', { step_id: stepId })
      })
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;

    // Notify companies about template updates
    await this.notifyCompaniesOfTemplateUpdate(stepId);
    
    return data;
  }

  /**
   * Notify companies when template steps are updated
   */
  private static async notifyCompaniesOfTemplateUpdate(stepId: string): Promise<void> {
    // Find all company steps based on this template
    const { data: companySteps } = await supabase
      .from('company_journey_steps')
      .select('id, journey_id, company_id')
      .eq('source', 'template')
      .eq('source_id', stepId);

    // Create notifications for companies
    if (companySteps) {
      const notifications = companySteps.map(step => ({
        company_id: step.company_id,
        type: 'template_update',
        title: 'Step Template Updated',
        message: 'A step template you\'re using has been updated',
        data: {
          step_id: step.id,
          template_id: stepId,
          journey_id: step.journey_id
        }
      }));

      await supabase
        .from('company_notifications')
        .insert(notifications);
    }
  }
}
```

#### Enhanced Company Journey Service
```typescript
// src/lib/services/companyJourney.service.ts
export class CompanyJourneyService {
  static async getOrCreateCompanyJourney(companyId: string): Promise<CompanyJourney> {
    // Check if journey exists
    let { data: journey } = await supabase
      .from('company_journeys')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (!journey) {
      // Create default journey
      const { data: newJourney } = await supabase
        .from('company_journeys')
        .insert({ company_id: companyId, name: 'Company Journey' })
        .select()
        .single();
      journey = newJourney;
    }

    return journey;
  }

  static async getCompanySteps(companyId: string): Promise<CompanyJourneyStep[]> {
    const journey = await this.getOrCreateCompanyJourney(companyId);
    
    const { data } = await supabase
      .from('company_journey_steps')
      .select(`
        *,
        phase:journey_phases(name, description, icon, color),
        domain:journey_domains(name, description, icon, color)
      `)
      .eq('journey_id', journey.id)
      .order('order_index');

    return data || [];
  }

  /**
   * Import a framework step into company's journey
   */
  static async importFrameworkStep(
    journeyId: string,
    frameworkStepId: string,
    customizations?: Partial<CompanyJourneyStep>
  ): Promise<CompanyJourneyStep> {
    // Get the framework step
    const frameworkStep = await JourneyFrameworkService.getFrameworkStep(frameworkStepId);
    if (!frameworkStep) throw new Error('Framework step not found');

    // Create company step based on framework
    const { data, error } = await supabase
      .from('company_journey_steps')
      .insert({
        journey_id: journeyId,
        name: customizations?.name || frameworkStep.name,
        description: customizations?.description || frameworkStep.description,
        phase_id: customizations?.phase_id || frameworkStep.primary_phase_id,
        domain_id: customizations?.domain_id || frameworkStep.primary_domain_id,
        order_index: customizations?.order_index || frameworkStep.order_index,
        estimated_days: customizations?.estimated_days || frameworkStep.estimated_days,
        difficulty: customizations?.difficulty || frameworkStep.difficulty,
        source: 'template',
        source_id: frameworkStepId,
        source_version: frameworkStep.version,
        is_customized: !!customizations,
        customized_fields: customizations ? Object.keys(customizations) : []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create completely custom step
   */
  static async createCustomStep(
    journeyId: string,
    stepData: Partial<CompanyJourneyStep>
  ): Promise<CompanyJourneyStep> {
    const { data, error } = await supabase
      .from('company_journey_steps')
      .insert({
        journey_id: journeyId,
        source: 'custom',
        is_customized: true,
        ...stepData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check for template updates
   */
  static async checkForTemplateUpdates(companyId: string): Promise<TemplateUpdate[]> {
    const { data } = await supabase
      .from('company_journey_steps')
      .select(`
        id,
        source_id,
        source_version,
        template:journey_steps!source_id(version)
      `)
      .eq('company_id', companyId)
      .eq('source', 'template')
      .neq('source_version', supabase.from('journey_steps').select('version'));

    return data?.filter(step => 
      step.template?.version > step.source_version
    ).map(step => ({
      companyStepId: step.id,
      templateStepId: step.source_id,
      currentVersion: step.source_version,
      availableVersion: step.template.version
    })) || [];
  }

  // ... other methods
}
```

## Phase 2: Component Migration (Week 2)

### 2.1 JourneyHomePage Enhancement

#### Update Main Page Component
```typescript
// src/components/company/journey/pages/JourneyHomePage.tsx
// KEEP: Overall structure and layout
// UPDATE: Data fetching and state management

const JourneyHomePage: React.FC<JourneyHomePageProps> = ({ companyId }) => {
  // KEEP: Existing state structure
  const [phases, setPhases] = useState<JourneyPhase[]>([]);
  const [domains, setDomains] = useState<JourneyDomain[]>([]);
  const [steps, setSteps] = useState<CompanyJourneyStep[]>([]);
  const [stepsWithStatus, setStepsWithStatus] = useState<any[]>([]);

  // UPDATE: Data fetching
  useEffect(() => {
    const fetchJourneyData = async () => {
      // Fetch company-specific data
      const [phasesData, domainsData, stepsData] = await Promise.all([
        supabase.from('journey_phases').select('*').order('order_index'),
        supabase.from('journey_domains').select('*'),
        CompanyJourneyService.getCompanySteps(companyId)
      ]);

      setPhases(phasesData.data || []);
      setDomains(domainsData.data || []);
      setSteps(stepsData);
    };

    fetchJourneyData();
  }, [companyId]);

  // KEEP: All existing UI structure
  // KEEP: Modal system
  // KEEP: Sidebar integration
  
  return (
    <AIProvider>
      <div className="min-h-screen bg-gray-50 flex flex-row">
        {/* KEEP: Existing sidebar */}
        <CompanyStepsSidebar
          stepsWithStatus={stepsWithStatus}
          domains={domains}
          phases={phases}
          // ... existing props
        />
        
        {/* KEEP: Existing main content */}
        <div className="flex-1 flex flex-col px-8">
          {/* KEEP: Existing components */}
          <RecommendedStepsPanel />
          <SmartJourneyDashboard />
        </div>
      </div>
    </AIProvider>
  );
};
```

### 2.2 Sidebar Component Updates

#### CompanyStepsSidebar Enhancement
```typescript
// src/components/company/journey/components/step/CompanyStepsSidebar.tsx
// KEEP: Entire component structure and UI
// UPDATE: Props interface for new types

interface CompanyStepsSidebarProps {
  stepsWithStatus: {
    step: CompanyJourneyStep; // UPDATED: New type
    status: "completed" | "ready" | "blocked";
    completion?: number;
    urgent?: boolean;
    dueDate?: string;
  }[];
  domains: JourneyDomain[]; // UPDATED: New type
  phases: JourneyPhase[];   // UPDATED: New type
  // ... rest unchanged
}

// KEEP: All rendering logic
// KEEP: All interaction handlers
```

### 2.3 Step Detail Components

#### StepDetailWireframe Adaptation
```typescript
// src/components/company/journey/components/step/StepDetailWireframe.tsx
// KEEP: Entire component - it's perfect for the new system
// UPDATE: Props interface

interface StepDetailWireframeProps {
  step: CompanyJourneyStep; // UPDATED: New type
  tools: JourneyTool[];     // UPDATED: New type
  nextSteps?: { to_step_id: string; probability_weight: number; step_name?: string }[];
  prereqSteps?: { from_step_id: string; relationship_type: string; step_name?: string }[];
}

// KEEP: All existing functionality:
// - StepTasksChecklist integration
// - HowToWithoutToolsSection
// - AISuggestionsPanel
// - Status management
// - All sidebar sections
```

## Phase 3: Enhanced Features (Week 3)

### 3.1 Step Customization System

#### Framework Steps Browser Component
```typescript
// src/components/company/journey/components/FrameworkStepsBrowser.tsx
export const FrameworkStepsBrowser: React.FC<{
  journeyId: string;
  onImportStep: (stepId: string) => void;
}> = ({ journeyId, onImportStep }) => {
  const [frameworkSteps, setFrameworkSteps] = useState<JourneyStep[]>([]);
  const [filters, setFilters] = useState({
    phase_id: '',
    domain_id: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    const fetchSteps = async () => {
      const steps = await JourneyFrameworkService.getFrameworkStepsFiltered(filters);
      setFrameworkSteps(steps);
    };
    fetchSteps();
  }, [filters]);

  return (
    <div className="framework-steps-browser">
      {/* REUSE: Existing StepsFilterPanel component */}
      <StepsFilterPanel
        domains={domains}
        phases={phases}
        statusOptions={['Low', 'Medium', 'High']}
        selectedDomain={filters.domain_id}
        selectedPhase={filters.phase_id}
        selectedStatus={filters.difficulty}
        search={filters.search}
        onDomainChange={(domainId) => setFilters(prev => ({ ...prev, domain_id: domainId }))}
        onPhaseChange={(phaseId) => setFilters(prev => ({ ...prev, phase_id: phaseId }))}
        onStatusChange={(difficulty) => setFilters(prev => ({ ...prev, difficulty }))}
        onSearchChange={(search) => setFilters(prev => ({ ...prev, search }))}
      />
      
      {/* Steps grid using existing StepsList component pattern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworkSteps.map(step => (
          <div key={step.id} className="border rounded-lg p-4 bg-white shadow">
            <h3 className="font-semibold text-lg mb-2">{step.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{step.description}</p>
            
            <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
              <span>Difficulty: {step.difficulty}</span>
              <span>Est: {step.estimated_days} days</span>
            </div>
            
            {/* Phase and Domain badges */}
            <div className="flex gap-2 mb-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {step.primary_phase?.name}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {step.primary_domain?.name}
              </span>
            </div>
            
            <button
              onClick={() => onImportStep(step.id)}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Add to Journey
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Template Update Notifications
```typescript
// src/components/company/journey/components/TemplateUpdateNotifications.tsx
export const TemplateUpdateNotifications: React.FC<{
  companyId: string;
}> = ({ companyId }) => {
  const [updates, setUpdates] = useState<TemplateUpdate[]>([]);
  const [applying, setApplying] = useState<string[]>([]);

  useEffect(() => {
    const checkUpdates = async () => {
      const availableUpdates = await CompanyJourneyService.checkForTemplateUpdates(companyId);
      setUpdates(availableUpdates);
    };
    checkUpdates();
  }, [companyId]);

  const applyUpdate = async (update: TemplateUpdate) => {
    setApplying(prev => [...prev, update.companyStepId]);
    try {
      await CompanyJourneyService.applyTemplateUpdate(update.companyStepId, true);
      setUpdates(prev => prev.filter(u => u.companyStepId !== update.companyStepId));
    } catch (error) {
      console.error('Failed to apply update:', error);
    } finally {
      setApplying(prev => prev.filter(id => id !== update.companyStepId));
    }
  };

  if (updates.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-blue-800 mb-2">Template Updates Available</h3>
      <p className="text-blue-700 text-sm mb-3">
        {updates.length} of your steps have template updates available.
      </p>
      
      <div className="space-y-2">
        {updates.map(update => (
          <div key={update.companyStepId} className="flex justify-between items-center bg-white p-2 rounded">
            <div>
              <span className="text-sm font-medium">Step updated</span>
              <span className="text-xs text-gray-500 ml-2">
                v{update.currentVersion} → v{update.availableVersion}
              </span>
            </div>
            <button
              onClick={() => applyUpdate(update)}
              disabled={applying.includes(update.companyStepId)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {applying.includes(update.companyStepId) ? 'Updating...' : 'Update'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Enhanced Step Management
```typescript
// src/components/company/journey/components/step/StepCustomization.tsx
export const StepCustomization: React.FC = ({ journeyId, companyId }) => {
  const [isFrameworkBrowserOpen, setIsFrameworkBrowserOpen] = useState(false);
  const [isCustomStepModalOpen, setIsCustomStepModalOpen] = useState(false);
  
  const importFrameworkStep = async (frameworkStepId: string) => {
    try {
      await CompanyJourneyService.importFrameworkStep(journeyId, frameworkStepId);
      setIsFrameworkBrowserOpen(false);
      // Refresh company steps
      window.location.reload(); // Or use proper state management
    } catch (error) {
      console.error('Failed to import step:', error);
    }
  };

  const createCustomStep = async (stepData: Partial<CompanyJourneyStep>) => {
    try {
      await CompanyJourneyService.createCustomStep(journeyId, stepData);
      setIsCustomStepModalOpen(false);
      // Refresh company steps
      window.location.reload(); // Or use proper state management
    } catch (error) {
      console.error('Failed to create step:', error);
    }
  };

  return (
    <div className="step-customization">
      {/* Template update notifications */}
      <TemplateUpdateNotifications companyId={companyId} />
      
      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsFrameworkBrowserOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Browse Framework Steps
        </button>
        
        <button
          onClick={() => setIsCustomStepModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Create Custom Step
        </button>
      </div>

      {/* Framework browser modal */}
      {isFrameworkBrowserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Browse Framework Steps</h2>
                <button
                  onClick={() => setIsFrameworkBrowserOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <FrameworkStepsBrowser
                journeyId={journeyId}
                onImportStep={importFrameworkStep}
              />
            </div>
          </div>
        </div>
      )}

      {/* REUSE: Existing CreateStepModal */}
      <CreateStepModal
        open={isCustomStepModalOpen}
        onClose={() => setIsCustomStepModalOpen(false)}
        onCreate={(stepData) => createCustomStep(stepData)}
        domains={domains}
        phases={phases}
      />
    </div>
  );
};
```

### 3.2 Progress Tracking Enhancement

#### Enhanced Progress Service
```typescript
// src/lib/services/journeyProgress.service.ts
export class JourneyProgressService {
  static async updateStepProgress(
    stepId: string, 
    status: string, 
    metrics?: any
  ): Promise<void> {
    await supabase
      .from('company_progress')
      .upsert({
        step_id: stepId,
        status,
        progress_metrics: metrics,
        updated_at: new Date().toISOString()
      });
  }

  static async getJourneyAnalytics(companyId: string): Promise<JourneyAnalytics> {
    // Aggregate progress data
    const { data } = await supabase
      .from('company_progress')
      .select(`
        *,
        step:company_journey_steps(domain_id, phase_id)
      `)
      .eq('company_id', companyId);

    // Process analytics
    return this.processProgressData(data);
  }
}
```

### 3.3 Task System Integration

#### Enhanced StepTasksChecklist
```typescript
// src/components/company/journey/components/step/StepTasksChecklist.tsx
// KEEP: Existing component logic
// ENHANCE: Better integration with new task system

export const StepTasksChecklist: React.FC<StepTasksChecklistProps> = ({
  stepId,
  companyId, // NEW: Required for new schema
}) => {
  // UPDATE: Use new step_tasks table
  const fetchTasksForStep = useCallback(async () => {
    const { data, error } = await supabase
      .from("step_tasks")  // UPDATED: New table
      .select(`
        *,
        assigned_user:assigned_to(full_name, email)
      `)
      .eq("step_id", stepId);
    
    if (error) {
      console.error("Failed to fetch tasks:", error);
      return;
    }
    
    setTasks(data.map(task => ({
      id: task.id,
      text: task.name,
      completed: task.status === "completed",
      custom: true,
      user_id: task.assigned_to,
      estimated_hours: task.estimated_hours,
      due_date: task.due_date
    })));
  }, [stepId]);

  // KEEP: All existing UI and interaction logic
  // ENHANCE: Add time tracking and assignment features
};
```

## Phase 4: Learning & Intelligence (Week 4)

### 4.1 Recommendation Engine

#### Smart Recommendations Service
```typescript
// src/lib/services/journeyRecommendations.service.ts
export class JourneyRecommendationsService {
  static async getRecommendedSteps(companyId: string): Promise<StepRecommendation[]> {
    // Analyze company progress
    const progress = await JourneyProgressService.getJourneyAnalytics(companyId);
    
    // Get similar companies
    const similarCompanies = await this.findSimilarCompanies(companyId);
    
    // Generate recommendations based on patterns
    return this.generateRecommendations(progress, similarCompanies);
  }

  private static async findSimilarCompanies(companyId: string): Promise<string[]> {
    // Logic to find companies with similar characteristics
    // Industry, stage, size, etc.
  }

  private static generateRecommendations(
    progress: JourneyAnalytics, 
    similarCompanies: string[]
  ): StepRecommendation[] {
    // ML-based recommendation logic
    // For now, rule-based recommendations
  }
}
```

### 4.2 Analytics Dashboard

#### Enhanced SmartJourneyDashboard
```typescript
// src/components/company/journey/components/SmartJourneyDashboard.tsx
// KEEP: Existing component structure
// ENHANCE: Add real analytics and recommendations

export const SmartJourneyDashboard: React.FC<SmartJourneyDashboardProps> = ({
  companyId
}) => {
  const [analytics, setAnalytics] = useState<JourneyAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<StepRecommendation[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [analyticsData, recommendationsData] = await Promise.all([
        JourneyProgressService.getJourneyAnalytics(companyId),
        JourneyRecommendationsService.getRecommendedSteps(companyId)
      ]);
      
      setAnalytics(analyticsData);
      setRecommendations(recommendationsData);
    };

    fetchAnalytics();
  }, [companyId]);

  // KEEP: Existing UI structure
  // ENHANCE: Show real data instead of placeholders
  
  return (
    <section className="mb-8">
      {/* KEEP: Peer Insights section */}
      <div className="bg-blue-50 rounded-lg shadow p-6 mb-4">
        <h2 className="text-lg font-semibold mb-2 text-blue-800">Peer Insights</h2>
        {analytics?.peerInsights?.map((insight, idx) => (
          <div key={idx} className="text-sm text-blue-900">
            {insight}
          </div>
        ))}
      </div>
      
      {/* ENHANCE: Real progress summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Your Progress</h2>
        <div className="flex flex-wrap gap-6">
          {analytics?.progressByDomain && Object.entries(analytics.progressByDomain).map(([domain, percent]) => (
            <div key={domain} className="flex flex-col items-center">
              <div className="text-sm font-medium text-gray-700">{domain}</div>
              <div className="text-2xl font-bold text-blue-700">{percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

## Phase 5: Community Integration (Week 5)

### 5.1 Community Bridge

#### Community Integration Service
```typescript
// src/lib/services/communityJourneyIntegration.service.ts
export class CommunityJourneyIntegrationService {
  static async shareStepToCommunity(
    stepId: string, 
    metadata: ShareMetadata
  ): Promise<void> {
    const step = await CompanyJourneyService.getStepById(stepId);
    
    await supabase
      .from('community_steps')
      .insert({
        name: step.name,
        description: step.description,
        contributed_by: metadata.userId,
        category: metadata.category,
        industry: metadata.industry,
        company_stage: metadata.stage,
        tags: metadata.tags
      });
  }

  static async importCommunityStep(
    communityStepId: string,
    journeyId: string
  ): Promise<CompanyJourneyStep> {
    const communityStep = await communityService.getCommunityStep(communityStepId);
    
    return await CompanyJourneyService.addCustomStep(journeyId, {
      name: communityStep.name,
      description: communityStep.description,
      source: 'community',
      source_id: communityStepId
    });
  }

  static async getBestPracticesForStep(stepId: string): Promise<BestPractice[]> {
    // Query community insights for this type of step
    const { data } = await supabase
      .from('community_step_insights')
      .select('*')
      .eq('step_type', stepId);
    
    return data || [];
  }
}
```

### 5.2 Expert Integration

#### Expert Recommendations for Steps
```typescript
// Enhanced StepDetailWireframe with expert recommendations
const ExpertRecommendations: React.FC<{ stepId: string }> = ({ stepId }) => {
  const [experts, setExperts] = useState<ExpertProfile[]>([]);

  useEffect(() => {
    const fetchExperts = async () => {
      // Find experts relevant to this step's domain/phase
      const step = await CompanyJourneyService.getStepById(stepId);
      const relevantExperts = await expertService.findExpertsForDomain(step.domain_id);
      setExperts(relevantExperts);
    };

    fetchExperts();
  }, [stepId]);

  return (
    <section className="bg-white rounded shadow p-4 border">
      <h3 className="font-semibold mb-2">Recommended Experts</h3>
      {experts.map(expert => (
        <div key={expert.id} className="mb-2">
          <div className="font-medium">{expert.user_name}</div>
          <div className="text-sm text-gray-600">
            {expert.primary_expertise_areas?.join(", ")}
          </div>
          <ConnectWithExpertButton 
            expertId={expert.user_id}
            expertName={expert.user_name}
            size="sm"
          />
        </div>
      ))}
    </section>
  );
};
```

## Phase 6: Testing & Optimization (Week 6)

### 6.1 Migration Testing

#### Data Migration Validation
```typescript
// src/scripts/validateMigration.ts
export async function validateMigration(): Promise<ValidationReport> {
  const issues: ValidationIssue[] = [];
  
  // Validate framework steps are properly populated
  const { data: frameworkSteps } = await supabase
    .from('journey_steps')
    .select('id')
    .eq('status', 'active');
  
  if (!frameworkSteps || frameworkSteps.length < 150) {
    issues.push({
      type: 'incomplete_framework',
      expected: 150,
      actual: frameworkSteps?.length || 0
    });
  }
  
  // Validate all companies have journeys
  const companiesWithoutJourneys = await supabase
    .from('companies')
    .select('id')
    .not('id', 'in', 
      supabase.from('company_journeys').select('company_id')
    );
  
  if (companiesWithoutJourneys.data?.length) {
    issues.push({
      type: 'missing_journeys',
      count: companiesWithoutJourneys.data.length,
      companies: companiesWithoutJourneys.data.map(c => c.id)
    });
  }

  // Validate step relationships are intact
  const { data: brokenRelationships } = await supabase
    .from('step_relationships')
    .select('*')
    .not('from_step_id', 'in', supabase.from('journey_steps').select('id'))
    .not('to_step_id', 'in', supabase.from('journey_steps').select('id'));
  
  if (brokenRelationships?.length) {
    issues.push({
      type: 'broken_relationships',
      count: brokenRelationships.length
    });
  }
  
  return { issues, isValid: issues.length === 0 };
}
```

### 6.2 Performance Optimization

#### Optimized Data Fetching
```typescript
// Batch loading for better performance
export class OptimizedJourneyService {
  static async getJourneyDashboardData(companyId: string): Promise<DashboardData> {
    const [journey, steps, progress, recommendations, frameworkSteps] = await Promise.all([
      CompanyJourneyService.getOrCreateCompanyJourney(companyId),
      CompanyJourneyService.getCompanySteps(companyId),
      JourneyProgressService.getJourneyAnalytics(companyId),
      JourneyRecommendationsService.getRecommendedSteps(companyId),
      JourneyFrameworkService.getFrameworkSteps() // Cache this globally
    ]);

    return {
      journey,
      steps,
      progress,
      recommendations,
      availableFrameworkSteps: frameworkSteps.length
    };
  }
}
```

### 6.3 Admin Management Interface

#### Framework Management Dashboard
```typescript
// src/components/admin/FrameworkManagement.tsx
export const FrameworkManagement: React.FC = () => {
  const [frameworkSteps, setFrameworkSteps] = useState<JourneyStep[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [stats, setStats] = useState<FrameworkStats>({
    totalSteps: 0,
    totalPhases: 0,
    totalDomains: 0,
    companiesUsing: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const [steps, statistics] = await Promise.all([
        JourneyFrameworkService.getFrameworkSteps(),
        this.getFrameworkStats()
      ]);
      setFrameworkSteps(steps);
      setStats(statistics);
    };
    fetchData();
  }, []);

  const updateFrameworkStep = async (stepId: string, updates: Partial<JourneyStep>) => {
    await JourneyFrameworkService.updateFrameworkStep(stepId, updates, 'admin_user_id');
    // Refresh data
    const steps = await JourneyFrameworkService.getFrameworkSteps();
    setFrameworkSteps(steps);
  };

  return (
    <div className="framework-management">
      <h1 className="text-2xl font-bold mb-6">Journey Framework Management</h1>
      
      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.totalSteps}</div>
          <div className="text-gray-600">Framework Steps</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.totalPhases}</div>
          <div className="text-gray-600">Phases</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.totalDomains}</div>
          <div className="text-gray-600">Domains</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.companiesUsing}</div>
          <div className="text-gray-600">Companies Using</div>
        </div>
      </div>

      {/* Framework Steps Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Framework Steps (150 Total)</h2>
        </div>
        <div className="p-4">
          {/* Step editing interface */}
          <div className="space-y-4">
            {frameworkSteps.map(step => (
              <div key={step.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{step.name}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Version {step.version} • {step.difficulty} • {step.estimated_days} days
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(step.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Edit
                  </button>
                </div>
                
                {isEditing === step.id && (
                  <div className="mt-4 border-t pt-4">
                    {/* Step editing form */}
                    <StepEditForm
                      step={step}
                      onSave={(updates) => {
                        updateFrameworkStep(step.id, updates);
                        setIsEditing(null);
                      }}
                      onCancel={() => setIsEditing(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

## Implementation Guidelines

### Code Quality Standards

1. **Maintain Existing Patterns**: Follow established patterns from current codebase
2. **Type Safety**: Full TypeScript coverage for all new components
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Testing**: Unit tests for services, integration tests for components
5. **Documentation**: Inline documentation for all new APIs

### Migration Safety

1. **Backward Compatibility**: Maintain existing APIs during transition
2. **Feature Flags**: Use feature flags for gradual rollout
3. **Rollback Plan**: Ability to rollback to current system if needed
4. **Data Backup**: Complete backup before any data migration

### Performance Considerations

1. **Database Indexing**: Proper indexes on new tables
2. **Query Optimization**: Efficient queries with proper joins
3. **Caching Strategy**: Cache frequently accessed data
4. **Lazy Loading**: Load data as needed in UI components

## Success Metrics

### Technical Metrics
- Migration completion without data loss
- Page load times < 2 seconds
- Error rates < 1%
- Test coverage > 90%

### User Experience Metrics
- User satisfaction scores maintained or improved
- Task completion rates increased by 10%
- Time to complete journey steps reduced by 15%
- Feature adoption rates > 70%

## Risk Mitigation

### High Risk Items
1. **Data Migration**: Comprehensive testing and backup strategies
2. **Component Breaking Changes**: Gradual migration with feature flags
3. **Performance Degradation**: Load testing and optimization

### Mitigation Strategies
1. **Incremental Rollout**: Deploy to small user groups first
2. **Monitoring**: Real-time monitoring of key metrics
3. **Quick Rollback**: Ability to quickly revert if issues arise
4. **User Communication**: Clear communication about changes

## Post-Launch Plan

### Week 7-8: Monitoring & Optimization
- Monitor user behavior and system performance
- Gather user feedback
- Optimize based on real usage patterns
- Fix any issues discovered in production

### Week 9-12: Feature Enhancement
- Add advanced learning algorithms
- Enhance community integration
- Add more customization options
- Implement advanced analytics

## Summary: Where Steps Live and How Updates Work

### Step Storage Architecture

**Base Framework Steps (~150)**: 
- **Location**: `journey_steps` table
- **Purpose**: Read-only canonical framework maintained by platform
- **Access**: Companies browse and import, but cannot modify originals
- **Updates**: Platform admins update framework, companies get notified

**Company-Specific Steps**:
- **Location**: `company_journey_steps` table  
- **Purpose**: Customizable implementations for each company
- **Access**: Full CRUD by company users
- **Updates**: Companies customize freely, can apply framework updates

**Community Contributions**:
- **Location**: `community_steps` table (existing)
- **Purpose**: User-shared steps that can be imported
- **Access**: Browse and import into company journeys

### Where Refinements & New Steps Go

#### 1. **Framework Improvements (Platform Level)**
```sql
-- Admin updates base framework
UPDATE journey_steps SET 
  description = 'Enhanced with new best practices...',
  version = version + 1,
  updated_by = 'admin_id'
WHERE id = 'framework_step_id';
```
- **Impact**: All future imports get improved version
- **Notification**: Companies using this step get update notifications
- **Choice**: Companies can apply updates while preserving customizations

#### 2. **Company Customizations**
```sql
-- Company customizes their implementation
UPDATE company_journey_steps SET
  name = 'Our Custom Step Name',
  custom_deliverables = array_append(custom_deliverables, 'Company-specific deliverable'),
  is_customized = true,
  customized_fields = array_append(customized_fields, 'name')
WHERE id = 'company_step_id';
```
- **Impact**: Only affects that specific company
- **Flexibility**: Full customization without affecting others

#### 3. **New Framework Steps**
```sql
-- Admin adds new step to framework
INSERT INTO journey_steps (name, description, primary_phase_id, ...)
VALUES ('New Step Based on Learning', 'Description...', 'phase_id', ...);
```
- **Impact**: Available for all companies to import
- **Discovery**: Shows up in framework browser for all companies

### Key Benefits

✅ **Consistency**: All companies start from same proven framework  
✅ **Customization**: Full flexibility to adapt to company needs  
✅ **Evolution**: Framework improves over time based on learnings  
✅ **Choice**: Companies control when/how to apply updates  
✅ **Learning**: Platform learns from customizations to improve framework

This architecture perfectly leverages your existing UI components while adding the enhanced backend capabilities for the complete Journey System vision.
