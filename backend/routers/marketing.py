"""
PropIQ Marketing API - Email Subscription Management
Handles email capture from landing page and SendGrid integration
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api/v1/marketing", tags=["marketing"])
logger = logging.getLogger(__name__)

# SendGrid configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@luntra.one")

class EmailSubscribeRequest(BaseModel):
    email: EmailStr
    source: str = "landing"  # Track where the email came from

class EmailSubscribeResponse(BaseModel):
    success: bool
    message: str
    email: str

@router.post("/subscribe", response_model=EmailSubscribeResponse)
async def subscribe_email(request: EmailSubscribeRequest):
    """
    Subscribe an email address to PropIQ marketing list via SendGrid.

    This endpoint:
    1. Validates the email address
    2. Adds the contact to SendGrid Marketing Contacts
    3. Optionally sends a welcome email

    Args:
        request: EmailSubscribeRequest with email and source

    Returns:
        EmailSubscribeResponse with success status and message
    """

    if not SENDGRID_API_KEY:
        logger.error("SENDGRID_API_KEY not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )

    try:
        # Initialize SendGrid client
        sg = SendGridAPIClient(SENDGRID_API_KEY)

        # Add contact to SendGrid Marketing Contacts
        # https://docs.sendgrid.com/api-reference/contacts/add-or-update-a-contact
        data = {
            "contacts": [
                {
                    "email": request.email,
                    "custom_fields": {
                        "source": request.source,  # Track signup source
                        "product": "propiq"
                    }
                }
            ]
        }

        # Add contact to SendGrid
        response = sg.client.marketing.contacts.put(
            request_body=data
        )

        logger.info(f"✅ Added {request.email} to SendGrid (source: {request.source})")
        logger.info(f"SendGrid response: {response.status_code}")

        # Optional: Send welcome email
        if response.status_code in [200, 202]:
            try:
                await send_welcome_email(request.email)
            except Exception as e:
                # Don't fail the subscription if welcome email fails
                logger.warning(f"Welcome email failed for {request.email}: {e}")

        return EmailSubscribeResponse(
            success=True,
            message="Successfully subscribed! Check your inbox for exclusive insights.",
            email=request.email
        )

    except Exception as e:
        logger.error(f"❌ SendGrid error for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to subscribe email: {str(e)}"
        )

async def send_welcome_email(email: str):
    """
    Send a welcome email to new subscriber.
    This is optional and can be customized based on your needs.
    """

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)

        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=email,
            subject="Welcome to PropIQ - Your AI-Powered Property Analysis Tool",
            html_content=f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">Welcome to PropIQ!</h1>

                <p>Hi there,</p>

                <p>Thanks for joining 1,000+ real estate investors who use PropIQ to find profitable deals faster.</p>

                <h2 style="color: #4F46E5;">What's Next?</h2>
                <ul>
                    <li><strong>Get Started:</strong> <a href="https://propiq.luntra.one/signup">Create your free account</a> and get 5 free property analyses</li>
                    <li><strong>Learn More:</strong> Check out our <a href="https://propiq.luntra.one/pricing">pricing plans</a> for unlimited access</li>
                    <li><strong>Stay Updated:</strong> You'll receive exclusive market insights and PropIQ Pro features announcements</li>
                </ul>

                <p>Ready to analyze your first property? <a href="https://propiq.luntra.one/signup" style="color: #4F46E5; font-weight: bold;">Start your free trial →</a></p>

                <p>Best regards,<br/>
                The PropIQ Team at LUNTRA</p>

                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                <p style="color: #6B7280; font-size: 12px;">
                    You're receiving this email because you signed up for early access to PropIQ Pro at propiq.luntra.one.
                    <br/>
                    <a href="#" style="color: #6B7280;">Unsubscribe</a>
                </p>
            </body>
            </html>
            """
        )

        response = sg.send(message)
        logger.info(f"✅ Welcome email sent to {email} (status: {response.status_code})")

    except Exception as e:
        logger.error(f"❌ Welcome email error for {email}: {str(e)}")
        raise

@router.get("/health")
async def health_check():
    """
    Health check endpoint for marketing API.
    """
    has_api_key = bool(SENDGRID_API_KEY)

    return {
        "status": "healthy" if has_api_key else "degraded",
        "sendgrid_configured": has_api_key,
        "from_email": FROM_EMAIL if has_api_key else "not_configured"
    }
