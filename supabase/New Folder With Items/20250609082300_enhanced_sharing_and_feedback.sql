-- Migration for Enhanced Sharing and Feedback System

-- 1. Create the feedback_category ENUM type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_category') THEN
        CREATE TYPE feedback_category AS ENUM ('Content', 'Form', 'General');
    END IF;
END$$;

-- 2. Add new columns to the deck_comments table
ALTER TABLE public.deck_comments
ADD COLUMN IF NOT EXISTS feedback_category feedback_category NOT NULL DEFAULT 'General',
ADD COLUMN IF NOT EXISTS component_id TEXT;

COMMENT ON COLUMN public.deck_comments.feedback_category IS 'Classifies the feedback as relating to Content, Form, or General.';
COMMENT ON COLUMN public.deck_comments.component_id IS 'The ID of the visual component the comment is anchored to, if any.';

-- 3. Add new columns to the smart_share_links table
ALTER TABLE public.smart_share_links
ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_anonymous_feedback BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creator_is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.smart_share_links.requires_verification IS 'If true, recipients must verify their identity using the code sent to their email/phone.';
COMMENT ON COLUMN public.smart_share_links.allow_anonymous_feedback IS 'If true, reviewers can submit comments without identifying themselves.';
COMMENT ON COLUMN public.smart_share_links.creator_is_anonymous IS 'If true, the identity of the deck creator is hidden from reviewers.';


-- 4. Create the new deck_share_recipients table
CREATE TABLE IF NOT EXISTS public.deck_share_recipients (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    share_link_id UUID NOT NULL REFERENCES public.smart_share_links(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL,
    feedback_weight NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    access_code TEXT, -- For verification
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL),
    CONSTRAINT uq_recipient_per_link_email UNIQUE (share_link_id, email),
    CONSTRAINT uq_recipient_per_link_phone UNIQUE (share_link_id, phone)
);

-- Enable RLS and define policies for the new table
ALTER TABLE public.deck_share_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow creator to manage recipients"
ON public.deck_share_recipients
FOR ALL
USING (
    auth.uid() = (
        SELECT created_by FROM public.smart_share_links WHERE id = share_link_id
    )
);

CREATE POLICY "Allow verified recipients to view their own entry"
ON public.deck_share_recipients
FOR SELECT
USING (
    (
        email IS NOT NULL AND auth.jwt()->>'email' = email
    ) OR (
        phone IS NOT NULL AND auth.jwt()->>'phone' = phone
    )
);


COMMENT ON TABLE public.deck_share_recipients IS 'Manages individual recipients for a smart share link, including their role, feedback weight, and verification status.';
