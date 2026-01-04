#!/bin/bash
# PropIQ - API Key Rotation Status Checker
# Tracks which keys have been rotated and which still need rotation

echo "🔐 PropIQ API Key Rotation Status"
echo "=================================="
echo ""
echo "Last Security Audit: December 30, 2025"
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Track completion
critical_complete=true
moderate_complete=true

echo "🔴 CRITICAL PRIORITY (Rotate TODAY)"
echo "-----------------------------------"
echo ""

read -p "✓ Stripe secret key rotated? (y/n): " stripe
if [[ "$stripe" == "y" ]]; then
    echo -e "${GREEN}✅ Stripe secret key${NC}"
else
    echo -e "${RED}❌ Stripe secret key - URGENT${NC}"
    critical_complete=false
fi

read -p "✓ Stripe publishable key rotated? (y/n): " stripe_pub
if [[ "$stripe_pub" == "y" ]]; then
    echo -e "${GREEN}✅ Stripe publishable key${NC}"
else
    echo -e "${RED}❌ Stripe publishable key - URGENT${NC}"
    critical_complete=false
fi

read -p "✓ Stripe webhook secret rotated? (y/n): " stripe_webhook
if [[ "$stripe_webhook" == "y" ]]; then
    echo -e "${GREEN}✅ Stripe webhook secret${NC}"
else
    echo -e "${RED}❌ Stripe webhook secret - URGENT${NC}"
    critical_complete=false
fi

read -p "✓ Supabase service key rotated? (y/n): " supabase
if [[ "$supabase" == "y" ]]; then
    echo -e "${GREEN}✅ Supabase service key${NC}"
else
    echo -e "${RED}❌ Supabase service key - URGENT${NC}"
    critical_complete=false
fi

read -p "✓ Azure OpenAI key rotated? (y/n): " azure
if [[ "$azure" == "y" ]]; then
    echo -e "${GREEN}✅ Azure OpenAI key${NC}"
else
    echo -e "${RED}❌ Azure OpenAI key - URGENT${NC}"
    critical_complete=false
fi

read -p "✓ MongoDB password rotated? (y/n): " mongo
if [[ "$mongo" == "y" ]]; then
    echo -e "${GREEN}✅ MongoDB password${NC}"
else
    echo -e "${RED}❌ MongoDB password - URGENT${NC}"
    critical_complete=false
fi

read -p "✓ SendGrid API key rotated? (y/n): " sendgrid
if [[ "$sendgrid" == "y" ]]; then
    echo -e "${GREEN}✅ SendGrid API key${NC}"
else
    echo -e "${RED}❌ SendGrid API key - HIGH PRIORITY${NC}"
    critical_complete=false
fi

echo ""
echo "🟡 MODERATE PRIORITY (Rotate This Week)"
echo "---------------------------------------"
echo ""

read -p "✓ Convex deploy key rotated? (y/n): " convex
if [[ "$convex" == "y" ]]; then
    echo -e "${GREEN}✅ Convex deploy key${NC}"
else
    echo -e "${YELLOW}⚠️  Convex deploy key${NC}"
    moderate_complete=false
fi

read -p "✓ JWT secret rotated? (y/n): " jwt
if [[ "$jwt" == "y" ]]; then
    echo -e "${GREEN}✅ JWT secret${NC}"
else
    echo -e "${YELLOW}⚠️  JWT secret (⚠️  Will log out all users)${NC}"
    moderate_complete=false
fi

read -p "✓ Intercom keys rotated? (y/n): " intercom
if [[ "$intercom" == "y" ]]; then
    echo -e "${GREEN}✅ Intercom keys${NC}"
else
    echo -e "${YELLOW}⚠️  Intercom keys${NC}"
    moderate_complete=false
fi

read -p "✓ Slack webhook rotated? (y/n): " slack
if [[ "$slack" == "y" ]]; then
    echo -e "${GREEN}✅ Slack webhook${NC}"
else
    echo -e "${YELLOW}⚠️  Slack webhook${NC}"
    moderate_complete=false
fi

echo ""
echo "🟢 LOW PRIORITY (Optional)"
echo "-------------------------"
echo ""

read -p "✓ Weights & Biases key rotated? (y/n): " wandb
[[ "$wandb" == "y" ]] && echo -e "${GREEN}✅ W&B API key${NC}" || echo -e "⚠️  W&B API key (optional)"

read -p "✓ Sentry DSN rotated? (y/n): " sentry
[[ "$sentry" == "y" ]] && echo -e "${GREEN}✅ Sentry DSN${NC}" || echo -e "⚠️  Sentry DSN (optional)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
if [[ "$critical_complete" == true && "$moderate_complete" == true ]]; then
    echo -e "${GREEN}🎉 ALL CREDENTIALS ROTATED!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Set calendar reminder for next rotation (March 30, 2026)"
    echo "  2. Document rotation in team wiki"
    echo "  3. Monitor service logs for any issues"
    echo ""
elif [[ "$critical_complete" == true ]]; then
    echo -e "${YELLOW}⚠️  CRITICAL credentials rotated, but moderate-priority keys still need rotation${NC}"
    echo ""
    echo "Remaining tasks:"
    [[ "$convex" != "y" ]] && echo "  • Rotate Convex deploy key"
    [[ "$jwt" != "y" ]] && echo "  • Rotate JWT secret (⚠️  logs out users)"
    [[ "$intercom" != "y" ]] && echo "  • Rotate Intercom keys"
    [[ "$slack" != "y" ]] && echo "  • Rotate Slack webhook"
    echo ""
else
    echo -e "${RED}⚠️  CRITICAL CREDENTIALS STILL NEED ROTATION${NC}"
    echo ""
    echo "🔴 URGENT - Rotate immediately:"
    [[ "$stripe" != "y" ]] && echo "  • Stripe secret key"
    [[ "$stripe_pub" != "y" ]] && echo "  • Stripe publishable key"
    [[ "$stripe_webhook" != "y" ]] && echo "  • Stripe webhook secret"
    [[ "$supabase" != "y" ]] && echo "  • Supabase service key"
    [[ "$azure" != "y" ]] && echo "  • Azure OpenAI key"
    [[ "$mongo" != "y" ]] && echo "  • MongoDB password"
    [[ "$sendgrid" != "y" ]] && echo "  • SendGrid API key"
    echo ""
    echo "See SECURITY_AUDIT_REPORT.md for rotation instructions"
fi

echo ""
echo "📚 Resources:"
echo "  • Security Report: SECURITY_AUDIT_REPORT.md"
echo "  • Rotation Guide: See report sections 1-7"
echo "  • Support: Check service dashboards linked in report"
echo ""

# Save rotation status
rotation_file="$(dirname "$0")/.rotation-status.txt"
{
    echo "# PropIQ API Key Rotation Status"
    echo "# Last updated: $(date)"
    echo ""
    echo "stripe=$stripe"
    echo "stripe_pub=$stripe_pub"
    echo "stripe_webhook=$stripe_webhook"
    echo "supabase=$supabase"
    echo "azure=$azure"
    echo "mongo=$mongo"
    echo "sendgrid=$sendgrid"
    echo "convex=$convex"
    echo "jwt=$jwt"
    echo "intercom=$intercom"
    echo "slack=$slack"
    echo "wandb=$wandb"
    echo "sentry=$sentry"
} > "$rotation_file"

echo "💾 Status saved to: $rotation_file"
echo ""
