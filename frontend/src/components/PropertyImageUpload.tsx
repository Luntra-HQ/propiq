import { useState, useRef } from "react";
import { useMutation, useAction } from "convex/react";
// GROK'S FIX: Remove api import, use string literals
// import { api } from "../../../convex/_generated/api";
import imageCompression from "browser-image-compression";
import { Upload, X, Loader2 } from "lucide-react";
// import type { Id } from "../../../convex/_generated/dataModel";

interface PropertyImageUploadProps {
  analysisId: string; // Changed from Id<"propertyAnalyses">
  userId: string; // Changed from Id<"users">
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
  userId,
  existingImages = [],
  maxImages = 5,
  onUploadComplete,
}: PropertyImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GROK'S FIX: Use string literals
  const generateUploadUrl = useAction("s3Upload:generateUploadUrl" as any);
  const savePropertyImage = useMutation("propiq:savePropertyImage" as any);
  const deletePropertyImage = useMutation("propiq:deletePropertyImage" as any);
  const deleteS3Image = useAction("s3Upload:deleteImage" as any);

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
        userId,
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
