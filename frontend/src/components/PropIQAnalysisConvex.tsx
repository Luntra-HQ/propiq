/**
 * PropIQ Analysis Component (Convex Backend)
 *
 * Integrated image upload + AI property analysis
 * Replaces legacy FastAPI-based PropIQAnalysis.tsx
 *
 * Features:
 * - Upload 0-5 property images before analysis
 * - Direct S3 upload (no Convex bandwidth)
 * - Atomic save (images + analysis together)
 * - Address validation with real-time feedback
 * - Responsive design (mobile-first)
 */

import { useState, useEffect, useRef } from 'react';
import { useAction } from 'convex/react';
// CONVEX FIX: Use string literals instead of api import (Convex best practice for client-side)
// import { api } from '../../convex/_generated/api';
// import type { Id } from '../../convex/_generated/dataModel';
import imageCompression from 'browser-image-compression';
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  MapPin,
  DollarSign,
  BarChart3,
  Lightbulb,
  Zap,
  Info,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { validateAddress, type ValidationResult } from '../utils/addressValidation';
import './PropIQAnalysis.css'; // Reuse existing styles

interface PropIQAnalysisConvexProps {
  onClose: () => void;
  userId: string; // Changed from Id<"users"> to string for client compatibility
}

interface UploadedImage {
  s3Key: string;
  s3Url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
  width?: number;
  height?: number;
}

type Step = 'input' | 'uploading' | 'analyzing' | 'results';

export const PropIQAnalysisConvex: React.FC<PropIQAnalysisConvexProps> = ({ onClose, userId }) => {
  // Analysis state
  const [step, setStep] = useState<Step>('input');
  const [address, setAddress] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [downPayment, setDownPayment] = useState<number | ''>('');
  const [monthlyRent, setMonthlyRent] = useState<number | ''>('');

  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis results
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [analysesRemaining, setAnalysesRemaining] = useState<number | null>(null);

  // Address validation
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Convex actions - using string literals (Convex client-side pattern)
  const analyzeProperty = useAction("propiq:analyzeProperty" as any);
  const generateUploadUrl = useAction("s3Upload:generateUploadUrl" as any);
  const deleteS3Image = useAction("s3Upload:deleteImage" as any);

  const maxImages = 5;
  const maxFileSize = 10 * 1024 * 1024; // 10 MB

  // Real-time address validation
  useEffect(() => {
    if (address.trim().length > 0) {
      const result = validateAddress(address);
      setValidationResult(result);
      setShowValidation(address.trim().length >= 10);
    } else {
      setValidationResult(null);
      setShowValidation(false);
    }
  }, [address]);

  // Load sample property
  const loadSampleProperty = () => {
    setAddress('2505 Longview St, Austin, TX 78705');
    setPurchasePrice(425000);
    setDownPayment(85000);
    setMonthlyRent(2800);
    setError(null);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (selectedFiles.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        setError(`${file.name}: Only JPEG, PNG, and WebP images allowed`);
        continue;
      }
      if (file.size > maxFileSize) {
        setError(`${file.name}: File too large (max 10 MB)`);
        continue;
      }
      validFiles.push(file);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images to S3
  const uploadImagesToS3 = async (): Promise<UploadedImage[]> => {
    const uploaded: UploadedImage[] = [];
    const totalFiles = selectedFiles.length;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgress(Math.floor((i / totalFiles) * 40)); // 0-40% for uploads

      try {
        // Compress image
        const compressionOptions = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, compressionOptions);

        // Get presigned URL
        const { uploadUrl, s3Key, publicUrl } = await generateUploadUrl({
          userId,
          filename: file.name,
          contentType: compressedFile.type,
          fileSize: compressedFile.size,
        });

        // Upload to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: compressedFile,
          headers: {
            'Content-Type': compressedFile.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        // Get image dimensions
        const img = new Image();
        const imageUrl = URL.createObjectURL(compressedFile);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });
        URL.revokeObjectURL(imageUrl);

        uploaded.push({
          s3Key,
          s3Url: publicUrl,
          filename: file.name,
          size: compressedFile.size,
          mimeType: compressedFile.type,
          uploadedAt: Date.now(),
          width: img.width,
          height: img.height,
        });
      } catch (err: any) {
        console.error(`Failed to upload ${file.name}:`, err);
        throw new Error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    return uploaded;
  };

  // Cleanup uploaded images on error
  const cleanupUploadedImages = async (images: UploadedImage[]) => {
    for (const img of images) {
      try {
        await deleteS3Image({ s3Key: img.s3Key });
      } catch (err) {
        console.error(`Failed to delete ${img.s3Key}:`, err);
      }
    }
  };

  // Handle analyze button click
  const handleAnalyze = async () => {
    const trimmedAddress = address.trim();

    // Validate address
    const validation = validateAddress(trimmedAddress);
    if (!validation.valid) {
      setError(validation.errors[0] || 'Please enter a valid address');
      setShowValidation(true);
      return;
    }

    if (validation.warnings.length > 0 && validation.confidence === 'low') {
      setError('Address may be incomplete. Please verify before continuing.');
      setShowValidation(true);
      return;
    }

    setError(null);
    let images: UploadedImage[] = [];

    try {
      // Step 1: Upload images (if any)
      if (selectedFiles.length > 0) {
        setStep('uploading');
        images = await uploadImagesToS3();
        setUploadedImages(images);
      }

      // Step 2: Run analysis
      setStep('analyzing');
      setUploadProgress(50); // 50% - analysis starting

      const result = await analyzeProperty({
        userId,
        address: trimmedAddress,
        purchasePrice: purchasePrice || undefined,
        downPayment: downPayment || undefined,
        monthlyRent: monthlyRent || undefined,
        images: images.length > 0 ? images : undefined,
      });

      setUploadProgress(100);

      if (result.success) {
        setAnalysisId(result.analysisId);
        setAnalysis(result.analysis);
        setAnalysesRemaining(result.analysesRemaining);
        setStep('results');
      } else {
        // Analysis failed - cleanup uploaded images
        if (images.length > 0) {
          await cleanupUploadedImages(images);
        }
        setError(result.error || 'Analysis failed');
        setStep('input');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);

      // Cleanup uploaded images on error
      if (images.length > 0) {
        await cleanupUploadedImages(images);
      }

      setError(err.message || 'Failed to analyze property. Please try again.');
      setStep('input');
    }
  };

  // Analysis complete - render results
  if (step === 'results' && analysis) {
    return (
      <div className="propiq-analysis-overlay">
        <div className="propiq-analysis-modal">
          <div className="propiq-header">
            <div className="propiq-header-content">
              <Target className="h-6 w-6 text-violet-300" />
              <h2>PropIQ Analysis Results</h2>
            </div>
            <button onClick={onClose} className="propiq-close-btn">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="propiq-content">
            {/* Success message */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-emerald-400 font-semibold mb-1">Analysis Complete!</h4>
                  <p className="text-sm text-gray-300">
                    {uploadedImages.length > 0 && `${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''} uploaded. `}
                    {analysesRemaining !== null && `You have ${analysesRemaining} analyses remaining.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Property images gallery */}
            {uploadedImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Property Photos ({uploadedImages.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.s3Url}
                        alt={img.filename}
                        className="w-full h-32 object-cover rounded-lg border border-slate-700"
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                        {img.filename}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis results */}
            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-violet-300 font-semibold mb-2">Analysis Summary</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}
                </p>
              </div>

              <button
                onClick={() => {
                  setStep('input');
                  setSelectedFiles([]);
                  setUploadedImages([]);
                  setAnalysis(null);
                  setAnalysisId(null);
                  setAddress('');
                  setPurchasePrice('');
                  setDownPayment('');
                  setMonthlyRent('');
                }}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Analyze Another Property
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Input form / uploading / analyzing states
  return (
    <div className="propiq-analysis-overlay">
      <div className="propiq-analysis-modal">
        <div className="propiq-header">
          <div className="propiq-header-content">
            <Target className="h-6 w-6 text-violet-300" />
            <h2>PropIQ AI Analysis</h2>
          </div>
          <button onClick={onClose} className="propiq-close-btn" disabled={step !== 'input'}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="propiq-content">
          {/* Upload/Analysis progress */}
          {(step === 'uploading' || step === 'analyzing') && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">
                  {step === 'uploading' && 'Uploading images...'}
                  {step === 'analyzing' && 'Analyzing property...'}
                </span>
                <span className="text-sm text-gray-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-center mt-4 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Please wait...</span>
              </div>
            </div>
          )}

          {step === 'input' && (
            <>
              <p className="propiq-description">
                Get AI-powered investment analysis for any property. Upload property photos and enter details below.
              </p>

              {/* Sample Property Button */}
              <div className="propiq-sample-banner">
                <div className="propiq-sample-content">
                  <Zap className="h-5 w-5" />
                  <div>
                    <h4>New to PropIQ?</h4>
                    <p>Try our sample property to see instant analysis</p>
                  </div>
                </div>
                <button onClick={loadSampleProperty} className="propiq-sample-btn" type="button">
                  <Target className="h-4 w-4" />
                  Try Sample
                </button>
              </div>

              {error && (
                <div className="propiq-error">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <ImageIcon className="h-4 w-4 inline mr-2" />
                  Property Photos (Optional, up to {maxImages})
                </label>

                <div
                  className="border-2 border-dashed border-slate-600 hover:border-violet-500 rounded-lg p-6 text-center cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, WebP (max 10 MB each)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Selected files preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded-lg border border-slate-700"
                        />
                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Address Input */}
              <div className="propiq-form-group">
                <label htmlFor="propertyAddress">
                  <MapPin className="h-4 w-4" />
                  Property Address *
                </label>
                <input
                  id="propertyAddress"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                  className={`propiq-input ${
                    showValidation && validationResult
                      ? validationResult.valid
                        ? 'border-green-500/50'
                        : 'border-red-500/50'
                      : ''
                  }`}
                  autoFocus
                />

                {/* Validation Feedback */}
                {showValidation && validationResult && (
                  <div className="mt-2 space-y-2">
                    {validationResult.errors.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        {validationResult.errors.map((err, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-red-400 text-sm">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {validationResult.warnings.length > 0 && validationResult.errors.length === 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        {validationResult.warnings.map((warn, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-yellow-400 text-sm">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional Financial Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="propiq-form-group">
                  <label htmlFor="purchasePrice">
                    <DollarSign className="h-4 w-4" />
                    Purchase Price
                  </label>
                  <input
                    id="purchasePrice"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="425000"
                    className="propiq-input"
                  />
                </div>

                <div className="propiq-form-group">
                  <label htmlFor="downPayment">
                    <DollarSign className="h-4 w-4" />
                    Down Payment
                  </label>
                  <input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value ? Number(e.target.value) : '')}
                    placeholder="85000"
                    className="propiq-input"
                  />
                </div>

                <div className="propiq-form-group">
                  <label htmlFor="monthlyRent">
                    <DollarSign className="h-4 w-4" />
                    Monthly Rent
                  </label>
                  <input
                    id="monthlyRent"
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value ? Number(e.target.value) : '')}
                    placeholder="2800"
                    className="propiq-input"
                  />
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!address.trim()}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="h-5 w-5" />
                Analyze Property
                {selectedFiles.length > 0 && ` (with ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''})`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
