# Redis Caching Deployment Guide

**Sprint 7: Performance Optimization**
**Version:** 3.1.1
**Date:** 2025-11-07

---

## Overview

PropIQ uses Redis caching to improve performance and reduce database load. This guide covers setup for local development and production deployment.

**Expected Performance Improvements:**
- User profile retrieval: **500ms → 5ms** (100x speedup)
- Property analysis list: **300ms → 3ms** (100x speedup)
- Dashboard load: **2s → 200ms** (10x speedup)
- Database load: **50-80% reduction**

**Features:**
- ✅ Automatic JSON serialization
- ✅ Graceful degradation (works without Redis)
- ✅ TTL (time-to-live) support
- ✅ Namespaced keys
- ✅ Production-ready error handling

---

## Quick Start (Choose One)

### Option 1: Upstash (Recommended - Free Tier) ⭐

**Best for:** Production, serverless, zero maintenance

1. **Sign up:** https://upstash.com
2. **Create Redis database** (free tier: 10k commands/day)
3. **Copy connection URL** from dashboard
4. **Add to `.env`:**
   ```bash
   REDIS_ENABLED=true
   REDIS_URL=redis://default:your_password@your-endpoint.upstash.io:6379
   ```

**Pros:**
- ✅ Free tier available
- ✅ Zero maintenance
- ✅ Serverless (pay per use)
- ✅ Global replication
- ✅ TLS/SSL included

**Cons:**
- ⚠️ Free tier limits (10k commands/day)

---

### Option 2: Local Redis (Docker)

**Best for:** Local development

1. **Install Docker Desktop**
2. **Run Redis container:**
   ```bash
   docker run -d \
     --name propiq-redis \
     -p 6379:6379 \
     redis:7-alpine
   ```
3. **Add to `.env`:**
   ```bash
   REDIS_ENABLED=true
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_DB=0
   ```

**Pros:**
- ✅ Free
- ✅ Fast
- ✅ No account needed
- ✅ Full control

**Cons:**
- ⚠️ Only for development
- ⚠️ Requires Docker

---

### Option 3: Azure Cache for Redis

**Best for:** Production on Azure (where PropIQ backend is deployed)

1. **Create Redis Cache:**
   ```bash
   az redis create \
     --name propiq-redis \
     --resource-group propiq-rg \
     --location eastus \
     --sku Basic \
     --vm-size c0
   ```

2. **Get connection info:**
   ```bash
   # Get hostname
   az redis show \
     --name propiq-redis \
     --resource-group propiq-rg \
     --query hostName -o tsv

   # Get primary key
   az redis list-keys \
     --name propiq-redis \
     --resource-group propiq-rg \
     --query primaryKey -o tsv
   ```

3. **Add to `.env`:**
   ```bash
   REDIS_ENABLED=true
   REDIS_URL=rediss://propiq-redis.redis.cache.windows.net:6380?ssl_cert_reqs=required
   REDIS_PASSWORD=your_primary_key
   ```

4. **Configure Azure App Service:**
   ```bash
   az webapp config appsettings set \
     --resource-group propiq-rg \
     --name luntra-outreach-app \
     --settings \
       REDIS_ENABLED=true \
       REDIS_URL="rediss://propiq-redis.redis.cache.windows.net:6380?ssl_cert_reqs=required" \
       REDIS_PASSWORD="your_primary_key"
   ```

**Pricing:**
- Basic C0 (250 MB): **~$16/month**
- Basic C1 (1 GB): **~$55/month**
- Standard (replication): **~$110/month**

**Pros:**
- ✅ Same region as backend (low latency)
- ✅ Azure integration
- ✅ Enterprise features
- ✅ SLA guarantee

**Cons:**
- ⚠️ Not free
- ⚠️ More setup required

---

### Option 4: Redis Cloud

**Best for:** Production, multi-cloud

1. **Sign up:** https://redis.com/try-free
2. **Create database** (free tier: 30 MB, 30 connections)
3. **Get connection details** from dashboard
4. **Add to `.env`:**
   ```bash
   REDIS_ENABLED=true
   REDIS_URL=redis://default:your_password@your-endpoint.redis.cloud:12345
   ```

**Pros:**
- ✅ Free tier available
- ✅ Multi-cloud
- ✅ Redis Enterprise features
- ✅ High availability

**Cons:**
- ⚠️ Free tier limits (30 MB)

---

### Option 5: Homebrew (macOS Local)

**Best for:** macOS local development

```bash
# Install
brew install redis

# Start Redis
brew services start redis

# Or run manually
redis-server

# Add to .env
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

---

## Configuration

### Environment Variables

Copy `.env.redis.example` to `.env` and configure:

```bash
# Enable caching
REDIS_ENABLED=true

# Option A: Use Redis URL (cloud providers)
REDIS_URL=redis://default:password@host:port/db

# Option B: Use individual settings (local)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Optional: Custom TTL presets (seconds)
CACHE_TTL_SHORT=60        # 1 minute
CACHE_TTL_MEDIUM=300      # 5 minutes
CACHE_TTL_LONG=3600       # 1 hour
CACHE_TTL_DAY=86400       # 24 hours
```

### Graceful Degradation

The caching module works without Redis:
- If Redis is unavailable, caching is disabled
- Application continues to work normally
- No performance improvements, but no errors
- Automatic reconnection on recovery

**To disable caching:**
```bash
REDIS_ENABLED=false
```

---

## Testing Redis Connection

### Test Script

Create `backend/test_redis.py`:

```python
import os
from utils.cache import cache

# Test connection
print("Testing Redis connection...")

if cache.client is None:
    print("❌ Redis not available (caching disabled)")
else:
    print("✅ Redis connected")

    # Test set/get
    cache.set("test_key", {"message": "Hello Redis!"}, ttl=60)
    result = cache.get("test_key")

    if result and result.get("message") == "Hello Redis!":
        print("✅ Cache operations working")
        print(f"   Retrieved: {result}")
    else:
        print("❌ Cache operations failed")

    # Test stats
    stats = cache.stats()
    print(f"✅ Cache stats: {stats}")
```

**Run test:**
```bash
cd backend
python test_redis.py
```

### Expected Output

**With Redis:**
```
Testing Redis connection...
✅ Redis connected
✅ Cache operations working
   Retrieved: {'message': 'Hello Redis!'}
✅ Cache stats: {'keys': 1, 'memory': '1.2M', 'hits': 0, 'misses': 0}
```

**Without Redis:**
```
Testing Redis connection...
❌ Redis not available (caching disabled)
```

---

## Using the Cache

### Direct Usage

```python
from utils.cache import cache

# Set with TTL (time-to-live)
cache.set("user:123", user_data, ttl=3600)  # 1 hour

# Get
user = cache.get("user:123")

# Delete
cache.delete("user:123")

# Clear all
cache.clear()
```

### Decorator Usage

```python
from utils.cache import cached

@cached(ttl=3600, key_prefix="user")
def get_user(user_id: str):
    """Get user from database (cached for 1 hour)"""
    return database.get_user(user_id)

# First call: hits database, caches result
user = get_user("123")

# Subsequent calls: returns cached data
user = get_user("123")  # Fast! (from cache)
```

### Cache Invalidation

```python
from utils.cache import cache_invalidate

@cache_invalidate(key_pattern="user:*")
def update_user(user_id: str, data: dict):
    """Update user and invalidate cache"""
    return database.update_user(user_id, data)
```

---

## Applying Cache to Endpoints

### Example: User Profile Caching

**File:** `backend/routers/auth.py`

```python
from utils.cache import cached

@router.get("/users/{user_id}")
@cached(ttl=3600, key_prefix="user_profile")  # Cache for 1 hour
async def get_user_profile(user_id: str):
    """Get user profile (cached)"""
    user = get_user_by_id(user_id)
    return user
```

### Example: Property Analyses List

**File:** `backend/routers/propiq.py`

```python
from utils.cache import cached

@router.get("/analyses")
@cached(ttl=300, key_prefix="analyses_list")  # Cache for 5 minutes
async def list_analyses(user_id: str, page: int = 1):
    """List user's property analyses (cached)"""
    analyses = get_user_analyses(user_id, page=page)
    return analyses
```

---

## Cache Strategy

### What to Cache

**High Priority (cache immediately):**
- ✅ User profile data (1 hour TTL)
- ✅ Property analyses list (5 min TTL)
- ✅ Support conversation list (5 min TTL)
- ✅ Subscription status (1 hour TTL)

**Medium Priority (cache after v1):**
- ⏳ Property analysis details (24 hour TTL)
- ⏳ Usage statistics (5 min TTL)
- ⏳ Pricing tiers (1 hour TTL)

**Never Cache:**
- ❌ Authentication tokens
- ❌ Password hashes
- ❌ Payment information
- ❌ Real-time data

### TTL Guidelines

| Data Type | TTL | Reason |
|-----------|-----|--------|
| User profiles | 1 hour | Changes infrequently |
| Property analyses | 24 hours | Immutable after creation |
| Analyses lists | 5 minutes | Updates on new analysis |
| Subscription status | 1 hour | Changes rarely |
| API health checks | 1 minute | Quick verification |

---

## Monitoring Cache Performance

### Cache Hit Rate

```python
# Add to health endpoint
@router.get("/health")
async def health_check():
    stats = cache.stats() if cache.client else None

    return {
        "status": "healthy",
        "cache": {
            "enabled": cache.client is not None,
            "hit_rate": stats.get("hit_rate") if stats else 0,
            "memory_used": stats.get("memory") if stats else "0"
        }
    }
```

### Target Metrics

**Good Performance:**
- Cache hit rate: **> 70%**
- Response time: **< 50ms** for cached data
- Memory usage: **< 100 MB** (for starter apps)

**Action Needed:**
- Hit rate < 50%: Adjust TTL or cache more data
- Memory > 500 MB: Review cache keys, add expiration
- Response time > 100ms: Check network latency

---

## Production Deployment Checklist

- [ ] Choose Redis provider (Upstash recommended)
- [ ] Create Redis instance
- [ ] Test connection locally
- [ ] Add environment variables to `.env`
- [ ] Deploy Redis settings to Azure App Service
- [ ] Restart backend
- [ ] Verify cache working (check health endpoint)
- [ ] Monitor cache hit rate
- [ ] Apply caching to high-value endpoints
- [ ] Test performance improvements
- [ ] Document cache keys in code

---

## Troubleshooting

### Connection Errors

**Problem:** `Failed to connect to Redis`

**Solutions:**
1. Check `REDIS_URL` format
2. Verify firewall allows connection
3. Test with `redis-cli` or Redis GUI
4. Check Redis server is running
5. Verify credentials are correct

### Performance Not Improving

**Problem:** Cache hit rate is low (< 50%)

**Solutions:**
1. Increase TTL for stable data
2. Cache more frequently accessed endpoints
3. Check cache keys are consistent
4. Review cache invalidation strategy

### Memory Issues

**Problem:** Redis memory usage too high

**Solutions:**
1. Review TTL settings (expire sooner)
2. Use Redis `maxmemory-policy` eviction
3. Clear old keys: `cache.clear()`
4. Upgrade Redis instance size

---

## Cost Comparison

### Free Tiers

| Provider | Storage | Commands/Day | Best For |
|----------|---------|--------------|----------|
| Upstash | 10k commands | 10,000 | Small apps |
| Redis Cloud | 30 MB | Unlimited | Development |
| Local Docker | Unlimited | Unlimited | Local dev |

### Paid Options

| Provider | Price | Storage | Commands |
|----------|-------|---------|----------|
| Upstash (Pay-as-go) | $0.20/100k | 256 MB | Unlimited |
| Azure (Basic C0) | $16/mo | 250 MB | ~100k/sec |
| Azure (Basic C1) | $55/mo | 1 GB | ~100k/sec |
| Redis Cloud (Fixed) | $7/mo | 30 MB | Unlimited |

**Recommendation for PropIQ:**
- **Development:** Docker (free)
- **Production (small):** Upstash free tier
- **Production (growth):** Azure Cache Basic C0 ($16/mo)
- **Production (scale):** Azure Cache Basic C1 ($55/mo)

---

## Next Steps

### Sprint 7: Immediate
1. ✅ Redis infrastructure documented
2. ⏳ Choose Redis provider
3. ⏳ Deploy Redis instance
4. ⏳ Test connection
5. ⏳ Apply caching to endpoints

### Future Enhancements
- Cache warming on startup
- Cache versioning
- Distributed caching
- Cache analytics dashboard
- Automatic cache optimization

---

## References

- [Redis Documentation](https://redis.io/docs/)
- [Upstash Documentation](https://upstash.com/docs/redis)
- [Azure Cache for Redis](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/)
- [PropIQ Cache Module](../backend/utils/cache.py)

---

**Last Updated:** 2025-11-07
**Author:** Claude Code
**Sprint:** 7
**Status:** Infrastructure ready, deployment pending
