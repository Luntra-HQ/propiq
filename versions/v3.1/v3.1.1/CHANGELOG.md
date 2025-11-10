# PropIQ v3.1.1 Changelog

**Release Date:** November 2025  
**Type:** Patch Release  
**Previous Version:** v3.1.0

---

## Summary

v3.1.1 includes bug fixes, accessibility improvements, and HOA fee support. This patch release addresses critical UX issues and enhances the calculator's capability to handle condos and apartments with HOA fees.

---

## 🐛 Bug Fixes

### Input Field Improvements (P0 Critical)
- **Fixed:** Input fields not clearing placeholder zeros
  - Added `onFocus` handler to select all text
  - Changed `defaultValue` to `placeholder` for better UX
  - Fixed in: `frontend/src/components/DealCalculator.tsx`
  - Impact: All 17 number input fields now work smoothly

### Accessibility Improvements (P1 High)
- **Fixed:** Text contrast failing accessibility check
  - Improved contrast ratios to meet WCAG AA standards
  - Changed text colors from `gray-400` to `gray-100`
  - Impact: Better readability and accessibility compliance

### Icon Standardization (P2 Medium)
- **Fixed:** Inconsistent target icon sizes
  - Standardized all Target icons to 24px × 24px
  - Impact: Professional, cohesive visual design

---

## ✨ New Features

### HOA Fee Support
- **Added:** Monthly HOA fee field in Deal Calculator
  - Location: Monthly Expenses section
  - Fully integrated into all calculations
  - Impact: Can now analyze condos and apartments with HOA fees

---

## 🔧 Improvements

### User Experience
- Improved input field interaction (auto-select on focus)
- Better placeholder handling
- Enhanced visual consistency

### Documentation
- Created Product Capabilities Reference
- Added Onboarding Conversation Guide
- Established version system and file cabinet organization

---

## 📝 Files Changed

### Frontend
- `frontend/src/components/DealCalculator.tsx` - Input fixes, HOA support
- `frontend/src/components/DealCalculator.css` - Contrast improvements

### Documentation (New)
- `PRODUCT_CAPABILITIES_REFERENCE.md` - Comprehensive feature documentation
- `ONBOARDING_CONVERSATION_GUIDE.md` - Onboarding best practices
- `VERSION_SYSTEM.md` - Version management system
- `versions/` directory structure - Organized file cabinet

---

## 🚀 Deployment

- **Frontend:** Deployed to Netlify (propiq.luntra.one)
- **Backend:** No changes (Azure)
- **Status:** ✅ Live in Production

---

## 🔗 Related Documentation

- [Deployment Notes](./DEPLOYMENT.md)
- [Fixes Complete](./FIXES_COMPLETE.md)
- [Features](./FEATURES.md)
- [v3.1.x Series Summary](../SUMMARY.md)

---

## 📊 Impact

**User-Facing Improvements:**
- Smoother input experience (no more sticky zeros)
- Better readability (improved contrast)
- Can analyze HOA properties (new capability)

**Developer Experience:**
- Better documentation organization
- Version system established for future iterations

---

**Released:** November 2025  
**Next Version:** v3.2.0 (Rent vs Buy feature planned)

