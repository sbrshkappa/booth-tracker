-- Add notes column to user_booth_visits table
ALTER TABLE user_booth_visits 
ADD COLUMN notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN user_booth_visits.notes IS 'User notes about their visit to this booth'; 