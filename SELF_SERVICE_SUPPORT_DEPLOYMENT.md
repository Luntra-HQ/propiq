# Self-Service Support System - Deployment Guide

This document explains how to deploy the new self-service support system to PropIQ.

## What Was Built

We've implemented a comprehensive modern self-service support layer for PropIQ, including:

### 1. **Help Center** with AI-Powered Search
- 10+ knowledge base articles covering getting started, troubleshooting, billing, and property analysis
- Full-text search with Convex search indexes
- Category browsing and popular articles
- Article feedback system (helpful/unhelpful votes)
- Failed search tracking for continuous improvement

### 2. **Onboarding Checklist**
- 7-task checklist to guide new users to first value
- Progress tracking with visual progress circle
- Auto-dismisses after 7 days or 100% completion
- Completion reward modal with bonus analyses

### 3. **Database Schema Extensions**
New Convex tables added:
- `articles` - Knowledge base content with search indexes
- `articleFeedback` - User feedback on articles
- `failedSearches` - Track searches with no results
- `onboardingProgress` - User onboarding task completion
- `supportTickets` - Human escalation (foundation for future)
- `npsResponses` - Net Promoter Score surveys (foundation for future)

### 4. **React Components**
- `HelpCenter.tsx` - Main help center modal with search and article viewer
- `OnboardingChecklist.tsx` - Collapsible onboarding checklist banner
- Enhanced `App.tsx` - Integrated help button in header

### 5. **Convex Functions**
- `articles.ts` - Query/mutation functions for knowledge base
- `onboarding.ts` - Track user onboarding progress
- `seedArticles.ts` - Seed script to populate initial articles

## Deployment Steps

### Step 1: Deploy Convex Schema Changes

The schema has been updated with new tables. Deploy it:

\`\`\`bash
cd /home/user/propiq
npx convex deploy
\`\`\`

This will:
- Add the new tables to your Convex database
- Create search indexes for articles
- Set up all necessary indexes

### Step 2: Seed Knowledge Base Articles

Run the seed script to populate the help center with 10+ articles:

\`\`\`bash
# In the Convex dashboard, run this mutation:
npx convex run seedArticles:seedKnowledgeBase
\`\`\`

Or use the Convex dashboard:
1. Go to https://dashboard.convex.dev
2. Select your PropIQ project
3. Go to "Functions" → "Mutations"
4. Find `seedArticles/seedKnowledgeBase`
5. Click "Run" (no arguments needed)

This will create 10 articles:
1. What is PropIQ? Complete overview
2. How to analyze your first property in 30 seconds
3. Understanding your property analysis report
4. How to use the Deal Calculator
5. Trial limits, subscriptions, and top-ups explained
6. Address not recognized? Fix guide
7. Analysis taking too long? Troubleshooting
8. Understanding error messages
9. Common calculator input mistakes
10. How to manage your subscription

### Step 3: Install Frontend Dependencies

The Help Center uses `react-markdown` to render article content:

\`\`\`bash
cd /home/user/propiq/frontend
npm install react-markdown
\`\`\`

(Already installed in this deployment)

### Step 4: Build and Deploy Frontend

\`\`\`bash
cd /home/user/propiq/frontend
npm run build
\`\`\`

Then deploy to your hosting provider (Azure Static Web Apps, Netlify, etc.)

### Step 5: Verify Deployment

1. **Check Help Center:**
   - Click the "Help" button in the header
   - Search for "analyze property"
   - Verify articles load and search works

2. **Check Onboarding Checklist:**
   - Create a new test user account
   - Verify checklist appears at top of page
   - Complete tasks and verify progress updates

3. **Check Article Feedback:**
   - Open any article
   - Click "Yes" or "No" on "Was this helpful?"
   - Verify vote count increments

## Configuration

### Onboarding Checklist Timing

The checklist shows for the first **7 days** after signup. To change this:

Edit `frontend/src/components/OnboardingChecklist.tsx`:
\`\`\`typescript
const shouldShow = !isDismissed && daysActive <= 7 && completionPercentage !== 100;
// Change 7 to your desired number of days
\`\`\`

### Article Categories

Current categories:
- `getting-started`
- `property-analysis`
- `calculator`
- `troubleshooting`
- `billing`
- `advanced`
- `education`

To add more categories, update the `categoryLabels` object in `HelpCenter.tsx`.

## Adding More Articles

### Via Code (Recommended for Batch)

1. Edit `convex/seedArticles.ts`
2. Add new article objects to the `articles` array
3. Run the seed script again (it will insert new articles)

### Via Convex Dashboard (Recommended for Single Articles)

1. Go to Convex dashboard → Data → `articles` table
2. Click "Insert Document"
3. Fill in required fields:
   - `title`: Article title
   - `slug`: URL-friendly identifier (e.g., "how-to-export-reports")
   - `content`: Markdown content
   - `excerpt`: Short summary (1-2 sentences)
   - `category`: One of the categories above
   - `tags`: Array of keywords (e.g., ["export", "pdf", "report"])
   - `published`: `true` to make live
   - `featured`: `true` to show in "Popular Articles"
   - `viewCount`: `0`
   - `helpfulVotes`: `0`
   - `unhelpfulVotes`: `0`
   - `createdAt`: `Date.now()`
   - `updatedAt`: `Date.now()`

## Future Enhancements (Not Yet Implemented)

The architecture supports these future features:

### 1. **Enhanced AI Chat Integration**
- Train AI assistant on knowledge base articles
- Auto-suggest articles during chat conversations
- See `convex/supportTickets.ts` for human escalation foundation

### 2. **Contextual Tooltips**
- Add help icons next to complex features
- Progressive disclosure (show only first 3 times)
- Track tooltip dismissals per user

### 3. **Proactive Nudges**
- Detect when user is stuck (60s on input field)
- Auto-open help suggestions
- Usage-based prompts (e.g., at 75% trial usage)

### 4. **Analytics Dashboard**
- View metrics: deflection rate, CSAT, article views
- Failed search report
- Most/least helpful articles

### 5. **NPS Surveys**
- Trigger after 30 days of paid subscription
- See `convex/npsResponses.ts` for schema

### 6. **Support Tickets**
- "Talk to a human" button in chat
- Async in-app messaging
- See `convex/supportTickets.ts` for schema

## Metrics to Track

After deployment, monitor these KPIs:

### Baseline (Before Self-Service)
- Support requests: ~50/week (estimated)
- Avg response time: 4-6 hours
- Deflection rate: ~30% (AI chat only)

### Goals (30 Days After Launch)
- 📉 Reduce support requests by **50%** (50/week → 25/week)
- ⚡ Improve response time to **<2 hours**
- 🎯 Increase deflection rate to **70%+**
- 📈 Increase trial-to-paid conversion by **20%**
- ⭐ Achieve CSAT >**4.5/5**
- 📚 70% of users view **at least 1 article** in first 7 days
- ✅ 60% of users complete **onboarding checklist**

### Where to Track Metrics

**Convex Dashboard Queries:**

\`\`\`javascript
// Most viewed articles (last 30 days)
SELECT title, viewCount FROM articles ORDER BY viewCount DESC LIMIT 10

// Failed searches (identify content gaps)
SELECT query, COUNT(*) as count FROM failedSearches
GROUP BY query ORDER BY count DESC LIMIT 20

// Onboarding completion rate
SELECT
  COUNT(*) as total_users,
  SUM(checklistCompletedAt IS NOT NULL) as completed_users,
  (SUM(checklistCompletedAt IS NOT NULL) * 100.0 / COUNT(*)) as completion_rate
FROM onboardingProgress
\`\`\`

## Troubleshooting

### Help Center Won't Open
- Check browser console for errors
- Verify `showHelpCenter` state is updating
- Check that `HelpCenter` component is imported correctly

### Articles Not Loading
- Verify seed script ran successfully
- Check Convex dashboard → Data → `articles` table
- Ensure `published` field is `true`

### Search Not Working
- Verify search indexes were created (check Convex dashboard → Schema)
- Try rebuilding indexes: Convex dashboard → Schema → Rebuild Indexes
- Check that `searchArticles` query is returning results

### Onboarding Checklist Not Showing
- Check user's `createdAt` timestamp (must be within 7 days)
- Verify `onboardingProgress` table has entry for user
- Check `checklistDismissed` is `false`

## Support

For questions or issues:
- **Email:** support@luntra.one
- **Slack:** #propiq-engineering
- **Docs:** This file + code comments

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
├─────────────────────────────────────────────────────────────┤
│  App.tsx                                                    │
│    ├─ Header (Help Button)                                 │
│    ├─ OnboardingChecklist (7 tasks)                        │
│    └─ HelpCenter Modal                                     │
│         ├─ Search Bar (full-text search)                   │
│         ├─ Popular Articles                                │
│         ├─ Browse by Category                              │
│         └─ Article Viewer                                  │
│              ├─ Markdown Content (react-markdown)          │
│              └─ Feedback (👍👎)                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Convex Backend                         │
├─────────────────────────────────────────────────────────────┤
│  articles.ts (Queries & Mutations)                          │
│    ├─ getAllArticles()                                     │
│    ├─ searchArticles() ← Search Indexes                    │
│    ├─ submitArticleFeedback()                              │
│    └─ logFailedSearch()                                    │
│                                                             │
│  onboarding.ts (Queries & Mutations)                        │
│    ├─ getProgress()                                        │
│    ├─ updateTask()                                         │
│    └─ getCompletionPercentage()                            │
│                                                             │
│  seedArticles.ts (One-time Setup)                           │
│    └─ seedKnowledgeBase() → Inserts 10+ articles           │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Convex Database                           │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                    │
│    ├─ articles (title, content, category, tags, votes)     │
│    ├─ articleFeedback (articleId, userId, vote, comment)   │
│    ├─ failedSearches (query, userId, resultsCount)         │
│    ├─ onboardingProgress (userId, 7 task booleans)         │
│    ├─ supportTickets (future: human escalation)            │
│    └─ npsResponses (future: NPS surveys)                   │
│                                                             │
│  Indexes:                                                   │
│    ├─ by_slug, by_category, by_published                   │
│    ├─ search_title, search_content (full-text)             │
│    └─ by_user (onboarding, feedback, tickets)              │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Files Changed/Added

### New Files
- `convex/articles.ts` - Article queries/mutations
- `convex/onboarding.ts` - Onboarding progress tracking
- `convex/seedArticles.ts` - KB seeding script
- `frontend/src/components/HelpCenter.tsx` - Help center UI
- `frontend/src/components/HelpCenter.css` - Help center styles
- `frontend/src/components/OnboardingChecklist.tsx` - Checklist UI
- `frontend/src/components/OnboardingChecklist.css` - Checklist styles

### Modified Files
- `convex/schema.ts` - Added 6 new tables
- `frontend/src/App.tsx` - Integrated help button and components
- `frontend/package.json` - Added react-markdown dependency

## Next Steps (Post-Deployment)

1. **Week 1:**
   - Monitor article view counts
   - Identify failed searches → write new articles
   - Track onboarding completion rate

2. **Week 2-4:**
   - Add more articles based on support ticket patterns
   - Enhance AI chat to suggest articles
   - Add contextual tooltips throughout app

3. **Month 2:**
   - Build analytics dashboard
   - Implement NPS surveys
   - Add in-app messaging for human escalation

4. **Month 3:**
   - Launch community forum (if demand exists)
   - Create video tutorial library
   - Build API documentation (for Elite users)

---

**Deployment Checklist:**
- [ ] Deploy Convex schema (`npx convex deploy`)
- [ ] Seed knowledge base articles (`convex run seedArticles:seedKnowledgeBase`)
- [ ] Build frontend (`npm run build`)
- [ ] Deploy frontend to hosting
- [ ] Verify Help Center opens and search works
- [ ] Verify onboarding checklist appears for new users
- [ ] Test article feedback (thumbs up/down)
- [ ] Monitor metrics for 30 days

---

*Implementation Date: 2025-11-24*
*Version: 1.0*
*Author: Claude Code + PropIQ Team*
