"""
Enhanced Property Analysis History API
Advanced filtering, search, sorting, and export capabilities
"""

from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import json
import csv
import io
import os

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis-history"])


# ============================================================================
# ENUMS AND CONSTANTS
# ============================================================================

class SortField(str, Enum):
    """Available sort fields"""
    created_at = "created_at"
    address = "address"
    verdict = "verdict"
    value = "value"
    cap_rate = "cap_rate"


class SortOrder(str, Enum):
    """Sort order"""
    asc = "asc"
    desc = "desc"


class VerdictFilter(str, Enum):
    """Property verdict filters"""
    buy = "buy"
    strong_buy = "strong_buy"
    hold = "hold"
    avoid = "avoid"
    sell = "sell"


class PropertyTypeFilter(str, Enum):
    """Property type filters"""
    single_family = "Single Family"
    multi_family = "Multi-Family"
    commercial = "Commercial"
    condo = "Condo"
    townhouse = "Townhouse"


# ============================================================================
# AUTHENTICATION HELPER
# ============================================================================

async def get_current_user(authorization: str = None) -> dict:
    """Get current user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")

    try:
        import jwt
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        JWT_SECRET = os.getenv("JWT_SECRET")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

        from database_supabase import get_user_by_id
        user = await get_user_by_id(payload.get("sub"))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


# ============================================================================
# ENHANCED ANALYSIS HISTORY
# ============================================================================

@router.get("/history")
async def get_analysis_history(
    authorization: str = None,
    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    # Sorting
    sort_by: SortField = Query(SortField.created_at, description="Field to sort by"),
    sort_order: SortOrder = Query(SortOrder.desc, description="Sort order"),
    # Filtering
    verdict: Optional[VerdictFilter] = Query(None, description="Filter by verdict"),
    property_type: Optional[PropertyTypeFilter] = Query(None, description="Filter by property type"),
    min_value: Optional[float] = Query(None, description="Minimum property value"),
    max_value: Optional[float] = Query(None, description="Maximum property value"),
    min_cap_rate: Optional[float] = Query(None, description="Minimum cap rate"),
    max_cap_rate: Optional[float] = Query(None, description="Maximum cap rate"),
    city: Optional[str] = Query(None, description="Filter by city"),
    state: Optional[str] = Query(None, description="Filter by state"),
    # Date range
    date_from: Optional[str] = Query(None, description="Start date (ISO format)"),
    date_to: Optional[str] = Query(None, description="End date (ISO format)"),
    # Search
    search: Optional[str] = Query(None, description="Search in address")
):
    """
    Get enhanced property analysis history with filtering, sorting, and search

    Features:
    - Pagination
    - Multi-field sorting
    - Advanced filtering (verdict, property type, value range, cap rate)
    - Location filtering (city, state)
    - Date range filtering
    - Address search
    - Rich metadata

    Returns:
        Paginated list of analyses with filtering applied
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import supabase

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not available")

        # Build query
        query = supabase.table("property_analyses").select("*", count="exact").eq("user_id", user_id)

        # Apply filters
        if verdict:
            # Filter by verdict in JSON field
            query = query.filter("analysis_result->recommendation->>verdict", "eq", verdict.value)

        if property_type:
            query = query.filter("analysis_result->property->>property_type", "ilike", f"%{property_type.value}%")

        if city:
            query = query.filter("analysis_result->property->>city", "ilike", f"%{city}%")

        if state:
            query = query.filter("analysis_result->property->>state", "eq", state.upper())

        if search:
            query = query.ilike("address", f"%{search}%")

        if date_from:
            query = query.gte("created_at", date_from)

        if date_to:
            query = query.lte("created_at", date_to)

        # Apply sorting
        order_column = sort_by.value
        if sort_by == SortField.verdict:
            order_column = "analysis_result->recommendation->>verdict"
        elif sort_by == SortField.value:
            order_column = "analysis_result->market_analysis->>estimated_value"
        elif sort_by == SortField.cap_rate:
            order_column = "analysis_result->investment_metrics->>cap_rate"

        query = query.order(order_column, desc=(sort_order == SortOrder.desc))

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)

        # Execute query
        result = query.execute()

        analyses = result.data if result.data else []

        # Apply additional filters (for JSON fields that can't be filtered in SQL easily)
        filtered_analyses = []
        for analysis in analyses:
            # Value range filter
            if min_value is not None or max_value is not None:
                value = analysis.get("analysis_result", {}).get("market_analysis", {}).get("estimated_value")
                if value is not None:
                    if min_value and value < min_value:
                        continue
                    if max_value and value > max_value:
                        continue

            # Cap rate filter
            if min_cap_rate is not None or max_cap_rate is not None:
                cap_rate = analysis.get("analysis_result", {}).get("investment_metrics", {}).get("cap_rate")
                if cap_rate is not None:
                    if min_cap_rate and cap_rate < min_cap_rate:
                        continue
                    if max_cap_rate and cap_rate > max_cap_rate:
                        continue

            filtered_analyses.append(analysis)

        # Get total count
        total_count = result.count if hasattr(result, 'count') else len(filtered_analyses)

        return {
            "analyses": filtered_analyses,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total_count,
                "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 0,
                "has_next": page * page_size < total_count,
                "has_prev": page > 1
            },
            "filters_applied": {
                "verdict": verdict.value if verdict else None,
                "property_type": property_type.value if property_type else None,
                "value_range": [min_value, max_value] if (min_value or max_value) else None,
                "cap_rate_range": [min_cap_rate, max_cap_rate] if (min_cap_rate or max_cap_rate) else None,
                "location": {"city": city, "state": state} if (city or state) else None,
                "date_range": [date_from, date_to] if (date_from or date_to) else None,
                "search": search
            },
            "sort": {
                "field": sort_by.value,
                "order": sort_order.value
            }
        }

    except Exception as e:
        print(f"❌ Analysis history error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load analysis history: {str(e)}")


@router.get("/history/{analysis_id}")
async def get_analysis_details(
    analysis_id: str,
    authorization: str = None
):
    """
    Get detailed analysis by ID

    Returns:
        Complete analysis with all details
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import supabase

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not available")

        result = supabase.table("property_analyses") \
            .select("*") \
            .eq("id", analysis_id) \
            .eq("user_id", user_id) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Analysis not found")

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Analysis details error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load analysis: {str(e)}")


@router.delete("/history/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    authorization: str = None
):
    """
    Delete a property analysis

    Args:
        analysis_id: ID of the analysis to delete

    Returns:
        Confirmation of deletion
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import supabase

        if not supabase:
            raise HTTPException(status_code=500, detail="Database not available")

        # Verify ownership
        result = supabase.table("property_analyses") \
            .select("id") \
            .eq("id", analysis_id) \
            .eq("user_id", user_id) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Analysis not found")

        # Delete
        supabase.table("property_analyses") \
            .delete() \
            .eq("id", analysis_id) \
            .eq("user_id", user_id) \
            .execute()

        return {
            "success": True,
            "message": "Analysis deleted successfully",
            "analysis_id": analysis_id
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Analysis deletion error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")


# ============================================================================
# EXPORT FUNCTIONALITY
# ============================================================================

@router.get("/export/csv")
async def export_analyses_csv(
    authorization: str = None,
    # Filters (same as history endpoint)
    verdict: Optional[VerdictFilter] = Query(None),
    property_type: Optional[PropertyTypeFilter] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    """
    Export property analyses to CSV

    Args:
        Same filters as /history endpoint

    Returns:
        CSV file download
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import get_user_analyses

        # Get all analyses (no pagination for export)
        analyses = await get_user_analyses(user_id, limit=1000)

        # Apply filters
        filtered_analyses = []
        for analysis in analyses:
            # Apply same filters as history endpoint
            if verdict:
                analysis_verdict = analysis.get("analysis_result", {}).get("recommendation", {}).get("verdict")
                if analysis_verdict != verdict.value:
                    continue

            if property_type:
                analysis_type = analysis.get("analysis_result", {}).get("property", {}).get("property_type", "")
                if property_type.value not in analysis_type:
                    continue

            if date_from or date_to:
                created_at = datetime.fromisoformat(analysis["created_at"])
                if date_from and created_at < datetime.fromisoformat(date_from):
                    continue
                if date_to and created_at > datetime.fromisoformat(date_to):
                    continue

            filtered_analyses.append(analysis)

        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)

        # CSV Headers
        writer.writerow([
            "Date",
            "Address",
            "City",
            "State",
            "Property Type",
            "Estimated Value",
            "Cap Rate",
            "Cash on Cash Return",
            "Monthly Rental Income",
            "Monthly Expenses",
            "Net Cash Flow",
            "Verdict",
            "Confidence"
        ])

        # CSV Rows
        for analysis in filtered_analyses:
            result = analysis.get("analysis_result", {})
            property_info = result.get("property", {})
            market = result.get("market_analysis", {})
            metrics = result.get("investment_metrics", {})
            recommendation = result.get("recommendation", {})

            writer.writerow([
                analysis.get("created_at", "")[:10],  # Date only
                analysis.get("address", ""),
                property_info.get("city", ""),
                property_info.get("state", ""),
                property_info.get("property_type", ""),
                market.get("estimated_value", ""),
                metrics.get("cap_rate", ""),
                metrics.get("cash_on_cash_return", ""),
                metrics.get("monthly_rental_income", ""),
                metrics.get("monthly_expenses", ""),
                metrics.get("net_monthly_cashflow", ""),
                recommendation.get("verdict", ""),
                recommendation.get("confidence", "")
            ])

        # Return CSV file
        csv_content = output.getvalue()
        output.close()

        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=propiq_analyses_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )

    except Exception as e:
        print(f"❌ CSV export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export CSV: {str(e)}")


@router.get("/export/json")
async def export_analyses_json(
    authorization: str = None,
    verdict: Optional[VerdictFilter] = Query(None),
    property_type: Optional[PropertyTypeFilter] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    """
    Export property analyses to JSON

    Args:
        Same filters as /history endpoint

    Returns:
        JSON file download
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import get_user_analyses

        analyses = await get_user_analyses(user_id, limit=1000)

        # Apply filters (same logic as CSV export)
        filtered_analyses = []
        for analysis in analyses:
            if verdict:
                analysis_verdict = analysis.get("analysis_result", {}).get("recommendation", {}).get("verdict")
                if analysis_verdict != verdict.value:
                    continue

            if property_type:
                analysis_type = analysis.get("analysis_result", {}).get("property", {}).get("property_type", "")
                if property_type.value not in analysis_type:
                    continue

            if date_from or date_to:
                created_at = datetime.fromisoformat(analysis["created_at"])
                if date_from and created_at < datetime.fromisoformat(date_from):
                    continue
                if date_to and created_at > datetime.fromisoformat(date_to):
                    continue

            filtered_analyses.append(analysis)

        # Create JSON export
        export_data = {
            "export_date": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "total_analyses": len(filtered_analyses),
            "analyses": filtered_analyses
        }

        json_content = json.dumps(export_data, indent=2)

        return Response(
            content=json_content,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=propiq_analyses_{datetime.now().strftime('%Y%m%d')}.json"
            }
        )

    except Exception as e:
        print(f"❌ JSON export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export JSON: {str(e)}")


# ============================================================================
# STATISTICS AND SUMMARIES
# ============================================================================

@router.get("/summary")
async def get_analysis_summary(authorization: str = None):
    """
    Get summary statistics of all analyses

    Returns:
    - Total analyses
    - Verdict distribution
    - Property type distribution
    - Average metrics
    - Best/worst properties
    """
    user = await get_current_user(authorization)
    user_id = user["id"]

    try:
        from database_supabase import get_user_analyses

        analyses = await get_user_analyses(user_id, limit=1000)

        if not analyses:
            return {
                "total_analyses": 0,
                "message": "No analyses yet"
            }

        # Calculate statistics
        verdicts = []
        property_types = []
        cap_rates = []
        cash_flows = []

        for analysis in analyses:
            result = analysis.get("analysis_result", {})

            verdict = result.get("recommendation", {}).get("verdict")
            if verdict:
                verdicts.append(verdict)

            prop_type = result.get("property", {}).get("property_type")
            if prop_type:
                property_types.append(prop_type)

            cap_rate = result.get("investment_metrics", {}).get("cap_rate")
            if cap_rate is not None:
                cap_rates.append(cap_rate)

            cash_flow = result.get("investment_metrics", {}).get("net_monthly_cashflow")
            if cash_flow is not None:
                cash_flows.append(cash_flow)

        from collections import Counter

        return {
            "total_analyses": len(analyses),
            "verdict_distribution": dict(Counter(verdicts)),
            "property_type_distribution": dict(Counter(property_types)),
            "average_metrics": {
                "cap_rate": round(sum(cap_rates) / len(cap_rates), 2) if cap_rates else None,
                "monthly_cash_flow": round(sum(cash_flows) / len(cash_flows), 2) if cash_flows else None
            },
            "date_range": {
                "first_analysis": analyses[-1]["created_at"] if analyses else None,
                "last_analysis": analyses[0]["created_at"] if analyses else None
            }
        }

    except Exception as e:
        print(f"❌ Analysis summary error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/health")
async def analysis_history_health_check():
    """Health check for analysis history endpoints"""
    return {
        "status": "healthy",
        "features": {
            "pagination": True,
            "filtering": True,
            "sorting": True,
            "search": True,
            "export": ["CSV", "JSON"],
            "statistics": True
        },
        "endpoints": {
            "history": "/api/v1/analysis/history",
            "details": "/api/v1/analysis/history/{id}",
            "export_csv": "/api/v1/analysis/export/csv",
            "export_json": "/api/v1/analysis/export/json",
            "summary": "/api/v1/analysis/summary"
        }
    }
