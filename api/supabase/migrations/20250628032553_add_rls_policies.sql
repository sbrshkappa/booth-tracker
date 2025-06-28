-- Add RLS policies for users table
-- Allow anyone to insert (register) new users
CREATE POLICY "Allow user registration" ON "public"."users"
FOR INSERT WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON "public"."users"
FOR SELECT USING (auth.uid()::text = email OR auth.role() = 'service_role');

-- Allow service role to read all users (for admin functions)
CREATE POLICY "Service role can read all users" ON "public"."users"
FOR SELECT USING (auth.role() = 'service_role');

-- Add RLS policies for booths table
-- Allow anyone to read booth information
CREATE POLICY "Anyone can read booths" ON "public"."booths"
FOR SELECT USING (true);

-- Allow service role to manage booths
CREATE POLICY "Service role can manage booths" ON "public"."booths"
FOR ALL USING (auth.role() = 'service_role');

-- Add RLS policies for user_booth_visits table
-- Allow users to insert their own visits
CREATE POLICY "Users can insert own visits" ON "public"."user_booth_visits"
FOR INSERT WITH CHECK (auth.uid()::text = (SELECT email FROM users WHERE id = user_id));

-- Allow users to read their own visits
CREATE POLICY "Users can read own visits" ON "public"."user_booth_visits"
FOR SELECT USING (auth.uid()::text = (SELECT email FROM users WHERE id = user_id));

-- Allow service role to read all visits
CREATE POLICY "Service role can read all visits" ON "public"."user_booth_visits"
FOR SELECT USING (auth.role() = 'service_role');
