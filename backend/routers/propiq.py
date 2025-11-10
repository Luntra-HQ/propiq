"""
PropIQ Property Analysis API
AI-powered real estate investment analysis using OpenAI
"""

from fastapi import APIRouter, HTTPException, Header, Depends, Query
from pydantic import BaseModel, validator, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import os
import json
import jwt
from openai import AzureOpenAI
from config.logging_config import get_logger
from utils.validators import (
    validate_safe_string,
    sanitize_address,
    MAX_ADDRESS_LENGTH
)
from utils.pagination import (
    PaginationParams,
    PaginatedResponse,
    create_pagination_meta
)

logger = get_logger(__name__)

# Weights & Biases for AI tracking
try:
    import wandb
    # Initialize W&B in offline mode (works without API key)
    wandb_enabled = os.getenv("WANDB_MODE", "offline") != "disabled"
    if wandb_enabled:
        wandb.init(
            project="propiq-analysis",
            mode=os.getenv("WANDB_MODE", "offline"),
            config={
                "model": "gpt-4o-mini",
                "environment": os.getenv("ENVIRONMENT", "development")
            }
        )
    logger.info("Weights & Biases AI tracking enabled")
except Exception as e:
    wandb_enabled = False
    logger.warning(f"Weights & Biases not available: {e}")

# Supabase database setup (PostgreSQL with bcrypt and trial tracking)
try:
    from database_supabase import (
        get_user_by_id,
        save_property_analysis,
        decrement_trial_analyses,
        get_user_trial_count,
        get_user_analyses,
        count_user_analyses
    )
    DATABASE_AVAILABLE = True
except Exception as e:
    logger.warning(f"Database not available: {e}")
    DATABASE_AVAILABLE = False

router = APIRouter(prefix="/api/v1/propiq", tags=["propiq"])

# Azure OpenAI Configuration
# Validate credentials before initialization to prevent startup crashes
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY:
    raise ValueError(
        "Azure OpenAI credentials not configured. "
        "Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY in environment variables."
    )

client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_KEY,
    api_version=AZURE_OPENAI_API_VERSION
)

# JWT Configuration (must match auth.py)
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

class PropertyAnalysisRequest(BaseModel):
    address: str = Field(
        ...,
        max_length=MAX_ADDRESS_LENGTH,
        description="Property address to analyze"
    )
    propertyType: Optional[str] = Field(
        "single_family",
        max_length=50,
        description="Property type (single_family, multi_family, condo, etc.)"
    )
    purchasePrice: Optional[float] = Field(
        None,
        ge=0,
        le=100000000,  # $100M max
        description="Purchase price in USD"
    )
    downPayment: Optional[float] = Field(
        None,
        ge=0,
        le=100000000,
        description="Down payment in USD"
    )
    interestRate: Optional[float] = Field(
        None,
        ge=0,
        le=100,  # 0-100%
        description="Interest rate percentage"
    )

    @validator('address')
    def validate_address(cls, v):
        """Validate and sanitize property address"""
        if v:
            # Check for dangerous patterns
            is_valid, error_msg = validate_safe_string(v, "Address")
            if not is_valid:
                raise ValueError(error_msg)
            # Sanitize
            v = sanitize_address(v)
        return v

    @validator('propertyType')
    def validate_property_type(cls, v):
        """Validate property type"""
        if v:
            allowed_types = [
                "single_family", "multi_family", "condo", "townhouse",
                "apartment", "commercial", "land", "other"
            ]
            if v.lower() not in allowed_types:
                raise ValueError(f"Invalid property type. Allowed: {', '.join(allowed_types)}")
            # Check for dangerous patterns
            is_valid, error_msg = validate_safe_string(v, "Property type")
            if not is_valid:
                raise ValueError(error_msg)
        return v

class PropertyAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    usesRemaining: Optional[int] = None

class AnalysisSummary(BaseModel):
    """Summary of a property analysis for list view"""
    id: str = Field(..., description="Analysis ID")
    address: str = Field(..., description="Property address")
    property_type: Optional[str] = Field(None, description="Property type")
    deal_score: Optional[float] = Field(None, description="Deal score (0-100)")
    deal_rating: Optional[str] = Field(None, description="Deal rating")
    recommendation: Optional[str] = Field(None, description="Investment recommendation")
    created_at: str = Field(..., description="Analysis timestamp")

def transform_analysis_for_extension(openai_response: dict, request: PropertyAnalysisRequest) -> dict:
    """
    Transform OpenAI's analysis response to match extension's expected schema

    OpenAI format:
    {
        "summary": "...",
        "location": {"neighborhood": "...", "marketScore": 0-100},
        "financials": {"estimatedValue": 0, "estimatedRent": 0, "capRate": 0, "roi": 0, "cashFlow": 0},
        "investment": {"recommendation": "buy/hold/avoid", "confidenceScore": 0-100},
        "pros": [], "cons": [], "keyInsights": [], "nextSteps": []
    }

    Extension expected format:
    {
        "address": "...",
        "purchasePrice": 0,
        "estimatedMonthlyRent": 0,
        "monthlyCashFlow": 0,
        "annualCashFlow": 0,
        "capRate": 0,
        "cashOnCashReturn": 0,
        "dealScore": 0-100,
        "dealRating": "Excellent/Good/Fair/Poor/Avoid",
        "recommendation": "...",
        "keyFindings": [],
        "risks": [],
        "opportunities": [],
        "marketInsights": [],
        "fullAnalysis": "...",
        "analysisId": "...",
        "timestamp": "..."
    }
    """
    import uuid
    from datetime import datetime

    # Extract data from OpenAI response
    financials = openai_response.get("financials", {})
    investment = openai_response.get("investment", {})
    location = openai_response.get("location", {})

    # Map recommendation to deal rating
    recommendation_map = {
        "strong_buy": "Excellent",
        "buy": "Good",
        "hold": "Fair",
        "avoid": "Avoid"
    }

    openai_recommendation = investment.get("recommendation", "hold")
    deal_rating = recommendation_map.get(openai_recommendation, "Fair")

    # Use confidence score as deal score
    deal_score = investment.get("confidenceScore", 50)

    # Calculate cash flow values
    estimated_rent = financials.get("estimatedRent", 0)
    monthly_cash_flow = financials.get("cashFlow", 0)
    annual_cash_flow = monthly_cash_flow * 12

    # Get purchase price from request or OpenAI estimate
    purchase_price = request.purchasePrice or financials.get("estimatedValue", 0)

    # Build full analysis text from summary and key insights
    summary = openai_response.get("summary", "")
    key_insights = openai_response.get("keyInsights", [])
    full_analysis = f"{summary}\n\nKey Insights:\n" + "\n".join(f"• {insight}" for insight in key_insights)

    # Combine pros as opportunities
    opportunities = openai_response.get("pros", [])

    # Combine cons as risks
    risks = openai_response.get("cons", [])

    # Add market insights from location data
    market_insights = []
    if location.get("neighborhood"):
        market_insights.append(f"Located in {location['neighborhood']}, {location.get('city', '')}, {location.get('state', '')}")
    if location.get("marketTrend"):
        trend = location["marketTrend"]
        market_insights.append(f"Market trend: {trend}")
    if location.get("marketScore"):
        score = location["marketScore"]
        market_insights.append(f"Market score: {score}/100")

    # Generate unique analysis ID
    analysis_id = str(uuid.uuid4())

    # Transform to extension format
    return {
        "address": request.address,
        "purchasePrice": purchase_price,
        "estimatedMonthlyRent": estimated_rent,
        "monthlyCashFlow": monthly_cash_flow,
        "annualCashFlow": annual_cash_flow,
        "capRate": financials.get("capRate", 0),
        "cashOnCashReturn": financials.get("roi", 0),  # Map ROI to cash-on-cash return
        "dealScore": deal_score,
        "dealRating": deal_rating,
        "recommendation": summary,
        "keyFindings": key_insights,
        "risks": risks,
        "opportunities": opportunities,
        "marketInsights": market_insights,
        "fullAnalysis": full_analysis,
        "analysisId": analysis_id,
        "timestamp": datetime.utcnow().isoformat()
    }

def verify_token(authorization: str = Header(None)) -> dict:
    """
    Verify JWT token from Authorization header

    Returns decoded token payload with user_id and email
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        # Verify and decode token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

@router.post("/analyze", response_model=PropertyAnalysisResponse)
async def analyze_property(
    request: PropertyAnalysisRequest,
    token_payload: dict = Depends(verify_token)
):
    """
    Analyze a property using AI-powered investment analysis

    This endpoint:
    1. Verifies user authentication via JWT token
    2. Checks user's trial usage or subscription status
    3. Uses OpenAI to analyze the property
    4. Returns investment insights and recommendations

    Requires:
    - Authorization: Bearer <jwt_token>

    Args:
        request: PropertyAnalysisRequest with address and optional details
        token_payload: Decoded JWT token (injected by verify_token)

    Returns:
        PropertyAnalysisResponse with analysis results
    """

    user_id = token_payload.get("sub")
    user_email = token_payload.get("email")

    try:
        # Check user's trial analyses remaining (if database is available)
        if DATABASE_AVAILABLE:
            user = get_user_by_id(user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Check if user has a subscription or trial analyses remaining
            subscription_tier = user.get("subscription_tier", "free")
            subscription_status = user.get("subscription_status", "inactive")
            trial_analyses_remaining = user.get("trial_analyses_remaining", 0)

            # Allow analysis if:
            # 1. User has active paid subscription, OR
            # 2. User still has trial analyses remaining
            has_subscription = (
                subscription_tier in ["starter", "pro", "elite"] and
                subscription_status == "active"
            )

            if not has_subscription and trial_analyses_remaining <= 0:
                raise HTTPException(
                    status_code=403,
                    detail="No analyses remaining. Please upgrade to a paid plan."
                )

        # Build enhanced analysis prompt for OpenAI
        prompt = f"""
You are an expert real estate investment analyst with 15+ years of experience in residential property analysis.
Analyze the following property and provide a detailed, realistic investment analysis based on current market conditions.

PROPERTY DETAILS:
Address: {request.address}
Property Type: {request.propertyType}
{"Purchase Price: $" + f"{request.purchasePrice:,.2f}" if request.purchasePrice else "Purchase Price: Not provided (estimate based on area)"}
{"Down Payment: $" + f"{request.downPayment:,.2f}" if request.downPayment else ""}
{"Interest Rate: " + f"{request.interestRate}%" if request.interestRate else "Interest Rate: Assume current market rate (~7.5%)"}

ANALYSIS REQUIREMENTS:
1. Use realistic market data for the specific neighborhood/city
2. Base rental estimates on actual market rents (use Zillow Rent Zestimate methodology)
3. Calculate cash flow using: Monthly Rent - (Mortgage + Property Tax + Insurance + HOA + Maintenance)
4. Assume typical costs: Property tax ~1.2% annually, Insurance ~0.5% annually, Maintenance ~1% annually
5. Cap Rate = Net Operating Income / Purchase Price
6. ROI = Annual Cash Flow / Total Cash Invested
7. Provide specific, actionable insights based on the actual location

MARKET CONTEXT:
- Parse the address to identify the city, state, and neighborhood
- Consider the local market conditions (supply/demand, price trends, rental demand)
- Factor in location desirability, school districts, crime rates, job market

OUTPUT FORMAT (Must be valid JSON):
{{
    "summary": "2-3 sentence executive summary with specific numbers and recommendation",
    "location": {{
        "neighborhood": "Actual neighborhood name from address",
        "city": "City name",
        "state": "State abbreviation",
        "marketTrend": "up/down/stable (based on recent market data)",
        "marketScore": 0-100 (higher = better market conditions)
    }},
    "financials": {{
        "estimatedValue": {request.purchasePrice if request.purchasePrice else 0} (use provided or estimate),
        "estimatedRent": 0 (realistic monthly rent for this property type/location),
        "cashFlow": 0 (realistic monthly cash flow: rent - all expenses),
        "capRate": 0.0 (as decimal, e.g., 5.2 for 5.2%),
        "roi": 0.0 (as decimal, annual return on cash invested),
        "monthlyMortgage": 0 (P&I only, use 30-year fixed at ~7.5% if not provided)
    }},
    "investment": {{
        "recommendation": "strong_buy/buy/hold/avoid",
        "confidenceScore": 0-100 (how confident are you in this analysis),
        "riskLevel": "low/medium/high",
        "timeHorizon": "short/medium/long (investment time horizon)"
    }},
    "pros": ["3-5 specific advantages of this property"],
    "cons": ["3-5 specific disadvantages or risks"],
    "keyInsights": ["4-6 key insights about this investment opportunity"],
    "nextSteps": ["3-4 specific action items for the investor"]
}}

VALIDATION RULES:
- All numeric values must be realistic (no zeros unless truly applicable)
- Cash flow can be negative (indicate if property won't cash flow)
- If data is insufficient, make reasonable assumptions and note them in keyInsights
- Recommendation should align with the numbers (e.g., negative cash flow = hold/avoid)
- Be honest about risks - don't oversell the property

EXAMPLES OF GOOD ANALYSIS:
- "Strong Buy" = Positive cash flow, good location, cap rate >6%, low risk
- "Buy" = Slight positive/break-even cash flow, decent location, cap rate 4-6%
- "Hold" = Negative cash flow, appreciation potential, cap rate <4%
- "Avoid" = Significant negative cash flow, declining market, major risks

Provide your analysis now:
"""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Cost-effective model
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional real estate investment analyst. Always respond with valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}  # Ensure JSON response
        )

        # Parse OpenAI response
        analysis_text = response.choices[0].message.content
        openai_analysis = json.loads(analysis_text)

        # Transform to extension's expected format
        analysis_data = transform_analysis_for_extension(openai_analysis, request)

        # Store the original OpenAI response as metadata
        analysis_data["_metadata"] = {
            "address": request.address,
            "analyzedAt": datetime.utcnow().isoformat(),
            "analyzedBy": user_email,
            "model": "gpt-4o-mini",
            "originalOpenAIResponse": openai_analysis
        }

        # Save analysis to database and track usage
        if DATABASE_AVAILABLE:
            # Prepare analysis data for database
            analysis_record = {
                "address": request.address,
                "property_type": request.propertyType,
                "purchase_price": request.purchasePrice,
                "down_payment": request.downPayment,
                "interest_rate": request.interestRate,
                "analysis": analysis_data,
                "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else None,
                "model": "gpt-4o-mini"
            }

            # Save to database
            save_property_analysis(user_id, request.address, analysis_record)

            # Decrement trial analyses if user doesn't have a subscription
            if not has_subscription:
                decrement_trial_analyses(user_id)

            # Get updated trial count
            uses_remaining = get_user_trial_count(user_id)
        else:
            uses_remaining = None

        # Track analysis with Weights & Biases
        if wandb_enabled:
            try:
                wandb.log({
                    # Input parameters
                    "address": request.address,
                    "property_type": request.propertyType,
                    "purchase_price": request.purchasePrice or 0,
                    "down_payment": request.downPayment or 0,
                    "interest_rate": request.interestRate or 0,

                    # Model usage
                    "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else 0,
                    "model": "gpt-4o-mini",

                    # Analysis results (using transformed data)
                    "recommendation": analysis_data.get("recommendation", "unknown"),
                    "deal_score": analysis_data.get("dealScore", 0),
                    "deal_rating": analysis_data.get("dealRating", "unknown"),
                    "cap_rate": analysis_data.get("capRate", 0),
                    "cash_on_cash_return": analysis_data.get("cashOnCashReturn", 0),
                    "monthly_cash_flow": analysis_data.get("monthlyCashFlow", 0),
                    "annual_cash_flow": analysis_data.get("annualCashFlow", 0),

                    # User metadata
                    "user_id": user_id,
                    "subscription_tier": subscription_tier if DATABASE_AVAILABLE else "unknown",
                    "timestamp": datetime.utcnow().isoformat()
                })
            except Exception as e:
                print(f"⚠️  W&B logging failed: {e}")

        return PropertyAnalysisResponse(
            success=True,
            analysis=analysis_data,
            usesRemaining=uses_remaining
        )

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/analyses", response_model=PaginatedResponse[AnalysisSummary])
async def list_user_analyses(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    token_payload: dict = Depends(verify_token)
):
    """
    List all property analyses for the authenticated user (paginated)

    Sprint 7: New endpoint for viewing analysis history with pagination

    Args:
        page: Page number (default: 1)
        page_size: Items per page (default: 20, max: 100)
        token_payload: User authentication (from JWT)

    Returns:
        Paginated list of property analysis summaries with metadata
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    # Create pagination params
    pagination = PaginationParams(page=page, page_size=page_size)

    # Get total count for pagination metadata
    total_count = count_user_analyses(user_id)

    # Fetch paginated analyses for this user
    analyses = get_user_analyses(
        user_id=user_id,
        limit=pagination.limit,
        offset=pagination.skip
    )

    # Format analysis summaries
    analysis_summaries = [
        AnalysisSummary(
            id=str(analysis.get("id", "")),
            address=analysis.get("address", ""),
            property_type=analysis.get("property_type"),
            deal_score=analysis.get("analysis_data", {}).get("dealScore"),
            deal_rating=analysis.get("analysis_data", {}).get("dealRating"),
            recommendation=analysis.get("analysis_data", {}).get("recommendation"),
            created_at=analysis.get("created_at", "")
        )
        for analysis in analyses
    ]

    # Create pagination metadata
    pagination_meta = create_pagination_meta(
        total_items=total_count,
        page=pagination.page,
        page_size=pagination.page_size
    )

    # Return paginated response
    return PaginatedResponse(
        success=True,
        data=analysis_summaries,
        pagination=pagination_meta
    )

@router.get("/health")
async def health_check():
    """Health check endpoint for PropIQ API"""
    has_azure_key = bool(os.getenv("AZURE_OPENAI_KEY"))
    has_azure_endpoint = bool(os.getenv("AZURE_OPENAI_ENDPOINT"))

    return {
        "status": "healthy" if (has_azure_key and has_azure_endpoint) else "degraded",
        "azure_openai_configured": has_azure_key and has_azure_endpoint,
        "model": "gpt-4o-mini",
        "provider": "Azure OpenAI"
    }
