-- ============================================================================
-- COMPLETE DealIQ Supabase Migration
-- ============================================================================
-- This adds ALL missing columns to your existing users table
--
-- Go to: https://supabase.com/dashboard/project/yvaujsbktvkzoxfzeimn/sql
-- Paste this entire file and click "Run"
-- ============================================================================

-- Add missing columns one by one (IF NOT EXISTS prevents errors if some exist)

-- DealIQ Usage Tracking columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS dealiq_usage_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dealiq_usage_limit INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dealiq_last_reset_date TIMESTAMP;

-- Subscription columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_stripe_subscription_id VARCHAR(255);

-- Metadata columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================================================
-- Verify all columns were added
-- ============================================================================
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- Expected columns in users table:
-- ============================================================================
-- id                                   | uuid          | uuid_generate_v4()
-- email                                | varchar(255)  |
-- password_hash                        | varchar(255)  |
-- full_name                           | varchar(255)  |
-- subscription_tier                    | varchar(50)   | 'free'
-- subscription_status                  | varchar(50)   | 'active'
-- subscription_stripe_customer_id      | varchar(255)  |
-- subscription_stripe_subscription_id  | varchar(255)  |
-- dealiq_usage_count                   | integer       | 0
-- dealiq_usage_limit                   | integer       | 5
-- dealiq_last_reset_date              | timestamp     |
-- created_at                           | timestamp     | now()
-- updated_at                           | timestamp     | now()
-- last_login                           | timestamp     | now()
-- ============================================================================

-- Create indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(subscription_stripe_customer_id);

-- Add constraint for valid tiers (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_tier'
    ) THEN
        ALTER TABLE users
        ADD CONSTRAINT valid_tier
        CHECK (subscription_tier IN ('free', 'starter', 'pro', 'elite'));
    END IF;
END$$;

-- ============================================================================
-- Success! You should see all columns listed above.
-- ============================================================================

SELECT 'Migration complete! All columns added.' AS status;
