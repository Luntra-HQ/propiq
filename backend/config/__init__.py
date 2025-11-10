"""
Configuration package for PropIQ backend
"""

from .env_validator import validate_environment, EnvironmentValidator

__all__ = ["validate_environment", "EnvironmentValidator"]
