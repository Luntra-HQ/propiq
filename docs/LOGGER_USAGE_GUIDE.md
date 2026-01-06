# Logger Usage Guide

**Production-Safe Logging for PropIQ**

This guide explains how to use the logger utility throughout the PropIQ codebase for environment-aware, production-safe logging.

---

## 📋 Table of Contents

- [Why Use Logger?](#why-use-logger)
- [Backend Logger (Convex)](#backend-logger-convex)
- [Frontend Logger](#frontend-logger)
- [Performance Monitoring](#performance-monitoring)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

---

## Why Use Logger?

**Problem with console.log:**
- ❌ Clutters production logs
- ❌ No environment awareness
- ❌ Poor debugging categorization
- ❌ No error tracking integration

**Benefits of logger:**
- ✅ Environment-aware (verbose in dev, errors only in prod)
- ✅ Categorized by feature (auth, payment, analysis)
- ✅ Automatic Sentry integration
- ✅ Performance tracking built-in
- ✅ Production-ready out of the box

---

## Backend Logger (Convex)

### Import

```typescript
import logger from '../logger';
// or
import { logger } from '../logger';
```

### API

```typescript
logger.debug(...args)   // Development only
logger.info(...args)    // Development only
logger.warn(...args)    // Always logged
logger.error(...args)   // Always logged + Sentry
logger.auth(...args)    // Auth operations (dev only)
logger.payment(...args) // Payment audit trail (always logged)
logger.analysis(...args)// Analysis operations (dev only)
```

### Examples

#### Authentication
```typescript
import logger from './logger';

export const login = mutation({
  handler: async (ctx, args) => {
    logger.auth('Login attempt:', args.email);

    const user = await ctx.db.query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (!user) {
      logger.warn('Login failed: User not found:', args.email);
      throw new Error("Invalid credentials");
    }

    logger.auth('Login successful:', args.email);
    return { success: true };
  }
});
```

#### Payment Processing
```typescript
import logger from './logger';

export const createCheckout = action({
  handler: async (ctx, args) => {
    logger.payment('Creating checkout session:', {
      userId: args.userId,
      tier: args.tier,
    });

    try {
      const session = await stripe.checkout.sessions.create({...});
      logger.payment('Checkout session created:', session.id);
      return { success: true, sessionId: session.id };
    } catch (error) {
      logger.error('Checkout creation failed:', error);
      throw error;
    }
  }
});
```

#### Property Analysis
```typescript
import logger from './logger';

export const analyzeProperty = action({
  handler: async (ctx, args) => {
    logger.analysis('Starting analysis:', args.address);

    try {
      const result = await performAnalysis(args);
      logger.debug('Analysis complete:', {
        address: args.address,
        score: result.score,
        recommendation: result.recommendation,
      });
      return result;
    } catch (error) {
      logger.error('Analysis failed:', error);
      throw error;
    }
  }
});
```

---

## Frontend Logger

### Import

```typescript
import logger from '@/utils/logger';
```

### API

```typescript
logger.debug(...args)           // Development only
logger.info(...args)            // Development only
logger.warn(...args)            // Always logged + Sentry
logger.error(...args)           // Always logged + Sentry
logger.auth(...args)            // Auth operations (dev only)
logger.payment(...args)         // Payment audit trail (always logged)
logger.analysis(...args)        // Analysis operations (dev only)
logger.perf(label, duration)    // Performance logging
```

### Examples

#### User Authentication
```typescript
import logger from '@/utils/logger';

const handleLogin = async (email: string, password: string) => {
  logger.auth('Login attempt:', email);

  try {
    const result = await login({ email, password });
    logger.auth('Login successful:', email);
    return result;
  } catch (error) {
    logger.error('Login failed:', error);
    throw error;
  }
};
```

#### API Calls
```typescript
import logger from '@/utils/logger';

const fetchPropertyAnalysis = async (address: string) => {
  const startTime = performance.now();

  try {
    logger.debug('Fetching analysis:', address);
    const response = await axios.get(`/api/analyze?address=${address}`);

    const duration = performance.now() - startTime;
    logger.perf('Property analysis API call', duration);

    return response.data;
  } catch (error) {
    logger.error('API call failed:', error);
    throw error;
  }
};
```

#### Checkout Flow
```typescript
import logger from '@/utils/logger';

const handleCheckout = async (tierId: string) => {
  logger.payment('Initiating checkout:', { tierId, userId });

  try {
    const session = await createCheckoutSession({ tierId });
    logger.payment('Checkout session created:', session.id);
    window.location.href = session.url;
  } catch (error) {
    logger.error('Checkout failed:', error);
    alert('Unable to start checkout. Please try again.');
  }
};
```

---

## Performance Monitoring

### Import

```typescript
import { trackPerformance, trackPropertyAnalysis } from '@/utils/sentryPerformance';
```

### Track Any Operation

```typescript
const result = await trackPerformance(
  'operation.name',
  async () => {
    // Your operation here
    return await doSomething();
  },
  { customMetadata: 'value' } // Optional
);
```

### Track Property Analysis

```typescript
import { trackPropertyAnalysis } from '@/utils/sentryPerformance';

const analyzeProperty = async (address: string) => {
  return await trackPropertyAnalysis(address, async () => {
    const response = await axios.post('/api/analyze', { address });
    return response.data;
  });
};
```

### Track PDF Export

```typescript
import { trackPDFExport } from '@/utils/sentryPerformance';

const exportToPDF = async (analysis: PropertyAnalysis) => {
  return await trackPDFExport(analysis.address, async () => {
    const { generatePDF } = await import('./pdfExport');
    return await generatePDF(analysis);
  });
};
```

### Track Checkout

```typescript
import { trackCheckout } from '@/utils/sentryPerformance';

const createCheckout = async (tier: string) => {
  return await trackCheckout(tier, async () => {
    return await createCheckoutSession({ tier });
  });
};
```

### Manual Span for Complex Operations

```typescript
import { startManualSpan } from '@/utils/sentryPerformance';

const complexOperation = async () => {
  const span = startManualSpan('complex.operation', { userId: '123' });

  try {
    // Step 1
    logger.debug('Starting step 1');
    await step1();

    // Step 2
    logger.debug('Starting step 2');
    await step2();

    // Step 3
    logger.debug('Starting step 3');
    await step3();
  } finally {
    span?.end();
  }
};
```

---

## Best Practices

### ✅ DO

1. **Use appropriate log levels:**
   ```typescript
   logger.debug('Detailed debug info');  // Dev troubleshooting
   logger.info('General information');    // Dev information
   logger.warn('Non-critical issue');     // Always logged
   logger.error('Critical error');        // Always logged + Sentry
   ```

2. **Use specialized loggers:**
   ```typescript
   logger.auth('Authentication event');
   logger.payment('Payment event');
   logger.analysis('Analysis event');
   ```

3. **Include context:**
   ```typescript
   logger.error('Checkout failed:', {
     userId,
     tier,
     error: error.message,
   });
   ```

4. **Track performance for slow operations:**
   ```typescript
   const result = await trackPerformance('slow.operation', operation);
   ```

### ❌ DON'T

1. **Don't use console.log directly:**
   ```typescript
   // ❌ BAD
   console.log('User logged in:', userId);

   // ✅ GOOD
   logger.auth('User logged in:', userId);
   ```

2. **Don't log sensitive data:**
   ```typescript
   // ❌ BAD
   logger.debug('Password:', password);
   logger.payment('Card number:', cardNumber);

   // ✅ GOOD
   logger.debug('Password validated');
   logger.payment('Payment method validated');
   ```

3. **Don't use info/debug for errors:**
   ```typescript
   // ❌ BAD
   logger.info('Error occurred:', error);

   // ✅ GOOD
   logger.error('Error occurred:', error);
   ```

4. **Don't over-log in production:**
   ```typescript
   // ❌ BAD - This logs in production
   logger.warn('Rendering component'); // Use debug instead

   // ✅ GOOD
   logger.debug('Rendering component');
   ```

---

## Migration Guide

### Replace console.log

**Before:**
```typescript
console.log('User logged in:', userId);
console.log('Creating checkout session');
console.error('Payment failed:', error);
```

**After:**
```typescript
logger.auth('User logged in:', userId);
logger.payment('Creating checkout session');
logger.error('Payment failed:', error);
```

### Replace debug logs

**Before:**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

**After:**
```typescript
logger.debug('Debug info:', data); // Automatically dev-only
```

### Add error tracking

**Before:**
```typescript
try {
  await operation();
} catch (error) {
  console.error('Operation failed:', error);
}
```

**After:**
```typescript
try {
  await operation();
} catch (error) {
  logger.error('Operation failed:', error); // Auto-sends to Sentry
}
```

---

## Environment Behavior

| Logger Method | Development | Production |
|--------------|-------------|------------|
| `logger.debug()` | ✅ Logged | ❌ Silent |
| `logger.info()` | ✅ Logged | ❌ Silent |
| `logger.warn()` | ✅ Logged | ✅ Logged |
| `logger.error()` | ✅ Logged | ✅ Logged + Sentry |
| `logger.auth()` | ✅ Logged | ❌ Silent |
| `logger.payment()` | ✅ Logged | ✅ Logged (audit) |
| `logger.analysis()` | ✅ Logged | ❌ Silent |

---

## Examples by Feature

### Authentication Flow

```typescript
import logger from '@/utils/logger';

// Signup
logger.auth('Signup attempt:', email);
logger.auth('Password validated');
logger.auth('User created:', userId);

// Login
logger.auth('Login attempt:', email);
logger.auth('Password verified');
logger.auth('Session created:', sessionId);

// Logout
logger.auth('Logout:', userId);
```

### Payment Flow

```typescript
import logger from '@/utils/logger';

// Checkout
logger.payment('Checkout initiated:', { userId, tier });
logger.payment('Stripe session created:', sessionId);

// Webhook
logger.payment('Webhook received:', eventType);
logger.payment('Subscription activated:', { userId, tier });

// Errors
logger.error('Payment processing failed:', error);
```

### Analysis Flow

```typescript
import logger from '@/utils/logger';

// Analysis
logger.analysis('Analysis requested:', address);
logger.analysis('AI response received:', { tokens, duration });
logger.debug('Analysis result:', result);

// Error
logger.error('Analysis failed:', error);
```

---

## Sentry Integration

The logger automatically integrates with Sentry for production error tracking:

```typescript
// This automatically sends to Sentry in production
logger.error('Critical error occurred:', error);

// This only logs locally
logger.debug('Debug information');
```

### Set User Context

```typescript
import { setUserContext } from '@/utils/logger';

// After login
setUserContext(userId, email, subscriptionTier);

// On logout
clearUserContext();
```

### Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/utils/logger';

addBreadcrumb('User clicked export button', 'user_action');
addBreadcrumb('API request started', 'network', 'info', {
  endpoint: '/api/analyze',
  method: 'POST',
});
```

---

## Testing Logger

### Development Mode

Run the app in development mode to see all logs:
```bash
npm run dev
```

### Production Mode (Local)

Build and preview to see production logging behavior:
```bash
npm run build
npm run preview
```

---

## FAQ

**Q: Will logger impact performance?**
A: No. Debug/info logs are completely removed in production builds via tree-shaking.

**Q: Can I still use console.log for quick debugging?**
A: Yes, during local development. But remove them before committing.

**Q: How do I view Sentry errors?**
A: Visit your Sentry dashboard: https://sentry.io/organizations/your-org/issues/

**Q: What if Sentry is not configured?**
A: Logger will work normally, just without error tracking integration.

---

## Support

For questions or issues:
- Check this guide
- Review existing logger usage in the codebase
- Create an issue on GitHub
- Contact the team

---

**Last Updated:** 2026-01-06
**Version:** 1.0
**Status:** Production-ready
