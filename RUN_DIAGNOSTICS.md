# How to Run PropIQ Database Diagnostics

**Purpose:** Verify that all property analyses are properly saved with userId associations.

**Time Required:** 5 minutes

---

## 🚀 Quick Start - Run in Convex Dashboard

### Step 1: Open Convex Dashboard
1. Go to: **https://dashboard.convex.dev**
2. Select your **PropIQ** project (likely named `mild-tern-361` based on your deployment)
3. Click on **"Functions"** in the left sidebar

---

### Step 2: Run Database Integrity Check

**In the Functions panel:**

1. Find the search box and type: `diagnostics`
2. Click on: **`api.diagnostics.checkAnalysesIntegrity`**
3. Click the **"Run"** button (no parameters needed)

**Expected Result:**
```json
{
  "summary": {
    "totalAnalyses": 127,
    "validAnalyses": 127,
    "orphanedAnalyses": 0,  // ← Should be 0!
    "totalUsers": 45,
    "usersWithAnalyses": 38,
    "usersWithMismatch": 0  // ← Should be 0!
  },
  "orphanedAnalyses": [],
  "userMismatches": [],
  "recentAnalyses": [...]
}
```

---

### Step 3: Interpret Results

#### ✅ **Good Health (Everything Working):**
```json
{
  "orphanedAnalyses": 0,     // No analyses without valid userId
  "usersWithMismatch": 0     // All counters match actual data
}
```
**Conclusion:** Code is working perfectly! Issue #2 is **NOT a bug**, just a UX perception issue.

---

#### ⚠️ **Orphaned Analyses Found:**
```json
{
  "orphanedAnalyses": 5,  // ← Problem!
  "orphanedAnalyses": [
    {
      "analysisId": "abc123",
      "userId": "xyz789",  // This userId doesn't exist
      "address": "123 Main St",
      "createdAt": "2025-12-20T10:30:00.000Z"
    }
  ]
}
```
**Conclusion:** There ARE orphaned analyses. Investigate:
1. Check if these are from a specific time period
2. Verify if this correlates with reported "lost data"
3. May indicate a real bug (but code review showed no issues)

---

#### ⚠️ **Counter Mismatches Found:**
```json
{
  "usersWithMismatch": 3,
  "userMismatches": [
    {
      "userId": "jd7...",
      "email": "user@example.com",
      "analysesUsed": 10,     // User counter says 10
      "actualAnalyses": 8,    // But only 8 exist in DB
      "mismatch": true
    }
  ]
}
```
**Conclusion:** Counter sync issue. Possible causes:
1. Analysis was counted but save failed
2. Counter incremented twice for same analysis
3. Analysis was deleted but counter not decremented

**Fix:** Run reconciliation to sync counters

---

## 🔍 Optional: Check Specific User

If a user reports lost analyses, check their specific account:

### In Convex Dashboard:
1. Find: **`api.diagnostics.checkUserAnalyses`**
2. Enter parameters:
   ```json
   {
     "userId": "paste-user-id-here"
   }
   ```
3. Click **"Run"**

**Result:**
```json
{
  "user": {
    "email": "user@example.com",
    "analysesUsed": 5,
    "analysesLimit": 3,
    "subscriptionTier": "free"
  },
  "analyses": {
    "total": 5,
    "list": [
      { "analysisId": "...", "address": "123 Main St", "createdAt": "..." },
      { "analysisId": "...", "address": "456 Oak Ave", "createdAt": "..." }
    ]
  },
  "discrepancy": false,
  "discrepancyDetails": {
    "userCounter": 5,
    "actualAnalyses": 5,
    "difference": 0  // ← Should be 0
  }
}
```

---

## 📊 Quick Database Summary

For a bird's-eye view of your database:

### In Convex Dashboard:
1. Find: **`api.diagnostics.getDatabaseSummary`**
2. Click **"Run"** (no parameters)

**Result:**
```json
{
  "users": {
    "total": 150,
    "byTier": {
      "free": 120,
      "starter": 20,
      "pro": 8,
      "elite": 2
    }
  },
  "analyses": {
    "total": 450,
    "last7Days": 89
  },
  "sessions": {
    "total": 75,
    "active": 32
  },
  "health": {
    "status": "ok",
    "timestamp": "2025-12-21T16:30:00.000Z"
  }
}
```

---

## 🎯 What to Do Based on Results

### Scenario 1: All Clear (Most Likely)
```
orphanedAnalyses: 0
usersWithMismatch: 0
```
**Action:**
- ✅ Update `PRODUCTION_ISSUES_TRACKER.md`
- ✅ Mark Issue #2 as: **NOT A BUG - UX ISSUE**
- ✅ Note: "All analyses properly saved. Users need better confirmation messaging (now added)."

---

### Scenario 2: Orphaned Analyses Found
```
orphanedAnalyses: > 0
```
**Action:**
1. Check `createdAt` timestamps - are they all old (before recent code)?
2. Check if they correlate with reported "lost data" dates
3. If recent: Investigate further (but code review showed no bugs)
4. If old: Likely from previous implementation, can be ignored

---

### Scenario 3: Counter Mismatches
```
usersWithMismatch: > 0
```
**Action:**
1. Run reconciliation script (can be created if needed)
2. Update user counters to match actual data
3. Add monitoring to detect future mismatches

---

## 📝 Document Your Findings

After running diagnostics, update this file with results:

**Date:** _______________
**Run by:** _______________

**Results:**
- Total Analyses: _____
- Valid Analyses: _____
- Orphaned Analyses: _____
- User Mismatches: _____

**Conclusion:**
_____________________________________________
_____________________________________________

**Actions Taken:**
- [ ] Updated PRODUCTION_ISSUES_TRACKER.md
- [ ] Notified team of findings
- [ ] Created fix (if needed)

---

## 🛠️ Troubleshooting

### "Function not found"
**Cause:** Diagnostics not deployed to production

**Fix:**
```bash
npx convex deploy --prod
```

### "Cannot read property"
**Cause:** Schema mismatch or missing data

**Fix:** Check that all fields exist in schema

### "Query timeout"
**Cause:** Large database, query taking too long

**Fix:** Add pagination to diagnostic queries

---

## 📞 Need Help?

If diagnostics show unexpected results:
1. Review `ISSUE_2_INVESTIGATION_REPORT.md`
2. Check code in `convex/diagnostics.ts`
3. Verify schema in `convex/schema.ts`
4. Check recent deployments

---

**Created:** December 21, 2025
**Purpose:** Verify Issue #2 investigation findings
**Expected Result:** orphanedAnalyses = 0 (code is working correctly)
