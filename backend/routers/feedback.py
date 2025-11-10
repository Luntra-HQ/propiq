"""
Feedback Collection Router
Implements comprehensive feedback system for product evaluation

Features:
- CSAT (Customer Satisfaction) surveys
- NPS (Net Promoter Score) surveys
- PMF (Product-Market Fit) surveys
- Feature requests
- User interviews scheduling
- Feedback analytics
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, validator, Field
from typing import Optional, List, Literal
from datetime import datetime, timedelta
from enum import Enum
import os

from config.logging_config import get_logger
from auth import get_current_user

logger = get_logger(__name__)

# Initialize router
router = APIRouter(
    prefix="/api/v1/feedback",
    tags=["Feedback & Evaluation"]
)

# Initialize Supabase
try:
    from supabase import create_client, Client
    supabase: Client = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY")
    )
except Exception as e:
    logger.error(f"Failed to initialize Supabase: {e}")
    supabase = None


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class SurveyType(str, Enum):
    """Survey types"""
    CSAT = "csat"  # Customer Satisfaction
    NPS = "nps"  # Net Promoter Score
    PMF = "pmf"  # Product-Market Fit
    FEATURE_REQUEST = "feature_request"
    BUG_REPORT = "bug_report"


class CSATRating(int, Enum):
    """CSAT rating scale (1-5)"""
    VERY_UNSATISFIED = 1
    UNSATISFIED = 2
    NEUTRAL = 3
    SATISFIED = 4
    VERY_SATISFIED = 5


class PMFResponse(str, Enum):
    """PMF survey responses"""
    VERY_DISAPPOINTED = "very_disappointed"
    SOMEWHAT_DISAPPOINTED = "somewhat_disappointed"
    NOT_DISAPPOINTED = "not_disappointed"


class CSATSurveyRequest(BaseModel):
    """CSAT survey submission"""
    rating: CSATRating = Field(..., description="Satisfaction rating (1-5)")
    comment: Optional[str] = Field(None, max_length=1000, description="Optional feedback")
    context: Optional[str] = Field(None, description="What triggered the survey (e.g., 'post_analysis')")

    class Config:
        use_enum_values = True


class NPSSurveyRequest(BaseModel):
    """NPS survey submission"""
    score: int = Field(..., ge=0, le=10, description="Likelihood to recommend (0-10)")
    comment: Optional[str] = Field(None, max_length=1000, description="Why this score?")

    @validator("score")
    def validate_score(cls, v):
        if not 0 <= v <= 10:
            raise ValueError("NPS score must be between 0 and 10")
        return v


class PMFSurveyRequest(BaseModel):
    """Product-Market Fit survey (Sean Ellis test)"""
    response: PMFResponse = Field(..., description="How would you feel if you could no longer use PropIQ?")
    primary_benefit: Optional[str] = Field(None, max_length=500, description="Primary benefit you get")

    class Config:
        use_enum_values = True


class FeatureRequestRequest(BaseModel):
    """Feature request submission"""
    title: str = Field(..., min_length=5, max_length=200, description="Brief feature title")
    description: str = Field(..., min_length=10, max_length=2000, description="Detailed description")
    priority: Literal["nice_to_have", "important", "critical"] = Field(
        default="important",
        description="How important is this to you?"
    )
    use_case: Optional[str] = Field(None, max_length=1000, description="Your specific use case")


class BugReportRequest(BaseModel):
    """Bug report submission"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    steps_to_reproduce: Optional[str] = Field(None, max_length=1000)
    severity: Literal["low", "medium", "high", "critical"] = "medium"
    browser: Optional[str] = None
    device: Optional[str] = None


class InterviewBookingRequest(BaseModel):
    """User interview booking request"""
    preferred_times: List[str] = Field(..., description="ISO 8601 datetime strings")
    topics: List[str] = Field(default=[], description="Topics you'd like to discuss")
    duration_minutes: int = Field(default=30, ge=15, le=60)

    @validator("preferred_times")
    def validate_times(cls, v):
        if len(v) == 0:
            raise ValueError("At least one preferred time required")
        if len(v) > 5:
            raise ValueError("Maximum 5 preferred times")
        return v


# ============================================================================
# CSAT (CUSTOMER SATISFACTION) ENDPOINTS
# ============================================================================

@router.post("/csat")
async def submit_csat(
    request: CSATSurveyRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit CSAT (Customer Satisfaction) survey

    **Trigger**: After completing analysis (every 5th)
    **Scale**: 1-5 (Very Unsatisfied to Very Satisfied)
    **Target**: >4.2 average (84% satisfaction)
    """
    try:
        user_id = current_user.get("user_id")

        # Store in database
        result = supabase.table("feedback_surveys").insert({
            "user_id": user_id,
            "survey_type": "csat",
            "rating": request.rating,
            "comment": request.comment,
            "context": request.context,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        # Calculate user's average CSAT
        avg_result = supabase.table("feedback_surveys")\
            .select("rating")\
            .eq("user_id", user_id)\
            .eq("survey_type", "csat")\
            .execute()

        user_avg_csat = sum(r["rating"] for r in avg_result.data) / len(avg_result.data) if avg_result.data else request.rating

        logger.info(
            f"CSAT survey submitted",
            extra={
                "user_id": user_id,
                "rating": request.rating,
                "user_avg": user_avg_csat,
                "context": request.context
            }
        )

        return {
            "success": True,
            "message": "Thank you for your feedback!",
            "your_rating": request.rating,
            "your_average": round(user_avg_csat, 2)
        }

    except Exception as e:
        logger.error(f"Failed to submit CSAT survey: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to submit survey")


@router.get("/csat/analytics")
async def get_csat_analytics(
    days: int = Query(default=30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """
    Get CSAT analytics (admin only in production)

    Returns:
    - Average CSAT score
    - Distribution by rating
    - Trend over time
    """
    try:
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

        # Get all CSAT responses
        result = supabase.table("feedback_surveys")\
            .select("*")\
            .eq("survey_type", "csat")\
            .gte("created_at", cutoff_date)\
            .execute()

        if not result.data:
            return {
                "success": True,
                "average_csat": 0,
                "total_responses": 0,
                "distribution": {},
                "message": "No CSAT data yet"
            }

        ratings = [r["rating"] for r in result.data]
        average_csat = sum(ratings) / len(ratings)

        # Distribution
        distribution = {
            "very_satisfied": sum(1 for r in ratings if r == 5),
            "satisfied": sum(1 for r in ratings if r == 4),
            "neutral": sum(1 for r in ratings if r == 3),
            "unsatisfied": sum(1 for r in ratings if r == 2),
            "very_unsatisfied": sum(1 for r in ratings if r == 1)
        }

        return {
            "success": True,
            "average_csat": round(average_csat, 2),
            "total_responses": len(ratings),
            "distribution": distribution,
            "percentage_satisfied": round((distribution["satisfied"] + distribution["very_satisfied"]) / len(ratings) * 100, 1),
            "target": 4.2,
            "status": "✅ Excellent" if average_csat >= 4.2 else "⚠️ Needs Improvement" if average_csat >= 3.5 else "🔴 Critical"
        }

    except Exception as e:
        logger.error(f"Failed to get CSAT analytics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")


# ============================================================================
# NPS (NET PROMOTER SCORE) ENDPOINTS
# ============================================================================

@router.post("/nps")
async def submit_nps(
    request: NPSSurveyRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit NPS (Net Promoter Score) survey

    **Trigger**: After 7 days of usage, then monthly
    **Scale**: 0-10 (0 = Not likely, 10 = Extremely likely)
    **Scoring**:
    - 9-10: Promoters
    - 7-8: Passives
    - 0-6: Detractors
    **Target NPS**: 40+ (Excellent for early-stage)
    """
    try:
        user_id = current_user.get("user_id")

        # Classify user as Promoter, Passive, or Detractor
        if request.score >= 9:
            category = "promoter"
        elif request.score >= 7:
            category = "passive"
        else:
            category = "detractor"

        # Store in database
        result = supabase.table("feedback_surveys").insert({
            "user_id": user_id,
            "survey_type": "nps",
            "rating": request.score,
            "comment": request.comment,
            "metadata": {"category": category},
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        logger.info(
            f"NPS survey submitted",
            extra={
                "user_id": user_id,
                "score": request.score,
                "category": category
            }
        )

        return {
            "success": True,
            "message": "Thank you for your feedback!",
            "your_score": request.score,
            "category": category
        }

    except Exception as e:
        logger.error(f"Failed to submit NPS survey: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to submit survey")


@router.get("/nps/analytics")
async def get_nps_analytics(
    days: int = Query(default=90, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """
    Get NPS analytics

    Returns:
    - NPS score (% Promoters - % Detractors)
    - Distribution (Promoters, Passives, Detractors)
    - Benchmark comparison
    """
    try:
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

        # Get all NPS responses
        result = supabase.table("feedback_surveys")\
            .select("*")\
            .eq("survey_type", "nps")\
            .gte("created_at", cutoff_date)\
            .execute()

        if not result.data:
            return {
                "success": True,
                "nps_score": 0,
                "total_responses": 0,
                "message": "No NPS data yet"
            }

        scores = [r["rating"] for r in result.data]
        total = len(scores)

        promoters = sum(1 for s in scores if s >= 9)
        passives = sum(1 for s in scores if 7 <= s <= 8)
        detractors = sum(1 for s in scores if s <= 6)

        nps_score = (promoters / total * 100) - (detractors / total * 100)

        return {
            "success": True,
            "nps_score": round(nps_score, 1),
            "total_responses": total,
            "distribution": {
                "promoters": promoters,
                "promoters_pct": round(promoters / total * 100, 1),
                "passives": passives,
                "passives_pct": round(passives / total * 100, 1),
                "detractors": detractors,
                "detractors_pct": round(detractors / total * 100, 1)
            },
            "average_score": round(sum(scores) / total, 2),
            "target": 40,
            "benchmark": "World-class: >50 | Excellent: 30-50 | Good: 10-30 | Poor: <10",
            "status": "🌟 World-class" if nps_score > 50 else "✅ Excellent" if nps_score > 30 else "🟡 Good" if nps_score > 10 else "🔴 Needs Work"
        }

    except Exception as e:
        logger.error(f"Failed to get NPS analytics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")


# ============================================================================
# PMF (PRODUCT-MARKET FIT) ENDPOINTS - SEAN ELLIS TEST
# ============================================================================

@router.post("/pmf")
async def submit_pmf(
    request: PMFSurveyRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit PMF (Product-Market Fit) survey (Sean Ellis test)

    **Question**: "How would you feel if you could no longer use PropIQ?"
    **Trigger**: After 3 completed analyses
    **Frequency**: Once per user
    **Target**: >40% say "Very disappointed" = Strong PMF

    This is the GOLD STANDARD metric for product-market fit.
    """
    try:
        user_id = current_user.get("user_id")

        # Check if user already submitted PMF
        existing = supabase.table("feedback_surveys")\
            .select("id")\
            .eq("user_id", user_id)\
            .eq("survey_type", "pmf")\
            .execute()

        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="You've already submitted a PMF survey. Thank you!"
            )

        # Store in database
        result = supabase.table("feedback_surveys").insert({
            "user_id": user_id,
            "survey_type": "pmf",
            "rating": 1 if request.response == "very_disappointed" else 2 if request.response == "somewhat_disappointed" else 3,
            "comment": request.primary_benefit,
            "metadata": {"response": request.response},
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        logger.info(
            f"PMF survey submitted",
            extra={
                "user_id": user_id,
                "response": request.response
            }
        )

        return {
            "success": True,
            "message": "Thank you! Your feedback is invaluable for improving PropIQ.",
            "your_response": request.response
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit PMF survey: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to submit survey")


@router.get("/pmf/analytics")
async def get_pmf_analytics(current_user: dict = Depends(get_current_user)):
    """
    Get PMF analytics

    Returns:
    - % "Very disappointed"
    - Distribution of responses
    - PMF assessment

    **Benchmark**:
    - >40%: Strong product-market fit ✅
    - 25-40%: Promising, needs iteration 🟡
    - <25%: Weak product-market fit 🔴
    """
    try:
        # Get all PMF responses
        result = supabase.table("feedback_surveys")\
            .select("*")\
            .eq("survey_type", "pmf")\
            .execute()

        if not result.data:
            return {
                "success": True,
                "very_disappointed_pct": 0,
                "total_responses": 0,
                "message": "No PMF data yet. Need 20+ responses for reliable signal."
            }

        total = len(result.data)

        very_disappointed = sum(1 for r in result.data if r["metadata"].get("response") == "very_disappointed")
        somewhat_disappointed = sum(1 for r in result.data if r["metadata"].get("response") == "somewhat_disappointed")
        not_disappointed = sum(1 for r in result.data if r["metadata"].get("response") == "not_disappointed")

        very_disappointed_pct = very_disappointed / total * 100

        # PMF assessment
        if very_disappointed_pct >= 40:
            status = "🚀 STRONG PMF"
            recommendation = "You have strong product-market fit! Focus on growth and scale."
        elif very_disappointed_pct >= 25:
            status = "🟡 PROMISING"
            recommendation = "Good early signal. Iterate based on user feedback to strengthen PMF."
        else:
            status = "🔴 WEAK PMF"
            recommendation = "Consider significant product changes or pivot. Not enough users would be very disappointed to lose the product."

        return {
            "success": True,
            "very_disappointed_pct": round(very_disappointed_pct, 1),
            "total_responses": total,
            "distribution": {
                "very_disappointed": very_disappointed,
                "very_disappointed_pct": round(very_disappointed_pct, 1),
                "somewhat_disappointed": somewhat_disappointed,
                "somewhat_disappointed_pct": round(somewhat_disappointed / total * 100, 1),
                "not_disappointed": not_disappointed,
                "not_disappointed_pct": round(not_disappointed / total * 100, 1)
            },
            "target": 40.0,
            "status": status,
            "recommendation": recommendation,
            "reliable": total >= 20,
            "reliability_note": "Need at least 20 responses for reliable PMF signal" if total < 20 else "Sample size is statistically significant"
        }

    except Exception as e:
        logger.error(f"Failed to get PMF analytics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")


# ============================================================================
# FEATURE REQUESTS & BUG REPORTS
# ============================================================================

@router.post("/feature-request")
async def submit_feature_request(
    request: FeatureRequestRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a feature request

    Feature requests help us understand what users need most.
    """
    try:
        user_id = current_user.get("user_id")

        # Store in database
        result = supabase.table("feedback_feature_requests").insert({
            "user_id": user_id,
            "title": request.title,
            "description": request.description,
            "priority": request.priority,
            "use_case": request.use_case,
            "status": "new",
            "votes": 1,  # Automatic upvote from submitter
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        feature_id = result.data[0]["id"]

        logger.info(
            f"Feature request submitted",
            extra={
                "user_id": user_id,
                "feature_id": feature_id,
                "title": request.title,
                "priority": request.priority
            }
        )

        return {
            "success": True,
            "message": "Thank you for the suggestion! We review all feature requests.",
            "feature_id": feature_id,
            "status": "new"
        }

    except Exception as e:
        logger.error(f"Failed to submit feature request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to submit feature request")


@router.post("/bug-report")
async def submit_bug_report(
    request: BugReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a bug report

    Bug reports help us improve product quality.
    """
    try:
        user_id = current_user.get("user_id")

        # Store in database
        result = supabase.table("feedback_bug_reports").insert({
            "user_id": user_id,
            "title": request.title,
            "description": request.description,
            "steps_to_reproduce": request.steps_to_reproduce,
            "severity": request.severity,
            "browser": request.browser,
            "device": request.device,
            "status": "new",
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        bug_id = result.data[0]["id"]

        logger.error(
            f"Bug report submitted",
            extra={
                "user_id": user_id,
                "bug_id": bug_id,
                "title": request.title,
                "severity": request.severity
            }
        )

        return {
            "success": True,
            "message": "Thank you for reporting this bug! We'll investigate ASAP." if request.severity in ["high", "critical"] else "Thank you for reporting this bug!",
            "bug_id": bug_id,
            "status": "new",
            "eta": "We typically respond within 24-48 hours"
        }

    except Exception as e:
        logger.error(f"Failed to submit bug report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to submit bug report")


@router.get("/feature-requests")
async def get_feature_requests(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Get list of feature requests

    Users can see what others have requested and upvote.
    """
    try:
        query = supabase.table("feedback_feature_requests").select("*")

        if status:
            query = query.eq("status", status)

        query = query.order("votes", desc=True).limit(limit)
        result = query.execute()

        return {
            "success": True,
            "feature_requests": result.data,
            "total": len(result.data)
        }

    except Exception as e:
        logger.error(f"Failed to get feature requests: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch feature requests")


# ============================================================================
# USER INTERVIEW SCHEDULING
# ============================================================================

@router.post("/interview/request")
async def request_interview(
    request: InterviewBookingRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Request a user interview

    We conduct user interviews to deeply understand your needs.
    **Incentive**: $25 Amazon gift card or 1 month free subscription
    """
    try:
        user_id = current_user.get("user_id")
        email = current_user.get("email")

        # Store interview request
        result = supabase.table("feedback_interview_requests").insert({
            "user_id": user_id,
            "email": email,
            "preferred_times": request.preferred_times,
            "topics": request.topics,
            "duration_minutes": request.duration_minutes,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        request_id = result.data[0]["id"]

        logger.info(
            f"Interview requested",
            extra={
                "user_id": user_id,
                "request_id": request_id,
                "email": email
            }
        )

        # TODO: Send email to team about interview request
        # TODO: Send confirmation email to user

        return {
            "success": True,
            "message": "Thank you! We'll reach out within 24 hours to schedule your interview.",
            "request_id": request_id,
            "incentive": "$25 Amazon gift card or 1 month free subscription",
            "what_to_expect": "30-minute casual conversation about your real estate investing process. No sales pitch!"
        }

    except Exception as e:
        logger.error(f"Failed to request interview: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to request interview")


# ============================================================================
# OVERALL FEEDBACK ANALYTICS
# ============================================================================

@router.get("/analytics/overview")
async def get_feedback_overview(current_user: dict = Depends(get_current_user)):
    """
    Get overall feedback analytics overview

    Aggregates all feedback signals into one dashboard.
    """
    try:
        # Get counts
        total_csat = supabase.table("feedback_surveys").select("id", count="exact").eq("survey_type", "csat").execute()
        total_nps = supabase.table("feedback_surveys").select("id", count="exact").eq("survey_type", "nps").execute()
        total_pmf = supabase.table("feedback_surveys").select("id", count="exact").eq("survey_type", "pmf").execute()
        total_features = supabase.table("feedback_feature_requests").select("id", count="exact").execute()
        total_bugs = supabase.table("feedback_bug_reports").select("id", count="exact").execute()
        total_interviews = supabase.table("feedback_interview_requests").select("id", count="exact").execute()

        return {
            "success": True,
            "overview": {
                "csat_responses": total_csat.count or 0,
                "nps_responses": total_nps.count or 0,
                "pmf_responses": total_pmf.count or 0,
                "feature_requests": total_features.count or 0,
                "bug_reports": total_bugs.count or 0,
                "interview_requests": total_interviews.count or 0,
                "total_feedback_items": (total_csat.count or 0) + (total_nps.count or 0) + (total_pmf.count or 0) + (total_features.count or 0) + (total_bugs.count or 0)
            },
            "message": "Feedback collection system operational" if total_csat.count or 0 > 0 else "No feedback collected yet"
        }

    except Exception as e:
        logger.error(f"Failed to get feedback overview: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch overview")


# Health check
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "feedback",
        "version": "1.0.0"
    }
