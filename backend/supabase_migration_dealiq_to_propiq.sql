-- ============================================================================
-- Migration: Rename DealIQ to PropIQ (Product Rebrand)
-- Date: November 10, 2025
-- ============================================================================
-- This migration renames all "dealiq" references to "propiq" in the database
-- to match the code which was already updated during the rebrand.
--
-- IMPORTANT: Run this in production ASAP - the app is currently broken!
-- ============================================================================

-- Step 1: Rename columns in users table
ALTER TABLE users
  RENAME COLUMN dealiq_usage_count TO propiq_usage_count;

ALTER TABLE users
  RENAME COLUMN dealiq_usage_limit TO propiq_usage_limit;

ALTER TABLE users
  RENAME COLUMN dealiq_last_reset_date TO propiq_last_reset_date;

-- Step 2: Drop old functions
DROP FUNCTION IF EXISTS increment_dealiq_usage(UUID);

-- Step 3: Create new function with correct name
CREATE OR REPLACE FUNCTION increment_propiq_usage(user_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE users
    SET propiq_usage_count = propiq_usage_count + 1,
        updated_at = NOW()
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Update reset_monthly_usage function to use new column names
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE users
    SET propiq_usage_count = 0,
        propiq_last_reset_date = NOW(),
        updated_at = NOW()
    WHERE propiq_last_reset_date IS NULL
       OR propiq_last_reset_date < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check that columns were renamed
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name LIKE '%propiq%'
ORDER BY column_name;

-- Check that functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('increment_propiq_usage', 'reset_monthly_usage')
  AND routine_schema = 'public';

-- Sample query to verify data is intact
SELECT
    id,
    email,
    propiq_usage_count,
    propiq_usage_limit,
    propiq_last_reset_date
FROM users
LIMIT 5;

-- ============================================================================
-- Expected Results:
-- ============================================================================
-- Columns renamed:
--   - propiq_usage_count (integer)
--   - propiq_usage_limit (integer)
--   - propiq_last_reset_date (timestamp)
--
-- Functions created:
--   - increment_propiq_usage (function)
--   - reset_monthly_usage (function)
-- ============================================================================

-- NOTE: After running this migration, update supabase_schema.sql to reflect
-- the new column names so future database setups use the correct names.
