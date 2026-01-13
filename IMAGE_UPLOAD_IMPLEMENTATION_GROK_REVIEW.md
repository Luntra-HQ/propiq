# Grok's Architecture Review - Adjustments for PropIQ

**Date:** January 13, 2026
**Approach:** Option B - Convex-based analysis with integrated image upload

---

## 🎯 Grok's Core Recommendation

**Philosophy:** "Images first, then analyze" - Upload images during form submission, pass metadata to analysis mutation atomically.

**Benefits:**
- ✅ Single atomic operation (no orphaned analyses without images)
- ✅ Better UX (images part of the analysis from start)
- ✅ Cleaner state management (no "add images later" flow)

---

## ⚠️ Adjustments Needed for PropIQ

### Issue 1: `analyzeProperty` is an ACTION, not a MUTATION

**Grok's Assumption:**
```typescript
const analyzeProperty = useMutation(api.propiq.analyzeProperty);
```

**Reality in PropIQ:**
```typescript
// convex/propiq.ts line 12
export const analyzeProperty = action({ ... });  // ← ACTION, not mutation
```

**Why This Matters:**
- Actions can't directly modify database
- Actions call mutations internally
- We need to modify the action to accept images parameter

**Fix Required:**
Update `analyzeProperty` action signature to accept images array, then pass to `saveAnalysis` mutation.

---

### Issue 2: Analysis Flow is Complex (3-Step Process)

**Current PropIQ Flow:**
```
1. Reserve slot (mutation)
2. Generate AI analysis (external API call)
3. Save analysis (mutation) ← Returns analysisId
```

**Grok's Flow:**
```
1. Upload images to S3
2. Call analyzeProperty with images
```

**Combined Flow Needed:**
```
1. Upload images to S3 (get metadata)
2. Call analyzeProperty action with images array
   ├─ Reserve slot
   ├─ Generate AI analysis
   └─ Save analysis WITH images
3. Return analysisId
```

---

### Issue 3: S3 Key Generation Needs analysisId

**Grok's Suggestion:**
Use temp keys like `users/${userId}/temp/${uuid}.ext`, then move after analysis created

**PropIQ Current Pattern:**
Keys are probably `users/${userId}/analyses/${analysisId}/${uuid}.ext`

**Better Approach:**
Generate UUID for "pending analysis" upfront, use as analysisId placeholder, then create analysis with that ID.

**OR Simpler:**
Use temp keys, accept they'll stay in temp folder (fine for MVP).

---

## ✅ Adapted Implementation Plan

### Backend Changes Required

**File:** `convex/propiq.ts`

**Change 1: Update analyzeProperty action signature**
```typescript
export const analyzeProperty = action({
  args: {
    userId: v.id("users"),
    address: v.string(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    downPayment: v.optional(v.number()),
    monthlyRent: v.optional(v.number()),
    // NEW: Accept images array
    images: v.optional(v.array(v.object({
      s3Key: v.string(),
      s3Url: v.string(),
      filename: v.string(),
      size: v.number(),
      mimeType: v.string(),
      uploadedAt: v.number(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    }))),
  },
  handler: async (ctx, args): Promise<any> => {
    // ... existing slot reservation logic ...

    // ... existing AI analysis logic ...

    // CHANGE: Pass images to saveAnalysis
    analysisId = await ctx.runMutation(api.propiq.saveAnalysis, {
      userId: args.userId,
      address: args.address,
      // ... other fields ...
      images: args.images || [],  // ← NEW
    });

    return {
      success: true,
      analysisId,  // ← NEW: Return this!
      analysis: analysisResult.analysis,
      // ... rest of return data
    };
  },
});
```

**Change 2: Update saveAnalysis mutation**
```typescript
export const saveAnalysis = mutation({
  args: {
    // ... existing args ...
    images: v.optional(v.array(v.object({
      s3Key: v.string(),
      s3Url: v.string(),
      filename: v.string(),
      size: v.number(),
      mimeType: v.string(),
      uploadedAt: v.number(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    }))),
  },
  handler: async (ctx, args) => {
    const analysisId = await ctx.db.insert("propertyAnalyses", {
      userId: args.userId,
      address: args.address,
      // ... all existing fields ...
      images: args.images || [],  // ← NEW
      createdAt: Date.now(),
    });

    return analysisId;
  },
});
```

---

### Frontend Implementation

**New File:** `frontend/src/components/PropIQAnalysisConvex.tsx`

**Differences from Grok's Code:**

1. **Use `useAction` not `useMutation`**
```typescript
const analyzeProperty = useAction(api.propiq.analyzeProperty);  // ← useAction
```

2. **Handle 3-step backend flow**
- Frontend doesn't need to know about slot reservation
- Backend handles it internally
- Just call action with images

3. **Error Handling**
```typescript
try {
  // Upload images
  const uploadedImages = await uploadImagesToS3(selectedFiles);

  // Call analysis
  const result = await analyzeProperty({
    ...propertyData,
    userId: user._id,
    images: uploadedImages,
  });

  if (result.success) {
    setAnalysisId(result.analysisId);
    setAnalysis(result.analysis);
    setStep('results');
  } else {
    // Cleanup: Delete uploaded images
    await cleanupUploadedImages(uploadedImages);
    setError(result.error);
  }
} catch (err) {
  // Cleanup + show error
  await cleanupUploadedImages(uploadedImages);
  setError(err.message);
}
```

4. **S3 Key Generation**
Use temp folder approach:
```typescript
const { uploadUrl, s3Key, publicUrl } = await generateUploadUrl({
  userId,
  filename: file.name,
  contentType: file.type,
  fileSize: file.size,
  // analysisId not available yet - backend will use temp folder
});
```

---

## 🔧 Implementation Steps

### Step 1: Backend Updates (15 min)

```bash
# Edit convex/propiq.ts
# 1. Add images param to analyzeProperty action
# 2. Pass images to saveAnalysis mutation
# 3. Return analysisId in action result
```

### Step 2: Create New Frontend Component (45 min)

**File:** `frontend/src/components/PropIQAnalysisConvex.tsx`

**Structure:**
```typescript
// State
const [step, setStep] = useState<'input' | 'uploading' | 'analyzing' | 'results'>('input');
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
const [uploadedImages, setUploadedImages] = useState<any[]>([]);
const [analysisId, setAnalysisId] = useState<string | null>(null);

// Handlers
const handleFileSelect = (files: File[]) => { /* ... */ };
const handleAnalyze = async () => {
  setStep('uploading');

  // Upload images
  const images = await uploadImagesToS3(selectedFiles);
  setUploadedImages(images);

  setStep('analyzing');

  // Run analysis
  const result = await analyzeProperty({ ...formData, images });

  setAnalysisId(result.analysisId);
  setStep('results');
};
```

**UI Flow:**
```
[Input Form]
  ↓ user fills address, price, etc.
[Image Dropzone] (optional, 0-5 images)
  ↓ user drops files
[Analyze Button]
  ↓ click
[Uploading...] (progress bar)
  ↓ S3 uploads complete
[Analyzing...] (AI processing)
  ↓ analysis complete
[Results + Image Gallery]
```

### Step 3: Update App.tsx (10 min)

**Replace old component:**
```typescript
// OLD
const PropIQAnalysis = lazy(() => import('./components/PropIQAnalysis').then(m => ({ default: m.PropIQAnalysis })));

// NEW
const PropIQAnalysis = lazy(() => import('./components/PropIQAnalysisConvex').then(m => ({ default: m.PropIQAnalysisConvex })));
```

**Update props:**
```typescript
{showPropIQAnalysis && (
  <PropIQAnalysis
    onClose={() => setShowPropIQAnalysis(false)}
    userId={user._id}  // Convex user ID
    // No authToken needed - Convex handles auth
  />
)}
```

---

## 🧪 Testing Plan

### Unit Tests (15 min)

**Test Scenarios:**
- [ ] Image upload without analysis data → shows error
- [ ] Analysis without images → succeeds
- [ ] Analysis with 1-5 images → succeeds
- [ ] Analysis with 6 images → blocked client-side
- [ ] File too large (>10MB) → blocked client-side
- [ ] S3 upload fails → cleanup triggered
- [ ] Analysis fails after upload → cleanup triggered

### Integration Tests (30 min)

**Full Flow:**
1. Enter address "123 Main St, Austin, TX"
2. Add 2 test images
3. Click "Analyze"
4. Wait for upload progress (30-40%)
5. Wait for analysis (70-100%)
6. See results with image gallery
7. Refresh page → images persist
8. Delete one image → gallery updates

---

## 📊 Rollout Strategy

### Phase 1: Parallel Deploy (Low Risk)

**Keep Both Components:**
- Old: `PropIQAnalysis.tsx` (FastAPI) - accessible via URL param
- New: `PropIQAnalysisConvex.tsx` (with images)

**Switch Logic:**
```typescript
const useNewAnalysis = user?.betaFeatures?.includes('convex-analysis');

{showPropIQAnalysis && (
  useNewAnalysis ? (
    <PropIQAnalysisConvex onClose={...} userId={user._id} />
  ) : (
    <PropIQAnalysis onClose={...} userId={user._id} authToken={sessionToken} />
  )
)}
```

**Benefits:**
- Can A/B test
- Easy rollback
- Gradual migration

### Phase 2: Full Cutover (After Testing)

**Replace entirely:**
- Delete `PropIQAnalysis.tsx`
- Rename `PropIQAnalysisConvex.tsx` → `PropIQAnalysis.tsx`
- Remove FastAPI endpoint calls

---

## 🚨 Critical Considerations (From Grok)

### 1. **Orphaned S3 Files**

**Scenario:** Images uploaded, but analysis fails

**Solution:**
```typescript
const cleanupUploadedImages = async (images: any[]) => {
  for (const img of images) {
    await deleteS3Image({ s3Key: img.s3Key });
  }
};
```

**Call in catch block**

### 2. **Slow Network**

**Issue:** User uploads large files on slow connection

**Solution:**
- Show progress bar (track % per file)
- Add "Cancel" button (abort uploads)
- Client-side compression BEFORE upload

### 3. **Partial Failures**

**Issue:** 3 of 5 images upload, then error

**Solution:**
- Track which uploaded successfully
- Only cleanup successfully uploaded ones
- Or: Upload all, fail entirely if any fail (atomic)

### 4. **Auth Edge Cases**

**Issue:** User logs out mid-upload

**Solution:**
- Check auth before upload loop
- Re-check before analysis call
- Show "Session expired" gracefully

---

## ✅ Success Criteria

**Backend Ready:**
- [ ] `analyzeProperty` accepts images param
- [ ] `saveAnalysis` saves images array
- [ ] Action returns analysisId
- [ ] Deployed to Convex

**Frontend Ready:**
- [ ] New component created
- [ ] Image dropzone works
- [ ] Upload progress shown
- [ ] Cleanup on error works
- [ ] Results show image gallery

**Integration Working:**
- [ ] End-to-end flow completes
- [ ] Images persist in database
- [ ] No console errors
- [ ] Mobile responsive

---

## 📅 Time Estimate

| Task | Time | Status |
|------|------|--------|
| Backend updates | 15 min | ⏳ Pending |
| Frontend component | 45 min | ⏳ Pending |
| Integration | 10 min | ⏳ Pending |
| Testing | 30 min | ⏳ Pending |
| Deployment | 20 min | ⏳ Pending |
| **TOTAL** | **2 hours** | **0% Complete** |

---

## 🚀 Next Action

**Start with Backend:**
Edit `convex/propiq.ts` to add images parameter.

**Command:**
```bash
code /Users/briandusape/Projects/propiq/convex/propiq.ts
```

**Lines to Edit:**
- Line 12: Add images to args
- Line 65-78: Pass images to saveAnalysis
- Line 95: Return analysisId in result

**Ready to start?** 🎯
