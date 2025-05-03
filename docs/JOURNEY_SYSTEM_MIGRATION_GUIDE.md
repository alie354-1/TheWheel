# Journey System: Migration Guide

**Date:** May 3, 2025  
**Version:** 1.0

This guide helps developers migrate from the existing challenges/steps dual system to the new unified journey system.

## Overview

The Journey System has been redesigned to consolidate the previously separate "steps" and "challenges" concepts into a single cohesive model. This guide will help you transition your code to use the new unified system.

## Migration Timeline

| Phase | Date | Description |
|-------|------|-------------|
| Phase 1 | May 2025 | Compatibility layer available |
| Phase 2 | June 2025 | UI components migrated |
| Phase 3 | July 2025 | Old system deprecated (warnings begin) |
| Phase 4 | August 2025 | Old system removed |

## Key Changes

### Database Tables & Views

**Old System:**
```
journey_challenges
company_challenge_progress
challenge_tool_recommendations
```

**New System:**
```
journey_steps
company_journey_steps  
step_tools
company_step_tools
```

**Compatibility Views:**
```
company_challenge_progress_view → maps to company_journey_steps
challenge_tool_recommendations_view → maps to step_tools
```

### Service Changes

**Old Services:**
```typescript
import { JourneyChallengesService } from '../lib/services/journeyChallenges.service';
import { CompanyJourneyService } from '../lib/services/companyJourney.service';
```

**New Unified Service:**
```typescript
import { JourneyUnifiedService } from '../lib/services/journey-unified.service';
```

## Migration Steps

### Step 1: Update Imports

Replace:
```typescript
import { JourneyChallenge } from '../lib/types/journey-challenges.types';
import { CompanyChallengeProgress } from '../lib/types/journey-challenges.types';
```

With:
```typescript
import { JourneyChallenge, CompanyChallengeProgress } from '../lib/types/journey-unified.types';
```

### Step 2: Replace Service Calls

**Old Way:**
```typescript
const challenges = await JourneyChallengesService.getChallenges();
const progress = await CompanyJourneyService.getChallengeProgress(companyId, challengeId);
```

**New Way:**
```typescript 
const challenges = await JourneyUnifiedService.getSteps();
const progress = await JourneyUnifiedService.getStepProgress(companyId, challengeId);
```

### Step 3: Update Tool-Related Code

**Old Way:**
```typescript
const tools = await JourneyChallengesService.getToolsForChallenge(challengeId);
const evaluation = await CompanyJourneyService.evaluateTool(companyId, challengeId, toolId, rating);
```

**New Way:**
```typescript
const tools = await JourneyUnifiedService.getToolsForStep(challengeId);
const evaluation = await JourneyUnifiedService.updateToolEvaluation(companyId, challengeId, toolId, { rating });
```

## API Mapping

| Old API | New API | Notes |
|---------|---------|-------|
| `getChallenges()` | `getSteps()` | Direct replacement |
| `getChallengeById(id)` | `getStepById(id)` | Direct replacement |
| `getChallengeProgress(companyId, challengeId)` | `getStepProgress(companyId, stepId)` | Direct replacement |
| `updateChallengeProgress(companyId, challengeId, data)` | `updateStepProgress(companyId, stepId, data)` | Status values remain the same |
| `getToolsForChallenge(challengeId)` | `getToolsForStep(stepId)` | Direct replacement |
| `evaluateTool(companyId, challengeId, toolId, rating)` | `updateToolEvaluation(companyId, stepId, toolId, { rating })` | New version accepts an options object |

## TypeScript Types

### Type Aliases

The new system provides type aliases for backward compatibility:

```typescript
// In journey-unified.types.ts
export type JourneyChallenge = JourneyStep;
export type CompanyChallengeProgress = CompanyJourneyStep;
```

This means existing code that expects `JourneyChallenge` types will continue to work.

### Updated Interfaces

New interfaces have more comprehensive properties:

```typescript
export interface JourneyStep {
  id: string;
  name: string;
  description: string;
  phase_id: string;
  difficulty_level: number;
  estimated_time_min: number;
  estimated_time_max: number;
  key_outcomes: string[];
  prerequisite_steps: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}
```

## Common Migration Patterns

### Pattern 1: Challenge Lists

**Before:**
```tsx
function ChallengeList() {
  const [challenges, setChallenges] = useState<JourneyChallenge[]>([]);
  
  useEffect(() => {
    async function loadChallenges() {
      const data = await JourneyChallengesService.getChallenges();
      setChallenges(data);
    }
    loadChallenges();
  }, []);
  
  return (
    <div>
      {challenges.map(challenge => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}
```

**After:**
```tsx
function ChallengeList() {
  const [challenges, setChallenges] = useState<JourneyChallenge[]>([]);
  
  useEffect(() => {
    async function loadChallenges() {
      const data = await JourneyUnifiedService.getSteps();
      setChallenges(data);
    }
    loadChallenges();
  }, []);
  
  return (
    <div>
      {challenges.map(challenge => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}
```

### Pattern 2: Tool Selection

**Before:**
```tsx
function ToolSelector({ challengeId }) {
  const [tools, setTools] = useState([]);
  
  useEffect(() => {
    async function loadTools() {
      const data = await JourneyChallengesService.getToolsForChallenge(challengeId);
      setTools(data);
    }
    loadTools();
  }, [challengeId]);
  
  // Rest of component
}
```

**After:**
```tsx
function ToolSelector({ challengeId }) {
  const [tools, setTools] = useState([]);
  
  useEffect(() => {
    async function loadTools() {
      const data = await JourneyUnifiedService.getToolsForStep(challengeId);
      setTools(data);
    }
    loadTools();
  }, [challengeId]);
  
  // Rest of component remains the same
}
```

## Testing Your Migration

1. Begin by using the new service alongside the old one
2. Compare results to ensure data matches
3. Test with a small component first
4. Gradually migrate larger parts of the UI
5. Verify all functionality in the test environment

## Troubleshooting

### Common Issues

1. **Type Errors**: If you see TypeScript errors, check if you're using properties that have been renamed in the new schema
   - Solution: Review the type definitions in `journey-unified.types.ts`

2. **Missing Data**: If data appears to be missing after migration
   - Solution: Verify you're not accessing renamed properties or using filters that no longer apply

3. **Performance Issues**: If you notice slower performance after migration
   - Solution: Check that you're using the appropriate indexes and not doing unnecessary joins

### Support

For assistance with migration, please contact:
- #journey-migration-support channel in Slack
- Email journey-support@thewheel.com
- Create a ticket in the migration project board
