"""
Structured logging configuration for PropIQ backend
Provides JSON-formatted logs for production and colorized logs for development
"""

import logging
import sys
import os
import json
from datetime import datetime
from typing import Dict, Any, Optional


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging
    Outputs logs in JSON format for easy parsing by log aggregation tools
    """

    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields from record
        if hasattr(record, "extra_fields"):
            log_data.update(record.extra_fields)

        # Add request context if available
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "endpoint"):
            log_data["endpoint"] = record.endpoint

        return json.dumps(log_data)


class ColoredFormatter(logging.Formatter):
    """
    Colorized formatter for development environment
    Makes logs easier to read in terminal
    """

    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }

    def format(self, record: logging.LogRecord) -> str:
        # Add color to level name
        level_color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        colored_level = f"{level_color}{record.levelname:8s}{self.COLORS['RESET']}"

        # Format timestamp
        timestamp = datetime.fromtimestamp(record.created).strftime('%H:%M:%S')

        # Build log message
        message = f"{timestamp} | {colored_level} | {record.name:20s} | {record.getMessage()}"

        # Add exception info if present
        if record.exc_info:
            message += "\n" + self.formatException(record.exc_info)

        return message


def setup_logging(
    log_level: Optional[str] = None,
    environment: Optional[str] = None,
    enable_file_logging: bool = False,
    log_file_path: str = "logs/propiq.log"
) -> logging.Logger:
    """
    Configure application-wide logging

    Args:
        log_level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
                  Defaults to DEBUG for development, INFO for production
        environment: Environment name (development, staging, production)
                    Defaults to ENVIRONMENT env var or 'development'
        enable_file_logging: Whether to log to file in addition to console
        log_file_path: Path to log file if file logging is enabled

    Returns:
        Root logger instance
    """
    # Get configuration from environment
    if environment is None:
        environment = os.getenv("ENVIRONMENT", "development")

    if log_level is None:
        log_level = os.getenv("LOG_LEVEL", "DEBUG" if environment == "development" else "INFO")

    # Convert string log level to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Clear any existing handlers
    root_logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)

    # Use JSON formatter for production, colored formatter for development
    if environment == "production":
        formatter = JSONFormatter()
    else:
        formatter = ColoredFormatter()

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # File handler (optional)
    if enable_file_logging:
        # Create logs directory if it doesn't exist
        log_dir = os.path.dirname(log_file_path)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)

        file_handler = logging.FileHandler(log_file_path)
        file_handler.setLevel(numeric_level)
        file_handler.setFormatter(JSONFormatter())  # Always use JSON for file logs
        root_logger.addHandler(file_handler)

    # Silence noisy third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("azure").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)

    # Log initialization
    root_logger.info(
        f"Logging configured: level={log_level}, environment={environment}, "
        f"file_logging={enable_file_logging}"
    )

    return root_logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module

    Args:
        name: Logger name (typically __name__ of the module)

    Returns:
        Logger instance

    Example:
        logger = get_logger(__name__)
        logger.info("User logged in", extra={"user_id": user_id})
    """
    return logging.getLogger(name)


class LoggerAdapter(logging.LoggerAdapter):
    """
    Custom logger adapter that adds context to all log messages
    Useful for adding request-specific context like request_id, user_id

    Example:
        logger = LoggerAdapter(base_logger, {"request_id": "abc123"})
        logger.info("Processing request")  # Will include request_id in log
    """

    def process(self, msg: str, kwargs: Dict[str, Any]) -> tuple:
        # Add context to extra fields
        extra = kwargs.get("extra", {})
        extra.update(self.extra)
        kwargs["extra"] = extra
        return msg, kwargs


# Initialize logging when module is imported
# This ensures logging is set up before any other imports
_initialized = False

if not _initialized:
    setup_logging()
    _initialized = True
