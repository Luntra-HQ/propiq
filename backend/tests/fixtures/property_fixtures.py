"""
Property Analysis Test Fixtures
Provides realistic property data for testing PropIQ analysis features
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional


# ============================================================================
# PROPERTY ANALYSIS FIXTURES
# ============================================================================

def get_basic_property_analysis(
    user_id: str = None,
    address: str = "123 Main St, San Francisco, CA 94102"
) -> Dict[str, Any]:
    """
    Basic property analysis with standard PropIQ results

    Use case: Testing property analysis creation, retrieval
    """
    if user_id is None:
        user_id = str(uuid.uuid4())

    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "address": address,
        "analysis_result": {
            "property": {
                "address": address,
                "city": "San Francisco",
                "state": "CA",
                "zip": "94102",
                "property_type": "Single Family",
                "year_built": 1985,
                "bedrooms": 3,
                "bathrooms": 2,
                "sqft": 1800
            },
            "market_analysis": {
                "estimated_value": 1250000,
                "value_range": {
                    "low": 1150000,
                    "high": 1350000
                },
                "price_per_sqft": 694,
                "appreciation_rate": 5.2
            },
            "investment_metrics": {
                "cap_rate": 4.8,
                "cash_on_cash_return": 6.2,
                "roi_5_year": 28.5,
                "monthly_rental_income": 4500,
                "monthly_expenses": 2800,
                "net_monthly_cashflow": 1700
            },
            "risk_analysis": {
                "overall_score": 7.5,
                "market_volatility": "medium",
                "liquidity": "high",
                "regulatory_risk": "low"
            },
            "recommendation": {
                "verdict": "buy",
                "confidence": 0.82,
                "key_strengths": [
                    "Strong appreciation potential",
                    "High demand area",
                    "Positive cash flow"
                ],
                "key_risks": [
                    "High property taxes",
                    "Competition from investors"
                ]
            }
        },
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }


def get_commercial_property_analysis(user_id: str = None) -> Dict[str, Any]:
    """
    Commercial property analysis

    Use case: Testing commercial property features
    """
    if user_id is None:
        user_id = str(uuid.uuid4())

    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "address": "456 Market St, San Francisco, CA 94103",
        "analysis_result": {
            "property": {
                "address": "456 Market St, San Francisco, CA 94103",
                "city": "San Francisco",
                "state": "CA",
                "zip": "94103",
                "property_type": "Commercial - Office",
                "year_built": 2005,
                "total_units": 12,
                "sqft": 25000
            },
            "market_analysis": {
                "estimated_value": 8500000,
                "value_range": {
                    "low": 7800000,
                    "high": 9200000
                },
                "price_per_sqft": 340,
                "appreciation_rate": 3.8
            },
            "investment_metrics": {
                "cap_rate": 6.2,
                "cash_on_cash_return": 8.5,
                "roi_5_year": 42.0,
                "monthly_rental_income": 45000,
                "monthly_expenses": 18000,
                "net_monthly_cashflow": 27000
            },
            "risk_analysis": {
                "overall_score": 8.2,
                "market_volatility": "low",
                "liquidity": "medium",
                "regulatory_risk": "medium"
            },
            "recommendation": {
                "verdict": "strong_buy",
                "confidence": 0.89,
                "key_strengths": [
                    "Prime location",
                    "Long-term tenants",
                    "Strong cash flow",
                    "Low vacancy rate"
                ],
                "key_risks": [
                    "High initial investment",
                    "Office market uncertainty"
                ]
            }
        },
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }


def get_multi_family_property_analysis(user_id: str = None) -> Dict[str, Any]:
    """
    Multi-family property analysis

    Use case: Testing multi-family investment features
    """
    if user_id is None:
        user_id = str(uuid.uuid4())

    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "address": "789 Oak Ave, Oakland, CA 94601",
        "analysis_result": {
            "property": {
                "address": "789 Oak Ave, Oakland, CA 94601",
                "city": "Oakland",
                "state": "CA",
                "zip": "94601",
                "property_type": "Multi-Family - 4plex",
                "year_built": 1975,
                "total_units": 4,
                "bedrooms_per_unit": "2-3",
                "sqft": 4800
            },
            "market_analysis": {
                "estimated_value": 950000,
                "value_range": {
                    "low": 880000,
                    "high": 1020000
                },
                "price_per_sqft": 198,
                "appreciation_rate": 6.5
            },
            "investment_metrics": {
                "cap_rate": 5.8,
                "cash_on_cash_return": 7.8,
                "roi_5_year": 38.2,
                "monthly_rental_income": 8400,
                "monthly_expenses": 3800,
                "net_monthly_cashflow": 4600
            },
            "risk_analysis": {
                "overall_score": 7.8,
                "market_volatility": "medium",
                "liquidity": "medium",
                "regulatory_risk": "medium"
            },
            "recommendation": {
                "verdict": "buy",
                "confidence": 0.85,
                "key_strengths": [
                    "Strong rental demand",
                    "Good cash flow",
                    "Value-add potential",
                    "Multiple income streams"
                ],
                "key_risks": [
                    "Older building - maintenance costs",
                    "Rent control regulations"
                ]
            }
        },
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }


def get_negative_analysis_result(user_id: str = None) -> Dict[str, Any]:
    """
    Property with negative recommendation (avoid/sell)

    Use case: Testing how system handles negative results
    """
    if user_id is None:
        user_id = str(uuid.uuid4())

    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "address": "321 Decline St, Detroit, MI 48201",
        "analysis_result": {
            "property": {
                "address": "321 Decline St, Detroit, MI 48201",
                "city": "Detroit",
                "state": "MI",
                "zip": "48201",
                "property_type": "Single Family",
                "year_built": 1950,
                "bedrooms": 2,
                "bathrooms": 1,
                "sqft": 1200
            },
            "market_analysis": {
                "estimated_value": 45000,
                "value_range": {
                    "low": 38000,
                    "high": 52000
                },
                "price_per_sqft": 38,
                "appreciation_rate": -2.1
            },
            "investment_metrics": {
                "cap_rate": 2.1,
                "cash_on_cash_return": -3.5,
                "roi_5_year": -8.2,
                "monthly_rental_income": 800,
                "monthly_expenses": 950,
                "net_monthly_cashflow": -150
            },
            "risk_analysis": {
                "overall_score": 3.2,
                "market_volatility": "high",
                "liquidity": "very_low",
                "regulatory_risk": "medium"
            },
            "recommendation": {
                "verdict": "avoid",
                "confidence": 0.91,
                "key_strengths": [
                    "Low purchase price"
                ],
                "key_risks": [
                    "Negative cash flow",
                    "Declining market",
                    "High vacancy risk",
                    "Difficult to sell",
                    "Major repairs needed"
                ]
            }
        },
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }


def get_luxury_property_analysis(user_id: str = None) -> Dict[str, Any]:
    """
    Luxury/high-value property analysis

    Use case: Testing high-value property handling
    """
    if user_id is None:
        user_id = str(uuid.uuid4())

    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "address": "1 Billionaire Row, New York, NY 10019",
        "analysis_result": {
            "property": {
                "address": "1 Billionaire Row, New York, NY 10019",
                "city": "New York",
                "state": "NY",
                "zip": "10019",
                "property_type": "Luxury Condo",
                "year_built": 2020,
                "bedrooms": 5,
                "bathrooms": 6,
                "sqft": 6500
            },
            "market_analysis": {
                "estimated_value": 18500000,
                "value_range": {
                    "low": 16800000,
                    "high": 20200000
                },
                "price_per_sqft": 2846,
                "appreciation_rate": 4.2
            },
            "investment_metrics": {
                "cap_rate": 2.8,
                "cash_on_cash_return": 3.2,
                "roi_5_year": 18.5,
                "monthly_rental_income": 42000,
                "monthly_expenses": 28000,
                "net_monthly_cashflow": 14000
            },
            "risk_analysis": {
                "overall_score": 6.8,
                "market_volatility": "high",
                "liquidity": "low",
                "regulatory_risk": "low"
            },
            "recommendation": {
                "verdict": "hold",
                "confidence": 0.72,
                "key_strengths": [
                    "Prime location",
                    "Luxury amenities",
                    "High rental demand",
                    "Brand prestige"
                ],
                "key_risks": [
                    "Very high purchase price",
                    "Small buyer pool",
                    "High carrying costs",
                    "Market sensitive to economy"
                ]
            }
        },
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }


# ============================================================================
# PROPERTY ANALYSIS LIST FIXTURES
# ============================================================================

def get_user_property_history(user_id: str, count: int = 5) -> list[Dict[str, Any]]:
    """
    Generate list of property analyses for a user

    Args:
        user_id: User ID
        count: Number of analyses to generate

    Use case: Testing dashboard, pagination, history
    """
    analyses = []
    addresses = [
        "123 Main St, San Francisco, CA 94102",
        "456 Oak Ave, Oakland, CA 94601",
        "789 Market St, San Jose, CA 95113",
        "321 Park Blvd, Berkeley, CA 94704",
        "555 Bay St, San Francisco, CA 94133"
    ]

    for i in range(min(count, len(addresses))):
        analysis = get_basic_property_analysis(user_id, addresses[i])
        # Stagger creation times
        created_time = datetime.utcnow() - timedelta(days=i)
        analysis["created_at"] = created_time.isoformat()
        analysis["updated_at"] = created_time.isoformat()
        analyses.append(analysis)

    return analyses


# ============================================================================
# PROPERTY SEARCH/FILTER FIXTURES
# ============================================================================

def get_property_by_city(city: str, user_id: str = None) -> Dict[str, Any]:
    """
    Generate property analysis for specific city

    Use case: Testing search/filter by city
    """
    city_configs = {
        "San Francisco": {
            "address": "123 Main St, San Francisco, CA 94102",
            "zip": "94102",
            "value": 1250000,
            "rent": 4500
        },
        "Oakland": {
            "address": "456 Oak Ave, Oakland, CA 94601",
            "zip": "94601",
            "value": 750000,
            "rent": 3200
        },
        "San Jose": {
            "address": "789 Market St, San Jose, CA 95113",
            "zip": "95113",
            "value": 980000,
            "rent": 3800
        }
    }

    config = city_configs.get(city, city_configs["San Francisco"])
    analysis = get_basic_property_analysis(user_id, config["address"])

    # Update with city-specific values
    analysis["analysis_result"]["property"]["city"] = city
    analysis["analysis_result"]["property"]["zip"] = config["zip"]
    analysis["analysis_result"]["market_analysis"]["estimated_value"] = config["value"]
    analysis["analysis_result"]["investment_metrics"]["monthly_rental_income"] = config["rent"]

    return analysis


def get_property_by_type(property_type: str, user_id: str = None) -> Dict[str, Any]:
    """
    Generate property analysis for specific type

    Use case: Testing property type filtering
    """
    if property_type.lower() == "commercial":
        return get_commercial_property_analysis(user_id)
    elif "multi" in property_type.lower():
        return get_multi_family_property_analysis(user_id)
    elif property_type.lower() == "luxury":
        return get_luxury_property_analysis(user_id)
    else:
        return get_basic_property_analysis(user_id)


# ============================================================================
# ASSERTION HELPERS
# ============================================================================

def assert_property_analysis_valid(analysis: Dict[str, Any]) -> None:
    """
    Assert that property analysis has all required fields

    Use case: Validating API responses in tests
    """
    assert "id" in analysis
    assert "user_id" in analysis
    assert "address" in analysis
    assert "analysis_result" in analysis
    assert "created_at" in analysis

    result = analysis["analysis_result"]
    assert "property" in result
    assert "market_analysis" in result
    assert "investment_metrics" in result
    assert "risk_analysis" in result
    assert "recommendation" in result


def assert_property_analysis_belongs_to_user(
    analysis: Dict[str, Any],
    user_id: str
) -> None:
    """
    Assert that property analysis belongs to specific user

    Use case: Testing access control
    """
    assert analysis["user_id"] == user_id, \
        f"Property analysis belongs to {analysis['user_id']}, not {user_id}"


def get_property_analysis_minimal(user_id: str = None) -> Dict[str, Any]:
    """
    Minimal property analysis (for testing edge cases)

    Use case: Testing missing optional fields
    """
    if user_id is None:
        user_id = str(uuid.uuid4())

    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "address": "Unknown Address",
        "analysis_result": {
            "property": {
                "address": "Unknown Address"
            },
            "market_analysis": {},
            "investment_metrics": {},
            "risk_analysis": {},
            "recommendation": {
                "verdict": "insufficient_data",
                "confidence": 0.0
            }
        },
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
