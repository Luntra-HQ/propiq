# PropIQ Backend - Quick Start

## Deployment Status: LIVE

**URL:** https://luntra.onrender.com
**Status:** All services healthy

---

## ONE FINAL STEP REQUIRED

### Add `last_login` column to Supabase

**Why:** Your existing Supabase table is missing this column. User signup will fail without it.

**How to fix (takes 30 seconds):**

1. Go to: https://supabase.com/dashboard/project/yvaujsbktvkzoxfzeimn/sql

2. Paste this SQL and click "Run":
```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT NOW();
```

3. Test signup:
```bash
curl -X POST https://luntra.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

You should see a success response with a JWT token.

---

## Quick API Tests

### Health Checks
```bash
# Main health
curl https://luntra.onrender.com/health

# PropIQ health
curl https://luntra.onrender.com/propiq/health

# Stripe health
curl https://luntra.onrender.com/stripe/health
```

### User Signup
```bash
curl -X POST https://luntra.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPassword123!","firstName":"First","lastName":"Last"}'
```

### User Login
```bash
curl -X POST https://luntra.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPassword123!"}'
```

---

## Configured Services

### Supabase (Database)
- **URL:** https://yvaujsbktvkzoxfzeimn.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/yvaujsbktvkzoxfzeimn
- **Tables:** users, property_analyses, support_chats

### Stripe (Payments)
- **Account:** bdusape@luntra.one (LUNTRA startup benefits)
- **Webhook:** https://luntra.onrender.com/stripe/webhook
- **Tiers:**
  - Starter: $69/mo (30 analyses)
  - Pro: $99/mo (60 analyses)
  - Elite: $149/mo (100 analyses)

### Azure OpenAI (AI Analysis)
- **Model:** gpt-4o-mini
- **Deployment:** luntra-openai-service
- **Status:** Configured and working

### Weights & Biases (AI Tracking)
- **Project:** propiq-analysis
- **Status:** Configured

---

## View Logs

**Render Dashboard:** https://dashboard.render.com

Or via API:
```bash
curl -s "https://api.render.com/v1/services/srv-d3sh7hmmcj7s73b8baj0/deploys/dep-d3si7a7diees73cjbsjg/logs" \
  -H "Authorization: Bearer rnd_fH4GkAJsO3aVWcTvigW4HiZcvOSo"
```

---

## Documentation

- `DEPLOYMENT_COMPLETE.md` - Full deployment summary
- `SUPABASE_SETUP.md` - Comprehensive Supabase guide
- `supabase_schema.sql` - Complete database schema
- `supabase_migration_add_last_login.sql` - Migration SQL

---

## Next Actions

1. Run Supabase migration (above)
2. Test user signup/login
3. Update frontend to use https://luntra.onrender.com
4. Test full property analysis flow
5. Test Stripe checkout
6. Deploy frontend

---

**Questions?** Check `DEPLOYMENT_COMPLETE.md` for detailed information.
