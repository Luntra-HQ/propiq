# PropIQ Backend - Testing Guide

Quick guide for testing the PropIQ backend API with automated scripts.

## 🚀 Quick Start

### 1. Test Complete API Flow (Recommended First Test)

```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend

# Test all endpoints (health, auth, AI analysis)
./test_railway_api.sh https://your-railway-url.up.railway.app
```

**What it tests:**
- ✅ Backend health check
- ✅ PropIQ AI health check (verifies Azure OpenAI is configured)
- ✅ User signup (creates test user)
- ✅ User login (verifies authentication)
- ✅ AI property analysis (real OpenAI call with San Francisco property)
- ✅ Response format validation (checks all required fields)

**Output:**
- Creates `/tmp/propiq_test_token.txt` (JWT token for subsequent tests)
- Creates `/tmp/propiq_analysis_[timestamp].json` (full AI analysis result)
- Color-coded pass/fail for each test
- Detailed validation of response structure

---

### 2. Test AI Quality with Multiple Properties

```bash
# Must run test_railway_api.sh first to get a token!
./test_ai_analysis.sh https://your-railway-url.up.railway.app
```

**What it tests:**
- 🏠 Expensive San Francisco property (negative cash flow expected)
- 🏠 Mid-range Austin property (positive cash flow potential)
- 🏠 Affordable Cleveland property (high ROI expected)
- 🏢 Luxury Miami condo
- 🏘️ Multi-family Denver property

**Output:**
- Creates `/tmp/propiq_ai_tests_[timestamp]/` directory
- Saves detailed JSON for each property
- Displays key metrics, recommendations, risks
- Validates AI response quality (non-zero values, realistic numbers)

---

## 📋 Test Scenarios

### Scenario 1: First Time Setup

```bash
# After deploying to Railway
cd propiq/backend

# Run complete test suite
./test_railway_api.sh https://propiq-backend-production.up.railway.app

# If all tests pass, test AI quality
./test_ai_analysis.sh https://propiq-backend-production.up.railway.app
```

### Scenario 2: After Code Changes

```bash
# Re-deploy to Railway
railway up

# Wait 2-3 minutes for deployment
sleep 180

# Re-run tests
./test_railway_api.sh
```

### Scenario 3: Debug AI Response

```bash
# Run analysis test to get detailed results
./test_ai_analysis.sh

# Review the generated JSON files
cd /tmp/propiq_ai_tests_*/
cat expensive_sf_property.json | python3 -m json.tool | less
```

---

## 🔍 What to Look For

### ✅ Good AI Analysis

**Indicators of Quality:**
- Deal score between 30-90 (realistic range)
- Monthly cash flow is calculated (positive or negative)
- Cap rate is realistic (3-8% typical)
- Recommendation aligns with numbers:
  - Negative cash flow → "Hold" or "Avoid"
  - Positive cash flow + good location → "Buy" or "Strong Buy"
- Key findings are specific to the location
- Risks are realistic (not generic)

**Example of Good Output:**
```json
{
  "dealScore": 72,
  "dealRating": "Good",
  "monthlyCashFlow": 450.50,
  "capRate": 5.2,
  "recommendation": "This property in Austin's Duval neighborhood shows solid investment potential with positive cash flow and strong rental demand...",
  "keyFindings": [
    "Property is in a high-demand rental area near UT Austin",
    "Monthly cash flow of $450 indicates good income potential",
    "Cap rate of 5.2% is above market average for the area"
  ]
}
```

### ❌ Bad AI Analysis (Issues to Watch For)

**Red Flags:**
- Deal score is 0 or 100 (AI didn't understand the prompt)
- Monthly cash flow is exactly 0 (AI didn't calculate)
- Cap rate is 0 (missing calculation)
- Key findings are generic ("Good location", "Nice property")
- Recommendation doesn't match the numbers
- All risks are the same across different properties

**Example of Bad Output:**
```json
{
  "dealScore": 0,
  "monthlyCashFlow": 0,
  "capRate": 0,
  "keyFindings": ["Good investment", "Nice area"]  // Too generic
}
```

---

## 🐛 Troubleshooting

### Issue: "Token file not found"

**Problem:** `test_ai_analysis.sh` can't find the JWT token

**Solution:**
```bash
# Run the main test first to create a token
./test_railway_api.sh https://your-url.up.railway.app

# Then run AI tests
./test_ai_analysis.sh https://your-url.up.railway.app
```

---

### Issue: "Health check failed"

**Problem:** Backend is not responding

**Solutions:**
1. **Check if Railway is deployed:**
   ```bash
   railway status
   ```

2. **Check Railway logs:**
   ```bash
   railway logs
   ```

3. **Wait for cold start:**
   ```bash
   # Railway services may sleep after inactivity
   # First request can take 30+ seconds
   sleep 30
   ./test_railway_api.sh
   ```

---

### Issue: "Azure OpenAI is NOT configured"

**Problem:** Missing Azure OpenAI environment variables

**Solution:**
```bash
# Set environment variables in Railway
railway variables set AZURE_OPENAI_ENDPOINT="https://luntra-openai-service.cognitiveservices.azure.com/"
railway variables set AZURE_OPENAI_KEY=REDACTED"your-key"
railway variables set AZURE_OPENAI_API_VERSION="2024-02-15-preview"

# Restart service
railway service restart

# Wait and test again
sleep 30
./test_railway_api.sh
```

---

### Issue: "No analyses remaining"

**Problem:** Test user has used all trial analyses

**Solutions:**

**Option 1:** Create a new test user
```bash
# test_railway_api.sh automatically creates unique email each run
./test_railway_api.sh
```

**Option 2:** Manually reset trial count in database
```bash
# Connect to MongoDB Atlas and update user's trial_analyses_remaining
```

**Option 3:** Test with a paid subscription user
```bash
# Use a real user account with active subscription
```

---

### Issue: "Analysis response has zero values"

**Problem:** AI is not calculating properly

**Diagnosis:**
1. Check the prompt in `routers/propiq.py` (lines 263-333)
2. Review the OpenAI response in saved JSON file
3. Check if transformation function is working

**Solution:**
```bash
# Review the raw AI response
cat /tmp/propiq_analysis_*.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
if '_metadata' in data.get('analysis', {}):
    print('Original OpenAI Response:')
    print(json.dumps(data['analysis']['_metadata']['originalOpenAIResponse'], indent=2))
"
```

---

## 📊 Interpreting Results

### Test Script Exit Codes

- `0` - All tests passed ✅
- `1` - At least one test failed ❌

### Color Coding

- 🟢 **Green** - Test passed, value is good
- 🔵 **Blue** - Informational message
- 🟡 **Yellow** - Warning (not critical)
- 🔴 **Red** - Test failed, needs attention

---

## 🔧 Advanced Usage

### Test Against Local Backend

```bash
# Start backend locally
cd propiq/backend
uvicorn api:app --reload --port 8000

# Test against localhost
./test_railway_api.sh http://localhost:8000
```

### Test with Custom Property

```bash
# Modify test_ai_analysis.sh and add your test case:
test_property \
    "My Custom Property" \
    "123 Main St, Your City, ST 12345" \
    "single_family" \
    500000 \
    "Good"
```

### Save Token for Manual Testing

```bash
# Get the token
TOKEN=$(cat /tmp/propiq_test_token.txt)

# Use in manual curl commands
curl -X POST https://your-url/propiq/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address": "...", "propertyType": "single_family", "purchasePrice": 500000}'
```

---

## 📁 Generated Files

### `/tmp/propiq_test_token.txt`
- JWT access token from signup/login
- Valid for 7 days (based on JWT_EXPIRATION_HOURS)
- Reuse this for subsequent tests

### `/tmp/propiq_analysis_[timestamp].json`
- Full AI analysis response from main test
- Includes transformed format + original OpenAI response in `_metadata`
- Use for debugging response transformation

### `/tmp/propiq_ai_tests_[timestamp]/`
- Directory with multiple property analysis results
- One JSON file per test case
- Compare results across different property types

---

## ✅ Success Criteria

**Phase 1 Complete When:**
- ✅ All tests in `test_railway_api.sh` pass
- ✅ Azure OpenAI is configured correctly
- ✅ AI returns realistic property analysis
- ✅ Response format matches extension schema
- ✅ Deal scores, cash flow, cap rates are calculated
- ✅ Recommendations align with financial metrics

**Next Step:** Test with Chrome extension!

---

## 🚀 Next Steps After Testing

1. **Review AI Quality**
   ```bash
   # Look at generated analyses
   cat /tmp/propiq_ai_tests_*/expensive_sf_property.json | python3 -m json.tool
   ```

2. **Tune Prompt if Needed**
   - Edit `propiq/backend/routers/propiq.py` lines 263-333
   - Redeploy: `railway up`
   - Retest: `./test_ai_analysis.sh`

3. **Test with Extension**
   - Build extension: `cd propiq-extension-starter && npm run build`
   - Load in Chrome: `chrome://extensions/`
   - Disable mock mode
   - Test on real Zillow listings

---

**Generated with Claude Code**
Last Updated: 2025-11-01
