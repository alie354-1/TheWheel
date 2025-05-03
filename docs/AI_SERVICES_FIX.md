# AI Services and Standup Bot Fix

## Issue Summary

The standup bot and other AI features were not working correctly. The error messages indicated two primary issues:

1. The supabase HTTP API returned a 406 (Not Acceptable) error when attempting to fetch user profiles
2. There was a 404 (Not Found) error when trying to call the `service_role_api.init_user_profile` function

## Root Causes

After investigation, we identified the following root causes:

1. **LLM Service Reset Issue**: The StandupAIService had previously disabled LLM service resets as it was causing issues, but this meant the service wasn't properly initializing with the latest feature flags.

2. **Feature Flag Conflicts**: There might have been conflicting feature flags (useRealAI vs. useMockAI) that were causing the AI services to use the wrong implementation.

3. **API Configuration**: The OpenAI API key might not have been properly configured or might have expired.

## Implemented Fixes

### 1. Fixed StandupAIService.ts

Re-enabled the LLM service reset with proper error handling:

```typescript
// Re-enabled LLM service reset with error handling
try {
  featureFlagsService.resetLLMService();
  console.log('LLM service reset successful');
} catch (resetError) {
  console.error('Error resetting LLM service:', resetError);
  // Continue execution despite reset error
}
```

This ensures that the LLM service gets updated when feature flags change, while preventing the reset from crashing the entire application if there's an issue.

### 2. Created Diagnostic Tools

Created several scripts to diagnose and fix AI service issues:

#### fix-ai-services.js
- Checks OpenAI API configuration in the database
- Verifies and corrects feature flags if they're misconfigured
- Resets the LLM service to use the correct configuration
- Tests basic LLM functionality and conversation memory

#### test-standup-bot.js
- Tests each component of the standup bot individually
- Verifies that section feedback, summaries, and task generation work
- Creates test data to validate the conversation flow

#### run-ai-diagnostics.sh
- Shell script to make it easy to run the diagnostic tools
- Provides a menu to select different diagnostic options
- Includes guidance for resolving persistent issues

## How to Use

1. Run the diagnostic script:
   ```
   ./scripts/run-ai-diagnostics.sh
   ```

2. Select an option:
   - Option 1: Run the general AI services diagnostic
   - Option 2: Run the standup bot test
   - Option 3: Run both diagnostics

3. Review the results and follow any suggested fixes

## Technical Details

The fix addresses several architectural considerations:

1. **Service Initialization**: The LLM service is now properly reset when feature flags change
2. **Error Handling**: Added robust error handling to prevent cascading failures
3. **Testing Isolation**: Created test user IDs and entries to avoid affecting production data
4. **Diagnostic Logging**: Enhanced logging to identify issues more easily

## Additional Recommendations

If issues persist, check:

1. Verify your OpenAI API key is valid and properly set in your database
2. Ensure network connectivity to OpenAI's API
3. Check for any firewall or proxy issues that might be blocking API calls
4. Verify your feature flags are properly set: useRealAI=true, useMockAI=false
