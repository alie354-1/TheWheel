# Fixing Infinite Recursion in Policies

## Problem

The application encountered an error while attempting to fetch logs for feature extraction:

```
Error fetching logs for feature extraction: {
  code: '42P17', 
  details: null, 
  hint: null, 
  message: 'infinite recursion detected in policy for relation "company_members"'
}
```

This occurs because of a circular dependency in Row Level Security (RLS) policies:

1. When querying `system_logs` with company context
2. The RLS policy on `system_logs` checks if the user is a member of the company
3. This check queries the `company_members` table
4. The RLS policy on `company_members` recursively checks company membership again
5. This results in infinite recursion

## Solution

The solution involves two key components:

### 1. Database Migration

We created a migration file (`supabase/migrations/20250320064200_fix_system_logs_recursion.sql`) that:

- Creates a secure function `fetch_system_logs_securely` that bypasses RLS policies using SECURITY DEFINER
- Updates the RLS policies on system_logs to use the non-recursive `check_company_membership` function
- Drops problematic policies that might cause recursion

### 2. Code Changes

We modified the model-training service to use the secure function instead of directly querying the system_logs table:

```typescript
// Before:
let query = supabase
  .from('system_logs')
  .select('*')
  // ... more query filters ...
const { data: logs, error } = await query;

// After:
const { data: logs, error } = await supabase.rpc(
  'fetch_system_logs_securely',
  { 
    p_user_id: userId || (await supabase.auth.getUser()).data.user?.id,
    p_event_types: eventTypes,
    p_limit: limit
  }
);
```

This approach bypasses the problematic RLS policies and prevents the infinite recursion error.

## Best Practices

When designing Row Level Security policies:

1. **Avoid Circular References**: Ensure that RLS policies don't create circular dependencies
2. **Use Helper Functions**: Create SECURITY DEFINER functions for complex permission checks
3. **Isolate Queries**: Use dedicated functions for operations that may involve multiple tables with RLS
4. **Test with Complexity**: Test RLS policies with complex scenarios involving related tables

## Applying the Fix

To apply this fix to the production database:

1. Run the migration script: `node scripts/run-fix-system-logs-recursion.js`
2. Deploy the updated code with the modified model-training service

The changes should resolve the infinite recursion error while maintaining proper security controls.
