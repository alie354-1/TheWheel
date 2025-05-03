# Onboarding Progress Tracking Fix

## Issue Summary

Users were experiencing issues with onboarding progress tracking:
1. The progress bar showed 0% even after completing several steps
2. The onboarding steps weren't being properly marked as completed
3. The `service_role_api.init_user_profile` function was failing (404 error)

## Root Causes

1. **Completed Steps Tracking**: Steps weren't being added to the `completed_steps` array in the onboarding state when users moved between steps.
2. **Progress Calculation**: The progress calculation in the `OnboardingProgressCard` component used a simplistic approach that didn't account for the actual flow.
3. **Direct Profile Creation**: The service role API function had issues, but we've implemented a direct fallback approach.

## Implementation Details

### 1. Fixed Step Completion Tracking in `OnboardingController.tsx`

Added code to track completed steps within the `goToNextStep` function:

```javascript
// Save the current step to completed_steps before moving to the next one
const newCompletedSteps = [...(onboardingState?.completed_steps || [])];
if (currentStep !== 'welcome' && !newCompletedSteps.includes(currentStep)) {
  newCompletedSteps.push(currentStep);
}

// Also update the onboarding state with the completed step
if (createdPersonaId && currentStep !== 'welcome') {
  await multiPersonaProfileService.updateOnboardingState(user.id, createdPersonaId, {
    current_step: nextStep,
    completed_steps: newCompletedSteps
  });
}
```

### 2. Improved Progress Calculation in `OnboardingProgressCard.tsx`

Enhanced the progress calculation algorithm to:
- Consider all steps in the onboarding flow
- Give partial credit for the current step in progress
- Show 100% when onboarding is complete

```javascript
// Calculate progress based on completed steps and include the current step
const allSteps = [
  'welcome',
  'role_selection',
  'company_stage',
  'industry_selection',
  'skill_level', 
  'goals_selection',
  'theme_preferences',
  'notification_preferences',
  'recommendations',
  'completion'
];
const totalSteps = allSteps.length - 1; // Excluding welcome step

// If current step is in completion or user has completed all steps
if (state.is_complete || state.current_step === 'completion') {
  setProgress(100);
} else {
  // Count completed steps, but also count the current step as partial progress
  const completedCount = state.completed_steps.length;
  const currentStepIndex = allSteps.indexOf(state.current_step);
  
  // Calculate percentage: completed steps + partial credit for current step
  const calculatedProgress = Math.min(100, Math.round(((completedCount + 0.5) / totalSteps) * 100));
  setProgress(calculatedProgress);
}
```

### 3. Handled Profile Completion in `App.tsx`

Updated the routing logic to handle returning users properly:

```javascript
// Check if this is a returning user (has a lastLogin timestamp in setup_progress)
const isReturningUser = (profile?.setup_progress as any)?.lastLogin !== undefined;

// Only redirect to onboarding if this isn't a returning user
if (!isReturningUser) {
  // Redirect to general onboarding which will handle personas
  return <Navigate to="/onboarding" replace />;
}
```

## Testing

A test script has been created in `scripts/test-profile-completion.js` to verify the onboarding progress calculation. This script:

1. Creates a test user and persona
2. Sets up an onboarding state with some completed steps
3. Calculates the expected progress percentage
4. Confirms the calculation matches our UI implementation

## Results

With these changes:
- Progress tracking now accurately reflects the user's position in the onboarding flow
- Each step is properly marked as completed when the user moves to the next step
- Returning users can access the dashboard without being redirected to onboarding
- User profiles are created directly, bypassing the service_role_api function
