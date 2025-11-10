# Test Database Setup Guide

**Version:** 3.1.1
**Last Updated:** 2025-11-07
**Purpose:** Enable integration tests with Supabase test database

---

## Overview

This guide explains how to set up a Supabase test database for running integration tests. Integration tests require a live database to test authentication, property analysis, and payment endpoints.

---

## Prerequisites

- Supabase account (https://app.supabase.com)
- Python 3.11+
- pytest installed

---

## Option 1: Dedicated Test Project (Recommended)

### Step 1: Create Test Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Configure:
   - **Name:** propiq-test
   - **Database Password:** Generate secure password
   - **Region:** Same as production (for consistency)
   - **Pricing:** Free tier is sufficient for testing

4. Wait for project provisioning (2-3 minutes)

### Step 2: Create Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(200),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    analyses_used INT DEFAULT 0,
    analyses_limit INT DEFAULT 3,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Property analyses table
CREATE TABLE property_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(500) NOT NULL,
    analysis_data JSONB NOT NULL,
    score INT,
    rating VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    wandb_run_id VARCHAR(255)
);

-- Support chats table
CREATE TABLE support_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    message TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_analyses_user_id ON property_analyses(user_id);
CREATE INDEX idx_analyses_created_at ON property_analyses(created_at DESC);
CREATE INDEX idx_chats_conversation_id ON support_chats(conversation_id);
CREATE INDEX idx_chats_user_id ON support_chats(user_id);
```

### Step 3: Configure Row Level Security (RLS)

For test database, we can disable RLS or use simple policies:

```sql
-- Disable RLS for test database (easier for testing)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_chats DISABLE ROW LEVEL SECURITY;

-- OR use permissive policies for testing
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for testing" ON users FOR ALL USING (true);

ALTER TABLE property_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for testing" ON property_analyses FOR ALL USING (true);

ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for testing" ON support_chats FOR ALL USING (true);
```

### Step 4: Get Connection Details

1. Go to Project Settings → Database
2. Copy connection details:

```bash
# From Supabase Dashboard
SUPABASE_TEST_URL=https://xxx.supabase.co
SUPABASE_TEST_KEY=your-anon-key-here
```

### Step 5: Configure Test Environment

Add to `backend/.env.test`:

```bash
# Test Environment
ENVIRONMENT=testing

# Test Database (Supabase)
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_KEY=your-test-anon-key

# JWT (test-specific)
JWT_SECRET=test-jwt-secret-key-for-integration-tests-min-64-chars-long
JWT_EXPIRATION_DAYS=7

# Other services (mock or test accounts)
AZURE_OPENAI_ENDPOINT=https://test.openai.azure.com/
AZURE_OPENAI_KEY=test-key
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini

STRIPE_SECRET_KEY=sk_test_your-test-key
STRIPE_WEBHOOK_SECRET=whsec_test_secret

SENDGRID_API_KEY=test-key-or-mock
WANDB_MODE=disabled

# Logging
LOG_LEVEL=WARNING
```

### Step 6: Seed Test Data

Create `backend/tests/fixtures/seed_test_db.py`:

```python
"""
Seed test database with initial data
Run: python tests/fixtures/seed_test_db.py
"""

import os
from dotenv import load_dotenv
from supabase import create_client
import bcrypt

# Load test environment
load_dotenv('.env.test')

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

def seed_users():
    """Create test users"""
    users = [
        {
            "email": "test@propiq.test",
            "password_hash": bcrypt.hashpw("TestPass123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            "first_name": "Test",
            "last_name": "User",
            "subscription_tier": "free",
            "analyses_used": 0,
            "analyses_limit": 3
        },
        {
            "email": "pro@propiq.test",
            "password_hash": bcrypt.hashpw("ProPass123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            "first_name": "Pro",
            "last_name": "User",
            "subscription_tier": "pro",
            "analyses_used": 10,
            "analyses_limit": 100
        }
    ]

    for user in users:
        try:
            result = supabase.table('users').insert(user).execute()
            print(f"✅ Created user: {user['email']}")
        except Exception as e:
            print(f"⚠️  User {user['email']} may already exist: {e}")

def clear_test_data():
    """Clear all test data"""
    try:
        supabase.table('support_chats').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('property_analyses').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('users').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        print("✅ Cleared all test data")
    except Exception as e:
        print(f"⚠️  Error clearing data: {e}")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--clear":
        clear_test_data()
    else:
        print("Seeding test database...")
        seed_users()
        print("\n✅ Test database seeded successfully!")
        print("\nTest users:")
        print("  - test@propiq.test (password: TestPass123) - Free tier")
        print("  - pro@propiq.test (password: ProPass123) - Pro tier")
```

Run seeding:
```bash
cd backend
python tests/fixtures/seed_test_db.py
```

### Step 7: Update Test Configuration

Update `backend/tests/conftest.py`:

```python
# Load test environment
from dotenv import load_dotenv
load_dotenv('.env.test')

# Verify test database is configured
assert os.getenv('SUPABASE_URL') != os.getenv('SUPABASE_PROD_URL'), \
    "Test environment must use separate database!"
```

---

## Option 2: Same Project, Different Schema

If you prefer using the same Supabase project with a separate schema:

```sql
-- Create test schema
CREATE SCHEMA IF NOT EXISTS test;

-- Create tables in test schema
CREATE TABLE test.users (
    -- Same structure as above
);

-- Use test schema in tests
SET search_path TO test, public;
```

**Pros:** Single project, easier management
**Cons:** Risk of accidentally affecting production data

---

## Running Integration Tests

### Run All Tests (Including Integration)

```bash
cd backend

# Set test environment
export SUPABASE_URL="https://your-test-project.supabase.co"
export SUPABASE_KEY="your-test-key"

# Run all tests
pytest tests/ -v

# Run only integration tests
pytest tests/integration/ -v

# Run integration tests with database
pytest -m "integration and requires_db" -v
```

### Skip Database Tests

```bash
# Skip tests requiring database
pytest -m "not requires_db" -v
```

### CI/CD Configuration

For GitHub Actions or similar:

```yaml
# .github/workflows/test.yml
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
        cd backend
        pip install -r requirements.txt

    - name: Run unit tests
      run: |
        cd backend
        pytest tests/unit/ -v

    - name: Run security tests
      run: |
        cd backend
        pytest tests/security/ -v

    - name: Run integration tests
      if: ${{ secrets.SUPABASE_TEST_URL }}
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
        SUPABASE_KEY: ${{ secrets.SUPABASE_TEST_KEY }}
        JWT_SECRET: ${{ secrets.JWT_TEST_SECRET }}
      run: |
        cd backend
        pytest tests/integration/ -v
```

---

## Test Data Management

### Cleanup After Tests

Option 1: Use pytest fixtures for automatic cleanup:

```python
@pytest.fixture(autouse=True)
def cleanup_test_data(request):
    """Automatically cleanup after each test"""
    yield
    # Cleanup code here
    if hasattr(request, 'test_user_id'):
        supabase.table('users').delete().eq('id', request.test_user_id).execute()
```

Option 2: Manual cleanup script:

```bash
# Clear test data
python tests/fixtures/seed_test_db.py --clear

# Re-seed
python tests/fixtures/seed_test_db.py
```

---

## Troubleshooting

### Issue: Connection refused

**Solution:**
```bash
# Check Supabase project is active
# Verify SUPABASE_URL and SUPABASE_KEY are correct
# Check network connectivity

# Test connection
python -c "from supabase import create_client; client = create_client('URL', 'KEY'); print(client.table('users').select('count').execute())"
```

### Issue: RLS policies blocking tests

**Solution:**
```sql
-- Temporarily disable RLS for test database
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_analyses DISABLE ROW LEVEL SECURITY;
```

### Issue: Foreign key constraint errors

**Solution:**
```python
# Delete in correct order (child tables first)
supabase.table('property_analyses').delete().eq('user_id', user_id).execute()
supabase.table('users').delete().eq('id', user_id).execute()
```

### Issue: Tests running against production

**Solution:**
```python
# Add safeguard in conftest.py
assert 'test' in os.getenv('SUPABASE_URL').lower() or \
       os.getenv('ENVIRONMENT') == 'testing', \
       "Tests must use test database!"
```

---

## Best Practices

1. **Separate Projects:** Always use separate Supabase project for testing
2. **Seed Data:** Keep seed data minimal and predictable
3. **Cleanup:** Clean up after tests (use fixtures or manual scripts)
4. **Environment Files:** Use `.env.test` separate from `.env`
5. **CI/CD Secrets:** Store test credentials as CI/CD secrets
6. **RLS:** Disable or simplify RLS policies in test database
7. **Indexes:** Create same indexes as production for realistic tests
8. **Isolation:** Run tests in isolation (parallel tests need separate data)

---

## Security Notes

⚠️ **Important:**
- Test database should NOT contain real user data
- Test credentials should be different from production
- Test Stripe keys should use test mode (`sk_test_...`)
- Test Azure OpenAI should use separate resource or mock
- Never commit test database credentials to git

---

## Cost Considerations

- **Free Tier:** Supabase free tier is sufficient for testing (500 MB database)
- **Pausing:** Pause test project when not in use to save resources
- **Cleanup:** Regularly clear old test data to stay within limits
- **Monitoring:** Monitor usage in Supabase dashboard

---

## Alternative: Docker Test Database

For local testing without Supabase account:

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres:
    image: supabase/postgres:15.1.0.117
    environment:
      POSTGRES_DB: propiq_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54321:5432"
    volumes:
      - ./tests/fixtures/init.sql:/docker-entrypoint-initdb.d/init.sql
```

Run:
```bash
docker-compose -f docker-compose.test.yml up -d
export DATABASE_URL="postgresql://postgres:postgres@localhost:54321/propiq_test"
pytest tests/integration/ -v
```

---

## Summary Checklist

- [ ] Created Supabase test project
- [ ] Ran database schema SQL
- [ ] Configured RLS (disabled or permissive)
- [ ] Created `.env.test` with test credentials
- [ ] Created seed script for test users
- [ ] Ran seed script to populate test data
- [ ] Updated `conftest.py` with test environment
- [ ] Added safeguard against production database
- [ ] Ran integration tests successfully
- [ ] Configured CI/CD secrets (if applicable)
- [ ] Documented test database for team

---

**Test Database Ready!**

You can now run integration tests with:
```bash
cd backend
pytest tests/integration/ -v
```

For questions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) or contact the development team.
