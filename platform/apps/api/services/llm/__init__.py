"""
LLM Service Package
Provides unified access to LLM providers (OpenRouter, Ollama)

OpenRouter is the default provider with Thai 70B+ models.
Ollama serves as local fallback for air-gapped deployments.
"""

from .service import LLMService, default_llm_service, chat, stream_chat
from .openrouter import OpenRouterClient
from .ollama import OllamaClient
from .guardrails import Guardrails, default_guardrails

__all__ = [
    "LLMService",
    "default_llm_service",
    "chat",
    "stream_chat",
    "OpenRouterClient",
    "OllamaClient",
    "Guardrails",
    "default_guardrails",
]
