"""
LLM Service for AI Chat functionality
Supports Ollama for local development and can be extended for production LLMs
"""

import os
import httpx
from typing import AsyncGenerator, Optional
import json


# Configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.2")  # Default model

# System prompt for WARIS context
WARIS_SYSTEM_PROMPT = """คุณคือ WARIS AI Assistant ผู้ช่วยอัจฉริยะสำหรับระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสีย
ของการประปาส่วนภูมิภาค (กปภ.) ประเทศไทย

หน้าที่ของคุณ:
1. วิเคราะห์ข้อมูลน้ำสูญเสียในแต่ละพื้นที่จ่ายน้ำย่อย (DMA)
2. ให้คำแนะนำในการลดน้ำสูญเสีย
3. อธิบายสถานะการแจ้งเตือนและความผิดปกติ
4. ตอบคำถามเกี่ยวกับระบบประปาและการบริหารจัดการน้ำ

กฎการตอบ:
- ตอบเป็นภาษาไทยเสมอ ยกเว้นคำศัพท์เทคนิค
- ตอบกระชับ ตรงประเด็น
- ใช้ข้อมูลจริงที่มีเท่านั้น ไม่แต่งข้อมูลขึ้นมา
- ถ้าไม่แน่ใจหรือไม่มีข้อมูล ให้บอกตรงๆ
"""


class LLMService:
    """Service for interacting with LLM backends"""

    def __init__(self):
        self.ollama_url = OLLAMA_URL
        self.model = LLM_MODEL
        self.timeout = httpx.Timeout(60.0, connect=10.0)

    async def check_ollama_available(self) -> bool:
        """Check if Ollama server is available"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False

    async def get_available_models(self) -> list[str]:
        """Get list of available models from Ollama"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    return [m["name"] for m in data.get("models", [])]
        except Exception:
            pass
        return []

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

        # Try Ollama first
        if await self.check_ollama_available():
            async for chunk in self._stream_ollama(messages):
                yield chunk
        else:
            # Fallback to mock response when Ollama is not available
            async for chunk in self._mock_response(message):
                yield chunk

    async def _stream_ollama(self, messages: list[dict]) -> AsyncGenerator[str, None]:
        """Stream response from Ollama"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.ollama_url}/api/chat",
                    json={
                        "model": self.model,
                        "messages": messages,
                        "stream": True,
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
            yield f"เกิดข้อผิดพลาดในการเชื่อมต่อ LLM: {str(e)}"

    async def _mock_response(self, message: str) -> AsyncGenerator[str, None]:
        """Provide mock responses when LLM is not available"""
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
                "\n_หมายเหตุ: ขณะนี้ระบบใช้โหมด Offline_",
            ]

        # Stream the response
        for chunk in selected:
            await asyncio.sleep(0.03 + 0.05 * (len(chunk) / 20))
            yield chunk


# Singleton instance
llm_service = LLMService()
