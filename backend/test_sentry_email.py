"""
Quick Sentry Email Alert Test
Sends a test error to Sentry to verify email notifications work
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Sentry config
from config.sentry_config import init_sentry, capture_exception, set_user_context

def main():
    print("🧪 Sentry Email Alert Test")
    print("=" * 50)

    # Initialize Sentry
    print("\n1. Initializing Sentry...")
    init_sentry()
    print("   ✓ Sentry initialized")

    # Set user context (so you know it's from this test)
    print("\n2. Setting user context...")
    set_user_context(
        user_id="test-user",
        email="bdusape@luntra.one",
        subscription_tier="test"
    )
    print("   ✓ User context set")

    # Trigger test error
    print("\n3. Sending test error to Sentry...")
    try:
        raise Exception(
            "🧪 TEST EMAIL ALERT - PropIQ Sentry Email Test\n"
            "If you receive this email, your Sentry email alerts are working!\n"
            "You can safely ignore or resolve this issue in Sentry."
        )
    except Exception as e:
        capture_exception(
            e,
            test_type="email_alert_test",
            timestamp=str(os.popen('date').read().strip()),
            user="bdusape@luntra.one"
        )
        print("   ✓ Test error sent to Sentry")

    print("\n4. Check your email (bdusape@luntra.one)")
    print("   Expected: Email from alerts@sentry.io within 1-2 minutes")
    print("   Subject: Similar to '[PropIQ] New Issue: TEST EMAIL ALERT'")

    print("\n5. Also check Sentry Dashboard:")
    print("   https://sentry.io")
    print("   Should see new issue within 30 seconds")

    print("\n" + "=" * 50)
    print("✅ Test complete! Check your email now.")
    print("\nNote: If you don't receive email within 2 minutes:")
    print("  1. Check spam/junk folder")
    print("  2. Verify email settings: https://sentry.io/settings/account/notifications/")
    print("  3. Check Sentry dashboard to confirm error was received")

if __name__ == "__main__":
    main()
