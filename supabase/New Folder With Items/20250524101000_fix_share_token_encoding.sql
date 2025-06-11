-- Fix the share_token encoding issue
-- Replace base64url encoding with hex encoding which is more widely supported

ALTER TABLE pitch_decks ALTER COLUMN share_token DROP DEFAULT;
ALTER TABLE pitch_decks ALTER COLUMN share_token SET DEFAULT encode(gen_random_bytes(32), 'hex');

-- Update any existing NULL share_tokens
UPDATE pitch_decks SET share_token = encode(gen_random_bytes(32), 'hex') WHERE share_token IS NULL;
