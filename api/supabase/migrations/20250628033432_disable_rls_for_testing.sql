-- Temporarily disable RLS for testing
-- This will allow the edge function to access user data without RLS restrictions

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_booth_visits table  
ALTER TABLE user_booth_visits DISABLE ROW LEVEL SECURITY;

-- Re-insert test users to make sure they exist
INSERT INTO users (email, first_name, last_name, badge_number) VALUES
('test1@example.com', 'Alice', 'Johnson', 'T001'),
('test2@example.com', 'Bob', 'Smith', 'T002'),
('test3@example.com', 'Carol', 'Davis', 'T003')
ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    badge_number = EXCLUDED.badge_number;

-- Re-insert test booth visits
INSERT INTO user_booth_visits (user_id, booth_id, visited_at, notes, rating) VALUES
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Welcome to SSSIO-USA 2025'), NOW() - INTERVAL '2 hours', 'Great introduction to the conference! Very informative.', 5),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Spiritual Foundation'), NOW() - INTERVAL '1 hour 45 minutes', 'Deep insights into spiritual practices. Loved the meditation session.', 4),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Community Service'), NOW() - INTERVAL '1 hour 30 minutes', 'Inspiring stories about community impact. Ready to get involved!', 5),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Youth Programs'), NOW() - INTERVAL '1 hour 15 minutes', 'Amazing programs for young people. Great energy and enthusiasm.', 4),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Education Initiatives'), NOW() - INTERVAL '1 hour', 'Educational programs are well-structured. Good resources available.', 4),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Healthcare Services'), NOW() - INTERVAL '45 minutes', 'Important healthcare information. Well organized presentation.', 5),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Environmental Projects'), NOW() - INTERVAL '30 minutes', 'Environmental initiatives are crucial. Great to see active projects.', 4),
((SELECT id FROM users WHERE email = 'test1@example.com'), (SELECT id FROM booths WHERE phrase = 'Cultural Exchange'), NOW() - INTERVAL '15 minutes', 'Beautiful cultural presentations. Very diverse and inclusive.', 5)
ON CONFLICT DO NOTHING;

-- Insert visits for test3@example.com
INSERT INTO user_booth_visits (user_id, booth_id, visited_at, notes, rating) VALUES
((SELECT id FROM users WHERE email = 'test3@example.com'), (SELECT id FROM booths WHERE phrase = 'Welcome to SSSIO-USA 2025'), NOW() - INTERVAL '3 hours', 'Good overview of the conference structure.', 4),
((SELECT id FROM users WHERE email = 'test3@example.com'), (SELECT id FROM booths WHERE phrase = 'Spiritual Foundation'), NOW() - INTERVAL '2 hours 30 minutes', 'Interesting spiritual concepts discussed.', 3),
((SELECT id FROM users WHERE email = 'test3@example.com'), (SELECT id FROM booths WHERE phrase = 'Community Service'), NOW() - INTERVAL '2 hours', 'Community service opportunities look promising.', 4),
((SELECT id FROM users WHERE email = 'test3@example.com'), (SELECT id FROM booths WHERE phrase = 'Youth Programs'), NOW() - INTERVAL '1 hour 30 minutes', 'Youth programs are well designed for engagement.', 5)
ON CONFLICT DO NOTHING; 