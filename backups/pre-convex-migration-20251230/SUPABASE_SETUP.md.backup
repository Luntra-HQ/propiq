# 🚀 PropIQ Supabase Migration Guide

**Switching from MongoDB to Supabase PostgreSQL**

This guide walks you through migrating PropIQ from MongoDB Atlas to Supabase PostgreSQL for better reliability and Render compatibility.

---

## 🎯 Why Supabase?

✅ **Simple connection strings** - No formatting issues
✅ **Better Render compatibility** - Works perfectly every time
✅ **Free tier forever** - Not limited credits like MongoDB
✅ **Built-in auth** - Can replace custom JWT later
✅ **Real-time subscriptions** - Free feature
✅ **Automatic backups** - Point-in-time recovery

---

## 📋 Step 1: Create Supabase Project

### 1.1 Sign Up for Supabase

```bash
open https://supabase.com
```

1. Click **"Start your project"**
2. Sign in with GitHub (recommended)
3. Click **"New project"**

### 1.2 Create Project

Fill in the form:
- **Organization:** Create new (use "LUNTRA" or your company name)
- **Project name:** `propiq-production`
- **Database Password:** **SAVE THIS!** You'll need it later
  - Click "Generate a password" for a strong one
  - Copy and save it somewhere safe
- **Region:** `West US (North California)` (closest to Render Oregon)
- **Pricing Plan:** Free

Click **"Create new project"** and wait 2-3 minutes for provisioning.

---

## 📊 Step 2: Set Up Database Schema

Once your project is ready:

### 2.1 Open SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### 2.2 Run Schema Script

Copy and paste the entire contents of `supabase_schema.sql` into the SQL editor.

```bash
# In your terminal:
cat supabase_schema.sql
# Copy the output
```

Then in Supabase SQL Editor:
1. Paste the SQL
2. Click **"Run"** (or press Cmd+Enter)
3. You should see: ✅ Success. No rows returned

### 2.3 Verify Tables Created

Run this query to verify:

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

You should see:
- ✅ `property_analyses`
- ✅ `support_chats`
- ✅ `users`

---

## 🔑 Step 3: Get Your Supabase Credentials

### 3.1 Get API Keys

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. You'll see two sections:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```
Copy this - you'll need it as `SUPABASE_URL`

**Project API keys:**
- **anon public:** Used for client-side (frontend)
- **service_role:** Used for backend (this is what we need!)

Copy the **service_role** key - you'll need it as `SUPABASE_SERVICE_KEY`

⚠️ **IMPORTANT:** The service_role key has admin access - keep it secret!

---

## 🔧 Step 4: Update Local Environment

### 4.1 Add Credentials to .env

Open your `.env` file and add these lines:

```bash
# ============================================================================
# SUPABASE DATABASE (PostgreSQL)
# ============================================================================
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...your-service-role-key...
```

Replace with your actual values from Step 3.

### 4.2 Update auth.py

Change the import at the top of `auth.py`:

**Replace:**
```python
import database_mongodb as database
from database_mongodb import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    verify_password,
    update_last_login
)
```

**With:**
```python
import database_supabase as database
from database_supabase import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    verify_password,
    update_last_login
)
```

---

## 🧪 Step 5: Test Locally

### 5.1 Install Dependencies

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend
pip install -r requirements.txt
```

### 5.2 Start Local Server

```bash
uvicorn api:app --reload --port 8000
```

You should see:
```
✅ Supabase connection initialized
✅ Auth router registered
```

### 5.3 Test User Registration

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","firstName":"Test","lastName":"User"}'
```

Expected response:
```json
{
  "success": true,
  "userId": "uuid-here",
  "accessToken": "jwt-token-here"
}
```

### 5.4 Verify in Supabase

1. Go to Supabase dashboard
2. Click **"Table Editor"** in left sidebar
3. Click **"users"** table
4. You should see your test user!

---

## 🚀 Step 6: Deploy to Render

### 6.1 Update Render Environment Variables

Using the Render API (since dashboard has formatting issues):

```bash
# Set your Render API key
export RENDER_API_KEY="rnd_fH4GkAJsO3aVWcTvigW4HiZcvOSo"
export SERVICE_ID="srv-d3sh7hmmcj7s73b8baj0"

# Add SUPABASE_URL
curl -X PUT "https://api.render.com/v1/services/${SERVICE_ID}/env-vars/SUPABASE_URL" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"value":"YOUR_SUPABASE_URL_HERE"}'

# Add SUPABASE_SERVICE_KEY
curl -X PUT "https://api.render.com/v1/services/${SERVICE_ID}/env-vars/SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"value":"YOUR_SERVICE_KEY_HERE"}'
```

Replace `YOUR_SUPABASE_URL_HERE` and `YOUR_SERVICE_KEY_HERE` with your actual values.

### 6.2 Commit and Push Changes

```bash
git add database_supabase.py supabase_schema.sql SUPABASE_SETUP.md auth.py
git commit -m "Migrate from MongoDB to Supabase PostgreSQL

- Created Supabase database connection module
- Added PostgreSQL schema with users, analyses, and support tables
- Updated auth.py to use Supabase instead of MongoDB
- Fixed Render environment variable formatting issues

🤖 Generated with Claude Code
https://claude.com/claude-code

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

### 6.3 Trigger Render Deployment

```bash
curl -X POST "https://api.render.com/v1/services/${SERVICE_ID}/deploys" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"do_not_clear"}'
```

### 6.4 Monitor Deployment

Watch logs at: https://dashboard.render.com/web/srv-d3sh7hmmcj7s73b8baj0

Look for:
```
✅ Supabase connection initialized
✅ Auth router registered
```

---

## ✅ Step 7: Verify Production

### 7.1 Test Health Endpoint

```bash
curl https://luntra.onrender.com/health
```

### 7.2 Test User Signup

```bash
curl -X POST https://luntra.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"production-test@example.com","password":"TestPass123!","firstName":"Prod","lastName":"User"}'
```

Should return success with JWT token!

### 7.3 Run E2E Tests

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend
python3 test_e2e_stripe.py
```

All tests should pass! ✅

---

## 🎉 Migration Complete!

### What Changed

**Before (MongoDB):**
- ❌ Complex connection string with special characters
- ❌ Render dashboard formatting issues
- ❌ Limited credits (will run out)
- ❌ No built-in auth

**After (Supabase):**
- ✅ Simple PostgreSQL connection
- ✅ Works perfectly in Render
- ✅ Free tier forever
- ✅ Built-in auth (can use later)
- ✅ Real-time capabilities
- ✅ Better performance

### Features Now Working

✅ **User Authentication**
- Signup with bcrypt password hashing
- Login with JWT tokens
- Session management

✅ **Property Analysis**
- Save analysis results with JSONB
- Track usage per user
- History and limits enforced

✅ **Support Chat**
- Conversation history
- User and assistant messages
- Persistent across sessions

✅ **Subscription Management**
- Tier-based usage limits
- Stripe integration ready
- Easy upgrade/downgrade

---

## 📊 Database Schema Overview

### Users Table
- Email, password (bcrypt hashed)
- Subscription tier and status
- PropIQ usage tracking
- Stripe customer/subscription IDs

### Property Analyses Table
- User ID (foreign key)
- Address
- Analysis result (JSONB - flexible structure)
- W&B run ID for tracking
- Timestamp

### Support Chats Table
- User ID (foreign key)
- Conversation ID
- Message and role (user/assistant)
- Metadata (JSONB)
- Timestamp

---

## 🔒 Security Features

✅ **Row Level Security (RLS)**
- Users can only access their own data
- Enforced at database level

✅ **Password Hashing**
- Bcrypt with salt
- Never store plain text passwords

✅ **Service Role Key**
- Backend has full access
- Frontend uses anon key (limited)

---

## 🛠️ Troubleshooting

### Connection Failed

Check environment variables:
```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
```

### Tables Not Created

Re-run schema in SQL Editor:
```bash
cat supabase_schema.sql | pbcopy
# Paste and run in Supabase SQL Editor
```

### Authentication Errors

Verify RLS policies are enabled:
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Python Client:** https://supabase.com/docs/reference/python
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**🎉 Your PropIQ backend is now running on Supabase!**
