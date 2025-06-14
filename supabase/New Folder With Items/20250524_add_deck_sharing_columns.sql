-- Add sharing columns to pitch_decks table
ALTER TABLE pitch_decks 
ADD COLUMN IF NOT EXISTS share_token VARCHAR(32) UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP WITH TIME ZONE;

-- Create index for share_token lookups
CREATE INDEX IF NOT EXISTS idx_pitch_decks_share_token ON pitch_decks (share_token);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_public ON pitch_decks (is_public);

-- Create deck_views table for analytics
CREATE TABLE IF NOT EXISTS deck_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES pitch_decks(id) ON DELETE CASCADE,
  share_token VARCHAR(32),
  viewer_ip VARCHAR(45),
  viewer_location JSONB,
  session_duration INTEGER,
  sections_viewed INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for deck_views
CREATE INDEX IF NOT EXISTS idx_deck_views_deck_id ON deck_views (deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_views_share_token ON deck_views (share_token);
CREATE INDEX IF NOT EXISTS idx_deck_views_created_at ON deck_views (created_at);

-- Enable RLS for deck_views
ALTER TABLE deck_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for deck_views
CREATE POLICY "Users can view their own deck analytics" ON deck_views
FOR SELECT USING (
  deck_id IN (
    SELECT id FROM pitch_decks WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow anonymous view tracking for public decks" ON deck_views
FOR INSERT WITH CHECK (
  deck_id IN (
    SELECT id FROM pitch_decks WHERE is_public = true AND share_token IS NOT NULL
  )
);

-- Update RLS policies for pitch_decks to allow public access
CREATE POLICY "Allow public access to shared decks" ON pitch_decks
FOR SELECT USING (
  user_id = auth.uid() OR 
  (is_public = true AND share_token IS NOT NULL)
);
