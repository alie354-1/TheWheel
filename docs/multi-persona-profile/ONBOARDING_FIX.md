# Multi-Persona Profile Onboarding Fix

## Summary of Issues

Two critical issues were affecting the multi-persona profile system's onboarding flow:

1. **Database Permission Error**: 403 Forbidden errors when trying to access the `user_settings` table
2. **Step Transition Issue**: The onboarding flow would reset back to `role_selection` after creating a new persona instead of advancing to `company_stage`

## Root Causes

### Database Permission Error
The `user_settings` table was missing proper Row Level Security (RLS) policies, preventing authenticated users from inserting new settings records during profile creation.

### Step Transition Issue
In the `OnboardingController.tsx` component, when creating a new persona, the code was saving the *current* step (`role_selection`) to the onboarding state instead of the *next* step (`company_stage`). This caused the flow to reset when reloading the onboarding state.

## Implemented Solutions

### Fix 1: Added RLS Policies for user_settings Table

Added the following SQL policies to the database:

```sql
-- For user_settings table
CREATE POLICY user_settings_select ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_settings_insert ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_settings_update ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

These policies allow users to select, insert, and update only their own settings records.

### Fix 2: Updated Onboarding Flow Step Transition

Modified the `goToNextStep` function in `OnboardingController.tsx` to:

1. Determine the next step *before* creating a new persona
2. Save the *next* step (e.g., `company_stage`) to the onboarding state instead of the current step
3. Reorder the logic to ensure transitions are properly handled

Key changes:
- Moved the next step determination logic to the beginning of the function
- Updated the `updateOnboardingState` call to use `nextStep` instead of `currentStep`
- Added more logging to track the step transitions

## Technical Implementation Details

The main fix involved restructuring the `goToNextStep` function to determine the next step earlier in the process. This ensures that when a new persona is created, the correct onboarding step is saved in the database.

Before, the flow was:
1. Create persona
2. Save current step (`role_selection`) to onboarding state
3. Determine next step
4. Update UI to next step

After, the flow is:
1. Determine next step
2. Create persona
3. Save next step (`company_stage`) to onboarding state
4. Update UI to next step

This ensures that when the onboarding state is loaded again, it already has the correct next step stored.

## Testing

The changes were tested by creating a new persona and verifying that:
1. The `user_settings` table could be accessed without permission errors
2. The onboarding flow properly advanced to the next step (`company_stage` for founder personas)
3. The flow doesn't reset back to `role_selection` when reloading the page

## Additional Recommendations

For long-term stability:

1. **Error Handling**: Add more robust error handling for database permission errors
2. **Step Persistence**: Consider using local storage as a fallback for step persistence
3. **Migration Script**: Create a migration script to ensure these fixes are applied to all environments
4. **Testing Suite**: Add automated tests for the onboarding flow to catch regressions
