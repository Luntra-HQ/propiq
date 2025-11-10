# PropIQ Power User Simulation System

## Overview

This simulation system creates **5 realistic power-user behaviors** to test PropIQ under real-world conditions. It's designed for:

1. **Chaos Engineering** - Trigger edge cases and error scenarios
2. **Cost Estimation** - Track Azure OpenAI, Stripe, and infrastructure costs
3. **Conversion Testing** - Validate Free → Paid upgrade flows
4. **Performance Validation** - Test system under concurrent load

---

## The 5 Power Users

### 1. Portfolio Manager Paula (Elite Tier)
**Persona:** Expert investor managing $5M portfolio
**Behavior:**
- Analyzes 8-12 properties per session
- Daily usage, 30-60 minute sessions
- Upgrades from Pro → Elite mid-session
- Heavy calculator usage (95%)
- Minimal support usage (5%)

**Edge Cases Tested:**
- Usage limit warnings (60/60 analyses)
- Tier upgrades mid-session
- Concurrent analyses (10 requests)
- Large dataset exports (50+ properties)
- Unicode property addresses
- JWT token expiration after 60min

---

### 2. First-Time Investor Frank (Starter Tier)
**Persona:** 28yo software engineer, first investment property
**Behavior:**
- Analyzes 2-5 properties per session
- Weekly usage, 20-45 minute sessions
- Starts on Free tier, upgrades to Starter
- Heavy support chat usage (80%)
- Moderate calculator usage (70%)

**Edge Cases Tested:**
- Free tier soft warning (4/5 analyses used)
- Free tier hard block (5/5 limit reached)
- Stripe payment failure (insufficient funds)
- Retry successful payment after failure
- Support chat high volume (5+ messages)
- New user onboarding email trigger
- Invalid property address (typo)

---

### 3. Real Estate Agent Rita (Pro Tier)
**Persona:** Licensed agent providing client analysis
**Behavior:**
- Analyzes 3-7 properties per session
- Daily usage, 10-25 minute quick sessions
- Fast turnaround for client presentations
- Near-constant export usage (95%)
- Low support usage (15%)

**Edge Cases Tested:**
- Concurrent analyses (3 requests)
- Batch exports (5 properties at once)
- Fast sessions under 15 minutes
- High property values ($800k+)
- California property tax calculations

---

### 4. Weekend Warrior Will (Free Tier)
**Persona:** Part-time investor, budget-conscious
**Behavior:**
- Analyzes 2-4 properties per session
- Weekly usage on evenings/weekends
- Maximizes free tier value
- Frequent history review (70%)
- Low export usage (10% - restricted on free tier)

**Edge Cases Tested:**
- Free tier export restriction (403 Forbidden)
- Free tier history limit (10 items max)
- Off-peak hours usage (7pm-10pm)
- Price shopping without conversion
- Session timeout after 30 minutes
- JWT expiration handling

---

### 5. Business Development Ben (Pro Tier)
**Persona:** Investment firm analyst evaluating $500k-$2M deals
**Behavior:**
- Analyzes 5-10 properties per session
- 3x per week, 45-90 minute deep dives
- Commercial/multifamily focus
- Heavy calculator and export usage (90%+)
- Reviews large historical datasets (50+ properties)

**Edge Cases Tested:**
- High-value properties ($1M-$15M)
- Unicode/special characters in addresses
- API rate limits (20 rapid requests)
- Large exports (8 properties)
- Commercial property calculations
- Long session duration (90+ minutes)

---

## Cost Tracking

### Azure OpenAI (GPT-4o-mini)
- **Input tokens:** $0.00015 per 1,000 tokens
- **Output tokens:** $0.0006 per 1,000 tokens

**Estimated per-analysis costs:**
- Input: ~500 tokens = $0.000075
- Output: ~1,500 tokens = $0.0009
- **Total per analysis:** ~$0.001 (0.1 cents)

**Projected session costs:**
- Paula (10 analyses): ~$0.01
- Frank (5 analyses): ~$0.005
- Rita (5 analyses): ~$0.005
- Will (3 analyses): ~$0.003
- Ben (8 analyses): ~$0.008

**Total simulation cost:** ~$0.031 (3.1 cents) for OpenAI

### Stripe Transaction Fees
- **Per transaction:** 2.9% + $0.30

**Simulated transactions:**
- Paula: $149 (Elite) = $4.62 fee
- Frank: $69 (Starter) = $2.30 fee
- **Total Stripe fees:** ~$6.92

### Infrastructure Costs
- **Render hosting:** $7/month (prorated: $0.23/day)
- **Supabase:** Free tier (monitor row count)

### **Total Estimated Simulation Cost:** ~$7.20

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend/simulations

# Install Python packages
pip install -r requirements.txt
```

**Required packages:**
- `pyyaml` - YAML config parsing
- `requests` - HTTP requests
- `aiohttp` - Async HTTP (optional)

### 2. Configure Environment

The simulation uses the **production environment** by default:
- Base URL: `https://luntra.onrender.com`
- Uses real Stripe test mode keys
- Uses real Azure OpenAI (costs money!)
- Uses real Supabase database

**To use local/test environment:**

Edit `luntra-sim-profiles.yaml`:
```yaml
simulation_config:
  base_url: "http://localhost:8000"  # Local server
  # or
  base_url: "https://your-test-deployment.onrender.com"
```

### 3. Verify Backend is Running

```bash
# Check production health
curl https://luntra.onrender.com/health

# Check local health (if testing locally)
curl http://localhost:8000/health
```

---

## Running Simulations

### Quick Start - Run All 5 Users (Parallel)

```bash
python simulation_runner.py
```

**Output:**
- Console: Real-time progress logs
- File: `simulation.log` - Detailed logs
- File: `simulation_report.json` - Full results

### Run Single User

```bash
# Test Paula only
python simulation_runner.py --user "Portfolio-Manager-Paula"

# Test Frank only
python simulation_runner.py --user "First-Time-Investor-Frank"
```

### Run Sequentially (Easier Debugging)

```bash
python simulation_runner.py --sequential
```

### Custom Output Path

```bash
python simulation_runner.py --output results/my_simulation.json
```

---

## Understanding Results

### Console Output

```
================================================================================
PROPIQ POWER USER SIMULATION - RESULTS SUMMARY
================================================================================

Portfolio-Manager-Paula:
  Duration: 127.3s
  Actions: 11 completed, 0 failed
  Success Rate: 100.0%
  Edge Cases: 5
  Conversion: ✅ Yes
  Cost: $7.15

First-Time-Investor-Frank:
  Duration: 95.1s
  Actions: 13 completed, 1 failed
  Success Rate: 92.9%
  Edge Cases: 7
  Conversion: ✅ Yes
  Cost: $2.35

...

================================================================================
TOTALS:
  Total Cost: $18.42
  Total Actions: 52
  Conversions: 4/5 (80.0%)
================================================================================
```

### JSON Report Structure

```json
{
  "simulation_summary": {
    "total_users": 5,
    "total_actions_completed": 52,
    "total_actions_failed": 3,
    "total_edge_cases_triggered": 18,
    "conversions_achieved": 4,
    "conversion_rate": "80.0%"
  },
  "cost_analysis": {
    "azure_openai_input_tokens": 15000,
    "azure_openai_output_tokens": 45000,
    "azure_openai_cost_usd": "$0.03",
    "stripe_transactions": 4,
    "stripe_fees_usd": "$6.92",
    "total_cost_usd": "$7.20"
  },
  "user_results": [
    {
      "name": "Portfolio-Manager-Paula",
      "duration_seconds": 127.3,
      "actions_completed": 11,
      "actions_failed": 0,
      "success_rate": "100.0%",
      "edge_cases": ["usage_limit_hard_block", "tier_upgrade_mid_session"],
      "conversion": true,
      "cost_usd": "$7.15"
    }
  ],
  "edge_cases_triggered": [
    "usage_limit_warning_60_analyses",
    "usage_limit_hard_block",
    "free_tier_soft_warning_4of5",
    "stripe_payment_failure_insufficient_funds",
    "concurrent_requests_3"
  ],
  "errors_encountered": [
    {
      "action": "export_analyses",
      "error": "403 Forbidden",
      "timestamp": "2025-10-22T19:15:32.123Z"
    }
  ]
}
```

---

## Edge Cases Tested

### Authentication
- ✅ JWT token expiration after 60 minutes
- ✅ Concurrent login attempts from different IPs
- ✅ Expired token refresh handling
- ✅ Session timeout after 30 minutes

### Usage Limits
- ✅ Free tier soft warning (4/5 used)
- ✅ Free tier hard block (5/5 limit reached)
- ✅ Paid tier limit warnings (58/60, 98/100)
- ✅ Hard block at exact limit
- ✅ Usage counter reset (monthly)

### Payments & Stripe
- ✅ Successful checkout flow
- ✅ Payment failure (insufficient funds)
- ✅ Payment retry after failure
- ✅ Webhook duplicate event handling
- ✅ Mid-month tier upgrade
- ✅ Downgrade with data loss warning

### Data Validation
- ✅ Invalid property address (empty string)
- ✅ Invalid property address (typo)
- ✅ International addresses (non-US)
- ✅ Unicode/special characters (Café, Résidence)
- ✅ Negative purchase price
- ✅ Division by zero in calculator
- ✅ Extremely large property values ($15M+)

### Performance
- ✅ Concurrent analyses (3-10 requests)
- ✅ API rate limits (20 rapid requests)
- ✅ Large exports (50+ properties)
- ✅ Database query timeouts
- ✅ Azure OpenAI service unavailable
- ✅ Long session duration (90+ minutes)

---

## Monitoring & Analytics

### Weights & Biases Integration

The simulation automatically logs to W&B if configured:

```python
# Each analysis is logged with:
- user_tier
- property_address
- analysis_cost
- tokens_used
- deal_score
- session_id
```

View in W&B: https://wandb.ai/your-project/propiq-analysis

### Microsoft Clarity

Frontend interactions are tracked automatically via the Clarity script in `index.html`.

View heatmaps: https://clarity.microsoft.com/projects/view/tts5hc8zf8

### Slack Notifications

Stripe webhooks trigger Slack notifications:
- ✅ New signup (checkout.session.completed)
- ✅ Recurring payment (invoice.payment_succeeded)
- ⚠️ Payment failed (invoice.payment_failed)
- 📉 Subscription canceled

---

## Extending the Simulation

### Add a New User Persona

Edit `luntra-sim-profiles.yaml`:

```yaml
simulations:
  - name: "Commercial-Investor-Carol"
    user_id: "sim_carol_006"
    email: "carol.commercial@simulated.propiq.test"

    persona:
      role: "Commercial real estate investor"
      investment_strategy: ["retail", "office", "industrial"]
      target_tier: "elite"

    actions:
      - type: "login"
        email: "carol.commercial@simulated.propiq.test"
        password: "SimCarol2025!Elite"
        expected_status: 200
        probability: 1.0

      - type: "batch_analyze_properties"
        count: 15
        addresses:
          - "1000 Retail Plaza, NYC, NY 10001"
          # ... more addresses
```

### Add a New Action Type

Edit `simulation_runner.py`:

```python
async def _action_compare_properties(self, action: Dict, auth_token: str,
                                    costs: CostMetrics) -> None:
    """Execute property comparison action"""
    response = self.session.post(
        f"{self.base_url}/propiq/compare",
        headers={'Authorization': f'Bearer {auth_token}'},
        json={
            'property_ids': action['property_ids']
        }
    )
    costs.api_requests += 1
    # ... rest of implementation
```

Then add to YAML:

```yaml
- type: "compare_properties"
  property_ids: ["id1", "id2", "id3"]
  expected_status: 200
  probability: 0.80
```

---

## Troubleshooting

### Issue: "Connection refused"

**Solution:** Backend is not running. Start it:

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend
uvicorn api:app --reload --port 8000
```

### Issue: "User already exists"

**Solution:** Simulation uses test emails like `paula.portfolio@simulated.propiq.test`. Clean up test users:

```sql
-- In Supabase SQL Editor
DELETE FROM users WHERE email LIKE '%@simulated.propiq.test';
```

### Issue: "Costs are too high"

**Solution:** Azure OpenAI charges real money. Use test environment or reduce analysis count:

Edit YAML:
```yaml
- type: "batch_analyze_properties"
  count: 3  # Reduced from 10
```

### Issue: "Stripe payment actually charged"

**Solution:** Verify you're using **test mode** keys in `.env`:

```bash
# Test keys start with 'sk_test_' or 'pk_test_'
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# NOT production keys (sk_live_, pk_live_)
```

---

## Best Practices

### 1. Start with Single User

Test one user before running all 5:

```bash
python simulation_runner.py --user "Weekend-Warrior-Will"
```

### 2. Run Sequentially for Debugging

Parallel execution makes logs harder to read:

```bash
python simulation_runner.py --sequential
```

### 3. Monitor Costs in Real-Time

Watch Azure OpenAI usage:
- Azure Portal: https://portal.azure.com
- Cost Management → Cost Analysis

### 4. Use Test Data

Never run simulations with real user data or production keys (unless intentional).

### 5. Review Logs

Check `simulation.log` for detailed execution:

```bash
tail -f simulation.log
```

---

## Production Readiness Checklist

Before running against production:

- [ ] Verify all test emails use `@simulated.propiq.test` domain
- [ ] Confirm Stripe keys are test mode (`sk_test_`, `pk_test_`)
- [ ] Check Azure OpenAI quota limits
- [ ] Verify database has capacity for test data
- [ ] Set up monitoring alerts (Slack, email)
- [ ] Review cost projections
- [ ] Have rollback plan for failed webhooks
- [ ] Notify team before running simulation

---

## FAQ

**Q: Will this simulation spam real users?**
A: No, all simulated users use `@simulated.propiq.test` emails that don't exist.

**Q: How long does the full simulation take?**
A: 30 minutes (configurable in YAML).

**Q: Can I run this in CI/CD?**
A: Yes, add to GitHub Actions:
```yaml
- name: Run power user simulation
  run: |
    cd backend/simulations
    python simulation_runner.py --output $GITHUB_WORKSPACE/results.json
```

**Q: What if I want to simulate 100 users?**
A: Create more profiles in YAML or loop the existing 5 users with different emails.

**Q: Can I test mobile app behaviors?**
A: Not yet, but you can add mobile-specific actions (e.g., push notifications, offline sync).

---

## Support

**Questions?** Check:
1. This guide
2. `simulation.log` for errors
3. `simulation_report.json` for results
4. Raise issue in GitHub repo

**Cost concerns?** Review:
- Azure OpenAI usage in portal
- Stripe dashboard for test transactions
- Render logs for infrastructure

---

**Happy Simulating! 🚀**
