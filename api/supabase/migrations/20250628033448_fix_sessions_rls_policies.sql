-- Fix RLS policies for sessions table to allow admin users to create sessions
-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "public"."sessions";
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON "public"."sessions";

-- Create new policies that allow admin users to manage sessions
CREATE POLICY "Enable insert for admin users" ON "public"."sessions"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN users u ON au.user_id = u.id
            WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

CREATE POLICY "Enable update for admin users" ON "public"."sessions"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN users u ON au.user_id = u.id
            WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

CREATE POLICY "Enable delete for admin users" ON "public"."sessions"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            JOIN users u ON au.user_id = u.id
            WHERE u.email = current_setting('request.jwt.claims', true)::json->>'email'
        )
    );

-- Also add a policy that allows service role to bypass RLS (for admin operations)
CREATE POLICY "Enable all operations for service role" ON "public"."sessions"
    FOR ALL USING (auth.role() = 'service_role'); 