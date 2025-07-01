-- Allow anon role access for test users
-- This is needed because edge functions use the anon key

-- Drop and recreate the users policy to allow anon access
DROP POLICY IF EXISTS "Users can read own data" ON "public"."users";

CREATE POLICY "Users can read own data" ON "public"."users"
FOR SELECT USING (
  auth.role() = 'service_role' 
  OR auth.role() = 'anon'
  OR auth.uid()::text = email 
  OR email IN ('test1@example.com', 'test2@example.com', 'test3@example.com', 'demo@example.com')
);

-- Drop and recreate the user_booth_visits policy
DROP POLICY IF EXISTS "Users can read own visits" ON "public"."user_booth_visits";

CREATE POLICY "Users can read own visits" ON "public"."user_booth_visits"
FOR SELECT USING (
  auth.role() = 'service_role' 
  OR auth.role() = 'anon'
  OR auth.uid()::text = (SELECT email FROM users WHERE id = user_id)
  OR user_id IN (
    SELECT id FROM users 
    WHERE email IN ('test1@example.com', 'test2@example.com', 'test3@example.com', 'demo@example.com')
  )
); 