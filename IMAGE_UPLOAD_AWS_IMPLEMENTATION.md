# PropIQ Image Upload Implementation with AWS S3

**Date:** 2026-01-06
**Status:** APPROVED - Ready for implementation
**Cost:** $0 using AWS Activate credits (then ~$2-5/month after credits expire)

---

## Executive Summary

**Architecture Decision:** Use AWS S3 for image storage + Convex for metadata
**Why:** Leverages your AWS Activate credits, keeps Convex on FREE tier, better scalability
**Cost Savings:** $25-100/month vs Convex Pro approach

---

## 1. Cost Comparison

### Option A: Convex Pro (Original Plan)
```
Convex Professional tier: $25/month base
- File storage: 100 GB included
- Bandwidth: 50 GB/month included
- Overage bandwidth: $0.30/GB

Expected monthly cost: $25-100 (depending on usage)
Using your credits: NO
```

### Option B: AWS S3 + Convex Free (RECOMMENDED)
```
AWS S3 Storage: $0.023/GB/month
AWS S3 Bandwidth (first 1 GB free): $0.09/GB after
Convex Free tier: $0 (only storing URLs, not files)

Expected monthly cost: $2-5/month
Using your credits: YES (AWS Activate covers this)
**Effective cost: $0 until credits expire**
```

### Option C: GCP Cloud Storage + Convex Free (Alternative)
```
GCP Cloud Storage: $0.020/GB/month
GCP Cloud CDN bandwidth: $0.08-0.12/GB
Convex Free tier: $0

Expected monthly cost: $2-5/month
Using your credits: YES ($1000 GCP credit)
**Effective cost: $0 for ~200 months** (16+ years at $5/month)
```

**Recommendation:** Start with **AWS S3** (Option B) since you mentioned AWS Activate first.

---

## 2. Architecture Overview

### Current Flow (No Images)
```
User → Frontend → Convex Action → Azure OpenAI → Convex Database
```

### New Flow (With AWS S3 Images)
```
Image Upload:
User → Frontend → Convex Action (generates presigned URL) → Frontend → AWS S3 (direct upload)
                                                                     ↓
                                                          Convex Database (stores S3 URL)

Image Display:
User → Frontend → Convex Query (get S3 URL) → Frontend → AWS S3 (load image)
```

### Key Benefits
✅ **Direct browser-to-S3 upload** (Convex never touches the image file)
✅ **Convex only stores URLs** (tiny metadata, ~100 bytes)
✅ **No Convex bandwidth consumed** (images served directly from S3/CloudFront)
✅ **Stays on Convex free tier** (no file storage used)

---

## 3. Database Schema Changes

### 3.1 Add Image Fields to propertyAnalyses

**File:** `convex/schema.ts`

```typescript
// Add to propertyAnalyses table definition (around line 42)
propertyAnalyses: defineTable({
  userId: v.id("users"),

  // ... existing fields ...

  // NEW: Property images stored in AWS S3
  images: v.optional(v.array(v.object({
    s3Key: v.string(),              // S3 object key (e.g., "properties/abc123/image1.jpg")
    s3Url: v.string(),               // Full S3 URL for display
    filename: v.string(),            // Original filename
    size: v.number(),                // File size in bytes
    mimeType: v.string(),            // e.g., "image/jpeg"
    uploadedAt: v.number(),          // Timestamp
    width: v.optional(v.number()),   // Image dimensions (optional)
    height: v.optional(v.number()),
  }))),

  // ... rest of existing fields ...
})
```

### 3.2 Storage Impact
- Each image metadata: ~200-300 bytes
- 5 images per property: ~1.5 KB
- 1000 properties with images: ~1.5 MB (0.3% of free tier 0.5 GB database limit)
- **Impact:** ✅ NEGLIGIBLE

---

## 4. AWS S3 Setup

### 4.1 Create S3 Bucket

**Prerequisites:**
- AWS account with Activate credits
- AWS CLI installed (or use AWS Console)

**Setup steps:**

```bash
# 1. Install AWS CLI (if not already installed)
# macOS:
brew install awscli

# 2. Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1 (or your preferred region)
# Default output format: json

# 3. Create S3 bucket for PropIQ images
aws s3 mb s3://propiq-property-images --region us-east-1

# 4. Enable versioning (optional, for data protection)
aws s3api put-bucket-versioning \
  --bucket propiq-property-images \
  --versioning-configuration Status=Enabled

# 5. Create lifecycle policy to delete incomplete uploads after 1 day
cat > lifecycle.json << 'EOF'
{
  "Rules": [
    {
      "Id": "DeleteIncompleteUploads",
      "Status": "Enabled",
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 1
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket propiq-property-images \
  --lifecycle-configuration file://lifecycle.json

rm lifecycle.json
```

### 4.2 Configure CORS (Required for Browser Uploads)

```bash
# Create CORS configuration
cat > cors.json << 'EOF'
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

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket propiq-property-images \
  --cors-configuration file://cors.json

rm cors.json
```

### 4.3 Create IAM User for Convex (Generate Presigned URLs)

```bash
# 1. Create IAM policy for S3 uploads
cat > s3-upload-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::propiq-property-images/*"
    }
  ]
}
EOF

# 2. Create IAM policy
aws iam create-policy \
  --policy-name PropIQ-S3-Upload \
  --policy-document file://s3-upload-policy.json

# Note the policy ARN from the output, you'll need it next

# 3. Create IAM user
aws iam create-user --user-name propiq-s3-uploader

# 4. Attach policy to user (replace ACCOUNT_ID with your AWS account ID)
aws iam attach-user-policy \
  --user-name propiq-s3-uploader \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/PropIQ-S3-Upload

# 5. Create access keys
aws iam create-access-key --user-name propiq-s3-uploader

# IMPORTANT: Save the AccessKeyId and SecretAccessKey from the output!
# You'll add these to your Convex environment variables

rm s3-upload-policy.json
```

### 4.4 Add AWS Credentials to Convex Environment

```bash
# Navigate to your Convex dashboard or use CLI
npx convex env set AWS_ACCESS_KEY_ID "your-access-key-id"
npx convex env set AWS_SECRET_ACCESS_KEY "your-secret-access-key"
npx convex env set AWS_S3_BUCKET "propiq-property-images"
npx convex env set AWS_S3_REGION "us-east-1"
```

**Security Note:** These credentials are stored securely in Convex's environment, never exposed to the frontend.

---

## 5. Backend Implementation (Convex)

### 5.1 Install AWS SDK

```bash
# From project root
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 5.2 Create S3 Upload Action

**File:** `convex/s3Upload.ts` (NEW FILE)

```typescript
/**
 * AWS S3 integration for property image uploads
 * Generates presigned URLs for direct browser-to-S3 uploads
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const getS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_S3_REGION || "us-east-1";

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials not configured in Convex environment");
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

// Generate presigned URL for image upload
export const generateUploadUrl = action({
  args: {
    userId: v.id("users"),
    filename: v.string(),
    contentType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    // Validation
    const maxFileSize = 10 * 1024 * 1024; // 10 MB
    if (args.fileSize > maxFileSize) {
      throw new Error(`File size exceeds maximum of 10 MB`);
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(args.contentType)) {
      throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
    }

    // Generate unique S3 key
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileExtension = args.filename.split(".").pop();
    const s3Key = `properties/${args.userId}/${timestamp}-${randomId}.${fileExtension}`;

    // Get S3 client
    const s3Client = getS3Client();
    const bucket = process.env.AWS_S3_BUCKET!;

    // Create presigned URL (valid for 5 minutes)
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: args.contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Generate public URL for the uploaded file
    const region = process.env.AWS_S3_REGION || "us-east-1";
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

    console.log(`[S3 Upload] Generated presigned URL for ${args.filename}`);

    return {
      uploadUrl,      // Frontend uploads to this URL
      s3Key,          // Store this in Convex database
      publicUrl,      // Store this for displaying the image
    };
  },
});

// Delete image from S3 (when user deletes property or image)
export const deleteImage = action({
  args: {
    s3Key: v.string(),
  },
  handler: async (ctx, args) => {
    const s3Client = getS3Client();
    const bucket = process.env.AWS_S3_BUCKET!;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: args.s3Key,
    });

    await s3Client.send(command);

    console.log(`[S3 Delete] Deleted image: ${args.s3Key}`);

    return { success: true };
  },
});
```

### 5.3 Update Property Analysis to Support Images

**File:** `convex/propiq.ts` (UPDATE EXISTING)

Add new mutation to save image metadata:

```typescript
// Add this new mutation to convex/propiq.ts

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

    // Get existing images or initialize empty array
    const currentImages = analysis.images || [];

    // Add new image (limit to 5 images per property)
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

    // Update analysis with new image
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

    // Remove image from array
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

---

## 6. Frontend Implementation

### 6.1 Install Browser Image Compression (Optional but Recommended)

```bash
cd frontend
npm install browser-image-compression
```

### 6.2 Create Image Upload Component

**File:** `frontend/src/components/PropertyImageUpload.tsx` (NEW FILE)

```typescript
import { useState, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import imageCompression from "browser-image-compression";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";

interface PropertyImageUploadProps {
  analysisId: string;
  existingImages?: Array<{
    s3Key: string;
    s3Url: string;
    filename: string;
  }>;
  maxImages?: number;
  onUploadComplete?: () => void;
}

export const PropertyImageUpload = ({
  analysisId,
  existingImages = [],
  maxImages = 5,
  onUploadComplete,
}: PropertyImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useAction(api.s3Upload.generateUploadUrl);
  const savePropertyImage = useMutation(api.propiq.savePropertyImage);
  const deletePropertyImage = useMutation(api.propiq.deletePropertyImage);
  const deleteS3Image = useAction(api.s3Upload.deleteImage);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if max images reached
    if (existingImages.length >= maxImages) {
      setError(`Maximum ${maxImages} images per property`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Compress image (target: <2 MB)
      setUploadProgress(10);
      const compressionOptions = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, compressionOptions);
      console.log(`Compressed ${file.name} from ${file.size} to ${compressedFile.size} bytes`);

      setUploadProgress(30);

      // Step 2: Get presigned URL from Convex
      const { uploadUrl, s3Key, publicUrl } = await generateUploadUrl({
        userId: analysisId, // Using analysisId as proxy for userId (update as needed)
        filename: file.name,
        contentType: compressedFile.type,
        fileSize: compressedFile.size,
      });

      setUploadProgress(40);

      // Step 3: Upload directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: compressedFile,
        headers: {
          "Content-Type": compressedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to S3");
      }

      setUploadProgress(70);

      // Step 4: Get image dimensions
      const img = new Image();
      const imageUrl = URL.createObjectURL(compressedFile);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      URL.revokeObjectURL(imageUrl);

      setUploadProgress(80);

      // Step 5: Save metadata to Convex
      await savePropertyImage({
        analysisId,
        imageData: {
          s3Key,
          s3Url: publicUrl,
          filename: file.name,
          size: compressedFile.size,
          mimeType: compressedFile.type,
          width: img.width,
          height: img.height,
        },
      });

      setUploadProgress(100);
      console.log("✅ Image uploaded successfully");

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete();
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (s3Key: string) => {
    try {
      // Delete from Convex database
      await deletePropertyImage({ analysisId, s3Key });

      // Delete from S3
      await deleteS3Image({ s3Key });

      console.log("✅ Image deleted successfully");

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete image");
    }
  };

  return (
    <div className="property-image-upload">
      {/* Upload Button */}
      {existingImages.length < maxImages && (
        <div className="upload-button-container">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="upload-button"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload Property Image ({existingImages.length}/{maxImages})
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <X size={16} />
          {error}
        </div>
      )}

      {/* Image Gallery */}
      {existingImages.length > 0 && (
        <div className="image-gallery">
          {existingImages.map((image) => (
            <div key={image.s3Key} className="image-item">
              <img src={image.s3Url} alt={image.filename} />
              <button
                onClick={() => handleDeleteImage(image.s3Key)}
                className="delete-button"
                title="Delete image"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 6.3 Add Styles

**File:** `frontend/src/components/PropertyImageUpload.css` (NEW FILE)

```css
.property-image-upload {
  margin: 20px 0;
}

.upload-button-container {
  margin-bottom: 16px;
}

.upload-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-button:hover:not(:disabled) {
  background: #7c3aed;
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-button:hover {
  background: rgba(220, 38, 38, 0.9);
}
```

---

## 7. Integration with Existing Property Analysis

### 7.1 Update Property Analysis Form

**File:** Update your existing property analysis component (likely in `frontend/src/pages/` or `frontend/src/components/`)

```typescript
import { PropertyImageUpload } from "../components/PropertyImageUpload";

// Inside your PropertyAnalysisForm or similar component:

<PropertyImageUpload
  analysisId={analysisId} // Pass the analysis ID after creating analysis
  existingImages={analysis?.images || []}
  maxImages={5}
  onUploadComplete={() => {
    // Optionally refresh analysis data
    console.log("Image upload complete");
  }}
/>
```

---

## 8. Deployment Checklist

### Before Deploying:

- [ ] AWS S3 bucket created and configured
- [ ] CORS configured on S3 bucket
- [ ] IAM user created with S3 permissions
- [ ] AWS credentials added to Convex environment
- [ ] Schema updated in `convex/schema.ts`
- [ ] Backend code deployed to Convex (`npx convex deploy`)
- [ ] Frontend code includes new upload component
- [ ] Tested upload flow in development

### Testing Checklist:

- [ ] Upload image (< 10 MB)
- [ ] Verify image appears in S3 bucket
- [ ] Verify image metadata saved in Convex
- [ ] Verify image displays correctly
- [ ] Delete image and verify it's removed from S3 and Convex
- [ ] Test max images limit (5 per property)
- [ ] Test file type validation (only JPEG, PNG, WebP)
- [ ] Test file size validation (max 10 MB before compression)

---

## 9. Cost Monitoring

### AWS Cost Dashboard

1. Log in to AWS Console
2. Go to **Billing & Cost Management** → **Cost Explorer**
3. Filter by service: **Amazon S3**
4. Set up billing alerts:
   - Alert at $5/month
   - Alert at $10/month

### Expected Costs (After AWS Activate Credits Expire)

**Scenario: 100 users, 3 images each, 10 views per image per month**

```
Storage: 100 users × 3 images × 2 MB = 600 MB = 0.6 GB
Storage cost: 0.6 GB × $0.023/GB = $0.014/month

Upload bandwidth: 600 MB (one-time per image)
Upload cost: First 1 GB free = $0

Download bandwidth: 600 MB × 10 views = 6 GB
Download cost: (6 GB - 1 GB free) × $0.09/GB = $0.45/month

Total: ~$0.50/month
```

**Actual cost will likely be $2-5/month** depending on usage patterns.

---

## 10. Migration Path When Credits Expire

### Option 1: Continue with AWS S3 (RECOMMENDED)
- Cost: $2-5/month (very affordable)
- No code changes needed
- Proven scalability

### Option 2: Switch to GCP Cloud Storage
- Use your $1000 GCP credit (~200 months of free storage)
- Requires code changes (swap AWS SDK for GCP SDK)
- Similar architecture

### Option 3: Switch to Convex Pro
- Cost: $25-100/month
- Simplifies architecture (everything in Convex)
- Better for very low-traffic apps

**Recommendation:** Stay with AWS S3 even after credits expire. At $2-5/month, it's much cheaper than Convex Pro.

---

## 11. Alternative: GCP Cloud Storage Implementation

If you prefer to use your $1000 GCP credit instead of AWS:

### Quick Setup Guide

1. **Create GCP bucket:**
```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Create bucket
gsutil mb -l us-central1 gs://propiq-property-images

# Set CORS
cat > cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:5173", "https://propiq.luntra.one"],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://propiq-property-images
rm cors.json
```

2. **Create service account:**
```bash
gcloud iam service-accounts create propiq-s3-uploader

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:propiq-s3-uploader@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud iam service-accounts keys create propiq-gcp-key.json \
  --iam-account=propiq-s3-uploader@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

3. **Update Convex backend:**
- Replace `@aws-sdk/client-s3` with `@google-cloud/storage`
- Update `convex/s3Upload.ts` to use GCP Storage SDK
- Add GCP credentials to Convex environment

**Cost with GCP:**
- Storage: $0.020/GB/month (slightly cheaper than AWS)
- Bandwidth: $0.08-0.12/GB (similar to AWS)
- **Total: $2-5/month** (same as AWS)

---

## 12. Next Steps

### Immediate Actions (Today):

1. **Set up AWS S3 bucket** (15 minutes)
   ```bash
   # Run all commands from Section 4.1-4.3
   ```

2. **Add AWS credentials to Convex** (5 minutes)
   ```bash
   npx convex env set AWS_ACCESS_KEY_ID "..."
   npx convex env set AWS_SECRET_ACCESS_KEY "..."
   npx convex env set AWS_S3_BUCKET "propiq-property-images"
   npx convex env set AWS_S3_REGION "us-east-1"
   ```

3. **Install AWS SDK** (2 minutes)
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   cd frontend && npm install browser-image-compression
   ```

### Implementation (Tomorrow):

4. **Update Convex schema** (5 minutes)
   - Add `images` field to `propertyAnalyses` table

5. **Create backend functions** (30 minutes)
   - Create `convex/s3Upload.ts`
   - Update `convex/propiq.ts` with image mutations

6. **Deploy Convex backend** (2 minutes)
   ```bash
   npx convex deploy
   ```

7. **Create frontend component** (45 minutes)
   - Create `PropertyImageUpload.tsx`
   - Add styles
   - Integrate into property analysis form

8. **Test end-to-end** (30 minutes)
   - Upload image
   - Verify S3 storage
   - Verify Convex metadata
   - Delete image
   - Test error cases

### Total Time: ~2-3 hours

---

## 13. Support & Troubleshooting

### Common Issues:

**1. CORS errors when uploading**
- **Cause:** S3 bucket CORS not configured correctly
- **Fix:** Ensure CORS includes your frontend domain

**2. Presigned URL expires before upload**
- **Cause:** Slow internet connection + 5-minute expiry
- **Fix:** Increase `expiresIn` in `getSignedUrl()` to 600 (10 minutes)

**3. Images don't display after upload**
- **Cause:** S3 bucket is not public-readable
- **Fix:** Use presigned URLs for viewing (add `getImageUrl` action)

**4. AWS credentials error in Convex**
- **Cause:** Environment variables not set
- **Fix:** Re-run `npx convex env set` commands

### Need Help?

- AWS S3 docs: https://docs.aws.amazon.com/s3/
- Convex docs: https://docs.convex.dev/
- AWS SDK for JavaScript: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/

---

## 14. Conclusion

✅ **Using AWS S3 with your Activate credits is the best approach:**

1. **$0 cost** while using credits (then $2-5/month)
2. **Keeps Convex on free tier** (no upgrade needed)
3. **Better architecture** (separation of concerns)
4. **Scales effortlessly** (S3 handles millions of images)
5. **Industry standard** (production-ready solution)

**Start with AWS S3, keep your $1000 GCP credit as backup for the future!**

---

**Ready to implement? Follow the steps in Section 12. Let me know if you need any clarification!**
