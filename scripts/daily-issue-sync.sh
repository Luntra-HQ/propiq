#!/bin/bash

###############################################################################
# PropIQ Daily Issue Tracker Sync
#
# This script runs daily to sync local CSV bug tracker with GitHub Issues
#
# Schedule: Daily at 6:00 PM
# Logs: propiq/logs/issue-sync-YYYY-MM-DD.log
#
# Usage:
#   ./scripts/daily-issue-sync.sh
#
# Cron setup:
#   crontab -e
#   0 18 * * * /Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh
###############################################################################

# Configuration
PROJECT_DIR="/Users/briandusape/Projects/propiq"
LOG_DIR="$PROJECT_DIR/logs"
SYNC_SCRIPT="$PROJECT_DIR/scripts/sync-issue-tracker.cjs"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/issue-sync-$TIMESTAMP.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Start logging
echo "========================================" | tee -a "$LOG_FILE"
echo "PropIQ Issue Tracker Sync" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Change to project directory
cd "$PROJECT_DIR" || {
    echo "ERROR: Could not change to project directory: $PROJECT_DIR" | tee -a "$LOG_FILE"
    exit 1
}

# Check if sync script exists
if [ ! -f "$SYNC_SCRIPT" ]; then
    echo "ERROR: Sync script not found: $SYNC_SCRIPT" | tee -a "$LOG_FILE"
    exit 1
fi

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "ERROR: GitHub CLI (gh) not found. Install with: brew install gh" | tee -a "$LOG_FILE"
    exit 1
fi

# Check if authenticated with gh
if ! gh auth status &> /dev/null; then
    echo "ERROR: Not authenticated with GitHub CLI. Run: gh auth login" | tee -a "$LOG_FILE"
    exit 1
fi

# Run the sync
echo "Running sync..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

node "$SYNC_SCRIPT" sync 2>&1 | tee -a "$LOG_FILE"
SYNC_EXIT_CODE=${PIPESTATUS[0]}

echo "" | tee -a "$LOG_FILE"

# Check if sync was successful
if [ $SYNC_EXIT_CODE -eq 0 ]; then
    echo "✅ Sync completed successfully" | tee -a "$LOG_FILE"
else
    echo "❌ Sync failed with exit code: $SYNC_EXIT_CODE" | tee -a "$LOG_FILE"
fi

# Summary
echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Keep only last 30 days of logs
find "$LOG_DIR" -name "issue-sync-*.log" -mtime +30 -delete

# Exit with sync exit code
exit $SYNC_EXIT_CODE
