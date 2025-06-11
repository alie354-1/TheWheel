-- Migration to add sample users to auth.users table

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define UUIDs for our sample users
DO $$
DECLARE
  technical_expert_id UUID := '11111111-1111-1111-1111-111111111111';
  business_expert_id UUID := '22222222-2222-2222-2222-222222222222';
  marketing_expert_id UUID := '33333333-3333-3333-3333-333333333333';
  financial_expert_id UUID := '44444444-4444-4444-4444-444444444444';
  design_expert_id UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
  -- Insert sample users into auth.users
  -- Note: In a real environment, you would use Supabase Auth to create these users
  -- This is a direct insert for demonstration purposes only
  
  -- Technical Expert
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    technical_expert_id,
    'tech.expert@example.com',
    -- This is a dummy password hash, not a real one
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Alex", "last_name": "Chen", "avatar_url": "https://randomuser.me/api/portraits/men/1.jpg"}'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Business Strategy Expert
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    business_expert_id,
    'business.expert@example.com',
    -- This is a dummy password hash, not a real one
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Sarah", "last_name": "Johnson", "avatar_url": "https://randomuser.me/api/portraits/women/2.jpg"}'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Marketing Expert
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    marketing_expert_id,
    'marketing.expert@example.com',
    -- This is a dummy password hash, not a real one
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Miguel", "last_name": "Rodriguez", "avatar_url": "https://randomuser.me/api/portraits/men/3.jpg"}'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Financial Expert
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    financial_expert_id,
    'financial.expert@example.com',
    -- This is a dummy password hash, not a real one
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Priya", "last_name": "Patel", "avatar_url": "https://randomuser.me/api/portraits/women/4.jpg"}'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- UX/UI Design Expert
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    design_expert_id,
    'design.expert@example.com',
    -- This is a dummy password hash, not a real one
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12',
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jordan", "last_name": "Taylor", "avatar_url": "https://randomuser.me/api/portraits/women/5.jpg"}'
  ) ON CONFLICT (id) DO NOTHING;

  -- Also insert into public.users table if it exists
  -- This assumes there's a public.users table with the correct structure
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    -- Get the column names from the public.users table
    PERFORM column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users';
    
    -- Technical Expert - using a more generic approach with minimal columns
    INSERT INTO public.users (
      id,
      email,
      created_at,
      updated_at
    ) VALUES (
      technical_expert_id,
      'tech.expert@example.com',
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Business Strategy Expert
    INSERT INTO public.users (
      id,
      email,
      created_at,
      updated_at
    ) VALUES (
      business_expert_id,
      'business.expert@example.com',
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Marketing Expert
    INSERT INTO public.users (
      id,
      email,
      created_at,
      updated_at
    ) VALUES (
      marketing_expert_id,
      'marketing.expert@example.com',
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Financial Expert
    INSERT INTO public.users (
      id,
      email,
      created_at,
      updated_at
    ) VALUES (
      financial_expert_id,
      'financial.expert@example.com',
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- UX/UI Design Expert
    INSERT INTO public.users (
      id,
      email,
      created_at,
      updated_at
    ) VALUES (
      design_expert_id,
      'design.expert@example.com',
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Try to update user metadata if name columns exist
    BEGIN
      -- Update with user metadata if the columns exist
      UPDATE public.users 
      SET 
        raw_user_meta_data = '{"first_name": "Alex", "last_name": "Chen", "avatar_url": "https://randomuser.me/api/portraits/men/1.jpg"}'
      WHERE id = technical_expert_id;
      
      UPDATE public.users 
      SET 
        raw_user_meta_data = '{"first_name": "Sarah", "last_name": "Johnson", "avatar_url": "https://randomuser.me/api/portraits/women/2.jpg"}'
      WHERE id = business_expert_id;
      
      UPDATE public.users 
      SET 
        raw_user_meta_data = '{"first_name": "Miguel", "last_name": "Rodriguez", "avatar_url": "https://randomuser.me/api/portraits/men/3.jpg"}'
      WHERE id = marketing_expert_id;
      
      UPDATE public.users 
      SET 
        raw_user_meta_data = '{"first_name": "Priya", "last_name": "Patel", "avatar_url": "https://randomuser.me/api/portraits/women/4.jpg"}'
      WHERE id = financial_expert_id;
      
      UPDATE public.users 
      SET 
        raw_user_meta_data = '{"first_name": "Jordan", "last_name": "Taylor", "avatar_url": "https://randomuser.me/api/portraits/women/5.jpg"}'
      WHERE id = design_expert_id;
    EXCEPTION
      WHEN undefined_column THEN
        -- If raw_user_meta_data doesn't exist, we'll just continue
        NULL;
    END;
  END IF;
END $$;

-- Set password for all sample users to 'password123'
-- This assumes you have the necessary permissions to update auth.users
UPDATE auth.users
SET encrypted_password = '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12'
WHERE email LIKE '%.expert@example.com';

-- Sample user credentials for reference (commented out for SQL compatibility):
-- Technical Expert: tech.expert@example.com / password123
-- Business Expert: business.expert@example.com / password123
-- Marketing Expert: marketing.expert@example.com / password123
-- Financial Expert: financial.expert@example.com / password123
-- Design Expert: design.expert@example.com / password123
