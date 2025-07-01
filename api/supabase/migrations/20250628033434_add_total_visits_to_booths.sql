-- Add total_visits column to booths table
ALTER TABLE booths ADD COLUMN total_visits INTEGER DEFAULT 0;

-- Update existing booths with their current visit counts
UPDATE booths 
SET total_visits = (
  SELECT COUNT(*) 
  FROM user_booth_visits 
  WHERE user_booth_visits.booth_id = booths.id
); 