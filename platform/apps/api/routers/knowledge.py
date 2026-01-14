"""
Knowledge API Router
RAG knowledge base management
TOR Reference: Section 4.5.4.5
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import logging

from services.rag import (
    milvus_client,
    document_indexer,
    rag_retriever,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/knowledge", tags=["knowledge"])


class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results")
    category: Optional[str] = Field(default=None, description="Filter by category")
    min_score: float = Field(default=0.7, ge=0.0, le=1.0, description="Minimum score")


class SearchResult(BaseModel):
    id: str
    title: str
    content: str
    source: str
    category: str
    score: float


class SearchResponse(BaseModel):
    success: bool
    results: List[SearchResult]
    total: int


class IndexDocumentRequest(BaseModel):
    content: str = Field(..., description="Document content")
    source: str = Field(..., description="Source identifier")
    category: Optional[str] = Field(default=None, description="Document category")
    title: Optional[str] = Field(default=None, description="Document title")


class IndexDirectoryRequest(BaseModel):
    directory: str = Field(..., description="Directory path to index")
    pattern: str = Field(default="**/*.md", description="File pattern")


class RAGChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    conversation_history: Optional[List[dict]] = Field(default=None)
    category: Optional[str] = Field(default=None, description="Filter by category")


class RAGChatResponse(BaseModel):
    answer: str
    model: Optional[str]
    provider: Optional[str]
    sources: List[dict]
    context_used: bool


@router.get("/status")
async def get_knowledge_status():
    """
    Get knowledge base status

    Returns Milvus connection status and document count.
    """
    try:
        stats = await milvus_client.get_stats()
        return {
            "success": True,
            "data": stats,
        }
    except Exception as e:
        logger.error(f"Failed to get knowledge status: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "connected": False,
                "num_entities": 0,
            },
        }


@router.post("/search", response_model=SearchResponse)
async def search_knowledge(request: SearchRequest):
    """
    Search the knowledge base

    Uses vector similarity to find relevant documents.
    """
    try:
        results = await rag_retriever.retrieve(
            query=request.query,
            top_k=request.top_k,
            category=request.category,
            min_score=request.min_score,
        )

        return SearchResponse(
            success=True,
            results=[
                SearchResult(
                    id=r.get("id", ""),
                    title=r.get("title", ""),
                    content=r.get("content", "")[:500] + "...",
                    source=r.get("source", ""),
                    category=r.get("category", ""),
                    score=r.get("score", 0.0),
                )
                for r in results
            ],
            total=len(results),
        )
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/index/document")
async def index_document(request: IndexDocumentRequest):
    """
    Index a single document

    Chunks and embeds the document, then stores in Milvus.
    """
    try:
        result = await document_indexer.index_document(
            content=request.content,
            source=request.source,
            category=request.category,
            title=request.title,
        )

        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        logger.error(f"Indexing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")


@router.post("/index/directory")
async def index_directory(
    request: IndexDirectoryRequest,
    background_tasks: BackgroundTasks,
):
    """
    Index all documents in a directory

    Runs in background for large directories.
    """
    async def run_indexing():
        try:
            result = await document_indexer.index_directory(
                directory=request.directory,
                pattern=request.pattern,
            )
            logger.info(f"Directory indexing complete: {result}")
        except Exception as e:
            logger.error(f"Directory indexing failed: {e}")

    background_tasks.add_task(run_indexing)

    return {
        "success": True,
        "message": "Indexing started in background",
        "data": {
            "directory": request.directory,
            "pattern": request.pattern,
        },
    }


@router.post("/index/knowledge-base")
async def index_knowledge_base(background_tasks: BackgroundTasks):
    """
    Index the WARIS knowledge base (docs/km)

    Indexes all markdown files in the knowledge management directory.
    """
    km_directory = "/app/../../docs/km"  # Adjust path as needed

    async def run_indexing():
        try:
            result = await document_indexer.index_knowledge_base(km_directory)
            logger.info(f"Knowledge base indexing complete: {result}")
        except Exception as e:
            logger.error(f"Knowledge base indexing failed: {e}")

    background_tasks.add_task(run_indexing)

    return {
        "success": True,
        "message": "Knowledge base indexing started",
    }


@router.post("/chat/rag", response_model=RAGChatResponse)
async def rag_chat(request: RAGChatRequest):
    """
    RAG-enhanced chat

    Retrieves relevant context from knowledge base before generating response.
    """
    try:
        result = await rag_retriever.query_with_context(
            query=request.message,
            conversation_history=request.conversation_history,
            category=request.category,
        )

        return RAGChatResponse(
            answer=result.get("answer", ""),
            model=result.get("model"),
            provider=result.get("provider"),
            sources=result.get("sources", []),
            context_used=result.get("context_used", False),
        )
    except Exception as e:
        logger.error(f"RAG chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"RAG chat failed: {str(e)}")


@router.post("/chat/rag/stream")
async def rag_chat_stream(request: RAGChatRequest):
    """
    Streaming RAG-enhanced chat

    Returns Server-Sent Events with response tokens.
    """
    async def generate():
        try:
            async for token in rag_retriever.stream_with_context(
                query=request.message,
                conversation_history=request.conversation_history,
                category=request.category,
            ):
                yield f"data: {json.dumps({'content': token}, ensure_ascii=False)}\n\n"

            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            logger.error(f"RAG stream error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
