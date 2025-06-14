-- Backfill user profiles for existing auth users who don't have profiles
-- This handles users created before the users table and trigger were set up

INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    created_at,
    role,
    status,
    email_verified
)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        TRIM(CONCAT(
            COALESCE(au.raw_user_meta_data->>'first_name', ''),
            ' ',
            COALESCE(au.raw_user_meta_data->>'last_name', '')
        ))
    ) as full_name,
    au.raw_user_meta_data->>'avatar_url',
    au.created_at,
    'admin' as role, -- Making all existing users admins for now, as per the profile service
    'active' as status,
    (au.email_confirmed_at IS NOT NULL) as email_verified
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL -- Only insert users who don't already have profiles
AND au.deleted_at IS NULL; -- Only active auth users

-- Log the number of users that were backfilled
DO $$
DECLARE
    backfilled_count integer;
BEGIN
    GET DIAGNOSTICS backfilled_count = ROW_COUNT;
    RAISE NOTICE 'Backfilled % user profiles for existing auth users', backfilled_count;
END $$;
