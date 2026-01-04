# PropIQ: Migration to Convex-Only Architecture

**Date:** December 30, 2025
**Goal:** Remove all MongoDB and Supabase dependencies, use Convex exclusively
**Status:** 🚧 In Progress

---

## 📋 Files to Clean Up

### Backend Files to Remove/Modify

**Files to DELETE entirely:**
- [ ] `backend/database_mongodb.py` (if exists)
- [ ] `backend/database_supabase.py`
- [ ] `backend/database.py` (Supabase wrapper)
- [ ] `backend/test_supabase_connection.py`
- [ ] `backend/supabase_schema.sql`
- [ ] `backend/supabase_migration_add_last_login.sql`
- [ ] `backend/simulations/COMPLETE_MIGRATION.sql`
- [ ] `backend/simulations/RUN_THIS_IN_SUPABASE.sql`
- [ ] `backend/simulations/MIGRATION_INSTRUCTIONS.md`
- [ ] `backend/SUPABASE_SETUP.md`

**Files to MODIFY (remove Supabase/MongoDB imports):**
- [ ] `backend/routers/payment.py`
- [ ] `backend/routers/propiq.py`
- [ ] `backend/routers/support_chat.py`
- [ ] `backend/routers/support_chat_enhanced.py`
- [ ] `backend/routers/property_advisor_multiagent.py`
- [ ] `backend/auth.py`
- [ ] `backend/utils/onboarding_campaign.py`
- [ ] `backend/tests/conftest.py`
- [ ] `backend/tests/fixtures/seed_test_db.py`
- [ ] `backend/tests/integration/test_auth.py`
- [ ] `backend/config/env_validator.py`
- [ ] `backend/middleware/security_headers.py`
- [ ] `backend/simulations/create_test_users.py`
- [ ] `backend/simulations/delete_old_test_users.py`

**Environment files to CLEAN:**
- [ ] `backend/.env` - Remove MongoDB and Supabase keys
- [ ] `backend/.env.example` - Remove MongoDB and Supabase placeholders
- [ ] `backend/.env.template` - Remove MongoDB and Supabase sections
- [ ] `backend/.env.test.template` - Remove MongoDB and Supabase test configs
- [ ] `backend/.env.secure.template` - Remove MongoDB and Supabase sections

**Requirements to UPDATE:**
- [ ] `backend/requirements.txt` - Remove `pymongo`, `supabase`, related packages

### Documentation Files to Update

- [ ] `CLAUDE.md` (main project memory) - Update architecture section
- [ ] `README.md` - Update database info
- [ ] `backend/README.md` - Update setup instructions
- [ ] `backend/QUICK_START.md` - Remove Supabase setup
- [ ] `backend/DEPLOYMENT_COMPLETE.md` - Update deployment info
- [ ] `backend/INTEGRATION_SUMMARY.md` - Remove Supabase section
- [ ] `DATABASE_ARCHITECTURE_ANALYSIS.md` - Mark as completed
- [ ] All sprint docs mentioning MongoDB/Supabase
- [ ] All deployment guides mentioning MongoDB/Supabase

### Chrome Extension to Clean

**Files to check in `/Users/briandusape/Projects/propiq-extension/`:**
- [ ] Check all `.js`, `.ts` files for MongoDB/Supabase references
- [ ] Update `.env` if it has Supabase keys
- [ ] Update any API configuration files

---

## 🔧 Environment Variable Changes

### BEFORE (backend/.env):
```bash
# MongoDB (REMOVE)
MONGODB_URI=mongodb+srv://...

# Supabase (REMOVE)
SUPABASE_URL=https://yvaujsbktvkzoxfzeimn.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_KEY=sb_secret_...

# Keep these
CONVEX_DEPLOY_KEY=...
STRIPE_SECRET_KEY=...
AZURE_OPENAI_KEY=...
SENDGRID_API_KEY=...
```

### AFTER (backend/.env):
```bash
# Convex (KEEP)
CONVEX_DEPLOY_KEY=...

# Stripe (KEEP)
STRIPE_SECRET_KEY=...

# Azure OpenAI (KEEP)
AZURE_OPENAI_KEY=...

# SendGrid (KEEP)
SENDGRID_API_KEY=...

# JWT (KEEP)
JWT_SECRET=...

# Slack (KEEP)
SLACK_WEBHOOK_URL=...
```

---

## 📦 Dependencies to Remove

### backend/requirements.txt

**REMOVE these:**
```
pymongo>=4.0.0
motor  # Async MongoDB driver
supabase>=1.0.0
postgrest-py  # Supabase dependency
```

**KEEP these:**
```
fastapi
uvicorn
python-jose[cryptography]
passlib[bcrypt]
stripe
openai / azure-openai
sendgrid
requests
pydantic
```

---

## 🗄️ Database Migration (if needed)

### Option 1: Data already in Convex
If you've been using Convex primarily, no migration needed!

### Option 2: Data in Supabase that needs migration
```bash
# 1. Export from Supabase
# Go to Supabase Dashboard → Database → Export
# Download as CSV

# 2. Import to Convex
# Use Convex import scripts (create if needed)
npx convex import:users users.csv
npx convex import:analyses analyses.csv
```

---

## ✅ Cleanup Checklist

### Phase 1: Backup (DONE FIRST!)
- [x] Backup current .env files
- [ ] Backup Supabase data (if any important data exists)
- [ ] Take database snapshot

### Phase 2: Remove Files
- [ ] Delete database_supabase.py
- [ ] Delete database.py (old wrapper)
- [ ] Delete test_supabase_connection.py
- [ ] Delete all Supabase SQL migration files
- [ ] Delete Supabase setup documentation

### Phase 3: Update Code
- [ ] Remove Supabase imports from all routers
- [ ] Remove MongoDB imports (if any remain)
- [ ] Update tests to not use Supabase
- [ ] Fix any broken imports

### Phase 4: Update Environment
- [ ] Clean backend/.env
- [ ] Clean backend/.env.example
- [ ] Clean all .env templates
- [ ] Update requirements.txt
- [ ] Run `pip install -r requirements.txt` to remove old deps

### Phase 5: Update Documentation
- [ ] Update CLAUDE.md
- [ ] Update README.md
- [ ] Update all deployment guides
- [ ] Update sprint documentation

### Phase 6: Chrome Extension
- [ ] Check for Supabase/MongoDB references
- [ ] Update extension .env if needed
- [ ] Test extension functionality

### Phase 7: Testing
- [ ] Test PropIQ functionality
- [ ] Verify Convex queries work
- [ ] Test auth flow
- [ ] Test payment flow
- [ ] Test property analysis

### Phase 8: Final Cleanup
- [ ] Update API key rotation list
- [ ] Delete MongoDB cluster in MongoDB Atlas
- [ ] Delete/pause Supabase project
- [ ] Update SERVICE_SUBSCRIPTIONS_TRACKER.md
- [ ] Commit changes to git

---

## 🎯 Post-Migration Benefits

### Reduced Complexity
- ✅ 1 database instead of 3
- ✅ Fewer environment variables
- ✅ Simpler deployment
- ✅ Less code to maintain

### Reduced API Keys
**Before:** 7 database-related keys
- Convex deploy key
- Supabase anon key
- Supabase service key
- MongoDB password
- (Plus Stripe, Azure, SendGrid)

**After:** 1 database-related key
- Convex deploy key
- (Plus Stripe, Azure, SendGrid)

### Cost Savings
- Free tier: Stay on Convex free (no Supabase + MongoDB)
- Paid tier: $25/month for Convex vs $50/month for both

---

## 🚀 Quick Migration Script

I'll create automated scripts to help with cleanup.

---

**Next Steps:**
1. Review this plan
2. Backup important data
3. Run cleanup scripts
4. Test thoroughly
5. Update rotation list
