import { useEffect } from 'react';

/**
 * SEO Component for Dynamic Meta Tags
 *
 * This component updates page meta tags dynamically for better SEO in React SPAs.
 * Use this component on different pages/routes to customize meta information.
 *
 * @example
 * ```tsx
 * <SEO
 *   title="Pricing Plans - PropIQ"
 *   description="Choose the perfect PropIQ plan for your real estate investment needs. Plans from $29/month."
 *   keywords="PropIQ pricing, real estate software pricing, property analysis subscription"
 *   canonical="https://propiq.luntra.one/pricing"
 * />
 * ```
 */

interface SEOProps {
  /** Page title (will be appended with " | PropIQ by LUNTRA" if not already present) */
  title?: string;

  /** Meta description (150-160 characters recommended for optimal display in search results) */
  description?: string;

  /** Keywords for the page (comma-separated string) */
  keywords?: string;

  /** Canonical URL for this page (helps prevent duplicate content issues) */
  canonical?: string;

  /** Open Graph image URL (for social media sharing - 1200x630px recommended) */
  ogImage?: string;

  /** Open Graph type (defaults to 'website') */
  ogType?: 'website' | 'article' | 'product';

  /** Twitter card type (defaults to 'summary_large_image') */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';

  /** Whether this page should be indexed by search engines (defaults to true) */
  noIndex?: boolean;

  /** Whether search engines should follow links on this page (defaults to true) */
  noFollow?: boolean;

  /** Structured data JSON-LD object (will be stringified and added to page) */
  structuredData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  noFollow = false,
  structuredData,
}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      const fullTitle = title.includes('PropIQ')
        ? title
        : `${title} | PropIQ by LUNTRA`;
      document.title = fullTitle;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Update description
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
      updateMetaTag('twitter:description', description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update canonical URL
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', canonical);

      // Also update OG and Twitter URLs
      updateMetaTag('og:url', canonical, true);
      updateMetaTag('twitter:url', canonical);
    }

    // Update Open Graph title
    if (title) {
      const ogTitle = title.includes('PropIQ') ? title : `${title} | PropIQ`;
      updateMetaTag('og:title', ogTitle, true);
      updateMetaTag('twitter:title', ogTitle);
    }

    // Update Open Graph image
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
      updateMetaTag('twitter:image', ogImage);
    }

    // Update Open Graph type
    updateMetaTag('og:type', ogType, true);

    // Update Twitter card type
    updateMetaTag('twitter:card', twitterCard);

    // Update robots meta tag
    const robotsContent = [];
    if (noIndex) robotsContent.push('noindex');
    else robotsContent.push('index');

    if (noFollow) robotsContent.push('nofollow');
    else robotsContent.push('follow');

    robotsContent.push('max-image-preview:large', 'max-snippet:-1', 'max-video-preview:-1');
    updateMetaTag('robots', robotsContent.join(', '));
    updateMetaTag('googlebot', robotsContent.join(', '));

    // Add structured data if provided
    if (structuredData) {
      let scriptElement = document.querySelector('script[data-dynamic-structured-data]');

      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        scriptElement.setAttribute('data-dynamic-structured-data', 'true');
        document.head.appendChild(scriptElement);
      }

      scriptElement.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function to remove dynamic structured data when component unmounts
    return () => {
      const scriptElement = document.querySelector('script[data-dynamic-structured-data]');
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [title, description, keywords, canonical, ogImage, ogType, twitterCard, noIndex, noFollow, structuredData]);

  // This component doesn't render anything
  return null;
};

/**
 * Pre-configured SEO components for common pages
 */

export const HomeSEO = () => (
  <SEO
    title="PropIQ - AI Real Estate Investment Analysis | Analyze Properties in 30 Seconds"
    description="Analyze any property in 30 seconds with AI-powered insights. Get cap rate, cash flow, ROI calculations instantly. Trusted by real estate investors. Try free."
    keywords="AI real estate investment analysis, property investment calculator, rental property analysis, real estate deal analyzer"
    canonical="https://propiq.luntra.one/"
    ogImage="https://propiq.luntra.one/og-image.jpg"
  />
);

export const PricingSEO = () => (
  <SEO
    title="Pricing Plans - PropIQ Real Estate Investment Analysis"
    description="Choose the perfect PropIQ plan for your investment needs. Plans from $29/month with 3 free trial analyses. Analyze properties with AI-powered insights."
    keywords="PropIQ pricing, real estate software pricing, property analysis subscription, real estate investment tool cost"
    canonical="https://propiq.luntra.one/pricing"
    ogImage="https://propiq.luntra.one/og-image.jpg"
    structuredData={{
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "PropIQ Pricing Plans",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "29",
        "highPrice": "199",
        "priceCurrency": "USD",
        "offerCount": "3"
      }
    }}
  />
);

export const CalculatorSEO = () => (
  <SEO
    title="Real Estate Investment Calculator - Free Property Analysis Tool | PropIQ"
    description="Free real estate investment calculator. Calculate cap rate, cash flow, ROI, and more. Professional-grade property analysis in 30 seconds. Try PropIQ free."
    keywords="real estate calculator, cap rate calculator, cash flow calculator, ROI calculator, property investment calculator, rental property calculator"
    canonical="https://propiq.luntra.one/calculator"
    ogImage="https://propiq.luntra.one/og-image.jpg"
    structuredData={{
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "PropIQ Real Estate Calculator",
      "applicationCategory": "FinanceApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }}
  />
);

export default SEO;
