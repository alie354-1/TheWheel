# Multi-Persona Profile System Migration Fix

## Issue

There was an error in the profile initialization flow that caused the following errors:

```
GET https://aerakewgxmkexuyzsomh.supabase.co/rest/v1/user_core_profiles?select=*&id=fe965d81-d7c4-4578-b495-210f32ff44ca 406 (Not Acceptable)

POST https://aerakewgxmkexuyzsomh.supabase.co/rest/v1/rpc/service_role_api.init_user_profile 404 (Not Found)

Error initializing user profile: 
{code: 'PGRST202', details: 'Searched for the function public.service_role_api.init_user_profile, but no matches were found in the schema cache.', hint: 'Perhaps you meant to call the function public.migrate_existing_profiles', message: 'Could not find the function public.service_role_api.init_user_profile(user_id) in the schema cache'}
```

## Root Cause

The application code in `multi-persona-profile.service.ts` was trying to call a database function `service_role_api.init_user_profile`, but this function wasn't defined in the database. 

In the original migration file (`20250316131100_multi_persona_profile_system.sql`), a function called `migrate_existing_profiles` was defined but it was intended for bulk migration of existing profiles, not for initializing a single user profile as needed by the application.

## Solution

A new migration (`20250316192200_add_service_role_api_function.sql`) was created to:

1. Create the `service_role_api` schema
2. Implement the missing `init_user_profile` function which:
   - Creates a core profile for a user if one doesn't exist
   - Creates a default persona if none exists
   - Sets up proper onboarding state
   - Returns all the necessary data in the format expected by the application

## Implementation Details

The `init_user_profile` function:

- Is defined in the `service_role_api` schema as expected by the application
- Has the `SECURITY DEFINER` attribute so it runs with the permissions of the creator
- Handles all the database operations needed to properly set up a new user
- Returns data in the proper JSON format expected by the TypeScript code

## How to Apply This Fix

Run the migration script:

```bash
node scripts/run-service-role-api-migration.js
```

This will create the missing function and allow the profile initialization to work correctly.

## Verifying the Fix

After applying this migration:

1. The error messages should no longer appear when a user first logs in
2. New users should be able to complete the onboarding process
3. Persona creation should work correctly in the onboarding flow

## Note for Future Developers

When implementing database functions that are called from application code, ensure that:

1. The schema and function names match exactly what the application code expects
2. The function parameters and return type match the application's expectations
3. The correct permissions are granted to allow the application to call the function
