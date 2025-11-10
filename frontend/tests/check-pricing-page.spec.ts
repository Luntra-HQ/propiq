import { test } from '@playwright/test';

test('Check if pricing page is accessible', async ({ page }) => {
  console.log('🌐 Loading https://propiq.luntra.one...');
  await page.goto('https://propiq.luntra.one', { waitUntil: 'networkidle' });

  // Take initial screenshot
  await page.screenshot({
    path: 'screenshots/initial-page.png',
    fullPage: true
  });
  console.log('📸 Initial page screenshot saved');

  // Look for "Upgrade Plan" button
  const upgradePlanButton = page.locator('button:has-text("Upgrade Plan")');
  const upgradePlanExists = await upgradePlanButton.count();
  console.log(`Upgrade Plan button count: ${upgradePlanExists}`);

  if (upgradePlanExists > 0) {
    console.log('🖱️ Clicking Upgrade Plan button...');
    await upgradePlanButton.first().click();
    await page.waitForTimeout(1000);

    // Take screenshot after clicking
    await page.screenshot({
      path: 'screenshots/after-upgrade-click.png',
      fullPage: true
    });
    console.log('📸 After clicking Upgrade Plan screenshot saved');
  }

  // Check for pricing tiers
  const pricingContent = await page.evaluate(() => {
    const body = document.body.innerText;
    return {
      hasStarter: body.includes('Starter') || body.includes('$29'),
      hasPro: body.includes('Pro') && body.includes('$79'),
      hasElite: body.includes('Elite') || body.includes('$199'),
      hasPricing: body.includes('pricing') || body.includes('Pricing'),
      fullText: body.substring(0, 2000)
    };
  });

  console.log('\n📋 Pricing Content Check:');
  console.log(JSON.stringify(pricingContent, null, 2));

  // Check URL
  const url = page.url();
  console.log(`\n🔗 Current URL: ${url}`);
});
