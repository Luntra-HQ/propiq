# 🚀 Rapid Component Testing Guide

**Problem:** Playwright E2E tests are slow and brittle for component testing.
**Solution:** Use these faster, more reliable approaches!

---

## Option 1: Dev Route Testing ⚡ (FASTEST - 0-3 seconds)

### Setup (One-time)

Add the test route to your router:

```tsx
// In App.tsx or your router setup
import { ComponentTestPage } from './pages/ComponentTestPage'

// Add to your routes
<Route path="/test" element={<ComponentTestPage />} />

// OR if not using React Router, add conditional rendering:
{window.location.pathname === '/test' && <ComponentTestPage />}
```

### Usage

```bash
# Start dev server
npm run dev

# Open in browser
open http://localhost:5173/test
```

**Benefits:**
- ⚡ **Instant feedback** (hot reload in 0-3 seconds)
- 🎨 **Visual testing** (see components exactly as users do)
- 🔧 **Interactive** (click, type, test keyboard nav in real-time)
- 📱 **Responsive** (resize browser to test mobile)
- 🐛 **Live debugging** (Chrome DevTools, React DevTools)

**Perfect for:**
- Visual QA (does it look right?)
- Interaction testing (does clicking work?)
- Keyboard navigation (Tab, Esc, Enter, Arrow keys)
- Accessibility checks (focus indicators, ARIA)
- Quick iteration during development

---

## Option 2: Vitest + React Testing Library 🧪 (FAST - 100-500ms)

### Setup

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

### Example Test for FormInput

Create `src/components/ui/FormInput.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormInput, NumericInput } from './FormInput'

describe('FormInput', () => {
  it('renders with label and input', () => {
    render(
      <FormInput
        id="test"
        label="Email"
        value=""
        onChange={() => {}}
      />
    )

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows error message when provided', () => {
    render(
      <FormInput
        id="test"
        label="Email"
        value=""
        onChange={() => {}}
        error="Invalid email"
      />
    )

    expect(screen.getByText(/Invalid email/i)).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(
      <FormInput
        id="test"
        label="Email"
        value=""
        onChange={handleChange}
      />
    )

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows help text', () => {
    render(
      <FormInput
        id="test"
        label="Email"
        value=""
        onChange={() => {}}
        helpText="We'll never share your email"
      />
    )

    expect(screen.getByText(/never share/i)).toBeInTheDocument()
  })
})

describe('NumericInput', () => {
  it('parses numbers correctly', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(
      <NumericInput
        id="price"
        label="Price"
        value={0}
        onChange={handleChange}
      />
    )

    await user.type(screen.getByLabelText('Price'), '500000')
    expect(handleChange).toHaveBeenLastCalledWith(500000)
  })

  it('auto-selects on focus', () => {
    render(
      <NumericInput
        id="price"
        label="Price"
        value={12345}
        onChange={() => {}}
      />
    )

    const input = screen.getByLabelText('Price') as HTMLInputElement
    input.focus()

    // Check if select was called (implementation detail)
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(input.value.length)
  })
})
```

### Run Tests

```bash
# Watch mode (re-runs on file changes)
npm run test

# Single run
npm run test:run

# Coverage
npm run test:coverage
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Benefits:**
- ⚡ **Blazing fast** (100-500ms for most tests)
- 🔄 **Watch mode** (re-runs on file save)
- 📊 **Code coverage** (see what's tested)
- 🎯 **Focused** (test one thing at a time)
- 🤖 **CI-friendly** (runs in CI/CD pipelines)

**Perfect for:**
- Unit testing (does the logic work?)
- Regression testing (did I break something?)
- TDD (test-driven development)
- CI/CD pipelines
- Code coverage tracking

---

## Option 3: Storybook 📚 (MEDIUM - 5-10 seconds)

### Setup

```bash
npx storybook@latest init
```

### Example Story

Create `src/components/ui/FormInput.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { FormInput, NumericInput } from './FormInput'

const meta: Meta<typeof FormInput> = {
  title: 'Forms/FormInput',
  component: FormInput,
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
}

export default meta
type Story = StoryObj<typeof FormInput>

export const Default: Story = {
  args: {
    id: 'email',
    label: 'Email Address',
    value: '',
    onChange: () => {},
    placeholder: 'you@example.com',
  },
}

export const WithError: Story = {
  args: {
    ...Default.args,
    error: 'Invalid email address',
  },
}

export const WithHelpText: Story = {
  args: {
    ...Default.args,
    helpText: "We'll never share your email",
  },
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
}

export const Numeric: StoryObj<typeof NumericInput> = {
  render: () => (
    <NumericInput
      id="price"
      label="Purchase Price"
      value={500000}
      onChange={(val) => console.log(val)}
      step="1000"
      helpText="Property purchase price in dollars"
    />
  ),
}
```

**Benefits:**
- 📚 **Component library** (see all variations)
- 🎨 **Design review** (perfect for designers)
- 📱 **Responsive testing** (built-in viewport switcher)
- ♿ **A11y checks** (accessibility addon)
- 📖 **Documentation** (auto-generated docs)

**Perfect for:**
- Component showcase
- Design system documentation
- Designer collaboration
- Visual regression testing
- Accessibility audits

---

## Option 4: Browser DevTools 🔧 (INSTANT)

### Console Testing

Open Chrome DevTools (F12) and test components directly:

```js
// Test AuthModal opening
document.querySelector('[data-testid="open-auth"]').click()

// Test form validation
const emailInput = document.querySelector('#email')
emailInput.value = 'invalid-email'
emailInput.dispatchEvent(new Event('input', { bubbles: true }))

// Check accessibility
// Right-click → Inspect → Lighthouse → Accessibility
```

### React DevTools

```bash
# Install React DevTools extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools

# In browser:
# 1. Open React DevTools
# 2. Select component
# 3. View/edit props and state in real-time
```

**Benefits:**
- ⚡ **Instant** (no setup needed)
- 🔍 **Deep inspection** (see component internals)
- 🎛️ **Live manipulation** (change props/state on the fly)
- 📊 **Performance profiling** (React Profiler)

---

## Speed Comparison

| Method | Setup Time | Test Time | Use Case |
|--------|------------|-----------|----------|
| **Dev Route** | 5 min | 0-3 sec | Visual QA, interaction testing |
| **Vitest** | 10 min | 100-500ms | Unit tests, regression, CI/CD |
| **DevTools** | 0 min | 0 sec | Quick checks, debugging |
| **Storybook** | 15 min | 5-10 sec | Component showcase, design review |
| **Playwright E2E** | 30 min | 5-30 sec | Full user flows, integration |

---

## Recommended Workflow

### During Development (Fastest ⚡)
1. **Use Dev Route** (`/test`) for instant visual feedback
2. **Use DevTools** for debugging specific issues
3. **Hot reload** watches your changes automatically

### Before Commit (Fast ✅)
1. **Run Vitest** to ensure no regressions
2. **Check `/test` route** for visual QA
3. **Lighthouse audit** in DevTools (Accessibility tab)

### Before Deploy (Thorough 🔒)
1. **Full test suite** (Vitest + Playwright if needed)
2. **Storybook review** (if using)
3. **Manual testing** on staging

---

## Quick Start Commands

```bash
# 1. Start dev server with test route (FASTEST)
npm run dev
# Open http://localhost:5173/test

# 2. Run unit tests (FAST)
npm run test

# 3. Run Playwright E2E (SLOW - only when needed)
npm run test:e2e

# 4. Storybook (if installed)
npm run storybook
```

---

## Testing Checklist for New Components

### FormInput / NumericInput
- [ ] Tab navigation works
- [ ] Error messages display in red
- [ ] Help text shows below input
- [ ] Focus ring visible
- [ ] Auto-select works on focus (NumericInput)
- [ ] Keyboard input accepted
- [ ] Labels properly associated (click label → focuses input)

### Dialog Components
- [ ] Esc key closes
- [ ] Backdrop click closes
- [ ] Focus trapped inside dialog
- [ ] Focus returns to trigger after close
- [ ] Can't tab outside dialog
- [ ] Screen reader announces role

### Tabs Component
- [ ] Arrow keys switch tabs (← →)
- [ ] Tab key navigates into content
- [ ] Active tab highlighted
- [ ] ARIA roles present

### General Accessibility
- [ ] Lighthouse score 95+
- [ ] Keyboard-only navigation works
- [ ] Screen reader compatible (test with VoiceOver/NVDA)
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible

---

## Debugging Tips

### Component Not Rendering?
```tsx
// Add console.log to check
console.log('Component rendering', { props })

// Check React DevTools
// Components tab → Select component → See props/state
```

### Styles Not Applying?
```tsx
// Check Tailwind classes in DevTools
// Elements tab → Inspect element → See computed styles

// Check if glass classes are present
className="bg-gradient-to-br from-glass-medium to-surface-200"
```

### Event Not Firing?
```tsx
// Add console.log to handler
const handleChange = (value) => {
  console.log('Change event:', value)
  onChange(value)
}

// Check event listeners in DevTools
// Elements tab → Event Listeners panel
```

---

## Why This is Better Than Playwright for Components

| Aspect | Playwright E2E | Dev Route + Vitest |
|--------|----------------|-------------------|
| **Speed** | 5-30 seconds | 0-3 seconds |
| **Feedback** | After full page load | Instant (hot reload) |
| **Debugging** | Hard (headless mode) | Easy (live DevTools) |
| **Flakiness** | High (network, timing) | Low (isolated) |
| **Setup** | Complex (config, selectors) | Simple (just code) |
| **CI Time** | 5-10 minutes | 10-30 seconds |

**Use Playwright for:** Full user journeys (signup → login → analyze property → logout)
**Use Dev Route + Vitest for:** Individual components (does this button work?)

---

## 🎯 Recommendation

**Start with Dev Route testing** (`/test`) - it's the fastest way to validate your new ShadCN components!

Then add **Vitest tests** for critical logic (form validation, calculations).

Save **Playwright** for full E2E user flows only.

---

**Questions?** Just ask! Happy testing! 🚀
