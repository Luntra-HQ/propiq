# Supabase Migration Instructions

## The Issue

Your Supabase `users` table is missing **7 columns** that PropIQ needs:

1. `propiq_usage_count` - Track how many analyses used
2. `propiq_usage_limit` - Monthly analysis limit by tier
3. `propiq_last_reset_date` - When usage counter was last reset
4. `subscription_stripe_customer_id` - Stripe customer ID
5. `subscription_stripe_subscription_id` - Stripe subscription ID
6. `last_login` - Last login timestamp
7. `updated_at` - Last update timestamp

## How to Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

Click this link: https://supabase.com/dashboard/project/yvaujsbktvkzoxfzeimn/sql

### Step 2: Copy the Migration SQL

Open the file: `COMPLETE_MIGRATION.sql`

Or copy this:

```sql
-- Add missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS propiq_usage_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS propiq_usage_limit INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN IF NOT EXISTS propiq_last_reset_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_stripe_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add index
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(subscription_stripe_customer_id);

-- Verify
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;
```

### Step 3: Run It

1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** button
3. You should see a list of all columns including the new ones

### Step 4: Verify Success

You should see output like:

```
column_name                          | data_type
-------------------------------------|------------
id                                   | uuid
email                                | varchar
password_hash                        | varchar
full_name                           | varchar
subscription_tier                    | varchar
subscription_status                  | varchar
propiq_usage_count                   | integer    ← NEW
propiq_usage_limit                   | integer    ← NEW
propiq_last_reset_date              | timestamp  ← NEW
subscription_stripe_customer_id      | varchar    ← NEW
subscription_stripe_subscription_id  | varchar    ← NEW
created_at                           | timestamp
updated_at                           | timestamp  ← NEW
last_login                           | timestamp  ← NEW
```

## After Migration

Once the migration completes, run:

```bash
cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/backend/simulations"
python3 create_test_users.py
```

This will create the 5 test users for simulation.

---

**Time:** ~2 minutes total
**Risk:** None (uses `IF NOT EXISTS` so safe to run multiple times)
