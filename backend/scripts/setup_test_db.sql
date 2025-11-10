-- ============================================================================
-- PropIQ Test Database Setup Script
-- ============================================================================
-- Run this in your Supabase test project SQL editor
-- Dashboard → SQL Editor → New Query → Paste this script → Run

-- ============================================================================
-- STEP 1: Enable Required Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 2: Create Tables
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(200),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    analyses_used INT DEFAULT 0,
    analyses_limit INT DEFAULT 3,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Property analyses table
CREATE TABLE IF NOT EXISTS property_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(500) NOT NULL,
    analysis_data JSONB NOT NULL,
    score INT,
    rating VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    wandb_run_id VARCHAR(255)
);

-- Support chats table
CREATE TABLE IF NOT EXISTS support_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    message TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Create Indexes for Performance
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);

-- Property analyses indexes
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON property_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON property_analyses(created_at DESC);

-- Support chats indexes
CREATE INDEX IF NOT EXISTS idx_chats_conversation_id ON support_chats(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON support_chats(user_id);

-- ============================================================================
-- STEP 4: Configure Row Level Security (RLS)
-- ============================================================================
-- For test database, disable RLS to simplify testing
-- (In production, you'd want proper RLS policies)

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_chats DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Verify Setup
-- ============================================================================

-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'property_analyses', 'support_chats');

-- Check indexes exist
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'property_analyses', 'support_chats');

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Your test database is now ready for integration tests.
-- Next steps:
-- 1. Update backend/.env.test with your Supabase test project credentials
-- 2. Run: python tests/fixtures/seed_test_db.py seed
-- 3. Run: pytest tests/integration/ -v
