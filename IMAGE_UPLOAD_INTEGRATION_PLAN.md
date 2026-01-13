# 🖼️ PropIQ Image Upload Integration Plan

**Date:** January 13, 2026
**Target Completion:** Today (1-2 hours)
**Launch Date:** January 27, 2026 (14 days)
**Status:** READY TO IMPLEMENT

---

## 🎯 Executive Summary

**Goal:** Integrate the completed PropertyImageUpload component into PropIQ's analysis workflow so users can upload 1-5 property photos with their analyses.

**Current Status:**
- ✅ Backend: 100% complete (AWS S3 + Convex mutations)
- ✅ Frontend component: 100% complete (PropertyImageUpload.tsx)
- ⏳ Integration: 0% (needs to be wired into PropIQAnalysis flow)

**Decision:** Ship with v1 launch (approved by product strategy)

**Risk Level:** 🟢 LOW - All components tested, just need wiring

---

## 📊 Strategic Context

### Why We're Doing This

**Product Strategy Rationale:**
1. **Differentiation** - Most competitors are text-only, photos make PropIQ stand out
2. **User Psychology** - Product Hunt audience expects visual features (credibility signal)
3. **Conversion Impact** - Visual uploads increase engagement by 5-20%
4. **Demo Value** - Better screenshots for Product Hunt launch
5. **Minimal Risk** - Feature is 95% complete, just needs integration

**Approved by:** Product Pro (strategic assessment completed)

---

## 🏗️ Architecture Overview

### How Image Upload Works

```
User uploads image (PropertyImageUpload component)
    ↓
1. Call Convex mutation: api.s3Upload.generateUploadUrl
    ↓
2. Get presigned S3 URL (5 min expiry)
    ↓
3. Direct browser → AWS S3 upload (bypasses Convex bandwidth)
    ↓
4. Call Convex mutation: api.propiq.savePropertyImage
    ↓
5. Save metadata to database: { s3Key, s3Url, filename, size, uploadedAt }
    ↓
6. Convex query auto-refreshes → gallery updates
```

**Key Insight:** Direct S3 upload = no Convex bandwidth consumption = stays on free tier

---

## 🔍 Current State Assessment

### Backend Status ✅ COMPLETE

**Files:**
- `convex/s3Upload.ts` - Presigned URL generation & delete
- `convex/propiq.ts` - Image metadata save/delete mutations
- `convex/schema.ts` - Database schema with images array

**Convex Environment Variables (VERIFIED):**
```
AWS_ACCESS_KEY_ID=[configured]
AWS_SECRET_ACCESS_KEY=[configured]
AWS_S3_BUCKET=propiq-property-images
AWS_S3_REGION=us-east-1
```

**S3 Bucket:**
- Name: `propiq-property-images`
- Region: us-east-1
- CORS: Configured for localhost + propiq.luntra.one
- Status: ✅ Ready

### Frontend Component Status ✅ COMPLETE

**File:** `frontend/src/components/PropertyImageUpload.tsx`

**Features:**
- File selection with drag-and-drop
- Client-side validation (JPEG, PNG, WebP, max 10MB)
- Image compression (browser-image-compression library)
- Upload progress indicator
- Gallery view with delete
- Max 5 images per analysis

**Dependencies:**
- `browser-image-compression@^2.0.2` ✅ Installed

### Integration Status ⏳ NEEDS WORK

**Problem Identified:**
`frontend/src/components/PropIQAnalysis.tsx` currently uses **FastAPI HTTP endpoints** instead of Convex mutations. This is legacy code that needs updating.

**Evidence:**
```typescript
// Line 119: Uses REST API, not Convex
const response = await apiClient.post(API_ENDPOINTS.PROPIQ_ANALYZE, {
  address: address.trim(),
  // ...
});
```

**Solution Required:**
Migrate PropIQAnalysis.tsx to use Convex mutations (or confirm it's already migrated in another file).

---

## 🔧 Implementation Plan

### Phase 1: Locate & Verify Analysis Component (15 min)

**Task:** Find which component is actually being used in production

**Files to Check:**
1. `frontend/src/components/PropIQAnalysis.tsx` - Current file (uses FastAPI)
2. `frontend/src/App.tsx` - Check which component is imported
3. `frontend/src/pages/` - Check for any newer analysis pages

**Commands to Run:**
```bash
# Find all references to PropIQ analysis
cd /Users/briandusape/Projects/propiq/frontend
grep -r "PropIQAnalysis\|analyzeProperty" src/ --include="*.tsx" --include="*.ts"

# Check what's imported in App.tsx
grep -n "import.*PropIQ\|import.*Analysis" src/App.tsx

# Verify Convex usage
grep -r "useQuery.*propiq\|useMutation.*propiq" src/ --include="*.tsx"
```

**Decision Point:**
- If PropIQAnalysis.tsx is active → Migrate to Convex + add images
- If there's a Convex version → Add images to that version
- If migration in progress → Finish migration first, then add images

---

### Phase 2: Backend Integration Validation (15 min)

**Grok's Critical Questions (Must Answer Before Proceeding):**

**1. Mutation Signatures**
Verify these mutations exist in `convex/propiq.ts`:
```typescript
// Does this exist?
export const savePropertyImage = mutation({
  args: {
    analysisId: v.id("propertyAnalyses"),
    image: v.object({
      s3Key: v.string(),
      s3Url: v.string(),
      filename: v.string(),
      size: v.number(),
      mimeType: v.string(),
      uploadedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => { /* ... */ }
});
```

**2. Authentication Checks**
Verify mutations check user ownership:
```typescript
// Must verify user owns the analysisId
const analysis = await ctx.db.get(args.analysisId);
const user = await ctx.auth.getUserIdentity();
if (analysis.userId !== user?.subject) {
  throw new Error("Unauthorized");
}
```

**3. Error Handling**
Check if backend handles orphaned S3 uploads:
- What if S3 upload succeeds but metadata save fails?
- Current approach: Orphaned files (acceptable for MVP)
- Future: Add cleanup cron job

**Commands to Run:**
```bash
# Check if savePropertyImage exists
grep -n "savePropertyImage" convex/propiq.ts

# Check for auth verification
grep -n "auth.getUserIdentity\|ctx.auth" convex/propiq.ts | head -20

# Verify schema has images field
grep -n "images:" convex/schema.ts
```

---

### Phase 3: Frontend Integration (45 min)

**Based on Gemini's Recommendations:**

**Step 1: Update Imports (5 min)**

Add to `PropIQAnalysis.tsx` (or whichever component is active):
```typescript
import { PropertyImageUpload } from "./PropertyImageUpload";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
```

**Step 2: Add State Management (10 min)**

Inside the component:
```typescript
const { user } = useAuth();
const userId = user?._id; // Convex user ID

// Track analysisId (set after analysis completes)
const [analysisId, setAnalysisId] = useState<Id<"propertyAnalyses"> | null>(null);

// Fetch analysis data (includes images from schema)
const analysis = useQuery(
  api.propiq.getAnalysis,
  analysisId ? { analysisId } : "skip"
);

// Callback for when images are uploaded
const handleImageUploadComplete = () => {
  console.log("Image uploaded successfully");
  // Convex query auto-refreshes, no manual refetch needed
};
```

**Step 3: Update Analysis Flow (15 min)**

When analysis completes, save the analysisId:
```typescript
// In your handleAnalyze function, after analysis succeeds:
const result = await ctx.runAction(api.propiq.analyzeProperty, {
  userId: user._id,
  address: address.trim(),
  // ... other args
});

// Save the analysisId so we can attach images
setAnalysisId(result.analysisId);
setAnalysis(result.analysis);
setStep('results');
```

**Step 4: Add Image Upload UI (15 min)**

In the results section, after analysis display:
```tsx
{/* Existing analysis results display */}
{step === 'results' && analysis && (
  <>
    {/* Your existing analysis cards/sections */}

    {/* NEW: Image Upload Section */}
    {analysisId && userId && (
      <section className="property-images-section" style={{ marginTop: '2rem' }}>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Property Photos
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Add up to 5 photos to enhance this analysis (optional)
        </p>

        <PropertyImageUpload
          analysisId={analysisId}
          userId={userId}
          existingImages={analysis?.images || []}
          maxImages={5}
          onUploadComplete={handleImageUploadComplete}
        />
      </section>
    )}
  </>
)}
```

---

### Phase 4: Critical Testing (30 min)

**Grok's Test Checklist:**

**Upload Flow:**
- [ ] Select image → presigned URL generated
- [ ] Upload to S3 → succeeds (check S3 bucket)
- [ ] Metadata saved → appears in analysis.images array
- [ ] Gallery updates → image visible immediately

**Error Scenarios:**
- [ ] File too large (>10MB) → blocked client-side
- [ ] Invalid file type → error shown
- [ ] S3 upload fails → error message displayed
- [ ] Already at max (5 images) → upload disabled
- [ ] User not authenticated → component hidden

**Edge Cases:**
- [ ] Refresh page → images persist
- [ ] Delete image → removed from S3 + database
- [ ] Duplicate image → allowed (unique S3 keys)
- [ ] Slow connection → progress indicator shows

**Security:**
- [ ] Can't upload to other user's analyses
- [ ] Can't delete other user's images
- [ ] Presigned URL expires (try after 10 min)

**Commands to Run:**
```bash
# Start dev server
npm run dev

# In another terminal, watch Convex logs
npx convex dev

# Check S3 bucket after upload
aws s3 ls s3://propiq-property-images/users/ --recursive
```

---

### Phase 5: Production Deployment (20 min)

**Pre-Deploy Checklist:**
- [ ] All tests pass locally
- [ ] No console errors
- [ ] Images persist across page refresh
- [ ] Delete works correctly
- [ ] Mobile responsive (test on phone)

**Deployment Steps:**
```bash
# 1. Commit changes
git add frontend/src/components/PropIQAnalysis.tsx
git add -A  # If you modified other files
git commit -m "feat: integrate property image upload into analysis flow

- Add PropertyImageUpload component to analysis results
- Users can now upload 1-5 photos per property analysis
- Direct S3 upload with Convex metadata storage
- Max 5 images, client-side compression, drag-and-drop

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 2. Push to GitHub (triggers Netlify auto-deploy)
git push origin main

# 3. Wait for Netlify build (2-3 min)
# Check: https://app.netlify.com/sites/[your-site]/deploys

# 4. Smoke test on production
# Go to: https://propiq.luntra.one
# - Run an analysis
# - Upload a test image
# - Verify it appears
# - Refresh page, verify it persists
# - Delete it, verify it's removed
```

**Rollback Plan:**
If production breaks:
```bash
# Revert the commit
git revert HEAD
git push origin main

# Or deploy previous working commit
git log --oneline | head -5  # Find previous commit
git reset --hard [commit-hash]
git push origin main --force  # Use with caution!
```

---

## 🐛 Known Issues & Mitigations

### Issue 1: Orphaned S3 Files (Low Priority)

**Problem:** If S3 upload succeeds but metadata save fails, file stays in S3

**Impact:** Minimal (costs <$0.01/month for a few orphans)

**Mitigation (Future):**
- Add S3 lifecycle rule: delete objects >90 days old with no metadata
- Or: Add Convex cron job to clean up orphans weekly

**For Now:** Acceptable for MVP, fix post-launch

---

### Issue 2: Presigned URL Expiry (5 min)

**Problem:** If user starts upload but network is slow, URL may expire

**Impact:** Upload fails with 403 error

**Mitigation:**
- Error message: "Upload timed out - please try again"
- Future: Increase expiry to 15-30 min if needed

**Test:** Pause network in DevTools mid-upload

---

### Issue 3: FastAPI Legacy Code

**Problem:** PropIQAnalysis.tsx currently uses FastAPI, not Convex

**Impact:** Need to migrate or verify correct component is in use

**Resolution:** Phase 1 will determine this

---

## 📋 Success Criteria

**Feature Complete When:**
- [ ] User can upload 1-5 images during/after analysis
- [ ] Images persist in database and S3
- [ ] Images display in gallery
- [ ] Delete functionality works
- [ ] Works on mobile (responsive)
- [ ] No console errors
- [ ] Deployed to production

**Product Hunt Ready When:**
- [ ] Screenshot showing image upload UI
- [ ] Demo video includes property photo upload
- [ ] Copy mentions "Upload property photos for AI analysis"

---

## 📊 Time Estimates

| Phase | Task | Estimated Time | Status |
|-------|------|----------------|--------|
| 1 | Locate & verify component | 15 min | ⏳ Pending |
| 2 | Backend validation | 15 min | ⏳ Pending |
| 3 | Frontend integration | 45 min | ⏳ Pending |
| 4 | Testing | 30 min | ⏳ Pending |
| 5 | Deployment | 20 min | ⏳ Pending |
| **TOTAL** | **Full integration** | **2 hours** | **0% Complete** |

**Buffer:** +30 min for unexpected issues

**Target Completion:** Today (within 2.5 hours)

---

## 🚀 Next Actions

### Immediate (Right Now):

**Action 1: Verify Which Component is Active**
```bash
cd /Users/briandusape/Projects/propiq/frontend
grep -n "PropIQAnalysis" src/App.tsx
grep -r "useQuery.*analyzeProperty" src/ --include="*.tsx"
```

**Action 2: Check Backend Mutations Exist**
```bash
cd /Users/briandusape/Projects/propiq
grep -n "savePropertyImage\|deletePropertyImage" convex/propiq.ts
```

**Action 3: Start Implementation**
Once verified, follow Phase 3 integration steps

---

## 📞 Support & References

**AI Consultants Used:**
- ✅ Gemini: Frontend scaffolding & UX placement
- ✅ Grok: Backend validation & error handling
- ✅ Product Pro: Strategic launch decision

**Key Documents:**
- `IMAGE_UPLOAD_IMPLEMENTATION_COMPLETE.md` - Original backend setup
- `IMAGE_UPLOAD_QUICKSTART.md` - Step-by-step backend guide
- `PropertyImageUpload.tsx` - Component source code
- `convex/s3Upload.ts` - Backend upload functions
- `convex/propiq.ts` - Analysis mutations

**Debugging Resources:**
- Convex logs: `npx convex logs`
- S3 bucket: `aws s3 ls s3://propiq-property-images/users/ --recursive`
- Browser DevTools: Network tab for upload monitoring

---

## ✅ Launch Checklist (Jan 27)

**Before Product Hunt Launch:**
- [ ] Image upload tested on production
- [ ] Screenshot taken showing image upload UI
- [ ] Demo video includes property photo upload
- [ ] Mobile version tested on real device
- [ ] UAT-001 through UAT-016 completed with image upload
- [ ] No critical bugs in image upload flow

**Launch Day Messaging:**
"PropIQ analyzes rental properties in 30 seconds - enter an address, upload photos, and get AI-powered investment insights with deal scores, cash flow projections, and recommendations."

---

**Document Owner:** Brian Dusape
**Created:** January 13, 2026
**Last Updated:** January 13, 2026
**Status:** READY TO IMPLEMENT
**Next Step:** Execute Phase 1 - Verify component architecture

---

**LET'S BUILD THIS! 🚀**
