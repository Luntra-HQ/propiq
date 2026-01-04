# PropIQ Hybrid Issue Tracking System

**Created:** January 4, 2026
**Purpose:** Maintain bug/issue records both locally (CSV) and on GitHub (Issues) with automatic synchronization

---

## 🎯 Why Hybrid Tracking?

**Best of Both Worlds:**

### Local CSV Benefits
- ✅ **Detailed forensics** - Full root cause analysis, fix details, affected files
- ✅ **Offline access** - No internet needed
- ✅ **Easy data analysis** - Import to Excel, Google Sheets, or data tools
- ✅ **Permanent record** - Never lost even if GitHub account changes
- ✅ **Fast searching** - grep, awk, or open in spreadsheet

### GitHub Issues Benefits
- ✅ **Collaboration** - Team can comment, assign, discuss
- ✅ **Integration** - Links to PRs, commits, code
- ✅ **Automation** - CI/CD can create/update issues
- ✅ **Sentry integration** - Auto-create issues from errors
- ✅ **Visibility** - Stakeholders can track progress
- ✅ **Project boards** - Visual kanban workflow

**Problem:** Manual syncing is tedious and error-prone
**Solution:** Automated bidirectional sync script

---

## 📁 File Structure

```
propiq/
├── PROPIQ_BUG_TRACKER.csv              # Local bug database (source of truth for forensics)
├── .github/
│   └── ISSUE_TEMPLATE/                 # GitHub issue templates
│       ├── bug_report.yml              # Bug report form
│       ├── feature_request.yml         # Feature request form
│       └── config.yml                  # Template configuration
├── scripts/
│   └── sync-issue-tracker.js           # Bidirectional sync script
└── HYBRID_ISSUE_TRACKING.md            # This documentation
```

---

## 🔄 How the Sync Works

### Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│  Local CSV File     │  sync   │  GitHub Issues      │
│  PROPIQ_BUG_TRACKER │ ◄─────► │  (Luntra-HQ/propiq) │
│                     │         │                     │
│  - Detailed data    │         │  - Collaboration    │
│  - Root cause       │         │  - PR links         │
│  - Forensics        │         │  - Comments         │
└─────────────────────┘         └─────────────────────┘
         ▲                               ▲
         │                               │
         └───────── sync-issue-tracker.js ───────┘
```

### Sync Modes

**1. PUSH (Local → GitHub)**
- Reads `PROPIQ_BUG_TRACKER.csv`
- Creates/updates GitHub issues
- Updates CSV with GitHub issue numbers

**2. PULL (GitHub → Local)**
- Fetches all GitHub issues (labeled `bug`)
- Converts to CSV format
- Merges with existing local records (keeps detailed data)

**3. SYNC (Bidirectional)**
- Runs PUSH then PULL
- Ensures both systems are in sync

---

## 🚀 Quick Start

### 1. Report a Bug

**Option A: GitHub Issue (Recommended for team collaboration)**
```bash
# Via GitHub web UI
1. Go to https://github.com/Luntra-HQ/propiq/issues/new/choose
2. Click "Bug Report"
3. Fill out the form (all fields auto-structured)
4. Submit

# Via gh CLI
gh issue create --repo Luntra-HQ/propiq --template bug_report.yml
```

**Option B: Direct CSV Entry (For quick local tracking)**
```csv
Bug ID,GitHub Issue,Date First Reported,...
BUG-002,,2026-01-05,...
```

### 2. Sync Systems

```bash
# Run sync (bidirectional)
node scripts/sync-issue-tracker.js sync

# Or use specific direction
node scripts/sync-issue-tracker.js push   # Local → GitHub
node scripts/sync-issue-tracker.js pull   # GitHub → Local
```

### 3. Track Progress

**In GitHub:**
- Comment on issues
- Link PRs with fixes
- Close when resolved

**In CSV:**
- Update `Status` column
- Add `Fix Commit` hash
- Fill in `Root Cause` after investigation

### 4. Sync Again

```bash
node scripts/sync-issue-tracker.js sync
```

CSV now has GitHub issue numbers, GitHub has detailed forensics!

---

## 📊 CSV Format

### Columns

| Column | Description | Example |
|--------|-------------|---------|
| **Bug ID** | Unique identifier (BUG-XXX) | BUG-001 |
| **GitHub Issue** | GitHub issue number | #42 |
| **Date First Reported** | When bug was first discovered | 2026-01-04 |
| **Date Last Reported** | When bug was last seen | 2026-01-04 |
| **Occurrences** | Number of times reported | 5 |
| **Error Type** | High-level error category | React Error #185 |
| **Error Message** | Exact error message | Maximum update depth exceeded |
| **Component** | Affected component(s) | DealCalculatorV3 |
| **User Impact** | How users are affected | Site crashes completely |
| **Root Cause** | Technical cause (after investigation) | TooltipProvider nested incorrectly |
| **Status** | Current status | FIXED / INVESTIGATING / OPEN |
| **Fix Commit** | Git commit hash that fixed it | 61aeea3 |
| **Resolution Date** | When bug was fixed | 2026-01-04 |
| **Files Affected** | List of files changed | frontend/src/components/X.tsx |
| **Notes** | Additional context | Pattern: nested providers cause infinite loop |

### Example Record

```csv
BUG-001,#42,2026-01-04,2026-01-04,2,React Error #185,Maximum update depth exceeded,DealCalculatorV3,Site crashes completely,TooltipProvider nested incorrectly,FIXED,61aeea3,2026-01-04,frontend/src/components/DealCalculatorV3.tsx,Fixed by moving TooltipProvider to root
```

---

## 🎯 Workflow Examples

### Example 1: User Reports Bug

**Step 1: User reports via Sentry**
- Sentry auto-creates GitHub issue #45
- Title: "TypeError: Cannot read property 'price' of undefined"
- Labels: `bug`, `sentry`, `p1-high`

**Step 2: Developer investigates**
```bash
# Pull latest issues to local CSV
node scripts/sync-issue-tracker.js pull
```

**Step 3: Developer adds forensics to CSV**
```csv
BUG-002,#45,2026-01-05,2026-01-05,1,TypeError,Cannot read property 'price' of undefined,PricingPage,Users cannot view pricing,Missing null check in Stripe price fetch,INVESTIGATING,,,frontend/src/components/PricingPage.tsx,Occurs when Stripe API returns null
```

**Step 4: Developer fixes bug**
```bash
git commit -m "fix: add null check for Stripe price fetch" -m "Fixes #45"
# Commit hash: abc123
```

**Step 5: Update CSV**
```csv
BUG-002,#45,2026-01-05,2026-01-05,1,TypeError,Cannot read property 'price' of undefined,PricingPage,Users cannot view pricing,Missing null check in Stripe price fetch,FIXED,abc123,2026-01-05,frontend/src/components/PricingPage.tsx,Occurs when Stripe API returns null
```

**Step 6: Sync back to GitHub**
```bash
node scripts/sync-issue-tracker.js push
```

GitHub issue #45 is now updated with:
- Root cause details
- Fix commit hash
- Status changed to FIXED
- Issue automatically closed

---

### Example 2: Feature Request via GitHub

**Step 1: User creates feature request on GitHub**
- Title: "Add tooltips to calculator fields"
- Labels: `enhancement`, `calculator`, `p2-medium`

**Step 2: Pull to local**
```bash
node scripts/sync-issue-tracker.js pull
```

CSV now has record (features use same format as bugs):
```csv
FEAT-001,#46,2026-01-05,2026-01-05,1,Feature Request,Add tooltips to calculator,DealCalculator,Beginners get confused,N/A,OPEN,,,N/A,User wants beginner-friendly explanations
```

**Step 3: Implement feature**
```bash
git commit -m "feat: add tooltips to all calculator fields" -m "Implements #46"
# Commit hash: def456
```

**Step 4: Update CSV and sync**
```csv
FEAT-001,#46,2026-01-05,2026-01-05,1,Feature Request,Add tooltips to calculator,DealCalculator,Beginners get confused,N/A,IMPLEMENTED,def456,2026-01-05,frontend/src/components/DealCalculator.tsx,Added EnhancedTooltip component
```

```bash
node scripts/sync-issue-tracker.js push
```

---

## 🤖 Automation Setup

### Daily Sync (via cron)

**macOS/Linux:**
```bash
# Edit crontab
crontab -e

# Add daily sync at 6 PM
0 18 * * * cd /Users/briandusape/Projects/propiq && node scripts/sync-issue-tracker.js sync >> logs/issue-sync.log 2>&1
```

**Windows (Task Scheduler):**
```powershell
# Create scheduled task
schtasks /create /tn "PropIQ Issue Sync" /tr "node C:\Projects\propiq\scripts\sync-issue-tracker.js sync" /sc daily /st 18:00
```

### GitHub Actions (on push)

Create `.github/workflows/sync-issues.yml`:
```yaml
name: Sync Issue Tracker

on:
  push:
    paths:
      - 'PROPIQ_BUG_TRACKER.csv'
  schedule:
    - cron: '0 18 * * *'  # Daily at 6 PM UTC

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Sync issues
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          node scripts/sync-issue-tracker.js sync
      - name: Commit updated CSV
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add PROPIQ_BUG_TRACKER.csv
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: sync issue tracker with GitHub"
          git push
```

---

## 🔍 Searching & Filtering

### Search CSV Locally

```bash
# Find all critical bugs
grep "critical" PROPIQ_BUG_TRACKER.csv

# Find all open bugs
grep "OPEN" PROPIQ_BUG_TRACKER.csv

# Find bugs in specific component
grep "DealCalculator" PROPIQ_BUG_TRACKER.csv

# Find bugs fixed in last 7 days
awk -F',' '$13 >= "'$(date -v-7d +%Y-%m-%d)'"' PROPIQ_BUG_TRACKER.csv
```

### Search GitHub Issues

```bash
# Find all open bugs
gh issue list --repo Luntra-HQ/propiq --label bug --state open

# Find P1 bugs
gh issue list --repo Luntra-HQ/propiq --label p1-high

# Find bugs in calculator
gh issue list --repo Luntra-HQ/propiq --label calculator --label bug

# Find bugs fixed this week
gh issue list --repo Luntra-HQ/propiq --label bug --state closed --search "closed:>=$(date -v-7d +%Y-%m-%d)"
```

---

## 📈 Analytics & Reporting

### Bug Metrics from CSV

**Count bugs by status:**
```bash
cut -d',' -f11 PROPIQ_BUG_TRACKER.csv | sort | uniq -c
```

**Average time to fix:**
```bash
awk -F',' 'NR>1 {
  if ($3 && $13) {
    start = mktime(gensub(/-/, " ", "g", $3) " 0 0 0");
    end = mktime(gensub(/-/, " ", "g", $13) " 0 0 0");
    days = (end - start) / 86400;
    sum += days;
    count++;
  }
}
END { print "Average days to fix:", sum/count }' PROPIQ_BUG_TRACKER.csv
```

**Bugs by component:**
```bash
cut -d',' -f8 PROPIQ_BUG_TRACKER.csv | tail -n +2 | sort | uniq -c | sort -rn
```

### Import to Google Sheets/Excel

1. Open Google Sheets
2. File → Import → Upload → `PROPIQ_BUG_TRACKER.csv`
3. Create pivot tables, charts, filters

---

## 🛠️ Maintenance

### Update Sync Script

```bash
# Edit sync script
vim scripts/sync-issue-tracker.js

# Test changes
node scripts/sync-issue-tracker.js sync --dry-run  # (if implemented)
```

### Backup CSV

```bash
# Manual backup
cp PROPIQ_BUG_TRACKER.csv backups/PROPIQ_BUG_TRACKER_$(date +%Y%m%d).csv

# Automated daily backup (add to crontab)
0 0 * * * cp /Users/briandusape/Projects/propiq/PROPIQ_BUG_TRACKER.csv /Users/briandusape/Projects/propiq/backups/PROPIQ_BUG_TRACKER_$(date +\%Y\%m\%d).csv
```

### Archive Old Issues

**Move fixed bugs older than 90 days to archive:**
```bash
# Create archive
mkdir -p archive

# Move old bugs (manual)
awk -F',' 'NR==1 || ($13 && $13 < "'$(date -v-90d +%Y-%m-%d)'")' PROPIQ_BUG_TRACKER.csv > archive/PROPIQ_BUG_TRACKER_ARCHIVE_$(date +%Y%m%d).csv

# Keep recent bugs
awk -F',' 'NR==1 || ($13 == "" || $13 >= "'$(date -v-90d +%Y-%m-%d)'")' PROPIQ_BUG_TRACKER.csv > PROPIQ_BUG_TRACKER_ACTIVE.csv
mv PROPIQ_BUG_TRACKER_ACTIVE.csv PROPIQ_BUG_TRACKER.csv
```

---

## 🚨 Troubleshooting

### Sync Script Fails

**Error: "gh: command not found"**
```bash
# Install GitHub CLI
brew install gh  # macOS
# Or visit: https://cli.github.com/

# Authenticate
gh auth login
```

**Error: "CSV parse error"**
```bash
# Check CSV format (must have proper quoting for commas in fields)
head -3 PROPIQ_BUG_TRACKER.csv

# Fix: Ensure fields with commas are quoted
"frontend/src/components/A.tsx, B.tsx"  # Correct
frontend/src/components/A.tsx, B.tsx    # Wrong (breaks CSV)
```

**Error: "GitHub API rate limit"**
```bash
# Check rate limit
gh api rate_limit

# Wait or use authenticated token (higher limit)
gh auth login
```

### Merge Conflicts

**CSV and GitHub out of sync:**
```bash
# Option 1: GitHub is source of truth
node scripts/sync-issue-tracker.js pull --force

# Option 2: CSV is source of truth
node scripts/sync-issue-tracker.js push --force

# Option 3: Manual merge (safest)
# 1. Backup CSV
cp PROPIQ_BUG_TRACKER.csv PROPIQ_BUG_TRACKER_BACKUP.csv

# 2. Pull GitHub data
node scripts/sync-issue-tracker.js pull

# 3. Manually review differences
diff PROPIQ_BUG_TRACKER.csv PROPIQ_BUG_TRACKER_BACKUP.csv

# 4. Merge manually in spreadsheet
```

---

## 📚 Best Practices

### When to Use CSV vs GitHub

**Use CSV for:**
- ✅ Detailed root cause analysis
- ✅ Forensic investigation notes
- ✅ File-level tracking
- ✅ Quick local searches
- ✅ Data analysis (charts, trends)

**Use GitHub Issues for:**
- ✅ Team collaboration
- ✅ Code review integration
- ✅ PR linking
- ✅ Public visibility
- ✅ Automated workflows

### Naming Conventions

**Bug IDs:**
- Format: `BUG-XXX` (zero-padded 3 digits)
- Start at `BUG-001`
- Increment sequentially
- Never reuse IDs

**Feature IDs:**
- Format: `FEAT-XXX`
- Same numbering rules

**Commit Messages:**
- Always reference issue: `Fixes #42` or `Implements #46`
- GitHub auto-links commit to issue

### Status Transitions

```
OPEN → INVESTIGATING → IN_PROGRESS → TESTING → FIXED
  ↓                                              ↓
DUPLICATE                                    WONTFIX
  ↓
CLOSED
```

**Status Definitions:**
- `OPEN` - New bug, not yet investigated
- `INVESTIGATING` - Root cause analysis in progress
- `IN_PROGRESS` - Fix being implemented
- `TESTING` - Fix deployed, needs verification
- `FIXED` - Verified fixed in production
- `DUPLICATE` - Same as another bug
- `WONTFIX` - Not fixing (by design, out of scope, etc.)

---

## 🎯 Quick Reference

### Common Commands

```bash
# Sync everything
node scripts/sync-issue-tracker.js sync

# Push local changes to GitHub
node scripts/sync-issue-tracker.js push

# Pull GitHub issues to CSV
node scripts/sync-issue-tracker.js pull

# Export all issues to CSV
node scripts/sync-issue-tracker.js export

# Create GitHub issue from CLI
gh issue create --repo Luntra-HQ/propiq --template bug_report.yml

# List all open bugs
gh issue list --repo Luntra-HQ/propiq --label bug --state open

# Search CSV for specific bug
grep "BUG-042" PROPIQ_BUG_TRACKER.csv

# Count total bugs
wc -l PROPIQ_BUG_TRACKER.csv
```

### Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:
```bash
# PropIQ issue tracker shortcuts
alias piq-sync='node /Users/briandusape/Projects/propiq/scripts/sync-issue-tracker.js sync'
alias piq-push='node /Users/briandusape/Projects/propiq/scripts/sync-issue-tracker.js push'
alias piq-pull='node /Users/briandusape/Projects/propiq/scripts/sync-issue-tracker.js pull'
alias piq-bugs='gh issue list --repo Luntra-HQ/propiq --label bug'
alias piq-csv='open /Users/briandusape/Projects/propiq/PROPIQ_BUG_TRACKER.csv'
```

---

## 🔐 Security & Privacy

**CSV Contains Sensitive Data:**
- ⚠️ Do NOT commit API keys, secrets, or passwords to CSV
- ⚠️ Do NOT include user emails or PII
- ✅ Use pseudonyms: "User A", "User ID: 12345"
- ✅ Redact sensitive error messages

**GitHub Issue Privacy:**
- Public repo = Issues are public
- Private repo = Issues visible to collaborators only
- Consider which details to include in public issues

**Access Control:**
```bash
# CSV file permissions (readable only by you)
chmod 600 PROPIQ_BUG_TRACKER.csv

# Or readable by team
chmod 640 PROPIQ_BUG_TRACKER.csv
chgrp dev-team PROPIQ_BUG_TRACKER.csv
```

---

## 📖 Related Documentation

- [BUG_TRACKING_STRATEGY.md](BUG_TRACKING_STRATEGY.md) - Overall bug tracking philosophy
- [PRODUCTION_ISSUES_TRACKER.md](PRODUCTION_ISSUES_TRACKER.md) - Active production issues
- [GitHub Issues](https://github.com/Luntra-HQ/propiq/issues) - Live issue tracker
- [Sentry Dashboard](https://sentry.io) - Automated error tracking
- [Clarity Dashboard](https://clarity.microsoft.com/projects/view/tts5hc8zf8) - User session recordings

---

## 🚀 Next Steps

**Immediate Setup (15 min):**
1. ✅ Install GitHub CLI: `brew install gh && gh auth login`
2. ✅ Test sync script: `node scripts/sync-issue-tracker.js sync`
3. ✅ Create first issue: `gh issue create --repo Luntra-HQ/propiq`
4. ✅ Verify CSV updated with GitHub issue number

**Automation (30 min):**
1. Set up daily cron job for auto-sync
2. Configure GitHub Actions workflow
3. Connect Sentry to auto-create GitHub issues
4. Set up CSV backup script

**Long-term:**
1. Build dashboard for bug metrics (Grafana, Metabase, etc.)
2. Create reports for stakeholders
3. Analyze trends (bug rate, time to fix, hot spots)
4. Improve process based on data

---

**Last Updated:** January 4, 2026
**Maintained By:** PropIQ Development Team
**Questions?** Open an issue or check existing docs
