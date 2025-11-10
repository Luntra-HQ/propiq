-- ============================================================================
-- Add Onboarding Status Tracking Table
-- Migration: Add support for tracking user onboarding email campaign status
-- ============================================================================

-- ============================================================================
-- ONBOARDING STATUS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS onboarding_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,

    -- Campaign status
    campaign_started_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Individual email status (JSONB for flexibility)
    -- Structure: { "day_1": "sent", "day_2": "scheduled", "day_3": "pending", "day_4": "pending" }
    email_status JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Scheduled emails (JSONB array)
    -- Structure: [{ "day": 2, "scheduled_for": "ISO timestamp", "status": "pending" }, ...]
    emails_scheduled JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Errors log (JSONB array)
    errors JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Ensure one onboarding record per user
    CONSTRAINT unique_user_onboarding UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_status_user ON onboarding_status(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status_email ON onboarding_status(user_email);
CREATE INDEX IF NOT EXISTS idx_onboarding_status_created ON onboarding_status(created_at DESC);

-- Index for finding scheduled emails that need to be sent
-- This uses a GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_onboarding_scheduled_emails ON onboarding_status USING GIN (emails_scheduled);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) FOR ONBOARDING STATUS
-- ============================================================================

ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own onboarding status
CREATE POLICY "Users can view own onboarding status" ON onboarding_status
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role can do anything (for backend operations)
-- Note: Service key bypasses RLS, but this is here for completeness

-- ============================================================================
-- HELPER FUNCTION: Get pending scheduled emails
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pending_scheduled_emails()
RETURNS TABLE (
    user_id UUID,
    user_email VARCHAR,
    day_number INTEGER,
    scheduled_for TIMESTAMP,
    subject TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        os.user_id,
        os.user_email,
        (email->>'day')::INTEGER as day_number,
        (email->>'scheduled_for')::TIMESTAMP as scheduled_for,
        email->>'subject' as subject
    FROM onboarding_status os,
         jsonb_array_elements(os.emails_scheduled) as email
    WHERE email->>'status' = 'scheduled'
      AND (email->>'scheduled_for')::TIMESTAMP <= NOW()
    ORDER BY scheduled_for ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify table was created
SELECT
    tablename,
    schemaname
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'onboarding_status';

-- Show all indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'onboarding_status'
AND schemaname = 'public';
