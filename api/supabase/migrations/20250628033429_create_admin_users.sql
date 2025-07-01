-- Create admin_users table for scalable admin management
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_level TEXT NOT NULL CHECK (admin_level IN ('super_admin', 'conference_admin', 'booth_admin')),
  conference_id TEXT DEFAULT 'sssio_usa_2025', -- For future multi-conference support
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id),
  UNIQUE(user_id, conference_id)
);

-- Add RLS policies for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users table
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.conference_id = admin_users.conference_id
    )
  );

-- Only super_admins can insert/update/delete admin_users
CREATE POLICY "Super admins can manage admin_users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.admin_level = 'super_admin'
      AND au.conference_id = admin_users.conference_id
    )
  );

-- Add comment for documentation
COMMENT ON TABLE admin_users IS 'Admin users table for conference management';
COMMENT ON COLUMN admin_users.admin_level IS 'Admin level: super_admin, conference_admin, booth_admin';
COMMENT ON COLUMN admin_users.conference_id IS 'Conference identifier for multi-conference support'; 