-- Add auth_uuid column to users table for linking with auth.users
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_uuid UUID;

-- Add index for better performance when querying by auth_uuid
CREATE INDEX IF NOT EXISTS users_auth_uuid_idx ON users(auth_uuid);

-- Add comment explaining the purpose
COMMENT ON COLUMN users.auth_uuid IS 'UUID from auth.users table for linking authentication with application user data';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'auth_uuid column added to users table';
    RAISE NOTICE 'Index created for auth_uuid column';
    RAISE NOTICE 'You can now link users with auth.users table';
END $$; 