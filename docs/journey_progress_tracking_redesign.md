# Journey Progress Tracking Redesign

## Overview

This document outlines the implementation plan for removing completion percentages from the journey system and replacing them with a more sophisticated progress tracking approach. The current percentage-based system implies that the startup journey can be "completed," which contradicts the reality that startup journeys are ongoing, iterative processes without definitive endpoints.

## Current Implementation

The current system tracks progress using:

- **Domain Progress**: Percentage bars (e.g., Strategy 80%, Product 60%) displayed in the `YourProgress` component
- **Step Status**: Individual steps tracked as `not_started`, `active`, `complete`, `skipped`
- **Color-coded Progress**: Green (75%+), Blue (50%+), Amber (25%+), Gray (below 25%)

## New Conceptual Model

The new progress tracking system is built around three core concepts:

### 1. Maturity Levels

Instead of completion percentages, we'll track expertise/maturity in each domain:

- **Exploring**: Initial investigation, learning the basics
- **Learning**: Actively studying the domain, understanding key concepts
- **Practicing**: Applying knowledge, implementing strategies
- **Refining**: Optimizing approach, making data-driven improvements
- **Teaching**: Mastery level, able to guide others

### 2. Current State

Reflecting the active focus areas for the company:

- **Active Focus**: Currently prioritized, daily/weekly engagement
- **Maintaining**: Established processes requiring periodic attention
- **Future Focus**: Planned for upcoming work
- **Dormant**: Not currently a focus area

### 3. Engagement Metrics

Quantitative measures that provide context without implying completion:

- **Total Steps Engaged**: Number of steps worked on in this domain
- **Days Since Last Activity**: Recency of engagement
- **Engagement Streak**: Consecutive days with domain activity
- **Time Invested Days**: Cumulative time spent in the domain
- **First Engaged Date**: When work in this domain began

### 4. Team Context (When Applicable)

For multi-person teams:

- **Primary Owner**: Team member primarily responsible
- **Team Involvement Level**: Solo, collaborative, or delegated

## Database Schema

### New Table: `new_company_domain_progress`

```sql
CREATE TABLE new_company_domain_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_journey_id UUID REFERENCES new_company_journeys(id),
  domain_id UUID REFERENCES new_journey_domains(id),
  
  -- Core tracking
  maturity_level TEXT CHECK (maturity_level IN ('exploring', 'learning', 'practicing', 'refining', 'teaching')) DEFAULT 'exploring',
  current_state TEXT CHECK (current_state IN ('active_focus', 'maintaining', 'future_focus', 'dormant')) DEFAULT 'future_focus',
  
  -- Engagement metrics
  total_steps_engaged INTEGER DEFAULT 0,
  engagement_streak INTEGER DEFAULT 0,
  time_invested_days INTEGER DEFAULT 0,
  first_engaged_date TIMESTAMP,
  last_activity_date TIMESTAMP,
  
  -- Team context
  primary_owner_id UUID REFERENCES auth.users(id),
  team_involvement_level TEXT CHECK (team_involvement_level IN ('solo', 'collaborative', 'delegated')) DEFAULT 'solo',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(company_journey_id, domain_id)
);
```

## TypeScript Types

```typescript
// Add to new_journey.types.ts
export type MaturityLevel = 'exploring' | 'learning' | 'practicing' | 'refining' | 'teaching';
export type CurrentState = 'active_focus' | 'maintaining' | 'future_focus' | 'dormant';
export type TeamInvolvement = 'solo' | 'collaborative' | 'delegated';

export interface NewCompanyDomainProgress {
  id: string;
  company_journey_id: string;
  domain_id: string;
  maturity_level: MaturityLevel;
  current_state: CurrentState;
  total_steps_engaged: number;
  engagement_streak: number;
  time_invested_days: number;
  first_engaged_date?: string;
  last_activity_date?: string;
  primary_owner_id?: string;
  team_involvement_level: TeamInvolvement;
  created_at: string;
  updated_at: string;
  
  // Relationships
  domain?: NewJourneyDomain;
  primary_owner?: User;
}

// Update existing dashboard types
export interface NewDomainProgress {
  domain_id: string;
  domain_name: string;
  maturity_level: MaturityLevel;
  current_state: CurrentState;
  total_steps_engaged: number;
  time_invested_days: number;
  color?: string;
}
```

## UI Component: `CompanyJourneyStatus`

This new component will replace the current `YourProgress` component, displaying the domain status in a more meaningful way:

```
┌─────────────────────────────────────────┐
│ Strategy                    🔥 Active   │
│ 🎯 Refining                            │
│ 12 steps • 45 days • Active 3 days    │
│ [Sarah's focus]                        │
└─────────────────────────────────────────┘
```

Features include:
- Domain cards with state and maturity indicators
- Engagement metrics display
- Interactive state change options
- Team member avatars (when applicable)
- Hover details with quantitative data

## Service Layer

### `DomainProgressService`

New service to manage domain progress tracking:

- `getDomainProgress(companyJourneyId)`: Get all domain progress
- `updateDomainProgress(domainId, updates)`: Update state/maturity
- `calculateEngagementMetrics(domainId)`: Compute metrics from step activity
- `suggestStateTransitions(domainId)`: AI-powered state suggestions
- `getTeamInvolvement(companyJourneyId)`: Team member distribution

## Smart Progression Logic

### Maturity Advancement Triggers

- `exploring` → `learning`: Complete first step in domain
- `learning` → `practicing`: Complete 3+ steps + 2+ weeks engagement
- `practicing` → `refining`: Complete 8+ steps + demonstrate outcomes
- `refining` → `teaching`: Share insights or mentor others

### State Transition Suggestions

- No activity 14+ days → suggest 'future_focus' or 'dormant'
- Daily activity 3+ days → suggest 'active_focus'
- Weekly touchpoints → suggest 'maintaining'

## Data Migration Strategy

### Converting Existing Progress Data

```sql
-- Convert existing percentage data to new model
INSERT INTO new_company_domain_progress (...)
SELECT 
  company_journey_id,
  domain_id,
  CASE 
    WHEN percentage >= 75 THEN 'refining'
    WHEN percentage >= 50 THEN 'practicing' 
    WHEN percentage >= 25 THEN 'learning'
    ELSE 'exploring'
  END as maturity_level,
  CASE
    WHEN percentage >= 50 THEN 'maintaining'
    WHEN percentage >= 25 THEN 'active_focus'
    ELSE 'future_focus'
  END as current_state,
  -- Calculate engagement metrics from existing step data
  ...
FROM existing_progress_data;
```

### Backfilling Engagement Metrics

- Calculate `total_steps_engaged` from step completion history
- Set `first_engaged_date` from earliest step activity
- Compute `time_invested_days` from step durations

## Implementation Phases

### Phase 1: Database Schema & Types
- Create new domain progress table
- Update TypeScript types
- Define database migration

### Phase 2: Service Layer Updates
- Create domain progress service
- Update step completion handlers
- Add engagement tracking logic

### Phase 3: Component Replacement
- Create `CompanyJourneyStatus` component
- Update dashboard to use new component
- Implement interactive state management

### Phase 4: Data Migration
- Migrate existing progress data
- Backfill engagement metrics
- Validate data consistency

### Phase 5: Dashboard Integration
- Update dashboard layout
- Add new insights panels
- Implement team view features

### Phase 6: Smart Automation
- Implement auto-progression logic
- Add state transition suggestions
- Enable team intelligence features

## Implementation Timeline

- **Database & Types**: 1-2 days
- **Basic Service Layer**: 2-3 days
- **Component Replacement**: 3-4 days
- **Data Migration**: 1-2 days
- **Dashboard Integration**: 2-3 days
- **Smart Features**: 3-4 days

**Total Estimated Time**: 12-18 days

## Philosophical Shift

This redesign represents a philosophical shift in how we think about the startup journey:

1. **From Linear to Continuous**: Recognizing that domains are never "complete" but evolve through different states
2. **From Completion to Maturity**: Tracking growth in expertise rather than progress toward an endpoint
3. **From Percentage to Engagement**: Measuring active involvement rather than completion status
4. **From Individual to Team**: Acknowledging the collaborative nature of domain development

By removing completion percentages and implementing this new system, we better reflect the reality that the startup journey is ongoing, with founders continuously cycling through domains at different levels of maturity and focus.
