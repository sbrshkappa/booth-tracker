-- Admin User Setup Guide Migration
-- This migration provides SQL commands and helper functions for adding admin users

-- Create a helper function to add admin users
CREATE OR REPLACE FUNCTION add_admin_user(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_auth_uuid UUID,
    p_admin_level INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
    new_user_id INTEGER;
BEGIN
    -- Insert into users table with next available ID
    INSERT INTO users (email, first_name, last_name, is_admin, auth_uuid) 
    VALUES (p_email, p_first_name, p_last_name, true, p_auth_uuid)
    RETURNING id INTO new_user_id;
    
    -- Insert into admin_users table
    INSERT INTO admin_users (user_id, admin_level) 
    VALUES (new_user_id, p_admin_level);
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION add_admin_user IS 'Helper function to add admin users to both users and admin_users tables';

-- Create a view to see all admin users with their details
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.auth_uuid,
    u.is_admin,
    au.admin_level,
    CASE au.admin_level
        WHEN 1 THEN 'Booth Admin'
        WHEN 2 THEN 'Conference Admin'
        WHEN 3 THEN 'Super Admin'
        ELSE 'Unknown'
    END as admin_level_name,
    u.created_at
FROM users u
JOIN admin_users au ON u.id = au.user_id
WHERE u.is_admin = true;

-- Add comment explaining the view
COMMENT ON VIEW admin_users_view IS 'View to see all admin users with their details from both tables';

-- Success message with usage instructions
DO $$
BEGIN
    RAISE NOTICE 'Admin user setup guide created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=== MANUAL PROCESS FOR ADDING ADMIN USERS ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Step 1: Create user in Supabase Auth UI';
    RAISE NOTICE '  - Go to Authentication > Users > Add user';
    RAISE NOTICE '  - Enter email and password';
    RAISE NOTICE '  - Copy the generated UUID';
    RAISE NOTICE '';
    RAISE NOTICE 'Step 2: Use the helper function:';
    RAISE NOTICE '  SELECT add_admin_user(''admin@example.com'', ''Admin'', ''User'', ''uuid-from-auth-users'', 3);';
    RAISE NOTICE '';
    RAISE NOTICE 'Step 3: Or use manual SQL commands:';
    RAISE NOTICE '  -- Add to users table (replace with next available ID)';
    RAISE NOTICE '  INSERT INTO users (id, email, first_name, last_name, is_admin, auth_uuid)';
    RAISE NOTICE '  VALUES (12, ''admin@example.com'', ''Admin'', ''User'', true, ''uuid-from-auth-users'');';
    RAISE NOTICE '';
    RAISE NOTICE '  -- Add to admin_users table';
    RAISE NOTICE '  INSERT INTO admin_users (user_id, admin_level)';
    RAISE NOTICE '  VALUES ((SELECT id FROM users WHERE auth_uuid = ''uuid-from-auth-users''), 3);';
    RAISE NOTICE '';
    RAISE NOTICE 'Step 4: Verify admin users:';
    RAISE NOTICE '  SELECT * FROM admin_users_view;';
    RAISE NOTICE '';
    RAISE NOTICE '=== ADMIN LEVELS ===';
    RAISE NOTICE '1 = Booth Admin (manage individual booths)';
    RAISE NOTICE '2 = Conference Admin (manage conference-wide settings)';
    RAISE NOTICE '3 = Super Admin (full system access)';
END $$; 