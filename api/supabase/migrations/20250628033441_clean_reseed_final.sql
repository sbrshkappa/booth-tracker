-- Clean reseed database migration
-- This migration wipes all data and recreates everything with existing table structure

-- Drop all existing data
TRUNCATE TABLE user_booth_visits CASCADE;
TRUNCATE TABLE admin_users CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE booths CASCADE;
TRUNCATE TABLE sessions CASCADE;

-- Note: No sequence reset needed since tables use IDENTITY columns, not SERIAL

-- Add total_visits column to booths table if it doesn't exist
ALTER TABLE booths ADD COLUMN IF NOT EXISTS total_visits integer DEFAULT 0;

-- Add auth_uuid column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_uuid UUID;

-- Add index for auth_uuid if it doesn't exist
CREATE INDEX IF NOT EXISTS users_auth_uuid_idx ON users(auth_uuid);

-- Insert sample booths
INSERT INTO booths (id, phrase, name, total_visits) VALUES
(1, 'love and service', 'Community Outreach', 0),
(2, 'selfless devotion', 'Youth Programs', 0),
(3, 'spiritual growth', 'Education Initiatives', 0),
(4, 'compassion in action', 'Healthcare Services', 0),
(5, 'unity in diversity', 'Cultural Programs', 0),
(6, 'environmental care', 'Sustainability Projects', 0),
(7, 'family values', 'Family Support', 0),
(8, 'global harmony', 'International Aid', 0);

-- Insert sample sessions
INSERT INTO sessions (day, start_time, topic, speaker, description, type, location, room, capacity, is_children_friendly, requires_registration, tags) VALUES
-- Day 1 Sessions
(1, '08:00:00', 'Registration & Welcome Coffee', NULL, 'Check-in and networking with fellow attendees', 'registration', 'Main Hall', 'Lobby', 200, false, false, ARRAY['registration', 'networking']),
(1, '09:00:00', 'Opening Ceremony', 'Conference Chair', 'Welcome address and conference overview', 'opening_ceremony', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['opening', 'ceremony']),
(1, '09:30:00', 'Keynote: Digital Transformation in 2024', 'Dr. Sarah Johnson', 'Exploring the latest trends in digital transformation and their impact on businesses', 'keynote', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['keynote', 'digital-transformation', 'trends']),
(1, '10:30:00', 'Coffee Break', NULL, 'Networking and refreshments', 'break', 'Main Hall', 'Lobby', 200, false, false, ARRAY['break', 'networking']),
(1, '11:00:00', 'AI in Healthcare: Opportunities and Challenges', 'Dr. Michael Chen', 'How artificial intelligence is revolutionizing healthcare delivery', 'talk', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['ai', 'healthcare', 'technology']),
(1, '12:00:00', 'Lunch Break', NULL, 'Buffet lunch and networking', 'lunch', 'Main Hall', 'Dining Area', 200, false, false, ARRAY['lunch', 'networking']),
(1, '13:30:00', 'Panel: Future of Remote Work', 'Various Speakers', 'Expert panel discussion on the evolving landscape of remote work', 'panel', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['panel', 'remote-work', 'future']),
(1, '14:30:00', 'Afternoon Break', NULL, 'Refreshments and networking', 'break', 'Main Hall', 'Lobby', 200, false, false, ARRAY['break', 'networking']),
(1, '15:00:00', 'Workshop: Building Effective Teams', 'Lisa Rodriguez', 'Interactive workshop on team building and leadership', 'workshop', 'Main Hall', 'Workshop Room A', 50, false, true, ARRAY['workshop', 'team-building', 'leadership']),
(1, '16:00:00', 'Children''s Festival: Storytelling Session', 'Children''s Entertainer', 'Interactive storytelling and activities for children', 'performance', 'Children''s Area', 'Kids Zone', 30, true, false, ARRAY['children', 'storytelling', 'entertainment']),
(1, '17:00:00', 'Networking Reception', NULL, 'Evening networking with drinks and appetizers', 'networking', 'Main Hall', 'Grand Ballroom', 200, false, false, ARRAY['networking', 'reception']),

-- Day 2 Sessions
(2, '08:30:00', 'Morning Coffee & Registration', NULL, 'Check-in for day 2 attendees', 'registration', 'Main Hall', 'Lobby', 200, false, false, ARRAY['registration', 'networking']),
(2, '09:00:00', 'Keynote: Sustainable Technology', 'Prof. David Kim', 'How technology can drive sustainability and environmental impact', 'keynote', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['keynote', 'sustainability', 'environment']),
(2, '10:00:00', 'Coffee Break', NULL, 'Networking and refreshments', 'break', 'Main Hall', 'Lobby', 200, false, false, ARRAY['break', 'networking']),
(2, '10:30:00', 'Cybersecurity in the Modern Era', 'Alex Thompson', 'Latest threats and defense strategies in cybersecurity', 'talk', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['cybersecurity', 'security', 'technology']),
(2, '11:30:00', 'Q&A Session: Ask the Experts', 'Various Speakers', 'Open Q&A with conference speakers and industry experts', 'q&a', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['q&a', 'expert-panel']),
(2, '12:30:00', 'Lunch Break', NULL, 'Buffet lunch and networking', 'lunch', 'Main Hall', 'Dining Area', 200, false, false, ARRAY['lunch', 'networking']),
(2, '14:00:00', 'Demo: Latest Tech Innovations', 'Tech Demonstrators', 'Live demonstrations of cutting-edge technologies', 'demo', 'Main Hall', 'Demo Area', 100, false, false, ARRAY['demo', 'innovation', 'technology']),
(2, '15:00:00', 'Afternoon Break', NULL, 'Refreshments and networking', 'break', 'Main Hall', 'Lobby', 200, false, false, ARRAY['break', 'networking']),
(2, '15:30:00', 'Workshop: Digital Marketing Strategies', 'Maria Garcia', 'Hands-on workshop on effective digital marketing techniques', 'workshop', 'Main Hall', 'Workshop Room B', 50, false, true, ARRAY['workshop', 'digital-marketing', 'strategy']),
(2, '16:30:00', 'Children''s Festival: Arts & Crafts', 'Children''s Instructor', 'Creative arts and crafts activities for children', 'workshop', 'Children''s Area', 'Kids Zone', 30, true, false, ARRAY['children', 'arts', 'crafts']),
(2, '17:30:00', 'Fireside Chat: Leadership in Tech', 'Tech Leaders', 'Intimate conversation with technology leaders', 'fireside_chat', 'Main Hall', 'Fireside Lounge', 80, false, true, ARRAY['fireside-chat', 'leadership', 'tech']),

-- Day 3 Sessions
(3, '08:30:00', 'Morning Coffee & Registration', NULL, 'Check-in for day 3 attendees', 'registration', 'Main Hall', 'Lobby', 200, false, false, ARRAY['registration', 'networking']),
(3, '09:00:00', 'Keynote: The Future of Work', 'Dr. Emily Watson', 'Predictions and insights into the future of work and employment', 'keynote', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['keynote', 'future-of-work', 'employment']),
(3, '10:00:00', 'Coffee Break', NULL, 'Networking and refreshments', 'break', 'Main Hall', 'Lobby', 200, false, false, ARRAY['break', 'networking']),
(3, '10:30:00', 'Panel: Women in Technology', 'Women Tech Leaders', 'Discussion on challenges and opportunities for women in tech', 'panel', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['panel', 'women-in-tech', 'diversity']),
(3, '11:30:00', 'Poster Session', 'Researchers', 'Academic and industry research presentations', 'poster_session', 'Main Hall', 'Poster Area', 150, false, false, ARRAY['poster-session', 'research', 'academic']),
(3, '12:30:00', 'Lunch Break', NULL, 'Buffet lunch and networking', 'lunch', 'Main Hall', 'Dining Area', 200, false, false, ARRAY['lunch', 'networking']),
(3, '14:00:00', 'Roundtable: Industry Challenges', 'Industry Leaders', 'Roundtable discussion on current industry challenges', 'roundtable', 'Main Hall', 'Roundtable Room', 60, false, true, ARRAY['roundtable', 'industry', 'challenges']),
(3, '15:00:00', 'Afternoon Break', NULL, 'Refreshments and networking', 'break', 'Main Hall', 'Lobby', 200, false, false, ARRAY['break', 'networking']),
(3, '15:30:00', 'Children''s Festival: Science Show', 'Science Entertainer', 'Interactive science experiments and demonstrations for children', 'performance', 'Children''s Area', 'Kids Zone', 30, true, false, ARRAY['children', 'science', 'entertainment']),
(3, '16:30:00', 'Award Ceremony', 'Conference Committee', 'Recognition of outstanding contributions and achievements', 'award_ceremony', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['award-ceremony', 'recognition']),
(3, '17:30:00', 'Closing Ceremony', 'Conference Chair', 'Thank you and closing remarks', 'closing_ceremony', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['closing', 'ceremony']);

-- Insert sample users (with INT id and auth_uuid)
INSERT INTO users (id, email, first_name, last_name, created_at, is_admin, auth_uuid) VALUES
(1, 'john.doe@example.com', 'John', 'Doe', NOW() - INTERVAL '2 days', false, gen_random_uuid()),
(2, 'jane.smith@example.com', 'Jane', 'Smith', NOW() - INTERVAL '1 day', false, gen_random_uuid()),
(3, 'bob.johnson@example.com', 'Bob', 'Johnson', NOW() - INTERVAL '12 hours', false, gen_random_uuid()),
(4, 'demo.admin@conference.com', 'Demo', 'Admin', NOW() - INTERVAL '3 days', true, gen_random_uuid()),
(5, 'alice.wilson@example.com', 'Alice', 'Wilson', NOW() - INTERVAL '6 hours', false, gen_random_uuid()),
(6, 'charlie.brown@example.com', 'Charlie', 'Brown', NOW() - INTERVAL '4 hours', false, gen_random_uuid()),
(7, 'diana.prince@example.com', 'Diana', 'Prince', NOW() - INTERVAL '2 hours', false, gen_random_uuid()),
(8, 'edward.norton@example.com', 'Edward', 'Norton', NOW() - INTERVAL '1 hour', false, gen_random_uuid()),
(9, 'fiona.gallagher@example.com', 'Fiona', 'Gallagher', NOW() - INTERVAL '30 minutes', false, gen_random_uuid()),
(10, 'george.lucas@example.com', 'George', 'Lucas', NOW() - INTERVAL '15 minutes', false, gen_random_uuid());

-- Insert sample booth visits (using INT user_id)
INSERT INTO user_booth_visits (user_id, booth_id, visited_at, notes, rating) VALUES
-- John Doe (user_id: 1) - visits all booths
(1, 1, NOW() - INTERVAL '2 hours', 'Great introduction to the conference! Very informative.', 5),
(1, 2, NOW() - INTERVAL '1 hour 45 minutes', 'Deep insights into spiritual practices. Loved the meditation session.', 4),
(1, 3, NOW() - INTERVAL '1 hour 30 minutes', 'Inspiring stories about community impact. Ready to get involved!', 5),
(1, 4, NOW() - INTERVAL '1 hour 15 minutes', 'Amazing programs for young people. Great energy and enthusiasm.', 4),
(1, 5, NOW() - INTERVAL '1 hour', 'Educational programs are well-structured. Good resources available.', 4),
(1, 6, NOW() - INTERVAL '45 minutes', 'Important healthcare information. Well organized presentation.', 5),
(1, 7, NOW() - INTERVAL '30 minutes', 'Environmental initiatives are crucial. Great to see active projects.', 4),
(1, 8, NOW() - INTERVAL '15 minutes', 'Beautiful cultural presentations. Very diverse and inclusive.', 5),

-- Bob Johnson (user_id: 3) - partial visits
(3, 1, NOW() - INTERVAL '3 hours', 'Good overview of the conference structure.', 4),
(3, 3, NOW() - INTERVAL '2 hours 30 minutes', 'Interesting spiritual concepts discussed.', 3),
(3, 5, NOW() - INTERVAL '2 hours', 'Community service opportunities look promising.', 4),
(3, 7, NOW() - INTERVAL '1 hour 30 minutes', 'Youth programs are well designed for engagement.', 5);

-- Update booth total_visits counts
UPDATE booths SET total_visits = (
    SELECT COUNT(*) 
    FROM user_booth_visits 
    WHERE user_booth_visits.booth_id = booths.id
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database cleaned and reseeded successfully!';
    RAISE NOTICE 'Users table now uses INT ids (1-10) with auth_uuid for linking with auth.users';
    RAISE NOTICE 'Booths table includes total_visits column';
    RAISE NOTICE 'To add an admin user:';
    RAISE NOTICE '1. Create user in Supabase Auth UI';
    RAISE NOTICE '2. Update the auth_uuid field in users table with the auth.users UUID';
    RAISE NOTICE '3. Add entry to admin_users table with the same UUID';
END $$; 