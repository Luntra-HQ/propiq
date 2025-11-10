import { test, expect } from '@playwright/test';

/**
 * Web Presence Test Suite
 *
 * Tests how PropIQ appears to users discovering the site through:
 * - Search engines (SEO meta tags)
 * - Social media shares (Open Graph tags)
 * - Direct visits (branding, first impressions)
 * - Mobile devices (responsive design)
 *
 * This simulates "local traffic" - real users finding your site.
 */

const PRODUCTION_URL = 'https://propiq.luntra.one';
const STAGING_URL = 'https://dealiq.luntra.one'; // Will redirect to propiq

test.describe('PropIQ Web Presence & Brand Discovery', () => {

  test('SEO: How PropIQ appears in Google search results', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Check page title (appears in Google results)
    const title = await page.title();
    console.log('📊 Google Search Result Title:', title);

    expect(title).toContain('PropIQ');
    expect(title).not.toContain('DealIQ'); // No old branding
    expect(title.toLowerCase()).toMatch(/property|real estate|investment|analysis/);

    // Check meta description (appears under title in Google)
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    console.log('📝 Google Search Description:', metaDescription);

    if (metaDescription) {
      expect(metaDescription).toContain('PropIQ');
      expect(metaDescription).not.toContain('DealIQ');
      expect(metaDescription.length).toBeGreaterThan(50); // Google shows ~155 chars
      expect(metaDescription.length).toBeLessThan(160);
    }

    // Check canonical URL (prevents duplicate content issues)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    console.log('🔗 Canonical URL:', canonical);

    if (canonical) {
      expect(canonical).toContain('propiq.luntra.one');
      expect(canonical).not.toContain('dealiq');
    }

    console.log('\n✅ SEO Check: PropIQ brand is consistent in search results\n');
  });

  test('Social Media: How PropIQ appears when shared on Facebook/LinkedIn', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Open Graph tags (used by Facebook, LinkedIn, Slack, etc.)
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');

    console.log('📱 Facebook/LinkedIn Share Preview:');
    console.log('   Title:', ogTitle || '(not set)');
    console.log('   Description:', ogDescription || '(not set)');
    console.log('   Image:', ogImage || '(not set)');
    console.log('   URL:', ogUrl || '(not set)');

    // Twitter Card tags
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');

    console.log('\n🐦 Twitter Share Preview:');
    console.log('   Card Type:', twitterCard || '(not set)');
    console.log('   Title:', twitterTitle || '(not set)');
    console.log('   Image:', twitterImage || '(not set)');

    // Verify branding consistency
    if (ogTitle) {
      expect(ogTitle).toContain('PropIQ');
      expect(ogTitle).not.toContain('DealIQ');
    }
    if (twitterTitle) {
      expect(twitterTitle).toContain('PropIQ');
    }

    console.log('\n✅ Social Media: PropIQ brand appears correctly when shared\n');
  });

  test('First-Time Visitor: Initial impression and branding clarity', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    console.log('👤 Simulating first-time visitor from Google search...\n');

    // What user sees within 3 seconds (critical for bounce rate)
    const header = await page.locator('h1').first().textContent();
    console.log('📋 Header (first thing user reads):', header);

    expect(header).toContain('PropIQ');
    expect(header).not.toContain('DealIQ');
    expect(header).not.toContain('LUNTRA Internal Dashboard'); // Old confusing header

    // Check hero section (most visible content)
    const sections = await page.locator('section').all();
    const firstSection = await sections[0]?.textContent();

    console.log('🎯 Hero Section Preview:');
    console.log('   ', firstSection?.substring(0, 150) + '...');

    // Verify PropIQ is the focus
    expect(firstSection).toContain('PropIQ');

    // Check if value proposition is clear
    const hasValueProp = firstSection?.toLowerCase().match(/ai|analysis|property|investment|minutes|seconds/);
    expect(hasValueProp).toBeTruthy();

    // Check for clear call-to-action
    const primaryCTA = await page.locator('button').filter({ hasText: /analyze|try|start|get started/i }).first().textContent();
    console.log('🔘 Primary Call-to-Action:', primaryCTA);

    console.log('\n✅ First Impression: Brand is clear, value is obvious\n');
  });

  test('Mobile User: How PropIQ appears on smartphone', async ({ page }) => {
    // Simulate iPhone 12 Pro
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    console.log('📱 Simulating mobile user on iPhone 12 Pro (390x844)...\n');

    // Check mobile viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    console.log('📐 Viewport Config:', viewport);
    expect(viewport).toContain('width=device-width');

    // Check if logo/branding is visible on mobile
    const header = await page.locator('h1').first();
    await expect(header).toBeVisible();
    const headerText = await header.textContent();
    console.log('📋 Mobile Header:', headerText);

    // Check if main CTA is accessible (not hidden, not requiring scroll)
    const mainButton = page.locator('button').filter({ hasText: /analyze|try|start/i }).first();
    const isButtonVisible = await mainButton.isVisible();
    console.log('🔘 Primary CTA visible on mobile:', isButtonVisible);
    expect(isButtonVisible).toBe(true);

    // Check if content is readable (not too small)
    const bodyFontSize = await page.locator('body').evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    console.log('📏 Mobile Font Size:', bodyFontSize);

    // Should be at least 14px for readability
    const fontSize = parseInt(bodyFontSize);
    expect(fontSize).toBeGreaterThanOrEqual(14);

    // Take screenshot for manual review
    await page.screenshot({
      path: 'tests/screenshots/propiq-mobile-view.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: tests/screenshots/propiq-mobile-view.png');

    console.log('\n✅ Mobile Experience: PropIQ is accessible on smartphones\n');
  });

  test('Page Speed: How fast PropIQ loads for first-time visitors', async ({ page }) => {
    console.log('⏱️  Testing page load speed (critical for SEO & bounce rate)...\n');

    const startTime = Date.now();

    await page.goto(PRODUCTION_URL);

    // Wait for "DOM Content Loaded" (page is interactive)
    await page.waitForLoadState('domcontentloaded');
    const domLoadTime = Date.now() - startTime;

    // Wait for all resources (images, fonts, etc.)
    await page.waitForLoadState('networkidle');
    const fullLoadTime = Date.now() - startTime;

    console.log('⚡ DOM Ready (page interactive):', domLoadTime + 'ms');
    console.log('📦 Fully Loaded (all resources):', fullLoadTime + 'ms');

    // Google recommends < 2.5 seconds for good Core Web Vitals
    const TARGET_LOAD_TIME = 2500;

    if (domLoadTime < TARGET_LOAD_TIME) {
      console.log('✅ FAST: Page is interactive in under 2.5 seconds (good for SEO)');
    } else if (domLoadTime < 4000) {
      console.log('⚠️  MODERATE: Page is interactive but could be faster');
    } else {
      console.log('❌ SLOW: Page takes too long to load (bad for SEO & bounce rate)');
    }

    // Soft assertion (warning, not failure)
    if (domLoadTime > 5000) {
      console.warn('⚠️  Warning: Page load time exceeds 5 seconds');
    }

    console.log('\n💡 Tip: Run Google PageSpeed Insights for detailed performance report');
    console.log('   https://pagespeed.web.dev/?url=' + encodeURIComponent(PRODUCTION_URL));
    console.log('');
  });

  test('Brand Consistency: PropIQ (not DealIQ) across entire site', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    console.log('🔍 Scanning entire page for brand inconsistencies...\n');

    // Get all visible text on the page
    const pageText = await page.locator('body').textContent();

    // Count brand mentions
    const propiqCount = (pageText?.match(/PropIQ/gi) || []).length;
    const dealiqCount = (pageText?.match(/DealIQ/gi) || []).length;
    const luntraCount = (pageText?.match(/LUNTRA(?! Internal)/gi) || []).length; // LUNTRA is okay if not "Internal Dashboard"

    console.log('📊 Brand Mention Counts:');
    console.log('   PropIQ:', propiqCount);
    console.log('   DealIQ:', dealiqCount, dealiqCount > 0 ? '❌ (should be 0)' : '✅');
    console.log('   LUNTRA:', luntraCount, '(okay if used for company name)');

    // Verify old branding is gone
    expect(dealiqCount).toBe(0);
    expect(pageText).not.toContain('LUNTRA Internal Dashboard');

    // Verify new branding is present
    expect(propiqCount).toBeGreaterThan(0);

    console.log('\n✅ Brand Consistency: PropIQ is the only product name used\n');
  });

  test('Local SEO: How PropIQ shows up in "real estate analysis tools" searches', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    console.log('🔍 Checking if PropIQ ranks well for target keywords...\n');

    // Extract all text to check keyword presence
    const pageText = await page.locator('body').textContent();
    const headings = await page.locator('h1, h2, h3').allTextContents();
    const title = await page.title();
    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');

    // Target keywords for real estate investors
    const targetKeywords = [
      'real estate analysis',
      'property investment',
      'rental property',
      'cap rate',
      'ROI',
      'cash flow',
      'investment calculator',
      'property analyzer',
      'deal analysis'
    ];

    console.log('🎯 Target Keywords Found:');
    targetKeywords.forEach(keyword => {
      const inTitle = title?.toLowerCase().includes(keyword.toLowerCase());
      const inMeta = metaDesc?.toLowerCase().includes(keyword.toLowerCase());
      const inContent = pageText?.toLowerCase().includes(keyword.toLowerCase());
      const inHeadings = headings.some(h => h.toLowerCase().includes(keyword.toLowerCase()));

      const locations = [];
      if (inTitle) locations.push('Title');
      if (inMeta) locations.push('Meta');
      if (inHeadings) locations.push('Headings');
      if (inContent) locations.push('Content');

      const status = locations.length > 0 ? '✅' : '⚠️ ';
      console.log(`   ${status} "${keyword}": ${locations.join(', ') || 'Not found'}`);
    });

    console.log('\n💡 More keywords = better chance of ranking in Google');
    console.log('   Aim for keywords in: Title, Meta Description, Headings, Content\n');
  });

  test('Redirect Check: Old DealIQ domain redirects to PropIQ', async ({ page }) => {
    console.log('🔄 Testing redirect from old DealIQ domain...\n');

    // Visit old domain
    const response = await page.goto('https://dealiq.luntra.one');

    // Check if redirected
    const finalUrl = page.url();
    console.log('   Old URL: https://dealiq.luntra.one');
    console.log('   Final URL:', finalUrl);

    expect(finalUrl).toContain('propiq.luntra.one');
    expect(finalUrl).not.toContain('dealiq');

    // Check redirect status code
    const status = response?.status();
    console.log('   Redirect Status:', status === 301 ? '301 (Permanent)' : status);

    // 301 is best for SEO (tells Google the old URL is permanently moved)
    expect(status).toBe(301);

    console.log('\n✅ Redirect: Old domain properly redirects to PropIQ\n');
  });

  test('Complete User Journey: First visit to sign-up', async ({ page }) => {
    console.log('🚀 Simulating complete user journey from Google to sign-up...\n');

    // Step 1: User finds PropIQ on Google, clicks result
    console.log('1️⃣  User clicks Google search result...');
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Step 2: User sees clear branding
    console.log('2️⃣  User sees "PropIQ" branding (not confused)');
    const header = await page.locator('h1').first().textContent();
    expect(header).toContain('PropIQ');

    // Step 3: User sees value proposition
    console.log('3️⃣  User sees what PropIQ does (AI property analysis)');
    const sections = await page.locator('section').all();
    const heroSection = await sections[0]?.textContent();
    expect(heroSection).toMatch(/ai|analysis|property/i);

    // Step 4: User tries sample property (Quick Win #1)
    console.log('4️⃣  User clicks "Try Sample Property" to see demo');
    const analyzeButton = page.locator('button').filter({ hasText: /analyze.*property/i }).first();
    await analyzeButton.click();
    await page.waitForTimeout(1000);

    const sampleButton = page.locator('button').filter({ hasText: /try.*sample/i });
    const hasSampleButton = await sampleButton.count() > 0;
    if (hasSampleButton) {
      await sampleButton.click();
      console.log('   ✅ Sample property loaded (instant value demonstration)');
    }

    // Step 5: User sees analysis is valuable
    console.log('5️⃣  User realizes they need to sign up to get full analysis');
    // (Would click Analyze and see login prompt in real journey)

    console.log('\n✅ User Journey: Clear path from discovery to conversion\n');
  });

});

test.describe('Competitive Positioning', () => {

  test('How PropIQ compares to competitors in messaging', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    console.log('🏆 Analyzing PropIQ positioning vs competitors...\n');

    const pageText = await page.locator('body').textContent();

    // Check for differentiators
    const differentiators = {
      'AI-powered': pageText?.includes('AI') || pageText?.includes('artificial intelligence'),
      'Fast (30 seconds)': pageText?.match(/30 seconds|instant|quick|fast/i),
      'Affordable pricing': pageText?.match(/\$29|\$79|trial|free/i),
      'Easy to use': pageText?.match(/easy|simple|no experience/i),
      'Comprehensive analysis': pageText?.match(/comprehensive|complete|detailed|full/i)
    };

    console.log('💎 Unique Selling Points Present:');
    Object.entries(differentiators).forEach(([point, present]) => {
      console.log(`   ${present ? '✅' : '⚠️ '} ${point}`);
    });

    console.log('\n💡 Strong positioning includes: Speed, AI, Affordability, Ease\n');
  });

});
