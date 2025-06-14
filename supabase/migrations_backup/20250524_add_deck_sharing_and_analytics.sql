-- Add sharing and analytics columns to pitch_decks table
ALTER TABLE pitch_decks 
ADD COLUMN IF NOT EXISTS share_token VARCHAR(32),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP;

-- Create index on share_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_pitch_decks_share_token ON pitch_decks(share_token) WHERE share_token IS NOT NULL;

-- Create deck_views table for analytics
CREATE TABLE IF NOT EXISTS deck_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID REFERENCES pitch_decks(id) ON DELETE CASCADE,
    share_token VARCHAR(32),
    viewer_ip VARCHAR(45),
    viewer_location JSONB,
    session_duration INTEGER,
    sections_viewed INTEGER[],
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_deck_views_deck_id ON deck_views(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_views_created_at ON deck_views(created_at);
CREATE INDEX IF NOT EXISTS idx_deck_views_share_token ON deck_views(share_token);

-- Create function to generate secure share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS VARCHAR(32) AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create function to get deck by share token
CREATE OR REPLACE FUNCTION get_deck_by_share_token(token VARCHAR(32))
RETURNS TABLE (
    id UUID,
    title TEXT,
    sections JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    user_id UUID,
    is_public BOOLEAN,
    view_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.sections,
        p.created_at,
        p.updated_at,
        p.user_id,
        p.is_public,
        p.view_count
    FROM pitch_decks p
    WHERE p.share_token = token AND p.is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track deck view
CREATE OR REPLACE FUNCTION track_deck_view(
    p_deck_id UUID,
    p_share_token VARCHAR(32),
    p_viewer_ip VARCHAR(45) DEFAULT NULL,
    p_viewer_location JSONB DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    view_id UUID;
BEGIN
    -- Insert view record
    INSERT INTO deck_views (
        deck_id,
        share_token,
        viewer_ip,
        viewer_location,
        referrer,
        user_agent
    ) VALUES (
        p_deck_id,
        p_share_token,
        p_viewer_ip,
        p_viewer_location,
        p_referrer,
        p_user_agent
    )
    RETURNING id INTO view_id;
    
    -- Update deck view count and last viewed timestamp
    UPDATE pitch_decks 
    SET 
        view_count = COALESCE(view_count, 0) + 1,
        last_viewed_at = NOW()
    WHERE id = p_deck_id;
    
    RETURN view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get deck analytics
CREATE OR REPLACE FUNCTION get_deck_analytics(p_deck_id UUID)
RETURNS TABLE (
    total_views BIGINT,
    unique_viewers BIGINT,
    avg_session_duration NUMERIC,
    total_sections INTEGER,
    view_history JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH analytics AS (
        SELECT 
            COUNT(*) as total_views,
            COUNT(DISTINCT viewer_ip) as unique_viewers,
            AVG(session_duration) as avg_session_duration,
            MAX(array_length(sections_viewed, 1)) as total_sections
        FROM deck_views 
        WHERE deck_id = p_deck_id
    ),
    view_history AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'date', DATE(created_at),
                'views', view_count
            ) ORDER BY DATE(created_at)
        ) as history
        FROM (
            SELECT 
                DATE(created_at) as created_at,
                COUNT(*) as view_count
            FROM deck_views 
            WHERE deck_id = p_deck_id
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) DESC
            LIMIT 30
        ) daily_views
    )
    SELECT 
        a.total_views,
        a.unique_viewers,
        a.avg_session_duration,
        COALESCE(a.total_sections, 0),
        COALESCE(vh.history, '[]'::jsonb)
    FROM analytics a
    CROSS JOIN view_history vh;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on deck_views table
ALTER TABLE deck_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for deck_views
CREATE POLICY "Users can view their own deck analytics" ON deck_views
    FOR SELECT USING (
        deck_id IN (
            SELECT id FROM pitch_decks WHERE user_id = auth.uid()
        )
    );

-- Allow anonymous viewing for public deck analytics (needed for public viewing)
CREATE POLICY "Allow tracking views on public decks" ON deck_views
    FOR INSERT WITH CHECK (true);

-- Update RLS policies for pitch_decks to support public sharing
CREATE POLICY "Allow public access to shared decks" ON pitch_decks
    FOR SELECT USING (is_public = true AND share_token IS NOT NULL);
