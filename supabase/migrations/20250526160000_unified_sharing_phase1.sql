-- Migration for Unified Smart Sharing System - Phase 1

-- Main table for shareable links
CREATE TABLE IF NOT EXISTS smart_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    share_type TEXT NOT NULL CHECK (share_type IN ('view', 'feedback', 'expert_review')) DEFAULT 'feedback',
    target_roles TEXT[] DEFAULT '{}',
    focus_areas TEXT[] DEFAULT '{}',
    ai_analysis_enabled BOOLEAN NOT NULL DEFAULT true,
    custom_weights JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Allow created_by to be null if user is deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for smart_share_links
CREATE INDEX IF NOT EXISTS idx_smart_share_links_deck_id ON smart_share_links(deck_id);
CREATE INDEX IF NOT EXISTS idx_smart_share_links_share_token ON smart_share_links(share_token);
CREATE INDEX IF NOT EXISTS idx_smart_share_links_created_by ON smart_share_links(created_by);


-- Tracks individual review sessions, anonymous or identified
CREATE TABLE IF NOT EXISTS reviewer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_token TEXT NOT NULL REFERENCES smart_share_links(share_token) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL, -- Browser fingerprint or similar unique session identifier
    declared_role TEXT,
    reviewer_name TEXT,
    reviewer_email TEXT,
    expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'expert', 'n/a')),
    ip_address INET,
    user_agent TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Allow user_id to be null if user is deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Standardized name
);

-- Add indexes for reviewer_sessions
CREATE INDEX IF NOT EXISTS idx_reviewer_sessions_share_token ON reviewer_sessions(share_token);
CREATE INDEX IF NOT EXISTS idx_reviewer_sessions_session_id ON reviewer_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_sessions_user_id ON reviewer_sessions(user_id);


-- Enhancements to the existing deck_comments table
-- Ensure deck_comments table exists before altering (though it should from previous migrations)
-- ALTER TABLE deck_comments RENAME COLUMN IF EXISTS session_id TO old_session_id; -- If a conflicting session_id existed

ALTER TABLE deck_comments
    ADD COLUMN IF NOT EXISTS reviewer_session_id UUID REFERENCES reviewer_sessions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS declared_role TEXT,
    ADD COLUMN IF NOT EXISTS feedback_weight DECIMAL(3,2) DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS ai_sentiment_score DECIMAL(3,2),
    ADD COLUMN IF NOT EXISTS ai_expertise_score DECIMAL(3,2),
    ADD COLUMN IF NOT EXISTS ai_improvement_category TEXT,
    ADD COLUMN IF NOT EXISTS focus_area TEXT;

-- Add indexes for new columns in deck_comments
CREATE INDEX IF NOT EXISTS idx_deck_comments_reviewer_session_id ON deck_comments(reviewer_session_id);


-- Stores results of AI analysis on feedback (Moved to Phase 2 in plan, but good to have schema ready)
-- For Phase 1, we might not populate this, but schema is useful.
CREATE TABLE IF NOT EXISTS ai_feedback_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
    share_token TEXT REFERENCES smart_share_links(share_token) ON DELETE SET NULL, -- Allow null if link is deleted
    analysis_type TEXT NOT NULL,
    insights JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for ai_feedback_insights
CREATE INDEX IF NOT EXISTS idx_ai_feedback_insights_deck_id ON ai_feedback_insights(deck_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_insights_share_token ON ai_feedback_insights(share_token);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_insights_analysis_type ON ai_feedback_insights(analysis_type);

-- Function to set updated_at timestamp (if not already existing from other migrations)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to smart_share_links if it has an updated_at column (add one if needed)
ALTER TABLE smart_share_links ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
DROP TRIGGER IF EXISTS set_smart_share_links_updated_at ON smart_share_links;
CREATE TRIGGER set_smart_share_links_updated_at
BEFORE UPDATE ON smart_share_links
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Apply the trigger to reviewer_sessions (updated_at column is now part of its definition in this migration if table is new)
-- Ensure updated_at column exists if table was already there from an even earlier migration
ALTER TABLE reviewer_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
DROP TRIGGER IF EXISTS set_reviewer_sessions_updated_at ON reviewer_sessions;
CREATE TRIGGER set_reviewer_sessions_updated_at
BEFORE UPDATE ON reviewer_sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Apply the trigger to deck_comments if it has an updated_at column
-- Assuming deck_comments already has an updated_at column and potentially this trigger
-- If not, uncomment below:
-- ALTER TABLE deck_comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- DROP TRIGGER IF EXISTS set_deck_comments_updated_at ON deck_comments;
-- CREATE TRIGGER set_deck_comments_updated_at
-- BEFORE UPDATE ON deck_comments
-- FOR EACH ROW
-- EXECUTE FUNCTION set_updated_at();

-- Apply the trigger to ai_feedback_insights if it has an updated_at column (add one if needed)
ALTER TABLE ai_feedback_insights ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
DROP TRIGGER IF EXISTS set_ai_feedback_insights_updated_at ON ai_feedback_insights;
CREATE TRIGGER set_ai_feedback_insights_updated_at
BEFORE UPDATE ON ai_feedback_insights
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMENT ON COLUMN smart_share_links.share_type IS 'Type of sharing: view, feedback, or expert_review for guided feedback.';
COMMENT ON COLUMN smart_share_links.target_roles IS 'Predefined roles this link is intended for, e.g., {"designer", "investor"}.';
COMMENT ON COLUMN smart_share_links.focus_areas IS 'Specific areas owner wants feedback on, e.g., {"content", "visual_design"}.';
COMMENT ON COLUMN smart_share_links.custom_weights IS 'Owner-defined weights for roles, e.g., {"designer": 1.5, "investor": 2.0}.';

COMMENT ON COLUMN reviewer_sessions.session_id IS 'Unique ID for the browser session, to group anonymous comments if no user_id.';
COMMENT ON COLUMN reviewer_sessions.declared_role IS 'Role self-declared by the reviewer, if they choose to provide it.';
COMMENT ON COLUMN reviewer_sessions.expertise_level IS 'Self-declared expertise level: beginner, intermediate, expert, or n/a.';

COMMENT ON COLUMN deck_comments.reviewer_session_id IS 'Links comment to a specific review session (anonymous or logged-in).';
COMMENT ON COLUMN deck_comments.declared_role IS 'Role declared by reviewer at the time of this specific comment.';
COMMENT ON COLUMN deck_comments.feedback_weight IS 'Final calculated weight for this comment, considering owner settings and AI analysis.';
COMMENT ON COLUMN deck_comments.ai_sentiment_score IS 'AI-analyzed sentiment of the comment (e.g., -1.0 to 1.0).';
COMMENT ON COLUMN deck_comments.ai_expertise_score IS 'AI-analyzed expertise level based on comment content (e.g., 0.0 to 1.0).';
COMMENT ON COLUMN deck_comments.ai_improvement_category IS 'Broad category AI assigns to the feedback (e.g., Clarity, Design, Market Fit).';
COMMENT ON COLUMN deck_comments.focus_area IS 'If the comment pertains to a specific focus area defined in the share link.';

COMMENT ON TABLE ai_feedback_insights IS 'Stores aggregated or specific AI-generated insights about feedback for a deck or share link.';
COMMENT ON COLUMN ai_feedback_insights.analysis_type IS 'Type of AI analysis, e.g., overall_sentiment, key_themes, improvement_suggestions.';
COMMENT ON COLUMN ai_feedback_insights.insights IS 'JSONB data containing the detailed AI analysis results.';

END;
