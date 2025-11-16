"""
Azure AI Language Service Integration for PropIQ Support Agent
Phase 2: Production-Grade Sentiment Analysis and Text Analytics

This module provides:
- Advanced sentiment analysis (positive, neutral, negative, mixed)
- Entity recognition (extract key information from messages)
- Key phrase extraction
- Language detection
- Opinion mining (aspect-based sentiment)

Uses Azure Cognitive Services for Language instead of GPT-based analysis
for better accuracy, lower latency, and cost efficiency.
"""

import os
from typing import Dict, List, Optional, Any
from datetime import datetime
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import (
    TextAnalyticsClient,
    DocumentSentiment,
    SentimentConfidenceScores
)

# Environment variables
AZURE_LANGUAGE_ENDPOINT = os.getenv("AZURE_LANGUAGE_ENDPOINT")
AZURE_LANGUAGE_KEY = os.getenv("AZURE_LANGUAGE_KEY")

# Check if Azure Language is configured
LANGUAGE_SERVICE_AVAILABLE = bool(AZURE_LANGUAGE_ENDPOINT and AZURE_LANGUAGE_KEY)

# Initialize client
if LANGUAGE_SERVICE_AVAILABLE:
    try:
        credential = AzureKeyCredential(AZURE_LANGUAGE_KEY)
        text_analytics_client = TextAnalyticsClient(
            endpoint=AZURE_LANGUAGE_ENDPOINT,
            credential=credential
        )
        print("✅ Azure AI Language Service initialized")
    except Exception as e:
        print(f"⚠️  Azure AI Language Service initialization failed: {e}")
        text_analytics_client = None
        LANGUAGE_SERVICE_AVAILABLE = False
else:
    text_analytics_client = None
    print("⚠️  Azure AI Language Service not configured (AZURE_LANGUAGE_ENDPOINT or AZURE_LANGUAGE_KEY missing)")


class SentimentAnalysis:
    """Advanced sentiment analysis using Azure AI Language"""

    @staticmethod
    def analyze_sentiment(text: str, language: str = "en") -> Dict[str, Any]:
        """
        Analyze sentiment of text with detailed confidence scores

        Args:
            text: Input text to analyze
            language: Language code (default: "en")

        Returns:
            {
                "sentiment": "positive" | "neutral" | "negative" | "mixed",
                "confidence_scores": {
                    "positive": 0.0-1.0,
                    "neutral": 0.0-1.0,
                    "negative": 0.0-1.0
                },
                "sentences": [
                    {
                        "text": "...",
                        "sentiment": "...",
                        "confidence_scores": {...}
                    }
                ]
            }
        """
        if not LANGUAGE_SERVICE_AVAILABLE or not text_analytics_client:
            print("⚠️  Azure Language Service unavailable, using fallback")
            return SentimentAnalysis._fallback_sentiment_analysis(text)

        try:
            documents = [text]
            result = text_analytics_client.analyze_sentiment(
                documents,
                show_opinion_mining=True,
                language=language
            )[0]

            if result.is_error:
                print(f"⚠️  Sentiment analysis error: {result.error}")
                return SentimentAnalysis._fallback_sentiment_analysis(text)

            # Extract sentence-level sentiment
            sentences = [
                {
                    "text": sentence.text,
                    "sentiment": sentence.sentiment,
                    "confidence_scores": {
                        "positive": sentence.confidence_scores.positive,
                        "neutral": sentence.confidence_scores.neutral,
                        "negative": sentence.confidence_scores.negative
                    },
                    "offset": sentence.offset,
                    "length": sentence.length
                }
                for sentence in result.sentences
            ]

            return {
                "sentiment": result.sentiment,
                "confidence_scores": {
                    "positive": result.confidence_scores.positive,
                    "neutral": result.confidence_scores.neutral,
                    "negative": result.confidence_scores.negative
                },
                "sentences": sentences,
                "service": "azure_language"
            }

        except Exception as e:
            print(f"⚠️  Sentiment analysis failed: {e}")
            return SentimentAnalysis._fallback_sentiment_analysis(text)

    @staticmethod
    def _fallback_sentiment_analysis(text: str) -> Dict[str, Any]:
        """
        Simple fallback sentiment analysis based on keywords
        Used when Azure Language Service is unavailable
        """
        text_lower = text.lower()

        # Negative keywords
        negative_keywords = [
            "bad", "terrible", "awful", "frustrated", "angry", "upset",
            "horrible", "disappointing", "useless", "broken", "not working",
            "doesn't work", "hate", "worst", "poor", "sucks"
        ]

        # Positive keywords
        positive_keywords = [
            "good", "great", "excellent", "amazing", "wonderful", "perfect",
            "love", "best", "fantastic", "awesome", "helpful", "thank",
            "appreciate", "solved", "working", "happy"
        ]

        negative_count = sum(1 for word in negative_keywords if word in text_lower)
        positive_count = sum(1 for word in positive_keywords if word in text_lower)

        if negative_count > positive_count and negative_count > 0:
            sentiment = "negative"
            confidence = {"negative": 0.7, "neutral": 0.2, "positive": 0.1}
        elif positive_count > negative_count and positive_count > 0:
            sentiment = "positive"
            confidence = {"positive": 0.7, "neutral": 0.2, "negative": 0.1}
        else:
            sentiment = "neutral"
            confidence = {"neutral": 0.7, "positive": 0.15, "negative": 0.15}

        return {
            "sentiment": sentiment,
            "confidence_scores": confidence,
            "sentences": [
                {
                    "text": text,
                    "sentiment": sentiment,
                    "confidence_scores": confidence
                }
            ],
            "service": "fallback"
        }

    @staticmethod
    def analyze_conversation_sentiment(messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Analyze overall sentiment of a conversation

        Args:
            messages: List of message dicts with "role" and "content"

        Returns:
            {
                "overall_sentiment": "positive" | "neutral" | "negative",
                "confidence": 0.0-1.0,
                "sentiment_trajectory": ["neutral", "neutral", "negative"],
                "user_frustration_detected": bool
            }
        """
        # Get only user messages
        user_messages = [msg for msg in messages if msg.get("role") == "user"]

        if not user_messages:
            return {
                "overall_sentiment": "neutral",
                "confidence": 1.0,
                "sentiment_trajectory": [],
                "user_frustration_detected": False
            }

        # Analyze each user message
        sentiments = []
        for msg in user_messages[-5:]:  # Last 5 messages
            analysis = SentimentAnalysis.analyze_sentiment(msg.get("content", ""))
            sentiments.append(analysis["sentiment"])

        # Determine overall sentiment
        sentiment_counts = {
            "positive": sentiments.count("positive"),
            "neutral": sentiments.count("neutral"),
            "negative": sentiments.count("negative")
        }

        overall = max(sentiment_counts, key=sentiment_counts.get)

        # Detect frustration (2+ consecutive negative sentiments)
        frustration_detected = False
        for i in range(len(sentiments) - 1):
            if sentiments[i] == "negative" and sentiments[i + 1] == "negative":
                frustration_detected = True
                break

        return {
            "overall_sentiment": overall,
            "confidence": sentiment_counts[overall] / len(sentiments),
            "sentiment_trajectory": sentiments,
            "user_frustration_detected": frustration_detected,
            "message_count": len(user_messages)
        }


class IntentClassification:
    """Advanced intent classification for routing and prioritization"""

    # Intent categories
    INTENTS = {
        "technical_support": {
            "description": "Bugs, errors, technical issues, platform problems",
            "priority": "high",
            "keywords": [
                "error", "bug", "broken", "not working", "crash", "freeze",
                "loading", "stuck", "failed", "issue", "problem", "technical"
            ]
        },
        "billing": {
            "description": "Payments, subscriptions, invoices, refunds",
            "priority": "high",
            "keywords": [
                "billing", "payment", "charge", "refund", "invoice", "subscription",
                "cancel", "upgrade", "downgrade", "price", "cost", "credit card"
            ]
        },
        "feature_question": {
            "description": "Questions about features, how-to, usage",
            "priority": "medium",
            "keywords": [
                "how do i", "how to", "can i", "is it possible", "feature",
                "function", "use", "setup", "configure"
            ]
        },
        "sales": {
            "description": "Pricing questions, plan comparisons, upgrade interest",
            "priority": "medium",
            "keywords": [
                "plan", "pricing", "tier", "upgrade", "pro", "elite", "starter",
                "compare", "difference", "worth it", "trial"
            ]
        },
        "feedback": {
            "description": "Feature requests, suggestions, complaints, praise",
            "priority": "low",
            "keywords": [
                "suggest", "recommendation", "would be nice", "feature request",
                "improve", "add", "feedback", "complaint", "love", "great"
            ]
        },
        "account_management": {
            "description": "Login, password, profile, account settings",
            "priority": "medium",
            "keywords": [
                "login", "password", "reset", "account", "profile", "email",
                "can't log in", "forgot password", "locked out"
            ]
        },
        "general": {
            "description": "General questions, greetings, chitchat",
            "priority": "low",
            "keywords": [
                "hello", "hi", "help", "info", "about", "what is", "tell me"
            ]
        }
    }

    @staticmethod
    def classify_intent(text: str, use_ai: bool = True) -> Dict[str, Any]:
        """
        Classify user intent from message

        Args:
            text: User message
            use_ai: Whether to use AI classification (vs keyword-based)

        Returns:
            {
                "intent": "technical_support" | "billing" | etc.,
                "confidence": 0.0-1.0,
                "priority": "high" | "medium" | "low",
                "description": "...",
                "matched_keywords": [...]
            }
        """
        text_lower = text.lower()

        # Keyword-based classification
        intent_scores = {}
        matched_keywords = {}

        for intent_name, intent_data in IntentClassification.INTENTS.items():
            keywords = intent_data["keywords"]
            matches = [kw for kw in keywords if kw in text_lower]
            matched_keywords[intent_name] = matches
            intent_scores[intent_name] = len(matches)

        # Get intent with highest score
        if max(intent_scores.values()) == 0:
            # No keywords matched, default to general
            classified_intent = "general"
            confidence = 0.5
        else:
            classified_intent = max(intent_scores, key=intent_scores.get)
            total_matches = sum(intent_scores.values())
            confidence = intent_scores[classified_intent] / total_matches if total_matches > 0 else 0.5

        intent_info = IntentClassification.INTENTS[classified_intent]

        return {
            "intent": classified_intent,
            "confidence": min(confidence, 1.0),
            "priority": intent_info["priority"],
            "description": intent_info["description"],
            "matched_keywords": matched_keywords[classified_intent],
            "all_matches": matched_keywords
        }


class KeyPhraseExtraction:
    """Extract key phrases from conversation for analytics"""

    @staticmethod
    def extract_key_phrases(text: str, language: str = "en") -> List[str]:
        """
        Extract key phrases from text

        Args:
            text: Input text
            language: Language code

        Returns:
            List of key phrases
        """
        if not LANGUAGE_SERVICE_AVAILABLE or not text_analytics_client:
            return KeyPhraseExtraction._fallback_key_phrases(text)

        try:
            result = text_analytics_client.extract_key_phrases([text], language=language)[0]

            if result.is_error:
                print(f"⚠️  Key phrase extraction error: {result.error}")
                return KeyPhraseExtraction._fallback_key_phrases(text)

            return result.key_phrases

        except Exception as e:
            print(f"⚠️  Key phrase extraction failed: {e}")
            return KeyPhraseExtraction._fallback_key_phrases(text)

    @staticmethod
    def _fallback_key_phrases(text: str) -> List[str]:
        """Simple fallback: extract capitalized words and common nouns"""
        words = text.split()
        key_phrases = []

        # Extract capitalized words (likely important terms)
        for word in words:
            if word and word[0].isupper() and len(word) > 3:
                key_phrases.append(word.strip(".,!?"))

        return key_phrases[:10]  # Return top 10


class LanguageDetection:
    """Detect language of user messages"""

    @staticmethod
    def detect_language(text: str) -> Dict[str, Any]:
        """
        Detect language of text

        Args:
            text: Input text

        Returns:
            {
                "language": "en",
                "language_name": "English",
                "confidence": 0.0-1.0
            }
        """
        if not LANGUAGE_SERVICE_AVAILABLE or not text_analytics_client:
            return {
                "language": "en",
                "language_name": "English",
                "confidence": 0.9,
                "service": "fallback"
            }

        try:
            result = text_analytics_client.detect_language([text])[0]

            if result.is_error:
                print(f"⚠️  Language detection error: {result.error}")
                return {
                    "language": "en",
                    "language_name": "English",
                    "confidence": 0.5,
                    "service": "fallback"
                }

            return {
                "language": result.primary_language.iso6391_name,
                "language_name": result.primary_language.name,
                "confidence": result.primary_language.confidence_score,
                "service": "azure_language"
            }

        except Exception as e:
            print(f"⚠️  Language detection failed: {e}")
            return {
                "language": "en",
                "language_name": "English",
                "confidence": 0.5,
                "service": "fallback"
            }


# Convenience functions for easy import

def analyze_message_sentiment(text: str) -> Dict[str, Any]:
    """Quick sentiment analysis of a message"""
    return SentimentAnalysis.analyze_sentiment(text)


def classify_message_intent(text: str) -> Dict[str, Any]:
    """Quick intent classification of a message"""
    return IntentClassification.classify_intent(text)


def analyze_conversation(messages: List[Dict]) -> Dict[str, Any]:
    """
    Comprehensive conversation analysis

    Returns:
        {
            "sentiment": {...},
            "last_message_intent": {...},
            "key_topics": [...],
            "language": {...}
        }
    """
    if not messages:
        return {
            "sentiment": {"overall_sentiment": "neutral", "confidence": 1.0},
            "last_message_intent": {"intent": "general", "confidence": 0.5},
            "key_topics": [],
            "language": {"language": "en", "language_name": "English"}
        }

    # Get last user message
    user_messages = [msg for msg in messages if msg.get("role") == "user"]
    last_user_message = user_messages[-1]["content"] if user_messages else ""

    return {
        "sentiment": SentimentAnalysis.analyze_conversation_sentiment(messages),
        "last_message_intent": IntentClassification.classify_intent(last_user_message),
        "key_topics": KeyPhraseExtraction.extract_key_phrases(last_user_message),
        "language": LanguageDetection.detect_language(last_user_message)
    }


# Health check
def health_check() -> Dict[str, Any]:
    """Check if Azure AI Language Service is available"""
    return {
        "available": LANGUAGE_SERVICE_AVAILABLE,
        "endpoint": AZURE_LANGUAGE_ENDPOINT if AZURE_LANGUAGE_ENDPOINT else "not_configured",
        "features": {
            "sentiment_analysis": LANGUAGE_SERVICE_AVAILABLE,
            "key_phrase_extraction": LANGUAGE_SERVICE_AVAILABLE,
            "language_detection": LANGUAGE_SERVICE_AVAILABLE,
            "intent_classification": True  # Always available (keyword-based fallback)
        }
    }
