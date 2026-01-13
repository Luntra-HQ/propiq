# Image Upload Feature - Testing Guide

**Date:** January 13, 2026
**Status:** ✅ IMPLEMENTED - Ready for Testing
**Launch:** January 27, 2026 (14 days)

---

## 🎉 Implementation Complete!

### What Was Built:

**Backend (Convex):**
- ✅ Updated `analyzeProperty` action to accept `images` parameter
- ✅ Updated `saveAnalysis` mutation to save images with analysis
- ✅ Deployed to https://mild-tern-361.convex.cloud

**Frontend:**
- ✅ Created `PropIQAnalysisConvex.tsx` (new Convex-based component)
- ✅ Integrated image upload (0-5 images, drag-and-drop)
- ✅ Client-side compression (target 2MB per image)
- ✅ Direct S3 upload (no Convex bandwidth)
- ✅ Built successfully (no TypeScript errors)

**Integration:**
- ✅ Updated App.tsx to use new component
- ✅ Old FastAPI component kept for reference

---

## 🧪 Testing Checklist

### Local Testing (Before Deployment)

**Step 1: Start Dev Server**
```bash
cd /Users/briandusape/Projects/propiq/frontend
npm run dev
# Open http://localhost:5173
```

**Step 2: Login**
- Click "Sign Up" or "Login"
- Create test account or use existing

**Step 3: Test Image Upload Flow (No Images)**
- [ ] Click "Analyze Property" button
- [ ] Enter address: "2505 Longview St, Austin, TX 78705"
- [ ] Skip image upload
- [ ] Click "Analyze Property"
- [ ] Verify analysis completes
- [ ] Verify no images shown in results

**Step 4: Test Image Upload Flow (With Images)**
- [ ] Click "Analyze Another Property"
- [ ] Enter address: "123 Main St, Austin, TX 78701"
- [ ] Click image upload dropzone
- [ ] Select 2-3 test images (JPEG/PNG)
- [ ] Verify previews appear
- [ ] Click "Analyze Property (with X images)"
- [ ] Watch upload progress (0-40%)
- [ ] Watch analysis progress (40-100%)
- [ ] Verify analysis completes
- [ ] Verify images appear in "Property Photos" gallery
- [ ] Verify images are clickable/viewable

**Step 5: Test Edge Cases**
- [ ] Try uploading >5 images → Should show error
- [ ] Try uploading >10MB file → Should show error
- [ ] Try uploading PDF → Should show error
- [ ] Remove image preview → Should work
- [ ] Click "X" during upload → Should cancel gracefully

**Step 6: Test Persistence**
- [ ] Refresh page after analysis
- [ ] Re-open same analysis (if viewing history)
- [ ] Verify images still appear

---

### Production Testing (After Deployment)

**Step 1: Deploy to Production**
```bash
cd /Users/briandusape/Projects/propiq
git add .
git commit -m "feat: integrate property image upload into PropIQ analysis

- Create PropIQAnalysisConvex component with Convex backend
- Upload 0-5 images before analysis (direct S3 upload)
- Client-side compression (<2MB per image)
- Atomic save (images + analysis together)
- Update App.tsx to use new component

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
# Netlify will auto-deploy in 2-3 minutes
```

**Step 2: Smoke Test on Production**
- [ ] Go to https://propiq.luntra.one
- [ ] Login with real account
- [ ] Run analysis with 2-3 test images
- [ ] Verify images upload to S3
- [ ] Verify analysis saves to Convex
- [ ] Verify no console errors

**Step 3: Verify S3 Upload**
```bash
aws s3 ls s3://propiq-property-images/users/ --recursive | tail -20
# Should see newly uploaded images
```

**Step 4: Verify Convex Database**
```bash
npx convex dashboard
# Open propertyAnalyses table
# Find latest analysis
# Verify images array is populated
```

---

## 📊 Expected Behavior

### Upload Flow:

```
1. User selects 2 images (image1.jpg, image2.png)
2. Frontend compresses images
   - image1.jpg: 8MB → 1.5MB
   - image2.png: 5MB → 1.2MB
3. Frontend gets presigned URLs from Convex
4. Frontend uploads directly to S3
   - s3://propiq-property-images/users/{userId}/temp/uuid1.jpg
   - s3://propiq-property-images/users/{userId}/temp/uuid2.png
5. Frontend calls analyzeProperty with images metadata
6. Backend saves analysis + images to database
7. Frontend displays results with image gallery
```

### Database Schema:

```typescript
{
  _id: "abc123",
  userId: "user123",
  address: "123 Main St, Austin, TX",
  purchasePrice: 425000,
  // ... other fields
  images: [
    {
      s3Key: "users/user123/temp/uuid1.jpg",
      s3Url: "https://propiq-property-images.s3.amazonaws.com/users/user123/temp/uuid1.jpg",
      filename: "image1.jpg",
      size: 1572864,
      mimeType: "image/jpeg",
      uploadedAt: 1705152000000,
      width: 1920,
      height: 1080
    },
    {
      s3Key: "users/user123/temp/uuid2.png",
      s3Url: "https://propiq-property-images.s3.amazonaws.com/users/user123/temp/uuid2.png",
      filename: "image2.png",
      size: 1258291,
      mimeType: "image/png",
      uploadedAt: 1705152001000,
      width: 1280,
      height: 720
    }
  ],
  createdAt: 1705152002000
}
```

---

## 🐛 Known Issues & Solutions

### Issue 1: "generateUploadUrl is not a function"

**Symptom:** Error when uploading images

**Cause:** s3Upload functions not deployed or wrong API path

**Solution:**
```bash
npx convex deploy
# Wait for deployment to complete
# Retry upload
```

---

### Issue 2: Images upload but don't appear in results

**Symptom:** Upload succeeds, but gallery is empty

**Cause:** Images array not saved to database

**Solution:**
Check Convex logs:
```bash
npx convex logs | grep "Analysis saved"
# Should see: "Analysis saved successfully: {analysisId}"

# Check database:
npx convex dashboard
# Open propertyAnalyses table
# Verify images field exists and is populated
```

---

### Issue 3: CORS error during S3 upload

**Symptom:** "Access to fetch at S3 URL has been blocked by CORS policy"

**Cause:** S3 bucket CORS not configured for localhost or production domain

**Solution:**
Update S3 CORS in AWS Console:
```json
{
  "AllowedOrigins": [
    "http://localhost:5173",
    "https://propiq.luntra.one"
  ],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": []
}
```

---

### Issue 4: Upload stuck at 40%

**Symptom:** Progress bar stops at 40%, never completes

**Cause:** Analysis action failed or timed out

**Solution:**
Check Convex logs:
```bash
npx convex logs | grep "PropIQ"
# Look for error messages
```

Common causes:
- Azure OpenAI API key invalid
- Azure OpenAI quota exceeded
- Network timeout (increase timeout in Convex)

---

## 📈 Success Metrics

**Feature Complete When:**
- [ ] User can upload 0-5 images before analysis
- [ ] Images compress client-side (<2MB each)
- [ ] Upload progress shows correctly
- [ ] Analysis saves with images atomically
- [ ] Image gallery displays in results
- [ ] Images persist across page refresh
- [ ] No console errors in production
- [ ] S3 bucket has uploaded files
- [ ] Convex database has images array

**Product Hunt Ready When:**
- [ ] Screenshot showing image upload UI
- [ ] Demo video includes property photo upload
- [ ] Mobile version tested (responsive design)
- [ ] UAT tests include image upload scenarios

---

## 🚀 Deployment Commands

### Quick Deploy (Auto):
```bash
cd /Users/briandusape/Projects/propiq
git add .
git commit -m "feat: integrate property image upload"
git push origin main
# Netlify auto-deploys in 2-3 minutes
```

### Manual Deploy (If needed):
```bash
# Build locally
cd frontend
npm run build

# Deploy to Netlify manually
# (Upload dist/ folder via Netlify dashboard)
```

### Verify Deployment:
```bash
# Check Netlify deploy logs
# Visit https://app.netlify.com

# Test production URL
open https://propiq.luntra.one
```

---

## 📞 Troubleshooting

**Console Errors?**
```bash
# Check browser console (F12)
# Look for specific error messages
# Search error in this document
```

**Images Not Uploading?**
```bash
# Check Convex logs
npx convex logs | grep -i "upload\|image"

# Check S3 bucket
aws s3 ls s3://propiq-property-images/users/ --recursive

# Verify env vars
npx convex env list | grep -i "AWS\|S3"
```

**Analysis Failing?**
```bash
# Check if backend accepts images
npx convex logs | grep "analyzeProperty"

# Verify mutation signature matches
cat convex/propiq.ts | grep -A 20 "export const analyzeProperty"
```

---

## ✅ Final Checklist Before Launch

**Pre-Launch (Next 7 Days):**
- [ ] All P0 UAT tests pass
- [ ] Image upload tested on mobile
- [ ] S3 costs verified (<$5/month)
- [ ] No orphaned images in S3
- [ ] Convex free tier not exceeded

**Launch Day (Jan 27):**
- [ ] Feature working in production
- [ ] Screenshot with image upload in Product Hunt post
- [ ] Demo video shows image upload
- [ ] Marketing copy mentions "Upload property photos"

**Post-Launch (Week 1):**
- [ ] Monitor S3 usage
- [ ] Monitor Convex bandwidth
- [ ] Collect user feedback on image feature
- [ ] Fix any reported bugs

---

## 📚 Reference Documents

**Implementation:**
- `IMAGE_UPLOAD_INTEGRATION_PLAN.md` - Full implementation plan
- `IMAGE_UPLOAD_IMPLEMENTATION_GROK_REVIEW.md` - Architecture review
- `IMAGE_UPLOAD_IMPLEMENTATION_COMPLETE.md` - Original backend setup

**Code Files:**
- `frontend/src/components/PropIQAnalysisConvex.tsx` - New component
- `convex/propiq.ts` - Backend with images support
- `convex/s3Upload.ts` - S3 presigned URL generation
- `frontend/src/App.tsx` - Integration point

---

**Created:** January 13, 2026
**Last Updated:** January 13, 2026
**Status:** READY FOR TESTING
**Next Step:** Deploy to production and run smoke tests

**LET'S TEST THIS! 🚀**
