"""
Email Templates for PropIQ Daily Digest
Combines Sentry errors + GA4 analytics into single email report
"""

from typing import Dict, Any
import os
from datetime import datetime

# Email configuration
FROM_EMAIL = os.getenv("FROM_EMAIL", "digest@propiq.luntra.one")
APP_URL = os.getenv("APP_URL", "https://propiq.luntra.one")


def get_daily_digest_template(stats) -> str:
    """
    Daily digest email template

    Args:
        stats: DigestStats object with error and analytics data

    Returns:
        HTML email content
    """
    # Get top errors (up to 5)
    top_errors_html = ""
    for i, error in enumerate(stats.top_errors[:5], 1):
        top_errors_html += f"""
        <div class="error-item">
            <div class="error-number">{i}</div>
            <div class="error-details">
                <div class="error-title">{error['title']}</div>
                <div class="error-meta">
                    <span class="error-count">{error['count']} occurrences</span>
                    <span class="error-users">• {error['users']} users affected</span>
                </div>
                <a href="{error['link']}" class="error-link">View in Sentry →</a>
            </div>
        </div>
        """

    # Calculate error rate
    total_events = stats.total_errors if stats.total_errors > 0 else 1
    error_rate = (stats.total_errors / (total_events * 10)) * 100  # Rough estimate
    error_rate_color = "#28a745" if error_rate < 1 else "#ffc107" if error_rate < 5 else "#dc3545"

    # Project breakdown
    project_html = ""
    for project_name, project_data in stats.projects.items():
        project_html += f"""
        <div class="project-card">
            <div class="project-name">{project_name.title()}</div>
            <div class="project-stats">
                <span>{project_data['total_errors']} errors</span>
                <span>• {project_data['users_affected']} users</span>
                <span>• {project_data['new_issues']} new issues</span>
            </div>
        </div>
        """

    return f"""
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
            max-width: 700px;
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
        .header {{
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        h1 {{
            color: #4F46E5;
            font-size: 24px;
            margin: 0 0 8px 0;
        }}
        .date {{
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin: 30px 0;
        }}
        .stat-card {{
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
        }}
        .stat-value {{
            font-size: 32px;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 8px 0;
        }}
        .stat-label {{
            font-size: 13px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }}
        .stat-card.critical .stat-value {{
            color: #dc3545;
        }}
        .stat-card.good .stat-value {{
            color: #28a745;
        }}
        .section {{
            margin: 40px 0;
        }}
        .section-title {{
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }}
        .error-item {{
            display: flex;
            gap: 16px;
            padding: 16px;
            background: #fef2f2;
            border-left: 4px solid #dc3545;
            border-radius: 6px;
            margin-bottom: 12px;
        }}
        .error-number {{
            font-size: 20px;
            font-weight: 700;
            color: #dc3545;
            width: 30px;
            flex-shrink: 0;
        }}
        .error-details {{
            flex: 1;
        }}
        .error-title {{
            font-size: 15px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 6px;
        }}
        .error-meta {{
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
        }}
        .error-count {{
            font-weight: 600;
        }}
        .error-link {{
            font-size: 13px;
            color: #4F46E5;
            text-decoration: none;
        }}
        .error-link:hover {{
            text-decoration: underline;
        }}
        .project-card {{
            background: #f3f4f6;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 12px;
        }}
        .project-name {{
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
        }}
        .project-stats {{
            font-size: 14px;
            color: #6b7280;
        }}
        .project-stats span {{
            margin-right: 8px;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
            text-align: center;
        }}
        .footer-links {{
            margin: 16px 0;
        }}
        .footer-links a {{
            color: #4F46E5;
            text-decoration: none;
            margin: 0 12px;
        }}
        .empty-state {{
            padding: 40px;
            text-align: center;
            color: #6b7280;
            background: #f9fafb;
            border-radius: 8px;
        }}
        .empty-state-icon {{
            font-size: 48px;
            margin-bottom: 16px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 PropIQ Daily Digest</h1>
            <p class="date">{stats.date}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{stats.total_errors}</div>
                <div class="stat-label">Total Errors</div>
            </div>
            <div class="stat-card critical">
                <div class="stat-value">{stats.critical_errors}</div>
                <div class="stat-label">Critical</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.new_issues}</div>
                <div class="stat-label">New Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.users_affected}</div>
                <div class="stat-label">Users Affected</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Top Errors (Last 24 Hours)</h2>
            {top_errors_html if stats.top_errors else '<div class="empty-state"><div class="empty-state-icon">✅</div><p>No errors in the last 24 hours!</p></div>'}
        </div>

        <div class="section">
            <h2 class="section-title">Project Breakdown</h2>
            {project_html}
        </div>

        <div class="footer">
            <div class="footer-links">
                <a href="https://sentry.io/organizations/{os.getenv('SENTRY_ORG_SLUG', 'propiq')}/issues/">View All Issues</a>
                <a href="{APP_URL}">PropIQ Dashboard</a>
            </div>
            <p>PropIQ Daily Digest • Powered by Sentry & GA4</p>
        </div>
    </div>
</body>
</html>
    """


def get_weekly_digest_template(stats) -> str:
    """
    Weekly digest email template (more detailed than daily)

    Args:
        stats: DigestStats object with error and analytics data

    Returns:
        HTML email content
    """
    # Get top errors (up to 10 for weekly)
    top_errors_html = ""
    for i, error in enumerate(stats.top_errors[:10], 1):
        # Determine severity badge
        error_count = int(str(error['count']).replace(',', ''))
        severity_badge = ""
        if error_count >= 50:
            severity_badge = '<span class="badge badge-critical">Critical</span>'
        elif error_count >= 20:
            severity_badge = '<span class="badge badge-high">High</span>'
        elif error_count >= 10:
            severity_badge = '<span class="badge badge-medium">Medium</span>'
        else:
            severity_badge = '<span class="badge badge-low">Low</span>'

        top_errors_html += f"""
        <div class="error-item">
            <div class="error-header">
                <div class="error-number">{i}</div>
                <div class="error-title-wrapper">
                    <div class="error-title">{error['title']}</div>
                    {severity_badge}
                </div>
            </div>
            <div class="error-details">
                <div class="error-meta">
                    <span class="error-count">{error['count']} occurrences</span>
                    <span class="error-users">• {error['users']} users affected</span>
                </div>
                <div class="error-timeline">
                    First seen: {error.get('first_seen', 'N/A')[:10]} |
                    Last seen: {error.get('last_seen', 'N/A')[:10]}
                </div>
                <a href="{error['link']}" class="error-link">View in Sentry →</a>
            </div>
        </div>
        """

    # Project breakdown with more details
    project_html = ""
    for project_name, project_data in stats.projects.items():
        # Calculate percentage of total
        percentage = (project_data['total_errors'] / stats.total_errors * 100) if stats.total_errors > 0 else 0

        project_html += f"""
        <div class="project-card">
            <div class="project-header">
                <div class="project-name">{project_name.title()}</div>
                <div class="project-percentage">{percentage:.1f}% of total</div>
            </div>
            <div class="project-stats-grid">
                <div class="project-stat">
                    <div class="project-stat-value">{project_data['total_errors']}</div>
                    <div class="project-stat-label">Errors</div>
                </div>
                <div class="project-stat">
                    <div class="project-stat-value">{project_data['critical_errors']}</div>
                    <div class="project-stat-label">Critical</div>
                </div>
                <div class="project-stat">
                    <div class="project-stat-value">{project_data['new_issues']}</div>
                    <div class="project-stat-label">New</div>
                </div>
                <div class="project-stat">
                    <div class="project-stat-value">{project_data['users_affected']}</div>
                    <div class="project-stat-label">Users</div>
                </div>
            </div>
        </div>
        """

    # Weekly summary insights
    trend = "↑" if stats.total_errors > 100 else "↓"
    trend_color = "#dc3545" if trend == "↑" else "#28a745"

    return f"""
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
            max-width: 700px;
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
        .header {{
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        h1 {{
            color: #4F46E5;
            font-size: 28px;
            margin: 0 0 8px 0;
        }}
        .date {{
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }}
        .summary-banner {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }}
        .summary-text {{
            font-size: 18px;
            margin: 0 0 16px 0;
        }}
        .summary-highlight {{
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin: 30px 0;
        }}
        .stat-card {{
            background: #f9fafb;
            padding: 24px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
        }}
        .stat-value {{
            font-size: 36px;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 8px 0;
        }}
        .stat-label {{
            font-size: 13px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }}
        .stat-card.critical .stat-value {{
            color: #dc3545;
        }}
        .stat-card.good .stat-value {{
            color: #28a745;
        }}
        .section {{
            margin: 40px 0;
        }}
        .section-title {{
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }}
        .error-item {{
            padding: 20px;
            background: #fef2f2;
            border-left: 4px solid #dc3545;
            border-radius: 6px;
            margin-bottom: 16px;
        }}
        .error-header {{
            display: flex;
            gap: 16px;
            align-items: flex-start;
            margin-bottom: 12px;
        }}
        .error-number {{
            font-size: 24px;
            font-weight: 700;
            color: #dc3545;
            width: 35px;
            flex-shrink: 0;
        }}
        .error-title-wrapper {{
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }}
        .error-title {{
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
        }}
        .badge {{
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .badge-critical {{
            background: #dc3545;
            color: white;
        }}
        .badge-high {{
            background: #fd7e14;
            color: white;
        }}
        .badge-medium {{
            background: #ffc107;
            color: #1f2937;
        }}
        .badge-low {{
            background: #e5e7eb;
            color: #6b7280;
        }}
        .error-details {{
            padding-left: 51px;
        }}
        .error-meta {{
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 6px;
        }}
        .error-timeline {{
            font-size: 13px;
            color: #9ca3af;
            margin-bottom: 10px;
        }}
        .error-count {{
            font-weight: 600;
        }}
        .error-link {{
            font-size: 14px;
            color: #4F46E5;
            text-decoration: none;
        }}
        .error-link:hover {{
            text-decoration: underline;
        }}
        .project-card {{
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 16px;
            border: 1px solid #e5e7eb;
        }}
        .project-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }}
        .project-name {{
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
        }}
        .project-percentage {{
            font-size: 14px;
            color: #6b7280;
            background: white;
            padding: 4px 12px;
            border-radius: 12px;
        }}
        .project-stats-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
        }}
        .project-stat {{
            text-align: center;
        }}
        .project-stat-value {{
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 4px;
        }}
        .project-stat-label {{
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
            text-align: center;
        }}
        .footer-links {{
            margin: 16px 0;
        }}
        .footer-links a {{
            color: #4F46E5;
            text-decoration: none;
            margin: 0 12px;
        }}
        .empty-state {{
            padding: 60px 40px;
            text-align: center;
            color: #6b7280;
            background: #f9fafb;
            border-radius: 8px;
        }}
        .empty-state-icon {{
            font-size: 64px;
            margin-bottom: 16px;
        }}
        .empty-state-title {{
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 PropIQ Weekly Summary</h1>
            <p class="date">Week of {stats.date}</p>
        </div>

        <div class="summary-banner">
            <p class="summary-text">
                This week, PropIQ recorded <strong>{stats.total_errors} errors</strong> across all projects,
                affecting <strong>{stats.users_affected} users</strong>.
            </p>
            <p class="summary-highlight">
                {stats.new_issues} new issues were introduced and {stats.resolved_issues} issues were resolved.
            </p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{stats.total_errors}</div>
                <div class="stat-label">Total Errors</div>
            </div>
            <div class="stat-card critical">
                <div class="stat-value">{stats.critical_errors}</div>
                <div class="stat-label">Critical</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.new_issues}</div>
                <div class="stat-label">New Issues</div>
            </div>
            <div class="stat-card good">
                <div class="stat-value">{stats.resolved_issues}</div>
                <div class="stat-label">Resolved</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats.users_affected}</div>
                <div class="stat-label">Users Affected</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Top 10 Issues This Week</h2>
            {top_errors_html if stats.top_errors else '<div class="empty-state"><div class="empty-state-icon">🎉</div><div class="empty-state-title">Perfect Week!</div><p>No errors reported this week.</p></div>'}
        </div>

        <div class="section">
            <h2 class="section-title">Project Breakdown</h2>
            {project_html}
        </div>

        <div class="footer">
            <div class="footer-links">
                <a href="https://sentry.io/organizations/{os.getenv('SENTRY_ORG_SLUG', 'propiq')}/issues/">View All Issues</a>
                <a href="https://sentry.io/organizations/{os.getenv('SENTRY_ORG_SLUG', 'propiq')}/stats/">Error Statistics</a>
                <a href="{APP_URL}">PropIQ Dashboard</a>
            </div>
            <p>PropIQ Weekly Digest • Powered by Sentry & GA4</p>
            <p style="margin-top: 8px; font-size: 12px;">
                You're receiving this email because you're an admin for PropIQ.
            </p>
        </div>
    </div>
</body>
</html>
    """
