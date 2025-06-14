-- Create the storage bucket for deck images
INSERT INTO storage.buckets (id, name, public)
VALUES ('deck_images', 'deck_images', false)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security for the deck_images bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the deck_images bucket

-- 1. Allow users to view their own images
CREATE POLICY "Allow users to view their own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'deck_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Allow users to upload images to their own folder
CREATE POLICY "Allow users to upload images to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deck_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow users to update their own images
CREATE POLICY "Allow users to update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'deck_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow users to delete their own images
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'deck_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
