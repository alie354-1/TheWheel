-- Fix for deck sections RLS policy

-- 1. Enable RLS on deck_sections if not already enabled
ALTER TABLE public.deck_sections ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing public access policy if it exists, to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to sections of shared or public decks" ON public.deck_sections;

-- 3. Create a new policy for public access to deck_sections
CREATE POLICY "Allow public read access to sections of shared or public decks"
ON public.deck_sections
FOR SELECT
USING (
    -- The user can select a section if they can select the parent deck.
    EXISTS (
        SELECT 1
        FROM public.pitch_decks
        WHERE pitch_decks.id = deck_sections.deck_id
    )
);

-- 4. Ensure owners have full access
DROP POLICY IF EXISTS "Allow full access to owners" ON public.deck_sections;
CREATE POLICY "Allow full access to owners"
ON public.deck_sections
FOR ALL
USING (
    (SELECT owner_id FROM public.pitch_decks WHERE id = deck_sections.deck_id) = auth.uid()
)
WITH CHECK (
    (SELECT owner_id FROM public.pitch_decks WHERE id = deck_sections.deck_id) = auth.uid()
);
