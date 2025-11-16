"""
Support Analytics API for PropIQ
Phase 3: Comprehensive analytics dashboard endpoints

Provides:
- Conversation statistics (volume, sentiment, intent distribution)
- Agent performance metrics
- CSAT analytics (ratings, NPS, feedback trends)
- Escalation analytics
- Response time metrics
- Topic trends and insights
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

# Database
try:
    from database_supabase import get_supabase_client
    supabase = get_supabase_client()
    DATABASE_AVAILABLE = True
except Exception as e:
    print(f"⚠️  Database not available: {e}")
    DATABASE_AVAILABLE = False
    supabase = None

# Auth
try:
    from auth import verify_token
except:
    def verify_token(authorization: str = None):
        return {"sub": "admin", "email": "admin@propiq.com", "role": "admin"}

router = APIRouter(prefix="/analytics", tags=["analytics"])


# Models
class DateRange(str, Enum):
    """Predefined date ranges"""
    TODAY = "today"
    YESTERDAY = "yesterday"
    LAST_7_DAYS = "last_7_days"
    LAST_30_DAYS = "last_30_days"
    LAST_90_DAYS = "last_90_days"
    THIS_MONTH = "this_month"
    LAST_MONTH = "last_month"


class ConversationStats(BaseModel):
    """Conversation statistics"""
    total_conversations: int
    active_conversations: int
    resolved_conversations: int
    escalated_conversations: int
    avg_messages_per_conversation: float
    avg_resolution_time_minutes: Optional[float]


class SentimentDistribution(BaseModel):
    """Sentiment distribution"""
    positive: int
    neutral: int
    negative: int
    mixed: int


class IntentDistribution(BaseModel):
    """Intent distribution with metrics"""
    intent: str
    count: int
    escalation_rate: float
    avg_resolution_time_minutes: Optional[float]


class CSATMetrics(BaseModel):
    """CSAT metrics"""
    total_surveys_sent: int
    total_responses: int
    response_rate: float
    avg_rating: float
    nps: float
    rating_distribution: Dict[int, int]


class AgentPerformance(BaseModel):
    """Agent performance metrics"""
    agent_email: str
    agent_name: str
    assigned_conversations: int
    resolved_conversations: int
    resolution_rate: float
    avg_resolution_time_minutes: Optional[float]
    avg_csat_rating: Optional[float]


class TopicTrend(BaseModel):
    """Topic/keyword trend"""
    topic: str
    count: int
    trend: str  # "up", "down", "stable"
    change_percent: Optional[float]


class TimeSeriesDataPoint(BaseModel):
    """Time series data point"""
    date: str
    value: float
    label: Optional[str]


# Helper functions
def get_date_range(range_type: DateRange) -> tuple[datetime, datetime]:
    """Get start and end dates for predefined range"""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    if range_type == DateRange.TODAY:
        return today_start, now

    elif range_type == DateRange.YESTERDAY:
        yesterday_start = today_start - timedelta(days=1)
        return yesterday_start, today_start

    elif range_type == DateRange.LAST_7_DAYS:
        return now - timedelta(days=7), now

    elif range_type == DateRange.LAST_30_DAYS:
        return now - timedelta(days=30), now

    elif range_type == DateRange.LAST_90_DAYS:
        return now - timedelta(days=90), now

    elif range_type == DateRange.THIS_MONTH:
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return month_start, now

    elif range_type == DateRange.LAST_MONTH:
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_end = month_start - timedelta(seconds=1)
        last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return last_month_start, last_month_end

    else:
        return now - timedelta(days=30), now


# Endpoints

@router.get("/overview")
async def get_analytics_overview(
    date_range: DateRange = Query(DateRange.LAST_30_DAYS),
    token_payload: dict = Depends(verify_token)
):
    """
    Get high-level analytics overview

    Returns:
        Overview statistics for dashboard
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    start_date, end_date = get_date_range(date_range)

    try:
        # Get conversation stats
        conv_result = supabase.table("support_conversations_v2").select("*").gte(
            "created_at", start_date.isoformat()
        ).lte("created_at", end_date.isoformat()).execute()

        conversations = conv_result.data if conv_result.data else []

        total_conversations = len(conversations)
        active = sum(1 for c in conversations if c.get("status") == "active")
        resolved = sum(1 for c in conversations if c.get("status") == "resolved")
        escalated = sum(1 for c in conversations if c.get("escalated") is True)

        # Calculate averages
        avg_messages = sum(len(c.get("messages", [])) for c in conversations) / total_conversations if total_conversations > 0 else 0

        # Resolution time (only for resolved conversations)
        resolution_times = []
        for c in conversations:
            if c.get("resolved_at") and c.get("created_at"):
                created = datetime.fromisoformat(c["created_at"])
                resolved_at = datetime.fromisoformat(c["resolved_at"])
                resolution_times.append((resolved_at - created).total_seconds() / 60)

        avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else None

        # Sentiment distribution
        sentiment_dist = {
            "positive": sum(1 for c in conversations if c.get("sentiment") == "positive"),
            "neutral": sum(1 for c in conversations if c.get("sentiment") == "neutral"),
            "negative": sum(1 for c in conversations if c.get("sentiment") == "negative"),
            "mixed": sum(1 for c in conversations if c.get("sentiment") == "mixed")
        }

        # CSAT metrics (if available)
        csat_result = supabase.table("csat_surveys").select("*").gte(
            "created_at", start_date.isoformat()
        ).lte("created_at", end_date.isoformat()).execute()

        surveys = csat_result.data if csat_result.data else []
        responses = [s for s in surveys if s.get("status") == "completed"]

        csat_metrics = {
            "total_sent": len(surveys),
            "total_responses": len(responses),
            "response_rate": (len(responses) / len(surveys) * 100) if surveys else 0,
            "avg_rating": sum(r["rating"] for r in responses) / len(responses) if responses else 0
        }

        return {
            "date_range": date_range.value,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "conversations": {
                "total": total_conversations,
                "active": active,
                "resolved": resolved,
                "escalated": escalated,
                "avg_messages": round(avg_messages, 1),
                "avg_resolution_time_minutes": round(avg_resolution_time, 1) if avg_resolution_time else None
            },
            "sentiment": sentiment_dist,
            "csat": csat_metrics
        }

    except Exception as e:
        print(f"❌ Analytics overview error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/stats")
async def get_conversation_stats(
    date_range: DateRange = Query(DateRange.LAST_30_DAYS),
    token_payload: dict = Depends(verify_token)
):
    """Get detailed conversation statistics"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    start_date, end_date = get_date_range(date_range)

    try:
        # Use analytics view for efficiency
        result = supabase.rpc("get_conversation_stats", {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }).execute()

        # Fallback to manual calculation if RPC not available
        if not result.data:
            conv_result = supabase.table("support_conversations_v2").select("*").gte(
                "created_at", start_date.isoformat()
            ).lte("created_at", end_date.isoformat()).execute()

            conversations = conv_result.data if conv_result.data else []

            return {
                "total_conversations": len(conversations),
                "active_conversations": sum(1 for c in conversations if c.get("status") == "active"),
                "resolved_conversations": sum(1 for c in conversations if c.get("status") == "resolved"),
                "escalated_conversations": sum(1 for c in conversations if c.get("escalated")),
                "avg_messages_per_conversation": sum(len(c.get("messages", [])) for c in conversations) / len(conversations) if conversations else 0
            }

        return result.data[0] if result.data else {}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sentiment/distribution")
async def get_sentiment_distribution(
    date_range: DateRange = Query(DateRange.LAST_30_DAYS),
    token_payload: dict = Depends(verify_token)
):
    """Get sentiment distribution over time"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    start_date, end_date = get_date_range(date_range)

    try:
        result = supabase.table("support_conversations_v2").select(
            "sentiment, created_at"
        ).gte("created_at", start_date.isoformat()).lte(
            "created_at", end_date.isoformat()
        ).execute()

        conversations = result.data if result.data else []

        # Count by sentiment
        distribution = {
            "positive": sum(1 for c in conversations if c.get("sentiment") == "positive"),
            "neutral": sum(1 for c in conversations if c.get("sentiment") == "neutral"),
            "negative": sum(1 for c in conversations if c.get("sentiment") == "negative"),
            "mixed": sum(1 for c in conversations if c.get("sentiment") == "mixed")
        }

        # Calculate percentages
        total = sum(distribution.values())
        percentages = {k: round(v / total * 100, 1) if total > 0 else 0 for k, v in distribution.items()}

        return {
            "distribution": distribution,
            "percentages": percentages,
            "total": total
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/intents/distribution")
async def get_intent_distribution(
    date_range: DateRange = Query(DateRange.LAST_30_DAYS),
    token_payload: dict = Depends(verify_token)
):
    """Get intent distribution with escalation rates"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    start_date, end_date = get_date_range(date_range)

    try:
        # Use view if available
        result = supabase.table("support_analytics_intent_distribution").select("*").execute()

        if result.data:
            return {"intents": result.data}

        # Fallback to manual calculation
        conv_result = supabase.table("support_conversations_v2").select(
            "intent, escalated, resolved_at, created_at"
        ).gte("created_at", start_date.isoformat()).lte(
            "created_at", end_date.isoformat()).execute()

        conversations = conv_result.data if conv_result.data else []

        # Group by intent
        intent_stats = {}
        for conv in conversations:
            intent = conv.get("intent", "unknown")
            if intent not in intent_stats:
                intent_stats[intent] = {
                    "count": 0,
                    "escalated": 0,
                    "resolution_times": []
                }

            intent_stats[intent]["count"] += 1

            if conv.get("escalated"):
                intent_stats[intent]["escalated"] += 1

            if conv.get("resolved_at") and conv.get("created_at"):
                created = datetime.fromisoformat(conv["created_at"])
                resolved = datetime.fromisoformat(conv["resolved_at"])
                resolution_time = (resolved - created).total_seconds() / 60
                intent_stats[intent]["resolution_times"].append(resolution_time)

        # Calculate metrics
        intents = []
        for intent, stats in intent_stats.items():
            escalation_rate = (stats["escalated"] / stats["count"] * 100) if stats["count"] > 0 else 0
            avg_resolution_time = sum(stats["resolution_times"]) / len(stats["resolution_times"]) if stats["resolution_times"] else None

            intents.append({
                "intent": intent,
                "count": stats["count"],
                "escalation_rate": round(escalation_rate, 1),
                "avg_resolution_time_minutes": round(avg_resolution_time, 1) if avg_resolution_time else None
            })

        # Sort by count descending
        intents.sort(key=lambda x: x["count"], reverse=True)

        return {"intents": intents}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/csat/metrics")
async def get_csat_metrics(
    date_range: DateRange = Query(DateRange.LAST_30_DAYS),
    token_payload: dict = Depends(verify_token)
):
    """Get CSAT metrics and NPS"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    start_date, end_date = get_date_range(date_range)

    try:
        from utils.csat_surveys import CSATSurveyManager

        csat_manager = CSATSurveyManager(supabase)
        stats = csat_manager.get_survey_statistics(start_date, end_date)

        return stats

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agents/performance")
async def get_agent_performance(
    date_range: DateRange = Query(DateRange.LAST_30_DAYS),
    token_payload: dict = Depends(verify_token)
):
    """Get agent performance metrics"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Use view
        result = supabase.table("support_agent_performance").select("*").execute()

        if result.data:
            return {"agents": result.data}

        return {"agents": []}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/escalations/breakdown")
async def get_escalation_breakdown(
    date_range: DateRange = Query(DateRange.LAST_30_DAYS),
    token_payload: dict = Depends(verify_token)
):
    """Get escalation breakdown by reason"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        # Use view
        result = supabase.table("support_escalation_breakdown").select("*").execute()

        if result.data:
            return {"escalations": result.data}

        return {"escalations": []}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeseries/conversations")
async def get_conversation_timeseries(
    date_range: DateRange = Query(DateRange.LAST_30_DAYS),
    token_payload: dict = Depends(verify_token)
):
    """Get conversation volume time series"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    start_date, end_date = get_date_range(date_range)

    try:
        # Use daily analytics view
        result = supabase.table("support_analytics_daily").select("*").gte(
            "date", start_date.date().isoformat()
        ).lte("date", end_date.date().isoformat()).order("date").execute()

        data = result.data if result.data else []

        timeseries = [
            {
                "date": str(row["date"]),
                "total": row.get("total_conversations", 0),
                "escalated": row.get("escalated_count", 0),
                "resolved": row.get("resolved_count", 0)
            }
            for row in data
        ]

        return {"timeseries": timeseries}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeseries/csat")
async def get_csat_timeseries(
    date_range: DateRange = Query(DateRange.LAST_30_DAYS),
    token_payload: dict = Depends(verify_token)
):
    """Get CSAT rating time series"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    start_date, end_date = get_date_range(date_range)

    try:
        result = supabase.table("csat_surveys").select(
            "rating, responded_at"
        ).eq("status", "completed").gte(
            "responded_at", start_date.isoformat()
        ).lte("responded_at", end_date.isoformat()).order("responded_at").execute()

        surveys = result.data if result.data else []

        # Group by date
        daily_ratings = {}
        for survey in surveys:
            date_str = survey["responded_at"][:10]  # YYYY-MM-DD
            if date_str not in daily_ratings:
                daily_ratings[date_str] = []
            daily_ratings[date_str].append(survey["rating"])

        # Calculate daily averages
        timeseries = [
            {
                "date": date,
                "avg_rating": round(sum(ratings) / len(ratings), 2),
                "count": len(ratings)
            }
            for date, ratings in sorted(daily_ratings.items())
        ]

        return {"timeseries": timeseries}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for analytics API"""
    return {
        "status": "healthy" if DATABASE_AVAILABLE else "degraded",
        "database_available": DATABASE_AVAILABLE,
        "features": {
            "conversation_stats": True,
            "sentiment_analysis": True,
            "intent_distribution": True,
            "csat_metrics": True,
            "agent_performance": True,
            "escalation_breakdown": True,
            "timeseries_data": True
        }
    }
