"""
LLM client abstraction for PropIQ.

Supports Azure OpenAI (current) and AWS Bedrock (stub for migration).
Routers should migrate to: from utils.llm_client import create_chat_completion
See: AZURE_TO_AWS_MIGRATION_GUIDE.md
"""

import os
from typing import Any, List, Dict, Optional

# Lazy Azure client (initialized on first use)
_azure_client: Any = None


def get_provider() -> str:
    """LLM_PROVIDER=azure|bedrock. Default: azure."""
    return (os.getenv("LLM_PROVIDER") or "azure").lower()


def _get_azure_client():
    global _azure_client
    if _azure_client is None:
        from openai import AzureOpenAI

        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        key = os.getenv("AZURE_OPENAI_KEY")
        version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
        if not endpoint or not key:
            raise ValueError(
                "Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY. "
                "Or set LLM_PROVIDER=bedrock when Bedrock is implemented."
            )
        _azure_client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=key,
            api_version=version,
        )
    return _azure_client


def create_chat_completion(
    messages: List[Dict[str, str]],
    model: str = "gpt-4o-mini",
    **kwargs: Any,
) -> Any:
    """
    Create a chat completion. Return type matches OpenAI's (e.g. .choices[0].message.content, .usage.total_tokens).

    - azure: uses Azure OpenAI.
    - bedrock: raises NotImplementedError until BEDROCK_GATEWAY_URL (or Bedrock runtime) is wired.
    """
    provider = get_provider()

    if provider == "bedrock":
        try:
            import boto3
        except ImportError:
            raise ImportError("boto3 is required for Bedrock support. Install it with `pip install boto3`.")

        region = os.getenv("AWS_REGION", "us-east-1")
        # Default to Haiku (fast/cheap) if not set
        model_id = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
        
        # Initialize boto3 client
        # Credentials are picked up from env (AWS_ACCESS_KEY_ID/SECRET) or IAM role
        client = boto3.client("bedrock-runtime", region_name=region)

        # Convert OpenAI-style messages to Bedrock Converse API format
        # OpenAI: [{"role": "user", "content": "..."}]
        # Bedrock: same role/content structure for simple text
        bedrock_messages = []
        system_prompts = []
        
        for msg in messages:
            role = msg.get("role")
            content = msg.get("content")
            if role == "system":
                # Bedrock Converse API takes system prompts separately
                system_prompts.append({"text": content})
            elif role in ["user", "assistant"]:
                bedrock_messages.append({
                    "role": role,
                    "content": [{"text": content}]
                })
        
        # Prepare inference config
        temperature = kwargs.get("temperature", 0.7)
        max_tokens = kwargs.get("max_tokens", 1000)

        # Call Bedrock
        response = client.converse(
            modelId=model_id,
            messages=bedrock_messages,
            system=system_prompts,
            inferenceConfig={
                "temperature": temperature,
                "maxTokens": max_tokens
            }
        )

        # Extract content
        # Bedrock response structure: output['message']['content'][0]['text']
        output_text = response['output']['message']['content'][0]['text']
        
        # Wrap response to match OpenAI interface (response.choices[0].message.content)
        class MockMessage:
            def __init__(self, content):
                self.content = content
        
        class MockChoice:
            def __init__(self, content):
                self.message = MockMessage(content)
        
        class MockResponse:
            def __init__(self, content):
                self.choices = [MockChoice(content)]
                self.usage = None  # Usage translation skipped for brevity
        
        return MockResponse(output_text)

    if provider == "azure":
        client = _get_azure_client()
        return client.chat.completions.create(
            model=model,
            messages=messages,
            **kwargs,
        )

    raise ValueError(f"Unknown LLM_PROVIDER={provider}. Use 'azure' or 'bedrock'.")
