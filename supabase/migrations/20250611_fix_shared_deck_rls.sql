-- Migration: Fix RLS for shared deck viewing via share token
-- Date: 2025-06-11

-- 1. Enable RLS on pitch_decks if not already enabled
ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;

-- 2. Drop old public access policy if it exists
DROP POLICY IF EXISTS "Allow public read access via share token" ON public.pitch_decks;

-- 3. Create new policy for share token access on pitch_decks
CREATE POLICY "Allow public read access via share token"
ON public.pitch_decks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.smart_share_links
    WHERE smart_share_links.deck_id = pitch_decks.id
      AND smart_share_links.share_token = current_setting('request.jwt.claim.share_token', true)
      AND (smart_share_links.expires_at IS NULL OR smart_share_links.expires_at > now())
  )
);

-- 4. Enable RLS on deck_sections if not already enabled
ALTER TABLE public.deck_sections ENABLE ROW LEVEL SECURITY;

-- 5. Drop old public access policy if it exists
DROP POLICY IF EXISTS "Allow public read access to sections via share token" ON public.deck_sections;

-- 6. Create new policy for share token access on deck_sections
CREATE POLICY "Allow public read access to sections via share token"
ON public.deck_sections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.smart_share_links
    WHERE smart_share_links.deck_id = deck_sections.deck_id
      AND smart_share_links.share_token = current_setting('request.jwt.claim.share_token', true)
      AND (smart_share_links.expires_at IS NULL OR smart_share_links.expires_at > now())
  )
);

-- 7. (Optional) Owners still have full access via existing owner policies.
