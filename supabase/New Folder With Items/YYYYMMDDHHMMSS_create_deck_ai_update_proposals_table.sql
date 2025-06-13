-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.deck_ai_update_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.pitch_decks(id) ON DELETE CASCADE,
    slide_id TEXT NOT NULL,
    element_id TEXT,
    change_type TEXT NOT NULL CHECK (change_type IN (
        'TextEdit', 'ImageSwap', 'ChartUpdate', 'NewElement', 
        'ReorderElement', 'DeleteElement', 'NewSlide', 'ReorderSlide'
        -- Add more specific change types as they are developed
    )),
    description TEXT,
    original_content_snapshot JSONB,
    proposed_content_data JSONB NOT NULL,
    source_comment_ids UUID[],
    ai_confidence_score REAL,
    weighted_feedback_score REAL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Modified', 'Archived')),
    owner_action_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments to clarify column purposes
COMMENT ON TABLE public.deck_ai_update_proposals IS 'Stores AI-generated proposals for deck content changes.';
COMMENT ON COLUMN public.deck_ai_update_proposals.slide_id IS 'Corresponds to DeckSection.id';
COMMENT ON COLUMN public.deck_ai_update_proposals.element_id IS 'Corresponds to VisualComponent.id, if proposal targets a specific element';
COMMENT ON COLUMN public.deck_ai_update_proposals.original_content_snapshot IS 'Snapshot of content before the proposed change, if applicable.';
COMMENT ON COLUMN public.deck_ai_update_proposals.proposed_content_data IS 'The actual proposed change data, structure depends on change_type.';
COMMENT ON COLUMN public.deck_ai_update_proposals.source_comment_ids IS 'Array of comment IDs that led to this proposal.';

-- Optional: Add indexes for performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_deck_ai_update_proposals_deck_id ON public.deck_ai_update_proposals(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_ai_update_proposals_slide_id ON public.deck_ai_update_proposals(slide_id);
CREATE INDEX IF NOT EXISTS idx_deck_ai_update_proposals_status ON public.deck_ai_update_proposals(status);

-- Trigger to automatically update 'updated_at' timestamp on changes
-- Ensure the function 'public.set_current_timestamp_updated_at' exists.
-- It should have been created by a previous migration (e.g., 20250503000000_add_set_updated_at_function.sql).
-- If not, you would need to include its definition:
-- CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

CREATE TRIGGER set_deck_ai_update_proposals_updated_at
BEFORE UPDATE ON public.deck_ai_update_proposals
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
