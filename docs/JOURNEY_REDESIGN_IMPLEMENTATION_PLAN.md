# Journey Redesign Implementation Plan

## Overview

This document outlines the technical implementation plan for the redesigned journey experience in The Wheel platform. It provides a roadmap for developers to convert the existing step-based journey system to the new challenge-based architecture.

## Migration Strategy

The implementation will follow a phased approach to minimize disruption:

1. **Phase 1**: Database schema updates and data migration
2. **Phase 2**: Core UI component development
3. **Phase 3**: Page implementation and integration
4. **Phase 4**: Legacy route handling and compatibility layer
5. **Phase 5**: Testing and performance optimization

## Phase 1: Database Schema Updates

### Step 1: Create New Tables

```sql
-- Create journey_phases table
CREATE TABLE journey_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create journey_challenges table
CREATE TABLE journey_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  phase_id UUID REFERENCES journey_phases(id) ON DELETE CASCADE,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_time_min INTEGER NOT NULL,
  estimated_time_max INTEGER NOT NULL,
  key_outcomes TEXT[] NOT NULL DEFAULT '{}',
  prerequisite_challenges UUID[] DEFAULT '{}',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create company_challenge_progress table
CREATE TABLE company_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES journey_challenges(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, challenge_id)
);
```

### Step 2: Data Migration Scripts

Create scripts to:

1. Convert existing journey_steps to journey_phases
2. Convert journey_tasks to journey_challenges
3. Map company_progress data to company_challenge_progress
4. Update tool references to maintain connections

### Step 3: Schema Triggers and Functions

```sql
-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create timestamp triggers
CREATE TRIGGER update_journey_phases_timestamp
BEFORE UPDATE ON journey_phases
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_journey_challenges_timestamp
BEFORE UPDATE ON journey_challenges
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_company_challenge_progress_timestamp
BEFORE UPDATE ON company_challenge_progress
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

## Phase 2: Core UI Component Development

### Challenge Card Component

Create a card component to display individual business challenges:

```typescript
// ChallengeCard.tsx
import React from 'react';
import { JourneyChallenge, challenge_status } from '../../lib/types/journey-challenges.types';
import { DifficultyIndicator, StatusBadge, EstimatedTime } from './';

interface ChallengeCardProps {
  challenge: JourneyChallenge;
  status?: challenge_status;
  isSelected?: boolean;
  onClick?: () => void;
  onStartClick?: () => void;
  onCustomizeClick?: () => void;
  onMarkIrrelevantClick?: () => void;
}

// Implementation...
```

### Challenge List Component

Create a component to display and filter challenge collections:

```typescript
// ChallengeList.tsx
import React, { useState } from 'react';
import { ChallengeCard } from './ChallengeCard';
import { JourneyChallenge, CompanyChallengeProgress } from '../../lib/types/journey-challenges.types';

interface ChallengeListProps {
  challenges: JourneyChallenge[];
  progressData?: Record<string, CompanyChallengeProgress>;
  onChallengeClick?: (challenge: JourneyChallenge) => void;
  onStartClick?: (challenge: JourneyChallenge) => void;
  onCustomizeClick?: (challenge: JourneyChallenge) => void;
  onMarkIrrelevantClick?: (challenge: JourneyChallenge) => void;
}

// Implementation...
```

### Phase Progress Component

Create a component to visualize phase completion:

```typescript
// PhaseProgress.tsx
import React from 'react';

interface PhaseProgressProps {
  name: string;
  description: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
  onClick: () => void;
}

// Implementation...
```

### Challenge Editor Component

Create a form component for creating/editing challenges:

```typescript
// ChallengeEditor.tsx
import React, { useState, useEffect } from 'react';
import { JourneyChallenge, JourneyPhase } from '../../lib/types/journey-challenges.types';
import { JourneyChallengesService } from '../../lib/services/journeyChallenges.service';

interface ChallengeEditorProps {
  initialChallenge?: JourneyChallenge;
  isEditing: boolean;
  onSubmit: (challenge: JourneyChallenge) => void;
  onCancel: () => void;
}

// Implementation...
```

## Phase 3: Page Implementation

### Journey Overview Page

```typescript
// JourneyOverviewPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JourneyChallenge, JourneyPhase } from '../../lib/types/journey-challenges.types';
import { JourneyChallengesService } from '../../lib/services/journeyChallenges.service';
import { PhaseProgress } from '../../components/company/journey/PhaseProgress';

// Implementation...
```

### Challenges Page

```typescript
// JourneyChallengesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChallengeList } from '../../components/company/journey/ChallengeList';
import { JourneyChallenge, JourneyPhase } from '../../lib/types/journey-challenges.types';
import { JourneyChallengesService } from '../../lib/services/journeyChallenges.service';

// Implementation...
```

### Challenge Detail Page (Enhanced JourneyStepPage)

```typescript
// JourneyStepPage.tsx (enhanced)
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import JourneyStepDetails from '../../components/company/journey/JourneyStepDetails';
import ChallengeEditor from '../../components/company/journey/ChallengeEditor/ChallengeEditor';
import { JourneyChallengesService } from '../../lib/services/journeyChallenges.service';

interface JourneyStepPageProps {
  mode?: 'view' | 'edit' | 'create';
}

// Implementation...
```

## Phase 4: Service Implementation

### Journey Challenges Service

```typescript
// journeyChallenges.service.ts
import { supabase } from '../supabase';
import { 
  JourneyChallenge, 
  JourneyPhase, 
  CompanyChallengeProgress, 
  challenge_status 
} from '../types/journey-challenges.types';

export class JourneyChallengesService {
  // Methods for CRUD operations on challenges, phases, and progress
  // ...
}
```

### Legacy Compatibility Layer

```typescript
// journeyCompatibility.service.ts
import { supabase } from '../supabase';
import { JourneyChallengesService } from './journeyChallenges.service';

export class JourneyCompatibilityService {
  // Methods to map between old and new data models
  // ...
}
```

## Phase 5: Route Updates

Update the main application routes to include the new journey pages:

```typescript
// App.tsx (route updates)
<Route path="company">
  // Existing routes
  
  // New journey routes
  <Route path="journey/overview" element={<JourneyOverviewPage />} />
  <Route path="journey/challenges" element={<JourneyChallengesPage />} />
  <Route path="journey/challenge/:challengeId" element={<JourneyStepPage />} />
  <Route path="journey/challenge/:challengeId/customize" element={<JourneyStepPage mode="edit" />} />
  <Route path="journey/challenges/create" element={<JourneyStepPage mode="create" />} />
  
  // Legacy route handling
  <Route path="journey" element={<JourneyMapPage />} />
  <Route path="journey/step/:stepId" element={<JourneyStepPage />} />
</Route>
```

## Phase 6: Testing and Optimization

### Testing Strategy

1. **Unit tests** for individual components
2. **Integration tests** for page components and service interactions
3. **Migration tests** to verify data integrity after schema updates
4. **End-to-end tests** for key user flows
5. **Performance tests** to ensure the new implementation maintains or improves response times

### Performance Optimization

1. Implement data caching for journey challenges and progress information
2. Use virtualization for challenge lists to improve rendering performance
3. Optimize database queries with proper indexing
4. Implement lazy loading for detailed challenge information

## Timeline

| Phase | Estimated Time | Dependencies |
|-------|----------------|--------------|
| Database Schema Updates | 1 week | None |
| Core UI Component Development | 2 weeks | Phase 1 |
| Page Implementation | 2 weeks | Phase 2 |
| Legacy Route Handling | 1 week | Phase 3 |
| Testing and Optimization | 2 weeks | Phase 4 |

Total estimated implementation time: **8 weeks**

## Migration Considerations

- Implement feature flags to enable gradual rollout
- Provide temporary dual navigation to both old and new interfaces
- Include comprehensive documentation for users transitioning to the new journey experience
- Create a feedback mechanism specifically for the redesign
- Monitor key metrics before and after launch to measure impact

## Conclusion

This implementation plan provides a systematic approach to transitioning from the existing journey system to the redesigned challenge-based architecture. By following these phases and considering the migration strategy, the development team can efficiently implement the new journey experience while minimizing disruption to existing users.
