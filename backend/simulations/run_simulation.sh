#!/bin/bash
# ============================================================================
# PropIQ Power User Simulation - Quick Start Script
# ============================================================================
# This script sets up and runs the 5-user power simulation
#
# Usage:
#   ./run_simulation.sh                    # Run all 5 users (parallel)
#   ./run_simulation.sh --single Paula     # Run single user
#   ./run_simulation.sh --sequential       # Run sequentially for debugging
#   ./run_simulation.sh --help             # Show help
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================================================${NC}"
echo -e "${BLUE}PropIQ Power User Simulation${NC}"
echo -e "${BLUE}================================================================================================${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

echo -e "${GREEN}✅ Python 3 found: $(python3 --version)${NC}"

# Check if requirements are installed
echo ""
echo -e "${BLUE}Checking dependencies...${NC}"

if ! python3 -c "import yaml" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Missing dependencies. Installing...${NC}"
    pip3 install -r requirements.txt
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies OK${NC}"
fi

# Check if backend is accessible
echo ""
echo -e "${BLUE}Checking backend connection...${NC}"

BACKEND_URL="https://luntra.onrender.com"

if curl -s -f "${BACKEND_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is accessible: ${BACKEND_URL}${NC}"
else
    echo -e "${YELLOW}⚠️  Backend not responding at ${BACKEND_URL}${NC}"
    echo -e "${YELLOW}   Trying local backend at http://localhost:8000...${NC}"

    BACKEND_URL="http://localhost:8000"

    if curl -s -f "${BACKEND_URL}/health" > /dev/null; then
        echo -e "${GREEN}✅ Local backend is accessible: ${BACKEND_URL}${NC}"
        echo -e "${YELLOW}   Note: Update luntra-sim-profiles.yaml to use local URL${NC}"
    else
        echo -e "${RED}❌ Backend is not accessible${NC}"
        echo ""
        echo "Please start the backend:"
        echo "  cd ../backend"
        echo "  uvicorn api:app --reload --port 8000"
        exit 1
    fi
fi

# Parse command line arguments
RUN_MODE="all"
USER_NAME=""
OUTPUT_FILE="simulation_report_$(date +%Y%m%d_%H%M%S).json"

while [[ $# -gt 0 ]]; do
    case $1 in
        --single)
            RUN_MODE="single"
            USER_NAME="$2"
            shift 2
            ;;
        --sequential)
            RUN_MODE="sequential"
            shift
            ;;
        --output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --single USER      Run single user simulation"
            echo "                     Available users:"
            echo "                       - Portfolio-Manager-Paula"
            echo "                       - First-Time-Investor-Frank"
            echo "                       - Real-Estate-Agent-Rita"
            echo "                       - Weekend-Warrior-Will"
            echo "                       - Business-Development-Ben"
            echo "  --sequential       Run all users sequentially (easier debugging)"
            echo "  --output FILE      Custom output file path"
            echo "  --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                      # Run all 5 users in parallel"
            echo "  $0 --single Portfolio-Manager-Paula     # Test Paula only"
            echo "  $0 --sequential                         # Run all sequentially"
            echo "  $0 --output results/test.json           # Custom output path"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Display configuration
echo ""
echo -e "${BLUE}================================================================================================${NC}"
echo -e "${BLUE}Simulation Configuration${NC}"
echo -e "${BLUE}================================================================================================${NC}"
echo "Mode:          ${RUN_MODE}"
echo "Backend URL:   ${BACKEND_URL}"
echo "Config File:   luntra-sim-profiles.yaml"
echo "Output File:   ${OUTPUT_FILE}"

if [ "$RUN_MODE" == "single" ]; then
    echo "User:          ${USER_NAME}"
fi

echo ""

# Confirm before running
read -p "Start simulation? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Simulation cancelled"
    exit 0
fi

# Run simulation
echo ""
echo -e "${BLUE}================================================================================================${NC}"
echo -e "${BLUE}Running Simulation...${NC}"
echo -e "${BLUE}================================================================================================${NC}"
echo ""

START_TIME=$(date +%s)

if [ "$RUN_MODE" == "single" ]; then
    python3 simulation_runner.py --user "${USER_NAME}" --output "${OUTPUT_FILE}"
elif [ "$RUN_MODE" == "sequential" ]; then
    python3 simulation_runner.py --sequential --output "${OUTPUT_FILE}"
else
    python3 simulation_runner.py --output "${OUTPUT_FILE}"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Display results
echo ""
echo -e "${BLUE}================================================================================================${NC}"
echo -e "${GREEN}✅ Simulation Complete!${NC}"
echo -e "${BLUE}================================================================================================${NC}"
echo "Duration:      ${DURATION} seconds"
echo "Report saved:  ${OUTPUT_FILE}"
echo "Log file:      simulation.log"
echo ""

# Show quick summary from JSON report
if command -v jq &> /dev/null; then
    echo -e "${BLUE}Quick Summary:${NC}"
    echo "--------------------------------------------------------------------------------"

    TOTAL_USERS=$(jq -r '.simulation_summary.total_users' "${OUTPUT_FILE}")
    TOTAL_ACTIONS=$(jq -r '.simulation_summary.total_actions_completed' "${OUTPUT_FILE}")
    TOTAL_FAILED=$(jq -r '.simulation_summary.total_actions_failed' "${OUTPUT_FILE}")
    CONVERSIONS=$(jq -r '.simulation_summary.conversions_achieved' "${OUTPUT_FILE}")
    TOTAL_COST=$(jq -r '.cost_analysis.total_cost_usd' "${OUTPUT_FILE}")

    echo "Total Users:       ${TOTAL_USERS}"
    echo "Actions Completed: ${TOTAL_ACTIONS}"
    echo "Actions Failed:    ${TOTAL_FAILED}"
    echo "Conversions:       ${CONVERSIONS}"
    echo "Total Cost:        ${TOTAL_COST}"
    echo ""
else
    echo -e "${YELLOW}Tip: Install jq for JSON parsing: brew install jq${NC}"
fi

# Offer to view full report
echo ""
read -p "View full report? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v jq &> /dev/null; then
        jq '.' "${OUTPUT_FILE}" | less
    else
        cat "${OUTPUT_FILE}" | less
    fi
fi

echo ""
echo -e "${GREEN}✅ All done!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review report:      cat ${OUTPUT_FILE}"
echo "  2. Check logs:         tail -100 simulation.log"
echo "  3. View in Supabase:   https://supabase.com/dashboard"
echo "  4. Check Stripe:       https://dashboard.stripe.com/test/payments"
echo "  5. Review W&B:         https://wandb.ai/propiq-analysis"
echo ""
