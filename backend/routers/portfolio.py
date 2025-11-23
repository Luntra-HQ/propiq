"""
Portfolio Tracking & Deal Alerts API
Pillar 3: Intelligence Layer - Track properties, monitor portfolio, get deal alerts

Endpoints:
- POST/GET/PUT/DELETE /portfolio/properties - Manage saved properties
- GET /portfolio/summary - Get portfolio summary and metrics
- GET /portfolio/history - Get historical portfolio data
- POST/GET/PUT/DELETE /portfolio/alerts - Manage deal alerts
- GET /portfolio/notifications - Get user notifications
"""

from fastapi import APIRouter, HTTPException, Header, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
import os
import jwt
from config.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/portfolio", tags=["Portfolio & Alerts"])

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

# Supabase setup
try:
    from database_supabase import get_supabase_client
    supabase = get_supabase_client()
    DATABASE_AVAILABLE = True
except Exception as e:
    logger.warning(f"Database not available for portfolio: {e}")
    DATABASE_AVAILABLE = False
    supabase = None


# ============================================================================
# Request/Response Models
# ============================================================================

class SavedPropertyRequest(BaseModel):
    """Request to save/update a property"""
    address: str = Field(..., min_length=5, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    zip_code: Optional[str] = Field(None, max_length=20)
    purchase_price: Optional[float] = Field(None, ge=0)
    current_value: Optional[float] = Field(None, ge=0)
    monthly_rent: Optional[float] = Field(None, ge=0)
    status: str = Field("watching", description="watching|owned|under_contract|sold")
    property_type: Optional[str] = Field(None)
    analysis_id: Optional[str] = Field(None)
    deal_score: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = Field(None, max_length=2000)
    tags: Optional[List[str]] = Field(None)
    purchase_date: Optional[str] = Field(None)


class SavedProperty(BaseModel):
    """Saved property response"""
    id: str
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    status: str
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    monthly_rent: Optional[float] = None
    deal_score: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    created_at: str
    updated_at: str


class PortfolioSummary(BaseModel):
    """Portfolio summary metrics"""
    total_properties: int
    owned_count: int
    watching_count: int
    total_value: float
    total_equity: float
    total_monthly_rent: float
    avg_deal_score: Optional[float] = None
    portfolio_score: Optional[float] = None


class DealAlertRequest(BaseModel):
    """Request to create/update a deal alert"""
    name: str = Field(..., min_length=1, max_length=100)
    is_active: bool = Field(True)
    cities: Optional[List[str]] = Field(None)
    states: Optional[List[str]] = Field(None)
    zip_codes: Optional[List[str]] = Field(None)
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    min_deal_score: Optional[float] = Field(None, ge=0, le=100)
    min_cap_rate: Optional[float] = Field(None, ge=0)
    min_cash_flow: Optional[float] = Field(None)
    property_types: Optional[List[str]] = Field(None)
    notify_email: bool = Field(True)
    notify_in_app: bool = Field(True)
    frequency: str = Field("daily", description="instant|daily|weekly")


class DealAlert(BaseModel):
    """Deal alert response"""
    id: str
    name: str
    is_active: bool
    cities: Optional[List[str]] = None
    states: Optional[List[str]] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_deal_score: Optional[float] = None
    frequency: str
    match_count: int
    created_at: str


class Notification(BaseModel):
    """User notification"""
    id: str
    type: str
    title: str
    message: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: str


# ============================================================================
# Auth Helper
# ============================================================================

def verify_token(authorization: str = Header(None)) -> dict:
    """Verify JWT token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT configuration error")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")


# ============================================================================
# Saved Properties Endpoints
# ============================================================================

@router.post("/properties")
async def save_property(
    request: SavedPropertyRequest,
    token_payload: dict = Depends(verify_token)
):
    """Save a property to the user's portfolio"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Check if property already exists for this user
        existing = supabase.table("saved_properties").select("id").eq(
            "user_id", user_id
        ).eq("address", request.address).execute()

        if existing.data:
            raise HTTPException(
                status_code=409,
                detail="Property already saved. Use PUT to update."
            )

        # Parse purchase date if provided
        purchase_date = None
        if request.purchase_date:
            try:
                purchase_date = datetime.fromisoformat(request.purchase_date).isoformat()
            except ValueError:
                pass

        # Create saved property
        property_data = {
            "user_id": user_id,
            "address": request.address,
            "city": request.city,
            "state": request.state,
            "zip_code": request.zip_code,
            "purchase_price": request.purchase_price,
            "current_value": request.current_value or request.purchase_price,
            "monthly_rent": request.monthly_rent,
            "status": request.status,
            "property_type": request.property_type,
            "analysis_id": request.analysis_id,
            "deal_score": request.deal_score,
            "notes": request.notes,
            "tags": request.tags,
            "purchase_date": purchase_date,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        result = supabase.table("saved_properties").insert(property_data).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save property")

        logger.info(f"Property saved: {request.address} by user {user_id}")

        return {
            "success": True,
            "property": result.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving property: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/properties")
async def list_saved_properties(
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    token_payload: dict = Depends(verify_token)
):
    """List user's saved properties"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Build query
        query = supabase.table("saved_properties").select("*").eq("user_id", user_id)

        if status:
            query = query.eq("status", status)

        # Get total count
        count_query = supabase.table("saved_properties").select(
            "id", count="exact"
        ).eq("user_id", user_id)
        if status:
            count_query = count_query.eq("status", status)
        count_result = count_query.execute()
        total = count_result.count or 0

        # Fetch paginated
        offset = (page - 1) * page_size
        result = query.order("created_at", desc=True).range(
            offset, offset + page_size - 1
        ).execute()

        return {
            "success": True,
            "properties": result.data,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size
            }
        }

    except Exception as e:
        logger.error(f"Error listing properties: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/properties/{property_id}")
async def update_saved_property(
    property_id: str,
    request: SavedPropertyRequest,
    token_payload: dict = Depends(verify_token)
):
    """Update a saved property"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Verify ownership
        existing = supabase.table("saved_properties").select("*").eq(
            "id", property_id
        ).eq("user_id", user_id).execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Property not found")

        # Update property
        update_data = {
            "address": request.address,
            "city": request.city,
            "state": request.state,
            "zip_code": request.zip_code,
            "purchase_price": request.purchase_price,
            "current_value": request.current_value,
            "monthly_rent": request.monthly_rent,
            "status": request.status,
            "property_type": request.property_type,
            "notes": request.notes,
            "tags": request.tags,
            "updated_at": datetime.utcnow().isoformat(),
        }

        result = supabase.table("saved_properties").update(update_data).eq(
            "id", property_id
        ).execute()

        return {
            "success": True,
            "property": result.data[0] if result.data else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating property: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/properties/{property_id}")
async def delete_saved_property(
    property_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Remove a property from portfolio"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Verify ownership
        existing = supabase.table("saved_properties").select("id").eq(
            "id", property_id
        ).eq("user_id", user_id).execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Property not found")

        # Delete
        supabase.table("saved_properties").delete().eq("id", property_id).execute()

        return {"success": True, "message": "Property removed from portfolio"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting property: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Portfolio Summary Endpoints
# ============================================================================

@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    token_payload: dict = Depends(verify_token)
):
    """Get portfolio summary and key metrics"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Fetch all user's properties
        result = supabase.table("saved_properties").select("*").eq(
            "user_id", user_id
        ).execute()

        properties = result.data or []

        # Calculate metrics
        total_properties = len(properties)
        owned = [p for p in properties if p.get("status") == "owned"]
        watching = [p for p in properties if p.get("status") == "watching"]

        total_value = sum(p.get("current_value") or p.get("purchase_price") or 0 for p in owned)
        total_equity = total_value * 0.25  # Assume 25% equity on average
        total_monthly_rent = sum(p.get("monthly_rent") or 0 for p in owned)

        # Calculate average deal score
        scores = [p.get("deal_score") for p in properties if p.get("deal_score")]
        avg_deal_score = sum(scores) / len(scores) if scores else None

        # Simple portfolio score calculation
        portfolio_score = None
        if owned:
            # Based on avg deal score, cash flow positivity, diversification
            score_component = (avg_deal_score or 50) * 0.4
            cash_flow_component = min(total_monthly_rent / max(len(owned), 1) / 10, 30)
            diversity_component = min(len(owned) * 5, 30)
            portfolio_score = round(score_component + cash_flow_component + diversity_component, 1)

        return PortfolioSummary(
            total_properties=total_properties,
            owned_count=len(owned),
            watching_count=len(watching),
            total_value=total_value,
            total_equity=total_equity,
            total_monthly_rent=total_monthly_rent,
            avg_deal_score=round(avg_deal_score, 1) if avg_deal_score else None,
            portfolio_score=portfolio_score
        )

    except Exception as e:
        logger.error(f"Error getting portfolio summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Deal Alerts Endpoints
# ============================================================================

@router.post("/alerts")
async def create_deal_alert(
    request: DealAlertRequest,
    token_payload: dict = Depends(verify_token)
):
    """Create a new deal alert"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")
    user_email = token_payload.get("email")

    try:
        # Limit alerts per user (e.g., 5 for free, 20 for paid)
        existing = supabase.table("deal_alerts").select("id", count="exact").eq(
            "user_id", user_id
        ).execute()

        if (existing.count or 0) >= 20:
            raise HTTPException(
                status_code=403,
                detail="Maximum number of alerts reached (20)"
            )

        # Create alert
        alert_data = {
            "user_id": user_id,
            "user_email": user_email,
            "name": request.name,
            "is_active": request.is_active,
            "cities": request.cities,
            "states": request.states,
            "zip_codes": request.zip_codes,
            "min_price": request.min_price,
            "max_price": request.max_price,
            "min_deal_score": request.min_deal_score,
            "min_cap_rate": request.min_cap_rate,
            "min_cash_flow": request.min_cash_flow,
            "property_types": request.property_types,
            "notify_email": request.notify_email,
            "notify_in_app": request.notify_in_app,
            "frequency": request.frequency,
            "match_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        result = supabase.table("deal_alerts").insert(alert_data).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create alert")

        logger.info(f"Deal alert created: {request.name} by user {user_id}")

        return {
            "success": True,
            "alert": result.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts")
async def list_deal_alerts(
    token_payload: dict = Depends(verify_token)
):
    """List user's deal alerts"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        result = supabase.table("deal_alerts").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).execute()

        return {
            "success": True,
            "alerts": result.data or []
        }

    except Exception as e:
        logger.error(f"Error listing alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/alerts/{alert_id}")
async def update_deal_alert(
    alert_id: str,
    request: DealAlertRequest,
    token_payload: dict = Depends(verify_token)
):
    """Update a deal alert"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Verify ownership
        existing = supabase.table("deal_alerts").select("id").eq(
            "id", alert_id
        ).eq("user_id", user_id).execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Alert not found")

        # Update
        update_data = {
            "name": request.name,
            "is_active": request.is_active,
            "cities": request.cities,
            "states": request.states,
            "zip_codes": request.zip_codes,
            "min_price": request.min_price,
            "max_price": request.max_price,
            "min_deal_score": request.min_deal_score,
            "min_cap_rate": request.min_cap_rate,
            "min_cash_flow": request.min_cash_flow,
            "property_types": request.property_types,
            "notify_email": request.notify_email,
            "notify_in_app": request.notify_in_app,
            "frequency": request.frequency,
            "updated_at": datetime.utcnow().isoformat(),
        }

        result = supabase.table("deal_alerts").update(update_data).eq(
            "id", alert_id
        ).execute()

        return {
            "success": True,
            "alert": result.data[0] if result.data else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/alerts/{alert_id}")
async def delete_deal_alert(
    alert_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Delete a deal alert"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        # Verify ownership
        existing = supabase.table("deal_alerts").select("id").eq(
            "id", alert_id
        ).eq("user_id", user_id).execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Alert not found")

        # Delete alert and its matches
        supabase.table("alert_matches").delete().eq("alert_id", alert_id).execute()
        supabase.table("deal_alerts").delete().eq("id", alert_id).execute()

        return {"success": True, "message": "Alert deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Notifications Endpoints
# ============================================================================

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    token_payload: dict = Depends(verify_token)
):
    """Get user notifications"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        query = supabase.table("notifications").select("*").eq("user_id", user_id)

        if unread_only:
            query = query.eq("is_read", False)

        # Count
        count_query = supabase.table("notifications").select(
            "id", count="exact"
        ).eq("user_id", user_id)
        if unread_only:
            count_query = count_query.eq("is_read", False)
        count_result = count_query.execute()
        total = count_result.count or 0

        # Fetch
        offset = (page - 1) * page_size
        result = query.order("created_at", desc=True).range(
            offset, offset + page_size - 1
        ).execute()

        # Count unread
        unread_result = supabase.table("notifications").select(
            "id", count="exact"
        ).eq("user_id", user_id).eq("is_read", False).execute()

        return {
            "success": True,
            "notifications": result.data or [],
            "unread_count": unread_result.count or 0,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total
            }
        }

    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    token_payload: dict = Depends(verify_token)
):
    """Mark a notification as read"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        supabase.table("notifications").update({
            "is_read": True,
            "read_at": datetime.utcnow().isoformat()
        }).eq("id", notification_id).eq("user_id", user_id).execute()

        return {"success": True}

    except Exception as e:
        logger.error(f"Error marking notification read: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/notifications/read-all")
async def mark_all_notifications_read(
    token_payload: dict = Depends(verify_token)
):
    """Mark all notifications as read"""
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = token_payload.get("sub")

    try:
        supabase.table("notifications").update({
            "is_read": True,
            "read_at": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).eq("is_read", False).execute()

        return {"success": True, "message": "All notifications marked as read"}

    except Exception as e:
        logger.error(f"Error marking all notifications read: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Health Check
# ============================================================================

@router.get("/health")
async def health_check():
    """Health check endpoint for Portfolio API"""
    return {
        "status": "healthy" if DATABASE_AVAILABLE else "degraded",
        "database_available": DATABASE_AVAILABLE,
        "features": {
            "saved_properties": DATABASE_AVAILABLE,
            "portfolio_summary": DATABASE_AVAILABLE,
            "deal_alerts": DATABASE_AVAILABLE,
            "notifications": DATABASE_AVAILABLE
        }
    }
