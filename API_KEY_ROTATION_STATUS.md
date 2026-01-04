# API Key Rotation Status

**Last Updated:** December 31, 2025
**Last Verified:** December 31, 2025

---

## ✅ Completed Rotations

### Convex Deploy Key
- **Status:** ✅ Rotated December 30, 2025 @ 6:22 PM
- **Old Key (last 10 chars):** `...ZkY2IxIn0=`
- **New Key (last 10 chars):** `...ZjI5In0=`
- **Verification:** `npx convex deploy --dry-run` successful
- **Action:** None needed - rotation complete

### JWT Secret
- **Status:** ✅ Rotated December 30, 2025 @ 6:22 PM
- **Old Secret (last 14 chars):** `...7d5b2dfedd5e2b`
- **New Secret (last 14 chars):** `...07a6e0e6e0c572`
- **Method:** Generated via `openssl rand -hex 32`
- **Impact:** All users logged out (expected behavior)
- **Action:** None needed - rotation complete

### Slack Webhook URL
- **Status:** ✅ Rotated December 30, 2025 @ 6:22 PM
- **Old Webhook (last 19 chars):** `...WzHCQNHy0VfBYCHnPLS`
- **New Webhook (last 19 chars):** `...YbzcDBNUDHnYVWKLsJ1`
- **Verification:** Notifications working
- **Action:** None needed - rotation complete

---

## ⚫ Deprecated / Not in Use (No Action Needed)

### MongoDB
- **Status:** ⚫ Deprecated December 30, 2025
- **Reason:** Migrated to Convex
- **Action:** None - service no longer in use

### Supabase
- **Status:** ⚫ Deprecated December 30, 2025
- **Reason:** Migrated to Convex
- **Action:** None - service no longer in use

### Intercom
- **Status:** ⚫ Not in use
- **Reason:** PropIQ uses custom support chat (SupportChat.tsx)
- **Action:** None - service no longer in use

### SendGrid
- **Status:** ⚫ Not in use
- **Reason:** Email service no longer in use
- **Action:** None - service no longer in use

### Sentry
- **Status:** ⚫ Not in use
- **Reason:** Error tracking not currently implemented
- **Action:** None - service no longer in use

---

## 📋 Pending Manual Rotation

### 1. Stripe Keys (HIGH PRIORITY)
- **Status:** 🟡 Documented, pending manual rotation
- **Guide:** `STRIPE_KEY_ROTATION_GUIDE.md`
- **Keys to rotate:**
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- **Location:** Convex environment variables
- **Rotation:** https://dashboard.stripe.com/apikeys
- **Estimated Time:** 30-45 minutes
- **Downtime:** None if done correctly

### 2. Azure OpenAI Key (MEDIUM PRIORITY)
- **Status:** 🔴 Not rotated
- **Risk:** Unauthorized AI usage, unexpected bills
- **Location:** Convex environment variables
- **Rotation:** Azure Portal → OpenAI resource → Keys and Endpoint
- **Estimated Time:** 15 minutes
- **Downtime:** None (dual keys available)

### 3. Weights & Biases API Key (LOW PRIORITY)
- **Status:** 🔴 Not rotated
- **Risk:** Analytics access
- **Location:** Convex environment variables
- **Rotation:** https://wandb.ai/settings
- **Estimated Time:** 5 minutes
- **Downtime:** None (analytics only)

---

## Rotation Priority Order

### Immediate (This Week)
1. ✅ Convex Deploy Key - **DONE** (Dec 30, 2025)
2. ✅ JWT Secret - **DONE** (Dec 30, 2025)
3. ✅ Slack Webhook - **DONE** (Dec 30, 2025)
4. 🟡 Stripe Keys - **Documented, ready to execute**
5. 🔴 Azure OpenAI Key - **Needs rotation guide**

### Low Priority (Next 2 Weeks)
6. 🔴 Weights & Biases - **Low risk, rotate when convenient**

---

## Verification Commands

### Convex Deploy Key
```bash
# Verify new key works
npx convex deploy --dry-run

# Expected: "Would have deployed Convex functions"
# ✅ VERIFIED: Working as of Dec 31, 2025
```

### Stripe Keys (After Rotation)
```bash
# Test Stripe API connectivity
curl https://api.stripe.com/v1/customers \
  -u "NEW_STRIPE_SECRET_KEY:" \
  -X GET

# Expected: JSON response with customer data
```

### Azure OpenAI Key (After Rotation)
```bash
# Test via Convex function
# Run property analysis and verify it works
```

---

## Next Steps

1. **Stripe Rotation**
   - Follow `STRIPE_KEY_ROTATION_GUIDE.md`
   - Schedule 45-minute window
   - Execute rotation
   - Verify payment flow

2. **Azure OpenAI Rotation**
   - Create rotation guide (similar to Stripe guide)
   - Rotate Key 1 (keep Key 2 as backup)
   - Update Convex environment
   - Test property analysis

3. **Weights & Biases Rotation** (Low priority)
   - Create rotation guide
   - Generate new API key
   - Update Convex environment
   - Verify analytics tracking works

---

## Rotation Schedule

| Service | Last Rotated | Next Rotation | Frequency | Status |
|---------|--------------|---------------|-----------|--------|
| Convex Deploy Key | Dec 30, 2025 | April 1, 2026 | 90 days | ✅ Done |
| JWT Secret | Dec 30, 2025 | April 1, 2026 | 90 days | ✅ Done |
| Slack Webhook | Dec 30, 2025 | April 1, 2026 | 90 days | ✅ Done |
| Stripe Keys | - | Jan 7, 2026 | 90 days | 🟡 Pending |
| Azure OpenAI | - | Jan 14, 2026 | 90 days | 🔴 Not done |
| W&B API Key | - | Feb 1, 2026 | 90 days | 🔴 Not done |

---

## Documentation

- ✅ `STRIPE_KEY_ROTATION_GUIDE.md` - Complete Stripe rotation procedure
- ⏳ Azure OpenAI rotation guide - Needed
- ⏳ SendGrid rotation guide - Needed
- ✅ `SECURITY_QUICKSTART.md` - General security practices
- ✅ `SECURITY_AUDIT_REPORT.md` - Full security audit findings

---

**Summary:**
- ✅ 3 keys rotated (Convex, JWT, Slack)
- ⚫ 5 services deprecated/not in use (MongoDB, Supabase, SendGrid, Intercom, Sentry)
- 🟡 1 key documented (Stripe - ready to rotate)
- 🔴 2 keys pending rotation (Azure OpenAI, W&B)

**Total Active Keys:** 6
**Total Rotated:** 3 (50%)
**Total Pending:** 3 (50%) - includes Stripe
**Total Deprecated:** 5 (not counted in active)
