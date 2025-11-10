# Changelog

All notable changes to PropIQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.1.1] - 2025-11-07 (In Development)

### Added
- **Structured Logging System** (Sprint 1)
  - JSON formatter for production logs
  - Colorized formatter for development
  - Request logging middleware with unique request IDs
  - Replaced all print() statements with logger calls

- **Input Validation & Sanitization** (Sprint 2)
  - Comprehensive validation utilities (passwords, emails, UUIDs)
  - XSS detection (script tags, event handlers, dangerous HTML)
  - SQL injection detection (UNION, SELECT, DROP, etc.)
  - HTML sanitization and string cleaning

- **Security Headers Middleware** (Sprint 2)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (HSTS) - auto-enabled in production
  - Content-Security-Policy with restrictive directives
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy to restrict browser features
  - X-Permitted-Cross-Domain-Policies: none

- **Request Size Limits** (Sprint 2)
  - 10 MB default limit to prevent DoS attacks
  - Returns HTTP 413 for oversized requests

- **API Versioning** (Sprint 2)
  - All endpoints now use `/api/v1` prefix
  - Future-proof API design

- **Error Response Standardization** (Sprint 1)
  - Centralized error codes
  - Consistent error response format
  - Global exception handler

### Changed
- **Database Migration** (Sprint 1)
  - Fully migrated from MongoDB to Supabase PostgreSQL
  - Updated all database references and comments

- **Enhanced Pydantic Models** (Sprint 2)
  - SignupRequest with password validators
  - LoginRequest with field constraints
  - PropertyAnalysisRequest with address validation
  - All models now use Field() with descriptions and constraints

### Removed
- **MongoDB Code** (Sprint 1)
  - Deleted database_mongodb.py (744 lines)
  - Deleted test_mongodb.py
  - Deleted migration scripts (migrate_to_supabase.py, migrate_to_supabase.sh)
  - Removed pymongo dependency

### Fixed
- All print() statements replaced with structured logging
- Comments referring to MongoDB updated to Supabase

### Security
- Multiple layers of XSS protection (CSP, validation, sanitization)
- SQL injection detection (defense-in-depth)
- Clickjacking protection (X-Frame-Options)
- MIME sniffing protection (X-Content-Type-Options)
- HTTPS enforcement in production (HSTS)
- Password strength validation (8+ chars, mixed case, digit)
- Request size limits to prevent DoS

### Breaking Changes
⚠️ **API Endpoint Versioning** - All endpoints now use `/api/v1` prefix:
- `/auth/*` → `/api/v1/auth/*`
- `/propiq/*` → `/api/v1/propiq/*`
- `/stripe/*` → `/api/v1/stripe/*`
- `/marketing/*` → `/api/v1/marketing/*`

**Migration:** Update all frontend API calls to use new endpoints.

### Documentation
- Added SPRINT_TRACKER.md for sprint management
- Added docs/sprints/SPRINT_1_COMPLETE.md
- Added docs/sprints/SPRINT_2_COMPLETE.md
- Added VERSION file
- Added CHANGELOG.md

---

## [3.1.0] - 2025-11-06 (Historical)

### Added
- Initial PropIQ setup (Sprint 0)
- FastAPI backend with MongoDB
- React frontend with TypeScript
- Azure OpenAI integration (GPT-4o-mini)
- Stripe payment integration
- Deal calculator (3-tab interface)
- Custom AI support chat
- Microsoft Clarity analytics
- Weights & Biases AI tracking
- Rate limiting middleware
- Basic CORS configuration

### Infrastructure
- Backend deployed to Azure Web App
- MongoDB Atlas database
- Azure OpenAI service
- Stripe live mode

---

## [3.0.0] - Previous Version (Historical)

Details not tracked in this changelog. See git history for information.

---

## Versioning Scheme

PropIQ follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version (3.x.x) - Incompatible API changes
- **MINOR** version (x.1.x) - New features, backwards compatible
- **PATCH** version (x.x.1) - Bug fixes, backwards compatible

### Current Version: 3.1.1

- **3** - Third major iteration of PropIQ
- **1** - Security & infrastructure improvements
- **1** - Database cleanup & logging enhancements

---

## Sprint Progress

- [x] Sprint 0: Foundation & Initial Setup (Historical)
- [x] Sprint 1: Database Cleanup & Logging ✅
- [x] Sprint 2: API Security Enhancement ✅
- [ ] Sprint 3: Testing & Documentation 🔄
- [ ] Sprint 4: Performance Optimization 📋

See [SPRINT_TRACKER.md](SPRINT_TRACKER.md) for detailed sprint documentation.

---

**Notes:**
- See individual sprint documentation in `docs/sprints/` for detailed changes
- Breaking changes are marked with ⚠️
- Security-related changes are highlighted in the Security section
- All changes are documented with their sprint number for traceability
