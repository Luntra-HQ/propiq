-- ============================================================================
-- PropIQ Production Database Index Migration
-- ============================================================================
-- Purpose: Add performance indexes to production Supabase database
-- Expected Impact: 10-100x query speedup for common operations
-- Estimated Runtime: 2-5 minutes (uses CONCURRENTLY to avoid downtime)
-- Version: 3.1.1
-- Date: 2025-11-07

-- ============================================================================
-- IMPORTANT: BEFORE RUNNING THIS SCRIPT
-- ============================================================================
-- 1. Backup your database (Supabase → Database → Backups)
-- 2. Test in staging/test environment first
-- 3. Run during low-traffic period if possible
-- 4. Monitor query performance after applying
-- 5. Use CONCURRENTLY to avoid table locking

-- ============================================================================
-- BASELINE INDEXES (Already exist from setup)
-- ============================================================================
-- These should already exist, but we'll create them if missing

-- Users table - basic indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);

-- Property analyses - basic indexes
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON property_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON property_analyses(created_at DESC);

-- Support chats - basic indexes
CREATE INDEX IF NOT EXISTS idx_chats_conversation_id ON support_chats(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON support_chats(user_id);

-- ============================================================================
-- ADVANCED INDEXES (Performance optimization)
-- ============================================================================

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Composite index for active users by subscription
-- Use case: Filtering active Pro/Elite users
-- Expected speedup: 10-50x for subscription filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_subscription
ON users(is_active, subscription_tier)
WHERE is_active = true;

-- Index for Stripe customer lookups
-- Use case: Webhook processing, payment status checks
-- Expected speedup: 100x (avoids full table scan)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_stripe_customer
ON users(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Index for last login (for inactive user cleanup)
-- Use case: Finding inactive users, account management
-- Expected speedup: 20x
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login
ON users(last_login DESC NULLS LAST);

-- ============================================================================
-- PROPERTY ANALYSES TABLE INDEXES
-- ============================================================================

-- Composite index for user's recent analyses
-- Use case: User dashboard showing recent analyses
-- Expected speedup: 50-100x (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_user_recent
ON property_analyses(user_id, created_at DESC);

-- Index for score-based queries (finding good deals)
-- Use case: "Show me all great deals", analysis quality filtering
-- Expected speedup: 30x
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_score
ON property_analyses(score DESC)
WHERE score IS NOT NULL;

-- Partial index for high-scoring properties
-- Use case: Finding excellent deals (score >= 80)
-- Expected speedup: 100x (highly selective)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_excellent
ON property_analyses(score, created_at DESC)
WHERE score >= 80;

-- GIN index for JSONB analysis_data (for searching within JSON)
-- Use case: Searching for properties by city, type, features in JSON
-- Expected speedup: 50-200x for JSON queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_data_gin
ON property_analyses USING GIN (analysis_data);

-- Address search index (for partial matching)
-- Use case: Searching for analyses by address
-- Expected speedup: 10-30x
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analyses_address
ON property_analyses USING gin(to_tsvector('english', address));

-- ============================================================================
-- SUPPORT CHATS TABLE INDEXES
-- ============================================================================

-- Composite index for conversation messages
-- Use case: Loading conversation history (most common query)
-- Expected speedup: 100x
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_conversation_time
ON support_chats(conversation_id, created_at ASC);

-- Index for finding user's conversations
-- Use case: User's conversation history page
-- Expected speedup: 50x
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_user_recent
ON support_chats(user_id, created_at DESC);

-- Composite index for user + conversation lookups
-- Use case: Verifying conversation ownership
-- Expected speedup: 30x
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_user_conversation
ON support_chats(user_id, conversation_id);

-- ============================================================================
-- VERIFY INDEXES WERE CREATED
-- ============================================================================

-- Show all indexes on our tables
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE tablename IN ('users', 'property_analyses', 'support_chats')
ORDER BY tablename, indexname;

-- ============================================================================
-- CHECK INDEX USAGE (Run after 24 hours)
-- ============================================================================

-- Uncomment and run after 24 hours to verify indexes are being used
/*
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE tablename IN ('users', 'property_analyses', 'support_chats')
ORDER BY idx_scan DESC;

-- Indexes with idx_scan = 0 after 24 hours may not be needed
-- But give it at least a week before considering removal
*/

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- INDEXES ADDED:
-- Users: 3 new indexes (5 total)
--   - idx_users_active_subscription (composite, partial)
--   - idx_users_stripe_customer (partial)
--   - idx_users_last_login
--
-- Property Analyses: 5 new indexes (7 total)
--   - idx_analyses_user_recent (composite)
--   - idx_analyses_score
--   - idx_analyses_excellent (partial)
--   - idx_analyses_data_gin (GIN for JSONB)
--   - idx_analyses_address (full-text search)
--
-- Support Chats: 3 new indexes (5 total)
--   - idx_chats_conversation_time (composite)
--   - idx_chats_user_recent (composite)
--   - idx_chats_user_conversation (composite)
--
-- TOTAL: 11 new performance indexes
-- EXPECTED IMPACT: 10-200x speedup on common queries
-- INDEX SIZE: ~2-10 MB total (minimal overhead)
-- CREATION TIME: 2-5 minutes (CONCURRENTLY = no downtime)

-- ============================================================================
-- MONITORING
-- ============================================================================

-- After running this script:
-- 1. Monitor query performance in Supabase dashboard
-- 2. Check slow query log for improvements
-- 3. Verify cache hit ratio improved (should be >95%)
-- 4. Run index usage query after 24 hours (see above)
-- 5. Consider additional indexes based on slow queries

-- ============================================================================
-- ROLLBACK (If needed)
-- ============================================================================

-- If you need to remove these indexes, uncomment and run:
/*
DROP INDEX CONCURRENTLY IF EXISTS idx_users_active_subscription;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_stripe_customer;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_last_login;
DROP INDEX CONCURRENTLY IF EXISTS idx_analyses_user_recent;
DROP INDEX CONCURRENTLY IF EXISTS idx_analyses_score;
DROP INDEX CONCURRENTLY IF EXISTS idx_analyses_excellent;
DROP INDEX CONCURRENTLY IF EXISTS idx_analyses_data_gin;
DROP INDEX CONCURRENTLY IF EXISTS idx_analyses_address;
DROP INDEX CONCURRENTLY IF EXISTS idx_chats_conversation_time;
DROP INDEX CONCURRENTLY IF EXISTS idx_chats_user_recent;
DROP INDEX CONCURRENTLY IF EXISTS idx_chats_user_conversation;
*/

-- ============================================================================
-- DONE!
-- ============================================================================
