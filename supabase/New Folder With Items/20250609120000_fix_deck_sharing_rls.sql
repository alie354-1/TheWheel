-- Fix for deck sharing RLS policy

-- 1. Enable RLS on pitch_decks if not already enabled
ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing public access policy if it exists, to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to shared or public decks" ON public.pitch_decks;

-- 3. Create a new, more robust policy for public access
CREATE POLICY "Allow public read access to shared or public decks"
ON public.pitch_decks
FOR SELECT
USING (
    -- Condition 1: The deck is explicitly marked as public (if such a column exists)
    -- Assuming a column `is_public` of type BOOLEAN. If not, this part can be removed.
    -- (is_public = TRUE) 
    -- OR
    -- Condition 2: The user is the owner of the deck
    (auth.uid() = owner_id)
    OR
    -- Condition 3: The deck is being accessed via a valid smart share link
    (
        EXISTS (
            SELECT 1
            FROM public.smart_share_links
            WHERE smart_share_links.deck_id = pitch_decks.id
            AND (
                smart_share_links.expires_at IS NULL 
                OR smart_share_links.expires_at > now()
            )
        )
    )
);

-- 4. Ensure owners have full access
DROP POLICY IF EXISTS "Allow full access to owners" ON public.pitch_decks;
CREATE POLICY "Allow full access to owners"
ON public.pitch_decks
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);
