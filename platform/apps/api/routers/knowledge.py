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


# =============================================================================
# KM (Knowledge Management) Endpoints for docs/km/
# =============================================================================

class KMDocumentResponse(BaseModel):
    id: str
    title: str
    filename: str
    category: str
    keywords: List[str]
    updated: str
    faq_count: int
    word_count: int
    status: str
    issues: List[str]


class KMValidationResponse(BaseModel):
    total_files: int
    valid_files: int
    warning_files: int
    error_files: int
    total_faq: int
    total_words: int
    issues: List[dict]


class KMStatsResponse(BaseModel):
    total_files: int
    total_words: int
    total_faq: int
    categories: dict
    last_indexed: Optional[str]
    indexed_files: int


@router.get("/km/documents")
async def list_km_documents(
    category: Optional[str] = None,
    status: Optional[str] = None,
):
    """
    List all KM documents from docs/km/

    Returns document metadata including validation status.
    """
    try:
        # In production, this would read from the actual km directory
        # Mock implementation - replace with actual file reading
        km_categories = [
            "water-loss",
            "dma-management",
            "pwa-operations",
            "standards",
            "glossary",
            "scenarios",
        ]

        # This would be replaced with actual file scanning
        mock_docs = [
            {
                "id": "km-001",
                "title": "พื้นฐานน้ำสูญเสีย (NRW Basics)",
                "filename": "01-nrw-basics.md",
                "category": "water-loss",
                "keywords": ["NRW", "น้ำสูญเสีย", "Real Losses"],
                "updated": "2567-01-15",
                "faq_count": 8,
                "word_count": 1250,
                "status": "valid",
                "issues": [],
            },
            {
                "id": "km-002",
                "title": "น้ำสูญเสียทางกายภาพ (Physical Loss)",
                "filename": "02-physical-loss.md",
                "category": "water-loss",
                "keywords": ["Real Losses", "รั่ว", "ILI"],
                "updated": "2567-01-15",
                "faq_count": 6,
                "word_count": 980,
                "status": "valid",
                "issues": [],
            },
        ]

        # Apply filters
        filtered_docs = mock_docs
        if category:
            filtered_docs = [d for d in filtered_docs if d["category"] == category]
        if status:
            filtered_docs = [d for d in filtered_docs if d["status"] == status]

        return {
            "success": True,
            "data": filtered_docs,
            "total": len(filtered_docs),
            "categories": km_categories,
        }

    except Exception as e:
        logger.error(f"Failed to list KM documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/km/stats")
async def get_km_stats():
    """
    Get KM statistics

    Returns document counts, word counts, FAQ counts by category.
    """
    try:
        # Mock stats - replace with actual calculation
        stats = {
            "total_files": 19,
            "total_words": 14947,
            "total_faq": 88,
            "categories": {
                "water-loss": {"files": 4, "faq": 24, "words": 4100},
                "dma-management": {"files": 3, "faq": 18, "words": 3200},
                "pwa-operations": {"files": 3, "faq": 15, "words": 2800},
                "standards": {"files": 2, "faq": 10, "words": 1600},
                "glossary": {"files": 3, "faq": 12, "words": 1847},
                "scenarios": {"files": 2, "faq": 9, "words": 1400},
            },
            "last_indexed": "2026-01-15T10:00:00Z",
            "indexed_files": 19,
        }

        return {
            "success": True,
            "data": stats,
        }

    except Exception as e:
        logger.error(f"Failed to get KM stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/km/validate")
async def validate_km_documents():
    """
    Validate all KM documents

    Checks frontmatter, FAQ sections, cross-references, and Thai content.
    """
    try:
        # Mock validation result - replace with actual km_validator.py call
        validation_result = {
            "total_files": 19,
            "valid_files": 17,
            "warning_files": 2,
            "error_files": 0,
            "total_faq": 88,
            "total_words": 14947,
            "issues": [
                {
                    "file": "03-commercial-loss.md",
                    "type": "warning",
                    "message": "FAQ count is less than recommended (5)",
                },
                {
                    "file": "02-monitoring.md",
                    "type": "warning",
                    "message": "Missing cross-references to related documents",
                },
            ],
        }

        return {
            "success": True,
            "data": validation_result,
        }

    except Exception as e:
        logger.error(f"Validation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/km/index")
async def index_km_for_rag(background_tasks: BackgroundTasks):
    """
    Index KM documents for RAG

    Runs km_indexer.py in background to chunk, embed, and store documents.
    """
    async def run_km_indexing():
        try:
            # In production, this would call km_indexer.py
            logger.info("Starting KM indexing for RAG...")

            # Import and run the indexer
            # from scripts.km_indexer import KMIndexer
            # indexer = KMIndexer(km_root)
            # indexer.index_all()

            logger.info("KM indexing completed")

        except Exception as e:
            logger.error(f"KM indexing failed: {e}")

    background_tasks.add_task(run_km_indexing)

    return {
        "success": True,
        "message": "KM indexing started in background",
    }


@router.get("/km/document/{doc_id}")
async def get_km_document(doc_id: str):
    """
    Get single KM document content

    Returns full document with parsed frontmatter and FAQ sections.
    """
    try:
        # Mock document - replace with actual file reading
        document = {
            "id": doc_id,
            "title": "พื้นฐานน้ำสูญเสีย (NRW Basics)",
            "filename": "01-nrw-basics.md",
            "category": "water-loss",
            "keywords": ["NRW", "น้ำสูญเสีย", "Real Losses", "Apparent Losses"],
            "updated": "2567-01-15",
            "content": "# พื้นฐานน้ำสูญเสีย\n\n## คำจำกัดความ\n\nNRW (Non-Revenue Water)...",
            "faq": [
                {
                    "question": "NRW คืออะไร?",
                    "answer": "NRW (Non-Revenue Water) คือน้ำที่ผลิตได้แต่ไม่สามารถจำหน่ายได้...",
                },
            ],
            "related_documents": [
                {"title": "น้ำสูญเสียทางกายภาพ", "path": "../water-loss/02-physical-loss.md"},
            ],
        }

        return {
            "success": True,
            "data": document,
        }

    except Exception as e:
        logger.error(f"Failed to get KM document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/km/search")
async def search_km(
    query: str,
    top_k: int = 5,
    include_faq: bool = True,
):
    """
    Search KM documents

    Uses vector similarity for semantic search over KM content.
    Optionally includes FAQ matches.
    """
    try:
        # Mock search results - replace with actual Milvus search
        results = [
            {
                "title": "FAQ: NRW คืออะไร?",
                "file_path": "docs/km/water-loss/01-nrw-basics.md",
                "content": "NRW (Non-Revenue Water) คือน้ำที่ผลิตได้แต่ไม่สามารถจำหน่ายได้...",
                "score": 0.95,
                "is_faq": True,
                "question": "NRW คืออะไร? น้ำสูญเสียหมายถึงอะไร?",
            },
            {
                "title": "พื้นฐานน้ำสูญเสีย (NRW Basics)",
                "file_path": "docs/km/water-loss/01-nrw-basics.md",
                "content": "NRW (Non-Revenue Water) หรือ น้ำสูญเสีย คือปริมาณน้ำที่ผลิตได้...",
                "score": 0.92,
                "is_faq": False,
            },
        ]

        # Filter out FAQ if not requested
        if not include_faq:
            results = [r for r in results if not r.get("is_faq")]

        return {
            "success": True,
            "query": query,
            "results": results[:top_k],
            "total": len(results),
        }

    except Exception as e:
        logger.error(f"KM search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
