#!/bin/bash
# PropIQ - Automated Quarterly Rotation Reminder Setup
# Creates calendar events for API key rotation

set -e

echo "📅 PropIQ Quarterly Rotation Reminder Setup"
echo "==========================================="
echo ""

# Determine which calendar system to use
echo "Which calendar system do you use?"
echo ""
echo "1) macOS Calendar (Calendar.app)"
echo "2) Google Calendar (manual import)"
echo "3) Outlook Calendar (manual import)"
echo "4) Just create a text reminder"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📱 Setting up macOS Calendar reminders..."

        # Create AppleScript to add calendar events
        osascript <<EOF
tell application "Calendar"
    -- Create or find PropIQ calendar
    set calendarName to "PropIQ Security"
    set calendarFound to false

    repeat with cal in calendars
        if name of cal is calendarName then
            set targetCalendar to cal
            set calendarFound to true
            exit repeat
        end if
    end repeat

    if not calendarFound then
        set targetCalendar to make new calendar with properties {name:calendarName}
    end if

    -- Q1 2026 Rotation (March 30, 2026)
    set eventDate1 to date "Monday, March 30, 2026 9:00:00 AM"
    tell targetCalendar
        set newEvent to make new event with properties {summary:"🔐 PropIQ API Key Rotation", start date:eventDate1, end date:eventDate1 + 2 * hours, description:"Time to rotate all critical API keys for PropIQ!

Critical Keys (30-45 mins):
• Stripe (secret, publishable, webhook)
• Supabase (service key)
• Azure OpenAI
• MongoDB password
• SendGrid

Location: /Users/briandusape/Projects/propiq
Run: ./scripts/check-rotation-status.sh

See: QUICK_ROTATION_GUIDE.md", location:"/Users/briandusape/Projects/propiq"}

        -- Set alarms
        tell newEvent
            make new display alarm with properties {trigger interval:-1440} -- 1 day before
            make new display alarm with properties {trigger interval:-10080} -- 1 week before
        end tell
    end tell

    -- Q2 2026 Rotation (June 30, 2026)
    set eventDate2 to date "Tuesday, June 30, 2026 9:00:00 AM"
    tell targetCalendar
        set newEvent to make new event with properties {summary:"🔐 PropIQ API Key Rotation", start date:eventDate2, end date:eventDate2 + 2 * hours, description:"Quarterly API key rotation for PropIQ

Critical Keys:
• Stripe
• Supabase
• Azure OpenAI
• MongoDB
• SendGrid

Run: cd /Users/briandusape/Projects/propiq && ./scripts/check-rotation-status.sh

Guide: QUICK_ROTATION_GUIDE.md"}

        tell newEvent
            make new display alarm with properties {trigger interval:-1440}
            make new display alarm with properties {trigger interval:-10080}
        end tell
    end tell

    -- Q3 2026 Rotation (September 30, 2026)
    set eventDate3 to date "Wednesday, September 30, 2026 9:00:00 AM"
    tell targetCalendar
        set newEvent to make new event with properties {summary:"🔐 PropIQ API Key Rotation", start date:eventDate3, end date:eventDate3 + 2 * hours, description:"Quarterly API key rotation for PropIQ

Critical Keys:
• Stripe
• Supabase
• Azure OpenAI
• MongoDB
• SendGrid

Run: cd /Users/briandusape/Projects/propiq && ./scripts/check-rotation-status.sh

Guide: QUICK_ROTATION_GUIDE.md"}

        tell newEvent
            make new display alarm with properties {trigger interval:-1440}
            make new display alarm with properties {trigger interval:-10080}
        end tell
    end tell

    -- Q4 2026 Annual Rotation (December 30, 2026)
    set eventDate4 to date "Wednesday, December 30, 2026 9:00:00 AM"
    tell targetCalendar
        set newEvent to make new event with properties {summary:"🔐 PropIQ ANNUAL Key Rotation + Security Audit", start date:eventDate4, end date:eventDate4 + 3 * hours, description:"Annual security audit and complete API key rotation

ALL Keys (60-90 mins):
• Critical: Stripe, Supabase, Azure, MongoDB, SendGrid
• Moderate: Convex, JWT, Intercom, Slack
• Low: W&B, Sentry

Tasks:
1. Rotate all keys
2. Run security audit
3. Review access logs
4. Update documentation
5. Test all services

Run: cd /Users/briandusape/Projects/propiq && ./scripts/check-rotation-status.sh

Docs: SECURITY_AUDIT_REPORT.md"}

        tell newEvent
            make new display alarm with properties {trigger interval:-1440}
            make new display alarm with properties {trigger interval:-10080}
        end tell
    end tell

end tell
EOF

        echo ""
        echo "✅ Calendar events created successfully!"
        echo ""
        echo "📱 Open Calendar.app to see your reminders in the 'PropIQ Security' calendar"
        echo ""
        echo "Events created:"
        echo "  • March 30, 2026 (Q1) - Quarterly rotation"
        echo "  • June 30, 2026 (Q2) - Quarterly rotation"
        echo "  • September 30, 2026 (Q3) - Quarterly rotation"
        echo "  • December 30, 2026 (Q4) - Annual rotation + audit"
        echo ""
        echo "⏰ Each event has 2 alarms:"
        echo "  • 1 week before"
        echo "  • 1 day before"
        echo ""

        # Open Calendar app
        open -a Calendar
        ;;

    2)
        echo ""
        echo "📅 Creating Google Calendar import file..."

        # Create ICS file for Google Calendar
        cat > "/Users/briandusape/Projects/propiq/propiq-rotation-reminders.ics" <<'ICSEOF'
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PropIQ//Security Rotation Reminders//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PropIQ Security
X-WR-TIMEZONE:America/New_York
X-WR-CALDESC:Quarterly API key rotation reminders for PropIQ

BEGIN:VEVENT
DTSTART:20260330T130000Z
DTEND:20260330T150000Z
DTSTAMP:20251230T000000Z
UID:propiq-q1-2026@propiq.luntra.one
SUMMARY:🔐 PropIQ API Key Rotation
DESCRIPTION:Time to rotate all critical API keys for PropIQ!\n\nCritical Keys (30-45 mins):\n• Stripe (secret\, publishable\, webhook)\n• Supabase (service key)\n• Azure OpenAI\n• MongoDB password\n• SendGrid\n\nLocation: /Users/briandusape/Projects/propiq\nRun: ./scripts/check-rotation-status.sh\n\nSee: QUICK_ROTATION_GUIDE.md
LOCATION:/Users/briandusape/Projects/propiq
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P7D
DESCRIPTION:PropIQ API key rotation in 1 week
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
DESCRIPTION:PropIQ API key rotation tomorrow
ACTION:DISPLAY
END:VALARM
END:VEVENT

BEGIN:VEVENT
DTSTART:20260630T130000Z
DTEND:20260630T150000Z
DTSTAMP:20251230T000000Z
UID:propiq-q2-2026@propiq.luntra.one
SUMMARY:🔐 PropIQ API Key Rotation
DESCRIPTION:Quarterly API key rotation for PropIQ\n\nCritical Keys:\n• Stripe\n• Supabase\n• Azure OpenAI\n• MongoDB\n• SendGrid\n\nRun: cd /Users/briandusape/Projects/propiq && ./scripts/check-rotation-status.sh\n\nGuide: QUICK_ROTATION_GUIDE.md
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
END:VALARM
END:VEVENT

BEGIN:VEVENT
DTSTART:20260930T130000Z
DTEND:20260930T150000Z
DTSTAMP:20251230T000000Z
UID:propiq-q3-2026@propiq.luntra.one
SUMMARY:🔐 PropIQ API Key Rotation
DESCRIPTION:Quarterly API key rotation for PropIQ\n\nCritical Keys:\n• Stripe\n• Supabase\n• Azure OpenAI\n• MongoDB\n• SendGrid\n\nRun: cd /Users/briandusape/Projects/propiq && ./scripts/check-rotation-status.sh\n\nGuide: QUICK_ROTATION_GUIDE.md
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
END:VALARM
END:VEVENT

BEGIN:VEVENT
DTSTART:20261230T140000Z
DTEND:20261230T170000Z
DTSTAMP:20251230T000000Z
UID:propiq-annual-2026@propiq.luntra.one
SUMMARY:🔐 PropIQ ANNUAL Key Rotation + Security Audit
DESCRIPTION:Annual security audit and complete API key rotation\n\nALL Keys (60-90 mins):\n• Critical: Stripe\, Supabase\, Azure\, MongoDB\, SendGrid\n• Moderate: Convex\, JWT\, Intercom\, Slack\n• Low: W&B\, Sentry\n\nTasks:\n1. Rotate all keys\n2. Run security audit\n3. Review access logs\n4. Update documentation\n5. Test all services\n\nRun: cd /Users/briandusape/Projects/propiq && ./scripts/check-rotation-status.sh\n\nDocs: SECURITY_AUDIT_REPORT.md
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
END:VALARM
END:VEVENT

END:VCALENDAR
ICSEOF

        echo "✅ Calendar file created!"
        echo ""
        echo "📍 Location: /Users/briandusape/Projects/propiq/propiq-rotation-reminders.ics"
        echo ""
        echo "To import to Google Calendar:"
        echo "  1. Open Google Calendar (https://calendar.google.com)"
        echo "  2. Click the + next to 'Other calendars'"
        echo "  3. Select 'Import'"
        echo "  4. Choose: propiq-rotation-reminders.ics"
        echo "  5. Select which calendar to add to"
        echo "  6. Click 'Import'"
        echo ""
        echo "Events included:"
        echo "  • March 30, 2026 - Q1 Rotation"
        echo "  • June 30, 2026 - Q2 Rotation"
        echo "  • September 30, 2026 - Q3 Rotation"
        echo "  • December 30, 2026 - Annual Rotation + Audit"
        echo ""

        # Open the file in Finder
        open -R "/Users/briandusape/Projects/propiq/propiq-rotation-reminders.ics"
        ;;

    3)
        echo ""
        echo "📅 Creating Outlook Calendar import file..."

        # Same ICS file works for Outlook
        cat > "/Users/briandusape/Projects/propiq/propiq-rotation-reminders.ics" <<'ICSEOF'
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PropIQ//Security Rotation Reminders//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PropIQ Security
X-WR-TIMEZONE:America/New_York

BEGIN:VEVENT
DTSTART:20260330T130000Z
DTEND:20260330T150000Z
DTSTAMP:20251230T000000Z
UID:propiq-q1-2026@propiq.luntra.one
SUMMARY:🔐 PropIQ API Key Rotation
DESCRIPTION:Time to rotate all critical API keys for PropIQ!\n\nCritical Keys (30-45 mins):\n• Stripe\n• Supabase\n• Azure OpenAI\n• MongoDB\n• SendGrid\n\nRun: ./scripts/check-rotation-status.sh
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
END:VALARM
END:VEVENT

BEGIN:VEVENT
DTSTART:20260630T130000Z
DTEND:20260630T150000Z
DTSTAMP:20251230T000000Z
UID:propiq-q2-2026@propiq.luntra.one
SUMMARY:🔐 PropIQ API Key Rotation
DESCRIPTION:Quarterly rotation for PropIQ\n\nRun: cd /Users/briandusape/Projects/propiq && ./scripts/check-rotation-status.sh
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
END:VALARM
END:VEVENT

BEGIN:VEVENT
DTSTART:20260930T130000Z
DTEND:20260930T150000Z
DTSTAMP:20251230T000000Z
UID:propiq-q3-2026@propiq.luntra.one
SUMMARY:🔐 PropIQ API Key Rotation
DESCRIPTION:Quarterly rotation for PropIQ\n\nRun: ./scripts/check-rotation-status.sh
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
END:VALARM
END:VEVENT

BEGIN:VEVENT
DTSTART:20261230T140000Z
DTEND:20261230T170000Z
DTSTAMP:20251230T000000Z
UID:propiq-annual-2026@propiq.luntra.one
SUMMARY:🔐 PropIQ ANNUAL Rotation + Audit
DESCRIPTION:Annual security audit and complete key rotation (60-90 mins)\n\nRotate ALL keys and run security audit
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
END:VALARM
END:VEVENT

END:VCALENDAR
ICSEOF

        echo "✅ Calendar file created!"
        echo ""
        echo "📍 Location: /Users/briandusape/Projects/propiq/propiq-rotation-reminders.ics"
        echo ""
        echo "To import to Outlook:"
        echo "  1. Open Outlook"
        echo "  2. File → Open & Export → Import/Export"
        echo "  3. Select 'Import an iCalendar (.ics) or vCalendar file'"
        echo "  4. Browse to: propiq-rotation-reminders.ics"
        echo "  5. Click 'Open'"
        echo ""

        open -R "/Users/briandusape/Projects/propiq/propiq-rotation-reminders.ics"
        ;;

    4)
        echo ""
        echo "📝 Creating text reminder file..."

        cat > "/Users/briandusape/Projects/propiq/ROTATION_SCHEDULE.txt" <<'TXTEOF'
╔═══════════════════════════════════════════════════════════════╗
║              PropIQ API Key Rotation Schedule                 ║
╚═══════════════════════════════════════════════════════════════╝

📅 QUARTERLY ROTATION DATES

┌─────────────────────────────────────────────────────────────┐
│ Q1 2026 - March 30, 2026 (Monday)                           │
├─────────────────────────────────────────────────────────────┤
│ Time: 9:00 AM - 11:00 AM (2 hours blocked)                  │
│                                                              │
│ Rotate Critical Keys:                                        │
│   • Stripe (secret, publishable, webhook)                   │
│   • Supabase (service key)                                  │
│   • Azure OpenAI                                            │
│   • MongoDB password                                         │
│   • SendGrid                                                │
│                                                              │
│ Commands:                                                    │
│   cd /Users/briandusape/Projects/propiq                     │
│   ./scripts/check-rotation-status.sh                        │
│                                                              │
│ Guide: QUICK_ROTATION_GUIDE.md                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Q2 2026 - June 30, 2026 (Tuesday)                           │
├─────────────────────────────────────────────────────────────┤
│ Time: 9:00 AM - 11:00 AM                                    │
│                                                              │
│ Rotate Critical Keys (same as Q1)                           │
│                                                              │
│ Commands:                                                    │
│   cd /Users/briandusape/Projects/propiq                     │
│   ./scripts/check-rotation-status.sh                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Q3 2026 - September 30, 2026 (Wednesday)                    │
├─────────────────────────────────────────────────────────────┤
│ Time: 9:00 AM - 11:00 AM                                    │
│                                                              │
│ Rotate Critical Keys (same as Q1)                           │
│                                                              │
│ Commands:                                                    │
│   cd /Users/briandusape/Projects/propiq                     │
│   ./scripts/check-rotation-status.sh                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Q4 2026 - December 30, 2026 (Wednesday) **ANNUAL**         │
├─────────────────────────────────────────────────────────────┤
│ Time: 9:00 AM - 12:00 PM (3 hours blocked)                  │
│                                                              │
│ Rotate ALL Keys:                                            │
│   • Critical: Stripe, Supabase, Azure, MongoDB, SendGrid    │
│   • Moderate: Convex, JWT, Intercom, Slack                  │
│   • Low Priority: W&B, Sentry                               │
│                                                              │
│ Additional Tasks:                                            │
│   • Run full security audit                                 │
│   • Review access logs for all services                     │
│   • Update documentation                                    │
│   • Test all integrations                                   │
│   • Review and update rotation procedures                   │
│                                                              │
│ Commands:                                                    │
│   cd /Users/briandusape/Projects/propiq                     │
│   ./scripts/check-rotation-status.sh                        │
│                                                              │
│ Docs: SECURITY_AUDIT_REPORT.md                              │
└─────────────────────────────────────────────────────────────┘

⏰ REMINDERS

Set these reminders in your preferred system:

• 1 week before each date: "PropIQ key rotation next week"
• 1 day before each date: "PropIQ key rotation tomorrow"
• Day of: "Time to rotate PropIQ API keys"

📧 EMAIL YOURSELF

Send an email to yourself with subject:
"Quarterly Reminder: PropIQ API Key Rotation"

And schedule it to repeat every 3 months starting March 30, 2026

🔔 PHONE REMINDERS

Add to your phone:
• March 23, 2026: "PropIQ rotation next week"
• March 29, 2026: "PropIQ rotation tomorrow"
• March 30, 2026 9:00 AM: "Rotate PropIQ keys NOW"

Repeat for June, September, December

📋 CHECKLIST AFTER EACH ROTATION

□ All critical keys rotated
□ Old keys deleted from dashboards
□ Backend redeployed
□ Azure App Settings updated
□ All services tested
□ ./scripts/check-rotation-status.sh completed
□ Next rotation date confirmed in calendar

═══════════════════════════════════════════════════════════════

Next rotation: March 30, 2026 at 9:00 AM
Days until next rotation: 90 days

═══════════════════════════════════════════════════════════════
TXTEOF

        echo "✅ Rotation schedule created!"
        echo ""
        echo "📍 Location: /Users/briandusape/Projects/propiq/ROTATION_SCHEDULE.txt"
        echo ""
        echo "📅 Rotation dates:"
        echo "  • March 30, 2026 - Q1"
        echo "  • June 30, 2026 - Q2"
        echo "  • September 30, 2026 - Q3"
        echo "  • December 30, 2026 - Q4 (Annual + Audit)"
        echo ""
        echo "Set reminders in your preferred app/phone"
        echo ""

        open "/Users/briandusape/Projects/propiq/ROTATION_SCHEDULE.txt"
        ;;

    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Create a recurring reminder script
echo ""
echo "📬 Creating email reminder template..."

cat > "/Users/briandusape/Projects/propiq/scripts/send-rotation-reminder.sh" <<'EMAILEOF'
#!/bin/bash
# Send yourself a reminder email for API key rotation

# Configuration
YOUR_EMAIL="bdusape@luntra.one"  # Change this to your email
SUBJECT="🔐 PropIQ API Key Rotation Due"

# Calculate days until next rotation
NEXT_ROTATION="2026-03-30"
CURRENT_DATE=$(date +%Y-%m-%d)
DAYS_UNTIL=$(( ($(date -j -f "%Y-%m-%d" "$NEXT_ROTATION" +%s) - $(date -j -f "%Y-%m-%d" "$CURRENT_DATE" +%s)) / 86400 ))

# Email body
BODY="Time to rotate PropIQ API keys!

Rotation due in: $DAYS_UNTIL days
Next rotation date: March 30, 2026

Critical keys to rotate (30-45 mins):
• Stripe (secret, publishable, webhook)
• Supabase (service key)
• Azure OpenAI
• MongoDB password
• SendGrid

Steps:
1. cd /Users/briandusape/Projects/propiq
2. ./scripts/check-rotation-status.sh
3. Follow QUICK_ROTATION_GUIDE.md

Don't forget to:
- Block 2 hours on your calendar
- Update Azure App Settings after rotation
- Test all services
- Mark as complete in rotation tracker

See you in 3 months!
PropIQ Security Bot 🤖"

# Send email (requires mailx or mail command)
if command -v mail &> /dev/null; then
    echo "$BODY" | mail -s "$SUBJECT" "$YOUR_EMAIL"
    echo "✅ Reminder email sent to $YOUR_EMAIL"
else
    echo "⚠️  mail command not found. Install with: brew install mailutils"
    echo ""
    echo "Email preview:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "To: $YOUR_EMAIL"
    echo "Subject: $SUBJECT"
    echo ""
    echo "$BODY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
EMAILEOF

chmod +x "/Users/briandusape/Projects/propiq/scripts/send-rotation-reminder.sh"

echo ""
echo "✅ Email reminder script created!"
echo "   Location: scripts/send-rotation-reminder.sh"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🎉 Reminder setup complete!"
echo ""
echo "Your rotation schedule:"
echo "  📅 Q1 2026: March 30, 2026 (90 days from now)"
echo "  📅 Q2 2026: June 30, 2026"
echo "  📅 Q3 2026: September 30, 2026"
echo "  📅 Q4 2026: December 30, 2026 (Annual + Audit)"
echo ""
echo "Each reminder includes:"
echo "  ⏰ 1 week before notification"
echo "  ⏰ 1 day before notification"
echo "  📝 Complete rotation checklist"
echo "  🔗 Direct links to guides and scripts"
echo ""
echo "Next steps:"
echo "  1. Check your calendar app for the new events"
echo "  2. Review the rotation schedule"
echo "  3. Set a reminder on your phone as backup"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
