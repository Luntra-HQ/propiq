from fastapi import FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel
from typing import List, Optional
import os
import re
import subprocess
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize structured logging FIRST (before any other imports that might log)
from config.logging_config import get_logger, setup_logging

# Setup logging with environment-specific configuration
setup_logging(
    environment=os.getenv("ENVIRONMENT", "development"),
    enable_file_logging=os.getenv("ENABLE_FILE_LOGGING", "false").lower() == "true"
)

logger = get_logger(__name__)
logger.info("Starting PropIQ API initialization...")

# Initialize Sentry for error tracking (before app creation)
from config.sentry_config import init_sentry
init_sentry()

# Validate environment variables before starting the application
# This ensures all required configuration is present and valid
try:
    from config.env_validator import validate_environment
    logger.info("Validating environment variables...")
    validate_environment(
        environment=os.getenv("ENVIRONMENT", "development"),
        exit_on_error=True  # Exit if validation fails
    )
    logger.info("Environment validation passed")
except ImportError:
    logger.warning("Environment validator not available, skipping validation")
except Exception as e:
    logger.error(f"Environment validation failed: {e}", exc_info=True)
    raise

# Create FastAPI app with comprehensive OpenAPI documentation
app = FastAPI(
    title="PropIQ API",
    description="""
## PropIQ - AI-Powered Real Estate Investment Analysis

PropIQ provides comprehensive property analysis powered by Azure OpenAI, helping real estate investors
make data-driven decisions.

### Features
- **Property Analysis:** AI-powered analysis with financial projections
- **Deal Scoring:** Automated scoring based on investment metrics
- **User Management:** Secure authentication with JWT tokens
- **Subscription Management:** Stripe-powered subscription tiers
- **Support Chat:** AI-powered customer support

### Security
- **Authentication:** JWT tokens with bcrypt password hashing
- **Input Validation:** Multi-layered XSS and SQL injection protection
- **Security Headers:** CSP, HSTS, X-Frame-Options, and more
- **Rate Limiting:** Protected against DoS attacks

### API Versioning
All endpoints use the `/api/v1` prefix for versioning. Future API versions will use `/api/v2`, etc.

### Rate Limits
- General endpoints: 100 requests/min per IP
- Auth endpoints: 10 requests/min per IP
- Analysis endpoints: 5 requests/min per user

### Support
- Documentation: https://propiq.luntra.one/docs
- API Status: https://status.propiq.luntra.one
""",
    version="3.1.1",
    contact={
        "name": "PropIQ Support",
        "url": "https://propiq.luntra.one",
        "email": "support@propiq.luntra.one"
    },
    license_info={
        "name": "Proprietary",
        "url": "https://propiq.luntra.one/terms"
    },
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "User signup, login, and profile management. Uses JWT tokens for authentication."
        },
        {
            "name": "Property Analysis",
            "description": "AI-powered property analysis with financial projections and deal scoring."
        },
        {
            "name": "Payments",
            "description": "Stripe subscription management and checkout."
        },
        {
            "name": "Support",
            "description": "AI-powered customer support chat."
        },
        {
            "name": "Marketing",
            "description": "Marketing tools and email capture."
        },
        {
            "name": "Health",
            "description": "Service health check endpoints."
        }
    ],
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Conditionally set OpenAPI servers based on environment
# Only show localhost in development to avoid confusion in production
environment = os.getenv("ENVIRONMENT", "development")
if environment == "production":
    app.servers = [
        {
            "url": "https://luntra-outreach-app.azurewebsites.net",
            "description": "Production server"
        }
    ]
else:
    app.servers = [
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://luntra-outreach-app.azurewebsites.net",
            "description": "Azure Production server"
        },
        # AWS App Runner URL placeholder - update this after deployment
        # {
        #     "url": "https://<app-runner-id>.awsapprunner.com",
        #     "description": "AWS Production server"
        # }
    ]

# CORS Configuration - Load from environment for security
# Get allowed origins from environment variable or use secure defaults
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    # Secure defaults for development/production
    allowed_origins = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        "https://propiq.luntra.one",  # Production frontend
        "https://propiq.luntra.one",  # Production alternate domain
    ]

# Add CORS middleware with secure configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Specific origins only (NOT "*")
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicit methods
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],  # Specific headers
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Add security headers middleware (X-Frame-Options, CSP, HSTS, etc.)
try:
    from middleware.security_headers import add_security_headers, add_request_size_limit
    add_security_headers(app)  # Auto-enables HSTS in production
    logger.info("Security headers middleware enabled")
except ImportError as e:
    logger.warning(f"Security headers middleware not available: {e}")

# Add request size limit middleware (prevent DoS from large payloads)
try:
    from middleware.security_headers import add_request_size_limit
    add_request_size_limit(app, max_request_size=10 * 1024 * 1024)  # 10 MB max
    logger.info("Request size limit middleware enabled")
except ImportError as e:
    logger.warning(f"Request size limit middleware not available: {e}")

# Add request logging middleware (logs all requests/responses)
try:
    from middleware.request_logger import add_request_logging
    add_request_logging(app, exclude_paths=["/health", "/docs", "/redoc", "/openapi.json"])
    logger.info("Request logging middleware enabled")
except ImportError as e:
    logger.warning(f"Request logging middleware not available: {e}")

# Add rate limiting middleware
try:
    from middleware.rate_limiter import add_rate_limiting
    add_rate_limiting(
        app,
        requests_per_minute=60,  # 60 requests per minute per IP
        requests_per_hour=1000  # 1000 requests per hour per IP
    )
    logger.info("Rate limiting middleware enabled")
except ImportError as e:
    logger.warning(f"Rate limiting not available: {e}")

# Add response compression middleware (gzip)
try:
    from middleware.compression import add_compression_preset
    add_compression_preset(app, preset="balanced")  # Compress responses > 1KB
    logger.info("Response compression enabled (gzip)")
except ImportError as e:
    logger.warning(f"Response compression not available: {e}")

# Import and include auth router
try:
    from auth import router as auth_router
    app.include_router(auth_router)
    logger.info("Auth router registered")
except ImportError as e:
    logger.warning(f"Auth router not available: {e}")

# Import and include marketing router (PropIQ email capture)
try:
    from routers.marketing import router as marketing_router
    app.include_router(marketing_router)
    logger.info("Marketing router registered")
except ImportError as e:
    logger.warning(f"Marketing router not available: {e}")

# Import and include PropIQ router (Property analysis)
try:
    from routers.propiq import router as propiq_router
    app.include_router(propiq_router)
    logger.info("PropIQ router registered")
except ImportError as e:
    logger.warning(f"PropIQ router not available: {e}")

# Import and include Stripe payment router
try:
    from routers.payment import router as payment_router
    app.include_router(payment_router)
    logger.info("Stripe payment router registered")
except ImportError as e:
    logger.warning(f"Payment router not available: {e}")

# Import and include custom support chat router (AI-powered, no third-party dependencies)
try:
    from routers.support_chat import router as support_chat_router
    app.include_router(support_chat_router)
    logger.info("Custom support chat router registered")
except ImportError as e:
    logger.warning(f"Support chat router not available: {e}")

# Import and include ENHANCED support chat router with function calling & session state
try:
    from routers.support_chat_enhanced import router as support_chat_enhanced_router
    app.include_router(support_chat_enhanced_router)
    logger.info("Enhanced support chat router registered (function calling + session state)")
except ImportError as e:
    logger.warning(f"Enhanced support chat router not available: {e}")

# Import and include Multi-Agent Property Advisor (PREMIUM FEATURE)
try:
    from routers.property_advisor_multiagent import router as property_advisor_router
    app.include_router(property_advisor_router)
    logger.info("Multi-Agent Property Advisor registered (Premium Feature)")
except ImportError as e:
    logger.warning(f"Property Advisor router not available: {e}")

# Import and include Intercom customer messaging router (OPTIONAL - can be removed)
try:
    from routers.intercom import router as intercom_router
    app.include_router(intercom_router)
    logger.info("Intercom messaging router registered")
except ImportError as e:
    logger.warning(f"Intercom router not available: {e}")

# Import and include Slack test router (for testing notifications)
try:
    from routers.slack_test import router as slack_test_router
    app.include_router(slack_test_router)
    logger.info("Slack test router registered (for testing notifications)")
except ImportError as e:
    logger.warning(f"Slack test router not available: {e}")

# Import and include Onboarding campaign router (email onboarding sequence)
try:
    from routers.onboarding import router as onboarding_router
    app.include_router(onboarding_router)
    logger.info("Onboarding campaign router registered (4-day email sequence)")
except ImportError as e:
    logger.warning(f"Onboarding router not available: {e}")

# Pydantic models
class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str

class LeadSearchRequest(BaseModel):
    industry: str = "SaaS"
    location: str = "NYC"

class TemplateRequest(BaseModel):
    template_name: str
    customizations: Optional[dict] = None

class BatchEmailRequest(BaseModel):
    leads: List[dict]
    template: str

# Helper functions
def load_templates():
    return {
        "Professional Introduction": (
            "Hi {first_name},\\n\\nI hope this message finds you well. "
            "I noticed {company} is in the {industry} space, and I wanted to reach out about an "
            "opportunity that could help streamline your operations.\\n\\n"
            "Would you be open to a brief 15-minute call this week?\\n\\nBest regards,\\n[Your Name]"
        ),
        "Partnership Proposal": (
            "Hello {first_name},\\n\\nI've been following {company}'s work in {industry} and I'm impressed "
            "by your approach. I believe there's potential for a mutually beneficial partnership.\\n\\n"
            "Would you be interested in exploring how we could work together?\\n\\n"
            "Looking forward to hearing from you,\\n[Your Name]"
        ),
        "Service Offer": (
            "Hi {first_name},\\n\\nI hope you're doing well. I specialize in helping {industry} companies like "
            "{company} achieve their growth objectives.\\n\\nI'd love to show you how we've helped similar "
            "companies increase their efficiency by 30%.\\n\\nAre you available for a quick chat this week?\\n\\n"
            "Best,\\n[Your Name]"
        ),
    }

def is_valid_email(addr: str) -> bool:
    if not addr or "@" not in addr:
        return False
    return bool(re.match(r"^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", addr.strip()))

def fetch_mock_leads(industry: str, location: str) -> List[dict]:
    companies = ["PipelineHub", "Outreachly", "LeadPro", "GrowthLoop"]
    leads = []
    for i, company in enumerate(companies):
        leads.append({
            "email": f"alex{i}@demo.com",
            "first_name": "Alex",
            "company": company,
            "industry": industry or "B2B Services",
            "city": location or "",
        })
    return leads

def send_mail(to: str, subject: str, body: str) -> int:
    # Placeholder - replace with your actual email sending logic
    logger.info(
        f"Sending email to: {to}",
        extra={
            "recipient": to,
            "subject": subject,
            "body_preview": body[:50] + "..." if len(body) > 50 else body
        }
    )
    return 202  # Simulate success

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Luntra Outreach API",
        "status": "active",
        "version": "1.0.0"
    }

# Health check with build traceability
@app.get("/health")
async def health_check():
    """
    Health endpoint with build traceability
    Returns deployment information including build hash for verification
    """
    # Get git commit hash for traceability
    build_hash = "unknown"
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode == 0:
            build_hash = result.stdout.strip()
    except Exception as e:
        logger.debug(f"Could not get git hash: {e}")

    # Get build timestamp from environment or use current time
    build_timestamp = os.getenv("BUILD_TIMESTAMP", datetime.utcnow().isoformat())

    return {
        "status": "healthy",
        "build_hash": build_hash,
        "build_timestamp": build_timestamp,
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "python_version": os.getenv("PYTHON_VERSION", "unknown"),
        "deployed_at": build_timestamp
    }

# Get available templates
@app.get("/templates")
async def get_templates():
    templates = load_templates()
    return {"templates": templates}

# Search for mock leads
@app.post("/leads/search")
async def search_leads(request: LeadSearchRequest):
    try:
        leads = fetch_mock_leads(request.industry, request.location)
        return {"leads": leads, "count": len(leads)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Send single email
@app.post("/email/send")
async def send_email(request: EmailRequest):
    if not is_valid_email(request.to):
        raise HTTPException(status_code=400, detail="Invalid email address")

    try:
        result = send_mail(request.to, request.subject, request.body)
        if result == 202:
            return {"status": "success", "message": "Email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Send batch emails
@app.post("/email/batch")
async def send_batch_emails(request: BatchEmailRequest):
    results = []
    success_count = 0

    for lead in request.leads:
        email = lead.get('email', '').strip()
        if not is_valid_email(email):
            results.append({
                "email": email,
                "status": "failed",
                "error": "Invalid email address"
            })
            continue

        # Format template with lead data
        try:
            ctx = {
                "first_name": lead.get("first_name", "there"),
                "company": lead.get("company", "your team"),
                "industry": lead.get("industry", ""),
                "city": lead.get("city", "")
            }
            body = request.template.format(**ctx)
            subject = f"Quick intro: {ctx['company']} + {ctx['industry']}".strip(": +")

            result = send_mail(email, subject, body)
            if result == 202:
                results.append({
                    "email": email,
                    "status": "success"
                })
                success_count += 1
            else:
                results.append({
                    "email": email,
                    "status": "failed",
                    "error": "Send failed"
                })
        except Exception as e:
            results.append({
                "email": email,
                "status": "failed",
                "error": str(e)
            })

    return {
        "results": results,
        "total": len(request.leads),
        "success": success_count,
        "failed": len(request.leads) - success_count
    }

# Test email endpoint
@app.post("/email/test")
async def test_email(email: str):
    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email address")

    templates = load_templates()
    template = templates["Professional Introduction"]
    body = template.format(
        first_name="Test",
        company="Your Company",
        industry="Your Industry",
        city="Your City"
    )
    subject = "Test email from Luntra Outreach API"

    try:
        result = send_mail(email, subject, body)
        if result == 202:
            return {"status": "success", "message": "Test email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send test email")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Custom OpenAPI schema with security definitions
def custom_openapi():
    """
    Customize OpenAPI schema to include JWT Bearer authentication
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        servers=app.servers,
        tags=app.openapi_tags
    )

    # Add security scheme for JWT Bearer tokens
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token in the format: Bearer <token>"
        }
    }

    # Add global security requirement (can be overridden per endpoint)
    # This makes the "Authorize" button appear in Swagger UI
    openapi_schema["security"] = [{"BearerAuth": []}]

    # Add example responses for common errors
    openapi_schema["components"]["schemas"]["UnauthorizedError"] = {
        "type": "object",
        "properties": {
            "success": {"type": "boolean", "example": False},
            "error": {"type": "string", "example": "No authorization token provided"},
            "error_code": {"type": "string", "example": "UNAUTHORIZED"}
        }
    }

    openapi_schema["components"]["schemas"]["ValidationError"] = {
        "type": "object",
        "properties": {
            "success": {"type": "boolean", "example": False},
            "error": {"type": "string", "example": "Validation failed"},
            "error_code": {"type": "string", "example": "VALIDATION_ERROR"},
            "details": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "field": {"type": "string", "example": "email"},
                        "message": {"type": "string", "example": "Invalid email format"}
                    }
                }
            }
        }
    }

    openapi_schema["components"]["schemas"]["RateLimitError"] = {
        "type": "object",
        "properties": {
            "success": {"type": "boolean", "example": False},
            "error": {"type": "string", "example": "Rate limit exceeded"},
            "error_code": {"type": "string", "example": "RATE_LIMIT_EXCEEDED"}
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema


# Apply custom OpenAPI schema
app.openapi = custom_openapi

logger.info("PropIQ API initialization complete")
logger.info("OpenAPI documentation available at: /docs and /redoc")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
