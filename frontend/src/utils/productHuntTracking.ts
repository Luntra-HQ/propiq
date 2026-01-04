/**
 * Product Hunt Analytics Tracking Utilities
 *
 * Dedicated tracking for Product Hunt launch metrics.
 */

export interface PHEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

/**
 * Check if visitor is from Product Hunt
 */
export const isProductHuntTraffic = (): boolean => {
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const ref = urlParams.get('ref');
  const referrer = document.referrer;

  return (
    utmSource === 'producthunt' ||
    ref === 'producthunt' ||
    referrer.includes('producthunt.com')
  );
};

/**
 * Track Product Hunt specific events
 */
export const trackPHEvent = (event: PHEvent): void => {
  const { action, category = 'Product Hunt', label, value } = event;

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      is_product_hunt_traffic: true,
    });
  }

  // Microsoft Clarity custom event
  if (typeof window !== 'undefined' && (window as any).clarity) {
    (window as any).clarity('event', action);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[PH Tracking]', { action, category, label, value });
  }
};

/**
 * Track signup source (Product Hunt vs organic)
 */
export const trackSignupSource = (email: string): void => {
  const isPH = isProductHuntTraffic();

  trackPHEvent({
    action: isPH ? 'ph_signup' : 'organic_signup',
    category: 'Conversion',
    label: isPH ? 'Product Hunt User' : 'Organic User',
  });

  // Store signup source in localStorage for later analysis
  if (isPH) {
    localStorage.setItem('propiq_signup_source', 'producthunt');
    localStorage.setItem('propiq_signup_date', new Date().toISOString());
  }
};

/**
 * Track trial to paid conversion from PH traffic
 */
export const trackPHConversion = (plan: string, amount: number): void => {
  const signupSource = localStorage.getItem('propiq_signup_source');

  if (signupSource === 'producthunt') {
    trackPHEvent({
      action: 'ph_conversion',
      category: 'Revenue',
      label: `Plan: ${plan}`,
      value: amount,
    });

    // Calculate time from signup to conversion
    const signupDate = localStorage.getItem('propiq_signup_date');
    if (signupDate) {
      const signup = new Date(signupDate);
      const now = new Date();
      const hoursToPaid = (now.getTime() - signup.getTime()) / (1000 * 60 * 60);

      trackPHEvent({
        action: 'ph_time_to_conversion',
        category: 'Conversion Metrics',
        label: `${plan} - ${Math.round(hoursToPaid)}h`,
        value: Math.round(hoursToPaid),
      });
    }
  }
};

/**
 * Track feature usage from PH users
 */
export const trackPHFeatureUsage = (feature: string): void => {
  const signupSource = localStorage.getItem('propiq_signup_source');

  if (signupSource === 'producthunt') {
    trackPHEvent({
      action: 'ph_feature_usage',
      category: 'Engagement',
      label: feature,
    });
  }
};

/**
 * Track PH visitor journey milestones
 */
export const trackPHJourneyStep = (step: string): void => {
  if (!isProductHuntTraffic()) return;

  const milestones = [
    'landing_view',
    'demo_interaction',
    'pricing_view',
    'signup_start',
    'signup_complete',
    'first_analysis',
    'upgrade_prompt',
    'conversion',
  ];

  if (milestones.includes(step)) {
    trackPHEvent({
      action: `ph_journey_${step}`,
      category: 'User Journey',
      label: step,
    });
  }
};

/**
 * Get Product Hunt UTM parameters for links
 */
export const getPHUTMParams = (): string => {
  return 'utm_source=producthunt&utm_medium=launch&utm_campaign=ph_launch_2026';
};

/**
 * Track time spent on page for PH visitors
 */
export const trackPHTimeOnSite = (): void => {
  if (!isProductHuntTraffic()) return;

  const startTime = Date.now();

  // Track on page unload
  window.addEventListener('beforeunload', () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000); // in seconds

    trackPHEvent({
      action: 'ph_time_on_site',
      category: 'Engagement',
      label: `${timeSpent}s`,
      value: timeSpent,
    });
  });
};

/**
 * Initialize PH tracking on page load
 */
export const initializePHTracking = (): void => {
  if (!isProductHuntTraffic()) return;

  // Track landing
  trackPHJourneyStep('landing_view');

  // Track time on site
  trackPHTimeOnSite();

  // Mark session as PH traffic
  sessionStorage.setItem('propiq_is_ph_traffic', 'true');

  console.log('[PropIQ] Product Hunt tracking initialized');
};

/**
 * Get PH launch stats (for internal dashboard)
 */
export const getPHLaunchStats = () => {
  // This would typically call your analytics API
  return {
    totalVisitors: 0,
    signups: 0,
    conversions: 0,
    conversionRate: 0,
    averageTimeOnSite: 0,
    topFeatures: [],
  };
};

export default {
  isProductHuntTraffic,
  trackPHEvent,
  trackSignupSource,
  trackPHConversion,
  trackPHFeatureUsage,
  trackPHJourneyStep,
  getPHUTMParams,
  initializePHTracking,
  getPHLaunchStats,
};
