# PropIQ Version System & File Cabinet Organization

**Current Version:** v3.1.1 (MVP Live)  
**Created:** November 2025  
**Purpose:** Organize documentation and iterations using semantic versioning while maintaining the "file cabinet" approach

---

## 🎯 Versioning Strategy

### Semantic Versioning (MAJOR.MINOR.PATCH)

- **MAJOR (v3.x.x):** Major feature releases, breaking changes, architectural shifts
- **MINOR (v3.1.x):** New features, enhancements, significant improvements
- **PATCH (v3.1.1):** Bug fixes, small improvements, documentation updates

### Current Status
- **v3.1.1:** Current MVP (live in production)
- **v3.2.0:** Next planned minor release
- **v3.3.0:** Future iterations

---

## 📁 Directory Structure

```
propiq/
├── versions/                          # Version-based file cabinet
│   ├── v3.1/                          # v3.1.x series (current)
│   │   ├── v3.1.1/                    # Specific version
│   │   │   ├── CHANGELOG.md           # What changed in this version
│   │   │   ├── DEPLOYMENT.md          # Deployment notes
│   │   │   ├── FIXES_COMPLETE.md      # Bug fixes and improvements
│   │   │   └── FEATURES.md            # New features added
│   │   ├── v3.1.2/                    # Next patch (if needed)
│   │   └── SUMMARY.md                 # Summary of v3.1.x series
│   ├── v3.2/                          # v3.2.x series (future)
│   │   ├── v3.2.0/                    # Planned features
│   │   │   ├── ROADMAP.md             # Planned features
│   │   │   ├── FEATURE_REQUESTS.md    # Collected requests
│   │   │   └── NOTES.md               # Development notes
│   │   └── SUMMARY.md
│   └── CURRENT.md                     # Points to current version (v3.1.1)
│
├── docs/                              # Cross-version documentation
│   ├── ARCHITECTURE.md                # System architecture (doesn't change per version)
│   ├── API.md                         # API documentation
│   ├── DEPLOYMENT_GUIDES/             # Deployment instructions
│   └── DEVELOPMENT_WORKFLOW.md        # Development process
│
├── active/                            # Currently active documentation (symlinks or shortcuts)
│   ├── PRODUCT_CAPABILITIES.md        # → versions/v3.1/v3.1.1/
│   ├── ONBOARDING_GUIDE.md            # → versions/v3.1/v3.1.1/
│   └── README.md                      # → versions/v3.1/v3.1.1/README.md
│
├── archive/                           # Older versions (when v3.1 is superseded)
│   └── (moved here when version is no longer active)
│
└── [Root level files]                 # Keep current/active files here for easy access
    ├── claude.md                      # Project memory (always current)
    ├── DEVELOPMENT_WORKFLOW.md        # Development process
    ├── PRODUCT_CAPABILITIES_REFERENCE.md  # Current capabilities
    └── README.md                      # Main entry point
```

---

## 📋 File Organization Rules

### What Goes in `versions/vX.Y/vX.Y.Z/`

**For each specific version:**

1. **CHANGELOG.md** - What changed in this version
   ```markdown
   # PropIQ v3.1.1 Changelog
   
   **Release Date:** November 2025
   **Type:** Patch (Bug fixes and improvements)
   
   ## Changes
   - Fixed input placeholder zeros not clearing
   - Improved accessibility contrast
   - Added HOA fee support in calculator
   
   ## Files Changed
   - frontend/src/components/DealCalculator.tsx
   ```

2. **DEPLOYMENT.md** - Deployment notes for this version
   ```markdown
   # PropIQ v3.1.1 Deployment Notes
   
   **Deployed:** November 2025
   **Environment:** Production
   
   ## Deployment Steps
   1. ...
   2. ...
   
   ## Rollback Plan
   ...
   ```

3. **FIXES_COMPLETE.md** - Bug fixes and improvements
   ```markdown
   # PropIQ v3.1.1 Fixes
   
   - P0 Fixes: Input placeholder zeros
   - P1 Fixes: Accessibility contrast
   - P2 Fixes: Icon standardization
   ```

4. **FEATURES.md** - New features (if any)
   ```markdown
   # PropIQ v3.1.1 Features
   
   - Added HOA fee support
   - Enhanced House Hack calculations
   ```

### What Goes in `versions/vX.Y/SUMMARY.md`

**For each minor version series:**

```markdown
# PropIQ v3.1.x Series Summary

**Released:** November 2025
**Status:** Current Production

## Versions in Series
- v3.1.0 (Initial release)
- v3.1.1 (Current)

## Major Features
- AI Property Analysis
- Deal Calculator with 3 tabs
- HOA fee support
- House Hack strategy

## Key Documentation
- [v3.1.1 CHANGELOG](./v3.1.1/CHANGELOG.md)
- [v3.1.1 DEPLOYMENT](./v3.1.1/DEPLOYMENT.md)
```

### What Stays at Root Level

**Cross-version / Always-current files:**

- `claude.md` - Project memory (always current, not version-specific)
- `DEVELOPMENT_WORKFLOW.md` - Development process (doesn't change per version)
- `PRODUCT_CAPABILITIES_REFERENCE.md` - Current capabilities (points to active version)
- `README.md` - Main entry point
- `docs/` folder - Architecture, API docs, deployment guides

**Active iteration files (current sprint):**

- `P0_FIXES_COMPLETE.md` → Move to `versions/v3.1/v3.1.1/` when version is finalized
- `P1_FIXES_COMPLETE.md` → Move to `versions/v3.1/v3.1.1/`
- `DEPLOYMENT_SUCCESS.md` → Move to `versions/v3.1/v3.1.1/DEPLOYMENT.md`

---

## 🔄 Migration Plan: Current Files → Version System

### Step 1: Create Version Structure

```bash
cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq"
mkdir -p versions/v3.1/v3.1.1
mkdir -p versions/v3.2/v3.2.0
```

### Step 2: Move Current Documentation

**Files to move to `versions/v3.1/v3.1.1/`:**

| Current File | New Location | Action |
|--------------|--------------|--------|
| `P0_FIXES_COMPLETE.md` | `versions/v3.1/v3.1.1/FIXES_COMPLETE.md` | Merge P0, P1, P2 into one file |
| `P1_FIXES_COMPLETE.md` | (merge into above) | Merge |
| `P2_FIXES_COMPLETE.md` | (merge into above) | Merge |
| `PRIORITY_1_FIXES_COMPLETE.md` | (merge into above) | Merge |
| `DEPLOYMENT_SUCCESS.md` | `versions/v3.1/v3.1.1/DEPLOYMENT.md` | Move/rename |
| `DEPLOYMENT_COMPLETE.md` | (merge into above) | Merge |
| `IMPLEMENTATION_SUMMARY.md` | `versions/v3.1/v3.1.1/FEATURES.md` | Move if it describes features |
| `DEMO_READY_SUMMARY.md` | `versions/v3.1/v3.1.1/CHANGELOG.md` | Incorporate into changelog |

**Files to keep at root (cross-version):**

- `claude.md` ✅
- `DEVELOPMENT_WORKFLOW.md` ✅
- `PRODUCT_CAPABILITIES_REFERENCE.md` ✅ (update to reference current version)
- `ONBOARDING_CONVERSATION_GUIDE.md` ✅
- `COMET_ASSISTANT_GUIDE.md` ✅

**Files to move to `docs/` (cross-version guides):**

- `DEPLOYMENT_CHECKLIST.md` → `docs/DEPLOYMENT_GUIDES/CHECKLIST.md`
- `FAST_DEPLOYMENT_GUIDE.md` → `docs/DEPLOYMENT_GUIDES/FAST.md`
- `NETLIFY_SETUP.md` → `docs/DEPLOYMENT_GUIDES/NETLIFY.md`

### Step 3: Create Version Changelog

Create `versions/v3.1/v3.1.1/CHANGELOG.md` by consolidating existing documentation.

### Step 4: Create Version Index

Create `versions/CURRENT.md` that points to current version.

---

## 📝 Template Files

### Version Changelog Template

```markdown
# PropIQ vX.Y.Z Changelog

**Release Date:** [Date]
**Type:** Major / Minor / Patch
**Previous Version:** vX.Y.Z-1

## Summary
Brief summary of this release.

## 🎉 New Features
- Feature 1
- Feature 2

## 🐛 Bug Fixes
- Fixed issue X
- Fixed issue Y

## 🔧 Improvements
- Improved X
- Enhanced Y

## 📚 Documentation
- Added guide X
- Updated documentation Y

## 🔗 Related Documentation
- [Deployment Notes](./DEPLOYMENT.md)
- [Fixes Complete](./FIXES_COMPLETE.md)
- [Features](./FEATURES.md)

## 🚀 Deployment
- **Frontend:** [Date] - Netlify
- **Backend:** [Date] - Azure/Render
- **Status:** ✅ Deployed
```

### Version Deployment Template

```markdown
# PropIQ vX.Y.Z Deployment Notes

**Deployed:** [Date]
**Deployed By:** [Name]
**Environment:** Production

## Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog created
- [ ] Version number updated in package.json/frontend

## Deployment Steps
1. Frontend deployment to Netlify
2. Backend deployment to Azure
3. Environment variables verified
4. Health checks passed

## Post-Deployment Verification
- [ ] Site accessible at propiq.luntra.one
- [ ] API responding correctly
- [ ] No console errors
- [ ] Critical flows tested

## Rollback Plan
If issues arise:
1. Revert git commit
2. Redeploy previous version
3. Verify rollback successful

## Known Issues
- [Issue description if any]

## Notes
[Any additional notes]
```

---

## 🚀 Workflow: Starting a New Version

### For Patch Release (v3.1.1 → v3.1.2)

```bash
# 1. Create new patch directory
mkdir versions/v3.1/v3.1.2

# 2. Create changelog
touch versions/v3.1/v3.1.2/CHANGELOG.md

# 3. Document fixes
# (Fix bugs, update CHANGELOG.md)

# 4. After deployment, update version summary
# Edit versions/v3.1/SUMMARY.md to include v3.1.2
```

### For Minor Release (v3.1.x → v3.2.0)

```bash
# 1. Create new minor version directory
mkdir -p versions/v3.2/v3.2.0

# 2. Create roadmap for new features
touch versions/v3.2/v3.2.0/ROADMAP.md

# 3. Document planned features
# (Plan features, update ROADMAP.md)

# 4. When ready to start development
touch versions/v3.2/v3.2.0/CHANGELOG.md
touch versions/v3.2/v3.2.0/FEATURES.md
```

### For Major Release (v3.x.x → v4.0.0)

```bash
# 1. Archive v3.x series
mv versions/v3 versions/archive/v3

# 2. Create v4.0 directory
mkdir -p versions/v4.0/v4.0.0

# 3. Create migration guide from v3 to v4
touch versions/v4.0/v4.0.0/MIGRATION.md
```

---

## 📊 Version Index (Master File)

Create `versions/INDEX.md`:

```markdown
# PropIQ Version Index

## Current Version
**v3.1.1** - Production (Live)
- [Changelog](./v3.1/v3.1.1/CHANGELOG.md)
- [Deployment Notes](./v3.1/v3.1.1/DEPLOYMENT.md)

## Version History

### v3.1.x Series (Current)
- **v3.1.1** (November 2025) - Patch: Bug fixes, HOA support
  - [Changelog](./v3.1/v3.1.1/CHANGELOG.md)
  - [Deployment](./v3.1/v3.1.1/DEPLOYMENT.md)
- **v3.1.0** (October 2025) - Initial MVP release
  - [Summary](./v3.1/SUMMARY.md)

### v3.2.x Series (Planned)
- **v3.2.0** (Planned) - Rent vs Buy feature, enhanced house hacking
  - [Roadmap](./v3.2/v3.2.0/ROADMAP.md)

## Quick Links
- [Current Version Changelog](./v3.1/v3.1.1/CHANGELOG.md)
- [Deployment Guides](../docs/DEPLOYMENT_GUIDES/)
- [Product Capabilities](../PRODUCT_CAPABILITIES_REFERENCE.md)
```

---

## 🎯 Next Steps

### Immediate (This Week)

1. **Create directory structure:**
   ```bash
   mkdir -p versions/v3.1/v3.1.1
   mkdir -p versions/v3.2/v3.2.0
   ```

2. **Create v3.1.1 documentation:**
   - Consolidate P0/P1/P2 fixes into `versions/v3.1/v3.1.1/FIXES_COMPLETE.md`
   - Create `versions/v3.1/v3.1.1/CHANGELOG.md`
   - Move deployment notes to `versions/v3.1/v3.1.1/DEPLOYMENT.md`

3. **Create version index:**
   - `versions/INDEX.md`
   - `versions/CURRENT.md` (points to v3.1.1)

4. **Update root README:**
   - Add link to version system
   - Reference current version

### For Next Version (v3.2.0)

1. **Create roadmap:**
   - `versions/v3.2/v3.2.0/ROADMAP.md`
   - Document planned features (Rent vs Buy, enhanced house hacking, etc.)

2. **Collect feature requests:**
   - `versions/v3.2/v3.2.0/FEATURE_REQUESTS.md`
   - Add items from user feedback

3. **Start changelog:**
   - `versions/v3.2/v3.2.0/CHANGELOG.md`
   - Update as features are developed

---

## 💡 Best Practices

### When to Create a New Version

**Patch (v3.1.1 → v3.1.2):**
- Bug fixes
- Small improvements
- Documentation updates
- Deploy immediately

**Minor (v3.1.x → v3.2.0):**
- New features
- Significant enhancements
- New capabilities
- Plan, then deploy

**Major (v3.x.x → v4.0.0):**
- Breaking changes
- Architecture changes
- Major refactoring
- Rare (probably not for a while)

### Documentation Discipline

1. **Always update CHANGELOG.md** when making changes
2. **Move completed iteration files** to version directory
3. **Keep root level clean** - only active/cross-version docs
4. **Update version index** when releasing new version

### File Naming Convention

**Version-specific files:**
- `CHANGELOG.md` - What changed
- `DEPLOYMENT.md` - How it was deployed
- `FIXES_COMPLETE.md` - Bug fixes
- `FEATURES.md` - New features
- `ROADMAP.md` - Planned features (pre-release)

**Cross-version files (root/docs):**
- Keep descriptive names: `PRODUCT_CAPABILITIES_REFERENCE.md`
- These don't need version numbers

---

## 🔗 Integration with Existing Workflow

This version system works with your existing workflow:

1. **You still create files at root level** for active work:
   - `P0_FIXES_COMPLETE.md` (while working)
   - `DEPLOYMENT_SUCCESS.md` (after deploying)

2. **Move to version directory** when version is finalized:
   - Move `P0_FIXES_COMPLETE.md` → `versions/v3.1/v3.1.1/FIXES_COMPLETE.md`

3. **Keep active docs accessible:**
   - Symlink or copy current version docs to root `active/` folder
   - Or update root README with links to current version

---

**Last Updated:** November 2025  
**Current Version:** v3.1.1  
**Next Planned:** v3.2.0 (Rent vs Buy feature)

