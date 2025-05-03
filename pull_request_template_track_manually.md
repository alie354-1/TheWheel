# Replace "I'll Do This Myself" with "Track Manually" Button

## Description
This PR implements the MVP requirement to replace the "I'll Do This Myself" button with a "Track Manually" button in the Journey Map module. The key difference is that the new button doesn't change the step status in the database, making it a UI-only element that indicates the user is handling the step manually.

## Changes Made
- Removed the `handleMarkDiy` function from JourneyStepDetails component
- Replaced the "I'll Do This Myself" button with a "Track Manually" button
- Removed 'diy' from the journey_step_status type in TypeScript
- Removed the markStepDiy method from companyJourney.service.ts
- Added a migration script to update the database schema if needed

## Testing
- Verified that the "Track Manually" button appears correctly when a step is not completed or skipped
- Confirmed that clicking the button doesn't change the step status in the database
- Tested the migration script to ensure it handles both cases (whether 'diy' exists in the enum or not)

## Screenshots
[Add screenshots of the new "Track Manually" button here]

## Related Issues
- Closes #XXX (Replace with the actual issue number)

## Documentation
- Added journey_map_track_manually_implementation.md to document the changes and implementation details
