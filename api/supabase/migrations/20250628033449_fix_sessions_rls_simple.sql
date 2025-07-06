-- Simple fix: Allow service role to bypass RLS entirely for sessions table
-- This is the most straightforward solution for admin operations

-- Drop all existing policies on sessions table
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable insert for admin users" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable update for admin users" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable delete for admin users" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable all operations for service role" ON "public"."sessions";

-- Create simple policies that work with service role
CREATE POLICY "Enable read access for all users" ON "public"."sessions"
    FOR SELECT USING (true);

CREATE POLICY "Enable all operations for service role" ON "public"."sessions"
    FOR ALL USING (auth.role() = 'service_role');

-- Also allow authenticated users to read (in case needed)
CREATE POLICY "Enable read for authenticated users" ON "public"."sessions"
    FOR SELECT USING (auth.role() = 'authenticated'); 