# ShadCN + PropIQ Quick Start Guide

> **TL;DR:** PropIQ now uses a hybrid design system. Use PropIQ custom components for brand identity (buttons, cards) and ShadCN for complex interactions (forms, dialogs, dropdowns).

---

## 🚀 Installation Complete

Phase 1 is **COMPLETE**! Here's what was set up:

✅ ShadCN CLI configured
✅ Tailwind merged with PropIQ glass design tokens
✅ CSS variables for theming added to `index.css`
✅ Import alias `@/` configured
✅ Utility function `cn()` created
✅ 8 ShadCN components installed:
  - `dialog` - Modal overlays
  - `input` - Form inputs
  - `label` - Input labels
  - `select` - Dropdowns
  - `dropdown-menu` - Action menus
  - `tabs` - Tabbed interfaces
  - `tooltip` - Rich tooltips
  - `card` - Content cards

---

## 📦 What You Get

### PropIQ Custom Components (Keep Using)
```tsx
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Toast } from '@/components/ui/Toast'
```

**Use for:** Brand-specific visuals, buttons, cards, toasts

### ShadCN Components (New!)
```tsx
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
```

**Use for:** Forms, modals, dropdowns, interactive primitives

---

## 🎨 Glass Styling Pattern

**IMPORTANT:** Always add PropIQ glass classes to ShadCN components!

### Example: Glass Dialog
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="primary">Open</Button>
  </DialogTrigger>

  {/* ADD GLASS STYLING HERE 👇 */}
  <DialogContent className="
    bg-gradient-to-br from-glass-medium to-surface-200
    backdrop-blur-glass
    border-glass-border
    shadow-card
  ">
    <DialogHeader>
      <DialogTitle>Hello PropIQ!</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Glass Class Cheat Sheet
```css
/* Background */
bg-gradient-to-br from-glass-medium to-surface-200

/* Blur Effect */
backdrop-blur-glass

/* Border */
border-glass-border

/* Shadow */
shadow-card
shadow-glow (for glowing effect)
```

---

## 🔥 Common Patterns

### 1. Form Input with Label
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    className="bg-surface-200 border-glass-border focus:ring-primary"
  />
</div>
```

### 2. Dropdown Menu
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/Button'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="bg-surface-300 border-glass-border backdrop-blur-glass">
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 3. Tabs (Perfect for Deal Calculator!)
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="basic">
  <TabsList className="bg-surface-200 border-glass-border">
    <TabsTrigger value="basic">Basic</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
  </TabsList>
  <TabsContent value="basic">
    {/* Basic content */}
  </TabsContent>
  <TabsContent value="advanced">
    {/* Advanced content */}
  </TabsContent>
</Tabs>
```

### 4. Select Dropdown
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select>
  <SelectTrigger className="bg-surface-200 border-glass-border">
    <SelectValue placeholder="Choose property type" />
  </SelectTrigger>
  <SelectContent className="bg-surface-300 border-glass-border backdrop-blur-glass">
    <SelectItem value="residential">Residential</SelectItem>
    <SelectItem value="commercial">Commercial</SelectItem>
  </SelectContent>
</Select>
```

### 5. Tooltip
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>ℹ️</TooltipTrigger>
    <TooltipContent className="bg-surface-300 border-glass-border backdrop-blur-glass">
      <p>Helpful explanation here</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## 🛠️ Adding More Components

Install additional ShadCN components as needed:

```bash
cd frontend

# Add individual components
npx shadcn@latest add table
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add slider

# Add multiple at once
npx shadcn@latest add table calendar popover
```

**Available components:** https://ui.shadcn.com/docs/components

---

## ✨ The `cn()` Utility

Merge classes intelligently:

```tsx
import { cn } from '@/lib/utils'

// Combine conditional classes
<div className={cn(
  "base-class",
  isActive && "active-class",
  isPrimary ? "primary-class" : "secondary-class"
)} />

// Tailwind deduplication (rightmost wins)
cn("px-2 py-1", "px-4") // Result: "py-1 px-4"
```

---

## 🎯 Next Steps

### Recommended Actions:

1. **Migrate Deal Calculator Inputs**
   - Replace HTML inputs → ShadCN `<Input>` + `<Label>`
   - Better accessibility and validation

2. **Replace Auth Modal**
   - Use ShadCN `<Dialog>` for login/signup
   - Keep PropIQ `<Button>` for brand consistency

3. **Add Form Validation** (Optional)
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   npx shadcn@latest add form
   ```

---

## 📚 Full Documentation

See **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** for:
- Complete component usage guide
- Migration strategy
- Accessibility guidelines
- Best practices
- Color system reference

---

## 🆘 Quick Troubleshooting

### Issue: Components not styled correctly
**Solution:** Make sure you've added glass classes:
```tsx
className="bg-surface-200 border-glass-border backdrop-blur-glass"
```

### Issue: Import errors
**Solution:** Use the `@` alias:
```tsx
import { Dialog } from '@/components/ui/dialog' // ✅
import { Dialog } from '../components/ui/dialog' // ❌
```

### Issue: Tailwind classes conflicting
**Solution:** Use the `cn()` utility:
```tsx
import { cn } from '@/lib/utils'
className={cn("base", "classes")}
```

---

## 🎉 You're Ready!

Start using ShadCN components in PropIQ while maintaining the glass aesthetic. The hybrid approach gives you the best of both worlds: brand consistency + production-ready accessibility.

**Happy coding!** 🚀

---

**Need help?** Check [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) or ask the team.
