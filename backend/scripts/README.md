# PropIQ Backend Scripts

This directory contains utility scripts for database setup, testing, and deployment.

## Database Setup Scripts

### `setup_test_db.sql`

SQL script to set up the test database schema in Supabase.

**Usage:**
1. Create a new Supabase project (propiq-test)
2. Open SQL Editor in Supabase dashboard
3. Copy and paste the contents of `setup_test_db.sql`
4. Click "Run" to execute
5. Verify tables and indexes were created

**What it creates:**
- 3 tables: `users`, `property_analyses`, `support_chats`
- 6 indexes for query performance
- Disables RLS for easier testing

## Test Data Scripts

See `tests/fixtures/seed_test_db.py` for test data seeding.

## Deployment Scripts

See `deploy-azure.sh` in the backend root directory.
