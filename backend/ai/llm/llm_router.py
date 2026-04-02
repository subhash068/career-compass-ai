"""
LLM Router for model abstraction and switching.
Supports multiple LLM providers (OpenAI, LLaMA, Mistral, etc.).
"""

from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
import os
import openai
from ai.config.ai_settings import AISettings

try:
    import anthropic
except ImportError:  # pragma: no cover - optional dependency
    anthropic = None


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate_response(self, prompt: str, **kwargs) -> str:
        """Generate a response from the LLM."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is available and configured."""
        pass


class OpenAIProvider(LLMProvider):
    """OpenAI GPT provider."""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

    def generate_response(self, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None, **kwargs) -> Dict[str, Any]:
        """Generate response with tool support using OpenAI chat completions."""
        if not self.is_available():
            raise ValueError( "OpenAI API key not configured")

        config = AISettings.get_llm_config()
        config.update(kwargs)

        try:
            response = openai.chat.completions.create(
                model=config["model"],
                messages=messages,
                tools=tools,
                tool_choice="auto" if tools else None,
                temperature=config.get("temperature", 0.1),
                max_tokens=config.get("max_tokens", 1000)
            )
            choice = response.choices[0]
            return {
                "content": choice.message.content or "",
                "tool_calls": [tc.model_dump() for tc in getattr(choice.message, 'tool_calls', [])] if hasattr(choice.message, 'tool_calls') else [],
                "finish_reason": choice.finish_reason
            }
        except Exception as e:
            raise RuntimeError(f"OpenAI API error: {str(e)}")

    def is_available(self) -> bool:
        """Check if OpenAI is configured."""
        return bool(self.api_key)


class ClaudeProvider(LLMProvider):
    """Anthropic Claude provider."""

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = None
        if self.api_key and anthropic is not None:
            self.client = anthropic.Anthropic(api_key=self.api_key)

    def generate_response(self, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None, **kwargs) -> Dict[str, Any]:
        """Generate response using Anthropic Messages API."""
        if not self.is_available():
            raise ValueError("Anthropic API key not configured")

        config = AISettings.get_llm_config()
        config.update(kwargs)
        
        # Anthropic doesn't support 'model' in the messages list, it's a separate param
        # Also need to separate system message if present
        system_prompt = ""
        filtered_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_prompt = msg["content"]
            else:
                filtered_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        try:
            # Basic message generation (tool support can be added later if needed)
            response = self.client.messages.create(
                model=config["model"],
                max_tokens=config.get("max_tokens", 1000),
                temperature=config.get("temperature", 0.7),
                system=system_prompt,
                messages=filtered_messages
            )
            
            return {
                "content": response.content[0].text if response.content else "",
                "tool_calls": [], # Simplified for now
                "finish_reason": response.stop_reason
            }
        except Exception as e:
            raise RuntimeError(f"Anthropic API error: {str(e)}")

    def is_available(self) -> bool:
        """Check if Anthropic is configured."""
        return bool(self.api_key) and anthropic is not None


class LocalLLMProvider(LLMProvider):
    """Placeholder for local LLM providers like LLaMA."""

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.getenv("LOCAL_LLM_MODEL_PATH")

    def generate_response(self, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None, **kwargs) -> Dict[str, Any]:
        """Local LLM fallback with tool parsing."""
        if not self.is_available():
            raise ValueError("Local LLM not configured")

        content = f"[Local LLM] Processed: {messages[-1]['content'][:100] if messages else 'No message'}..."
        tool_calls = []

        if tools:
            last_content = (messages[-1]['content'] if messages else '').lower()
            for tool in tools:
                name = tool['function']['name'].lower()
                if name in last_content:
                    tool_calls.append({
                        'id': f'call_{name}',
                        'type': 'function',
                        'function': {'name': name, 'arguments': '{}'}
                    })

        return {
            'content': content,
            'tool_calls': tool_calls,
            'finish_reason': 'tool_calls' if tool_calls else 'stop'
        }

    def is_available(self) -> bool:
        """Check if local LLM is configured."""
        return bool(self.model_path) and os.path.exists(self.model_path)


class MockProvider(LLMProvider):
    """Mock provider for testing and fallback."""

    def generate_response(self, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None, **kwargs) -> Dict[str, Any]:
        """Mock with tool support."""
        content = f"Mock LLM: {messages[-1]['content'][:50] if messages else 'No msg'}..."
        tool_calls = []
        import json

        if tools:
            last = messages[-1]['content'].lower() if messages else ''
            for tool in tools:
                name = tool['function']['name'].lower()
                if name in last:
                    tool_calls.append({
                        'id': f'mock_{name}',
                        'type': 'function',
                        'function': {'name': name, 'arguments': json.dumps({'mock': True})}
                    })

        return {
            'content': content,
            'tool_calls': tool_calls,
            'finish_reason': 'tool_calls' if tool_calls else 'stop'
        }

    def is_available(self) -> bool:
        """Mock provider is always available."""
        return True


class LLMRouter:
    """
    Router for LLM providers.
    Handles model switching and provides unified interface.
    """

    def __init__(self):
        self.providers: Dict[str, LLMProvider] = {
            "openai": OpenAIProvider(),
            "claude": ClaudeProvider(),
            "local": LocalLLMProvider(),
            "mock": MockProvider()
        }
        self.current_provider = self._select_provider()

    def _select_provider(self) -> str:
        """Select the best available provider based on configuration."""
        preferred_model = AISettings.LLM_MODEL.lower()

        if "gpt" in preferred_model and self.providers["openai"].is_available():
            return "openai"
        elif "claude" in preferred_model and self.providers["claude"].is_available():
            return "claude"
        elif "llama" in preferred_model and self.providers["local"].is_available():
            return "local"
        elif AISettings.ENABLE_LLM and self.providers["openai"].is_available():
            return "openai"
        elif AISettings.ENABLE_LLM and self.providers["claude"].is_available():
            return "claude"
        elif AISettings.ENABLE_LLM and self.providers["local"].is_available():
            return "local"
        else:
            return "mock"  # Fallback to mock

    def generate_response(self, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None, **kwargs) -> Dict[str, Any]:
        """Unified LLM call with tools support."""
        provider = self.providers[self.current_provider]
        return provider.generate_response(messages, tools, **kwargs)

    def call_tools(self, messages: List[Dict[str, Any]], tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Call LLM with tools, execute one tool call, return result."""
        response = self.generate_response(messages, tools)
        if response['tool_calls']:
            # Execute first tool call (admin_chat will handle execution)
            tool_call = response['tool_calls'][0]
            return {
                'llm_response': response,
                'tool_call': tool_call
            }
        return {'llm_response': response, 'tool_call': None}

    def switch_provider(self, provider_name: str):
        """Switch to a different provider."""
        if provider_name not in self.providers:
            raise ValueError(f"Unknown provider: {provider_name}")

        if not self.providers[provider_name].is_available():
            raise ValueError(f"Provider {provider_name} is not available")

        self.current_provider = provider_name

    def get_available_providers(self) -> List[str]:
        """Get list of available providers."""
        return [name for name, provider in self.providers.items() if provider.is_available()]

    def get_current_provider(self) -> str:
        """Get the name of the current provider."""
        return self.current_provider

    def test_provider(self, provider_name: str, test_prompt: str = "Hello, test message") -> bool:
        """Test if a provider can generate responses."""
        if provider_name not in self.providers:
            return False

        try:
            self.providers[provider_name].generate_response(test_prompt)
            return True
        except Exception:
            return False


# Global router instance
llm_router = LLMRouter()
