"""
Environment Variable Validator for PropIQ Backend

Validates all required environment variables at application startup
to prevent silent failures and provide helpful error messages.
"""

import os
import sys
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class EnvVarRule:
    """Rule for validating an environment variable"""
    name: str
    required: bool = True
    min_length: Optional[int] = None
    description: str = ""
    validation_func: Optional[callable] = None


class EnvironmentValidator:
    """Validates environment variables at application startup"""

    def __init__(self, environment: str = None):
        """
        Initialize validator

        Args:
            environment: Current environment (development/production)
        """
        self.environment = environment or os.getenv("ENVIRONMENT", "development")
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def validate_all(self) -> bool:
        """
        Validate all required environment variables

        Returns:
            True if all validations pass, False otherwise
        """
        rules = self._get_validation_rules()

        for rule in rules:
            self._validate_var(rule)

        return len(self.errors) == 0

    def _get_validation_rules(self) -> List[EnvVarRule]:
        """Get validation rules based on environment"""

        # Core rules (always required)
        core_rules = [
            EnvVarRule(
                name="JWT_SECRET",
                required=True,
                min_length=32,
                description="Secret key for JWT token signing (must be 32+ chars)",
                validation_func=self._validate_jwt_secret
            ),
            EnvVarRule(
                name="SUPABASE_URL",
                required=True,
                description="Supabase project URL"
            ),
            EnvVarRule(
                name="SUPABASE_SERVICE_KEY",
                required=True,
                description="Supabase service key for backend operations"
            ),
        ]

        # Azure OpenAI rules (required for PropIQ analysis)
        azure_rules = [
            EnvVarRule(
                name="AZURE_OPENAI_ENDPOINT",
                required=True,
                description="Azure OpenAI service endpoint URL"
            ),
            EnvVarRule(
                name="AZURE_OPENAI_KEY",
                required=True,
                min_length=20,
                description="Azure OpenAI API key"
            ),
            EnvVarRule(
                name="AZURE_OPENAI_API_VERSION",
                required=False,
                description="Azure OpenAI API version (defaults to 2024-02-15-preview)"
            ),
        ]

        # Stripe rules (required in production)
        stripe_required = self.environment == "production"
        stripe_rules = [
            EnvVarRule(
                name="STRIPE_SECRET_KEY",
                required=stripe_required,
                description="Stripe secret key for payment processing"
            ),
            EnvVarRule(
                name="STRIPE_WEBHOOK_SECRET",
                required=stripe_required,
                description="Stripe webhook signature secret"
            ),
        ]

        # Optional/development rules
        optional_rules = [
            EnvVarRule(
                name="SENDGRID_API_KEY",
                required=False,
                description="SendGrid API key for email sending"
            ),
            EnvVarRule(
                name="WANDB_API_KEY",
                required=False,
                description="Weights & Biases API key for AI tracking"
            ),
            EnvVarRule(
                name="SENTRY_DSN",
                required=False,
                description="Sentry DSN for error tracking"
            ),
        ]

        return core_rules + azure_rules + stripe_rules + optional_rules

    def _validate_var(self, rule: EnvVarRule):
        """Validate a single environment variable"""
        value = os.getenv(rule.name)

        # Check if required
        if rule.required and not value:
            self.errors.append(
                f"❌ {rule.name} is REQUIRED but not set\n"
                f"   Description: {rule.description}\n"
                f"   Set in .env or environment"
            )
            return

        # If not required and not set, skip
        if not value:
            if self.environment == "production":
                self.warnings.append(
                    f"⚠️  {rule.name} is not set (optional)\n"
                    f"   Description: {rule.description}"
                )
            return

        # Check minimum length
        if rule.min_length and len(value) < rule.min_length:
            self.errors.append(
                f"❌ {rule.name} is too short (minimum {rule.min_length} characters)\n"
                f"   Current length: {len(value)}\n"
                f"   Description: {rule.description}"
            )
            return

        # Run custom validation function
        if rule.validation_func:
            error = rule.validation_func(rule.name, value)
            if error:
                self.errors.append(error)
                return

    def _validate_jwt_secret(self, name: str, value: str) -> Optional[str]:
        """Validate JWT secret is secure"""
        insecure_defaults = [
            "your-secret-key",
            "change-me",
            "secret",
            "jwt-secret",
            "your-secret-key-change-in-production"
        ]

        if any(default in value.lower() for default in insecure_defaults):
            return (
                f"❌ {name} appears to be an insecure default value\n"
                f"   Use a strong, random secret (e.g., generated with `openssl rand -hex 32`)\n"
                f"   NEVER use default values in production"
            )

        if len(value) < 32:
            return (
                f"❌ {name} must be at least 32 characters\n"
                f"   Current length: {len(value)}\n"
                f"   Generate a secure secret: openssl rand -hex 32"
            )

        return None

    def print_results(self):
        """Print validation results"""
        if self.errors:
            print("\n" + "=" * 70)
            print("🔴 ENVIRONMENT VARIABLE VALIDATION FAILED")
            print("=" * 70)
            print("\nThe following environment variables are missing or invalid:\n")
            for error in self.errors:
                print(error)
                print()

            print("=" * 70)
            print("Fix these issues in your .env file or environment configuration")
            print("=" * 70 + "\n")

        if self.warnings:
            print("\n" + "=" * 70)
            print("⚠️  ENVIRONMENT VARIABLE WARNINGS")
            print("=" * 70)
            for warning in self.warnings:
                print(warning)
                print()

        if not self.errors and not self.warnings:
            print("✅ Environment variable validation passed")


def validate_environment(environment: str = None, exit_on_error: bool = True) -> bool:
    """
    Validate environment variables at application startup

    Args:
        environment: Current environment (development/production)
        exit_on_error: If True, exit process on validation failure

    Returns:
        True if validation passes, False otherwise
    """
    validator = EnvironmentValidator(environment)
    is_valid = validator.validate_all()
    validator.print_results()

    if not is_valid and exit_on_error:
        print("\n❌ Application startup ABORTED due to environment validation errors")
        print("Fix the issues above and restart the application\n")
        sys.exit(1)

    return is_valid


if __name__ == "__main__":
    # Test the validator
    validate_environment(exit_on_error=False)
