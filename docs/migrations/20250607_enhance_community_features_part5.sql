-- Migration: 20250607_enhance_community_features_part5.sql
-- Description: Fifth part of the community features enhancement (indexes and constraints)

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communities_tier ON communities(community_tier);
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(group_category);
CREATE INDEX IF NOT EXISTS idx_community_groups_type ON community_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_community_groups_community ON community_groups(community_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_events_type ON community_events(event_type);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_expertise ON expert_profiles USING GIN (primary_expertise_areas);
CREATE INDEX IF NOT EXISTS idx_contribution_scores_user ON contribution_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_interactions_user ON recommendation_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_forge_sessions_presenter ON forge_sessions(presenter_id);
CREATE INDEX IF NOT EXISTS idx_breakthrough_boards_company ON breakthrough_boards(company_id);
CREATE INDEX IF NOT EXISTS idx_peer_endorsements_to_user ON peer_endorsements(to_user_id);

-- Add foreign key constraints
-- Note: Make sure all tables and columns exist before adding these constraints

-- First, check if the columns exist before adding constraints
DO $$
BEGIN
    -- Check if owner_id column exists in communities table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communities' AND column_name = 'owner_id'
    ) THEN
        -- Add constraint only if it doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage
            WHERE table_name = 'communities' AND column_name = 'owner_id'
        ) THEN
            ALTER TABLE communities
            ADD CONSTRAINT fk_communities_owner_id FOREIGN KEY (owner_id) REFERENCES profiles(id);
        END IF;
    END IF;

    -- Check if author_id column exists in community_posts table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'community_posts' AND column_name = 'author_id'
    ) THEN
        -- Add constraint only if it doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage
            WHERE table_name = 'community_posts' AND column_name = 'author_id'
        ) THEN
            ALTER TABLE community_posts
            ADD CONSTRAINT fk_community_posts_author_id FOREIGN KEY (author_id) REFERENCES profiles(id);
        END IF;
    END IF;

    -- Check if author_id column exists in community_comments table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'community_comments' AND column_name = 'author_id'
    ) THEN
        -- Add constraint only if it doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage
            WHERE table_name = 'community_comments' AND column_name = 'author_id'
        ) THEN
            ALTER TABLE community_comments
            ADD CONSTRAINT fk_community_comments_author_id FOREIGN KEY (author_id) REFERENCES profiles(id);
        END IF;
    END IF;

    -- Check if organizer_id column exists in community_events table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'community_events' AND column_name = 'organizer_id'
    ) THEN
        -- Add constraint only if it doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage
            WHERE table_name = 'community_events' AND column_name = 'organizer_id'
        ) THEN
            ALTER TABLE community_events
            ADD CONSTRAINT fk_community_events_organizer_id FOREIGN KEY (organizer_id) REFERENCES profiles(id);
        END IF;
    END IF;

    -- Check if user_id column exists in profiles table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        -- Add constraint only if it doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.constraint_column_usage
            WHERE table_name = 'profiles' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE profiles
            ADD CONSTRAINT fk_profiles_user_id FOREIGN KEY (user_id) REFERENCES users(id);
        END IF;
    END IF;
END $$;

-- End of part 5
