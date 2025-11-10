/**
 * LUNTRA Pricing Tier Configuration
 *
 * Based on Product Pro GPT recommendations:
 * - All tiers maintain >75% gross margin
 * - Deal IQ COGS: $0.15 per run
 * - Top-up pricing: $5 for 10 additional runs
 * - Hard caps on tier limits to prevent unprofitable usage
 */

export interface PricingTier {
  id: 'free' | 'starter' | 'pro' | 'elite';
  name: string;
  displayName: string;
  price: number; // Monthly price in USD
  propIqLimit: number; // Monthly Deal IQ analysis runs
  cogs: number; // Total monthly COGS at full usage
  grossMargin: number; // Gross margin percentage
  features: string[];
  bestFor: string;
  isPopular?: boolean;
}

export interface TopUpPackage {
  id: string;
  runs: number;
  price: number;
  pricePerRun: number;
}

// Pricing Tier Definitions
export const PRICING_TIERS: Record<string, PricingTier> = {
  free: {
    id: 'free',
    name: 'Free Trial',
    displayName: 'Free Trial',
    price: 0,
    propIqLimit: 5,
    cogs: 0.75, // 5 runs × $0.15
    grossMargin: 100, // No revenue, just COGS
    features: [
      '5 Deal IQ analyses',
      'Unlimited Deal Calculator',
      'Full mobile and desktop access',
      'Basic usage dashboard',
      'Email support'
    ],
    bestFor: 'Testing the platform before committing'
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    displayName: 'Starter',
    price: 69,
    propIqLimit: 30,
    cogs: 4.50, // 30 runs × $0.15
    grossMargin: 93.5,
    features: [
      '30 Deal IQ analyses/month',
      'Unlimited Deal Calculator',
      'Full mobile and desktop access',
      'Usage dashboard with insights',
      'Priority email support',
      'Top-ups: $5 for 10 more runs'
    ],
    bestFor: 'Newer investors testing 5–10 deals/week'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    displayName: 'Pro',
    price: 99,
    propIqLimit: 60,
    cogs: 9.00, // 60 runs × $0.15
    grossMargin: 90.9,
    features: [
      '60 Deal IQ analyses/month',
      'Unlimited Deal Calculator',
      'Full mobile and desktop access',
      'Advanced usage dashboard',
      'Priority email + chat support',
      'Top-ups: $5 for 10 more runs',
      'Export analysis reports (PDF)'
    ],
    bestFor: 'Active investors evaluating 2+ properties/day',
    isPopular: true
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    displayName: 'Elite',
    price: 149,
    propIqLimit: 100,
    cogs: 15.00, // 100 runs × $0.15
    grossMargin: 89.9,
    features: [
      '100 Deal IQ analyses/month',
      'Unlimited Deal Calculator',
      'Full mobile and desktop access',
      'Premium usage dashboard',
      'Priority email + chat + phone support',
      'Top-ups: $5 for 10 more runs',
      'Export analysis reports (PDF, CSV)',
      'API access (coming soon)',
      'Team collaboration (up to 3 users)'
    ],
    bestFor: 'Power users analyzing >3/day or small teams'
  }
};

// Top-Up Packages
export const TOP_UP_PACKAGES: TopUpPackage[] = [
  {
    id: 'topup_10',
    runs: 10,
    price: 5,
    pricePerRun: 0.50
  },
  {
    id: 'topup_25',
    runs: 25,
    price: 11,
    pricePerRun: 0.44 // 12% bulk discount
  },
  {
    id: 'topup_50',
    runs: 50,
    price: 20,
    pricePerRun: 0.40 // 20% bulk discount
  }
];

// Usage Threshold Configuration
export const USAGE_THRESHOLDS = {
  WARNING_THRESHOLD: 0.75, // Show warning at 75% usage
  UPGRADE_PROMPT_THRESHOLD: 0.90, // Show upgrade prompt at 90% usage
  HARD_CAP: 1.0 // Block usage at 100%
};

// Conversion Micro-Copy
export const CONVERSION_COPY = {
  upgrade: {
    title: "Don't let Deal IQ slow you down",
    description: "Looks like you're on a roll—add more in one click.",
    cta: "Upgrade Now"
  },
  topUp: {
    title: "Keep analyzing without limits",
    description: "Just $0.50 per analysis—cheaper than your daily coffee ☕",
    cta: "Buy 10 More"
  },
  trialEnd: {
    title: "Your next deal is waiting",
    description: "Unlock full power with Pro and never miss a great opportunity.",
    cta: "Unlock Full Power"
  },
  warningBanner: {
    title: "You've used {used} of {total} Deal IQ runs this month",
    description: "Upgrade now or buy 10 more for $5.",
    cta: "View Options"
  }
};

// Financial Risk Mitigation
export const RISK_MITIGATION = {
  HARD_CAP_ENABLED: true, // Enforce hard caps on all tiers
  SOFT_NUDGE_ENABLED: true, // Show nudges before hitting limit
  RETROACTIVE_CHARGES_DISABLED: true, // No surprise charges
  OVERAGE_ALLOWED: false // Must upgrade or buy top-up before continuing
};

// Helper Functions
export function getTierById(tierId: string): PricingTier | undefined {
  return PRICING_TIERS[tierId];
}

export function getNextTier(currentTierId: string): PricingTier | null {
  const tierOrder = ['free', 'starter', 'pro', 'elite'];
  const currentIndex = tierOrder.indexOf(currentTierId);

  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return null; // Already at highest tier
  }

  return PRICING_TIERS[tierOrder[currentIndex + 1]];
}

export function calculateUsagePercentage(used: number, limit: number): number {
  return (used / limit) * 100;
}

export function shouldShowWarning(used: number, limit: number): boolean {
  const percentage = calculateUsagePercentage(used, limit);
  return percentage >= USAGE_THRESHOLDS.WARNING_THRESHOLD * 100;
}

export function shouldShowUpgradePrompt(used: number, limit: number): boolean {
  const percentage = calculateUsagePercentage(used, limit);
  return percentage >= USAGE_THRESHOLDS.UPGRADE_PROMPT_THRESHOLD * 100;
}

export function isAtHardCap(used: number, limit: number): boolean {
  return used >= limit;
}

export function getRemainingRuns(used: number, limit: number): number {
  return Math.max(0, limit - used);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatUsageString(used: number, limit: number): string {
  const remaining = getRemainingRuns(used, limit);
  return `${remaining} of ${limit} runs remaining`;
}
