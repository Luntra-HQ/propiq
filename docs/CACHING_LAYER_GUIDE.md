# Caching Layer Guide (Redis)

**Version:** 3.1.1
**Last Updated:** 2025-11-07
**Cache:** Redis

---

## Overview

This guide explains how to implement Redis caching for PropIQ to improve performance, reduce database load, and lower API latency.

---

## Table of Contents

1. [Why Caching](#why-caching)
2. [Redis Setup](#redis-setup)
3. [Caching Strategies](#caching-strategies)
4. [Implementation](#implementation)
5. [Cache Invalidation](#cache-invalidation)
6. [Monitoring](#monitoring)
7. [Best Practices](#best-practices)

---

## Why Caching

### Benefits

- **Faster Response Times:** 10-100x faster than database queries
- **Reduced Database Load:** Fewer queries = better database performance
- **Lower Costs:** Reduced compute and database usage
- **Better Scalability:** Handle more requests with same infrastructure
- **Improved User Experience:** Faster page loads and API responses

### What to Cache

✅ **Good candidates:**
- User profiles (rarely change)
- Subscription tier info
- Property analysis results
- API responses for expensive computations
- Session data
- Rate limit counters

❌ **Don't cache:**
- Highly dynamic data
- Sensitive PII (unless encrypted)
- Data that must be real-time
- Large objects (>1MB)

---

## Redis Setup

### Option 1: Local Development (Docker)

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    container_name: propiq-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru

volumes:
  redis_data:
```

Start Redis:
```bash
docker-compose up -d redis
```

### Option 2: Cloud (Redis Cloud - Recommended for Production)

1. Go to https://redis.com/try-free/
2. Create free account
3. Create new database
4. Copy connection details:

```bash
REDIS_URL=redis://default:password@redis-12345.cloud.redislabs.com:12345
```

### Option 3: Azure Cache for Redis

```bash
# Create Azure Redis Cache
az redis create \
  --resource-group luntra-outreach-rg \
  --name propiq-cache \
  --location eastus2 \
  --sku Basic \
  --vm-size c0 \
  --enable-non-ssl-port false

# Get connection string
az redis list-keys \
  --resource-group luntra-outreach-rg \
  --name propiq-cache
```

### Install Redis Python Client

```bash
pip install redis hiredis  # hiredis for faster parsing
```

Add to `requirements.txt`:
```
redis>=5.0.0
hiredis>=2.2.0
```

---

## Caching Strategies

### 1. Cache-Aside (Lazy Loading)

**Pattern:** Check cache first, fetch from DB on miss, populate cache

```python
def get_user(user_id: str):
    # 1. Try cache first
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)

    # 2. Cache miss - fetch from database
    user = database.get_user(user_id)

    # 3. Populate cache
    redis.setex(
        f"user:{user_id}",
        3600,  # TTL: 1 hour
        json.dumps(user)
    )

    return user
```

**Pros:** Only caches requested data, simple to implement
**Cons:** Initial request is slow (cache miss), potential cache stampede

### 2. Write-Through

**Pattern:** Write to cache and database simultaneously

```python
def update_user(user_id: str, data: dict):
    # 1. Update database
    database.update_user(user_id, data)

    # 2. Update cache immediately
    redis.setex(
        f"user:{user_id}",
        3600,
        json.dumps(data)
    )
```

**Pros:** Cache always in sync, no stale data
**Cons:** Slower writes, cache pollution

### 3. Write-Behind (Write-Back)

**Pattern:** Write to cache immediately, sync to database async

```python
async def update_user(user_id: str, data: dict):
    # 1. Update cache immediately
    redis.setex(f"user:{user_id}", 3600, json.dumps(data))

    # 2. Queue database update (async)
    await queue_db_update(user_id, data)
```

**Pros:** Fast writes, reduced database load
**Cons:** Risk of data loss, more complex

### 4. Refresh-Ahead

**Pattern:** Proactively refresh cache before expiry

```python
def get_user_with_refresh(user_id: str):
    cached = redis.get(f"user:{user_id}")
    ttl = redis.ttl(f"user:{user_id}")

    # Refresh if TTL < 10% remaining
    if cached and ttl < 360:  # 10% of 3600s
        # Trigger background refresh
        background_tasks.add_task(refresh_user_cache, user_id)

    return json.loads(cached) if cached else fetch_and_cache_user(user_id)
```

**Pros:** No cache misses for frequently accessed data
**Cons:** More complexity, potential wasted refreshes

---

## Implementation

### Setup Redis Client

```python
# backend/config/cache.py

import redis
import os
from typing import Optional, Any
import json
from config.logging_config import get_logger

logger = get_logger(__name__)

# Create Redis client
redis_client = redis.from_url(
    os.getenv('REDIS_URL', 'redis://localhost:6379'),
    decode_responses=True,  # Auto-decode bytes to strings
    socket_connect_timeout=5,
    socket_timeout=5,
    retry_on_timeout=True,
    health_check_interval=30
)

# Test connection
try:
    redis_client.ping()
    logger.info("✅ Redis connection successful")
except Exception as e:
    logger.warning(f"⚠️  Redis unavailable: {e}")
    redis_client = None  # Graceful degradation


class Cache:
    """
    Cache wrapper with automatic serialization

    Usage:
        cache = Cache()
        cache.set("key", {"data": "value"}, ttl=3600)
        data = cache.get("key")
    """

    def __init__(self, client=redis_client):
        self.client = client

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.client:
            return None

        try:
            value = self.client.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.warning(f"Cache get error: {e}")
            return None

    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL"""
        if not self.client:
            return False

        try:
            self.client.setex(key, ttl, json.dumps(value))
            return True
        except Exception as e:
            logger.warning(f"Cache set error: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.client:
            return False

        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete error: {e}")
            return False

    def exists(self, key: str) -> bool:
        """Check if key exists"""
        if not self.client:
            return False

        try:
            return self.client.exists(key) > 0
        except Exception as e:
            logger.warning(f"Cache exists error: {e}")
            return False

    def invalidate_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.client:
            return 0

        try:
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.warning(f"Cache invalidate error: {e}")
            return 0


# Global cache instance
cache = Cache()
```

### Caching Decorator

```python
# backend/utils/cache_decorator.py

from functools import wraps
from config.cache import cache
import hashlib
import inspect

def cached(ttl: int = 3600, key_prefix: str = ""):
    """
    Decorator to cache function results

    Usage:
        @cached(ttl=3600, key_prefix="user")
        def get_user(user_id: str):
            return database.get_user(user_id)

        # First call: fetches from database, caches result
        # Subsequent calls: returns from cache (until TTL expires)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_parts = [key_prefix or func.__name__]

            # Add positional arguments
            key_parts.extend(str(arg) for arg in args)

            # Add keyword arguments (sorted for consistency)
            key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))

            cache_key = ":".join(key_parts)

            # Try cache first
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result

            # Cache miss - execute function
            result = func(*args, **kwargs)

            # Cache result
            cache.set(cache_key, result, ttl=ttl)

            return result

        return wrapper
    return decorator
```

### Example: Cache User Profile

```python
# backend/auth.py

from config.cache import cache
from utils.cache_decorator import cached

@router.get("/api/v1/auth/profile")
@cached(ttl=1800, key_prefix="profile")  # Cache for 30 minutes
async def get_profile(token_payload: dict = Depends(verify_token)):
    user_id = token_payload.get("user_id")

    # This will be cached after first call
    user = database.get_user(user_id)

    return {
        "success": True,
        "user": user
    }
```

### Example: Cache Property Analysis

```python
# backend/routers/propiq.py

from config.cache import cache
import hashlib

@router.post("/api/v1/propiq/analyze")
async def analyze_property(
    request: PropertyAnalysisRequest,
    token_payload: dict = Depends(verify_token)
):
    # Generate cache key from request data
    cache_key = f"analysis:{hashlib.md5(request.address.encode()).hexdigest()}"

    # Check cache first
    cached_analysis = cache.get(cache_key)
    if cached_analysis:
        logger.info(f"Cache hit for address: {request.address}")
        return {
            "success": True,
            "analysis": cached_analysis,
            "cached": True
        }

    # Cache miss - perform analysis
    analysis = perform_expensive_analysis(request)

    # Cache for 24 hours (property data doesn't change frequently)
    cache.set(cache_key, analysis, ttl=86400)

    return {
        "success": True,
        "analysis": analysis,
        "cached": False
    }
```

---

## Cache Invalidation

### Manual Invalidation

```python
# Invalidate specific user
cache.delete(f"user:{user_id}")

# Invalidate all user caches
cache.invalidate_pattern("user:*")

# Invalidate property analysis
cache.delete(f"analysis:{property_hash}")
```

### Automatic Invalidation on Update

```python
@router.put("/api/v1/auth/profile")
async def update_profile(
    data: UserUpdateRequest,
    token_payload: dict = Depends(verify_token)
):
    user_id = token_payload.get("user_id")

    # Update database
    updated_user = database.update_user(user_id, data)

    # Invalidate cache
    cache.delete(f"user:{user_id}")
    cache.delete(f"profile:{user_id}")

    return {"success": True, "user": updated_user}
```

### Time-Based Invalidation (TTL)

```python
# Short TTL for frequently changing data
cache.set("rate_limit:user123", current_count, ttl=60)  # 1 minute

# Medium TTL for moderately changing data
cache.set("user:profile:123", user_data, ttl=1800)  # 30 minutes

# Long TTL for rarely changing data
cache.set("subscription:tiers", tiers, ttl=86400)  # 24 hours
```

---

## Monitoring

### Redis Metrics

```python
def get_cache_stats():
    """Get Redis statistics"""
    info = redis_client.info()

    return {
        "memory": {
            "used": info.get("used_memory_human"),
            "peak": info.get("used_memory_peak_human"),
            "fragmentation": info.get("mem_fragmentation_ratio")
        },
        "stats": {
            "total_commands": info.get("total_commands_processed"),
            "ops_per_sec": info.get("instantaneous_ops_per_sec"),
            "hit_rate": calculate_hit_rate(info),
            "connected_clients": info.get("connected_clients")
        },
        "persistence": {
            "rdb_last_save": info.get("rdb_last_save_time"),
            "aof_enabled": info.get("aof_enabled")
        }
    }

def calculate_hit_rate(info):
    hits = info.get("keyspace_hits", 0)
    misses = info.get("keyspace_misses", 0)
    total = hits + misses

    return (hits / total * 100) if total > 0 else 0
```

### Application Metrics

```python
# Track cache performance
cache_hits = 0
cache_misses = 0

def track_cache_access(hit: bool):
    global cache_hits, cache_misses
    if hit:
        cache_hits += 1
    else:
        cache_misses += 1

# Log metrics periodically
@app.on_event("startup")
async def start_metrics_logger():
    while True:
        await asyncio.sleep(60)  # Every minute
        total = cache_hits + cache_misses
        hit_rate = (cache_hits / total * 100) if total > 0 else 0
        logger.info(f"Cache hit rate: {hit_rate:.2f}% (hits: {cache_hits}, misses: {cache_misses})")
```

---

## Best Practices

### 1. Key Naming Conventions

✅ **Good:**
```python
# Clear, hierarchical naming
"user:profile:123"
"analysis:property:hash"
"session:token:abc"
"rate_limit:ip:192.168.1.1"
```

❌ **Bad:**
```python
"u123"  # Unclear
"data"  # Too generic
"temp_cache"  # What data?
```

### 2. TTL Guidelines

```python
# Real-time data: 1-5 minutes
cache.set("rate_limit", count, ttl=60)

# Frequently updated: 15-30 minutes
cache.set("user:profile", data, ttl=1800)

# Rarely updated: 1-24 hours
cache.set("subscription:tiers", tiers, ttl=86400)

# Static content: 7 days
cache.set("config:app", config, ttl=604800)
```

### 3. Cache Size Management

```python
# Set max memory policy in redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru  # Evict least recently used keys
```

### 4. Graceful Degradation

```python
def get_user_profile(user_id: str):
    try:
        # Try cache first
        cached = cache.get(f"user:{user_id}")
        if cached:
            return cached
    except Exception as e:
        logger.warning(f"Cache error: {e}")
        # Continue to database even if cache fails

    # Fallback to database
    return database.get_user(user_id)
```

### 5. Avoid Cache Stampede

```python
import time
from threading import Lock

locks = {}

def get_with_lock(key: str, fetch_func, ttl: int = 3600):
    """Prevent multiple concurrent fetches of same key"""

    # Check cache
    cached = cache.get(key)
    if cached:
        return cached

    # Acquire lock for this key
    if key not in locks:
        locks[key] = Lock()

    with locks[key]:
        # Double-check cache (another thread may have populated it)
        cached = cache.get(key)
        if cached:
            return cached

        # Fetch data
        data = fetch_func()

        # Cache result
        cache.set(key, data, ttl=ttl)

        return data
```

---

## Testing

### Unit Tests with Mock Cache

```python
# tests/test_cache.py

from unittest.mock import Mock, patch
import pytest

@patch('config.cache.redis_client')
def test_cache_hit(mock_redis):
    mock_redis.get.return_value = '{"id": "123", "name": "Test"}'

    result = cache.get("user:123")

    assert result == {"id": "123", "name": "Test"}
    mock_redis.get.assert_called_once_with("user:123")

@patch('config.cache.redis_client')
def test_cache_miss(mock_redis):
    mock_redis.get.return_value = None

    result = cache.get("user:999")

    assert result is None
```

### Integration Tests

```python
def test_cache_integration():
    # Clear cache
    cache.delete("test:key")

    # Set value
    cache.set("test:key", {"data": "value"}, ttl=60)

    # Get value
    result = cache.get("test:key")
    assert result == {"data": "value"}

    # Delete
    cache.delete("test:key")
    assert cache.get("test:key") is None
```

---

## Troubleshooting

### Issue: High Memory Usage

**Solution:**
1. Check key count: `redis-cli DBSIZE`
2. Find large keys: `redis-cli --bigkeys`
3. Reduce TTLs for large objects
4. Increase maxmemory limit
5. Use compression for large values

### Issue: Low Hit Rate

**Solution:**
1. Increase TTLs
2. Pre-warm cache for common queries
3. Review cache invalidation logic
4. Check if data is actually reused

### Issue: Cache Unavailable

**Solution:**
1. Implement graceful degradation
2. Check Redis server status
3. Verify network connectivity
4. Review connection settings

---

## Performance Targets

- **Cache Hit Rate:** > 80%
- **Average Latency:** < 5ms for cache hits
- **Memory Usage:** < 80% of max
- **Eviction Rate:** < 1% of requests

---

## Summary Checklist

- [ ] Redis installed and configured
- [ ] Cache client configured with connection pooling
- [ ] Caching decorator implemented
- [ ] Common queries cached (users, analyses)
- [ ] Cache invalidation logic implemented
- [ ] TTL configured appropriately
- [ ] Graceful degradation for cache failures
- [ ] Cache metrics monitored
- [ ] Documentation updated
- [ ] Tests written for cached functions

---

**Ready to implement caching!**

Start with high-value caches:
1. User profiles (`cache.set(f"user:{id}", user, ttl=1800)`)
2. Property analyses (`cache.set(f"analysis:{hash}", analysis, ttl=86400)`)
3. Rate limiting (`cache.set(f"rate:{ip}", count, ttl=60)`)

See [DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md) for query optimization strategies.
