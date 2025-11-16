-- PropIQ Support Agent Phase 2 - Database Migration
-- Migration: 002_phase2_conversation_intelligence.sql
-- Created: January 2025
-- Purpose: Add conversation intelligence, assignment, and escalation management

-- ============================================================================
-- STEP 1: Create Phase 2 conversations table with enhanced fields
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_conversations_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_name TEXT,

    -- Messages and content
    messages JSONB DEFAULT '[]'::jsonb,

    -- AI Analysis (Phase 2)
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
    intent TEXT,  -- technical_support, billing, feature_question, sales, etc.
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    key_topics TEXT[],  -- Array of key phrases/topics
    language TEXT DEFAULT 'en',  -- Detected language

    -- Escalation (Phase 2)
    escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,  -- negative_sentiment, user_request, unresolved_issue, billing_issue, etc.
    escalated_at TIMESTAMP WITH TIME ZONE,

    -- Assignment (Phase 2)
    assigned_to TEXT,  -- Agent email
    assigned_to_name TEXT,  -- Agent name
    assigned_at TIMESTAMP WITH TIME ZONE,

    -- Status and resolution
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'assigned', 'resolved', 'closed')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT,
    resolution_notes TEXT,

    -- CSAT (Phase 3)
    csat_rating INTEGER CHECK (csat_rating BETWEEN 1 AND 5),
    csat_feedback TEXT,
    csat_timestamp TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT conversation_id_not_empty CHECK (char_length(conversation_id) > 0),
    CONSTRAINT user_id_not_empty CHECK (char_length(user_id) > 0)
);

COMMENT ON TABLE support_conversations_v2 IS 'Phase 2: Enhanced conversations with sentiment, intent, assignment, and escalation';
COMMENT ON COLUMN support_conversations_v2.sentiment IS 'AI-detected sentiment: positive, neutral, negative, mixed';
COMMENT ON COLUMN support_conversations_v2.intent IS 'Classified user intent for routing and prioritization';
COMMENT ON COLUMN support_conversations_v2.priority IS 'Conversation priority based on intent and sentiment';
COMMENT ON COLUMN support_conversations_v2.escalation_reason IS 'Reason for escalation if escalated=true';
COMMENT ON COLUMN support_conversations_v2.assigned_to IS 'Email of human agent assigned to this conversation';
COMMENT ON COLUMN support_conversations_v2.status IS 'Conversation lifecycle status';


-- ============================================================================
-- STEP 2: Create indexes for Phase 2 features
-- ============================================================================

-- Index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS support_conversations_v2_user_id_idx
ON support_conversations_v2 (user_id);

-- Index on updated_at for chronological queries
CREATE INDEX IF NOT EXISTS support_conversations_v2_updated_at_idx
ON support_conversations_v2 (updated_at DESC);

-- Partial index on escalated conversations (for support team dashboard)
CREATE INDEX IF NOT EXISTS support_conversations_v2_escalated_idx
ON support_conversations_v2 (escalated, priority, updated_at DESC)
WHERE escalated = TRUE;

-- Partial index on assigned conversations
CREATE INDEX IF NOT EXISTS support_conversations_v2_assigned_idx
ON support_conversations_v2 (assigned_to, status, updated_at DESC)
WHERE assigned_to IS NOT NULL;

-- Index on sentiment for analytics
CREATE INDEX IF NOT EXISTS support_conversations_v2_sentiment_idx
ON support_conversations_v2 (sentiment, created_at DESC);

-- Index on intent for routing analytics
CREATE INDEX IF NOT EXISTS support_conversations_v2_intent_idx
ON support_conversations_v2 (intent, created_at DESC);

-- Index on status for workflow queries
CREATE INDEX IF NOT EXISTS support_conversations_v2_status_idx
ON support_conversations_v2 (status, updated_at DESC);

-- Composite index for escalated + unassigned (common query)
CREATE INDEX IF NOT EXISTS support_conversations_v2_escalated_unassigned_idx
ON support_conversations_v2 (escalated, assigned_to, updated_at DESC)
WHERE escalated = TRUE AND assigned_to IS NULL;


-- ============================================================================
-- STEP 3: Create agent performance tracking table
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_email TEXT NOT NULL UNIQUE,
    agent_name TEXT NOT NULL,

    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    max_concurrent_conversations INTEGER DEFAULT 5,

    -- Performance metrics
    total_assignments INTEGER DEFAULT 0,
    total_resolutions INTEGER DEFAULT 0,
    avg_resolution_time_minutes DECIMAL(10, 2),

    -- Specializations
    specializations TEXT[],  -- ['billing', 'technical_support', 'sales']

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT agent_email_valid CHECK (agent_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

COMMENT ON TABLE support_agents IS 'Support team agents with availability and performance tracking';

-- Index on active agents
CREATE INDEX IF NOT EXISTS support_agents_active_idx
ON support_agents (is_active, last_active_at DESC)
WHERE is_active = TRUE;


-- ============================================================================
-- STEP 4: Create escalation history table (audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_escalation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT NOT NULL REFERENCES support_conversations_v2(conversation_id) ON DELETE CASCADE,

    -- Escalation details
    escalation_reason TEXT NOT NULL,
    priority TEXT NOT NULL,

    -- Notification status
    slack_notified BOOLEAN DEFAULT FALSE,
    email_notified BOOLEAN DEFAULT FALSE,

    -- Assignment
    assigned_to TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,

    -- Resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_time_minutes INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE support_escalation_history IS 'Audit trail of all escalations';

-- Index on conversation_id
CREATE INDEX IF NOT EXISTS support_escalation_history_conversation_idx
ON support_escalation_history (conversation_id, created_at DESC);

-- Index on created_at for analytics
CREATE INDEX IF NOT EXISTS support_escalation_history_created_at_idx
ON support_escalation_history (created_at DESC);


-- ============================================================================
-- STEP 5: Create analytics views for Phase 2
-- ============================================================================

-- Daily conversation statistics
CREATE OR REPLACE VIEW support_analytics_daily AS
SELECT
    DATE(created_at) AS date,
    COUNT(*) AS total_conversations,
    COUNT(*) FILTER (WHERE escalated = TRUE) AS escalated_count,
    COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
    COUNT(*) FILTER (WHERE sentiment = 'positive') AS positive_count,
    COUNT(*) FILTER (WHERE sentiment = 'neutral') AS neutral_count,
    COUNT(*) FILTER (WHERE sentiment = 'negative') AS negative_count,
    COUNT(*) FILTER (WHERE sentiment = 'mixed') AS mixed_count,
    ROUND(AVG(jsonb_array_length(messages)), 1) AS avg_messages_per_conversation,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60)
        FILTER (WHERE resolved_at IS NOT NULL),
        1
    ) AS avg_resolution_time_minutes
FROM support_conversations_v2
GROUP BY DATE(created_at)
ORDER BY date DESC;

COMMENT ON VIEW support_analytics_daily IS 'Daily support conversation statistics';


-- Intent distribution
CREATE OR REPLACE VIEW support_analytics_intent_distribution AS
SELECT
    intent,
    COUNT(*) AS conversation_count,
    COUNT(*) FILTER (WHERE escalated = TRUE) AS escalated_count,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE escalated = TRUE) / NULLIF(COUNT(*), 0),
        1
    ) AS escalation_rate_percent,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60)
        FILTER (WHERE resolved_at IS NOT NULL),
        1
    ) AS avg_resolution_time_minutes
FROM support_conversations_v2
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY intent
ORDER BY conversation_count DESC;

COMMENT ON VIEW support_analytics_intent_distribution IS 'Intent classification statistics for last 30 days';


-- Agent performance view
CREATE OR REPLACE VIEW support_agent_performance AS
SELECT
    sa.agent_email,
    sa.agent_name,
    sa.is_active,
    COUNT(sc.id) AS assigned_conversations,
    COUNT(sc.id) FILTER (WHERE sc.status = 'resolved') AS resolved_conversations,
    ROUND(
        100.0 * COUNT(sc.id) FILTER (WHERE sc.status = 'resolved') / NULLIF(COUNT(sc.id), 0),
        1
    ) AS resolution_rate_percent,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (sc.resolved_at - sc.assigned_at)) / 60)
        FILTER (WHERE sc.resolved_at IS NOT NULL AND sc.assigned_at IS NOT NULL),
        1
    ) AS avg_resolution_time_minutes,
    COUNT(sc.id) FILTER (WHERE sc.csat_rating IS NOT NULL) AS csat_responses,
    ROUND(AVG(sc.csat_rating) FILTER (WHERE sc.csat_rating IS NOT NULL), 2) AS avg_csat_rating
FROM support_agents sa
LEFT JOIN support_conversations_v2 sc ON sa.agent_email = sc.assigned_to
WHERE sc.created_at >= NOW() - INTERVAL '30 days' OR sc.created_at IS NULL
GROUP BY sa.agent_email, sa.agent_name, sa.is_active
ORDER BY assigned_conversations DESC;

COMMENT ON VIEW support_agent_performance IS 'Agent performance metrics for last 30 days';


-- Escalation reasons breakdown
CREATE OR REPLACE VIEW support_escalation_breakdown AS
SELECT
    escalation_reason,
    COUNT(*) AS total_escalations,
    COUNT(*) FILTER (WHERE assigned_to IS NOT NULL) AS assigned_count,
    COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'resolved') / NULLIF(COUNT(*), 0),
        1
    ) AS resolution_rate_percent,
    ROUND(AVG(resolution_time_minutes), 1) AS avg_resolution_time_minutes
FROM support_escalation_history
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY escalation_reason
ORDER BY total_escalations DESC;

COMMENT ON VIEW support_escalation_breakdown IS 'Escalation reasons and resolution rates';


-- ============================================================================
-- STEP 6: Create function to auto-assign conversations
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_assign_conversation(
    p_conversation_id TEXT,
    p_intent TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_assigned_agent TEXT;
BEGIN
    -- Find available agent with lowest current assignments
    -- Prioritize agents with matching specialization if intent is provided
    SELECT agent_email INTO v_assigned_agent
    FROM (
        SELECT
            sa.agent_email,
            COUNT(sc.id) AS current_assignments,
            CASE
                WHEN p_intent = ANY(sa.specializations) THEN 1
                ELSE 2
            END AS specialization_priority
        FROM support_agents sa
        LEFT JOIN support_conversations_v2 sc
            ON sa.agent_email = sc.assigned_to
            AND sc.status IN ('active', 'assigned')
        WHERE sa.is_active = TRUE
        GROUP BY sa.agent_email, sa.specializations
        HAVING COUNT(sc.id) < sa.max_concurrent_conversations
        ORDER BY specialization_priority ASC, current_assignments ASC
        LIMIT 1
    ) sub;

    IF v_assigned_agent IS NOT NULL THEN
        -- Assign conversation
        UPDATE support_conversations_v2
        SET
            assigned_to = v_assigned_agent,
            assigned_at = NOW(),
            status = 'assigned',
            updated_at = NOW()
        WHERE conversation_id = p_conversation_id;

        -- Update agent metrics
        UPDATE support_agents
        SET
            total_assignments = total_assignments + 1,
            last_active_at = NOW(),
            updated_at = NOW()
        WHERE agent_email = v_assigned_agent;

        RETURN v_assigned_agent;
    ELSE
        RETURN NULL;  -- No available agents
    END IF;
END;
$$;

COMMENT ON FUNCTION auto_assign_conversation IS 'Automatically assign conversation to available agent with load balancing';


-- ============================================================================
-- STEP 7: Create trigger to update agent performance metrics
-- ============================================================================

CREATE OR REPLACE FUNCTION update_agent_metrics_on_resolution()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' AND NEW.assigned_to IS NOT NULL THEN
        -- Update agent resolution metrics
        UPDATE support_agents
        SET
            total_resolutions = total_resolutions + 1,
            avg_resolution_time_minutes = (
                (COALESCE(avg_resolution_time_minutes, 0) * (total_resolutions - 1) +
                EXTRACT(EPOCH FROM (NEW.resolved_at - COALESCE(NEW.assigned_at, NEW.created_at))) / 60) /
                total_resolutions
            ),
            updated_at = NOW()
        WHERE agent_email = NEW.assigned_to;

        -- Update escalation history if escalated
        IF NEW.escalated = TRUE THEN
            UPDATE support_escalation_history
            SET
                resolved_at = NEW.resolved_at,
                resolution_time_minutes = EXTRACT(EPOCH FROM (NEW.resolved_at - created_at))::INTEGER / 60
            WHERE conversation_id = NEW.conversation_id
                AND resolved_at IS NULL;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_metrics
    AFTER UPDATE ON support_conversations_v2
    FOR EACH ROW
    WHEN (NEW.status = 'resolved' AND OLD.status != 'resolved')
    EXECUTE FUNCTION update_agent_metrics_on_resolution();


-- ============================================================================
-- STEP 8: Create trigger to log escalations
-- ============================================================================

CREATE OR REPLACE FUNCTION log_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.escalated = TRUE AND (OLD.escalated IS NULL OR OLD.escalated = FALSE) THEN
        -- Log escalation to history
        INSERT INTO support_escalation_history (
            conversation_id,
            escalation_reason,
            priority,
            metadata
        ) VALUES (
            NEW.conversation_id,
            NEW.escalation_reason,
            NEW.priority,
            jsonb_build_object(
                'sentiment', NEW.sentiment,
                'intent', NEW.intent,
                'user_email', NEW.user_email
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_escalation
    AFTER INSERT OR UPDATE ON support_conversations_v2
    FOR EACH ROW
    WHEN (NEW.escalated = TRUE)
    EXECUTE FUNCTION log_escalation();


-- ============================================================================
-- STEP 9: Create updated_at triggers
-- ============================================================================

CREATE TRIGGER update_support_conversations_v2_updated_at
    BEFORE UPDATE ON support_conversations_v2
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_agents_updated_at
    BEFORE UPDATE ON support_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- STEP 10: Insert sample support agents (for testing)
-- ============================================================================

INSERT INTO support_agents (agent_email, agent_name, specializations, is_active)
VALUES
    ('support@propiq.com', 'Support Team', ARRAY['technical_support', 'billing', 'feature_question'], TRUE),
    ('billing@propiq.com', 'Billing Team', ARRAY['billing', 'account_management'], TRUE)
ON CONFLICT (agent_email) DO NOTHING;


-- ============================================================================
-- STEP 11: Grant permissions (adjust based on your setup)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE ON support_conversations_v2 TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON support_agents TO authenticated;
-- GRANT SELECT, INSERT ON support_escalation_history TO authenticated;
-- GRANT SELECT ON support_analytics_daily TO authenticated;
-- GRANT SELECT ON support_analytics_intent_distribution TO authenticated;
-- GRANT SELECT ON support_agent_performance TO authenticated;
-- GRANT EXECUTE ON FUNCTION auto_assign_conversation TO authenticated;


-- ============================================================================
-- STEP 12: Verification queries
-- ============================================================================

-- Verify tables
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'support_conversations_v2',
        'support_agents',
        'support_escalation_history'
    );

-- Verify views
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
    AND table_name LIKE 'support_%';

-- Verify indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('support_conversations_v2', 'support_agents');

-- Verify functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN ('auto_assign_conversation', 'update_agent_metrics_on_resolution', 'log_escalation');


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 002_phase2_conversation_intelligence.sql completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Phase 2 features now available:';
    RAISE NOTICE '  ✅ Enhanced conversation tracking with sentiment & intent';
    RAISE NOTICE '  ✅ Escalation management with audit trail';
    RAISE NOTICE '  ✅ Agent assignment system with load balancing';
    RAISE NOTICE '  ✅ Performance analytics views';
    RAISE NOTICE '  ✅ Auto-assignment function';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Configure Azure Language Service (AZURE_LANGUAGE_ENDPOINT, AZURE_LANGUAGE_KEY)';
    RAISE NOTICE '  2. Configure Slack webhook (SLACK_SUPPORT_WEBHOOK)';
    RAISE NOTICE '  3. Configure SendGrid (SENDGRID_API_KEY)';
    RAISE NOTICE '  4. Test: POST /api/v1/support/v2/chat';
    RAISE NOTICE '  5. View analytics: SELECT * FROM support_analytics_daily;';
END $$;
