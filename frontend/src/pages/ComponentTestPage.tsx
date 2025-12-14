/**
 * Component Test Page
 *
 * Quick visual testing route for new components.
 * Access at: http://localhost:5173/test
 *
 * This is MUCH faster than Playwright E2E tests!
 */

import { useState } from 'react'
import { DealCalculatorV2 } from '@/components/DealCalculatorV2'
import { AuthModalV2 } from '@/components/AuthModalV2'
import { FormInput, NumericInput } from '@/components/ui/FormInput'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, CheckCircle } from 'lucide-react'

export const ComponentTestPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testPrice, setTestPrice] = useState(500000)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gradient">Component Test Suite</h1>
          <p className="text-gray-400">Rapid testing for ShadCN components - No Playwright needed!</p>
        </div>

        {/* Test Tabs */}
        <Tabs defaultValue="forms" className="w-full">
          <TabsList className="bg-surface-200 border-glass-border grid grid-cols-4">
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="modals">Modals</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
          </TabsList>

          {/* Forms Test */}
          <TabsContent value="forms" className="space-y-6 mt-6">
            <GlassCard variant="default" hover>
              <h2 className="text-2xl font-semibold text-gray-50 mb-4">FormInput Components</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    id="test-email"
                    label="Email Address"
                    type="email"
                    value={testEmail}
                    onChange={setTestEmail}
                    placeholder="test@example.com"
                    helpText="Test help text functionality"
                  />

                  <FormInput
                    id="test-password"
                    label="Password"
                    type="password"
                    value="testpass123"
                    onChange={() => {}}
                    placeholder="••••••••"
                    error="Test error message display"
                  />
                </div>

                <NumericInput
                  id="test-price"
                  label="Purchase Price"
                  value={testPrice}
                  onChange={setTestPrice}
                  step="1000"
                  helpText="Use arrow keys or type to change"
                />

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Test Results:</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-300 space-y-1">
                    <div>Email: {testEmail || '(empty)'}</div>
                    <div>Price: ${testPrice.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-sm text-gray-400">
                <p className="font-semibold text-violet-400">Manual Tests:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Tab navigation works</li>
                  <li>Error messages show in red</li>
                  <li>Help text appears below inputs</li>
                  <li>Focus rings are visible</li>
                  <li>Auto-select works on numeric input</li>
                </ul>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Modals Test */}
          <TabsContent value="modals" className="space-y-6 mt-6">
            <GlassCard variant="default" hover>
              <h2 className="text-2xl font-semibold text-gray-50 mb-4">Dialog Components</h2>

              <div className="space-y-4">
                {/* AuthModal Test */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">AuthModalV2</h3>
                  <Button
                    variant="primary"
                    onClick={() => setAuthModalOpen(true)}
                    icon={<Play className="h-4 w-4" />}
                  >
                    Test Auth Modal
                  </Button>

                  <AuthModalV2
                    isOpen={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    onSuccess={() => {
                      console.log('Auth success!')
                      setAuthModalOpen(false)
                    }}
                    defaultMode="signup"
                  />

                  <div className="mt-3 space-y-1 text-sm text-gray-400">
                    <p className="font-semibold text-violet-400">Tests:</p>
                    <ul className="list-disc list-inside ml-2">
                      <li>Press Esc to close</li>
                      <li>Click backdrop to close</li>
                      <li>Switch between login/signup</li>
                      <li>Validation errors show</li>
                      <li>Tab order correct</li>
                    </ul>
                  </div>
                </div>

                {/* Generic Dialog Test */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">ShadCN Dialog</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" icon={<Play className="h-4 w-4" />}>
                        Test Generic Dialog
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border">
                      <DialogHeader>
                        <DialogTitle>Test Dialog</DialogTitle>
                        <DialogDescription>
                          This is a test of the ShadCN Dialog component with glass styling.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-gray-300">Dialog content goes here.</p>
                        <div className="space-y-2">
                          <FormInput
                            id="dialog-test"
                            label="Test Input"
                            value=""
                            onChange={() => {}}
                            placeholder="Type something..."
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Calculator Test */}
          <TabsContent value="calculator" className="space-y-6 mt-6">
            <GlassCard variant="default">
              <h2 className="text-2xl font-semibold text-gray-50 mb-4">DealCalculatorV2</h2>
              <p className="text-gray-400 mb-4">Full calculator with ShadCN Tabs and NumericInput</p>

              <div className="space-y-4 text-sm text-gray-400">
                <p className="font-semibold text-violet-400">Tests to perform:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Arrow keys switch tabs (Basic/Advanced/Scenarios)</li>
                  <li>All inputs accept numbers</li>
                  <li>Tooltips show on info icon hover</li>
                  <li>Calculations update in real-time</li>
                  <li>Deal score updates correctly</li>
                  <li>Focus indicators visible</li>
                </ul>
              </div>
            </GlassCard>

            <DealCalculatorV2 />
          </TabsContent>

          {/* Interactive Tests */}
          <TabsContent value="interactive" className="space-y-6 mt-6">
            <GlassCard variant="default" hover>
              <h2 className="text-2xl font-semibold text-gray-50 mb-4">Interactive Testing</h2>

              <div className="space-y-6">
                {/* Keyboard Navigation Test */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Keyboard Navigation</h3>
                  <div className="space-y-2">
                    <Button variant="primary" fullWidth>Tab Stop 1</Button>
                    <Button variant="secondary" fullWidth>Tab Stop 2</Button>
                    <Button variant="ghost" fullWidth>Tab Stop 3</Button>
                  </div>
                  <p className="mt-3 text-sm text-gray-400">
                    Use Tab to navigate, Enter to activate. Check for visible focus rings!
                  </p>
                </div>

                {/* Button States Test */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Button States</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="primary">Normal</Button>
                    <Button variant="primary" loading>Loading</Button>
                    <Button variant="primary" disabled>Disabled</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </div>

                {/* Glass Styling Test */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Glass Styling</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <GlassCard variant="default" size="sm">
                      <p className="text-sm text-gray-300">Default</p>
                    </GlassCard>
                    <GlassCard variant="primary" size="sm">
                      <p className="text-sm text-gray-300">Primary</p>
                    </GlassCard>
                    <GlassCard variant="hero" size="sm" glow>
                      <p className="text-sm text-gray-300">Hero + Glow</p>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* Quick Access Checklist */}
        <GlassCard variant="primary" glow>
          <h2 className="text-xl font-semibold text-gray-50 mb-4">✅ Testing Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-violet-300">Accessibility:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                <li>Tab navigation works</li>
                <li>Esc closes modals</li>
                <li>Focus indicators visible</li>
                <li>Error messages announced</li>
                <li>Labels properly associated</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-emerald-300">Visual:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                <li>Glass styling consistent</li>
                <li>Animations smooth</li>
                <li>Colors match design</li>
                <li>Responsive layout works</li>
                <li>No layout shifts</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default ComponentTestPage
