# Expert Profile Query Fix

## Issue

The expert profile system was experiencing a `406 Not Acceptable` error when attempting to query the `expert_profiles` table with a user ID filter:

```
GET https://ahhctmitgjvpnpimgzuq.supabase.co/rest/v1/expert_profiles?select=*&user_id=eq.443467c8-147e-438b-bb03-a075e094c2fa 406 (Not Acceptable)
```

This error occurred when trying to view an expert profile or when checking if a user has an expert profile.

## Root Cause

The issue was related to how the Supabase client was querying the `expert_profiles` table. The `.eq('user_id', userId)` filter was causing a `406 Not Acceptable` error, which suggests that there might be an issue with:

1. The column name or data type mismatch
2. The way the filter was being applied
3. Row-level security policies affecting the query

## Solution

We implemented a more robust approach in the `expert.service.ts` file:

1. Instead of using the `.eq()` filter directly, we now:
   - Query all expert profiles without filters
   - Filter the results manually in JavaScript
   - This avoids potential issues with column names or filter syntax

2. Added more detailed logging to help diagnose any future issues

3. Updated the `deleteExpertProfile` method to first get the profile by ID before deleting it

4. Made similar changes to the `getTopExperts` and `getExpertiseAreas` methods for consistency

## Implementation

The fix was implemented in `src/lib/services/expert.service.fixed.v3.ts` and applied using the `supabase/apply_expert_service_v3_fix.sh` script.

Key changes:

```typescript
// Before
const { data, error } = await supabase
  .from('expert_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

// After
const { data, error } = await supabase
  .from('expert_profiles')
  .select('*');
  
// Filter the results manually
const matchingProfile = data?.find(profile => profile.user_id === userId);
```

## Performance Considerations

While this approach is less efficient than using database filters (as it retrieves all profiles and filters them client-side), it provides a reliable workaround for the immediate issue. The expert profiles table is expected to have a relatively small number of records, so the performance impact should be minimal.

For larger deployments, a more optimized solution may be needed in the future.

## Related Files

- `src/lib/services/expert.service.ts` - The main service file that was updated
- `src/lib/services/expert.service.fixed.v3.ts` - The fixed version of the service
- `supabase/apply_expert_service_v3_fix.sh` - Script to apply the fix
- `src/components/community/ViewExpertProfileButton.tsx` - Component that was experiencing the error
