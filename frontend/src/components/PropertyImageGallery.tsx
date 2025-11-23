import { useState, useEffect, useCallback } from 'react';
import { Image, MapPin, Compass, Satellite, X, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import './PropertyImageGallery.css';

interface PropertyImage {
  url: string;
  type: string;
  width: number;
  height: number;
  heading?: number;
  source: string;
}

interface PropertyImagesResponse {
  success: boolean;
  address: string;
  images: PropertyImage[];
  coordinates?: {
    lat: number;
    lng: number;
    formatted_address: string;
    place_id?: string;
  };
  cached: boolean;
  error?: string;
}

interface PropertyImageGalleryProps {
  address: string;
  onImagesLoaded?: (images: PropertyImage[], primaryImageUrl: string | null) => void;
  className?: string;
  compact?: boolean;
  showControls?: boolean;
}

const getHeadingLabel = (heading?: number): string => {
  if (heading === undefined) return 'View';
  if (heading >= 315 || heading < 45) return 'North';
  if (heading >= 45 && heading < 135) return 'East';
  if (heading >= 135 && heading < 225) return 'South';
  return 'West';
};

const getImageTypeIcon = (type: string) => {
  switch (type) {
    case 'street_view':
      return <Compass className="h-4 w-4" />;
    case 'satellite':
    case 'hybrid':
      return <Satellite className="h-4 w-4" />;
    default:
      return <Image className="h-4 w-4" />;
  }
};

const getImageTypeLabel = (type: string, heading?: number): string => {
  switch (type) {
    case 'street_view':
      return `Street View - ${getHeadingLabel(heading)}`;
    case 'satellite':
      return 'Satellite View';
    case 'hybrid':
      return 'Hybrid Map';
    case 'placeholder':
      return 'Preview Unavailable';
    default:
      return 'Property View';
  }
};

export const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  address,
  onImagesLoaded,
  className = '',
  compact = false,
  showControls = true
}) => {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [formattedAddress, setFormattedAddress] = useState<string>('');

  const fetchImages = useCallback(async () => {
    if (!address || address.trim().length < 5) {
      setImages([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<PropertyImagesResponse>(
        API_ENDPOINTS.PROPERTY_IMAGES,
        { params: { address: address.trim(), include_satellite: true } }
      );

      if (response.data.success && response.data.images.length > 0) {
        setImages(response.data.images);
        setFormattedAddress(response.data.address || address);
        setSelectedIndex(0);

        // Notify parent of loaded images
        if (onImagesLoaded) {
          const primaryUrl = response.data.images[0]?.url || null;
          onImagesLoaded(response.data.images, primaryUrl);
        }

        if (response.data.error) {
          setError(response.data.error);
        }
      } else {
        setError(response.data.error || 'No images available for this address');
        setImages([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch property images:', err);
      setError('Failed to load property images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [address, onImagesLoaded]);

  useEffect(() => {
    // Debounce the fetch to avoid too many requests while typing
    const timeoutId = setTimeout(() => {
      fetchImages();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchImages]);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  const selectedImage = images[selectedIndex];

  // Loading state
  if (loading) {
    return (
      <div className={`property-gallery ${compact ? 'compact' : ''} ${className}`}>
        <div className="property-gallery-loading">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p>Loading property images...</p>
        </div>
      </div>
    );
  }

  // No address or no images
  if (!address || images.length === 0) {
    return (
      <div className={`property-gallery ${compact ? 'compact' : ''} ${className}`}>
        <div className="property-gallery-placeholder">
          <Image className="h-12 w-12 text-gray-500" />
          <p>{error || 'Enter an address to see property images'}</p>
          {error && address && (
            <button onClick={fetchImages} className="property-gallery-retry">
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`property-gallery ${compact ? 'compact' : ''} ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Main Image */}
      <div className="property-gallery-main" onClick={() => setLightboxOpen(true)}>
        <img
          src={selectedImage.url}
          alt={getImageTypeLabel(selectedImage.type, selectedImage.heading)}
          className="property-gallery-image"
          loading="lazy"
        />

        {/* Image type badge */}
        <div className="property-gallery-badge">
          {getImageTypeIcon(selectedImage.type)}
          <span>{getImageTypeLabel(selectedImage.type, selectedImage.heading)}</span>
        </div>

        {/* Navigation arrows */}
        {showControls && images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
              className="property-gallery-nav prev"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="property-gallery-nav next"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="property-gallery-counter">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Address display */}
      {formattedAddress && (
        <div className="property-gallery-address">
          <MapPin className="h-4 w-4 text-violet-400" />
          <span>{formattedAddress}</span>
        </div>
      )}

      {/* Thumbnails */}
      {!compact && images.length > 1 && (
        <div className="property-gallery-thumbnails">
          {images.map((img, index) => (
            <button
              key={`${img.type}-${img.heading || index}`}
              onClick={() => handleThumbnailClick(index)}
              className={`property-gallery-thumb ${index === selectedIndex ? 'active' : ''}`}
              aria-label={getImageTypeLabel(img.type, img.heading)}
            >
              <img
                src={img.url}
                alt={getImageTypeLabel(img.type, img.heading)}
                loading="lazy"
              />
              <span className="thumb-label">
                {img.type === 'street_view'
                  ? getHeadingLabel(img.heading)
                  : img.type === 'satellite' ? 'Satellite' : 'Hybrid'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Error notice */}
      {error && (
        <div className="property-gallery-error">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="property-gallery-lightbox" onClick={() => setLightboxOpen(false)}>
          <button
            className="lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={getImageTypeLabel(selectedImage.type, selectedImage.heading)}
            />

            <div className="lightbox-caption">
              <MapPin className="h-4 w-4" />
              <span>{formattedAddress}</span>
              <span className="lightbox-type">
                {getImageTypeLabel(selectedImage.type, selectedImage.heading)}
              </span>
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="lightbox-nav prev"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={handleNext}
                  className="lightbox-nav next"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnails */}
          <div className="lightbox-thumbnails">
            {images.map((img, index) => (
              <button
                key={`lightbox-${img.type}-${img.heading || index}`}
                onClick={(e) => { e.stopPropagation(); handleThumbnailClick(index); }}
                className={`lightbox-thumb ${index === selectedIndex ? 'active' : ''}`}
              >
                <img
                  src={img.url}
                  alt={getImageTypeLabel(img.type, img.heading)}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyImageGallery;
