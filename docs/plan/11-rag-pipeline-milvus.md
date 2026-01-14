# RAG Pipeline with Milvus

# ระบบ RAG สำหรับ WARIS AI

**Created:** 2026-01-15
**Status:** In Progress
**TOR Reference:** Section 4.5.4.5

---

## Objective (วัตถุประสงค์)

สร้างระบบ RAG (Retrieval-Augmented Generation) เพื่อให้ AI Chat ตอบคำถาม
โดยอ้างอิงจากฐานความรู้ของ กปภ. ได้อย่างแม่นยำ

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RAG PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    INDEXING PIPELINE                               │  │
│  │                                                                    │  │
│  │  Documents    ─►  Chunking  ─►  Embedding  ─►  Milvus Store       │  │
│  │  (Markdown)       (512 tokens)   (OpenAI)      (Vector DB)        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    RETRIEVAL PIPELINE                              │  │
│  │                                                                    │  │
│  │  User Query  ─►  Embedding  ─►  Vector Search  ─►  Top K Chunks   │  │
│  │                   (OpenAI)       (Milvus)          (Relevant)     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    GENERATION PIPELINE                             │  │
│  │                                                                    │  │
│  │  Context     ─►  Prompt     ─►  LLM          ─►  Response         │  │
│  │  + Query         Build          (OpenRouter)     (Thai)           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Milvus Vector Store

- **Collection**: `waris_knowledge`
- **Vector Dimension**: 1536 (OpenAI ada-002) or 768 (multilingual)
- **Index Type**: IVF_FLAT or HNSW
- **Metric**: Cosine Similarity

### 2. Embedding Service

- **Provider**: OpenRouter (text-embedding-ada-002) or local model
- **Chunk Size**: 512 tokens
- **Overlap**: 50 tokens

### 3. Document Sources

```
docs/km/
├── water-loss/          # น้ำสูญเสีย
├── dma-management/      # การจัดการ DMA
├── pwa-operations/      # การดำเนินงาน
├── standards/           # มาตรฐาน
└── glossary/            # คำศัพท์
```

---

## Implementation Files

```
platform/apps/api/
├── services/
│   └── rag/
│       ├── __init__.py
│       ├── milvus_client.py    # Milvus connection
│       ├── embeddings.py       # Embedding service
│       ├── chunker.py          # Document chunking
│       ├── indexer.py          # Index documents
│       └── retriever.py        # RAG retrieval
├── routers/
│   └── knowledge.py            # Knowledge API endpoints
└── scripts/
    └── index_knowledge.py      # Index script
```

---

## API Endpoints

| Endpoint                   | Method | Description           |
| -------------------------- | ------ | --------------------- |
| `/api/v1/knowledge/search` | POST   | Search knowledge base |
| `/api/v1/knowledge/index`  | POST   | Index new document    |
| `/api/v1/knowledge/status` | GET    | Index status          |
| `/api/v1/chat/rag`         | POST   | RAG-enhanced chat     |

---

## Environment Variables

```bash
# Milvus Configuration
MILVUS_HOST=milvus
MILVUS_PORT=19530
MILVUS_COLLECTION=waris_knowledge

# Embedding Configuration
EMBEDDING_MODEL=text-embedding-ada-002
EMBEDDING_DIMENSION=1536

# RAG Settings
RAG_TOP_K=5
RAG_MIN_SCORE=0.7
RAG_CHUNK_SIZE=512
RAG_CHUNK_OVERLAP=50
```

---

## Timeline

| Step                     | Status |
| ------------------------ | ------ |
| Create plan document     | ✅     |
| Setup Milvus client      | ✅     |
| Create embedding service | ✅     |
| Build document chunker   | ✅     |
| Implement indexer        | ✅     |
| Build retriever          | ✅     |
| Integrate with chat API  | ✅     |
| Index knowledge docs     | ⏳     |
| Test RAG pipeline        | ✅     |

---

## Test Results (2026-01-15)

### API Endpoints Tested

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /knowledge/status` | ✅ | Connected to Milvus Server |
| `POST /knowledge/index/document` | ✅ | Successfully indexed 1 document |
| `POST /knowledge/search` | ✅ | Works but needs more data |
| `POST /knowledge/chat/rag` | ✅ | LLM responds with Thai |

### Sample Responses

```json
// Status
{"success":true,"data":{"collection_name":"waris_knowledge","num_entities":1,"connected":true}}

// RAG Chat (without knowledge context)
{"answer":"น้ำสูญเสีย หรือ Water Loss หมายถึง...","model":"qwen/qwen-2.5-72b-instruct","provider":"openrouter","sources":[],"context_used":false}
```
