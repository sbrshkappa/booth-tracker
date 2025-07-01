-- Seed file for booth-tracker test data
-- WARNING: This will create test users and booth visits

-- First, create test users in the users table
INSERT INTO users (email, first_name, last_name, badge_number) VALUES
('test1@example.com', 'Alice', 'Johnson', 'T001'),
('test2@example.com', 'Bob', 'Smith', 'T002'),
('test3@example.com', 'Carol', 'Davis', 'T003')
ON CONFLICT (email) DO NOTHING;

-- Create users in Supabase Auth (this requires admin privileges)
-- Note: These users will have password 'password123' - change in production!
-- You may need to create these manually in the Supabase dashboard if this doesn't work

-- Make demo@example.com a super admin
INSERT INTO admin_users (user_id, admin_level, conference_id, created_by)
SELECT 
    au.id as user_id,
    'super_admin' as admin_level,
    'sssio_usa_2025' as conference_id,
    au.id as created_by
FROM auth.users au
WHERE au.email = 'demo@example.com'
ON CONFLICT (user_id, conference_id) 
DO UPDATE SET admin_level = 'super_admin';

-- Test User 1: Alice - Has visited ALL booths (complete)
-- Insert visits for all booths with notes and ratings
INSERT INTO user_booth_visits (user_id, booth_id, visited_at, notes, rating) VALUES
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Welcome to SSSIO-USA 2025'), NOW() - INTERVAL '2 hours', 'Great introduction to the conference! Very informative.', 5),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Spiritual Foundation'), NOW() - INTERVAL '1 hour 45 minutes', 'Deep insights into spiritual practices. Loved the meditation session.', 4),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Community Service'), NOW() - INTERVAL '1 hour 30 minutes', 'Inspiring stories about community impact. Ready to get involved!', 5),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Youth Programs'), NOW() - INTERVAL '1 hour 15 minutes', 'Amazing programs for young people. Great energy and enthusiasm.', 4),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Education Initiatives'), NOW() - INTERVAL '1 hour', 'Educational programs are well-structured. Good resources available.', 4),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Healthcare Services'), NOW() - INTERVAL '45 minutes', 'Important healthcare information. Well organized presentation.', 5),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Environmental Projects'), NOW() - INTERVAL '30 minutes', 'Environmental initiatives are crucial. Great to see active projects.', 4),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Cultural Exchange'), NOW() - INTERVAL '15 minutes', 'Beautiful cultural presentations. Very diverse and inclusive.', 5);

-- Test User 2: Bob - Has visited NO booths (new user)
-- No visits to insert - this user starts fresh

-- Test User 3: Carol - Has visited 4 booths (partial progress)
INSERT INTO user_booth_visits (user_id, booth_id, visited_at, notes, rating) VALUES
((SELECT id FROM users WHERE email = 'test3@example.com'), (SELECT id FROM booths WHERE phrase = 'Welcome to SSSIO-USA 2025'), NOW() - INTERVAL '3 hours', 'Good overview of the conference structure.', 4),
((SELECT id FROM users WHERE email = 'test3@example.com'), (SELECT id FROM booths WHERE phrase = 'Spiritual Foundation'), NOW() - INTERVAL '2 hours 30 minutes', 'Interesting spiritual concepts discussed.', 3),
((SELECT id FROM users WHERE email = 'test3@example.com'), (SELECT id FROM booths WHERE phrase = 'Community Service'), NOW() - INTERVAL '2 hours', 'Community service opportunities look promising.', 4),
((SELECT id FROM users WHERE email = 'test3@example.com'), (SELECT id FROM booths WHERE phrase = 'Youth Programs'), NOW() - INTERVAL '1 hour 30 minutes', 'Youth programs are well designed for engagement.', 5);

-- Verify the data
SELECT 
    'User Summary' as info,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(ubv.id) as booths_visited,
    CASE 
        WHEN COUNT(ubv.id) = 0 THEN 'No visits'
        WHEN COUNT(ubv.id) = (SELECT COUNT(*) FROM booths) THEN 'All booths visited'
        ELSE CONCAT(COUNT(ubv.id), ' booths visited')
    END as status
FROM users u
LEFT JOIN user_booth_visits ubv ON u.id = ubv.user_id
WHERE u.email IN ('test1@example.com', 'test2@example.com', 'test3@example.com', 'demo@example.com')
GROUP BY u.id, u.email, u.first_name, u.last_name
ORDER BY u.email;

-- Show admin status
SELECT 
    'Admin Status' as info,
    au.email,
    adu.admin_level,
    adu.conference_id
FROM admin_users adu
JOIN auth.users au ON adu.user_id = au.id
WHERE au.email = 'demo@example.com'; 