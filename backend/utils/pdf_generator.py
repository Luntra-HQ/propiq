"""
PropIQ PDF Report Generator
Sprint 10-11: Features & Export

Generates professional PDF reports from property analysis data using WeasyPrint.

Features:
- Professional multi-page layout
- PropIQ branding (header, footer, watermark)
- Charts and metrics visualization
- Executive summary + detailed analysis
- Responsive to different analysis types
"""

from typing import Dict, Any, Optional
from datetime import datetime
import os
import base64
from io import BytesIO

try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False
    print("⚠️  WeasyPrint not installed. PDF generation will be disabled.")
    print("   Install with: pip install weasyprint")

from config.logging_config import get_logger

logger = get_logger(__name__)


class PDFGenerator:
    """Generate PDF reports from property analysis data"""

    def __init__(self):
        """Initialize PDF generator"""
        self.template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates', 'pdf')
        self.brand_color = '#8B5CF6'  # PropIQ purple
        self.brand_name = 'PropIQ'

    def generate_analysis_report(
        self,
        analysis_data: Dict[str, Any],
        user_name: Optional[str] = None
    ) -> Optional[bytes]:
        """
        Generate PDF report from analysis data

        Args:
            analysis_data: Property analysis dictionary
            user_name: User's name for personalization

        Returns:
            PDF as bytes, or None if generation fails
        """
        if not WEASYPRINT_AVAILABLE:
            logger.error("WeasyPrint not available. Cannot generate PDF.")
            return None

        try:
            # Generate HTML content
            html_content = self._generate_html(analysis_data, user_name)

            # Generate CSS
            css_content = self._generate_css()

            # Convert HTML to PDF
            html = HTML(string=html_content)
            css = CSS(string=css_content)

            pdf_bytes = html.write_pdf(stylesheets=[css])

            logger.info(f"Generated PDF report for analysis {analysis_data.get('id', 'unknown')}")
            return pdf_bytes

        except Exception as e:
            logger.error(f"Failed to generate PDF: {str(e)}", exc_info=True)
            return None

    def _generate_html(self, data: Dict[str, Any], user_name: Optional[str]) -> str:
        """Generate HTML content for PDF"""

        # Extract data
        address = data.get('address', 'Unknown Address')
        city = data.get('city', '')
        state = data.get('state', '')
        zip_code = data.get('zip', '')

        # Metrics
        deal_score = data.get('deal_score', 0)
        deal_rating = data.get('deal_rating', 'Unknown')
        monthly_cash_flow = data.get('monthly_cash_flow', 0)
        cash_on_cash_return = data.get('cash_on_cash_return', 0)
        cap_rate = data.get('cap_rate', 0)
        roi = data.get('roi', 0)

        # Purchase info
        purchase_price = data.get('purchase_price', 0)
        down_payment = data.get('down_payment_amount', 0)
        loan_amount = data.get('loan_amount', 0)

        # Income
        monthly_rent = data.get('monthly_rent', 0)
        annual_rent = monthly_rent * 12

        # Expenses
        monthly_mortgage = data.get('monthly_mortgage', 0)
        monthly_taxes = data.get('monthly_property_tax', 0)
        monthly_insurance = data.get('monthly_insurance', 0)
        monthly_maintenance = data.get('monthly_maintenance', 0)
        monthly_vacancy = data.get('monthly_vacancy', 0)
        total_monthly_expenses = (
            monthly_mortgage + monthly_taxes + monthly_insurance +
            monthly_maintenance + monthly_vacancy
        )

        # Recommendation
        recommendation = data.get('recommendation', 'No recommendation available')

        # Timestamp
        timestamp = datetime.utcnow().strftime('%B %d, %Y at %I:%M %p UTC')

        # Deal score color
        if deal_score >= 80:
            score_color = '#10b981'  # Green
            score_label = 'Excellent'
        elif deal_score >= 65:
            score_color = '#3b82f6'  # Blue
            score_label = 'Good'
        elif deal_score >= 50:
            score_color = '#f59e0b'  # Yellow
            score_label = 'Fair'
        elif deal_score >= 35:
            score_color = '#f97316'  # Orange
            score_label = 'Poor'
        else:
            score_color = '#ef4444'  # Red
            score_label = 'Avoid'

        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>PropIQ Analysis Report - {address}</title>
        </head>
        <body>
            <!-- Page 1: Executive Summary -->
            <div class="page">
                <div class="header">
                    <div class="brand">{self.brand_name}</div>
                    <div class="header-text">Property Analysis Report</div>
                </div>

                <div class="watermark">{self.brand_name}</div>

                <div class="hero-section">
                    <h1 class="property-address">{address}</h1>
                    <p class="property-location">{city}, {state} {zip_code}</p>

                    <div class="deal-score-container">
                        <div class="deal-score" style="background: {score_color};">
                            <div class="score-number">{deal_score}</div>
                            <div class="score-label">Deal Score</div>
                        </div>
                        <div class="score-rating">{score_label} Investment Opportunity</div>
                    </div>
                </div>

                <div class="metrics-grid">
                    <div class="metric-card highlight">
                        <div class="metric-label">Monthly Cash Flow</div>
                        <div class="metric-value {'positive' if monthly_cash_flow > 0 else 'negative'}">
                            ${monthly_cash_flow:,.0f}
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">Cash-on-Cash Return</div>
                        <div class="metric-value">{cash_on_cash_return:.2f}%</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">Cap Rate</div>
                        <div class="metric-value">{cap_rate:.2f}%</div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-label">Annual ROI</div>
                        <div class="metric-value">{roi:.2f}%</div>
                    </div>
                </div>

                <div class="recommendation-section">
                    <h3>Investment Recommendation</h3>
                    <p class="recommendation-text">{recommendation}</p>
                </div>

                <div class="footer">
                    <div>Generated by {self.brand_name} | {timestamp}</div>
                    <div class="page-number">Page 1</div>
                </div>
            </div>

            <!-- Page 2: Financial Analysis -->
            <div class="page">
                <div class="header">
                    <div class="brand">{self.brand_name}</div>
                    <div class="header-text">Financial Analysis</div>
                </div>

                <div class="watermark">{self.brand_name}</div>

                <h2>Income Analysis</h2>
                <table class="data-table">
                    <tr>
                        <td class="label">Monthly Rental Income</td>
                        <td class="value">${monthly_rent:,.2f}</td>
                    </tr>
                    <tr>
                        <td class="label">Annual Rental Income</td>
                        <td class="value">${annual_rent:,.2f}</td>
                    </tr>
                </table>

                <h2>Expense Breakdown</h2>
                <table class="data-table">
                    <tr>
                        <td class="label">Mortgage Payment (P&I)</td>
                        <td class="value">${monthly_mortgage:,.2f}</td>
                    </tr>
                    <tr>
                        <td class="label">Property Taxes</td>
                        <td class="value">${monthly_taxes:,.2f}</td>
                    </tr>
                    <tr>
                        <td class="label">Insurance</td>
                        <td class="value">${monthly_insurance:,.2f}</td>
                    </tr>
                    <tr>
                        <td class="label">Maintenance & Repairs</td>
                        <td class="value">${monthly_maintenance:,.2f}</td>
                    </tr>
                    <tr>
                        <td class="label">Vacancy Reserve</td>
                        <td class="value">${monthly_vacancy:,.2f}</td>
                    </tr>
                    <tr class="total-row">
                        <td class="label"><strong>Total Monthly Expenses</strong></td>
                        <td class="value"><strong>${total_monthly_expenses:,.2f}</strong></td>
                    </tr>
                </table>

                <h2>Net Cash Flow</h2>
                <table class="data-table cash-flow-table">
                    <tr>
                        <td class="label">Monthly Income</td>
                        <td class="value">${monthly_rent:,.2f}</td>
                    </tr>
                    <tr>
                        <td class="label">Monthly Expenses</td>
                        <td class="value">-${total_monthly_expenses:,.2f}</td>
                    </tr>
                    <tr class="total-row highlight">
                        <td class="label"><strong>Net Monthly Cash Flow</strong></td>
                        <td class="value {'positive' if monthly_cash_flow > 0 else 'negative'}">
                            <strong>${monthly_cash_flow:,.2f}</strong>
                        </td>
                    </tr>
                </table>

                <div class="footer">
                    <div>Generated by {self.brand_name} | {timestamp}</div>
                    <div class="page-number">Page 2</div>
                </div>
            </div>

            <!-- Page 3: Purchase Details -->
            <div class="page">
                <div class="header">
                    <div class="brand">{self.brand_name}</div>
                    <div class="header-text">Purchase & Financing Details</div>
                </div>

                <div class="watermark">{self.brand_name}</div>

                <h2>Purchase Information</h2>
                <table class="data-table">
                    <tr>
                        <td class="label">Purchase Price</td>
                        <td class="value">${purchase_price:,.2f}</td>
                    </tr>
                    <tr>
                        <td class="label">Down Payment</td>
                        <td class="value">${down_payment:,.2f}</td>
                    </tr>
                    <tr>
                        <td class="label">Loan Amount</td>
                        <td class="value">${loan_amount:,.2f}</td>
                    </tr>
                </table>

                <h2>Return Metrics</h2>
                <table class="data-table">
                    <tr>
                        <td class="label">Cash-on-Cash Return</td>
                        <td class="value">{cash_on_cash_return:.2f}%</td>
                    </tr>
                    <tr>
                        <td class="label">Capitalization Rate (Cap Rate)</td>
                        <td class="value">{cap_rate:.2f}%</td>
                    </tr>
                    <tr>
                        <td class="label">Return on Investment (ROI)</td>
                        <td class="value">{roi:.2f}%</td>
                    </tr>
                    <tr>
                        <td class="label">Deal Score (0-100)</td>
                        <td class="value" style="color: {score_color};"><strong>{deal_score}</strong></td>
                    </tr>
                </table>

                <div class="disclaimer">
                    <h3>Disclaimer</h3>
                    <p>
                        This analysis is provided for informational purposes only and should not be considered
                        financial, investment, or legal advice. {self.brand_name} makes no guarantees regarding
                        the accuracy of market data, projections, or calculations. Always consult with qualified
                        professionals before making investment decisions. Past performance does not guarantee
                        future results. Real estate investments carry inherent risks.
                    </p>
                </div>

                <div class="footer">
                    <div>Generated by {self.brand_name} | {timestamp}</div>
                    <div class="page-number">Page 3</div>
                </div>
            </div>
        </body>
        </html>
        """

        return html

    def _generate_css(self) -> str:
        """Generate CSS for PDF styling"""

        css = f"""
        @page {{
            size: letter portrait;
            margin: 0.75in;

            @bottom-center {{
                content: counter(page) " of " counter(pages);
                font-size: 10px;
                color: #6b7280;
            }}
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.6;
            color: #1f2937;
        }}

        .page {{
            page-break-after: always;
            position: relative;
            min-height: 9.5in;
        }}

        .page:last-child {{
            page-break-after: avoid;
        }}

        /* Header */
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 16px;
            border-bottom: 2px solid {self.brand_color};
            margin-bottom: 24px;
        }}

        .brand {{
            font-size: 24px;
            font-weight: bold;
            color: {self.brand_color};
        }}

        .header-text {{
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}

        /* Watermark */
        .watermark {{
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: bold;
            color: rgba(139, 92, 246, 0.03);
            z-index: -1;
            white-space: nowrap;
        }}

        /* Hero Section */
        .hero-section {{
            text-align: center;
            margin: 48px 0;
        }}

        .property-address {{
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 8px;
        }}

        .property-location {{
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 32px;
        }}

        /* Deal Score */
        .deal-score-container {{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }}

        .deal-score {{
            width: 140px;
            height: 140px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }}

        .score-number {{
            font-size: 56px;
            font-weight: bold;
            line-height: 1;
        }}

        .score-label {{
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
        }}

        .score-rating {{
            font-size: 16px;
            font-weight: 600;
            color: #374151;
        }}

        /* Metrics Grid */
        .metrics-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 32px 0;
        }}

        .metric-card {{
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }}

        .metric-card.highlight {{
            background: linear-gradient(135deg, {self.brand_color} 0%, #7c3aed 100%);
            border: none;
            color: white;
        }}

        .metric-card.highlight .metric-label {{
            color: rgba(255, 255, 255, 0.9);
        }}

        .metric-label {{
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin-bottom: 8px;
        }}

        .metric-value {{
            font-size: 24px;
            font-weight: bold;
            color: #111827;
        }}

        .metric-card.highlight .metric-value {{
            color: white;
        }}

        .metric-value.positive {{
            color: #10b981;
        }}

        .metric-value.negative {{
            color: #ef4444;
        }}

        /* Recommendation */
        .recommendation-section {{
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 4px;
            margin: 32px 0;
        }}

        .recommendation-section h3 {{
            font-size: 14px;
            color: #92400e;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        .recommendation-text {{
            font-size: 12px;
            color: #78350f;
            line-height: 1.8;
        }}

        /* Tables */
        h2 {{
            font-size: 16px;
            color: {self.brand_color};
            margin: 24px 0 16px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        .data-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }}

        .data-table tr {{
            border-bottom: 1px solid #e5e7eb;
        }}

        .data-table td {{
            padding: 12px 8px;
        }}

        .data-table .label {{
            color: #6b7280;
            width: 60%;
        }}

        .data-table .value {{
            text-align: right;
            font-weight: 600;
            color: #111827;
            width: 40%;
        }}

        .data-table .total-row {{
            background: #f9fafb;
            border-top: 2px solid #d1d5db;
            border-bottom: 2px solid #d1d5db;
        }}

        .data-table .total-row.highlight {{
            background: #ede9fe;
        }}

        .cash-flow-table .value.positive {{
            color: #10b981;
        }}

        .cash-flow-table .value.negative {{
            color: #ef4444;
        }}

        /* Disclaimer */
        .disclaimer {{
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin-top: 32px;
        }}

        .disclaimer h3 {{
            font-size: 12px;
            color: #991b1b;
            margin-bottom: 12px;
        }}

        .disclaimer p {{
            font-size: 9px;
            color: #7f1d1d;
            line-height: 1.6;
        }}

        /* Footer */
        .footer {{
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #6b7280;
        }}

        .page-number {{
            font-weight: 600;
        }}
        """

        return css


# Global instance
pdf_generator = PDFGenerator()


def generate_pdf_report(analysis_data: Dict[str, Any], user_name: Optional[str] = None) -> Optional[bytes]:
    """
    Convenience function to generate PDF report

    Args:
        analysis_data: Property analysis dictionary
        user_name: User's name for personalization

    Returns:
        PDF as bytes, or None if generation fails
    """
    return pdf_generator.generate_analysis_report(analysis_data, user_name)
