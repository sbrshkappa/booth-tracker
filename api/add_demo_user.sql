-- Add demo@example.com to users table if it doesn't exist
INSERT INTO users (email, first_name, last_name, badge_number)
VALUES ('demo@example.com', 'Demo', 'Admin', 'ADMIN001')
ON CONFLICT (email) DO NOTHING;

-- Verify the user exists
SELECT 'Demo user check:' as info;
SELECT id, email, first_name, last_name, badge_number 
FROM users 
WHERE email = 'demo@example.com';

-- Check admin status
SELECT 'Admin status check:' as info;
SELECT 
    au.email,
    adu.admin_level,
    adu.conference_id
FROM admin_users adu
JOIN auth.users au ON adu.user_id = au.id
WHERE au.email = 'demo@example.com'; 