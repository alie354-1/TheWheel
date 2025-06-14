-- Comprehensive logging for content intelligence
CREATE TABLE IF NOT EXISTS deck_content_interaction_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    deck_id UUID REFERENCES pitch_decks(id) ON DELETE CASCADE,
    slide_id TEXT,
    element_id TEXT,
    action_type TEXT NOT NULL, -- e.g., 'ElementCreate', 'TextEdit', 'CommentAdd', 'AIProposalAccept'
    details JSONB, -- Action-specific data
    session_id TEXT,
    client_info JSONB, -- Browser, OS, etc.
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deck_content_logs_deck_action ON deck_content_interaction_logs(deck_id, action_type);
CREATE INDEX IF NOT EXISTS idx_deck_content_logs_user_id ON deck_content_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_deck_content_logs_timestamp ON deck_content_interaction_logs(timestamp);

-- Apply the trigger function to update updated_at column
DROP TRIGGER IF EXISTS handle_updated_at ON deck_content_interaction_logs;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON deck_content_interaction_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Table for storing learned patterns and template/component improvement suggestions
CREATE TABLE IF NOT EXISTS deck_learning_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type TEXT NOT NULL, -- 'TemplateSuggestion', 'ComponentFeedbackPattern', 'HighEngagementPattern'
    source_data_query TEXT, -- Query used to derive this insight (for reproducibility)
    description TEXT,
    details JSONB, -- Specifics of the insight
    severity TEXT CHECK (severity IN ('High', 'Medium', 'Low')), -- For feedback patterns
    confidence_score REAL,
    status TEXT CHECK (status IN ('New', 'Reviewed', 'Actioned', 'Dismissed')) DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    tags TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_deck_learning_insights_type ON deck_learning_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_deck_learning_insights_status ON deck_learning_insights(status);

-- Apply the trigger function to update updated_at column
DROP TRIGGER IF EXISTS handle_updated_at ON deck_learning_insights;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON deck_learning_insights
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- RLS Policies for deck_content_interaction_logs
ALTER TABLE deck_content_interaction_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to ensure idempotency
DROP POLICY IF EXISTS "Allow admin full access to content interaction logs" ON deck_content_interaction_logs;
CREATE POLICY "Allow admin full access to content interaction logs"
ON deck_content_interaction_logs
FOR ALL
USING (is_claims_admin())
WITH CHECK (is_claims_admin());

DROP POLICY IF EXISTS "Allow authenticated users to insert their own logs" ON deck_content_interaction_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert interaction logs" ON deck_content_interaction_logs;
-- Allow authenticated users to insert logs.
-- If user_id is provided in the log, it must match the inserter's ID.
-- If user_id is NULL, any authenticated user can insert (e.g., for system events or general load events).
CREATE POLICY "Allow authenticated users to insert interaction logs"
ON deck_content_interaction_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);


-- RLS Policies for deck_learning_insights
ALTER TABLE deck_learning_insights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Allow admin full access to learning insights" ON deck_learning_insights;
CREATE POLICY "Allow admin full access to learning insights"
ON deck_learning_insights
FOR ALL
USING (is_claims_admin())
WITH CHECK (is_claims_admin());

DROP POLICY IF EXISTS "Allow authenticated service roles to read insights" ON deck_learning_insights;
CREATE POLICY "Allow authenticated service roles to read insights"
ON deck_learning_insights
FOR SELECT
TO service_role -- Or a more specific role if created for AI services
USING (true);

COMMENT ON TABLE deck_content_interaction_logs IS 'Logs user interactions with deck content for learning and analytics.';
COMMENT ON COLUMN deck_content_interaction_logs.action_type IS 'Type of action performed, e.g., ElementCreate, TextEdit, CommentAdd, AIProposalAccept.';
COMMENT ON TABLE deck_learning_insights IS 'Stores insights derived from content interaction logs, used for improving templates and suggestions.';
COMMENT ON COLUMN deck_learning_insights.insight_type IS 'Category of the learned insight, e.g., TemplateSuggestion, ComponentFeedbackPattern.';
