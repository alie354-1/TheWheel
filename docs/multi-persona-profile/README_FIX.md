# Multi-Persona Profile System Fix

## Overview

This repository contains a fix for the multi-persona profile system's user initialization flow. There was a missing database function that was causing profile initialization to fail, resulting in errors during onboarding.

## The Issue

The application code was trying to call a function (`service_role_api.init_user_profile`) that didn't exist in the database. This caused errors in:

1. Profile initialization for new users
2. Persona creation during onboarding
3. User onboarding process completion

## The Solution

We've created:

1. A migration SQL file that creates the missing function
2. A script to apply this migration
3. A test script to verify the fix works
4. Documentation explaining the issue and fix

## How to Apply the Fix

1. Make sure your Supabase environment variables are set in `.env`:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

2. Run the migration script:
   ```bash
   node scripts/run-service-role-api-migration.js
   ```

3. Verify the fix:
   ```bash
   node scripts/test-service-role-api-function.js
   ```

## Files Created

- `supabase/migrations/20250316192200_add_service_role_api_function.sql`: The SQL migration
- `scripts/run-service-role-api-migration.js`: Script to apply the migration 
- `scripts/test-service-role-api-function.js`: Test script to verify the fix
- `docs/multi-persona-profile/MIGRATION_FIX.md`: Detailed documentation of the fix
- `docs/multi-persona-profile/README_FIX.md`: This overview document

## What The Fix Does

The migration:

1. Creates the `service_role_api` schema if it doesn't exist
2. Creates an `init_user_profile` function in this schema that initializes a user profile by:
   - Creating a core profile if needed
   - Creating a default persona if needed
   - Setting up proper onboarding state
   - Returning all necessary data in the format expected by the application
3. Grants proper permissions to the service role

## Technical Notes

- No changes were needed to the TypeScript code, as the function now matches what the code expected
- The function uses `SECURITY DEFINER` to ensure it has sufficient permissions
- The function properly integrates with the multi-persona profile system's data structure

## Related Documentation

For more detailed information, see:
- [Migration Fix Documentation](./MIGRATION_FIX.md)
- [Multi-Persona Profile System Documentation](./TECHNICAL_DOCUMENTATION.md)
