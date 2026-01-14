# LLM Integration with OpenRouter

# แผนเชื่อมต่อ LLM ผ่าน OpenRouter

**Created:** 2026-01-15
**Status:** ✅ Completed
**TOR Reference:** Section 4.5.2, 4.5.6

---

## Objective (วัตถุประสงค์)

เชื่อมต่อ Large Language Model (LLM) 70B+ ที่รองรับภาษาไทย ผ่าน OpenRouter API

---

## TOR Requirements (ข้อกำหนด)

| Requirement | Specification | Implementation |
|-------------|---------------|----------------|
| Model Size | ≥ 70B parameters | Typhoon 70B, Qwen2 72B, Llama 3.1 70B |
| Language | Thai support (primary) | Native Thai models preferred |
| Deployment | Flexible (Cloud/On-premise) | OpenRouter (Cloud) + Ollama fallback |
| Security | Data protection | Guardrails + Content filtering |

---

## OpenRouter Configuration

### Available Thai-Capable Models (70B+)

| Model | Provider | Parameters | Thai Support | Cost |
|-------|----------|------------|--------------|------|
| `scb10x/llama3.1-typhoon2-70b-instruct` | SCB10X | 70B | Native | $0.88/M |
| `qwen/qwen-2.5-72b-instruct` | Alibaba | 72B | Good | $0.35/M |
| `meta-llama/llama-3.1-70b-instruct` | Meta | 70B | Fine-tune | $0.52/M |
| `mistralai/mixtral-8x22b-instruct` | Mistral | 176B MoE | Moderate | $0.90/M |

### Default Model Priority

```python
DEFAULT_MODELS = [
    "scb10x/llama3.1-typhoon2-70b-instruct",  # Best Thai support
    "qwen/qwen-2.5-72b-instruct",              # Good Thai, cost-effective
    "meta-llama/llama-3.1-70b-instruct",       # Fallback
]
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LLM SERVICE                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐       ┌─────────────┐      ┌─────────────┐            │
│  │   User      │──────►│  Guardrails │─────►│   Router    │            │
│  │   Query     │       │   (Input)   │      │             │            │
│  └─────────────┘       └─────────────┘      └──────┬──────┘            │
│                                                     │                    │
│                              ┌──────────────────────┴────────────────┐  │
│                              │                                        │  │
│                              ▼                                        ▼  │
│                     ┌─────────────┐                          ┌───────────┐
│                     │  OpenRouter │                          │  Ollama   │
│                     │  (Cloud)    │                          │  (Local)  │
│                     │  DEFAULT    │                          │  FALLBACK │
│                     │             │                          │           │
│                     │ • Typhoon   │                          │ • Qwen2   │
│                     │ • Qwen2     │                          │ • Llama3  │
│                     │ • Llama3    │                          │           │
│                     └──────┬──────┘                          └─────┬─────┘
│                            │                                       │      │
│                            └───────────────────┬───────────────────┘      │
│                                                │                          │
│  ┌─────────────┐       ┌─────────────┐  ┌──────▼──────┐                   │
│  │  Response   │◄──────│  Guardrails │◄─│   Output    │                   │
│  │             │       │   (Output)  │  │  Processing │                   │
│  └─────────────┘       └─────────────┘  └─────────────┘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Completed

### Files Created

```
platform/apps/api/
├── core/
│   └── llm_config.py              ✅ LLM configuration
├── services/
│   └── llm/
│       ├── __init__.py            ✅ Package exports
│       ├── openrouter.py          ✅ OpenRouter client (default)
│       ├── ollama.py              ✅ Ollama fallback client
│       ├── service.py             ✅ Unified LLM service
│       └── guardrails.py          ✅ Input/Output guardrails
└── routers/
    └── chat.py                    ✅ Updated chat router

platform/apps/web/
└── app/
    ├── api/chat/
    │   ├── status/route.ts        ✅ Status endpoint
    │   ├── complete/route.ts      ✅ Completion endpoint
    │   ├── stream/route.ts        ✅ Streaming endpoint
    │   └── models/route.ts        ✅ Models listing
    └── (dashboard)/chat/page.tsx  ✅ Updated chat UI
```

---

## Environment Variables

```bash
# OpenRouter Configuration
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=scb10x/llama3.1-typhoon2-70b-instruct

# Fallback Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=qwen2.5:72b

# LLM Settings
LLM_PROVIDER=openrouter  # openrouter | ollama | auto
LLM_MAX_TOKENS=4096
LLM_TEMPERATURE=0.7
LLM_TIMEOUT=60
```

---

## Features Implemented

### 1. Multi-Provider Support
- ✅ OpenRouter as default provider (cloud)
- ✅ Ollama as fallback provider (local)
- ✅ Auto-failover between providers
- ✅ Provider health tracking

### 2. Thai Language Optimization
- ✅ System prompts in Thai
- ✅ Thai terminology for กปภ.
- ✅ Typhoon 2 70B as default model (best Thai support)

### 3. Guardrails (TOR 4.5.6)
- ✅ Input sanitization
- ✅ Prompt injection detection
- ✅ Blocked topics filtering
- ✅ Output content filtering
- ✅ PII masking (Thai ID, phone, email)
- ✅ Domain relevance checking
- ✅ Response disclaimers

### 4. Streaming Support
- ✅ Server-Sent Events (SSE)
- ✅ Real-time response streaming
- ✅ Token-by-token delivery
- ✅ Error handling in stream

### 5. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chat/status` | GET | LLM availability check |
| `/api/v1/chat/models` | GET | List available models |
| `/api/v1/chat/complete` | POST | Non-streaming completion |
| `/api/v1/chat/stream` | POST | Streaming completion (SSE) |
| `/api/v1/chat/check-relevance` | POST | Domain relevance check |

---

## System Prompt (Thai)

```python
WARIS_SYSTEM_PROMPT = """คุณคือผู้ช่วย AI ของระบบ WARIS (Water Loss Intelligent Analysis and Reporting System)
สำหรับการประปาส่วนภูมิภาค (กปภ.)

หน้าที่ของคุณ:
1. ตอบคำถามเกี่ยวกับน้ำสูญเสีย (Water Loss / NRW)
2. อธิบายข้อมูลจาก DMA (District Metered Area)
3. ให้คำแนะนำในการลดน้ำสูญเสีย
4. วิเคราะห์แนวโน้มและรูปแบบการใช้น้ำ

ข้อกำหนด:
- ตอบเป็นภาษาไทยเสมอ ยกเว้นคำศัพท์เทคนิค
- ใช้ข้อมูลจาก context ที่ให้มาเท่านั้น
- หากไม่แน่ใจ ให้บอกว่าไม่ทราบ อย่าสมมติข้อมูล
- ระบุแหล่งอ้างอิงเมื่อให้ข้อมูล
"""
```

---

## Completion Status

| Step | Status |
|------|--------|
| LLM Config | ✅ Completed |
| OpenRouter Client | ✅ Completed |
| Ollama Client | ✅ Completed |
| LLM Service (Unified) | ✅ Completed |
| Guardrails | ✅ Completed |
| Update Chat API | ✅ Completed |
| Frontend Integration | ✅ Completed |
| **Total** | ✅ **Completed** |

---

## Usage Example

```python
from services.llm import default_llm_service

# Non-streaming chat
response = await default_llm_service.chat(
    messages=[
        {"role": "user", "content": "วิเคราะห์น้ำสูญเสียใน DMA ชลบุรี-01"}
    ]
)
print(response["content"])

# Streaming chat
async for token in default_llm_service.stream_chat(
    messages=[{"role": "user", "content": "สรุปการแจ้งเตือนวันนี้"}]
):
    print(token, end="", flush=True)
```

---

## Next Steps

- [ ] RAG Pipeline Integration (TOR 4.5.4.5)
- [ ] Milvus Vector Store Setup
- [ ] Document Embedding Service
- [ ] Context-Aware Chat with DMA Data
