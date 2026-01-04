#!/bin/bash

# Script to create GitHub issues for ShadCN Phase 2 Migration
# Run from project root: bash scripts/create-phase2-issues.sh

set -e

echo "🚀 Creating GitHub Issues for ShadCN Phase 2 Migration..."
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Please install it first:"
    echo "   brew install gh"
    echo "   gh auth login"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run:"
    echo "   gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Create labels if they don't exist
echo "📋 Creating labels..."
gh label create "phase-2" --description "ShadCN Phase 2 Migration" --color "8B5CF6" 2>/dev/null || echo "   Label 'phase-2' already exists"
gh label create "shadcn" --description "ShadCN UI Component" --color "6366F1" 2>/dev/null || echo "   Label 'shadcn' already exists"
gh label create "accessibility" --description "Accessibility improvements" --color "10B981" 2>/dev/null || echo "   Label 'accessibility' already exists"
gh label create "dx" --description "Developer Experience" --color "F59E0B" 2>/dev/null || echo "   Label 'dx' already exists"
echo ""

# Create milestone for Phase 2
echo "🎯 Creating Phase 2 milestone..."
gh api repos/:owner/:repo/milestones -f title="ShadCN Phase 2 Migration" -f description="Complete Phase 2 of ShadCN component integration" -f due_on="2026-01-24T00:00:00Z" 2>/dev/null || echo "   Milestone may already exist"
echo ""

# Function to create an issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local milestone="$4"

    echo "Creating: $title"

    if [ -n "$milestone" ]; then
        gh issue create \
            --title "$title" \
            --body "$body" \
            --label "$labels" \
            --milestone "$milestone"
    else
        gh issue create \
            --title "$title" \
            --body "$body" \
            --label "$labels"
    fi

    echo "   ✅ Created"
    echo ""
}

# Issue 1: Form Component
create_issue \
    "[Phase 2] Add ShadCN Form Component" \
    "## Component
Form Component

## Priority
🔥 CRITICAL

## Estimated Time
2 days

## Description
Install and integrate ShadCN Form component with React Hook Form and Zod validation. This is the highest priority component as it affects all user inputs throughout the app.

## Why This Matters
- React Hook Form and Zod are already installed but not integrated
- Raw HTML inputs have no validation
- Missing accessibility features (ARIA labels, error announcements)
- Manual state management is error-prone

## Affected Files
- \`src/components/DealCalculator.tsx\` (Lines 23-400+)
- \`src/pages/LoginPage.tsx\`
- \`src/pages/SettingsPage.tsx\`
- \`src/components/AuthModalV2.tsx\`
- \`src/components/SignupFlow.tsx\`

## Installation
\`\`\`bash
cd frontend
npx shadcn@latest add form
\`\`\`

## Implementation Steps
1. Install Form component
2. Create \`GlassForm.tsx\` wrapper with glass styling
3. Create Zod schemas for DealCalculator fields
4. Replace HTML inputs with FormField + Input components
5. Add validation rules and error messages
6. Test keyboard navigation and screen reader

## Success Criteria
- [ ] Form component installed
- [ ] GlassForm wrapper created with glass aesthetic
- [ ] All inputs have proper ARIA labels
- [ ] Validation errors display correctly
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces errors
- [ ] Glass styling applied consistently

## Related Documentation
- [ShadCN Form Docs](https://ui.shadcn.com/docs/components/form)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- \`frontend/SHADCN_PHASE2_ROADMAP.md\`

## Expected Impact
- Development speed: +40%
- UX quality: +50%
- Accessibility: +60%

## Dependencies
None - this is the foundation for other form improvements" \
    "phase-2,shadcn,accessibility,enhancement" \
    "ShadCN Phase 2 Migration"

# Issue 2: Sheet Component
create_issue \
    "[Phase 2] Add ShadCN Sheet Component" \
    "## Component
Sheet Component

## Priority
🔥 HIGH

## Estimated Time
1 day

## Description
Install Sheet component for mobile navigation drawers and side panels. This will dramatically improve mobile UX compared to the current Dialog-based approach.

## Why This Matters
- Current mobile navigation uses Dialog (not ideal for nav)
- Better mobile UX with slide-in drawers
- Less intrusive than modals
- Native mobile app feel

## Use Cases
- Mobile navigation drawer
- Advanced filters panel (DealCalculator)
- Quick settings drawer
- Property details slide-over

## Installation
\`\`\`bash
cd frontend
npx shadcn@latest add sheet
\`\`\`

## Implementation Steps
1. Install Sheet component
2. Create mobile navigation drawer
3. Replace mobile Dialog usage with Sheet
4. Add filters panel for DealCalculator advanced options
5. Apply glass styling to Sheet backdrop
6. Test on mobile devices (iPhone SE, iPad)

## Success Criteria
- [ ] Sheet component installed
- [ ] Mobile navigation slides in from left
- [ ] Focus trap works correctly
- [ ] Esc key closes sheet
- [ ] Backdrop click closes sheet
- [ ] Glass styling applied
- [ ] Smooth animations

## Related Documentation
- [ShadCN Sheet Docs](https://ui.shadcn.com/docs/components/sheet)
- \`frontend/SHADCN_PHASE2_ROADMAP.md\`

## Expected Impact
- Mobile UX: +40%
- User satisfaction: +35%

## Dependencies
None" \
    "phase-2,shadcn,enhancement,mobile" \
    "ShadCN Phase 2 Migration"

# Issue 3: Command Component
create_issue \
    "[Phase 2] Replace CommandPalette with ShadCN Command" \
    "## Component
Command Component

## Priority
MEDIUM-HIGH

## Estimated Time
1 day

## Description
Replace custom CommandPalette.tsx with ShadCN Command component for better search, keyboard shortcuts, and power user experience.

## Why This Matters
- Custom implementation lacks fuzzy search
- ShadCN version has better UX patterns
- Command groups and recent history
- Industry-standard ⌘K / Ctrl+K shortcut

## Replaces
\`src/components/ui/CommandPalette.tsx\` (custom implementation)

## Installation
\`\`\`bash
cd frontend
npx shadcn@latest add command
\`\`\`

## Implementation Steps
1. Install Command component
2. Migrate CommandPalette.tsx logic
3. Add command groups (Navigation, Analysis, Settings)
4. Implement ⌘K keyboard shortcut
5. Add glass styling to command dialog
6. Test fuzzy search and keyboard navigation
7. Remove old CommandPalette.tsx

## Success Criteria
- [ ] Command component installed
- [ ] ⌘K / Ctrl+K opens palette
- [ ] Fuzzy search works (e.g., 'anls' finds 'Analysis')
- [ ] Arrow keys navigate results
- [ ] Enter executes command
- [ ] Recent commands show first
- [ ] Command groups organized logically
- [ ] Glass aesthetic maintained

## Related Documentation
- [ShadCN Command Docs](https://ui.shadcn.com/docs/components/command)
- \`frontend/SHADCN_PHASE2_ROADMAP.md\`

## Expected Impact
- Power user productivity: +30%
- Keyboard navigation: +40%

## Dependencies
None" \
    "phase-2,shadcn,enhancement,dx" \
    "ShadCN Phase 2 Migration"

# Issue 4: Checkbox & Radio Group
create_issue \
    "[Phase 2] Add Checkbox and RadioGroup Components" \
    "## Components
Checkbox + RadioGroup

## Priority
HIGH

## Estimated Time
1 day

## Description
Add Checkbox and RadioGroup components for proper form controls in Settings page and DealCalculator.

## Why This Matters
- Settings page needs proper toggle controls
- Better accessibility (ARIA roles, keyboard nav)
- Consistent form patterns
- Space bar to toggle (expected behavior)

## Affected Files
- \`src/pages/SettingsPage.tsx\` (notification preferences)
- \`src/components/DealCalculator.tsx\` (property type selection)
- Filter panels

## Installation
\`\`\`bash
cd frontend
npx shadcn@latest add checkbox radio-group
\`\`\`

## Implementation Steps
1. Install components
2. Replace Settings page custom toggles with Checkbox
3. Add RadioGroup for property type selector
4. Apply glass styling
5. Test keyboard navigation (Space, Tab)
6. Test screen reader announcements

## Success Criteria
- [ ] Checkbox component installed
- [ ] RadioGroup component installed
- [ ] Settings toggles use Checkbox
- [ ] Property type uses RadioGroup
- [ ] Space bar toggles checkboxes
- [ ] Tab navigates between controls
- [ ] Focus indicators visible
- [ ] State persists correctly
- [ ] Glass styling applied

## Related Documentation
- [ShadCN Checkbox Docs](https://ui.shadcn.com/docs/components/checkbox)
- [ShadCN RadioGroup Docs](https://ui.shadcn.com/docs/components/radio-group)
- \`frontend/SHADCN_PHASE2_ROADMAP.md\`

## Expected Impact
- Settings UX: +40%
- Accessibility: +50%

## Dependencies
Form component (for integration)" \
    "phase-2,shadcn,accessibility,enhancement" \
    "ShadCN Phase 2 Migration"

# Issue 5: Data Table
create_issue \
    "[Phase 2] Build Analysis History Page with Data Table" \
    "## Component
Data Table (already installed)

## Priority
MEDIUM-HIGH

## Estimated Time
3 days

## Description
Build a comprehensive Analysis History page using the already-installed ShadCN Table component. Add sorting, filtering, pagination, and CSV export.

## Why This Matters
- Users need to view past property analyses
- Compare different properties
- Track analysis usage (subscription limits)
- Export data for external use

## New Files to Create
- \`src/pages/AnalysisHistoryPage.tsx\`
- \`src/components/AnalysisTable.tsx\`
- \`src/utils/tableExport.ts\`

## Affected Files
- \`src/pages/AdminDashboard.tsx\` (use table for user list)

## Installation
Already installed: \`npx shadcn@latest add table\`

## Implementation Steps
1. Create AnalysisHistoryPage.tsx
2. Fetch analysis data from Convex
3. Implement sorting (by date, score, property name)
4. Add filtering (by date range, score range, property type)
5. Add pagination (20 items per page)
6. Add 'Export to CSV' button
7. Style table container with GlassCard
8. Test on mobile (responsive table)

## Features Required
- **Sortable columns:** Date, Property, Score, Status
- **Filters:** Date range, score range (0-100), property type
- **Pagination:** 20 items per page, page numbers
- **Row actions:** View details, Edit, Delete, Share
- **Export:** Download as CSV
- **Search:** Filter by property address

## Success Criteria
- [ ] AnalysisHistoryPage created and accessible
- [ ] Table displays analysis data correctly
- [ ] Sorting works on all columns
- [ ] Filters apply correctly
- [ ] Pagination works smoothly
- [ ] Export downloads CSV file
- [ ] Responsive on mobile (horizontal scroll or cards)
- [ ] Glass styling on container
- [ ] Loading states show skeleton
- [ ] Empty state when no data

## Related Documentation
- [ShadCN Table Docs](https://ui.shadcn.com/docs/components/table)
- [TanStack Table](https://tanstack.com/table/v8) (for advanced features)
- \`frontend/SHADCN_PHASE2_ROADMAP.md\`

## Expected Impact
- User retention: +25%
- Data utility: +45%

## Dependencies
- Calendar/DatePicker (for date range filtering)" \
    "phase-2,shadcn,enhancement,feature" \
    "ShadCN Phase 2 Migration"

# Issue 6: Calendar & Date Picker
create_issue \
    "[Phase 2] Add Calendar and Date Picker Components" \
    "## Components
Calendar + DatePicker

## Priority
MEDIUM

## Estimated Time
2 days

## Description
Add Calendar and DatePicker components for date range filtering in Analysis History and other date-related features.

## Why This Matters
- Filter analysis history by date range
- Better UX than text input for dates
- Keyboard accessible date selection
- Mobile-friendly date picker

## Use Cases
- Date range filter in AnalysisHistoryPage
- Subscription renewal date display
- Trial expiration countdown
- Schedule property viewings (future)

## Installation
\`\`\`bash
cd frontend
npx shadcn@latest add calendar date-picker
\`\`\`

## Implementation Steps
1. Install components
2. Add date range filter to AnalysisHistoryPage
3. Integrate with table filtering logic
4. Apply glass styling to calendar popover
5. Test keyboard navigation (arrow keys)
6. Test mobile date picker
7. Add date presets (Last 7 days, Last 30 days, All time)

## Success Criteria
- [ ] Calendar component installed
- [ ] DatePicker component installed
- [ ] Date range filter works in AnalysisHistoryPage
- [ ] Calendar opens on click
- [ ] Arrow keys navigate dates
- [ ] Enter selects date
- [ ] Esc closes calendar
- [ ] Date presets available
- [ ] Mobile-friendly picker
- [ ] Glass styling applied

## Related Documentation
- [ShadCN Calendar Docs](https://ui.shadcn.com/docs/components/calendar)
- [ShadCN DatePicker Docs](https://ui.shadcn.com/docs/components/date-picker)
- \`frontend/SHADCN_PHASE2_ROADMAP.md\`

## Expected Impact
- Filtering UX: +40%
- Mobile date selection: +50%

## Dependencies
None (but integrates with Data Table)" \
    "phase-2,shadcn,enhancement" \
    "ShadCN Phase 2 Migration"

# Issue 7: Figma MCP Integration
create_issue \
    "[Phase 2] Initialize Figma MCP Integration" \
    "## Feature
Figma MCP (Model Context Protocol) Integration

## Priority
HIGH (Parallel to Phase 2)

## Estimated Time
1 day setup + ongoing sync

## Description
Initialize ShadCN's built-in Figma MCP integration to enable design-to-code automation, design token sync, and streamlined designer-developer collaboration.

## Why This Matters
- **30-40% faster** design-to-code workflow
- Eliminate design drift
- Auto-sync design tokens (colors, spacing, typography)
- Pull component specs directly from Figma
- Claude Code can access Figma designs directly

## Installation
\`\`\`bash
cd frontend
npx shadcn@latest mcp init
\`\`\`

## Prerequisites
- [ ] Figma Pro/Org account (for API access)
- [ ] Figma API key (Personal Access Token)
- [ ] PropIQ Figma file URL

## Implementation Steps
1. Get Figma API key from Figma account settings
2. Run \`npx shadcn@latest mcp init\`
3. Connect to PropIQ Figma file
4. Configure sync settings (what to sync, how often)
5. Run initial sync
6. Verify design tokens in Tailwind config
7. Document workflow for team
8. Set up CI/CD check for design drift
9. Test Claude Code Figma integration

## Features to Enable
- **Design Token Sync:** Colors, typography, spacing → Tailwind config
- **Component Export:** Pull component specs from Figma
- **Version Control:** Track design changes in git
- **Claude Code Integration:** Ask Claude to pull latest designs

## Success Criteria
- [ ] MCP server initialized
- [ ] Connected to Figma file
- [ ] Design tokens synced to \`tailwind.config.ts\`
- [ ] Can pull component specs
- [ ] Claude Code can access Figma designs
- [ ] Team trained on workflow
- [ ] Documentation updated

## Documentation Needed
- How to get Figma API key
- How to sync design tokens
- How to pull component specs
- How to use in Claude Code
- Troubleshooting guide

## Related Documentation
- [ShadCN MCP Docs](https://ui.shadcn.com/docs/cli#mcp)
- [Figma API Docs](https://www.figma.com/developers/api)
- \`frontend/SHADCN_PHASE2_ROADMAP.md\`

## Expected Impact
- Design-to-code speed: +35%
- Design drift: -90%
- Designer-developer handoff time: -50%

## Dependencies
None (runs in parallel)" \
    "phase-2,dx,enhancement,design" \
    "ShadCN Phase 2 Migration"

# Issue 8: DealCalculator Refactor
create_issue \
    "[Phase 2] Refactor DealCalculator with Form Component" \
    "## Component
DealCalculator.tsx (major refactor)

## Priority
🔥 CRITICAL

## Estimated Time
2 days

## Description
Complete refactor of DealCalculator.tsx to use ShadCN Form component with React Hook Form and Zod validation. This is the highest-impact refactor in Phase 2.

## Current Issues
- 400+ lines with raw HTML inputs
- No validation
- Poor accessibility (missing ARIA labels)
- Manual state management
- No error handling
- Difficult to maintain

## After Refactor
- React Hook Form state management
- Zod schema validation
- Proper ARIA labels
- Error messages
- Better code organization
- Easier to maintain

## Files to Modify
- \`src/components/DealCalculator.tsx\` (main file)
- Create \`src/schemas/dealCalculatorSchema.ts\` (Zod schema)
- Create \`src/components/DealCalculatorForm.tsx\` (form wrapper)

## Implementation Steps
1. **Create Zod Schema** (Day 1 morning)
   - Define schema for all calculator fields
   - Add validation rules (min/max, required fields)
   - Add custom error messages

2. **Wrap in Form Component** (Day 1 afternoon)
   - Import Form from ShadCN
   - Use useForm hook with Zod resolver
   - Set up form state

3. **Replace HTML Inputs** (Day 2 morning)
   - Replace each input with FormField
   - Add FormLabel, FormControl, FormDescription, FormMessage
   - Apply glass styling

4. **Test & Polish** (Day 2 afternoon)
   - Test all validation rules
   - Test keyboard navigation
   - Test screen reader
   - Fix any styling issues
   - Update tests

## Zod Schema Example
\`\`\`typescript
import { z } from 'zod';

export const dealCalculatorSchema = z.object({
  purchasePrice: z.number()
    .min(1000, 'Purchase price must be at least $1,000')
    .max(100000000, 'Purchase price cannot exceed $100M'),
  downPaymentPercent: z.number()
    .min(0, 'Down payment cannot be negative')
    .max(100, 'Down payment cannot exceed 100%'),
  interestRate: z.number()
    .min(0, 'Interest rate cannot be negative')
    .max(30, 'Interest rate seems unusually high'),
  // ... all other fields
});
\`\`\`

## Success Criteria
- [ ] Zod schema created with all validation rules
- [ ] Form component wraps calculator
- [ ] All inputs replaced with FormField
- [ ] Validation errors display correctly
- [ ] Real-time validation works
- [ ] Keyboard navigation improved
- [ ] Screen reader announces errors
- [ ] Glass styling maintained
- [ ] Code is well-organized and maintainable
- [ ] Tests updated and passing

## Related Documentation
- [ShadCN Form Docs](https://ui.shadcn.com/docs/components/form)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- \`frontend/SHADCN_PHASE2_ROADMAP.md\`

## Expected Impact
- Code maintainability: +60%
- User error prevention: +80%
- Accessibility: +70%
- Development speed (future changes): +50%

## Dependencies
- Form component must be installed first (Issue #1)" \
    "phase-2,shadcn,accessibility,refactor,critical" \
    "ShadCN Phase 2 Migration"

# Summary
echo ""
echo "✅ Phase 2 GitHub Issues Created Successfully!"
echo ""
echo "📊 Summary:"
echo "   - 8 issues created"
echo "   - Milestone: ShadCN Phase 2 Migration (Due: Jan 24, 2026)"
echo "   - Labels: phase-2, shadcn, accessibility, enhancement, dx"
echo ""
echo "🔗 View issues:"
echo "   gh issue list --label phase-2"
echo ""
echo "📋 View milestone:"
echo "   gh issue list --milestone \"ShadCN Phase 2 Migration\""
echo ""
echo "🚀 Ready to start Phase 2!"
