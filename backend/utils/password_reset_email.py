"""
PropIQ Password Reset Email Template
Secure, branded email for password reset functionality

Features:
- Consistent styling with onboarding emails
- Clear CTA button with reset link
- Security notice for unrecognized requests
- Expiration warning (1 hour)
- Mobile-responsive design
"""

from typing import Dict, Any
import os

# Email configuration
FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "team@propiq.ai")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@propiq.ai")
APP_URL = os.getenv("APP_URL", "https://propiq.luntra.one")


def get_password_reset_email(
    user_name: str = "there",
    user_email: str = "",
    reset_token: str = "",
    expiration_minutes: int = 60
) -> Dict[str, Any]:
    """
    Generate password reset email content

    Args:
        user_name: User's first name for personalization
        user_email: User's email address
        reset_token: The password reset token
        expiration_minutes: Token expiration time in minutes

    Returns:
        Dictionary with subject and html_content
    """
    reset_url = f"{APP_URL}/reset-password?token={reset_token}"

    return {
        "subject": "Reset your PropIQ password",
        "html_content": f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }}
        .container {{
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        .logo {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .logo-box {{
            display: inline-block;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            border-radius: 10px;
            line-height: 48px;
            font-size: 24px;
            font-weight: bold;
            color: white;
        }}
        .logo-text {{
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-left: 8px;
            vertical-align: middle;
        }}
        h1 {{
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }}
        .intro {{
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
        }}
        .cta-button {{
            display: block;
            width: 100%;
            max-width: 280px;
            margin: 30px auto;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(139, 92, 246, 0.25);
        }}
        .cta-button:hover {{
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        }}
        .expiration-notice {{
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
        }}
        .expiration-notice strong {{
            color: #92400e;
        }}
        .expiration-notice p {{
            color: #78350f;
            margin: 0;
            font-size: 14px;
        }}
        .security-notice {{
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
        }}
        .security-notice h3 {{
            color: #374151;
            font-size: 14px;
            margin: 0 0 8px 0;
            font-weight: 600;
        }}
        .security-notice p {{
            color: #6b7280;
            margin: 0;
            font-size: 14px;
        }}
        .link-fallback {{
            background: #f9fafb;
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
        }}
        .link-fallback p {{
            font-size: 13px;
            color: #6b7280;
            margin: 0 0 8px 0;
        }}
        .link-fallback a {{
            color: #7c3aed;
            font-size: 12px;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
            text-align: center;
        }}
        .footer a {{
            color: #7c3aed;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <span class="logo-box">P</span>
            <span class="logo-text">PropIQ</span>
        </div>

        <h1>Reset Your Password</h1>

        <p class="intro">
            Hi {user_name},
        </p>

        <p class="intro">
            We received a request to reset the password for your PropIQ account.
            Click the button below to create a new password.
        </p>

        <a href="{reset_url}" class="cta-button">Reset Password</a>

        <div class="expiration-notice">
            <strong>This link expires in {expiration_minutes} minutes</strong>
            <p>For security reasons, this password reset link will expire in {expiration_minutes} minutes.
            After that, you'll need to request a new one.</p>
        </div>

        <div class="security-notice">
            <h3>Didn't request this?</h3>
            <p>If you didn't request a password reset, you can safely ignore this email.
            Your password will remain unchanged and no one else can access your account.</p>
        </div>

        <div class="link-fallback">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <a href="{reset_url}">{reset_url}</a>
        </div>

        <div class="footer">
            <p>This is an automated message from PropIQ.</p>
            <p>
                Need help? Contact us at <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a>
            </p>
            <p style="margin-top: 16px;">
                <a href="{APP_URL}/privacy">Privacy Policy</a> |
                <a href="{APP_URL}/terms">Terms of Service</a>
            </p>
            <p style="margin-top: 16px; color: #9ca3af;">
                &copy; 2025 PropIQ by LUNTRA. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
""",
        "plain_text": f"""
Hi {user_name},

We received a request to reset the password for your PropIQ account.

Reset your password by visiting:
{reset_url}

This link expires in {expiration_minutes} minutes.

If you didn't request this, you can safely ignore this email. Your password will remain unchanged.

Need help? Contact us at {SUPPORT_EMAIL}

---
PropIQ by LUNTRA
{APP_URL}
"""
    }
