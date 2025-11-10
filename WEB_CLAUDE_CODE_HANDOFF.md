# Web Claude Code Development Handoff Guide

**PropIQ Development with Web Claude Code**

This guide is specifically designed for continuing PropIQ development using **Web Claude Code** (claude.ai/code). It provides context, workflows, and best practices for seamless handoff from CLI Claude Code to Web Claude Code.

---

## 🎯 Purpose

This document ensures smooth development continuity when switching between:
- **CLI Claude Code** - Local development with full system access
- **Web Claude Code** - Browser-based development at claude.ai/code

---

## 📋 Quick Reference

### Essential Information

**Repository:** https://github.com/Luntra-HQ/propiq (Private)

**Production URLs:**
- Frontend: https://propiq.luntra.one (pending deployment)
- Backend API: https://luntra-outreach-app.azurewebsites.net
- API Docs: https://luntra-outreach-app.azurewebsites.net/docs

**Current Status:**
- ✅ Backend deployed and operational on Azure
- ✅ Database (Supabase PostgreSQL) configured
- ✅ All integrations working (Stripe, Azure OpenAI, SendGrid)
- 🔄 Frontend deployment to Azure Static Web Apps pending
- 🔄 Full E2E testing in progress

**Current Version:** See [VERSION](VERSION) file (currently `1.0.0`)

---

## 🚀 Getting Started with Web Claude Code

### 1. Access the Repository

Web Claude Code can access GitHub repositories directly. When starting a new session:

```
I'm working on PropIQ, a real estate investment analysis platform.
Repository: https://github.com/Luntra-HQ/propiq
Branch: main

Please help me with [specific task].
```

### 2. Load Project Context

Web Claude Code has access to key project files. Reference these for context:

**Essential files to mention:**
- `README.md` - Project overview and setup
- `CLAUDE.md` - Project memory file (comprehensive context)
- `WEB_CLAUDE_CODE_HANDOFF.md` - This file
- `CODEBASE_AUDIT_REPORT.md` - Known issues and technical debt
- `VERSION` - Current version number
- `CHANGELOG.md` - Version history

**Example prompt:**
```
Please read README.md and CLAUDE.md to understand the project structure.
I need to implement [feature] in the [frontend/backend].
```

### 3. Key Project Files Map

| File Path | Purpose | When to Reference |
|-----------|---------|-------------------|
| `/README.md` | Project overview | Starting new session |
| `/CLAUDE.md` | Full project memory | Understanding architecture |
| `/WEB_CLAUDE_CODE_HANDOFF.md` | Web dev guide | This document |
| `/CODEBASE_AUDIT_REPORT.md` | Known issues | Before fixes |
| `/VERSION` | Current version | Before releases |
| `/CHANGELOG.md` | Change history | Before version bumps |
| `/backend/README.md` | Backend setup | Backend work |
| `/frontend/README.md` | Frontend setup | Frontend work |
| `/docs/API_USAGE_GUIDE.md` | API docs | API integration |
| `/docs/DEPLOYMENT_GUIDE.md` | Deployment | Deploying changes |

---

## 🏗️ Project Architecture Summary

### High-Level Stack

```
Frontend (React + TypeScript)
    ↓ HTTPS/REST
Backend (FastAPI + Python)
    ↓
├── Supabase (PostgreSQL) - User data, subscriptions, analyses
├── Azure OpenAI (GPT-4o-mini) - Property analysis, support chat
├── Stripe - Payment processing
└── SendGrid - Email marketing
```

### Key Directories

```
propiq/
├── frontend/           # React app (port 5173)
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── utils/      # Helper functions
│   │   └── config/     # Configuration
│   └── tests/          # Playwright E2E tests
│
├── backend/            # FastAPI app (port 8000)
│   ├── routers/        # API endpoints
│   ├── middleware/     # Rate limiting, etc.
│   ├── utils/          # Utilities
│   └── api.py          # Main app
│
└── docs/               # Documentation
```

---

## 💼 Common Development Tasks

### Task 1: Fixing Backend Issues

**Context needed:**
1. `backend/api.py` - Main FastAPI app
2. Relevant router file in `backend/routers/`
3. `backend/requirements.txt` - Dependencies
4. `.env` configuration (never commit this!)

**Example prompt:**
```
I need to fix a bug in the property analysis endpoint.
Please read:
- backend/api.py
- backend/routers/propiq.py
- CODEBASE_AUDIT_REPORT.md (section on known bugs)

The issue is: [describe issue]
```

**Testing:**
```bash
# Local testing
cd backend
uvicorn api:app --reload --port 8000

# Test endpoint
curl http://localhost:8000/propiq/health
```

**Deployment:**
```bash
cd backend
./deploy-azure.sh
```

### Task 2: Frontend Component Development

**Context needed:**
1. `frontend/src/App.tsx` - Main app structure
2. Relevant component in `frontend/src/components/`
3. `frontend/src/utils/` - Helper functions
4. `frontend/package.json` - Dependencies

**Example prompt:**
```
I need to modify the DealCalculator component.
Please read:
- frontend/src/components/DealCalculator.tsx
- frontend/src/components/DealCalculator.css
- frontend/src/utils/calculatorUtils.ts

I want to add [feature description].
```

**Testing:**
```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

### Task 3: API Integration

**Context needed:**
1. Backend router file
2. Frontend utility file (e.g., `auth.ts`, `supportChat.ts`)
3. `docs/API_USAGE_GUIDE.md`

**Example prompt:**
```
I need to integrate a new API endpoint.
Backend: backend/routers/[router].py
Frontend: frontend/src/utils/[util].ts

The endpoint should [describe functionality].
```

### Task 4: Database Changes

**Context needed:**
1. `backend/database_supabase.py` - Database interface
2. Relevant router using database
3. Database schema documentation

**Example prompt:**
```
I need to add a new field to the user model.
Please read:
- backend/database_supabase.py
- backend/routers/auth.py
- docs/API_USAGE_GUIDE.md (database section)

New field: [field description]
```

**Migration approach:**
1. Update Supabase table schema via Supabase dashboard
2. Update Python models in code
3. Test locally
4. Deploy backend

### Task 5: Deployment

**Frontend deployment (Azure Static Web Apps):**
```
I need to deploy the frontend to Azure Static Web Apps.
Please read:
- docs/DEPLOYMENT_GUIDE.md
- frontend/README.md

Guide me through the Azure Static Web Apps setup.
```

**Backend deployment:**
```bash
cd backend
./deploy-azure.sh
```

Or ask Web Claude Code:
```
I need to redeploy the backend to Azure.
The deployment script is backend/deploy-azure.sh
What are the steps?
```

---

## 🔧 Environment Configuration

### Backend Environment Variables

**Critical variables (set in Azure App Settings):**
```bash
# Database
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=[key]
SUPABASE_SERVICE_KEY=[key]

# Authentication
JWT_SECRET=[32+ char random string]

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://[service].openai.azure.com/
AZURE_OPENAI_KEY=[key]
AZURE_OPENAI_API_VERSION=2025-01-01-preview

# Stripe
STRIPE_SECRET_KEY=sk_live_[key]
STRIPE_WEBHOOK_SECRET=whsec_[key]

# Email
SENDGRID_API_KEY=SG.[key]
FROM_EMAIL=support@luntra.one

# CORS
ALLOWED_ORIGINS=https://propiq.luntra.one,http://localhost:5173
```

**How to update Azure App Settings:**
```bash
az webapp config appsettings set \
  --name luntra-outreach-app \
  --resource-group luntra-outreach-rg \
  --settings KEY=VALUE
```

### Frontend Environment Variables

**`.env` file:**
```bash
# Development
VITE_API_BASE=http://localhost:8000

# Production (set in Azure Static Web Apps)
VITE_API_BASE=https://luntra-outreach-app.azurewebsites.net
```

---

## 🐛 Known Issues & Technical Debt

**Critical issues from audit (see CODEBASE_AUDIT_REPORT.md):**

1. **Rate limiter bug** (HIGH PRIORITY)
   - File: `backend/middleware/rate_limiter.py:184`
   - Bug: Variable name mismatch (`ip` vs `client_ip`)
   - Fix: Change `self.request_history[ip]` to `self.request_history[client_ip]`

2. **Database cleanup needed**
   - Remove legacy MongoDB code (migration to Supabase complete)
   - Files to remove: `database_mongodb.py`, `test_mongodb.py`, migration scripts

3. **Missing input validation**
   - File: `backend/routers/propiq.py`
   - Need: Add field validators for address, prices, rates

4. **Frontend error handling**
   - File: `frontend/src/utils/auth.ts`
   - Issue: Silent failures, no error context returned to UI
   - Fix: Return structured error responses

**When working on fixes:**
```
I'm fixing the rate limiter bug from CODEBASE_AUDIT_REPORT.md.
Please read:
- backend/middleware/rate_limiter.py
- CODEBASE_AUDIT_REPORT.md (section on rate limiter bug)

Show me the fix and explain the issue.
```

---

## 📝 Development Workflow

### 1. Starting a New Feature

**Web Claude Code prompt:**
```
I'm starting work on a new feature: [feature name]

Repository: https://github.com/Luntra-HQ/propiq
Branch: main

Context files:
- README.md (project overview)
- CLAUDE.md (project memory)
- [specific files related to feature]

Feature requirements:
1. [requirement 1]
2. [requirement 2]
3. [requirement 3]

Please help me:
1. Understand current implementation
2. Plan the changes needed
3. Implement the feature
```

### 2. Code Review Process

**Ask Web Claude Code for review:**
```
I've made changes to [files]. Please review for:
1. Code quality and best practices
2. Security issues
3. Performance concerns
4. TypeScript/Python type safety
5. Test coverage

Files changed:
- [file 1]
- [file 2]
```

### 3. Git Commit Message Format

**Always use this format:**
```
Brief summary (50-72 chars)

Detailed changes:
- Change 1
- Change 2
- Change 3

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Example:**
```bash
git commit -m "Fix rate limiter variable name bug

- Changed 'ip' to 'client_ip' in rate_limiter.py line 184
- Added test for rate limiting with multiple IPs
- Updated documentation

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 4. Creating Pull Requests

**PR template:**
```markdown
## Summary
[Brief description of changes]

## Changes
- [Change 1]
- [Change 2]

## Testing
- [ ] Local testing completed
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Manual testing checklist completed

## Deployment Notes
[Any special deployment considerations]

## Related Issues
Fixes #[issue number]
```

---

## 🧪 Testing Strategy

### Backend Testing

**Local testing:**
```bash
cd backend
pytest
pytest --cov=. --cov-report=html
```

**Manual API testing:**
```bash
# Health checks
curl http://localhost:8000/health
curl http://localhost:8000/propiq/health
curl http://localhost:8000/support/health

# Test analysis endpoint (requires auth token)
curl -X POST http://localhost:8000/propiq/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{"address": "123 Main St", "purchasePrice": 300000}'
```

### Frontend Testing

**E2E tests with Playwright:**
```bash
cd frontend
npm run test:e2e
npx playwright test --ui
npx playwright show-report
```

**Manual testing checklist:**
- [ ] Calculator performs accurate calculations
- [ ] Support chat responds correctly
- [ ] Authentication flow (signup, login, logout)
- [ ] Stripe checkout works
- [ ] Property analysis returns results
- [ ] Mobile responsive design works
- [ ] All links and buttons functional

---

## 🚢 Deployment Process

### Backend Deployment (Azure Container Apps)

**Automated:**
```bash
cd backend
./deploy-azure.sh
```

**Manual steps:**
1. Build Docker image
2. Push to Azure Container Registry
3. Deploy to Azure Web App
4. Restart app
5. Verify health endpoints

**Verification:**
```bash
curl https://luntra-outreach-app.azurewebsites.net/health
```

### Frontend Deployment (Azure Static Web Apps)

**Setup (first time):**
1. Create Azure Static Web App resource
2. Connect to GitHub repo
3. Configure build settings:
   - App location: `frontend`
   - Output location: `dist`
   - Build command: `npm run build`

**Automatic deployment:**
- Commits to `main` trigger automatic deployment via GitHub Actions

**Manual deployment:**
```bash
cd frontend
npm run build
# Use Azure CLI or portal to deploy dist/ folder
```

---

## 📊 Monitoring & Analytics

### Health Check Endpoints

```bash
# Main health
curl https://luntra-outreach-app.azurewebsites.net/health

# Service-specific health checks
curl https://luntra-outreach-app.azurewebsites.net/propiq/health
curl https://luntra-outreach-app.azurewebsites.net/support/health
curl https://luntra-outreach-app.azurewebsites.net/stripe/health
```

### Analytics Platforms

**Microsoft Clarity** (User behavior)
- Project ID: `tts5hc8zf8`
- Dashboard: https://clarity.microsoft.com
- Integrated in: `frontend/index.html`

**Weights & Biases** (AI tracking)
- Project: `propiq-analysis`
- Dashboard: https://wandb.ai
- Tracks: Property analyses, model usage, costs

**Azure Monitor** (Application insights)
- Resource: `luntra-outreach-app`
- Access via Azure Portal

---

## 🔒 Security Best Practices

### Never Commit
- ❌ API keys or secrets
- ❌ `.env` files
- ❌ Database credentials
- ❌ Stripe keys
- ❌ OAuth tokens

### Always
- ✅ Use environment variables
- ✅ Validate all inputs (Pydantic)
- ✅ Verify JWT tokens on protected routes
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Verify Stripe webhook signatures

### Security Checklist
- [ ] JWT_SECRET is 32+ characters
- [ ] All secrets in environment variables
- [ ] CORS restricted to known origins
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced in production
- [ ] Stripe webhook signatures verified

---

## 📚 Key Documentation

### Internal Documentation
1. **README.md** - Project overview and quick start
2. **CLAUDE.md** - Comprehensive project memory
3. **WEB_CLAUDE_CODE_HANDOFF.md** - This document
4. **CODEBASE_AUDIT_REPORT.md** - Code quality and known issues
5. **CHANGELOG.md** - Version history
6. **docs/API_USAGE_GUIDE.md** - API endpoint documentation
7. **docs/DEPLOYMENT_GUIDE.md** - Deployment instructions
8. **docs/SECURITY_HARDENING.md** - Security best practices

### External Resources
- **React Docs:** https://react.dev
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Supabase Docs:** https://supabase.com/docs
- **Azure OpenAI:** https://learn.microsoft.com/en-us/azure/ai-services/openai/
- **Stripe API:** https://stripe.com/docs/api

---

## 🎯 Web Claude Code Best Practices

### 1. Provide Clear Context

**Good prompt:**
```
I'm working on PropIQ property analysis feature.

Repository: https://github.com/Luntra-HQ/propiq
Files to read:
- backend/routers/propiq.py
- CODEBASE_AUDIT_REPORT.md

Task: Fix the rate limiter bug on line 184

Please:
1. Read the relevant files
2. Show me the bug
3. Provide the fix
4. Explain the issue
```

**Avoid:**
```
Fix the bug
```

### 2. Reference Documentation

Always mention relevant docs:
```
I need to add a new API endpoint.
Please read:
- docs/API_USAGE_GUIDE.md (for endpoint patterns)
- backend/routers/auth.py (for auth example)
- README.md (for testing approach)
```

### 3. Be Specific About Files

**Good:**
```
Please read backend/routers/propiq.py lines 50-100
```

**Avoid:**
```
Read the property analysis code
```

### 4. Break Down Complex Tasks

**Good approach:**
```
Task: Add PDF export feature

Step 1: First, help me understand current analysis structure
Files: backend/routers/propiq.py, frontend/src/components/PropIQAnalysis.tsx

Step 2: Then we'll design the PDF generation
Step 3: Finally, we'll implement frontend download button
```

### 5. Request Code Reviews

```
I've implemented [feature]. Please review:

1. Code quality - any improvements?
2. Security - any vulnerabilities?
3. Performance - any bottlenecks?
4. Tests - adequate coverage?

Files:
- [list files]
```

---

## 🔄 Handoff Checklist

When handing off work to Web Claude Code:

- [ ] Commit and push all local changes
- [ ] Update VERSION file if applicable
- [ ] Update CHANGELOG.md with recent changes
- [ ] Document any new issues in CODEBASE_AUDIT_REPORT.md
- [ ] Update README.md if architecture changed
- [ ] Note any environment variable changes
- [ ] Document any new dependencies
- [ ] List any incomplete work or TODOs
- [ ] Provide context for next developer

**Handoff template:**
```markdown
## Handoff Notes - [Date]

### Work Completed
- [Task 1]
- [Task 2]

### Work In Progress
- [Task 3] - Status: [percentage]
  - Files: [file list]
  - Next steps: [steps]

### Known Issues
- [Issue 1] - Priority: [high/medium/low]

### Environment Changes
- Added: [new variable]
- Updated: [changed config]

### Next Steps
1. [Step 1]
2. [Step 2]

### Notes for Next Developer
[Any additional context]
```

---

## 🆘 Troubleshooting

### Issue: Web Claude Code can't access repository

**Solution:**
Provide public context or share files directly:
```
I'm working on PropIQ. Here's the relevant code:

[paste code section]

Please help me [task].
```

### Issue: Need to test locally but using Web Claude Code

**Solution:**
Web Claude Code can help you understand and plan, then test locally:
```
I'm using Web Claude Code to understand the code.
After you explain the changes, I'll test locally.

Please explain:
1. What the code currently does
2. What changes are needed
3. How to test locally
```

### Issue: Deployment fails

**Solution:**
Check Azure logs:
```bash
az webapp log tail \
  --name luntra-outreach-app \
  --resource-group luntra-outreach-rg
```

Or ask Web Claude Code:
```
Deployment failed with this error:
[paste error]

Please read:
- backend/Dockerfile
- backend/deploy-azure.sh
- docs/DEPLOYMENT_GUIDE.md

What's the issue?
```

---

## 📞 Support & Resources

**Technical Issues:**
- Check: CODEBASE_AUDIT_REPORT.md
- Review: README.md troubleshooting section
- Ask Web Claude Code for help

**Azure Issues:**
- Azure Portal: https://portal.azure.com
- Azure CLI docs: https://learn.microsoft.com/en-us/cli/azure/

**GitHub Issues:**
- Create issue: https://github.com/Luntra-HQ/propiq/issues
- Label appropriately: bug, enhancement, documentation, etc.

---

## 🎓 Learning Resources

### For New Developers

1. Start with README.md
2. Read CLAUDE.md for full context
3. Review CODEBASE_AUDIT_REPORT.md for known issues
4. Set up local development environment
5. Make a small change and test end-to-end
6. Read docs/ directory for specific topics

### Architecture Deep Dive

1. Backend architecture: Read `backend/api.py` and routers
2. Frontend architecture: Read `frontend/src/App.tsx` and components
3. Database schema: Check `backend/database_supabase.py`
4. Authentication flow: Read `backend/auth.py` and `frontend/src/utils/auth.ts`

---

**Last Updated:** 2025-11-10
**Maintained by:** LUNTRA Development Team
**Questions?** Open a GitHub issue or email support@luntra.one

---

## Quick Start for Web Claude Code Session

Copy and paste this to start any session:

```
I'm working on PropIQ, an AI-powered real estate investment analysis platform.

Repository: https://github.com/Luntra-HQ/propiq (private)
Branch: main

Key context files:
- README.md - Project overview
- CLAUDE.md - Full project memory
- WEB_CLAUDE_CODE_HANDOFF.md - Web development guide
- CODEBASE_AUDIT_REPORT.md - Known issues

Production:
- Backend: https://luntra-outreach-app.azurewebsites.net
- Frontend: https://propiq.luntra.one (pending)

My task: [Describe your specific task]

Please help me: [What you need help with]
```
