# Community Module Foreign Key Fix

## Problem Summary

The community module was failing with the error:

```
Could not find a relationship between 'discussion_threads' and 'author_id' in the schema cache
```

This occurred because the community module tables had foreign key references to `auth.users(id)`, but the application code was trying to join with `public.users` to access profile data like `full_name` and `avatar_url`.

## Technical Details

### Database Architecture

In the application's database architecture:

1. **auth.users**: Contains authentication data (managed by Supabase Auth)
2. **public.users**: Contains user profile data (full_name, avatar_url, etc.)

The community module tables need to reference `public.users` to access profile information, but they were incorrectly referencing `auth.users`.

### Code Issue

In the discussion service, queries like this were failing:

```javascript
let query = supabase
  .from('discussion_threads')
  .select(`
    *,
    author:author_id (
      id,
      full_name,
      avatar_url
    )
  `);
```

This query attempts to join the `discussion_threads` table with the `users` table using the `author_id` foreign key. However, since the foreign key was pointing to `auth.users` instead of `public.users`, PostgreSQL couldn't find the relationship.

### Solution Implemented

We created a migration file (`20250607_fix_community_foreign_keys.sql`) that:

1. Drops all foreign key constraints that reference `auth.users(id)`
2. Recreates them to reference `public.users(id)` instead
3. Ensures RLS policies are properly re-enabled

This fix allows the application to correctly join community tables with the `public.users` table to access profile information.

## Tables Affected

The following tables had their foreign key constraints updated:

- `community_groups` (created_by)
- `group_memberships` (user_id)
- `discussion_threads` (author_id, resolved_by)
- `thread_replies` (author_id)
- `content_reactions` (user_id)
- `expert_responses` (expert_id, verified_by)
- `community_events` (organizer_id)
- `event_registrations` (user_id)
- `expert_profiles` (user_id)
- `expert_endorsements` (expert_id, endorser_id)
- `achievements` (user_id)
- `contribution_scores` (user_id)
- `recommendation_interactions` (user_id)

## Lessons Learned

When designing database schemas with Supabase:

1. Be clear about the distinction between `auth.users` and `public.users`
2. Foreign keys for profile data should reference `public.users(id)`
3. RLS policies should use `auth.uid()` for authentication checks
4. Test joins thoroughly before deploying to production

## Future Considerations

For future schema changes:

1. Always verify foreign key relationships match the expected join patterns in the code
2. Consider using database views to simplify complex joins
3. Document the relationship between `auth.users` and `public.users` clearly for new developers
