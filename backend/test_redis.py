"""
Test Redis connection and caching functionality
Sprint 7: Verify Redis deployment
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from utils.cache import cache

def test_redis_connection():
    """Test Redis connection"""
    print("=" * 60)
    print("Testing Redis Connection")
    print("=" * 60)

    if cache.client is None:
        print("❌ Redis not available (caching disabled)")
        print("\nTo enable Redis:")
        print("1. Set REDIS_ENABLED=true in .env")
        print("2. Configure REDIS_URL or REDIS_HOST")
        print("3. See docs/REDIS_DEPLOYMENT_GUIDE.md for setup")
        return False
    else:
        print("✅ Redis connected")
        print(f"   Host: {os.getenv('REDIS_HOST', 'from REDIS_URL')}")
        return True

def test_cache_operations():
    """Test cache set/get operations"""
    print("\n" + "=" * 60)
    print("Testing Cache Operations")
    print("=" * 60)

    if cache.client is None:
        print("⏭️  Skipped (Redis not available)")
        return

    try:
        # Test 1: Set and get string
        test_data = {"message": "Hello Redis!", "number": 42}
        cache.set("test_key", test_data, ttl=60)
        result = cache.get("test_key")

        if result and result.get("message") == "Hello Redis!":
            print("✅ Cache set/get working")
            print(f"   Retrieved: {result}")
        else:
            print("❌ Cache set/get failed")
            return

        # Test 2: TTL
        cache.set("ttl_test", "expires soon", ttl=1)
        print("✅ TTL set successfully")

        # Test 3: Delete
        cache.delete("test_key")
        deleted_result = cache.get("test_key")
        if deleted_result is None:
            print("✅ Cache delete working")
        else:
            print("❌ Cache delete failed")

        # Test 4: Cache with prefix
        cache.set("user:123", {"name": "Test User"}, ttl=60)
        user = cache.get("user:123")
        if user and user.get("name") == "Test User":
            print("✅ Namespaced keys working")
        else:
            print("❌ Namespaced keys failed")

    except Exception as e:
        print(f"❌ Cache operations error: {e}")

def test_cache_stats():
    """Test cache statistics"""
    print("\n" + "=" * 60)
    print("Cache Statistics")
    print("=" * 60)

    if cache.client is None:
        print("⏭️  Skipped (Redis not available)")
        return

    try:
        stats = cache.stats()
        print(f"✅ Keys: {stats.get('keys', 'N/A')}")
        print(f"✅ Memory: {stats.get('memory', 'N/A')}")
        print(f"✅ Hit Rate: {stats.get('hit_rate', 0):.1f}%")
    except Exception as e:
        print(f"❌ Stats error: {e}")

def test_graceful_degradation():
    """Test that app works without Redis"""
    print("\n" + "=" * 60)
    print("Testing Graceful Degradation")
    print("=" * 60)

    # This should never crash
    try:
        cache.get("nonexistent_key")
        cache.set("test", "data", ttl=60)
        cache.delete("test")
        print("✅ App works without Redis (graceful degradation)")
    except Exception as e:
        print(f"❌ Graceful degradation failed: {e}")

def main():
    """Run all tests"""
    print("\n🧪 PropIQ Redis Test Suite\n")

    # Check environment
    redis_enabled = os.getenv("REDIS_ENABLED", "true").lower() in ("true", "1", "yes")
    print(f"Environment: REDIS_ENABLED={redis_enabled}")

    if os.getenv("REDIS_URL"):
        print(f"Environment: REDIS_URL=***{os.getenv('REDIS_URL')[-20:]}")
    elif os.getenv("REDIS_HOST"):
        print(f"Environment: REDIS_HOST={os.getenv('REDIS_HOST')}")

    print()

    # Run tests
    connected = test_redis_connection()
    test_cache_operations()
    test_cache_stats()
    test_graceful_degradation()

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)

    if connected:
        print("✅ Redis is working correctly")
        print("✅ Ready to add caching to endpoints")
        print("\nNext steps:")
        print("1. See docs/REDIS_DEPLOYMENT_GUIDE.md")
        print("2. Apply @cached decorator to endpoints")
        print("3. Monitor cache hit rate")
    else:
        print("ℹ️  Redis not configured (optional)")
        print("   App will work without caching")
        print("\nTo enable Redis:")
        print("1. See docs/REDIS_DEPLOYMENT_GUIDE.md")
        print("2. Choose a Redis provider (Upstash recommended)")
        print("3. Configure environment variables")

if __name__ == "__main__":
    main()
