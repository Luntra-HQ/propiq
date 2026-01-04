-- ============================================================================
-- Supabase Migration: Add last_login column
-- ============================================================================
-- This migration adds the missing last_login column to the users table
--
-- Run this in Supabase SQL Editor:
-- 1. Go to https://supabase.com/dashboard/project/yvaujsbktvkzoxfzeimn/sql
-- 2. Paste this SQL and click "Run"
-- ============================================================================

-- Add last_login column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT NOW();

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'last_login';
