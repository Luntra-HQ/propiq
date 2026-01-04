#!/bin/bash

# Bug Monitoring Script
# Can be run manually or via CI/CD
# Captures console logs and reports errors

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/frontend/test-results/console-logs"
REPORT_DIR="$PROJECT_DIR/frontend/test-results/bug-reports"
OUTPUT_DIR="$PROJECT_DIR/frontend/test-results"

# Create directories
mkdir -p "$LOG_DIR"
mkdir -p "$REPORT_DIR"
mkdir -p "$OUTPUT_DIR"

# Timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="$REPORT_DIR/bug-report-$TIMESTAMP.md"

echo "🔍 Starting Automated Bug Detection..."
echo "📅 Time: $(date)"
echo ""

# Run automated bug detection tests
cd "$PROJECT_DIR/frontend"

# Run tests and capture exit code
npx playwright test tests/automated-bug-detection.spec.ts \
  --reporter=json \
  --output="$OUTPUT_DIR/test-output-$TIMESTAMP.json" \
  2>&1 | tee "$OUTPUT_DIR/test-console-$TIMESTAMP.log"

TEST_EXIT_CODE=$?

# Generate report
if [ -f "$SCRIPT_DIR/generate-bug-report.js" ]; then
  node "$SCRIPT_DIR/generate-bug-report.js" \
    "$OUTPUT_DIR/test-output-$TIMESTAMP.json" \
    "$REPORT_FILE" \
    "$LOG_DIR"
fi

# Check if any bugs were found
if [ $TEST_EXIT_CODE -ne 0 ] || grep -q "🚨 CRITICAL" "$REPORT_FILE" 2>/dev/null; then
  echo ""
  echo "🚨 CRITICAL BUGS DETECTED!"
  echo "📄 Report: $REPORT_FILE"
  echo ""

  # Send Slack notification (if configured)
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"🚨 PropIQ Bug Detected!\n\nTimestamp: $TIMESTAMP\nReport: $REPORT_FILE\"}"
  fi

  exit 1
else
  echo "✅ All tests passed - No bugs detected"
  exit 0
fi
