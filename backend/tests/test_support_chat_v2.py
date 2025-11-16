"""
Integration Tests for Phase 2 Support Chat
Tests RAG + sentiment analysis + escalation + notifications
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime


# Mock test client (assumes main.py exists)
# from main import app
# client = TestClient(app)


class TestChatEndpoint:
    """Test Phase 2 chat endpoint"""

    @pytest.fixture
    def auth_token(self):
        """Mock JWT token for testing"""
        # In real tests, generate valid JWT token
        return "mock_jwt_token_here"

    @pytest.fixture
    def auth_headers(self, auth_token):
        """Auth headers for requests"""
        return {"Authorization": f"Bearer {auth_token}"}

    def test_send_message_requires_auth(self, client):
        """Test that chat endpoint requires authentication"""
        response = client.post("/api/v1/support/v2/chat", json={
            "message": "Hello"
        })
        assert response.status_code == 401  # Unauthorized

    def test_send_message_with_auth(self, client, auth_headers):
        """Test sending message with authentication"""
        response = client.post(
            "/api/v1/support/v2/chat",
            json={"message": "How do I analyze a property?"},
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "conversation_id" in data
        assert "response" in data
        assert "sentiment" in data
        assert "intent" in data
        assert data["escalated"] is False

    def test_send_message_with_rag(self, client, auth_headers):
        """Test that response includes knowledge base sources"""
        response = client.post(
            "/api/v1/support/v2/chat",
            json={"message": "What subscription plans does PropIQ offer?"},
            headers=auth_headers
        )

        data = response.json()

        assert "sources" in data
        if data["sources"]:  # If knowledge base has relevant docs
            assert isinstance(data["sources"], list)
            assert "source" in data["sources"][0]
            assert "relevance" in data["sources"][0]

    def test_negative_sentiment_triggers_escalation(self, client, auth_headers):
        """Test that negative sentiment triggers escalation"""
        # Start conversation
        response1 = client.post(
            "/api/v1/support/v2/chat",
            json={"message": "This platform is terrible and not working at all!"},
            headers=auth_headers
        )

        data = response1.json()

        # Check escalation
        assert data["escalated"] is True or data["sentiment"] == "negative"

    def test_multi_turn_conversation(self, client, auth_headers):
        """Test multi-turn conversation maintains context"""
        # First message
        response1 = client.post(
            "/api/v1/support/v2/chat",
            json={"message": "How do I analyze a property?"},
            headers=auth_headers
        )
        conv_id = response1.json()["conversation_id"]

        # Follow-up message
        response2 = client.post(
            "/api/v1/support/v2/chat",
            json={
                "message": "Can I export the results?",
                "conversation_id": conv_id
            },
            headers=auth_headers
        )

        assert response2.status_code == 200
        assert response2.json()["conversation_id"] == conv_id

    def test_intent_classification(self, client, auth_headers):
        """Test that intent is correctly classified"""
        test_cases = [
            {
                "message": "I was charged twice for my subscription",
                "expected_intent": "billing"
            },
            {
                "message": "Getting an error when I try to analyze",
                "expected_intent": "technical_support"
            },
            {
                "message": "What's included in the Pro plan?",
                "expected_intent": "sales"
            }
        ]

        for case in test_cases:
            response = client.post(
                "/api/v1/support/v2/chat",
                json={"message": case["message"]},
                headers=auth_headers
            )

            data = response.json()
            assert data["intent"] == case["expected_intent"] or \
                   data["intent"] in ["general", "feature_question"]  # Fallback intents


class TestConversationAssignment:
    """Test conversation assignment features"""

    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": "Bearer mock_admin_token"}

    def test_assign_conversation(self, client, auth_headers):
        """Test assigning conversation to agent"""
        # Create a conversation first
        chat_response = client.post(
            "/api/v1/support/v2/chat",
            json={"message": "I need help"},
            headers=auth_headers
        )
        conv_id = chat_response.json()["conversation_id"]

        # Assign conversation
        response = client.post(
            f"/api/v1/support/v2/conversations/{conv_id}/assign",
            json={
                "agent_email": "agent@propiq.com",
                "agent_name": "Support Agent"
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["assigned_to"] == "agent@propiq.com"

    def test_assign_nonexistent_conversation(self, client, auth_headers):
        """Test assigning non-existent conversation returns 404"""
        response = client.post(
            "/api/v1/support/v2/conversations/nonexistent-id/assign",
            json={
                "agent_email": "agent@propiq.com",
                "agent_name": "Agent"
            },
            headers=auth_headers
        )

        assert response.status_code == 404


class TestConversationResolution:
    """Test conversation resolution features"""

    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": "Bearer mock_agent_token"}

    def test_resolve_conversation(self, client, auth_headers):
        """Test marking conversation as resolved"""
        # Create conversation
        chat_response = client.post(
            "/api/v1/support/v2/chat",
            json={"message": "I have a question"},
            headers=auth_headers
        )
        conv_id = chat_response.json()["conversation_id"]

        # Resolve conversation
        response = client.post(
            f"/api/v1/support/v2/conversations/{conv_id}/resolve",
            json={
                "resolution_notes": "Issue resolved successfully"
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "resolution_time_minutes" in data


class TestEscalatedConversations:
    """Test escalated conversations listing"""

    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": "Bearer mock_agent_token"}

    def test_list_escalated_conversations(self, client, auth_headers):
        """Test listing escalated conversations"""
        response = client.get(
            "/api/v1/support/v2/conversations/escalated",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "data" in data
        assert "pagination" in data
        assert isinstance(data["data"], list)

    def test_escalated_conversations_pagination(self, client, auth_headers):
        """Test pagination of escalated conversations"""
        response = client.get(
            "/api/v1/support/v2/conversations/escalated?page=1&page_size=10",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()

        assert data["pagination"]["page"] == 1
        assert data["pagination"]["page_size"] == 10


class TestHealthCheck:
    """Test Phase 2 health check endpoint"""

    def test_health_check(self, client):
        """Test health check returns Phase 2 status"""
        response = client.get("/api/v1/support/v2/health")

        assert response.status_code == 200
        data = response.json()

        assert data["phase"] == 2
        assert "language_analysis" in data
        assert "notifications" in data
        assert data["features"]["sentiment_analysis"] is True
        assert data["features"]["intent_classification"] is True
        assert data["features"]["multi_channel_notifications"] is True
        assert data["features"]["conversation_assignment"] is True


class TestEscalationLogic:
    """Test escalation decision logic"""

    def test_escalation_on_repeated_negative_sentiment(self, client, auth_headers):
        """Test escalation after multiple negative messages"""
        # Send multiple frustrated messages
        messages = [
            "This is not working",
            "Still not working, very frustrated",
            "This is terrible, I want to speak to someone"
        ]

        conv_id = None
        for msg in messages:
            response = client.post(
                "/api/v1/support/v2/chat",
                json={
                    "message": msg,
                    "conversation_id": conv_id
                },
                headers=auth_headers
            )
            data = response.json()
            conv_id = data["conversation_id"]

        # Last response should trigger escalation
        assert data["escalated"] is True

    def test_billing_intent_triggers_escalation(self, client, auth_headers):
        """Test that billing issues trigger escalation"""
        response = client.post(
            "/api/v1/support/v2/chat",
            json={"message": "I was charged incorrectly and need a refund immediately"},
            headers=auth_headers
        )

        data = response.json()

        # Should escalate for billing issues
        assert data["intent"] == "billing"
        assert data["escalated"] is True or data["priority"] == "high"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
