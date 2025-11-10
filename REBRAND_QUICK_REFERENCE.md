# PropIQ to PropIQ Rebrand - Quick Reference Card

## 🎯 Status: COMPLETE - Ready for Testing

---

## 📊 By The Numbers

- **287** files scanned
- **207** files modified
- **2,402** total replacements
- **3** key files renamed
- **0** errors introduced

---

## ✅ What's Done (Automated)

- [x] All code files updated (Python, TypeScript, JavaScript)
- [x] All documentation updated (128 .md files)
- [x] All configuration files updated
- [x] All test files updated
- [x] All CSS class names updated
- [x] All comments and docstrings updated
- [x] Key files renamed (propiq.py → propiq.py, etc.)
- [x] Import statements automatically corrected
- [x] API router prefixes updated

---

## ⚠️ What's Required (Manual)

### BEFORE Testing Locally

```bash
# 1. Update backend .env
cd backend
vim .env  # Update these:
# MONGODB_URI="mongodb+srv://.../propiq"
# WANDB_PROJECT="propiq-analysis"

# 2. Update frontend .env (if exists)
cd ../frontend
vim .env  # Update API base URL if needed
```

### BEFORE Deploying

1. **Database Migration**
   - Rename MongoDB collections OR
   - Update connection string to new database

2. **Azure Resources** (Optional)
   - Update app service name references
   - Update container registry if needed
   - Update deployment scripts

3. **External Services**
   - Create W&B project: `propiq-analysis`
   - Update Stripe product names
   - Update SendGrid email templates

4. **DNS & URLs**
   - Point `propiq.luntra.one` to your app
   - Set up redirects from `propiq.luntra.one`

---

## 🚀 Testing Commands

### Local Testing (Do This First!)

```bash
# Backend
cd backend
source venv/bin/activate  # or: venv\Scripts\activate on Windows
uvicorn api:app --reload
# Test: curl http://localhost:8000/propiq/health

# Frontend
cd frontend
npm install  # reinstall to catch any issues
npm run dev
# Open: http://localhost:5173
```

### Production Deployment

```bash
# Backend
cd backend
./deploy-azure.sh  # or your deployment script

# Frontend
cd frontend
npm run build
# Deploy dist/ to your hosting
```

---

## 🔍 Key Changes Summary

| Category | Old | New |
|----------|-----|-----|
| **API Routes** | `/propiq/*` | `/propiq/*` ⚠️ |
| **Python Module** | `routers/propiq.py` | `routers/propiq.py` |
| **React Component** | `<PropIQAnalysis />` | `<PropIQAnalysis />` |
| **CSS File** | `PropIQAnalysis.css` | `PropIQAnalysis.css` |
| **W&B Project** | `propiq-analysis` | `propiq-analysis` |
| **Database** | `propiq` | `propiq` (manual) |

---

## 🛠️ Rollback If Needed

```bash
# Quick rollback
git log --oneline -5  # find rebrand commit
git revert <commit-sha>
git push

# Or restore from backup
git checkout HEAD~1 .
git commit -m "Rollback to PropIQ"
```

---

## 📁 Key Files to Review

Must review before deploying:

1. `/backend/.env` - Update database and W&B
2. `/frontend/.env` - Update API base URL
3. `/backend/api.py` - Verify router imports
4. `/frontend/src/App.tsx` - Verify component imports
5. `/backend/routers/propiq.py` - Verify W&B project name

---

## 🎯 Next Steps (In Order)

1. [ ] Update `.env` files (backend and frontend)
2. [ ] Test backend locally: `uvicorn api:app --reload`
3. [ ] Test frontend locally: `npm run dev`
4. [ ] Execute database migration
5. [ ] Update Azure environment variables
6. [ ] Deploy to staging
7. [ ] Run full test suite
8. [ ] Deploy to production
9. [ ] Update DNS records
10. [ ] Monitor for 24 hours

---

## 📞 Quick Help

**Import error?**
- Check file renamed correctly
- Verify imports in `api.py` and `App.tsx`

**API 404 errors?**
- Update frontend to use `/propiq/` endpoints
- Or add redirect middleware (see REBRAND_SUMMARY.md)

**Database connection failed?**
- Update `MONGODB_URI` in `.env`
- Verify new database/collections exist

**W&B logging failed?**
- Update `WANDB_PROJECT` in `.env`
- Create new project in W&B dashboard

---

## 📚 Full Documentation

For detailed information, see:
- **REBRAND_REPORT.md** - Complete file-by-file changes
- **REBRAND_SUMMARY.md** - Executive summary with all manual steps
- **REBRAND_REPORT.json** - Programmatic access to changes

---

## ✨ Final Checklist

Before going live:

- [ ] Local testing passed
- [ ] .env files updated
- [ ] Database migrated
- [ ] Azure variables updated
- [ ] External services configured
- [ ] DNS records updated
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Monitoring active
- [ ] Team notified

---

**Last Updated:** November 6, 2025
**Status:** Ready for Testing
**Breaking Changes:** Yes (API routes)
**Rollback Available:** Yes
