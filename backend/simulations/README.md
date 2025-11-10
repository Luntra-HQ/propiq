# PropIQ Power User Simulation

Realistic 5-user simulation system for chaos engineering and cost estimation.

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run all 5 users (takes ~5 minutes)
./run_simulation.sh

# OR use Python directly
python simulation_runner.py
```

## The 5 Power Users

1. **Portfolio Manager Paula** - Elite tier, expert investor, upgrades mid-session
2. **First-Time Investor Frank** - Starter tier, beginner, heavy support usage
3. **Real Estate Agent Rita** - Pro tier, fast turnaround, client presentations
4. **Weekend Warrior Will** - Free tier, budget-conscious, maximizes free value
5. **Business Development Ben** - Pro tier, commercial properties, high-value deals

## What Gets Tested

- **Chaos Engineering:** 20+ edge cases (invalid data, concurrent requests, rate limits)
- **Cost Estimation:** Azure OpenAI, Stripe fees, infrastructure costs
- **Conversion Flows:** Free → Paid upgrades, tier changes, payment failures
- **Performance:** Concurrent users, batch operations, long sessions

## Expected Results

- **Duration:** ~5 minutes for all 5 users
- **Actions:** ~50 total actions (signup, login, analyze, export, etc.)
- **Conversions:** 3-4 out of 5 users upgrade
- **Cost:** ~$7-10 (mostly Stripe fees, <$0.05 for OpenAI)

## Files

- **`luntra-sim-profiles.yaml`** - User definitions & behavioral profiles
- **`simulation_runner.py`** - Main execution engine
- **`run_simulation.sh`** - Quick start script
- **`SIMULATION_GUIDE.md`** - Comprehensive documentation (READ THIS FIRST!)
- **`requirements.txt`** - Python dependencies

## Documentation

Read **`SIMULATION_GUIDE.md`** for:
- Detailed user personas
- Cost breakdown
- Edge cases tested
- Troubleshooting guide
- Extending the simulation

## Output

After running, you'll get:

1. **`simulation_report_YYYYMMDD_HHMMSS.json`** - Full results
2. **`simulation.log`** - Detailed execution logs
3. Console summary with costs and conversions

## Examples

```bash
# Run single user for testing
./run_simulation.sh --single "Portfolio-Manager-Paula"

# Run sequentially for easier debugging
./run_simulation.sh --sequential

# Custom output file
./run_simulation.sh --output results/production_test.json

# Help
./run_simulation.sh --help
```

## Safety

- Uses test emails: `@simulated.propiq.test`
- Uses Stripe test mode (verify `sk_test_` keys)
- Azure OpenAI costs real money (~$0.03 per simulation)
- Supabase free tier (monitor row count)

## Support

Issues? Check:
1. **`SIMULATION_GUIDE.md`** - Full documentation
2. **`simulation.log`** - Execution logs
3. Backend health: `curl https://luntra.onrender.com/health`

---

**Ready to run?**

```bash
./run_simulation.sh
```
