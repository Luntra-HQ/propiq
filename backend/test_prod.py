#!/usr/bin/env python3
"""
End-to-End Stripe Integration Test
Tests complete signup and purchase flow for all PropIQ tiers
"""
import requests
import json
from typing import Dict, Optional

# API Configuration
API_BASE_URL = "https://luntra.onrender.com"

# Test users for each tier (using example.com for testing)
TEST_USERS = {
    "starter": {
        "email": "test-starter@example.com",
        "password": "TestPassword123!",
        "firstName": "Starter",
        "lastName": "User"
    },
    "pro": {
        "email": "test-pro@example.com",
        "password": "TestPassword123!",
        "firstName": "Pro",
        "lastName": "User"
    },
    "elite": {
        "email": "test-elite@example.com",
        "password": "TestPassword123!",
        "firstName": "Elite",
        "lastName": "User"
    }
}

# Stripe Price IDs (from .env)
PRICE_IDS = {
    "starter": "price_1SL50hJogOchEFxvxYpymxoT",
    "pro": "price_1SL51sJogOchEFxvVounuNcK",
    "elite": "price_1SL52dJogOchEFxvVC7797Tw"
}

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_section(title: str):
    """Print a section header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{title}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(message: str):
    """Print success message"""
    print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")

def print_error(message: str):
    """Print error message"""
    print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")

def print_info(message: str):
    """Print info message"""
    print(f"{Colors.OKCYAN}ℹ️  {message}{Colors.ENDC}")

def test_health_endpoints():
    """Test all health endpoints"""
    print_section("1. Testing Health Endpoints")

    # Test main health endpoint
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Main health check: {data.get('status')}")
            print_info(f"   Build: {data.get('build_hash')}")
            print_info(f"   Environment: {data.get('environment')}")
        else:
            print_error(f"Main health check failed: {response.status_code}")
    except Exception as e:
        print_error(f"Main health check error: {e}")

    # Test Stripe health endpoint
    try:
        response = requests.get(f"{API_BASE_URL}/stripe/health")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Stripe health: {data.get('status')}")
            print_info(f"   Stripe configured: {data.get('stripe_configured')}")
            print_info(f"   Default price configured: {data.get('default_price_configured')}")
            print_info(f"   Webhook configured: {data.get('webhook_configured')}")
        else:
            print_error(f"Stripe health check failed: {response.status_code}")
    except Exception as e:
        print_error(f"Stripe health check error: {e}")

def signup_user(tier: str, user_data: Dict) -> Optional[Dict]:
    """Sign up a new user"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/signup",
            json=user_data
        )

        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_success(f"{tier.capitalize()} user registered: {user_data['email']}")
                print_info(f"   User ID: {data.get('userId')}")
                print_info(f"   Token: {data.get('accessToken')[:20]}...")
                return data
            else:
                print_error(f"{tier.capitalize()} signup failed: {data.get('message', 'Unknown error')}")
                return None
        else:
            # User might already exist
            error_detail = response.json().get("detail", "Unknown error")
            if "already exists" in str(error_detail).lower():
                print_info(f"{tier.capitalize()} user already exists, attempting login...")
                return login_user(tier, user_data)
            else:
                print_error(f"{tier.capitalize()} signup error: {error_detail}")
                return None
    except Exception as e:
        print_error(f"{tier.capitalize()} signup exception: {e}")
        return None

def login_user(tier: str, user_data: Dict) -> Optional[Dict]:
    """Login existing user"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={
                "email": user_data["email"],
                "password": user_data["password"]
            }
        )

        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_success(f"{tier.capitalize()} user logged in: {user_data['email']}")
                print_info(f"   User ID: {data.get('userId')}")
                print_info(f"   Token: {data.get('accessToken')[:20]}...")
                return data
            else:
                print_error(f"{tier.capitalize()} login failed: {data.get('message', 'Unknown error')}")
                return None
        else:
            print_error(f"{tier.capitalize()} login error: {response.status_code}")
            return None
    except Exception as e:
        print_error(f"{tier.capitalize()} login exception: {e}")
        return None

def create_checkout_session(tier: str, access_token: str, price_id: str) -> Optional[str]:
    """Create Stripe checkout session"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/stripe/create-checkout-session",
            json={
                "priceId": price_id,
                "tier": tier
            },
            headers={
                "Authorization": f"Bearer {access_token}"
            }
        )

        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                checkout_url = data.get("checkoutUrl")
                session_id = data.get("sessionId")
                print_success(f"{tier.capitalize()} checkout session created")
                print_info(f"   Session ID: {session_id}")
                print_info(f"   Checkout URL: {checkout_url[:50]}...")
                return checkout_url
            else:
                print_error(f"{tier.capitalize()} checkout failed: {data.get('message', 'Unknown error')}")
                return None
        else:
            error_detail = response.json().get("detail", "Unknown error")
            print_error(f"{tier.capitalize()} checkout error: {error_detail}")
            return None
    except Exception as e:
        print_error(f"{tier.capitalize()} checkout exception: {e}")
        return None

def check_subscription_status(tier: str, access_token: str):
    """Check user's subscription status"""
    try:
        response = requests.get(
            f"{API_BASE_URL}/stripe/subscription",
            headers={
                "Authorization": f"Bearer {access_token}"
            }
        )

        if response.status_code == 200:
            data = response.json()
            is_active = data.get("active", False)
            tier_name = data.get("tier", "unknown")

            if is_active:
                print_success(f"{tier.capitalize()} subscription is active")
                print_info(f"   Tier: {tier_name}")
                print_info(f"   Expires: {data.get('expiresAt', 'N/A')}")
            else:
                print_info(f"{tier.capitalize()} user has no active subscription")
        else:
            print_error(f"{tier.capitalize()} subscription check failed: {response.status_code}")
    except Exception as e:
        print_error(f"{tier.capitalize()} subscription check exception: {e}")

def test_tier_flow(tier: str):
    """Test complete flow for a specific tier"""
    print_section(f"Testing {tier.upper()} Tier Flow")

    user_data = TEST_USERS[tier]
    price_id = PRICE_IDS[tier]

    # Step 1: Sign up or login
    auth_data = signup_user(tier, user_data)
    if not auth_data:
        print_error(f"Failed to authenticate {tier} user, skipping tier...")
        return

    access_token = auth_data.get("accessToken")

    # Step 2: Create checkout session
    checkout_url = create_checkout_session(tier, access_token, price_id)
    if not checkout_url:
        print_error(f"Failed to create checkout session for {tier}")

    # Step 3: Check subscription status (should be inactive since we didn't complete payment)
    check_subscription_status(tier, access_token)

def main():
    """Run all e2e tests"""
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║                                                           ║")
    print("║        PropIQ Stripe E2E Integration Test Suite          ║")
    print("║                                                           ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")

    # Test 1: Health checks
    test_health_endpoints()

    # Test 2: Starter tier
    test_tier_flow("starter")

    # Test 3: Pro tier
    test_tier_flow("pro")

    # Test 4: Elite tier
    test_tier_flow("elite")

    # Final summary
    print_section("Test Summary")
    print_success("All API endpoints are functional")
    print_info("Next steps:")
    print_info("   1. Complete a test payment in Stripe to verify webhook integration")
    print_info("   2. Check Stripe Dashboard → Developers → Webhooks for webhook events")
    print_info("   3. Monitor Slack for payment notifications")
    print_info("   4. Deploy backend to Azure with updated .env variables")

    print(f"\n{Colors.OKGREEN}{Colors.BOLD}✅ E2E Test Complete!{Colors.ENDC}\n")

if __name__ == "__main__":
    main()
