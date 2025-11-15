# PropIQ Support Agent Implementation Guide

**Version:** 1.0 (Phase 1 - RAG Implementation)
**Last Updated:** January 2025
**Status:** Ready for Deployment

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [API Documentation](#api-documentation)
5. [Testing Guide](#testing-guide)
6. [Deployment](#deployment)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the implementation of PropIQ's **RAG-Enhanced Support Agent** (Phase 1), which provides intelligent customer support using:

- ✅ **Retrieval-Augmented Generation (RAG)** - Grounded responses using knowledge base
- ✅ **Vector Search** - Semantic search with Supabase pgvector
- ✅ **Sentiment Analysis** - Automatic detection of user sentiment
- ✅ **Escalation Workflows** - Intelligent routing to human agents
- ✅ **Source Citations** - Transparent knowledge base references
- ✅ **Conversation History** - Multi-turn context retention

### What This Replaces

This enhanced agent **replaces** the basic support chat agent (`/backend/routers/support_chat.py`) with advanced capabilities:

| Feature | Basic Agent | RAG Agent (Phase 1) |
|---------|-------------|---------------------|
| Response Grounding | ❌ Prone to hallucinations | ✅ RAG with knowledge base |
| Source Citations | ❌ No | ✅ Yes |
| Sentiment Analysis | ❌ No | ✅ Yes |
| Escalation Logic | ❌ Manual | ✅ Automatic |
| Confidence Scores | ❌ No | ✅ Yes |
| Vector Search | ❌ No | ✅ pgvector |

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                    (React Support Widget)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST
┌───────────────────────▼─────────────────────────────────────┐
│                   FastAPI Backend                            │
│   /api/v1/support/rag/chat                                   │
│   /api/v1/support/rag/history/{id}                           │
│   /api/v1/support/rag/conversations                          │
└─────────┬────────────────────────┬──────────────────────────┘
          │                        │
  ┌───────▼────────┐      ┌────────▼──────────┐
  │  Azure OpenAI  │      │    Supabase       │
  │                │      │   (PostgreSQL +   │
  │ - GPT-4o-mini  │      │     pgvector)     │
  │ - Embeddings   │      │                   │
  └────────────────┘      └───────────────────┘
                                   │
                   ┌───────────────┼───────────────┐
                   │               │               │
        ┌──────────▼─────────┐    │    ┌─────────▼────────┐
        │ Knowledge Base     │    │    │ Conversations    │
        │ (Vector Embeddings)│    │    │ (Chat History)   │
        └────────────────────┘    │    └──────────────────┘
                                  │
                        ┌─────────▼──────────┐
                        │  Analytics Views   │
                        └────────────────────┘
```

### Data Flow

1. **User sends message** → FastAPI endpoint `/api/v1/support/rag/chat`
2. **Generate query embedding** → Azure OpenAI `text-embedding-3-small`
3. **Vector search** → Supabase `match_support_documents()` function
4. **Retrieve context** → Top 5 knowledge base chunks (cosine similarity > 0.75)
5. **Build enhanced prompt** → System prompt + knowledge base context + conversation history
6. **Generate response** → Azure OpenAI `gpt-4o-mini`
7. **Analyze sentiment** → Simple GPT-based classification (Phase 2: Azure AI Language)
8. **Check escalation** → Rule-based triggers (sentiment, turn count, keywords)
9. **Store conversation** → Supabase `support_conversations_rag` table
10. **Return response** → JSON with response, sources, confidence, escalation status

---

## Setup Instructions

### Prerequisites

- Python 3.11+
- PostgreSQL with pgvector extension (Supabase recommended)
- Azure OpenAI account with API access
- Node.js 18+ (for frontend)

### Environment Variables

Add to `/backend/.env`:

```bash
# Azure OpenAI (Required)
AZURE_OPENAI_ENDPOINT=https://YOUR_RESOURCE.openai.azure.com/
AZURE_OPENAI_KEY=your_api_key_here
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Supabase (Required)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# JWT Authentication (Required)
JWT_SECRET=your_jwt_secret_key_32_chars_minimum

# Optional: Azure AI Language (Phase 2)
AZURE_LANGUAGE_ENDPOINT=https://YOUR_RESOURCE.cognitiveservices.azure.com/
AZURE_LANGUAGE_KEY=your_key_here

# Optional: Slack Notifications (Phase 2)
SLACK_SUPPORT_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 1: Database Setup

Run the migration to create pgvector tables and functions:

```bash
# Connect to your Supabase PostgreSQL instance
psql postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Or use Supabase SQL Editor (recommended)
# Copy and paste contents of backend/migrations/001_create_pgvector_tables.sql
```

**What this creates:**
- ✅ `support_knowledge_base` table with vector embeddings
- ✅ `support_conversations_rag` table for conversations
- ✅ `match_support_documents()` function for semantic search
- ✅ Indexes for performance
- ✅ Analytics view

**Verify:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('support_knowledge_base', 'support_conversations_rag');

-- Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'match_support_documents';
```

### Step 2: Install Backend Dependencies

```bash
cd backend

# Install required packages
pip install openai langchain numpy python-dotenv
# Note: fastapi, pydantic, supabase are already in requirements.txt

# Or update requirements.txt and install all
pip install -r requirements.txt
```

### Step 3: Ingest Knowledge Base

Ingest sample documentation to test the system:

```bash
cd backend

# Option 1: Ingest sample content (for testing)
python scripts/ingest_knowledge_base.py --sample

# Option 2: Ingest your actual documentation
python scripts/ingest_knowledge_base.py --source ../docs/ --category documentation

# Option 3: Rebuild entire knowledge base
python scripts/ingest_knowledge_base.py --rebuild --sample
```

**Expected output:**
```
📚 Ingesting sample knowledge base content...
📄 Processing 'Property Analysis Guide' (3 chunks)...
  ✅ Chunk 1/3 ingested
  ✅ Chunk 2/3 ingested
  ✅ Chunk 3/3 ingested
...
============================================================
📊 INGESTION SUMMARY
============================================================
✅ Successfully ingested: 15 chunks
❌ Failed: 0 chunks
📈 Success rate: 100.0%
============================================================
✅ Knowledge base ingestion complete!
💡 Test the knowledge base at: POST /api/v1/support/rag/chat
```

**Verify knowledge base:**
```sql
-- Count documents in knowledge base
SELECT COUNT(*) FROM support_knowledge_base;

-- View sample documents
SELECT
    metadata->>'source' AS source,
    metadata->>'category' AS category,
    substring(content, 1, 100) AS content_preview
FROM support_knowledge_base
LIMIT 10;
```

### Step 4: Register RAG Router

Add to your FastAPI application (e.g., `backend/main.py` or similar):

```python
from fastapi import FastAPI
from routers import support_chat_rag

app = FastAPI(title="PropIQ API", version="3.1.1")

# Register RAG-enhanced support chat router
app.include_router(support_chat_rag.router, prefix="/api/v1")

# ... other routers ...
```

### Step 5: Test the API

Start your backend server:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Test the RAG endpoint:

```bash
# Health check
curl http://localhost:8000/api/v1/support/rag/health

# Expected response:
{
  "status": "healthy",
  "openai_configured": true,
  "database_available": true,
  "embedding_model": "text-embedding-3-small",
  "chat_model": "gpt-4o-mini",
  "knowledge_base_documents": 15,
  "features": {
    "rag": true,
    "sentiment_analysis": true,
    "escalation": true,
    "source_citation": true
  }
}
```

```bash
# Send a test message (requires JWT token)
curl -X POST http://localhost:8000/api/v1/support/rag/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I analyze a property?"
  }'

# Expected response:
{
  "success": true,
  "conversation_id": "uuid-here",
  "message": "How do I analyze a property?",
  "response": "To analyze a property in PropIQ:\n\n1. Log in to app.propiq.com\n2. Click \"Analyze Property\" in the dashboard\n3. Enter the full property address...",
  "timestamp": "2025-01-15T10:30:00Z",
  "sources": [
    {
      "source": "How-To Guide",
      "category": "tutorials",
      "relevance": 0.89
    }
  ],
  "confidence": 0.89,
  "escalated": false
}
```

---

## API Documentation

### Endpoints

#### `POST /api/v1/support/rag/chat`

Send a message to the RAG-enhanced support agent.

**Request:**
```json
{
  "message": "How much does Pro plan cost?",
  "conversation_id": "optional-for-continuing-conversation"
}
```

**Response:**
```json
{
  "success": true,
  "conversation_id": "uuid",
  "message": "How much does Pro plan cost?",
  "response": "The Pro plan costs $79/month and includes...",
  "timestamp": "2025-01-15T10:30:00Z",
  "sources": [
    {
      "source": "Pricing Guide",
      "category": "pricing",
      "relevance": 0.92
    }
  ],
  "confidence": 0.92,
  "escalated": false
}
```

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>` (required)
- `Content-Type: application/json`

---

#### `GET /api/v1/support/rag/history/{conversation_id}`

Get full conversation history.

**Response:**
```json
{
  "conversation_id": "uuid",
  "messages": [
    {
      "role": "user",
      "content": "How do I upgrade?",
      "timestamp": "2025-01-15T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "To upgrade your plan...",
      "timestamp": "2025-01-15T10:00:02Z"
    }
  ],
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:05:00Z",
  "sentiment": "neutral",
  "escalated": false
}
```

---

#### `GET /api/v1/support/rag/conversations`

List all conversations for authenticated user (paginated).

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `page_size` (int, default: 20) - Items per page (max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "conversation_id": "uuid",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:05:00Z",
      "message_count": 6,
      "last_message": "Thank you for your help!",
      "sentiment": "positive",
      "escalated": false
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "page_size": 20,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

---

#### `POST /api/v1/support/rag/knowledge-base/ingest`

Ingest a document into the knowledge base (admin only).

**Request:**
```json
{
  "content": "PropIQ offers three subscription tiers...",
  "metadata": {
    "source": "Pricing Documentation",
    "category": "pricing",
    "title": "Subscription Plans"
  }
}
```

**Response:**
```json
{
  "success": true,
  "document_id": "uuid",
  "message": "Document ingested successfully"
}
```

---

#### `GET /api/v1/support/rag/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "openai_configured": true,
  "database_available": true,
  "embedding_model": "text-embedding-3-small",
  "chat_model": "gpt-4o-mini",
  "knowledge_base_documents": 15,
  "features": {
    "rag": true,
    "sentiment_analysis": true,
    "escalation": true,
    "source_citation": true
  }
}
```

---

## Testing Guide

### Manual Testing

**Test 1: Basic RAG Response**
```bash
# Question covered in knowledge base
curl -X POST http://localhost:8000/api/v1/support/rag/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is PropIQ?"}'

# ✅ Expected: Response with source citations and high confidence (>0.8)
```

**Test 2: Multi-Turn Conversation**
```bash
# First message
RESPONSE=$(curl -X POST http://localhost:8000/api/v1/support/rag/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I analyze a property?"}')

# Extract conversation_id from response
CONV_ID=$(echo $RESPONSE | jq -r '.conversation_id')

# Follow-up message (should maintain context)
curl -X POST http://localhost:8000/api/v1/support/rag/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Can I export the results?\", \"conversation_id\": \"$CONV_ID\"}"

# ✅ Expected: Response understands "the results" refers to property analysis
```

**Test 3: Escalation Trigger**
```bash
# Simulate frustrated user
curl -X POST http://localhost:8000/api/v1/support/rag/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "This is not helpful. I need to talk to a person."}'

# ✅ Expected: "escalated": true in response
```

**Test 4: Out-of-Scope Query**
```bash
# Question not in knowledge base
curl -X POST http://localhost:8000/api/v1/support/rag/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the meaning of life?"}'

# ✅ Expected: Low confidence (<0.5), honest "I don't have that information" response
```

### Automated Testing

Create test file `backend/tests/test_support_rag.py`:

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/support/rag/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "knowledge_base_documents" in data

def test_send_message_requires_auth():
    response = client.post("/api/v1/support/rag/chat", json={
        "message": "Hello"
    })
    assert response.status_code == 401  # Unauthorized

def test_send_message_with_auth(auth_token):
    response = client.post(
        "/api/v1/support/rag/chat",
        json={"message": "What is PropIQ?"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "response" in data
    assert "sources" in data
    assert "confidence" in data

def test_multi_turn_conversation(auth_token):
    # First message
    response1 = client.post(
        "/api/v1/support/rag/chat",
        json={"message": "How do I upgrade?"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    conv_id = response1.json()["conversation_id"]

    # Follow-up message
    response2 = client.post(
        "/api/v1/support/rag/chat",
        json={
            "message": "How much does it cost?",
            "conversation_id": conv_id
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response2.status_code == 200
    assert response2.json()["conversation_id"] == conv_id
```

Run tests:
```bash
pytest backend/tests/test_support_rag.py -v
```

---

## Deployment

### Production Checklist

- [ ] Environment variables set in production
- [ ] Database migration applied to production Supabase
- [ ] Knowledge base ingested (use production docs, not sample)
- [ ] Health endpoint returns "healthy"
- [ ] Rate limiting configured (prevent abuse)
- [ ] Monitoring and logging enabled (Sentry, W&B)
- [ ] API documentation deployed (Swagger/ReDoc)
- [ ] Frontend widget updated to use RAG endpoint

### Performance Optimization

**1. Vector Index Tuning**
```sql
-- Adjust IVFFlat lists parameter based on knowledge base size
-- Rule: lists ≈ sqrt(rows) for small datasets, higher for large

-- Check current row count
SELECT COUNT(*) FROM support_knowledge_base;

-- If you have 10k+ documents, rebuild index with more lists
DROP INDEX support_knowledge_base_embedding_idx;
CREATE INDEX support_knowledge_base_embedding_idx
ON support_knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 500);  -- Adjust based on size
```

**2. Caching Frequent Queries**
```python
# Add Redis caching for common queries (Phase 2)
from redis import Redis
import hashlib

cache = Redis(host='localhost', port=6379, db=0)

def get_cached_response(query: str):
    cache_key = f"rag:{hashlib.md5(query.encode()).hexdigest()}"
    return cache.get(cache_key)

def cache_response(query: str, response: dict, ttl: int = 3600):
    cache_key = f"rag:{hashlib.md5(query.encode()).hexdigest()}"
    cache.setex(cache_key, ttl, json.dumps(response))
```

**3. Batch Embedding Generation**
```python
# When ingesting many documents, batch embeddings
embeddings = client.embeddings.create(
    model="text-embedding-3-small",
    input=[chunk1, chunk2, chunk3, ...]  # Batch up to 2048 inputs
)
```

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Response Quality**
   - Average confidence score (target: >0.75)
   - Hallucination rate (target: <5%)
   - Source citation rate (target: >80%)

2. **Performance**
   - Response latency P50, P95, P99 (target: <3s P95)
   - Embedding generation time
   - Vector search time
   - LLM generation time

3. **User Satisfaction**
   - CSAT score (target: >4.0/5.0)
   - Escalation rate (target: <20%)
   - Conversation resolution rate (target: >60%)

4. **Sentiment Distribution**
   - Positive vs neutral vs negative
   - Sentiment trend over time

### Analytics Queries

```sql
-- Daily conversation volume
SELECT
    DATE(created_at) AS date,
    COUNT(*) AS conversations,
    COUNT(*) FILTER (WHERE escalated = TRUE) AS escalations
FROM support_conversations_rag
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Sentiment distribution (last 7 days)
SELECT
    sentiment,
    COUNT(*) AS count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM support_conversations_rag
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY sentiment;

-- Top conversation topics (analyze message content)
-- Note: Requires text analysis, use GPT for topic extraction
```

---

## Troubleshooting

### Issue: "Database not available"

**Symptoms:** API returns 503, logs show database connection errors

**Solutions:**
1. Verify Supabase credentials in `.env`
2. Check Supabase project is not paused
3. Test connection: `psql $SUPABASE_URL`
4. Verify IP allowlist in Supabase settings

### Issue: "No relevant knowledge base documents found"

**Symptoms:** Low confidence scores, no source citations

**Solutions:**
1. Check knowledge base has documents: `SELECT COUNT(*) FROM support_knowledge_base;`
2. Lower similarity threshold (currently 0.75, try 0.65)
3. Ingest more comprehensive documentation
4. Verify embeddings are generating correctly

### Issue: "Embedding generation failed"

**Symptoms:** API errors when sending messages

**Solutions:**
1. Verify Azure OpenAI credentials
2. Check API quota and rate limits
3. Verify model deployment name matches ("text-embedding-3-small")
4. Test embedding directly:
   ```python
   from openai import AzureOpenAI
   client = AzureOpenAI(...)
   response = client.embeddings.create(
       model="text-embedding-3-small",
       input="test"
   )
   print(response.data[0].embedding[:5])  # Should print 5 floats
   ```

### Issue: "Too many escalations"

**Symptoms:** >50% of conversations escalated

**Solutions:**
1. Tune escalation thresholds (increase turn count from 4 to 6)
2. Improve knowledge base coverage (ingest more FAQs)
3. Review sentiment analysis accuracy
4. Add more specific escalation keywords

---

## Next Steps (Future Phases)

This is **Phase 1** of the enhanced support agent. Future phases include:

**Phase 2 (Weeks 3-4): Conversation Intelligence**
- Azure AI Language Service for production-grade sentiment analysis
- Advanced intent classification
- Slack/email notifications for escalations
- Human agent handoff UI

**Phase 3 (Weeks 5-6): Proactive & Analytics**
- Proactive onboarding messages
- Analytics dashboard (React frontend)
- CSAT surveys
- Weights & Biases integration

**Phase 4 (Weeks 7-8): Advanced Features**
- Multi-language support (45+ languages)
- Action buttons in responses
- Rich media (property cards, charts)
- User context injection (subscription, usage)

---

## Support

For questions or issues:
- 📧 Email: engineering@propiq.com
- 📚 Docs: See `/docs/AGENT_STRATEGY.md`
- 🐛 Issues: Create ticket in project management system

---

**Last Updated:** January 2025
**Version:** 1.0 (Phase 1 Implementation)
**Maintained By:** PropIQ Engineering Team
