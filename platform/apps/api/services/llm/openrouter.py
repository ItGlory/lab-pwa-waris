"""
OpenRouter Client
Provides access to Thai LLM models (70B+) via OpenRouter API
"""

from typing import AsyncGenerator, Dict, List, Optional, Any
import logging
import json
import httpx

from core.llm_config import llm_settings, WARIS_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class OpenRouterClient:
    """
    OpenRouter API Client

    Provides access to:
    - Typhoon 2 70B (Best Thai)
    - Qwen 2.5 72B
    - Llama 3.1 70B
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        default_model: Optional[str] = None,
    ):
        self.api_key = api_key or llm_settings.OPENROUTER_API_KEY
        self.base_url = base_url or llm_settings.OPENROUTER_BASE_URL
        self.default_model = default_model or llm_settings.OPENROUTER_DEFAULT_MODEL
        self.timeout = llm_settings.LLM_TIMEOUT

        if not self.api_key:
            logger.warning("OpenRouter API key not configured")

    def _get_headers(self) -> Dict[str, str]:
        """Get request headers"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://waris.pwa.co.th",
            "X-Title": "WARIS - Water Loss Analysis System",
        }

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send chat completion request

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model ID (default: Typhoon 2 70B)
            temperature: Sampling temperature
            max_tokens: Maximum response tokens
            stream: Enable streaming (returns async generator)

        Returns:
            Response dict with 'content', 'model', 'usage'
        """
        model = model or self.default_model
        temperature = temperature if temperature is not None else llm_settings.LLM_TEMPERATURE
        max_tokens = max_tokens or llm_settings.LLM_MAX_TOKENS

        # Ensure system message is present
        if not any(m.get("role") == "system" for m in messages):
            messages = [{"role": "system", "content": WARIS_SYSTEM_PROMPT}] + messages

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
            **kwargs
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                if stream:
                    return self._stream_response(client, payload)
                else:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=self._get_headers(),
                        json=payload,
                    )
                    response.raise_for_status()
                    data = response.json()

                    return {
                        "content": data["choices"][0]["message"]["content"],
                        "model": data.get("model", model),
                        "usage": data.get("usage", {}),
                        "finish_reason": data["choices"][0].get("finish_reason"),
                    }

        except httpx.HTTPStatusError as e:
            logger.error(f"OpenRouter HTTP error: {e.response.status_code} - {e.response.text}")
            raise
        except httpx.TimeoutException:
            logger.error("OpenRouter request timeout")
            raise
        except Exception as e:
            logger.error(f"OpenRouter error: {e}")
            raise

    async def _stream_response(
        self,
        client: httpx.AsyncClient,
        payload: Dict
    ) -> AsyncGenerator[str, None]:
        """Stream response tokens"""
        async with client.stream(
            "POST",
            f"{self.base_url}/chat/completions",
            headers=self._get_headers(),
            json=payload,
        ) as response:
            response.raise_for_status()

            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        if chunk["choices"][0].get("delta", {}).get("content"):
                            yield chunk["choices"][0]["delta"]["content"]
                    except json.JSONDecodeError:
                        continue

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat completion

        Yields tokens as they are generated
        """
        model = model or self.default_model

        # Ensure system message is present
        if not any(m.get("role") == "system" for m in messages):
            messages = [{"role": "system", "content": WARIS_SYSTEM_PROMPT}] + messages

        payload = {
            "model": model,
            "messages": messages,
            "temperature": kwargs.get("temperature", llm_settings.LLM_TEMPERATURE),
            "max_tokens": kwargs.get("max_tokens", llm_settings.LLM_MAX_TOKENS),
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=self._get_headers(),
                    json=payload,
                ) as response:
                    response.raise_for_status()

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]
                            if data == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                delta = chunk["choices"][0].get("delta", {})
                                if delta.get("content"):
                                    yield delta["content"]
                            except json.JSONDecodeError:
                                continue

        except Exception as e:
            logger.error(f"OpenRouter streaming error: {e}")
            raise

    async def list_models(self) -> List[Dict[str, Any]]:
        """List available models from OpenRouter"""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                data = response.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to list OpenRouter models: {e}")
            return []

    async def health_check(self) -> bool:
        """Check if OpenRouter is available"""
        if not self.api_key:
            return False

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    headers=self._get_headers(),
                )
                return response.status_code == 200
        except Exception:
            return False

    def get_model_info(self, model_id: Optional[str] = None) -> Dict[str, Any]:
        """Get information about a model"""
        model_id = model_id or self.default_model
        return {
            "id": model_id,
            "provider": "openrouter",
            "is_default": model_id == self.default_model,
        }
