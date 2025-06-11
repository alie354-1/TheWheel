-- Migration: Create schema for AI-Powered Collaborative Deck Feedback System

-- Ensure the moddatetime extension is available or create the function
CREATE OR REPLACE FUNCTION moddatetime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Create deck_comments table
CREATE TABLE deck_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
    slide_id TEXT NOT NULL, -- Corresponds to DeckSection.id from your types
    element_id TEXT,        -- Corresponds to VisualComponent.id if comment is on an element
    parent_comment_id UUID REFERENCES deck_comments(id) ON DELETE CASCADE, -- For threading
    author_user_id UUID REFERENCES auth.users(id), -- Can be null if guest comments are allowed initially
    author_display_name TEXT, -- Store display name at time of comment
    coordinates_x REAL, -- If comment is placed on a specific point on the slide
    coordinates_y REAL,
    text_content TEXT,
    rich_text_content JSONB, -- For structured/formatted text (e.g., TipTap JSON)
    voice_note_url TEXT,     -- URL to stored voice note
    voice_transcription TEXT, -- Transcription of the voice note
    markup_data JSONB,       -- SVG path data or similar for drawings/highlights
    comment_type TEXT CHECK (comment_type IN ('General', 'Suggestion', 'Question', 'Praise', 'Concern')) DEFAULT 'General',
    urgency TEXT CHECK (urgency IN ('Critical', 'Important', 'Suggestion', 'None')) DEFAULT 'None',
    status TEXT CHECK (status IN ('Open', 'Resolved', 'InProgress', 'Archived')) DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_deck_comments_deck_id ON deck_comments(deck_id);
CREATE INDEX idx_deck_comments_slide_id ON deck_comments(slide_id);
CREATE INDEX idx_deck_comments_author_user_id ON deck_comments(author_user_id);
CREATE INDEX idx_deck_comments_parent_comment_id ON deck_comments(parent_comment_id);

-- Enable RLS
ALTER TABLE deck_comments ENABLE ROW LEVEL SECURITY;

-- Trigger to update 'updated_at' timestamp for deck_comments
CREATE TRIGGER handle_deck_comments_updated_at
BEFORE UPDATE ON deck_comments
FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);


-- 2. Create deck_review_assignments table (Moved up)
CREATE TABLE deck_review_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- Nullable for invite-by-email guests not yet signed up
    invited_email TEXT, -- Store email if user_id is not yet known
    display_name TEXT, -- Name of the reviewer (could be from profile or entered by owner)
    role TEXT NOT NULL CHECK (role IN ('Owner', 'Editor', 'Reviewer', 'Advisor', 'Investor', 'Viewer')),
    feedback_weight REAL DEFAULT 1.0 CHECK (feedback_weight >= 0 AND feedback_weight <= 5.0), -- Example range
    expertise_tags TEXT[],
    access_token TEXT UNIQUE, -- For guest access via link if not a registered user
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_deck_user UNIQUE(deck_id, user_id),
    CONSTRAINT unique_deck_invited_email UNIQUE(deck_id, invited_email)
);
CREATE INDEX idx_deck_review_assignments_deck_id ON deck_review_assignments(deck_id);
CREATE INDEX idx_deck_review_assignments_user_id ON deck_review_assignments(user_id);
CREATE INDEX idx_deck_review_assignments_invited_email ON deck_review_assignments(invited_email);
CREATE INDEX idx_deck_review_assignments_access_token ON deck_review_assignments(access_token);

-- Enable RLS for deck_review_assignments
ALTER TABLE deck_review_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for deck_review_assignments
CREATE POLICY "Deck owners can manage assignments for their decks"
ON deck_review_assignments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM pitch_decks pd
    WHERE pd.id = deck_review_assignments.deck_id AND pd.owner_id = auth.uid()
  )
);

CREATE POLICY "Assigned users can view their own assignment"
ON deck_review_assignments FOR SELECT USING (
  user_id = auth.uid() OR invited_email = auth.jwt()->>'email' -- Check against token email if user_id is null
);

-- Trigger to update 'updated_at' timestamp for deck_review_assignments
CREATE TRIGGER handle_deck_review_assignments_updated_at
BEFORE UPDATE ON deck_review_assignments
FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);


-- 3. Policies for deck_comments (Now that deck_review_assignments exists)
CREATE POLICY "Users can view comments on decks they have access to"
ON deck_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM pitch_decks pd
    WHERE pd.id = deck_comments.deck_id AND (
      pd.owner_id = auth.uid() OR -- Owner
      pd.is_public = true OR -- Public deck
      EXISTS ( -- Shared with user
        SELECT 1 FROM deck_review_assignments dra
        WHERE dra.deck_id = deck_comments.deck_id AND dra.user_id = auth.uid()
      ) OR
      EXISTS ( -- Shared via public link (if using tokens stored in assignments)
        SELECT 1 FROM deck_review_assignments dra
        WHERE dra.deck_id = deck_comments.deck_id AND dra.access_token IS NOT NULL -- Simplified, real token check would be more complex
      )
    )
  )
);

CREATE POLICY "Users can insert comments on decks they are assigned to as reviewers or owners"
ON deck_comments FOR INSERT WITH CHECK (
  auth.uid() = deck_comments.author_user_id AND
  EXISTS (
    SELECT 1 FROM pitch_decks pd
    WHERE pd.id = deck_comments.deck_id AND (
      pd.owner_id = auth.uid() OR -- Owner
      EXISTS (
        SELECT 1 FROM deck_review_assignments dra
        WHERE dra.deck_id = deck_comments.deck_id AND dra.user_id = auth.uid() AND dra.role IN ('Reviewer', 'Advisor', 'Investor', 'Editor')
      )
    )
  )
);

CREATE POLICY "Users can update their own comments"
ON deck_comments FOR UPDATE USING (
  auth.uid() = author_user_id
) WITH CHECK (
  auth.uid() = author_user_id
);

CREATE POLICY "Deck owners can update status of comments on their decks"
ON deck_comments FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM pitch_decks pd
    WHERE pd.id = deck_comments.deck_id AND pd.owner_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM pitch_decks pd
    WHERE pd.id = deck_comments.deck_id AND pd.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own comments"
ON deck_comments FOR DELETE USING (
  auth.uid() = author_user_id
);


-- 4. Create deck_comment_reactions table
CREATE TABLE deck_comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES deck_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    reaction_type TEXT NOT NULL, -- e.g., '👍', '❤️', '💡'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id, reaction_type) -- User can only have one of each reaction type per comment
);
CREATE INDEX idx_deck_comment_reactions_comment_id ON deck_comment_reactions(comment_id);
CREATE INDEX idx_deck_comment_reactions_user_id ON deck_comment_reactions(user_id);

-- Enable RLS for deck_comment_reactions
ALTER TABLE deck_comment_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for deck_comment_reactions
CREATE POLICY "Users can view reactions on comments they can view"
ON deck_comment_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM deck_comments dc
    WHERE dc.id = deck_comment_reactions.comment_id
    -- relies on RLS of deck_comments
  )
);

CREATE POLICY "Users can insert their own reactions"
ON deck_comment_reactions FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM deck_comments dc
    WHERE dc.id = deck_comment_reactions.comment_id
     -- relies on RLS of deck_comments, ensuring user can see the comment they react to
  )
);

CREATE POLICY "Users can delete their own reactions"
ON deck_comment_reactions FOR DELETE USING (
  auth.uid() = user_id
);


-- 5. Modify pitch_decks table
ALTER TABLE pitch_decks
ADD COLUMN IF NOT EXISTS last_feedback_activity_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS feedback_summary JSONB; -- For AI-generated high-level summary

-- (Optional) Function to update last_feedback_activity_at on pitch_decks when a new comment is made
CREATE OR REPLACE FUNCTION update_deck_feedback_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pitch_decks
  SET last_feedback_activity_at = NOW()
  WHERE id = NEW.deck_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_comment_update_deck_activity
AFTER INSERT ON deck_comments
FOR EACH ROW
EXECUTE FUNCTION update_deck_feedback_activity();

COMMENT ON COLUMN deck_comments.slide_id IS 'Corresponds to DeckSection.id from application types';
COMMENT ON COLUMN deck_comments.element_id IS 'Corresponds to VisualComponent.id if comment is on a specific element within a slide';

END;
