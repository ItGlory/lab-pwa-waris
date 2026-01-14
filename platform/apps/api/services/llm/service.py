"""
LLM Service
Unified service with OpenRouter (default) and Ollama fallback
TOR Reference: Section 4.5.2
"""

from typing import AsyncGenerator, Dict, List, Optional, Any
import logging

from core.llm_config import llm_settings, WARIS_SYSTEM_PROMPT
from services.llm.openrouter import OpenRouterClient
from services.llm.ollama import OllamaClient
from services.llm.guardrails import Guardrails, default_guardrails

logger = logging.getLogger(__name__)


class LLMService:
    """
    Unified LLM Service

    Features:
    - OpenRouter as default provider (Thai 70B+ models)
    - Ollama as local fallback
    - Automatic failover between providers
    - Input/Output guardrails
    - Response streaming support

    TOR Compliance:
    - 4.5.2: LLM Integration with Thai language support
    - 4.5.6: Response guardrails and safety
    """

    def __init__(
        self,
        openrouter_api_key: Optional[str] = None,
        ollama_base_url: Optional[str] = None,
        guardrails: Optional[Guardrails] = None,
        enable_fallback: bool = True,
    ):
        # Initialize providers
        self.openrouter = OpenRouterClient(api_key=openrouter_api_key)
        self.ollama = OllamaClient(base_url=ollama_base_url)
        self.guardrails = guardrails or default_guardrails
        self.enable_fallback = enable_fallback

        # Provider preference
        self.primary_provider = "openrouter"
        self.fallback_provider = "ollama"

        # Track provider health
        self._provider_healthy = {
            "openrouter": True,
            "ollama": True,
        }

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        stream: bool = False,
        provider: Optional[str] = None,
        skip_guardrails: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send chat completion request

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (provider-specific)
            temperature: Sampling temperature
            max_tokens: Maximum response tokens
            stream: Enable streaming (returns AsyncGenerator)
            provider: Force specific provider ('openrouter' or 'ollama')
            skip_guardrails: Skip input/output validation

        Returns:
            Response dict with 'content', 'model', 'provider', 'usage'
        """
        # Validate input with guardrails
        if not skip_guardrails:
            validated_messages = await self._validate_input(messages)
            if validated_messages is None:
                return {
                    "content": "ขออภัย ไม่สามารถประมวลผลข้อความนี้ได้",
                    "model": None,
                    "provider": None,
                    "error": "Input validation failed",
                }
            messages = validated_messages

        # Ensure system message
        if not any(m.get("role") == "system" for m in messages):
            messages = [{"role": "system", "content": WARIS_SYSTEM_PROMPT}] + messages

        # Determine provider
        selected_provider = provider or self.primary_provider

        # Try primary provider
        try:
            response = await self._call_provider(
                provider=selected_provider,
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream,
                **kwargs
            )

            # Validate output with guardrails
            if not skip_guardrails and not stream:
                response = await self._validate_output(response)

            return response

        except Exception as e:
            logger.warning(f"Primary provider {selected_provider} failed: {e}")
            self._provider_healthy[selected_provider] = False

            # Try fallback if enabled
            if self.enable_fallback and provider is None:
                fallback = (
                    self.fallback_provider
                    if selected_provider == self.primary_provider
                    else self.primary_provider
                )

                if self._provider_healthy.get(fallback, True):
                    logger.info(f"Falling back to {fallback}")
                    try:
                        response = await self._call_provider(
                            provider=fallback,
                            messages=messages,
                            model=None,  # Use default for fallback
                            temperature=temperature,
                            max_tokens=max_tokens,
                            stream=stream,
                            **kwargs
                        )

                        if not skip_guardrails and not stream:
                            response = await self._validate_output(response)

                        return response

                    except Exception as fallback_error:
                        logger.error(f"Fallback provider {fallback} also failed: {fallback_error}")
                        self._provider_healthy[fallback] = False

            # All providers failed
            return {
                "content": "ขออภัย ระบบ AI ไม่สามารถให้บริการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
                "model": None,
                "provider": None,
                "error": str(e),
            }

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        provider: Optional[str] = None,
        skip_guardrails: bool = False,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat completion

        Yields tokens as they are generated
        """
        # Validate input
        if not skip_guardrails:
            validated_messages = await self._validate_input(messages)
            if validated_messages is None:
                yield "ขออภัย ไม่สามารถประมวลผลข้อความนี้ได้"
                return
            messages = validated_messages

        # Ensure system message
        if not any(m.get("role") == "system" for m in messages):
            messages = [{"role": "system", "content": WARIS_SYSTEM_PROMPT}] + messages

        selected_provider = provider or self.primary_provider

        try:
            if selected_provider == "openrouter":
                async for token in self.openrouter.stream_chat(
                    messages=messages,
                    model=model,
                    **kwargs
                ):
                    yield token
            else:
                async for token in self.ollama.stream_chat(
                    messages=messages,
                    model=model,
                    **kwargs
                ):
                    yield token

        except Exception as e:
            logger.warning(f"Streaming from {selected_provider} failed: {e}")

            # Try fallback
            if self.enable_fallback and provider is None:
                fallback = (
                    self.fallback_provider
                    if selected_provider == self.primary_provider
                    else self.primary_provider
                )

                try:
                    if fallback == "openrouter":
                        async for token in self.openrouter.stream_chat(
                            messages=messages,
                            model=None,
                            **kwargs
                        ):
                            yield token
                    else:
                        async for token in self.ollama.stream_chat(
                            messages=messages,
                            model=None,
                            **kwargs
                        ):
                            yield token
                except Exception as fallback_error:
                    logger.error(f"Fallback streaming also failed: {fallback_error}")
                    yield "ขออภัย ระบบ AI ไม่สามารถให้บริการได้ในขณะนี้"

    async def _call_provider(
        self,
        provider: str,
        messages: List[Dict[str, str]],
        model: Optional[str],
        temperature: Optional[float],
        max_tokens: Optional[int],
        stream: bool,
        **kwargs
    ) -> Dict[str, Any]:
        """Call specific provider"""
        if provider == "openrouter":
            response = await self.openrouter.chat(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream,
                **kwargs
            )
            response["provider"] = "openrouter"

        elif provider == "ollama":
            response = await self.ollama.chat(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream,
                **kwargs
            )
            response["provider"] = "ollama"

        else:
            raise ValueError(f"Unknown provider: {provider}")

        # Mark provider as healthy after successful call
        self._provider_healthy[provider] = True

        return response

    async def _validate_input(
        self,
        messages: List[Dict[str, str]]
    ) -> Optional[List[Dict[str, str]]]:
        """Validate input messages with guardrails"""
        # Validate conversation history
        is_valid, error = self.guardrails.validate_conversation(messages)
        if not is_valid:
            logger.warning(f"Conversation validation failed: {error}")
            return None

        # Validate and sanitize user messages
        validated = []
        for msg in messages:
            if msg.get("role") == "user":
                is_valid, sanitized, error = self.guardrails.check_input(
                    msg.get("content", "")
                )
                if not is_valid and error:
                    logger.warning(f"Input validation failed: {error}")
                    return None
                validated.append({"role": "user", "content": sanitized})
            else:
                validated.append(msg)

        return validated

    async def _validate_output(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and filter output with guardrails"""
        content = response.get("content", "")

        if content:
            is_valid, filtered, warning = self.guardrails.check_output(content)

            if not is_valid:
                response["content"] = filtered
                response["filtered"] = True
                logger.warning(f"Output filtered: {warning}")
            else:
                response["content"] = filtered

            # Add disclaimer if needed
            response["content"] = self.guardrails.format_response_with_disclaimer(
                response["content"]
            )

        return response

    async def check_domain_relevance(self, text: str) -> Dict[str, Any]:
        """
        Check if user query is relevant to WARIS domain

        Returns reminder message if off-topic
        """
        if self.guardrails.is_domain_relevant(text):
            return {"relevant": True}
        else:
            return {
                "relevant": False,
                "reminder": self.guardrails.get_domain_reminder()
            }

    async def get_providers_status(self) -> Dict[str, Any]:
        """Get status of all providers"""
        # Check OpenRouter
        openrouter_available = False
        openrouter_models = []
        try:
            openrouter_models = await self.openrouter.list_models()
            openrouter_available = True
        except Exception as e:
            logger.error(f"OpenRouter status check failed: {e}")

        # Check Ollama
        ollama_available = await self.ollama.health_check()
        ollama_models = []
        if ollama_available:
            ollama_models = await self.ollama.list_models()

        return {
            "openrouter": {
                "available": openrouter_available,
                "healthy": self._provider_healthy.get("openrouter", False),
                "is_primary": self.primary_provider == "openrouter",
                "models_count": len(openrouter_models),
                "default_model": llm_settings.OPENROUTER_DEFAULT_MODEL,
            },
            "ollama": {
                "available": ollama_available,
                "healthy": self._provider_healthy.get("ollama", False),
                "is_primary": self.primary_provider == "ollama",
                "models_count": len(ollama_models),
                "default_model": llm_settings.OLLAMA_DEFAULT_MODEL,
            },
            "active_provider": self.primary_provider,
            "fallback_enabled": self.enable_fallback,
        }

    async def list_available_models(self) -> Dict[str, List[Dict[str, Any]]]:
        """List all available models from all providers"""
        models = {
            "openrouter": [],
            "ollama": [],
        }

        # Get OpenRouter models
        try:
            openrouter_models = await self.openrouter.list_models()
            # Filter for Thai-capable and recommended models
            models["openrouter"] = [
                m for m in openrouter_models
                if any(keyword in m.get("id", "").lower()
                       for keyword in ["typhoon", "qwen", "llama"])
            ][:10]  # Limit to top 10
        except Exception as e:
            logger.error(f"Failed to list OpenRouter models: {e}")

        # Get Ollama models
        try:
            ollama_models = await self.ollama.list_models()
            models["ollama"] = ollama_models
        except Exception as e:
            logger.error(f"Failed to list Ollama models: {e}")

        return models


# Create default service instance
default_llm_service = LLMService()


# Convenience functions
async def chat(
    messages: List[Dict[str, str]],
    **kwargs
) -> Dict[str, Any]:
    """Quick chat using default service"""
    return await default_llm_service.chat(messages, **kwargs)


async def stream_chat(
    messages: List[Dict[str, str]],
    **kwargs
) -> AsyncGenerator[str, None]:
    """Quick streaming chat using default service"""
    async for token in default_llm_service.stream_chat(messages, **kwargs):
        yield token
