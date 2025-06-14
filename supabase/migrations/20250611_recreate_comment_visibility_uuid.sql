-- Migration: Recreate comment_visibility table with UUID id (2025-06-11)

-- 1. Drop the existing table (will delete all data!)
DROP TABLE IF EXISTS public.comment_visibility CASCADE;

-- 2. Recreate the table with id as UUID
CREATE TABLE public.comment_visibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.deck_comments(id) ON DELETE CASCADE,
    user_id UUID, -- For authenticated users (must match auth.uid(), which is UUID)
    email TEXT,   -- For email-based sharing (nullable if user_id is present)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_comment_user_email UNIQUE (comment_id, user_id, email)
);

COMMENT ON TABLE public.comment_visibility IS 'Controls which users/recipients can view a given comment.';

-- 3. Add index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_comment_visibility_comment_id ON public.comment_visibility(comment_id);

-- 4. Enable RLS and add policy for users to see their own entries
ALTER TABLE public.comment_visibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow user to view their own comment_visibility" ON public.comment_visibility;
CREATE POLICY "Allow user to view their own comment_visibility"
ON public.comment_visibility
FOR SELECT
USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (email IS NOT NULL AND email = auth.jwt()->>'email')
);

-- End of migration
