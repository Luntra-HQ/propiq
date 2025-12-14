# PropIQ Hybrid Design System Documentation

**Version:** 2.0 (ShadCN Integration)
**Last Updated:** December 2025
**Maintainer:** PropIQ Development Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Component Library Structure](#component-library-structure)
4. [Color System](#color-system)
5. [Component Usage Guide](#component-usage-guide)
6. [Migration Strategy](#migration-strategy)
7. [Best Practices](#best-practices)
8. [Accessibility](#accessibility)

---

## Overview

PropIQ uses a **hybrid design system** that combines:

1. **Custom PropIQ Components** - Brand-specific glassmorphism components for visual identity
2. **ShadCN UI Components** - Accessible, production-ready primitives built on Radix UI

This approach gives us:
- ✅ **Brand Consistency** - Custom glass aesthetic maintained through PropIQ components
- ✅ **Accessibility** - WCAG 2.1 AA compliant components from ShadCN/Radix UI
- ✅ **Development Speed** - Pre-built complex interactions (forms, dialogs, dropdowns)
- ✅ **Flexibility** - We own the code for both component types

---

## Design Philosophy

### The "Glass-Radix" Principle

> **"Brand where it matters, accessibility everywhere"**

- **Visual Brand Components** (Buttons, Cards, Hero sections) → Use PropIQ Custom Components
- **Interactive Primitives** (Forms, Dialogs, Dropdowns) → Use ShadCN Components (styled with glass aesthetic)
- **Data Display** (Tables, Charts) → Hybrid approach (ShadCN base + glass styling)

### Color Palette

PropIQ operates in **dark mode by default** with a violet/purple accent color scheme inspired by modern fintech and SaaS applications.

**Brand Colors:**
- Primary: Violet-500 (`#8B5CF6`) - Main brand color
- Secondary: Slate-800 - Surface backgrounds
- Accent: Purple-600 - Highlights and CTAs

**Glass Effects:**
- Translucent backgrounds with backdrop blur
- Subtle borders with low opacity
- Layered depth through shadow hierarchy

---

## Component Library Structure

### 📁 Directory Organization

```
src/components/ui/
├── PropIQ Custom Components (PascalCase)
│   ├── Button.tsx              ⭐ Keep - Brand identity
│   ├── GlassCard.tsx           ⭐ Keep - Core glass component
│   ├── Toast.tsx               ⭐ Keep - Custom animations
│   ├── Skeleton.tsx            ⭐ Keep - Loading states
│   ├── BentoGrid.tsx           ⭐ Keep - Layout system
│   ├── DealScore.tsx           ⭐ Keep - Domain-specific
│   ├── AnalysisProgress.tsx    ⭐ Keep - Domain-specific
│   ├── CommandPalette.tsx      ⭐ Keep - Power user feature
│   └── ... (other custom)
│
└── ShadCN Components (lowercase)
    ├── dialog.tsx              ✨ New - Modal overlays
    ├── input.tsx               ✨ New - Form inputs
    ├── label.tsx               ✨ New - Form labels
    ├── select.tsx              ✨ New - Dropdowns
    ├── dropdown-menu.tsx       ✨ New - Action menus
    ├── tabs.tsx                ✨ New - Tabbed interfaces
    ├── tooltip.tsx             ✨ New - Rich tooltips
    ├── card.tsx                ✨ New - Content cards
    └── ... (future additions)
```

### Component Naming Convention

- **PropIQ Custom:** `PascalCase.tsx` (e.g., `Button.tsx`)
- **ShadCN:** `kebab-case.tsx` (e.g., `dropdown-menu.tsx`)

This makes it immediately clear which components are custom vs. ShadCN.

---

## Color System

### CSS Variables (Dual System)

We maintain **two parallel variable systems** for compatibility:

#### PropIQ Variables (Legacy)

```css
:root {
  --color-bg-primary: 15 23 42;      /* slate-900 */
  --color-bg-secondary: 30 41 59;    /* slate-800 */
  --color-text-primary: 249 250 251; /* gray-50 */
  --color-accent: 139 92 246;        /* violet-500 */
}
```

#### ShadCN Variables (New)

```css
:root {
  --background: 222 47% 11%;         /* slate-900 */
  --foreground: 210 40% 98%;         /* gray-50 */
  --primary: 262 83% 58%;            /* violet-500 */
  --border: 217 33% 17%;             /* slate-700 */
  --ring: 262 83% 58%;               /* violet focus ring */
  --radius: 0.75rem;                 /* 12px border radius */
}
```

### Tailwind Classes

Both systems are mapped in `tailwind.config.js`:

```javascript
colors: {
  // PropIQ Glass System
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    DEFAULT: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  // ShadCN System
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
}
```

**Usage:**
- PropIQ components: Use `glass-*` and `surface-*` classes
- ShadCN components: Use semantic classes (`bg-background`, `text-foreground`, `border-border`)

---

## Component Usage Guide

### When to Use PropIQ Custom Components

#### ✅ Button Component
**Use for:** All clickable actions, CTAs, form submissions

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" icon={<CheckIcon />}>
  Analyze Property
</Button>
```

**Variants:** `primary | secondary | ghost | danger | success`
**Why Custom:** Brand-specific micro-interactions, gradient effects, satisfying press feedback

#### ✅ GlassCard Component
**Use for:** Content containers, feature blocks, stat cards

```tsx
import { GlassCard } from '@/components/ui/GlassCard';

<GlassCard variant="hero" glow hover>
  <h2>Property Analysis Complete</h2>
  <p>Your deal score: 85/100</p>
</GlassCard>
```

**Variants:** `default | primary | hero | stat | interactive`
**Why Custom:** Core glassmorphism aesthetic, signature PropIQ look

#### ✅ Toast Component
**Use for:** Notifications, success/error messages

```tsx
import { Toast } from '@/components/ui/Toast';

<Toast
  type="success"
  message="Property saved successfully!"
  duration={3000}
/>
```

**Why Custom:** Custom animations aligned with glass aesthetic

---

### When to Use ShadCN Components

#### ✨ Dialog Component
**Use for:** Modal overlays, confirmation dialogs, forms in overlays

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Settings</Button>
  </DialogTrigger>
  <DialogContent className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border">
    <DialogHeader>
      <DialogTitle>Account Settings</DialogTitle>
      <DialogDescription>
        Manage your PropIQ account preferences
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

**Why ShadCN:** Focus trap, keyboard navigation, ARIA labels, scroll lock

**Glass Styling Tip:** Add PropIQ classes to `DialogContent`:
```tsx
className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border"
```

#### ✨ Input & Label Components
**Use for:** Form inputs, text fields, number inputs

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="purchase-price">Purchase Price</Label>
  <Input
    id="purchase-price"
    type="number"
    placeholder="$500,000"
    className="bg-surface-200 border-glass-border focus:ring-primary"
  />
</div>
```

**Why ShadCN:** Proper ARIA labeling, focus states, keyboard navigation

#### ✨ Select Component
**Use for:** Dropdowns, option pickers

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select>
  <SelectTrigger className="bg-surface-200 border-glass-border">
    <SelectValue placeholder="Select property type" />
  </SelectTrigger>
  <SelectContent className="bg-surface-300 border-glass-border backdrop-blur-glass">
    <SelectItem value="single-family">Single Family</SelectItem>
    <SelectItem value="multi-family">Multi-Family</SelectItem>
    <SelectItem value="commercial">Commercial</SelectItem>
  </SelectContent>
</Select>
```

**Why ShadCN:** Search functionality, keyboard navigation, mobile-friendly

#### ✨ Tabs Component
**Use for:** Tabbed interfaces (e.g., Deal Calculator: Basic | Advanced | Scenarios)

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="basic" className="w-full">
  <TabsList className="bg-surface-200 border-glass-border">
    <TabsTrigger value="basic">Basic</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
    <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
  </TabsList>
  <TabsContent value="basic">
    {/* Basic calculator inputs */}
  </TabsContent>
  <TabsContent value="advanced">
    {/* Advanced inputs */}
  </TabsContent>
  <TabsContent value="scenarios">
    {/* Scenario analysis */}
  </TabsContent>
</Tabs>
```

**Why ShadCN:** ARIA-labeled tabs, keyboard shortcuts (Arrow keys), proper focus management

#### ✨ Dropdown Menu Component
**Use for:** Action menus, user account dropdown, context menus

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">
      <UserIcon /> Account
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="bg-surface-300 border-glass-border backdrop-blur-glass">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator className="bg-glass-border" />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator className="bg-glass-border" />
    <DropdownMenuItem className="text-red-400">Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Why ShadCN:** Nested menus, keyboard navigation, auto-positioning

#### ✨ Tooltip Component
**Use for:** Contextual help, explanations, metric definitions

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button className="text-gray-400 hover:text-gray-200">
        <InfoIcon className="h-4 w-4" />
      </button>
    </TooltipTrigger>
    <TooltipContent className="bg-surface-300 border-glass-border backdrop-blur-glass">
      <p>Cap Rate = Net Operating Income / Purchase Price</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Why ShadCN:** Auto-positioning, delay controls, accessible

---

## Migration Strategy

### Phase 1: Foundation ✅ COMPLETE
- [x] Install ShadCN CLI
- [x] Configure Tailwind with dual design system
- [x] Add CSS variables for theming
- [x] Create `lib/utils.ts` with `cn()` helper
- [x] Install initial components (dialog, input, label, select, tabs, tooltip, dropdown-menu, card)

### Phase 2: High-Impact Replacements (Next Steps)

#### 2.1 Deal Calculator Form Inputs
**Target:** `DealCalculator.tsx`
**Replace:** Basic HTML inputs → ShadCN Input + Label
**Benefits:** Better validation, accessibility, consistent styling

**Before:**
```tsx
<input type="number" placeholder="Purchase Price" />
```

**After:**
```tsx
<div className="space-y-2">
  <Label htmlFor="purchase-price">Purchase Price</Label>
  <Input
    id="purchase-price"
    type="number"
    placeholder="$500,000"
    className="bg-surface-200 border-glass-border"
  />
</div>
```

#### 2.2 Authentication Modals
**Target:** `AuthModal.tsx`
**Replace:** Custom modal → ShadCN Dialog
**Benefits:** Focus trap, Esc key handling, backdrop click close

#### 2.3 Navigation Menus
**Target:** Header user dropdown
**Replace:** Custom dropdown → ShadCN DropdownMenu
**Benefits:** Keyboard navigation, auto-positioning

### Phase 3: Advanced Components (Future)

Components to add when needed:
- `form` - React Hook Form integration with Zod validation
- `table` - Sortable, filterable tables for analysis history
- `calendar` / `date-picker` - Date range selection for filtering
- `command` - Cmd+K command palette (replace custom CommandPalette)
- `popover` - Rich popovers for complex interactions
- `slider` - Range inputs for sensitivity analysis
- `switch` - Toggle switches for settings

---

## Best Practices

### 1. Glass Styling for ShadCN Components

**Pattern:** Always apply PropIQ glass classes to ShadCN overlays

```tsx
// ✅ Good - Glass aesthetic maintained
<DialogContent className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border shadow-card">

// ❌ Bad - Plain ShadCN default (doesn't match PropIQ aesthetic)
<DialogContent>
```

**Common Glass Classes:**
- `bg-gradient-to-br from-glass-medium to-surface-200` - Glass background
- `backdrop-blur-glass` - Blur effect
- `border-glass-border` - Subtle border
- `shadow-card` or `shadow-glow` - Depth

### 2. Import Aliasing

Use the `@` alias for cleaner imports:

```tsx
// ✅ Good
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ❌ Bad
import { Button } from '../../../components/ui/Button'
```

### 3. Combining PropIQ and ShadCN Components

**Example:** Dialog with PropIQ Button trigger

```tsx
<Dialog>
  <DialogTrigger asChild>
    {/* Use PropIQ Button for brand consistency */}
    <Button variant="primary">Open Analysis</Button>
  </DialogTrigger>
  <DialogContent className="bg-surface-300 backdrop-blur-glass border-glass-border">
    {/* ShadCN Dialog provides accessibility features */}
    <DialogHeader>
      <DialogTitle>Analysis Results</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### 4. Use `cn()` Helper for Conditional Styling

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "variant-classes"
)}>
```

### 5. Accessibility Checklist

When using ShadCN components:
- ✅ Always provide proper labels (`<Label>` for inputs)
- ✅ Use `aria-label` for icon-only buttons
- ✅ Test keyboard navigation (Tab, Enter, Esc, Arrow keys)
- ✅ Verify focus indicators are visible
- ✅ Check color contrast with Lighthouse

---

## Accessibility

### WCAG 2.1 AA Compliance

PropIQ aims for **WCAG 2.1 Level AA** compliance.

#### ShadCN Advantages

All ShadCN components are built on **Radix UI primitives**, which provide:

1. **Keyboard Navigation**
   - Tab order management
   - Arrow key navigation in menus/selects
   - Esc key to close overlays
   - Enter/Space to activate

2. **Screen Reader Support**
   - Proper ARIA roles, labels, descriptions
   - Dynamic content announcements
   - Focus management

3. **Focus Management**
   - Focus trap in dialogs
   - Return focus after closing modals
   - Visible focus indicators

4. **Touch-Friendly**
   - 44px minimum touch targets (WCAG 2.5.5)
   - No reliance on hover states
   - Swipe gestures where appropriate

#### Testing Tools

- **Lighthouse:** Run in Chrome DevTools (Accessibility score target: 95+)
- **Axe DevTools:** Browser extension for automated scanning
- **NVDA/JAWS:** Screen reader testing (Windows)
- **VoiceOver:** Screen reader testing (Mac/iOS)

#### Keyboard Shortcuts

| Component | Shortcut | Action |
|-----------|----------|--------|
| Dialog | `Esc` | Close modal |
| Dropdown | `↓` / `↑` | Navigate items |
| Select | `Enter` | Open dropdown |
| Tabs | `←` / `→` | Switch tabs |
| Tooltip | `Esc` | Hide tooltip |

---

## Utility Functions

### `cn()` - Class Name Merger

Located in `src/lib/utils.ts`, this function intelligently merges Tailwind classes:

```tsx
import { cn } from '@/lib/utils'

// Handles conditional classes
cn("px-2", isActive && "bg-blue-500")

// Deduplicates conflicting classes (rightmost wins)
cn("px-2 py-1", "px-4") // Result: "py-1 px-4"

// Works with arrays and objects
cn(
  "base-class",
  { "conditional-class": condition },
  ["array", "of", "classes"]
)
```

**Why it matters:** Prevents Tailwind class conflicts when composing components.

---

## Component Cheat Sheet

| Use Case | Component | Type | Import |
|----------|-----------|------|--------|
| **Primary actions** | Button | PropIQ | `@/components/ui/Button` |
| **Content containers** | GlassCard | PropIQ | `@/components/ui/GlassCard` |
| **Modal overlays** | Dialog | ShadCN | `@/components/ui/dialog` |
| **Form inputs** | Input + Label | ShadCN | `@/components/ui/input` |
| **Dropdowns** | Select | ShadCN | `@/components/ui/select` |
| **Action menus** | DropdownMenu | ShadCN | `@/components/ui/dropdown-menu` |
| **Tabbed UI** | Tabs | ShadCN | `@/components/ui/tabs` |
| **Help text** | Tooltip | ShadCN | `@/components/ui/tooltip` |
| **Notifications** | Toast | PropIQ | `@/components/ui/Toast` |
| **Loading states** | Skeleton | PropIQ | `@/components/ui/Skeleton` |

---

## Next Steps

### Recommended Actions

1. **Migrate DealCalculator Inputs**
   - Replace HTML inputs with ShadCN Input + Label
   - Add proper validation with error states
   - Test keyboard navigation

2. **Replace AuthModal**
   - Use ShadCN Dialog for login/signup
   - Maintain PropIQ Button for submit actions
   - Add glass styling to dialog overlay

3. **Add Form Validation**
   - Install `react-hook-form` and `zod`
   - Use ShadCN Form component (requires custom button mapping)
   - Implement real-time validation for property inputs

4. **Build Analysis History Table**
   - Add ShadCN Table component
   - Implement sorting, filtering
   - Use PropIQ GlassCard as container

### Adding New ShadCN Components

```bash
# From frontend directory
npx shadcn@latest add [component-name]

# Example: Add date picker
npx shadcn@latest add calendar date-picker

# Example: Add table
npx shadcn@latest add table
```

**Remember:** Always apply glass styling classes after adding new ShadCN components!

---

## Resources

### Documentation
- [ShadCN UI Docs](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### PropIQ Internal
- [Tailwind Config](./tailwind.config.js) - Color system and design tokens
- [Global CSS](./src/index.css) - CSS variables and animations
- [Components Config](./components.json) - ShadCN configuration

---

**Questions?** Contact the PropIQ dev team or open an issue on the project repository.

**Last Updated:** December 2025 | Phase 1 Complete ✅
