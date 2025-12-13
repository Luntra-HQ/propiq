# PropIQ E2E Tests - Sprint 7

## Test Files

### 1. `smoke.spec.ts`
Quick smoke tests to verify basic functionality:
- API health endpoints
- Frontend loads correctly
- No critical console errors
- Protected endpoints require auth

**Run:** `npm test tests/smoke.spec.ts`

### 2. `api-v1-migration.spec.ts`
Verifies API v1 migration:
- All endpoints use `/api/v1` prefix
- Old endpoints return 404
- Auth endpoints work with new prefix

**Run:** `npm test tests/api-v1-migration.spec.ts`

### 3. `pagination.spec.ts`
Tests pagination functionality:
- Support conversations pagination
- Property analyses pagination
- Pagination metadata correctness
- Page size limits

**Run:** `npm test tests/pagination.spec.ts`

### 4. `frontend-integration.spec.ts`
Frontend integration tests:
- Frontend uses new API configuration
- Auth modal uses correct endpoints
- Property analysis uses correct endpoints
- Error handling (401, network errors)

**Run:** `npm test tests/frontend-integration.spec.ts`

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test tests/smoke.spec.ts
```

### Headed Mode (See Browser)
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### UI Mode (Interactive)
```bash
npm run test:ui
```

## Test Against Different Environments

### Local Development
```bash
VITE_API_URL=http://localhost:8000 npm test
```

### Production
```bash
VITE_API_URL=https://luntra-outreach-app.azurewebsites.net npm test
```

## Environment Variables

- `PLAYWRIGHT_BASE_URL`: Frontend URL (default: http://localhost:5173)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)
- `CI`: Set to any value to enable CI mode (retries, parallel off)

## Test Coverage

### API Endpoints Tested
- ✅ `/api/v1/propiq/health`
- ✅ `/api/v1/propiq/analyze`
- ✅ `/api/v1/propiq/analyses` (NEW - Sprint 7)
- ✅ `/api/v1/auth/signup`
- ✅ `/api/v1/auth/login`
- ✅ `/api/v1/support/health`
- ✅ `/api/v1/support/conversations` (pagination)
- ✅ `/api/v1/stripe/health`

### Features Tested
- ✅ API v1 migration
- ✅ Pagination (support conversations, property analyses)
- ✅ Authentication flow
- ✅ Frontend integration
- ✅ Error handling
- ✅ Network requests use correct endpoints

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run E2E Tests
  run: |
    cd propiq/frontend
    npm ci
    npm test
```

## Troubleshooting

### Tests Fail with "Cannot connect"
- Ensure backend is running
- Check `VITE_API_URL` environment variable
- Verify network connectivity

### Tests Timeout
- Increase timeout in playwright.config.ts
- Check backend response time
- Ensure database is available

### Authentication Tests Fail
- Check JWT_SECRET is configured
- Verify database is accessible
- Check password requirements

## Sprint 7 Test Checklist

- [x] API v1 migration tests
- [x] Pagination tests
- [x] Frontend integration tests
- [x] Smoke tests
- [ ] Run against local backend
- [ ] Run against production backend
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable

## Password Reset Testing

### Test File: `password-reset.spec.ts`

Comprehensive tests for the forgot password feature including:
- Email input validation
- Password reset request flow
- Token validation (expired, invalid, used)
- Password strength validation
- Password confirmation matching
- Successful password reset
- Accessibility (keyboard navigation, ARIA labels)
- Mobile responsiveness

**Quick Start:**
```bash
# Run all password reset tests
npm run test:password-reset

# Run with UI for debugging
npm run test:password-reset:ui

# Run in headed mode (see browser)
npm run test:password-reset:headed
```

### Email Testing Strategies

1. **Mock Testing (Default)** - Fast, no external dependencies
2. **Mailosaur** - Full integration testing (requires account)
3. **Ethereal Email** - Free temporary email accounts
4. **Resend Verification** - Check Resend API directly

See `tests/helpers/email-testing.ts` for helper functions.

### Environment Variables for Password Reset Tests

| Variable | Required | Description |
|----------|----------|-------------|
| `MAILOSAUR_API_KEY` | No | Mailosaur API key for email testing |
| `MAILOSAUR_SERVER_ID` | No | Mailosaur server ID |
| `RESEND_API_KEY` | No | Resend API key for integration testing |
| `ENABLE_INTEGRATION_TESTS` | No | Enable integration tests (default: false) |

### Integration Testing Setup

For full email integration testing with Mailosaur:

1. Sign up at https://mailosaur.com
2. Create a server and get Server ID
3. Get API key from account settings
4. Add to `.env.local`:
   ```bash
   MAILOSAUR_API_KEY=your_api_key
   MAILOSAUR_SERVER_ID=your_server_id
   ENABLE_INTEGRATION_TESTS=true
   ```
5. Run: `npm run test:password-reset:integration`

### Debugging Password Reset Tests

```bash
# Debug mode (step through tests)
npm run test:password-reset:debug

# Verbose logging
DEBUG=pw:api npm run test:password-reset

# Record trace
npx playwright test tests/password-reset.spec.ts --trace on
```

See `PASSWORD_RESET_DEBUGGING.md` in the project root for troubleshooting guide.

## Next Steps

1. Run tests locally: `npm test`
2. Fix any failures
3. Run against staging
4. Run against production
5. Add to CI/CD pipeline
