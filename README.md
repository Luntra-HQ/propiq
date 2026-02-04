# PropIQ

**AI-Powered Real Estate Investment Analysis Platform**

[![Production](https://img.shields.io/badge/Production-propiq.luntra.one-blue)](https://propiq.luntra.one)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

PropIQ is a SaaS platform that provides AI-powered real estate investment analysis for Zillow properties, combining intelligent property analysis, comprehensive deal calculators, and AI-driven customer support.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **MongoDB Atlas** account (or local MongoDB)
- **Azure OpenAI** API access
- **Stripe** account for payments

### Local Development Setup

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn api:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend API Docs: http://localhost:8000/docs
- Backend Health: http://localhost:8000/health

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Migration (Azure → AWS)](#migration-azure--aws)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## ✨ Features

### Core Features
- 🏡 **AI Property Analysis** - GPT-4o-mini powered investment analysis
- 🧮 **Deal Calculator** - Comprehensive 3-tab financial calculator
  - Basic: Purchase price, down payment, cash flow
  - Advanced: Operating expenses, cap rate, 1% rule
  - Scenarios: Best/worst case projections, 5-year analysis
- 💬 **AI Support Chat** - Custom support assistant (replaces Intercom, saves $888/year)
- 💳 **Subscription Management** - Stripe-powered billing with 4 tiers
- 📊 **Analytics** - Weights & Biases AI tracking + Microsoft Clarity

### Business Model (NEW - Unlimited Model)
| Tier | Price | Analyses | Key Features |
|------|-------|----------|--------------|
| Free | $0 | 3 trial | Test drive the platform |
| Starter | **$49/mo** | **UNLIMITED** ✨ | Core AI analysis, PDF export |
| Pro | $99/mo | **UNLIMITED** ✨ | Market trends, Chrome extension, bulk import |
| Elite | $199/mo | **UNLIMITED** ✨ | White-label, API, team collaboration |

**Why Unlimited?** Real estate investors analyze 20-50 properties to buy ONE. Limits create friction, not value.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  propiq.luntra.one - Azure Static Web Apps (planned)    │
│  - Deal Calculator UI                                    │
│  - Property Analysis Interface                          │
│  - Support Chat Widget                                   │
│  - Authentication & Subscription Management              │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS/REST API
┌──────────────────────┴──────────────────────────────────┐
│              Backend (FastAPI)                           │
│  luntra-outreach-app.azurewebsites.net                  │
│  - Authentication (JWT)                                  │
│  - Property Analysis (Azure OpenAI)                      │
│  - Support Chat (Azure OpenAI)                          │
│  - Payment Processing (Stripe)                          │
│  - Email Marketing (SendGrid)                           │
└─────┬───────────┬──────────┬──────────┬────────────────┘
      │           │          │          │
      ▼           ▼          ▼          ▼
  MongoDB    Azure      Stripe    SendGrid
  Atlas      OpenAI
```

### Migration (Azure → AWS)

Planned replacement of Azure services with AWS: **Azure OpenAI → AWS Bedrock**, **Azure Web App → AWS App Runner or ECS**, **ACR → ECR**. See **[AZURE_TO_AWS_MIGRATION_GUIDE.md](./AZURE_TO_AWS_MIGRATION_GUIDE.md)** for the full inventory, replacement table, and migration order.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 6.0.11
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Analytics:** Microsoft Clarity (`tts5hc8zf8`)

### Backend
- **Framework:** FastAPI 0.115.0
- **Runtime:** Python 3.11
- **Database:** MongoDB Atlas
- **Auth:** PyJWT 2.10.1 + bcrypt
- **AI:** Azure OpenAI (GPT-4o-mini)
- **Payments:** Stripe 12.4.0
- **Email:** SendGrid 6.11.0
- **Tracking:** Weights & Biases 0.22.2

### Infrastructure
- **Backend Hosting:** Azure Web App (Linux container)
- **Container Registry:** Azure Container Registry
- **Frontend Hosting:** Azure Static Web Apps (planned)
- **Database:** MongoDB Atlas (cloud)
- **CDN:** Azure CDN (planned)

---

## 📁 Project Structure

```
propiq/
├── frontend/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── DealCalculator.tsx       # 3-tab calculator
│   │   │   ├── DealCalculator.css
│   │   │   ├── SupportChat.tsx          # AI support chat
│   │   │   ├── SupportChat.css
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── calculatorUtils.ts       # Financial calculations
│   │   │   ├── supportChat.ts           # Chat API integration
│   │   │   └── auth.ts                  # Authentication utilities
│   │   ├── config/
│   │   │   └── pricing.ts               # Pricing tiers
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/                   # Playwright E2E tests
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # FastAPI backend
│   ├── routers/
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── propiq.py            # Property analysis
│   │   ├── payment.py           # Stripe integration
│   │   ├── support_chat.py      # Support chat endpoints
│   │   └── marketing.py         # Email marketing
│   ├── middleware/
│   │   └── rate_limiter.py      # Rate limiting
│   ├── utils/
│   │   ├── email.py
│   │   ├── slack.py
│   │   └── onboarding_emails.py
│   ├── api.py                   # Main FastAPI app
│   ├── auth.py                  # JWT authentication
│   ├── database_supabase.py     # Database connection (Supabase/PostgreSQL)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── deploy-azure.sh
│
├── docs/                        # Documentation
│   ├── API_USAGE_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SECURITY_HARDENING.md
│   └── sprints/
│
├── .github/
│   └── workflows/               # GitHub Actions CI/CD
│
├── README.md                    # This file
├── WEB_CLAUDE_CODE_HANDOFF.md   # Web Claude Code development guide
├── DEVELOPER_ONBOARDING.md      # New developer guide
├── CHANGELOG.md                 # Version history
└── VERSION                      # Current version
```

---

## 💻 Development

### Environment Variables

**Backend `.env`:**
```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/propiq
# OR
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-key

# Authentication
JWT_SECRET=your-32-char-random-secret

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-service.openai.azure.com/
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_API_VERSION=2025-01-01-preview

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG...
FROM_EMAIL=support@luntra.one

# Weights & Biases
WANDB_API_KEY=your-key
WANDB_MODE=online

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://propiq.luntra.one
```

**Frontend `.env`:**
```bash
VITE_API_BASE=http://localhost:8000
# Production:
# VITE_API_BASE=https://luntra-outreach-app.azurewebsites.net
```

### Development Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test:**
   ```bash
   # Backend
   cd backend && uvicorn api:app --reload

   # Frontend
   cd frontend && npm run dev
   ```

3. **Run tests:**
   ```bash
   # Frontend tests
   npm run test:e2e

   # Backend tests
   pytest
   ```

4. **Commit with proper message:**
   ```bash
   git commit -m "Add feature: your feature description

   - Detailed change 1
   - Detailed change 2

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   # Create PR on GitHub
   ```

---

## 🚢 Deployment

### Backend Deployment (Azure)

**Automated deployment:**
```bash
cd backend
./deploy-azure.sh
```

**Manual deployment:**
```bash
# Login to Azure Container Registry
az acr login --name luntraregistry

# Build Docker image
docker build -t luntraregistry.azurecr.io/propiq-backend:latest .

# Push to registry
docker push luntraregistry.azurecr.io/propiq-backend:latest

# Deploy to Azure Web App
az webapp restart --name luntra-outreach-app --resource-group luntra-outreach-rg
```

**Verify deployment:**
```bash
curl https://luntra-outreach-app.azurewebsites.net/health
```

### Frontend Deployment (Azure Static Web Apps - Planned)

```bash
cd frontend
npm run build
# Deploy dist/ folder to Azure Static Web Apps
```

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
pytest tests/test_auth.py -v
pytest --cov=. --cov-report=html
```

### Frontend Testing
```bash
cd frontend
npm run test              # Unit tests
npm run test:e2e          # Playwright E2E tests
npx playwright test --ui  # Interactive test mode
```

### Manual Testing Checklist
- [ ] Calculator performs accurate calculations
- [ ] Support chat responds correctly
- [ ] Authentication flow works (signup, login, logout)
- [ ] Stripe checkout creates subscription
- [ ] Property analysis returns valid results
- [ ] Rate limiting blocks excessive requests
- [ ] Mobile UI is responsive

---

## 📚 Documentation

### Key Documentation Files
- [WEB_CLAUDE_CODE_HANDOFF.md](WEB_CLAUDE_CODE_HANDOFF.md) - Web Claude Code development guide
- [DEVELOPER_ONBOARDING.md](DEVELOPER_ONBOARDING.md) - New developer onboarding
- [CLAUDE.md](CLAUDE.md) - Project memory file for Claude Code
- [docs/API_USAGE_GUIDE.md](docs/API_USAGE_GUIDE.md) - API documentation
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) - Deployment instructions
- [docs/SECURITY_HARDENING.md](docs/SECURITY_HARDENING.md) - Security best practices
- [CODEBASE_AUDIT_REPORT.md](CODEBASE_AUDIT_REPORT.md) - Code quality audit

### API Documentation
Interactive API docs available at:
- Development: http://localhost:8000/docs
- Production: https://luntra-outreach-app.azurewebsites.net/docs

---

## 🤝 Contributing

### Code Standards
- **TypeScript:** Use proper types, avoid `any`
- **Python:** Use type hints, Pydantic models for validation
- **CSS:** Mobile-first responsive design
- **Testing:** Write tests for new features
- **Documentation:** Update docs when adding features

### Git Workflow
1. Create feature branch from `main`
2. Make changes with tests
3. Run linters and type checks
4. Commit with detailed message (include Claude Code attribution)
5. Create PR with description
6. Wait for review and CI checks
7. Merge to `main`

**Never:**
- ❌ Commit directly to `main`
- ❌ Force push to `main`
- ❌ Skip tests (no `--no-verify`)
- ❌ Commit secrets or API keys

---

## 🔒 Security

### Security Best Practices
- All secrets in environment variables (never in code)
- JWT tokens for authentication
- HTTPS only in production
- Stripe webhook signature verification
- Rate limiting on all public endpoints
- Input validation with Pydantic
- CORS properly configured

### Reporting Security Issues
Email security concerns to: brian@luntra.one

---

## 📊 Monitoring

### Analytics & Tracking
- **Microsoft Clarity:** User behavior analytics (Project ID: `tts5hc8zf8`)
- **Weights & Biases:** AI model tracking (Project: `propiq-analysis`)
- **Azure Monitor:** Application insights and logs

### Health Checks
```bash
# Main health check
curl https://luntra-outreach-app.azurewebsites.net/health

# PropIQ analysis health
curl https://luntra-outreach-app.azurewebsites.net/propiq/health

# Support chat health
curl https://luntra-outreach-app.azurewebsites.net/support/health

# Stripe health
curl https://luntra-outreach-app.azurewebsites.net/stripe/health
```

---

## 🗺️ Roadmap

### Completed ✅
- AI-powered property analysis
- 3-tab deal calculator
- Custom AI support chat
- Stripe subscription management
- JWT authentication
- Backend deployment to Azure
- Microsoft Clarity integration
- Weights & Biases tracking

### In Progress 🔄
- Frontend deployment to Azure Static Web Apps
- Comprehensive E2E testing
- Performance optimization
- Error monitoring setup

### Planned 📋
- Property comparison feature
- PDF export of analyses
- Email report delivery
- Mobile app (React Native)
- Advanced market data integration
- Multi-language support

---

## 📄 License

Proprietary - LUNTRA

Copyright © 2025 LUNTRA. All rights reserved.

---

## 👥 Team

**Development:**
- Brian Dusape - Founder & Developer

**AI Development Partner:**
- Claude Code by Anthropic

---

## 🔗 Links

- **Production App:** https://propiq.luntra.one
- **Backend API:** https://luntra-outreach-app.azurewebsites.net
- **API Docs:** https://luntra-outreach-app.azurewebsites.net/docs
- **GitHub:** https://github.com/Luntra-HQ/propiq
- **Support:** support@luntra.one

---

## 📞 Support

For technical support or questions:
- Email: support@luntra.one
- Documentation: See [docs/](docs/) directory
- Web Claude Code Guide: [WEB_CLAUDE_CODE_HANDOFF.md](WEB_CLAUDE_CODE_HANDOFF.md)

---

**Last Updated:** 2025-11-10
**Version:** See [VERSION](VERSION) file
**Status:** Production-ready backend, frontend deployment in progress
