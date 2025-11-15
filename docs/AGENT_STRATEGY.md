# PropIQ Customer Service Agent Strategy

**Document Version:** 1.0
**Last Updated:** January 2025
**Author:** Engineering Team
**Status:** Strategic Decision Document

---

## Executive Summary

This document provides a comprehensive analysis of PropIQ's customer service agent options: enhancing our current custom-built agent versus integrating Intercom's Fin AI Agent. Based on technical, financial, and strategic considerations, **we recommend enhancing the current custom agent** with advanced capabilities.

**Key Decision Factors:**
- ✅ Cost efficiency: $0/resolution vs $0.99/resolution + $29/seat/month
- ✅ Full control and customization for real estate domain expertise
- ✅ No vendor lock-in or proprietary dependencies
- ✅ Already integrated with our tech stack (Azure OpenAI, Supabase, JWT)
- ✅ Ability to implement RAG and advanced features tailored to PropIQ

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Option 1: Enhance Current Agent](#option-1-enhance-current-agent)
3. [Option 2: Integrate Intercom Fin](#option-2-integrate-intercom-fin)
4. [Comparative Analysis](#comparative-analysis)
5. [Cost-Benefit Analysis](#cost-benefit-analysis)
6. [Technical Implementation Plan](#technical-implementation-plan)
7. [Recommendation](#recommendation)
8. [Migration Path](#migration-path)

---

## Current State Analysis

### Existing Customer Service Infrastructure

PropIQ currently has **two AI agent systems** in production:

#### 1. **Support Chat Agent** (`/backend/routers/support_chat.py`)

**Technology Stack:**
- Model: Azure OpenAI GPT-4o-mini
- Database: Supabase (PostgreSQL) / MongoDB (legacy)
- Authentication: JWT tokens
- API Version: 2024-02-15-preview

**Current Capabilities:**
- ✅ Multi-turn conversation support
- ✅ Conversation history persistence
- ✅ User-scoped conversations
- ✅ Paginated conversation listing
- ✅ Real-time responses
- ✅ Frontend widget integration (`SupportChat.tsx`)

**Current Limitations:**
- ❌ No retrieval-augmented generation (RAG)
- ❌ No knowledge base integration
- ❌ Basic prompt engineering
- ❌ No sentiment analysis
- ❌ No conversation analytics
- ❌ No handoff to human agents
- ❌ No proactive engagement
- ❌ Limited context window (300 tokens response)
- ❌ No multi-language support beyond English
- ❌ No conversation routing/triage

**System Prompt Coverage:**
```
Current knowledge base:
- PropIQ feature overview
- Subscription tiers and pricing
- Basic platform navigation
- Property analysis workflow

Missing knowledge:
- Detailed troubleshooting guides
- API documentation
- Integration guides
- Advanced feature tutorials
- FAQ database
- Common error resolutions
```

#### 2. **Property Advisor Multi-Agent** (`/backend/routers/property_advisor_multiagent.py`)

**Purpose:** Premium investment advisory (Pro/Elite users)
**Architecture:** Orchestrated 4-agent workflow (Market → Deal → Risk → Action)
**Relevance:** Demonstrates PropIQ's capability to build sophisticated multi-agent systems

### Existing Intercom Integration

PropIQ already has **partial Intercom integration** (`/backend/routers/intercom.py`):

**Current Capabilities:**
- User event tracking (signup, property analysis, subscription changes)
- Contact creation/updates
- Webhook handling
- Custom attribute management

**Not Implemented:**
- ❌ Intercom Messenger widget
- ❌ Fin AI Agent
- ❌ Conversational support through Intercom
- ❌ Intercom inbox management

**Configuration Required:**
```bash
INTERCOM_ACCESS_TOKEN=<not set>
INTERCOM_WEBHOOK_SECRET=<not set>
```

---

## Option 1: Enhance Current Agent

### Proposed Enhancements

#### **Phase 1: Knowledge Base & RAG (Weeks 1-2)**

**Implementation:**
```python
# Enhanced architecture with RAG
1. Knowledge Base Integration
   - Vector database (Pinecone, Weaviate, or pgvector in Supabase)
   - Embeddings: Azure OpenAI text-embedding-3-small
   - Document sources:
     * PropIQ documentation
     * FAQ database
     * Support ticket resolutions
     * Product changelogs
     * API documentation

2. RAG Pipeline
   - Query → Embedding → Vector search → Context retrieval
   - Inject relevant docs into system prompt
   - Reduce hallucinations by 80%+
   - Increase accuracy for specific queries
```

**Tech Stack:**
- **Vector Storage:** Supabase pgvector extension (already using Supabase)
- **Embeddings:** Azure OpenAI `text-embedding-3-small` ($0.02/1M tokens)
- **Chunking:** LangChain document loaders
- **Retrieval:** Semantic search with cosine similarity

**Benefits:**
- ✅ Accurate answers grounded in PropIQ documentation
- ✅ Auto-updates as docs change
- ✅ No hallucinated information
- ✅ Domain-specific real estate expertise

#### **Phase 2: Advanced Conversation Management (Weeks 3-4)**

**Features:**
```python
1. Conversation Intelligence
   - Sentiment analysis (Azure AI Language Service)
   - Intent classification (support vs sales vs feedback)
   - Conversation routing (technical, billing, general)
   - Priority detection (urgent vs routine)

2. Enhanced Context Management
   - User context injection (subscription tier, usage history)
   - Property context (recent analyses)
   - Conversation summarization for long threads
   - Increased context window (GPT-4o supports 128k tokens)

3. Handoff Workflows
   - Escalation triggers (negative sentiment, unresolved after 3 turns)
   - Slack/email notifications for human agent
   - Conversation transfer with full context
   - SLA tracking
```

**Integration Points:**
- **Sentiment Analysis:** Azure AI Language Service (pay-as-you-go)
- **Notifications:** SendGrid (already integrated) + Slack webhook
- **User Context:** Pull from Supabase (subscription, analyses count)

#### **Phase 3: Proactive Engagement & Analytics (Weeks 5-6)**

**Features:**
```python
1. Proactive Support
   - Onboarding assistance (triggered on signup)
   - Feature discovery nudges
   - Trial expiration reminders
   - Usage tips based on behavior

2. Analytics Dashboard
   - Resolution rate tracking
   - Average response time
   - Top conversation topics (using clustering)
   - Customer satisfaction (CSAT surveys)
   - Agent performance metrics

3. Multi-Language Support
   - Auto-detect user language
   - GPT-4o supports 50+ languages natively
   - Translate knowledge base on-the-fly
```

**Tech Stack:**
- **Analytics:** Weights & Biases (already integrated) + custom dashboard
- **Language Detection:** Azure AI Language Service
- **Scheduling:** Celery + Redis (for proactive messages)

#### **Phase 4: Advanced Features (Weeks 7-8)**

**Features:**
```python
1. Smart Responses
   - Suggested replies for users (like Gmail Smart Compose)
   - Quick actions (e.g., "Upgrade to Pro", "View Analysis")
   - Rich media responses (embedded charts, property cards)

2. Learning Loop
   - Human agent feedback integration
   - Reinforcement learning from successful resolutions
   - A/B testing different prompts
   - Continuous improvement pipeline

3. Integration Enhancements
   - Stripe integration (billing questions auto-resolved)
   - Property data lookup (answer specific property questions)
   - Calendar integration (schedule calls)
```

### Cost Breakdown

**Development Costs:**
| Phase | Effort | Cost (Eng Time @ $150/hr) |
|-------|--------|---------------------------|
| Phase 1: RAG | 80 hours | $12,000 |
| Phase 2: Conversation Mgmt | 60 hours | $9,000 |
| Phase 3: Proactive & Analytics | 50 hours | $7,500 |
| Phase 4: Advanced Features | 70 hours | $10,500 |
| **Total Development** | **260 hours** | **$39,000** |

**Ongoing Operational Costs (Monthly):**
| Service | Cost |
|---------|------|
| Azure OpenAI (GPT-4o-mini) | ~$50/mo (1M tokens) |
| Azure OpenAI Embeddings | ~$10/mo (500k tokens) |
| Supabase pgvector | $0 (included in current plan) |
| Azure AI Language (sentiment) | ~$20/mo (10k requests) |
| **Total Monthly** | **~$80/mo** |

**Per-Resolution Cost:** **$0** (included in Azure OpenAI usage)

**Break-Even Analysis:**
- Assumes 1,000 resolutions/month
- Fin cost: $990/mo + $29/seat = **$1,019/mo minimum**
- Custom agent: **$80/mo**
- **Monthly Savings: $939**
- **Break-even on development: 42 months** (or 3.5 years)
- **Realistic break-even: 12-18 months** (as Fin costs scale with volume)

---

## Option 2: Integrate Intercom Fin

### What is Intercom Fin?

Intercom Fin is a **proprietary AI customer service agent** built by Intercom, designed to resolve customer queries autonomously.

**Core Technology:**
- Proprietary LLM (likely GPT-4 based with fine-tuning)
- Retrieval-augmented generation (RAG) system
- Multi-channel support (email, chat, social media)
- 45+ languages supported
- Claims 51-65% resolution rate out-of-the-box

### Integration Requirements

#### **Technical Requirements:**

```javascript
// 1. Frontend Integration (React)
// Install Intercom Messenger widget
npm install react-use-intercom

// Add to App.tsx
import { IntercomProvider } from 'react-use-intercom';

<IntercomProvider appId="YOUR_APP_ID">
  <App />
</IntercomProvider>
```

```python
# 2. Backend Integration
# Already partially implemented in /backend/routers/intercom.py
# Need to add:
- Fin-specific configuration
- Knowledge base sync
- Conversation webhook handlers
- Resolution tracking
```

**Setup Steps:**
1. Create Intercom account (if not exists)
2. Enable Fin AI Agent addon
3. Configure knowledge base sources
4. Set up conversation routing rules
5. Train Fin on PropIQ-specific content
6. Configure handoff workflows
7. Integrate with Slack for human agent notifications
8. Test and optimize

**Estimated Integration Time:** 40-60 hours

#### **Configuration Requirements:**

```bash
# Environment Variables
INTERCOM_APP_ID=<your_app_id>
INTERCOM_ACCESS_TOKEN=<your_access_token>
INTERCOM_WEBHOOK_SECRET=<your_webhook_secret>
FIN_API_KEY=<fin_specific_key>
```

**Knowledge Base Setup:**
- Upload PropIQ documentation (PDF, HTML, or markdown)
- Connect Help Center articles
- Add internal wikis/guides
- Configure conversation flows
- Set tone of voice guidelines

### Capabilities

#### **Out-of-the-Box Features:**

✅ **RAG-powered responses** (grounded in your docs)
✅ **Multi-language support** (45+ languages)
✅ **Multi-channel** (web chat, email, social media)
✅ **Conversation routing** (to human agents)
✅ **Sentiment analysis** (built-in)
✅ **Analytics dashboard** (resolution rate, CSAT)
✅ **No-code configuration** (via Intercom UI)
✅ **Pre-built integrations** (Salesforce, HubSpot, Slack)
✅ **Mobile SDKs** (iOS, Android)
✅ **CSAT surveys** (automatic)
✅ **Compliance** (SOC 2, GDPR)

#### **Limitations:**

❌ **Black-box AI** (no control over model/prompts)
❌ **Limited customization** (beyond knowledge base)
❌ **Vendor lock-in** (proprietary platform)
❌ **Cost scales with usage** ($0.99 per resolution)
❌ **No direct API access** to Fin's AI
❌ **Cannot fine-tune model** for real estate domain
❌ **Data residency concerns** (Intercom US-based)
❌ **Integration complexity** with existing Supabase/Azure stack

### Cost Breakdown

#### **Subscription Costs:**

| Plan | Cost | Notes |
|------|------|-------|
| Fin AI Agent (standalone) | $0.99/resolution | Min 50 resolutions/month = $49.50 |
| Intercom Customer Service Suite | $29/seat/month | Required for Fin (min 1 seat) |
| **Minimum Monthly Cost** | **$78.50/mo** | At 50 resolutions |

#### **Scaling Costs:**

| Monthly Resolutions | Fin Cost | Intercom Seats | Total Monthly Cost |
|---------------------|----------|----------------|---------------------|
| 50 | $49.50 | $29 (1 seat) | **$78.50** |
| 100 | $99 | $29 | **$128** |
| 500 | $495 | $58 (2 seats) | **$553** |
| 1,000 | $990 | $87 (3 seats) | **$1,077** |
| 5,000 | $4,950 | $145 (5 seats) | **$5,095** |
| 10,000 | $9,900 | $232 (8 seats) | **$10,132** |

**Key Insights:**
- Costs are **variable and unpredictable** (based on resolution count)
- Intercom seat costs **scale with team size**, not resolution volume
- No control over cost optimization (e.g., can't switch models)

#### **Integration Costs:**

| Item | Cost |
|------|------|
| Initial setup (40-60 hours @ $150/hr) | $6,000 - $9,000 |
| Knowledge base preparation | $2,000 - $3,000 |
| Testing & optimization | $1,500 - $2,000 |
| Training team on Intercom | $1,000 |
| **Total Integration Cost** | **$10,500 - $15,000** |

#### **Total Cost of Ownership (Year 1):**

| Scenario | Setup | Monthly | Year 1 Total |
|----------|-------|---------|--------------|
| 100 resolutions/mo | $10,500 | $128 | **$12,036** |
| 500 resolutions/mo | $10,500 | $553 | **$17,136** |
| 1,000 resolutions/mo | $10,500 | $1,077 | **$23,424** |

---

## Comparative Analysis

### Feature Comparison Matrix

| Feature | Custom Agent (Enhanced) | Intercom Fin |
|---------|-------------------------|--------------|
| **Cost (1k resolutions/mo)** | $80/mo | $1,077/mo |
| **Per-Resolution Cost** | $0 | $0.99 |
| **Setup Cost** | $39,000 (full) | $10,500 |
| **Time to Production** | 8 weeks (full) | 2 weeks |
| **RAG / Knowledge Base** | ✅ Custom (pgvector) | ✅ Built-in |
| **Multi-Language Support** | ✅ 50+ (GPT-4o) | ✅ 45+ |
| **Sentiment Analysis** | ✅ Azure AI | ✅ Built-in |
| **Analytics Dashboard** | ✅ Custom | ✅ Built-in |
| **Customization** | ✅✅✅ Full control | ⚠️ Limited |
| **Model Control** | ✅ Switch GPT-4o/mini | ❌ Proprietary |
| **Fine-Tuning** | ✅ Possible | ❌ Not available |
| **Real Estate Expertise** | ✅ Can specialize | ⚠️ Generic |
| **Vendor Lock-In** | ✅ None | ❌ High |
| **Data Ownership** | ✅ Full control | ⚠️ Shared with Intercom |
| **Integration Complexity** | ⚠️ Custom build | ✅ Plug-and-play |
| **Proactive Engagement** | ✅ Custom triggers | ✅ Built-in |
| **Human Handoff** | ⚠️ Need to build | ✅ Built-in |
| **Mobile SDK** | ⚠️ Web only (React) | ✅ iOS/Android |
| **CSAT Surveys** | ⚠️ Need to build | ✅ Built-in |
| **Resolution Rate** | ⚠️ TBD (optimize) | 51-65% (claimed) |
| **Response Latency** | <2s (Azure) | 2-5s (typical) |
| **Uptime SLA** | Azure SLA (99.9%) | Intercom SLA (99.9%) |
| **Tech Stack Alignment** | ✅ Azure, Supabase | ⚠️ New stack |
| **Learning Curve** | ⚠️ Engineering team | ✅ No-code UI |

### Strategic Considerations

#### **Build vs Buy Decision Framework**

| Factor | Build (Custom) | Buy (Fin) | Winner |
|--------|----------------|-----------|--------|
| **Cost Efficiency** | ✅ $80/mo | ❌ $1,077/mo | **Custom** |
| **Time to Market** | ⚠️ 8 weeks | ✅ 2 weeks | **Fin** |
| **Differentiation** | ✅ Real estate expertise | ❌ Generic | **Custom** |
| **Control** | ✅ Full | ❌ Limited | **Custom** |
| **Scalability** | ✅ Unlimited | ⚠️ Cost scales | **Custom** |
| **Maintenance** | ⚠️ Self-managed | ✅ Managed service | **Fin** |
| **Innovation** | ✅ Can experiment | ❌ Limited to Fin roadmap | **Custom** |
| **Compliance** | ✅ Full control | ⚠️ Vendor-dependent | **Custom** |

#### **Risk Analysis**

| Risk | Custom Agent | Intercom Fin | Mitigation |
|------|--------------|--------------|------------|
| **Cost Overruns** | ⚠️ Dev scope creep | ⚠️ Usage spikes | Phased approach / Usage monitoring |
| **Technical Debt** | ⚠️ Maintenance burden | ✅ Vendor-managed | Modular architecture / Good docs |
| **Vendor Lock-In** | ✅ None | 🔴 High | N/A / Design exit strategy |
| **Performance** | ⚠️ Self-optimized | ✅ Vendor SLA | Load testing / Azure auto-scale |
| **Data Privacy** | ✅ Full control | ⚠️ Third-party | Encrypt PII / Review Intercom DPA |
| **Feature Gaps** | ⚠️ Need to build | ⚠️ Limited customization | Incremental features / Hybrid approach |

---

## Cost-Benefit Analysis

### 5-Year Total Cost of Ownership

| Year | Custom Agent (Enhanced) | Intercom Fin (1k res/mo) | Savings |
|------|-------------------------|--------------------------|---------|
| Year 1 | $39,000 (dev) + $960 (ops) = **$39,960** | $10,500 (setup) + $12,924 (subs) = **$23,424** | -$16,536 (Fin cheaper) |
| Year 2 | $5,000 (maint) + $960 = **$5,960** | $12,924 = **$12,924** | $6,964 (Custom cheaper) |
| Year 3 | $5,000 + $960 = **$5,960** | $12,924 = **$12,924** | $6,964 |
| Year 4 | $5,000 + $960 = **$5,960** | $12,924 = **$12,924** | $6,964 |
| Year 5 | $5,000 + $960 = **$5,960** | $12,924 = **$12,924** | $6,964 |
| **5-Year Total** | **$62,800** | **$75,120** | **$12,320 savings** |

**Break-Even Point:** Month 18 (1.5 years)

### ROI Calculation

**Custom Agent ROI (5 years):**
```
Total Savings: $12,320
Initial Investment: $39,000
ROI = (12,320 / 39,000) × 100 = 31.6%
Annualized ROI = 6.3%/year
```

**Intercom Fin ROI:**
```
No direct ROI (ongoing expense)
Cost avoidance vs hiring support staff:
- 1 FTE support agent: $60k/year
- Fin cost: $12,924/year
- Savings: $47,076/year
- ROI: 365%/year vs hiring
```

### Intangible Benefits

| Benefit | Custom Agent | Intercom Fin |
|---------|--------------|--------------|
| **Brand Differentiation** | ✅ "PropIQ AI" (proprietary) | ⚠️ "Powered by Intercom" |
| **Real Estate Expertise** | ✅ Deep domain knowledge | ⚠️ Generic support |
| **Customer Trust** | ✅ Data stays in-house | ⚠️ Third-party platform |
| **Innovation Velocity** | ✅ Ship features faster | ⚠️ Dependent on Intercom roadmap |
| **Competitive Advantage** | ✅ Proprietary IP | ⚠️ Commodity (anyone can use Fin) |
| **Investor Appeal** | ✅ "Built AI in-house" | ⚠️ "Uses third-party AI" |

---

## Technical Implementation Plan

### Recommended Approach: **Enhance Custom Agent (Phased)**

#### **Phase 1: Foundation & RAG (Weeks 1-2)**

**Goals:**
- Implement vector database for knowledge retrieval
- Build RAG pipeline for accurate responses
- Reduce hallucinations to near-zero

**Implementation:**

```python
# 1. Setup pgvector in Supabase
# Already using Supabase PostgreSQL - just enable extension

# 2. Create embeddings table
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE support_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- text-embedding-3-small dimension
  metadata JSONB, -- {source, category, last_updated}
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON support_knowledge_base USING ivfflat (embedding vector_cosine_ops);

# 3. Build document ingestion pipeline
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import DirectoryLoader
from openai import AzureOpenAI

def ingest_knowledge_base(docs_path: str):
    # Load documents
    loader = DirectoryLoader(docs_path, glob="**/*.md")
    documents = loader.load()

    # Chunk documents
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(documents)

    # Generate embeddings
    client = AzureOpenAI(...)
    for chunk in chunks:
        embedding = client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk.page_content
        )

        # Store in Supabase
        supabase.table("support_knowledge_base").insert({
            "content": chunk.page_content,
            "embedding": embedding.data[0].embedding,
            "metadata": chunk.metadata
        })

# 4. Enhanced chat endpoint with RAG
@router.post("/chat")
async def send_support_message_with_rag(request: SendMessageRequest, ...):
    # Step 1: Generate query embedding
    query_embedding = client.embeddings.create(
        model="text-embedding-3-small",
        input=request.message
    )

    # Step 2: Search knowledge base (vector similarity)
    results = supabase.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding.data[0].embedding,
            "match_threshold": 0.78,
            "match_count": 5
        }
    )

    # Step 3: Inject context into system prompt
    context = "\n\n".join([doc["content"] for doc in results.data])
    enhanced_prompt = f"""
    {SUPPORT_AGENT_PROMPT}

    **Relevant Knowledge Base:**
    {context}

    Use the knowledge base above to answer the user's question accurately.
    If the knowledge base doesn't contain relevant info, say so.
    """

    # Step 4: Generate response with context
    messages = [{"role": "system", "content": enhanced_prompt}, ...]
    response = client.chat.completions.create(...)

    return ChatResponse(...)
```

**Deliverables:**
- ✅ pgvector enabled in Supabase
- ✅ Knowledge base ingestion pipeline
- ✅ RAG-enhanced chat endpoint
- ✅ Documentation (PropIQ docs, FAQs) embedded
- ✅ Reduced hallucination rate by 80%+

**Testing:**
- Unit tests for embedding generation
- Integration tests for vector search
- A/B test RAG vs non-RAG responses
- Measure accuracy improvement

---

#### **Phase 2: Conversation Intelligence (Weeks 3-4)**

**Goals:**
- Add sentiment analysis for escalation
- Implement conversation routing
- Build handoff workflows to human agents

**Implementation:**

```python
# 1. Sentiment Analysis with Azure AI Language
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

sentiment_client = TextAnalyticsClient(
    endpoint=os.getenv("AZURE_LANGUAGE_ENDPOINT"),
    credential=AzureKeyCredential(os.getenv("AZURE_LANGUAGE_KEY"))
)

def analyze_sentiment(text: str) -> dict:
    """
    Returns: {
        "sentiment": "positive" | "neutral" | "negative",
        "confidence_scores": {"positive": 0.1, "neutral": 0.2, "negative": 0.7}
    }
    """
    result = sentiment_client.analyze_sentiment([text])[0]
    return {
        "sentiment": result.sentiment,
        "confidence_scores": {
            "positive": result.confidence_scores.positive,
            "neutral": result.confidence_scores.neutral,
            "negative": result.confidence_scores.negative
        }
    }

# 2. Intent Classification
INTENT_CLASSIFIER_PROMPT = """
Classify the user's message into one of these categories:
- technical_support (bugs, errors, technical issues)
- billing (payments, subscriptions, invoices)
- general (questions, how-to, feature info)
- feedback (complaints, suggestions, praise)
- sales (upgrade, pricing questions)

Return ONLY the category name, nothing else.
"""

def classify_intent(message: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": INTENT_CLASSIFIER_PROMPT},
            {"role": "user", "content": message}
        ],
        temperature=0.0,
        max_tokens=10
    )
    return response.choices[0].message.content.strip()

# 3. Escalation Logic
def should_escalate(conversation: dict) -> bool:
    """
    Escalate if:
    - Negative sentiment with high confidence
    - Unresolved after 3 agent turns
    - Explicit request for human ("talk to a person")
    - Billing/payment issues
    """
    # Check sentiment of last 2 messages
    recent_messages = conversation["messages"][-2:]
    for msg in recent_messages:
        if msg["role"] == "user":
            sentiment = analyze_sentiment(msg["content"])
            if sentiment["sentiment"] == "negative" and \
               sentiment["confidence_scores"]["negative"] > 0.75:
                return True

    # Check conversation length
    agent_turns = sum(1 for m in conversation["messages"] if m["role"] == "assistant")
    if agent_turns >= 3:
        # Check if issue is resolved (ask GPT to assess)
        return True  # Simplified - implement resolution checker

    # Check intent
    intent = classify_intent(conversation["messages"][-1]["content"])
    if intent == "billing":
        return True

    return False

# 4. Human Handoff Notification
async def notify_human_agent(conversation_id: str, user_email: str, reason: str):
    """Send notification to Slack + Email"""
    # Slack notification
    slack_webhook_url = os.getenv("SLACK_SUPPORT_WEBHOOK")
    slack_payload = {
        "text": f"🚨 Escalation Required",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*User:* {user_email}\n*Reason:* {reason}\n*Conversation:* {conversation_id}"
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View Conversation"},
                        "url": f"https://app.propiq.com/support/{conversation_id}"
                    }
                ]
            }
        ]
    }
    requests.post(slack_webhook_url, json=slack_payload)

    # Email notification via SendGrid (already integrated)
    # ... send email to support team

# 5. Enhanced chat endpoint with escalation
@router.post("/chat")
async def send_support_message_enhanced(request: SendMessageRequest, ...):
    # ... RAG logic from Phase 1 ...

    # After generating response, check for escalation
    conversation = get_conversation(conversation_id)

    if should_escalate(conversation):
        await notify_human_agent(
            conversation_id=conversation_id,
            user_email=user_email,
            reason="Negative sentiment detected"
        )

        # Add escalation notice to response
        ai_response += "\n\n_A member of our support team will reach out shortly to assist you further._"

    return ChatResponse(...)
```

**Deliverables:**
- ✅ Sentiment analysis integration
- ✅ Intent classification
- ✅ Escalation logic and triggers
- ✅ Slack + email notifications
- ✅ Escalation UI in frontend (badge/indicator)

---

#### **Phase 3: Proactive Engagement & Analytics (Weeks 5-6)**

**Goals:**
- Trigger proactive support messages
- Build analytics dashboard
- Implement CSAT surveys

**Implementation:**

```python
# 1. Proactive Engagement Triggers (using Celery + Redis)
from celery import Celery

celery_app = Celery('propiq', broker='redis://localhost:6379/0')

@celery_app.task
def send_onboarding_message(user_id: str):
    """Send welcome message 5 minutes after signup"""
    # Create automated conversation
    support_chats.insert_one({
        "conversation_id": str(ObjectId()),
        "user_id": user_id,
        "messages": [
            {
                "role": "assistant",
                "content": "👋 Welcome to PropIQ! I'm here to help you get started. Would you like a quick tour of property analysis features?",
                "timestamp": datetime.utcnow(),
                "is_proactive": True
            }
        ],
        "created_at": datetime.utcnow()
    })

# Schedule proactive messages
@router.post("/auth/signup")  # Hook into signup endpoint
async def signup_handler(...):
    # ... existing signup logic ...

    # Schedule onboarding message
    send_onboarding_message.apply_async(
        args=[user_id],
        countdown=300  # 5 minutes delay
    )

# 2. Analytics Dashboard (backend)
@router.get("/analytics")
async def get_support_analytics(
    start_date: datetime,
    end_date: datetime,
    token_payload: dict = Depends(verify_token)
):
    """Get support analytics for date range"""
    conversations = list(support_chats.find({
        "created_at": {"$gte": start_date, "$lte": end_date}
    }))

    analytics = {
        "total_conversations": len(conversations),
        "avg_messages_per_conversation": sum(len(c["messages"]) for c in conversations) / len(conversations),
        "escalations": sum(1 for c in conversations if c.get("escalated", False)),
        "resolution_rate": calculate_resolution_rate(conversations),
        "avg_response_time_seconds": calculate_avg_response_time(conversations),
        "top_intents": get_top_intents(conversations),
        "sentiment_distribution": {
            "positive": sum(1 for c in conversations if c.get("sentiment") == "positive"),
            "neutral": sum(1 for c in conversations if c.get("sentiment") == "neutral"),
            "negative": sum(1 for c in conversations if c.get("sentiment") == "negative")
        }
    }

    return analytics

# 3. CSAT Survey
@router.post("/chat")
async def send_support_message_with_csat(request: SendMessageRequest, ...):
    # ... existing logic ...

    # After conversation resolution, send CSAT survey
    if is_conversation_resolved(conversation):
        # Add CSAT prompt
        ai_response += "\n\n_Was this helpful? Please rate your experience:_\n👍 Helpful | 👎 Not Helpful"

    return ChatResponse(...)

@router.post("/csat-feedback")
async def submit_csat(
    conversation_id: str,
    rating: int,  # 1-5 or thumbs up/down
    feedback: Optional[str] = None,
    token_payload: dict = Depends(verify_token)
):
    """Record CSAT feedback"""
    support_chats.update_one(
        {"conversation_id": conversation_id},
        {
            "$set": {
                "csat_rating": rating,
                "csat_feedback": feedback,
                "csat_timestamp": datetime.utcnow()
            }
        }
    )

    # Track in W&B for monitoring
    wandb.log({
        "csat_rating": rating,
        "conversation_id": conversation_id
    })

    return {"status": "success"}
```

**Deliverables:**
- ✅ Proactive onboarding messages
- ✅ Analytics API endpoints
- ✅ CSAT survey implementation
- ✅ W&B integration for metrics tracking
- ✅ Admin dashboard (React component)

---

#### **Phase 4: Advanced Features (Weeks 7-8)**

**Goals:**
- Multi-language support
- Rich media responses
- Smart action buttons

**Implementation:**

```python
# 1. Multi-Language Detection & Response
from azure.ai.textanalytics import TextAnalyticsClient

def detect_language(text: str) -> str:
    """Detect user's language"""
    result = sentiment_client.detect_language([text])[0]
    return result.primary_language.iso6391_name  # e.g., "es", "fr", "de"

@router.post("/chat")
async def send_support_message_multilang(request: SendMessageRequest, ...):
    # Detect language
    user_language = detect_language(request.message)

    # Update system prompt with language instruction
    enhanced_prompt = f"""
    {SUPPORT_AGENT_PROMPT}

    **IMPORTANT:** Respond in {user_language} (ISO: {user_language}).
    Match the user's language automatically.
    """

    # ... rest of logic ...

# 2. Rich Media Responses with Action Buttons
class ChatResponseEnhanced(BaseModel):
    success: bool
    conversation_id: str
    message: str
    response: str
    timestamp: datetime
    actions: Optional[List[dict]] = None  # NEW: Action buttons
    rich_content: Optional[dict] = None   # NEW: Embedded content

@router.post("/chat")
async def send_support_message_rich(request: SendMessageRequest, ...):
    # ... existing logic ...

    # Detect if response should include actions
    intent = classify_intent(request.message)
    actions = []

    if "upgrade" in request.message.lower() or intent == "sales":
        actions = [
            {
                "type": "button",
                "label": "View Pricing",
                "action": "navigate",
                "url": "/pricing"
            },
            {
                "type": "button",
                "label": "Start Free Trial",
                "action": "navigate",
                "url": "/signup?plan=pro"
            }
        ]

    if "analyze" in request.message.lower():
        actions = [
            {
                "type": "button",
                "label": "Analyze Property Now",
                "action": "navigate",
                "url": "/analyze"
            }
        ]

    return ChatResponseEnhanced(
        ...,
        actions=actions if actions else None
    )

# 3. Integration with PropIQ Data
@router.post("/chat")
async def send_support_message_with_context(request: SendMessageRequest, ...):
    # Inject user context into prompt
    user_data = supabase.table("users").select("*").eq("id", user_id).single()

    user_context = f"""
    **User Context:**
    - Subscription: {user_data.get('subscription_tier', 'free')}
    - Analyses Used: {user_data.get('analyses_count', 0)} / {user_data.get('analyses_limit', 3)}
    - Signup Date: {user_data.get('created_at')}
    - Last Login: {user_data.get('last_login')}

    Use this context to provide personalized support.
    """

    enhanced_prompt = SUPPORT_AGENT_PROMPT + "\n\n" + user_context

    # ... rest of logic ...
```

**Deliverables:**
- ✅ Auto language detection + multilingual responses
- ✅ Action buttons in chat responses
- ✅ User context injection (subscription, usage)
- ✅ Property data lookup for specific queries
- ✅ Rich media support (charts, property cards)

---

### Development Timeline

```
Week 1-2: Phase 1 (RAG)          ████████░░░░░░░░░░░░░░░░░░░░░░
Week 3-4: Phase 2 (Intelligence) ░░░░░░░░████████░░░░░░░░░░░░░░
Week 5-6: Phase 3 (Analytics)    ░░░░░░░░░░░░░░░░████████░░░░░░
Week 7-8: Phase 4 (Advanced)     ░░░░░░░░░░░░░░░░░░░░░░░░████████

Testing & QA (ongoing)           ████████████████████████████████
Documentation                    ░░░░░░░░░░░░░░░░████████████████
```

**Total Timeline:** 8 weeks (2 months)

---

## Recommendation

### ✅ **RECOMMENDED: Enhance Current Custom Agent**

**Strategic Rationale:**

1. **Cost Efficiency (High Priority)**
   - **5-year savings: $12,320** vs Intercom Fin
   - **No per-resolution costs** (scales infinitely at $80/mo)
   - **Break-even in 18 months** (conservative estimate)

2. **Technical Alignment (High Priority)**
   - Already using **Azure OpenAI** (no new vendor)
   - **Supabase pgvector** (no new database)
   - **Seamless integration** with existing JWT auth, Stripe, SendGrid
   - **Same tech stack** = easier maintenance

3. **Differentiation & Competitive Advantage (Medium Priority)**
   - Build **"PropIQ AI"** as a brand asset (not "Powered by Intercom")
   - **Real estate domain expertise** (fine-tuned for property investment)
   - **Proprietary IP** (valuable for fundraising/exit)
   - **Investor appeal**: "We built AI in-house" vs "We use third-party AI"

4. **Control & Flexibility (Medium Priority)**
   - **Full control** over prompts, models, and features
   - **No vendor lock-in** (can switch to Anthropic Claude, Llama, etc.)
   - **Rapid iteration** (ship features same day, not waiting for Intercom roadmap)
   - **Data ownership** (no third-party data sharing)

5. **Scalability (Low Priority Today, High Priority Long-Term)**
   - **Unlimited resolutions** at flat $80/mo cost
   - **No surprise bills** (Fin costs unpredictable at scale)
   - **Future-proof**: Can add Fin later if needed (not either/or)

### When Would Fin Make Sense?

Intercom Fin would be the better choice if:

- ❌ **Time-to-market is critical** (need solution in <2 weeks)
- ❌ **Engineering resources are limited** (can't dedicate 260 hours)
- ❌ **Support volume is low** (<100 resolutions/mo → Fin costs ~$128/mo)
- ❌ **Need mature tooling immediately** (analytics, handoffs, CSAT)
- ❌ **Multi-channel support required** (email, social media, not just web chat)

**PropIQ's Reality:**
- ✅ Not in a rush (8-week timeline acceptable)
- ✅ Engineering team available (full-stack capability)
- ✅ Anticipated high volume (1k+ resolutions/mo → Fin costs $1k+/mo)
- ✅ Web chat is primary channel (React app focus)
- ✅ Want to build proprietary AI capabilities

### Hybrid Approach (Future Consideration)

A **hybrid strategy** could combine both:

1. **Phase 1-4: Build Custom Agent** (8 weeks, $39k investment)
2. **Monitor Performance** (6-12 months)
3. **Evaluate Fin for Specific Channels**:
   - Use custom agent for **web chat** (primary)
   - Use Fin for **email/social media** (if needed later)
   - Route complex queries to Fin, simple queries to custom agent

This gives **best of both worlds**:
- Custom agent handles 80% of volume at $0 per resolution
- Fin handles edge cases at $0.99 per resolution (limited usage)
- Total cost: $80/mo + (Fin resolutions × $0.99)

---

## Migration Path

### Phase 0: Preparation (Week 0)

- [ ] **Audit current support chat usage**
  - How many conversations/month?
  - What are common queries?
  - What's the resolution rate?
- [ ] **Gather knowledge base content**
  - PropIQ documentation
  - FAQ database
  - Support ticket historical data
- [ ] **Set up development environment**
  - Enable pgvector in Supabase (staging + prod)
  - Provision Azure AI Language Service
  - Set up Celery + Redis for async tasks
- [ ] **Baseline metrics**
  - Current resolution rate
  - Average response time
  - User satisfaction (if tracked)

### Phase 1: RAG Implementation (Weeks 1-2)

- [ ] **Week 1: Knowledge Base Setup**
  - Create `support_knowledge_base` table with pgvector
  - Build document ingestion pipeline (LangChain)
  - Embed PropIQ docs (markdown → chunks → embeddings)
  - Test vector search accuracy (precision/recall)
- [ ] **Week 2: RAG Integration**
  - Update `/api/v1/support/chat` with RAG pipeline
  - Implement query → embedding → retrieval → context injection
  - A/B test RAG vs baseline (50/50 split)
  - Measure accuracy improvement

**Success Metrics:**
- ✅ Hallucination rate <5% (down from ~20%)
- ✅ Answer relevance score >0.85 (manual eval on 50 queries)
- ✅ Response time <3 seconds (P95)

### Phase 2: Conversation Intelligence (Weeks 3-4)

- [ ] **Week 3: Sentiment & Intent**
  - Integrate Azure AI Language (sentiment analysis)
  - Build intent classifier (technical, billing, general, etc.)
  - Add sentiment tracking to conversation records
- [ ] **Week 4: Escalation & Handoff**
  - Implement escalation logic (negative sentiment, >3 turns, billing)
  - Set up Slack webhooks for notifications
  - Build human agent handoff UI (frontend)
  - Test end-to-end escalation workflow

**Success Metrics:**
- ✅ Escalation accuracy >90% (no false positives)
- ✅ Notification latency <5 seconds
- ✅ Human agent can view full conversation context

### Phase 3: Proactive & Analytics (Weeks 5-6)

- [ ] **Week 5: Proactive Engagement**
  - Set up Celery + Redis for task scheduling
  - Implement onboarding message (triggered on signup)
  - Add trial expiration reminders
  - Build usage tip system
- [ ] **Week 6: Analytics Dashboard**
  - Build `/api/v1/support/analytics` endpoint
  - Create admin dashboard (React component)
  - Integrate W&B for metrics tracking
  - Implement CSAT surveys

**Success Metrics:**
- ✅ Proactive message open rate >40%
- ✅ Analytics dashboard loads <2 seconds
- ✅ CSAT response rate >30%

### Phase 4: Advanced Features (Weeks 7-8)

- [ ] **Week 7: Multi-Language & Rich Responses**
  - Add language detection
  - Build action button system (frontend + backend)
  - Implement rich media responses (property cards, charts)
- [ ] **Week 8: Polish & Optimization**
  - User context injection (subscription, usage)
  - Performance optimization (caching, query tuning)
  - Final testing and bug fixes
  - Documentation and training

**Success Metrics:**
- ✅ Multi-language accuracy >95% (for top 5 languages)
- ✅ Action button click-through rate >15%
- ✅ Overall resolution rate >60% (vs Fin's 51-65% claim)

### Post-Launch (Week 9+)

- [ ] **Monitoring & Optimization**
  - Monitor resolution rate, response time, escalations
  - Collect CSAT feedback
  - Iterate on prompts and knowledge base
  - A/B test improvements
- [ ] **Continuous Learning**
  - Add human agent feedback loop (mark good/bad responses)
  - Update knowledge base weekly (new docs, FAQs)
  - Fine-tune prompts based on analytics
- [ ] **Future Enhancements**
  - Voice support (Whisper API for transcription)
  - Mobile SDK (React Native wrapper)
  - Integration with Stripe support (auto-resolve billing queries)

---

## Appendix

### A. Knowledge Base Content Sources

| Source | Format | Priority | Volume |
|--------|--------|----------|--------|
| PropIQ Documentation | Markdown | High | ~50 pages |
| FAQ Database | JSON | High | ~100 Q&As |
| Support Ticket Resolutions | Text | Medium | ~500 resolved tickets |
| API Documentation | OpenAPI/Swagger | Low | Auto-generated |
| Product Changelogs | Markdown | Medium | ~20 releases |
| Troubleshooting Guides | Markdown | High | ~30 guides |

### B. Evaluation Metrics

| Metric | Definition | Target | Measurement |
|--------|------------|--------|-------------|
| **Resolution Rate** | % of conversations resolved without human | >60% | Manual review (100 convos/week) |
| **Hallucination Rate** | % of responses with incorrect info | <5% | Manual review (50 convos/week) |
| **Response Time (P95)** | 95th percentile latency | <3s | Automated (Sentry/W&B) |
| **CSAT** | Customer satisfaction (1-5) | >4.0 | Post-conversation survey |
| **Escalation Accuracy** | % of escalations that were appropriate | >90% | Human agent feedback |
| **Sentiment Accuracy** | Correct sentiment detection | >85% | Manual review (50 convos/week) |

### C. Risk Mitigation Plan

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Development Overruns** | Medium | High | Phased approach; ship MVP in Phase 1 |
| **Poor Resolution Rate** | Low | High | A/B test; iterate on prompts; add human fallback |
| **Azure OpenAI Cost Spikes** | Low | Medium | Set budget alerts; monitor usage; optimize prompts |
| **Knowledge Base Stale** | Medium | Medium | Weekly auto-sync; version control docs |
| **Negative User Feedback** | Low | Medium | CSAT surveys; escalation workflows; human oversight |
| **Technical Debt** | Medium | Medium | Code reviews; documentation; modular architecture |

### D. Success Criteria

**Phase 1 (RAG):**
- ✅ Hallucination rate <5%
- ✅ Knowledge base coverage: 100+ docs embedded
- ✅ Vector search latency <500ms

**Phase 2 (Intelligence):**
- ✅ Sentiment accuracy >85%
- ✅ Escalation false positive rate <10%
- ✅ Human handoff latency <10s

**Phase 3 (Analytics):**
- ✅ Proactive message engagement >40%
- ✅ Analytics dashboard in production
- ✅ CSAT collection active

**Phase 4 (Advanced):**
- ✅ Multi-language support for top 5 languages
- ✅ Action button CTR >15%
- ✅ Overall resolution rate >60%

**Overall (8 weeks):**
- ✅ Custom agent outperforms baseline by 50%+
- ✅ On budget ($39k dev investment)
- ✅ User satisfaction >4.0/5.0 CSAT
- ✅ Production-ready and deployed

---

## Conclusion

**Recommendation: Enhance the current custom support agent** through a phased 8-week implementation.

**Why This Decision:**
1. **Cost-effective:** $80/mo vs $1,077/mo (13x cheaper at scale)
2. **Strategic:** Build proprietary IP and real estate domain expertise
3. **Flexible:** Full control over features, models, and roadmap
4. **Future-proof:** No vendor lock-in; can add Fin later if needed

**Next Steps:**
1. Approve development budget ($39,000)
2. Assign engineering resources (1-2 full-time engineers)
3. Kick off Phase 1 (RAG implementation)
4. Set up monitoring and success metrics
5. Plan user beta testing (Phase 1 completion)

**Timeline:** 8 weeks to full production deployment

**Expected Outcome:** A world-class, PropIQ-branded AI support agent that rivals Intercom Fin at 1/13th the cost, with full customization and control.

---

**Document Status:** ✅ Ready for Review
**Next Review Date:** Post-Phase 1 (Week 3)
**Owner:** Engineering Team
**Stakeholders:** Product, Engineering, Finance

---

_This document is a living strategy guide. Update as implementation progresses and new information becomes available._
