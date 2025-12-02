-- Faceit Support Migration
-- Run this in your Supabase SQL Editor to add Faceit player support

-- 1. Add faceit_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS faceit_id TEXT;

-- 2. Create index for faceit_id lookups
CREATE INDEX IF NOT EXISTS idx_users_faceit_id ON users(faceit_id);

-- 3. Add unique constraint to faceit_id (users can have either Steam ID or Faceit ID or both)
CREATE UNIQUE INDEX IF NOT EXISTS unique_faceit_id ON users(faceit_id) WHERE faceit_id IS NOT NULL;

-- 4. Make steam_id nullable (since Faceit users may not have Steam ID)
ALTER TABLE users ALTER COLUMN steam_id DROP NOT NULL;

-- 5. Add constraint to ensure at least one ID exists
ALTER TABLE users ADD CONSTRAINT users_must_have_id CHECK (
  steam_id IS NOT NULL OR faceit_id IS NOT NULL
);

COMMENT ON COLUMN users.faceit_id IS 'Faceit player ID or nickname - unique identifier from Faceit platform';
