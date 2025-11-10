"""
Authentication endpoints for PropIQ API
Handles user signup, login with Supabase persistence, bcrypt hashing, and JWT tokens
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
from datetime import datetime, timedelta
import os
import json
import jwt
from config.logging_config import get_logger
from utils.validators import (
    validate_password,
    validate_safe_string,
    sanitize_string,
    MAX_NAME_LENGTH,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH
)

logger = get_logger(__name__)

# Supabase database setup (with bcrypt password hashing)
try:
    from database_supabase import (
        create_user,
        get_user_by_email,
        get_user_by_id,
        verify_password,
        update_last_login
    )
    DATABASE_AVAILABLE = True
except Exception as e:
    logger.warning(f"Database not available: {e}")
    DATABASE_AVAILABLE = False

# Comet ML setup for logging
try:
    from comet_ml import Experiment
    COMET_API_KEY = os.getenv("COMET_API_KEY")
    COMET_WORKSPACE = os.getenv("COMET_WORKSPACE", "luntra-ai")
    COMET_PROJECT = os.getenv("COMET_PROJECT", "luntra-backend")
    COMET_AVAILABLE = bool(COMET_API_KEY)
except ImportError:
    logger.info("Comet ML not installed, skipping ML experiment tracking")
    COMET_AVAILABLE = False

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise ValueError(
        "JWT_SECRET is required but not set. "
        "Set a secure secret in environment variables (minimum 32 characters)."
    )
if len(JWT_SECRET) < 32:
    raise ValueError(
        f"JWT_SECRET must be at least 32 characters (current: {len(JWT_SECRET)}). "
        "Generate a secure secret: openssl rand -hex 32"
    )

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

class SignupRequest(BaseModel):
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(
        ...,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description="Password (8-128 characters, must contain uppercase, lowercase, and digit)"
    )
    firstName: Optional[str] = Field(None, max_length=MAX_NAME_LENGTH)
    lastName: Optional[str] = Field(None, max_length=MAX_NAME_LENGTH)
    company: Optional[str] = Field(None, max_length=MAX_NAME_LENGTH)

    @validator('password')
    def validate_password_strength(cls, v):
        """Validate password meets security requirements"""
        is_valid, error_msg = validate_password(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v

    @validator('firstName', 'lastName', 'company')
    def validate_safe_strings(cls, v):
        """Validate and sanitize string fields"""
        if v:
            # Check for dangerous patterns
            is_valid, error_msg = validate_safe_string(v, "Name")
            if not is_valid:
                raise ValueError(error_msg)
            # Sanitize
            v = sanitize_string(v, MAX_NAME_LENGTH)
        return v

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(
        ...,
        min_length=PASSWORD_MIN_LENGTH,
        max_length=PASSWORD_MAX_LENGTH,
        description="Password"
    )

class UserResponse(BaseModel):
    success: bool
    userId: Optional[str] = None
    email: Optional[str] = None
    accessToken: Optional[str] = None  # JWT token for Bearer auth
    message: Optional[str] = None
    error: Optional[str] = None

def create_access_token(user_id: str, email: str) -> str:
    """
    Generate JWT access token for authenticated user

    Token contains:
    - sub: user ID
    - email: user email
    - exp: expiration timestamp (7 days from now)
    """
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)

    payload = {
        "sub": user_id,  # Subject (user ID)
        "email": email,
        "exp": expiration,
        "iat": datetime.utcnow()  # Issued at
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def log_to_comet(event_type: str, data: dict):
    """Log database operations to Comet ML for monitoring"""
    if not COMET_AVAILABLE:
        return

    try:
        experiment = Experiment(
            api_key=COMET_API_KEY,
            workspace=COMET_WORKSPACE,
            project_name=COMET_PROJECT,
        )
        experiment.set_name(f"Database {event_type} - {datetime.now().isoformat()}")
        experiment.add_tags([event_type, "database", "auth", "supabase"])

        # Log metrics
        experiment.log_parameters(data)

        # Create artifact with detailed log
        log_file = f"/tmp/database_{event_type}_{datetime.now().timestamp()}.json"
        with open(log_file, 'w') as f:
            json.dump(data, f, indent=2, default=str)

        experiment.log_artifact(log_file, f"database_{event_type}.json")

        experiment.end()

        # Clean up temp file
        if os.path.exists(log_file):
            os.remove(log_file)

        logger.debug(f"Logged {event_type} to Comet ML")
    except Exception as e:
        logger.warning(f"Failed to log to Comet ML: {e}")

@router.post("/signup", response_model=UserResponse)
async def signup(request: SignupRequest):
    """
    Create a new user account

    - Validates email uniqueness
    - Hashes password with bcrypt
    - Stores in Supabase
    - Logs to Comet ML
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable"
        )

    try:
        # Build full name if firstName and lastName provided
        full_name = None
        if request.firstName and request.lastName:
            full_name = f"{request.firstName} {request.lastName}"
        elif request.firstName:
            full_name = request.firstName

        # Create user in Supabase (password will be hashed with bcrypt)
        user = create_user(
            email=request.email.lower(),
            password=request.password,
            full_name=full_name
        )

        if not user:
            raise HTTPException(
                status_code=500,
                detail="Failed to create user"
            )

        user_id = user["id"]

        # Generate JWT access token
        access_token = create_access_token(user_id, request.email.lower())

        # Log to Comet ML
        log_to_comet("user_signup", {
            "user_id": user_id,
            "email": request.email.lower(),
            "has_first_name": bool(request.firstName),
            "has_last_name": bool(request.lastName),
            "has_company": bool(request.company),
            "timestamp": datetime.utcnow().isoformat(),
            "database": "supabase",
            "collection": "users",
            "operation": "create_user",
            "success": True
        })

        # Send Slack notification for new user signup
        try:
            from utils.slack import notify_new_user
            notify_new_user(
                email=request.email.lower(),
                name=full_name,
                tier="free",  # New users start on free tier
                source="web"
            )
        except Exception as e:
            # Don't fail signup if Slack notification fails
            logger.warning(f"Slack notification failed: {e}")

        # Start onboarding email campaign
        onboarding_success = True
        onboarding_message = ""
        try:
            from utils.onboarding_campaign import start_onboarding_campaign
            onboarding_result = await start_onboarding_campaign(
                user_email=request.email.lower(),
                user_id=user_id,
                user_name=request.firstName
            )
            logger.info(
                f"Onboarding campaign started for {request.email.lower()}",
                extra={
                    "emails_sent": len(onboarding_result.get('emails_sent', [])),
                    "emails_scheduled": len(onboarding_result.get('emails_scheduled', []))
                }
            )

            # Check if there were any errors in the onboarding campaign
            if onboarding_result.get('errors'):
                onboarding_success = False
                onboarding_message = " Note: There was an issue sending the welcome email. Please contact support if you don't receive it within 24 hours."
                logger.warning(f"Onboarding had errors: {onboarding_result.get('errors')}")

        except Exception as e:
            # Don't fail signup if onboarding campaign fails
            onboarding_success = False
            logger.warning(f"Onboarding campaign failed: {e}")
            onboarding_message = " Note: There was an issue sending the welcome email. Please contact support if you don't receive it within 24 hours."

        success_message = "User created successfully"
        if not onboarding_success:
            success_message += onboarding_message

        return UserResponse(
            success=True,
            userId=user_id,
            email=request.email.lower(),
            accessToken=access_token,
            message=success_message
        )

    except Exception as e:
        error_str = str(e)

        # Check for duplicate email error
        if "duplicate" in error_str.lower() or "unique" in error_str.lower():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Log error to Comet ML
        log_to_comet("user_signup_error", {
            "email": request.email.lower(),
            "error": error_str,
            "timestamp": datetime.utcnow().isoformat(),
            "success": False
        })

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user: {error_str}"
        )

@router.post("/login", response_model=UserResponse)
async def login(request: LoginRequest):
    """
    Authenticate user login

    - Verifies email and password with bcrypt
    - Updates last login timestamp
    - Logs to Comet ML
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable"
        )

    try:
        # Find user by email (includes password_hash for verification)
        user = get_user_by_email(request.email.lower())

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        # Verify password with bcrypt
        if not verify_password(request.password, user["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        # Generate JWT access token
        user_id = user["id"]
        access_token = create_access_token(user_id, request.email.lower())

        # Update last login timestamp
        update_last_login(user_id)

        # Log successful login
        log_to_comet("user_login", {
            "user_id": user_id,
            "email": request.email.lower(),
            "timestamp": datetime.utcnow().isoformat(),
            "success": True
        })

        return UserResponse(
            success=True,
            userId=user_id,
            email=request.email.lower(),
            accessToken=access_token,
            message="Login successful"
        )

    except HTTPException:
        raise
    except Exception as e:
        log_to_comet("user_login_error", {
            "email": request.email.lower(),
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
            "success": False
        })

        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user details by UUID"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable"
        )

    try:
        # Get user by UUID (password_hash is already excluded by get_user_by_id)
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch user: {str(e)}"
        )
