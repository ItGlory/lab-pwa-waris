"""
RAG (Retrieval-Augmented Generation) Service Package

Provides context-aware AI chat using vector similarity search.
Knowledge base is stored in Milvus and queried via embeddings.

TOR Reference: Section 4.5.4.5
"""

from .milvus_client import MilvusClient, milvus_client
from .embeddings import EmbeddingService, embedding_service
from .chunker import DocumentChunker, DocumentChunk, document_chunker
from .indexer import DocumentIndexer, document_indexer
from .retriever import RAGRetriever, rag_retriever, rag_query

__all__ = [
    # Milvus
    "MilvusClient",
    "milvus_client",
    # Embeddings
    "EmbeddingService",
    "embedding_service",
    # Chunker
    "DocumentChunker",
    "DocumentChunk",
    "document_chunker",
    # Indexer
    "DocumentIndexer",
    "document_indexer",
    # Retriever
    "RAGRetriever",
    "rag_retriever",
    "rag_query",
]
