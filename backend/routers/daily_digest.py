"""
Daily Digest Email Service
Combines Sentry errors + GA4 analytics into single daily email

Sends:
- Daily summary (8 AM every day)
- Weekly summary (Monday 9 AM)
- On-demand digest (via API endpoint)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import os
import httpx
from config.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/digest", tags=["digest"])

# Configuration
SENTRY_AUTH_TOKEN = os.getenv("SENTRY_AUTH_TOKEN")
SENTRY_ORG_SLUG = os.getenv("SENTRY_ORG_SLUG")
SENTRY_FRONTEND_PROJECT = os.getenv("SENTRY_FRONTEND_PROJECT", "propiq-frontend")
SENTRY_BACKEND_PROJECT = os.getenv("SENTRY_BACKEND_PROJECT", "propiq-backend")
SENTRY_EXTENSION_PROJECT = os.getenv("SENTRY_EXTENSION_PROJECT", "propiq-extension")

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
DIGEST_RECIPIENTS = os.getenv("DIGEST_RECIPIENTS", "").split(",")  # Comma-separated emails


class DigestStats(BaseModel):
    """Daily digest statistics"""
    date: str
    total_errors: int
    critical_errors: int
    new_issues: int
    resolved_issues: int
    users_affected: int
    top_errors: List[Dict[str, Any]]
    projects: Dict[str, Dict[str, Any]]  # Per-project stats


class DigestResponse(BaseModel):
    """Response from digest endpoint"""
    success: bool
    message: str
    stats: Optional[DigestStats] = None


async def fetch_sentry_stats(project: str, days: int = 1) -> Dict[str, Any]:
    """
    Fetch error statistics from Sentry API

    Args:
        project: Project slug (propiq-frontend, propiq-backend, etc.)
        days: Number of days to look back

    Returns:
        Dictionary with error stats
    """
    if not SENTRY_AUTH_TOKEN:
        logger.warning("SENTRY_AUTH_TOKEN not set, skipping Sentry stats")
        return {
            "total_errors": 0,
            "critical_errors": 0,
            "new_issues": 0,
            "users_affected": 0,
            "top_errors": []
        }

    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        # Sentry API endpoint for issues
        url = f"https://sentry.io/api/0/projects/{SENTRY_ORG_SLUG}/{project}/issues/"

        headers = {
            "Authorization": f"Bearer {SENTRY_AUTH_TOKEN}",
            "Content-Type": "application/json",
        }

        params = {
            "statsPeriod": f"{days}d",
            "query": "is:unresolved",
            "sort": "freq",  # Sort by frequency
            "limit": 10,  # Top 10 errors
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params, timeout=30.0)
            response.raise_for_status()
            issues = response.json()

        # Process issues
        total_errors = sum(int(str(issue.get("count", "0")).replace(",", "")) for issue in issues if issue.get("count"))
        critical_errors = sum(1 for issue in issues if issue.get("level") == "fatal")
        users_affected = sum(int(issue.get("userCount", 0)) for issue in issues)

        # Get top errors
        top_errors = [
            {
                "title": issue.get("title", "Unknown error"),
                "count": issue.get("count", "0"),
                "users": issue.get("userCount", 0),
                "link": issue.get("permalink", ""),
                "first_seen": issue.get("firstSeen", ""),
                "last_seen": issue.get("lastSeen", ""),
            }
            for issue in issues[:5]  # Top 5
        ]

        return {
            "total_errors": total_errors,
            "critical_errors": critical_errors,
            "new_issues": len([i for i in issues if i.get("isUnhandled", False)]),
            "users_affected": users_affected,
            "top_errors": top_errors,
        }

    except Exception as e:
        logger.error(f"Failed to fetch Sentry stats for {project}: {e}", exc_info=True)
        return {
            "total_errors": 0,
            "critical_errors": 0,
            "new_issues": 0,
            "users_affected": 0,
            "top_errors": []
        }


async def send_digest_email(stats: DigestStats, is_weekly: bool = False) -> bool:
    """
    Send digest email via Resend

    Args:
        stats: Digest statistics
        is_weekly: Whether this is a weekly digest

    Returns:
        True if sent successfully
    """
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set, cannot send digest email")
        return False

    if not DIGEST_RECIPIENTS or DIGEST_RECIPIENTS == [""]:
        logger.warning("DIGEST_RECIPIENTS not set, cannot send digest email")
        return False

    try:
        # Import email template
        from utils.email_templates import get_daily_digest_template, get_weekly_digest_template

        # Choose template
        if is_weekly:
            html_content = get_weekly_digest_template(stats)
            subject = f"PropIQ Weekly Digest - {stats.date}"
        else:
            html_content = get_daily_digest_template(stats)
            subject = f"PropIQ Daily Digest - {stats.date}"

        # Send via Resend
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "from": "PropIQ <digest@propiq.luntra.one>",
            "to": DIGEST_RECIPIENTS,
            "subject": subject,
            "html": html_content,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()

        logger.info(f"Digest email sent to {len(DIGEST_RECIPIENTS)} recipient(s)")
        return True

    except Exception as e:
        logger.error(f"Failed to send digest email: {e}", exc_info=True)
        return False


@router.post("/generate", response_model=DigestResponse)
async def generate_digest(days: int = 1, send_email: bool = True) -> DigestResponse:
    """
    Generate daily/weekly digest

    Args:
        days: Number of days to include (1 for daily, 7 for weekly)
        send_email: Whether to send email (default True)

    Returns:
        Digest statistics
    """
    try:
        logger.info(f"Generating digest for last {days} day(s)")

        # Fetch stats from all Sentry projects
        frontend_stats = await fetch_sentry_stats(SENTRY_FRONTEND_PROJECT, days)
        backend_stats = await fetch_sentry_stats(SENTRY_BACKEND_PROJECT, days)
        extension_stats = await fetch_sentry_stats(SENTRY_EXTENSION_PROJECT, days)

        # Combine stats
        total_errors = (
            frontend_stats["total_errors"] +
            backend_stats["total_errors"] +
            extension_stats["total_errors"]
        )

        critical_errors = (
            frontend_stats["critical_errors"] +
            backend_stats["critical_errors"] +
            extension_stats["critical_errors"]
        )

        new_issues = (
            frontend_stats["new_issues"] +
            backend_stats["new_issues"] +
            extension_stats["new_issues"]
        )

        users_affected = max(
            frontend_stats["users_affected"],
            backend_stats["users_affected"],
            extension_stats["users_affected"]
        )

        # Combine top errors from all projects
        all_top_errors = (
            frontend_stats["top_errors"] +
            backend_stats["top_errors"] +
            extension_stats["top_errors"]
        )

        # Sort by count and take top 5
        all_top_errors.sort(key=lambda x: int(str(x["count"]).replace(",", "")), reverse=True)
        top_errors = all_top_errors[:5]

        # Create stats object
        stats = DigestStats(
            date=datetime.utcnow().strftime("%Y-%m-%d"),
            total_errors=total_errors,
            critical_errors=critical_errors,
            new_issues=new_issues,
            resolved_issues=0,  # TODO: Calculate resolved issues
            users_affected=users_affected,
            top_errors=top_errors,
            projects={
                "frontend": frontend_stats,
                "backend": backend_stats,
                "extension": extension_stats,
            }
        )

        # Send email if requested
        if send_email:
            is_weekly = days == 7
            email_sent = await send_digest_email(stats, is_weekly=is_weekly)
            message = "Digest generated and email sent" if email_sent else "Digest generated but email failed"
        else:
            message = "Digest generated (email not sent)"

        return DigestResponse(
            success=True,
            message=message,
            stats=stats
        )

    except Exception as e:
        logger.error(f"Failed to generate digest: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate digest: {str(e)}"
        )


@router.post("/daily", response_model=DigestResponse)
async def send_daily_digest() -> DigestResponse:
    """
    Generate and send daily digest

    This endpoint should be called by a cron job every day at 8 AM
    """
    return await generate_digest(days=1, send_email=True)


@router.post("/weekly", response_model=DigestResponse)
async def send_weekly_digest() -> DigestResponse:
    """
    Generate and send weekly digest

    This endpoint should be called by a cron job every Monday at 9 AM
    """
    return await generate_digest(days=7, send_email=True)


@router.get("/health")
async def digest_health() -> Dict[str, Any]:
    """
    Health check for digest service
    """
    return {
        "status": "healthy",
        "service": "daily_digest",
        "sentry_configured": bool(SENTRY_AUTH_TOKEN),
        "email_configured": bool(RESEND_API_KEY),
        "recipients_configured": bool(DIGEST_RECIPIENTS and DIGEST_RECIPIENTS != [""]),
        "timestamp": datetime.utcnow().isoformat(),
    }
