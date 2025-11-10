# Feedback System Implementation Guide

**Created**: 2025-11-10
**Status**: Ready for Implementation
**Priority**: HIGH (Critical for product evaluation)

---

## Overview

Complete feedback collection system to measure product-market fit and guide pivot vs persevere decisions.

### What's Included

1. **Framework Document** (`PRODUCT_EVALUATION_FRAMEWORK.md`)
   - 5 evaluation dimensions with scoring
   - Quantitative metrics (retention, NPS, revenue)
   - Qualitative signals (PMF survey, interviews)
   - Decision matrix (Scale/Persevere/Iterate/Pivot/Kill)

2. **Backend API** (`backend/routers/feedback.py`)
   - CSAT survey endpoints
   - NPS survey endpoints
   - PMF survey endpoints (Sean Ellis test)
   - Feature request submission
   - Bug report submission
   - Interview scheduling
   - Analytics endpoints

3. **Database Schema** (`backend/migrations/006_feedback_system.sql`)
   - 6 tables for feedback data
   - RLS policies for security
   - Helper functions for voting

---

## Quick Start (5 Steps)

### Step 1: Run Database Migration (5 min)

```bash
# Connect to your Supabase instance
# Execute migration 006

# Via Supabase SQL Editor:
1. Go to https://app.supabase.com/project/YOUR_PROJECT/sql
2. Copy contents of backend/migrations/006_feedback_system.sql
3. Click "Run"
4. Verify: Should see "Migration 006: Feedback System - COMPLETE"

# Or via psql:
psql $DATABASE_URL < backend/migrations/006_feedback_system.sql
```

**Verify tables created**:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'feedback%';

-- Should return:
-- feedback_surveys
-- feedback_feature_requests
-- feedback_feature_votes
-- feedback_bug_reports
-- feedback_interview_requests
```

---

### Step 2: Integrate Feedback Router (2 min)

Edit `backend/api.py` and add the feedback router:

```python
# Add after analysis_history router (around line 280)

# Import and include feedback router
try:
    from routers.feedback import router as feedback_router
    app.include_router(feedback_router)
    logger.info("Feedback router registered (CSAT, NPS, PMF, feature requests)")
except ImportError as e:
    logger.warning(f"Feedback router not available: {e}")
```

**Update OpenAPI tags** (around line 92):

```python
{
    "name": "Feedback & Evaluation",
    "description": "CSAT, NPS, PMF surveys, feature requests, bug reports, and interview scheduling."
},
```

---

### Step 3: Test API Endpoints (5 min)

```bash
# 1. Start the server
uvicorn api:app --reload

# 2. Open API docs
open http://localhost:8000/docs

# 3. Verify new endpoints appear under "Feedback & Evaluation":
#    - POST /api/v1/feedback/csat
#    - POST /api/v1/feedback/nps
#    - POST /api/v1/feedback/pmf
#    - GET  /api/v1/feedback/csat/analytics
#    - GET  /api/v1/feedback/nps/analytics
#    - GET  /api/v1/feedback/pmf/analytics
#    - POST /api/v1/feedback/feature-request
#    - POST /api/v1/feedback/bug-report
#    - POST /api/v1/feedback/interview/request
#    - GET  /api/v1/feedback/analytics/overview

# 4. Test health check (no auth required)
curl http://localhost:8000/api/v1/feedback/health
# Should return: {"status":"healthy","service":"feedback","version":"1.0.0"}
```

---

### Step 4: Set Up Analytics Tool (15 min)

**Recommended**: PostHog (open-source, self-hosted)

```bash
# Option 1: PostHog Cloud (Free tier: 1M events/month)
# 1. Sign up at https://posthog.com
# 2. Create project
# 3. Copy Project API Key
# 4. Add to .env:
POSTHOG_PROJECT_KEY=phc_xxxxxxxxxxxx
POSTHOG_HOST=https://app.posthog.com

# Option 2: Self-hosted PostHog
docker run -d \
  --name posthog \
  -p 8001:8000 \
  -e POSTHOG_SECRET_KEY='your-secret-key' \
  posthog/posthog:latest

# Option 3: Amplitude (Alternative)
# Sign up at https://amplitude.com
# Free tier: 10M events/month
```

**Implement event tracking** (frontend):

```javascript
// Install PostHog
npm install posthog-js

// Initialize (in App.tsx or main entry point)
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST
})

// Track key events
posthog.capture('analysis_completed', {
  property_type: 'single_family',
  verdict: 'buy',
  duration_seconds: 120
})

posthog.capture('user_signed_up', {
  plan: 'free',
  source: 'organic'
})

// Identify user (on login)
posthog.identify(user.id, {
  email: user.email,
  plan: user.subscription_tier,
  signup_date: user.created_at
})
```

---

### Step 5: Implement In-App Surveys (30 min)

**Option 1: Custom React Components** (Recommended for control)

```typescript
// components/surveys/CSATSurvey.tsx
import { useState } from 'react'

export function CSATSurvey({ onSubmit, onDismiss }) {
  const [rating, setRating] = useState(null)
  const [comment, setComment] = useState('')

  const handleSubmit = async () => {
    const response = await fetch('/api/v1/feedback/csat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        rating,
        comment,
        context: 'post_analysis'
      })
    })

    if (response.ok) {
      onSubmit()
    }
  }

  return (
    <div className="survey-modal">
      <h3>How satisfied were you with this analysis?</h3>
      <div className="rating-buttons">
        {[1, 2, 3, 4, 5].map(score => (
          <button
            key={score}
            onClick={() => setRating(score)}
            className={rating === score ? 'selected' : ''}
          >
            {score === 1 ? '😞' : score === 2 ? '😕' : score === 3 ? '😐' : score === 4 ? '🙂' : '😀'}
          </button>
        ))}
      </div>
      {rating && (
        <>
          <textarea
            placeholder="Any feedback to share? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={onDismiss}>Skip</button>
        </>
      )}
    </div>
  )
}

// Show survey after every 5th analysis
useEffect(() => {
  const analysisCount = localStorage.getItem('analysis_count') || 0
  if (analysisCount % 5 === 0 && analysisCount > 0) {
    setShowCSATSurvey(true)
  }
}, [analysisCompleted])
```

**Option 2: Third-party Survey Tools**

```javascript
// Hotjar (Free for 35 responses/day)
// Add to index.html
<script>
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>

// Trigger survey
hotjar.event('analysis_completed')
```

---

## Implementation Checklist

### Phase 1: Backend Setup (Day 1)
- [ ] Run database migration 006
- [ ] Integrate feedback router in api.py
- [ ] Update OpenAPI documentation tags
- [ ] Test all feedback endpoints
- [ ] Verify RLS policies working

### Phase 2: Analytics Setup (Day 2)
- [ ] Sign up for PostHog/Amplitude
- [ ] Install analytics SDK in frontend
- [ ] Implement 10 core events (see below)
- [ ] Test event tracking in dev
- [ ] Set up basic dashboard

### Phase 3: Survey Implementation (Day 3-4)
- [ ] Build CSAT survey component
- [ ] Build NPS survey component
- [ ] Build PMF survey component
- [ ] Implement survey triggers
- [ ] Test survey flow end-to-end

### Phase 4: Interview System (Day 5)
- [ ] Set up Calendly account
- [ ] Create interview booking flow
- [ ] Set up email notifications
- [ ] Test booking process

### Phase 5: Dashboard & Monitoring (Week 2)
- [ ] Create feedback analytics dashboard
- [ ] Set up weekly metric snapshots
- [ ] Create evaluation scorecard
- [ ] Schedule monthly review meetings

---

## 10 Core Events to Track

**User Lifecycle**:
1. `user_signed_up` - User completes signup
2. `first_analysis_completed` - User completes first analysis (activation)
3. `return_visit` - User returns after 7+ days

**Engagement**:
4. `analysis_started` - User starts property analysis
5. `analysis_completed` - User completes analysis (with verdict)
6. `analysis_exported` - User exports analysis

**Monetization**:
7. `pricing_page_viewed` - User views pricing
8. `upgrade_initiated` - User clicks upgrade button
9. `payment_completed` - Payment successful

**Feedback**:
10. `survey_completed` - User completes any survey (CSAT/NPS/PMF)

---

## Survey Trigger Logic

### CSAT Survey
```javascript
// Trigger: After every 5th analysis
const analysisCount = parseInt(localStorage.getItem('analysis_count') || '0')

if (analysisCount > 0 && analysisCount % 5 === 0) {
  // Check if user hasn't seen CSAT in last 24 hours
  const lastCSAT = localStorage.getItem('last_csat_survey')
  const hoursSince = (Date.now() - parseInt(lastCSAT)) / (1000 * 60 * 60)

  if (!lastCSAT || hoursSince > 24) {
    showCSATSurvey()
    localStorage.setItem('last_csat_survey', Date.now().toString())
  }
}
```

### NPS Survey
```javascript
// Trigger: After 7 days of usage, then monthly
const signupDate = new Date(user.created_at)
const daysSinceSignup = (Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24)

if (daysSinceSignup >= 7) {
  const lastNPS = localStorage.getItem('last_nps_survey')
  const daysSinceNPS = lastNPS ? (Date.now() - parseInt(lastNPS)) / (1000 * 60 * 60 * 24) : 999

  if (daysSinceNPS >= 30) {
    showNPSSurvey()
    localStorage.setItem('last_nps_survey', Date.now().toString())
  }
}
```

### PMF Survey (Sean Ellis Test)
```javascript
// Trigger: After 3 completed analyses (only once)
const analysisCount = parseInt(localStorage.getItem('analysis_count') || '0')
const pmfCompleted = localStorage.getItem('pmf_survey_completed')

if (analysisCount >= 3 && !pmfCompleted) {
  showPMFSurvey()
  // Mark as completed after submission
  localStorage.setItem('pmf_survey_completed', 'true')
}
```

---

## API Usage Examples

### Submit CSAT Survey
```bash
curl -X POST http://localhost:8000/api/v1/feedback/csat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Love the AI insights!",
    "context": "post_analysis"
  }'
```

### Submit NPS Survey
```bash
curl -X POST http://localhost:8000/api/v1/feedback/nps \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 9,
    "comment": "Would definitely recommend"
  }'
```

### Submit PMF Survey
```bash
curl -X POST http://localhost:8000/api/v1/feedback/pmf \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "very_disappointed",
    "primary_benefit": "Saves me hours of manual analysis"
  }'
```

### Get PMF Analytics
```bash
curl -X GET http://localhost:8000/api/v1/feedback/pmf/analytics \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "success": true,
  "very_disappointed_pct": 45.2,
  "total_responses": 42,
  "status": "🚀 STRONG PMF",
  "recommendation": "You have strong product-market fit! Focus on growth and scale."
}
```

### Get Feedback Overview
```bash
curl -X GET http://localhost:8000/api/v1/feedback/analytics/overview \
  -H "Authorization: Bearer $TOKEN"
```

---

## Monthly Evaluation Process

### Week 1-4: Data Collection
- Let surveys collect responses naturally
- Conduct 2-3 user interviews per week
- Track key metrics daily

### End of Month: Evaluation Meeting

**Agenda** (90 minutes):

1. **Review Metrics** (30 min)
   - Update evaluation scorecard
   - Calculate scores for each dimension
   - Identify trends (improving or declining)

2. **User Feedback Review** (20 min)
   - Review NPS comments
   - Review PMF survey responses
   - Share interview insights
   - Common themes and pain points

3. **Calculate Overall Score** (10 min)
   - Use scoring framework from `PRODUCT_EVALUATION_FRAMEWORK.md`
   - Calculate weighted average
   - Check for red flag overrides

4. **Make Decision** (20 min)
   - SCALE / PERSEVERE / ITERATE / PIVOT / KILL?
   - If pivot: What would change?
   - What's next milestone?
   - Resource allocation

5. **Document & Share** (10 min)
   - Write up decision rationale
   - Update roadmap
   - Share with stakeholders

---

## Dashboard Setup

### Option 1: Simple Google Sheets Dashboard

Create a Google Sheet with these tabs:

**Tab 1: Scorecard**
```
| Dimension | Current | Target | Score | Status |
|-----------|---------|--------|-------|--------|
| PMF       | TBD     | 80%    | 0     | 🔴     |
| Engagement| TBD     | 75%    | 0     | 🔴     |
| Financial | TBD     | 70%    | 0     | 🔴     |
| Technical | TBD     | 85%    | 0     | 🔴     |
| Competitive| TBD    | 65%    | 0     | 🔴     |
| OVERALL   | TBD     | 75%    | 0     | 🔴     |
```

**Tab 2: Weekly Metrics**
```
| Week | Signups | DAU | WAU | Retention % | MRR | NPS | PMF % |
|------|---------|-----|-----|-------------|-----|-----|-------|
| 1    |         |     |     |             |     |     |       |
| 2    |         |     |     |             |     |     |       |
```

**Tab 3: User Interview Notes**
```
| Date | User | Problem Severity (1-10) | Solution Fit (1-10) | WTP (1-10) | Key Insights |
|------|------|-------------------------|---------------------|------------|--------------|
```

### Option 2: Notion Dashboard

Use the template in `PRODUCT_EVALUATION_FRAMEWORK.md` to create a Notion page with:
- Metric tracking table
- Survey response database
- Interview notes
- Decision log

---

## Troubleshooting

### Issue: Migration fails with "relation already exists"
**Solution**: Tables may already exist. Drop them first:
```sql
DROP TABLE IF EXISTS feedback_surveys CASCADE;
DROP TABLE IF EXISTS feedback_feature_requests CASCADE;
-- ... etc
-- Then re-run migration
```

### Issue: RLS policies blocking inserts
**Solution**: Verify you're authenticated:
```bash
# Check JWT includes user_id
curl -X GET http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Issue: Survey not triggering
**Solution**: Check browser localStorage:
```javascript
// In browser console
localStorage.getItem('analysis_count')
localStorage.getItem('last_csat_survey')
localStorage.getItem('pmf_survey_completed')

// Clear to reset
localStorage.clear()
```

### Issue: Analytics endpoint returns 0 responses
**Solution**: Verify data exists:
```sql
SELECT COUNT(*) FROM feedback_surveys WHERE survey_type = 'pmf';
SELECT COUNT(*) FROM feedback_surveys WHERE survey_type = 'nps';
SELECT COUNT(*) FROM feedback_surveys WHERE survey_type = 'csat';
```

---

## Next Steps

1. **Immediate** (This week):
   - [ ] Run migration 006
   - [ ] Integrate feedback router
   - [ ] Test all endpoints
   - [ ] Set up PostHog

2. **Short-term** (Next 2 weeks):
   - [ ] Implement in-app surveys
   - [ ] Set up interview system
   - [ ] Create evaluation dashboard
   - [ ] Conduct first 5 user interviews

3. **Ongoing** (Monthly):
   - [ ] Review feedback metrics
   - [ ] Calculate evaluation score
   - [ ] Make pivot/persevere decision
   - [ ] Iterate based on feedback

---

## Success Metrics

**You'll know the system is working when**:

- ✅ Getting 10+ survey responses per week
- ✅ NPS calculated with statistical significance (20+ responses)
- ✅ PMF score >40% "Very disappointed"
- ✅ Conducting 2-3 user interviews per week
- ✅ Clear trends visible in metrics dashboard
- ✅ Decision-making data-driven (not gut-feel)

---

## Related Documents

- `PRODUCT_EVALUATION_FRAMEWORK.md` - Complete evaluation framework
- `backend/routers/feedback.py` - Feedback API implementation
- `backend/migrations/006_feedback_system.sql` - Database schema
- `API_DOCUMENTATION.md` - Full API reference

---

## Support

Questions? Check:
1. API docs: http://localhost:8000/docs
2. Framework document: `PRODUCT_EVALUATION_FRAMEWORK.md`
3. Database schema: `backend/migrations/006_feedback_system.sql`

---

**Good luck! 🚀 May your PMF score be high!**
