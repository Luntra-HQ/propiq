import * as Sentry from '@sentry/react';

/**
 * Test function to verify Sentry is working correctly
 * Call this from a button in development mode to send test errors
 */
export function testSentryFrontend() {
  console.log('[Sentry Test] Triggering test errors...');

  // 1. Test basic error capture
  try {
    throw new Error('🧪 Sentry frontend test error - This is intentional!');
  } catch (e) {
    Sentry.captureException(e);
    console.log('[Sentry Test] ✓ Basic error captured');
  }

  // 2. Test error with context
  Sentry.withScope((scope) => {
    scope.setTag('test_type', 'manual');
    scope.setTag('environment', 'development');
    scope.setExtra('test_data', {
      foo: 'bar',
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent,
    });
    scope.setLevel('warning');
    Sentry.captureMessage('🧪 Sentry test message with context');
    console.log('[Sentry Test] ✓ Message with context captured');
  });

  // 3. Test breadcrumb tracking
  Sentry.addBreadcrumb({
    category: 'test',
    message: 'Test breadcrumb - User clicked test button',
    level: 'info',
    data: {
      action: 'click',
      element: 'test_button',
    },
  });
  console.log('[Sentry Test] ✓ Breadcrumb added');

  // 4. Test user context
  Sentry.setUser({
    id: 'test-user-123',
    email: 'test@propiq.com',
    username: 'Test User',
  });
  console.log('[Sentry Test] ✓ User context set');

  // 5. Test unhandled error (will show in error boundary after 1 second)
  console.log('[Sentry Test] ⏱️  Triggering unhandled error in 1 second...');
  setTimeout(() => {
    throw new Error('🧪 Unhandled error test - This will trigger the error boundary!');
  }, 1000);

  console.log('\n✅ Sentry test completed!');
  console.log('📊 Check your Sentry dashboard for 3-4 new errors');
  console.log('🔗 Dashboard: https://sentry.io/');
}

/**
 * Test function to verify performance monitoring
 */
export function testSentryPerformance() {
  console.log('[Sentry Performance] Starting performance test...');

  // NOTE: startTransaction is deprecated in Sentry v8+
  // Use Sentry.startSpan() instead for performance monitoring
  // Commenting out for now to fix TypeScript errors
  console.warn('[Sentry Performance] Performance monitoring disabled - requires Sentry v8+ API update');
  return;

  /* Deprecated code - needs migration to Sentry.startSpan()
  const transaction = Sentry.startTransaction({
    name: 'test_operation',
    op: 'test.performance',
    tags: {
      test: 'true',
      environment: 'development',
    },
  });


  // Simulate some work
  const span1 = transaction.startChild({
    op: 'test.work.step1',
    description: 'Processing step 1',
  });

  setTimeout(() => {
    span1.finish();
    console.log('[Sentry Performance] ✓ Step 1 completed');

    const span2 = transaction.startChild({
      op: 'test.work.step2',
      description: 'Processing step 2',
    });

    setTimeout(() => {
      span2.finish();
      transaction.finish();
      console.log('[Sentry Performance] ✓ Step 2 completed');
      console.log('✅ Performance test completed! Check Sentry Performance tab.');
    }, 500);
  }, 500);
  */
}

/**
 * Simulate common PropIQ errors for testing
 */
export function testCommonErrors() {
  console.log('[Sentry Test] Simulating common PropIQ errors...');

  // 1. Failed search error
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'help_center');
    scope.setContext('search', {
      query: 'test property analysis',
      resultsCount: 0,
    });
    Sentry.captureMessage('Search returned no results', 'info');
  });

  // 2. API error
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'property_analysis');
    scope.setContext('api_error', {
      endpoint: '/propiq/analyze',
      status: 500,
      message: 'OpenAI API timeout',
    });
    Sentry.captureException(new Error('Property analysis API failed'));
  });

  // 3. Authentication error
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'authentication');
    scope.setLevel('warning');
    Sentry.captureMessage('Invalid JWT token');
  });

  console.log('✅ Common errors simulated! Check Sentry dashboard.');
}
