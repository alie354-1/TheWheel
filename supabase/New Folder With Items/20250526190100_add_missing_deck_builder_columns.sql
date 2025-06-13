-- Add 'theme' column to 'pitch_decks' table
ALTER TABLE public.pitch_decks
ADD COLUMN IF NOT EXISTS theme JSONB NULL;

COMMENT ON COLUMN public.pitch_decks.theme IS 'Stores theme configuration for the deck.';

-- Add 'slide_style' column to 'deck_sections' table
ALTER TABLE public.deck_sections
ADD COLUMN IF NOT EXISTS slide_style JSONB NULL;

COMMENT ON COLUMN public.deck_sections.slide_style IS 'Stores section-specific styling information.';

-- Add 'presenter_notes' column to 'deck_sections' table
ALTER TABLE public.deck_sections
ADD COLUMN IF NOT EXISTS presenter_notes TEXT NULL;

COMMENT ON COLUMN public.deck_sections.presenter_notes IS 'Stores presenter notes for each section.';

-- Add 'title' column to 'deck_sections' table
ALTER TABLE public.deck_sections
ADD COLUMN IF NOT EXISTS title TEXT NULL;

COMMENT ON COLUMN public.deck_sections.title IS 'Stores the title of the section.';

-- Additionally, ensure template_id in pitch_decks can store non-UUIDs if that's the long-term design.
-- For now, the client-side code handles sending NULL if it's not a UUID.
-- If template_id should indeed be TEXT:
-- ALTER TABLE public.pitch_decks
--   ALTER COLUMN template_id TYPE TEXT;
-- COMMENT ON COLUMN public.pitch_decks.template_id IS 'Stores the identifier of the template used, can be a non-UUID string.';
-- Note: The above ALTER COLUMN for template_id is commented out as the immediate issue is missing columns.
-- Re-evaluate template_id type separately if string identifiers are preferred over UUIDs.

END;
