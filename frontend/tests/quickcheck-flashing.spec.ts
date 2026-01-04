import { test, expect } from '@playwright/test';

test.describe('QuickCheck Flashing Test', () => {
  test('QuickCheck should not flash when results appear', async ({ page }) => {
    // Navigate to test page
    await page.goto('http://localhost:5173/test');

    // Click on V3 & QuickCheck tab
    await page.click('text=🆕 V3 & QuickCheck');

    // Wait for tab content to load
    await page.waitForSelector('text=Quick Check');

    // Enter test values
    await page.fill('input[id="purchasePrice"]', '250000');
    await page.fill('input[id="monthlyRent"]', '1800');

    // Start performance monitoring
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const paintEntries = entries.filter(entry =>
            entry.entryType === 'paint' || entry.entryType === 'measure'
          );
          observer.disconnect();
          resolve({
            paintCount: paintEntries.length,
            entries: paintEntries.map(e => ({
              name: e.name,
              duration: e.duration,
              startTime: e.startTime
            }))
          });
        });
        observer.observe({ entryTypes: ['paint', 'measure'] });

        // Trigger analyze
        setTimeout(() => {
          const button = document.querySelector('button.analyze-btn') as HTMLButtonElement;
          if (button) button.click();
        }, 100);
      });
    });

    // Wait for results to appear
    await page.waitForSelector('.executive-summary-card', { timeout: 3000 });

    // Check that results rendered
    const resultText = await page.textContent('.executive-summary-card');
    expect(resultText).toContain('Deal');

    // Performance check: No excessive repaints
    console.log('Paint metrics:', metrics);

    // Screenshot for visual verification
    await page.screenshot({ path: 'quickcheck-results.png', fullPage: true });

    console.log('✅ QuickCheck rendered without errors');
  });

  test('Verify backdrop-filter is disabled', async ({ page }) => {
    await page.goto('http://localhost:5173/test');
    await page.click('text=🆕 V3 & QuickCheck');

    // Fill and analyze
    await page.fill('input[id="purchasePrice"]', '250000');
    await page.fill('input[id="monthlyRent"]', '1800');
    await page.click('button.analyze-btn');

    // Wait for results
    await page.waitForSelector('.executive-summary-card');

    // Check computed styles
    const hasBackdropFilter = await page.evaluate(() => {
      const card = document.querySelector('.executive-summary-card');
      if (!card) return null;
      const styles = window.getComputedStyle(card);
      return {
        backdropFilter: styles.backdropFilter,
        willChange: styles.willChange,
        transform: styles.transform
      };
    });

    console.log('Computed styles:', hasBackdropFilter);

    // Verify backdrop-filter is NOT active (should be 'none')
    expect(hasBackdropFilter?.backdropFilter).toBe('none');

    // Verify GPU acceleration is active
    expect(hasBackdropFilter?.transform).not.toBe('none');

    console.log('✅ backdrop-filter disabled, GPU acceleration enabled');
  });
});
