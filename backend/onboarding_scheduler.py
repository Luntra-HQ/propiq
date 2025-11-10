"""
Onboarding Email Scheduler
Runs periodically to send scheduled onboarding emails

Usage:
    1. One-time execution (for cron):
       python onboarding_scheduler.py

    2. Continuous execution with APScheduler (for background process):
       python onboarding_scheduler.py --daemon

    3. Set up as cron job (recommended for production):
       # Run every hour
       0 * * * * cd /path/to/backend && python onboarding_scheduler.py
"""

import asyncio
import sys
import os
from datetime import datetime
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config.logging_config import get_logger
from utils.onboarding_campaign import process_scheduled_onboarding_emails

logger = get_logger(__name__)


async def run_scheduler_once():
    """Run the scheduler once and exit"""
    logger.info("=" * 80)
    logger.info(f"🕐 Onboarding Email Scheduler Started at {datetime.utcnow().isoformat()}")
    logger.info("=" * 80)

    try:
        await process_scheduled_onboarding_emails()
        logger.info("✅ Scheduler completed successfully")
        return 0
    except Exception as e:
        logger.error(f"❌ Scheduler failed: {e}", exc_info=True)
        return 1


async def run_scheduler_daemon():
    """Run the scheduler continuously with APScheduler"""
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
    except ImportError:
        logger.error("❌ APScheduler not installed. Install with: pip install apscheduler")
        return 1

    logger.info("=" * 80)
    logger.info("🚀 Starting Onboarding Email Scheduler (Daemon Mode)")
    logger.info("📅 Emails will be checked every hour")
    logger.info("=" * 80)

    scheduler = AsyncIOScheduler()

    # Schedule to run every hour
    scheduler.add_job(
        process_scheduled_onboarding_emails,
        'interval',
        hours=1,
        next_run_time=datetime.now()  # Run immediately on start
    )

    scheduler.start()
    logger.info("✅ Scheduler started successfully")

    try:
        # Keep the script running
        await asyncio.Event().wait()
    except (KeyboardInterrupt, SystemExit):
        logger.info("🛑 Shutting down scheduler...")
        scheduler.shutdown()
        return 0


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Onboarding Email Scheduler")
    parser.add_argument(
        "--daemon",
        action="store_true",
        help="Run as a daemon process (requires apscheduler)"
    )
    args = parser.parse_args()

    if args.daemon:
        exit_code = asyncio.run(run_scheduler_daemon())
    else:
        exit_code = asyncio.run(run_scheduler_once())

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
