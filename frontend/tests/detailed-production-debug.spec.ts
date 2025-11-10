import { test } from '@playwright/test';

test('Detailed production debugging', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const networkFailures: any[] = [];

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[${msg.type()}]`, text);
    if (msg.type() === 'error') errors.push(text);
    if (msg.type() === 'warning') warnings.push(text);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log('❌ PAGE ERROR:', error.message);
    errors.push(error.message);
  });

  // Capture network failures
  page.on('requestfailed', request => {
    const failure = {
      url: request.url(),
      method: request.method(),
      errorText: request.failure()?.errorText
    };
    console.log('❌ NETWORK FAILURE:', failure);
    networkFailures.push(failure);
  });

  console.log('\n🌐 Loading https://propiq.luntra.one...\n');

  await page.goto('https://propiq.luntra.one', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('\n⏳ Waiting 5 seconds for any delayed errors...\n');
  await page.waitForTimeout(5000);

  // Check what's actually in the DOM
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return {
      exists: !!root,
      innerHTML: root?.innerHTML?.substring(0, 500),
      childrenCount: root?.children.length || 0,
      classList: Array.from(root?.classList || [])
    };
  });

  console.log('\n📦 ROOT DIV ANALYSIS:');
  console.log(JSON.stringify(rootContent, null, 2));

  // Check computed styles
  const hasStyles = await page.evaluate(() => {
    const body = document.body;
    const computed = window.getComputedStyle(body);
    return {
      bodyBackground: computed.backgroundColor,
      bodyFont: computed.fontFamily,
      bodyMargin: computed.margin
    };
  });

  console.log('\n🎨 COMPUTED STYLES:');
  console.log(JSON.stringify(hasStyles, null, 2));

  // Check if CSS loaded
  const cssLoaded = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    return links.map(link => ({
      href: (link as HTMLLinkElement).href,
      loaded: (link as HTMLLinkElement).sheet !== null
    }));
  });

  console.log('\n📄 CSS FILES:');
  console.log(JSON.stringify(cssLoaded, null, 2));

  // Check if JS loaded
  const scriptsLoaded = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.map(script => ({
      src: (script as HTMLScriptElement).src,
      type: (script as HTMLScriptElement).type
    }));
  });

  console.log('\n📜 JS FILES:');
  console.log(JSON.stringify(scriptsLoaded, null, 2));

  // Summary
  console.log('\n\n📊 SUMMARY:');
  console.log(`❌ Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('Error details:');
    errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }

  console.log(`⚠️  Warnings: ${warnings.length}`);
  if (warnings.length > 0) {
    console.log('Warning details:');
    warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
  }

  console.log(`🌐 Network Failures: ${networkFailures.length}`);
  if (networkFailures.length > 0) {
    console.log('Network failure details:');
    networkFailures.forEach((fail, i) => console.log(`  ${i + 1}. ${fail.url} - ${fail.errorText}`));
  }

  await page.screenshot({
    path: 'screenshots/production-debug.png',
    fullPage: true
  });
  console.log('\n📸 Screenshot saved to screenshots/production-debug.png');
});
