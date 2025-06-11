-- Add missing fields to expert_profiles table

-- Add years_of_experience
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;

-- Add bio
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add certifications
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS certifications TEXT[];

-- Add education
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS education TEXT;

-- Add hourly_rate
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;

-- Add availability_description
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS availability_description TEXT;

-- Add mentorship_style
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS mentorship_style TEXT;

-- Add is_accepting_clients
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS is_accepting_clients BOOLEAN DEFAULT TRUE;

-- Add is_featured
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add rating
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;

-- Add review_count
ALTER TABLE expert_profiles
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
