/**
 * AWS S3 integration for property image uploads
 * Generates presigned URLs for direct browser-to-S3 uploads
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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

    // Generate presigned GET URL for viewing the image (valid for 7 days)
    // This allows private buckets while still letting users view their images
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });
    const publicUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 }); // 7 days

    console.log(`[S3 Upload] Generated presigned URLs for ${args.filename}`);

    return {
      uploadUrl,      // Frontend uploads to this URL (5 min expiry)
      s3Key,          // Store this in Convex database
      publicUrl,      // Store this for displaying the image (7 day expiry)
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
