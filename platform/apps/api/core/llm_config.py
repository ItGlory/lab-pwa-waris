"""
LLM Configuration
Settings for OpenRouter and Ollama providers
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class LLMSettings(BaseSettings):
    """LLM Configuration Settings"""

    # Provider Selection
    LLM_PROVIDER: str = Field(
        default="openrouter",
        description="LLM provider: openrouter | ollama | auto"
    )

    # OpenRouter Configuration
    OPENROUTER_API_KEY: str = Field(
        default="",
        description="OpenRouter API key"
    )
    OPENROUTER_BASE_URL: str = Field(
        default="https://openrouter.ai/api/v1",
        description="OpenRouter API base URL"
    )
    OPENROUTER_DEFAULT_MODEL: str = Field(
        default="qwen/qwen-2.5-72b-instruct",
        description="Default OpenRouter model (Thai 70B+)"
    )

    # Ollama Configuration (Fallback)
    OLLAMA_BASE_URL: str = Field(
        default="http://localhost:11434",
        description="Ollama API base URL"
    )
    OLLAMA_DEFAULT_MODEL: str = Field(
        default="qwen2.5:72b",
        description="Default Ollama model"
    )

    # General LLM Settings
    LLM_MAX_TOKENS: int = Field(
        default=4096,
        description="Maximum tokens in response"
    )
    LLM_TEMPERATURE: float = Field(
        default=0.7,
        description="Temperature for response generation"
    )
    LLM_TIMEOUT: int = Field(
        default=60,
        description="Request timeout in seconds"
    )
    LLM_STREAM: bool = Field(
        default=True,
        description="Enable streaming responses"
    )

    # Rate Limiting
    LLM_RATE_LIMIT_PER_MINUTE: int = Field(
        default=20,
        description="Maximum requests per minute per user"
    )
    LLM_DAILY_LIMIT_PER_USER: int = Field(
        default=100,
        description="Maximum requests per day per user"
    )

    class Config:
        env_file = ".env"
        extra = "ignore"


# Available Thai-capable models on OpenRouter (70B+)
OPENROUTER_THAI_MODELS: List[dict] = [
    {
        "id": "scb10x/llama3.1-typhoon2-70b-instruct",
        "name": "Typhoon 2 70B",
        "name_th": "ไต้ฝุ่น 2 70B",
        "provider": "SCB10X",
        "parameters": "70B",
        "thai_support": "native",
        "context_length": 32768,
        "cost_per_million": 0.88,
    },
    {
        "id": "qwen/qwen-2.5-72b-instruct",
        "name": "Qwen 2.5 72B",
        "name_th": "เฉียนเหวิน 2.5 72B",
        "provider": "Alibaba",
        "parameters": "72B",
        "thai_support": "good",
        "context_length": 131072,
        "cost_per_million": 0.35,
    },
    {
        "id": "meta-llama/llama-3.1-70b-instruct",
        "name": "Llama 3.1 70B",
        "name_th": "ลามา 3.1 70B",
        "provider": "Meta",
        "parameters": "70B",
        "thai_support": "moderate",
        "context_length": 131072,
        "cost_per_million": 0.52,
    },
    {
        "id": "mistralai/mixtral-8x22b-instruct",
        "name": "Mixtral 8x22B",
        "name_th": "มิกซ์ทรัล 8x22B",
        "provider": "Mistral",
        "parameters": "176B (MoE)",
        "thai_support": "moderate",
        "context_length": 65536,
        "cost_per_million": 0.90,
    },
]

# Default model priority (fallback order)
DEFAULT_MODEL_PRIORITY: List[str] = [
    "qwen/qwen-2.5-72b-instruct",              # Good Thai, cost-effective (default)
    "qwen/qwen-2.5-7b-instruct",               # Lightweight fallback
    "meta-llama/llama-3.1-70b-instruct",       # General purpose fallback
]

# System prompt for WARIS assistant
WARIS_SYSTEM_PROMPT = """คุณคือผู้ช่วย AI ของระบบ WARIS (Water Loss Intelligent Analysis and Reporting System)
สำหรับการประปาส่วนภูมิภาค (กปภ.)

หน้าที่ของคุณ:
1. ตอบคำถามเกี่ยวกับน้ำสูญเสีย (Water Loss / NRW - Non-Revenue Water)
2. อธิบายข้อมูลจาก DMA (District Metered Area) และพื้นที่จ่ายน้ำย่อย
3. ให้คำแนะนำในการลดน้ำสูญเสียตามมาตรฐาน IWA
4. วิเคราะห์แนวโน้มและรูปแบบการใช้น้ำ
5. อธิบายรายงานและการแจ้งเตือนจากระบบ

คำศัพท์สำคัญ:
- NRW (Non-Revenue Water) = น้ำสูญเสียรายได้
- Physical Loss = น้ำสูญเสียทางกายภาพ (รั่วไหล)
- Commercial Loss = น้ำสูญเสียเชิงพาณิชย์ (มิเตอร์ผิดพลาด)
- DMA = District Metered Area = พื้นที่จ่ายน้ำย่อย
- MNF = Minimum Night Flow = อัตราการไหลต่ำสุดกลางคืน

ข้อกำหนด:
- ตอบเป็นภาษาไทยเสมอ ยกเว้นคำศัพท์เทคนิค
- ใช้ข้อมูลจาก context ที่ให้มาเท่านั้น
- หากไม่แน่ใจ ให้บอกว่าไม่ทราบ อย่าสมมติข้อมูล
- ระบุแหล่งอ้างอิงเมื่อให้ข้อมูลจากระบบ
- ใช้หน่วยวัดที่เหมาะสม: ลบ.ม. (ลูกบาศก์เมตร), บาร์ (ความดัน)
- แสดงวันที่เป็น พ.ศ. (ปฏิทินไทย)
"""

# Guardrail rules
# Note: Be careful with words that have dual meanings in Thai
# e.g., "ความรุนแรง" can mean "violence" OR "severity" (alert severity)
# We use more specific patterns to avoid blocking legitimate queries
GUARDRAIL_BLOCKED_TOPICS = [
    "การเมือง",
    "ศาสนา",
    "เรื่องเพศ",
    "ความรุนแรงทางกาย",
    "ทำร้ายร่างกาย",
    "สารเสพติด",
    "ยาเสพติด",
]

GUARDRAIL_ALLOWED_DOMAINS = [
    "น้ำสูญเสีย",
    "water loss",
    "NRW",
    "DMA",
    "ท่อ",
    "มิเตอร์",
    "ความดัน",
    "pressure",
    "flow",
    "กปภ",
    "ประปา",
    "รายงาน",
    "แจ้งเตือน",
    "วิเคราะห์",
    "ความรุนแรง",  # Alert severity level
    "severity",
    "critical",
    "warning",
    "สรุป",
    "summary",
]


# Create settings instance
llm_settings = LLMSettings()
