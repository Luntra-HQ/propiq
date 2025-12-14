# 🎉 New ShadCN Components - PropIQ Usage Guide

**Just Installed:** 9 powerful new components ready to use!

---

## 📦 What You Got

| Component | Use Case in PropIQ | Priority |
|-----------|-------------------|----------|
| **Table** | Analysis history, property comparisons | ⭐⭐⭐ |
| **Badge** | Subscription tiers (Free, Starter, Pro, Elite) | ⭐⭐⭐ |
| **Separator** | Visual dividers in forms/sections | ⭐⭐⭐ |
| **Slider** | Sensitivity analysis, down payment % | ⭐⭐ |
| **Switch** | Toggle settings (dark mode, notifications) | ⭐⭐ |
| **Popover** | Rich contextual help, tooltips | ⭐⭐ |
| **Accordion** | FAQ, help docs, expandable sections | ⭐⭐ |
| **Alert** | Warnings, success messages, errors | ⭐⭐ |
| **Progress** | Analysis loading, file upload progress | ⭐ |

---

## 🔥 High-Impact Examples for PropIQ

### 1. Table - Analysis History

Perfect for showing user's past property analyses with sorting/filtering:

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function AnalysisHistory() {
  const analyses = [
    { id: 1, address: "123 Main St", dealScore: 85, date: "2025-12-10", tier: "Pro" },
    { id: 2, address: "456 Oak Ave", dealScore: 72, date: "2025-12-09", tier: "Pro" },
    { id: 3, address: "789 Pine Rd", dealScore: 45, date: "2025-12-08", tier: "Starter" },
  ]

  return (
    <div className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border rounded-2xl p-6">
      <Table>
        <TableCaption className="text-gray-400">
          Your recent property analyses
        </TableCaption>
        <TableHeader>
          <TableRow className="border-glass-border hover:bg-glass-light">
            <TableHead className="text-violet-300">Property</TableHead>
            <TableHead className="text-violet-300">Deal Score</TableHead>
            <TableHead className="text-violet-300">Date</TableHead>
            <TableHead className="text-violet-300">Tier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analyses.map((analysis) => (
            <TableRow
              key={analysis.id}
              className="border-glass-border hover:bg-glass-light transition-colors cursor-pointer"
            >
              <TableCell className="font-medium text-gray-200">
                {analysis.address}
              </TableCell>
              <TableCell>
                <span className={`font-bold ${
                  analysis.dealScore >= 80 ? 'text-emerald-400' :
                  analysis.dealScore >= 65 ? 'text-blue-400' :
                  analysis.dealScore >= 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {analysis.dealScore}
                </span>
              </TableCell>
              <TableCell className="text-gray-300">{analysis.date}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                  {analysis.tier}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

**Use in PropIQ:** Dashboard → "My Analyses" section

---

### 2. Badge - Subscription Tier Indicator

Show current subscription tier with color coding:

```tsx
import { Badge } from "@/components/ui/badge"

// Tier badge component
export function SubscriptionBadge({ tier }: { tier: string }) {
  const getBadgeVariant = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'elite':
        return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30'
      case 'pro':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/30'
      case 'starter':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <Badge className={`${getBadgeVariant(tier)} font-semibold`}>
      {tier}
    </Badge>
  )
}

// Usage in header or pricing page
<div className="flex items-center gap-2">
  <span className="text-gray-300">Current Plan:</span>
  <SubscriptionBadge tier="Pro" />
</div>
```

**Use in PropIQ:** Header, Pricing Page, Account Settings

---

### 3. Slider - Sensitivity Analysis

Interactive slider for down payment %, interest rate adjustments:

```tsx
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function SensitivitySlider() {
  const [downPayment, setDownPayment] = useState([20])
  const [interestRate, setInterestRate] = useState([7.0])

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border rounded-2xl">
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label className="text-gray-300">Down Payment</Label>
          <span className="text-violet-400 font-semibold">{downPayment[0]}%</span>
        </div>
        <Slider
          value={downPayment}
          onValueChange={setDownPayment}
          min={0}
          max={50}
          step={1}
          className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <Label className="text-gray-300">Interest Rate</Label>
          <span className="text-violet-400 font-semibold">{interestRate[0]}%</span>
        </div>
        <Slider
          value={interestRate}
          onValueChange={setInterestRate}
          min={3}
          max={12}
          step={0.125}
          className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
        />
      </div>
    </div>
  )
}
```

**Use in PropIQ:** DealCalculator → Scenarios Tab

---

### 4. Switch - Settings Toggles

For user preferences and feature toggles:

```tsx
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function SettingsPanel() {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="email-notifications" className="text-gray-200">
            Email Notifications
          </Label>
          <p className="text-sm text-gray-400">
            Receive deal alerts via email
          </p>
        </div>
        <Switch
          id="email-notifications"
          className="data-[state=checked]:bg-violet-600"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="auto-save" className="text-gray-200">
            Auto-save Analyses
          </Label>
          <p className="text-sm text-gray-400">
            Automatically save your property analyses
          </p>
        </div>
        <Switch
          id="auto-save"
          className="data-[state=checked]:bg-violet-600"
          defaultChecked
        />
      </div>
    </div>
  )
}
```

**Use in PropIQ:** Account Settings, User Preferences

---

### 5. Popover - Rich Contextual Help

Replace simple tooltips with rich popovers:

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/Button"
import { Info } from "lucide-react"

export function CapRatePopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-violet-400 hover:text-violet-300">
          <Info className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-surface-300 border-glass-border backdrop-blur-glass w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-50">Cap Rate (Capitalization Rate)</h4>
          <p className="text-sm text-gray-300">
            Measures the rate of return on a property based on the income it generates.
          </p>
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
            <code className="text-sm text-violet-300">
              Cap Rate = NOI / Purchase Price
            </code>
          </div>
          <p className="text-xs text-gray-400">
            Higher is generally better. Typical range: 4-10%
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

**Use in PropIQ:** DealCalculator → Next to complex metrics

---

### 6. Accordion - FAQ / Help Section

Collapsible sections for help documentation:

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function PropertyFAQ() {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      <AccordionItem
        value="item-1"
        className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border rounded-xl px-4"
      >
        <AccordionTrigger className="text-gray-200 hover:text-violet-300">
          How is the Deal Score calculated?
        </AccordionTrigger>
        <AccordionContent className="text-gray-300">
          The Deal Score (0-100) combines multiple factors including cash flow, cap rate,
          cash-on-cash return, and the 1% rule to give you an overall assessment of the
          investment quality.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem
        value="item-2"
        className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border rounded-xl px-4"
      >
        <AccordionTrigger className="text-gray-200 hover:text-violet-300">
          What's included in monthly expenses?
        </AccordionTrigger>
        <AccordionContent className="text-gray-300">
          Monthly expenses include: property tax, insurance, HOA fees, utilities,
          maintenance, vacancy reserves, and property management fees.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem
        value="item-3"
        className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border rounded-xl px-4"
      >
        <AccordionTrigger className="text-gray-200 hover:text-violet-300">
          How do I interpret the scenarios?
        </AccordionTrigger>
        <AccordionContent className="text-gray-300">
          Best Case (+20% rent, -10% expenses), Base Case (your inputs),
          Worst Case (-20% rent, +10% expenses). This helps you understand the
          range of possible outcomes.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

**Use in PropIQ:** Help Center, Onboarding

---

### 7. Alert - Status Messages

Beautiful alerts for warnings, errors, success:

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

// Trial limit warning
export function TrialLimitAlert() {
  return (
    <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-300">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Trial Limit Approaching</AlertTitle>
      <AlertDescription>
        You've used 2 of 3 trial analyses. Upgrade to unlimited for just $49/month.
      </AlertDescription>
    </Alert>
  )
}

// Analysis success
export function AnalysisSuccessAlert() {
  return (
    <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Analysis Complete!</AlertTitle>
      <AlertDescription>
        Your property analysis has been saved to your dashboard.
      </AlertDescription>
    </Alert>
  )
}

// Info alert
export function SubscriptionInfoAlert() {
  return (
    <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-300">
      <Info className="h-4 w-4" />
      <AlertTitle>Pro Tip</AlertTitle>
      <AlertDescription>
        Pro and Elite members get unlimited analyses. Upgrade to unlock full potential!
      </AlertDescription>
    </Alert>
  )
}
```

**Use in PropIQ:** Throughout app for feedback messages

---

### 8. Progress - Loading States

Show progress for AI analysis:

```tsx
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"

export function AnalysisProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 10
      })
    }, 500)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-3 p-6 bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border rounded-2xl">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Analyzing property...</span>
        <span className="text-violet-400 font-semibold">{progress}%</span>
      </div>
      <Progress
        value={progress}
        className="h-2 bg-surface-300"
      />
      <p className="text-xs text-gray-400">
        AI is analyzing deal metrics, calculating projections, and generating recommendations
      </p>
    </div>
  )
}
```

**Use in PropIQ:** Property Analysis Loading Screen

---

### 9. Separator - Visual Organization

Clean dividers for sections:

```tsx
import { Separator } from "@/components/ui/separator"

export function PricingTiers() {
  return (
    <div className="p-6 bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border rounded-2xl">
      <h3 className="text-lg font-semibold text-gray-50">Subscription Details</h3>

      <Separator className="my-4 bg-glass-border" />

      <div className="space-y-2">
        <p className="text-gray-300">Plan: Pro</p>
        <p className="text-gray-300">Analyses: Unlimited</p>
        <p className="text-gray-300">Billing: $99/month</p>
      </div>

      <Separator className="my-4 bg-glass-border" />

      <div className="space-y-2">
        <p className="text-gray-400 text-sm">Next billing date: Jan 14, 2026</p>
        <p className="text-gray-400 text-sm">Payment method: •••• 4242</p>
      </div>
    </div>
  )
}
```

**Use in PropIQ:** Forms, Cards, Settings pages

---

## 🎨 Glass Styling Patterns

### For Table
```tsx
className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border"
```

### For Badge
```tsx
className="bg-violet-500/20 text-violet-300 border-violet-500/30"
```

### For Slider
```tsx
className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
```

### For Switch
```tsx
className="data-[state=checked]:bg-violet-600"
```

### For Popover
```tsx
className="bg-surface-300 border-glass-border backdrop-blur-glass"
```

### For Accordion
```tsx
className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border"
```

### For Alert
```tsx
className="bg-amber-500/10 border-amber-500/30 text-amber-300"  // Warning
className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300"  // Success
className="bg-blue-500/10 border-blue-500/30 text-blue-300"  // Info
className="bg-red-500/10 border-red-500/30 text-red-300"  // Error
```

---

## 📊 Component Priority for PropIQ

### Implement First (High Impact):
1. **Table** → Analysis history page
2. **Badge** → Subscription tier indicators
3. **Alert** → Replace basic alert()  calls
4. **Separator** → Clean up forms and sections

### Implement Next (Medium Impact):
5. **Slider** → Sensitivity analysis in calculator
6. **Accordion** → Help center, FAQ section
7. **Popover** → Replace simple tooltips

### Nice to Have:
8. **Switch** → Settings page
9. **Progress** → Analysis loading states

---

## 🚀 Quick Implementation Guide

### 1. Analysis History Page (Table + Badge)

Create `src/pages/AnalysisHistoryPage.tsx`:
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/GlassCard"

export function AnalysisHistoryPage() {
  return (
    <div className="p-8">
      <GlassCard variant="default">
        <h1 className="text-2xl font-bold text-gray-50 mb-6">Analysis History</h1>
        {/* Table implementation from above */}
      </GlassCard>
    </div>
  )
}
```

### 2. Enhanced Calculator (Slider)

Add to `DealCalculatorV2.tsx` in Scenarios tab:
```tsx
import { Slider } from "@/components/ui/slider"
// Add sensitivity analysis sliders
```

### 3. Help Center (Accordion)

Create `src/components/HelpFAQ.tsx`:
```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// Add FAQ accordion from above
```

---

## ✅ Next Steps

1. **Test new components** on `/test` route
2. **Pick 1-2 high-priority components** to implement first
3. **Create real pages** using the examples above
4. **Update DESIGN_SYSTEM.md** with these new patterns

---

## 📚 Resources

- **ShadCN Docs:** https://ui.shadcn.com/docs/components
- **Radix UI (primitives):** https://www.radix-ui.com/primitives
- **PropIQ Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

**Total Components Now:** 17 (8 original + 9 new)
**All with Glass Styling:** ✅ Ready to use
**Documentation:** Complete
**Test Route:** http://localhost:5173/test
