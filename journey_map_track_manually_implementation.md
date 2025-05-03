# Track Manually Implementation

This document outlines the changes made to replace the "I'll Do This Myself" button with a "Track Manually" button in the Journey Map module, as per the MVP requirements.

## Overview

The key difference between the old "I'll Do This Myself" and the new "Track Manually" functionality is:

- **I'll Do This Myself (Old)**: Was intended to change the step status to 'diy' in the database (though it appears this status may not have been properly implemented in the database schema)
- **Track Manually (New)**: Does not change the step status, but provides a UI element for users to indicate they're handling the step manually

## Changes Made

### 1. Frontend Component Updates

**File: `src/components/company/journey/JourneyStepDetails.tsx`**
- Removed the `handleMarkDiy` function
- Replaced the "I'll Do This Myself" button with a "Track Manually" button
- The new button doesn't change the step status in the database
- The button is still visible only when the step is not completed or skipped

### 2. Type Definition Updates

**File: `src/lib/types/journey.types.ts`**
- Removed 'diy' from the `journey_step_status` type:
```typescript
// Old
export type journey_step_status = 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'diy';

// New
export type journey_step_status = 'not_started' | 'in_progress' | 'completed' | 'skipped';
```

### 3. Service Updates

**File: `src/lib/services/companyJourney.service.ts`**
- Removed the `markStepDiy` method that was previously used to update the step status to 'diy'
- Updated the local type definition to match the changes in journey.types.ts:
```typescript
// Old
type journey_step_status = 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'diy';

// New
type journey_step_status = 'not_started' | 'in_progress' | 'completed' | 'skipped';
```

### 4. Database Schema Updates

**File: `supabase/migrations/20250428155000_remove_diy_status.sql`**
- Created a migration to update the database schema if needed:
  - Checks if 'diy' exists in the journey_step_status enum
  - If it exists:
    - Creates a new enum type without 'diy'
    - Updates existing records with 'diy' status to 'in_progress'
    - Alters tables to use the new enum type
    - Drops the old enum type
    - Renames the new type to the original name
  - If it doesn't exist:
    - Simply adds a comment to the existing enum type

## Implementation Notes

- The "Track Manually" button is now a UI-only element that doesn't change the database state
- This aligns with the MVP requirements to simplify the journey step status tracking
- Any existing steps that were previously marked as 'diy' will now show as 'in_progress' (if the 'diy' status was actually used in the database)
- The button is still conditionally displayed based on the step's current status
- It appears that there may have been a discrepancy between the TypeScript types and the actual database schema, where 'diy' was defined in the TypeScript types but may not have been properly implemented in the database

## Future Considerations

- If tracking of manually handled steps becomes a requirement, we could add a separate boolean flag in the company_progress table
- This would allow tracking which steps are being handled manually without affecting the main status flow
