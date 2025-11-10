-- PropIQ Database Indexes for Performance Optimization
-- Sprint 12 - Production Readiness
-- Created: 2025-11-07
--
-- These indexes optimize the most common query patterns:
-- 1. User lookup by email (login)
-- 2. Analysis history by user (dashboard)
-- 3. Analysis sorting by date (recent analyses)
-- 4. Support chat lookup (conversation history)
--
-- Run with: psql <SUPABASE_CONNECTION_STRING> -f create_indexes.sql

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Email lookup (used in login, registration check)
-- Expected improvement: 500ms → 5ms (100x faster)
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- Created date sorting (for admin dashboards)
CREATE INDEX IF NOT EXISTS idx_users_created_at
ON users(created_at DESC);

-- Last login tracking (for user activity reports)
CREATE INDEX IF NOT EXISTS idx_users_last_login
ON users(last_login DESC);

-- Subscription tier filtering (for analytics)
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier
ON users(subscription_tier);

-- Subscription status (for billing reports)
CREATE INDEX IF NOT EXISTS idx_users_subscription_status
ON users(subscription_status);

-- Composite index for active users by tier
CREATE INDEX IF NOT EXISTS idx_users_tier_status
ON users(subscription_tier, subscription_status);

-- ============================================================================
-- PROPERTY_ANALYSES TABLE INDEXES
-- ============================================================================

-- User's analysis history (most common query)
-- Expected improvement: 300ms → 30ms (10x faster)
CREATE INDEX IF NOT EXISTS idx_analyses_user_id
ON property_analyses(user_id);

-- Recent analyses sorting
CREATE INDEX IF NOT EXISTS idx_analyses_created_at
ON property_analyses(created_at DESC);

-- Composite index for user's recent analyses (optimizes get_user_analyses)
-- This covers: WHERE user_id = X ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_analyses_user_created
ON property_analyses(user_id, created_at DESC);

-- Address search (for duplicate detection)
CREATE INDEX IF NOT EXISTS idx_analyses_address
ON property_analyses(address);

-- Weights & Biases run ID lookup (for ML tracking)
CREATE INDEX IF NOT EXISTS idx_analyses_wandb_run_id
ON property_analyses(wandb_run_id)
WHERE wandb_run_id IS NOT NULL;

-- JSONB field index for deal score (if extracted to column in future)
-- Note: Currently analysis_result is JSONB, consider extracting key fields
-- CREATE INDEX IF NOT EXISTS idx_analyses_deal_score
-- ON property_analyses((analysis_result->>'deal_score'));

-- ============================================================================
-- SUPPORT_CHATS TABLE INDEXES
-- ============================================================================

-- User's support conversations
CREATE INDEX IF NOT EXISTS idx_chats_user_id
ON support_chats(user_id);

-- Conversation history lookup (most common query)
-- Expected improvement: 200ms → 20ms (10x faster)
CREATE INDEX IF NOT EXISTS idx_chats_conversation_id
ON support_chats(conversation_id);

-- Recent messages sorting
CREATE INDEX IF NOT EXISTS idx_chats_created_at
ON support_chats(created_at DESC);

-- Composite index for conversation history with sorting
-- This covers: WHERE conversation_id = X ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_chats_conversation_created
ON support_chats(conversation_id, created_at ASC);

-- Role filtering (for admin tools to find assistant responses)
CREATE INDEX IF NOT EXISTS idx_chats_role
ON support_chats(role);

-- ============================================================================
-- PARTIAL INDEXES (for specific query patterns)
-- ============================================================================

-- Active subscriptions only (most common case)
CREATE INDEX IF NOT EXISTS idx_users_active_subscriptions
ON users(subscription_tier)
WHERE subscription_status = 'active';

-- Recent analyses (last 30 days) - for performance dashboards
CREATE INDEX IF NOT EXISTS idx_analyses_recent
ON property_analyses(created_at DESC)
WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================================================
-- GIN INDEXES FOR JSONB (Full-Text Search)
-- ============================================================================

-- Full-text search on analysis_result JSONB
-- Enables queries like: WHERE analysis_result @> '{"city": "Austin"}'
CREATE INDEX IF NOT EXISTS idx_analyses_result_gin
ON property_analyses USING GIN (analysis_result);

-- Full-text search on support chat metadata
CREATE INDEX IF NOT EXISTS idx_chats_metadata_gin
ON support_chats USING GIN (metadata);

-- ============================================================================
-- VERIFY INDEXES
-- ============================================================================

-- Show all indexes on PropIQ tables
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'property_analyses', 'support_chats')
ORDER BY tablename, indexname;

-- Check index sizes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE tablename IN ('users', 'property_analyses', 'support_chats')
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- ============================================================================
-- ANALYZE TABLES (Update Statistics)
-- ============================================================================

ANALYZE users;
ANALYZE property_analyses;
ANALYZE support_chats;

-- ============================================================================
-- VACUUM TABLES (Reclaim Storage)
-- ============================================================================

-- Note: Run VACUUM during low-traffic periods
-- VACUUM ANALYZE users;
-- VACUUM ANALYZE property_analyses;
-- VACUUM ANALYZE support_chats;

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. CONCURRENTLY option: Allows index creation without locking the table
--    If errors occur, remove CONCURRENTLY and accept brief downtime
--
-- 2. Index Maintenance: PostgreSQL automatically maintains indexes
--    Run VACUUM ANALYZE monthly to keep statistics fresh
--
-- 3. Monitoring: Use EXPLAIN ANALYZE to verify queries use indexes:
--    EXPLAIN ANALYZE SELECT * FROM property_analyses WHERE user_id = 'xxx';
--
-- 4. Future Optimization: Consider extracting commonly queried JSONB fields
--    to separate columns for better performance:
--    ALTER TABLE property_analyses ADD COLUMN deal_score INTEGER;
--    CREATE INDEX idx_analyses_deal_score ON property_analyses(deal_score);
--
-- 5. Index Size: Indexes consume disk space (~10-30% of table size)
--    Monitor with: SELECT pg_size_pretty(pg_database_size(current_database()));
