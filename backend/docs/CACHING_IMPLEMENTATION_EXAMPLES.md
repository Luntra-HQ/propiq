# Redis Caching Implementation Examples

**Version:** 3.1.1
**Date:** 2025-11-07
**Purpose:** Step-by-step examples for adding caching to PropIQ endpoints

---

## Overview

This guide shows how to implement Redis caching in PropIQ endpoints using the `utils/cache.py` module. Redis caching can provide **10-100x speedup** for frequently accessed data.

---

## Prerequisites

1. Redis installed and running (see CACHING_LAYER_GUIDE.md for setup)
2. `redis` package in requirements.txt: `redis>=5.0.1`
3. Redis configuration in `.env`:
   ```bash
   REDIS_ENABLED=true
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

---

## Quick Start: 3 Ways to Cache

### Method 1: Direct Cache Usage (Most Control)

```python
from utils.cache import cache, CACHE_TTL

@router.get("/api/v1/auth/users/{user_id}")
async def get_user(user_id: str):
    # Try cache first
    cache_key = f"user:{user_id}"
    cached_user = cache.get(cache_key)

    if cached_user:
        logger.debug(f"Cache hit for user {user_id}")
        return {"success": True, "data": cached_user}

    # Cache miss - fetch from database
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Store in cache for 1 hour
    cache.set(cache_key, user, ttl=CACHE_TTL["user_profile"])

    return {"success": True, "data": user}
```

### Method 2: Decorator (Cleanest)

```python
from utils.cache import cached, CACHE_TTL

# Cache the database function
@cached(ttl=CACHE_TTL["user_profile"], key_prefix="user")
def get_user_by_id_cached(user_id: str):
    return get_user_by_id(user_id)

@router.get("/api/v1/auth/users/{user_id}")
async def get_user(user_id: str):
    # Automatically cached
    user = get_user_by_id_cached(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "data": user}
```

### Method 3: Cache Invalidation on Write

```python
from utils.cache import cache_invalidate

@cache_invalidate("user:*")  # Clear all user caches after update
def update_user_in_db(user_id: str, data: dict):
    return update_user(user_id, data)

@router.put("/api/v1/auth/users/{user_id}")
async def update_user_endpoint(user_id: str, data: dict):
    # After update, all user caches are automatically invalidated
    user = update_user_in_db(user_id, data)
    return {"success": True, "data": user}
```

---

## Example 1: Cache User Profile (auth.py)

### Before (No Caching):

```python
@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user details by UUID"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")
```

### After (With Caching):

```python
from utils.cache import cache, CACHE_TTL

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user details by UUID (cached for 1 hour)"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Try cache first
        cache_key = f"user:{user_id}"
        cached_user = cache.get(cache_key)

        if cached_user:
            logger.info(f"Cache hit: user {user_id}")
            return cached_user

        # Cache miss - fetch from database
        logger.info(f"Cache miss: user {user_id}, fetching from database")
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Store in cache (1 hour TTL)
        cache.set(cache_key, user, ttl=CACHE_TTL["user_profile"])
        logger.debug(f"Cached user {user_id} for {CACHE_TTL['user_profile']}s")

        return user

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")
```

**Expected Impact:**
- First request: ~50ms (database query)
- Cached requests: ~2-5ms (100x faster!)
- Cache hit rate after 1 hour: >80%

---

## Example 2: Cache Property Analyses List (propiq.py)

### Scenario: User Dashboard showing recent analyses

```python
from utils.cache import cached, cache_invalidate, CACHE_TTL

# Cache the list query (5 minutes TTL - frequently updated)
@cached(ttl=CACHE_TTL["user_analyses_list"], key_prefix="analyses_list")
def get_user_analyses_cached(user_id: str, limit: int = 20):
    """Get user's analyses with caching"""
    result = supabase.table('property_analyses')\
        .select('*')\
        .eq('user_id', user_id)\
        .order('created_at', desc=True)\
        .limit(limit)\
        .execute()
    return result.data

@router.get("/api/v1/propiq/analyses")
async def get_user_analyses(
    token_payload: dict = Depends(verify_token),
    limit: int = 20
):
    """Get user's property analyses (cached for 5 minutes)"""
    user_id = token_payload["user_id"]

    # Automatically cached
    analyses = get_user_analyses_cached(user_id, limit)

    return {
        "success": True,
        "data": analyses,
        "count": len(analyses)
    }

# Invalidate cache when new analysis is created
@cache_invalidate("analyses_list:*")
def create_analysis_in_db(user_id: str, analysis_data: dict):
    """Create analysis and invalidate list cache"""
    result = supabase.table('property_analyses').insert({
        "user_id": user_id,
        "analysis_data": analysis_data,
        # ... other fields
    }).execute()
    return result.data[0]

@router.post("/api/v1/propiq/analyze")
async def analyze_property(
    request: PropertyAnalysisRequest,
    token_payload: dict = Depends(verify_token)
):
    """Analyze property and invalidate cache"""
    user_id = token_payload["user_id"]

    # Perform analysis
    analysis = perform_analysis(request)

    # Save to database (automatically invalidates cache)
    saved_analysis = create_analysis_in_db(user_id, analysis)

    return {"success": True, "data": saved_analysis}
```

**Expected Impact:**
- Dashboard load time: 500ms → 50ms (10x faster)
- Cache automatically invalidated on new analysis
- Cache TTL: 5 minutes (balances freshness vs performance)

---

## Example 3: Cache Individual Analysis (propiq.py)

```python
from utils.cache import cache, CACHE_TTL

@router.get("/api/v1/propiq/analyses/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Get single analysis by ID (cached for 24 hours)"""
    user_id = token_payload["user_id"]

    # Try cache first
    cache_key = f"analysis:{analysis_id}"
    cached_analysis = cache.get(cache_key)

    if cached_analysis:
        # Verify user owns this analysis
        if cached_analysis.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        return {"success": True, "data": cached_analysis}

    # Cache miss - fetch from database
    result = supabase.table('property_analyses')\
        .select('*')\
        .eq('id', analysis_id)\
        .eq('user_id', user_id)\
        .single()\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    analysis = result.data

    # Cache for 24 hours (analyses don't change)
    cache.set(cache_key, analysis, ttl=CACHE_TTL["property_analysis"])

    return {"success": True, "data": analysis}
```

**Why 24 hours?** Property analyses are immutable (don't change after creation), so we can cache them for a long time.

---

## Example 4: Cache Support Chat Conversation

```python
from utils.cache import cache, CACHE_TTL

@router.get("/api/v1/support/history/{conversation_id}")
async def get_conversation_history(
    conversation_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Get chat history (cached for 1 minute - near real-time)"""
    user_id = token_payload["user_id"]

    # Short cache (1 minute) for real-time feel
    cache_key = f"conversation:{conversation_id}"
    cached_messages = cache.get(cache_key)

    if cached_messages:
        logger.debug(f"Cache hit: conversation {conversation_id}")
        return {"success": True, "messages": cached_messages}

    # Fetch from database
    result = supabase.table('support_chats')\
        .select('*')\
        .eq('conversation_id', conversation_id)\
        .eq('user_id', user_id)\
        .order('created_at', asc=True)\
        .execute()

    messages = result.data

    # Cache for 1 minute (balance real-time vs performance)
    cache.set(cache_key, messages, ttl=CACHE_TTL["support_conversation"])

    return {"success": True, "messages": messages}

# Invalidate cache when new message is sent
@router.post("/api/v1/support/chat")
async def send_message(
    request: ChatRequest,
    token_payload: dict = Depends(verify_token)
):
    """Send message and invalidate conversation cache"""
    user_id = token_payload["user_id"]
    conversation_id = request.conversation_id

    # Save message to database
    # ... (message saving logic)

    # Invalidate conversation cache
    cache_key = f"conversation:{conversation_id}"
    cache.delete(cache_key)
    logger.info(f"Invalidated cache for conversation {conversation_id}")

    return {"success": True, "message": "Message sent"}
```

---

## Cache TTL Recommendations

Use the predefined TTL values from `CACHE_TTL` dictionary:

```python
from utils.cache import CACHE_TTL

CACHE_TTL = {
    "user_profile": 3600,           # 1 hour (users update profile rarely)
    "property_analysis": 86400,     # 24 hours (analyses never change)
    "user_analyses_list": 300,      # 5 minutes (frequently updated)
    "subscription_info": 1800,      # 30 minutes (subscription changes are rare)
    "support_conversation": 60,     # 1 minute (near real-time chat)
}
```

**Guidelines:**
- **Immutable data:** 24 hours (property analyses, historical data)
- **Rarely changing:** 1 hour (user profiles, settings)
- **Frequently updated:** 5 minutes (user lists, dashboards)
- **Real-time data:** 1 minute (chat, notifications)
- **Never cache:** Authentication tokens, payment info

---

## Cache Key Naming Convention

Use a consistent naming pattern:

```python
# Good naming patterns
cache_key = f"user:{user_id}"                           # Single resource
cache_key = f"analyses:user:{user_id}"                  # User's list
cache_key = f"analysis:{analysis_id}"                   # Single analysis
cache_key = f"conversation:{conversation_id}"           # Single conversation
cache_key = f"subscription:{user_id}"                   # User's subscription

# Pattern matching for invalidation
cache.delete_pattern("user:*")                          # All users
cache.delete_pattern(f"analyses:user:{user_id}:*")      # User's analyses
cache.delete_pattern(f"conversation:{conv_id}:*")       # Conversation data
```

---

## Testing Caching

### 1. Test Cache Hit

```python
import time

# First request (cache miss)
start = time.time()
response1 = client.get("/api/v1/auth/users/123")
time1 = time.time() - start
print(f"First request: {time1*1000:.2f}ms")  # ~50ms

# Second request (cache hit)
start = time.time()
response2 = client.get("/api/v1/auth/users/123")
time2 = time.time() - start
print(f"Second request: {time2*1000:.2f}ms")  # ~2-5ms

assert time2 < time1 * 0.2  # Should be 5x faster
```

### 2. Test Cache Invalidation

```python
# Create analysis
response = client.post("/api/v1/propiq/analyze", json=analysis_data)

# Get analyses list (cache miss)
response1 = client.get("/api/v1/propiq/analyses")
analyses1 = response1.json()["data"]

# Get again (cache hit)
response2 = client.get("/api/v1/propiq/analyses")
analyses2 = response2.json()["data"]

assert analyses1 == analyses2  # Same data

# Create another analysis (should invalidate cache)
response = client.post("/api/v1/propiq/analyze", json=analysis_data2)

# Get analyses list (cache miss - was invalidated)
response3 = client.get("/api/v1/propiq/analyses")
analyses3 = response3.json()["data"]

assert len(analyses3) > len(analyses1)  # New analysis included
```

---

## Monitoring Cache Performance

### Check Cache Hit Rate

```python
# In your endpoint
total_requests = 100
cache_hits = 85
hit_rate = (cache_hits / total_requests) * 100

logger.info(f"Cache hit rate: {hit_rate}%")  # Target: >80%
```

### Log Cache Operations

```python
from config.logging_config import get_logger

logger = get_logger(__name__)

# Log cache hits/misses
if cached_data:
    logger.info(f"Cache HIT: {cache_key}")
else:
    logger.info(f"Cache MISS: {cache_key}")
```

### Check Redis Stats

```bash
# Connect to Redis
redis-cli

# Get stats
INFO stats

# Check key count
DBSIZE

# Check memory usage
INFO memory

# Monitor commands in real-time
MONITOR
```

---

## Troubleshooting

### Problem: Cache always misses

**Solutions:**
1. Check Redis is running: `redis-cli ping` (should return "PONG")
2. Check environment: `REDIS_ENABLED=true` in `.env`
3. Check connection: Look for "Connected to Redis" in logs
4. Verify cache key consistency

### Problem: Stale data in cache

**Solutions:**
1. Reduce TTL for frequently updated data
2. Add cache invalidation on write operations
3. Use `cache.delete()` or `cache.delete_pattern()`

### Problem: High memory usage

**Solutions:**
1. Reduce TTL values
2. Use shorter cache keys
3. Cache only necessary data (not full objects)
4. Set Redis maxmemory policy: `maxmemory-policy allkeys-lru`

---

## Implementation Checklist

For each endpoint you want to cache:

- [ ] Identify if data is cacheable (user-specific, frequently accessed)
- [ ] Choose appropriate TTL based on update frequency
- [ ] Add cache key with consistent naming
- [ ] Implement cache-aside pattern (try cache, fallback to DB)
- [ ] Add cache invalidation on write operations
- [ ] Add logging for cache hits/misses
- [ ] Test cache hit rate (target >80%)
- [ ] Monitor performance improvement

---

## Next Steps

1. **Start with high-value endpoints:**
   - User profile (`/api/v1/auth/users/{user_id}`)
   - Property analyses list (`/api/v1/propiq/analyses`)
   - Individual analysis (`/api/v1/propiq/analyses/{id}`)

2. **Measure impact:**
   - Response time before/after caching
   - Database query reduction
   - Cache hit rate

3. **Iterate:**
   - Adjust TTL based on hit rates
   - Add caching to more endpoints
   - Optimize cache keys

---

## Summary

**Caching provides huge performance wins:**
- 10-100x speedup for cached requests
- Reduced database load
- Lower response times
- Better user experience

**Best practices:**
- Cache immutable/rarely-changing data
- Use appropriate TTL values
- Invalidate cache on writes
- Monitor hit rates
- Graceful degradation if Redis unavailable

---

**See Also:**
- [CACHING_LAYER_GUIDE.md](../docs/CACHING_LAYER_GUIDE.md) - Complete Redis setup guide
- [utils/cache.py](../utils/cache.py) - Cache module implementation
- [DATABASE_OPTIMIZATION.md](../docs/DATABASE_OPTIMIZATION.md) - Database optimization

---

**Version:** 1.0
**Last Updated:** 2025-11-07
**Status:** Ready for implementation
