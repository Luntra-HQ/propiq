"""
Simple Sentry Email Alert Test
Minimal test without complex imports
"""
import sentry_sdk
import os

# Your Sentry DSN
SENTRY_DSN = "https://427c9f40afdbd3c2ec43f062f5609257@o4510522471219200.ingest.us.sentry.io/4510535827849216"

print("🧪 Sentry Email Alert Test")
print("=" * 60)

# Initialize Sentry
print("\n1. Initializing Sentry...")
sentry_sdk.init(
    dsn=SENTRY_DSN,
    environment="test",
    traces_sample_rate=1.0,
)
print("   ✓ Sentry initialized")

# Set user context
print("\n2. Setting user context...")
sentry_sdk.set_user({
    "id": "test-user",
    "email": "bdusape@luntra.one",
})
print("   ✓ User context set")

# Send test error
print("\n3. Sending test error...")
try:
    raise Exception(
        "🧪 TEST EMAIL ALERT - PropIQ Sentry Email Test\n\n"
        "If you receive this email at bdusape@luntra.one, "
        "your Sentry email alerts are working!\n\n"
        "You can safely resolve this test issue in Sentry."
    )
except Exception as e:
    sentry_sdk.capture_exception(e)
    print("   ✓ Test error sent to Sentry")

# Flush to ensure it's sent
print("\n4. Flushing Sentry queue...")
sentry_sdk.flush()
print("   ✓ Queue flushed")

print("\n" + "=" * 60)
print("✅ Test complete!")
print("\n📧 CHECK YOUR EMAIL: bdusape@luntra.one")
print("   Expected: Email from alerts@sentry.io within 1-2 minutes")
print("   Subject: '[PropIQ Backend] New Issue: TEST EMAIL ALERT'")
print("\n🌐 ALSO CHECK SENTRY DASHBOARD:")
print("   https://sentry.io")
print("   Should see new issue within 30 seconds")
print("\n💡 If you don't receive email:")
print("   1. Check spam/junk folder")
print("   2. Go to: https://sentry.io/settings/account/notifications/")
print("   3. Verify 'Issue Alerts' are enabled")
print("=" * 60)
