"""
Redis caching utilities for PropIQ backend

Provides caching for expensive operations to reduce database load and improve response times.

Usage:
    from utils.cache import cache, cached

    # Direct usage
    cache.set("user:123", user_data, ttl=3600)
    user = cache.get("user:123")

    # Decorator usage
    @cached(ttl=3600, key_prefix="user")
    def get_user(user_id: str):
        return database.get_user(user_id)
"""

import json
import os
from typing import Any, Optional, Callable
from functools import wraps
import hashlib
from config.logging_config import get_logger

logger = get_logger(__name__)


class Cache:
    """
    Redis cache wrapper with automatic serialization and error handling

    Features:
    - Automatic JSON serialization/deserialization
    - Graceful degradation (falls back to no-cache if Redis unavailable)
    - TTL (time-to-live) support
    - Namespaced keys
    - Type-safe operations
    """

    def __init__(self):
        """Initialize Redis connection"""
        self.client = None
        self._connect()

    def _connect(self):
        """Connect to Redis server"""
        # Check if caching is enabled
        if not self._is_enabled():
            logger.info("Caching disabled (REDIS_ENABLED=False)")
            return

        try:
            import redis

            # Get Redis configuration from environment
            redis_url = os.getenv("REDIS_URL")
            redis_host = os.getenv("REDIS_HOST", "localhost")
            redis_port = int(os.getenv("REDIS_PORT", "6379"))
            redis_db = int(os.getenv("REDIS_DB", "0"))
            redis_password = os.getenv("REDIS_PASSWORD")

            # Connect using URL if provided, otherwise use host/port
            if redis_url:
                self.client = redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
            else:
                self.client = redis.Redis(
                    host=redis_host,
                    port=redis_port,
                    db=redis_db,
                    password=redis_password,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )

            # Test connection
            self.client.ping()
            logger.info(f"Connected to Redis: {redis_host}:{redis_port}")

        except ImportError:
            logger.warning("redis package not installed, caching disabled")
            self.client = None
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}, caching disabled")
            self.client = None

    def _is_enabled(self) -> bool:
        """Check if caching is enabled via environment variable"""
        return os.getenv("REDIS_ENABLED", "true").lower() in ("true", "1", "yes")

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value (deserialized from JSON) or None if not found

        Example:
            user = cache.get("user:123")
        """
        if not self.client:
            return None

        try:
            value = self.client.get(key)
            if value is None:
                logger.debug(f"Cache miss: {key}")
                return None

            logger.debug(f"Cache hit: {key}")
            return json.loads(value)
        except Exception as e:
            logger.warning(f"Cache get error for key '{key}': {e}")
            return None

    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """
        Set value in cache with TTL

        Args:
            key: Cache key
            value: Value to cache (will be serialized to JSON)
            ttl: Time-to-live in seconds (default: 1 hour)

        Returns:
            True if successful, False otherwise

        Example:
            cache.set("user:123", user_data, ttl=3600)
        """
        if not self.client:
            return False

        try:
            serialized = json.dumps(value)
            self.client.setex(key, ttl, serialized)
            logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.warning(f"Cache set error for key '{key}': {e}")
            return False

    def delete(self, key: str) -> bool:
        """
        Delete value from cache

        Args:
            key: Cache key

        Returns:
            True if key was deleted, False otherwise

        Example:
            cache.delete("user:123")
        """
        if not self.client:
            return False

        try:
            result = self.client.delete(key)
            logger.debug(f"Cache delete: {key}")
            return result > 0
        except Exception as e:
            logger.warning(f"Cache delete error for key '{key}': {e}")
            return False

    def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching pattern

        Args:
            pattern: Redis key pattern (supports wildcards: *, ?)

        Returns:
            Number of keys deleted

        Example:
            # Delete all user caches
            cache.delete_pattern("user:*")

            # Delete specific user's analysis caches
            cache.delete_pattern("analyses:user:123:*")
        """
        if not self.client:
            return 0

        try:
            keys = self.client.keys(pattern)
            if not keys:
                return 0

            count = self.client.delete(*keys)
            logger.info(f"Cache deleted {count} keys matching pattern: {pattern}")
            return count
        except Exception as e:
            logger.warning(f"Cache delete_pattern error for pattern '{pattern}': {e}")
            return 0

    def clear_all(self) -> bool:
        """
        Clear all cache (DANGEROUS - use with caution)

        Returns:
            True if successful, False otherwise

        Warning:
            This deletes ALL keys in the Redis database
        """
        if not self.client:
            return False

        try:
            self.client.flushdb()
            logger.warning("Cache cleared (all keys deleted)")
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False

    def get_ttl(self, key: str) -> Optional[int]:
        """
        Get remaining TTL for a key

        Args:
            key: Cache key

        Returns:
            Remaining TTL in seconds, None if key doesn't exist, -1 if no TTL

        Example:
            ttl = cache.get_ttl("user:123")
            if ttl and ttl < 300:  # Less than 5 minutes remaining
                # Refresh cache
        """
        if not self.client:
            return None

        try:
            ttl = self.client.ttl(key)
            return ttl if ttl >= 0 else None
        except Exception as e:
            logger.warning(f"Cache get_ttl error for key '{key}': {e}")
            return None

    def exists(self, key: str) -> bool:
        """
        Check if key exists in cache

        Args:
            key: Cache key

        Returns:
            True if key exists, False otherwise
        """
        if not self.client:
            return False

        try:
            return self.client.exists(key) > 0
        except Exception as e:
            logger.warning(f"Cache exists error for key '{key}': {e}")
            return False


# Global cache instance
cache = Cache()


def cached(ttl: int = 3600, key_prefix: str = ""):
    """
    Decorator to cache function results

    Args:
        ttl: Time-to-live in seconds (default: 1 hour)
        key_prefix: Prefix for cache key (default: function name)

    Returns:
        Decorated function that caches results

    Example:
        @cached(ttl=3600, key_prefix="user")
        def get_user(user_id: str):
            return database.get_user(user_id)

        # First call hits database
        user = get_user("123")

        # Second call returns cached result
        user = get_user("123")  # Fast!
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            prefix = key_prefix or func.__name__

            # Create hash of arguments for cache key
            args_str = json.dumps([str(arg) for arg in args], sort_keys=True)
            kwargs_str = json.dumps(kwargs, sort_keys=True)
            args_hash = hashlib.md5(f"{args_str}{kwargs_str}".encode()).hexdigest()[:8]

            cache_key = f"{prefix}:{args_hash}"

            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result

            # Cache miss - execute function
            logger.debug(f"Cache miss for {func.__name__}, executing function")
            result = func(*args, **kwargs)

            # Store in cache
            cache.set(cache_key, result, ttl=ttl)

            return result
        return wrapper
    return decorator


def cache_invalidate(key_pattern: str):
    """
    Decorator to invalidate cache after function execution

    Useful for write operations that modify data that's cached.

    Args:
        key_pattern: Pattern of cache keys to invalidate (supports wildcards)

    Example:
        @cache_invalidate("user:*")
        def update_user(user_id: str, data: dict):
            database.update_user(user_id, data)

        # After update, all user caches are invalidated
        update_user("123", {"name": "New Name"})
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Execute function
            result = func(*args, **kwargs)

            # Invalidate cache
            deleted = cache.delete_pattern(key_pattern)
            if deleted > 0:
                logger.info(f"Invalidated {deleted} cache keys matching: {key_pattern}")

            return result
        return wrapper
    return decorator


# Cache configuration presets
CACHE_TTL = {
    "user_profile": 3600,  # 1 hour
    "property_analysis": 86400,  # 24 hours (analyses don't change)
    "user_analyses_list": 300,  # 5 minutes (frequently updated)
    "subscription_info": 1800,  # 30 minutes
    "support_conversation": 60,  # 1 minute (real-time chat)
}


# Example usage in endpoints:
"""
from utils.cache import cache, cached, cache_invalidate, CACHE_TTL

# Option 1: Direct cache usage
@app.get("/api/v1/auth/profile")
async def get_profile(token_payload: dict = Depends(verify_token)):
    user_id = token_payload["user_id"]

    # Try cache first
    cached_user = cache.get(f"user:{user_id}")
    if cached_user:
        return {"success": True, "data": cached_user}

    # Cache miss - fetch from database
    user = await database.get_user(user_id)

    # Store in cache
    cache.set(f"user:{user_id}", user, ttl=CACHE_TTL["user_profile"])

    return {"success": True, "data": user}


# Option 2: Decorator usage (cleaner)
@cached(ttl=CACHE_TTL["user_profile"], key_prefix="user")
async def get_user_from_db(user_id: str):
    return await database.get_user(user_id)

@app.get("/api/v1/auth/profile")
async def get_profile(token_payload: dict = Depends(verify_token)):
    user = await get_user_from_db(token_payload["user_id"])
    return {"success": True, "data": user}


# Option 3: Cache invalidation on write
@cache_invalidate("user:*")
async def update_user(user_id: str, data: dict):
    return await database.update_user(user_id, data)

@app.put("/api/v1/auth/profile")
async def update_profile(
    data: dict,
    token_payload: dict = Depends(verify_token)
):
    user = await update_user(token_payload["user_id"], data)
    return {"success": True, "data": user}
"""
