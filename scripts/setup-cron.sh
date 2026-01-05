#!/bin/bash

###############################################################################
# PropIQ Cron Job Setup Script
#
# This script adds a daily cron job to sync issue tracker
#
# Usage:
#   ./scripts/setup-cron.sh
#
# What it does:
#   - Backs up current crontab
#   - Adds daily sync at 6:00 PM
#   - Verifies cron job was added
###############################################################################

# Configuration
PROJECT_DIR="/Users/briandusape/Projects/propiq"
SYNC_SCRIPT="$PROJECT_DIR/scripts/daily-issue-sync.sh"
CRON_TIME="0 18 * * *"  # Daily at 6:00 PM
CRON_JOB="$CRON_TIME $SYNC_SCRIPT"

echo "========================================="
echo "PropIQ Cron Job Setup"
echo "========================================="
echo ""

# Check if sync script exists
if [ ! -f "$SYNC_SCRIPT" ]; then
    echo "❌ Error: Sync script not found: $SYNC_SCRIPT"
    exit 1
fi

# Make sure sync script is executable
chmod +x "$SYNC_SCRIPT"

# Backup current crontab
echo "📦 Backing up current crontab..."
crontab -l > "$PROJECT_DIR/logs/crontab-backup-$(date +%Y%m%d-%H%M%S).txt" 2>/dev/null || true
echo "✅ Backup created"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "daily-issue-sync.sh"; then
    echo "⚠️  Cron job already exists!"
    echo ""
    echo "Current cron job:"
    crontab -l 2>/dev/null | grep "daily-issue-sync.sh"
    echo ""
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. No changes made."
        exit 0
    fi

    # Remove existing cron job
    echo "🗑️  Removing old cron job..."
    crontab -l 2>/dev/null | grep -v "daily-issue-sync.sh" | crontab -
fi

# Add new cron job
echo "➕ Adding new cron job..."
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

# Verify cron job was added
echo ""
echo "✅ Cron job added successfully!"
echo ""
echo "Scheduled: Daily at 6:00 PM"
echo "Script: $SYNC_SCRIPT"
echo ""
echo "Current crontab:"
echo "─────────────────────────────────────────"
crontab -l | grep -A2 -B2 "daily-issue-sync.sh" || crontab -l | tail -3
echo "─────────────────────────────────────────"
echo ""
echo "📝 To view all cron jobs: crontab -l"
echo "📝 To edit cron jobs: crontab -e"
echo "📝 To remove this job: crontab -l | grep -v daily-issue-sync.sh | crontab -"
echo ""
echo "🎉 Setup complete!"
