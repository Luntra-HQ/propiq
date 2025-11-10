/**
 * SEO Utilities
 * Sprint 9: User Onboarding & Growth
 *
 * Dynamically update meta tags for different pages/routes
 * Helps with SEO for single-page applications
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

/**
 * Update page meta tags dynamically
 */
export const updateMetaTags = (config: SEOConfig): void => {
  const {
    title,
    description,
    keywords,
    ogImage = 'https://propiq.luntra.one/og-image.jpg',
    ogType = 'website',
    twitterCard = 'summary_large_image',
    canonicalUrl,
    structuredData
  } = config;

  // Update title
  document.title = title;

  // Update or create meta tags
  const metaTags: Record<string, string> = {
    'description': description,
    'og:title': title,
    'og:description': description,
    'og:image': ogImage,
    'og:type': ogType,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': ogImage,
    'twitter:card': twitterCard
  };

  if (keywords) {
    metaTags['keywords'] = keywords;
  }

  // Update existing or create new meta tags
  Object.entries(metaTags).forEach(([name, content]) => {
    const property = name.startsWith('og:') || name.startsWith('twitter:');
    const attribute = property ? 'property' : 'name';
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;

    let element = document.querySelector(selector) as HTMLMetaElement;

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  });

  // Update canonical URL
  if (canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', canonicalUrl);
  }

  // Update structured data
  if (structuredData) {
    updateStructuredData(structuredData);
  }
};

/**
 * Update structured data (JSON-LD)
 */
export const updateStructuredData = (data: Record<string, any>): void => {
  const scriptId = 'dynamic-structured-data';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    ...data
  });
};

/**
 * Pre-configured SEO for common pages
 */
export const pageSEO = {
  home: (): SEOConfig => ({
    title: 'PropIQ - AI Real Estate Investment Analysis | Analyze Properties in 30 Seconds',
    description: 'Analyze any property in 30 seconds with AI-powered insights. Get cap rate, cash flow, ROI calculations instantly. Trusted by 1,000+ investors. Try free.',
    keywords: 'AI real estate analysis, property investment calculator, rental property analyzer, real estate software, cap rate calculator',
    canonicalUrl: 'https://propiq.luntra.one/',
    structuredData: {
      '@type': 'WebPage',
      'name': 'PropIQ - AI Real Estate Investment Analysis',
      'url': 'https://propiq.luntra.one/'
    }
  }),

  calculator: (): SEOConfig => ({
    title: 'Real Estate Deal Calculator | PropIQ - Free Property Analysis Tool',
    description: 'Free real estate deal calculator with cap rate, cash flow, ROI analysis. Run scenarios, 5-year projections, and get instant deal scores. No signup required.',
    keywords: 'real estate calculator, deal calculator, cap rate calculator, cash flow calculator, ROI calculator, property analysis tool',
    canonicalUrl: 'https://propiq.luntra.one/calculator',
    structuredData: {
      '@type': 'WebApplication',
      'name': 'PropIQ Deal Calculator',
      'url': 'https://propiq.luntra.one/calculator',
      'applicationCategory': 'FinanceApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    }
  }),

  pricing: (): SEOConfig => ({
    title: 'PropIQ Pricing - Plans for Real Estate Investors | From $29/month',
    description: 'Choose your PropIQ plan: Free (3 analyses), Starter ($29/mo), Pro ($79/mo), or Elite ($199/mo). All plans include AI analysis, deal calculator, and support.',
    keywords: 'PropIQ pricing, real estate software pricing, property analysis subscription, investor tools pricing',
    canonicalUrl: 'https://propiq.luntra.one/pricing',
    structuredData: {
      '@type': 'WebPage',
      'name': 'PropIQ Pricing',
      'url': 'https://propiq.luntra.one/pricing'
    }
  }),

  analysis: (address?: string): SEOConfig => ({
    title: address
      ? `${address} - Property Analysis | PropIQ`
      : 'Property Analysis | PropIQ - AI Real Estate Investment Tool',
    description: address
      ? `Comprehensive AI-powered analysis for ${address}. View cap rate, cash flow, ROI, deal score, and investment recommendations.`
      : 'Get comprehensive AI-powered property analysis in 30 seconds. Enter any address to see cap rate, cash flow projections, and investment recommendations.',
    keywords: 'property analysis, real estate analysis, investment property evaluation, cap rate, cash flow analysis',
    canonicalUrl: 'https://propiq.luntra.one/analyze'
  }),

  signup: (): SEOConfig => ({
    title: 'Sign Up for PropIQ - Start Analyzing Properties for Free',
    description: 'Create your free PropIQ account and get 3 property analyses. No credit card required. Start making smarter real estate investment decisions today.',
    keywords: 'PropIQ signup, create account, free trial, real estate investment tool',
    canonicalUrl: 'https://propiq.luntra.one/signup',
    ogType: 'website'
  }),

  login: (): SEOConfig => ({
    title: 'Login to PropIQ - AI Real Estate Investment Analysis',
    description: 'Access your PropIQ account to analyze properties, view saved analyses, and manage your subscription.',
    keywords: 'PropIQ login, sign in, real estate analysis login',
    canonicalUrl: 'https://propiq.luntra.one/login'
  })
};

/**
 * Track page views for SEO analytics
 */
export const trackPageView = (path: string, title: string): void => {
  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: title,
      page_location: window.location.href,
      page_path: path
    });
  }

  // Microsoft Clarity
  if (window.clarity) {
    window.clarity('set', 'page', path);
  }
};

/**
 * Generate social sharing URLs
 */
export const getSocialShareUrls = (url: string, title: string): Record<string, string> => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=LUNTRA`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
  };
};

/**
 * Type declarations for window objects
 */
declare global {
  interface Window {
    clarity?: (command: string, ...args: any[]) => void;
  }
}
