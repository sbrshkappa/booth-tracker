-- Add is_admin column to users table for simpler admin checking
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Update existing admin users to have is_admin = true
UPDATE users 
SET is_admin = true 
WHERE email IN (
  SELECT DISTINCT u.email 
  FROM users u 
  JOIN admin_users au ON au.user_id = (
    SELECT id FROM auth.users WHERE email = u.email
  )
);

-- Add your new admin user
UPDATE users 
SET is_admin = true 
WHERE email = 'admin@example.com'; -- Replace with your actual admin email 