"""
User test fixtures for PropIQ tests
Provides user data for different subscription tiers and states
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any


# ============================================================================
# USER FIXTURES BY TIER
# ============================================================================

def get_free_user() -> Dict[str, Any]:
    """Free tier user with default limits"""
    return {
        "id": str(uuid.uuid4()),
        "email": "free@test.propiq.com",
        "password": "FreeUser123!",
        "password_hash": "$2b$12$dummy_hash_for_testing_only",
        "full_name": "Free Tier User",
        "subscription_tier": "free",
        "subscription_status": "active",
        "subscription_stripe_customer_id": None,
        "subscription_stripe_subscription_id": None,
        "propiq_usage_count": 2,
        "propiq_usage_limit": 5,
        "propiq_last_reset_date": datetime.utcnow().isoformat(),
        "created_at": (datetime.utcnow() - timedelta(days=30)).isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "last_login": datetime.utcnow().isoformat()
    }


def get_starter_user() -> Dict[str, Any]:
    """Starter tier user (paid subscription)"""
    return {
        "id": str(uuid.uuid4()),
        "email": "starter@test.propiq.com",
        "password": "StarterUser123!",
        "password_hash": "$2b$12$dummy_hash_for_testing_only",
        "full_name": "Starter Tier User",
        "subscription_tier": "starter",
        "subscription_status": "active",
        "subscription_stripe_customer_id": "cus_test_starter_123",
        "subscription_stripe_subscription_id": "sub_test_starter_123",
        "propiq_usage_count": 10,
        "propiq_usage_limit": 25,
        "propiq_last_reset_date": datetime.utcnow().isoformat(),
        "created_at": (datetime.utcnow() - timedelta(days=60)).isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "last_login": datetime.utcnow().isoformat()
    }


def get_pro_user() -> Dict[str, Any]:
    """Pro tier user (paid subscription)"""
    return {
        "id": str(uuid.uuid4()),
        "email": "pro@test.propiq.com",
        "password": "ProUser123!",
        "password_hash": "$2b$12$dummy_hash_for_testing_only",
        "full_name": "Pro Tier User",
        "subscription_tier": "pro",
        "subscription_status": "active",
        "subscription_stripe_customer_id": "cus_test_pro_123",
        "subscription_stripe_subscription_id": "sub_test_pro_123",
        "propiq_usage_count": 45,
        "propiq_usage_limit": 100,
        "propiq_last_reset_date": datetime.utcnow().isoformat(),
        "created_at": (datetime.utcnow() - timedelta(days=90)).isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "last_login": datetime.utcnow().isoformat()
    }


def get_elite_user() -> Dict[str, Any]:
    """Elite tier user (paid subscription, unlimited)"""
    return {
        "id": str(uuid.uuid4()),
        "email": "elite@test.propiq.com",
        "password": "EliteUser123!",
        "password_hash": "$2b$12$dummy_hash_for_testing_only",
        "full_name": "Elite Tier User",
        "subscription_tier": "elite",
        "subscription_status": "active",
        "subscription_stripe_customer_id": "cus_test_elite_123",
        "subscription_stripe_subscription_id": "sub_test_elite_123",
        "propiq_usage_count": 250,
        "propiq_usage_limit": 999999,
        "propiq_last_reset_date": datetime.utcnow().isoformat(),
        "created_at": (datetime.utcnow() - timedelta(days=120)).isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "last_login": datetime.utcnow().isoformat()
    }


# ============================================================================
# USER FIXTURES BY STATE
# ============================================================================

def get_new_user() -> Dict[str, Any]:
    """Newly created user (today)"""
    user = get_free_user()
    user.update({
        "email": "new@test.propiq.com",
        "propiq_usage_count": 0,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": datetime.utcnow().isoformat()
    })
    return user


def get_at_usage_limit_user() -> Dict[str, Any]:
    """User at their usage limit"""
    user = get_free_user()
    user.update({
        "email": "at_limit@test.propiq.com",
        "propiq_usage_count": 5,  # At limit
        "propiq_usage_limit": 5
    })
    return user


def get_over_usage_limit_user() -> Dict[str, Any]:
    """User over their usage limit (shouldn't happen but test edge case)"""
    user = get_free_user()
    user.update({
        "email": "over_limit@test.propiq.com",
        "propiq_usage_count": 6,  # Over limit
        "propiq_usage_limit": 5
    })
    return user


def get_canceled_subscription_user() -> Dict[str, Any]:
    """User with canceled subscription"""
    user = get_starter_user()
    user.update({
        "email": "canceled@test.propiq.com",
        "subscription_status": "canceled",
        "subscription_stripe_subscription_id": None
    })
    return user


def get_past_due_user() -> Dict[str, Any]:
    """User with past_due subscription (payment failed)"""
    user = get_pro_user()
    user.update({
        "email": "past_due@test.propiq.com",
        "subscription_status": "past_due"
    })
    return user


def get_inactive_user() -> Dict[str, Any]:
    """User who hasn't logged in recently"""
    user = get_free_user()
    user.update({
        "email": "inactive@test.propiq.com",
        "last_login": (datetime.utcnow() - timedelta(days=90)).isoformat()
    })
    return user


# ============================================================================
# USER FIXTURES FOR TESTING SCENARIOS
# ============================================================================

def get_test_user_for_signup() -> Dict[str, Any]:
    """User data for testing signup flow"""
    return {
        "email": f"test_{uuid.uuid4().hex[:8]}@test.propiq.com",
        "password": "TestPassword123!",
        "firstName": "Test",
        "lastName": "User",
        "company": "Test Company"
    }


def get_test_user_for_login() -> Dict[str, Any]:
    """User data for testing login flow"""
    return {
        "email": "login_test@test.propiq.com",
        "password": "LoginTest123!"
    }


def get_test_user_for_upgrade() -> Dict[str, Any]:
    """Free user ready to upgrade"""
    user = get_free_user()
    user.update({
        "email": "ready_to_upgrade@test.propiq.com",
        "propiq_usage_count": 5,  # At limit
        "propiq_usage_limit": 5
    })
    return user


def get_test_user_for_downgrade() -> Dict[str, Any]:
    """Pro user who might downgrade"""
    user = get_pro_user()
    user.update({
        "email": "might_downgrade@test.propiq.com",
        "propiq_usage_count": 15,  # Low usage
        "propiq_usage_limit": 100
    })
    return user


# ============================================================================
# USER COLLECTIONS
# ============================================================================

def get_all_tier_users() -> list[Dict[str, Any]]:
    """Get one user of each tier"""
    return [
        get_free_user(),
        get_starter_user(),
        get_pro_user(),
        get_elite_user()
    ]


def get_all_status_users() -> list[Dict[str, Any]]:
    """Get users with different subscription statuses"""
    return [
        get_free_user(),  # active
        get_starter_user(),  # active
        get_canceled_subscription_user(),  # canceled
        get_past_due_user()  # past_due
    ]


def get_test_cohort(size: int = 10) -> list[Dict[str, Any]]:
    """
    Generate a cohort of test users with varied characteristics

    Args:
        size: Number of users to generate

    Returns:
        List of user dictionaries
    """
    users = []
    tiers = ["free", "starter", "pro", "elite"]
    tier_limits = {"free": 5, "starter": 25, "pro": 100, "elite": 999999}

    for i in range(size):
        tier = tiers[i % len(tiers)]
        user = {
            "id": str(uuid.uuid4()),
            "email": f"cohort_user_{i}@test.propiq.com",
            "password": f"TestUser{i}123!",
            "password_hash": "$2b$12$dummy_hash_for_testing_only",
            "full_name": f"Test User {i}",
            "subscription_tier": tier,
            "subscription_status": "active",
            "subscription_stripe_customer_id": f"cus_test_{tier}_{i}" if tier != "free" else None,
            "subscription_stripe_subscription_id": f"sub_test_{tier}_{i}" if tier != "free" else None,
            "propiq_usage_count": i % tier_limits[tier],
            "propiq_usage_limit": tier_limits[tier],
            "propiq_last_reset_date": datetime.utcnow().isoformat(),
            "created_at": (datetime.utcnow() - timedelta(days=30 + i)).isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "last_login": (datetime.utcnow() - timedelta(hours=i)).isoformat()
        }
        users.append(user)

    return users


# ============================================================================
# JWT TOKEN HELPERS
# ============================================================================

def get_test_jwt_payload(user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate JWT token payload for test user

    Args:
        user: User dictionary

    Returns:
        JWT payload dictionary
    """
    from datetime import datetime, timedelta

    return {
        "sub": user["id"],
        "email": user["email"],
        "tier": user.get("subscription_tier", "free"),
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow()
    }


def get_test_auth_header(user: Dict[str, Any]) -> Dict[str, str]:
    """
    Generate Authorization header for test requests

    Args:
        user: User dictionary

    Returns:
        Dictionary with Authorization header
    """
    import jwt
    import os

    jwt_secret = os.getenv("JWT_SECRET", "test-secret-key")
    payload = get_test_jwt_payload(user)

    token = jwt.encode(payload, jwt_secret, algorithm="HS256")

    return {
        "Authorization": f"Bearer {token}"
    }


# ============================================================================
# USER ASSERTIONS FOR TESTS
# ============================================================================

def assert_valid_user(user: Dict[str, Any]):
    """Assert user has all required fields"""
    required_fields = [
        "id", "email", "subscription_tier", "subscription_status",
        "propiq_usage_count", "propiq_usage_limit", "created_at"
    ]

    for field in required_fields:
        assert field in user, f"User missing required field: {field}"

    # Validate subscription tier
    assert user["subscription_tier"] in ["free", "starter", "pro", "elite"]

    # Validate subscription status
    assert user["subscription_status"] in ["active", "canceled", "past_due", "unpaid"]

    # Validate usage counts
    assert user["propiq_usage_count"] >= 0
    assert user["propiq_usage_limit"] > 0


def assert_user_can_analyze(user: Dict[str, Any]) -> bool:
    """Check if user can run another analysis"""
    return (
        user["subscription_status"] == "active" and
        user["propiq_usage_count"] < user["propiq_usage_limit"]
    )
