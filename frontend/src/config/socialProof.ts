/**
 * Social Proof Configuration
 * Single source of truth for all social proof numbers across the landing page
 *
 * IMPORTANT: Update these numbers as your metrics grow.
 * Keep them realistic and verifiable.
 */

export const SOCIAL_PROOF = {
  // User metrics
  investorCount: 500,
  investorCountFormatted: '500+',

  // Property analysis metrics
  propertiesAnalyzed: 10000,
  propertiesAnalyzedFormatted: '10,000+',

  // Deal value analyzed (use conservative estimates)
  dealsValueAnalyzed: 2500000,
  dealsValueFormatted: '$2.5M+',

  // Rating metrics
  rating: 4.9,
  ratingFormatted: '4.9/5',
  maxRating: 5,
  reviewCount: 127,
  ratingCount: 127, // Same as reviewCount for now

  // Free trial offer
  freeTrialCount: 3,
  freeTrialText: '3 free analyses included',

  // Trust badges
  trustBadges: [
    { text: 'No credit card required', icon: 'shield' },
    { text: 'Cancel anytime', icon: 'check' },
    { text: 'Bank-level security', icon: 'lock' },
  ]
} as const;

/**
 * Helper functions for formatting social proof
 */
export const formatters = {
  /**
   * Format large numbers with K/M suffix
   */
  formatNumber: (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  },

  /**
   * Format currency values
   */
  formatCurrency: (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  },

  /**
   * Format rating with stars
   */
  formatRating: (rating: number): string => {
    return `${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}`;
  }
};
