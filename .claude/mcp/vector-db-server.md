# WARIS Vector Database MCP Server

## Purpose
Provides Claude Code access to the Milvus vector database for semantic search and RAG functionality.

## Configuration
```json
{
  "name": "waris-vector-db",
  "command": "python",
  "args": ["-m", "mcp_servers.vector_db"]
}
```

## Environment Variables
- `MILVUS_HOST`: Milvus server host
- `MILVUS_PORT`: Milvus server port (default: 19530)
- `MILVUS_COLLECTION`: Default collection name

## Available Tools

### semantic_search
Search for similar documents using vector similarity.
```typescript
interface SemanticSearchParams {
  query: string;
  collection: string;
  top_k?: number;
  filter?: object;
  threshold?: number;
}
```

### insert_embedding
Insert document embeddings into collection.
```typescript
interface InsertEmbeddingParams {
  collection: string;
  documents: Array<{
    id: string;
    text: string;
    embedding: number[];
    metadata: object;
  }>;
}
```

### create_collection
Create a new vector collection.
```typescript
interface CreateCollectionParams {
  name: string;
  dimension: number;
  index_type?: 'IVF_FLAT' | 'HNSW' | 'IVF_SQ8';
  metric_type?: 'L2' | 'IP' | 'COSINE';
}
```

### update_knowledge_base
Update knowledge base with new documents.
```typescript
interface UpdateKnowledgeBaseParams {
  documents: Array<{
    content: string;
    source: string;
    metadata: object;
  }>;
  collection?: string;
}
```

### delete_vectors
Delete vectors by ID or filter.
```typescript
interface DeleteVectorsParams {
  collection: string;
  ids?: string[];
  filter?: object;
}
```

### backup_collection
Backup collection to cloud storage.
```typescript
interface BackupCollectionParams {
  collection: string;
  destination: 'gcloud' | 'local';
}
```

## Collections

### water_loss_reports
- Dimension: 1536 (OpenAI compatible) or model-specific
- Contains: Analysis reports, technical documents

### procedures_manuals
- Technical procedures
- Maintenance manuals
- Standard operating procedures

### qa_pairs
- Question-answer pairs
- FAQ entries
- Support responses

### meeting_minutes
- Meeting records
- Decision logs

## Backup Strategy (TOR 4.4.3)
- Regular backup to G-Cloud
- Backup to on-premise storage
- Point-in-time recovery support
