# PropIQ Image Upload - Quick Start Checklist

**Goal:** Add property image uploads to PropIQ using AWS S3
**Time Required:** 2-3 hours
**Cost:** $0 (using your AWS Activate credits)

---

## ✅ Pre-Flight Checklist

Before you start, make sure you have:

- [ ] AWS account with Activate credits
- [ ] AWS CLI installed (`brew install awscli`)
- [ ] Access to Convex dashboard
- [ ] PropIQ project running locally

---

## 🚀 Step-by-Step Implementation

### Phase 1: AWS Setup (30 minutes)

#### Step 1.1: Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Region: us-east-1
# Output format: json
```
**✅ Test:** `aws s3 ls` (should list buckets or be empty)

---

#### Step 1.2: Create S3 Bucket
```bash
# Create bucket
aws s3 mb s3://propiq-property-images --region us-east-1

# Enable versioning (optional but recommended)
aws s3api put-bucket-versioning \
  --bucket propiq-property-images \
  --versioning-configuration Status=Enabled
```
**✅ Test:** `aws s3 ls` (should show propiq-property-images)

---

#### Step 1.3: Configure CORS
```bash
cat > /tmp/cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "http://localhost:5173",
        "https://propiq.luntra.one"
      ],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket propiq-property-images \
  --cors-configuration file:///tmp/cors.json

rm /tmp/cors.json
```
**✅ Test:** `aws s3api get-bucket-cors --bucket propiq-property-images`

---

#### Step 1.4: Create IAM User
```bash
# 1. Create IAM policy
cat > /tmp/s3-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::propiq-property-images/*"
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name PropIQ-S3-Upload \
  --policy-document file:///tmp/s3-policy.json

# 2. Note the policy ARN from output (looks like: arn:aws:iam::123456789:policy/PropIQ-S3-Upload)
# Replace ACCOUNT_ID below with your actual AWS account ID

# 3. Create IAM user
aws iam create-user --user-name propiq-s3-uploader

# 4. Attach policy (REPLACE ACCOUNT_ID!)
aws iam attach-user-policy \
  --user-name propiq-s3-uploader \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/PropIQ-S3-Upload

# 5. Create access keys (SAVE THESE!)
aws iam create-access-key --user-name propiq-s3-uploader

rm /tmp/s3-policy.json
```

**⚠️ IMPORTANT:** Copy the `AccessKeyId` and `SecretAccessKey` from the output!

**✅ Test:** You should have:
- AccessKeyId (looks like: AKIAIOSFODNN7EXAMPLE)
- SecretAccessKey (looks like: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY)

---

#### Step 1.5: Add AWS Credentials to Convex
```bash
cd /Users/briandusape/Projects/propiq

# Replace with your actual values
npx convex env set AWS_ACCESS_KEY_ID "AKIAIOSFODNN7EXAMPLE"
npx convex env set AWS_SECRET_ACCESS_KEY "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
npx convex env set AWS_S3_BUCKET "propiq-property-images"
npx convex env set AWS_S3_REGION "us-east-1"
```

**✅ Test:** `npx convex env list` (should show AWS_* variables)

---

### Phase 2: Install Dependencies (5 minutes)

#### Step 2.1: Install AWS SDK
```bash
# From project root
cd /Users/briandusape/Projects/propiq
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Install frontend dependency
cd frontend
npm install browser-image-compression
cd ..
```

**✅ Test:** Check package.json files contain new dependencies

---

### Phase 3: Update Database Schema (5 minutes)

#### Step 3.1: Update Convex Schema

**File:** `convex/schema.ts`

Find the `propertyAnalyses` table definition (around line 42) and add the `images` field:

```typescript
propertyAnalyses: defineTable({
  userId: v.id("users"),

  // Property details
  address: v.string(),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zipCode: v.optional(v.string()),

  // Financial inputs
  purchasePrice: v.optional(v.number()),
  downPayment: v.optional(v.number()),
  monthlyRent: v.optional(v.number()),

  // AI Analysis result (JSON)
  analysisResult: v.string(),
  aiRecommendation: v.string(),
  dealScore: v.number(), // 0-100

  // Metadata
  model: v.string(), // "gpt-4o-mini"
  tokensUsed: v.optional(v.number()),

  // 🆕 NEW: Property images stored in AWS S3
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

  // Timestamps
  createdAt: v.number(),
})
```

**✅ Test:** File should compile without errors

---

### Phase 4: Create Backend Functions (45 minutes)

#### Step 4.1: Create S3 Upload Actions

**Create new file:** `convex/s3Upload.ts`

Copy the full content from `IMAGE_UPLOAD_AWS_IMPLEMENTATION.md` Section 5.2

**✅ Test:** File should compile without TypeScript errors

---

#### Step 4.2: Update PropIQ Mutations

**Edit file:** `convex/propiq.ts`

Add these two mutations at the end of the file (before the closing export):

```typescript
// Save property image metadata after S3 upload
export const savePropertyImage = mutation({
  args: {
    analysisId: v.id("propertyAnalyses"),
    imageData: v.object({
      s3Key: v.string(),
      s3Url: v.string(),
      filename: v.string(),
      size: v.number(),
      mimeType: v.string(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    const currentImages = analysis.images || [];

    if (currentImages.length >= 5) {
      throw new Error("Maximum 5 images per property reached");
    }

    const updatedImages = [
      ...currentImages,
      {
        ...args.imageData,
        uploadedAt: Date.now(),
      },
    ];

    await ctx.db.patch(args.analysisId, {
      images: updatedImages,
    });

    console.log(`[PropIQ] Image added to analysis ${args.analysisId}`);

    return { success: true, imageCount: updatedImages.length };
  },
});

// Delete property image
export const deletePropertyImage = mutation({
  args: {
    analysisId: v.id("propertyAnalyses"),
    s3Key: v.string(),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.analysisId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    const updatedImages = (analysis.images || []).filter(
      (img) => img.s3Key !== args.s3Key
    );

    await ctx.db.patch(args.analysisId, {
      images: updatedImages,
    });

    console.log(`[PropIQ] Image removed from analysis ${args.analysisId}`);

    return { success: true, imageCount: updatedImages.length };
  },
});
```

**✅ Test:** File should compile without TypeScript errors

---

#### Step 4.3: Deploy Backend
```bash
npx convex deploy
```

**✅ Test:** Deployment should succeed with no errors

---

### Phase 5: Create Frontend Component (45 minutes)

#### Step 5.1: Create Upload Component

**Create new file:** `frontend/src/components/PropertyImageUpload.tsx`

Copy the full content from `IMAGE_UPLOAD_AWS_IMPLEMENTATION.md` Section 6.2

**✅ Test:** File should compile without TypeScript errors

---

#### Step 5.2: Add Component Styles

**Create new file:** `frontend/src/components/PropertyImageUpload.css`

Copy the full content from `IMAGE_UPLOAD_AWS_IMPLEMENTATION.md` Section 6.3

---

#### Step 5.3: Integrate into Property Analysis

Find your property analysis component (likely in `frontend/src/pages/` or `frontend/src/components/`)

Add the import:
```typescript
import { PropertyImageUpload } from "../components/PropertyImageUpload";
import "../components/PropertyImageUpload.css";
```

Add the component (after property analysis form):
```typescript
{analysisId && (
  <PropertyImageUpload
    analysisId={analysisId}
    existingImages={analysis?.images || []}
    maxImages={5}
    onUploadComplete={() => {
      console.log("Image upload complete");
      // Optionally refresh analysis data
    }}
  />
)}
```

**✅ Test:** Component should render without errors

---

### Phase 6: Testing (30 minutes)

#### Test 1: Upload Single Image
```
1. Navigate to property analysis page
2. Click "Upload Property Image"
3. Select JPEG/PNG image (< 10 MB)
4. Verify:
   - Upload progress shows
   - Image appears after upload
   - Image displays correctly
5. Check AWS S3 console: Image should be in bucket
6. Check Convex dashboard: Image metadata in database
```
**✅ Pass:** Image uploaded and displayed

---

#### Test 2: Upload Multiple Images
```
1. Upload 5 images total
2. Verify: "Maximum 5 images" message after 5th
3. Try uploading 6th image
4. Verify: Error message shown
```
**✅ Pass:** Limit enforced correctly

---

#### Test 3: Delete Image
```
1. Click X button on uploaded image
2. Verify:
   - Image removed from UI
   - Image deleted from S3 bucket
   - Image metadata removed from Convex
```
**✅ Pass:** Image deleted successfully

---

#### Test 4: Large File Validation
```
1. Try uploading 15 MB image
2. Verify: Error message "File size exceeds maximum of 10 MB"
```
**✅ Pass:** Validation works

---

#### Test 5: Invalid File Type
```
1. Try uploading PDF or other non-image file
2. Verify: Error message about invalid file type
```
**✅ Pass:** File type validation works

---

### Phase 7: Deploy to Production (15 minutes)

#### Step 7.1: Build Frontend
```bash
cd frontend
npm run build
```

**✅ Test:** Build completes successfully

---

#### Step 7.2: Deploy Frontend

Follow your existing deployment process (Netlify or similar)

**✅ Test:** Frontend deployed successfully

---

#### Step 7.3: Verify Production

1. Visit production URL
2. Run all 5 tests from Phase 6
3. Monitor Convex logs for errors
4. Check AWS S3 usage in AWS Console

**✅ Test:** All tests pass in production

---

## 📊 Post-Deployment Monitoring

### Week 1: Daily Checks
- [ ] Check AWS S3 storage usage (AWS Console → S3 → Metrics)
- [ ] Check Convex logs for upload errors
- [ ] Monitor user feedback

### Week 2-4: Weekly Checks
- [ ] Review AWS billing (should be $0 with credits)
- [ ] Check total images uploaded
- [ ] Verify no CORS errors in browser console

### Monthly: Cost Review
- [ ] AWS S3 cost (should be $0-5)
- [ ] Convex tier status (should still be free)
- [ ] AWS Activate credit balance

---

## 🚨 Troubleshooting

### Problem: CORS Error When Uploading
**Solution:**
```bash
# Re-apply CORS configuration
aws s3api get-bucket-cors --bucket propiq-property-images
# If empty, re-run Step 1.3
```

---

### Problem: "AWS credentials not configured"
**Solution:**
```bash
# Verify Convex environment variables
npx convex env list | grep AWS

# If missing, re-run Step 1.5
```

---

### Problem: Image Upload Hangs
**Check:**
1. Network tab in browser DevTools (should show PUT to S3)
2. Convex logs (check for errors in generateUploadUrl)
3. AWS S3 bucket CORS (must allow PUT from your domain)

---

### Problem: Image Displays Broken
**Check:**
1. S3 URL in Convex database (should be valid HTTPS URL)
2. S3 bucket permissions (images should be readable)
3. Browser console for 403 errors (permission issue)

**Fix for 403 errors:**
```bash
# Make bucket publicly readable (be careful!)
aws s3api put-bucket-policy --bucket propiq-property-images --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::propiq-property-images/*"
  }]
}'
```

**Better fix:** Use presigned URLs for viewing (more secure)

---

## ✅ Success Criteria

You're done when:

- [ ] Users can upload 1-5 images per property
- [ ] Images display correctly in UI
- [ ] Images delete successfully
- [ ] File size/type validation works
- [ ] AWS S3 storage cost is $0 (using credits)
- [ ] Convex remains on free tier
- [ ] No errors in production logs

---

## 📈 Next Steps (Optional Enhancements)

After core functionality is working:

1. **Add image captions** (let users add descriptions)
2. **Image thumbnails** (reduce bandwidth with smaller previews)
3. **Image carousel** (better UI for multiple images)
4. **AI image analysis** (extract property features from photos)
5. **CDN integration** (CloudFront for faster loading)

---

## 💡 Pro Tips

1. **Compress aggressively:** Target 1-2 MB per image (saves bandwidth)
2. **Monitor AWS billing:** Set up alert at $5/month
3. **Use image thumbnails:** Generate 200x200 thumbnails for gallery view
4. **Lazy load images:** Don't load all images upfront
5. **Cache S3 URLs:** Store URLs in Convex to avoid re-generating

---

## 📞 Support

**Stuck?** Check these resources:

- Full implementation guide: `IMAGE_UPLOAD_AWS_IMPLEMENTATION.md`
- Cost comparison: `IMAGE_UPLOAD_COST_COMPARISON.md`
- AWS S3 docs: https://docs.aws.amazon.com/s3/
- Convex docs: https://docs.convex.dev/

---

**🎉 Ready to start? Begin with Phase 1, Step 1.1!**
