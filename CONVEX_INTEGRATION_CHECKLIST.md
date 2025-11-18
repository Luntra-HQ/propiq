# Convex Backend Integration Checklist

**Verify Convex is fully integrated with propiq.luntra.one**

## Quick Test Commands

```bash
cd frontend

# Run all production integration tests
npm run verify:production

# Test specific features
npm run test:production:signup      # User registration
npm run test:production:analysis    # Property analysis
npm run test:production:backend     # Full backend integration
```

---

## Manual Verification Steps

### 1. User Registration ✅

**Test:** Create new user account

1. Go to https://propiq.luntra.one
2. Click "Sign Up"
3. Enter: `test-$(date +%s)@example.com`
4. Set password
5. Submit

**Expected:**
- User is logged in
- User appears in Convex `users` table
- Auth token stored in localStorage

**Verify in Convex Dashboard:**
```
Open: https://dashboard.convex.dev
Navigate to: prod:mild-tern-361 → Data → users
Check: New user with email exists
```

---

### 2. Property Analysis ✅

**Test:** Analyze a property

1. Log in to propiq.luntra.one
2. Navigate to analysis section
3. Enter property details
4. Click "Analyze"

**Expected:**
- Analysis results display
- Entry in `propertyAnalyses` table
- User's `analysesUsed` counter increments

**Verify in Convex Dashboard:**
```
Navigate to: Data → propertyAnalyses
Check: Analysis record exists with correct userId
Navigate to: Data → users → [your user]
Check: analysesUsed field incremented
```

---

### 3. Usage Limits ✅

**Test:** Enforce free tier limit

1. Create fresh account
2. Run 3 analyses (free limit)
3. Attempt 4th analysis

**Expected:**
- 4th analysis blocked
- Upgrade prompt shown
- User record shows 3/3 used

---

### 4. Authentication Persistence ✅

**Test:** Session management

1. Log in
2. Refresh page
3. Open new tab

**Expected:**
- User stays logged in after refresh
- Session persists across tabs
- JWT token valid

---

### 5. Support Chat ✅

**Test:** Chat functionality

1. Open support chat
2. Send message
3. Receive AI response

**Expected:**
- Message sent to Convex
- AI response received
- Conversation saved in `supportChats` table

**Verify in Convex Dashboard:**
```
Navigate to: Data → supportChats
Check: Conversation with your userId exists
Check: Messages array contains your message + AI response
```

---

### 6. Real-time Sync ✅

**Test:** WebSocket connection

1. Open DevTools → Network
2. Load propiq.luntra.one
3. Look for WebSocket connection

**Expected:**
- WebSocket to `mild-tern-361.convex.cloud` established
- Connection status: Active

---

### 7. Subscription Flow ✅

**Test:** Payment integration

1. Go to /pricing
2. Click "Subscribe" on any tier
3. Observe redirect

**Expected:**
- Redirects to Stripe checkout
- Checkout URL contains session ID
- Return URL configured

---

## Automated Test Results

Run the verification script and check for:

```bash
npm run verify:production
```

**Expected Output:**
```
✅ Frontend is accessible
✅ Convex backend is accessible
✅ User registration works
✅ Property analysis works
✅ WebSocket connection works
```

---

## Database Schema Verification

### Check Tables Exist

In Convex Dashboard, verify these tables:

- [ ] `users`
  - Fields: email, passwordHash, subscriptionTier, analysesUsed, analysesLimit
  - Indexes: by_email, by_stripe_customer

- [ ] `propertyAnalyses`
  - Fields: userId, address, analysisResult, dealScore, createdAt
  - Indexes: by_user, by_user_and_date

- [ ] `supportChats`
  - Fields: userId, conversationId, messages, status
  - Indexes: by_user, by_conversation

- [ ] `stripeEvents`
  - Fields: eventId, eventType, customerId, status
  - Indexes: by_event_id

---

## Environment Variables Check

### Frontend (Vercel/Netlify/Cloudflare)

- [ ] `VITE_CONVEX_URL` = `https://mild-tern-361.convex.cloud`

### Convex Dashboard

Go to: Settings → Environment Variables

- [ ] `OPENAI_API_KEY` (for AI analysis)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Price IDs configured

---

## Common Issues & Solutions

### Issue: "User not found" error

**Solution:**
1. Check ConvexProvider in main.tsx
2. Verify VITE_CONVEX_URL is correct
3. Check browser console for errors

### Issue: Analysis not saving

**Solution:**
1. Check Convex function logs
2. Verify user has auth token
3. Check userId is being passed correctly

### Issue: Real-time updates not working

**Solution:**
1. Check WebSocket connection in DevTools
2. Verify no CORS errors
3. Check Convex deployment status

### Issue: Stripe webhooks failing

**Solution:**
1. Verify webhook endpoint is public
2. Check webhook secret matches
3. Review Convex logs for errors

---

## Success Criteria

✅ **Integration is complete when:**

1. Users can sign up and data appears in Convex
2. Property analysis works end-to-end
3. Analysis history loads from database
4. Usage limits are enforced
5. Support chat sends/receives messages
6. Real-time WebSocket connection active
7. No errors in Convex logs
8. All automated tests pass

---

## Next Steps After Verification

1. [ ] Monitor production for 24 hours
2. [ ] Review error logs daily
3. [ ] Set up alerts for failures
4. [ ] Create first real user account
5. [ ] Test live payment flow
6. [ ] Share with beta users

---

## Support Resources

- **Convex Dashboard:** https://dashboard.convex.dev
- **Test Reports:** `npm run test:report`
- **Logs:** Convex Dashboard → Logs
- **Documentation:** /Users/briandusape/Projects/LUNTRA/propiq/frontend/TESTING_GUIDE.md

