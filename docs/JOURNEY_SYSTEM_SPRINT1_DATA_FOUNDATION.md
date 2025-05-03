# The Wheel: Journey System Redesign
## Sprint 1: Data Foundation

**Date Range:** May 5 - May 16, 2025  
**Status:** Planning  
**Sprint Lead:** TBD  

## Overview

Sprint 1 focuses on establishing a solid data foundation for the Journey System redesign by consolidating the current parallel implementations (steps and challenges) into a unified, flexible data model. This is the critical first step that will enable all subsequent UI improvements and feature enhancements.

## Objectives

1. Create a unified data schema that preserves all existing functionality
2. Develop migration scripts to safely transition existing data
3. Implement a consistent service layer API
4. Ensure backward compatibility for existing code
5. Establish comprehensive test coverage for data operations

## Deliverables

### 1. Unified Schema Design

```sql
-- Core schema updates

-- 1. journey_phases (enhance existing table)
ALTER TABLE journey_phases
ADD COLUMN color VARCHAR(20) NULL,
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. Update journey_steps with enhanced fields (combines step/challenge functionality)
ALTER TABLE journey_steps
ADD COLUMN difficulty_level INTEGER NOT NULL DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
ADD COLUMN estimated_time_min INTEGER NOT NULL DEFAULT 30,
ADD COLUMN estimated_time_max INTEGER NOT NULL DEFAULT 60,
ADD COLUMN key_outcomes TEXT[] NULL DEFAULT '{}',
ADD COLUMN prerequisite_steps UUID[] NULL DEFAULT '{}',
ADD COLUMN is_custom BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Create or update company_journey_steps to track company-specific progress/customization
CREATE TABLE IF NOT EXISTS company_journey_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  notes TEXT NULL,
  custom_difficulty INTEGER NULL CHECK (custom_difficulty BETWEEN 1 AND 5),
  custom_time_estimate INTEGER NULL,
  completion_percentage INTEGER NULL CHECK (completion_percentage BETWEEN 0 AND 100),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL,
  UNIQUE(company_id, step_id)
);

-- 4. Create or update step_tools mapping
CREATE TABLE IF NOT EXISTS step_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(step_id, tool_id)
);

-- 5. Create or update company_step_tools for company-specific tool selections
CREATE TABLE IF NOT EXISTS company_step_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES journey_steps(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  rating INTEGER NULL CHECK (rating BETWEEN 1 AND 5),
  notes TEXT NULL,
  selected_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, step_id, tool_id)
);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journey_phases_timestamp
BEFORE UPDATE ON journey_phases
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_journey_steps_timestamp
BEFORE UPDATE ON journey_steps
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_company_journey_steps_timestamp
BEFORE UPDATE ON company_journey_steps
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_company_step_tools_timestamp
BEFORE UPDATE ON company_step_tools
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

### 2. Migration Scripts

```typescript
// migration-script.ts - Executable script to perform the data migration

import { supabase } from '../lib/supabase';

async function migrateJourneyData() {
  console.log('Starting journey data migration...');
  
  // 1. Migrate challenges to steps format
  console.log('Migrating challenges to steps...');
  const { data: challenges, error: challengesError } = await supabase
    .from('journey_challenges')
    .select('*');
    
  if (challengesError) {
    console.error('Error fetching challenges:', challengesError);
    return;
  }
  
  for (const challenge of challenges) {
    // Check if a corresponding step already exists
    const { data: existingStep } = await supabase
      .from('journey_steps')
      .select('id')
      .eq('id', challenge.id)
      .single();
      
    if (existingStep) {
      // Update existing step with challenge data
      const { error: updateError } = await supabase
        .from('journey_steps')
        .update({
          difficulty_level: challenge.difficulty_level,
          estimated_time_min: challenge.estimated_time_min,
          estimated_time_max: challenge.estimated_time_max,
          key_outcomes: challenge.key_outcomes,
          prerequisite_steps: challenge.prerequisite_challenges,
          is_custom: challenge.is_custom || false
        })
        .eq('id', challenge.id);
        
      if (updateError) {
        console.error(`Error updating step ${challenge.id}:`, updateError);
      }
    } else {
      // Insert new step from challenge
      const { error: insertError } = await supabase
        .from('journey_steps')
        .insert({
          id: challenge.id, // Preserve the ID
          name: challenge.name,
          description: challenge.description,
          phase_id: challenge.phase_id,
          order_index: challenge.order_index,
          difficulty_level: challenge.difficulty_level,
          estimated_time_min: challenge.estimated_time_min,
          estimated_time_max: challenge.estimated_time_max,
          key_outcomes: challenge.key_outcomes,
          prerequisite_steps: challenge.prerequisite_challenges,
          is_custom: challenge.is_custom || false
        });
        
      if (insertError) {
        console.error(`Error inserting step from challenge ${challenge.id}:`, insertError);
      }
    }
  }
  
  // 2. Migrate company challenge progress
  console.log('Migrating company challenge progress...');
  const { data: challengeProgress, error: progressError } = await supabase
    .from('company_challenge_progress')
    .select('*');
    
  if (progressError) {
    console.error('Error fetching challenge progress:', progressError);
    return;
  }
  
  for (const progress of challengeProgress) {
    // Check if a corresponding company_journey_step record exists
    const { data: existingProgress } = await supabase
      .from('company_journey_steps')
      .select('id')
      .eq('company_id', progress.company_id)
      .eq('step_id', progress.challenge_id)
      .single();
      
    if (existingProgress) {
      // Update existing progress
      const { error: updateError } = await supabase
        .from('company_journey_steps')
        .update({
          status: progress.status,
          notes: progress.notes,
          completion_percentage: progress.status === 'completed' ? 100 : 
                                 progress.status === 'not_started' ? 0 : 
                                 progress.completion_percentage || 50,
          completed_at: progress.completed_at
        })
        .eq('id', existingProgress.id);
        
      if (updateError) {
        console.error(`Error updating progress ${existingProgress.id}:`, updateError);
      }
    } else {
      // Insert new progress record
      const { error: insertError } = await supabase
        .from('company_journey_steps')
        .insert({
          company_id: progress.company_id,
          step_id: progress.challenge_id,
          status: progress.status,
          notes: progress.notes,
          completion_percentage: progress.status === 'completed' ? 100 : 
                                progress.status === 'not_started' ? 0 : 
                                progress.completion_percentage || 50,
          order_index: progress.order_index || 0,
          completed_at: progress.completed_at
        });
        
      if (insertError) {
        console.error(`Error inserting progress for company ${progress.company_id}, step ${progress.challenge_id}:`, insertError);
      }
    }
  }
  
  // 3. Migrate tool associations
  console.log('Migrating tool associations...');
  // (Similar pattern for tools)
  
  console.log('Migration complete!');
}

// Execute the migration
migrateJourneyData().catch(console.error);
```

### 3. Compatibility Views

```sql
-- Create views for backward compatibility

-- View for journey_steps in challenge format
CREATE OR REPLACE VIEW journey_challenges_view AS
SELECT
  js.id,
  js.name,
  js.description,
  js.phase_id,
  js.difficulty_level,
  js.estimated_time_min,
  js.estimated_time_max,
  js.key_outcomes,
  js.prerequisite_steps AS prerequisite_challenges,
  js.order_index,
  js.created_at,
  js.updated_at,
  js.is_custom
FROM
  journey_steps js;

-- View for company progress in challenge format
CREATE OR REPLACE VIEW company_challenge_progress_view AS
SELECT
  cjs.id,
  cjs.company_id,
  cjs.step_id AS challenge_id,
  cjs.status,
  cjs.notes,
  cjs.completion_percentage,
  cjs.order_index,
  cjs.created_at,
  cjs.updated_at,
  cjs.completed_at
FROM
  company_journey_steps cjs;
```

### 4. TypeScript Type Definitions

```typescript
// Updated type definitions in journey.types.ts

export type step_status = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type difficulty_level = 1 | 2 | 3 | 4 | 5;

// Unified data models
export interface JourneyPhase {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface JourneyStep {
  id: string;
  name: string;
  description?: string;
  phase_id: string;
  difficulty_level: difficulty_level;
  estimated_time_min: number;
  estimated_time_max: number;
  key_outcomes?: string[];
  prerequisite_steps?: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
  is_custom?: boolean;
}

export interface CompanyJourneyStep {
  id: string;
  company_id: string;
  step_id: string;
  status: step_status;
  notes?: string;
  custom_difficulty?: number;
  custom_time_estimate?: number;
  completion_percentage?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Tool {
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

export interface StepTool {
  id: string;
  step_id: string;
  tool_id: string;
  relevance_score: number;
  created_at: string;
}

export interface CompanyStepTool {
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

// Legacy type aliases for backward compatibility
export type JourneyChallenge = JourneyStep;
export type CompanyChallengeProgress = CompanyJourneyStep;
```

### 5. Core Service Layer

```typescript
// src/lib/services/journeySteps.service.ts

import { supabase } from '../supabase';
import { 
  JourneyPhase,
  JourneyStep,
  CompanyJourneyStep,
  step_status
} from '../types/journey.types';

export class JourneyStepsService {
  /**
   * Get all journey phases
   */
  static async getPhases(): Promise<JourneyPhase[]> {
    const { data, error } = await supabase
      .from('journey_phases')
      .select('*')
      .order('order_index');
      
    if (error) {
      console.error('Error fetching phases:', error);
      return [];
    }
    
    return data || [];
  }
  
  /**
   * Get steps, optionally filtered by phase
   */
  static async getSteps(options?: {
    phaseId?: string;
    includeCustom?: boolean;
  }): Promise<JourneyStep[]> {
    let query = supabase
      .from('journey_steps')
      .select('*')
      .order('order_index');
      
    if (options?.phaseId) {
      query = query.eq('phase_id', options.phaseId);
    }
    
    if (options?.includeCustom === false) {
      query = query.eq('is_custom', false);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching steps:', error);
      return [];
    }
    
    return data || [];
  }
  
  /**
   * Get a single step by ID
   */
  static async getStep(stepId: string): Promise<JourneyStep | null> {
    const { data, error } = await supabase
      .from('journey_steps')
      .select('*')
      .eq('id', stepId)
      .single();
      
    if (error) {
      console.error(`Error fetching step ${stepId}:`, error);
      return null;
    }
    
    return data;
  }
  
  /**
   * Get company's progress on steps
   */
  static async getCompanyProgress(
    companyId: string,
    options?: {
      stepId?: string;
      status?: step_status | step_status[];
    }
  ): Promise<CompanyJourneyStep[]> {
    let query = supabase
      .from('company_journey_steps')
      .select('*')
      .eq('company_id', companyId)
      .order('order_index');
      
    if (options?.stepId) {
      query = query.eq('step_id', options.stepId);
    }
    
    if (options?.status) {
      if (Array.isArray(options.status)) {
        query = query.in('status', options.status);
      } else {
        query = query.eq('status', options.status);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching company progress for ${companyId}:`, error);
      return [];
    }
    
    return data || [];
  }
  
  /**
   * Update company's progress on a step
   */
  static async updateStepProgress(
    companyId: string,
    stepId: string,
    updates: {
      status?: step_status;
      notes?: string;
      completion_percentage?: number;
      custom_difficulty?: number;
      custom_time_estimate?: number;
    }
  ): Promise<boolean> {
    // If status is being set to completed, add completed_at timestamp
    const updateData = { ...updates };
    if (updates.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    // Check if record exists
    const { data: existing } = await supabase
      .from('company_journey_steps')
      .select('id')
      .eq('company_id', companyId)
      .eq('step_id', stepId)
      .single();
      
    let error;
    
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('company_journey_steps')
        .update(updateData)
        .eq('company_id', companyId)
        .eq('step_id', stepId);
        
      error = result.error;
    } else {
      // Get maximum order_index
      const { data: maxOrderResult } = await supabase
        .from('company_journey_steps')
        .select('order_index')
        .eq('company_id', companyId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();
        
      const nextOrder = (maxOrderResult?.order_index || 0) + 10;
      
      // Insert new record
      const result = await supabase
        .from('company_journey_steps')
        .insert({
          company_id: companyId,
          step_id: stepId,
          ...updateData,
          order_index: nextOrder
        });
        
      error = result.error;
    }
    
    if (error) {
      console.error(`Error updating progress for company ${companyId}, step ${stepId}:`, error);
      return false;
    }
    
    return true;
  }
  
  /**
   * Reorder company's steps
   */
  static async reorderCompanySteps(
    companyId: string,
    stepOrders: { stepId: string; order: number }[]
  ): Promise<boolean> {
    // Start a transaction
    const { error } = await supabase.rpc('begin_transaction');
    if (error) {
      console.error('Failed to begin transaction:', error);
      return false;
    }
    
    try {
      // Update each step order
      for (const { stepId, order } of stepOrders) {
        const { error } = await supabase
          .from('company_journey_steps')
          .update({ order_index: order })
          .eq('company_id', companyId)
          .eq('step_id', stepId);
          
        if (error) throw error;
      }
      
      // Commit transaction
      await supabase.rpc('commit_transaction');
      return true;
    } catch (error) {
      console.error('Error reordering steps:', error);
      // Rollback transaction
      await supabase.rpc('rollback_transaction');
      return false;
    }
  }
}
```

## Testing Plan

### 1. Unit Tests

Create unit tests for all core service functions:

```typescript
// src/tests/journeySteps.service.test.ts

import { JourneyStepsService } from '../lib/services/journeySteps.service';
import { mockSupabase } from './mocks/supabase.mock';

// Mock Supabase
jest.mock('../lib/supabase', () => mockSupabase);

describe('JourneyStepsService', () => {
  beforeEach(() => {
    mockSupabase.reset();
  });
  
  test('getPhases returns phases ordered by order_index', async () => {
    mockSupabase.mockResponse('journey_phases', [
      { id: 'phase1', name: 'Phase 1', order_index: 10 },
      { id: 'phase2', name: 'Phase 2', order_index: 20 }
    ]);
    
    const phases = await JourneyStepsService.getPhases();
    
    expect(phases).toHaveLength(2);
    expect(phases[0].id).toBe('phase1');
    expect(phases[1].id).toBe('phase2');
    expect(mockSupabase.called('journey_phases')).toBe(true);
  });
  
  test('getSteps filters by phaseId when provided', async () => {
    mockSupabase.mockResponse('journey_steps', [
      { id: 'step1', name: 'Step 1', phase_id: 'phase1' }
    ]);
    
    await JourneyStepsService.getSteps({ phaseId: 'phase1' });
    
    expect(mockSupabase.calledWith('journey_steps', { eq: ['phase_id', 'phase1'] })).toBe(true);
  });
  
  test('updateStepProgress sets completed_at when status is completed', async () => {
    mockSupabase.mockResponse('company_journey_steps', [{ id: 'progress1' }]);
    
    await JourneyStepsService.updateStepProgress('company1', 'step1', { status: 'completed' });
    
    expect(mockSupabase.lastUpdatedData('company_journey_steps')).toHaveProperty('completed_at');
  });
  
  // Add more tests for each service method
});
```

### 2. Migration Tests

Create tests to validate the migration process:

```typescript
// src/tests/migration.test.ts

import { migrateJourneyData } from '../scripts/migration-script';
import { mockSupabase } from './mocks/supabase.mock';

jest.mock('../lib/supabase', () => mockSupabase);

describe('Journey Data Migration', () => {
  beforeEach(() => {
    mockSupabase.reset();
  });
  
  test('challenges are correctly migrated to steps', async () => {
    // Setup mock data
    mockSupabase.mockResponse('journey_challenges', [
      { 
        id: 'challenge1', 
        name: 'Challenge 1', 
        phase_id: 'phase1', 
        difficulty_level: 3,
        estimated_time_min: 30,
        estimated_time_max: 60,
        key_outcomes: ['Outcome 1'],
        prerequisite_challenges: ['challenge2']
      }
    ]);
    
    mockSupabase.mockResponse('journey_steps', []);
    
    // Run migration
    await migrateJourneyData();
    
    // Check results
    const insertedData = mockSupabase.lastInsertedData('journey_steps');
    expect(insertedData).toBeDefined();
    expect(insertedData.id).toBe('challenge1');
    expect(insertedData.prerequisite_steps).toEqual(['challenge2']);
  });
  
  test('existing steps are updated with challenge data', async () => {
    // Setup mock data
    mockSupabase.mockResponse('journey_challenges', [
      { 
        id: 'challenge1', 
        name: 'Challenge 1', 
        difficulty_level: 4
      }
    ]);
    
    mockSupabase.mockResponse('journey_steps', [
      { id: 'challenge1', name: 'Step 1', difficulty_level: 2 }
    ]);
    
    // Run migration
    await migrateJourneyData();
    
    // Check results
    const updatedData = mockSupabase.lastUpdatedData('journey_steps');
    expect(updatedData).toBeDefined();
    expect(updatedData.difficulty_level).toBe(4);
  });
  
  // Add more tests for tool migration, company progress, etc.
});
```

### 3. Database Schema Tests

Create tests to validate the database schema:

```typescript
// src/tests/schema.test.ts

import { supabase } from '../lib/supabase';

describe('Database Schema', () => {
  test('journey_steps table has all required columns', async () => {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'journey_steps' });
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    const columnNames = data.map(col => col.column_name);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('name');
    expect(columnNames).toContain('phase_id');
    expect(columnNames).toContain('difficulty_level');
    expect(columnNames).toContain('estimated_time_min');
    expect(columnNames).toContain('estimated_time_max');
    expect(columnNames).toContain('key_outcomes');
    expect(columnNames).toContain('prerequisite_steps');
  });
  
  test('company_journey_steps table has all required columns', async () => {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'company_journey_steps' });
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    const columnNames = data.map(col => col.column_name);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('company_id');
    expect(columnNames).toContain('step_id');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('completion_percentage');
    expect(columnNames).toContain('order_index');
  });
  
  // Add more tests for other tables
});
```

## Daily Tasks Breakdown

### Week 1 (May 5 - May 9)

**Monday (May 5)**
- Kick-off meeting
- Detailed analysis of current data models
- Create schema design document
- Begin drafting SQL schema updates

**Tuesday (May 6)**
- Finalize SQL schema updates
- Create database migration plan
- Begin implementing core SQL schema changes
- Setup test environments

**Wednesday (May 7)**
- Complete SQL schema changes
- Begin implementing TypeScript type definitions
- Start writing migration scripts
- Begin unit test framework setup

**Thursday (May 8)**
- Complete TypeScript type definitions
- Continue migration script implementation
- Begin service layer implementation
- Add first unit tests

**Friday (May 9)**
- Complete first version of migration scripts
- Continue service layer implementation
- Expand unit tests
- Team review of week's progress

### Week 2 (May 12 - May 16)

**Monday (May 12)**
- Finish service layer implementation
- Create compatibility views for legacy code
- Expand unit tests for service layer
- Begin migration script testing

**Tuesday (May 13)**
- Complete migration script implementation
- Test migration against staging data
- Address any issues found in testing
- Begin documentation of API changes

**Wednesday (May 14)**
- Finalize migration scripts and compatibility views
- Complete unit tests for all components
- Begin integration testing
- Update API documentation

**Thursday (May 15)**
- Integration testing with other services
- Performance testing for key queries
- Bug fixes and optimizations
- Complete documentation

**Friday (May 16)**
- Final testing and review
- Prepare demo of the data foundation
- Plan for Sprint 2 (UI Components)
- Sprint 1 retrospective

## Team Allocation

- **Database Engineer**: Schema design, SQL implementation, migration scripts
- **Backend Developer**: Service layer implementation, compatibility views
- **Testing Engineer**: Unit tests, migration tests, integration tests
- **Tech Lead**: Architecture oversight, code reviews, risk management

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Low | High | Create full backups before migration, run in staging first, comprehensive testing |
| Performance issues with new schema | Medium | Medium | Index key columns, optimize queries, performance test with production-scale data |
| Integration issues with existing code | Medium | High | Create compatibility views, thorough integration testing, phased rollout |
| Timeline slippage | Medium | Medium | Prioritize core functionality, have contingency buffer in schedule |
| Knowledge gaps about existing data | Medium | High | Thorough analysis phase, involve original developers where possible |

## Metrics for Success

- 100% of existing data successfully migrated
- Zero data loss or corruption
- All unit tests passing
- Key query performance equal to or better than before
- Backward compatibility maintained for existing features
- Core service API documented and demonstrated

## Next Steps After Sprint 1

Once the data foundation is established in Sprint 1, Sprint 2 will focus on:

1. Developing core UI components based on the new data model
2. Creating the component library for the redesigned journey system
3. Implementing the base layouts and navigation structures
4. Building the StepCard, PhaseNavigation, and ToolCard components
