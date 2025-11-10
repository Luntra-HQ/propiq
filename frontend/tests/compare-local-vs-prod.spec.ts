import { test } from '@playwright/test';

test('Compare local vs production', async ({ browser }) => {
  // Create two pages
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const localPage = await context.newPage();
  const prodPage = await context.newPage();

  console.log('📸 Capturing LOCAL (http://localhost:5173)...');
  await localPage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  await localPage.waitForTimeout(3000); // Wait for any animations
  await localPage.screenshot({
    path: 'screenshots/local-version.png',
    fullPage: true
  });
  console.log('✅ Local screenshot saved: screenshots/local-version.png');

  console.log('\n📸 Capturing PRODUCTION (https://propiq.luntra.one)...');
  await prodPage.goto('https://propiq.luntra.one', { waitUntil: 'networkidle', timeout: 30000 });
  await prodPage.waitForTimeout(3000); // Wait for any animations
  await prodPage.screenshot({
    path: 'screenshots/production-version.png',
    fullPage: true
  });
  console.log('✅ Production screenshot saved: screenshots/production-version.png');

  // Get CSS files being loaded
  console.log('\n🔍 LOCAL CSS FILES:');
  const localStyles = await localPage.evaluate(() => {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(el => {
      if (el.tagName === 'LINK') {
        return { type: 'link', href: (el as HTMLLinkElement).href };
      } else {
        return { type: 'style', length: (el as HTMLStyleElement).textContent?.length || 0 };
      }
    });
  });
  console.log(JSON.stringify(localStyles, null, 2));

  console.log('\n🔍 PRODUCTION CSS FILES:');
  const prodStyles = await prodPage.evaluate(() => {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(el => {
      if (el.tagName === 'LINK') {
        return { type: 'link', href: (el as HTMLLinkElement).href };
      } else {
        return { type: 'style', length: (el as HTMLStyleElement).textContent?.length || 0 };
      }
    });
  });
  console.log(JSON.stringify(prodStyles, null, 2));

  // Check for Tailwind classes in the DOM
  console.log('\n🎨 Checking for Tailwind classes...');

  const localClasses = await localPage.evaluate(() => {
    const allClasses = new Set<string>();
    document.querySelectorAll('*').forEach(el => {
      el.className.split(' ').forEach(cls => {
        if (cls.startsWith('flex') || cls.startsWith('grid') || cls.startsWith('bg-') ||
            cls.startsWith('text-') || cls.startsWith('p-') || cls.startsWith('m-')) {
          allClasses.add(cls);
        }
      });
    });
    return Array.from(allClasses).sort();
  });
  console.log('LOCAL Tailwind classes:', localClasses.slice(0, 20));

  const prodClasses = await prodPage.evaluate(() => {
    const allClasses = new Set<string>();
    document.querySelectorAll('*').forEach(el => {
      el.className.split(' ').forEach(cls => {
        if (cls.startsWith('flex') || cls.startsWith('grid') || cls.startsWith('bg-') ||
            cls.startsWith('text-') || cls.startsWith('p-') || cls.startsWith('m-')) {
          allClasses.add(cls);
        }
      });
    });
    return Array.from(allClasses).sort();
  });
  console.log('PROD Tailwind classes:', prodClasses.slice(0, 20));

  await context.close();

  console.log('\n✅ Comparison complete! Check screenshots/ folder');
});
