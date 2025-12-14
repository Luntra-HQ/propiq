/**
 * Seed script for knowledge base articles
 * Run this to populate the help center with initial content
 */

import { mutation } from "./_generated/server";

export const seedKnowledgeBase = mutation({
  args: {},
  handler: async (ctx) => {
    const articles = [
      // GETTING STARTED (5 articles)
      {
        title: "What is PropIQ? Complete overview in 60 seconds",
        slug: "what-is-propiq-overview",
        excerpt: "Learn what PropIQ is and how it helps real estate investors analyze properties in seconds with AI-powered insights.",
        category: "getting-started",
        tags: ["overview", "getting-started", "introduction"],
        content: `# What is PropIQ? Complete overview in 60 seconds

PropIQ is an **AI-powered real estate investment analysis platform** that helps you make smarter property investment decisions in seconds, not hours.

## What PropIQ Does

PropIQ analyzes any property and gives you:

- **Deal Score (0-100)**: Instant rating of the property's investment potential
- **Investment Recommendation**: Strong Buy, Buy, Hold, or Avoid
- **Financial Projections**: Cash flow, cap rate, ROI, and 5-year forecasts
- **Risk Assessment**: Key risk factors and confidence scores
- **Market Insights**: Neighborhood trends and comparable properties

## How It Works

1. **Enter a Property Address** - Any residential property in the US
2. **Add Financial Details** - Purchase price, down payment, expected rent
3. **Get Instant Analysis** - AI analyzes market data, financials, and risks in 30 seconds
4. **Make Confident Decisions** - Use data-backed insights to decide whether to invest

## What Makes PropIQ Different?

- ✅ **30-Second Analysis** - No more hours of spreadsheet work
- ✅ **AI-Powered Insights** - GPT-4 analyzes market trends and risks
- ✅ **Unlimited Calculator** - Free deal calculator for quick math
- ✅ **No Meetings Required** - 24/7 self-service support

## Who Uses PropIQ?

- **New Investors**: Analyze 5-10 deals/month to find your first property
- **Active Investors**: Evaluate 20-60 properties/month with speed and confidence
- **Power Users**: Scale to 150+ analyses with API access (coming soon)

## Ready to Get Started?

Click "Analyze Property" in the main app to run your first analysis. You get **3 free analyses** to test the platform (no credit card required).

**Need help?** Check out our guide: [How to analyze your first property in 30 seconds](#how-to-analyze-first-property)`,
        published: true,
        featured: true,
      },

      {
        title: "How to analyze your first property in 30 seconds",
        slug: "how-to-analyze-first-property",
        excerpt: "Step-by-step guide to running your first PropIQ analysis and understanding your results.",
        category: "getting-started",
        tags: ["tutorial", "first-time", "analysis", "quickstart"],
        content: `# How to analyze your first property in 30 seconds

This guide walks you through your first PropIQ property analysis from start to finish.

## Step 1: Click "Analyze Property"

From the main dashboard, click the purple **"Analyze a Property Now"** button in the PropIQ Analysis section.

## Step 2: Enter the Property Address

**Format:** \`123 Main St, Austin, TX 78701\`

**Important:**
- ✅ Include street number, street name, city, state, and ZIP code
- ✅ Use the format shown above for best results
- ❌ Don't enter incomplete addresses (e.g., just "123 Main St")

**Tip:** Click "Load Sample Property" to see an example Austin rental property analysis.

## Step 3: Add Financial Details

Enter three key numbers:

1. **Purchase Price** - How much you'd pay for the property ($)
2. **Down Payment** - Your down payment amount or percentage (%)
3. **Monthly Rent** - Expected rental income per month ($)

**Example:**
- Purchase Price: $350,000
- Down Payment: 20% ($70,000)
- Monthly Rent: $2,500

## Step 4: Click "Analyze"

PropIQ will analyze:
- Market trends and neighborhood data
- Cash flow projections
- Risk factors (vacancy, repairs, market conditions)
- Deal score and investment recommendation

**This takes about 30 seconds.**

## Step 5: Review Your Results

Your analysis includes:

### Deal Score (0-100)
- **80-100**: Strong Buy (excellent investment opportunity)
- **60-79**: Buy (good investment with minor concerns)
- **40-59**: Hold (marginal deal, proceed with caution)
- **0-39**: Avoid (high risk, poor returns)

### Investment Recommendation
- Clear guidance: Strong Buy, Buy, Hold, or Avoid

### Financial Metrics
- Monthly cash flow
- Cap rate
- Cash-on-cash return
- 1% rule check

### Risk Factors
- Specific issues that could impact your investment
- Confidence scores for each risk

## Step 6: Use the Deal Calculator

For deeper analysis, click the **"Deal Calculator"** tab to:
- Run best/worst case scenarios
- See 5-year projections
- Model different rent growth rates
- Export or print your report

## What's Next?

- **Analyze 2 More Properties** - You have 3 free analyses
- **Compare Deals** - Use the calculator to compare different properties
- **Upgrade** - Get 20-150 analyses/month with a paid plan

**Still stuck?** Check out: [Understanding your property analysis report](#understanding-analysis-report)`,
        published: true,
        featured: true,
      },

      {
        title: "Understanding your property analysis report",
        slug: "understanding-analysis-report",
        excerpt: "Learn how to read and interpret your PropIQ analysis results, including deal scores, metrics, and recommendations.",
        category: "getting-started",
        tags: ["analysis", "report", "metrics", "interpretation"],
        content: `# Understanding your property analysis report

Your PropIQ analysis provides comprehensive data to help you make informed investment decisions. Here's how to interpret each section.

## Deal Score (0-100)

The **Deal Score** is PropIQ's overall rating of the investment opportunity based on:
- Cash flow potential
- Market conditions
- Risk factors
- Financial returns (cap rate, ROI, cash-on-cash)

**Score Ranges:**
- **80-100** 🟢 Strong Buy - Excellent opportunity with strong returns and low risk
- **60-79** 🟡 Buy - Good investment with acceptable risk/return profile
- **40-59** 🟠 Hold - Marginal deal, investigate further before proceeding
- **0-39** 🔴 Avoid - Poor returns or high risk, not recommended

## Investment Recommendation

PropIQ gives you one of four clear recommendations:

### Strong Buy
- Strong positive cash flow
- Low risk factors
- Favorable market conditions
- Above-average returns

### Buy
- Positive cash flow
- Manageable risk factors
- Solid investment with minor concerns

### Hold
- Break-even or slightly positive cash flow
- Multiple risk factors present
- Requires careful consideration

### Avoid
- Negative cash flow likely
- High risk factors
- Poor market conditions
- Better opportunities exist

## Financial Metrics Explained

### Monthly Cash Flow
**Revenue** (rent) - **Expenses** (mortgage, taxes, insurance, maintenance) = **Cash Flow**

- **Positive**: Property generates income each month
- **Negative**: You pay out-of-pocket each month

### Cap Rate (Capitalization Rate)
**Formula:** (Annual Net Income / Purchase Price) × 100

- **7%+**: Excellent return
- **5-7%**: Good return
- **3-5%**: Fair return
- **<3%**: Poor return

### Cash-on-Cash Return
**Formula:** (Annual Cash Flow / Total Cash Invested) × 100

Measures return on your actual cash investment (down payment + closing costs).

- **10%+**: Excellent
- **7-10%**: Good
- **5-7%**: Fair
- **<5%**: Poor

### 1% Rule Check
**Formula:** Monthly Rent / Purchase Price

- **≥1%**: Meets the 1% rule (good deal indicator)
- **<1%**: Doesn't meet the 1% rule (may still be worthwhile depending on market)

## Risk Factors

PropIQ identifies specific risks that could impact your investment:

### Common Risk Factors:
- **High Vacancy Risk**: Area has low rental demand
- **Market Volatility**: Property values fluctuate significantly
- **Maintenance Concerns**: Older property or high repair costs
- **Financing Risk**: High debt-to-income or interest rate sensitivity
- **Market Saturation**: Too many competing rental properties

**Confidence Scores** (0-100%) indicate how certain PropIQ is about each risk.

## AI-Generated Insights

The **Key Insights** section provides:
- Market trend analysis
- Neighborhood characteristics
- Competitive positioning
- Recommended next steps

## 5-Year Projections

See how the property performs over time with assumptions for:
- Rent growth (typically 3-5% annually)
- Property appreciation (typically 3-4% annually)
- Expense growth (typically 3% annually)

**Note:** These are projections, not guarantees. Actual results may vary.

## Next Steps

After reviewing your report:

1. **Strong Buy/Buy**: Move forward with due diligence (inspection, appraisal, financing)
2. **Hold**: Investigate risk factors further, consider negotiating a lower price
3. **Avoid**: Pass on this property and analyze other opportunities

**Pro Tip:** Use the **Deal Calculator** to run different scenarios (e.g., higher/lower rent, different down payment) to test deal sensitivity.

**Need help?** See: [How to use the Deal Calculator](#deal-calculator-guide)`,
        published: true,
        featured: true,
      },

      {
        title: "How to use the Deal Calculator for financial modeling",
        slug: "deal-calculator-guide",
        excerpt: "Master the PropIQ Deal Calculator's three tabs: Basic, Advanced, and Scenarios for comprehensive property analysis.",
        category: "getting-started",
        tags: ["calculator", "financial-modeling", "scenarios", "projections"],
        content: `# How to use the Deal Calculator for financial modeling

The PropIQ **Deal Calculator** is a free, unlimited tool for running quick calculations and detailed financial projections on any property.

## Three Tabs Explained

### 1. Basic Tab - Quick Cash Flow Analysis

**Use this for:** Fast calculations to determine monthly cash flow.

**Inputs:**
- Purchase Price
- Down Payment ($ or %)
- Interest Rate (typically 6.5-7.5% for investment properties)
- Loan Term (usually 30 years)
- Monthly Rent
- Operating Expenses (% of rent, typically 40-50%)

**Outputs:**
- Monthly mortgage payment
- Monthly cash flow (positive or negative)
- Annual cash flow

**Example:**
\`\`\`
Purchase Price: $300,000
Down Payment: 20% ($60,000)
Interest Rate: 7.0%
Monthly Rent: $2,200
Operating Expenses: 45%

→ Monthly Cash Flow: $215
→ Annual Cash Flow: $2,580
\`\`\`

### 2. Advanced Tab - Detailed Metrics

**Use this for:** In-depth analysis with all key investment metrics.

**Additional Inputs:**
- Property Taxes (annual)
- Insurance (annual)
- HOA Fees (monthly)
- Maintenance Reserve (typically 1% of purchase price annually)
- Vacancy Rate (typically 5-10%)
- Management Fees (typically 8-10% of rent if using property manager)

**Outputs:**
- Cap Rate
- Cash-on-Cash Return
- 1% Rule Check (does monthly rent ≥ 1% of purchase price?)
- Total ROI
- Detailed expense breakdown

**Example:**
\`\`\`
Property Taxes: $4,200/year
Insurance: $1,200/year
HOA: $150/month
Maintenance: $3,000/year (1% of price)
Vacancy: 7%
Management: 10% of rent

→ Cap Rate: 6.2%
→ Cash-on-Cash: 8.5%
→ 1% Rule: ✅ Passes (0.73%)
\`\`\`

### 3. Scenarios Tab - 5-Year Projections

**Use this for:** Long-term planning and best/worst case modeling.

**Assumptions:**
- Rent Growth Rate (typically 3-5% annually)
- Property Appreciation (typically 3-4% annually)
- Expense Growth Rate (typically 3% annually)

**Outputs:**
- Year-by-year cash flow projections
- Total equity growth (from appreciation + loan paydown)
- Cumulative returns over 5 years
- Best case, base case, and worst case scenarios

**Example Scenarios:**
\`\`\`
Best Case:
- Rent Growth: 5%
- Appreciation: 4%
- Expense Growth: 2%
→ 5-Year Total Return: $67,000

Base Case:
- Rent Growth: 3%
- Appreciation: 3%
- Expense Growth: 3%
→ 5-Year Total Return: $48,000

Worst Case:
- Rent Growth: 1%
- Appreciation: 1%
- Expense Growth: 4%
→ 5-Year Total Return: $22,000
\`\`\`

## Pro Tips for Using the Calculator

### Get Accurate Input Data

1. **Purchase Price**: Use recent comps or Zillow/Redfin estimates
2. **Rent**: Check Rentometer.com, Zillow rentals, or ask local property managers
3. **Property Taxes**: Look up on county assessor website
4. **Insurance**: Get quotes from 2-3 insurance providers
5. **Maintenance**: Budget 1% of purchase price annually (minimum)

### Test Sensitivity

Change one variable at a time to see impact:
- What if rent is $100 lower?
- What if vacancy is 10% instead of 5%?
- What if interest rates rise to 8%?

This helps you understand **deal risk**.

### Compare Multiple Properties

Run the same analysis on 3-5 properties to compare:
- Which has highest cash flow?
- Which has lowest risk (best cap rate)?
- Which has best long-term appreciation potential?

### Export and Share

Click **"Print Report"** or **"Export PDF"** to:
- Save analysis for your records
- Share with partners, lenders, or advisors
- Build a deal pipeline

## Calculator vs PropIQ Analysis

**Use the Calculator when:**
- You want quick math on any property
- You're comparing multiple deals side-by-side
- You have accurate financial data already

**Use PropIQ Analysis when:**
- You want AI-powered market insights
- You need risk assessment and deal scoring
- You want comprehensive neighborhood analysis

**Best Practice:** Use PropIQ Analysis first to get the full picture, then use the Calculator to model different scenarios.

**Next:** [Understanding deal scores and investment recommendations](#understanding-analysis-report)`,
        published: true,
        featured: true,
      },

      {
        title: "Trial limits, subscriptions, and top-ups explained",
        slug: "trial-subscriptions-explained",
        excerpt: "Everything you need to know about PropIQ's free trial, paid plans, and top-up purchases.",
        category: "getting-started",
        tags: ["trial", "subscription", "pricing", "plans", "billing"],
        content: `# Trial limits, subscriptions, and top-ups explained

PropIQ offers a **free trial** with 3 analyses, then flexible **paid plans** for serious investors.

## Free Trial (No Credit Card Required)

**What you get:**
- 3 free PropIQ AI analyses
- Unlimited access to Deal Calculator
- Access to AI support chat
- No time limit (analyses don't expire)

**When you hit the limit:**
You'll see an upgrade prompt. You can:
1. **Upgrade to a paid plan** (20-150 analyses/month)
2. **Buy a top-up** (10 extra analyses for $5)
3. **Wait** - analyses reset monthly on paid plans

## Paid Plans

### Starter - $69/month
- **20 PropIQ analyses/month**
- Unlimited Deal Calculator
- AI support chat
- Email support
- Best for: Newer investors evaluating 5-10 deals/week

### Pro - $99/month (Most Popular)
- **60 PropIQ analyses/month**
- Everything in Starter
- Priority support
- Comparison tools (coming soon)
- Best for: Active investors evaluating 2+ properties/day

### Elite - $149/month
- **150 PropIQ analyses/month**
- Everything in Pro
- API access (coming soon)
- Dedicated Slack support channel
- Custom deal scoring criteria
- Best for: Power users and small teams

**Monthly limits reset on your billing date.** For example, if you subscribed on the 15th, you get a fresh allotment of analyses on the 15th of each month.

## Top-Ups (Buy Extra Analyses)

**What are top-ups?**
One-time purchases that add extra PropIQ analyses to your account.

**Packages:**
- 10 analyses for $5 ($0.50 each)
- 25 analyses for $10 ($0.40 each) - Save 20%
- 50 analyses for $15 ($0.30 each) - Save 40%

**Do top-ups expire?**
❌ **No! Top-ups never expire.** They roll over month to month until you use them.

**When to use top-ups:**
- You're having an unusually busy month and need a few extra analyses
- You're on the Starter plan but occasionally need more volume
- You want to try the platform before committing to a monthly plan

**When to upgrade instead:**
- You consistently use >80% of your monthly limit
- You need more analyses most months
- You want better value (plans are cheaper per analysis)

**Example:**
\`\`\`
Starter Plan: $69/month = 20 analyses = $3.45/analysis
Top-Up: $5 = 10 analyses = $0.50/analysis

If you need 30 analyses/month:
- Option 1: Starter + 10-analysis top-up = $74/month
- Option 2: Upgrade to Pro (60 analyses) = $99/month ✅ Better value
\`\`\`

## How to Upgrade or Buy Top-Ups

### Upgrade Your Plan
1. Click **"Upgrade Plan"** in the app header
2. Select your desired plan (Starter, Pro, Elite)
3. Enter payment details (Stripe secure checkout)
4. Start using your new limit immediately

### Buy a Top-Up
1. When prompted at 90% usage, click **"Buy 10 More ($5)"**
2. Or click **"Add Top-Up"** from the pricing page
3. Select package size (10, 25, or 50 analyses)
4. Complete Stripe checkout
5. Top-up is added to your account instantly

## Billing & Payment

**Payment Methods:**
- Credit card (Visa, Mastercard, Amex, Discover)
- Debit card
- Processed securely through Stripe (we never store your card details)

**Billing Cycle:**
- Subscriptions are billed monthly on your signup date
- Cancel anytime (no long-term contracts)
- Unused analyses don't roll over (except top-ups, which never expire)

**Refund Policy:**
- Unsatisfied? Contact support@luntra.one within 7 days of your first charge for a full refund
- We want you to love PropIQ, and we'll make it right if you don't

## Frequently Asked Questions

**Can I change plans anytime?**
Yes! Upgrade or downgrade anytime. If you upgrade mid-cycle, you'll get prorated credit. If you downgrade, changes take effect at the end of your current billing period.

**What happens to unused analyses?**
Subscription analyses expire at the end of each billing cycle. Only top-up analyses roll over.

**Can I cancel anytime?**
Yes, cancel anytime with no penalties. You'll retain access until the end of your paid period.

**Do I need a credit card for the free trial?**
No! The free trial requires no credit card. Just sign up with email and password.

**Need help choosing a plan?** Check out: [Understanding which plan is right for you](#choosing-right-plan)`,
        published: true,
        featured: false,
      },

      // TROUBLESHOOTING (4 articles)
      {
        title: "Address not recognized? Here's how to fix it",
        slug: "fix-address-not-recognized",
        excerpt: "Troubleshoot common address validation errors and learn the correct format for property addresses.",
        category: "troubleshooting",
        tags: ["address", "error", "validation", "format"],
        content: `# Address not recognized? Here's how to fix it

PropIQ requires complete, properly formatted addresses to analyze properties. Here's how to fix common address errors.

## Correct Address Format

**Required format:**
\`\`\`
[Street Number] [Street Name], [City], [State] [ZIP Code]
\`\`\`

**Examples:**
✅ \`123 Main St, Austin, TX 78701\`
✅ \`456 Oak Avenue, San Francisco, CA 94102\`
✅ \`789 Elm Blvd Apt 2B, New York, NY 10001\`

## Common Errors and Fixes

### Error: "Please enter a complete address"

**Problem:** Missing required components (street number, city, state, or ZIP).

**Fix:**
❌ \`Main St, Austin\` → Missing street number and ZIP
✅ \`123 Main St, Austin, TX 78701\`

❌ \`123 Main St\` → Missing city, state, ZIP
✅ \`123 Main St, Austin, TX 78701\`

### Error: "Address not found"

**Problem:** Address doesn't exist in our property database or is misspelled.

**Fixes:**
1. **Check spelling** - Verify street name, city spelling
2. **Try different format** - Use "Street" instead of "St", "Avenue" instead of "Ave"
3. **Add/remove apartment number** - Some databases require unit numbers, others don't
4. **Use ZIP+4** - Try adding the 4-digit extension (e.g., \`78701-1234\`)
5. **Look up on Zillow/Redfin** - Find the exact address format these sites use

### Error: "Please include city and state"

**Problem:** Address is missing city or state abbreviation.

**Fix:**
❌ \`123 Main St, 78701\` → Missing city and state
✅ \`123 Main St, Austin, TX 78701\`

**State Abbreviations:**
Use 2-letter postal codes (TX, CA, NY, FL, etc.), not full names (Texas, California).

### Error: "Multiple properties found"

**Problem:** Address is ambiguous (e.g., apartment building with many units).

**Fix:**
Add the **unit/apartment number**:
❌ \`123 Main St, Austin, TX 78701\`
✅ \`123 Main St Apt 4B, Austin, TX 78701\`
✅ \`123 Main St Unit 12, Austin, TX 78701\`

## Advanced Troubleshooting

### Rural Properties

For properties in rural areas without standard street addresses:

**Option 1: Use nearby intersection**
\`\`\`
Corner of Highway 71 and County Road 123, Smithville, TX 78957
\`\`\`

**Option 2: Use GPS coordinates**
Contact support@luntra.one with GPS coordinates and property details. We can add the property manually.

### New Construction

If the property is brand new and not yet in property databases:

**Workaround:**
1. Use a nearby address on the same street
2. Note in your analysis that it's a proxy for new construction
3. Adjust financial assumptions in the Deal Calculator manually

**Long-term solution:**
Email support@luntra.one with the property details and we'll add it to our database.

### Condos and Multi-Unit Buildings

**Best Practices:**
- Always include unit/apartment number
- Use the format exactly as it appears on Zillow or the property listing
- If still not working, try without the unit number first, then add it

**Example:**
\`\`\`
✅ 123 Main St #405, Austin, TX 78701
✅ 123 Main St Unit 405, Austin, TX 78701
✅ 123 Main St Apt 405, Austin, TX 78701
\`\`\`

## Still Having Issues?

**Option 1: Use the Sample Property**
Click **"Load Sample Property"** to see an example Austin property analysis. This helps you understand the expected format and output.

**Option 2: Try the Deal Calculator**
If you can't get the AI analysis to work, use the **Deal Calculator** (unlimited, free) to run manual calculations with your financial estimates.

**Option 3: Contact Support**
- Click the **AI Support Chat** button and describe your issue
- Or email: **support@luntra.one**
- Include: The address you're trying to analyze, the error message you see, and a screenshot if possible

We'll help you get it working!

**Related Articles:**
- [How to analyze your first property](#how-to-analyze-first-property)
- [Understanding error messages](#understanding-error-messages)`,
        published: true,
        featured: false,
      },

      {
        title: "Analysis taking longer than 30 seconds? Troubleshooting",
        slug: "slow-analysis-troubleshooting",
        excerpt: "What to do if your PropIQ analysis is taking too long or appears stuck.",
        category: "troubleshooting",
        tags: ["performance", "slow", "loading", "timeout"],
        content: `# Analysis taking longer than 30 seconds? Troubleshooting

PropIQ analyses typically complete in **30 seconds or less**. If yours is taking longer, here's what to check.

## Normal Analysis Time

**Expected duration:** 20-40 seconds

**Why it takes this long:**
1. AI (GPT-4) analyzes market data - 10-15 seconds
2. Financial calculations and projections - 5 seconds
3. Risk assessment and scoring - 10 seconds
4. Generating formatted report - 5 seconds

## If Analysis Takes 60+ Seconds

**Possible causes:**

### 1. Heavy Server Load
**Symptoms:** Analysis says "Loading..." for more than 60 seconds.

**Fix:**
- Wait 2-3 minutes - the analysis will complete
- If still stuck after 3 minutes, **refresh the page** and try again
- Your analysis limit was already decremented, so you won't lose a credit

### 2. Complex Property Data
**Symptoms:** Analysis is processing, but slower than usual.

**Why:** Some properties require additional data lookups (e.g., rural areas, new construction, properties with limited comparable data).

**Fix:**
- Let it run for up to 2 minutes
- This is normal for certain property types

### 3. Network Issues
**Symptoms:** Page appears frozen or you see a timeout error.

**Fix:**
- Check your internet connection
- Try switching from Wi-Fi to mobile data (or vice versa)
- Close other browser tabs to free up bandwidth
- Refresh the page and restart the analysis

### 4. Browser Issues
**Symptoms:** Analysis appears stuck, but no error message.

**Fix:**
- **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear your browser cache
- Try a different browser (Chrome, Firefox, Safari)
- Disable browser extensions (especially ad blockers)

## What to Do If Analysis Fails

**Error Message:** "Analysis failed. Please try again."

**Steps:**
1. **Check the address format** - See [Address not recognized](#fix-address-not-recognized)
2. **Try again** - Click "Analyze" again (you won't be charged twice)
3. **Contact support** - If it fails repeatedly, we'll investigate

**Your analysis credits:**
- If analysis fails, your credit is **refunded automatically**
- Check your remaining analyses in the top-right corner

## Server Status

**Is PropIQ down?**
If you suspect a service outage:

1. **Check status page**: [status.propiq.com](#) (coming soon)
2. **Contact support**: support@luntra.one
3. **Check your dashboard**: Look for a banner announcing maintenance or issues

## Tips for Faster Analyses

1. **Use accurate addresses** - Correct format on first try = no retries
2. **Avoid peak hours** - Late evening/early morning is faster than business hours
3. **Stable internet** - Use wired connection if possible
4. **Modern browser** - Chrome, Firefox, or Safari (latest versions)

## Still Stuck?

**Option 1: Use Deal Calculator**
While we troubleshoot the AI analysis, use the **Deal Calculator** to run manual calculations:
- Unlimited, free, instant results
- Basic, Advanced, and Scenarios tabs
- Same financial metrics as AI analysis

**Option 2: Contact Support**
- Click the **AI Support Chat** widget
- Or email: **support@luntra.one**
- Include: Property address, error message (if any), how long you waited

We'll investigate and help resolve the issue!

**Related Articles:**
- [Understanding error messages](#understanding-error-messages)
- [How to use the Deal Calculator](#deal-calculator-guide)`,
        published: true,
        featured: false,
      },

      {
        title: "Understanding error messages and what to do",
        slug: "understanding-error-messages",
        excerpt: "Complete guide to PropIQ error messages, what they mean, and how to resolve them.",
        category: "troubleshooting",
        tags: ["errors", "messages", "troubleshooting", "help"],
        content: `# Understanding error messages and what to do

PropIQ provides clear error messages to help you resolve issues quickly. Here's what each error means and how to fix it.

## Analysis Errors

### "No analyses remaining. Please upgrade to a paid plan."

**Meaning:** You've used all your allotted PropIQ analyses for the month (or trial period).

**Fix:**
1. **Upgrade to a paid plan** - Click "Upgrade Plan" to get 20-150 analyses/month
2. **Buy a top-up** - Purchase 10 extra analyses for $5 (never expire)
3. **Use Deal Calculator** - Free, unlimited tool for manual calculations

**Check remaining analyses:** Top-right corner of the app shows "X/Y Runs Left"

### "Analysis failed. Please try again."

**Meaning:** The AI analysis encountered an error while processing your property.

**Common causes:**
- Temporary server issue
- Invalid or incomplete property data
- Network timeout

**Fix:**
1. **Verify address format** - See [Address troubleshooting](#fix-address-not-recognized)
2. **Check internet connection** - Ensure stable network
3. **Try again** - Click "Analyze" again (no charge if it failed)
4. **Contact support** if it fails multiple times

**Your credits:** Failed analyses are automatically refunded.

### "Property not found in our database."

**Meaning:** The address you entered doesn't exist in our property records.

**Fix:**
1. **Check spelling** - Verify street name, city, ZIP code
2. **Try alternative formats**:
   - "Street" instead of "St"
   - "Avenue" instead of "Ave"
   - Add or remove apartment/unit number
3. **Look up on Zillow** - Use the exact address format from Zillow or Redfin
4. **Rural property?** See [Address troubleshooting](#fix-address-not-recognized) for special cases

### "Please enter valid financial details."

**Meaning:** Purchase price, down payment, or monthly rent are missing or invalid.

**Fix:**
Check that:
- ✅ Purchase price is > $0
- ✅ Down payment is between 0% and 100% of purchase price
- ✅ Monthly rent is > $0
- ✅ All fields are filled in (no blanks)

**Example:**
❌ Purchase Price: (empty) → Must enter a value
❌ Down Payment: 150% → Can't exceed 100%
✅ Purchase Price: $300,000, Down Payment: 20%, Rent: $2,200

## Authentication Errors

### "Invalid email or password."

**Meaning:** Login credentials are incorrect.

**Fix:**
1. **Check email spelling** - Verify no typos
2. **Check password** - Ensure Caps Lock is off, password is correct
3. **Reset password** - Click "Forgot Password?" if needed

### "Email already in use."

**Meaning:** An account with this email already exists.

**Fix:**
1. **Log in** - Use the "Login" tab instead of "Sign Up"
2. **Reset password** - If you forgot your password, click "Forgot Password?"
3. **Use different email** - If you want a new account, use a different email address

### "Session expired. Please log in again."

**Meaning:** You've been logged out due to inactivity (30-day timeout) or session invalidation.

**Fix:**
1. **Log in again** - Click "Login" and enter your credentials
2. **Check "Remember me"** - To stay logged in longer (up to 1 year)

## Billing & Payment Errors

### "Payment failed. Please try again."

**Meaning:** Stripe couldn't process your payment.

**Common causes:**
- Insufficient funds
- Card declined by bank
- Incorrect card details
- Billing address mismatch

**Fix:**
1. **Check card details** - Verify card number, expiration, CVV
2. **Contact your bank** - Ensure they're not blocking the charge
3. **Try different card** - Use an alternative payment method
4. **Contact support** - If issue persists: support@luntra.one

### "Subscription already active."

**Meaning:** You're trying to subscribe, but already have an active subscription.

**Fix:**
1. **Upgrade/Downgrade** - Use "Change Plan" to switch tiers
2. **Check current plan** - Top-right header shows your current tier
3. **Contact support** - If you think this is an error

## Calculator Errors

### "Please enter all required fields."

**Meaning:** Some calculator inputs are missing.

**Fix:**
Check that you've filled in:
- Purchase Price
- Down Payment (% or $)
- Interest Rate
- Monthly Rent

### "Interest rate must be between 0% and 20%."

**Meaning:** Interest rate is outside reasonable bounds.

**Fix:**
- Enter a realistic rate (typically 6.5-8% for investment properties)
- If you entered a percentage as a decimal (e.g., 0.07), enter it as 7 instead

## System Errors

### "Something went wrong. Please refresh the page."

**Meaning:** General application error (rare).

**Fix:**
1. **Refresh the page** - Press F5 or Ctrl+R (Cmd+R on Mac)
2. **Clear cache** - Ctrl+Shift+Delete, clear browsing data
3. **Try different browser** - Chrome, Firefox, or Safari
4. **Contact support** - If error persists

### "Service temporarily unavailable."

**Meaning:** PropIQ is experiencing a temporary outage (very rare).

**Fix:**
1. **Wait 5-10 minutes** - Check back shortly
2. **Check status page**: status.propiq.com (coming soon)
3. **Contact support**: support@luntra.one for updates

## Getting Help

If you're seeing an error not listed here:

1. **Screenshot the error** - Helps us diagnose faster
2. **Note what you were doing** - What action triggered the error?
3. **Contact support**:
   - **AI Chat**: Click the chat widget (bottom-right)
   - **Email**: support@luntra.one
   - **Include**: Screenshot, error message, steps to reproduce

We'll investigate and help resolve the issue!

**Related Articles:**
- [Address troubleshooting](#fix-address-not-recognized)
- [Slow analysis troubleshooting](#slow-analysis-troubleshooting)
- [Trial and subscription help](#trial-subscriptions-explained)`,
        published: true,
        featured: false,
      },

      {
        title: "My calculations seem off - common input mistakes",
        slug: "calculator-common-mistakes",
        excerpt: "Avoid these common mistakes when using the PropIQ Deal Calculator to ensure accurate results.",
        category: "troubleshooting",
        tags: ["calculator", "accuracy", "mistakes", "inputs"],
        content: `# My calculations seem off - common input mistakes

Getting unexpected results in the Deal Calculator? Here are the most common input mistakes and how to fix them.

## Common Mistake #1: Interest Rate Format

**Wrong:**
❌ Interest rate: **0.07** (thinking this is 7%)

**Right:**
✅ Interest rate: **7** (enter as a percentage, not decimal)

PropIQ expects percentages, not decimals:
- Enter \`7\` for 7%
- Enter \`7.5\` for 7.5%
- Don't enter \`0.07\` or \`0.075\`

## Common Mistake #2: Confusing Down Payment $ vs %

**The input accepts both:**
- **Percentage**: Enter \`20\` for 20% down
- **Dollar amount**: Enter \`60000\` for $60,000 down

**Make sure you're entering what you intend:**
❌ Wanted 20% down ($60,000 on $300k property), but entered \`60000\` as percentage → Calculates as 60,000% (invalid)
✅ Enter either \`20\` (as %) or switch toggle to $ and enter \`60000\`

**Tip:** Use the % / $ toggle button to switch modes.

## Common Mistake #3: Annual vs Monthly Values

**Some inputs are annual, others are monthly. Pay attention to labels:**

**ANNUAL (per year):**
- Property taxes (e.g., $4,200/year)
- Insurance (e.g., $1,200/year)
- Maintenance reserve (e.g., 1% of purchase price = $3,000/year)

**MONTHLY:**
- Rent (e.g., $2,200/month)
- HOA fees (e.g., $150/month)
- Management fees (e.g., 10% of monthly rent = $220/month)

**Common error:**
❌ Property taxes: \`350\` (thinking monthly) → Should be \`4,200\` (annual)
❌ Rent: \`26,400\` (thinking annual) → Should be \`2,200\` (monthly)

## Common Mistake #4: Expense Ratio Misunderstanding

**Expense ratio (Basic tab) is a percentage of rent:**

**Typical range: 40-50%**
- **40-45%**: Newer property, good condition, low maintenance
- **45-50%**: Older property, higher maintenance, higher taxes
- **50%+**: Very old property, high costs, or expensive area

**What's included in expense ratio:**
- Property taxes
- Insurance
- Maintenance & repairs
- HOA fees
- Property management fees
- Vacancy
- Capital expenditures (CapEx)

**If you enter 40%, PropIQ calculates:**
\`\`\`
Monthly rent: $2,200
Expenses (40%): $880
Net income: $1,320
\`\`\`

**Common error:**
❌ Expense ratio: \`880\` (thinking it's a dollar amount) → Should be \`40\` (percent)

## Common Mistake #5: Forgetting Vacancy

**Vacancy rate accounts for months without a tenant.**

**Typical range: 5-10%**
- **5%**: High-demand area, good property
- **8%**: Average market
- **10%+**: High turnover, lower-demand area

**If you enter 0% vacancy, you're assuming:**
- ✅ Property is rented 100% of the time (365 days/year)
- ❌ No turnover costs, no empty months

**This is unrealistic.** Always include at least 5% vacancy.

**Impact example:**
\`\`\`
Monthly rent: $2,200
Vacancy 0%: $2,200/month effective rent
Vacancy 8%: $2,024/month effective rent (-$176/month)
\`\`\`

## Common Mistake #6: Unrealistic Growth Assumptions

**In Scenarios tab, be conservative with growth rates:**

**Realistic Assumptions (Base Case):**
- Rent growth: **3%/year** (national average)
- Property appreciation: **3-4%/year** (national average)
- Expense growth: **3%/year** (tracks inflation)

**Optimistic Assumptions (Best Case):**
- Rent growth: **5%/year** (hot market)
- Property appreciation: **5%/year** (high-growth city)
- Expense growth: **2%/year** (stable costs)

**Conservative Assumptions (Worst Case):**
- Rent growth: **1%/year** (slow market)
- Property appreciation: **1-2%/year** (declining area)
- Expense growth: **4-5%/year** (rising costs)

**Common error:**
❌ Rent growth: 10%/year → Way too optimistic (unsustainable)
❌ Property appreciation: 8%/year → Only achievable in rare boom markets

**Reality check:**
If you're projecting >6% annual growth, you're probably being too optimistic.

## Common Mistake #7: Not Including All Expenses

**On Advanced tab, make sure you include ALL expenses:**

✅ **Must include:**
- Mortgage payment (P&I)
- Property taxes
- Insurance
- Maintenance (min 1% of purchase price annually)
- Vacancy (min 5%)

✅ **Also consider:**
- HOA fees (if applicable)
- Property management (8-10% of rent if not self-managing)
- Utilities (if you pay them)
- Lawn care / Snow removal (if you pay them)
- CapEx reserve (for big replacements: roof, HVAC, appliances)

**If cash flow looks too good to be true, you probably forgot an expense.**

## Common Mistake #8: Ignoring Closing Costs

**Your cash invested includes:**
- Down payment
- Closing costs (typically 2-5% of purchase price)

**Example:**
\`\`\`
Purchase price: $300,000
Down payment: 20% = $60,000
Closing costs: 3% = $9,000
Total cash invested: $69,000 ✅
\`\`\`

**Common error:**
❌ Only counting down payment ($60,000) → Underestimates cash-on-cash return

**Fix:**
In Advanced tab, use "Total Cash Invested" field to include closing costs.

## How to Verify Your Calculations

**Sanity checks:**

1. **Monthly cash flow should be positive (or close to $0)**
   - If you're showing $1,000+/month, double-check expenses
   - If you're showing -$500/month, the deal is probably bad (or you made an error)

2. **Cap rate should be 3-10%**
   - <3%: Probably an error or very expensive market
   - >10%: Probably forgot expenses or unrealistic assumptions

3. **1% rule:**
   - Monthly rent should be ~1% of purchase price
   - $300k property → ~$3,000/month rent (1% rule)
   - If you're way off, check your numbers

4. **Compare to PropIQ AI Analysis**
   - Run the AI analysis on the same property
   - Compare key metrics (cash flow, cap rate, ROI)
   - If they're wildly different, review your calculator inputs

## Still Getting Unexpected Results?

**Contact Support:**
- **AI Chat**: Click the chat widget and describe the issue
- **Email**: support@luntra.one
- **Include**: Screenshot of your inputs and results

We'll review and help you identify the issue!

**Related Articles:**
- [How to use the Deal Calculator](#deal-calculator-guide)
- [Understanding financial metrics](#understanding-analysis-report)`,
        published: true,
        featured: false,
      },

      // BILLING (5 articles)
      {
        title: "How to upgrade, downgrade, or cancel your subscription",
        slug: "manage-subscription",
        excerpt: "Step-by-step guide to changing your PropIQ plan or canceling your subscription.",
        category: "billing",
        tags: ["subscription", "upgrade", "downgrade", "cancel", "billing"],
        content: `# How to upgrade, downgrade, or cancel your subscription

PropIQ gives you full control over your subscription. Change plans or cancel anytime with no penalties.

## How to Upgrade Your Plan

**Steps:**
1. Click **"Upgrade Plan"** in the app header (top-right)
2. Select your new plan (Starter → Pro, or Pro → Elite)
3. Review the price difference
4. Enter payment details (if upgrading from free trial)
5. Click **"Upgrade Now"**

**What happens:**
- ✅ Your new plan activates **immediately**
- ✅ You get the full monthly analysis limit right away
- ✅ You're charged the **prorated difference** for the current billing period
- ✅ Next month, you'll be charged the full amount

**Example:**
\`\`\`
Current plan: Starter ($69/month)
Upgrade to: Pro ($99/month)
Upgrade date: Day 15 of 30-day billing cycle

Prorated charge today: ($99 - $69) × (15/30) = $15
Next billing date: Full $99 charge
\`\`\`

**Your analyses:**
- Old limit (20) → New limit (60) immediately
- Usage resets to 0 on your next billing date

## How to Downgrade Your Plan

**Steps:**
1. Click **"Upgrade Plan"** (yes, same button for upgrade/downgrade)
2. Select your new plan (Elite → Pro, or Pro → Starter)
3. Review the changes
4. Click **"Change Plan"**

**What happens:**
- ✅ Change takes effect at the **end of your current billing period**
- ✅ You keep your current plan's limits until then
- ✅ No immediate charge or refund
- ✅ Next billing date: You'll be charged the new (lower) amount

**Example:**
\`\`\`
Current plan: Pro ($99/month)
Downgrade to: Starter ($69/month)
Downgrade requested: Day 10 of 30-day cycle

What happens:
- Days 10-30: Still have Pro (60 analyses/month)
- Day 30: Billing renews at $69 (Starter plan)
- Next month: 20 analyses/month limit
\`\`\`

**Important:**
- You **won't** lose access immediately
- **No refunds** for unused days in current billing period
- **Unused analyses don't roll over** (use them before downgrade takes effect!)

## How to Cancel Your Subscription

**Steps:**
1. Click your **profile icon** (top-right)
2. Select **"Billing Settings"**
3. Scroll to **"Cancel Subscription"**
4. Confirm cancellation

**What happens:**
- ✅ Cancellation takes effect at the **end of your current billing period**
- ✅ You keep access until then (use your remaining analyses!)
- ✅ No future charges
- ✅ Your account stays active - you can re-subscribe anytime

**After cancellation:**
- Your account **downgrades to Free plan** (3 analyses total, reusable)
- All your past analyses remain accessible
- Deal Calculator stays unlimited and free
- You can **re-subscribe anytime** (just click "Upgrade")

**No penalties:**
- ❌ No cancellation fees
- ❌ No questions asked
- ❌ No "retention offers" or pressure

We want you to love PropIQ. If you don't, we respect your decision.

## How to Re-Activate a Canceled Subscription

**Steps:**
1. Click **"Upgrade Plan"** in the app
2. Select your desired plan
3. Enter payment details
4. Click **"Subscribe"**

**What happens:**
- ✅ Your plan activates immediately
- ✅ Billing starts from today (new 30-day cycle)
- ✅ You get your full monthly analysis limit right away

## How to Update Payment Method

**Steps:**
1. Click **profile icon** → **"Billing Settings"**
2. Click **"Update Payment Method"**
3. Enter new card details
4. Click **"Save"**

**When to update:**
- Card expires
- Lost/stolen card
- Want to use a different card
- Bank issued new card number

**Your subscription continues uninterrupted.**

## How to View Billing History

**Steps:**
1. Click **profile icon** → **"Billing Settings"**
2. Scroll to **"Invoices"**
3. Click any invoice to download PDF

**Invoices include:**
- Date and amount charged
- Plan details
- Payment method (last 4 digits)
- Downloadable receipt for expensing

## Frequently Asked Questions

### Can I switch plans mid-cycle?

**Yes!**
- **Upgrade**: Effective immediately (prorated charge)
- **Downgrade**: Effective at end of billing period (no immediate change)

### What happens to unused analyses when I downgrade?

**They expire.**
- Analyses don't roll over (except top-ups, which never expire)
- Use them before your plan changes!

### Can I get a refund if I cancel mid-cycle?

**No prorated refunds.**
- You keep access until the end of your paid period
- Use your remaining analyses before cancellation takes effect
- **Exception**: Unsatisfied with first charge? Contact support@luntra.one within 7 days for a full refund.

### What if I accidentally cancel?

**You can re-subscribe anytime.**
- Your account doesn't get deleted
- Just click "Upgrade Plan" to reactivate

### Can I pause my subscription?

**Not yet, but you can:**
- **Downgrade to Free** - Cancel and restart when you need it
- **Use top-ups** - Cancel subscription, buy top-ups as needed (they never expire)

**Feature request:** Vote for "pause subscription" at [roadmap.propiq.com](#)

### Will I lose my analysis history if I cancel?

**No!**
- All your past analyses remain accessible in your account
- You can view, print, or export them anytime
- Your account stays active (free tier)

## Need Help?

**Contact support:**
- **AI Chat**: Click the chat widget (bottom-right)
- **Email**: support@luntra.one
- **Response time**: Typically <2 hours

We're here to help with any billing questions or issues!

**Related Articles:**
- [Trial and subscription explained](#trial-subscriptions-explained)
- [What happens when you hit your analysis limit](#what-happens-at-limit)`,
        published: true,
        featured: false,
      },

      // Additional articles can be added here...

    ];

    // Insert all articles
    for (const article of articles) {
      await ctx.db.insert("articles", {
        ...article,
        viewCount: 0,
        helpfulVotes: 0,
        unhelpfulVotes: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: `Successfully seeded ${articles.length} knowledge base articles`,
    };
  },
});
