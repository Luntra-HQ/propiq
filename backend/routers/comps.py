"""
Comps Analysis Router - Pillar 4: Platform Expansion
Provides comparable properties analysis and market insights
"""

import logging
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
import random

from auth import verify_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/comps", tags=["Comparable Properties"])

# ============================================================================
# Pydantic Models
# ============================================================================

class ComparableProperty(BaseModel):
    """A comparable property for analysis"""
    address: str
    city: str
    state: str
    zipCode: str
    distance: float  # miles from subject property

    # Property details
    propertyType: str
    bedrooms: int
    bathrooms: float
    sqft: int
    lotSize: Optional[int] = None
    yearBuilt: int

    # Sale/listing info
    listPrice: Optional[int] = None
    salePrice: Optional[int] = None
    saleDate: Optional[str] = None
    daysOnMarket: Optional[int] = None
    status: str  # "sold" | "active" | "pending"

    # Calculated metrics
    pricePerSqft: float

    # Similarity score (0-100)
    similarityScore: int


class MarketMetrics(BaseModel):
    """Market-level metrics for an area"""
    medianListPrice: int
    medianSalePrice: int
    medianPricePerSqft: float
    avgDaysOnMarket: int
    inventoryCount: int
    monthsOfSupply: float
    priceChange30Day: float  # percentage
    priceChange90Day: float
    priceChangeYoY: float
    marketTemperature: str  # "hot" | "warm" | "balanced" | "cool" | "cold"
    buyerSellerRatio: float  # > 1 = seller's market


class CompsAnalysisResponse(BaseModel):
    """Full comps analysis response"""
    success: bool
    subjectProperty: dict
    comparables: List[ComparableProperty]
    marketMetrics: MarketMetrics
    estimatedValue: int
    estimatedValueLow: int
    estimatedValueHigh: int
    confidence: int  # 0-100
    methodology: str
    analyzedAt: str


class MarketReportResponse(BaseModel):
    """Market report for a specific area"""
    success: bool
    area: str
    areaType: str  # "zipcode" | "city" | "county"
    metrics: MarketMetrics
    trends: dict
    forecast: dict
    generatedAt: str


# ============================================================================
# Helper Functions
# ============================================================================

def generate_comps(
    address: str,
    city: str,
    state: str,
    zipcode: str,
    property_type: str,
    bedrooms: int,
    bathrooms: float,
    sqft: int,
    year_built: int,
    target_price: Optional[int] = None
) -> List[ComparableProperty]:
    """
    Generate comparable properties based on subject property characteristics.
    In production, this would call Zillow/Redfin/MLS APIs.
    """
    # Use address hash for consistent random generation
    seed = int(hashlib.md5(address.encode()).hexdigest()[:8], 16)
    random.seed(seed)

    # Base price estimation if not provided
    if not target_price:
        base_price = sqft * random.randint(150, 350)
    else:
        base_price = target_price

    # Street names for variety
    street_names = [
        "Oak", "Maple", "Cedar", "Pine", "Elm", "Birch", "Walnut",
        "Cherry", "Willow", "Magnolia", "Cypress", "Aspen"
    ]
    street_types = ["St", "Ave", "Dr", "Ln", "Ct", "Way", "Blvd", "Pl"]

    comps = []
    num_comps = random.randint(5, 8)

    for i in range(num_comps):
        # Vary characteristics slightly
        comp_sqft = sqft + random.randint(-300, 300)
        comp_beds = max(1, bedrooms + random.randint(-1, 1))
        comp_baths = max(1, bathrooms + random.choice([-0.5, 0, 0.5]))
        comp_year = year_built + random.randint(-10, 10)

        # Distance (closer = more similar)
        distance = round(random.uniform(0.2, 2.5), 1)

        # Price variation based on characteristics
        price_factor = 1.0
        price_factor += (comp_sqft - sqft) / sqft * 0.8
        price_factor += (comp_beds - bedrooms) * 0.03
        price_factor += (comp_baths - bathrooms) * 0.02
        price_factor += (comp_year - year_built) * 0.002
        price_factor += random.uniform(-0.1, 0.1)  # Market variation

        comp_price = int(base_price * price_factor)

        # Status distribution
        status_weights = [("sold", 0.6), ("active", 0.25), ("pending", 0.15)]
        status = random.choices(
            [s[0] for s in status_weights],
            weights=[s[1] for s in status_weights]
        )[0]

        # Sale date for sold properties
        sale_date = None
        days_on_market = None
        if status == "sold":
            days_ago = random.randint(14, 180)
            sale_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            days_on_market = random.randint(7, 90)
        elif status == "active":
            days_on_market = random.randint(1, 60)

        # Calculate similarity score
        similarity = 100
        similarity -= abs(comp_sqft - sqft) / sqft * 30
        similarity -= abs(comp_beds - bedrooms) * 5
        similarity -= abs(comp_baths - bathrooms) * 3
        similarity -= distance * 5
        similarity -= abs(comp_year - year_built) * 0.5
        similarity = max(50, min(100, int(similarity)))

        # Generate address
        street_num = random.randint(100, 9999)
        street_name = random.choice(street_names)
        street_type = random.choice(street_types)

        comp = ComparableProperty(
            address=f"{street_num} {street_name} {street_type}",
            city=city,
            state=state,
            zipCode=zipcode,
            distance=distance,
            propertyType=property_type,
            bedrooms=comp_beds,
            bathrooms=comp_baths,
            sqft=comp_sqft,
            yearBuilt=comp_year,
            listPrice=comp_price if status == "active" else int(comp_price * 1.02),
            salePrice=comp_price if status == "sold" else None,
            saleDate=sale_date,
            daysOnMarket=days_on_market,
            status=status,
            pricePerSqft=round(comp_price / comp_sqft, 2),
            similarityScore=similarity
        )
        comps.append(comp)

    # Sort by similarity score
    comps.sort(key=lambda x: x.similarityScore, reverse=True)

    return comps


def calculate_market_metrics(city: str, state: str, zipcode: str) -> MarketMetrics:
    """
    Calculate market metrics for an area.
    In production, this would aggregate real market data.
    """
    # Use zipcode for consistent generation
    seed = int(hashlib.md5(zipcode.encode()).hexdigest()[:8], 16)
    random.seed(seed)

    # Base metrics with realistic ranges
    median_list = random.randint(250000, 800000)
    median_sale = int(median_list * random.uniform(0.95, 1.02))
    avg_sqft_price = random.randint(150, 400)
    avg_dom = random.randint(15, 90)
    inventory = random.randint(50, 500)

    # Calculate months of supply (< 4 = seller's market, > 6 = buyer's market)
    monthly_sales = random.randint(20, 100)
    months_supply = round(inventory / monthly_sales, 1)

    # Price trends
    price_30d = random.uniform(-3, 5)
    price_90d = random.uniform(-5, 10)
    price_yoy = random.uniform(-8, 15)

    # Market temperature based on metrics
    if months_supply < 2 and avg_dom < 20:
        temperature = "hot"
    elif months_supply < 4 and avg_dom < 40:
        temperature = "warm"
    elif months_supply < 6:
        temperature = "balanced"
    elif months_supply < 8:
        temperature = "cool"
    else:
        temperature = "cold"

    # Buyer/seller ratio
    buyer_seller = round(1 / (months_supply / 5), 2) if months_supply > 0 else 2.0

    return MarketMetrics(
        medianListPrice=median_list,
        medianSalePrice=median_sale,
        medianPricePerSqft=avg_sqft_price,
        avgDaysOnMarket=avg_dom,
        inventoryCount=inventory,
        monthsOfSupply=months_supply,
        priceChange30Day=round(price_30d, 1),
        priceChange90Day=round(price_90d, 1),
        priceChangeYoY=round(price_yoy, 1),
        marketTemperature=temperature,
        buyerSellerRatio=buyer_seller
    )


def estimate_value(comps: List[ComparableProperty], sqft: int) -> tuple:
    """
    Estimate property value based on comparables.
    Uses weighted average based on similarity scores.
    """
    if not comps:
        return 0, 0, 0, 0

    # Filter to sold comps for valuation
    sold_comps = [c for c in comps if c.status == "sold" and c.salePrice]

    if not sold_comps:
        # Fall back to all comps with list prices
        sold_comps = [c for c in comps if c.listPrice]

    if not sold_comps:
        return 0, 0, 0, 0

    # Weighted average by similarity score
    total_weight = sum(c.similarityScore for c in sold_comps)

    if total_weight == 0:
        return 0, 0, 0, 0

    # Calculate weighted price per sqft
    weighted_ppsf = sum(
        c.pricePerSqft * c.similarityScore for c in sold_comps
    ) / total_weight

    # Estimate value
    estimated = int(weighted_ppsf * sqft)

    # Calculate range (typically +/- 5-10%)
    variance = 0.07  # 7% variance
    low = int(estimated * (1 - variance))
    high = int(estimated * (1 + variance))

    # Confidence based on number and quality of comps
    confidence = min(95, 60 + len(sold_comps) * 3 + sum(c.similarityScore for c in sold_comps[:3]) / 10)

    return estimated, low, high, int(confidence)


# ============================================================================
# API Endpoints
# ============================================================================

@router.get("/analyze", response_model=CompsAnalysisResponse)
async def analyze_comps(
    address: str = Query(..., description="Subject property address"),
    city: str = Query(..., description="City"),
    state: str = Query(..., description="State"),
    zipcode: str = Query(..., description="ZIP code"),
    property_type: str = Query("single_family", description="Property type"),
    bedrooms: int = Query(3, description="Number of bedrooms"),
    bathrooms: float = Query(2.0, description="Number of bathrooms"),
    sqft: int = Query(1500, description="Square footage"),
    year_built: int = Query(2000, description="Year built"),
    target_price: Optional[int] = Query(None, description="Target/asking price"),
    token_payload: dict = Depends(verify_token)
):
    """
    Analyze comparable properties for a subject property.
    Returns similar properties, market metrics, and value estimate.
    """
    try:
        logger.info(f"Comps analysis requested for: {address}")

        # Generate comparable properties
        comps = generate_comps(
            address=address,
            city=city,
            state=state,
            zipcode=zipcode,
            property_type=property_type,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            sqft=sqft,
            year_built=year_built,
            target_price=target_price
        )

        # Get market metrics
        market_metrics = calculate_market_metrics(city, state, zipcode)

        # Estimate value
        estimated, low, high, confidence = estimate_value(comps, sqft)

        # Build subject property info
        subject = {
            "address": address,
            "city": city,
            "state": state,
            "zipCode": zipcode,
            "propertyType": property_type,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "sqft": sqft,
            "yearBuilt": year_built,
            "targetPrice": target_price
        }

        return CompsAnalysisResponse(
            success=True,
            subjectProperty=subject,
            comparables=comps,
            marketMetrics=market_metrics,
            estimatedValue=estimated,
            estimatedValueLow=low,
            estimatedValueHigh=high,
            confidence=confidence,
            methodology="Weighted comparable sales analysis with market adjustment",
            analyzedAt=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"Comps analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/market-report", response_model=MarketReportResponse)
async def get_market_report(
    zipcode: Optional[str] = Query(None, description="ZIP code"),
    city: Optional[str] = Query(None, description="City"),
    state: Optional[str] = Query(None, description="State"),
    token_payload: dict = Depends(verify_token)
):
    """
    Get market report for a specific area.
    """
    if not zipcode and not (city and state):
        raise HTTPException(
            status_code=400,
            detail="Either zipcode or city+state is required"
        )

    try:
        # Determine area type and name
        if zipcode:
            area = zipcode
            area_type = "zipcode"
            lookup_zip = zipcode
        else:
            area = f"{city}, {state}"
            area_type = "city"
            lookup_zip = hashlib.md5(f"{city}{state}".encode()).hexdigest()[:5]

        # Get market metrics
        metrics = calculate_market_metrics(
            city or "Unknown",
            state or "XX",
            lookup_zip
        )

        # Generate trend data
        seed = int(hashlib.md5(lookup_zip.encode()).hexdigest()[:8], 16)
        random.seed(seed)

        # Monthly trends (last 12 months)
        trends = {
            "medianPrice": [],
            "inventory": [],
            "daysOnMarket": []
        }

        base_price = metrics.medianSalePrice
        base_inventory = metrics.inventoryCount
        base_dom = metrics.avgDaysOnMarket

        for i in range(12, 0, -1):
            month_date = (datetime.now() - timedelta(days=30*i)).strftime("%Y-%m")
            price_var = random.uniform(-0.03, 0.03)
            inv_var = random.uniform(-0.1, 0.1)
            dom_var = random.uniform(-0.15, 0.15)

            trends["medianPrice"].append({
                "month": month_date,
                "value": int(base_price * (1 + price_var * (12 - i) / 12))
            })
            trends["inventory"].append({
                "month": month_date,
                "value": int(base_inventory * (1 + inv_var))
            })
            trends["daysOnMarket"].append({
                "month": month_date,
                "value": int(base_dom * (1 + dom_var))
            })

        # Forecast (next 6 months)
        forecast = {
            "priceDirection": "up" if metrics.priceChangeYoY > 2 else "down" if metrics.priceChangeYoY < -2 else "stable",
            "expectedPriceChange": round(metrics.priceChangeYoY / 2, 1),  # 6 month projection
            "marketOutlook": "seller's market" if metrics.buyerSellerRatio > 1.2 else "buyer's market" if metrics.buyerSellerRatio < 0.8 else "balanced market",
            "confidence": random.randint(65, 85)
        }

        return MarketReportResponse(
            success=True,
            area=area,
            areaType=area_type,
            metrics=metrics,
            trends=trends,
            forecast=forecast,
            generatedAt=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"Market report failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "comps-analysis",
        "timestamp": datetime.now().isoformat()
    }
