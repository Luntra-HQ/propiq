# PropIQ Backend Deployment - Complete!

## Deployment Status: SUCCESS

**Deployment URL:** https://luntra.onrender.com
**Deploy ID:** dep-d3si7a7diees73cjbsjg
**Status:** live
**Completed At:** 2025-10-22T18:40:41Z
**Build Hash:** bdb959c

---

## What Was Accomplished

### 1. Database Migration: MongoDB → Supabase PostgreSQL
Successfully migrated from MongoDB Atlas to Supabase PostgreSQL to resolve connection string formatting issues in Render.

**Changes:**
- Created `database_supabase.py` with complete PostgreSQL integration
- Created `supabase_schema.sql` with full table definitions
- Updated 7 backend files to use Supabase:
  - auth.py
  - routers/propiq.py
  - routers/support_chat.py
  - routers/support_chat_enhanced.py
  - routers/property_advisor_multiagent.py
  - routers/payment.py
  - utils/onboarding_campaign.py

### 2. Render Deployment
Deployed backend to Render with all necessary environment variables configured.

**Environment Variables Configured:**
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- AZURE_OPENAI_ENDPOINT
- AZURE_OPENAI_KEY
- AZURE_OPENAI_API_VERSION
- AZURE_OPENAI_DEPLOYMENT
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID (all tiers)
- SENDGRID_API_KEY
- WANDB_API_KEY
- INTERCOM_ACCESS_TOKEN
- SLACK_WEBHOOK_URL

### 3. Health Checks - All Passing

**Main Health:** https://luntra.onrender.com/health
```json
{
  "status": "healthy",
  "build_hash": "bdb959c",
  "version": "1.0.0"
}
```

**PropIQ Health:** https://luntra.onrender.com/propiq/health
```json
{
  "status": "healthy",
  "azure_openai_configured": true,
  "model": "gpt-4o-mini"
}
```

**Stripe Health:** https://luntra.onrender.com/stripe/health
```json
{
  "status": "healthy",
  "stripe_configured": true,
  "webhook_configured": true
}
```

---

## IMPORTANT: One Final Step Required

### Run Supabase Migration to Add `last_login` Column

The deployment is complete, but user signup will fail until you run this quick migration:

**Steps:**
1. Go to: https://supabase.com/dashboard/project/yvaujsbktvkzoxfzeimn/sql
2. Open the migration file: `supabase_migration_add_last_login.sql`
3. Copy the SQL and paste it into the Supabase SQL Editor
4. Click "Run"

**SQL to Run:**
```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT NOW();
```

**Why This is Needed:**
Your existing Supabase table was created before the `last_login` column was added to the schema. This migration adds it so user signup will work.

**How to Verify:**
After running the migration, test user signup:
```bash
curl -X POST https://luntra.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

You should see a success response with a JWT token.

---

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info (requires auth)

### Property Analysis (PropIQ)
- `POST /propiq/analyze` - Analyze a property (requires auth)
- `GET /propiq/history` - Get analysis history (requires auth)
- `GET /propiq/health` - Health check

### Stripe Payments
- `POST /stripe/create-checkout-session` - Create checkout (requires auth)
- `GET /stripe/subscription` - Get subscription status (requires auth)
- `POST /stripe/webhook` - Handle Stripe webhooks
- `GET /stripe/health` - Health check

### Support Chat
- `POST /support/chat` - Send message to AI support (requires auth)
- `GET /support/conversations` - List conversations (requires auth)
- `GET /support/health` - Health check

---

## Stripe Configuration

**Account:** bdusape@luntra.one (LUNTRA startup benefits account)

**Subscription Tiers:**
- **Starter** - $69/month - 30 analyses - `price_1SL50hJogOchEFxvxYpymxoT`
- **Pro** - $99/month - 60 analyses - `price_1SL51sJogOchEFxvVounuNcK` (default)
- **Elite** - $149/month - 100 analyses - `price_1SL52dJogOchEFxvVC7797Tw`

**Webhook URL:** https://luntra.onrender.com/stripe/webhook
**Events Handled:**
- `checkout.session.completed` - New subscription
- `invoice.payment_succeeded` - Recurring payment
- `invoice.payment_failed` - Payment failed
- `customer.subscription.deleted` - Subscription canceled

---

## Supabase Configuration

**Project URL:** https://yvaujsbktvkzoxfzeimn.supabase.co
**Dashboard:** https://supabase.com/dashboard/project/yvaujsbktvkzoxfzeimn

**Tables:**
- `users` - User accounts, authentication, subscriptions
- `property_analyses` - Analysis history with JSONB data
- `support_chats` - Support conversation history

**Features Enabled:**
- Row-Level Security (RLS)
- UUID generation
- Automatic timestamps
- Helper functions (increment_propiq_usage, reset_monthly_usage)

---

## Testing the Deployment

### 1. Test Health Endpoints
```bash
# Main health
curl https://luntra.onrender.com/health

# PropIQ health
curl https://luntra.onrender.com/propiq/health

# Stripe health
curl https://luntra.onrender.com/stripe/health
```

### 2. Test User Signup (after migration)
```bash
curl -X POST https://luntra.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

### 3. Test User Login
```bash
curl -X POST https://luntra.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 4. Test Property Analysis
```bash
# First, get access token from signup/login response
TOKEN="your-jwt-token-here"

curl -X POST https://luntra.onrender.com/propiq/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"address":"123 Main St, San Francisco, CA"}'
```

---

## Monitoring & Logs

### View Render Logs
```bash
# Via Render API
curl -s "https://api.render.com/v1/services/srv-d3sh7hmmcj7s73b8baj0/deploys/dep-d3si7a7diees73cjbsjg/logs" \
  -H "Authorization: Bearer rnd_fH4GkAJsO3aVWcTvigW4HiZcvOSo"
```

### Check Deployment Status
```bash
curl -s -X GET "https://api.render.com/v1/services/srv-d3sh7hmmcj7s73b8baj0/deploys/dep-d3si7a7diees73cjbsjg" \
  -H "Authorization: Bearer rnd_fH4GkAJsO3aVWcTvigW4HiZcvOSo" | python3 -m json.tool
```

---

## Benefits of New Setup

### Supabase vs MongoDB
- No connection string formatting issues
- Free tier forever (vs MongoDB limited credits)
- Built-in auth capabilities
- Real-time subscriptions support
- Automatic backups
- Better Render compatibility
- PostgreSQL features (JSONB, full-text search, etc.)

### Render vs Azure
- Instant real-time logs (vs 5-10 min delay)
- Simpler deployment (5 min vs 30+ min)
- Auto-deploy from GitHub
- Better developer experience
- Lower cost ($0-7/mo vs $50+/mo)

---

## Next Steps

1. **[REQUIRED]** Run the Supabase migration (see above)
2. Test user signup in production
3. Test full property analysis flow
4. Test Stripe checkout flow
5. Monitor logs for any errors
6. Update frontend to point to https://luntra.onrender.com
7. Test end-to-end user journey

---

## Troubleshooting

### Issue: User signup fails with "Could not find 'last_login' column"
**Solution:** Run the Supabase migration (see above)

### Issue: Deployment not responding
**Solution:** Check Render dashboard, may need to restart service

### Issue: Stripe webhooks not working
**Solution:** Verify webhook URL in Stripe dashboard: https://luntra.onrender.com/stripe/webhook

### Issue: Property analysis fails
**Solution:** Check Azure OpenAI configuration in environment variables

---

## Files Created/Modified

### New Files
- `database_supabase.py` - Supabase PostgreSQL integration
- `supabase_schema.sql` - Database schema
- `supabase_migration_add_last_login.sql` - Migration to add last_login column
- `SUPABASE_SETUP.md` - Comprehensive setup guide
- `migrate_to_supabase.sh` - Automated migration script
- `DEPLOYMENT_COMPLETE.md` - This file

### Modified Files
- `auth.py` - Updated to use database_supabase
- `routers/propiq.py` - Updated to use database_supabase
- `routers/support_chat.py` - Updated to use database_supabase
- `routers/support_chat_enhanced.py` - Updated to use database_supabase
- `routers/property_advisor_multiagent.py` - Updated to use database_supabase
- `routers/payment.py` - Updated to use database_supabase
- `utils/onboarding_campaign.py` - Updated to use database_supabase
- `.env` - Added Supabase credentials
- `render.yaml` - Updated with all environment variables

---

## Summary

Backend successfully deployed to Render with Supabase PostgreSQL!

**Status:** Live and healthy
**URL:** https://luntra.onrender.com
**Action Required:** Run Supabase migration to add `last_login` column

All services are configured and ready to use once the migration is complete.
