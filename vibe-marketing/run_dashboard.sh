#!/bin/bash
#
# PropIQ Daily Intelligence Dashboard - Run Script
# Loads environment and runs the dashboard
#

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables from .env.production
if [ -f ".env.production" ]; then
    echo "Loading environment from .env.production..."
    export $(grep -v '^#' .env.production | grep -v '^$' | xargs -0)
else
    echo "Error: .env.production not found"
    exit 1
fi

# Run the dashboard
python3 daily_intelligence_enhanced.py "$@"
