# PropIQ Database Architecture Analysis

**Date:** December 30, 2025
**Status:** 🟡 Database Sprawl Detected

---

## 🗄️ Current Database Situation

You're currently using **THREE** databases when you only need **ONE**:

| Database | Status | Usage | Cost | Recommendation |
|----------|--------|-------|------|----------------|
| **Convex** | ✅ Active | Frontend (React) | $0 (free tier) | **KEEP - Primary** |
| **Supabase** | ✅ Active | Backend (Python/FastAPI) | $0 (free tier) | **DEPRECATE** |
| **MongoDB** | ⚠️ Legacy | Deprecated | $0 (free tier) | **DELETE NOW** |

---

## 🔍 Analysis

### What I Found:

**Frontend (React):**
- Uses **Convex** extensively (69+ occurrences)
- Imports: `useQuery`, `useMutation` from Convex
- Files: `convex/auth.ts`, `convex/propiq.ts`, `convex/schema.ts`, etc.

**Backend (Python/FastAPI):**
- Uses **Supabase** (220+ occurrences)
- Files: `backend/database.py`, `backend/auth.py`, `backend/routers/*.py`
- Migrated from MongoDB → Supabase

**MongoDB:**
- Listed in `backend/.env` but **should be deprecated**
- CLAUDE.md mentions: "Database Collections (MongoDB Atlas)" but outdated

---

## 🤔 The Problem

**You have a split architecture:**
```
Frontend (React) → Convex
Backend (FastAPI) → Supabase
Legacy → MongoDB (unused)
```

**Issues with this setup:**
1. ❌ **Double database costs** (if you exceed free tiers)
2. ❌ **Data synchronization complexity** (Convex ↔ Supabase)
3. ❌ **Harder to maintain** (two database systems to learn)
4. ❌ **Slower development** (write code twice)
5. ❌ **More attack surface** (more API keys to rotate)

---

## ✅ Recommended Solution

### Option 1: Go All-In on Convex (RECOMMENDED)

**Benefits:**
- ✅ **One database** instead of three
- ✅ **No Python backend needed** (Convex has server functions)
- ✅ **Real-time by default** (better UX)
- ✅ **Simpler architecture** (just React + Convex)
- ✅ **Built-in auth** (no need for Supabase auth)
- ✅ **Type-safe** (TypeScript end-to-end)
- ✅ **Better DX** (Developer Experience)

**Convex can handle everything:**
- ✅ User authentication → `convex/auth.ts`
- ✅ Property analyses → `convex/propiq.ts`
- ✅ Payments (Stripe) → `convex/payments.ts`
- ✅ Support chat → `convex/support.ts`
- ✅ Email scheduling → `convex/emailScheduler.ts`
- ✅ Webhooks → `convex/http.ts`

**What you'd deprecate:**
- ❌ Supabase (database)
- ❌ Python FastAPI backend (or just keep for AI stuff)
- ❌ MongoDB (already deprecated)

**Keys to rotate:**
- ✅ Keep: Convex, Stripe, SendGrid, Azure OpenAI
- ❌ Delete: Supabase, MongoDB

---

### Option 2: Go All-In on Supabase

**Benefits:**
- ✅ **PostgreSQL** (industry standard)
- ✅ **Powerful backend** (Python/FastAPI for AI)
- ✅ **Row-level security** (built-in)

**Drawbacks:**
- ❌ No real-time by default (need to set up)
- ❌ Keep Python backend complexity
- ❌ More code to maintain

**What you'd deprecate:**
- ❌ Convex
- ❌ MongoDB

---

### Option 3: Keep Split Architecture (NOT RECOMMENDED)

**Only do this if:**
- Frontend needs real-time features Supabase doesn't offer
- Backend has complex AI workflows that need Python

**Requires:**
- Data sync between Convex ↔ Supabase
- Maintaining both systems
- More complexity

---

## 💡 My Recommendation

**Go with Option 1: All-In on Convex**

Here's why:

1. **You're already 80% there**
   - Frontend already uses Convex extensively
   - You have `convex/auth.ts`, `convex/payments.ts`, `convex/propiq.ts`
   - Most functionality is already in Convex

2. **Simpler is better**
   - One database = less complexity
   - Less code to maintain
   - Fewer keys to rotate
   - Lower risk of bugs

3. **Cost-effective**
   - Convex free tier is generous (1GB storage, 1M function calls/month)
   - Avoid paying for two databases when scaling

4. **Better for your use case**
   - Real-time updates (good for property analysis)
   - Type-safe (TypeScript everywhere)
   - Faster development

---

## 🚀 Migration Plan (If Going All-In on Convex)

### Phase 1: Audit Current Usage

```bash
# What's actually using Supabase?
grep -r "supabase" backend/routers/*.py

# What can move to Convex?
# Answer: Probably everything except AI analysis
```

### Phase 2: Move Backend Logic to Convex

**Already in Convex:**
- ✅ Auth (`convex/auth.ts`)
- ✅ Payments (`convex/payments.ts`)
- ✅ Property analysis (`convex/propiq.ts`)
- ✅ Support chat (`convex/support.ts`)
- ✅ Email scheduling (`convex/emailScheduler.ts`)

**Need to migrate from Supabase:**
- [ ] Any remaining user operations
- [ ] Legacy data migration

### Phase 3: Keep Python Backend ONLY for AI

You might want to keep `backend/routers/propiq.py` for:
- Azure OpenAI integration (complex AI workflows)
- But have it call Convex for data storage

```python
# backend/routers/propiq.py
# Keep for AI analysis, but store results in Convex
async def analyze_property(address: str):
    # Do AI analysis with Azure OpenAI
    analysis = await openai_analyze(address)

    # Store in Convex (not Supabase)
    await convex.mutation("propiq:saveAnalysis", analysis)

    return analysis
```

### Phase 4: Deprecate Supabase & MongoDB

1. **Export data from Supabase**
   ```bash
   # Export all tables as CSV
   # Import to Convex
   ```

2. **Remove Supabase code**
   ```bash
   # Delete backend/database.py
   # Delete backend/database_supabase.py
   # Remove SUPABASE_URL and SUPABASE_SERVICE_KEY from .env
   ```

3. **Delete MongoDB**
   ```bash
   # Already deprecated
   # Just remove MONGODB_URI from .env
   # Delete MongoDB cluster in MongoDB Atlas
   ```

### Phase 5: Update Environment Variables

**Before:**
```bash
# Three databases!
CONVEX_DEPLOY_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
MONGODB_URI=...
```

**After:**
```bash
# One database!
CONVEX_DEPLOY_KEY=...
# That's it!
```

---

## 🎯 Decision Matrix

**Choose Convex if:**
- ✅ You want simplicity
- ✅ You want real-time features
- ✅ TypeScript is your primary language
- ✅ You want to move fast

**Choose Supabase if:**
- ✅ You need complex SQL queries
- ✅ Python backend is critical
- ✅ You have PostgreSQL expertise
- ✅ You need row-level security

**Keep both if:**
- ⚠️ You have a very specific reason
- ⚠️ You're okay with the complexity
- ⚠️ You have data sync strategy

---

## 💰 Cost Impact

### Current (3 databases):
```
Convex: $0/month (free tier)
Supabase: $0/month (free tier)
MongoDB: $0/month (free tier, but deprecated)
Total: $0/month

IF you exceed free tiers:
Convex: $25/month
Supabase: $25/month
Total: $50/month
```

### After consolidation (1 database):
```
Convex only: $0/month (free tier)
Total: $0/month

IF you exceed free tier:
Convex: $25/month
Total: $25/month (50% savings!)
```

---

## 🔑 API Key Rotation Impact

### Current (3 databases):
```
Keys to rotate:
- Convex deploy key ✅ (already rotated)
- Supabase service key ⏳ (pending)
- MongoDB password ⏳ (pending)
Total: 3 database keys
```

### After consolidation (1 database):
```
Keys to rotate:
- Convex deploy key ✅ (already rotated)
Total: 1 database key (66% fewer keys!)
```

---

## ✅ Immediate Action Items

**Today:**
1. **Delete MongoDB** (it's already deprecated)
   ```bash
   # Remove from .env
   # Delete cluster in MongoDB Atlas
   # Remove from rotation list
   ```

2. **Decide: Convex vs Supabase**
   - If Convex → Plan migration
   - If Supabase → Remove Convex

3. **Update your rotation list**
   - Remove MongoDB (deprecated)
   - Remove Supabase if going with Convex

**This Week:**
4. **Execute migration** (if choosing Convex)
5. **Test thoroughly**
6. **Update documentation**

---

## 📊 Quick Comparison

| Feature | Convex | Supabase | MongoDB |
|---------|--------|----------|---------|
| **Real-time** | ✅ Built-in | ⚠️ Setup required | ❌ No |
| **TypeScript** | ✅ Native | ⚠️ Via SDK | ⚠️ Via SDK |
| **Auth** | ✅ Built-in | ✅ Built-in | ❌ DIY |
| **Serverless** | ✅ Yes | ✅ Yes | ⚠️ Atlas only |
| **Free Tier** | ✅ 1GB, 1M calls | ✅ 500MB, 2GB bandwidth | ✅ 512MB |
| **Webhooks** | ✅ Built-in | ⚠️ Functions | ❌ No |
| **File Storage** | ✅ Built-in | ✅ Built-in | ❌ GridFS only |
| **Learning Curve** | 🟢 Easy | 🟡 Medium | 🟡 Medium |
| **Vendor Lock-in** | ⚠️ Medium | 🟢 Low (PostgreSQL) | 🟢 Low |

---

## 🎯 My Strong Recommendation

**Switch to Convex-only and deprecate Supabase & MongoDB**

**Why:**
1. You're already using Convex heavily in frontend
2. Simplify your stack (1 database instead of 3)
3. Reduce API keys to rotate (1 instead of 3)
4. Save money if you exceed free tiers
5. Faster development
6. Better developer experience

**Migration effort:** ~1-2 days (mostly data migration)
**Long-term benefit:** Massive simplification

---

**Decision:** What do you want to do?

**Option A:** Go all-in on Convex (delete Supabase + MongoDB)
**Option B:** Go all-in on Supabase (delete Convex + MongoDB)
**Option C:** Keep split architecture (keep Convex + Supabase, delete MongoDB only)

Let me know and I'll help with the migration!
