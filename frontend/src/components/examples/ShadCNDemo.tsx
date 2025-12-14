/**
 * ShadCN + PropIQ Hybrid Demo
 *
 * This component demonstrates the integration of ShadCN components
 * with PropIQ's glassmorphism design system.
 *
 * Usage: Import this component to see examples of the hybrid approach.
 */

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Home, DollarSign, Info, Settings, User, LogOut } from 'lucide-react'

export const ShadCNDemo = () => {
  const [propertyType, setPropertyType] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gradient">
            PropIQ + ShadCN Hybrid Demo
          </h1>
          <p className="text-gray-400">
            Demonstrating the integration of ShadCN components with PropIQ's glassmorphism aesthetic
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Dialog Demo */}
          <GlassCard variant="default" hover>
            <h3 className="text-xl font-semibold text-gray-50 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-violet-400" />
              Dialog Example
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              ShadCN Dialog with PropIQ Button trigger and glass styling
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="primary" fullWidth>
                  Open Property Details
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-glass-medium to-surface-200 backdrop-blur-glass border-glass-border shadow-glow">
                <DialogHeader>
                  <DialogTitle className="text-gray-50">Property Analysis</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    View detailed information about this investment property
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-300">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State"
                      className="bg-surface-200 border-glass-border text-gray-100 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-300">Purchase Price</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="$500,000"
                      className="bg-surface-200 border-glass-border text-gray-100 placeholder:text-gray-500"
                    />
                  </div>
                  <Button variant="primary" fullWidth>
                    Analyze Property
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </GlassCard>

          {/* 2. Form Inputs Demo */}
          <GlassCard variant="default" hover>
            <h3 className="text-xl font-semibold text-gray-50 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Form Inputs Example
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              ShadCN Input + Label components with glass styling
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchase" className="text-gray-300">Purchase Price</Label>
                <Input
                  id="purchase"
                  type="number"
                  placeholder="$500,000"
                  className="bg-surface-200 border-glass-border text-gray-100 placeholder:text-gray-500 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="down-payment" className="text-gray-300">Down Payment %</Label>
                <Input
                  id="down-payment"
                  type="number"
                  placeholder="20"
                  className="bg-surface-200 border-glass-border text-gray-100 placeholder:text-gray-500 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest-rate" className="text-gray-300">Interest Rate %</Label>
                <Input
                  id="interest-rate"
                  type="number"
                  step="0.01"
                  placeholder="6.5"
                  className="bg-surface-200 border-glass-border text-gray-100 placeholder:text-gray-500 focus:ring-primary"
                />
              </div>
            </div>
          </GlassCard>

          {/* 3. Select Dropdown Demo */}
          <GlassCard variant="default" hover>
            <h3 className="text-xl font-semibold text-gray-50 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-400" />
              Select Dropdown Example
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              ShadCN Select component with glass styling
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Property Type</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="bg-surface-200 border-glass-border text-gray-100">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-300 border-glass-border backdrop-blur-glass">
                    <SelectItem value="single-family">Single Family Home</SelectItem>
                    <SelectItem value="multi-family">Multi-Family</SelectItem>
                    <SelectItem value="condo">Condominium</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {propertyType && (
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                  <p className="text-sm text-violet-300">
                    Selected: <span className="font-semibold">{propertyType}</span>
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* 4. Tabs Demo */}
          <GlassCard variant="default" hover>
            <h3 className="text-xl font-semibold text-gray-50 mb-4">
              Tabs Example (Deal Calculator Style)
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              ShadCN Tabs component with glass styling
            </p>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="bg-surface-200 border-glass-border w-full grid grid-cols-3">
                <TabsTrigger value="basic" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
                  Basic
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300">
                  Scenarios
                </TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="mt-4 space-y-3">
                <p className="text-gray-300 text-sm">Basic property information and calculations</p>
                <div className="space-y-2">
                  <Label className="text-gray-300">Monthly Rent</Label>
                  <Input placeholder="$2,500" className="bg-surface-200 border-glass-border text-gray-100" />
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="mt-4 space-y-3">
                <p className="text-gray-300 text-sm">Advanced metrics and detailed analysis</p>
                <div className="space-y-2">
                  <Label className="text-gray-300">Cap Rate %</Label>
                  <Input placeholder="8.5" className="bg-surface-200 border-glass-border text-gray-100" />
                </div>
              </TabsContent>
              <TabsContent value="scenarios" className="mt-4 space-y-3">
                <p className="text-gray-300 text-sm">Best case, worst case, and projected scenarios</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    <p className="text-emerald-300">Best: +15%</p>
                  </div>
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                    <p className="text-red-300">Worst: -5%</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </GlassCard>

          {/* 5. Tooltip Demo */}
          <GlassCard variant="default" hover>
            <h3 className="text-xl font-semibold text-gray-50 mb-4">
              Tooltip Example
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              ShadCN Tooltip for contextual help
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">Cap Rate</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-violet-400 hover:text-violet-300 transition-colors">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-surface-300 border-glass-border backdrop-blur-glass max-w-xs">
                      <p className="text-sm text-gray-200">
                        <strong>Cap Rate</strong> (Capitalization Rate) = Net Operating Income / Purchase Price
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        A higher cap rate generally indicates a better return on investment.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-300">Cash on Cash Return</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-violet-400 hover:text-violet-300 transition-colors">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-surface-300 border-glass-border backdrop-blur-glass max-w-xs">
                      <p className="text-sm text-gray-200">
                        <strong>Cash on Cash Return</strong> = Annual Pre-Tax Cash Flow / Total Cash Invested
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </GlassCard>

          {/* 6. Dropdown Menu Demo */}
          <GlassCard variant="default" hover>
            <h3 className="text-xl font-semibold text-gray-50 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-400" />
              Dropdown Menu Example
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              ShadCN DropdownMenu for actions and navigation
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" fullWidth icon={<User className="h-4 w-4" />}>
                  User Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-300 border-glass-border backdrop-blur-glass w-56">
                <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-glass-border" />
                <DropdownMenuItem className="text-gray-200 focus:bg-violet-500/20 focus:text-violet-300">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-200 focus:bg-violet-500/20 focus:text-violet-300">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-200 focus:bg-violet-500/20 focus:text-violet-300">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-glass-border" />
                <DropdownMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-300">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pt-8">
          <p className="text-gray-400 text-sm">
            This demo showcases the hybrid approach: PropIQ custom components (Button, GlassCard) +
            ShadCN accessible primitives (Dialog, Input, Select, etc.)
          </p>
          <p className="text-gray-500 text-xs">
            See <code className="px-2 py-1 bg-surface-300 rounded">DESIGN_SYSTEM.md</code> for full documentation
          </p>
        </div>
      </div>
    </div>
  )
}

export default ShadCNDemo
