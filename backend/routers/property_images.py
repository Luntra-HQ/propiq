"""
Property Images API
Fetches property images using Google Street View and geocoding APIs

Part of PropIQ Data Moat - Real Property Intelligence
"""

from fastapi import APIRouter, HTTPException, Header, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
import os
import hashlib
import json
import jwt
import httpx
from config.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/property", tags=["Property Images"])

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# JWT Configuration (must match auth.py)
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

# In-memory cache for images (replace with Redis in production)
_image_cache: dict = {}
CACHE_TTL_HOURS = 24

# Response Models
class PropertyImage(BaseModel):
    """Single property image"""
    url: str = Field(..., description="Image URL")
    type: str = Field(..., description="Image type (street_view, satellite, etc.)")
    width: int = Field(640, description="Image width in pixels")
    height: int = Field(480, description="Image height in pixels")
    heading: Optional[int] = Field(None, description="Camera heading (0-360)")
    source: str = Field("google", description="Image source provider")


class PropertyImagesResponse(BaseModel):
    """Response containing property images"""
    success: bool
    address: str
    images: List[PropertyImage]
    coordinates: Optional[dict] = None
    cached: bool = False
    error: Optional[str] = None


class GeocodeResult(BaseModel):
    """Geocoding result"""
    lat: float
    lng: float
    formatted_address: str
    place_id: Optional[str] = None


def verify_token(authorization: str = Header(None)) -> dict:
    """
    Verify JWT token from Authorization header
    Returns decoded token payload with user_id and email
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT configuration error")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")


def get_cache_key(address: str) -> str:
    """Generate a cache key from address"""
    return hashlib.md5(address.lower().strip().encode()).hexdigest()


def get_cached_images(cache_key: str) -> Optional[dict]:
    """Get images from cache if not expired"""
    if cache_key in _image_cache:
        cached = _image_cache[cache_key]
        if datetime.utcnow() < cached.get("expires_at", datetime.min):
            return cached.get("data")
    return None


def set_cached_images(cache_key: str, data: dict):
    """Store images in cache with TTL"""
    _image_cache[cache_key] = {
        "data": data,
        "expires_at": datetime.utcnow() + timedelta(hours=CACHE_TTL_HOURS)
    }


async def geocode_address(address: str) -> Optional[GeocodeResult]:
    """
    Convert address to coordinates using Google Geocoding API
    """
    if not GOOGLE_MAPS_API_KEY:
        logger.warning("Google Maps API key not configured, using fallback coordinates")
        return None

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://maps.googleapis.com/maps/api/geocode/json",
                params={
                    "address": address,
                    "key": GOOGLE_MAPS_API_KEY
                },
                timeout=10.0
            )

            if response.status_code != 200:
                logger.error(f"Geocoding API error: {response.status_code}")
                return None

            data = response.json()

            if data.get("status") != "OK" or not data.get("results"):
                logger.warning(f"Geocoding failed for address: {address}")
                return None

            result = data["results"][0]
            location = result["geometry"]["location"]

            return GeocodeResult(
                lat=location["lat"],
                lng=location["lng"],
                formatted_address=result["formatted_address"],
                place_id=result.get("place_id")
            )

    except Exception as e:
        logger.error(f"Geocoding error: {e}")
        return None


def generate_street_view_url(
    lat: float,
    lng: float,
    width: int = 640,
    height: int = 480,
    heading: Optional[int] = None,
    pitch: int = 10,
    fov: int = 90
) -> str:
    """
    Generate Google Street View Static API URL
    """
    if not GOOGLE_MAPS_API_KEY:
        # Return placeholder if no API key
        return f"https://via.placeholder.com/{width}x{height}/1a1a2e/8b5cf6?text=Street+View+Unavailable"

    base_url = "https://maps.googleapis.com/maps/api/streetview"
    params = {
        "size": f"{width}x{height}",
        "location": f"{lat},{lng}",
        "pitch": str(pitch),
        "fov": str(fov),
        "key": GOOGLE_MAPS_API_KEY
    }

    if heading is not None:
        params["heading"] = str(heading)

    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{base_url}?{query_string}"


def generate_static_map_url(
    lat: float,
    lng: float,
    width: int = 640,
    height: int = 480,
    zoom: int = 18,
    map_type: str = "satellite"
) -> str:
    """
    Generate Google Static Maps API URL for satellite/aerial view
    """
    if not GOOGLE_MAPS_API_KEY:
        return f"https://via.placeholder.com/{width}x{height}/1a1a2e/8b5cf6?text=Map+Unavailable"

    base_url = "https://maps.googleapis.com/maps/api/staticmap"
    params = {
        "center": f"{lat},{lng}",
        "zoom": str(zoom),
        "size": f"{width}x{height}",
        "maptype": map_type,
        "markers": f"color:violet|{lat},{lng}",
        "key": GOOGLE_MAPS_API_KEY
    }

    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{base_url}?{query_string}"


@router.get("/images", response_model=PropertyImagesResponse)
async def get_property_images(
    address: str = Query(..., min_length=5, max_length=500, description="Property address"),
    include_satellite: bool = Query(True, description="Include satellite/aerial view"),
    token_payload: dict = Depends(verify_token)
):
    """
    Get images for a property address

    Returns Street View images and optionally satellite imagery.
    Images are cached for 24 hours to minimize API costs.

    Args:
        address: Full property address
        include_satellite: Whether to include satellite/aerial view
        token_payload: User authentication (from JWT)

    Returns:
        PropertyImagesResponse with image URLs
    """
    user_id = token_payload.get("sub")
    logger.info(f"Fetching images for address: {address} (user: {user_id})")

    # Check cache first
    cache_key = get_cache_key(address)
    cached_data = get_cached_images(cache_key)

    if cached_data:
        logger.info(f"Returning cached images for: {address}")
        return PropertyImagesResponse(
            success=True,
            address=address,
            images=cached_data["images"],
            coordinates=cached_data.get("coordinates"),
            cached=True
        )

    # Geocode the address
    geocode_result = await geocode_address(address)

    if not geocode_result:
        # Return placeholder images if geocoding fails
        logger.warning(f"Could not geocode address: {address}")
        return PropertyImagesResponse(
            success=True,
            address=address,
            images=[
                PropertyImage(
                    url="https://via.placeholder.com/640x480/1a1a2e/8b5cf6?text=Street+View+Unavailable",
                    type="placeholder",
                    width=640,
                    height=480,
                    source="placeholder"
                )
            ],
            cached=False,
            error="Could not locate address. Using placeholder image."
        )

    lat, lng = geocode_result.lat, geocode_result.lng
    images: List[PropertyImage] = []

    # Generate Street View images from multiple angles
    headings = [0, 90, 180, 270]  # Front, right, back, left views

    for i, heading in enumerate(headings):
        images.append(PropertyImage(
            url=generate_street_view_url(lat, lng, heading=heading),
            type="street_view",
            width=640,
            height=480,
            heading=heading,
            source="google_street_view"
        ))

    # Add satellite view if requested
    if include_satellite:
        images.append(PropertyImage(
            url=generate_static_map_url(lat, lng, map_type="satellite"),
            type="satellite",
            width=640,
            height=480,
            source="google_maps"
        ))

        # Add hybrid view (satellite with labels)
        images.append(PropertyImage(
            url=generate_static_map_url(lat, lng, map_type="hybrid"),
            type="hybrid",
            width=640,
            height=480,
            source="google_maps"
        ))

    # Prepare coordinates for response
    coordinates = {
        "lat": lat,
        "lng": lng,
        "formatted_address": geocode_result.formatted_address,
        "place_id": geocode_result.place_id
    }

    # Cache the results
    cache_data = {
        "images": [img.model_dump() for img in images],
        "coordinates": coordinates
    }
    set_cached_images(cache_key, cache_data)

    logger.info(f"Generated {len(images)} images for: {address}")

    return PropertyImagesResponse(
        success=True,
        address=geocode_result.formatted_address,
        images=images,
        coordinates=coordinates,
        cached=False
    )


@router.get("/streetview", response_model=PropertyImagesResponse)
async def get_street_view(
    address: str = Query(..., min_length=5, max_length=500, description="Property address"),
    heading: int = Query(0, ge=0, le=360, description="Camera heading (0-360 degrees)"),
    width: int = Query(640, ge=100, le=1280, description="Image width"),
    height: int = Query(480, ge=100, le=1280, description="Image height"),
    token_payload: dict = Depends(verify_token)
):
    """
    Get a single Street View image for a property

    Allows custom heading, width, and height parameters.

    Args:
        address: Full property address
        heading: Camera heading in degrees (0=North, 90=East, etc.)
        width: Image width in pixels (100-1280)
        height: Image height in pixels (100-1280)
        token_payload: User authentication (from JWT)

    Returns:
        PropertyImagesResponse with single Street View image
    """
    # Geocode the address
    geocode_result = await geocode_address(address)

    if not geocode_result:
        return PropertyImagesResponse(
            success=False,
            address=address,
            images=[],
            error="Could not locate address"
        )

    lat, lng = geocode_result.lat, geocode_result.lng

    image = PropertyImage(
        url=generate_street_view_url(lat, lng, width, height, heading),
        type="street_view",
        width=width,
        height=height,
        heading=heading,
        source="google_street_view"
    )

    return PropertyImagesResponse(
        success=True,
        address=geocode_result.formatted_address,
        images=[image],
        coordinates={
            "lat": lat,
            "lng": lng,
            "formatted_address": geocode_result.formatted_address
        },
        cached=False
    )


@router.get("/health")
async def health_check():
    """Health check endpoint for Property Images API"""
    has_google_key = bool(GOOGLE_MAPS_API_KEY)

    return {
        "status": "healthy" if has_google_key else "degraded",
        "google_maps_configured": has_google_key,
        "cache_entries": len(_image_cache),
        "features": {
            "street_view": has_google_key,
            "satellite": has_google_key,
            "geocoding": has_google_key
        }
    }
