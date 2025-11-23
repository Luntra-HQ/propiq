#!/usr/bin/env python3
"""
Stripe Webhook Integration Test
Tests the complete webhook flow including database subscription updates

Prerequisites:
1. Install Stripe CLI: brew install stripe/stripe-cli/stripe
2. Login: stripe login
3. Start webhook forwarding: stripe listen --forward-to localhost:8000/api/v1/stripe/webhook
4. Run this script in a separate terminal

Usage:
    python test_stripe_webhook.py [--production]
"""

import os
import sys
import json
import time
import requests
import subprocess
from typing import Dict, Optional, Tuple
from datetime import datetime

# Configuration
LOCAL_API = "http://localhost:8000"
PRODUCTION_API = "https://luntra-outreach-app.azurewebsites.net"

# Test configuration
TEST_USER = {
    "email": f"webhook-test-{int(time.time())}@example.com",
    "password": "TestPassword123!",
    "firstName": "Webhook",
    "lastName": "Tester"
}

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def log(msg: str, color: str = Colors.END):
    print(f"{color}{msg}{Colors.END}")

def log_success(msg: str):
    log(f"✅ {msg}", Colors.GREEN)

def log_error(msg: str):
    log(f"❌ {msg}", Colors.RED)

def log_info(msg: str):
    log(f"ℹ️  {msg}", Colors.CYAN)

def log_warn(msg: str):
    log(f"⚠️  {msg}", Colors.YELLOW)

def log_header(msg: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{msg}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}\n")


class StripeWebhookTester:
    def __init__(self, api_base: str):
        self.api_base = api_base
        self.access_token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.user_email: str = TEST_USER["email"]

    def test_health(self) -> bool:
        """Test API and Stripe health endpoints"""
        log_header("1. Health Check")

        try:
            # Main health
            resp = requests.get(f"{self.api_base}/health", timeout=10)
            if resp.status_code == 200:
                log_success(f"API healthy: {resp.json().get('status')}")
            else:
                log_error(f"API unhealthy: {resp.status_code}")
                return False

            # Stripe health
            resp = requests.get(f"{self.api_base}/stripe/health", timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                log_success(f"Stripe healthy: {data.get('status')}")
                log_info(f"   Webhook configured: {data.get('webhook_configured')}")
            else:
                log_error(f"Stripe unhealthy: {resp.status_code}")
                return False

            return True
        except Exception as e:
            log_error(f"Health check failed: {e}")
            return False

    def create_test_user(self) -> bool:
        """Create or login test user"""
        log_header("2. Create Test User")

        try:
            # Try signup
            resp = requests.post(
                f"{self.api_base}/auth/signup",
                json=TEST_USER,
                timeout=10
            )

            if resp.status_code == 200:
                data = resp.json()
                if data.get("success"):
                    self.access_token = data.get("accessToken")
                    self.user_id = data.get("userId")
                    log_success(f"Created user: {TEST_USER['email']}")
                    log_info(f"   User ID: {self.user_id}")
                    return True

            # User exists, try login
            resp = requests.post(
                f"{self.api_base}/auth/login",
                json={"email": TEST_USER["email"], "password": TEST_USER["password"]},
                timeout=10
            )

            if resp.status_code == 200:
                data = resp.json()
                if data.get("success"):
                    self.access_token = data.get("accessToken")
                    self.user_id = data.get("userId")
                    log_success(f"Logged in: {TEST_USER['email']}")
                    return True

            log_error(f"Auth failed: {resp.text}")
            return False

        except Exception as e:
            log_error(f"User creation failed: {e}")
            return False

    def check_subscription_status(self) -> Dict:
        """Check current subscription status"""
        try:
            resp = requests.get(
                f"{self.api_base}/stripe/subscription",
                headers={"Authorization": f"Bearer {self.access_token}"},
                timeout=10
            )

            if resp.status_code == 200:
                return resp.json()
            return {"active": False, "tier": "unknown"}
        except:
            return {"active": False, "tier": "unknown"}

    def create_checkout_session(self, tier: str = "starter") -> Optional[str]:
        """Create a Stripe checkout session"""
        log_header("3. Create Checkout Session")

        price_ids = {
            "starter": "price_1SL50hJogOchEFxvxYpymxoT",
            "pro": "price_1SL51sJogOchEFxvVounuNcK",
            "elite": "price_1SL52dJogOchEFxvVC7797Tw"
        }

        try:
            resp = requests.post(
                f"{self.api_base}/stripe/create-checkout-session",
                json={"priceId": price_ids[tier], "tier": tier},
                headers={"Authorization": f"Bearer {self.access_token}"},
                timeout=10
            )

            if resp.status_code == 200:
                data = resp.json()
                if data.get("success"):
                    checkout_url = data.get("checkoutUrl")
                    session_id = data.get("sessionId")
                    log_success(f"Checkout session created for {tier}")
                    log_info(f"   Session: {session_id}")
                    log_info(f"   URL: {checkout_url[:60]}...")
                    return checkout_url

            log_error(f"Checkout failed: {resp.text}")
            return None

        except Exception as e:
            log_error(f"Checkout exception: {e}")
            return None

    def trigger_test_webhook(self, event_type: str = "checkout.session.completed") -> bool:
        """
        Trigger a test webhook using Stripe CLI
        Requires: stripe listen --forward-to localhost:8000/api/v1/stripe/webhook
        """
        log_header("4. Trigger Test Webhook")

        log_info(f"Triggering {event_type} webhook...")
        log_warn("Make sure Stripe CLI is listening:")
        log_warn("   stripe listen --forward-to localhost:8000/api/v1/stripe/webhook")

        try:
            # Use Stripe CLI to trigger test event
            result = subprocess.run(
                ["stripe", "trigger", event_type],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                log_success(f"Webhook triggered: {event_type}")
                log_info(f"   Output: {result.stdout[:200]}")
                return True
            else:
                log_error(f"Webhook trigger failed: {result.stderr}")
                return False

        except FileNotFoundError:
            log_error("Stripe CLI not found. Install with: brew install stripe/stripe-cli/stripe")
            return False
        except subprocess.TimeoutExpired:
            log_error("Webhook trigger timed out")
            return False
        except Exception as e:
            log_error(f"Webhook trigger exception: {e}")
            return False

    def verify_db_update(self, expected_tier: str, expected_status: str) -> bool:
        """Verify the database was updated by the webhook"""
        log_header("5. Verify Database Update")

        # Wait for webhook processing
        log_info("Waiting for webhook processing...")
        time.sleep(3)

        status = self.check_subscription_status()
        actual_tier = status.get("tier", "unknown")
        actual_status = status.get("status", "unknown")
        is_active = status.get("active", False)

        log_info(f"Expected: tier={expected_tier}, status={expected_status}")
        log_info(f"Actual:   tier={actual_tier}, active={is_active}")

        if actual_tier == expected_tier:
            log_success("Database update verified!")
            return True
        else:
            log_warn("Database may not have been updated yet")
            log_info("This could be due to:")
            log_info("   1. Webhook endpoint not receiving events")
            log_info("   2. Database connection issue")
            log_info("   3. User email mismatch in webhook metadata")
            return False


def run_interactive_test():
    """Run interactive webhook test with manual steps"""
    log_header("Stripe Webhook Integration Test")
    log_info(f"Timestamp: {datetime.now().isoformat()}")

    # Determine API base
    is_production = "--production" in sys.argv
    api_base = PRODUCTION_API if is_production else LOCAL_API
    log_info(f"Testing against: {api_base}")

    tester = StripeWebhookTester(api_base)

    # Step 1: Health check
    if not tester.test_health():
        log_error("Health check failed. Is the server running?")
        return

    # Step 2: Create test user
    if not tester.create_test_user():
        log_error("Could not create/login test user")
        return

    # Step 3: Check initial status
    log_header("Initial Subscription Status")
    status = tester.check_subscription_status()
    log_info(f"Current tier: {status.get('tier', 'free')}")
    log_info(f"Active: {status.get('active', False)}")

    # Step 4: Create checkout session
    checkout_url = tester.create_checkout_session("starter")
    if not checkout_url:
        log_error("Could not create checkout session")
        return

    # Step 5: Manual testing instructions
    log_header("Manual Testing Steps")
    print(f"""
{Colors.YELLOW}To complete the webhook test, follow these steps:{Colors.END}

{Colors.BOLD}Option A: Using Stripe CLI (Recommended for Testing){Colors.END}
1. Open a new terminal
2. Run: stripe listen --forward-to {api_base}/api/v1/stripe/webhook
3. In another terminal, run: stripe trigger checkout.session.completed
4. Check the webhook listener output for success
5. Re-run this script to verify DB update

{Colors.BOLD}Option B: Using Stripe Test Dashboard{Colors.END}
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Select your webhook endpoint
3. Click "Send test webhook"
4. Select "checkout.session.completed"
5. Send the event

{Colors.BOLD}Option C: Complete a Real Test Payment{Colors.END}
1. Open this checkout URL in browser:
   {checkout_url}
2. Use test card: 4242 4242 4242 4242
3. Any future date, any CVC, any ZIP
4. Complete payment
5. Webhook will fire automatically

{Colors.CYAN}After completing payment, verify:{Colors.END}
- Check Stripe Dashboard > Developers > Webhooks > Recent events
- Check server logs for webhook processing
- Run this script again to check subscription status

{Colors.GREEN}Test user email: {tester.user_email}{Colors.END}
""")

    # Step 6: Try to trigger webhook via CLI (if available)
    log_header("Attempting Automatic Webhook Trigger")
    input(f"\n{Colors.YELLOW}Press Enter to attempt webhook trigger via Stripe CLI...{Colors.END}")

    if tester.trigger_test_webhook():
        time.sleep(3)
        tester.verify_db_update("starter", "active")

    # Final status check
    log_header("Final Status Check")
    final_status = tester.check_subscription_status()
    log_info(f"Final tier: {final_status.get('tier', 'unknown')}")
    log_info(f"Final status: {final_status.get('status', 'unknown')}")
    log_info(f"Active: {final_status.get('active', False)}")

    log_header("Test Complete")
    log_success("Webhook integration test finished")
    log_info("Review the output above for any issues")


def run_automated_test():
    """Run fully automated webhook tests (for CI/CD)"""
    log_header("Automated Webhook Test Suite")

    api_base = PRODUCTION_API if "--production" in sys.argv else LOCAL_API
    tester = StripeWebhookTester(api_base)

    results = {
        "health": tester.test_health(),
        "user_created": tester.create_test_user(),
        "checkout_created": tester.create_checkout_session() is not None
    }

    passed = all(results.values())

    log_header("Results Summary")
    for test, result in results.items():
        if result:
            log_success(f"{test}: PASSED")
        else:
            log_error(f"{test}: FAILED")

    if passed:
        log_success("\nAll automated tests passed!")
        log_info("Manual webhook verification still required")
    else:
        log_error("\nSome tests failed")

    return 0 if passed else 1


if __name__ == "__main__":
    if "--automated" in sys.argv:
        sys.exit(run_automated_test())
    else:
        run_interactive_test()
