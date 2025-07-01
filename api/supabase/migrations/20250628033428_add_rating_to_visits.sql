-- Add rating column to user_booth_visits table
ALTER TABLE user_booth_visits 
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Add comment for documentation
COMMENT ON COLUMN user_booth_visits.rating IS 'User rating for the booth (1-5 stars)'; 