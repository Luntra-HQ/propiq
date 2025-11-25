#!/bin/bash
# Create Stripe Price IDs for PropIQ Unlimited Model
# Run this script after authenticating with: stripe login

set -e  # Exit on error

echo "🚀 Creating Stripe Price IDs for PropIQ..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check authentication
echo -e "${BLUE}Step 1: Checking Stripe authentication...${NC}"
if ! stripe products list --limit 1 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated. Please run: stripe login${NC}"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# Step 2: Check if PropIQ products exist or create them
echo -e "${BLUE}Step 2: Checking for existing PropIQ products...${NC}"

# Try to find existing PropIQ products
STARTER_PRODUCT_ID=$(stripe products list --limit 100 | grep -A 10 "Starter" | grep "id:" | head -1 | awk '{print $2}' || echo "")
PRO_PRODUCT_ID=$(stripe products list --limit 100 | grep -A 10 "Pro" | grep "id:" | head -1 | awk '{print $2}' || echo "")
ELITE_PRODUCT_ID=$(stripe products list --limit 100 | grep -A 10 "Elite" | grep "id:" | head -1 | awk '{print $2}' || echo "")

# Create Starter Product if it doesn't exist
if [ -z "$STARTER_PRODUCT_ID" ]; then
    echo "Creating Starter product..."
    STARTER_PRODUCT_ID=$(stripe products create \
        --name="PropIQ Starter" \
        --description="UNLIMITED AI property analyses for new investors (1-3 properties)" \
        --metadata[tier]="starter" \
        --metadata[analyses]="unlimited" \
        | grep "^id:" | awk '{print $2}')
    echo -e "${GREEN}✓ Created Starter product: $STARTER_PRODUCT_ID${NC}"
else
    echo -e "${GREEN}✓ Found existing Starter product: $STARTER_PRODUCT_ID${NC}"
fi

# Create Pro Product if it doesn't exist
if [ -z "$PRO_PRODUCT_ID" ]; then
    echo "Creating Pro product..."
    PRO_PRODUCT_ID=$(stripe products create \
        --name="PropIQ Pro" \
        --description="UNLIMITED AI analyses + Market trends + Chrome extension + Bulk import" \
        --metadata[tier]="pro" \
        --metadata[analyses]="unlimited" \
        | grep "^id:" | awk '{print $2}')
    echo -e "${GREEN}✓ Created Pro product: $PRO_PRODUCT_ID${NC}"
else
    echo -e "${GREEN}✓ Found existing Pro product: $PRO_PRODUCT_ID${NC}"
fi

# Create Elite Product if it doesn't exist
if [ -z "$ELITE_PRODUCT_ID" ]; then
    echo "Creating Elite product..."
    ELITE_PRODUCT_ID=$(stripe products create \
        --name="PropIQ Elite" \
        --description="UNLIMITED AI analyses + White-label + API + Team collaboration" \
        --metadata[tier]="elite" \
        --metadata[analyses]="unlimited" \
        | grep "^id:" | awk '{print $2}')
    echo -e "${GREEN}✓ Created Elite product: $ELITE_PRODUCT_ID${NC}"
else
    echo -e "${GREEN}✓ Found existing Elite product: $ELITE_PRODUCT_ID${NC}"
fi

echo ""

# Step 3: Create new recurring prices
echo -e "${BLUE}Step 3: Creating new recurring prices...${NC}"

# Create Starter price: $49/month
echo "Creating Starter price (\$49/month)..."
STARTER_PRICE_ID=$(stripe prices create \
    --product="$STARTER_PRODUCT_ID" \
    --unit-amount=4900 \
    --currency=usd \
    --recurring[interval]=month \
    --recurring[interval_count]=1 \
    --metadata[tier]="starter" \
    --metadata[analyses]="unlimited" \
    --nickname="PropIQ Starter - \$49/month (Unlimited)" \
    | grep "^id:" | awk '{print $2}')

echo -e "${GREEN}✓ Created Starter price: $STARTER_PRICE_ID${NC}"
echo ""

# Create Pro price: $99/month (in case you need to recreate it)
echo "Creating Pro price (\$99/month)..."
PRO_PRICE_ID=$(stripe prices create \
    --product="$PRO_PRODUCT_ID" \
    --unit-amount=9900 \
    --currency=usd \
    --recurring[interval]=month \
    --recurring[interval_count]=1 \
    --metadata[tier]="pro" \
    --metadata[analyses]="unlimited" \
    --nickname="PropIQ Pro - \$99/month (Unlimited)" \
    | grep "^id:" | awk '{print $2}')

echo -e "${GREEN}✓ Created Pro price: $PRO_PRICE_ID${NC}"
echo ""

# Create Elite price: $199/month
echo "Creating Elite price (\$199/month)..."
ELITE_PRICE_ID=$(stripe prices create \
    --product="$ELITE_PRODUCT_ID" \
    --unit-amount=19900 \
    --currency=usd \
    --recurring[interval]=month \
    --recurring[interval_count]=1 \
    --metadata[tier]="elite" \
    --metadata[analyses]="unlimited" \
    --nickname="PropIQ Elite - \$199/month (Unlimited)" \
    | grep "^id:" | awk '{print $2}')

echo -e "${GREEN}✓ Created Elite price: $ELITE_PRICE_ID${NC}"
echo ""

# Step 4: Output the price IDs
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ SUCCESS! Price IDs created:${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}STARTER_PRICE_ID:${NC} $STARTER_PRICE_ID"
echo -e "${YELLOW}PRO_PRICE_ID:${NC} $PRO_PRICE_ID"
echo -e "${YELLOW}ELITE_PRICE_ID:${NC} $ELITE_PRICE_ID"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Next Steps:${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "1. Update Convex Environment Variables:"
echo "   Visit: https://dashboard.convex.dev"
echo "   Go to: Settings → Environment Variables"
echo ""
echo "   Add/Update these variables:"
echo -e "   ${YELLOW}STRIPE_STARTER_PRICE_ID${NC} = $STARTER_PRICE_ID"
echo -e "   ${YELLOW}STRIPE_PRO_PRICE_ID${NC} = $PRO_PRICE_ID"
echo -e "   ${YELLOW}STRIPE_ELITE_PRICE_ID${NC} = $ELITE_PRICE_ID"
echo ""
echo "2. Update frontend/.env.local (if using client-side):"
echo "   VITE_STRIPE_STARTER_PRICE_ID=$STARTER_PRICE_ID"
echo "   VITE_STRIPE_PRO_PRICE_ID=$PRO_PRICE_ID"
echo "   VITE_STRIPE_ELITE_PRICE_ID=$ELITE_PRICE_ID"
echo ""
echo "3. Update frontend/src/config/pricing.ts:"
echo "   Update the STRIPE_PRICE_IDS object with these new IDs"
echo ""
echo "4. Deploy to production:"
echo "   git push origin main"
echo ""
echo -e "${GREEN}🎉 You're ready to go live with unlimited pricing!${NC}"
echo ""

# Save to file for easy reference
cat > STRIPE_PRICE_IDS.txt <<EOF
PropIQ Stripe Price IDs (Unlimited Model)
==========================================

Created: $(date)

Starter ($49/month - Unlimited):
  Product ID: $STARTER_PRODUCT_ID
  Price ID: $STARTER_PRICE_ID

Pro ($99/month - Unlimited):
  Product ID: $PRO_PRODUCT_ID
  Price ID: $PRO_PRICE_ID

Elite ($199/month - Unlimited):
  Product ID: $ELITE_PRODUCT_ID
  Price ID: $ELITE_PRICE_ID

==========================================
Next Steps:
1. Update Convex environment variables
2. Update frontend/.env.local
3. Update frontend/src/config/pricing.ts
4. Deploy to production
==========================================
EOF

echo -e "${GREEN}✓ Saved price IDs to: STRIPE_PRICE_IDS.txt${NC}"
echo ""
