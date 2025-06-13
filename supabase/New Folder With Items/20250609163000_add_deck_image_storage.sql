CREATE TABLE deck_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE deck_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own deck images"
ON deck_images
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Allow collaborators to view deck images"
ON deck_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM deck_collaborators
    WHERE deck_collaborators.deck_id = deck_images.deck_id
      AND deck_collaborators.user_id = auth.uid()
  )
);
