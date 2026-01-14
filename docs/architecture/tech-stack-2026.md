# WARIS Tech Stack - January 2026

> **Research Date**: January 5, 2026
> **Purpose**: Updated technology recommendations for WARIS platform development

---

## Executive Summary

This document outlines the recommended technology stack for the WARIS platform based on the latest releases and industry best practices as of January 2026. Key improvements include significant performance gains across all layers, native AI/GenAI support, and enhanced Thai language LLM options.

---

## Frontend Stack

### Next.js 16.x (Upgraded from 14+)

**Release**: Late 2025
**Key Improvements**:
- **Turbopack Production Builds**: Now stable with 2x-5x faster compilation
- **Cache Components**: New programming model leveraging Partial Pre-Rendering (PPR)
- **`use cache`**: Simplified caching for instant navigation
- **Async Request APIs**: Breaking change - synchronous access fully removed

**Migration Notes**:
- Upgrade via `npx @next/codemod@canary upgrade latest`
- Security patches required for CVE-2025-55184 and CVE-2025-55183

**Sources**:
- [Next.js 16 Docs](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js 15.5 Release](https://nextjs.org/blog/next-15-5)

---

### React 19.2 (Upgraded from 18+)

**Release**: October 2025
**Key Features**:

| Feature | Benefit for WARIS |
|---------|-------------------|
| **Activity Component** | Pre-render hidden dashboard panels for instant navigation |
| **Server Components GA** | 38% faster initial load, zero JS for static components |
| **React Compiler** | 25-40% fewer re-renders without code changes |
| **useOptimistic** | Instant UI feedback for form submissions |
| **useEffectEvent** | Better event handling in effects |
| **Concurrent Rendering** | No more UI freezes during heavy renders |

**New Hooks**:
```typescript
// use() API - cleaner async data fetching
const data = use(fetchDmaData(dmaId));

// useOptimistic - instant UI feedback
const [optimisticAlerts, addOptimisticAlert] = useOptimistic(alerts);
```

**Sources**:
- [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2)
- [React Blog](https://react.dev/blog)

---

### TypeScript 5.8 (Upgraded from 5.x)

**Release**: February 2025
**Key Features**:
- **Node.js Native Support**: TypeScript runs natively in Node.js 22.18.0+ without transpilation
- **require() of ESM**: Support for requiring ES modules in Node.js
- **Performance Improvements**: Faster path normalization and array operations

**Future**: TypeScript 7.0 (Project Corsa) is being rewritten in Go for 10x speedup

**Sources**:
- [TypeScript 5.8 Announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/)
- [TypeScript 7 Progress](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/)

---

### TailwindCSS 4.0 (Upgraded from 3.x)

**Release**: January 2025
**Major Changes**:

| Feature | Description |
|---------|-------------|
| **CSS-First Config** | Configure in CSS, no more `tailwind.config.js` |
| **5x Faster Builds** | New high-performance engine |
| **Automatic Content Detection** | No manual content configuration |
| **Built-in Container Queries** | Responsive design without plugins |
| **3D Transforms** | `rotate-x-*`, `rotate-y-*`, `scale-z-*` |
| **Lightning CSS** | Ultra-fast CSS parser under the hood |

**Setup Change**:
```css
/* Old way - multiple directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* New way - single import */
@import "tailwindcss";
```

**Browser Support**: Safari 16.4+, Chrome 111+, Firefox 128+

**Sources**:
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)
- [Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

---

### shadcn/ui (Latest)

**Key Updates**:
- **Base UI 1.0 Integration**: All components rebuilt for Base UI support
- **New Components**: Spinner, Kbd, Button Group, Input Group, Field, Item, Empty
- **Field Component**: Advanced form building with Server Actions, React Hook Form, TanStack Form
- **285,000+ Icons**: Free SVG icons from 222 libraries

**Sources**:
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog)
- [shadcn.io](https://www.shadcn.io/)

---

## Backend Stack

### FastAPI 0.124+ (Python 3.12+)

**Key Updates**:
- **Python 3.14 Support**: Latest Python version compatibility
- **Pydantic v2.12**: Improved validation performance
- **FastAPI Cloud**: New deployment option via `fastapi-cloud-cli`
- **Deprecated**: Pydantic v1 support removed

**Performance**: Remains one of the fastest Python frameworks (only behind Starlette/Uvicorn)

**Sources**:
- [FastAPI Releases](https://github.com/fastapi/fastapi/releases)
- [FastAPI Release Notes](https://fastapi.tiangolo.com/release-notes/)

---

### Node.js 22 LTS "Jod" (Upgraded from 20+)

**LTS Status**: Active until April 2027
**Key Features**:
- **Native TypeScript**: Run `.ts` files directly (Node 22.18.0+)
- **Built-in WebSocket Client**: No external libraries needed
- **Watch Mode Stable**: Auto-restart on file changes
- **HTTP/3 (QUIC)**: Faster encrypted communication

**Sources**:
- [Node.js 22 Release](https://nodejs.org/en/blog/announcements/v22-release-announce)
- [Node.js 22.20.0 LTS](https://nodejs.org/en/blog/release/v22.20.0)

---

### PostgreSQL 18+ (Upgraded from 16+)

**Release**: November 2025, Latest: 18.1
**Performance**:
- **32% Faster Reads** (from PG17)
- **2x WAL Processing**: Better concurrent transaction handling
- **Improved VACUUM**: New memory management system

**Key Features**:

| Feature | Benefit for WARIS |
|---------|-------------------|
| **JSON_TABLE()** | Convert JSON to table for reports |
| **Incremental Backups** | Faster disaster recovery |
| **Virtual Generated Columns** | Computed columns without storage |
| **Async I/O (AIO)** | Improved read performance |
| **Better CTEs** | Improved query optimization |

**Sources**:
- [PostgreSQL 18 Released](https://www.postgresql.org/about/news/postgresql-181-177-1611-1515-1420-and-1323-released-3171/)
- [PostgreSQL Releases](https://www.postgresql.org/docs/release/)

---

### MongoDB 8.2 (Upgraded from 7+)

**Performance**:
- **59% Faster Updates**
- **200%+ Faster Time-Series Queries**
- **50x Faster Sharding**

**Key Features**:

| Feature | Benefit for WARIS |
|---------|-------------------|
| **Native Vector Search** | Semantic search without external tools |
| **Hybrid Search** | Combined keyword + vector search |
| **$scoreFusion** | Improved ranking for search results |
| **Queryable Encryption** | Range queries on encrypted data |

**Sources**:
- [MongoDB 8.0](https://www.mongodb.com/products/updates/version-release)
- [MongoDB 8.2 Release Notes](https://www.mongodb.com/docs/manual/release-notes/8.2/)

---

### Redis 8.4 (Upgraded from 7+)

**Performance**:
- **87% Faster Commands**
- **2x More Operations/Second**
- **18% Faster Replication**
- **16x Query Processing Power**

**New Data Structures**:
- **Vector Sets** (Beta): Native vector embeddings by Salvatore Sanfilippo
- **JSON**: Built-in, no separate module
- **Time Series**: Native time-series support
- **Probabilistic**: Bloom filter, cuckoo filter, count-min sketch, top-k, t-digest

**New Commands**:
```redis
HGETEX, HSETEX, HGETDEL  -- Hash with expiration
MSETEX                    -- Atomic multi-set with expiration
```

**AI Features**:
- INT8 quantization for vectors (75% memory reduction, 30% faster search)
- 99.99% search accuracy maintained

**Sources**:
- [Redis 8 GA](https://redis.io/blog/redis-8-ga/)
- [Redis Release Notes](https://redis.io/docs/latest/operate/rs/release-notes/)

---

## AI/ML Stack

### PyTorch 2.10+ (Upgraded from 2.x)

**Release Schedule**: December 2025 / January 2026
**Key Features**:
- **FlexAttention CPU Support**: Optimized attention for LLM inference
- **FP16 X86 Stable**: Half-precision on Intel CPUs with AMX
- **Intel GPU Support**: Intel Arc B-Series, improved installation
- **torch.compiler.set_stance**: Control recompilation behavior

**Note**: Conda distribution deprecated, use pip instead

**Sources**:
- [PyTorch 2.6 Release](https://pytorch.org/blog/pytorch2-6/)
- [PyTorch Releases](https://github.com/pytorch/pytorch/releases)

---

### MLflow 3.8 (Upgraded from 2.x)

**Key Features**:

| Feature | Benefit for WARIS |
|---------|-------------------|
| **GenAI Support** | Native LLM/RAG pipeline tracking |
| **Multi-turn Evaluation** | Assess conversational AI quality |
| **Trace Comparison** | Side-by-side debugging |
| **In-Progress Traces** | Real-time monitoring |
| **DeepEval Integration** | 20+ evaluation metrics |
| **Prompt Management** | Version control for prompts |

**New Scorers**:
- Conversational Safety Scorer
- Tool Call Efficiency Scorer
- Answer relevancy, faithfulness, hallucination detection

**Sources**:
- [MLflow Releases](https://mlflow.org/releases)
- [MLflow in 2025](https://www.sparity.com/blogs/mlflow-3-0-enterprise-mlops/)

---

### Milvus 2.6.5 (Upgraded from 2.x)

**Key Features**:

| Feature | Description |
|---------|-------------|
| **Struct in ARRAY** | Store vector arrays in single entity |
| **Storage Format V2** | 100x performance gain, 98% fewer files |
| **Boost Ranker** | Weighted scoring with filters |
| **40,000+ GitHub Stars** | Industry leader |

**Roadmap**:
- **Milvus 3.0** (Late 2026): MLT search, highlighting, NULL values
- **Milvus Lake**: Trillion-scale semantic lakehouse

**Security**: Upgrade to 2.6.5 for CVE-2025-64513 fix

**Sources**:
- [Milvus 2.6](https://milvus.io/blog/introduce-milvus-2-6-built-for-scale-designed-to-reduce-costs.md)
- [Milvus Release Notes](https://milvus.io/docs/release_notes.md)

---

### AI Agent Frameworks

#### LangChain 1.2 + LangGraph 1.0 (Recommended)

**LangChain 1.0 Changes**:
- **`create_agent`**: New standard for building agents
- **`content_blocks`**: Unified access to LLM features
- **langchain-classic**: Legacy functionality moved here

**LangGraph 1.0**:
- Stateful graph-based agent workflows
- Fine-grained orchestration control
- 80K+ GitHub stars

**Use Case Guidance**:

| Framework | Best For |
|-----------|----------|
| **LangGraph** | Complex workflows, explicit state control |
| **CrewAI** | Production agents with role-based teams |
| **AutoGen** | Research, multi-agent collaboration |

**Sources**:
- [LangChain 1.0](https://blog.langchain.com/langchain-langgraph-1dot0/)
- [LangChain vs LangGraph 2026](https://www.clickittech.com/ai/langchain-1-0-vs-langgraph-1-0/)

---

### Ollama 0.12 (Local LLM)

**Key Features**:
- **Vulkan Acceleration**: AMD, Intel, iGPU support
- **Cloud Models**: Run large models without local hardware
- **Llama 4**: `ollama run llama4:scout` or `llama4:maverick`
- **Streaming Tool Responses**: Real-time answers during tool calls
- **100+ Models**: Including DeepSeek-R1, Cogito-V2.1

**Quantization**: INT4 and INT2 support for reduced memory

**Sources**:
- [Ollama Blog](https://ollama.com/blog)
- [Ollama Library](https://ollama.com/library)

---

## Thai Language LLM Options

### Recommended: OpenThaiGPT R1 (32B)

**Why R1 over 70B**:
- Smaller (32B vs 70B) but better reasoning scores
- Surpasses DeepSeek-R1 and Typhoon2-R1 on benchmarks
- LIMO integration for improved reasoning

**Benchmarks**:
| Benchmark | OpenThaiGPT R1 | DeepSeek-R1 | Typhoon2-R1 |
|-----------|----------------|-------------|-------------|
| AIME24-TH | 56.67 | - | - |
| MATH500-TH | 83.80 | - | - |
| Overall | 71.59 | 63.32 | 65.43 |

### Alternative: Typhoon 2 70B

**Features**:
- 128K context window (expanded from 8K)
- Enterprise-grade accuracy
- Function calling support

**Sources**:
- [OpenThaiGPT R1](https://arxiv.org/html/2504.01789)
- [Typhoon 2](https://www.scb10x.com/en/blog/introducing-typhoon-2-thai-llm)

---

## Infrastructure

### Kubernetes 1.35 "Timbernetes" (Upgraded from 1.30+)

**Key Features**:
- **In-Place Pod Resource Updates GA**: Adjust CPU/memory without restart
- **Native Workload Identity**: Simplified zero-trust architecture
- **cgroup v2 Only**: cgroup v1 support retired

**Deprecation**: Ingress NGINX maintenance ends March 2026, migrate to Gateway API

**Sources**:
- [Kubernetes 1.35](https://kubernetes.io/blog/2025/12/17/kubernetes-v1-35-release/)
- [Kubernetes Security 2025-2026](https://www.cncf.io/blog/2025/12/15/kubernetes-security-2025-stable-features-and-2026-preview/)

---

### Terraform 1.14 (Upgraded from 1.x)

**Key Features**:
- **Ephemeral Values**: Secrets not stored in state files
- **List Resources**: Query existing infrastructure with `terraform query`
- **Actions Block**: Provider-defined imperative operations
- **Backend Blocks in Tests**: Keep long-running test infrastructure alive

**Enterprise**: Replicated support ends April 2026

**Sources**:
- [Terraform 1.10 Ephemeral Values](https://www.hashicorp.com/en/blog/terraform-1-10-improves-handling-secrets-in-state-with-ephemeral-values)
- [Terraform Releases](https://github.com/hashicorp/terraform/releases)

---

## Package.json Dependencies (Recommended)

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0"
  }
}
```

## Python Requirements (Recommended)

```txt
# Core
fastapi>=0.124.0
pydantic>=2.12.0
uvicorn[standard]>=0.34.0

# Database
sqlalchemy>=2.0.0
asyncpg>=0.30.0
pymongo>=4.10.0
redis>=5.2.0

# AI/ML
torch>=2.10.0
langchain>=1.2.0
langgraph>=1.0.0
mlflow>=3.8.0
pymilvus>=2.5.0

# Thai NLP
pythainlp>=5.0.0
```

---

## Migration Checklist

### Phase 1: Frontend
- [ ] Upgrade Next.js 14 → 16 (use codemod)
- [ ] Migrate to React 19.2
- [ ] Update TailwindCSS to 4.0 (CSS-first config)
- [ ] Update TypeScript to 5.8

### Phase 2: Backend
- [ ] Upgrade Python to 3.12+
- [ ] Update FastAPI and Pydantic v2
- [ ] Migrate PostgreSQL to 17
- [ ] Upgrade MongoDB to 8.2
- [ ] Upgrade Redis to 8.x

### Phase 3: AI/ML
- [ ] Upgrade PyTorch to 2.10+
- [ ] Migrate to MLflow 3.8
- [ ] Update Milvus to 2.6.5
- [ ] Update LangChain to 1.2
- [ ] Deploy OpenThaiGPT R1 or Typhoon 2

### Phase 4: Infrastructure
- [ ] Upgrade Kubernetes to 1.35
- [ ] Update Terraform to 1.14
- [ ] Migrate Ingress to Gateway API

---

## Security Patches Required

| Component | CVE | Severity | Action |
|-----------|-----|----------|--------|
| Next.js | CVE-2025-55184 | High | Upgrade to latest |
| Next.js | CVE-2025-55183 | Medium | Upgrade to latest |
| LangChain | CVE-2025-68664 | - | Upgrade to 1.2.5+ |
| Milvus | CVE-2025-64513 | Critical | Upgrade to 2.6.5 |
| MongoDB | CVE-2025-14847 | - | Upgrade to 8.0.17+ |

---

## Conclusion

The 2026 tech stack offers significant improvements:

1. **Performance**: 5x-10x faster builds, 30-87% faster database operations
2. **AI Native**: Built-in vector search, LLM tracing, GenAI evaluation
3. **Thai Language**: OpenThaiGPT R1 outperforms larger models
4. **Developer Experience**: Native TypeScript, CSS-first config, better tooling
5. **Security**: Ephemeral values in Terraform, encrypted search in MongoDB

All recommended versions are production-ready and actively supported through 2027+.
