"""
LLM Service for AI Chat functionality
Supports OpenRouter (default) and Ollama (optional fallback)
"""

import httpx
from typing import AsyncGenerator, Optional
import json
from enum import Enum

from core.llm_config import llm_settings, WARIS_SYSTEM_PROMPT, DEFAULT_MODEL_PRIORITY


class LLMProvider(str, Enum):
    """Available LLM providers"""
    OPENROUTER = "openrouter"
    OLLAMA = "ollama"
    AUTO = "auto"  # Try OpenRouter first, fallback to Ollama


class LLMService:
    """Service for interacting with LLM backends (OpenRouter and Ollama)"""

    def __init__(self):
        # Provider configuration
        self.provider = LLMProvider(llm_settings.LLM_PROVIDER.lower())

        # OpenRouter configuration
        self.openrouter_base_url = llm_settings.OPENROUTER_BASE_URL
        self.openrouter_api_key = llm_settings.OPENROUTER_API_KEY
        self.openrouter_model = llm_settings.OPENROUTER_DEFAULT_MODEL

        # Ollama configuration (fallback)
        self.ollama_url = llm_settings.OLLAMA_BASE_URL
        self.ollama_model = llm_settings.OLLAMA_DEFAULT_MODEL

        # General settings
        self.max_tokens = llm_settings.LLM_MAX_TOKENS
        self.temperature = llm_settings.LLM_TEMPERATURE
        self.timeout = httpx.Timeout(float(llm_settings.LLM_TIMEOUT), connect=10.0)

        # Current model info
        self._current_provider: Optional[LLMProvider] = None
        self._current_model: Optional[str] = None

    @property
    def model(self) -> str:
        """Get current active model name"""
        if self._current_model:
            return self._current_model
        if self.provider == LLMProvider.OLLAMA:
            return self.ollama_model
        return self.openrouter_model

    @property
    def active_provider(self) -> str:
        """Get current active provider"""
        if self._current_provider:
            return self._current_provider.value
        return self.provider.value

    async def check_openrouter_available(self) -> bool:
        """Check if OpenRouter API is available"""
        if not self.openrouter_api_key:
            return False
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.openrouter_base_url}/models",
                    headers={"Authorization": f"Bearer {self.openrouter_api_key}"}
                )
                return response.status_code == 200
        except Exception:
            return False

    async def check_ollama_available(self) -> bool:
        """Check if Ollama server is available"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False

    async def get_available_models(self) -> list[str]:
        """Get list of available models based on provider"""
        models = []

        # Check OpenRouter models
        if self.provider in [LLMProvider.OPENROUTER, LLMProvider.AUTO]:
            if await self.check_openrouter_available():
                models.extend(DEFAULT_MODEL_PRIORITY)

        # Check Ollama models
        if self.provider in [LLMProvider.OLLAMA, LLMProvider.AUTO]:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.get(f"{self.ollama_url}/api/tags")
                    if response.status_code == 200:
                        data = response.json()
                        ollama_models = [f"ollama/{m['name']}" for m in data.get("models", [])]
                        models.extend(ollama_models)
            except Exception:
                pass

        return models

    async def get_status(self) -> dict:
        """Get LLM service status"""
        openrouter_available = await self.check_openrouter_available()
        ollama_available = await self.check_ollama_available()

        return {
            "provider": self.provider.value,
            "openrouter": {
                "available": openrouter_available,
                "model": self.openrouter_model,
                "has_api_key": bool(self.openrouter_api_key),
            },
            "ollama": {
                "available": ollama_available,
                "model": self.ollama_model,
                "url": self.ollama_url,
            },
            "active_model": self.model,
        }

    async def stream_chat(
        self,
        message: str,
        conversation_history: Optional[list[dict]] = None,
        context: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream a chat response from the LLM

        Args:
            message: The user's message
            conversation_history: Previous messages in the conversation
            context: Additional context (e.g., DMA data, alerts)
        """
        # Build messages array
        messages = [{"role": "system", "content": WARIS_SYSTEM_PROMPT}]

        # Add context if provided
        if context:
            messages.append({
                "role": "system",
                "content": f"ข้อมูลบริบทเพิ่มเติม:\n{context}"
            })

        # Add conversation history
        if conversation_history:
            messages.extend(conversation_history)

        # Add current message
        messages.append({"role": "user", "content": message})

        # Select provider based on configuration
        if self.provider == LLMProvider.OPENROUTER:
            # Use OpenRouter only
            if await self.check_openrouter_available():
                async for chunk in self._stream_openrouter(messages):
                    yield chunk
            else:
                yield "ขออภัย OpenRouter API ไม่พร้อมใช้งาน กรุณาตรวจสอบ API key หรือการเชื่อมต่อ"

        elif self.provider == LLMProvider.OLLAMA:
            # Use Ollama only
            if await self.check_ollama_available():
                async for chunk in self._stream_ollama(messages):
                    yield chunk
            else:
                yield "ขออภัย Ollama server ไม่พร้อมใช้งาน กรุณาตรวจสอบว่า Ollama กำลังทำงานอยู่"

        else:  # AUTO mode - try OpenRouter first, fallback to Ollama
            if await self.check_openrouter_available():
                self._current_provider = LLMProvider.OPENROUTER
                self._current_model = self.openrouter_model
                async for chunk in self._stream_openrouter(messages):
                    yield chunk
            elif await self.check_ollama_available():
                self._current_provider = LLMProvider.OLLAMA
                self._current_model = self.ollama_model
                async for chunk in self._stream_ollama(messages):
                    yield chunk
            else:
                # Fallback to mock response when no LLM is available
                async for chunk in self._mock_response(message):
                    yield chunk

    async def _stream_openrouter(self, messages: list[dict]) -> AsyncGenerator[str, None]:
        """Stream response from OpenRouter API"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.openrouter_base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openrouter_api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://waris.pwa.co.th",
                        "X-Title": "WARIS - Water Loss Analysis System",
                    },
                    json={
                        "model": self.openrouter_model,
                        "messages": messages,
                        "stream": True,
                        "max_tokens": self.max_tokens,
                        "temperature": self.temperature,
                    },
                ) as response:
                    if response.status_code != 200:
                        error_body = await response.aread()
                        yield f"OpenRouter API error: {response.status_code} - {error_body.decode()}"
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str.strip() == "[DONE]":
                                break
                            try:
                                data = json.loads(data_str)
                                if "choices" in data and len(data["choices"]) > 0:
                                    delta = data["choices"][0].get("delta", {})
                                    if "content" in delta:
                                        yield delta["content"]
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            yield f"เกิดข้อผิดพลาดในการเชื่อมต่อ OpenRouter: {str(e)}"

    async def _stream_ollama(self, messages: list[dict]) -> AsyncGenerator[str, None]:
        """Stream response from Ollama"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.ollama_url}/api/chat",
                    json={
                        "model": self.ollama_model,
                        "messages": messages,
                        "stream": True,
                        "options": {
                            "num_predict": self.max_tokens,
                            "temperature": self.temperature,
                        },
                    },
                ) as response:
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                if "message" in data and "content" in data["message"]:
                                    yield data["message"]["content"]
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            yield f"เกิดข้อผิดพลาดในการเชื่อมต่อ Ollama: {str(e)}"

    async def _mock_response(self, message: str) -> AsyncGenerator[str, None]:
        """Provide mock responses when no LLM is available"""
        import asyncio

        # Thai mock responses based on keywords
        responses = {
            "วิเคราะห์": [
                "📊 **การวิเคราะห์สถานะน้ำสูญเสีย**\n\n",
                "จากข้อมูลล่าสุด พบว่า:\n\n",
                "- อัตราน้ำสูญเสียเฉลี่ย: **15.5%**\n",
                "- พื้นที่ปกติ: 54 DMA\n",
                "- พื้นที่เฝ้าระวัง: 8 DMA\n",
                "- พื้นที่วิกฤต: 3 DMA\n\n",
                "**พื้นที่ที่ต้องให้ความสำคัญ:**\n",
                "1. DMA ชลบุรี-01 (28.5%)\n",
                "2. DMA เชียงใหม่-03 (22.1%)\n",
            ],
            "สรุป": [
                "🔔 **สรุปการแจ้งเตือนวันนี้**\n\n",
                "- การแจ้งเตือนระดับวิกฤต: 1 รายการ\n",
                "- การแจ้งเตือนระดับสูง: 1 รายการ\n",
                "- การแจ้งเตือนระดับปานกลาง: 2 รายการ\n\n",
                "ควรดำเนินการตรวจสอบ DMA ชลบุรี-01 เป็นลำดับแรก\n",
            ],
            "แนะนำ": [
                "💡 **คำแนะนำในการลดน้ำสูญเสีย**\n\n",
                "1. **ตรวจหาจุดรั่วซึม** - ใช้เครื่องตรวจจับเสียงรั่ว\n",
                "2. **ปรับแรงดันน้ำ** - ลดแรงดันช่วงกลางคืน 20-30%\n",
                "3. **เปลี่ยนท่อเก่า** - ท่อที่มีอายุมากกว่า 30 ปี\n",
                "4. **ติดตั้ง DMA meter** - เพิ่มจุดวัดในพื้นที่เสี่ยง\n\n",
                "คาดว่าสามารถลดน้ำสูญเสียได้ 8-12%\n",
            ],
        }

        # Find matching response
        selected = None
        for keyword, response in responses.items():
            if keyword in message:
                selected = response
                break

        if not selected:
            selected = [
                "สวัสดีครับ ผมคือ WARIS AI Assistant\n\n",
                "ผมพร้อมช่วยเหลือเกี่ยวกับ:\n",
                "- วิเคราะห์ข้อมูลน้ำสูญเสีย\n",
                "- สรุปการแจ้งเตือน\n",
                "- คำแนะนำในการลดน้ำสูญเสีย\n\n",
                "มีอะไรให้ช่วยครับ?\n",
                "\n_หมายเหตุ: ขณะนี้ระบบใช้โหมด Offline - กรุณาตั้งค่า OpenRouter API key หรือเปิด Ollama_",
            ]

        # Stream the response
        for chunk in selected:
            await asyncio.sleep(0.03 + 0.05 * (len(chunk) / 20))
            yield chunk


# Singleton instance
llm_service = LLMService()
