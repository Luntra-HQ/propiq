-- PropIQ Support Agent - Database Migration for pgvector Support
-- Migration: 001_create_pgvector_tables.sql
-- Created: January 2025
-- Purpose: Add vector search capabilities for RAG-enhanced support chat

-- ============================================================================
-- STEP 1: Enable pgvector extension
-- ============================================================================

-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';


-- ============================================================================
-- STEP 2: Create knowledge base table with vector embeddings
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding VECTOR(1536),  -- OpenAI text-embedding-3-small produces 1536-dim vectors
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT content_not_empty CHECK (char_length(content) > 0)
);

-- Add comment for documentation
COMMENT ON TABLE support_knowledge_base IS 'Knowledge base for PropIQ support agent with vector embeddings for semantic search';
COMMENT ON COLUMN support_knowledge_base.content IS 'Text content of the knowledge base chunk';
COMMENT ON COLUMN support_knowledge_base.embedding IS '1536-dimensional vector embedding for similarity search';
COMMENT ON COLUMN support_knowledge_base.metadata IS 'JSON metadata: {source, category, title, chunk_index, etc.}';


-- ============================================================================
-- STEP 3: Create indexes for performance
-- ============================================================================

-- IVFFlat index for fast approximate nearest neighbor search
-- Lists parameter (100) is recommended for datasets with 10k-100k vectors
-- Adjust based on knowledge base size:
--   - Small (<10k vectors): lists = sqrt(rows)
--   - Medium (10k-100k): lists = 100-500
--   - Large (>100k): lists = 500-1000
CREATE INDEX IF NOT EXISTS support_knowledge_base_embedding_idx
ON support_knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index on metadata for filtering by category/source
CREATE INDEX IF NOT EXISTS support_knowledge_base_metadata_idx
ON support_knowledge_base
USING gin (metadata);

-- Index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS support_knowledge_base_created_at_idx
ON support_knowledge_base (created_at DESC);


-- ============================================================================
-- STEP 4: Create function for vector similarity search
-- ============================================================================

-- This function performs semantic search on the knowledge base
-- Returns documents ordered by cosine similarity to the query embedding
CREATE OR REPLACE FUNCTION match_support_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.75,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        support_knowledge_base.id,
        support_knowledge_base.content,
        support_knowledge_base.metadata,
        1 - (support_knowledge_base.embedding <=> query_embedding) AS similarity
    FROM support_knowledge_base
    WHERE 1 - (support_knowledge_base.embedding <=> query_embedding) > match_threshold
    ORDER BY support_knowledge_base.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Add comment
COMMENT ON FUNCTION match_support_documents IS 'Semantic search function for knowledge base using cosine similarity';


-- ============================================================================
-- STEP 5: Create RAG conversations table
-- ============================================================================

-- Table for storing RAG-enhanced support conversations
CREATE TABLE IF NOT EXISTS support_conversations_rag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    escalated BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT conversation_id_not_empty CHECK (char_length(conversation_id) > 0),
    CONSTRAINT user_id_not_empty CHECK (char_length(user_id) > 0)
);

-- Add comments
COMMENT ON TABLE support_conversations_rag IS 'RAG-enhanced support conversations with sentiment and escalation tracking';
COMMENT ON COLUMN support_conversations_rag.messages IS 'Array of message objects: [{role, content, timestamp, sources}]';
COMMENT ON COLUMN support_conversations_rag.sentiment IS 'Overall conversation sentiment: positive, neutral, or negative';
COMMENT ON COLUMN support_conversations_rag.escalated IS 'Whether conversation was escalated to human agent';


-- ============================================================================
-- STEP 6: Create indexes for conversations table
-- ============================================================================

CREATE INDEX IF NOT EXISTS support_conversations_rag_user_id_idx
ON support_conversations_rag (user_id);

CREATE INDEX IF NOT EXISTS support_conversations_rag_updated_at_idx
ON support_conversations_rag (updated_at DESC);

CREATE INDEX IF NOT EXISTS support_conversations_rag_escalated_idx
ON support_conversations_rag (escalated)
WHERE escalated = TRUE;  -- Partial index for escalated conversations only

CREATE INDEX IF NOT EXISTS support_conversations_rag_sentiment_idx
ON support_conversations_rag (sentiment)
WHERE sentiment = 'negative';  -- Partial index for negative sentiment tracking


-- ============================================================================
-- STEP 7: Create updated_at trigger
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for knowledge base
CREATE TRIGGER update_support_knowledge_base_updated_at
    BEFORE UPDATE ON support_knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for conversations
CREATE TRIGGER update_support_conversations_rag_updated_at
    BEFORE UPDATE ON support_conversations_rag
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- STEP 8: Create analytics view
-- ============================================================================

-- View for support analytics dashboard
CREATE OR REPLACE VIEW support_analytics_summary AS
SELECT
    DATE(created_at) AS date,
    COUNT(*) AS total_conversations,
    COUNT(*) FILTER (WHERE escalated = TRUE) AS escalated_count,
    COUNT(*) FILTER (WHERE sentiment = 'positive') AS positive_sentiment_count,
    COUNT(*) FILTER (WHERE sentiment = 'neutral') AS neutral_sentiment_count,
    COUNT(*) FILTER (WHERE sentiment = 'negative') AS negative_sentiment_count,
    AVG(jsonb_array_length(messages)) AS avg_messages_per_conversation
FROM support_conversations_rag
GROUP BY DATE(created_at)
ORDER BY date DESC;

COMMENT ON VIEW support_analytics_summary IS 'Daily support analytics summary for dashboard';


-- ============================================================================
-- STEP 9: Grant permissions (adjust based on your setup)
-- ============================================================================

-- Grant permissions to authenticated users (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE ON support_knowledge_base TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON support_conversations_rag TO authenticated;
-- GRANT EXECUTE ON FUNCTION match_support_documents TO authenticated;

-- Note: In production, use row-level security (RLS) policies instead of broad grants


-- ============================================================================
-- STEP 10: Verification queries
-- ============================================================================

-- Verify tables were created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('support_knowledge_base', 'support_conversations_rag');

-- Verify indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('support_knowledge_base', 'support_conversations_rag');

-- Verify pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verify function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name = 'match_support_documents';


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 001_create_pgvector_tables.sql completed successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run: python scripts/ingest_knowledge_base.py --sample';
    RAISE NOTICE '2. Test: POST /api/v1/support/rag/chat';
    RAISE NOTICE '3. Check health: GET /api/v1/support/rag/health';
END $$;
