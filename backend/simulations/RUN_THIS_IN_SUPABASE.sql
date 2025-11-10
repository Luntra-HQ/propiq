-- ============================================================================
-- CRITICAL: Run this SQL in Supabase SQL Editor
-- ============================================================================
-- Go to: https://supabase.com/dashboard/project/yvaujsbktvkzoxfzeimn/sql
-- Paste this entire file and click "Run"
-- ============================================================================

-- Add last_login column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT NOW();

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'last_login';

-- Expected result: Should show last_login column

-- ============================================================================
-- You should see output like:
-- column_name  | data_type                   | column_default
-- -------------+-----------------------------+---------------
-- last_login   | timestamp without time zone | now()
-- ============================================================================
