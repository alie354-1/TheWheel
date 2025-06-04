-- Migration to correct RLS policies for deck_comments to allow anonymous commenting via share links.
-- Assumes `smart_share_links`, `reviewer_sessions`, and `deck_comments` tables (with `reviewer_session_id` column)
-- are already created by prior migrations (specifically `...160000_unified_sharing_phase1.sql`).

SET search_path = public;

-- Drop the potentially problematic old insert policy if it exists
DROP POLICY IF EXISTS "Users can insert comments on decks they are assigned to as reviewers or owners" ON deck_comments;

-- RLS Policy for AUTHENTICATED users to insert comments
DROP POLICY IF EXISTS "Authenticated users can insert comments on accessible decks" ON deck_comments;
CREATE POLICY "Authenticated users can insert comments on accessible decks"
ON deck_comments
FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = author_user_id AND 
  EXISTS (
    SELECT 1 FROM pitch_decks pd
    WHERE pd.id = deck_comments.deck_id AND (
      pd.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM deck_review_assignments dra
        WHERE dra.deck_id = deck_comments.deck_id 
          AND dra.user_id = auth.uid() 
          AND dra.role IN ('Editor', 'Reviewer', 'Advisor', 'Investor')
      )
    )
  )
);

-- RLS Policy for ANONYMOUS users to insert comments via valid share links
DROP POLICY IF EXISTS "Anonymous reviewers can insert comments via valid share links" ON deck_comments;
CREATE POLICY "Anonymous reviewers can insert comments via valid share links"
ON deck_comments
FOR INSERT TO anon 
WITH CHECK (
  author_user_id IS NULL AND
  reviewer_session_id IS NOT NULL AND
  EXISTS (
    SELECT 1
    FROM reviewer_sessions rs
    JOIN smart_share_links sl ON rs.share_token = sl.share_token 
    WHERE rs.id = deck_comments.reviewer_session_id
      AND sl.deck_id = deck_comments.deck_id
      AND sl.share_type IN ('feedback', 'expert_review') 
      AND (sl.expires_at IS NULL OR sl.expires_at > NOW())
  )
);

-- Add SELECT RLS policies for anon role on dependent tables for the INSERT check to work.
-- WARNING: These are broad for debugging. Tighten them for production.
DROP POLICY IF EXISTS "Anon can read reviewer_sessions for policy checks" ON reviewer_sessions;
CREATE POLICY "Anon can read reviewer_sessions for policy checks"
ON reviewer_sessions FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anon can read smart_share_links for policy checks" ON smart_share_links;
CREATE POLICY "Anon can read smart_share_links for policy checks"
ON smart_share_links FOR SELECT TO anon USING (true);

-- Also ensure anon can insert into reviewer_sessions (this might be in another migration but good to ensure)
ALTER TABLE reviewer_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert for reviewer sessions" ON reviewer_sessions;
CREATE POLICY "Allow anonymous insert for reviewer sessions" ON reviewer_sessions
    FOR INSERT TO anon WITH CHECK (true);
