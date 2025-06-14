# Community Module Foreign Key Fix

## Issue

The community module was encountering the following error:

```
GET https://ahhctmitgjvpnpimgzuq.supabase.co/rest/v1/discussion_threads?select=...
400 (Bad Request)

Error fetching discussion threads: 
{code: 'PGRST200', details: "Searched for a foreign key relationship between 'discussion_threads' and 'author_id' in the schema 'public', but no matches were found.", hint: null, message: "Could not find a relationship between 'discussion_threads' and 'author_id' in the schema cache"}
```

## Root Cause

The community module schema was created with foreign key references to `auth.users(id)`, but the application code expects to join with `public.users` to access profile data like `full_name` and `avatar_url`.

In the application architecture:
- `auth.users` contains authentication data
- `public.users` contains profile data (full_name, avatar_url, etc.)

The foreign key references need to point to `public.users(id)` instead of `auth.users(id)` for the joins to work correctly.

## Solution

The migration file `20250607_fix_community_foreign_keys.sql` fixes this issue by:

1. Dropping all foreign key constraints that reference `auth.users(id)`
2. Recreating them to reference `public.users(id)` instead
3. Ensuring RLS policies are properly re-enabled

## How to Apply

Run the migration against your Supabase database:

```bash
# Using Supabase CLI
supabase db push --db-url=<your-db-url> supabase/migrations/20250607_fix_community_foreign_keys.sql

# Or using psql
psql -h <host> -U <user> -d <database> -f supabase/migrations/20250607_fix_community_foreign_keys.sql
```

## Verification

After applying the migration, the community features should work correctly. The application will be able to join between community tables and the `public.users` table to access profile information.
