# Expert System Foreign Key Fix

## Overview

This document outlines the changes made to fix foreign key relationship issues in the expert onboarding and connection system. The issue was related to how Supabase handles foreign key relationships in PostgREST queries.

## Problem

When using the Supabase client to query tables with foreign key relationships, we encountered the following error:

```
Error fetching user connection requests as requester: 
{code: 'PGRST200', details: "Searched for a foreign key relationship between 'expert_connect_requests' and 'expert_id' in the schema 'public', but no matches were found.", hint: "Perhaps you meant 'expert_sessions' instead of 'expert_id'.", message: "Could not find a relationship between 'expert_connect_requests' and 'expert_id' in the schema cache"}
```

This error occurred because we were trying to use the following query pattern in our services:

```javascript
.select(`
  *,
  expert:expert_id(id, first_name, last_name, email, avatar_url)
`)
```

This syntax assumes that there's a foreign key relationship defined in the database between the `expert_connect_requests.expert_id` column and a table called "expert". However, the `expert_id` column is actually referencing `auth.users`, not a table called "expert".

## Solution

We implemented two fixes to address this issue:

### 1. Service Layer Fix

We modified the following service files to remove the foreign key relationship queries:

- `connect.service.ts`
- `contract.service.ts`
- `session.service.ts`

Instead of using the foreign key relationship syntax, we now:

1. Query the base tables without joins
2. Add placeholder data for user information
3. In a production environment, we would implement a separate query to fetch user details based on the IDs

### 2. Database Schema Fix

We created a migration file (`20250607_fix_expert_foreign_keys.sql`) that:

1. Adds explicit comments on foreign key columns to document the relationships
2. Adds RLS policies for the expert_profiles table to ensure proper access control

## Implementation

The fix was implemented in the following files:

1. Service files:
   - `src/lib/services/connect.service.ts`
   - `src/lib/services/contract.service.ts`
   - `src/lib/services/session.service.ts`

2. Database migration:
   - `supabase/migrations/20250607_fix_expert_foreign_keys.sql`
   - `supabase/apply_expert_foreign_key_fix.sh` (script to apply the migration)

## Future Improvements

For a more robust solution, we should:

1. Implement proper user data fetching after the initial queries
2. Consider using Supabase Functions to create custom endpoints that handle the joins in the backend
3. Add proper error handling and fallbacks for when user data cannot be fetched

## Related Documentation

- [Supabase Foreign Keys Documentation](https://supabase.com/docs/guides/database/tables#foreign-keys-and-relationships)
- [PostgREST Schema Cache](https://postgrest.org/en/stable/schema_cache.html)
