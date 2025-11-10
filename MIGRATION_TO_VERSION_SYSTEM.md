# Migration Guide: Current Files → Version System

**Purpose:** Guide to organize existing documentation into the new version-based file cabinet system

---

## 🎯 Overview

Your current files at the root level will be organized into:
- `versions/v3.1/v3.1.1/` - Current version documentation
- `docs/` - Cross-version documentation
- Root level - Only active/cross-version files

---

## 📋 File Migration Map

### Files to Move to `versions/v3.1/v3.1.1/`

| Current File | New Location | Action |
|--------------|--------------|--------|
| `P0_FIXES_COMPLETE.md` | `versions/v3.1/v3.1.1/FIXES_COMPLETE.md` | **Merge** P0, P1, P2, PRIORITY_1 into one file |
| `P1_FIXES_COMPLETE.md` | (merge into FIXES_COMPLETE.md) | Merge |
| `P2_FIXES_COMPLETE.md` | (merge into FIXES_COMPLETE.md) | Merge |
| `PRIORITY_1_FIXES_COMPLETE.md` | (merge into FIXES_COMPLETE.md) | Merge |
| `DEPLOYMENT_SUCCESS.md` | `versions/v3.1/v3.1.1/DEPLOYMENT.md` | Move and rename |
| `DEPLOYMENT_COMPLETE.md` | (merge into DEPLOYMENT.md) | Merge |
| `DEPLOYMENT_SUMMARY.md` | (merge into DEPLOYMENT.md) | Merge |
| `IMPLEMENTATION_SUMMARY.md` | `versions/v3.1/v3.1.1/FEATURES.md` | Move if it describes features |
| `DEMO_READY_SUMMARY.md` | (content → CHANGELOG.md) | Extract relevant info, add to changelog |

### Files to Move to `docs/DEPLOYMENT_GUIDES/`

| Current File | New Location | Action |
|--------------|--------------|--------|
| `DEPLOYMENT_CHECKLIST.md` | `docs/DEPLOYMENT_GUIDES/CHECKLIST.md` | Move |
| `FAST_DEPLOYMENT_GUIDE.md` | `docs/DEPLOYMENT_GUIDES/FAST.md` | Move |
| `NETLIFY_SETUP.md` | `docs/DEPLOYMENT_GUIDES/NETLIFY.md` | Move |
| `DEPLOY_NOW_CHECKLIST.md` | (merge into CHECKLIST.md) | Merge |

### Files to Keep at Root (Cross-Version)

These stay at root because they're always current:

- ✅ `claude.md` - Project memory (always current)
- ✅ `DEVELOPMENT_WORKFLOW.md` - Development process
- ✅ `PRODUCT_CAPABILITIES_REFERENCE.md` - Current capabilities
- ✅ `ONBOARDING_CONVERSATION_GUIDE.md` - Onboarding guide
- ✅ `COMET_ASSISTANT_GUIDE.md` - AI assistant guide
- ✅ `VERSION_SYSTEM.md` - This system (meta-documentation)
- ✅ `README.md` - Main entry point

### Files to Archive (Old/Irrelevant)

These can be moved to `versions/archive/` or deleted:

- `IMPLEMENT_UX_FIXES.md` - Completed, content in FIXES_COMPLETE.md
- `UX_FIXES_DANITA_FEEDBACK.md` - Completed, content in FIXES_COMPLETE.md
- `PROPIQ_ANALYSIS_COMPLETE.md` - Old analysis, may be outdated
- `CODE_REVIEW_REPORT.md` - Keep for reference? (Maybe move to docs/)

---

## 🔧 Step-by-Step Migration

### Step 1: Create Consolidated Files

**1.1. Create FIXES_COMPLETE.md**

```bash
cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq"
cat P0_FIXES_COMPLETE.md P1_FIXES_COMPLETE.md P2_FIXES_COMPLETE.md > versions/v3.1/v3.1.1/FIXES_COMPLETE.md
```

Then manually edit to:
- Remove duplicates
- Organize by priority (P0, P1, P2)
- Add section headers

**1.2. Create DEPLOYMENT.md**

```bash
cat DEPLOYMENT_SUCCESS.md DEPLOYMENT_COMPLETE.md > versions/v3.1/v3.1.1/DEPLOYMENT.md
```

**1.3. Create FEATURES.md** (if IMPLEMENTATION_SUMMARY.md describes features)

```bash
cp IMPLEMENTATION_SUMMARY.md versions/v3.1/v3.1.1/FEATURES.md
```

### Step 2: Move Deployment Guides

```bash
mkdir -p docs/DEPLOYMENT_GUIDES
mv FAST_DEPLOYMENT_GUIDE.md docs/DEPLOYMENT_GUIDES/FAST.md
mv NETLIFY_SETUP.md docs/DEPLOYMENT_GUIDES/NETLIFY.md
mv DEPLOYMENT_CHECKLIST.md docs/DEPLOYMENT_GUIDES/CHECKLIST.md
```

### Step 3: Update Root README

Add section to root `README.md`:

```markdown
## Version Information

Current Version: **v3.1.1**

- [Version Index](./versions/INDEX.md)
- [Current Version Changelog](./versions/v3.1/v3.1.1/CHANGELOG.md)
- [Version System Guide](./VERSION_SYSTEM.md)
```

### Step 4: Create Links/References

Create `active/` folder with symlinks or README that links to current version:

```bash
mkdir -p active
cat > active/README.md << 'EOF'
# Active Documentation

This folder contains links to current/active documentation.

## Current Version (v3.1.1)
- [Changelog](../versions/v3.1/v3.1.1/CHANGELOG.md)
- [Deployment Notes](../versions/v3.1/v3.1.1/DEPLOYMENT.md)
- [Fixes Complete](../versions/v3.1/v3.1.1/FIXES_COMPLETE.md)

## Cross-Version Docs
- [Product Capabilities](../PRODUCT_CAPABILITIES_REFERENCE.md)
- [Onboarding Guide](../ONBOARDING_CONVERSATION_GUIDE.md)
- [Development Workflow](../DEVELOPMENT_WORKFLOW.md)
EOF
```

---

## 🚀 Quick Migration Script

You can run this script to automate the migration:

```bash
#!/bin/bash
# Migration script for PropIQ version system

cd "/Users/briandusape/Projects/LUNTRA/LUNTRA MVPS/propiq"

echo "Creating version directories..."
mkdir -p versions/v3.1/v3.1.1
mkdir -p versions/v3.2/v3.2.0
mkdir -p docs/DEPLOYMENT_GUIDES
mkdir -p active

echo "Consolidating fixes..."
cat P0_FIXES_COMPLETE.md P1_FIXES_COMPLETE.md P2_FIXES_COMPLETE.md > versions/v3.1/v3.1.1/FIXES_COMPLETE_TEMP.md
echo "⚠️  Manual edit needed: versions/v3.1/v3.1.1/FIXES_COMPLETE_TEMP.md"

echo "Consolidating deployment docs..."
cat DEPLOYMENT_SUCCESS.md DEPLOYMENT_COMPLETE.md > versions/v3.1/v3.1.1/DEPLOYMENT_TEMP.md
echo "⚠️  Manual edit needed: versions/v3.1/v3.1.1/DEPLOYMENT_TEMP.md"

echo "Moving deployment guides..."
if [ -f FAST_DEPLOYMENT_GUIDE.md ]; then
  mv FAST_DEPLOYMENT_GUIDE.md docs/DEPLOYMENT_GUIDES/FAST.md
fi
if [ -f NETLIFY_SETUP.md ]; then
  mv NETLIFY_SETUP.md docs/DEPLOYMENT_GUIDES/NETLIFY.md
fi
if [ -f DEPLOYMENT_CHECKLIST.md ]; then
  mv DEPLOYMENT_CHECKLIST.md docs/DEPLOYMENT_GUIDES/CHECKLIST.md
fi

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Review and edit versions/v3.1/v3.1.1/FIXES_COMPLETE_TEMP.md"
echo "2. Review and edit versions/v3.1/v3.1.1/DEPLOYMENT_TEMP.md"
echo "3. Rename *_TEMP.md files to remove _TEMP"
echo "4. Update root README.md with version links"
```

---

## ✅ Post-Migration Checklist

After migration, verify:

- [ ] `versions/v3.1/v3.1.1/CHANGELOG.md` exists and is up to date
- [ ] `versions/v3.1/v3.1.1/DEPLOYMENT.md` consolidates all deployment notes
- [ ] `versions/v3.1/v3.1.1/FIXES_COMPLETE.md` has all P0/P1/P2 fixes
- [ ] `versions/v3.1/v3.1.1/FEATURES.md` describes v3.1.1 features
- [ ] `versions/INDEX.md` has correct version information
- [ ] `versions/CURRENT.md` points to v3.1.1
- [ ] Root `README.md` links to version system
- [ ] Deployment guides moved to `docs/DEPLOYMENT_GUIDES/`
- [ ] Cross-version docs remain at root (claude.md, DEVELOPMENT_WORKFLOW.md, etc.)

---

## 🗑️ Files Safe to Delete After Migration

Once you've verified content is in version directories:

- `P0_FIXES_COMPLETE.md` ✅ (moved to versions/)
- `P1_FIXES_COMPLETE.md` ✅ (moved to versions/)
- `P2_FIXES_COMPLETE.md` ✅ (moved to versions/)
- `PRIORITY_1_FIXES_COMPLETE.md` ✅ (moved to versions/)
- `DEPLOYMENT_SUCCESS.md` ✅ (moved to versions/)
- `DEPLOYMENT_COMPLETE.md` ✅ (moved to versions/)
- `DEPLOYMENT_SUMMARY.md` ✅ (moved to versions/)

**Before deleting, verify:**
- All content copied to `versions/v3.1/v3.1.1/`
- Nothing unique in old files

---

## 📝 Updating References

After migration, update any files that reference old paths:

1. **Root README.md** - Add version links
2. **claude.md** - Update deployment guide paths
3. **DEVELOPMENT_WORKFLOW.md** - Update if it references old fix files

---

## 🎯 Future Workflow

**After migration, follow this workflow:**

1. **For current work:** Still create files at root (e.g., `NEW_FEATURE.md`)
2. **When version ships:** Move to `versions/v3.X/v3.X.Y/`
3. **Keep root clean:** Only active/cross-version docs at root

---

**Last Updated:** November 2025  
**Status:** Ready to Execute

