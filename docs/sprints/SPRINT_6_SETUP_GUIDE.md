# Sprint 6 Setup Guide: Test Database & Integration Tests

**Version:** 3.1.1
**Sprint:** 6
**Date:** 2025-11-07
**Estimated Time:** 30-45 minutes

---

## Overview

This guide walks you through setting up a Supabase test database and running all 24 integration tests. By the end of this guide, you'll have:

- ✅ A dedicated Supabase test project
- ✅ Test database with proper schema and indexes
- ✅ Test data seeded (4 test users, sample analyses)
- ✅ All 24 integration tests passing
- ✅ Ready for continuous integration (CI/CD)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Supabase account (https://app.supabase.com)
- [ ] Python 3.11+ installed
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Access to PropIQ backend code

---

## Step 1: Create Supabase Test Project (5 minutes)

### 1.1 Create New Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Configure project:
   - **Name:** `propiq-test`
   - **Database Password:** Click "Generate password" and save it securely
   - **Region:** Choose the same as production (or closest to you)
   - **Pricing Plan:** Free (sufficient for testing)

4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### 1.2 Get Connection Details

1. Once project is ready, click on "Project Settings" (gear icon in sidebar)
2. Navigate to "API" section
3. Copy these values (you'll need them in next step):
   - **URL:** `https://[PROJECT_ID].supabase.co`
   - **anon public key:** The long string under "Project API keys" → "anon public"
   - **service_role key:** The long string under "Project API keys" → "service_role"

**⚠️ Important:** Keep these credentials secure! Never commit them to git.

---

## Step 2: Configure Test Environment (3 minutes)

### 2.1 Create `.env.test` File

```bash
cd propiq/backend
cp .env.test.template .env.test
```

### 2.2 Edit `.env.test` with Your Credentials

Open `.env.test` in your editor and update these lines:

```bash
# Replace these with your Supabase test project credentials
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
SUPABASE_SERVICE_KEY=your-service-role-key-from-dashboard
```

**Example:**
```bash
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.3 Verify Configuration

```bash
# Check file exists
ls -la .env.test

# Verify SUPABASE_URL is set
grep "SUPABASE_URL" .env.test
```

---

## Step 3: Set Up Database Schema (5 minutes)

### 3.1 Open Supabase SQL Editor

1. In Supabase dashboard, click "SQL Editor" in sidebar
2. Click "New Query"

### 3.2 Run Setup Script

1. Open `propiq/backend/scripts/setup_test_db.sql` in your code editor
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click "Run" button (or press `Ctrl+Enter` / `Cmd+Enter`)

### 3.3 Verify Schema Created

You should see output like:
```
Success. No rows returned
```

To verify tables were created, run this query in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'property_analyses', 'support_chats');
```

Expected output:
```
table_name
-------------------
users
property_analyses
support_chats
```

### 3.4 Verify Indexes Created

Run this query:

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'property_analyses', 'support_chats')
ORDER BY tablename, indexname;
```

Expected output: 6 indexes (2 per table)

---

## Step 4: Seed Test Data (2 minutes)

### 4.1 Run Seeding Script

```bash
cd propiq/backend
python tests/fixtures/seed_test_db.py seed
```

Expected output:
```
🌱 Seeding PropIQ test database...

Environment: testing
Supabase URL: https://[your-project].supabase.co

✅ Created user: test@propiq.test (Free tier)
✅ Created user: pro@propiq.test (Pro tier)
✅ Created user: elite@propiq.test (Elite tier)
✅ Created user: inactive@propiq.test (Inactive)
✅ Created 2 sample analyses for test@propiq.test
✅ Created 3 sample analyses for pro@propiq.test

✅ Database seeded successfully!

Summary:
- 4 users created
- 5 property analyses created
- Test data ready for integration tests
```

### 4.2 Verify Test Data

In Supabase dashboard, click "Table Editor" in sidebar:

- **users table:** Should show 4 users
- **property_analyses table:** Should show 5 analyses
- **support_chats table:** Should be empty (will be populated during tests)

---

## Step 5: Run Integration Tests (10 minutes)

### 5.1 Run All Integration Tests

```bash
cd propiq/backend
pytest tests/integration/ -v
```

### 5.2 Expected Output

```
============================= test session starts ==============================
Loading test environment from: /path/to/.env.test
✅ Test environment loaded successfully
✅ Using real test database: https://[your-project].supabase.co

tests/integration/test_auth.py::test_signup_success PASSED              [ 4%]
tests/integration/test_auth.py::test_signup_duplicate_email PASSED      [ 8%]
tests/integration/test_auth.py::test_signup_invalid_email PASSED        [12%]
tests/integration/test_auth.py::test_signup_weak_password PASSED        [16%]
tests/integration/test_auth.py::test_signup_xss_protection PASSED       [20%]
tests/integration/test_auth.py::test_signup_sql_injection_protection PASSED [24%]
tests/integration/test_auth.py::test_login_success PASSED               [28%]
tests/integration/test_auth.py::test_login_invalid_credentials PASSED   [32%]
tests/integration/test_auth.py::test_login_nonexistent_user PASSED      [36%]
tests/integration/test_auth.py::test_login_missing_fields PASSED        [40%]
tests/integration/test_auth.py::test_profile_success PASSED             [44%]
tests/integration/test_auth.py::test_profile_no_token PASSED            [48%]
tests/integration/test_auth.py::test_profile_invalid_token PASSED       [52%]
tests/integration/test_auth.py::test_profile_expired_token PASSED       [56%]
tests/integration/test_auth.py::test_jwt_token_generation PASSED        [60%]
tests/integration/test_auth.py::test_jwt_token_contains_user_info PASSED [64%]
tests/integration/test_auth.py::test_complete_signup_login_flow PASSED  [68%]
tests/integration/test_auth.py::test_user_isolation PASSED              [72%]

======================== 24 passed in 8.42s ================================
```

### 5.3 Troubleshooting Test Failures

**If tests fail, check:**

1. **Database connection:**
   ```bash
   # Verify .env.test has correct credentials
   grep "SUPABASE_URL" .env.test
   ```

2. **Schema exists:**
   - Check Supabase dashboard → Table Editor
   - Ensure 3 tables exist: users, property_analyses, support_chats

3. **Test data exists:**
   ```bash
   python tests/fixtures/seed_test_db.py seed
   ```

4. **Network access:**
   - Ensure your IP can access Supabase
   - Check firewall/VPN settings

---

## Step 6: Run Full Test Suite (5 minutes)

### 6.1 Run All Tests (Unit + Integration + Security)

```bash
cd propiq/backend
pytest -v --cov=. --cov-report=term-missing
```

### 6.2 Expected Results

```
======================== 90 tests passed in 15.23s =========================

---------- coverage: platform darwin, python 3.11.x -----------
Name                              Stmts   Miss  Cover   Missing
---------------------------------------------------------------
api.py                              156     12    92%   45-47, 89-91
auth.py                             203     18    91%
config/logging_config.py            203      8    96%
middleware/request_logger.py        158      5    97%
middleware/security_headers.py      199      4    98%
routers/propiq.py                   245     32    87%
utils/error_responses.py            310      2    99%
utils/validators.py                 415      0   100%
---------------------------------------------------------------
TOTAL                              1889    81    96%
```

### 6.3 Coverage Targets

- **Overall Coverage:** >85% ✅
- **Validators:** 100% ✅
- **Security Middleware:** >95% ✅
- **Integration Tests:** 24/24 passing ✅

---

## Step 7: Clean Up Test Data (Optional)

### 7.1 Clear Test Data Between Test Runs

```bash
cd propiq/backend
python tests/fixtures/seed_test_db.py clear
```

This removes all data but keeps the schema.

### 7.2 Reset Database (Clear + Seed)

```bash
python tests/fixtures/seed_test_db.py reset
```

This clears all data and re-seeds fresh test data.

---

## Step 8: CI/CD Configuration (Optional, 10 minutes)

### 8.1 GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd propiq/backend
          pip install -r requirements.txt

      - name: Create .env.test
        run: |
          cd propiq/backend
          cat > .env.test << EOF
          ENVIRONMENT=testing
          SUPABASE_URL=${{ secrets.SUPABASE_TEST_URL }}
          SUPABASE_ANON_KEY=${{ secrets.SUPABASE_TEST_ANON_KEY }}
          SUPABASE_SERVICE_KEY=${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
          JWT_SECRET=${{ secrets.JWT_TEST_SECRET }}
          WANDB_MODE=disabled
          EOF

      - name: Run tests
        run: |
          cd propiq/backend
          pytest -v --cov=. --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./propiq/backend/coverage.xml
```

### 8.2 Add Secrets to GitHub

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `SUPABASE_TEST_URL`
   - `SUPABASE_TEST_ANON_KEY`
   - `SUPABASE_TEST_SERVICE_KEY`
   - `JWT_TEST_SECRET` (generate: `openssl rand -hex 32`)

---

## Summary Checklist

After completing this guide, verify:

- [ ] ✅ Supabase test project created
- [ ] ✅ Database schema set up (3 tables, 6 indexes)
- [ ] ✅ Test data seeded (4 users, 5 analyses)
- [ ] ✅ `.env.test` configured with credentials
- [ ] ✅ 24 integration tests passing
- [ ] ✅ Full test suite passing (90 tests)
- [ ] ✅ >85% code coverage achieved
- [ ] ✅ CI/CD configured (optional)

---

## Next Steps

Now that your test database is set up and all integration tests pass, you can proceed with:

1. **Implement database indexes in production** (Sprint 6 Task 3)
2. **Add Redis caching** (Sprint 6 Task 4)
3. **Add pagination to list endpoints** (Sprint 6 Task 5)
4. **Update frontend for `/api/v1` prefix** (Sprint 6 Task 6)

---

## Troubleshooting

### Problem: "python-dotenv not installed"

**Solution:**
```bash
pip install python-dotenv
```

### Problem: "Could not connect to database"

**Solutions:**
1. Verify `.env.test` has correct credentials
2. Check Supabase project is not paused (free tier pauses after inactivity)
3. Verify network access (firewall, VPN)
4. Check Supabase dashboard for project status

### Problem: "Table does not exist"

**Solution:**
Re-run the setup script in Supabase SQL Editor:
```bash
# Copy contents of setup_test_db.sql and run in SQL Editor
```

### Problem: Tests fail with "user already exists"

**Solution:**
Clear test data and reseed:
```bash
python tests/fixtures/seed_test_db.py reset
```

### Problem: "JWT_SECRET must be at least 32 characters"

**Solution:**
Update `.env.test` with a longer JWT secret:
```bash
JWT_SECRET=test-jwt-secret-key-for-integration-tests-must-be-at-least-64-chars
```

---

## Support

**Documentation:**
- [TEST_DATABASE_SETUP.md](../TEST_DATABASE_SETUP.md) - Detailed database setup guide
- [DATABASE_OPTIMIZATION.md](../DATABASE_OPTIMIZATION.md) - Performance optimization
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Production deployment

**Need Help?**
- Check Supabase docs: https://supabase.com/docs
- Check PropIQ docs: `/docs` directory
- Review test output for detailed error messages

---

**Setup Guide Version:** 1.0
**Last Updated:** 2025-11-07
**Estimated Completion Time:** 30-45 minutes
**Difficulty:** Intermediate
