"""
Rich Media Response Handler for PropIQ Support Agent
Phase 4: Enhanced visual responses with cards, charts, and media

This module handles:
- Property cards with images and key metrics
- Financial charts (ROI, cash flow, appreciation)
- Embedded images and diagrams
- Comparison tables
- Interactive data visualizations
- Media optimization and caching

Rich media makes AI responses more engaging and informative.
"""

from typing import Dict, List, Optional, Any, Union
from enum import Enum
from datetime import datetime
import uuid
import json


class MediaType(Enum):
    """Types of rich media"""
    PROPERTY_CARD = "property_card"
    CHART = "chart"
    IMAGE = "image"
    TABLE = "table"
    COMPARISON_CARD = "comparison_card"
    METRIC_CARD = "metric_card"
    LIST_CARD = "list_card"
    VIDEO = "video"


class ChartType(Enum):
    """Chart visualization types"""
    LINE = "line"  # Time series, trends
    BAR = "bar"  # Comparisons
    PIE = "pie"  # Distributions
    DONUT = "donut"  # Distributions with center text
    AREA = "area"  # Stacked trends
    SCATTER = "scatter"  # Correlations


class PropertyCard:
    """Property card with image, details, and metrics"""

    def __init__(
        self,
        address: str,
        price: Union[int, float],
        property_type: str,
        bedrooms: Optional[int] = None,
        bathrooms: Optional[float] = None,
        square_feet: Optional[int] = None,
        image_url: Optional[str] = None,
        metrics: Optional[Dict[str, Any]] = None,
        actions: Optional[List[Dict[str, Any]]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize property card

        Args:
            address: Property address
            price: Property price
            property_type: Type (Single Family, Condo, etc.)
            bedrooms: Number of bedrooms
            bathrooms: Number of bathrooms
            square_feet: Square footage
            image_url: Property image URL
            metrics: Key metrics (ROI, cap rate, etc.)
            actions: Action buttons for card
            metadata: Additional metadata
        """
        self.address = address
        self.price = price
        self.property_type = property_type
        self.bedrooms = bedrooms
        self.bathrooms = bathrooms
        self.square_feet = square_feet
        self.image_url = image_url
        self.metrics = metrics or {}
        self.actions = actions or []
        self.metadata = metadata or {}
        self.card_id = str(uuid.uuid4())

    def to_dict(self) -> Dict[str, Any]:
        """Convert property card to dictionary"""
        return {
            "type": MediaType.PROPERTY_CARD.value,
            "card_id": self.card_id,
            "data": {
                "address": self.address,
                "price": self.price,
                "property_type": self.property_type,
                "bedrooms": self.bedrooms,
                "bathrooms": self.bathrooms,
                "square_feet": self.square_feet,
                "image_url": self.image_url,
                "metrics": self.metrics,
                "actions": self.actions,
                "metadata": self.metadata
            }
        }


class Chart:
    """Data visualization chart"""

    def __init__(
        self,
        title: str,
        chart_type: ChartType,
        data: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None,
        description: Optional[str] = None
    ):
        """
        Initialize chart

        Args:
            title: Chart title
            chart_type: Type of chart
            data: Chart data (labels, datasets)
            options: Chart.js options
            description: Chart description for accessibility
        """
        self.title = title
        self.chart_type = chart_type
        self.data = data
        self.options = options or {}
        self.description = description
        self.chart_id = str(uuid.uuid4())

    def to_dict(self) -> Dict[str, Any]:
        """Convert chart to dictionary"""
        return {
            "type": MediaType.CHART.value,
            "chart_id": self.chart_id,
            "data": {
                "title": self.title,
                "chart_type": self.chart_type.value,
                "data": self.data,
                "options": self.options,
                "description": self.description
            }
        }


class MetricCard:
    """Single metric display card"""

    def __init__(
        self,
        label: str,
        value: Union[str, int, float],
        trend: Optional[str] = None,  # "up", "down", "neutral"
        trend_value: Optional[str] = None,  # "+5.2%", "-$120"
        icon: Optional[str] = None,
        color: Optional[str] = None,  # "green", "red", "blue", "gray"
        subtitle: Optional[str] = None
    ):
        """
        Initialize metric card

        Args:
            label: Metric label (e.g., "Monthly Cash Flow")
            value: Metric value (e.g., "$1,250")
            trend: Trend direction
            trend_value: Trend value display
            icon: Icon name
            color: Color theme
            subtitle: Additional context
        """
        self.label = label
        self.value = value
        self.trend = trend
        self.trend_value = trend_value
        self.icon = icon
        self.color = color
        self.subtitle = subtitle
        self.card_id = str(uuid.uuid4())

    def to_dict(self) -> Dict[str, Any]:
        """Convert metric card to dictionary"""
        return {
            "type": MediaType.METRIC_CARD.value,
            "card_id": self.card_id,
            "data": {
                "label": self.label,
                "value": self.value,
                "trend": self.trend,
                "trend_value": self.trend_value,
                "icon": self.icon,
                "color": self.color,
                "subtitle": self.subtitle
            }
        }


class ComparisonTable:
    """Comparison table for side-by-side analysis"""

    def __init__(
        self,
        title: str,
        headers: List[str],
        rows: List[Dict[str, Any]],
        highlight_column: Optional[int] = None,
        footer: Optional[str] = None
    ):
        """
        Initialize comparison table

        Args:
            title: Table title
            headers: Column headers
            rows: Table rows (list of dicts with column data)
            highlight_column: Column index to highlight (0-based)
            footer: Footer text
        """
        self.title = title
        self.headers = headers
        self.rows = rows
        self.highlight_column = highlight_column
        self.footer = footer
        self.table_id = str(uuid.uuid4())

    def to_dict(self) -> Dict[str, Any]:
        """Convert table to dictionary"""
        return {
            "type": MediaType.TABLE.value,
            "table_id": self.table_id,
            "data": {
                "title": self.title,
                "headers": self.headers,
                "rows": self.rows,
                "highlight_column": self.highlight_column,
                "footer": self.footer
            }
        }


class Image:
    """Embedded image"""

    def __init__(
        self,
        url: str,
        alt_text: str,
        caption: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None
    ):
        """
        Initialize image

        Args:
            url: Image URL
            alt_text: Alt text for accessibility
            caption: Image caption
            width: Display width in pixels
            height: Display height in pixels
        """
        self.url = url
        self.alt_text = alt_text
        self.caption = caption
        self.width = width
        self.height = height
        self.image_id = str(uuid.uuid4())

    def to_dict(self) -> Dict[str, Any]:
        """Convert image to dictionary"""
        return {
            "type": MediaType.IMAGE.value,
            "image_id": self.image_id,
            "data": {
                "url": self.url,
                "alt_text": self.alt_text,
                "caption": self.caption,
                "width": self.width,
                "height": self.height
            }
        }


class RichMediaBuilder:
    """Build rich media responses"""

    @staticmethod
    def create_property_card(
        property_data: Dict[str, Any],
        include_actions: bool = True
    ) -> Dict[str, Any]:
        """
        Create property card from property data

        Args:
            property_data: Property information
            include_actions: Whether to include action buttons

        Returns:
            Property card dict
        """
        actions = []
        if include_actions:
            actions = [
                {"label": "View Details", "action": f"/property/{property_data.get('id')}", "type": "navigate"},
                {"label": "Analyze", "action": f"/analyze?property={property_data.get('id')}", "type": "navigate"}
            ]

        card = PropertyCard(
            address=property_data.get("address", "Unknown Address"),
            price=property_data.get("price", 0),
            property_type=property_data.get("property_type", "Unknown"),
            bedrooms=property_data.get("bedrooms"),
            bathrooms=property_data.get("bathrooms"),
            square_feet=property_data.get("square_feet"),
            image_url=property_data.get("image_url"),
            metrics=property_data.get("metrics", {}),
            actions=actions,
            metadata=property_data.get("metadata", {})
        )

        return card.to_dict()

    @staticmethod
    def create_roi_chart(
        investment_amount: float,
        years: int = 10,
        annual_return: float = 0.08,
        monthly_cash_flow: float = 500
    ) -> Dict[str, Any]:
        """
        Create ROI projection chart

        Args:
            investment_amount: Initial investment
            years: Number of years to project
            annual_return: Annual appreciation rate
            monthly_cash_flow: Monthly cash flow

        Returns:
            Chart dict
        """
        labels = [f"Year {i}" for i in range(years + 1)]

        # Calculate cumulative values
        property_values = []
        cash_flow_values = []
        total_returns = []

        current_value = investment_amount

        for year in range(years + 1):
            # Property appreciation
            property_values.append(round(current_value, 2))

            # Cumulative cash flow
            cumulative_cash_flow = monthly_cash_flow * 12 * year
            cash_flow_values.append(round(cumulative_cash_flow, 2))

            # Total return (appreciation + cash flow)
            total_return = (current_value - investment_amount) + cumulative_cash_flow
            total_returns.append(round(total_return, 2))

            # Appreciate for next year
            current_value = current_value * (1 + annual_return)

        chart_data = {
            "labels": labels,
            "datasets": [
                {
                    "label": "Property Value",
                    "data": property_values,
                    "borderColor": "rgb(59, 130, 246)",
                    "backgroundColor": "rgba(59, 130, 246, 0.1)",
                    "fill": True
                },
                {
                    "label": "Cumulative Cash Flow",
                    "data": cash_flow_values,
                    "borderColor": "rgb(34, 197, 94)",
                    "backgroundColor": "rgba(34, 197, 94, 0.1)",
                    "fill": True
                },
                {
                    "label": "Total Return",
                    "data": total_returns,
                    "borderColor": "rgb(168, 85, 247)",
                    "backgroundColor": "rgba(168, 85, 247, 0.1)",
                    "fill": True
                }
            ]
        }

        chart_options = {
            "responsive": True,
            "plugins": {
                "legend": {"position": "top"},
                "tooltip": {
                    "mode": "index",
                    "intersect": False
                }
            },
            "scales": {
                "y": {
                    "beginAtZero": True,
                    "ticks": {
                        "callback": "function(value) { return '$' + value.toLocaleString(); }"
                    }
                }
            }
        }

        chart = Chart(
            title=f"{years}-Year ROI Projection",
            chart_type=ChartType.LINE,
            data=chart_data,
            options=chart_options,
            description=f"ROI projection showing property appreciation, cash flow, and total returns over {years} years"
        )

        return chart.to_dict()

    @staticmethod
    def create_metrics_grid(metrics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Create grid of metric cards

        Args:
            metrics: List of metric dicts with label, value, etc.

        Returns:
            List of metric card dicts
        """
        cards = []

        for metric in metrics:
            card = MetricCard(
                label=metric.get("label", ""),
                value=metric.get("value", ""),
                trend=metric.get("trend"),
                trend_value=metric.get("trend_value"),
                icon=metric.get("icon"),
                color=metric.get("color"),
                subtitle=metric.get("subtitle")
            )
            cards.append(card.to_dict())

        return cards

    @staticmethod
    def create_comparison_table(
        properties: List[Dict[str, Any]],
        metrics: List[str]
    ) -> Dict[str, Any]:
        """
        Create property comparison table

        Args:
            properties: List of property data
            metrics: List of metrics to compare

        Returns:
            Comparison table dict
        """
        headers = ["Metric"] + [f"Property {i+1}" for i in range(len(properties))]

        rows = []
        for metric in metrics:
            row = {"metric": metric}
            for i, prop in enumerate(properties):
                row[f"property_{i}"] = prop.get(metric, "N/A")
            rows.append(row)

        table = ComparisonTable(
            title="Property Comparison",
            headers=headers,
            rows=rows,
            footer=f"Comparing {len(properties)} properties across {len(metrics)} metrics"
        )

        return table.to_dict()

    @staticmethod
    def create_cash_flow_chart(
        monthly_data: List[Dict[str, float]]
    ) -> Dict[str, Any]:
        """
        Create monthly cash flow chart

        Args:
            monthly_data: List of monthly data with income, expenses, net

        Returns:
            Chart dict
        """
        labels = [data.get("month", f"Month {i+1}") for i, data in enumerate(monthly_data)]
        income = [data.get("income", 0) for data in monthly_data]
        expenses = [data.get("expenses", 0) for data in monthly_data]
        net_cash_flow = [data.get("net", 0) for data in monthly_data]

        chart_data = {
            "labels": labels,
            "datasets": [
                {
                    "label": "Income",
                    "data": income,
                    "backgroundColor": "rgba(34, 197, 94, 0.8)",
                    "borderColor": "rgb(34, 197, 94)",
                    "borderWidth": 1
                },
                {
                    "label": "Expenses",
                    "data": expenses,
                    "backgroundColor": "rgba(239, 68, 68, 0.8)",
                    "borderColor": "rgb(239, 68, 68)",
                    "borderWidth": 1
                },
                {
                    "label": "Net Cash Flow",
                    "data": net_cash_flow,
                    "type": "line",
                    "borderColor": "rgb(59, 130, 246)",
                    "backgroundColor": "rgba(59, 130, 246, 0.1)",
                    "fill": True,
                    "borderWidth": 2
                }
            ]
        }

        chart_options = {
            "responsive": True,
            "plugins": {
                "legend": {"position": "top"},
                "title": {
                    "display": True,
                    "text": "Monthly Cash Flow Analysis"
                }
            },
            "scales": {
                "y": {
                    "beginAtZero": True,
                    "ticks": {
                        "callback": "function(value) { return '$' + value.toLocaleString(); }"
                    }
                }
            }
        }

        chart = Chart(
            title="Monthly Cash Flow",
            chart_type=ChartType.BAR,
            data=chart_data,
            options=chart_options,
            description="Monthly income, expenses, and net cash flow breakdown"
        )

        return chart.to_dict()


class RichMediaResponse:
    """Complete rich media response with text and media"""

    def __init__(
        self,
        text: str,
        media_items: Optional[List[Dict[str, Any]]] = None,
        actions: Optional[List[Dict[str, Any]]] = None
    ):
        """
        Initialize rich media response

        Args:
            text: Response text
            media_items: List of media items (cards, charts, images)
            actions: Action buttons
        """
        self.text = text
        self.media_items = media_items or []
        self.actions = actions or []
        self.response_id = str(uuid.uuid4())
        self.created_at = datetime.utcnow().isoformat()

    def add_media(self, media_item: Dict[str, Any]):
        """Add media item to response"""
        self.media_items.append(media_item)

    def add_action(self, action: Dict[str, Any]):
        """Add action button to response"""
        self.actions.append(action)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response"""
        return {
            "response_id": self.response_id,
            "text": self.text,
            "media": self.media_items,
            "actions": self.actions,
            "created_at": self.created_at,
            "has_media": len(self.media_items) > 0,
            "has_actions": len(self.actions) > 0
        }


# Convenience functions

def create_property_summary_response(
    property_data: Dict[str, Any],
    analysis_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create rich property summary response

    Args:
        property_data: Property details
        analysis_data: Optional analysis metrics

    Returns:
        Rich media response dict
    """
    builder = RichMediaBuilder()

    # Response text
    address = property_data.get("address", "this property")
    price = property_data.get("price", 0)
    text = f"Here's a summary of {address} (${price:,}):"

    # Create response
    response = RichMediaResponse(text=text)

    # Add property card
    property_card = builder.create_property_card(property_data)
    response.add_media(property_card)

    # Add metrics if available
    if analysis_data:
        metrics = [
            {
                "label": "Cap Rate",
                "value": f"{analysis_data.get('cap_rate', 0):.2f}%",
                "icon": "percent",
                "color": "blue"
            },
            {
                "label": "Monthly Cash Flow",
                "value": f"${analysis_data.get('monthly_cash_flow', 0):,.0f}",
                "trend": "up" if analysis_data.get('monthly_cash_flow', 0) > 0 else "neutral",
                "icon": "dollar-sign",
                "color": "green"
            },
            {
                "label": "ROI (1 Year)",
                "value": f"{analysis_data.get('roi_1yr', 0):.1f}%",
                "icon": "trending-up",
                "color": "purple"
            }
        ]

        metric_cards = builder.create_metrics_grid(metrics)
        for card in metric_cards:
            response.add_media(card)

    # Add actions
    response.add_action({
        "label": "View Full Analysis",
        "action": f"/analysis/{property_data.get('id')}",
        "type": "navigate",
        "style": "primary"
    })

    return response.to_dict()


def create_pricing_comparison_response(
    current_tier: str,
    target_tier: str
) -> Dict[str, Any]:
    """Create pricing comparison with table"""
    builder = RichMediaBuilder()

    tiers_data = {
        "free": {"price": "$0", "analyses": "3", "advisor": "No"},
        "starter": {"price": "$29", "analyses": "20", "advisor": "No"},
        "pro": {"price": "$79", "analyses": "100", "advisor": "Yes"},
        "elite": {"price": "$199", "analyses": "Unlimited", "advisor": "Yes"}
    }

    properties = [
        tiers_data.get(current_tier, tiers_data["free"]),
        tiers_data.get(target_tier, tiers_data["pro"])
    ]

    table = builder.create_comparison_table(
        properties=properties,
        metrics=["price", "analyses", "advisor"]
    )

    response = RichMediaResponse(
        text=f"Here's how {target_tier.title()} compares to your current {current_tier.title()} plan:",
        media_items=[table]
    )

    response.add_action({
        "label": f"Upgrade to {target_tier.title()}",
        "action": f"/pricing?highlight={target_tier}",
        "type": "navigate",
        "style": "success"
    })

    return response.to_dict()


# Health check
def health_check() -> Dict[str, Any]:
    """Check rich media system status"""
    return {
        "media_types": [mt.value for mt in MediaType],
        "chart_types": [ct.value for ct in ChartType],
        "features": {
            "property_cards": True,
            "charts": True,
            "images": True,
            "tables": True,
            "metric_cards": True,
            "comparison_tables": True
        }
    }
