# PropIQ Integration Summary

## Overview
This document provides a complete overview of all third-party integrations configured for PropIQ, including backend and frontend implementations.

**Last Updated**: 2025-10-21

---

## Configured Integrations

### 1. Weights & Biases (AI Tracking) ✅ CONFIGURED

**Purpose**: Track AI model performance, token usage, and analysis quality

**Status**: ✅ Fully configured with API key

**Backend Integration**: `routers/propiq.py:16-32`
- Tracks every property analysis automatically
- Logs input parameters, model usage, and analysis results
- Works in both online and offline modes

**Credentials**:
```bash
WANDB_API_KEY=12421393e758b9d1dc651df9da417d30039fff55
WANDB_MODE=online
```

**Dashboard**: https://wandb.ai/
**Metrics Tracked**:
- Property address, type, purchase price
- Tokens used, model performance
- Analysis recommendation, confidence score, ROI, cap rate
- User metadata (subscription tier, user_id)

**Cost**: Free tier (up to 100GB storage, unlimited runs)

---

### 2. Microsoft Clarity (User Behavior Analytics) ✅ CONFIGURED

**Purpose**: Session replays, heatmaps, click analytics, user behavior insights

**Status**: ✅ Account created, ready for frontend integration

**Frontend Integration**: JavaScript snippet (add to `luntra/frontend/index.html`)

**Credentials**:
```javascript
Project ID: tts5hc8zf8
```

**Dashboard**: https://clarity.microsoft.com/
**Features**:
- Session replays (watch user interactions)
- Heatmaps (where users click and scroll)
- Rage clicks (frustrated users)
- Dead clicks (clicking non-interactive elements)

**Documentation**: `MICROSOFT_CLARITY_INTEGRATION.md`

**Cost**: Free forever (unlimited sessions, 1 year retention)

**Next Steps**:
1. Add script to `luntra/frontend/index.html` (see doc for code)
2. Deploy frontend
3. Wait 2-4 hours for data to appear
4. Start analyzing in dashboard

---

### 3. Intercom (Customer Messaging) ✅ PARTIALLY CONFIGURED

**Purpose**: Live chat, product tours, in-app messages, customer support

**Status**:
- ✅ Frontend App ID configured: `hvhctgls`
- ✅ Backend integration code complete
- ⚠️  Awaiting Access Token and Webhook Secret

**Frontend Integration**: React SDK
**Backend Integration**: `routers/intercom.py` (webhook handler, event tracking)

**Credentials**:
```bash
# Frontend
App ID: hvhctgls

# Backend (need to obtain)
INTERCOM_ACCESS_TOKEN=<get from Intercom dashboard>
INTERCOM_WEBHOOK_SECRET=<get when creating webhook>
```

**Dashboards**:
- Intercom App: https://app.intercom.com/a/apps/hvhctgls
- Developer Settings: https://app.intercom.com/a/apps/hvhctgls/settings/developers

**Features**:
- Live chat messenger widget
- User event tracking (signups, analyses, upgrades)
- Conversation history
- In-app messaging and product tours

**Documentation**:
- Frontend: `INTERCOM_MESSENGER_INTEGRATION.md`
- Backend: `INTERCOM_BACKEND_API_SETUP.md`

**Cost**: Free 14-day trial, then $74/month (Start plan)

**Next Steps**:
1. Get Access Token from Intercom developer settings
2. Create webhook and get Webhook Secret
3. Add both to `.env` file
4. Frontend: Install `@intercom/messenger-js-sdk` and integrate
5. Test integration

---

### 4. Stripe (Payments) ✅ CONFIGURED

**Purpose**: Subscription billing, payment processing

**Status**: ✅ Fully configured with live API keys

**Backend Integration**: `routers/payment.py`

**Credentials**:
```bash
STRIPE_SECRET_KEY=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
STRIPE_PRICE_ID=price_1RqHkREtJUE5bLBgPGCA4EOz
STRIPE_WEBHOOK_SECRET=whsec_05faf4882ab063e18686d4088b8ee2d6293095a5ce5f74805cbf701bb45745d4
```

**Dashboard**: https://dashboard.stripe.com/

**Features**:
- Subscription checkout sessions
- Webhook handling for payment events
- Subscription status tracking
- Customer portal integration

**Cost**: 2.9% + $0.30 per successful charge

---

### 5. Azure OpenAI (AI Analysis) ✅ CONFIGURED

**Purpose**: Property analysis AI using GPT-4o-mini

**Status**: ✅ Fully configured and operational

**Backend Integration**: `routers/propiq.py:50-54`

**Credentials**:
```bash
AZURE_OPENAI_ENDPOINT=https://luntra-openai-service.cognitiveservices.azure.com/
AZURE_OPENAI_KEY=938KkvrloTxNKLBPytAuZm2OKQtQOcY1v2DB1bx3isMZ2ewUjYLAJQQJ99BJACYeBjFXJ3w3AAABACOGEx8u
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

**Dashboard**: https://portal.azure.com/

**Cost**: Pay-per-token (GPT-4o-mini is cost-effective)

---

### 6. MongoDB Atlas (Database) ✅ CONFIGURED

**Purpose**: User data, property analyses, authentication

**Status**: ✅ Fully configured with MongoDB Atlas

**Backend Integration**: `database_mongodb.py`

**Credentials**:
```bash
MONGODB_URI=mongodb+srv://dealIQ_backend_user:nahpyr-dyPhy3-xoqwat@propiq-production-clust.q4050y.mongodb.net/propiq?retryWrites=true&w=majority&appName=PropIQ-Production-Cluster
```

**Dashboard**: https://cloud.mongodb.com/

**Features**:
- User authentication (bcrypt password hashing)
- Property analysis storage
- Trial usage tracking
- Subscription status management

**Cost**: Free tier (MongoDB Atlas sponsorship credits)

---

## Integration Health Status

Current backend health endpoints:

```bash
# Main API
GET /health
Status: ✅ healthy

# PropIQ (Azure OpenAI + W&B)
GET /propiq/health
Status: ✅ healthy
- azure_openai_configured: true
- wandb_enabled: true

# Stripe Payments
GET /stripe/health
Status: ✅ healthy
- stripe_configured: true

# Intercom Messaging
GET /intercom/health
Status: ⚠️  degraded
- intercom_configured: false (awaiting API credentials)
```

---

## Environment Variables Summary

All credentials are stored in `/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq/backend/.env`:

### ✅ Configured
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_API_VERSION`, `AZURE_OPENAI_DEPLOYMENT`
- `MONGODB_URI`
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- `WANDB_API_KEY`, `WANDB_MODE`
- `JWT_SECRET`

### ⚠️  Needs Configuration
- `INTERCOM_ACCESS_TOKEN` (get from: https://app.intercom.com/a/apps/hvhctgls/settings/developers)
- `INTERCOM_WEBHOOK_SECRET` (get when creating webhook)

### 📝 Frontend Only (No Backend Config)
- Microsoft Clarity Project ID: `tts5hc8zf8`
- Intercom App ID: `hvhctgls`

---

## Deployment Checklist

### Backend (Azure Web App)

✅ **Done**:
- Azure OpenAI configured
- MongoDB Atlas connected
- Stripe payments operational
- Weights & Biases tracking enabled
- JWT authentication working

⚠️  **Pending**:
- Add Intercom Access Token to Azure App Settings
- Add Intercom Webhook Secret to Azure App Settings

**Deploy Command**:
```bash
cd /Users/briandusape/Projects/LUNTRA/LUNTRA\ MVPS/propiq/backend
./deploy-azure.sh
```

### Frontend (React/Vite)

⚠️  **Pending**:
- Add Microsoft Clarity script to `index.html`
- Install Intercom Messenger SDK: `npm install @intercom/messenger-js-sdk`
- Integrate Intercom (see `INTERCOM_MESSENGER_INTEGRATION.md`)
- Add environment variables:
  ```bash
  VITE_CLARITY_PROJECT_ID=tts5hc8zf8
  VITE_INTERCOM_ENABLED=true
  ```

---

## User Journey Integration Flow

### 1. User Signs Up
```
Frontend ──[POST /auth/register]──> Backend
                                        │
                                        ├──> MongoDB: Create user
                                        ├──> Intercom: notify_user_signup()
                                        └──> Frontend: Return JWT token
                                             │
                                             └──> Initialize Intercom Messenger
```

### 2. User Analyzes Property
```
Frontend ──[POST /propiq/analyze]──> Backend
                                        │
                                        ├──> Check trial count (MongoDB)
                                        ├──> Azure OpenAI: Generate analysis
                                        ├──> MongoDB: Save analysis, decrement trial
                                        ├──> W&B: Log metrics
                                        ├──> Intercom: notify_property_analysis()
                                        └──> Frontend: Display results
                                             │
                                             ├──> Clarity: Track user interaction
                                             └──> Intercom: trackEvent('property_analyzed')
```

### 3. User Upgrades Subscription
```
Frontend ──[POST /stripe/create-checkout]──> Backend
                                                 │
                                                 └──> Stripe: Create checkout session
                                                      │
                                                      └──> Frontend: Redirect to Stripe
                                                           │
                                                           └──[Payment Success]──> Stripe Webhook
                                                                                      │
                                                                                      ├──> MongoDB: Update subscription
                                                                                      ├──> Intercom: notify_subscription_change()
                                                                                      └──> Frontend: Update UI
                                                                                           │
                                                                                           └──> Intercom: trackEvent('subscription_upgraded')
```

---

## Monitoring & Analytics Stack

### User Behavior
- **Microsoft Clarity**: Session replays, heatmaps, click patterns
- **Intercom**: User engagement, conversation history

### AI Performance
- **Weights & Biases**: Model metrics, token usage, analysis quality
- **Azure Monitor**: API performance, error rates

### Business Metrics
- **Stripe Dashboard**: Revenue, subscriptions, churn
- **MongoDB Atlas**: User growth, trial conversion
- **Intercom**: Customer support metrics, engagement

### Technical Monitoring
- **Azure Application Insights**: API health, errors, performance
- **Backend Health Endpoints**: Real-time integration status

---

## Cost Breakdown

| Service | Plan | Monthly Cost | Status |
|---------|------|--------------|--------|
| **Weights & Biases** | Free | $0 | ✅ Active |
| **Microsoft Clarity** | Free | $0 | ✅ Active |
| **MongoDB Atlas** | Sponsorship | $0 | ✅ Active |
| **Azure OpenAI** | Pay-per-token | ~$10-50 | ✅ Active |
| **Stripe** | 2.9% + $0.30 | Variable | ✅ Active |
| **Intercom** | Start Plan | $74 | ⚠️  Trial |
| **Azure Web App** | Basic B1 | ~$13 | ✅ Active |
| **Total** | | **~$97-161/mo** | |

**Note**: Costs scale with usage (OpenAI tokens, Stripe transactions)

---

## Documentation Files

All integration guides are in the backend directory:

1. `MICROSOFT_CLARITY_INTEGRATION.md` - Frontend analytics setup
2. `INTERCOM_MESSENGER_INTEGRATION.md` - Frontend chat widget setup
3. `INTERCOM_BACKEND_API_SETUP.md` - Backend API and webhook setup
4. `INTEGRATION_SUMMARY.md` - This file (complete overview)

---

## Next Actions

### Immediate (Intercom Setup)
1. Go to https://app.intercom.com/a/apps/hvhctgls/settings/developers
2. Create Access Token with permissions: Read users, Write users, Create events
3. Create Webhook:
   - URL: `https://luntra-outreach-app.azurewebsites.net/intercom/webhook`
   - Topics: user.created, conversation.user.created, conversation.admin.replied
4. Add credentials to backend `.env`:
   ```bash
   INTERCOM_ACCESS_TOKEN=<your_token>
   INTERCOM_WEBHOOK_SECRET=<your_secret>
   ```
5. Deploy backend: `./deploy-azure.sh`
6. Test: `curl https://luntra-outreach-app.azurewebsites.net/intercom/health`

### Frontend Tasks
1. Add Microsoft Clarity script to `luntra/frontend/index.html` (see `MICROSOFT_CLARITY_INTEGRATION.md`)
2. Install Intercom: `npm install @intercom/messenger-js-sdk`
3. Create `src/utils/intercom.ts` (see `INTERCOM_MESSENGER_INTEGRATION.md`)
4. Initialize on login and app mount
5. Add event tracking for property analysis and subscriptions

### Testing
1. Create test user account
2. Analyze test property
3. Verify in dashboards:
   - W&B: https://wandb.ai/ - Check analysis metrics
   - Clarity: https://clarity.microsoft.com/ - Check session replay
   - Intercom: https://app.intercom.com/ - Check user events
   - Stripe: https://dashboard.stripe.com/ - Check test payments

---

## Support Contacts

- **Azure OpenAI**: Azure Portal support
- **MongoDB Atlas**: https://www.mongodb.com/contact
- **Stripe**: https://support.stripe.com/
- **Weights & Biases**: https://wandb.ai/support
- **Microsoft Clarity**: https://github.com/microsoft/clarity
- **Intercom**: https://www.intercom.com/help

---

## Summary

**PropIQ is now integrated with a complete growth and analytics stack**:

✅ **AI Tracking** (W&B) - Monitor model performance
✅ **User Analytics** (Clarity) - Understand user behavior
✅ **Payments** (Stripe) - Handle subscriptions
✅ **Database** (MongoDB) - Store user data
✅ **AI Analysis** (Azure OpenAI) - Generate property insights
⚠️  **Customer Messaging** (Intercom) - Needs API credentials

**All backend code is production-ready.** Frontend just needs to add the JavaScript integrations.

**Total setup time**: ~15 minutes to add Intercom credentials and frontend scripts.
