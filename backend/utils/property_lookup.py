"""
Property Data Lookup Integration for PropIQ Support Agent
Phase 4: Answer specific property questions with real data

This module handles:
- Property data retrieval from user's analyses
- Metric extraction and formatting
- Comparison queries across properties
- Market data integration
- Natural language query interpretation
- Data aggregation and statistics

Enables AI to answer questions like "What was the ROI on my last analysis?"
"""

from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from enum import Enum
import re


class PropertyMetric(Enum):
    """Available property metrics"""
    PRICE = "price"
    CAP_RATE = "cap_rate"
    ROI = "roi"
    CASH_FLOW = "cash_flow"
    MONTHLY_RENT = "monthly_rent"
    EXPENSES = "expenses"
    NOI = "noi"  # Net Operating Income
    CASH_ON_CASH = "cash_on_cash_return"
    APPRECIATION = "appreciation_rate"
    TOTAL_RETURN = "total_return"


class PropertyLookupManager:
    """Manage property data lookups"""

    def __init__(self, supabase_client=None):
        """
        Initialize property lookup manager

        Args:
            supabase_client: Supabase client for data retrieval
        """
        self.supabase = supabase_client

    def find_property_by_query(
        self,
        user_id: str,
        query: str
    ) -> Optional[Dict[str, Any]]:
        """
        Find property based on natural language query

        Args:
            user_id: User ID
            query: Natural language query (e.g., "my last analysis", "the property on Main St")

        Returns:
            Property data or None
        """
        query_lower = query.lower()

        # Check for temporal references
        if "last" in query_lower or "most recent" in query_lower or "latest" in query_lower:
            return self.get_latest_analysis(user_id)

        elif "first" in query_lower:
            return self.get_first_analysis(user_id)

        # Check for address references
        address_match = self._extract_address(query)
        if address_match:
            return self.find_property_by_address(user_id, address_match)

        # Check for price references
        price_match = self._extract_price(query)
        if price_match:
            return self.find_property_by_price(user_id, price_match)

        # Default to latest
        return self.get_latest_analysis(user_id)

    def get_latest_analysis(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's most recent property analysis"""
        if not self.supabase:
            return None

        try:
            result = self.supabase.table("property_analyses").select("*").eq(
                "user_id", user_id
            ).order("created_at", desc=True).limit(1).execute()

            if result.data and len(result.data) > 0:
                return self._format_property_data(result.data[0])

        except Exception as e:
            print(f"⚠️  Failed to get latest analysis: {e}")

        return None

    def get_first_analysis(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's first property analysis"""
        if not self.supabase:
            return None

        try:
            result = self.supabase.table("property_analyses").select("*").eq(
                "user_id", user_id
            ).order("created_at", desc=False).limit(1).execute()

            if result.data and len(result.data) > 0:
                return self._format_property_data(result.data[0])

        except Exception as e:
            print(f"⚠️  Failed to get first analysis: {e}")

        return None

    def find_property_by_address(
        self,
        user_id: str,
        address_query: str
    ) -> Optional[Dict[str, Any]]:
        """
        Find property by partial address match

        Args:
            user_id: User ID
            address_query: Address search query

        Returns:
            Property data or None
        """
        if not self.supabase:
            return None

        try:
            result = self.supabase.table("property_analyses").select("*").eq(
                "user_id", user_id
            ).ilike("property_address", f"%{address_query}%").order(
                "created_at", desc=True
            ).limit(1).execute()

            if result.data and len(result.data) > 0:
                return self._format_property_data(result.data[0])

        except Exception as e:
            print(f"⚠️  Failed to find property by address: {e}")

        return None

    def find_property_by_price(
        self,
        user_id: str,
        target_price: float,
        tolerance: float = 0.05
    ) -> Optional[Dict[str, Any]]:
        """
        Find property by price (within tolerance)

        Args:
            user_id: User ID
            target_price: Target price
            tolerance: Price tolerance (default 5%)

        Returns:
            Property data or None
        """
        if not self.supabase:
            return None

        try:
            min_price = target_price * (1 - tolerance)
            max_price = target_price * (1 + tolerance)

            result = self.supabase.table("property_analyses").select("*").eq(
                "user_id", user_id
            ).gte("property_price", min_price).lte("property_price", max_price).order(
                "created_at", desc=True
            ).limit(1).execute()

            if result.data and len(result.data) > 0:
                return self._format_property_data(result.data[0])

        except Exception as e:
            print(f"⚠️  Failed to find property by price: {e}")

        return None

    def get_all_user_properties(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get all properties analyzed by user"""
        if not self.supabase:
            return []

        try:
            result = self.supabase.table("property_analyses").select("*").eq(
                "user_id", user_id
            ).order("created_at", desc=True).limit(limit).execute()

            if result.data:
                return [self._format_property_data(prop) for prop in result.data]

        except Exception as e:
            print(f"⚠️  Failed to get all properties: {e}")

        return []

    def get_property_metric(
        self,
        property_data: Dict[str, Any],
        metric: PropertyMetric
    ) -> Optional[Union[str, float]]:
        """
        Extract specific metric from property data

        Args:
            property_data: Property data dict
            metric: Metric to extract

        Returns:
            Metric value or None
        """
        metrics = property_data.get("metrics", {})

        metric_map = {
            PropertyMetric.PRICE: lambda: property_data.get("price"),
            PropertyMetric.CAP_RATE: lambda: metrics.get("cap_rate"),
            PropertyMetric.ROI: lambda: metrics.get("roi_1yr"),
            PropertyMetric.CASH_FLOW: lambda: metrics.get("monthly_cash_flow"),
            PropertyMetric.MONTHLY_RENT: lambda: metrics.get("monthly_rent"),
            PropertyMetric.EXPENSES: lambda: metrics.get("monthly_expenses"),
            PropertyMetric.NOI: lambda: metrics.get("noi"),
            PropertyMetric.CASH_ON_CASH: lambda: metrics.get("cash_on_cash_return"),
            PropertyMetric.APPRECIATION: lambda: metrics.get("appreciation_rate"),
            PropertyMetric.TOTAL_RETURN: lambda: metrics.get("total_return")
        }

        extractor = metric_map.get(metric)
        if extractor:
            return extractor()

        return None

    def compare_properties(
        self,
        user_id: str,
        property_ids: List[str],
        metrics: List[PropertyMetric]
    ) -> Dict[str, Any]:
        """
        Compare multiple properties across metrics

        Args:
            user_id: User ID
            property_ids: List of property IDs
            metrics: List of metrics to compare

        Returns:
            Comparison data
        """
        if not self.supabase:
            return {"error": "Database not available"}

        try:
            # Get properties
            properties = []
            for prop_id in property_ids:
                result = self.supabase.table("property_analyses").select("*").eq(
                    "id", prop_id
                ).eq("user_id", user_id).execute()

                if result.data and len(result.data) > 0:
                    properties.append(self._format_property_data(result.data[0]))

            if not properties:
                return {"error": "No properties found"}

            # Build comparison
            comparison = {
                "properties": [],
                "metrics": {},
                "best": {},
                "worst": {}
            }

            for prop in properties:
                comparison["properties"].append({
                    "id": prop.get("id"),
                    "address": prop.get("address"),
                    "price": prop.get("price")
                })

            # Compare metrics
            for metric in metrics:
                metric_values = []
                for prop in properties:
                    value = self.get_property_metric(prop, metric)
                    if value is not None:
                        metric_values.append({
                            "property_id": prop.get("id"),
                            "address": prop.get("address"),
                            "value": value
                        })

                if metric_values:
                    # Find best and worst
                    sorted_values = sorted(metric_values, key=lambda x: x["value"], reverse=True)

                    comparison["metrics"][metric.value] = metric_values
                    comparison["best"][metric.value] = sorted_values[0]
                    comparison["worst"][metric.value] = sorted_values[-1]

            return comparison

        except Exception as e:
            print(f"⚠️  Failed to compare properties: {e}")
            return {"error": str(e)}

    def get_portfolio_statistics(self, user_id: str) -> Dict[str, Any]:
        """
        Get aggregate statistics across all user's properties

        Args:
            user_id: User ID

        Returns:
            Portfolio statistics
        """
        properties = self.get_all_user_properties(user_id)

        if not properties:
            return {
                "total_properties": 0,
                "total_value": 0,
                "average_metrics": {}
            }

        total_properties = len(properties)
        total_value = sum(prop.get("price", 0) for prop in properties)
        average_price = total_value / total_properties if total_properties > 0 else 0

        # Calculate average metrics
        metric_sums = {}
        metric_counts = {}

        for prop in properties:
            metrics = prop.get("metrics", {})
            for key, value in metrics.items():
                if isinstance(value, (int, float)):
                    metric_sums[key] = metric_sums.get(key, 0) + value
                    metric_counts[key] = metric_counts.get(key, 0) + 1

        average_metrics = {
            key: metric_sums[key] / metric_counts[key]
            for key in metric_sums.keys()
            if metric_counts.get(key, 0) > 0
        }

        # Find best property by ROI
        best_roi_property = None
        best_roi = -float('inf')

        for prop in properties:
            roi = prop.get("metrics", {}).get("roi_1yr", 0)
            if roi and roi > best_roi:
                best_roi = roi
                best_roi_property = {
                    "address": prop.get("address"),
                    "roi": roi
                }

        return {
            "total_properties": total_properties,
            "total_value": total_value,
            "average_price": average_price,
            "average_metrics": average_metrics,
            "best_roi_property": best_roi_property
        }

    def _format_property_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format raw database property data"""
        return {
            "id": raw_data.get("id"),
            "address": raw_data.get("property_address"),
            "price": raw_data.get("property_price"),
            "property_type": raw_data.get("property_type"),
            "bedrooms": raw_data.get("bedrooms"),
            "bathrooms": raw_data.get("bathrooms"),
            "square_feet": raw_data.get("square_feet"),
            "image_url": raw_data.get("image_url"),
            "metrics": raw_data.get("metrics", {}),
            "analysis_type": raw_data.get("analysis_type", "standard"),
            "created_at": raw_data.get("created_at"),
            "metadata": raw_data.get("metadata", {})
        }

    def _extract_address(self, query: str) -> Optional[str]:
        """Extract address from natural language query"""
        # Match patterns like "on Main St", "property at 123 Oak", etc.
        patterns = [
            r"(?:on|at)\s+([A-Z][a-zA-Z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard))",
            r"(?:property|house|home)\s+(?:on|at)\s+([A-Za-z0-9\s]+)",
            r"(\d+\s+[A-Z][a-zA-Z\s]+)"
        ]

        for pattern in patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return None

    def _extract_price(self, query: str) -> Optional[float]:
        """Extract price from natural language query"""
        # Match patterns like "$500,000", "$500k", "500000"
        patterns = [
            r"\$?([\d,]+)k",  # $500k format
            r"\$?([\d,]+)",  # $500,000 or 500000 format
        ]

        for pattern in patterns:
            match = re.search(pattern, query)
            if match:
                price_str = match.group(1).replace(",", "")
                price = float(price_str)

                # Handle 'k' suffix
                if "k" in query.lower():
                    price *= 1000

                return price

        return None


class PropertyQueryInterpreter:
    """Interpret natural language property queries"""

    @staticmethod
    def interpret_query(query: str) -> Dict[str, Any]:
        """
        Interpret natural language query about properties

        Args:
            query: Natural language query

        Returns:
            Interpreted query structure
        """
        query_lower = query.lower()

        interpretation = {
            "intent": "unknown",
            "target": "latest",  # "latest", "first", "all", "specific"
            "metrics": [],
            "comparison": False,
            "aggregation": False
        }

        # Detect intent
        if any(word in query_lower for word in ["roi", "return on investment"]):
            interpretation["intent"] = "get_metric"
            interpretation["metrics"].append(PropertyMetric.ROI)

        elif any(word in query_lower for word in ["cash flow", "monthly income"]):
            interpretation["intent"] = "get_metric"
            interpretation["metrics"].append(PropertyMetric.CASH_FLOW)

        elif any(word in query_lower for word in ["cap rate", "capitalization rate"]):
            interpretation["intent"] = "get_metric"
            interpretation["metrics"].append(PropertyMetric.CAP_RATE)

        elif any(word in query_lower for word in ["compare", "comparison", "versus", "vs"]):
            interpretation["intent"] = "compare"
            interpretation["comparison"] = True

        elif any(word in query_lower for word in ["portfolio", "all properties", "total"]):
            interpretation["intent"] = "portfolio_stats"
            interpretation["aggregation"] = True
            interpretation["target"] = "all"

        # Detect target
        if "last" in query_lower or "latest" in query_lower or "most recent" in query_lower:
            interpretation["target"] = "latest"
        elif "first" in query_lower:
            interpretation["target"] = "first"
        elif "all" in query_lower:
            interpretation["target"] = "all"

        return interpretation


# Convenience functions

def lookup_property(
    user_id: str,
    query: str,
    supabase_client=None
) -> Optional[Dict[str, Any]]:
    """Quick function to lookup property by query"""
    manager = PropertyLookupManager(supabase_client)
    return manager.find_property_by_query(user_id, query)


def get_latest_property(
    user_id: str,
    supabase_client=None
) -> Optional[Dict[str, Any]]:
    """Quick function to get latest property"""
    manager = PropertyLookupManager(supabase_client)
    return manager.get_latest_analysis(user_id)


def get_property_portfolio_stats(
    user_id: str,
    supabase_client=None
) -> Dict[str, Any]:
    """Quick function to get portfolio statistics"""
    manager = PropertyLookupManager(supabase_client)
    return manager.get_portfolio_statistics(user_id)


def answer_property_question(
    user_id: str,
    question: str,
    supabase_client=None
) -> str:
    """
    Answer natural language question about user's properties

    Args:
        user_id: User ID
        question: Natural language question
        supabase_client: Database client

    Returns:
        Answer string
    """
    manager = PropertyLookupManager(supabase_client)
    interpreter = PropertyQueryInterpreter()

    # Interpret question
    interpretation = interpreter.interpret_query(question)

    # Handle portfolio stats
    if interpretation["intent"] == "portfolio_stats":
        stats = manager.get_portfolio_statistics(user_id)
        total = stats.get("total_properties", 0)
        total_value = stats.get("total_value", 0)

        if total == 0:
            return "You haven't analyzed any properties yet."

        return f"You've analyzed {total} properties with a total value of ${total_value:,.0f}. Average price: ${stats.get('average_price', 0):,.0f}."

    # Get property
    property_data = manager.find_property_by_query(user_id, question)

    if not property_data:
        return "I couldn't find that property in your analysis history."

    address = property_data.get("address", "the property")

    # Handle metric queries
    if interpretation["intent"] == "get_metric" and interpretation["metrics"]:
        metric = interpretation["metrics"][0]
        value = manager.get_property_metric(property_data, metric)

        if value is None:
            return f"I don't have {metric.value} data for {address}."

        if metric == PropertyMetric.PRICE:
            return f"The price of {address} is ${value:,.0f}."
        elif metric == PropertyMetric.CAP_RATE:
            return f"The cap rate for {address} is {value:.2f}%."
        elif metric == PropertyMetric.ROI:
            return f"The 1-year ROI for {address} is {value:.1f}%."
        elif metric == PropertyMetric.CASH_FLOW:
            return f"The monthly cash flow for {address} is ${value:,.0f}."

    # Default response
    price = property_data.get("price", 0)
    return f"I found {address} (${price:,.0f}) in your analysis history."


# Health check
def health_check() -> Dict[str, Any]:
    """Check property lookup system status"""
    return {
        "available_metrics": [metric.value for metric in PropertyMetric],
        "features": {
            "natural_language_queries": True,
            "address_search": True,
            "price_search": True,
            "property_comparison": True,
            "portfolio_statistics": True,
            "metric_extraction": True
        }
    }
