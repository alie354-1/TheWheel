-- Add author note and tutorial fields to smart_share_links
ALTER TABLE smart_share_links
ADD COLUMN author_note TEXT,
ADD COLUMN show_tutorial BOOLEAN DEFAULT false,
ADD COLUMN tutorial_style TEXT DEFAULT 'animated' CHECK (tutorial_style IN ('animated', 'interactive'));

-- Add tutorial tracking fields to reviewer_sessions
ALTER TABLE reviewer_sessions
ADD COLUMN tutorial_completed BOOLEAN DEFAULT false,
ADD COLUMN tutorial_completed_at TIMESTAMPTZ;

-- Create index for tutorial tracking
CREATE INDEX idx_reviewer_sessions_tutorial ON reviewer_sessions(tutorial_completed, session_id);
