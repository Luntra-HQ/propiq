# PropIQ - AI-Powered Property Investment Analysis Platform

**Project Memory File for Claude Code**

This document contains all essential context, rules, and workflows for PropIQ development. It is automatically loaded into every Claude Code session.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Git Workflow](#git-workflow)
5. [Development Commands](#development-commands)
6. [Design Principles](#design-principles)
7. [Integration Rules](#integration-rules)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Code Standards](#code-standards)

---

## Project Overview

**PropIQ** is a SaaS platform that provides AI-powered real estate investment analysis, combining property analysis, deal calculators, and customer support chat.

**Core Features:**
- 🏡 **Property Analysis** - AI-powered investment analysis using GPT-4o-mini
- 🧮 **Deal Calculator** - Comprehensive financial calculator with 3-tab interface
- 💬 **Support Chat** - Custom AI support assistant (saves $888/year vs Intercom)
- 💳 **Stripe Payments** - Subscription management with 4 tiers
- 📊 **Analytics** - Weights & Biases AI tracking + Microsoft Clarity user analytics

**Business Model:**
- Free: 3 trial analyses
- Starter ($29/mo): 20 analyses/month
- Pro ($79/mo): 100 analyses/month
- Elite ($199/mo): Unlimited analyses

**Current Status:**
- ✅ Backend deployed to Azure (luntra-outreach-app.azurewebsites.net)
- ✅ Support chat backend ready
- ✅ Deal calculator fully implemented
- 🔄 Frontend deployment pending
- 🔄 Full integration testing pending

---

## Architecture

### Frontend Structure
```
propiq/frontend/
├── src/
│   ├── components/
│   │   ├── DealCalculator.tsx       # 3-tab calculator (Basic, Advanced, Scenarios)
│   │   ├── DealCalculator.css       # Calculator styles
│   │   ├── SupportChat.tsx          # AI support chat widget
│   │   ├── SupportChat.css          # Chat styles
│   │   └── PricingPage.tsx          # Subscription pricing UI
│   ├── utils/
│   │   ├── calculatorUtils.ts       # All financial calculations
│   │   └── supportChat.ts           # Chat API integration
│   ├── config/
│   │   └── pricing.ts               # Pricing tiers & thresholds
│   ├── App.tsx                      # Main application
│   └── main.tsx                     # Entry point
├── index.html                       # HTML + Microsoft Clarity script
├── vite.config.ts                   # Vite configuration
└── package.json                     # Dependencies
```

### Backend Structure
```
propiq/backend/
├── routers/
│   ├── auth.py                      # JWT authentication
│   ├── propiq.py                    # Property analysis (Azure OpenAI)
│   ├── payment.py                   # Stripe integration
│   ├── support_chat.py              # Custom AI support chat
│   ├── marketing.py                 # SendGrid email capture
│   └── intercom.py                  # Intercom (optional)
├── api.py                           # FastAPI main app
├── database_mongodb.py              # MongoDB connection
├── requirements.txt                 # Python dependencies
├── Dockerfile                       # Docker build config
└── deploy-azure.sh                  # Azure deployment script
```

### Database Collections (MongoDB Atlas)
- `users` - User accounts, authentication, subscription info
- `property_analyses` - Analysis history with W&B tracking
- `support_chats` - Support conversation history

---

## Tech Stack

### Frontend
- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite 6.0.11
- **Styling:** Tailwind CSS (utility-first)
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **State:** React hooks (useState, useEffect, useRef)

### Backend
- **Framework:** FastAPI 0.115.0
- **Runtime:** Python 3.11
- **Database:** MongoDB Atlas (cloud-hosted)
- **Auth:** PyJWT 2.10.1 with bcrypt
- **AI:** Azure OpenAI (GPT-4o-mini)
- **Payments:** Stripe 12.4.0
- **Email:** SendGrid 6.11.0
- **Tracking:** Weights & Biases 0.22.2

### Infrastructure
- **Hosting:** Azure Web App (Linux container)
- **Registry:** Azure Container Registry
- **Analytics:** Microsoft Clarity (tts5hc8zf8)
- **Monitoring:** Weights & Biases (propiq-analysis)

---

## Git Workflow

### Branch Strategy
- `main` - Production branch (protected)
- Feature branches: `feature/calculator-ui`, `feature/support-chat`, etc.
- Bugfix branches: `fix/stripe-webhook`, `fix/calculator-math`, etc.

### Commit Message Format

**Standard commits:**
```bash
git commit -m "Add comprehensive deal calculator with 3-tab interface

- Created calculatorUtils.ts with all financial calculations
- Built DealCalculator component with Basic/Advanced/Scenarios tabs
- Added 5-year projections and deal scoring (0-100)
- Integrated into App.tsx

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Rules:**
1. **First line:** Brief summary (50-72 chars)
2. **Body:** Bullet points with details
3. **Footer:** Always include Claude Code attribution
4. **Never commit to main directly** - always use PRs
5. **Always run tests** before committing
6. **Never force push to main**

### Git Hooks
- Pre-commit: Run linters, type checks
- Pre-push: Run tests
- **Never skip hooks** (no --no-verify)

---

## Development Commands

### Frontend Development

**Install dependencies:**
```bash
cd propiq/frontend
npm install
```

**Run dev server:**
```bash
npm run dev
# Opens at http://localhost:5173
```

**Build for production:**
```bash
npm run build
# Output: dist/
```

**Type checking:**
```bash
npm run type-check
```

**Run tests:**
```bash
npm test
```

### Backend Development

**Setup virtual environment:**
```bash
cd propiq/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Run local server:**
```bash
uvicorn api:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

**Test endpoints:**
```bash
# Health check
curl http://localhost:8000/propiq/health

# Support chat health
curl http://localhost:8000/support/health
```

---

## Design Principles

### Calculator UI Design

**Visual Hierarchy:**
1. Deal Score badge is the primary focus (0-100 with color-coded rating)
2. Monthly cash flow is secondary (positive = green, negative = red)
3. Supporting metrics follow in organized cards

**Color Coding:**
- **Excellent (80-100):** Green (#28a745)
- **Good (65-79):** Blue (#17a2b8)
- **Fair (50-64):** Yellow (#ffc107)
- **Poor (35-49):** Orange (#fd7e14)
- **Avoid (0-34):** Red (#dc3545)

**Responsive Design:**
- Desktop: 2-column layout (inputs left, results right)
- Tablet: Single column with cards
- Mobile: Full-width stacked layout

**Typography:**
- Headings: System font, 600-700 weight
- Body: 14-16px, line-height 1.5
- Monospace: Financial values (SF Mono, Monaco, Courier New)

### Component Structure

**Pattern for primary components:**
```tsx
import { useState, useEffect } from 'react';
import './Component.css';

export const Component = () => {
  // State and effects

  return (
    <div className="component-container">
      {/* JSX */}
    </div>
  );
};
```

**Avoid:**
- ❌ Inline styles (use CSS classes)
- ❌ Magic numbers (use constants)
- ❌ Any type (use proper TypeScript)
- ❌ console.log in production (use proper logging)

---

## Integration Rules

### Microsoft Clarity Analytics

**Location:** `frontend/index.html`
**Project ID:** `tts5hc8zf8`

**Rule:** Never remove or modify the Clarity script tag.

```html
<!-- Microsoft Clarity - User Analytics -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "tts5hc8zf8");
</script>
```

### Weights & Biases AI Tracking

**Location:** `backend/routers/propiq.py`
**Project:** `propiq-analysis`

**What to log:**
- Every property analysis request
- Model usage (tokens, cost)
- Analysis results (recommendations, scores, ROI)
- User metadata (subscription tier)

**Rule:** Always wrap W&B calls in try-except to gracefully handle offline mode.

### Stripe Payments

**Live API Keys (in .env):**
- `STRIPE_SECRET_KEY` - Live secret key
- `STRIPE_PRICE_ID` - Live price ID for subscriptions
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification

**Endpoints:**
- `POST /stripe/create-checkout-session` - Create checkout
- `POST /stripe/webhook` - Handle webhooks (signature verification required)
- `GET /stripe/health` - Status check

**Rule:** Never log full API keys, never commit keys to git.

### Support Chat API

**Backend:** `backend/routers/support_chat.py`
**Frontend:** `frontend/src/components/SupportChat.tsx`

**Endpoints:**
- `POST /support/chat` - Send message, get AI response
- `GET /support/history/{conversation_id}` - Get conversation history
- `GET /support/conversations` - List all user conversations
- `GET /support/health` - Health check

**Rule:** Support chat only shows for logged-in users (`userId && <SupportChat />`).

---

## Testing Strategy

### Calculator Testing

**Unit Tests (calculatorUtils.ts):**
- ✅ Test mortgage payment calculation
- ✅ Test cap rate formula
- ✅ Test cash-on-cash return
- ✅ Test 1% rule compliance
- ✅ Test deal scoring algorithm
- ✅ Test edge cases (zero values, negative numbers)

**Integration Tests (DealCalculator.tsx):**
- ✅ Verify all tabs render correctly
- ✅ Verify calculations update in real-time
- ✅ Verify scenario analysis (best/worst case)
- ✅ Verify 5-year projections
- ✅ Test responsive layouts (desktop, tablet, mobile)

**Manual Testing Checklist:**
- [ ] Enter test property data
- [ ] Verify monthly cash flow is correct
- [ ] Verify deal score makes sense
- [ ] Switch between tabs (Basic, Advanced, Scenarios)
- [ ] Adjust inputs and watch live updates
- [ ] Test on mobile device
- [ ] Check console for errors

### Support Chat Testing

**Test Flow:**
1. Login as test user
2. Click "Need Help?" button
3. Send test message: "How do I analyze a property?"
4. Verify AI response is relevant
5. Send follow-up message
6. Verify conversation history persists
7. Close and reopen chat
8. Verify conversation continues

### Backend Testing

**Health Checks:**
```bash
# PropIQ analysis health
curl https://luntra-outreach-app.azurewebsites.net/propiq/health

# Support chat health
curl https://luntra-outreach-app.azurewebsites.net/support/health

# Stripe health
curl https://luntra-outreach-app.azurewebsites.net/stripe/health
```

**Expected responses:** All should return `status: "healthy"`.

---

## Deployment

### Backend Deployment (Azure)

**Script:** `backend/deploy-azure.sh`

**Steps:**
1. Login to Azure Container Registry
2. Build Docker image
3. Push to registry
4. Deploy to Azure Web App
5. Wait for container restart (2-3 minutes)

**Command:**
```bash
cd propiq/backend
./deploy-azure.sh
```

**Environment Variables (Azure App Settings):**
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_API_VERSION`
- `MONGODB_URI`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `WANDB_API_KEY`
- `WANDB_MODE`
- `SENDGRID_API_KEY`

**Verify deployment:**
```bash
curl https://luntra-outreach-app.azurewebsites.net/propiq/health
```

### Frontend Deployment

**Build:**
```bash
cd propiq/frontend
npm run build
```

**Output:** `dist/` folder ready for static hosting

**TODO:** Configure Azure Static Web Apps or equivalent hosting.

---

## Code Standards

### TypeScript

**Rules:**
- Always define interfaces for props and state
- Use `const` for all variables unless reassignment needed
- Prefer `type` over `interface` for simple types
- Use proper return types for functions
- Avoid `any` - use `unknown` if truly dynamic

**Example:**
```typescript
interface CalculatorInputs {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
}

const calculateMetrics = (inputs: CalculatorInputs): CalculatedMetrics => {
  // Implementation
};
```

### React

**Rules:**
- Use functional components (no class components)
- Use hooks (useState, useEffect, useRef, etc.)
- Extract reusable logic into custom hooks
- Keep components under 300 lines (split if larger)
- One component per file

**State management:**
- Local state: `useState`
- Complex state: `useReducer`
- Global state: Context API (for small apps)

### CSS

**Rules:**
- Use CSS modules or separate `.css` files
- Mobile-first responsive design
- Use Tailwind utility classes when possible
- Keep specificity low (avoid deep nesting)
- Use CSS variables for colors and spacing

**Example:**
```css
.calculator-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

@media (max-width: 768px) {
  .calculator-grid {
    grid-template-columns: 1fr;
  }
}
```

### Python (FastAPI)

**Rules:**
- Use type hints for all function parameters and returns
- Use Pydantic models for request/response validation
- Always use async/await for database operations
- Handle errors with try-except and return proper HTTP status codes
- Log important events (don't use print() in production)

**Example:**
```python
from pydantic import BaseModel
from fastapi import HTTPException

class AnalysisRequest(BaseModel):
    address: str
    purchase_price: Optional[float] = None

@router.post("/analyze")
async def analyze_property(
    request: AnalysisRequest,
    token_payload: dict = Depends(verify_token)
) -> Dict[str, Any]:
    try:
        # Implementation
        return {"success": True, "data": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Performance Optimization

### Frontend

**Bundle size:**
- Lazy load routes with `React.lazy()`
- Code-split large components
- Optimize images (WebP format, proper sizing)
- Minify CSS and JS in production

**React performance:**
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed as props
- Avoid unnecessary re-renders (use React DevTools Profiler)

### Backend

**Database:**
- Index frequently queried fields
- Use projection to limit returned fields
- Cache expensive queries (Redis if needed)

**API:**
- Use async operations (async/await)
- Implement rate limiting
- Compress responses (gzip)
- Use CDN for static assets

---

## Security Rules

**Never commit to git:**
- ❌ API keys or secrets
- ❌ `.env` files
- ❌ Database credentials
- ❌ Stripe keys
- ❌ OpenAI keys

**Always:**
- ✅ Use environment variables for secrets
- ✅ Validate all user inputs (Pydantic)
- ✅ Use HTTPS in production
- ✅ Implement CORS properly
- ✅ Verify JWT tokens on protected routes
- ✅ Sanitize database queries (use PyMongo's methods)
- ✅ Verify Stripe webhook signatures

---

## Troubleshooting

### Frontend Issues

**Problem:** Calculator not updating
**Solution:** Check React state updates, verify useEffect dependencies

**Problem:** Styles not loading
**Solution:** Verify CSS imports, check Tailwind config

**Problem:** TypeScript errors
**Solution:** Run `npm run type-check`, fix type mismatches

### Backend Issues

**Problem:** 500 Internal Server Error
**Solution:** Check server logs, verify environment variables

**Problem:** Database connection failed
**Solution:** Verify `MONGODB_URI`, check network access in MongoDB Atlas

**Problem:** OpenAI API errors
**Solution:** Check API key, verify endpoint and API version

---

## Resources

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [MongoDB PyMongo](https://pymongo.readthedocs.io)
- [Stripe API](https://stripe.com/docs/api)
- [Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/)

### Internal Docs
- `backend/README_INTEGRATIONS.md` - Complete integration overview
- `backend/CUSTOM_SUPPORT_CHAT_GUIDE.md` - Support chat implementation
- `backend/MICROSOFT_CLARITY_INTEGRATION.md` - Analytics setup

---

## Next Steps

**Immediate priorities:**
1. Test calculator locally (run Vite dev server)
2. Verify all calculations are accurate
3. Test support chat integration
4. Deploy frontend to Azure Static Web Apps
5. Full end-to-end testing

**Future enhancements:**
- Add property comparison feature
- Export analysis to PDF
- Email reports to users
- Mobile app (React Native)
- Advanced market data integration

---

**Last Updated:** 2025-10-21
**Claude Code Version:** Latest
**Project Phase:** MVP - Ready for deployment testing

---

## Important Notes

⚠️ **This file is project memory** - Everything in this file is automatically loaded into every Claude Code session. Keep it updated as the project evolves.

✅ **Use this file** - Reference this for all development decisions, coding standards, and workflows.

🚀 **Share this file** - New team members can use this to get up to speed quickly.
