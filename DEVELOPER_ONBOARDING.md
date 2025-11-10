# PropIQ Developer Onboarding Guide

Welcome to the PropIQ development team! This guide will get you up and running quickly.

---

## 🎯 Day 1: Setup & Orientation

### Prerequisites Installation

**Required:**
- **Node.js** 18+ and npm ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Docker** (optional, for containerized development) ([Download](https://www.docker.com/products/docker-desktop))

**Recommended:**
- **VS Code** with extensions:
  - Python
  - TypeScript + React
  - Prettier
  - ESLint
  - Thunder Client (for API testing)
- **Azure CLI** ([Install](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli))

### Repository Access

1. **Request GitHub access** from your team lead
   - Organization: `Luntra-HQ`
   - Repository: `propiq` (private)

2. **Clone the repository:**
   ```bash
   git clone git@github.com:Luntra-HQ/propiq.git
   cd propiq
   ```

3. **Verify you're on main branch:**
   ```bash
   git branch
   # Should show: * main
   ```

### Read Essential Documentation

**Spend 30-60 minutes reading these in order:**

1. **README.md** (15 min)
   - Project overview
   - Architecture diagram
   - Tech stack
   - Quick start commands

2. **CLAUDE.md** (30 min)
   - Detailed architecture
   - Design principles
   - Development workflow
   - Integration rules

3. **CODEBASE_AUDIT_REPORT.md** (15 min)
   - Known issues
   - Technical debt
   - Security concerns
   - Priority fixes

4. **WEB_CLAUDE_CODE_HANDOFF.md** (10 min)
   - Web Claude Code usage
   - Common tasks
   - Best practices

---

## 🛠️ Day 1-2: Local Development Setup

### Backend Setup

**1. Create Python virtual environment:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

**2. Install dependencies:**
```bash
pip install -r requirements.txt
```

**3. Configure environment variables:**
```bash
cp .env.example .env
```

**4. Get credentials from team lead:**
Your `.env` should have:
```bash
# Database
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=[ask team lead]
SUPABASE_SERVICE_KEY=[ask team lead]

# Authentication
JWT_SECRET=[ask team lead]

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=[ask team lead]
AZURE_OPENAI_KEY=[ask team lead]
AZURE_OPENAI_API_VERSION=2025-01-01-preview

# Stripe
STRIPE_SECRET_KEY=[ask team lead - use test key for dev]
STRIPE_WEBHOOK_SECRET=[ask team lead]

# Email
SENDGRID_API_KEY=[ask team lead]
FROM_EMAIL=support@luntra.one

# Weights & Biases
WANDB_API_KEY=[ask team lead]
WANDB_MODE=offline  # Use offline for local dev

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

**5. Test backend:**
```bash
uvicorn api:app --reload --port 8000
```

**6. Verify in browser:**
- http://localhost:8000 - Should see welcome message
- http://localhost:8000/docs - Should see API documentation
- http://localhost:8000/health - Should see health status

**7. Test key endpoints:**
```bash
# Health check
curl http://localhost:8000/health

# PropIQ health
curl http://localhost:8000/propiq/health

# Support chat health
curl http://localhost:8000/support/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "PropIQ API"
}
```

### Frontend Setup

**1. Install dependencies:**
```bash
cd frontend
npm install
```

**2. Configure environment:**
```bash
cp .env.example .env
```

Edit `.env`:
```bash
VITE_API_BASE=http://localhost:8000
```

**3. Start development server:**
```bash
npm run dev
```

**4. Verify in browser:**
Open http://localhost:5173

You should see the PropIQ homepage with:
- Hero section
- Deal calculator
- Authentication modal (click "Sign In")
- Support chat widget (bottom-right corner)

**5. Test key features:**
- [ ] Calculator updates when you enter values
- [ ] Support chat widget opens and closes
- [ ] Sign up/login modals appear
- [ ] Page is responsive (resize browser)

---

## 🧪 Day 2-3: Run Tests & Make First Change

### Run Backend Tests

```bash
cd backend
pytest
pytest --cov=. --cov-report=html
```

**If tests fail:**
- Check `.env` configuration
- Verify database connection
- Ask team lead for help

### Run Frontend Tests

```bash
cd frontend
npm run test:e2e
```

**Install Playwright browsers (first time):**
```bash
npx playwright install
```

### Make Your First Change

**Goal:** Fix a simple issue to learn the workflow.

**Example: Update the hero section text**

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/update-hero-text
   ```

2. **Make the change:**
   Edit `frontend/src/App.tsx`, find the hero section:
   ```tsx
   <h1>AI-Powered Real Estate Analysis</h1>
   ```

   Change to:
   ```tsx
   <h1>AI-Powered Real Estate Investment Analysis</h1>
   ```

3. **Test locally:**
   Refresh http://localhost:5173 and verify the change appears

4. **Commit with proper format:**
   ```bash
   git add frontend/src/App.tsx
   git commit -m "Update hero section heading for clarity

   - Added 'Investment' to hero heading
   - Improves clarity about product focus

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

5. **Push your branch:**
   ```bash
   git push origin feature/update-hero-text
   ```

6. **Create Pull Request:**
   - Go to https://github.com/Luntra-HQ/propiq
   - Click "Pull Requests" → "New Pull Request"
   - Select your branch
   - Fill in PR description
   - Request review from team lead

7. **Wait for review:**
   Your team lead will review and provide feedback

---

## 📚 Day 3-5: Deep Dive into Codebase

### Backend Architecture Study

**Day 3 Morning: Main FastAPI App**

Read these files in order:
1. `backend/api.py` - Main FastAPI application
2. `backend/auth.py` - JWT authentication
3. `backend/database_supabase.py` - Database interface

**Key concepts to understand:**
- How routers are registered
- How JWT authentication works
- How database connections are managed
- How CORS is configured

**Day 3 Afternoon: Routers**

Read these routers:
1. `backend/routers/auth.py` - User authentication
2. `backend/routers/propiq.py` - Property analysis
3. `backend/routers/payment.py` - Stripe integration
4. `backend/routers/support_chat.py` - AI support chat

**For each router, understand:**
- What endpoints exist?
- How are they protected (authentication)?
- What do they return?
- How do they handle errors?

**Test the routers:**
Use Thunder Client or curl to test endpoints:

```bash
# Test signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# Test login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

**Day 4: Frontend Architecture Study**

Read these files in order:
1. `frontend/src/main.tsx` - Entry point
2. `frontend/src/App.tsx` - Main application
3. `frontend/src/components/DealCalculator.tsx` - Calculator component
4. `frontend/src/utils/calculatorUtils.ts` - Calculator logic
5. `frontend/src/utils/auth.ts` - Authentication utilities

**Key concepts to understand:**
- How components are structured
- How state is managed (useState, useEffect)
- How API calls are made
- How authentication works
- How calculator performs calculations

**Day 5: Integration Points**

Study how frontend and backend connect:

1. **Authentication flow:**
   - Frontend: `src/utils/auth.ts`
   - Backend: `routers/auth.py`
   - Trace the signup/login flow

2. **Property analysis:**
   - Frontend: Component making the API call
   - Backend: `routers/propiq.py`
   - Azure OpenAI: How prompts are constructed

3. **Support chat:**
   - Frontend: `src/components/SupportChat.tsx`
   - Backend: `routers/support_chat.py`
   - Azure OpenAI: Chat completion API

---

## 🎯 Week 2: Tackle a Real Issue

### Find an Issue to Work On

1. **Check GitHub Issues:**
   https://github.com/Luntra-HQ/propiq/issues

   Look for issues labeled:
   - `good first issue`
   - `bug`
   - `enhancement`

2. **Or check CODEBASE_AUDIT_REPORT.md:**
   Pick a "Medium Priority" issue from Sprint 3-4

3. **Discuss with team lead:**
   Confirm the issue is available and get context

### Work on the Issue

**Follow the workflow:**

1. **Create feature branch:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b fix/issue-name
   ```

2. **Understand the issue:**
   - Read related files
   - Test current behavior
   - Understand expected behavior

3. **Implement the fix:**
   - Make minimal changes
   - Follow code standards (see CLAUDE.md)
   - Add comments where helpful

4. **Test thoroughly:**
   - Unit tests
   - Integration tests
   - Manual testing
   - Test edge cases

5. **Commit and push:**
   ```bash
   git add [files]
   git commit -m "[proper format]"
   git push origin fix/issue-name
   ```

6. **Create Pull Request:**
   - Clear title
   - Detailed description
   - Link to issue: "Fixes #123"
   - Request review

7. **Address review feedback:**
   - Make requested changes
   - Push updates to same branch
   - Respond to comments

8. **Celebrate merge! 🎉**

---

## 🧰 Development Tools & Workflows

### VS Code Setup

**Recommended extensions:**
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "dsznajder.es7-react-js-snippets",
    "rangav.vscode-thunder-client",
    "eamodio.gitlens"
  ]
}
```

**Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.python"
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "typescript.preferences.quoteStyle": "single"
}
```

### Git Workflow

**Branch naming:**
- Features: `feature/feature-name`
- Fixes: `fix/bug-description`
- Docs: `docs/doc-update`
- Refactor: `refactor/what-changed`

**Commit message format:**
```
Brief summary (50-72 chars)

Detailed description:
- Change 1
- Change 2
- Change 3

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Common git commands:**
```bash
# Check status
git status

# Create branch
git checkout -b feature/name

# Stage changes
git add file.ts
git add .  # Stage all

# Commit
git commit -m "message"

# Push
git push origin feature/name

# Pull latest main
git checkout main
git pull origin main

# Merge main into your branch
git checkout feature/name
git merge main

# Delete local branch
git branch -d feature/name
```

### Testing Workflow

**Backend testing:**
```bash
cd backend

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=. --cov-report=html

# Run with verbose output
pytest -v
```

**Frontend testing:**
```bash
cd frontend

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/smoke.spec.ts

# View test report
npx playwright show-report
```

---

## 🔍 Debugging Tips

### Backend Debugging

**1. Use FastAPI interactive docs:**
http://localhost:8000/docs

Test endpoints directly in the browser!

**2. Add debug logging:**
```python
import logging
logger = logging.getLogger(__name__)

@router.post("/analyze")
async def analyze_property(request: AnalysisRequest):
    logger.info(f"Analyzing property: {request.address}")
    # Your code
```

**3. Use Python debugger:**
```python
import pdb; pdb.set_trace()
```

**4. Check logs:**
```bash
# Azure logs
az webapp log tail --name luntra-outreach-app --resource-group luntra-outreach-rg
```

### Frontend Debugging

**1. React DevTools:**
Install React DevTools browser extension

**2. Console logging:**
```typescript
console.log('Debug:', variable);
console.table(arrayData);
console.error('Error:', error);
```

**3. Network tab:**
- Open browser DevTools (F12)
- Go to Network tab
- Watch API calls

**4. Breakpoints:**
- Open DevTools Sources tab
- Find your TypeScript file
- Click line number to set breakpoint

---

## 📖 Key Concepts to Master

### Week 1-2
- [ ] React functional components
- [ ] TypeScript basics
- [ ] FastAPI route definitions
- [ ] Pydantic models for validation
- [ ] JWT authentication flow
- [ ] Environment variable management
- [ ] Git workflow (branch, commit, PR)

### Week 3-4
- [ ] React hooks (useState, useEffect, useRef)
- [ ] Async/await in Python and TypeScript
- [ ] Database queries (Supabase/PostgreSQL)
- [ ] API integration patterns
- [ ] Error handling strategies
- [ ] Testing with pytest and Playwright
- [ ] Docker basics

### Month 2
- [ ] Azure OpenAI API integration
- [ ] Stripe payment integration
- [ ] Rate limiting strategies
- [ ] Security best practices
- [ ] Performance optimization
- [ ] Deployment process
- [ ] Monitoring and logging

---

## 🤝 Team Communication

### Daily Standups
Share:
1. What you worked on yesterday
2. What you're working on today
3. Any blockers or questions

### Ask for Help When:
- Stuck for more than 30 minutes
- Unclear about requirements
- Need credentials or access
- Found a potential security issue
- Breaking changes needed

### How to Ask Good Questions:

**Bad question:**
```
"The code doesn't work"
```

**Good question:**
```
"I'm trying to add authentication to the /analyze endpoint.

Current code (backend/routers/propiq.py):
[paste code snippet]

Error message:
[paste error]

What I've tried:
1. Added Depends(verify_token)
2. Checked JWT_SECRET is set
3. Tested with valid token

Expected: Authenticated user can analyze properties
Actual: Getting 401 Unauthorized

Can you help me understand what I'm missing?"
```

---

## 📞 Resources & Contacts

### Documentation
- **Internal:** `docs/` directory
- **React:** https://react.dev
- **FastAPI:** https://fastapi.tiangolo.com
- **Supabase:** https://supabase.com/docs
- **Azure OpenAI:** https://learn.microsoft.com/azure/ai-services/openai/

### Contacts
- **Team Lead:** [ask your team lead]
- **DevOps:** [ask your team lead]
- **Support:** support@luntra.one

### Tools
- **GitHub:** https://github.com/Luntra-HQ/propiq
- **Azure Portal:** https://portal.azure.com
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com

---

## ✅ Onboarding Checklist

### Setup (Day 1-2)
- [ ] GitHub access granted
- [ ] Repository cloned
- [ ] All documentation read
- [ ] Backend running locally
- [ ] Frontend running locally
- [ ] Environment variables configured
- [ ] Tests passing locally
- [ ] VS Code configured

### Learning (Day 3-7)
- [ ] Understand backend architecture
- [ ] Understand frontend architecture
- [ ] Understand authentication flow
- [ ] Understand API integration
- [ ] Made first small change
- [ ] Created first Pull Request
- [ ] PR reviewed and merged

### Contributing (Week 2-4)
- [ ] Completed first real issue
- [ ] Written tests for changes
- [ ] Deployed changes to production
- [ ] Comfortable with git workflow
- [ ] Can debug issues independently
- [ ] Contributing regularly

---

## 🎓 Next Steps After Onboarding

1. **Pick a feature area to specialize in:**
   - Frontend UI/UX
   - Backend API development
   - AI integration (Azure OpenAI)
   - Payment processing (Stripe)
   - DevOps & deployment

2. **Deep dive into that area:**
   - Read all related code
   - Understand all edge cases
   - Become the go-to person

3. **Contribute to documentation:**
   - Found something confusing? Document it!
   - Discovered a trick? Share it!
   - Update onboarding guide with improvements

4. **Mentor new developers:**
   - Help with their first PR
   - Answer their questions
   - Share your learnings

---

**Welcome to the team! We're excited to have you on board.** 🚀

**Questions?** Ask your team lead or open a discussion on GitHub!

**Last Updated:** 2025-11-10
