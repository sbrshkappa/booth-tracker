-- Test script to check if required data exists
-- Run this in Supabase SQL editor

-- Check booths table
SELECT 'Booths count:' as info;
SELECT COUNT(*) as total_booths FROM booths;

SELECT 'Booths data:' as info;
SELECT id, name, phrase FROM booths ORDER BY id;

-- Check users table
SELECT 'Users count:' as info;
SELECT COUNT(*) as total_users FROM users;

SELECT 'Users data:' as info;
SELECT id, email, first_name, last_name FROM users ORDER BY email;

-- Check user_booth_visits table
SELECT 'Visits count:' as info;
SELECT COUNT(*) as total_visits FROM user_booth_visits;

-- Test the exact queries that getUserProgress uses
SELECT 'Testing getUserProgress queries:' as info;

-- Test user lookup
SELECT 'User lookup for test1@example.com:' as info;
SELECT id, email, first_name, last_name, badge_number
FROM users
WHERE email = 'test1@example.com';

-- Test booths lookup
SELECT 'Booths lookup:' as info;
SELECT id, phrase, name FROM booths;

-- Test visits lookup
SELECT 'Visits lookup for test1@example.com:' as info;
SELECT COUNT(*) as visit_count
FROM user_booth_visits ubv
JOIN users u ON ubv.user_id = u.id
WHERE u.email = 'test1@example.com'; 