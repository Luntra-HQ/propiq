# ShadCN Phase 2 Migration Roadmap

**Project:** PropIQ - Design System Enhancement
**Phase:** 2 - High-Impact Component Replacements
**Started:** January 3, 2026
**Estimated Completion:** January 24, 2026 (3 weeks)

---

## Executive Summary

Phase 1 (Foundation) is **COMPLETE** ✅. This roadmap outlines Phase 2: replacing custom/HTML components with accessible ShadCN primitives while maintaining PropIQ's glassmorphism aesthetic.

**Goals:**
- 🎯 Improve form handling with validation
- 📱 Enhance mobile UX with Sheet component
- ⌨️ Better keyboard navigation with Command palette
- 📊 Professional data tables for analysis history
- ♿ Achieve WCAG 2.1 AA accessibility compliance

**Expected Impact:**
- Development speed: +35-40%
- UX quality: +45-50%
- Accessibility score: +60%

---

## Phase 2 Component Additions

### Tier 1: Critical (Week 1)

#### 1. Form Component ⭐⭐⭐⭐⭐
**Priority:** HIGHEST
**Status:** Pending
**Estimated Time:** 2 days

**Installation:**
```bash
cd frontend
npx shadcn@latest add form
```

**Affected Files:**
- `src/components/DealCalculator.tsx` (Lines 23-400+)
- `src/pages/LoginPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/components/AuthModalV2.tsx`
- `src/components/SignupFlow.tsx`

**Benefits:**
- React Hook Form + Zod validation
- Real-time error messages
- Better accessibility (ARIA labels auto-added)
- Consistent error handling
- Form state management

**Implementation Steps:**
1. Install form component
2. Create `GlassForm.tsx` wrapper with glass styling
3. Create form schemas with Zod (DealCalculator, Auth, Settings)
4. Migrate DealCalculator inputs (biggest impact)
5. Migrate auth forms
6. Add validation rules and error messages

**Success Metrics:**
- [ ] All forms have validation
- [ ] Error messages display properly
- [ ] Keyboard navigation works
- [ ] Screen reader announces errors
- [ ] Glass styling applied consistently

---

#### 2. Sheet Component ⭐⭐⭐⭐⭐
**Priority:** HIGH
**Status:** Pending
**Estimated Time:** 1 day

**Installation:**
```bash
npx shadcn@latest add sheet
```

**Use Cases:**
- Mobile navigation drawer
- Advanced filters panel (DealCalculator scenarios)
- Quick settings drawer
- Property details slide-over
- Help/documentation panel

**Affected Files:**
- Navigation/header component (mobile menu)
- `src/components/DealCalculator.tsx` (advanced filters)
- `src/pages/SettingsPage.tsx` (mobile settings drawer)

**Benefits:**
- Better mobile UX than Dialog
- Slide-in animation from edges
- Focus trap and accessibility built-in
- Less intrusive than modals

**Implementation Steps:**
1. Install sheet component
2. Create mobile navigation drawer
3. Replace mobile Dialog usage with Sheet
4. Add filters panel for DealCalculator
5. Test on mobile devices

**Success Metrics:**
- [ ] Mobile navigation works smoothly
- [ ] Sheet slides in from correct edge
- [ ] Focus returns properly on close
- [ ] Esc key closes sheet
- [ ] Glass backdrop styling applied

---

#### 3. Checkbox & Radio Group ⭐⭐⭐⭐
**Priority:** HIGH
**Status:** Pending
**Estimated Time:** 1 day

**Installation:**
```bash
npx shadcn@latest add checkbox radio-group
```

**Affected Files:**
- `src/pages/SettingsPage.tsx` (notification preferences)
- `src/components/DealCalculator.tsx` (property type selection)
- Any multi-select filters

**Benefits:**
- Proper ARIA roles
- Keyboard navigation (Space to toggle)
- Better visual states (checked, indeterminate)
- Form integration

**Implementation Steps:**
1. Install components
2. Replace Settings page toggles
3. Add property type selector in DealCalculator
4. Style with glass aesthetic
5. Test keyboard and screen reader

**Success Metrics:**
- [ ] Settings toggles work properly
- [ ] Space bar toggles checkboxes
- [ ] Focus indicators visible
- [ ] State persists correctly

---

### Tier 2: High Value (Week 2)

#### 4. Command Component ⭐⭐⭐⭐
**Priority:** MEDIUM-HIGH
**Status:** Pending
**Estimated Time:** 1 day

**Installation:**
```bash
npx shadcn@latest add command
```

**Replaces:**
- `src/components/ui/CommandPalette.tsx` (custom implementation)

**Benefits:**
- Better fuzzy search
- Command groups
- Keyboard shortcuts (⌘K / Ctrl+K)
- Recent commands history
- Action palette for power users

**Implementation Steps:**
1. Install command component
2. Migrate CommandPalette.tsx logic
3. Add command groups (Navigation, Analysis, Settings)
4. Implement keyboard shortcut (⌘K)
5. Add glass styling
6. Remove old CommandPalette.tsx

**Success Metrics:**
- [ ] ⌘K opens command palette
- [ ] Fuzzy search works
- [ ] Arrow keys navigate
- [ ] Enter executes command
- [ ] Recent commands show first

---

#### 5. Data Table Component ⭐⭐⭐⭐
**Priority:** MEDIUM-HIGH
**Status:** Pending
**Estimated Time:** 3 days

**Installation:**
```bash
npx shadcn@latest add table
```

**Use Cases:**
- Property analysis history page
- Saved deals comparison
- Admin dashboard user table
- Export data to CSV/Excel

**Affected Files:**
- New: `src/pages/AnalysisHistoryPage.tsx`
- `src/pages/AdminDashboard.tsx`

**Benefits:**
- Sortable columns
- Filterable data
- Pagination
- Row selection
- Export functionality

**Implementation Steps:**
1. Install table component
2. Create AnalysisHistoryPage.tsx
3. Fetch analysis data from Convex
4. Implement sorting and filtering
5. Add pagination
6. Add export to CSV button
7. Style with glass cards container

**Success Metrics:**
- [ ] Table displays analysis history
- [ ] Sorting works on all columns
- [ ] Filters apply correctly
- [ ] Pagination works smoothly
- [ ] Export downloads CSV
- [ ] Responsive on mobile

---

#### 6. Calendar & Date Picker ⭐⭐⭐⭐
**Priority:** MEDIUM
**Status:** Pending
**Estimated Time:** 2 days

**Installation:**
```bash
npx shadcn@latest add calendar date-picker
```

**Use Cases:**
- Date range filtering for analysis history
- Schedule property viewings
- Subscription renewal dates display
- Trial expiration countdown

**Affected Files:**
- `src/pages/AnalysisHistoryPage.tsx` (date range filter)
- `src/components/TrialCountdown.tsx` (calendar display)

**Benefits:**
- Date range selection
- Keyboard navigation (arrow keys)
- Accessible date input
- Customizable date constraints

**Implementation Steps:**
1. Install components
2. Add date range filter to AnalysisHistoryPage
3. Integrate with table filtering
4. Add glass styling to calendar popover
5. Test keyboard navigation

**Success Metrics:**
- [ ] Calendar opens on click
- [ ] Date range selection works
- [ ] Table filters by date range
- [ ] Keyboard navigation functional
- [ ] Mobile-friendly date picker

---

### Tier 3: Nice to Have (Week 3)

#### 7. Hover Card ⭐⭐⭐
**Priority:** MEDIUM-LOW
**Status:** Pending
**Estimated Time:** 1 day

**Installation:**
```bash
npx shadcn@latest add hover-card
```

**Use Cases:**
- Rich tooltips for metrics (DealCalculator)
- User profile previews
- Property detail previews in tables

**Implementation Steps:**
1. Install hover-card
2. Replace basic Tooltip with HoverCard for complex content
3. Add metric explanations in DealCalculator
4. Style with glass aesthetic

---

#### 8. Collapsible ⭐⭐⭐
**Priority:** LOW
**Status:** Pending
**Estimated Time:** 0.5 days

**Installation:**
```bash
npx shadcn@latest add collapsible
```

**Use Cases:**
- FAQ page (FAQPage.tsx) - expandable questions
- Advanced settings sections
- DealCalculator advanced options

**Affected Files:**
- `src/pages/FAQPage.tsx`
- `src/components/DealCalculator.tsx`

---

#### 9. Avatar ⭐⭐
**Priority:** LOW
**Status:** Pending
**Estimated Time:** 0.5 days

**Installation:**
```bash
npx shadcn@latest add avatar
```

**Use Cases:**
- User profile display
- Comments/testimonials
- Admin dashboard user list

---

#### 10. Context Menu ⭐⭐
**Priority:** LOW
**Status:** Pending
**Estimated Time:** 1 day

**Installation:**
```bash
npx shadcn@latest add context-menu
```

**Use Cases:**
- Right-click actions on saved properties
- Quick actions in analysis table
- Power user shortcuts

---

## Figma MCP Integration

**Priority:** HIGH (Parallel to Phase 2)
**Status:** Pending
**Estimated Time:** 1 day setup + ongoing sync

### Setup Process

```bash
# Initialize MCP
cd frontend
npx shadcn@latest mcp init

# Configure Figma API connection
# Requires: Figma API key from account settings
```

### Benefits

1. **Design Token Sync**
   - Auto-sync colors from Figma to Tailwind config
   - Keep typography scale in sync
   - Update spacing tokens automatically

2. **Component Export**
   - Pull component specs from Figma
   - Generate React components with props
   - Maintain design-dev parity

3. **Version Control**
   - Track design changes in git
   - Get notified of Figma updates
   - Review design changes like code

### Implementation Steps

1. Get Figma API key (Personal Access Token)
2. Run `npx shadcn@latest mcp init`
3. Connect to PropIQ Figma file
4. Configure sync settings
5. Run initial sync
6. Set up CI/CD to check for design drift
7. Document workflow for team

### Success Metrics
- [ ] MCP server running
- [ ] Connected to Figma file
- [ ] Design tokens synced to Tailwind config
- [ ] Component specs accessible in Claude Code
- [ ] Team trained on workflow

---

## File Refactoring Targets

### High Priority

#### 1. DealCalculator.tsx (Lines 1-600+)
**Impact:** 🔥🔥🔥🔥🔥
**Complexity:** High
**Estimated Time:** 2 days

**Current Issues:**
- Raw HTML inputs (no validation)
- Poor accessibility (missing labels)
- No error handling
- Manual state management

**Refactor Plan:**
1. Create Zod schema for all inputs
2. Wrap in Form component
3. Replace inputs with FormField + Input
4. Add validation rules
5. Add error messages
6. Improve mobile layout with Sheet for advanced options

**Before:**
```tsx
<input
  type="number"
  value={inputs.purchasePrice}
  onChange={(e) => updateInput('purchasePrice', parseFloat(e.target.value))}
/>
```

**After:**
```tsx
<FormField
  control={form.control}
  name="purchasePrice"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Purchase Price</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="$500,000"
          className="bg-surface-200 border-glass-border"
          {...field}
        />
      </FormControl>
      <FormDescription>
        Enter the total purchase price of the property
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

#### 2. SettingsPage.tsx
**Impact:** 🔥🔥🔥🔥
**Complexity:** Medium
**Estimated Time:** 1 day

**Current Issues:**
- Custom toggle switches
- No form validation
- Poor mobile UX

**Refactor Plan:**
1. Add Form component
2. Replace toggles with Checkbox
3. Add RadioGroup for single-select options
4. Mobile drawer with Sheet
5. Add validation for email, password changes

---

#### 3. LoginPage.tsx / AuthModalV2.tsx
**Impact:** 🔥🔥🔥🔥
**Complexity:** Medium
**Estimated Time:** 1 day

**Current Issues:**
- Basic HTML forms
- Manual validation
- No error states

**Refactor Plan:**
1. Create auth schemas with Zod (email, password rules)
2. Use Form component
3. Add proper error messages
4. Loading states with Button component
5. Better keyboard flow

---

#### 4. AdminDashboard.tsx
**Impact:** 🔥🔥🔥
**Complexity:** High
**Estimated Time:** 2 days

**Current Issues:**
- Basic table implementation
- No sorting/filtering
- Not responsive

**Refactor Plan:**
1. Add Data Table component
2. Implement sorting, filtering, search
3. Add pagination
4. Export to CSV
5. Responsive design

---

### Medium Priority

- `src/pages/FAQPage.tsx` - Add Collapsible for FAQ items
- `src/components/HelpCenter.tsx` - Add Command for search
- `src/components/OnboardingChecklist.tsx` - Add Checkbox

---

## Phase 2 Timeline

### Week 1: Critical Forms (Jan 6-10)
- **Day 1-2:** Install Form, create GlassForm wrapper, refactor DealCalculator
- **Day 3:** Migrate LoginPage and AuthModal
- **Day 4:** Migrate SettingsPage, add Sheet component
- **Day 5:** Add Checkbox/RadioGroup, testing

**Deliverables:**
- ✅ Form component integrated
- ✅ DealCalculator fully validated
- ✅ All auth forms improved
- ✅ Settings page with proper form controls

---

### Week 2: Mobile & Data (Jan 13-17)
- **Day 1:** Install Command component, replace CommandPalette
- **Day 2:** Add Data Table component
- **Day 3:** Build AnalysisHistoryPage with table
- **Day 4:** Add Calendar/DatePicker, date range filtering
- **Day 5:** Testing and bug fixes

**Deliverables:**
- ✅ Command palette upgraded
- ✅ Analysis history table built
- ✅ Date filtering functional
- ✅ Mobile UX improved

---

### Week 3: Polish & Figma (Jan 20-24)
- **Day 1:** Initialize Figma MCP
- **Day 2:** Sync design tokens, test workflow
- **Day 3:** Add nice-to-have components (HoverCard, Collapsible, Avatar)
- **Day 4:** Accessibility audit, keyboard testing
- **Day 5:** Documentation, final testing, deployment

**Deliverables:**
- ✅ Figma MCP connected
- ✅ Design tokens synced
- ✅ All Phase 2 components added
- ✅ Accessibility score 95+
- ✅ Documentation complete

---

## Success Criteria

### Technical
- [ ] All Tier 1 components installed and integrated
- [ ] Form validation on all user inputs
- [ ] Lighthouse Accessibility score: 95+
- [ ] No console errors or warnings
- [ ] Mobile responsive (tested on iPhone SE, iPad)
- [ ] Keyboard navigation works on all interactive elements

### User Experience
- [ ] Forms provide clear error messages
- [ ] Loading states on all async actions
- [ ] Smooth animations and transitions
- [ ] No layout shifts (CLS < 0.1)
- [ ] Fast page loads (LCP < 2.5s)

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Screen reader tested (VoiceOver, NVDA)
- [ ] Keyboard-only navigation tested
- [ ] Color contrast ratios meet standards
- [ ] Focus indicators visible

### Development
- [ ] Components well-documented
- [ ] TypeScript strict mode passing
- [ ] No linting errors
- [ ] Git commits follow convention
- [ ] All tests passing

---

## Risk Mitigation

### Risk 1: Breaking Existing Features
**Mitigation:**
- Test thoroughly before replacing components
- Keep old components until new ones are verified
- Use feature flags for gradual rollout
- Maintain backward compatibility during transition

### Risk 2: Design Inconsistency
**Mitigation:**
- Always apply glass styling classes to ShadCN components
- Create wrapper components (GlassForm, GlassSheet, etc.)
- Review all components with design checklist
- Use Figma MCP to verify against designs

### Risk 3: Timeline Slippage
**Mitigation:**
- Focus on Tier 1 components first (highest ROI)
- Nice-to-have components can be deferred
- Daily progress tracking
- Flexible scope (can move Tier 3 to Phase 3)

### Risk 4: Accessibility Regressions
**Mitigation:**
- Test with screen readers after each change
- Run Axe DevTools on every page
- Keyboard navigation testing checklist
- Automated accessibility tests in CI/CD

---

## Resources

### Documentation
- [ShadCN UI Components](https://ui.shadcn.com/docs/components)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [React Hook Form](https://react-hook-form.com/get-started)
- [Zod Validation](https://zod.dev/)

### Internal Docs
- `frontend/DESIGN_SYSTEM.md` - Hybrid design system guide
- `frontend/components.json` - ShadCN configuration
- `tailwind.config.ts` - Design tokens

### Tools
- **Figma:** PropIQ design files
- **ShadCN CLI:** Component installation
- **Lighthouse:** Performance and accessibility audits
- **Axe DevTools:** Accessibility scanning

---

## Next Steps (Immediate Actions)

### Today (January 3, 2026)
1. ✅ Create this roadmap document
2. ⏳ Create GitHub issues for all Phase 2 tasks
3. ⏳ Install Form component
4. ⏳ Create GlassForm wrapper
5. ⏳ Start DealCalculator refactor

### Tomorrow (January 4, 2026)
1. Complete DealCalculator form migration
2. Test validation and error states
3. Update DealCalculator tests
4. Create Zod schemas for all calculator fields

---

## GitHub Issues Template

Issues will be created with the following structure:

**Title Format:** `[Phase 2] Component: Brief Description`
**Labels:** `enhancement`, `phase-2`, `shadcn`, `accessibility`

**Template:**
```markdown
## Component
[Form | Sheet | Command | etc.]

## Priority
[High | Medium | Low]

## Estimated Time
[X days]

## Description
[What needs to be done]

## Affected Files
- file1.tsx
- file2.tsx

## Implementation Steps
1. Step 1
2. Step 2

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Related Issues
- #xxx
```

---

## Progress Tracking

**Total Tasks:** 13 component installations + 4 major refactors
**Estimated Hours:** 80-100 hours (2-3 weeks)
**Completed:** 0/17
**In Progress:** 0/17
**Blocked:** 0/17

**Status will be updated daily in:** `frontend/PHASE2_PROGRESS.md`

---

**Document Version:** 1.0
**Last Updated:** January 3, 2026
**Next Review:** January 10, 2026 (End of Week 1)
**Maintainer:** PropIQ Development Team
