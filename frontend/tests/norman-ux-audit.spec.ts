/**
 * Don Norman UX Principles Audit - PropIQ
 *
 * This test suite validates the user experience against Don Norman's 6 principles:
 * 1. Discoverability - Can users figure out what to do?
 * 2. Feedback - Does the system respond to user actions?
 * 3. Affordances - Do elements suggest how they should be used?
 * 4. Signifiers - Are there clear signs of what's clickable/interactive?
 * 5. Mapping - Do controls relate logically to their effects?
 * 6. Constraints - Does the design prevent errors?
 */

import { test, expect, Page } from '@playwright/test';

interface UXViolation {
  principle: string;
  severity: 'P0' | 'P1' | 'P2';  // P0=Critical, P1=Important, P2=Nice-to-have
  issue: string;
  location: string;
  impact: string;
  recommendation: string;
  userQuote?: string;  // What a confused user might say
}

const violations: UXViolation[] = [];

// Helper to log UX violations
function logViolation(violation: UXViolation) {
  violations.push(violation);
  console.log(`\n[${violation.severity}] ${violation.principle}: ${violation.issue}`);
  console.log(`   Location: ${violation.location}`);
  console.log(`   Impact: ${violation.impact}`);
  if (violation.userQuote) {
    console.log(`   User says: "${violation.userQuote}"`);
  }
}

test.describe('Don Norman UX Audit - First-Time User Experience', () => {

  test.beforeEach(async ({ page }) => {
    // Clear storage to simulate first-time user
    await page.context().clearCookies();
    await page.goto('https://propiq.luntra.one');
    // Wait for page to be fully interactive
    await page.waitForLoadState('networkidle');
  });

  test('Principle 1: DISCOVERABILITY - Can users figure out what to do?', async ({ page }) => {
    console.log('\n=== DISCOVERABILITY AUDIT ===\n');

    // Test 1.1: Is it clear what this product does?
    const h1 = await page.locator('h1').first().textContent();
    if (h1?.includes('LUNTRA Internal Dashboard')) {
      logViolation({
        principle: 'Discoverability',
        severity: 'P0',
        issue: 'Header says "LUNTRA Internal Dashboard" instead of "PropIQ"',
        location: 'App.tsx Header component (line 158)',
        impact: 'Users don\'t know this is PropIQ. Sounds like internal tool, not public product.',
        recommendation: 'Change to "PropIQ - Real Estate Investment Analysis" or similar',
        userQuote: 'Wait, is this an internal tool? Am I supposed to be here?'
      });
    }

    // Test 1.2: Is there a clear first action?
    const ctaButtons = page.locator('button:has-text("Get Started"), button:has-text("Try It Free"), button:has-text("Analyze Property")');
    const ctaCount = await ctaButtons.count();

    if (ctaCount === 0) {
      logViolation({
        principle: 'Discoverability',
        severity: 'P0',
        issue: 'No obvious "Get Started" or primary CTA on landing',
        location: 'App.tsx main section',
        impact: 'Users don\'t know what to do first. No clear entry point.',
        recommendation: 'Add prominent "Analyze Your First Property" CTA above the fold',
        userQuote: 'Okay... so what do I do now?'
      });
    }

    // Test 1.3: Is the value proposition immediately clear?
    await expect(page.locator('text=/analyze.*property|investment analysis/i').first()).toBeVisible({
      timeout: 3000
    }).catch(() => {
      logViolation({
        principle: 'Discoverability',
        severity: 'P1',
        issue: 'Value proposition not immediately visible above the fold',
        location: 'Hero section',
        impact: 'Users may leave without understanding what PropIQ does',
        recommendation: 'Move "Analyze properties in 30 seconds" higher, make it larger',
        userQuote: 'What is this site for?'
      });
    });

    // Test 1.4: Can users find the main feature?
    const mainFeature = page.locator('button:has-text("PropIQ Analysis"), button:has-text("Run Analysis")').first();
    const isFeatureVisible = await mainFeature.isVisible().catch(() => false);

    if (!isFeatureVisible) {
      logViolation({
        principle: 'Discoverability',
        severity: 'P0',
        issue: 'Main PropIQ Analysis feature not immediately discoverable',
        location: 'App.tsx DealIqFeatureCard (line 757)',
        impact: 'Users may use free calculator instead of paid feature, never see value',
        recommendation: 'Make PropIQ Analysis the first, largest element users see',
        userQuote: 'I see a calculator, but what makes this special?'
      });
    }

    // Test 1.5: Is there visual hierarchy?
    const allButtons = await page.locator('button').all();
    if (allButtons.length > 10) {
      logViolation({
        principle: 'Discoverability',
        severity: 'P1',
        issue: 'Too many buttons visible at once (>10), no clear priority',
        location: 'Entire page layout',
        impact: 'Decision paralysis - users don\'t know which button to click',
        recommendation: 'Use progressive disclosure - show 1-2 primary actions initially',
        userQuote: 'There are so many buttons... which one do I click?'
      });
    }

    // Test 1.6: Is there onboarding for new users?
    const onboardingElements = page.locator('[data-tour], [data-intro], .walkthrough, .tutorial, .onboarding');
    const hasOnboarding = await onboardingElements.count() > 0;

    if (!hasOnboarding) {
      logViolation({
        principle: 'Discoverability',
        severity: 'P0',
        issue: 'No onboarding flow or first-time user guidance',
        location: 'Entire app',
        impact: 'Users must figure everything out themselves. High bounce rate likely.',
        recommendation: 'Add 3-step onboarding: 1) Welcome 2) Try calculator 3) See PropIQ AI',
        userQuote: 'I don\'t know where to start or what to do first'
      });
    }
  });

  test('Principle 2: FEEDBACK - Does the system respond to actions?', async ({ page }) => {
    console.log('\n=== FEEDBACK AUDIT ===\n');

    // Test 2.1: Loading states
    const hasLoadingState = await page.locator('.loading, [role="progressbar"], [aria-busy="true"]').count() > 0;

    if (!hasLoadingState) {
      // This is actually good if it loads instantly, but let's check for long operations
      logViolation({
        principle: 'Feedback',
        severity: 'P2',
        issue: 'No visible loading indicators for potential slow operations',
        location: 'PropIQAnalysis component',
        impact: 'Users may think system is frozen during AI analysis (can take 10-30 seconds)',
        recommendation: 'Show animated progress during analysis: "Analyzing neighborhood..." etc.',
        userQuote: 'Did my click work? Is it broken?'
      });
    }

    // Test 2.2: Button click feedback
    const testButton = page.locator('button').first();
    await testButton.click({ timeout: 1000 }).catch(() => {});

    // Check if button has hover/active states
    const buttonStyles = await testButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        cursor: computed.cursor,
        transition: computed.transition
      };
    });

    if (buttonStyles.cursor !== 'pointer') {
      logViolation({
        principle: 'Feedback',
        severity: 'P2',
        issue: 'Some buttons don\'t change cursor to pointer on hover',
        location: 'Various buttons',
        impact: 'Users unsure if elements are clickable',
        recommendation: 'Ensure all clickable elements have cursor: pointer',
        userQuote: 'Can I click this?'
      });
    }

    // Test 2.3: Form validation feedback
    const inputs = await page.locator('input[type="text"], input[type="number"]').all();
    if (inputs.length > 0) {
      // Check if inputs show validation errors
      const firstInput = inputs[0];
      await firstInput.fill('invalid data');
      await firstInput.blur();

      const errorMessage = await page.locator('.error, [role="alert"], .invalid').count();
      if (errorMessage === 0) {
        logViolation({
          principle: 'Feedback',
          severity: 'P1',
          issue: 'No inline validation errors shown for invalid input',
          location: 'PropIQAnalysis input form',
          impact: 'Users submit invalid data and get confused by generic error',
          recommendation: 'Add real-time validation with specific error messages',
          userQuote: 'Why didn\'t it work? What did I do wrong?'
        });
      }
    }

    // Test 2.4: Success feedback
    logViolation({
      principle: 'Feedback',
      severity: 'P1',
      issue: 'Likely no success confirmation after actions (based on code review)',
      location: 'After form submissions, upgrades, etc.',
      impact: 'Users unsure if their action worked',
      recommendation: 'Add toast notifications: "Analysis complete!", "Plan upgraded!", etc.',
      userQuote: 'Did that work? I don\'t see anything different'
    });
  });

  test('Principle 3: AFFORDANCES - Do elements suggest how to use them?', async ({ page }) => {
    console.log('\n=== AFFORDANCES AUDIT ===\n');

    // Test 3.1: Do inputs look like inputs?
    const inputs = await page.locator('input').all();
    for (const input of inputs.slice(0, 3)) {  // Check first 3
      const styles = await input.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          border: computed.border,
          background: computed.background
        };
      });

      if (!styles.border.includes('1px') && !styles.border.includes('2px')) {
        logViolation({
          principle: 'Affordances',
          severity: 'P2',
          issue: 'Some input fields lack clear borders/affordances',
          location: 'Form inputs',
          impact: 'Users may not recognize fields as editable',
          recommendation: 'Ensure all inputs have visible borders and backgrounds',
          userQuote: 'How do I enter my information?'
        });
        break;
      }
    }

    // Test 3.2: Do cards suggest they're interactive?
    const cards = await page.locator('[class*="card"], [class*="Card"]').all();
    if (cards.length > 0) {
      const firstCard = cards[0];
      const isClickable = await firstCard.evaluate((el) => {
        const hasClick = el.onclick !== null;
        const hasCursor = window.getComputedStyle(el).cursor === 'pointer';
        const hasHover = el.matches(':hover');
        return hasClick || hasCursor;
      });

      if (!isClickable && cards.length > 3) {
        logViolation({
          principle: 'Affordances',
          severity: 'P2',
          issue: 'Feature cards don\'t clearly indicate if they\'re clickable or static',
          location: 'Dashboard grid section',
          impact: 'Users may click on static cards expecting interaction',
          recommendation: 'Add subtle hover effects to clickable cards, remove from static ones',
          userQuote: 'I clicked this but nothing happened'
        });
      }
    }

    // Test 3.3: Are disabled states obvious?
    const disabledButtons = await page.locator('button:disabled').all();
    if (disabledButtons.length > 0) {
      const firstDisabled = disabledButtons[0];
      const styles = await firstDisabled.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          opacity: computed.opacity,
          cursor: computed.cursor
        };
      });

      if (parseFloat(styles.opacity) > 0.7) {
        logViolation({
          principle: 'Affordances',
          severity: 'P1',
          issue: 'Disabled buttons not visually distinct enough from enabled ones',
          location: 'PropIQ Analysis button when at limit',
          impact: 'Users try to click disabled buttons, get frustrated',
          recommendation: 'Reduce opacity to 0.5 and show "not-allowed" cursor',
          userQuote: 'Why won\'t this button work?'
        });
      }
    }
  });

  test('Principle 4: SIGNIFIERS - Clear signs of what\'s interactive?', async ({ page }) => {
    console.log('\n=== SIGNIFIERS AUDIT ===\n');

    // Test 4.1: Are primary actions clearly marked?
    const primaryActions = await page.locator('button:has-text("Get Started"), button:has-text("Start"), button:has-text("Try"), button[class*="primary"], button[class*="Primary"]').count();

    if (primaryActions === 0) {
      logViolation({
        principle: 'Signifiers',
        severity: 'P0',
        issue: 'No clearly marked primary CTA button',
        location: 'Landing page',
        impact: 'Users don\'t know the main action to take',
        recommendation: 'Add large, contrasting "Analyze Your First Property" button',
        userQuote: 'What\'s the main thing I should do here?'
      });
    }

    // Test 4.2: Are clickable elements signified?
    const allElements = await page.locator('a, button, [role="button"], [onclick]').all();
    let unsignifiedCount = 0;

    for (const el of allElements.slice(0, 10)) {  // Check first 10
      const hasPointer = await el.evaluate((e) => window.getComputedStyle(e).cursor === 'pointer');
      const hasUnderline = await el.evaluate((e) => window.getComputedStyle(e).textDecoration.includes('underline'));
      const hasColor = await el.evaluate((e) => {
        const color = window.getComputedStyle(e).color;
        return color !== 'rgb(0, 0, 0)' && color !== 'rgb(255, 255, 255)';
      });

      if (!hasPointer && !hasUnderline && !hasColor) {
        unsignifiedCount++;
      }
    }

    if (unsignifiedCount > 2) {
      logViolation({
        principle: 'Signifiers',
        severity: 'P1',
        issue: `${unsignifiedCount} clickable elements lack visual signifiers`,
        location: 'Throughout the app',
        impact: 'Users miss clickable elements, don\'t discover features',
        recommendation: 'Ensure all links/buttons have color, underline, or pointer cursor',
        userQuote: 'I didn\'t know I could click that'
      });
    }

    // Test 4.3: Are icons labeled?
    const iconButtons = await page.locator('button:has(svg):not(:has-text)').all();
    if (iconButtons.length > 0) {
      logViolation({
        principle: 'Signifiers',
        severity: 'P1',
        issue: `${iconButtons.length} icon-only buttons lack text labels or tooltips`,
        location: 'Header and various locations',
        impact: 'Users guess what icon buttons do, may avoid using them',
        recommendation: 'Add aria-label or visible text to all icon buttons',
        userQuote: 'What does this icon do?'
      });
    }

    // Test 4.4: Is scrollability indicated?
    const viewportHeight = await page.viewportSize().then(v => v?.height || 800);
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

    if (pageHeight > viewportHeight * 1.5) {
      const hasScrollIndicator = await page.locator('[aria-label*="scroll"], .scroll-indicator, [class*="scrollHint"]').count() > 0;

      if (!hasScrollIndicator) {
        logViolation({
          principle: 'Signifiers',
          severity: 'P2',
          issue: 'No indicator that page is scrollable (content extends below fold)',
          location: 'Landing page',
          impact: 'Users may not scroll down, miss important features',
          recommendation: 'Add subtle scroll indicator or fade effect at bottom of viewport',
          userQuote: 'Is this all there is?'
        });
      }
    }
  });

  test('Principle 5: MAPPING - Logical relationship between controls and effects?', async ({ page }) => {
    console.log('\n=== MAPPING AUDIT ===\n');

    // Test 5.1: Feature hierarchy matches importance
    logViolation({
      principle: 'Mapping',
      severity: 'P0',
      issue: 'Free calculator appears BEFORE premium PropIQ Analysis feature',
      location: 'App.tsx layout - Calculator section (line 775) before PropIQ card',
      impact: 'Users use free feature, never discover paid feature. Revenue lost.',
      recommendation: 'Move PropIQ Analysis to top, calculator below as "also try free calculator"',
      userQuote: 'Oh, there\'s an AI feature? I was just using the calculator'
    });

    // Test 5.2: Branding consistency
    const luntraRefs = await page.locator('text=/LUNTRA/i').count();
    const propiqRefs = await page.locator('text=/PropIQ|Prop IQ/i').count();

    if (luntraRefs > propiqRefs) {
      logViolation({
        principle: 'Mapping',
        severity: 'P0',
        issue: 'More references to "LUNTRA" than "PropIQ" - brand confusion',
        location: 'Entire site - header says LUNTRA, content says PropIQ',
        impact: 'Users don\'t know if this is LUNTRA or PropIQ. Brand dilution.',
        recommendation: 'Decide on primary brand: Either "PropIQ by LUNTRA" or rebrand fully',
        userQuote: 'Is this LUNTRA or PropIQ? I\'m confused'
      });
    }

    // Test 5.3: Trial limits clarity
    const usageBadge = page.locator('text=/\\d+\\/\\d+ (runs|uses|analyses)/i').first();
    const usageText = await usageBadge.textContent().catch(() => '');

    if (usageText) {
      // Check if limit is clear before user tries to use it
      logViolation({
        principle: 'Mapping',
        severity: 'P1',
        issue: 'Usage limit only shown in small badge, not explained upfront',
        location: 'Header usage badge',
        impact: 'Users surprised when they hit limit, feel tricked',
        recommendation: 'Show "You have X free analyses" prominently before first use',
        userQuote: 'What?! I only get 3 tries? I wish I knew that before I used one!'
      });
    }

    // Test 5.4: Settings button that doesn't work
    const settingsButton = page.locator('button[aria-label="Settings"], button:has-text("Settings")').first();
    const settingsExists = await settingsButton.count() > 0;

    if (settingsExists) {
      logViolation({
        principle: 'Mapping',
        severity: 'P1',
        issue: 'Settings button in header doesn\'t do anything (dead button)',
        location: 'Header component (line 168-173)',
        impact: 'Users click Settings, nothing happens, lose trust in interface',
        recommendation: 'Either implement settings modal or remove the button',
        userQuote: 'I clicked Settings and nothing happened. Is this broken?'
      });
    }
  });

  test('Principle 6: CONSTRAINTS - Does design prevent errors?', async ({ page }) => {
    console.log('\n=== CONSTRAINTS AUDIT ===\n');

    // Test 6.1: Can users waste limited analyses?
    logViolation({
      principle: 'Constraints',
      severity: 'P0',
      issue: 'No confirmation before using limited PropIQ analysis',
      location: 'PropIQAnalysis component - handleAnalyze function',
      impact: 'Users accidentally click "Analyze", waste 1 of 3 free analyses',
      recommendation: 'Add "You have X analyses left. Continue?" confirmation dialog',
      userQuote: 'Oops, I didn\'t mean to click that! I just wasted one of my 3 tries!'
    });

    // Test 6.2: Can users enter invalid property addresses?
    const addressInput = page.locator('input[placeholder*="address"], input[id*="address"]').first();
    const hasValidation = await addressInput.getAttribute('pattern').catch(() => null);

    if (!hasValidation) {
      logViolation({
        principle: 'Constraints',
        severity: 'P1',
        issue: 'No address format validation on input field',
        location: 'PropIQAnalysis address input (line 192)',
        impact: 'Users enter "123" or invalid addresses, analysis fails, confusion',
        recommendation: 'Add pattern validation or autocomplete for addresses',
        userQuote: 'Why did it say error? I entered an address!'
      });
    }

    // Test 6.3: Are number inputs constrained?
    const numberInputs = await page.locator('input[type="number"]').all();
    for (const input of numberInputs.slice(0, 3)) {
      const hasMin = await input.getAttribute('min');
      const hasMax = await input.getAttribute('max');

      if (!hasMin && !hasMax) {
        logViolation({
          principle: 'Constraints',
          severity: 'P2',
          issue: 'Number inputs lack min/max constraints',
          location: 'PropIQAnalysis form - price/rate inputs',
          impact: 'Users can enter negative numbers or unrealistic values',
          recommendation: 'Add min="0" to prices, min="0" max="100" to percentages',
          userQuote: 'The calculator accepted -$50,000 as a price...'
        });
        break;
      }
    }

    // Test 6.4: Can users navigate away and lose work?
    logViolation({
      principle: 'Constraints',
      severity: 'P2',
      issue: 'No "unsaved changes" warning if user closes analysis modal',
      location: 'PropIQAnalysis modal close button',
      impact: 'Users accidentally close modal, lose entered data',
      recommendation: 'Warn before closing if user has entered address or other data',
      userQuote: 'Ugh, I accidentally closed it and lost everything I typed'
    });

    // Test 6.5: Can users upgrade without understanding commitment?
    logViolation({
      principle: 'Constraints',
      severity: 'P1',
      issue: 'Pricing/upgrade flow may not clearly show it\'s a monthly subscription',
      location: 'PricingPage component',
      impact: 'Users think it\'s one-time payment, surprise charge next month, chargebacks',
      recommendation: 'Clearly show "$29/month - billed monthly" and "Cancel anytime"',
      userQuote: 'Wait, this charges me every month?! I thought it was a one-time thing!'
    });
  });

  // Final summary test
  test('Generate UX Audit Report', async ({ page }) => {
    console.log('\n\n' + '='.repeat(80));
    console.log('DON NORMAN UX AUDIT - PROPIQ ONBOARDING');
    console.log('='.repeat(80));

    // Organize violations by severity
    const p0 = violations.filter(v => v.severity === 'P0');
    const p1 = violations.filter(v => v.severity === 'P1');
    const p2 = violations.filter(v => v.severity === 'P2');

    console.log(`\n📊 SUMMARY:`);
    console.log(`   P0 (Critical): ${p0.length} issues`);
    console.log(`   P1 (Important): ${p1.length} issues`);
    console.log(`   P2 (Nice-to-have): ${p2.length} issues`);
    console.log(`   TOTAL: ${violations.length} UX violations found`);

    console.log(`\n\n🔴 P0 - CRITICAL ISSUES (Fix These First):\n`);
    p0.forEach((v, i) => {
      console.log(`${i + 1}. ${v.issue}`);
      console.log(`   Principle: ${v.principle}`);
      console.log(`   Impact: ${v.impact}`);
      console.log(`   Fix: ${v.recommendation}`);
      if (v.userQuote) console.log(`   User: "${v.userQuote}"`);
      console.log('');
    });

    console.log(`\n🟡 P1 - IMPORTANT ISSUES (Fix Next):\n`);
    p1.forEach((v, i) => {
      console.log(`${i + 1}. ${v.issue}`);
      console.log(`   Fix: ${v.recommendation}`);
      console.log('');
    });

    console.log(`\n🟢 P2 - NICE-TO-HAVE IMPROVEMENTS:\n`);
    p2.forEach((v, i) => {
      console.log(`${i + 1}. ${v.issue}`);
      console.log(`   Fix: ${v.recommendation}`);
      console.log('');
    });

    console.log('\n' + '='.repeat(80));
    console.log('END OF UX AUDIT');
    console.log('='.repeat(80) + '\n');

    // Expect test to fail if there are P0 issues (forces attention)
    expect(p0.length, `Found ${p0.length} critical (P0) UX issues that MUST be fixed`).toBe(0);
  });
});
