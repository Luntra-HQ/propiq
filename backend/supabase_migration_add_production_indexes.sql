-- ============================================================================
-- PropIQ Production Database Indexes - Sprint 1
-- ============================================================================
-- Purpose: Add performance indexes for production readiness
-- Expected Impact: 10-100x query speedup for common operations
-- Runtime: 2-5 minutes (uses CONCURRENTLY to avoid downtime)
-- Version: 3.2.0
-- Date: November 10, 2025
-- Sprint: Sprint 1 - Story 1.4
--
-- IMPORTANT: This script is safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================================

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Index for Stripe customer lookups (webhook processing)
-- Use case: Finding user by Stripe customer ID during webhook processing
-- Expected speedup: 100x (avoids full table scan)
-- Critical for: Payment webhooks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_stripe_customer_lookup
ON users(subscription_stripe_customer_id)
WHERE subscription_stripe_customer_id IS NOT NULL;

-- Index for Stripe subscription lookups
-- Use case: Finding user by subscription ID for status updates
-- Expected speedup: 100x
-- Critical for: Subscription management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_stripe_subscription_lookup
ON users(subscription_stripe_subscription_id)
WHERE subscription_stripe_subscription_id IS NOT NULL;

-- Index for active paying subscribers
-- Use case: Revenue reports, active user counts by tier
-- Expected speedup: 20-50x
-- Critical for: Analytics, admin dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_paying_subscribers
ON users(subscription_tier, subscription_status, created_at DESC)
WHERE subscription_tier != 'free' AND subscription_status = 'active';

-- Index for last login (inactive user cleanup)
-- Use case: Finding inactive users, engagement metrics
-- Expected speedup: 20x
-- Critical for: User engagement analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login
ON users(last_login DESC NULLS LAST);

-- Composite index for usage tracking queries
-- Use case: Finding users near their usage limits
-- Expected speedup: 30x
-- Critical for: Usage alerts, upsell opportunities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_usage_tracking
ON users(propiq_usage_count, propiq_usage_limit, subscription_tier)
WHERE propiq_usage_count IS NOT NULL;

-- ============================================================================
-- PROPERTY ANALYSES TABLE INDEXES
-- ============================================================================

-- Composite index for user's recent analyses (MOST IMPORTANT)
-- Use case: User dashboard showing analysis history
-- Expected speedup: 50-100x (most common query)
-- Critical for: User dashboard performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_analyses_user_recent
ON property_analyses(user_id, created_at DESC);

-- GIN index for searching within JSONB analysis data
-- Use case: Searching for properties by city, type, features
-- Expected speedup: 50-200x for JSON queries
-- Critical for: Advanced search, filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_analyses_data_gin
ON property_analyses USING GIN (analysis_result);

-- Full-text search index for addresses
-- Use case: Searching for analyses by address (partial matching)
-- Expected speedup: 10-30x
-- Critical for: Address autocomplete, search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_analyses_address_search
ON property_analyses USING gin(to_tsvector('english', address));

-- Index for recent analyses across all users
-- Use case: Admin dashboard, platform-wide analytics
-- Expected speedup: 10x
-- Critical for: Admin tools, reporting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_analyses_recent_all
ON property_analyses(created_at DESC);

-- ============================================================================
-- SUPPORT CHATS TABLE INDEXES
-- ============================================================================

-- Composite index for conversation messages (MOST IMPORTANT)
-- Use case: Loading conversation history
-- Expected speedup: 100x (most common support chat query)
-- Critical for: Support chat performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_chats_conversation_messages
ON support_chats(conversation_id, created_at ASC);

-- Composite index for user's conversation history
-- Use case: User's support history page
-- Expected speedup: 50x
-- Critical for: Support history, user context
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_chats_user_history
ON support_chats(user_id, created_at DESC);

-- Composite index for user + conversation ownership verification
-- Use case: Verifying user can access conversation
-- Expected speedup: 30x
-- Critical for: Security, access control
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_chats_user_conversation
ON support_chats(user_id, conversation_id);

-- Index for finding conversations by role
-- Use case: Admin viewing all assistant responses, quality checks
-- Expected speedup: 20x
-- Critical for: Support quality monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_chats_role
ON support_chats(role, created_at DESC);

-- ============================================================================
-- ONBOARDING STATUS TABLE INDEXES
-- ============================================================================

-- Index for email lookup
-- Use case: Finding user's onboarding status by email
-- Expected speedup: 100x
-- Critical for: Email scheduler queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onboarding_status_email
ON onboarding_status(user_email);

-- Index for finding scheduled emails (CRITICAL for scheduler)
-- Use case: Email scheduler finding emails to send
-- Expected speedup: 50-100x
-- Critical for: Onboarding email automation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onboarding_status_scheduled
ON onboarding_status USING GIN (emails_scheduled)
WHERE emails_scheduled != '[]'::jsonb;

-- Index for campaign tracking
-- Use case: Finding recent onboarding campaigns, monitoring
-- Expected speedup: 20x
-- Critical for: Onboarding analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onboarding_status_campaign
ON onboarding_status(campaign_started_at DESC);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show all indexes on our tables
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE tablename IN ('users', 'property_analyses', 'support_chats', 'onboarding_status')
ORDER BY tablename, indexname;

-- Count indexes per table
SELECT
    tablename,
    COUNT(*) as index_count
FROM pg_stat_user_indexes
WHERE tablename IN ('users', 'property_analyses', 'support_chats', 'onboarding_status')
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- INDEX USAGE MONITORING (Run after 24-48 hours)
-- ============================================================================

-- Check which indexes are being used
-- Run this query after 24-48 hours to verify indexes are helping
/*
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    CASE
        WHEN idx_scan = 0 THEN '❌ Never used'
        WHEN idx_scan < 100 THEN '⚠️ Rarely used'
        WHEN idx_scan < 1000 THEN '✅ Used regularly'
        ELSE '✅✅ Heavily used'
    END as usage_status
FROM pg_stat_user_indexes
WHERE tablename IN ('users', 'property_analyses', 'support_chats', 'onboarding_status')
ORDER BY idx_scan DESC;
*/

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- INDEXES ADDED:
-- Users: 5 new indexes
--   - Stripe customer lookup (critical for webhooks)
--   - Stripe subscription lookup
--   - Paying subscribers index
--   - Last login tracking
--   - Usage tracking
--
-- Property Analyses: 4 new indexes
--   - User's recent analyses (most important)
--   - JSONB data search (GIN)
--   - Address full-text search
--   - Recent analyses (all users)
--
-- Support Chats: 4 new indexes
--   - Conversation messages (most important)
--   - User history
--   - User + conversation composite
--   - Role-based queries
--
-- Onboarding Status: 3 new indexes
--   - Email lookup
--   - Scheduled emails (GIN, critical for scheduler)
--   - Campaign tracking
--
-- TOTAL: 16 new performance indexes
-- EXPECTED IMPACT: 10-200x speedup on common queries
-- INDEX SIZE: ~5-15 MB total (minimal overhead)
-- CREATION TIME: 2-5 minutes (CONCURRENTLY = no downtime)
--
-- CRITICAL INDEXES FOR SPRINT 1:
-- ✅ idx_users_stripe_customer_lookup (webhook processing)
-- ✅ idx_users_stripe_subscription_lookup (subscription management)
-- ✅ idx_property_analyses_user_recent (dashboard performance)
-- ✅ idx_support_chats_conversation_messages (chat performance)
-- ✅ idx_onboarding_status_scheduled (email automation)

-- ============================================================================
-- ROLLBACK (If needed)
-- ============================================================================

-- If you need to remove these indexes, uncomment and run:
/*
-- Users table indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_users_stripe_customer_lookup;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_stripe_subscription_lookup;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_paying_subscribers;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_last_login;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_usage_tracking;

-- Property analyses indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_property_analyses_user_recent;
DROP INDEX CONCURRENTLY IF EXISTS idx_property_analyses_data_gin;
DROP INDEX CONCURRENTLY IF EXISTS idx_property_analyses_address_search;
DROP INDEX CONCURRENTLY IF EXISTS idx_property_analyses_recent_all;

-- Support chats indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_support_chats_conversation_messages;
DROP INDEX CONCURRENTLY IF EXISTS idx_support_chats_user_history;
DROP INDEX CONCURRENTLY IF EXISTS idx_support_chats_user_conversation;
DROP INDEX CONCURRENTLY IF EXISTS idx_support_chats_role;

-- Onboarding status indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_onboarding_status_email;
DROP INDEX CONCURRENTLY IF EXISTS idx_onboarding_status_scheduled;
DROP INDEX CONCURRENTLY IF EXISTS idx_onboarding_status_campaign;
*/

-- ============================================================================
-- DONE!
-- ============================================================================
-- All indexes created. Monitor query performance for 24-48 hours.
-- Run the usage monitoring query above to verify indexes are being used.
-- Add this to your monitoring dashboard:
--   - Query performance (p95 latency)
--   - Index usage stats
--   - Table sizes
-- ============================================================================
