-- Migration: Create enhanced_profiles view
-- Adjust the SELECT statement as needed for your application's requirements

CREATE OR REPLACE VIEW public.enhanced_profiles AS
SELECT
  u.id AS user_id,
  u.email,
  u.full_name,
  u.display_name,
  u.avatar_url,
  u.status,
  u.email_verified,
  u.phone,
  u.created_at,
  u.updated_at,
  u.last_login_at,
  u.metadata,
  u.setup_progress,
  u.role,
  u.is_public,
  u.allows_messages,
  u.professional_background,
  u.social_links
FROM public.users u;
