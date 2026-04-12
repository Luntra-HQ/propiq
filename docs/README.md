# PropIQ Documentation

**Project**: PropIQ - AI-Powered Property Investment Analysis Platform

---

## 🚀 Quick Start - Deployment

**For fast deployment (2-3 minutes), see:**

### **[FAST_DEPLOYMENT_GUIDE.md](../FAST_DEPLOYMENT_GUIDE.md)** ⭐ RECOMMENDED

This guide shows you how to deploy:
- **Frontend** to Netlify (~1 minute)
- **Backend** to Render.com or Railway (~3 minutes)

**Total deployment time: ~5 minutes** (vs 10-15 minutes with Azure)

---

## 📚 Documentation Index

### Deployment Guides

| Guide | Status | Use Case | Deploy Time |
|-------|--------|----------|-------------|
| [FAST_DEPLOYMENT_GUIDE.md](../FAST_DEPLOYMENT_GUIDE.md) | ✅ **RECOMMENDED** | PropIQ production deployment | ~3-5 min |
| [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) | ✅ Active | Pre-deployment checklist for new features | N/A |
| [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) | ⚠️ Legacy | Old Luntra project (not PropIQ) | ~5 min |
| [AZURE_DOCKER_DEPLOYMENT.md](./AZURE_DOCKER_DEPLOYMENT.md) | ⚠️ Deprecated | Legacy Azure deployment (slow) | ~10-15 min |
| [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md) | ⚠️ Legacy | Old deployment guide | Varies |
| [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) | ⚠️ Legacy | Old checklist | N/A |

### Implementation Documentation

| Document | Description |
|----------|-------------|
| [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) | Technical overview of enhanced support agent + multi-agent advisor |
| [CODE_REVIEW_REPORT.md](../CODE_REVIEW_REPORT.md) | Comprehensive code quality review (Grade: A, 92/100) |

### Project Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](../CLAUDE.md) | Project memory file - Essential context for all development |
| [README.md](../README.md) | Main project README |

---

## 🎯 Which Guide Should I Use?

### For PropIQ Deployment (New Project) ✅
**Use: [FAST_DEPLOYMENT_GUIDE.md](../FAST_DEPLOYMENT_GUIDE.md)**

This is the most up-to-date guide for deploying PropIQ with:
- Netlify for frontend
- Render.com or Railway for backend
- MongoDB Atlas (already configured)

### For Pre-Deployment Checks ✅
**Use: [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md)**

Use this before deploying new features like:
- Enhanced support chat
- Multi-agent property advisor
- Any major updates

### For Legacy Luntra Project ⚠️
**Use: AZURE_DOCKER_DEPLOYMENT.md or RENDER_DEPLOYMENT_GUIDE.md**

These guides are for the old Luntra project, not PropIQ.

---

## 🛠 Development Setup

### Frontend

```bash
cd propiq/frontend

# Install dependencies
npm install

# Run dev server
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build
```

### Backend

```bash
cd propiq/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run local server
uvicorn api:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

---

## 📊 Architecture Overview

```
PropIQ
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # DealCalculator, SupportChat, etc.
│   │   ├── utils/        # calculatorUtils, supportChat
│   │   └── config/       # pricing tiers
│   ├── netlify.toml   # Netlify deployment config
│   └── package.json
│
├── backend/           # FastAPI + Python
│   ├── routers/
│   │   ├── auth.py                          # JWT authentication
│   │   ├── propiq.py                        # Property analysis
│   │   ├── support_chat.py                  # Basic support chat
│   │   ├── support_chat_enhanced.py         # ⭐ Enhanced with tools
│   │   ├── property_advisor_multiagent.py   # ⭐ Multi-agent advisor
│   │   ├── payment.py                       # Stripe integration
│   │   └── marketing.py                     # Email capture
│   ├── api.py                # Main FastAPI app
│   ├── database_mongodb.py   # MongoDB connection
│   └── requirements.txt
│
└── docs/              # This folder
    ├── README.md (this file)
    └── Other guides...
```

---

## 🔐 Environment Variables

### Frontend (.env)

```bash
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (.env)

```bash
# Azure OpenAI (Required)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=REDACTED-key-here
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# MongoDB (Required)
MONGODB_URI=mongodb+srv://REDACTED

# JWT (Required)
JWT_SECRET=your-secret-key-here

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_live_REDACTED...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_REDACTED...

# W&B (Optional - for analytics)
WANDB_API_KEY=your-wandb-key
WANDB_MODE=online

# Environment
ENVIRONMENT=production
```

---

## 🧪 Testing

### Backend Health Checks

```bash
# Main health
curl http://localhost:8000/health

# Enhanced support chat
curl http://localhost:8000/support/health/enhanced

# Property advisor
curl http://localhost:8000/advisor/health

# PropIQ analysis
curl http://localhost:8000/propiq/health
```

### Frontend Testing

```bash
cd propiq/frontend

# Run tests (if available)
npm test

# Type checking
npm run type-check

# Build test
npm run build
```

---

## 🚨 Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
- Check `src/vite-env.d.ts` exists
- Run `npm install` to ensure all dependencies are installed

**Backend 500 errors**
- Check environment variables are set
- Verify MongoDB connection
- Check Azure OpenAI credentials

**CORS errors**
- Verify `VITE_API_URL` matches backend URL
- Check CORS settings in `api.py`

**"Failed to fetch" in frontend**
- Backend not running?
- CORS issue?
- Wrong API URL in `.env`?

---

## 📈 New Features (October 2025)

### Enhanced Support Chat ⭐
**File**: `backend/routers/support_chat_enhanced.py`

**Features**:
- Function calling with 5 tools
- Session state management
- Two-tier prompts
- W&B analytics logging

**Tools**:
1. `check_subscription_status` - Get user tier, usage, limits
2. `get_analysis_history` - Show recent analyses
3. `create_support_ticket` - Escalate to human support
4. `schedule_demo_call` - Book sales calls
5. `apply_promotional_credit` - Give trial extensions

### Multi-Agent Property Advisor ⭐
**File**: `backend/routers/property_advisor_multiagent.py`

**Features**:
- 4 specialized sub-agents
- Sequential execution with state passing
- Premium feature (Pro/Elite only)

**Agents**:
1. **Market Analyst** - Research & comps
2. **Deal Analyst** - Financial calculations
3. **Risk Analyst** - Risk assessment
4. **Action Planner** - Execution roadmap

---

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Netlify Docs](https://docs.netlify.com)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)

---

## 📞 Support

For deployment issues or questions:
1. Check the relevant guide (usually FAST_DEPLOYMENT_GUIDE.md)
2. Review the troubleshooting section
3. Check logs (Netlify/Render/Railway dashboard)

---

**Last Updated**: October 21, 2025
**Project Status**: Production-ready ✅
**Recommended Deployment**: Netlify + Render/Railway
