-- Debug script to check user data
-- Run this in Supabase SQL editor

-- Check if users table exists and has data
SELECT 'Checking users table:' as info;
SELECT COUNT(*) as total_users FROM users;

-- List all users
SELECT 'All users:' as info;
SELECT id, email, first_name, last_name, badge_number FROM users ORDER BY email;

-- Test the exact query that getUserProgress uses
SELECT 'Testing getUserProgress query for test1@example.com:' as info;
SELECT id, email, first_name, last_name, badge_number
FROM users
WHERE email = 'test1@example.com';

-- Check RLS policies
SELECT 'RLS policies on users table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Check if RLS is enabled
SELECT 'RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users'; 