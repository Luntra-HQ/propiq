# Logger Quick Reference

**One-page cheat sheet for PropIQ logging**

## Import

```typescript
// Backend (Convex)
import logger from './logger';

// Frontend
import logger from '@/utils/logger';
```

## Basic Usage

```typescript
logger.debug('Dev only message');
logger.info('Dev only info');
logger.warn('Warning - always logged');
logger.error('Error - always logged + Sentry');
```

## Specialized Loggers

```typescript
logger.auth('Authentication event');
logger.payment('Payment event');
logger.analysis('Analysis event');
logger.perf('Operation', 123); // Frontend only
```

## Performance Tracking

```typescript
import { trackPerformance } from '@/utils/sentryPerformance';

const result = await trackPerformance('operation.name', async () => {
  return await yourOperation();
});
```

## Common Patterns

### Auth Flow
```typescript
logger.auth('Login attempt:', email);
logger.auth('Login successful:', userId);
```

### Payment Flow
```typescript
logger.payment('Checkout started:', { userId, tier });
logger.payment('Stripe session created:', sessionId);
```

### Error Handling
```typescript
try {
  await operation();
} catch (error) {
  logger.error('Operation failed:', error); // Auto-sends to Sentry
}
```

### Performance
```typescript
const start = performance.now();
await operation();
logger.perf('Operation name', performance.now() - start);
```

## Environment Behavior

| Method | Dev | Prod |
|--------|-----|------|
| `debug` | ✅ | ❌ |
| `info` | ✅ | ❌ |
| `warn` | ✅ | ✅ |
| `error` | ✅ | ✅ + Sentry |
| `auth` | ✅ | ❌ |
| `payment` | ✅ | ✅ (audit) |
| `analysis` | ✅ | ❌ |

## Migration

```typescript
// ❌ OLD
console.log('User logged in');

// ✅ NEW
logger.auth('User logged in:', userId);
```

## Full Guide

See [LOGGER_USAGE_GUIDE.md](./LOGGER_USAGE_GUIDE.md) for complete documentation.
