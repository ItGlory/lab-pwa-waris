# WARIS LLM MCP Server

## Purpose
Provides Claude Code access to the on-premise LLM (70B+ Thai-capable) for natural language processing tasks.

## Configuration
```json
{
  "name": "waris-llm",
  "command": "python",
  "args": ["-m", "mcp_servers.llm"]
}
```

## Environment Variables
- `LLM_SERVER_URL`: URL of the LLM inference server
- `LLM_MODEL_NAME`: Name of the deployed model
- `LLM_MAX_TOKENS`: Maximum tokens per response (default: 4096)
- `LLM_TEMPERATURE`: Model temperature (default: 0.7)

## Available Tools

### chat_completion
Generate chat completion with context.
```typescript
interface ChatCompletionParams {
  messages: Array<{role: 'system' | 'user' | 'assistant', content: string}>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}
```

### rag_query
Query with RAG (Retrieval Augmented Generation).
```typescript
interface RAGQueryParams {
  query: string;
  language: 'th' | 'en';
  top_k?: number;
  include_sources?: boolean;
}
```

### generate_report
Generate structured report from data.
```typescript
interface GenerateReportParams {
  report_type: 'daily' | 'weekly' | 'monthly' | 'executive';
  data: object;
  language: 'th' | 'en';
  format: 'text' | 'markdown' | 'html';
}
```

### summarize_document
Summarize uploaded document.
```typescript
interface SummarizeDocumentParams {
  document_id: string;
  summary_type: 'brief' | 'detailed' | 'executive';
  language: 'th' | 'en';
}
```

### embed_text
Generate embeddings for text.
```typescript
interface EmbedTextParams {
  text: string;
  model?: string;
}
```

## Security Features
- Air-gapped operation (no external network)
- No data transmission to external servers
- Guardrails for content filtering
- Rate limiting per user
- Audit logging

## Thai Language Support
- Native Thai language understanding
- กปภ. domain terminology
- Buddhist calendar date handling
- Thai numeral support (optional)

## Guardrails (TOR 4.5.6)
- Factual accuracy verification
- Inappropriate content filtering
- Organizational risk prevention
- Source citation requirement
