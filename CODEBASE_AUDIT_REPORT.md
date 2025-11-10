# PropIQ Codebase Audit Report

## Executive Summary

PropIQ is a real estate investment analysis SaaS platform with a React frontend and FastAPI backend. The project shows solid architecture but has critical bugs, missing documentation, inadequate error handling, and technical debt that needs immediate attention.

**Overall Code Quality Score: 6.5/10**

**Risk Level: MEDIUM-HIGH** - Multiple critical issues affect reliability and user experience

---

## 1. ARCHITECTURE OVERVIEW

### Project Structure
```
propiq/
├── frontend/          # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/    (DealCalculator, AuthModal, PropIQAnalysis, etc.)
│   │   ├── utils/         (auth.ts, calculatorUtils.ts, pdfExport.ts)
│   │   └── config/        (pricing configuration)
│   └── package.json      (Playwright tests configured)
│
├── backend/           # FastAPI + Python 3.11
│   ├── api.py        (Main FastAPI app)
│   ├── auth.py       (JWT authentication)
│   ├── database_supabase.py (PostgreSQL via Supabase)
│   ├── database_mongodb.py  (Legacy - should be removed)
│   ├── routers/      (Auth, Payment, PropIQ analysis, Support chat, etc.)
│   ├── middleware/   (Rate limiting)
│   ├── utils/        (Email, Slack, onboarding)
│   └── requirements.txt
```

### Tech Stack
- **Frontend**: React 19.1.1, TypeScript, Vite 7.0.4, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI 0.115.0, Python 3.11, Uvicorn
- **Database**: Supabase (PostgreSQL) - Primary; MongoDB Atlas - Legacy
- **Auth**: JWT (PyJWT 2.10.1), bcrypt password hashing
- **AI**: Azure OpenAI (GPT-4o-mini)
- **Payments**: Stripe 12.4.0
- **Email**: SendGrid 6.11.0
- **Tracking**: Weights & Biases, Microsoft Clarity

### Key Features
1. **Deal Calculator** - 3-tab interface with financial calculations
2. **Property Analysis** - AI-powered investment analysis via Azure OpenAI
3. **Support Chat** - Custom AI assistant with Azure OpenAI
4. **Authentication** - Email/password with JWT tokens
5. **Subscription Management** - Stripe integration with 4 tiers
6. **Email Marketing** - SendGrid integration for campaigns
7. **Analytics** - W&B tracking + Microsoft Clarity

---

## 2. CODE QUALITY ASSESSMENT

### Positive Aspects ✅
- **Modular architecture**: Well-organized routers and utilities
- **Type safety**: TypeScript + Pydantic models throughout
- **Authentication**: Proper JWT implementation with bcrypt hashing
- **Rate limiting**: Middleware in place for API protection
- **Environment configuration**: .env templates provided
- **Documentation**: Several MD files for integration guides
- **Error handling in auth**: Good try-catch blocks in auth.py
- **Responsive design**: Mobile-first CSS approach
- **CORS configuration**: Properly configured with specific origins

### Critical Issues ❌

#### 1. **CRITICAL BUG: Rate Limiter Variable Name Error** (Severity: HIGH)
**File**: `/backend/middleware/rate_limiter.py`, Line 184
```python
# WRONG - uses 'ip' instead of 'client_ip'
if client_ip not in self.request_history:
    self.request_history[ip] = []  # ❌ BUG: 'ip' is undefined!
self.request_history[client_ip].append((current_time, endpoint))
```

**Impact**: Rate limiter CRASHES when tracking first request from new IP address
**Fix Required**: Change line 184 from `self.request_history[ip]` to `self.request_history[client_ip]`

#### 2. **CRITICAL: Missing Error Context** (Severity: HIGH)
**Files**: Multiple routers
```python
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
    # Problem: str(e) often gives unhelpful messages
    # Examples: "Connection error", "Timed out", "No module named 'xyz'"
```

**Impact**: Users see cryptic error messages; developers can't debug
**Fix Required**: Add structured error logging with context

#### 3. **CRITICAL: No Validation on Azure OpenAI Initialization** (Severity: HIGH)
**File**: `/backend/routers/propiq.py`, Lines 50-54
```python
client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-15-preview"
)
# No check if these env vars exist - will crash at runtime
```

**Impact**: Server crashes at startup if Azure credentials missing
**Fix Required**: Validate env vars exist before initialization

#### 4. **SECURITY: Hardcoded Default JWT Secret** (Severity: MEDIUM)
**Files**: `/backend/auth.py`, `/backend/routers/propiq.py`, `/backend/routers/payment.py`
```python
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
# Default secret appears in code comments/documentation
```

**Impact**: If JWT_SECRET not set in production, all tokens are insecure
**Fix Required**: Make JWT_SECRET required (no default), validate at startup

#### 5. **DATABASE: Dual Database Drivers Causing Confusion** (Severity: MEDIUM)
**Files**: `database_mongodb.py` and `database_supabase.py` both present
```python
# Some routers import from database_supabase
# Some routers might import from database_mongodb
# No clear migration path documented
```

**Impact**: Developers unsure which to use; potential data inconsistency
**Fix Required**: 
- Remove database_mongodb.py entirely
- Update all imports to use database_supabase
- Document migration process

#### 6. **MISSING: Input Validation on Critical Endpoints** (Severity: MEDIUM)
**File**: `/backend/routers/propiq.py`
```python
class PropertyAnalysisRequest(BaseModel):
    address: str
    propertyType: Optional[str] = "single_family"
    purchasePrice: Optional[float] = None
    downPayment: Optional[float] = None
    interestRate: Optional[float] = None
    # Missing: min/max constraints, regex validation for address format
```

**Impact**: Could send invalid data to Azure OpenAI, wasting tokens/money
**Fix Required**: Add field validators with reasonable ranges

#### 7. **MISSING: Comprehensive Error Handling in Frontend Auth** (Severity: MEDIUM)
**File**: `/frontend/src/utils/auth.ts`
```typescript
export async function getUserDetails(userId: string): Promise<User | null> {
    try {
        // ... code ...
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;  // Silent failure - UI doesn't know what went wrong
    }
}
```

**Impact**: Auth modal might freeze; user doesn't know why login failed
**Fix Required**: Return error details, not just null

#### 8. **PERFORMANCE: Large AI Token Usage Not Optimized** (Severity: MEDIUM)
**File**: `/backend/routers/propiq.py`
```python
# Uses GPT-4o-mini but no prompt optimization visible
# Large context windows possible with no truncation
# No token counting before sending to OpenAI
```

**Impact**: Unexpectedly high OpenAI costs
**Fix Required**: Add token estimation before API calls

---

## 3. CRITICAL SECURITY ISSUES

### Security Findings 🔒

1. **Missing HTTPS Enforcement**
   - CORS configured but no redirect to HTTPS
   - API can accept unencrypted requests in transit

2. **Stripe Webhook Signature Not Validated in Some Paths**
   - `verify_token()` function properly validates JWT but...
   - Payment webhook might accept unsigned requests

3. **No Rate Limiting on Public Endpoints**
   - Auth signup/login have strict limits (good)
   - But `/health` endpoint is unprotected (potential enumeration)

4. **LocalStorage Security in Frontend**
   - Auth tokens stored in localStorage (vulnerable to XSS)
   - Should use httpOnly cookies or similar

5. **Environment Variables Not Validated at Startup**
   - No startup validation that required secrets exist
   - Application launches with partial configuration

---

## 4. TECHNICAL DEBT INVENTORY

### High Priority (Sprint 1-2)

| Issue | Location | Effort | Impact |
|-------|----------|--------|--------|
| Fix rate limiter bug | `middleware/rate_limiter.py:184` | 5 min | CRITICAL |
| Validate Azure OpenAI init | `routers/propiq.py:50` | 15 min | CRITICAL |
| Remove dual database drivers | `database_*.py` | 2 hours | HIGH |
| Add structured error logging | All routers | 4 hours | HIGH |
| Add input validation | `routers/propiq.py` | 3 hours | HIGH |
| Require JWT_SECRET | `auth.py, routers/*` | 1 hour | HIGH |

### Medium Priority (Sprint 3-4)

| Issue | Location | Effort | Impact |
|-------|----------|--------|--------|
| Add comprehensive tests | `frontend/tests`, `backend/test_*` | 16 hours | MEDIUM |
| Implement logging library | All Python files | 4 hours | MEDIUM |
| Add database transaction handling | `routers/payment.py` | 6 hours | MEDIUM |
| Optimize OpenAI token usage | `routers/propiq.py` | 8 hours | MEDIUM |
| Token blacklisting on logout | `auth.py` | 4 hours | MEDIUM |
| Rate limit by user ID not just IP | `middleware/rate_limiter.py` | 3 hours | MEDIUM |

### Lower Priority (Sprint 5+)

| Issue | Location | Effort | Impact |
|-------|----------|--------|--------|
| Add Redux/Zustand for state management | `frontend/src` | 20 hours | LOW |
| Full API documentation (Swagger) | `api.py` | 4 hours | LOW |
| Setup monitoring (Sentry) | Infrastructure | 2 hours | LOW |
| Add end-to-end tests | `frontend/tests` | 12 hours | LOW |

---

## 5. MISSING CRITICAL FEATURES

### Logging
- ❌ No structured logging framework
- ❌ All logging is `print()` statements
- ❌ No log levels (DEBUG, INFO, WARN, ERROR)
- ❌ No log rotation or persistence

**Impact**: Can't diagnose production issues

### Testing
- ⚠️ Playwright tests configured but minimal coverage
- ❌ No backend unit tests visible
- ❌ No integration tests
- ❌ No load testing

**Files with tests**: 
- `frontend/tests/` (exists but likely incomplete)
- `backend/test_*.py` (manual scripts, not automated)

**Impact**: No safety net for refactoring; regressions go undetected

### Error Recovery
- ❌ No retry logic on API failures
- ❌ No circuit breaker pattern
- ❌ No graceful degradation
- ❌ No timeout handling consistency

**Impact**: Single transient API error breaks user workflows

### Database Features
- ❌ No transaction management
- ❌ No query optimization hints
- ❌ No backup documentation
- ❌ No migration versioning system

**Impact**: Data inconsistency possible; data loss risk

### Monitoring & Observability
- ✅ W&B configured for AI tracking
- ✅ Microsoft Clarity for UX analytics
- ❌ No application performance monitoring (APM)
- ❌ No error tracking (Sentry, etc.)
- ❌ No health dashboards

---

## 6. DEAD CODE & DUPLICATES

### Potentially Dead Code
1. **MongoDB database driver** - Should be removed if fully migrated to Supabase
   - `database_mongodb.py` - 200+ lines
   - `test_mongodb.py` - Test file
   - Still referenced in `requirements.txt` (`pymongo==4.10.1`)

2. **Supabase migration scripts** - One-off scripts that aren't maintained
   - `migrate_to_supabase.py`
   - `migrate_to_supabase.sh`
   - These are probably run-once scripts

3. **Legacy email routers**
   - `routers/email.py` (just 688 bytes of boilerplate)
   - `routers/templates.py` (752 bytes)
   - Unclear if used or if SendGrid replaced them

4. **Debug/Test routers**
   - `routers/slack_test.py` - Test endpoint
   - `simulations/debug_assistant.py` - Development-only
   - These shouldn't be in production

### Duplicate Logic
1. **Email sending** appears in multiple places:
   - `utils/onboarding_emails.py` (600+ lines)
   - `routers/email.py`
   - `utils/slack.py` (has email-related code)

2. **Authentication token creation**:
   - Implemented in `auth.py`
   - Token verification reimplemented in multiple routers
   - Should be centralized in a shared utility

---

## 7. CODE SMELL ANALYSIS

### Inconsistencies
```
1. Error handling:
   - Some endpoints: try/except with HTTPException
   - Some endpoints: just let exceptions bubble up
   - Some endpoints: graceful fallback with None

2. Database null handling:
   - Some use: if db is None: raise Exception
   - Some use: if not supabase: raise Exception
   - Some use: if db: ... else: ...

3. Response models:
   - Some endpoints return Pydantic models
   - Some return plain dicts
   - Some return raw JSON strings

4. Authorization:
   - Some endpoints use Depends(verify_token)
   - Some call verify_token directly
   - Some don't verify tokens at all
```

### Naming Issues
```
1. Variables:
   - "propiq_usage_count" vs "trial_analyses_remaining" (confusing naming)
   - "_id" vs "id" (mixed MongoDB/Supabase conventions)

2. Functions:
   - "get_user_by_id" vs "get_user" (unclear which is preferred)
   - "create_subscription" vs "upsert" (different operations, similar names)
```

### Magic Numbers (No Constants)
```python
# In routers/payment.py:
- Line 32: stripe.checkout.Session.create(..., success_url=url + "?session_id={CHECKOUT_SESSION_ID}")
- "?session_id=" is magic string

# In frontend/src/App.tsx:
- Line 32: TOTAL_TRIAL_USES = 3 ✓ (good, this IS a constant)
- But payment amounts aren't constants - scattered in Stripe calls

# In database_supabase.py:
- Line 224: .limit(limit) - default 10 not documented where used
```

---

## 8. FRONTEND-SPECIFIC ISSUES

### Missing Features
1. **No loading skeleton screens** - User sees loading spinner but no content
2. **No error boundaries** - JS errors crash entire app instead of isolated component
3. **No offline support** - App breaks completely offline (no service worker)
4. **No form validation feedback** - Users don't know field errors until submit
5. **No undo/redo** - Calculator changes are permanent
6. **No autosave** - User might lose calculations if browser crashes

### Performance Issues
1. **No code splitting** - Entire app loaded upfront (check bundle size)
2. **No image optimization** - SVG icons used (good) but no lazy loading
3. **No memoization** - DealCalculator recalculates metrics on every render
4. **Large CSS** - DealCalculator.css is 11 KB (can be optimized)
5. **localStorage not debounced** - Every state change writes to storage

### State Management Issues
```typescript
// In components/DealCalculator.tsx, multiple useState calls
// Could benefit from useReducer for complex calculations
const [inputs, setInputs] = useState(...);
const [projectionInputs, setProjectionInputs] = useState(...);
const [metrics, setMetrics] = useState(null);
const [scenarios, setScenarios] = useState(null);
const [projections, setProjections] = useState([]);
// 5 separate state updates on one calculation - inefficient
```

---

## 9. BACKEND-SPECIFIC ISSUES

### API Design Problems
1. **No API versioning** - All endpoints at `/v1/*` would be better
2. **No pagination** - `get_user_analyses()` has hardcoded limit 10
3. **No filtering** - Can't filter analyses by date, property type, etc.
4. **No sorting** - Always returns newest first; can't customize
5. **No HATEOAS** - Responses don't include related links

### Database Problems
1. **N+1 query possibility** - `get_user_analyses()` lists analyses but needs separate call for details
2. **No query optimization** - Missing indexes on common filter fields
3. **No connection pooling config** - Supabase default pool might be exhausted
4. **No prepared statements** - Using string interpolation in some places
5. **Trial counting logic suspicious** - `decrement_trial_analyses()` has race condition

### Process Problems
1. **Print statements for logging** - No centralized logging
2. **No graceful shutdown** - Won't finalize W&B runs on exit
3. **No health check dependencies** - Health endpoint doesn't check DB/OpenAI
4. **Startup is silent** - No clear indication which services initialized

---

## 10. DEPLOYMENT & OPERATIONS

### Environment Management
```
✅ Good:
- .env.template provided
- Allows env-based config
- No hardcoded credentials visible

❌ Bad:
- No validation that required env vars exist
- No documentation of which are required vs optional
- No example .env provided
- No way to verify configuration before deployment
```

### Deployment Scripts
```
✅ Files present:
- deploy-railway.sh
- deploy_render.sh
- .netlify-deploy.sh

❌ Issues:
- Multiple deployment targets not consolidated
- No clear recommendation on which to use
- Scripts not tested (no CI/CD visible)
```

### Monitoring & Alerts
```
❌ Missing:
- Error tracking (Sentry, Rollbar)
- Performance monitoring (New Relic, DataDog)
- Uptime monitoring
- Log aggregation
- Alert rules
```

---

## 11. DOCUMENTATION GAPS

### Missing Documentation
1. **API Documentation**
   - No OpenAPI/Swagger spec generation
   - Endpoints documented in comments but not in interactive docs
   - No request/response examples

2. **Database Documentation**
   - Schema well-documented in SQL but no ER diagram
   - No data dictionary
   - No query performance notes

3. **Authentication Flow**
   - JWT flow documented in comments
   - But no sequence diagram
   - Token refresh not documented (appears to not exist)
   - Token expiration strategy unclear

4. **Onboarding**
   - New developer docs minimal
   - Setup instructions scattered across multiple files
   - No troubleshooting guide

5. **Configuration**
   - `.env.template` has many variables but unclear which are required
   - No explanation of config options
   - No env-specific examples (dev, staging, prod)

---

## 12. RECOMMENDED SPRINT PRIORITIES

### Sprint 1: Critical Bug Fixes (1 week)
**Goal**: Fix bugs that cause crashes or security issues

1. **Fix rate limiter bug** (5 min)
   - Change line 184: `ip` → `client_ip`
   - Test with load generator

2. **Validate environment variables at startup** (30 min)
   - Create `config.py` with validation
   - Check: AZURE_OPENAI_*, STRIPE_*, JWT_SECRET, SUPABASE_*
   - Fail fast with clear error message

3. **Add required env var enforcement** (30 min)
   - JWT_SECRET must have length > 32 chars
   - Parse ALLOWED_ORIGINS as JSON for clarity
   - No default secrets

4. **Fix database dual-driver confusion** (2 hours)
   - Remove all MongoDB code and imports
   - Update requirements.txt (remove pymongo)
   - Verify all imports use supabase

5. **Add structured error logging** (3 hours)
   - Implement with Python `logging` module
   - Log level based on env (DEBUG in dev, ERROR in prod)
   - Include request ID for tracing

### Sprint 2: High-Impact Improvements (1 week)
**Goal**: Improve reliability and monitoring

1. **Add input validation** (3 hours)
   - Address format validation (regex)
   - Price ranges (0 - $10M)
   - Interest rates (0% - 15%)
   - Percentages (0-100)

2. **Improve error responses** (2 hours)
   - Standard error schema: `{ error: string, code: string, details: object }`
   - Consistent error codes (validation_error, auth_error, etc.)
   - No stack traces in production

3. **Add comprehensive tests** (8 hours)
   - Calculator math tests (100% coverage)
   - Auth flow tests (signup, login, token expiry)
   - API endpoint tests (happy path + error cases)
   - Payment integration tests (mocked Stripe)

4. **Setup basic monitoring** (4 hours)
   - Application Performance Monitoring (Sentry for errors)
   - Structured logging aggregation
   - Basic uptime checks

### Sprint 3: User Experience (1 week)
**Goal**: Reduce user confusion and improve reliability

1. **Add error boundaries to frontend** (2 hours)
   - Catch JS errors in React
   - Show user-friendly error message
   - Log to error tracking service

2. **Improve loading states** (3 hours)
   - Skeleton screens for analyses list
   - Loading indicator on calculator
   - Better feedback during analysis

3. **Add form validation feedback** (2 hours)
   - Real-time validation display
   - Clear error messages
   - Field-level indicators

4. **Implement token refresh** (3 hours)
   - JWT refresh token strategy
   - Auto-refresh before expiration
   - Graceful logout on auth error

### Sprint 4: Performance & Scalability (1 week)
**Goal**: Optimize costs and improve performance

1. **Optimize OpenAI usage** (4 hours)
   - Token counting before API calls
   - Prompt optimization
   - Result caching for common addresses

2. **Add database optimization** (3 hours)
   - Query analysis and indexing
   - Connection pool tuning
   - Query performance metrics

3. **Frontend performance** (3 hours)
   - Code splitting
   - Component memoization
   - Bundle analysis

---

## 13. SPECIFIC CODE EXAMPLES TO FIX

### Example 1: Rate Limiter Bug Fix
```python
# BEFORE (BROKEN):
if client_ip not in self.request_history:
    self.request_history[ip] = []  # ❌ ip not defined!
self.request_history[client_ip].append((current_time, endpoint))

# AFTER (FIXED):
if client_ip not in self.request_history:
    self.request_history[client_ip] = []  # ✅ consistent variable name
self.request_history[client_ip].append((current_time, endpoint))
```

### Example 2: Environment Validation
```python
# BEFORE (NO VALIDATION):
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")

# AFTER (VALIDATED):
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET or len(JWT_SECRET) < 32:
    raise ValueError(
        "JWT_SECRET not set or too short. "
        "Set a 32+ character random string in environment."
    )
```

### Example 3: Better Error Handling
```python
# BEFORE:
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

# AFTER:
except ValueError as e:
    logger.warning(f"Validation error: {e}")
    raise HTTPException(status_code=400, detail="Invalid input parameters")
except Exception as e:
    logger.error(f"Unexpected error in analyze_property: {e}", exc_info=True)
    raise HTTPException(
        status_code=500,
        detail="An unexpected error occurred. Please try again later."
    )
```

### Example 4: Frontend Error Handling
```typescript
// BEFORE (SILENT FAILURE):
export async function getUserDetails(userId: string): Promise<User | null> {
    try {
        const response = await fetch(`${API_BASE}/auth/users/${userId}`, {
            // ...
        });
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;  // ❌ No error info for UI
    }
}

// AFTER (INFORMATIVE):
export interface FetchResult<T> {
    success: boolean;
    data: T | null;
    error: string | null;
}

export async function getUserDetails(userId: string): Promise<FetchResult<User>> {
    try {
        const response = await fetch(`${API_BASE}/auth/users/${userId}`, {
            // ...
        });
        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, data: null, error: 'Session expired' };
            }
            return { success: false, data: null, error: 'Failed to fetch user details' };
        }
        return { success: true, data: await response.json(), error: null };
    } catch (error) {
        logger.error('Network error fetching user:', error);
        return { success: false, data: null, error: 'Network error. Check your connection.' };
    }
}
```

---

## 14. SUMMARY & ACTIONABLE NEXT STEPS

### Critical Issues (Fix Immediately)
1. **Rate limiter bug** - crashes on new IP
2. **Azure OpenAI init** - crashes if env vars missing
3. **Database dual-driver** - causes confusion and potential data issues
4. **Missing env validation** - silent failures in production

### Quality Improvements (Next Sprint)
1. **Structured logging** - current `print()` statements insufficient
2. **Comprehensive error handling** - too many bare `except Exception`
3. **Input validation** - missing constraints on API parameters
4. **Testing** - minimal test coverage for critical features

### Strategic Improvements (Roadmap)
1. **Monitoring & observability** - no error tracking or performance monitoring
2. **Documentation** - API docs, architecture diagrams, troubleshooting guides
3. **State management** - Frontend state is fragmented across multiple useState
4. **Database optimization** - N+1 queries, missing indexes

---

## Files Referenced in Audit

### Frontend Files
- `/frontend/src/App.tsx` - Main app component
- `/frontend/src/components/DealCalculator.tsx` - Calculator logic
- `/frontend/src/components/AuthModal.tsx` - Auth UI
- `/frontend/src/utils/auth.ts` - Auth API integration
- `/frontend/src/utils/calculatorUtils.ts` - Financial calculations
- `/frontend/package.json` - Dependencies and scripts

### Backend Files
- `/backend/api.py` - FastAPI main app
- `/backend/auth.py` - JWT authentication
- `/backend/database_supabase.py` - Primary database
- `/backend/database_mongodb.py` - Legacy database (should remove)
- `/backend/routers/propiq.py` - Property analysis
- `/backend/routers/payment.py` - Stripe integration
- `/backend/routers/support_chat_enhanced.py` - Support chat
- `/backend/middleware/rate_limiter.py` - Rate limiting (has bug)
- `/backend/requirements.txt` - Python dependencies
- `/backend/.env.template` - Environment variables

---

**Audit Date**: November 2025
**Auditor**: Code Quality Analysis
**Confidence Level**: High (based on code inspection)

