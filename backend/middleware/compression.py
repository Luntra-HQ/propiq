"""
Response compression middleware for FastAPI

Implements gzip compression for API responses to reduce bandwidth
and improve response times for large payloads.
"""

from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import logging

logger = logging.getLogger(__name__)


def add_compression(
    app: FastAPI,
    minimum_size: int = 1000,  # Compress responses larger than 1 KB
    compression_level: int = 6  # Balance between speed and compression (1-9)
) -> None:
    """
    Add gzip compression middleware to FastAPI application

    Args:
        app: FastAPI application instance
        minimum_size: Minimum response size in bytes to trigger compression (default: 1000)
        compression_level: Gzip compression level 1-9 (default: 6)
                          1 = fastest, least compression
                          9 = slowest, best compression
                          6 = good balance

    Usage:
        from middleware.compression import add_compression
        add_compression(app, minimum_size=1000, compression_level=6)

    Benefits:
        - Reduces bandwidth usage by 60-80% for text responses
        - Faster transfer times for large JSON payloads
        - Better mobile performance
        - Lower hosting costs (bandwidth savings)

    Notes:
        - Only compresses responses with Accept-Encoding: gzip
        - Skips compression for small responses (overhead not worth it)
        - Automatically adds Content-Encoding: gzip header
        - Modern browsers support gzip by default
    """

    app.add_middleware(
        GZipMiddleware,
        minimum_size=minimum_size,
        compresslevel=compression_level
    )

    logger.info(
        f"Response compression enabled: min_size={minimum_size}B, level={compression_level}"
    )


class CompressionStatsMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log compression statistics for monitoring

    This is optional and can be used to track compression effectiveness
    """

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Check if response was compressed
        if "content-encoding" in response.headers:
            encoding = response.headers["content-encoding"]
            if encoding == "gzip":
                # Response was compressed
                # You can log stats here if needed
                pass

        return response


def add_compression_with_stats(
    app: FastAPI,
    minimum_size: int = 1000,
    compression_level: int = 6,
    enable_stats: bool = False
) -> None:
    """
    Add compression with optional statistics logging

    Args:
        app: FastAPI application instance
        minimum_size: Minimum response size to compress
        compression_level: Compression level (1-9)
        enable_stats: Whether to enable compression statistics logging

    Usage:
        add_compression_with_stats(
            app,
            minimum_size=1000,
            compression_level=6,
            enable_stats=True  # Enable for monitoring
        )
    """

    # Add compression middleware
    add_compression(app, minimum_size, compression_level)

    # Optionally add stats middleware
    if enable_stats:
        app.add_middleware(CompressionStatsMiddleware)
        logger.info("Compression statistics logging enabled")


# Compression configuration presets
COMPRESSION_PRESETS = {
    "fast": {
        "minimum_size": 500,
        "compression_level": 4,
        "description": "Fast compression, moderate bandwidth savings"
    },
    "balanced": {
        "minimum_size": 1000,
        "compression_level": 6,
        "description": "Balanced compression (recommended)"
    },
    "maximum": {
        "minimum_size": 500,
        "compression_level": 9,
        "description": "Maximum compression, slower but best bandwidth savings"
    },
    "minimal": {
        "minimum_size": 5000,
        "compression_level": 4,
        "description": "Minimal compression overhead, only for large responses"
    }
}


def add_compression_preset(app: FastAPI, preset: str = "balanced") -> None:
    """
    Add compression using a preset configuration

    Args:
        app: FastAPI application instance
        preset: Preset name ("fast", "balanced", "maximum", "minimal")

    Usage:
        add_compression_preset(app, "balanced")  # Recommended

    Presets:
        - fast: Quick compression, moderate savings (level 4, min 500B)
        - balanced: Good balance (level 6, min 1KB) - RECOMMENDED
        - maximum: Best compression (level 9, min 500B) - slower
        - minimal: Light compression (level 4, min 5KB) - for large responses only
    """

    if preset not in COMPRESSION_PRESETS:
        logger.warning(
            f"Unknown compression preset '{preset}', using 'balanced'"
        )
        preset = "balanced"

    config = COMPRESSION_PRESETS[preset]

    add_compression(
        app,
        minimum_size=config["minimum_size"],
        compression_level=config["compression_level"]
    )

    logger.info(f"Compression preset '{preset}' applied: {config['description']}")


# Expected compression ratios for different content types
COMPRESSION_RATIOS = {
    "application/json": "60-80%",  # JSON compresses very well
    "text/html": "70-85%",  # HTML compresses very well
    "text/plain": "60-70%",  # Text compresses well
    "application/xml": "65-75%",  # XML compresses well
    "image/jpeg": "0-5%",  # Already compressed
    "image/png": "0-10%",  # Already compressed
    "video/mp4": "0%",  # Already compressed
}


def get_expected_compression(content_type: str) -> str:
    """
    Get expected compression ratio for a content type

    Args:
        content_type: MIME type (e.g., "application/json")

    Returns:
        Expected compression ratio as string (e.g., "60-80%")
    """

    for mime_type, ratio in COMPRESSION_RATIOS.items():
        if mime_type in content_type:
            return ratio

    return "Unknown"
