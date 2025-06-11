-- 1. Add columns to smart_share_links
ALTER TABLE smart_share_links
ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_anonymous_feedback BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creator_is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN smart_share_links.requires_verification IS 'If true, recipients must verify their identity using the code sent to their email/phone.';

-- 2. Create deck_share_recipients table
CREATE TABLE IF NOT EXISTS deck_share_recipients (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    share_link_id UUID NOT NULL REFERENCES smart_share_links(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL,
    feedback_weight NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    access_code TEXT, -- For verification
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL),
    CONSTRAINT uq_recipient_per_link UNIQUE (share_link_id, email),
    CONSTRAINT uq_phone_per_link UNIQUE (share_link_id, phone)
);

COMMENT ON TABLE deck_share_recipients IS 'Manages individual recipients for a smart share link, including their role, feedback weight, and verification status.';

-- 3. Create feedback_category type and alter deck_comments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_category') THEN
        CREATE TYPE feedback_category AS ENUM ('Content', 'Form', 'General');
    END IF;
END$$;

ALTER TABLE deck_comments
ADD COLUMN IF NOT EXISTS feedback_category feedback_category NOT NULL DEFAULT 'General',
ADD COLUMN IF NOT EXISTS component_id TEXT;

COMMENT ON COLUMN deck_comments.feedback_category IS 'Classifies the feedback as relating to Content, Form, or General.';
COMMENT ON COLUMN deck_comments.component_id IS 'The ID of the visual component the comment is anchored to, if any.';
