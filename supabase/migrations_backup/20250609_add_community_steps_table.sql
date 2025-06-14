CREATE TABLE community_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review', -- e.g., pending_review, approved, rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON community_steps
  FOR EACH ROW
  EXECUTE PROCEDURE moddatetime (updated_at);
