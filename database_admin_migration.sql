-- Admin Role Migration
-- Run this in your Supabase SQL Editor

-- 1. Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- 2. Make specific user (Faps) an admin
-- Update by username
UPDATE users SET is_admin = true WHERE username = 'Faps';

-- If that doesn't work, you can also update by steam_id
-- Find your Steam ID from your profile URL and uncomment the line below:
-- UPDATE users SET is_admin = true WHERE steam_id = 'YOUR_STEAM_ID_HERE';

-- 3. Verify admin users
SELECT id, steam_id, username, is_admin, created_at
FROM users
WHERE is_admin = true;

-- This should show your account with is_admin = true
