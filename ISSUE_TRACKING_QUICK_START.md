# PropIQ Issue Tracking - Quick Start Guide

**TL;DR:** PropIQ uses a hybrid system - bugs tracked both in local CSV file and GitHub Issues, automatically synced.

---

## 🚀 Quick Start (5 Minutes)

### 1. Report a Bug

**Via GitHub (Recommended):**
```bash
gh issue create --repo Luntra-HQ/propiq
# Or visit: https://github.com/Luntra-HQ/propiq/issues/new/choose
```

**Via CSV (Fast local tracking):**
```csv
# Add row to PROPIQ_BUG_TRACKER.csv
BUG-002,,2026-01-05,2026-01-05,1,TypeError,Price is undefined,PricingPage,Users can't see pricing,...
```

### 2. Sync Systems

```bash
node scripts/sync-issue-tracker.cjs sync
```

**What this does:**
- Pushes CSV bugs to GitHub (creates/updates issues)
- Pulls GitHub issues back to CSV
- Adds GitHub issue numbers to CSV records

### 3. Done!

Your bug is now:
- ✅ Tracked in CSV (detailed forensics)
- ✅ Tracked on GitHub (team collaboration)
- ✅ Automatically linked between both

---

## 📁 File Locations

```
propiq/
├── PROPIQ_BUG_TRACKER.csv                  # Local bug database
├── .github/ISSUE_TEMPLATE/
│   ├── bug_report.yml                      # Bug report template
│   └── feature_request.yml                 # Feature template
├── scripts/
│   └── sync-issue-tracker.cjs              # Sync script
├── HYBRID_ISSUE_TRACKING.md                # Full documentation
└── ISSUE_TRACKING_QUICK_START.md           # This file
```

---

## 🔄 Common Commands

```bash
# Sync everything (bidirectional)
node scripts/sync-issue-tracker.cjs sync

# Push local CSV to GitHub
node scripts/sync-issue-tracker.cjs push

# Pull GitHub issues to CSV
node scripts/sync-issue-tracker.cjs pull

# List bugs on GitHub
gh issue list --repo Luntra-HQ/propiq --label bug

# Search CSV locally
grep "DealCalculator" PROPIQ_BUG_TRACKER.csv

# Create issue from template
gh issue create --repo Luntra-HQ/propiq --template bug_report.yml
```

---

## 📊 CSV Format Quick Reference

| Column | Example |
|--------|---------|
| Bug ID | BUG-001 |
| GitHub Issue | #42 |
| Date First Reported | 2026-01-04 |
| Error Type | React Error #185 |
| Component | DealCalculatorV3 |
| Status | FIXED / INVESTIGATING / OPEN |
| Fix Commit | a1b2c3d |

**Full format:** See [HYBRID_ISSUE_TRACKING.md](HYBRID_ISSUE_TRACKING.md#csv-format)

---

## ⚡ Workflow Examples

### Example 1: Quick Bug Fix

```bash
# 1. User reports via Sentry → GitHub issue created automatically
# 2. Pull to local CSV
node scripts/sync-issue-tracker.cjs pull

# 3. Investigate, add root cause to CSV
vim PROPIQ_BUG_TRACKER.csv

# 4. Fix bug, commit
git commit -m "fix: null check for price" -m "Fixes #42"

# 5. Update CSV with fix commit hash and status=FIXED
# 6. Sync back to GitHub
node scripts/sync-issue-tracker.cjs push
```

GitHub issue #42 is now automatically closed with fix details!

---

### Example 2: Feature Request

```bash
# 1. Create feature request on GitHub
gh issue create --repo Luntra-HQ/propiq --template feature_request.yml

# 2. Pull to CSV for tracking
node scripts/sync-issue-tracker.cjs pull

# 3. Implement feature
# 4. Update CSV and sync
node scripts/sync-issue-tracker.cjs push
```

---

## 🎯 Best Practices

**Use CSV for:**
- Detailed root cause analysis
- File-level forensics
- Quick local searches

**Use GitHub for:**
- Team collaboration
- PR/commit linking
- Public visibility

**Sync frequency:**
- After fixing bugs
- Before/after team meetings
- Daily (can automate with cron)

---

## 🔍 Search Tips

**CSV:**
```bash
# All critical bugs
grep "critical" PROPIQ_BUG_TRACKER.csv

# All open bugs
grep "OPEN" PROPIQ_BUG_TRACKER.csv

# Bugs in specific component
grep "DealCalculator" PROPIQ_BUG_TRACKER.csv
```

**GitHub:**
```bash
# All open bugs
gh issue list --label bug --state open

# P1 bugs
gh issue list --label p1-high

# Fixed this week
gh issue list --label bug --state closed --search "closed:>=2026-01-01"
```

---

## 🚨 Troubleshooting

**"gh: command not found"**
```bash
brew install gh
gh auth login
```

**"CSV parse error"**
- Ensure fields with commas are quoted: `"file1.tsx, file2.tsx"`

**"Label not found"**
```bash
# Create missing label
gh label create "p3-low" --repo Luntra-HQ/propiq --color "CCCCCC"
```

**Sync conflicts**
```bash
# Backup first
cp PROPIQ_BUG_TRACKER.csv PROPIQ_BUG_TRACKER_BACKUP.csv

# Force pull from GitHub
node scripts/sync-issue-tracker.cjs pull
```

---

## 📚 Full Documentation

See [HYBRID_ISSUE_TRACKING.md](HYBRID_ISSUE_TRACKING.md) for:
- Complete CSV format
- Automation setup (cron, GitHub Actions)
- Advanced analytics
- Security best practices

---

## ✅ Setup Checklist

- [x] GitHub CLI installed (`brew install gh`)
- [x] Authenticated (`gh auth login`)
- [x] Issue templates created (`.github/ISSUE_TEMPLATE/`)
- [x] Sync script ready (`scripts/sync-issue-tracker.cjs`)
- [x] CSV initialized (`PROPIQ_BUG_TRACKER.csv`)
- [ ] First sync test (`node scripts/sync-issue-tracker.cjs sync`)
- [ ] Set up daily cron (optional)
- [ ] Connect Sentry → GitHub (optional)

---

**Questions?** Read [HYBRID_ISSUE_TRACKING.md](HYBRID_ISSUE_TRACKING.md) or open an issue!

**Last Updated:** January 4, 2026
