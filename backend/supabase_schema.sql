-- ============================================================================
-- DealIQ Database Schema for Supabase PostgreSQL
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),

    -- Subscription Info
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_stripe_customer_id VARCHAR(255),
    subscription_stripe_subscription_id VARCHAR(255),

    -- PropIQ Usage Tracking
    propiq_usage_count INTEGER DEFAULT 0,
    propiq_usage_limit INTEGER DEFAULT 5,
    propiq_last_reset_date TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP DEFAULT NOW(),

    -- Indexes for performance
    CONSTRAINT valid_tier CHECK (subscription_tier IN ('free', 'starter', 'pro', 'elite'))
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(subscription_stripe_customer_id);

-- ============================================================================
-- PROPERTY ANALYSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Property Info
    address TEXT NOT NULL,

    -- Analysis Data (stored as JSONB for flexibility)
    analysis_result JSONB NOT NULL,

    -- Tracking
    wandb_run_id VARCHAR(255),

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),

    -- Indexes for performance
    INDEX idx_analyses_user (user_id),
    INDEX idx_analyses_created (created_at DESC)
);

-- Index for user's analysis history
CREATE INDEX IF NOT EXISTS idx_property_analyses_user_created ON property_analyses(user_id, created_at DESC);

-- ============================================================================
-- SUPPORT CHATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) NOT NULL,

    -- Message Data
    message TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,  -- 'user' or 'assistant'
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),

    -- Indexes for performance
    CONSTRAINT valid_role CHECK (role IN ('user', 'assistant'))
);

-- Index for conversation history
CREATE INDEX IF NOT EXISTS idx_support_chats_conversation ON support_chats(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_support_chats_user ON support_chats(user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to increment PropIQ usage count
CREATE OR REPLACE FUNCTION increment_propiq_usage(user_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE users
    SET propiq_usage_count = propiq_usage_count + 1,
        updated_at = NOW()
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage (call via cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE users
    SET propiq_usage_count = 0,
        propiq_last_reset_date = NOW(),
        updated_at = NOW()
    WHERE propiq_last_reset_date IS NULL
       OR propiq_last_reset_date < DATE_TRUNC('month', NOW');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy: Users can view their own analyses
CREATE POLICY "Users can view own analyses" ON property_analyses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create their own analyses
CREATE POLICY "Users can create own analyses" ON property_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own support chats
CREATE POLICY "Users can view own chats" ON support_chats
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create their own support chats
CREATE POLICY "Users can create own chats" ON support_chats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- You can add test users here if needed
-- INSERT INTO users (email, password_hash, full_name) VALUES (...);

-- ============================================================================
-- COMPLETED!
-- ============================================================================

-- Verify tables were created
SELECT
    tablename,
    schemaname
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'property_analyses', 'support_chats');
