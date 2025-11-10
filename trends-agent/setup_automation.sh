#!/bin/bash

# Automation Setup for PropIQ Trends Monitor

SCHEDULE="${1:-weekly}"  # daily or weekly

echo "=================================================="
echo "PropIQ Trends Monitor - Automation Setup"
echo "=================================================="
echo ""
echo "Schedule: $SCHEDULE"
echo ""

# Get the absolute path to the trends-agent directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONITOR_SCRIPT="$SCRIPT_DIR/propiq_trends_monitor.py"

if [ ! -f "$MONITOR_SCRIPT" ]; then
    echo "❌ Error: Monitor script not found at $MONITOR_SCRIPT"
    exit 1
fi

# Determine cron schedule
if [ "$SCHEDULE" = "daily" ]; then
    CRON_SCHEDULE="0 9 * * *"  # 9 AM daily
    SCHEDULE_DESC="Daily at 9:00 AM"
elif [ "$SCHEDULE" = "weekly" ]; then
    CRON_SCHEDULE="0 9 * * 1"  # 9 AM every Monday
    SCHEDULE_DESC="Weekly on Monday at 9:00 AM"
elif [ "$SCHEDULE" = "biweekly" ]; then
    CRON_SCHEDULE="0 9 1,15 * *"  # 9 AM on 1st and 15th of month
    SCHEDULE_DESC="Bi-weekly on 1st and 15th at 9:00 AM"
else
    echo "❌ Invalid schedule: $SCHEDULE"
    echo "   Usage: ./setup_automation.sh [daily|weekly|biweekly]"
    exit 1
fi

echo "Cron schedule: $CRON_SCHEDULE"
echo "Description: $SCHEDULE_DESC"
echo ""

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use launchd
    echo "Detected macOS - Setting up launchd..."
    echo ""

    PLIST_FILE="$HOME/Library/LaunchAgents/com.propiq.trendsmonitor.plist"

    cat > "$PLIST_FILE" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.propiq.trendsmonitor</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$MONITOR_SCRIPT</string>
        <string>--weeks</string>
        <string>1</string>
        <string>--save-history</string>
    </array>

    <key>WorkingDirectory</key>
    <string>$SCRIPT_DIR</string>

    <key>StandardOutPath</key>
    <string>$SCRIPT_DIR/launchd.log</string>

    <key>StandardErrorPath</key>
    <string>$SCRIPT_DIR/launchd-error.log</string>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
$(if [ "$SCHEDULE" = "weekly" ]; then echo "        <key>Weekday</key>\n        <integer>1</integer>"; fi)
$(if [ "$SCHEDULE" = "biweekly" ]; then echo "        <key>Day</key>\n        <integer>1</integer>"; fi)
    </dict>

    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
EOF

    # Load the job
    launchctl unload "$PLIST_FILE" 2>/dev/null || true
    launchctl load "$PLIST_FILE"

    echo "✅ launchd job configured!"
    echo "   Plist file: $PLIST_FILE"
    echo ""
    echo "To test immediately:"
    echo "  launchctl start com.propiq.trendsmonitor"
    echo ""
    echo "To view logs:"
    echo "  tail -f $SCRIPT_DIR/launchd.log"
    echo ""
    echo "To disable:"
    echo "  launchctl unload $PLIST_FILE"

else
    # Linux - use cron
    echo "Detected Linux - Setting up cron job..."
    echo ""

    # Create cron command
    CRON_CMD="cd $SCRIPT_DIR && /usr/bin/python3 $MONITOR_SCRIPT --weeks 1 --save-history >> $SCRIPT_DIR/cron.log 2>&1"

    # Add to crontab
    (crontab -l 2>/dev/null | grep -v "propiq_trends_monitor.py" ; echo "$CRON_SCHEDULE $CRON_CMD") | crontab -

    echo "✅ Cron job configured!"
    echo "   Schedule: $CRON_SCHEDULE ($SCHEDULE_DESC)"
    echo ""
    echo "To view cron jobs:"
    echo "  crontab -l"
    echo ""
    echo "To view logs:"
    echo "  tail -f $SCRIPT_DIR/cron.log"
    echo ""
    echo "To remove:"
    echo "  crontab -e  # Then delete the line with propiq_trends_monitor.py"
fi

echo ""
echo "=================================================="
echo "✅ Automation Setup Complete!"
echo "=================================================="
echo ""
echo "The trends monitor will now run: $SCHEDULE_DESC"
echo ""
echo "Manual test:"
echo "  cd $SCRIPT_DIR"
echo "  python3 propiq_trends_monitor.py --weeks 1"
echo ""
