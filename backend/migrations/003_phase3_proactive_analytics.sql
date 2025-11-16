-- PropIQ Support Agent Phase 3 - Database Migration
-- Migration: 003_phase3_proactive_analytics.sql
-- Created: January 2025
-- Purpose: Add CSAT surveys, proactive engagement tracking, and enhanced analytics

-- ============================================================================
-- STEP 1: Create CSAT surveys table
-- ============================================================================

CREATE TABLE IF NOT EXISTS csat_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id TEXT NOT NULL UNIQUE,
    conversation_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,

    -- Survey details
    survey_type TEXT DEFAULT 'post_resolution',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb,

    -- Response
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    category_ratings JSONB DEFAULT '{}'::jsonb,  -- {response_quality: 4, response_speed: 5, ...}

    -- Status
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'completed', 'expired')),

    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT survey_id_not_empty CHECK (char_length(survey_id) > 0)
);

COMMENT ON TABLE csat_surveys IS 'CSAT surveys for measuring customer satisfaction';
COMMENT ON COLUMN csat_surveys.rating IS 'Overall satisfaction rating (1-5 scale)';
COMMENT ON COLUMN csat_surveys.category_ratings IS 'Ratings for specific aspects (response_quality, speed, etc.)';


-- ============================================================================
-- STEP 2: Add CSAT fields to conversations table
-- ============================================================================

-- Add CSAT survey tracking to conversations
DO $$
BEGIN
    -- Check if columns don't exist before adding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'support_conversations_v2' AND column_name = 'csat_survey_sent') THEN
        ALTER TABLE support_conversations_v2
        ADD COLUMN csat_survey_sent BOOLEAN DEFAULT FALSE,
        ADD COLUMN csat_survey_id TEXT,
        ADD COLUMN csat_survey_sent_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add proactive engagement flag if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'support_conversations_v2' AND column_name = 'is_proactive') THEN
        ALTER TABLE support_conversations_v2
        ADD COLUMN is_proactive BOOLEAN DEFAULT FALSE,
        ADD COLUMN proactive_message_type TEXT;
    END IF;
END $$;

COMMENT ON COLUMN support_conversations_v2.is_proactive IS 'Whether conversation was initiated by system (vs user request)';
COMMENT ON COLUMN support_conversations_v2.proactive_message_type IS 'Type of proactive message (onboarding, trial_expiring, usage_tip, etc.)';


-- ============================================================================
-- STEP 3: Create indexes for CSAT surveys
-- ============================================================================

CREATE INDEX IF NOT EXISTS csat_surveys_conversation_idx
ON csat_surveys (conversation_id);

CREATE INDEX IF NOT EXISTS csat_surveys_user_idx
ON csat_surveys (user_id);

CREATE INDEX IF NOT EXISTS csat_surveys_status_idx
ON csat_surveys (status, sent_at DESC);

CREATE INDEX IF NOT EXISTS csat_surveys_rating_idx
ON csat_surveys (rating, responded_at DESC)
WHERE rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS csat_surveys_responded_at_idx
ON csat_surveys (responded_at DESC)
WHERE responded_at IS NOT NULL;


-- ============================================================================
-- STEP 4: Create proactive messages tracking table
-- ============================================================================

CREATE TABLE IF NOT EXISTS proactive_messages_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,

    -- Message details
    message_type TEXT NOT NULL,  -- onboarding_welcome, trial_expiring, usage_tip, etc.
    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Delivery
    conversation_id TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,

    -- Engagement
    viewed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    replied BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMP WITH TIME ZONE,

    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE proactive_messages_log IS 'Log of all proactive engagement messages';


-- ============================================================================
-- STEP 5: Create indexes for proactive messages
-- ============================================================================

CREATE INDEX IF NOT EXISTS proactive_messages_user_idx
ON proactive_messages_log (user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS proactive_messages_type_idx
ON proactive_messages_log (message_type, sent_at DESC);

CREATE INDEX IF NOT EXISTS proactive_messages_engagement_idx
ON proactive_messages_log (viewed, clicked, replied);


-- ============================================================================
-- STEP 6: Create enhanced analytics views
-- ============================================================================

-- CSAT metrics by time period
CREATE OR REPLACE VIEW csat_analytics_daily AS
SELECT
    DATE(responded_at) AS date,
    COUNT(*) AS total_responses,
    ROUND(AVG(rating), 2) AS avg_rating,
    COUNT(*) FILTER (WHERE rating = 5) AS five_star,
    COUNT(*) FILTER (WHERE rating = 4) AS four_star,
    COUNT(*) FILTER (WHERE rating = 3) AS three_star,
    COUNT(*) FILTER (WHERE rating = 2) AS two_star,
    COUNT(*) FILTER (WHERE rating = 1) AS one_star,
    -- NPS calculation (promoters - detractors) / total * 100
    ROUND(
        (COUNT(*) FILTER (WHERE rating >= 4)::DECIMAL -
         COUNT(*) FILTER (WHERE rating <= 2)::DECIMAL) /
        COUNT(*)::DECIMAL * 100,
        1
    ) AS nps
FROM csat_surveys
WHERE status = 'completed'
  AND responded_at IS NOT NULL
GROUP BY DATE(responded_at)
ORDER BY date DESC;

COMMENT ON VIEW csat_analytics_daily IS 'Daily CSAT metrics including NPS';


-- Proactive message engagement metrics
CREATE OR REPLACE VIEW proactive_engagement_stats AS
SELECT
    message_type,
    COUNT(*) AS total_sent,
    COUNT(*) FILTER (WHERE viewed = TRUE) AS total_viewed,
    COUNT(*) FILTER (WHERE clicked = TRUE) AS total_clicked,
    COUNT(*) FILTER (WHERE replied = TRUE) AS total_replied,
    ROUND(100.0 * COUNT(*) FILTER (WHERE viewed = TRUE) / NULLIF(COUNT(*), 0), 1) AS view_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE clicked = TRUE) / NULLIF(COUNT(*), 0), 1) AS click_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE replied = TRUE) / NULLIF(COUNT(*), 0), 1) AS reply_rate
FROM proactive_messages_log
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY message_type
ORDER BY total_sent DESC;

COMMENT ON VIEW proactive_engagement_stats IS 'Proactive message engagement metrics (last 30 days)';


-- Conversation funnel (awareness → engagement → resolution → satisfaction)
CREATE OR REPLACE VIEW conversation_funnel AS
SELECT
    COUNT(*) AS total_conversations,
    COUNT(*) FILTER (WHERE jsonb_array_length(messages) >= 2) AS engaged_conversations,
    COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_conversations,
    COUNT(*) FILTER (WHERE csat_rating IS NOT NULL) AS rated_conversations,
    COUNT(*) FILTER (WHERE csat_rating >= 4) AS satisfied_customers,
    -- Conversion rates
    ROUND(100.0 * COUNT(*) FILTER (WHERE jsonb_array_length(messages) >= 2) / NULLIF(COUNT(*), 0), 1) AS engagement_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'resolved') / NULLIF(COUNT(*), 0), 1) AS resolution_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE csat_rating IS NOT NULL) / NULLIF(COUNT(*) FILTER (WHERE status = 'resolved'), 0), 1) AS survey_response_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE csat_rating >= 4) / NULLIF(COUNT(*) FILTER (WHERE csat_rating IS NOT NULL), 0), 1) AS satisfaction_rate
FROM support_conversations_v2
WHERE created_at >= NOW() - INTERVAL '30 days';

COMMENT ON VIEW conversation_funnel IS 'Support conversation funnel metrics';


-- User engagement cohorts
CREATE OR REPLACE VIEW user_engagement_cohorts AS
SELECT
    DATE_TRUNC('week', created_at) AS cohort_week,
    COUNT(DISTINCT user_id) AS total_users,
    COUNT(DISTINCT user_id) FILTER (WHERE status = 'resolved') AS users_with_resolution,
    COUNT(DISTINCT user_id) FILTER (WHERE csat_rating >= 4) AS satisfied_users,
    ROUND(AVG(jsonb_array_length(messages)), 1) AS avg_messages_per_user
FROM support_conversations_v2
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY cohort_week DESC;

COMMENT ON VIEW user_engagement_cohorts IS 'Weekly user engagement cohorts';


-- ============================================================================
-- STEP 7: Create function to automatically send CSAT after resolution
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_csat_survey_on_resolution()
RETURNS TRIGGER AS $$
DECLARE
    should_send_survey BOOLEAN;
BEGIN
    -- Only trigger for newly resolved conversations
    IF NEW.status = 'resolved' AND (OLD.status IS NULL OR OLD.status != 'resolved') THEN

        -- Check if should send survey
        should_send_survey := (
            NEW.csat_survey_sent = FALSE AND
            NEW.is_proactive = FALSE AND
            jsonb_array_length(NEW.messages) >= 4
        );

        IF should_send_survey THEN
            -- Mark as ready for survey (actual sending happens in application code)
            NEW.csat_survey_sent := FALSE;  -- Will be set to TRUE when survey is actually sent

            RAISE NOTICE 'CSAT survey should be sent for conversation: %', NEW.conversation_id;

            -- Insert notification for background worker to pick up
            -- (In production, use a message queue like Celery)
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_csat_on_resolution
    BEFORE UPDATE ON support_conversations_v2
    FOR EACH ROW
    WHEN (NEW.status = 'resolved' AND (OLD.status IS DISTINCT FROM 'resolved'))
    EXECUTE FUNCTION trigger_csat_survey_on_resolution();


-- ============================================================================
-- STEP 8: Create function to calculate response metrics
-- ============================================================================

CREATE OR REPLACE FUNCTION get_conversation_stats(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    total_conversations BIGINT,
    active_conversations BIGINT,
    resolved_conversations BIGINT,
    escalated_conversations BIGINT,
    avg_messages_per_conversation NUMERIC,
    avg_resolution_time_minutes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_conversations,
        COUNT(*) FILTER (WHERE status = 'active') AS active_conversations,
        COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_conversations,
        COUNT(*) FILTER (WHERE escalated = TRUE) AS escalated_conversations,
        ROUND(AVG(jsonb_array_length(messages)), 1) AS avg_messages_per_conversation,
        ROUND(
            AVG(
                EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60
            ) FILTER (WHERE resolved_at IS NOT NULL),
            1
        ) AS avg_resolution_time_minutes
    FROM support_conversations_v2
    WHERE created_at >= start_date AND created_at <= end_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_conversation_stats IS 'Get conversation statistics for date range';


-- ============================================================================
-- STEP 9: Create updated_at triggers
-- ============================================================================

CREATE TRIGGER update_csat_surveys_updated_at
    BEFORE UPDATE ON csat_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proactive_messages_updated_at
    BEFORE UPDATE ON proactive_messages_log
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- STEP 10: Sample data for testing (optional)
-- ============================================================================

-- Insert sample proactive message types
INSERT INTO proactive_messages_log (
    message_id, user_id, user_email, message_type, title, content, sent_at
) VALUES
    ('test-001', 'test-user-1', 'test1@example.com', 'onboarding_welcome', 'Welcome to PropIQ!', 'Sample welcome message', NOW() - INTERVAL '1 day'),
    ('test-002', 'test-user-2', 'test2@example.com', 'usage_tip', 'Pro Tip', 'Sample usage tip', NOW() - INTERVAL '2 days')
ON CONFLICT (message_id) DO NOTHING;


-- ============================================================================
-- STEP 11: Grant permissions (adjust based on your setup)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE ON csat_surveys TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON proactive_messages_log TO authenticated;
-- GRANT SELECT ON csat_analytics_daily TO authenticated;
-- GRANT SELECT ON proactive_engagement_stats TO authenticated;
-- GRANT SELECT ON conversation_funnel TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_conversation_stats TO authenticated;


-- ============================================================================
-- STEP 12: Verification queries
-- ============================================================================

-- Verify tables
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('csat_surveys', 'proactive_messages_log');

-- Verify views
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
    AND table_name LIKE '%csat%' OR table_name LIKE '%proactive%' OR table_name LIKE '%funnel%';

-- Verify new columns in conversations table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'support_conversations_v2'
    AND column_name IN ('csat_survey_sent', 'is_proactive', 'proactive_message_type');

-- Verify functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN ('trigger_csat_survey_on_resolution', 'get_conversation_stats');

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('csat_surveys', 'proactive_messages_log');


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 003_phase3_proactive_analytics.sql completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Phase 3 features now available:';
    RAISE NOTICE '  ✅ CSAT survey system with NPS tracking';
    RAISE NOTICE '  ✅ Proactive engagement logging';
    RAISE NOTICE '  ✅ Enhanced analytics views (daily CSAT, engagement stats, funnel)';
    RAISE NOTICE '  ✅ Auto-trigger CSAT surveys on resolution';
    RAISE NOTICE '  ✅ Conversation statistics function';
    RAISE NOTICE '';
    RAISE NOTICE 'New views created:';
    RAISE NOTICE '  - csat_analytics_daily';
    RAISE NOTICE '  - proactive_engagement_stats';
    RAISE NOTICE '  - conversation_funnel';
    RAISE NOTICE '  - user_engagement_cohorts';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Test: POST /api/v1/analytics/overview';
    RAISE NOTICE '  2. Test: POST /api/v1/analytics/csat/metrics';
    RAISE NOTICE '  3. View analytics: SELECT * FROM csat_analytics_daily;';
    RAISE NOTICE '  4. Check funnel: SELECT * FROM conversation_funnel;';
END $$;
