/**
 * PropIQ Pricing Tier Configuration
 *
 * NEW STRATEGY (Based on SaaS Playbook):
 * - UNLIMITED analyses on all paid tiers (removes friction)
 * - Value-based pricing by features, not limits
 * - Focus on Portfolio Paul: Active buy-and-hold investors
 * - Lower entry price ($49 vs $69) to reduce barrier
 * - Premium positioning for Elite tier ($199)
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
  stripePriceId?: string; // Stripe price ID for checkout
}

// Stripe Price IDs - USAGE-BASED MODEL (Updated Jan 4, 2026)
// Starter: $29/month (20 analyses) | Pro: $79/month (100 analyses) | Elite: $199/month (300 analyses)
export const STRIPE_PRICE_IDS: Record<string, string> = {
  starter: 'price_1Sm54hJogOchEFxvukES6gEC', // $29/month - 20 analyses
  pro: 'price_1Sm55FJogOchEFxvHsjRST1K', // $79/month - 100 analyses
  elite: 'price_1Sm57PJogOchEFxvQypRULNy' // $199/month - 300 analyses
};

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
    propIqLimit: 3,
    cogs: 0.45, // 3 runs × $0.15
    grossMargin: 100, // No revenue, just COGS
    features: [
      '3 trial Deal IQ analyses',
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
    price: 29, // Usage-based pricing - sustainable model
    propIqLimit: 20, // 20 AI analyses per month
    cogs: 3.00, // 20 runs × $0.15 = $3.00
    grossMargin: 89.7, // (29 - 3) / 29 = 89.7%
    features: [
      '20 AI analyses per month',
      'All calculator features',
      'Export reports (PDF)',
      'Mobile & desktop access',
      'Email support',
      'Save analysis history'
    ],
    bestFor: 'New investors (1-3 properties)',
    stripePriceId: STRIPE_PRICE_IDS.starter
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    displayName: 'Pro',
    price: 79,
    propIqLimit: 100, // 100 AI analyses per month - sweet spot
    cogs: 15.00, // 100 runs × $0.15 = $15.00
    grossMargin: 81.0, // (79 - 15) / 79 = 81%
    features: [
      '100 AI analyses per month',
      'Everything in Starter, plus:',
      'Chrome extension (analyze from Zillow)',
      'Export to PDF',
      'Priority support',
      'Market insights',
      'Deal alerts (email notifications)'
    ],
    bestFor: 'Active investors (4-10 properties)',
    isPopular: true, // MOST POPULAR - Portfolio Paul's tier
    stripePriceId: STRIPE_PRICE_IDS.pro
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    displayName: 'Elite',
    price: 199, // Premium tier with high volume
    propIqLimit: 300, // 300 AI analyses per month
    cogs: 45.00, // 300 runs × $0.15 = $45.00
    grossMargin: 77.4, // (199 - 45) / 199 = 77.4%
    features: [
      '300 AI analyses per month',
      'Everything in Pro, plus:',
      'White-label reports (your branding)',
      'API access (integrate with your tools)',
      'Bulk import (100+ properties)',
      'Team collaboration (up to 5 users)',
      '1-on-1 onboarding call',
      'Priority phone + email + chat support',
      'Custom integrations (on request)'
    ],
    bestFor: 'Power users & agents (10+ properties)',
    stripePriceId: STRIPE_PRICE_IDS.elite
  }
};

// Top-Up Packages - For users who exceed monthly limits
export const TOP_UP_PACKAGES: TopUpPackage[] = [
  {
    id: 'topup_10',
    runs: 10,
    price: 15,
    pricePerRun: 1.50 // $15 / 10 = $1.50 per analysis
  },
  {
    id: 'topup_25',
    runs: 25,
    price: 30,
    pricePerRun: 1.20 // $30 / 25 = $1.20 per analysis (20% discount)
  },
  {
    id: 'topup_50',
    runs: 50,
    price: 50,
    pricePerRun: 1.00 // $50 / 50 = $1.00 per analysis (33% discount)
  }
];

// Usage Threshold Configuration
export const USAGE_THRESHOLDS = {
  WARNING_THRESHOLD: 0.75, // Show warning at 75% usage
  UPGRADE_PROMPT_THRESHOLD: 0.90, // Show upgrade prompt at 90% usage
  HARD_CAP: 1.0 // Block usage at 100%
};

// Conversion Micro-Copy (Updated for unlimited model)
export const CONVERSION_COPY = {
  upgrade: {
    title: "Find more deals faster with unlimited analyses",
    description: "Upgrade to analyze as many properties as you want—no limits, no stress.",
    cta: "Upgrade to Unlimited"
  },
  trialEnd: {
    title: "You've used all 3 trial analyses",
    description: "Upgrade to unlimited analyses and never miss a profitable deal. Start at just $49/month.",
    cta: "Get Unlimited Access"
  },
  freeUserPrompt: {
    title: "Ready to analyze more properties?",
    description: "Get UNLIMITED AI analyses starting at $49/month. Find better deals, faster.",
    cta: "See Pricing"
  },
  annualDiscount: {
    title: "Save 20% with annual billing",
    description: "Get 2 months free when you pay annually. Lock in unlimited analyses at a lower price.",
    cta: "Switch to Annual"
  },
  warningBanner: {
    title: "You've used {used} of {total} analyses",
    description: "You're getting close to your limit. Upgrade for unlimited analyses.",
    cta: "Upgrade Now"
  },
  topUp: {
    title: "Get More Analyses",
    description: "Choose a top-up package to continue analyzing properties this month.",
    cta: "Purchase Top-Up"
  }
};

// Usage Policy (Updated for unlimited model)
export const USAGE_POLICY = {
  FREE_TRIAL_LIMIT: 3, // Free users get 3 analyses
  PAID_TIERS_UNLIMITED: true, // All paid tiers have unlimited analyses
  FAIR_USE_POLICY: true, // Prevent abuse (e.g., 1000+ analyses/day)
  FAIR_USE_DAILY_CAP: 500, // Soft cap to prevent API abuse
  RETROACTIVE_CHARGES_DISABLED: true, // No surprise charges
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
