# PropIQ Convex Migration Plan

**Date:** 2025-11-17
**Status:** In Progress
**Goal:** Migrate from FastAPI (Azure/abandoned) to Convex backend

---

## Current State (FastAPI Backend)

### **Routers (Python FastAPI)**
Located in: `backend/routers/`

1. **Authentication** (`auth.py` - likely in backend root)
   - POST `/auth/signup` - Create user account
   - POST `/auth/login` - User login with JWT
   - GET `/auth/users/{userId}` - Get user profile

2. **Property Analysis** (`propiq.py`)
   - POST `/propiq/analyze` - AI-powered property analysis
   - GET `/propiq/health` - Health check

3. **Payments** (`payment.py`)
   - POST `/stripe/create-checkout-session` - Stripe checkout
   - POST `/stripe/webhook` - Stripe webhooks

4. **Support Chat** (`support_chat.py`)
   - POST `/support/chat` - AI support chat
   - GET `/support/history/{conversationId}` - Chat history
   - GET `/support/conversations` - List conversations

5. **Marketing** (`marketing.py`)
   - POST `/marketing/capture-email` - Email capture

6. **Onboarding** (`onboarding.py`)
   - User onboarding flows

### **Database**
- MongoDB Atlas (via `database.py`)
- Collections: `users`, `property_analyses`, `support_chats`

### **External Services**
- Azure OpenAI (GPT-4o-mini) - Property analysis
- Stripe - Payments
- SendGrid - Emails
- Weights & Biases - Analytics

### **Current Problem**
- Backend deployed to Azure: `luntra-outreach-app.azurewebsites.net`
- Azure endpoint is DOWN (not responding)
- Frontend hardcoded to Azure URL
- No active backend deployment

---

## Target State (Convex Backend)

### **Why Convex?**
Based on Ras Mic's recommendation for investment SaaS:
- ✅ Real-time by default
- ✅ Built-in database (TypeScript-native)
- ✅ Scheduled functions & cron jobs
- ✅ Webhooks built-in
- ✅ Background jobs with long timeouts
- ✅ No server management
- ✅ Built-in authentication
- ✅ File storage built-in

### **Architecture**

```
propiq/
├── convex/              # NEW - Convex backend
│   ├── schema.ts        # Database schema
│   ├── auth.ts          # Authentication logic
│   ├── propiq.ts        # Property analysis
│   ├── payments.ts      # Stripe integration
│   ├── support.ts       # Support chat
│   ├── http.ts          # HTTP endpoints for webhooks
│   └── _generated/      # Auto-generated
├── frontend/            # Existing React app
└── backend/             # OLD - Archive after migration
```

### **Convex Functions Structure**

**Queries** (Read operations):
- `users.get(userId)` - Get user profile
- `analyses.list(userId)` - List user's analyses
- `support.getHistory(conversationId)` - Chat history

**Mutations** (Write operations):
- `auth.signup({ email, password, ... })` - Create account
- `auth.login({ email, password })` - Login
- `propiq.analyze({ address, ... })` - Analyze property
- `support.sendMessage({ message, ... })` - Send chat message

**Actions** (External API calls):
- `propiq.analyzeWithAI({ propertyData })` - Call OpenAI
- `payments.createCheckoutSession()` - Call Stripe
- `emails.sendWelcome()` - Send email via SendGrid

**HTTP Routes** (Webhooks):
- `/stripe-webhook` - Stripe webhook handler

---

## Migration Strategy

### **Phase 1: Setup & Authentication** (Day 1)
**Goal:** Get account creation working

1. ✅ Document current backend
2. ⏳ Install Convex CLI
3. ⏳ Initialize Convex in PropIQ
4. ⏳ Set up Convex schema (users table)
5. ⏳ Migrate authentication:
   - Signup mutation
   - Login mutation
   - User queries
6. ⏳ Update frontend to use Convex React hooks
7. ⏳ Test account creation end-to-end
8. ⏳ Remove Azure URL from frontend
9. ⏳ Deploy

**Success Criteria:**
- Users can sign up
- Users can log in
- User data persists in Convex

### **Phase 2: Property Analysis** (Day 2)
**Goal:** Get core feature working

1. Migrate property analysis logic
2. Set up OpenAI integration in Convex action
3. Create analyses table in schema
4. Implement analysis mutation
5. Test property analysis

**Success Criteria:**
- Users can analyze properties
- AI generates analysis using OpenAI
- Results stored in Convex database

### **Phase 3: Payments & Support** (Day 3)
**Goal:** Complete feature parity

1. Set up Stripe webhook endpoint
2. Migrate payment logic
3. Migrate support chat
4. Set up scheduled functions (if needed)
5. Full end-to-end testing

**Success Criteria:**
- Stripe payments work
- Webhooks process correctly
- Support chat functional

### **Phase 4: Cleanup & Deploy** (Day 3)
1. Remove FastAPI backend code
2. Remove Azure references everywhere
3. Update documentation
4. Final deployment
5. Monitor production

---

## Convex Setup Steps

### **1. Install Convex**
```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq
npm install convex
npx convex dev
```

### **2. Initialize Convex Project**
- Create account at convex.dev
- Connect to project
- Set up deployment

### **3. Create Schema**
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    company: v.optional(v.string()),
    subscriptionTier: v.string(), // "free", "starter", "pro", "elite"
    analysesUsed: v.number(),
    analysesLimit: v.number(),
    active: v.boolean(),
    created_at: v.number(),
    last_login: v.optional(v.number()),
  }).index("by_email", ["email"]),

  property_analyses: defineTable({
    userId: v.id("users"),
    address: v.string(),
    analysis: v.string(), // JSON string of analysis result
    aiRecommendation: v.string(),
    dealScore: v.number(),
    created_at: v.number(),
  }).index("by_user", ["userId"]),

  support_chats: defineTable({
    userId: v.id("users"),
    conversationId: v.string(),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.number(),
    })),
  }).index("by_user", ["userId"]),
});
```

### **4. Environment Variables**
Set in Convex dashboard:
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`

---

## Frontend Changes

### **1. Install Convex Client**
```bash
cd frontend
npm install convex
```

### **2. Update API Configuration**
**Before:** `src/config/api.ts`
```typescript
const API_BASE_URL = 'https://luntra-outreach-app.azurewebsites.net/api/v1';
```

**After:** Use Convex React hooks
```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
```

### **3. Update Components**
**Before:** REST API calls
```typescript
const response = await fetch('/api/v1/auth/signup', {
  method: 'POST',
  body: JSON.stringify(userData)
});
```

**After:** Convex mutations
```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const signup = useMutation(api.auth.signup);
await signup({ email, password, firstName, lastName });
```

---

## Migration Checklist

### **Phase 1: Setup**
- [ ] Install Convex CLI globally
- [ ] Initialize Convex in propiq root
- [ ] Create Convex account & project
- [ ] Set up development environment
- [ ] Create initial schema
- [ ] Test Convex connection

### **Phase 2: Authentication**
- [ ] Create auth.signup mutation
- [ ] Create auth.login mutation
- [ ] Create users.get query
- [ ] Add password hashing (bcrypt)
- [ ] Add JWT alternative (Convex auth)
- [ ] Update frontend signup component
- [ ] Update frontend login component
- [ ] Test account creation
- [ ] Test login flow

### **Phase 3: Frontend Integration**
- [ ] Install convex npm package in frontend
- [ ] Add ConvexProvider to App.tsx
- [ ] Update signup page to use Convex
- [ ] Update login page to use Convex
- [ ] Remove old API client code
- [ ] Update environment variables

### **Phase 4: Property Analysis**
- [ ] Create propiq.analyze action (calls OpenAI)
- [ ] Create analyses.list query
- [ ] Migrate analysis logic from Python to TypeScript
- [ ] Test analysis with real property data

### **Phase 5: Payments**
- [ ] Create payments.createCheckout mutation
- [ ] Set up Stripe webhook HTTP route
- [ ] Test payment flow

### **Phase 6: Support Chat**
- [ ] Create support.sendMessage mutation
- [ ] Create support.getHistory query
- [ ] Migrate AI support logic

### **Phase 7: Cleanup**
- [ ] Remove Azure URLs from all files
- [ ] Remove backend/ directory (archive first)
- [ ] Update all documentation
- [ ] Remove Azure deployment scripts

### **Phase 8: Deploy**
- [ ] Deploy Convex backend (automatic)
- [ ] Deploy frontend to Netlify
- [ ] Update environment variables
- [ ] Test production
- [ ] Monitor logs

---

## Azure References to Remove

**Frontend:**
- `src/config/api.ts` - Line 14: Azure URL
- Tests that reference Azure
- Documentation mentioning Azure

**Backend:**
- Archive entire `backend/` directory
- Keep for reference during migration

---

## Rollback Plan

If migration fails:
1. Keep old FastAPI code in `backend-archive/`
2. Deploy FastAPI to Railway as backup
3. Can switch frontend URL back if needed

---

## Success Metrics

- ✅ Users can create accounts
- ✅ Users can log in
- ✅ Property analysis works
- ✅ No Azure dependencies
- ✅ Faster than old backend
- ✅ Deployments automated

---

## Timeline

- **Day 1 (Today):** Setup + Authentication migration
- **Day 2:** Property analysis migration
- **Day 3:** Complete migration + deploy

---

## Next Steps

1. Install Convex CLI
2. Initialize Convex project
3. Create initial schema
4. Migrate signup/login
5. Test end-to-end
6. Deploy

**Starting now! 🚀**
