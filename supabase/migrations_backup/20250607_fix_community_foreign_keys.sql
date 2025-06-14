-- Community Module Foreign Key Fix Migration
-- This file fixes foreign key references to point to public.users instead of auth.users
-- Date: 2025-06-07

-- Start transaction
BEGIN;

-- =============================================
-- Step 1: Drop existing foreign key constraints
-- =============================================

-- Temporarily disable RLS to allow the migration to run
ALTER TABLE community_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE thread_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE expert_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE expert_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE expert_endorsements DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_interactions DISABLE ROW LEVEL SECURITY;

-- Drop foreign key constraints from community_groups
ALTER TABLE community_groups DROP CONSTRAINT IF EXISTS community_groups_created_by_fkey;

-- Drop foreign key constraints from group_memberships
ALTER TABLE group_memberships DROP CONSTRAINT IF EXISTS group_memberships_user_id_fkey;

-- Drop foreign key constraints from discussion_threads
ALTER TABLE discussion_threads DROP CONSTRAINT IF EXISTS discussion_threads_author_id_fkey;
ALTER TABLE discussion_threads DROP CONSTRAINT IF EXISTS discussion_threads_resolved_by_fkey;

-- Drop foreign key constraints from thread_replies
ALTER TABLE thread_replies DROP CONSTRAINT IF EXISTS thread_replies_author_id_fkey;

-- Drop foreign key constraints from content_reactions
ALTER TABLE content_reactions DROP CONSTRAINT IF EXISTS content_reactions_user_id_fkey;

-- Drop foreign key constraints from expert_responses
ALTER TABLE expert_responses DROP CONSTRAINT IF EXISTS expert_responses_expert_id_fkey;
ALTER TABLE expert_responses DROP CONSTRAINT IF EXISTS expert_responses_verified_by_fkey;

-- Drop foreign key constraints from community_events
ALTER TABLE community_events DROP CONSTRAINT IF EXISTS community_events_organizer_id_fkey;

-- Drop foreign key constraints from event_registrations
ALTER TABLE event_registrations DROP CONSTRAINT IF EXISTS event_registrations_user_id_fkey;

-- Drop foreign key constraints from expert_profiles
ALTER TABLE expert_profiles DROP CONSTRAINT IF EXISTS expert_profiles_user_id_fkey;

-- Drop foreign key constraints from expert_endorsements
ALTER TABLE expert_endorsements DROP CONSTRAINT IF EXISTS expert_endorsements_expert_id_fkey;
ALTER TABLE expert_endorsements DROP CONSTRAINT IF EXISTS expert_endorsements_endorser_id_fkey;

-- Drop foreign key constraints from achievements
ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_user_id_fkey;

-- Drop foreign key constraints from contribution_scores
ALTER TABLE contribution_scores DROP CONSTRAINT IF EXISTS contribution_scores_user_id_fkey;

-- Drop foreign key constraints from recommendation_interactions
ALTER TABLE recommendation_interactions DROP CONSTRAINT IF EXISTS recommendation_interactions_user_id_fkey;

-- =============================================
-- Step 2: Recreate foreign key constraints to reference public.users
-- =============================================

-- Add foreign key constraints to community_groups
ALTER TABLE community_groups 
  ADD CONSTRAINT community_groups_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.users(id);

-- Add foreign key constraints to group_memberships
ALTER TABLE group_memberships 
  ADD CONSTRAINT group_memberships_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraints to discussion_threads
ALTER TABLE discussion_threads 
  ADD CONSTRAINT discussion_threads_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.users(id);

ALTER TABLE discussion_threads 
  ADD CONSTRAINT discussion_threads_resolved_by_fkey 
  FOREIGN KEY (resolved_by) REFERENCES public.users(id);

-- Add foreign key constraints to thread_replies
ALTER TABLE thread_replies 
  ADD CONSTRAINT thread_replies_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES public.users(id);

-- Add foreign key constraints to content_reactions
ALTER TABLE content_reactions 
  ADD CONSTRAINT content_reactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Add foreign key constraints to expert_responses
ALTER TABLE expert_responses 
  ADD CONSTRAINT expert_responses_expert_id_fkey 
  FOREIGN KEY (expert_id) REFERENCES public.users(id);

ALTER TABLE expert_responses 
  ADD CONSTRAINT expert_responses_verified_by_fkey 
  FOREIGN KEY (verified_by) REFERENCES public.users(id);

-- Add foreign key constraints to community_events
ALTER TABLE community_events 
  ADD CONSTRAINT community_events_organizer_id_fkey 
  FOREIGN KEY (organizer_id) REFERENCES public.users(id);

-- Add foreign key constraints to event_registrations
ALTER TABLE event_registrations 
  ADD CONSTRAINT event_registrations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Add foreign key constraints to expert_profiles
ALTER TABLE expert_profiles 
  ADD CONSTRAINT expert_profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Add foreign key constraints to expert_endorsements
ALTER TABLE expert_endorsements 
  ADD CONSTRAINT expert_endorsements_expert_id_fkey 
  FOREIGN KEY (expert_id) REFERENCES public.users(id);

ALTER TABLE expert_endorsements 
  ADD CONSTRAINT expert_endorsements_endorser_id_fkey 
  FOREIGN KEY (endorser_id) REFERENCES public.users(id);

-- Add foreign key constraints to achievements
ALTER TABLE achievements 
  ADD CONSTRAINT achievements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Add foreign key constraints to contribution_scores
ALTER TABLE contribution_scores 
  ADD CONSTRAINT contribution_scores_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Add foreign key constraints to recommendation_interactions
ALTER TABLE recommendation_interactions 
  ADD CONSTRAINT recommendation_interactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id);

-- =============================================
-- Step 3: Re-enable RLS
-- =============================================

ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_interactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Step 4: Update any RLS policies that reference auth.users
-- =============================================

-- No RLS policies need to be updated as they reference auth.uid() which is correct
-- The issue was only with the foreign key constraints

-- Commit the transaction
COMMIT;
