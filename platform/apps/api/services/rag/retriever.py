"""
RAG Retriever
Retrieve relevant context for LLM queries
TOR Reference: Section 4.5.4.5
"""

from typing import Any, Dict, List, Optional
import logging

from services.rag.milvus_client import milvus_client, MilvusClient
from services.rag.embeddings import embedding_service, EmbeddingService
from services.llm import default_llm_service
from core.llm_config import WARIS_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

# RAG configuration
DEFAULT_TOP_K = 5
# Milvus COSINE returns similarity score 0-1 (higher = more similar)
# Server mode typically returns lower scores than expected
DEFAULT_MIN_SCORE = 0.1


class RAGRetriever:
    """
    RAG Retriever for Context-Aware Chat

    Retrieves relevant documents from the knowledge base
    and generates augmented responses.
    """

    def __init__(
        self,
        milvus: Optional[MilvusClient] = None,
        embedder: Optional[EmbeddingService] = None,
        top_k: int = DEFAULT_TOP_K,
        min_score: float = DEFAULT_MIN_SCORE,
    ):
        self.milvus = milvus or milvus_client
        self.embedder = embedder or embedding_service
        self.top_k = top_k
        self.min_score = min_score

    async def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        category: Optional[str] = None,
        min_score: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents for a query

        Args:
            query: User query
            top_k: Number of results to return
            category: Filter by category
            min_score: Minimum similarity score

        Returns:
            List of relevant documents with scores
        """
        top_k = top_k or self.top_k
        min_score = min_score or self.min_score

        # Generate query embedding
        query_embedding = await self.embedder.embed_text(query)

        # Search Milvus
        results = await self.milvus.search(
            query_embedding=query_embedding,
            top_k=top_k,
            category=category,
            min_score=min_score,
        )

        logger.info(f"Retrieved {len(results)} documents for query")
        return results

    def build_context(self, documents: List[Dict[str, Any]]) -> str:
        """
        Build context string from retrieved documents

        Args:
            documents: List of retrieved documents

        Returns:
            Formatted context string
        """
        if not documents:
            return ""

        context_parts = ["ข้อมูลอ้างอิงจากฐานความรู้:\n"]

        for i, doc in enumerate(documents, 1):
            title = doc.get("title", "")
            content = doc.get("content", "")
            source = doc.get("source", "")
            score = doc.get("score", 0)

            context_parts.append(f"--- เอกสาร {i} ({title}) ---")
            context_parts.append(content)
            context_parts.append(f"แหล่งอ้างอิง: {source} (ความเกี่ยวข้อง: {score:.0%})\n")

        return "\n".join(context_parts)

    async def query_with_context(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        category: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Answer query with RAG context (non-streaming)

        Args:
            query: User query
            conversation_history: Previous messages
            category: Filter documents by category

        Returns:
            Response with answer and sources
        """
        # Retrieve relevant documents
        documents = await self.retrieve(
            query=query,
            category=category,
        )

        # Build context
        context = self.build_context(documents)

        # Build messages
        messages = []

        # Add conversation history
        if conversation_history:
            messages.extend(conversation_history)

        # Add context as system message
        if context:
            messages.append({
                "role": "system",
                "content": f"{WARIS_SYSTEM_PROMPT}\n\n{context}",
            })

        # Add user query
        messages.append({
            "role": "user",
            "content": query,
        })

        # Generate response
        response = await default_llm_service.chat(
            messages=messages,
            skip_guardrails=False,
        )

        return {
            "answer": response.get("content", ""),
            "model": response.get("model"),
            "provider": response.get("provider"),
            "sources": [
                {
                    "title": doc.get("title"),
                    "source": doc.get("source"),
                    "score": doc.get("score"),
                }
                for doc in documents
            ],
            "context_used": len(documents) > 0,
        }

    async def stream_with_context(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        category: Optional[str] = None,
    ):
        """
        Stream answer with RAG context

        Args:
            query: User query
            conversation_history: Previous messages
            category: Filter documents by category

        Yields:
            Response tokens
        """
        # Retrieve relevant documents
        documents = await self.retrieve(
            query=query,
            category=category,
        )

        # Build context
        context = self.build_context(documents)

        # Build messages
        messages = []

        # Add conversation history
        if conversation_history:
            messages.extend(conversation_history)

        # Add context as system message
        if context:
            messages.append({
                "role": "system",
                "content": f"{WARIS_SYSTEM_PROMPT}\n\n{context}",
            })

        # Add user query
        messages.append({
            "role": "user",
            "content": query,
        })

        # Stream response
        async for token in default_llm_service.stream_chat(
            messages=messages,
            skip_guardrails=False,
        ):
            yield token


# Default retriever instance
rag_retriever = RAGRetriever()


# Convenience function
async def rag_query(
    query: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    category: Optional[str] = None,
) -> Dict[str, Any]:
    """Quick RAG query using default retriever"""
    return await rag_retriever.query_with_context(
        query=query,
        conversation_history=conversation_history,
        category=category,
    )
