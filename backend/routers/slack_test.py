"""
Slack Test Endpoint
Quick endpoint to test Slack integration
"""

from fastapi import APIRouter
from pydantic import BaseModel
from utils.slack import test_slack_integration, notify_new_user, notify_user_upgrade

router = APIRouter(prefix="/api", tags=["testing"])

class TestResponse(BaseModel):
    success: bool
    message: str

@router.post("/test-slack", response_model=TestResponse)
async def test_slack():
    """
    Test Slack integration by sending a test notification

    Returns:
        TestResponse with success status and message
    """
    result = test_slack_integration()

    return TestResponse(
        success=result["success"],
        message=result["message"]
    )

@router.post("/test-slack/signup")
async def test_slack_signup():
    """Test new user signup notification"""
    notify_new_user(
        email="test@propiq.com",
        name="Test User",
        tier="free",
        source="test_endpoint"
    )
    return {"status": "Signup notification sent to Slack"}

@router.post("/test-slack/payment")
async def test_slack_payment():
    """Test payment notification"""
    notify_user_upgrade(
        email="test@propiq.com",
        from_tier="free",
        to_tier="pro",
        amount=79.00
    )
    return {"status": "Payment notification sent to Slack"}
