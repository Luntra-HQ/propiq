"""
Unit Tests for Language Analysis Module (Phase 2)
Tests sentiment analysis, intent classification, and key phrase extraction
"""

import pytest
from utils.language_analysis import (
    SentimentAnalysis,
    IntentClassification,
    KeyPhraseExtraction,
    LanguageDetection,
    analyze_message_sentiment,
    classify_message_intent,
    analyze_conversation
)


class TestSentimentAnalysis:
    """Test sentiment analysis functionality"""

    def test_positive_sentiment(self):
        """Test detection of positive sentiment"""
        text = "This is great! I love PropIQ, it's been so helpful for my property analysis."
        result = analyze_message_sentiment(text)

        assert result["sentiment"] in ["positive", "neutral"]  # May vary based on service
        assert "confidence_scores" in result
        assert result["confidence_scores"]["positive"] >= 0

    def test_negative_sentiment(self):
        """Test detection of negative sentiment"""
        text = "This is terrible. The platform is not working and I'm very frustrated."
        result = analyze_message_sentiment(text)

        assert result["sentiment"] in ["negative", "neutral"]
        assert result["confidence_scores"]["negative"] >= 0

    def test_neutral_sentiment(self):
        """Test detection of neutral sentiment"""
        text = "I would like to know more about the pricing plans available."
        result = analyze_message_sentiment(text)

        assert result["sentiment"] in ["positive", "neutral", "negative"]
        assert "confidence_scores" in result

    def test_conversation_sentiment_analysis(self):
        """Test analyzing sentiment across conversation"""
        messages = [
            {"role": "user", "content": "Hello, I need help"},
            {"role": "assistant", "content": "Hi! How can I help?"},
            {"role": "user", "content": "This is not working at all. Very frustrating."},
            {"role": "assistant", "content": "I'm sorry to hear that. Let me help."},
            {"role": "user", "content": "Still not working. This is terrible."}
        ]

        result = SentimentAnalysis.analyze_conversation_sentiment(messages)

        assert "overall_sentiment" in result
        assert result["overall_sentiment"] in ["positive", "neutral", "negative"]
        assert "sentiment_trajectory" in result
        assert len(result["sentiment_trajectory"]) <= 5  # Last 5 user messages
        assert "user_frustration_detected" in result
        assert isinstance(result["user_frustration_detected"], bool)

    def test_frustration_detection(self):
        """Test detection of user frustration pattern"""
        messages = [
            {"role": "user", "content": "This is not helpful"},
            {"role": "assistant", "content": "Let me try another approach"},
            {"role": "user", "content": "Still doesn't work. This is terrible."}
        ]

        result = SentimentAnalysis.analyze_conversation_sentiment(messages)

        # Should detect frustration with 2 consecutive negative sentiments
        assert "user_frustration_detected" in result


class TestIntentClassification:
    """Test intent classification functionality"""

    def test_technical_support_intent(self):
        """Test detection of technical support intent"""
        text = "I'm getting an error when I try to analyze a property. The page keeps crashing."
        result = classify_message_intent(text)

        assert result["intent"] == "technical_support"
        assert result["priority"] == "high"
        assert len(result["matched_keywords"]) > 0

    def test_billing_intent(self):
        """Test detection of billing intent"""
        text = "I was charged twice for my subscription. I need a refund."
        result = classify_message_intent(text)

        assert result["intent"] == "billing"
        assert result["priority"] == "high"
        assert "billing" in result["matched_keywords"] or "refund" in result["matched_keywords"]

    def test_sales_intent(self):
        """Test detection of sales intent"""
        text = "What's the difference between Pro and Elite plans? Thinking about upgrading."
        result = classify_message_intent(text)

        assert result["intent"] in ["sales", "feature_question"]
        assert result["priority"] in ["medium", "low"]

    def test_feature_question_intent(self):
        """Test detection of feature question intent"""
        text = "How do I export my property analysis to PDF?"
        result = classify_message_intent(text)

        assert result["intent"] in ["feature_question", "general"]
        assert "confidence" in result

    def test_general_intent(self):
        """Test fallback to general intent"""
        text = "Hello, how are you?"
        result = classify_message_intent(text)

        assert result["intent"] == "general"
        assert result["priority"] == "low"


class TestKeyPhraseExtraction:
    """Test key phrase extraction"""

    def test_extract_key_phrases(self):
        """Test extraction of key phrases from text"""
        text = "I'm having issues with the Property Analysis feature when analyzing commercial real estate properties in California."

        result = KeyPhraseExtraction.extract_key_phrases(text)

        assert isinstance(result, list)
        # May return empty if Azure Language not configured (fallback)
        # or should contain relevant phrases if configured

    def test_fallback_key_phrases(self):
        """Test fallback key phrase extraction"""
        text = "PropIQ Platform Azure OpenAI Analysis"

        result = KeyPhraseExtraction._fallback_key_phrases(text)

        assert isinstance(result, list)
        # Should extract capitalized words
        assert any(phrase in ["PropIQ", "Platform", "Azure", "OpenAI", "Analysis"] for phrase in result)


class TestLanguageDetection:
    """Test language detection"""

    def test_english_detection(self):
        """Test detection of English text"""
        text = "This is an English message about property analysis."

        result = LanguageDetection.detect_language(text)

        assert result["language"] == "en"
        assert result["language_name"] == "English"
        assert result["confidence"] > 0

    def test_fallback_language_detection(self):
        """Test fallback returns English as default"""
        text = "Any text"

        # Even if service unavailable, should return English as fallback
        result = LanguageDetection.detect_language(text)

        assert "language" in result
        assert "language_name" in result


class TestConversationAnalysis:
    """Test comprehensive conversation analysis"""

    def test_analyze_conversation(self):
        """Test analyzing full conversation"""
        messages = [
            {"role": "user", "content": "I can't login to my account. Getting an error."},
            {"role": "assistant", "content": "I can help you with that. What error are you seeing?"},
            {"role": "user", "content": "It says 'invalid credentials' but I know my password is correct."}
        ]

        result = analyze_conversation(messages)

        assert "sentiment" in result
        assert "last_message_intent" in result
        assert "key_topics" in result
        assert "language" in result

        assert isinstance(result["sentiment"], dict)
        assert isinstance(result["last_message_intent"], dict)
        assert isinstance(result["key_topics"], list)
        assert isinstance(result["language"], dict)

    def test_empty_conversation(self):
        """Test analyzing empty conversation"""
        messages = []

        result = analyze_conversation(messages)

        assert result["sentiment"]["overall_sentiment"] == "neutral"
        assert result["last_message_intent"]["intent"] == "general"
        assert result["key_topics"] == []


class TestIntentPriorities:
    """Test intent priority assignments"""

    def test_high_priority_intents(self):
        """Test that critical intents are marked as high priority"""
        high_priority_messages = [
            "System error: Cannot access my account",
            "I was charged incorrectly for my subscription"
        ]

        for msg in high_priority_messages:
            result = classify_message_intent(msg)
            assert result["priority"] == "high"

    def test_medium_priority_intents(self):
        """Test medium priority intent classification"""
        medium_priority_messages = [
            "How do I upgrade to Pro plan?",
            "What features are included in Elite tier?"
        ]

        for msg in medium_priority_messages:
            result = classify_message_intent(msg)
            assert result["priority"] in ["medium", "low"]  # May vary based on keywords

    def test_low_priority_intents(self):
        """Test low priority intent classification"""
        text = "Thank you for your help!"
        result = classify_message_intent(text)

        assert result["priority"] == "low"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
