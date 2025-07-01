-- Check rating column in user_booth_visits table
-- Run this in Supabase SQL editor

-- Check if rating column exists
SELECT 'Column info for user_booth_visits:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_booth_visits' 
ORDER BY ordinal_position;

-- Check rating data
SELECT 'Rating data sample:' as info;
SELECT id, user_id, booth_id, rating, notes
FROM user_booth_visits 
LIMIT 5;

-- Test the exact query that getUserProgress uses for visit history
SELECT 'Testing getUserProgress visit history query:' as info;
SELECT 
    ubv.id,
    ubv.booth_id,
    ubv.visited_at,
    ubv.notes,
    ubv.rating,
    b.phrase,
    b.name
FROM user_booth_visits ubv
JOIN booths b ON ubv.booth_id = b.id
JOIN users u ON ubv.user_id = u.id
WHERE u.email = 'test1@example.com'
ORDER BY ubv.visited_at DESC
LIMIT 3; 