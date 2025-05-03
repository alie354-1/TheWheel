# Persona Name Uniqueness Fix

## Issue Overview

After implementing the previous fixes for onboarding step transition and database permissions, we encountered a new error:

```
duplicate key value violates unique constraint "user_personas_user_id_name_key"
```

This occurs when attempting to create a new persona for an existing user. The database has a unique constraint that prevents a user from having multiple personas with the same name.

## Root Cause

In the `OnboardingController.tsx` file, when creating a new persona, we were using a static name pattern:

```typescript
name: `My ${personaType} profile`,
```

For example, if a user attempted to create another "founder" type persona, it would try to use the name "My founder profile" again, which violates the unique constraint.

## Solution Implemented

We modified the persona creation process to include a timestamp in the persona name, ensuring uniqueness:

```typescript
// Add timestamp to persona name to ensure uniqueness
const timestamp = new Date().getTime();
const personaName = `My ${personaType} profile (${timestamp})`;
```

For example, instead of creating "My founder profile", it would now create something like "My founder profile (1711406387465)".

## Technical Implementation Details

The fix was applied to the `OnboardingController.tsx` file in the `goToNextStep` function. We:

1. Added code to generate a timestamp when creating a new persona
2. Constructed a unique persona name using this timestamp
3. Added logging to track when unique names are being created
4. Used this unique name when calling `createPersona`

This approach is simple and effective because:
- It guarantees uniqueness (timestamps are always increasing)
- It's human-readable (users can still see the persona type in the name)
- It requires minimal code changes (just a few lines in one file)
- It doesn't require database schema changes

## Testing

The fix was tested by attempting to create multiple personas of the same type for a user. The system now:
1. Successfully creates personas with unique names
2. Avoids the duplicate key constraint error
3. Properly progresses through the onboarding flow

## Related Issues

This fix complements the earlier fixes:
- The database permissions fix that ensured users could access `user_settings`
- The step transition fix that ensured the flow progressed from role selection to company stage

Together, these fixes create a robust onboarding flow that properly handles persona creation and step transitions.
