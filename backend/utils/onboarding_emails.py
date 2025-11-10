"""
PropIQ Onboarding Email Campaign
4-day email sequence for new user onboarding (adapted from Perplexity Comet example)

Sequence:
- Day 1: Welcome & Platform Overview
- Day 2: Property Analysis Deep Dive
- Day 3: Deal Calculator & Financial Tools
- Day 4: Advanced Features & Success Stories
"""

from typing import Dict, Any
import os

# Email configuration
FROM_EMAIL = os.getenv("FROM_EMAIL", "team@propiq.luntra.one")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@propiq.luntra.one")
APP_URL = os.getenv("APP_URL", "https://propiq.luntra.one")

def get_email_day_1(user_name: str = "there", user_email: str = "") -> Dict[str, Any]:
    """
    Day 1: Welcome to PropIQ
    Introduces the platform, key features, and quick-start checklist
    """
    return {
        "subject": "Day 1 of 4: Welcome to PropIQ",
        "html_content": f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }}
        .container {{
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #4F46E5;
            font-size: 28px;
            margin-bottom: 20px;
        }}
        h2 {{
            color: #4F46E5;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        .intro {{
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
        }}
        .cta-button {{
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .feature-card {{
            background: #f3f4f6;
            border-left: 4px solid #4F46E5;
            padding: 16px;
            margin: 16px 0;
            border-radius: 4px;
        }}
        .feature-card h3 {{
            color: #1f2937;
            font-size: 16px;
            margin: 0 0 8px 0;
        }}
        .feature-card p {{
            color: #6b7280;
            margin: 0;
            font-size: 14px;
        }}
        .checklist {{
            background: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }}
        .checklist-item {{
            padding: 8px 0;
            font-size: 15px;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
        }}
        .social-links {{
            margin: 20px 0;
        }}
        .social-links a {{
            color: #4F46E5;
            text-decoration: none;
            margin-right: 15px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to PropIQ</h1>

        <p class="intro">
            Hi {user_name},
        </p>

        <p class="intro">
            PropIQ is your AI-powered partner for real estate investment analysis, helping you identify
            profitable properties, analyze deals faster, and make data-driven investment decisions with
            confidence. PropIQ transforms every property search into an intelligent, comprehensive analysis,
            making real estate investing work for you.
        </p>

        <a href="{APP_URL}" class="cta-button">Explore PropIQ →</a>

        <h2>Ways PropIQ can help you</h2>

        <div class="feature-card">
            <h3>🏡 AI-Powered Property Analysis</h3>
            <p>Get instant, comprehensive property reports with market insights, cash flow projections,
            and investment recommendations powered by GPT-4.</p>
        </div>

        <div class="feature-card">
            <h3>🧮 Advanced Deal Calculator</h3>
            <p>Run detailed financial scenarios with our 3-tab calculator covering basic metrics,
            advanced analysis, and what-if scenarios with 5-year projections.</p>
        </div>

        <div class="feature-card">
            <h3>📊 Deal Scoring & Insights</h3>
            <p>Every property gets a 0-100 deal score with color-coded ratings, so you can quickly
            identify winners and avoid money pits.</p>
        </div>

        <div class="feature-card">
            <h3>💬 24/7 AI Support Chat</h3>
            <p>Get instant answers to your real estate investing questions with our custom AI support
            assistant that knows PropIQ inside and out.</p>
        </div>

        <a href="{APP_URL}/analyze" class="cta-button">Analyze Your First Property →</a>

        <div class="checklist">
            <h2 style="margin-top: 0;">Quick-start checklist</h2>

            <div class="checklist-item">
                ✅ <strong>1) Complete your profile</strong><br>
                &nbsp;&nbsp;&nbsp;&nbsp;Go to Settings → Profile
            </div>

            <div class="checklist-item">
                ✅ <strong>2) Run your first analysis</strong><br>
                &nbsp;&nbsp;&nbsp;&nbsp;Enter any property address to get started
            </div>

            <div class="checklist-item">
                ✅ <strong>3) Try the Deal Calculator</strong><br>
                &nbsp;&nbsp;&nbsp;&nbsp;Test different scenarios with our advanced calculator
            </div>

            <div class="checklist-item">
                ✅ <strong>4) Explore pricing plans</strong><br>
                &nbsp;&nbsp;&nbsp;&nbsp;Go to Pricing → Choose your plan
            </div>
        </div>

        <h2>Helpful information</h2>

        <p><strong>Your data and privacy</strong><br>
        To see how we protect your data, visit our <a href="{APP_URL}/privacy" style="color: #4F46E5;">privacy page</a>.</p>

        <p><strong>Share your feedback</strong><br>
        Use our support chat or email us at <a href="mailto:{SUPPORT_EMAIL}" style="color: #4F46E5;">{SUPPORT_EMAIL}</a></p>

        <div class="social-links">
            <strong>Follow along for PropIQ tips & updates</strong><br>
            <a href="https://twitter.com/propiq">Twitter</a>
            <a href="https://linkedin.com/company/propiq">LinkedIn</a>
        </div>

        <div class="footer">
            <p>© 2025 PropIQ by LUNTRA. Making real estate investing smarter.</p>
            <p>
                <a href="{APP_URL}/unsubscribe?email={user_email}" style="color: #6b7280;">Unsubscribe</a> |
                <a href="{APP_URL}/privacy" style="color: #6b7280;">Privacy Policy</a> |
                <a href="{APP_URL}/terms" style="color: #6b7280;">Terms and Conditions</a>
            </p>
        </div>
    </div>
</body>
</html>
""",
        "delay_hours": 0  # Send immediately on signup
    }


def get_email_day_2(user_name: str = "there", user_email: str = "") -> Dict[str, Any]:
    """
    Day 2: Master Property Analysis
    Deep dive into AI analysis features and how to interpret results
    """
    return {
        "subject": "Day 2 of 4: Master Property Analysis Like a Pro",
        "html_content": f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }}
        .container {{
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #4F46E5;
            font-size: 28px;
            margin-bottom: 20px;
        }}
        h2 {{
            color: #4F46E5;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        .intro {{
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
        }}
        .cta-button {{
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .feature-section {{
            margin: 30px 0;
            padding: 24px;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 8px;
        }}
        .feature-section h3 {{
            color: #1f2937;
            font-size: 18px;
            margin: 0 0 12px 0;
        }}
        .feature-section p {{
            color: #4b5563;
            margin: 0;
        }}
        .tip-box {{
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .tip-box strong {{
            color: #92400e;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Master Property Analysis Like a Pro</h1>

        <p class="intro">
            Hi {user_name},
        </p>

        <p class="intro">
            Stop letting property analysis overwhelm you. With PropIQ, you'll breeze through complex
            market data, financial projections, and investment scenarios, pulling out only what matters
            for your investment strategy.
        </p>

        <a href="{APP_URL}/analyze" class="cta-button">Start Analyzing →</a>

        <div class="feature-section">
            <h3>📍 Instant Market Insights from Any Address</h3>
            <p>
                Just enter a property address and let PropIQ's AI analyze neighborhood trends, comparable
                sales, rental rates, and market conditions. Get comprehensive reports in seconds that would
                normally take hours of manual research.
            </p>
        </div>

        <div class="tip-box">
            <strong>💡 Pro Tip:</strong> Start with properties in neighborhoods you're already familiar with.
            This helps you calibrate PropIQ's analysis against your local knowledge.
        </div>

        <div class="feature-section">
            <h3>🎯 AI-Powered Investment Recommendations</h3>
            <p>
                Every analysis includes personalized recommendations based on your investment criteria.
                PropIQ evaluates cash flow potential, appreciation outlook, risk factors, and financing
                options to give you clear guidance on whether to pursue the deal.
            </p>
        </div>

        <div class="feature-section">
            <h3>📊 Deal Scores That Make Decisions Easy</h3>
            <p>
                PropIQ distills complex analysis into a simple 0-100 deal score with color-coded ratings:
                <br><br>
                🟢 <strong>80-100: Excellent</strong> - Strong investment opportunity<br>
                🔵 <strong>65-79: Good</strong> - Solid fundamentals, worth pursuing<br>
                🟡 <strong>50-64: Fair</strong> - Acceptable but requires careful review<br>
                🟠 <strong>35-49: Poor</strong> - Weak fundamentals, proceed with caution<br>
                🔴 <strong>0-34: Avoid</strong> - High risk, better opportunities elsewhere
            </p>
        </div>

        <a href="{APP_URL}/pricing" class="cta-button">Upgrade for Unlimited Analysis →</a>

        <h2>Helpful information</h2>

        <p><strong>Your data and privacy</strong><br>
        To see how we protect your data, visit our <a href="{APP_URL}/privacy" style="color: #4F46E5;">privacy page</a>.</p>

        <p><strong>Share your feedback</strong><br>
        Use our support chat or email us at <a href="mailto:{SUPPORT_EMAIL}" style="color: #4F46E5;">{SUPPORT_EMAIL}</a></p>

        <div class="footer">
            <p>© 2025 PropIQ by LUNTRA. Making real estate investing smarter.</p>
            <p>
                <a href="{APP_URL}/unsubscribe?email={user_email}" style="color: #6b7280;">Unsubscribe</a> |
                <a href="{APP_URL}/privacy" style="color: #6b7280;">Privacy Policy</a> |
                <a href="{APP_URL}/terms" style="color: #6b7280;">Terms and Conditions</a>
            </p>
        </div>
    </div>
</body>
</html>
""",
        "delay_hours": 24  # Send 24 hours after signup
    }


def get_email_day_3(user_name: str = "there", user_email: str = "") -> Dict[str, Any]:
    """
    Day 3: Advanced Deal Calculator
    Focus on financial modeling and scenario analysis
    """
    return {
        "subject": "Day 3 of 4: Run the Numbers with Our Deal Calculator",
        "html_content": f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }}
        .container {{
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #4F46E5;
            font-size: 28px;
            margin-bottom: 20px;
        }}
        h2 {{
            color: #4F46E5;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        .intro {{
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
        }}
        .cta-button {{
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .calculator-preview {{
            background: linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%);
            color: white;
            padding: 24px;
            border-radius: 8px;
            margin: 30px 0;
        }}
        .calculator-preview h3 {{
            margin: 0 0 12px 0;
            font-size: 20px;
        }}
        .calculator-preview p {{
            margin: 0;
            opacity: 0.95;
        }}
        .feature-list {{
            background: #f3f4f6;
            padding: 24px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .feature-list li {{
            margin: 12px 0;
            color: #4b5563;
        }}
        .metric-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
        }}
        .metric-card {{
            background: #fef3c7;
            padding: 16px;
            border-radius: 6px;
            text-align: center;
        }}
        .metric-card strong {{
            display: block;
            color: #92400e;
            font-size: 14px;
            margin-bottom: 4px;
        }}
        .metric-card span {{
            font-size: 24px;
            font-weight: 700;
            color: #78350f;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Run the Numbers with Our Deal Calculator</h1>

        <p class="intro">
            Hi {user_name},
        </p>

        <p class="intro">
            Stop second-guessing your deals. PropIQ's Deal Calculator gives you institutional-grade
            financial modeling in a simple 3-tab interface. Model any scenario, project future cash flows,
            and make offers with confidence.
        </p>

        <a href="{APP_URL}/calculator" class="cta-button">Open Deal Calculator →</a>

        <div class="calculator-preview">
            <h3>🧮 Three Powerful Analysis Modes</h3>
            <p>
                <strong>Basic:</strong> Essential metrics (cash flow, ROI, cap rate)<br>
                <strong>Advanced:</strong> Deep financial analysis (DSCR, break-even, equity buildup)<br>
                <strong>Scenarios:</strong> Model best/worst case with 5-year projections
            </p>
        </div>

        <h2>What You Can Calculate</h2>

        <div class="feature-list">
            <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Monthly Cash Flow</strong> - Know your exact profit after all expenses</li>
                <li><strong>Cash-on-Cash Return</strong> - Measure annual return on your investment</li>
                <li><strong>Cap Rate</strong> - Compare to market benchmarks instantly</li>
                <li><strong>1% Rule Compliance</strong> - Verify if rent meets the industry standard</li>
                <li><strong>Debt Service Coverage Ratio</strong> - See if lenders will approve your loan</li>
                <li><strong>5-Year Projections</strong> - Model appreciation and equity growth</li>
                <li><strong>Break-Even Analysis</strong> - Know your minimum occupancy requirements</li>
                <li><strong>Deal Score (0-100)</strong> - Get an instant quality rating</li>
            </ul>
        </div>

        <div class="metric-grid">
            <div class="metric-card">
                <strong>Average Deal Score</strong>
                <span>73</span>
            </div>
            <div class="metric-card">
                <strong>Avg Cash Flow</strong>
                <span>$412/mo</span>
            </div>
        </div>

        <p style="text-align: center; color: #6b7280; font-size: 14px;">
            Based on 10,000+ analyses by PropIQ users
        </p>

        <h2>Pro Tips for Deal Analysis</h2>

        <div class="feature-list">
            <ol style="margin: 0; padding-left: 20px;">
                <li><strong>Always run scenarios</strong> - Test what happens if rent is 10% lower or vacancy is higher</li>
                <li><strong>Don't forget hidden costs</strong> - Include property management, CapEx reserves, and maintenance</li>
                <li><strong>Check the 1% rule</strong> - Monthly rent should be ≥1% of purchase price as a quick filter</li>
                <li><strong>Verify comps</strong> - Use PropIQ's analysis to cross-check your calculator assumptions</li>
            </ol>
        </div>

        <a href="{APP_URL}/calculator" class="cta-button">Try the Calculator Now →</a>

        <h2>Helpful information</h2>

        <p><strong>Your data and privacy</strong><br>
        To see how we protect your data, visit our <a href="{APP_URL}/privacy" style="color: #4F46E5;">privacy page</a>.</p>

        <p><strong>Share your feedback</strong><br>
        Use our support chat or email us at <a href="mailto:{SUPPORT_EMAIL}" style="color: #4F46E5;">{SUPPORT_EMAIL}</a></p>

        <div class="footer">
            <p>© 2025 PropIQ by LUNTRA. Making real estate investing smarter.</p>
            <p>
                <a href="{APP_URL}/unsubscribe?email={user_email}" style="color: #6b7280;">Unsubscribe</a> |
                <a href="{APP_URL}/privacy" style="color: #6b7280;">Privacy Policy</a> |
                <a href="{APP_URL}/terms" style="color: #6b7280;">Terms and Conditions</a>
            </p>
        </div>
    </div>
</body>
</html>
""",
        "delay_hours": 48  # Send 48 hours after signup
    }


def get_email_day_4(user_name: str = "there", user_email: str = "") -> Dict[str, Any]:
    """
    Day 4: Advanced Features & Success Stories
    Showcase premium features, testimonials, and upgrade paths
    """
    return {
        "subject": "Day 4 of 4: Join 1,000+ Investors Using PropIQ",
        "html_content": f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }}
        .container {{
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #4F46E5;
            font-size: 28px;
            margin-bottom: 20px;
        }}
        h2 {{
            color: #4F46E5;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        .intro {{
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
        }}
        .cta-button {{
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .testimonial {{
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-left: 4px solid #4F46E5;
            padding: 20px;
            margin: 24px 0;
            border-radius: 6px;
        }}
        .testimonial-text {{
            font-style: italic;
            color: #374151;
            margin-bottom: 12px;
        }}
        .testimonial-author {{
            color: #6b7280;
            font-size: 14px;
        }}
        .pricing-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
        }}
        .pricing-card {{
            background: white;
            border: 2px solid #e5e7eb;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }}
        .pricing-card.featured {{
            border-color: #4F46E5;
            background: linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%);
        }}
        .pricing-card h3 {{
            margin: 0 0 8px 0;
            color: #1f2937;
        }}
        .pricing-card .price {{
            font-size: 32px;
            font-weight: 700;
            color: #4F46E5;
            margin: 12px 0;
        }}
        .pricing-card ul {{
            text-align: left;
            padding-left: 20px;
            margin: 16px 0;
            font-size: 14px;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
            margin: 30px 0;
        }}
        .stat-card {{
            background: #fef3c7;
            padding: 16px;
            border-radius: 6px;
            text-align: center;
        }}
        .stat-card strong {{
            display: block;
            font-size: 24px;
            color: #78350f;
            margin-bottom: 4px;
        }}
        .stat-card span {{
            font-size: 12px;
            color: #92400e;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Join 1,000+ Investors Using PropIQ</h1>

        <p class="intro">
            Hi {user_name},
        </p>

        <p class="intro">
            Over the past few days, you've explored PropIQ's AI-powered analysis, deal calculator, and
            investment tools. Now let's talk about what successful investors are accomplishing with PropIQ Pro.
        </p>

        <div class="stats-grid">
            <div class="stat-card">
                <strong>25K+</strong>
                <span>Properties Analyzed</span>
            </div>
            <div class="stat-card">
                <strong>$2.1B</strong>
                <span>Deals Evaluated</span>
            </div>
            <div class="stat-card">
                <strong>1,000+</strong>
                <span>Active Investors</span>
            </div>
        </div>

        <h2>Success Stories</h2>

        <div class="testimonial">
            <p class="testimonial-text">
                "PropIQ helped me analyze 47 properties in one weekend. I found a triplex with 12% cash-on-cash
                return that I would have missed. The deal score flagged it as 'excellent' even though it needed
                work - the numbers were just that good."
            </p>
            <p class="testimonial-author">
                — Sarah M., Real Estate Investor, Denver
            </p>
        </div>

        <div class="testimonial">
            <p class="testimonial-text">
                "As a new investor, I was overwhelmed by the complexity of deal analysis. PropIQ's AI recommendations
                gave me the confidence to make my first offer. The calculator's scenario analysis helped me negotiate
                $15K off the asking price."
            </p>
            <p class="testimonial-author">
                — James K., First-time Investor, Atlanta
            </p>
        </div>

        <div class="testimonial">
            <p class="testimonial-text">
                "I upgraded to Pro after my trial and it paid for itself in the first month. The unlimited analyses
                let me evaluate my entire market. I now run every deal through PropIQ before making offers."
            </p>
            <p class="testimonial-author">
                — Michael R., Portfolio Investor, Phoenix
            </p>
        </div>

        <h2>Choose Your Plan</h2>

        <div class="pricing-grid">
            <div class="pricing-card">
                <h3>Starter</h3>
                <div class="price">$29<span style="font-size: 16px; font-weight: 400;">/mo</span></div>
                <ul>
                    <li>20 analyses/month</li>
                    <li>Full deal calculator</li>
                    <li>AI support chat</li>
                    <li>Email support</li>
                </ul>
            </div>

            <div class="pricing-card featured">
                <h3>Pro ⭐</h3>
                <div class="price">$79<span style="font-size: 16px; font-weight: 400;">/mo</span></div>
                <ul>
                    <li><strong>100 analyses/month</strong></li>
                    <li>Priority AI analysis</li>
                    <li>Advanced scenarios</li>
                    <li>Priority support</li>
                </ul>
            </div>
        </div>

        <p style="text-align: center; margin: 30px 0;">
            <strong>Special Launch Offer:</strong> Get 20% off any annual plan with code <strong>PROPIQ2025</strong>
        </p>

        <a href="{APP_URL}/pricing" class="cta-button">View All Plans & Upgrade →</a>

        <h2>What's Next?</h2>

        <p>Here are some ways to get the most out of PropIQ:</p>

        <ol style="color: #4b5563;">
            <li><strong>Analyze 5+ properties</strong> in your target market to understand pricing patterns</li>
            <li><strong>Save your analyses</strong> and compare them side-by-side</li>
            <li><strong>Use the calculator</strong> to model different financing scenarios before talking to lenders</li>
            <li><strong>Ask our AI support</strong> any questions about real estate investing or PropIQ features</li>
            <li><strong>Upgrade to Pro</strong> when you're ready to scale your analysis volume</li>
        </ol>

        <a href="{APP_URL}/analyze" class="cta-button">Analyze Another Property →</a>

        <h2>Need Help?</h2>

        <p>Our AI support chat is available 24/7, or you can email us at
        <a href="mailto:{SUPPORT_EMAIL}" style="color: #4F46E5;">{SUPPORT_EMAIL}</a>.
        We typically respond within 4 hours.</p>

        <p><strong>Your data and privacy</strong><br>
        To see how we protect your data, visit our <a href="{APP_URL}/privacy" style="color: #4F46E5;">privacy page</a>.</p>

        <div class="footer">
            <p>© 2025 PropIQ by LUNTRA. Making real estate investing smarter.</p>
            <p>
                This is the last email in your onboarding series. You'll continue to receive important
                account updates and occasional product announcements (you can adjust preferences in your settings).
            </p>
            <p>
                <a href="{APP_URL}/unsubscribe?email={user_email}" style="color: #6b7280;">Unsubscribe</a> |
                <a href="{APP_URL}/privacy" style="color: #6b7280;">Privacy Policy</a> |
                <a href="{APP_URL}/terms" style="color: #6b7280;">Terms and Conditions</a>
            </p>
        </div>
    </div>
</body>
</html>
""",
        "delay_hours": 72  # Send 72 hours after signup
    }


def get_onboarding_sequence(user_name: str = "there", user_email: str = "") -> list[Dict[str, Any]]:
    """
    Returns complete 4-day onboarding email sequence

    Args:
        user_name: User's first name (defaults to "there")
        user_email: User's email address for unsubscribe links

    Returns:
        List of email dictionaries with subject, html_content, and delay_hours
    """
    return [
        get_email_day_1(user_name, user_email),
        get_email_day_2(user_name, user_email),
        get_email_day_3(user_name, user_email),
        get_email_day_4(user_name, user_email),
    ]
