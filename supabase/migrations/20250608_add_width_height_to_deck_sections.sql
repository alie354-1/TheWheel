-- Add width and height columns to deck_sections for slide canvas dimensions
ALTER TABLE public.deck_sections
ADD COLUMN IF NOT EXISTS width INTEGER NULL,
ADD COLUMN IF NOT EXISTS height INTEGER NULL;

COMMENT ON COLUMN public.deck_sections.width IS 'Canvas width for this slide/section';
COMMENT ON COLUMN public.deck_sections.height IS 'Canvas height for this slide/section';
