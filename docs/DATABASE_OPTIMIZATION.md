# Database Optimization Guide

**Version:** 3.1.1
**Last Updated:** 2025-11-07
**Database:** Supabase PostgreSQL

---

## Overview

This guide provides database optimization strategies for PropIQ, including indexing, query optimization, connection pooling, and performance monitoring.

---

## Table of Contents

1. [Index Optimization](#index-optimization)
2. [Query Optimization](#query-optimization)
3. [Connection Pooling](#connection-pooling)
4. [Performance Monitoring](#performance-monitoring)
5. [Best Practices](#best-practices)

---

## Index Optimization

### Existing Indexes

The following indexes are already created (see TEST_DATABASE_SETUP.md):

```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier);

-- Property analyses indexes
CREATE INDEX idx_analyses_user_id ON property_analyses(user_id);
CREATE INDEX idx_analyses_created_at ON property_analyses(created_at DESC);

-- Support chats indexes
CREATE INDEX idx_chats_conversation_id ON support_chats(conversation_id);
CREATE INDEX idx_chats_user_id ON support_chats(user_id);
```

### Recommended Additional Indexes

#### For User Queries

```sql
-- Composite index for active users by subscription
CREATE INDEX idx_users_active_subscription
ON users(is_active, subscription_tier)
WHERE is_active = true;

-- Index for Stripe customer lookups
CREATE INDEX idx_users_stripe_customer
ON users(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Index for last login (for inactive user cleanup)
CREATE INDEX idx_users_last_login
ON users(last_login DESC NULLS LAST);
```

#### For Property Analysis Queries

```sql
-- Composite index for user's recent analyses
CREATE INDEX idx_analyses_user_recent
ON property_analyses(user_id, created_at DESC);

-- Index for score-based queries (find good deals)
CREATE INDEX idx_analyses_score
ON property_analyses(score DESC)
WHERE score IS NOT NULL;

-- Partial index for high-scoring properties
CREATE INDEX idx_analyses_excellent
ON property_analyses(score, created_at DESC)
WHERE score >= 80;

-- GIN index for JSONB analysis_data (for searching within JSON)
CREATE INDEX idx_analyses_data_gin
ON property_analyses USING GIN (analysis_data);
```

#### For Support Chat Queries

```sql
-- Composite index for conversation messages
CREATE INDEX idx_chats_conversation_time
ON support_chats(conversation_id, created_at ASC);

-- Index for finding user's conversations
CREATE INDEX idx_chats_user_recent
ON support_chats(user_id, created_at DESC);
```

### Index Monitoring

```sql
-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_%';

-- Check index size
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

### When to Add Indexes

✅ **Add indexes for:**
- Columns frequently used in WHERE clauses
- Columns used in JOIN conditions
- Columns used in ORDER BY
- Foreign key columns
- Columns with high selectivity (many unique values)

❌ **Avoid indexes for:**
- Small tables (< 1000 rows)
- Columns with low selectivity (few unique values like boolean)
- Columns rarely queried
- Frequently updated columns (indexes slow down writes)

---

## Query Optimization

### 1. Use Pagination

**Bad:**
```python
# Returns all rows - slow for large tables
users = supabase.table('users').select('*').execute()
```

**Good:**
```python
from utils.pagination import PaginationParams, create_paginated_response

# Returns only requested page
users = supabase.table('users')\
    .select('*')\
    .range(pagination.skip, pagination.skip + pagination.limit - 1)\
    .execute()
```

### 2. Select Only Needed Columns

**Bad:**
```python
# Fetches all columns including large JSONB
analyses = supabase.table('property_analyses').select('*').execute()
```

**Good:**
```python
# Fetches only needed columns
analyses = supabase.table('property_analyses')\
    .select('id, address, score, created_at')\
    .execute()
```

### 3. Use Efficient Filters

**Bad:**
```python
# Full table scan
users = supabase.table('users').select('*').execute()
active_users = [u for u in users.data if u['is_active']]
```

**Good:**
```python
# Filter in database (uses index)
active_users = supabase.table('users')\
    .select('*')\
    .eq('is_active', True)\
    .execute()
```

### 4. Batch Operations

**Bad:**
```python
# N+1 queries problem
for user_id in user_ids:
    user = supabase.table('users').select('*').eq('id', user_id).execute()
```

**Good:**
```python
# Single query with IN clause
users = supabase.table('users')\
    .select('*')\
    .in_('id', user_ids)\
    .execute()
```

### 5. Use Joins Instead of Multiple Queries

**Bad:**
```python
# Two separate queries
users = supabase.table('users').select('*').execute()
for user in users.data:
    analyses = supabase.table('property_analyses')\
        .select('*')\
        .eq('user_id', user['id'])\
        .execute()
```

**Good:**
```python
# Single query with join
users_with_analyses = supabase.table('users')\
    .select('*, property_analyses(*)')\
    .execute()
```

### 6. Optimize COUNT Queries

**Bad:**
```python
# Slow for large tables
count = len(supabase.table('property_analyses').select('*').execute().data)
```

**Good:**
```python
# Fast COUNT query (uses index)
count_result = supabase.table('property_analyses')\
    .select('*', count='exact')\
    .execute()
count = count_result.count
```

### 7. Use Limit for Existence Checks

**Bad:**
```python
# Fetches all matching rows
users = supabase.table('users').select('*').eq('email', email).execute()
exists = len(users.data) > 0
```

**Good:**
```python
# Fetches only 1 row
user = supabase.table('users')\
    .select('id')\
    .eq('email', email)\
    .limit(1)\
    .execute()
exists = len(user.data) > 0
```

---

## Connection Pooling

### Configure Supabase Connection Pool

```python
from supabase import create_client, Client

# Connection pool configuration
supabase: Client = create_client(
    supabase_url=os.getenv('SUPABASE_URL'),
    supabase_key=os.getenv('SUPABASE_KEY'),
    options={
        'schema': 'public',
        'autoRefreshToken': True,
        'persistSession': True,
        # Connection pool settings
        'db': {
            'pool': {
                'min': 2,  # Minimum connections
                'max': 10,  # Maximum connections
                'idleTimeoutMillis': 30000,  # Close idle connections after 30s
                'connectionTimeoutMillis': 2000  # Timeout for new connections
            }
        }
    }
)
```

### Benefits of Connection Pooling

- **Reduced Latency:** Reuse existing connections instead of creating new ones
- **Better Performance:** Avoid connection overhead
- **Resource Efficiency:** Limit maximum connections
- **Automatic Cleanup:** Close idle connections

### Monitoring Connection Pool

```sql
-- Check active connections
SELECT
    datname,
    usename,
    application_name,
    state,
    query,
    state_change
FROM pg_stat_activity
WHERE datname = 'postgres';

-- Check connection limits
SELECT
    max_conn,
    used,
    res_for_super,
    max_conn - used - res_for_super as available
FROM (
    SELECT count(*) used FROM pg_stat_activity
) t1,
(
    SELECT setting::int res_for_super FROM pg_settings WHERE name = 'superuser_reserved_connections'
) t2,
(
    SELECT setting::int max_conn FROM pg_settings WHERE name = 'max_connections'
) t3;
```

---

## Performance Monitoring

### Query Performance

```sql
-- Find slow queries
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- Queries slower than 1 second
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Enable pg_stat_statements (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### Table Statistics

```sql
-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY bytes DESC;

-- Row counts
SELECT
    schemaname,
    relname,
    n_live_tup as row_count,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Table bloat
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

### Application-Level Monitoring

```python
import time
from functools import wraps
from config.logging_config import get_logger

logger = get_logger(__name__)

def log_query_time(func):
    """Decorator to log query execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = (time.time() - start) * 1000  # Convert to ms

        if duration > 100:  # Log slow queries (> 100ms)
            logger.warning(
                f"Slow query: {func.__name__} took {duration:.2f}ms",
                extra={"duration_ms": duration, "function": func.__name__}
            )

        return result
    return wrapper

# Usage
@log_query_time
def get_user_analyses(user_id: str):
    return supabase.table('property_analyses')\
        .select('*')\
        .eq('user_id', user_id)\
        .execute()
```

---

## Best Practices

### 1. Database Design

✅ **Do:**
- Use appropriate data types (UUID for IDs, TIMESTAMP for dates)
- Normalize data to reduce redundancy
- Use foreign keys for referential integrity
- Add NOT NULL constraints where appropriate
- Use JSONB for flexible nested data

❌ **Don't:**
- Store computed values (calculate on-the-fly)
- Use VARCHAR without length limits
- Create tables without primary keys
- Ignore foreign key constraints

### 2. Querying

✅ **Do:**
- Use prepared statements (prevents SQL injection)
- Paginate large result sets
- Select only needed columns
- Use indexes for frequent queries
- Batch operations when possible

❌ **Don't:**
- Use SELECT * in production
- Fetch all rows without LIMIT
- Perform calculations in application that could be done in DB
- Use LIKE '%search%' (can't use index)

### 3. Indexing

✅ **Do:**
- Index foreign keys
- Index columns used in WHERE clauses
- Use composite indexes for multi-column queries
- Monitor index usage
- Drop unused indexes

❌ **Don't:**
- Create indexes on every column
- Index boolean columns (low selectivity)
- Ignore index maintenance
- Create duplicate indexes

### 4. Maintenance

✅ **Do:**
- Regularly VACUUM tables
- Update table statistics (ANALYZE)
- Monitor query performance
- Review slow query log
- Archive old data

❌ **Don't:**
- Let dead tuples accumulate
- Ignore disk space usage
- Skip database backups
- Forget to test queries before deployment

### 5. Caching

✅ **Do:**
- Cache frequently accessed data (user profiles, settings)
- Cache expensive computations
- Use appropriate TTL (time-to-live)
- Invalidate cache on updates

❌ **Don't:**
- Cache everything (wastes memory)
- Use infinite TTL (stale data)
- Forget to handle cache misses
- Cache sensitive data without encryption

---

## Performance Targets

### Response Time Goals

- **List Queries:** < 100ms (with pagination)
- **Single Record:** < 50ms (with index)
- **Complex Queries:** < 500ms
- **Write Operations:** < 100ms

### Database Metrics

- **Connection Pool:** 80% utilization max
- **Cache Hit Ratio:** > 90%
- **Index Hit Ratio:** > 95%
- **Dead Tuples:** < 5% of total rows
- **Slow Queries:** < 1% of total queries

---

## Troubleshooting

### Slow Queries

**Symptom:** API responses taking >1 second

**Diagnosis:**
```sql
-- Find slow queries
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- Check query plan
EXPLAIN ANALYZE
SELECT * FROM property_analyses
WHERE user_id = '...' AND score > 80;
```

**Solutions:**
1. Add missing indexes
2. Rewrite query to use indexes
3. Add pagination
4. Cache results

### High CPU Usage

**Symptom:** Database CPU at 80%+

**Diagnosis:**
```sql
-- Find CPU-intensive queries
SELECT query, calls, total_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

**Solutions:**
1. Optimize expensive queries
2. Add indexes
3. Scale database (vertical/horizontal)
4. Implement caching

### Connection Pool Exhaustion

**Symptom:** "Too many connections" errors

**Diagnosis:**
```sql
SELECT count(*) FROM pg_stat_activity;
```

**Solutions:**
1. Increase max_connections
2. Reduce connection pool size in application
3. Fix connection leaks
4. Implement connection pooling

---

## Migration Strategy

### Adding Indexes Without Downtime

```sql
-- Create index concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY idx_new_index
ON table_name(column_name);

-- Check progress
SELECT
    now()::time(0),
    query_start::time(0),
    now() - query_start AS elapsed,
    query
FROM pg_stat_activity
WHERE query LIKE 'CREATE INDEX%';
```

### Schema Changes

1. **Test in staging first**
2. **Use transactions for safety**
3. **Create indexes CONCURRENTLY**
4. **Monitor performance after changes**
5. **Have rollback plan ready**

---

## Summary Checklist

- [ ] All foreign keys have indexes
- [ ] Frequent WHERE clause columns indexed
- [ ] ORDER BY columns indexed
- [ ] Connection pooling configured
- [ ] Query performance monitored
- [ ] Pagination implemented for lists
- [ ] SELECT * replaced with specific columns
- [ ] N+1 queries eliminated
- [ ] Slow query log reviewed weekly
- [ ] Database backups automated

---

**Need Help?**

See:
- [TEST_DATABASE_SETUP.md](TEST_DATABASE_SETUP.md) for database schema
- [CACHING_LAYER_GUIDE.md](CACHING_LAYER_GUIDE.md) for Redis setup
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production optimization

**PostgreSQL Documentation:**
- https://www.postgresql.org/docs/current/indexes.html
- https://www.postgresql.org/docs/current/performance-tips.html
