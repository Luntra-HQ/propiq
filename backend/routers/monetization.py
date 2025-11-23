"""
Monetization Router - Pillar 5: Monetization Expansion
Handles API keys, referral program, and usage tracking
"""

import logging
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
import uuid

from auth import verify_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/monetization", tags=["Monetization"])

# ============================================================================
# In-Memory Storage (Replace with database in production)
# ============================================================================

api_keys_store: dict = {}  # user_id -> list of api keys
referral_codes_store: dict = {}  # code -> referral data
referrals_store: dict = {}  # user_id -> list of referrals
usage_store: dict = {}  # api_key -> usage data

# ============================================================================
# Pydantic Models
# ============================================================================

class APIKeyCreate(BaseModel):
    """Request to create a new API key"""
    name: str = Field(..., min_length=1, max_length=100)
    scopes: List[str] = Field(default=["read", "analyze"])
    rateLimit: int = Field(default=100, ge=10, le=10000)


class APIKey(BaseModel):
    """API key response"""
    id: str
    name: str
    keyPrefix: str  # First 8 chars of key for identification
    scopes: List[str]
    rateLimit: int
    usageCount: int
    lastUsed: Optional[str]
    createdAt: str
    expiresAt: Optional[str]
    isActive: bool


class APIKeyFull(APIKey):
    """API key with full key (only returned on creation)"""
    key: str


class ReferralCode(BaseModel):
    """Referral code data"""
    code: str
    userId: str
    rewardPercent: int  # Percentage reward for referrer
    discountPercent: int  # Discount for referred user
    usageCount: int
    totalEarnings: float
    isActive: bool
    createdAt: str
    expiresAt: Optional[str]


class Referral(BaseModel):
    """A single referral record"""
    id: str
    referredUserId: str
    referredEmail: str
    status: str  # "pending" | "converted" | "paid"
    rewardAmount: float
    convertedAt: Optional[str]
    paidAt: Optional[str]
    createdAt: str


class UsageStats(BaseModel):
    """API usage statistics"""
    totalCalls: int
    callsToday: int
    callsThisMonth: int
    avgResponseTime: float
    successRate: float
    topEndpoints: List[dict]
    dailyUsage: List[dict]


class ReferralStats(BaseModel):
    """Referral program statistics"""
    totalReferrals: int
    pendingReferrals: int
    convertedReferrals: int
    totalEarnings: float
    pendingEarnings: float
    paidEarnings: float
    conversionRate: float


# ============================================================================
# Helper Functions
# ============================================================================

def generate_api_key() -> str:
    """Generate a secure API key"""
    return f"piq_{secrets.token_urlsafe(32)}"


def generate_referral_code(user_id: str) -> str:
    """Generate a unique referral code"""
    hash_input = f"{user_id}{datetime.now().isoformat()}{secrets.token_hex(4)}"
    return hashlib.sha256(hash_input.encode()).hexdigest()[:8].upper()


def hash_api_key(key: str) -> str:
    """Hash API key for storage"""
    return hashlib.sha256(key.encode()).hexdigest()


# ============================================================================
# API Key Endpoints
# ============================================================================

@router.post("/api-keys", response_model=APIKeyFull)
async def create_api_key(
    request: APIKeyCreate,
    token_payload: dict = Depends(verify_token)
):
    """
    Create a new API key for programmatic access.
    The full key is only shown once on creation.
    """
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    try:
        # Check existing keys (limit to 5 per user)
        user_keys = api_keys_store.get(user_id, [])
        active_keys = [k for k in user_keys if k.get("isActive")]
        if len(active_keys) >= 5:
            raise HTTPException(
                status_code=400,
                detail="Maximum 5 active API keys allowed. Please revoke an existing key."
            )

        # Generate new key
        api_key = generate_api_key()
        key_id = str(uuid.uuid4())

        key_data = {
            "id": key_id,
            "name": request.name,
            "keyHash": hash_api_key(api_key),
            "keyPrefix": api_key[:12],
            "scopes": request.scopes,
            "rateLimit": request.rateLimit,
            "usageCount": 0,
            "lastUsed": None,
            "createdAt": datetime.now().isoformat(),
            "expiresAt": (datetime.now() + timedelta(days=365)).isoformat(),
            "isActive": True
        }

        # Store key
        if user_id not in api_keys_store:
            api_keys_store[user_id] = []
        api_keys_store[user_id].append(key_data)

        logger.info(f"API key created for user {user_id}: {key_data['keyPrefix']}...")

        return APIKeyFull(
            id=key_id,
            name=request.name,
            key=api_key,  # Only returned on creation
            keyPrefix=key_data["keyPrefix"],
            scopes=request.scopes,
            rateLimit=request.rateLimit,
            usageCount=0,
            lastUsed=None,
            createdAt=key_data["createdAt"],
            expiresAt=key_data["expiresAt"],
            isActive=True
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create API key: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create API key")


@router.get("/api-keys")
async def list_api_keys(token_payload: dict = Depends(verify_token)):
    """List all API keys for the current user"""
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_keys = api_keys_store.get(user_id, [])

    return {
        "success": True,
        "keys": [
            APIKey(
                id=k["id"],
                name=k["name"],
                keyPrefix=k["keyPrefix"],
                scopes=k["scopes"],
                rateLimit=k["rateLimit"],
                usageCount=k["usageCount"],
                lastUsed=k.get("lastUsed"),
                createdAt=k["createdAt"],
                expiresAt=k.get("expiresAt"),
                isActive=k["isActive"]
            )
            for k in user_keys
        ]
    }


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Revoke an API key"""
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_keys = api_keys_store.get(user_id, [])

    for key in user_keys:
        if key["id"] == key_id:
            key["isActive"] = False
            logger.info(f"API key revoked: {key['keyPrefix']}...")
            return {"success": True, "message": "API key revoked"}

    raise HTTPException(status_code=404, detail="API key not found")


@router.get("/api-keys/usage", response_model=UsageStats)
async def get_api_usage(token_payload: dict = Depends(verify_token)):
    """Get API usage statistics"""
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    # Generate sample usage stats (in production, aggregate from logs)
    import random
    random.seed(hash(user_id))

    total_calls = random.randint(100, 5000)
    calls_today = random.randint(0, 100)
    calls_month = random.randint(calls_today, total_calls)

    return UsageStats(
        totalCalls=total_calls,
        callsToday=calls_today,
        callsThisMonth=calls_month,
        avgResponseTime=round(random.uniform(150, 500), 2),
        successRate=round(random.uniform(95, 99.9), 2),
        topEndpoints=[
            {"endpoint": "/propiq/analyze", "calls": int(total_calls * 0.6)},
            {"endpoint": "/comps/analyze", "calls": int(total_calls * 0.25)},
            {"endpoint": "/property/images", "calls": int(total_calls * 0.15)}
        ],
        dailyUsage=[
            {"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
             "calls": random.randint(10, 200)}
            for i in range(7, 0, -1)
        ]
    )


# ============================================================================
# Referral Program Endpoints
# ============================================================================

@router.post("/referral/code")
async def create_referral_code(token_payload: dict = Depends(verify_token)):
    """Create or get the user's referral code"""
    user_id = token_payload.get("user_id")
    user_email = token_payload.get("email", "")

    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    # Check if user already has a code
    for code, data in referral_codes_store.items():
        if data["userId"] == user_id:
            return {
                "success": True,
                "code": ReferralCode(
                    code=code,
                    userId=user_id,
                    rewardPercent=data["rewardPercent"],
                    discountPercent=data["discountPercent"],
                    usageCount=data["usageCount"],
                    totalEarnings=data["totalEarnings"],
                    isActive=data["isActive"],
                    createdAt=data["createdAt"],
                    expiresAt=data.get("expiresAt")
                ),
                "referralUrl": f"https://propiq.luntra.one/signup?ref={code}"
            }

    # Create new code
    code = generate_referral_code(user_id)

    referral_data = {
        "code": code,
        "userId": user_id,
        "userEmail": user_email,
        "rewardPercent": 20,  # 20% of first payment
        "discountPercent": 10,  # 10% off first month
        "usageCount": 0,
        "totalEarnings": 0.0,
        "isActive": True,
        "createdAt": datetime.now().isoformat(),
        "expiresAt": None  # Never expires
    }

    referral_codes_store[code] = referral_data

    logger.info(f"Referral code created for user {user_id}: {code}")

    return {
        "success": True,
        "code": ReferralCode(
            code=code,
            userId=user_id,
            rewardPercent=20,
            discountPercent=10,
            usageCount=0,
            totalEarnings=0.0,
            isActive=True,
            createdAt=referral_data["createdAt"],
            expiresAt=None
        ),
        "referralUrl": f"https://propiq.luntra.one/signup?ref={code}"
    }


@router.get("/referral/stats", response_model=ReferralStats)
async def get_referral_stats(token_payload: dict = Depends(verify_token)):
    """Get referral program statistics"""
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    # Get user's referrals
    user_referrals = referrals_store.get(user_id, [])

    pending = [r for r in user_referrals if r["status"] == "pending"]
    converted = [r for r in user_referrals if r["status"] == "converted"]
    paid = [r for r in user_referrals if r["status"] == "paid"]

    total_earnings = sum(r["rewardAmount"] for r in user_referrals)
    pending_earnings = sum(r["rewardAmount"] for r in converted)
    paid_earnings = sum(r["rewardAmount"] for r in paid)

    conversion_rate = (len(converted) + len(paid)) / len(user_referrals) * 100 if user_referrals else 0

    return ReferralStats(
        totalReferrals=len(user_referrals),
        pendingReferrals=len(pending),
        convertedReferrals=len(converted) + len(paid),
        totalEarnings=total_earnings,
        pendingEarnings=pending_earnings,
        paidEarnings=paid_earnings,
        conversionRate=round(conversion_rate, 1)
    )


@router.get("/referral/list")
async def list_referrals(
    status: Optional[str] = Query(None),
    token_payload: dict = Depends(verify_token)
):
    """List all referrals for the current user"""
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    user_referrals = referrals_store.get(user_id, [])

    if status:
        user_referrals = [r for r in user_referrals if r["status"] == status]

    return {
        "success": True,
        "referrals": [
            Referral(
                id=r["id"],
                referredUserId=r["referredUserId"],
                referredEmail=r["referredEmail"],
                status=r["status"],
                rewardAmount=r["rewardAmount"],
                convertedAt=r.get("convertedAt"),
                paidAt=r.get("paidAt"),
                createdAt=r["createdAt"]
            )
            for r in user_referrals
        ]
    }


@router.post("/referral/validate/{code}")
async def validate_referral_code(code: str):
    """Validate a referral code (public endpoint for signup)"""
    referral = referral_codes_store.get(code.upper())

    if not referral:
        raise HTTPException(status_code=404, detail="Invalid referral code")

    if not referral["isActive"]:
        raise HTTPException(status_code=400, detail="Referral code is no longer active")

    return {
        "success": True,
        "valid": True,
        "discountPercent": referral["discountPercent"],
        "message": f"You'll receive {referral['discountPercent']}% off your first month!"
    }


# ============================================================================
# Billing & Subscription Endpoints
# ============================================================================

@router.get("/billing/summary")
async def get_billing_summary(token_payload: dict = Depends(verify_token)):
    """Get billing summary for the current user"""
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    # In production, fetch from Stripe/database
    import random
    random.seed(hash(user_id))

    current_plan = random.choice(["free", "starter", "pro"])

    plans = {
        "free": {"name": "Free", "price": 0, "limit": 3},
        "starter": {"name": "Starter", "price": 29, "limit": 50},
        "pro": {"name": "Pro", "price": 79, "limit": 200}
    }

    plan_info = plans[current_plan]

    return {
        "success": True,
        "currentPlan": {
            "id": current_plan,
            "name": plan_info["name"],
            "price": plan_info["price"],
            "analysisLimit": plan_info["limit"],
            "billingCycle": "monthly",
            "nextBillingDate": (datetime.now() + timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d")
        },
        "usage": {
            "analysesUsed": random.randint(0, plan_info["limit"]),
            "analysesLimit": plan_info["limit"],
            "apiCallsUsed": random.randint(0, 1000),
            "apiCallsLimit": plan_info["limit"] * 10
        },
        "invoices": [
            {
                "id": f"inv_{secrets.token_hex(8)}",
                "date": (datetime.now() - timedelta(days=30*i)).strftime("%Y-%m-%d"),
                "amount": plan_info["price"],
                "status": "paid"
            }
            for i in range(1, 4)
        ] if plan_info["price"] > 0 else []
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "monetization",
        "timestamp": datetime.now().isoformat()
    }
