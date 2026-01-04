# AI/ML System Overview
# ภาพรวมระบบปัญญาประดิษฐ์

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI/ML SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────── AI SHADOWING (4 MODELS) ─────────────────────────┐ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │  Anomaly    │  │  Pattern    │  │ Classifi-   │  │ Time-series │   │ │
│  │  │  Detection  │  │  Recognition│  │  cation     │  │ Prediction  │   │ │
│  │  │             │  │             │  │             │  │             │   │ │
│  │  │ • Flow      │  │ • Usage     │  │ • Physical  │  │ • Trend     │   │ │
│  │  │ • Pressure  │  │ • Seasonal  │  │ • Commercial│  │ • Forecast  │   │ │
│  │  │ • Meter     │  │ • Cluster   │  │             │  │             │   │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │ │
│  │         │                │                │                │          │ │
│  └─────────┴────────────────┴────────────────┴────────────────┴──────────┘ │
│                                     │                                       │
│                           ┌─────────▼─────────┐                            │
│                           │   Model Server    │                            │
│                           │   (Triton/vLLM)   │                            │
│                           └─────────┬─────────┘                            │
│                                     │                                       │
│  ┌──────────────────────────────────┴───────────────────────────────────┐  │
│  │                                                                       │  │
│  │  ┌───────────────────────── LLM SYSTEM ───────────────────────────┐  │  │
│  │  │                                                                 │  │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │  │
│  │  │  │    LLM      │  │    RAG      │  │  Guardrails │            │  │  │
│  │  │  │   (70B+)    │  │  Pipeline   │  │   System    │            │  │  │
│  │  │  │             │  │             │  │             │            │  │  │
│  │  │  │ • Thai      │  │ • Milvus    │  │ • Content   │            │  │  │
│  │  │  │ • Air-gap   │  │ • Embedding │  │ • Safety    │            │  │  │
│  │  │  │ • Q&A       │  │ • Search    │  │ • Accuracy  │            │  │  │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │  │
│  │  │                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────── ML OPS ───────────────────────────────────┐  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   MLflow    │  │  Training   │  │  Model      │  │  Monitoring │  │  │
│  │  │  Tracking   │  │  Pipeline   │  │  Registry   │  │   & Alerts  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## AI Shadowing Models (TOR 4.5.1)

### Model Summary

| Model | Purpose | Algorithm | Metrics |
|-------|---------|-----------|---------|
| Anomaly Detection | ตรวจจับความผิดปกติ | Isolation Forest, LSTM-AE | Precision, Recall, F1 |
| Pattern Recognition | จดจำรูปแบบการใช้น้ำ | K-Means, DBSCAN, CNN | Silhouette, Accuracy |
| Classification | แยกแยะน้ำสูญเสีย | XGBoost, Random Forest | Accuracy, AUC-ROC |
| Time-series | พยากรณ์แนวโน้ม | Prophet, LSTM, Transformer | MAE, RMSE, MAPE |

### Model Development Approach

Per TOR requirements, each model must:
1. Compare at least 2 different approaches
2. Compare with baseline model (Rule-based or Statistical)
3. Test with agreed-upon test dataset
4. Report performance metrics

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODEL COMPARISON FRAMEWORK                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Baseline   │  │  Approach 1 │  │  Approach 2 │              │
│  │  (Rule/Stat)│  │  (ML-based) │  │  (DL-based) │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┴────────────────┘                      │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │ Evaluation │                                │
│                    │ Framework  │                                │
│                    └─────┬─────┘                                 │
│                          │                                       │
│                    ┌─────▼─────┐                                 │
│                    │   Best    │                                 │
│                    │   Model   │                                 │
│                    └───────────┘                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## LLM System (TOR 4.5.2)

### Requirements

| Requirement | Specification |
|-------------|---------------|
| Model Size | ≥ 70B parameters |
| Language | Thai support (primary) |
| Deployment | On-premise only |
| Network | Air-gapped (no internet) |
| Security | No external data transmission |

### Candidate Models

| Model | Parameters | Thai Support | License |
|-------|------------|--------------|---------|
| Llama 3.1 70B | 70B | Fine-tune needed | Meta |
| Qwen2 72B | 72B | Good | Apache 2.0 |
| Typhoon 70B | 70B | Native | Commercial |

### LLM Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       LLM SERVICE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐       ┌─────────────┐      ┌─────────────┐    │
│  │   User      │──────►│  Guardrails │─────►│    LLM      │    │
│  │   Query     │       │   (Input)   │      │   (70B+)    │    │
│  └─────────────┘       └─────────────┘      └──────┬──────┘    │
│                                                     │           │
│  ┌─────────────┐       ┌─────────────┐      ┌──────▼──────┐    │
│  │  Response   │◄──────│  Guardrails │◄─────│   Output    │    │
│  │             │       │   (Output)  │      │  Processing │    │
│  └─────────────┘       └─────────────┘      └─────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## RAG Pipeline (TOR 4.5.4.5)

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       RAG PIPELINE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │   Query     │                                                │
│  └──────┬──────┘                                                │
│         │                                                        │
│  ┌──────▼──────┐       ┌─────────────┐                         │
│  │  Embedding  │──────►│   Milvus    │                         │
│  │   Model     │       │   Search    │                         │
│  └─────────────┘       └──────┬──────┘                         │
│                               │                                 │
│                        ┌──────▼──────┐                         │
│                        │  Retrieved  │                         │
│                        │  Documents  │                         │
│                        └──────┬──────┘                         │
│                               │                                 │
│  ┌─────────────┐       ┌──────▼──────┐                         │
│  │   Query     │──────►│   Context   │                         │
│  │             │       │  Assembly   │                         │
│  └─────────────┘       └──────┬──────┘                         │
│                               │                                 │
│                        ┌──────▼──────┐                         │
│                        │     LLM     │                         │
│                        │  Generation │                         │
│                        └──────┬──────┘                         │
│                               │                                 │
│                        ┌──────▼──────┐                         │
│                        │  Response   │                         │
│                        │ + Sources   │                         │
│                        └─────────────┘                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Document Processing

```python
# Document types supported (TOR 4.5.4.3)
SUPPORTED_FORMATS = [".docx", ".pdf"]

# Processing pipeline
1. Document Upload
2. Text Extraction
3. Chunking (512-1024 tokens)
4. Embedding Generation
5. Vector Storage (Milvus)
6. Metadata Indexing
```

---

## AI Guardrails (TOR 4.5.6)

### Safety Measures

| Category | Implementation |
|----------|----------------|
| Content Filtering | Block inappropriate content |
| Factual Accuracy | Source citation required |
| Hallucination Prevention | RAG grounding |
| Scope Limiting | Domain-specific responses |
| Rate Limiting | Per-user daily limits |

### Guardrail Pipeline

```python
class GuardrailPipeline:
    def process_input(self, query: str) -> str:
        # 1. Content moderation
        # 2. Injection detection
        # 3. Scope validation
        return sanitized_query

    def process_output(self, response: str) -> str:
        # 1. Factual verification
        # 2. Source citation
        # 3. Content filtering
        # 4. Format validation
        return validated_response
```

---

## Gold Standard Dataset (TOR 4.5.4.6)

### Dataset Components

| Component | Description | Count |
|-----------|-------------|-------|
| Water Loss Reports | ตัวอย่างรายงานวิเคราะห์ | 100+ |
| Technical Q&A | คำถาม-คำตอบเทคนิค | 500+ |
| Executive Summaries | สรุปผู้บริหาร | 50+ |
| Domain Terminology | คำศัพท์เฉพาะทาง กปภ. | 1000+ |

### Evaluation Metrics

```python
# LLM Evaluation
metrics = {
    "accuracy": "Factual correctness vs gold standard",
    "terminology": "Correct use of กปภ. terms",
    "coherence": "Response quality and readability",
    "relevance": "Answer matches question intent",
    "citation": "Source attribution accuracy"
}
```

---

## ISO/IEC 42001 Compliance (TOR 4.5.5)

### AI Management System Requirements

| Requirement | Implementation |
|-------------|----------------|
| AI Policy | Documented AI usage policy |
| Risk Assessment | AI risk identification and mitigation |
| Data Governance | Data quality and privacy controls |
| Model Governance | Version control, audit trail |
| Transparency | Explainable AI where possible |
| Monitoring | Continuous model performance monitoring |

---

## MLOps Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                       MLOPS PIPELINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
│  │  Data   │─►│ Feature │─►│ Training│─►│ Evaluate│─►│Deploy │ │
│  │ Ingest  │  │  Store  │  │         │  │         │  │       │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────┘ │
│       │            │            │            │           │      │
│       ▼            ▼            ▼            ▼           ▼      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     MLflow Tracking                      │   │
│  │  • Experiments  • Metrics  • Artifacts  • Model Registry │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Model Performance Targets

| Model | Metric | Target | Baseline |
|-------|--------|--------|----------|
| Anomaly Detection | F1-Score | ≥ 0.85 | 0.70 |
| Pattern Recognition | Accuracy | ≥ 0.80 | 0.65 |
| Classification | AUC-ROC | ≥ 0.85 | 0.75 |
| Time-series | MAPE | ≤ 15% | 25% |
| LLM (Thai) | Accuracy | ≥ 0.90 | - |
