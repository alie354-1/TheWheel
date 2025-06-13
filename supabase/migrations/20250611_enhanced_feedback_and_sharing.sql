-- Migration: Enhanced Feedback and Sharing System (2025-06-11)

-- 1. Ensure author_user_id is UUID in deck_comments (fixes uuid=bigint error)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'deck_comments'
      AND column_name = 'author_user_id'
      AND data_type IN ('bigint', 'integer')
  ) THEN
    -- Set all author_user_id values to NULL if the column is BIGINT/integer (aggressive fix)
    UPDATE public.deck_comments
    SET author_user_id = NULL;
    ALTER TABLE public.deck_comments
      ALTER COLUMN author_user_id DROP DEFAULT,
      ALTER COLUMN author_user_id TYPE UUID USING author_user_id::text::uuid;
  END IF;
END $$;

-- 1b. Add new columns to deck_comments
ALTER TABLE public.deck_comments
ADD COLUMN IF NOT EXISTS voice_transcription TEXT,
ADD COLUMN IF NOT EXISTS edit_history JSONB,
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.deck_comments.voice_transcription IS 'AI-generated transcription of the voice note, editable by the user.';
COMMENT ON COLUMN public.deck_comments.edit_history IS 'JSON array of previous versions of the comment for version history.';
COMMENT ON COLUMN public.deck_comments.is_shared IS 'If true, this comment is visible to other recipients as allowed by comment_visibility.';

-- 2. Create comment_visibility junction table
CREATE TABLE IF NOT EXISTS public.comment_visibility (
    id BIGSERIAL PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES public.deck_comments(id) ON DELETE CASCADE,
    user_id UUID, -- For authenticated users (must match auth.uid(), which is UUID)
    email TEXT,   -- For email-based sharing (nullable if user_id is present)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_comment_user_email UNIQUE (comment_id, user_id, email)
);

COMMENT ON TABLE public.comment_visibility IS 'Controls which users/recipients can view a given comment.';

-- 3. Add permission_level to deck_share_recipients
ALTER TABLE public.deck_share_recipients
ADD COLUMN IF NOT EXISTS permission_level TEXT NOT NULL DEFAULT 'can_comment';

COMMENT ON COLUMN public.deck_share_recipients.permission_level IS 'Permission for this recipient: can_comment, view_only, etc.';

-- 4. Update RLS policies for deck_comments and comment_visibility
-- (Assumes RLS is already enabled on deck_comments)

-- Only allow users to view comments if:
-- - They are the author, or
-- - The comment is shared and they are listed in comment_visibility
DROP POLICY IF EXISTS "Allow author or shared recipient to view comments" ON public.deck_comments;
CREATE POLICY "Allow author or shared recipient to view comments"
ON public.deck_comments
FOR SELECT
USING (
    author_user_id::text = auth.uid()::text
    OR (
        is_shared = TRUE
        AND EXISTS (
            SELECT 1 FROM public.comment_visibility
            WHERE comment_id = id
            AND (
                (user_id IS NOT NULL AND user_id::text = auth.uid()::text)
                OR (email IS NOT NULL AND email = auth.jwt()->>'email')
            )
        )
    )
);

-- Only allow authors to update their own comments
DROP POLICY IF EXISTS "Allow author to update comments" ON public.deck_comments;
CREATE POLICY "Allow author to update comments"
ON public.deck_comments
FOR UPDATE USING (author_user_id::text = auth.uid()::text);

-- Only allow authors to delete their own comments
DROP POLICY IF EXISTS "Allow author to delete comments" ON public.deck_comments;
CREATE POLICY "Allow author to delete comments"
ON public.deck_comments
FOR DELETE USING (author_user_id::text = auth.uid()::text);

-- RLS for comment_visibility: allow users to see only their own entries
ALTER TABLE public.comment_visibility ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow user to view their own comment_visibility" ON public.comment_visibility;
CREATE POLICY "Allow user to view their own comment_visibility"
ON public.comment_visibility
FOR SELECT
USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (email IS NOT NULL AND email = auth.jwt()->>'email')
);

-- 5. Add index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_comment_visibility_comment_id ON public.comment_visibility(comment_id);

-- 6. (Optional) Add triggers for edit_history on deck_comments (handled in backend/app logic)

-- End of migration
