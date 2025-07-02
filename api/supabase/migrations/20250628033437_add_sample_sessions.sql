-- Insert sample sessions for the 3-day conference
INSERT INTO "public"."sessions" (
    "day", "start_time", "topic", "speaker", "description", "type", 
    "location", "room", "capacity", "is_children_friendly", "requires_registration", "tags"
) VALUES
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