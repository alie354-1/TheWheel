-- (REMOVED) user_roles table for admin checks in RLS policies
-- This table is deprecated and should not be used. All admin checks should use company_members.

-- CREATE TABLE IF NOT EXISTS user_roles (
--     user_id UUID NOT NULL,
--     role TEXT NOT NULL,
--     PRIMARY KEY (user_id, role)
-- );

-- Example: Insert a default admin user (replace with your actual user UUID)
-- INSERT INTO user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000000', 'admin');
