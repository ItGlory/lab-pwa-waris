"""
Ollama Client
Local LLM fallback provider
"""

from typing import AsyncGenerator, Dict, List, Optional, Any
import logging
import json
import httpx

from core.llm_config import llm_settings, WARIS_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class OllamaClient:
    """
    Ollama API Client (Local Fallback)

    Used when:
    - OpenRouter is unavailable
    - Air-gapped deployment required
    - Cost optimization needed
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        default_model: Optional[str] = None,
    ):
        self.base_url = base_url or llm_settings.OLLAMA_BASE_URL
        self.default_model = default_model or llm_settings.OLLAMA_DEFAULT_MODEL
        self.timeout = llm_settings.LLM_TIMEOUT

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
        Send chat completion request to Ollama

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (default: qwen2.5:72b)
            temperature: Sampling temperature
            max_tokens: Maximum response tokens
            stream: Enable streaming

        Returns:
            Response dict with 'content', 'model'
        """
        model = model or self.default_model
        temperature = temperature if temperature is not None else llm_settings.LLM_TEMPERATURE

        # Ensure system message is present
        if not any(m.get("role") == "system" for m in messages):
            messages = [{"role": "system", "content": WARIS_SYSTEM_PROMPT}] + messages

        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens or llm_settings.LLM_MAX_TOKENS,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                if stream:
                    return self._stream_response(client, payload)
                else:
                    response = await client.post(
                        f"{self.base_url}/api/chat",
                        json=payload,
                    )
                    response.raise_for_status()
                    data = response.json()

                    return {
                        "content": data["message"]["content"],
                        "model": data.get("model", model),
                        "usage": {
                            "prompt_tokens": data.get("prompt_eval_count", 0),
                            "completion_tokens": data.get("eval_count", 0),
                        },
                        "finish_reason": "stop" if data.get("done") else "length",
                    }

        except httpx.ConnectError:
            logger.error("Ollama not available - connection refused")
            raise ConnectionError("Ollama server not available")
        except httpx.TimeoutException:
            logger.error("Ollama request timeout")
            raise
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            raise

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
            "stream": True,
            "options": {
                "temperature": kwargs.get("temperature", llm_settings.LLM_TEMPERATURE),
                "num_predict": kwargs.get("max_tokens", llm_settings.LLM_MAX_TOKENS),
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/chat",
                    json=payload,
                ) as response:
                    response.raise_for_status()

                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                if data.get("message", {}).get("content"):
                                    yield data["message"]["content"]
                                if data.get("done"):
                                    break
                            except json.JSONDecodeError:
                                continue

        except Exception as e:
            logger.error(f"Ollama streaming error: {e}")
            raise

    async def list_models(self) -> List[Dict[str, Any]]:
        """List available local models"""
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                return data.get("models", [])
        except Exception as e:
            logger.error(f"Failed to list Ollama models: {e}")
            return []

    async def health_check(self) -> bool:
        """Check if Ollama is available"""
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False

    async def pull_model(self, model: str) -> bool:
        """Pull a model from Ollama registry"""
        try:
            async with httpx.AsyncClient(timeout=600) as client:
                response = await client.post(
                    f"{self.base_url}/api/pull",
                    json={"name": model},
                )
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Failed to pull model {model}: {e}")
            return False

    def get_model_info(self, model_name: Optional[str] = None) -> Dict[str, Any]:
        """Get information about a model"""
        model_name = model_name or self.default_model
        return {
            "id": model_name,
            "provider": "ollama",
            "is_default": model_name == self.default_model,
            "local": True,
        }
