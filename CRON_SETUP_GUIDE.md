# PropIQ Cron Job Setup Guide

**Purpose:** Automatic daily sync of issue tracker (CSV ↔ GitHub Issues)

---

## ✅ Setup Complete!

Your cron job is **already set up and running**. This document explains how it works and how to manage it.

---

## 📅 Current Schedule

**Frequency:** Daily at 6:00 PM EST
**Script:** `/Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh`
**Logs:** `/Users/briandusape/Projects/propiq/logs/issue-sync-*.log`

---

## 🔍 How It Works

### What Happens Daily at 6 PM:

1. **Cron triggers** the sync script
2. **Script syncs** local CSV ↔ GitHub Issues bidirectionally
3. **Log created** with timestamp: `logs/issue-sync-YYYY-MM-DD_HH-MM-SS.log`
4. **Old logs cleaned** (automatically deletes logs older than 30 days)

### What Gets Synced:

- **Local → GitHub:** New bugs added to CSV get GitHub issues created
- **GitHub → Local:** GitHub issues (with `bug` label) get added to CSV
- **Updates:** Changes in either system sync to the other
- **Status:** Fixed bugs in CSV close GitHub issues automatically

---

## 📊 View Cron Job

```bash
# List all cron jobs
crontab -l

# View only PropIQ sync job
crontab -l | grep "daily-issue-sync"

# Output:
# 0 18 * * * /Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh
```

**Cron format explained:**
```
0 18 * * *
│ │  │ │ │
│ │  │ │ └─── Day of week (0-7, where 0 and 7 = Sunday)
│ │  │ └───── Month (1-12)
│ │  └─────── Day of month (1-31)
│ └────────── Hour (0-23)
└──────────── Minute (0-59)

0 18 * * * = Every day at 6:00 PM
```

---

## 📝 View Logs

### Latest log:
```bash
ls -t logs/issue-sync-*.log | head -1 | xargs cat
```

### All logs from today:
```bash
ls logs/issue-sync-$(date +%Y-%m-%d)*.log
```

### Search logs for errors:
```bash
grep -i "error\|fail" logs/issue-sync-*.log
```

### Tail live during sync (if running manually):
```bash
tail -f logs/issue-sync-*.log
```

---

## 🛠️ Manage Cron Job

### Edit Cron Job (Change Time)

```bash
# Open crontab editor
crontab -e

# Change the time (example: 9 AM instead of 6 PM)
# Change: 0 18 * * *
# To:     0 9 * * *

# Save and exit (ESC, :wq in vim)
```

**Common schedules:**
```bash
0 9 * * *      # Daily at 9 AM
0 18 * * *     # Daily at 6 PM (current)
0 */6 * * *    # Every 6 hours
0 0 * * *      # Midnight daily
0 12 * * 1     # Every Monday at noon
*/30 * * * *   # Every 30 minutes
```

### Disable Cron Job (Temporarily)

**Option 1: Comment out the line**
```bash
crontab -e

# Add # at the beginning:
# 0 18 * * * /Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh
```

**Option 2: Remove the cron job**
```bash
crontab -l | grep -v "daily-issue-sync.sh" | crontab -
```

### Re-enable Cron Job

```bash
# Run setup script again
./scripts/setup-cron.sh

# Or add manually:
(crontab -l 2>/dev/null; echo "0 18 * * * /Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh") | crontab -
```

---

## 🧪 Manual Testing

### Run sync manually (without waiting for cron):

```bash
# Full test with logging
./scripts/daily-issue-sync.sh

# Direct sync (no wrapper script)
node scripts/sync-issue-tracker.cjs sync

# Push only
node scripts/sync-issue-tracker.cjs push

# Pull only
node scripts/sync-issue-tracker.cjs pull
```

### Test at specific time (one-time):

```bash
# Schedule one-time run at 8 PM today
echo "0 20 * * * /Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh" | at now

# Or use `at` command (if installed)
echo "./scripts/daily-issue-sync.sh" | at 8:00 PM
```

---

## 🚨 Troubleshooting

### Cron job not running?

**Check if cron service is running (macOS):**
```bash
# macOS uses launchd, not traditional cron
# Verify crontab exists:
crontab -l

# Check system logs for cron errors:
log show --predicate 'process == "cron"' --last 1h

# Or check Console.app → search for "cron"
```

**Check script permissions:**
```bash
ls -la scripts/daily-issue-sync.sh
# Should show: -rwxr-xr-x (executable)

# If not executable:
chmod +x scripts/daily-issue-sync.sh
```

**Check if gh CLI is authenticated:**
```bash
gh auth status

# If not authenticated:
gh auth login
```

### Logs not being created?

**Check logs directory exists:**
```bash
mkdir -p /Users/briandusape/Projects/propiq/logs
chmod 755 /Users/briandusape/Projects/propiq/logs
```

**Run manually to see errors:**
```bash
./scripts/daily-issue-sync.sh
# Watch for any error messages
```

### Sync failing?

**Check last log file:**
```bash
cat $(ls -t logs/issue-sync-*.log | head -1)
```

**Common issues:**

1. **"gh: command not found"**
   ```bash
   brew install gh
   gh auth login
   ```

2. **"CSV parse error"**
   - Ensure CSV fields with commas are quoted
   - Check CSV format matches expected columns

3. **"GitHub API rate limit"**
   - Wait for rate limit reset (check: `gh api rate_limit`)
   - Authenticated users get higher limits

4. **"Permission denied"**
   ```bash
   chmod +x scripts/daily-issue-sync.sh
   chmod +x scripts/sync-issue-tracker.cjs
   ```

---

## 📧 Email Notifications (Optional)

### Get email when sync fails:

**macOS:**
```bash
# Install mailutils (if not installed)
brew install mailutils

# Edit crontab to add MAILTO
crontab -e

# Add at top of crontab:
MAILTO="your-email@example.com"

# Cron will email you if script exits with error
```

**Or use custom notification:**

Edit `scripts/daily-issue-sync.sh` and add at the end:
```bash
if [ $SYNC_EXIT_CODE -ne 0 ]; then
    # Send notification (macOS)
    osascript -e 'display notification "Issue sync failed!" with title "PropIQ"'

    # Or send Slack message (if webhook configured)
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"PropIQ issue sync failed"}' \
        $SLACK_WEBHOOK_URL
fi
```

---

## 📊 Monitoring

### Check sync history:

```bash
# Count successful syncs this month
grep "Sync completed successfully" logs/issue-sync-$(date +%Y-%m)-*.log | wc -l

# Count failed syncs
grep "Sync failed" logs/issue-sync-*.log | wc -l

# Average sync duration
grep "Completed:" logs/issue-sync-*.log | tail -10
```

### Create monthly report:

```bash
# Script to summarize last 30 days
cat > scripts/sync-report.sh << 'EOF'
#!/bin/bash
echo "PropIQ Issue Sync - Last 30 Days"
echo "=================================="
echo ""
echo "Total syncs: $(ls logs/issue-sync-*.log | wc -l)"
echo "Successful: $(grep -l "successfully" logs/issue-sync-*.log | wc -l)"
echo "Failed: $(grep -l "failed" logs/issue-sync-*.log | wc -l)"
echo ""
echo "Latest sync:"
cat $(ls -t logs/issue-sync-*.log | head -1) | tail -5
EOF

chmod +x scripts/sync-report.sh
./scripts/sync-report.sh
```

---

## 🔄 Sync Frequency Options

### Change from daily to different frequency:

**Every 6 hours:**
```bash
0 */6 * * * /Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh
```

**Twice daily (9 AM and 6 PM):**
```bash
0 9,18 * * * /Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh
```

**Weekdays only (Monday-Friday at 6 PM):**
```bash
0 18 * * 1-5 /Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh
```

**Once a week (Sunday at noon):**
```bash
0 12 * * 0 /Users/briandusape/Projects/propiq/scripts/daily-issue-sync.sh
```

---

## 🗑️ Uninstall

### Remove cron job completely:

```bash
# Remove from crontab
crontab -l | grep -v "daily-issue-sync.sh" | crontab -

# Verify removed
crontab -l

# Optional: Delete logs
rm -rf logs/issue-sync-*.log
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `scripts/daily-issue-sync.sh` | Main cron wrapper script |
| `scripts/sync-issue-tracker.cjs` | Node.js sync engine |
| `scripts/setup-cron.sh` | One-time cron installation |
| `logs/issue-sync-*.log` | Sync execution logs |
| `PROPIQ_BUG_TRACKER.csv` | Local bug database |

---

## ✅ Verification Checklist

After setup, verify everything works:

- [x] Cron job shows in `crontab -l`
- [x] Script is executable (`ls -la scripts/daily-issue-sync.sh`)
- [x] Logs directory exists (`ls -la logs/`)
- [x] Manual test successful (`./scripts/daily-issue-sync.sh`)
- [x] Log file created (`ls logs/issue-sync-*.log`)
- [x] CSV synced with GitHub (`node scripts/sync-issue-tracker.cjs sync`)
- [x] GitHub authenticated (`gh auth status`)

---

## 🎯 Quick Commands Reference

```bash
# View cron job
crontab -l | grep daily-issue-sync

# Run manual sync
./scripts/daily-issue-sync.sh

# View latest log
cat $(ls -t logs/issue-sync-*.log | head -1)

# Edit cron schedule
crontab -e

# Disable cron
crontab -l | grep -v daily-issue-sync.sh | crontab -

# Re-enable cron
./scripts/setup-cron.sh

# Check if it ran today
ls logs/issue-sync-$(date +%Y-%m-%d)*.log

# View today's syncs
cat logs/issue-sync-$(date +%Y-%m-%d)*.log
```

---

## 📖 Related Documentation

- [HYBRID_ISSUE_TRACKING.md](HYBRID_ISSUE_TRACKING.md) - Complete tracking system docs
- [ISSUE_TRACKING_QUICK_START.md](ISSUE_TRACKING_QUICK_START.md) - Quick start guide
- [BUG_TRACKING_STRATEGY.md](BUG_TRACKING_STRATEGY.md) - Overall strategy

---

**Status:** ✅ Cron job active and running
**Schedule:** Daily at 6:00 PM EST
**Last Updated:** January 4, 2026
