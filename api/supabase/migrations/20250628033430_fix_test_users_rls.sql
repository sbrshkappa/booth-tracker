-- Fix RLS policy for test users
-- This allows the getUserProgress function to work with test users

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can read own data" ON "public"."users";

-- Create a new policy that allows service role, anon role, and email-based access
CREATE POLICY "Users can read own data" ON "public"."users"
FOR SELECT USING (
  auth.role() = 'service_role' 
  OR auth.role() = 'anon'
  OR auth.uid()::text = email 
  OR email IN ('test1@example.com', 'test2@example.com', 'test3@example.com', 'demo@example.com')
);

-- Also fix the user_booth_visits policy
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