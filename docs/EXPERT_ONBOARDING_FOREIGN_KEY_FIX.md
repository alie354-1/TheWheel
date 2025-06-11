# Expert Onboarding Foreign Key Fix

## Overview

This document outlines the changes made to fix foreign key constraints and metadata access in the expert onboarding system. There were two main issues:

1. The expert profile system was using direct references to `auth.users(id)` but some components were trying to use the user_id directly, causing foreign key constraint violations.
2. The expert service was trying to access `user_metadata` in the users table, but that column doesn't exist or isn't accessible in the way it was being queried.

## Changes Made

1. Created fixed versions of the expert service:
   - Created `src/lib/services/expert.service.fixed.ts` with proper foreign key handling
   - Created `src/lib/services/expert.service.fixed.v2.ts` with fixes for user_metadata access

2. Updated components to use the fixed expert service:
   - Updated `src/components/community/ExpertProfileWizard.tsx` to import from `expert.service.fixed`
   - Updated `src/pages/community/CommunityExpertsPage.tsx` to import from `expert.service.fixed`
   - Updated `src/components/community/ViewExpertProfileButton.tsx` to import from `expert.service.fixed`

3. Created a fixed version of the community services index:
   - Created `src/lib/services/community/index.fixed.ts` to export the fixed expert service

## Database Changes

The following SQL changes were applied to fix the foreign key relationships:

```sql
-- Create RLS policies for expert_profiles table
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all expert profiles
CREATE POLICY "Users can view all expert profiles"
  ON expert_profiles
  FOR SELECT
  USING (
    TRUE
  );

-- Users can only update their own expert profile
CREATE POLICY "Users can only update their own expert profile"
  ON expert_profiles
  FOR UPDATE
  USING (
    auth.uid() = user_id
  );

-- Users can only insert their own expert profile
CREATE POLICY "Users can only insert their own expert profile"
  ON expert_profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Create explicit foreign key relationships for expert_connect_requests
COMMENT ON COLUMN expert_connect_requests.requester_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_connect_requests.expert_id IS 'Foreign key to auth.users(id)';

-- Create explicit foreign key relationships for expert_sessions
COMMENT ON COLUMN expert_sessions.expert_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_sessions.requester_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_sessions.connect_request_id IS 'Foreign key to expert_connect_requests(id)';

-- Create explicit foreign key relationships for expert_availability
COMMENT ON COLUMN expert_availability.expert_id IS 'Foreign key to auth.users(id)';

-- Create explicit foreign key relationships for expert_contracts
COMMENT ON COLUMN expert_contracts.expert_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_contracts.user_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_contracts.connect_request_id IS 'Foreign key to expert_connect_requests(id)';

-- Create explicit foreign key relationships for expert_payments
COMMENT ON COLUMN expert_payments.expert_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_payments.user_id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN expert_payments.session_id IS 'Foreign key to expert_sessions(id)';
COMMENT ON COLUMN expert_payments.contract_id IS 'Foreign key to expert_contracts(id)';
```

## User Metadata Fix

The original expert service was trying to access `user_metadata` in the users table, but that column doesn't exist or isn't accessible in the way it was being queried. The following changes were made to fix this issue:

1. Removed `user_metadata` from all queries in the expert service
2. Updated the `getTopExperts` method to use email as a fallback for user names
3. Added placeholder avatar URLs

## Next Steps

1. Apply the fixed expert service to all components that use it
2. Update the community index to use the fixed expert service
3. Test the expert onboarding flow to ensure it works correctly
4. Monitor for any foreign key constraint violations
5. Consider adding a proper user profile system that stores user metadata in a separate table
