-- Add total_visits column to booths table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'booths' AND column_name = 'total_visits'
    ) THEN
        ALTER TABLE booths ADD COLUMN total_visits INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update total_visits for all existing booths
UPDATE booths 
SET total_visits = (
  SELECT COUNT(*) 
  FROM user_booth_visits 
  WHERE user_booth_visits.booth_id = booths.id
); 