-- ============================================================================
-- MIGRATION 006: FEEDBACK SYSTEM TABLES
-- ============================================================================
-- Purpose: Create tables for comprehensive feedback collection system
--          Supports CSAT, NPS, PMF surveys, feature requests, bug reports
-- Author: Development Team
-- Date: 2025-11-10
-- Dependencies: Requires users table from migration 001
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FEEDBACK SURVEYS TABLE
-- ----------------------------------------------------------------------------
-- Stores all survey responses (CSAT, NPS, PMF)

CREATE TABLE IF NOT EXISTS feedback_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    survey_type VARCHAR(50) NOT NULL CHECK (survey_type IN ('csat', 'nps', 'pmf')),
    rating INT NOT NULL CHECK (rating >= 0 AND rating <= 10),
    comment TEXT,
    context VARCHAR(200), -- What triggered the survey (e.g., 'post_analysis', 'monthly_check_in')
    metadata JSONB DEFAULT '{}', -- Additional survey-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_feedback_surveys_user_id ON feedback_surveys(user_id);
CREATE INDEX idx_feedback_surveys_type ON feedback_surveys(survey_type);
CREATE INDEX idx_feedback_surveys_created ON feedback_surveys(created_at DESC);
CREATE INDEX idx_feedback_surveys_user_type ON feedback_surveys(user_id, survey_type);

-- Prevent duplicate PMF surveys per user
CREATE UNIQUE INDEX idx_feedback_surveys_pmf_once
ON feedback_surveys(user_id)
WHERE survey_type = 'pmf';

-- Row Level Security
ALTER TABLE feedback_surveys ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own surveys
CREATE POLICY feedback_surveys_insert_policy ON feedback_surveys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own surveys
CREATE POLICY feedback_surveys_select_policy ON feedback_surveys
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can read all (for analytics)
CREATE POLICY feedback_surveys_service_role_policy ON feedback_surveys
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON TABLE feedback_surveys IS 'Stores user survey responses (CSAT, NPS, PMF)';
COMMENT ON COLUMN feedback_surveys.survey_type IS 'Type: csat, nps, or pmf';
COMMENT ON COLUMN feedback_surveys.rating IS 'CSAT: 1-5, NPS: 0-10, PMF: 1-3 (mapped from response)';
COMMENT ON COLUMN feedback_surveys.metadata IS 'Survey-specific data (e.g., PMF response category)';


-- ----------------------------------------------------------------------------
-- 2. FEATURE REQUESTS TABLE
-- ----------------------------------------------------------------------------
-- Stores user feature requests with voting

CREATE TABLE IF NOT EXISTS feedback_feature_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) CHECK (priority IN ('nice_to_have', 'important', 'critical')) DEFAULT 'important',
    use_case TEXT,
    status VARCHAR(50) CHECK (status IN ('new', 'under_review', 'planned', 'in_progress', 'completed', 'rejected')) DEFAULT 'new',
    votes INT DEFAULT 1, -- Start with 1 vote from submitter
    admin_notes TEXT, -- Internal notes (not visible to users)
    estimated_effort VARCHAR(50), -- 'small', 'medium', 'large'
    planned_release VARCHAR(50), -- e.g., 'Sprint 5', 'Q2 2025'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_features_user_id ON feedback_feature_requests(user_id);
CREATE INDEX idx_feedback_features_status ON feedback_feature_requests(status);
CREATE INDEX idx_feedback_features_votes ON feedback_feature_requests(votes DESC);
CREATE INDEX idx_feedback_features_created ON feedback_feature_requests(created_at DESC);

-- Row Level Security
ALTER TABLE feedback_feature_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own requests
CREATE POLICY feedback_features_insert_policy ON feedback_feature_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- All authenticated users can read feature requests (for voting)
CREATE POLICY feedback_features_select_policy ON feedback_feature_requests
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can update their own requests
CREATE POLICY feedback_features_update_policy ON feedback_feature_requests
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for admin actions)
CREATE POLICY feedback_features_service_role_policy ON feedback_feature_requests
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON TABLE feedback_feature_requests IS 'User feature requests with voting and status tracking';
COMMENT ON COLUMN feedback_feature_requests.votes IS 'Number of users who want this feature';
COMMENT ON COLUMN feedback_feature_requests.admin_notes IS 'Internal notes (not visible to users)';


-- ----------------------------------------------------------------------------
-- 3. FEATURE VOTES TABLE
-- ----------------------------------------------------------------------------
-- Track which users voted for which features (prevent duplicate votes)

CREATE TABLE IF NOT EXISTS feedback_feature_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_id UUID NOT NULL REFERENCES feedback_feature_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent duplicate votes
    UNIQUE(feature_id, user_id)
);

-- Indexes
CREATE INDEX idx_feedback_votes_feature ON feedback_feature_votes(feature_id);
CREATE INDEX idx_feedback_votes_user ON feedback_feature_votes(user_id);

-- Row Level Security
ALTER TABLE feedback_feature_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY feedback_votes_all_policy ON feedback_feature_votes
    FOR ALL
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE feedback_feature_votes IS 'Tracks which users voted for which features';


-- ----------------------------------------------------------------------------
-- 4. BUG REPORTS TABLE
-- ----------------------------------------------------------------------------
-- Stores user-reported bugs

CREATE TABLE IF NOT EXISTS feedback_bug_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status VARCHAR(50) CHECK (status IN ('new', 'confirmed', 'in_progress', 'fixed', 'wont_fix', 'duplicate')) DEFAULT 'new',
    browser VARCHAR(100),
    device VARCHAR(100),
    admin_notes TEXT,
    fixed_in_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_feedback_bugs_user_id ON feedback_bug_reports(user_id);
CREATE INDEX idx_feedback_bugs_status ON feedback_bug_reports(status);
CREATE INDEX idx_feedback_bugs_severity ON feedback_bug_reports(severity);
CREATE INDEX idx_feedback_bugs_created ON feedback_bug_reports(created_at DESC);

-- Row Level Security
ALTER TABLE feedback_bug_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own bug reports
CREATE POLICY feedback_bugs_insert_policy ON feedback_bug_reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own bug reports
CREATE POLICY feedback_bugs_select_policy ON feedback_bug_reports
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY feedback_bugs_service_role_policy ON feedback_bug_reports
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON TABLE feedback_bug_reports IS 'User-reported bugs with status tracking';
COMMENT ON COLUMN feedback_bug_reports.severity IS 'Bug severity: low, medium, high, critical';
COMMENT ON COLUMN feedback_bug_reports.admin_notes IS 'Internal notes (not visible to users)';


-- ----------------------------------------------------------------------------
-- 5. INTERVIEW REQUESTS TABLE
-- ----------------------------------------------------------------------------
-- Stores user interview booking requests

CREATE TABLE IF NOT EXISTS feedback_interview_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    preferred_times JSONB NOT NULL, -- Array of ISO 8601 datetime strings
    topics TEXT[], -- Array of topics to discuss
    duration_minutes INT DEFAULT 30 CHECK (duration_minutes >= 15 AND duration_minutes <= 60),
    status VARCHAR(50) CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')) DEFAULT 'pending',
    scheduled_time TIMESTAMP WITH TIME ZONE,
    meeting_link VARCHAR(500), -- Zoom/Calendar link
    admin_notes TEXT,
    incentive_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_interviews_user_id ON feedback_interview_requests(user_id);
CREATE INDEX idx_feedback_interviews_status ON feedback_interview_requests(status);
CREATE INDEX idx_feedback_interviews_created ON feedback_interview_requests(created_at DESC);

-- Row Level Security
ALTER TABLE feedback_interview_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own interview requests
CREATE POLICY feedback_interviews_insert_policy ON feedback_interview_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own interview requests
CREATE POLICY feedback_interviews_select_policy ON feedback_interview_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY feedback_interviews_service_role_policy ON feedback_interview_requests
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON TABLE feedback_interview_requests IS 'User interview booking requests';
COMMENT ON COLUMN feedback_interview_requests.preferred_times IS 'JSON array of ISO 8601 datetime strings';
COMMENT ON COLUMN feedback_interview_requests.incentive_sent IS 'Whether gift card/credit was sent';


-- ----------------------------------------------------------------------------
-- 6. PRODUCT METRICS SNAPSHOTS TABLE
-- ----------------------------------------------------------------------------
-- Store daily/weekly snapshots of key product metrics for trend analysis

CREATE TABLE IF NOT EXISTS product_metrics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL UNIQUE,
    snapshot_type VARCHAR(50) CHECK (snapshot_type IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',

    -- User metrics
    total_users INT DEFAULT 0,
    active_users_dau INT DEFAULT 0,
    active_users_wau INT DEFAULT 0,
    active_users_mau INT DEFAULT 0,
    new_signups INT DEFAULT 0,

    -- Engagement metrics
    total_analyses INT DEFAULT 0,
    analyses_per_user DECIMAL(10,2) DEFAULT 0,
    avg_session_duration_minutes DECIMAL(10,2) DEFAULT 0,

    -- Retention metrics
    week1_retention_pct DECIMAL(5,2) DEFAULT 0,
    week4_retention_pct DECIMAL(5,2) DEFAULT 0,

    -- Monetization metrics
    total_paid_users INT DEFAULT 0,
    mrr_cents BIGINT DEFAULT 0, -- Monthly Recurring Revenue in cents
    arpu_cents INT DEFAULT 0, -- Average Revenue Per User in cents
    free_to_paid_conversion_pct DECIMAL(5,2) DEFAULT 0,

    -- Feedback metrics
    avg_csat DECIMAL(3,2) DEFAULT 0,
    nps_score DECIMAL(5,2) DEFAULT 0,
    pmf_very_disappointed_pct DECIMAL(5,2) DEFAULT 0,

    -- Support metrics
    total_support_tickets INT DEFAULT 0,
    avg_resolution_time_hours DECIMAL(10,2) DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_metrics_snapshots_date ON product_metrics_snapshots(snapshot_date DESC);
CREATE INDEX idx_metrics_snapshots_type ON product_metrics_snapshots(snapshot_type);

-- Row Level Security (admin only)
ALTER TABLE product_metrics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY metrics_snapshots_service_role_policy ON product_metrics_snapshots
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON TABLE product_metrics_snapshots IS 'Daily/weekly/monthly snapshots of key product metrics';
COMMENT ON COLUMN product_metrics_snapshots.mrr_cents IS 'Monthly Recurring Revenue in cents';
COMMENT ON COLUMN product_metrics_snapshots.arpu_cents IS 'Average Revenue Per User in cents';


-- ----------------------------------------------------------------------------
-- 7. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_feedback_surveys_updated_at
    BEFORE UPDATE ON feedback_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_features_updated_at
    BEFORE UPDATE ON feedback_feature_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_bugs_updated_at
    BEFORE UPDATE ON feedback_bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_interviews_updated_at
    BEFORE UPDATE ON feedback_interview_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Function to increment feature request votes
CREATE OR REPLACE FUNCTION increment_feature_votes(feature_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE feedback_feature_requests
    SET votes = votes + 1,
        updated_at = NOW()
    WHERE id = feature_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement feature request votes
CREATE OR REPLACE FUNCTION decrement_feature_votes(feature_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE feedback_feature_requests
    SET votes = GREATEST(0, votes - 1), -- Never go below 0
        updated_at = NOW()
    WHERE id = feature_uuid;
END;
$$ LANGUAGE plpgsql;


-- ----------------------------------------------------------------------------
-- 8. SAMPLE DATA (FOR TESTING - REMOVE IN PRODUCTION)
-- ----------------------------------------------------------------------------

-- Uncomment to insert sample data for testing
/*
-- Sample CSAT responses
INSERT INTO feedback_surveys (user_id, survey_type, rating, comment, context) VALUES
    ((SELECT id FROM users LIMIT 1), 'csat', 5, 'Love the AI insights!', 'post_analysis'),
    ((SELECT id FROM users LIMIT 1), 'csat', 4, 'Pretty good overall', 'post_analysis');

-- Sample NPS responses
INSERT INTO feedback_surveys (user_id, survey_type, rating, comment, metadata) VALUES
    ((SELECT id FROM users LIMIT 1), 'nps', 9, 'Would definitely recommend', '{"category": "promoter"}'),
    ((SELECT id FROM users LIMIT 1), 'nps', 8, 'Pretty happy with it', '{"category": "passive"}');

-- Sample PMF response
INSERT INTO feedback_surveys (user_id, survey_type, rating, comment, metadata) VALUES
    ((SELECT id FROM users LIMIT 1), 'pmf', 1, 'Saves me hours of analysis', '{"response": "very_disappointed"}');
*/


-- ----------------------------------------------------------------------------
-- MIGRATION COMPLETE
-- ----------------------------------------------------------------------------

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE 'Migration 006: Feedback System - COMPLETE';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - feedback_surveys (CSAT, NPS, PMF)';
    RAISE NOTICE '  - feedback_feature_requests';
    RAISE NOTICE '  - feedback_feature_votes';
    RAISE NOTICE '  - feedback_bug_reports';
    RAISE NOTICE '  - feedback_interview_requests';
    RAISE NOTICE '  - product_metrics_snapshots';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Test feedback endpoints in API';
    RAISE NOTICE '  2. Set up analytics dashboard';
    RAISE NOTICE '  3. Create scheduled job for metrics snapshots';
END $$;
