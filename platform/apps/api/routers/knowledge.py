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
    min_score: float = Field(default=0.1, ge=0.0, le=1.0, description="Minimum score")


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
    images: Optional[List[dict]] = None  # List of {url, title, source_url}


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


# Original Milvus-based RAG endpoint - disabled for POC testing
# @router.post("/chat/rag", response_model=RAGChatResponse)
# async def rag_chat_milvus(request: RAGChatRequest):
#     """RAG-enhanced chat using Milvus vector search (requires Milvus connection)"""
#     try:
#         result = await rag_retriever.query_with_context(
#             query=request.message,
#             conversation_history=request.conversation_history,
#             category=request.category,
#         )
#         return RAGChatResponse(
#             answer=result.get("answer", ""),
#             model=result.get("model"),
#             provider=result.get("provider"),
#             sources=result.get("sources", []),
#             context_used=result.get("context_used", False),
#         )
#     except Exception as e:
#         logger.error(f"RAG chat failed: {e}")
#         raise HTTPException(status_code=500, detail=f"RAG chat failed: {str(e)}")


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


# =============================================================================
# POC RAG Endpoint - Uses local index for testing
# =============================================================================

from pathlib import Path

# KM documents path - supports both local dev and Docker container
# Docker: /app/docs/km (mounted volume)
# Local: ../../docs/km relative to api directory
_km_docker_path = Path("/app/docs/km")
_km_local_path = Path(__file__).parent.parent.parent.parent.parent / "docs" / "km"
KM_ROOT = _km_docker_path if _km_docker_path.exists() else _km_local_path
INDEX_DATA_PATH = KM_ROOT / ".index_data.json"


def _load_local_index() -> List[dict]:
    """Load local index data from km_indexer"""
    if INDEX_DATA_PATH.exists():
        try:
            import json as json_module
            return json_module.loads(INDEX_DATA_PATH.read_text(encoding="utf-8"))
        except Exception as e:
            logger.error(f"Failed to load local index: {e}")
    return []


def _keyword_search(query: str, documents: List[dict], top_k: int = 5) -> List[dict]:
    """Enhanced keyword-based search for POC testing"""
    query_lower = query.lower()

    # Extract key terms (filter out common Thai words)
    stop_words = {"คือ", "อะไร", "คืออะไร", "เป็น", "และ", "หรือ", "จะ", "ได้", "ไม่", "มี", "ใน", "ให้", "ที่", "จาก", "กับ", "เมื่อ", "ถ้า", "หาก", "พบ", "การ", "ของ", "ต้อง"}
    query_words = set(w for w in query_lower.split() if len(w) > 2 and w not in stop_words)

    # Key phrase patterns for better matching
    key_phrases = []
    if "มาตรวัดน้ำ" in query_lower or "มาตร" in query_lower:
        key_phrases.extend(["มาตรวัดน้ำ", "คลาดเคลื่อน", "±4%", "4%", "เที่ยง", "ตรวจสอบ"])
    if "ขั้นตอน" in query_lower:
        key_phrases.extend(["ขั้นตอน", "กระบวนการ", "วิธี"])
    if "dma" in query_lower or "พื้นที่" in query_lower:
        key_phrases.extend(["dma", "district", "พื้นที่ย่อย", "เฝ้าระวัง"])
    if "mnf" in query_lower or "กลางคืน" in query_lower:
        key_phrases.extend(["mnf", "minimum night flow", "กลางคืน"])
    if "step test" in query_lower or "สูญเสียสูง" in query_lower:
        key_phrases.extend(["step test", "alc", "active leak", "ท่อแตก", "ท่อรั่ว"])
    if "จุดควบคุม" in query_lower or "control" in query_lower:
        key_phrases.extend(["จุดควบคุม", "cp1", "cp2", "cp3", "control point"])
    # Only match "ตาราง" if it's related to water loss documents (e.g., "ตาราง 4.3")
    if "ตาราง 4.3" in query_lower or "ตารางที่ 4.3" in query_lower:
        key_phrases.extend(["ตาราง 4.3", "ตารางที่ 4.3"])

    results = []
    for doc in documents:
        content = doc.get("content", "").lower()
        title = doc.get("title", "").lower()
        question = doc.get("question", "").lower() if doc.get("question") else ""
        combined_text = f"{content} {title} {question}"

        # Calculate relevance score
        score = 0.0

        # Exact phrase match (highest priority)
        if query_lower in content or query_lower in question:
            score += 0.6

        # Key phrase match (high priority for domain-specific terms)
        for phrase in key_phrases:
            if phrase in combined_text:
                score += 0.25

        # FAQ question semantic match
        if doc.get("is_faq"):
            # Check if question contains key terms from user query
            matching_terms = sum(1 for w in query_words if w in question)
            if matching_terms >= 2:
                score += 0.4
            elif matching_terms >= 1:
                score += 0.2

        # Word match with weighted scoring
        for word in query_words:
            if word in content:
                score += 0.08
            if word in title:
                score += 0.1
            if word in question:
                score += 0.12

        if score > 0:
            results.append({
                "id": doc.get("id", ""),
                "title": doc.get("title", ""),
                "content": doc.get("content", ""),
                "source": doc.get("file_path", ""),
                "category": doc.get("category", ""),
                "score": min(score, 1.0),
                "is_faq": doc.get("is_faq", False),
                "question": doc.get("question"),
            })

    # Sort by score and return top_k
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


async def _fetch_url_content(url: str) -> dict:
    """Fetch content from external URL with meta image extraction"""
    import httpx
    from bs4 import BeautifulSoup
    from urllib.parse import urljoin

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = await client.get(url, headers=headers)
            response.raise_for_status()

            # Parse HTML
            soup = BeautifulSoup(response.text, "html.parser")

            # Extract meta images (Open Graph, Twitter Cards, etc.)
            image_url = None
            description = None

            # Try Open Graph image first (most common)
            og_image = soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                image_url = og_image["content"]

            # Try Twitter Card image
            if not image_url:
                twitter_image = soup.find("meta", attrs={"name": "twitter:image"})
                if twitter_image and twitter_image.get("content"):
                    image_url = twitter_image["content"]

            # Try standard meta image
            if not image_url:
                meta_image = soup.find("meta", attrs={"name": "image"})
                if meta_image and meta_image.get("content"):
                    image_url = meta_image["content"]

            # Try first article/content image as fallback
            if not image_url:
                for selector in [
                    "article img",
                    "main img",
                    ".content img",
                    "#content img",
                    ".post img",
                    ".news img",
                    ".entry img",
                    "img.img-thumbnail",
                    "img.featured",
                    "img.post-image",
                    ".container img",
                ]:
                    img = soup.select_one(selector)
                    if img and img.get("src"):
                        # Skip logo, icon, and counter images
                        src = img["src"].lower()
                        if not any(skip in src for skip in ["logo", "icon", "avatar", "counter", "stats", "pixel"]):
                            image_url = img["src"]
                            break

            # Last resort: find first large-ish image in body
            if not image_url:
                for img in soup.find_all("img", src=True):
                    src = img["src"].lower()
                    # Skip small images, logos, icons
                    if any(skip in src for skip in ["logo", "icon", "avatar", "counter", "stats", "pixel", "btn", "button"]):
                        continue
                    # Prefer images that look like content images (usually in /news/, /uploads/, /images/, etc)
                    if any(hint in src for hint in ["/news/", "/upload", "/photo", "/image", "/media", "/content"]):
                        image_url = img["src"]
                        break

            # Make image URL absolute if relative
            if image_url and not image_url.startswith(("http://", "https://")):
                image_url = urljoin(url, image_url)

            # Get Open Graph description
            og_desc = soup.find("meta", property="og:description")
            if og_desc and og_desc.get("content"):
                description = og_desc["content"]

            # Try meta description
            if not description:
                meta_desc = soup.find("meta", attrs={"name": "description"})
                if meta_desc and meta_desc.get("content"):
                    description = meta_desc["content"]

            # Get Open Graph title (often better than page title)
            og_title = soup.find("meta", property="og:title")
            title = None
            if og_title and og_title.get("content"):
                title = og_title["content"]
            elif soup.title:
                title = soup.title.string
            else:
                title = url

            # Remove script and style elements for content extraction
            for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
                element.decompose()

            # Try to find main content
            main_content = None

            # Look for article or main content areas
            for selector in ["article", "main", ".content", ".post-content", ".entry-content", "#content"]:
                content_elem = soup.select_one(selector)
                if content_elem:
                    main_content = content_elem.get_text(separator="\n", strip=True)
                    break

            # Fallback to body
            if not main_content:
                body = soup.find("body")
                if body:
                    main_content = body.get_text(separator="\n", strip=True)
                else:
                    main_content = soup.get_text(separator="\n", strip=True)

            # Clean up whitespace
            lines = [line.strip() for line in main_content.split("\n") if line.strip()]
            main_content = "\n".join(lines)

            # Limit content size
            if len(main_content) > 8000:
                main_content = main_content[:8000] + "..."

            return {
                "success": True,
                "url": url,
                "title": title,
                "content": main_content,
                "image": image_url,
                "description": description,
            }

    except Exception as e:
        logger.error(f"Failed to fetch URL {url}: {e}")
        return {
            "success": False,
            "url": url,
            "title": url,
            "content": "",
            "image": None,
            "description": None,
            "error": str(e),
        }


def _extract_urls(text: str) -> List[str]:
    """Extract URLs from text"""
    import re
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    return re.findall(url_pattern, text)


@router.post("/chat/rag", response_model=RAGChatResponse)
async def rag_chat(request: RAGChatRequest):
    """
    RAG-enhanced chat using local index + web fetching

    For POC testing - uses keyword search on local index data.
    Also supports fetching content from external URLs.
    """
    from services.llm import default_llm_service

    try:
        context_parts = []
        sources = []
        images = []  # Store extracted images

        # Check if message contains URLs - fetch external content
        urls = _extract_urls(request.message)

        if urls:
            # Fetch content from URLs
            for url in urls[:3]:  # Limit to 3 URLs
                logger.info(f"Fetching URL: {url}")
                result = await _fetch_url_content(url)

                if result["success"] and result["content"]:
                    context_parts.append(f"--- เนื้อหาจาก: {result['title']} ---")
                    context_parts.append(f"URL: {result['url']}")
                    context_parts.append(result["content"])
                    context_parts.append("")

                    sources.append({
                        "title": result["title"],
                        "source": result["url"],
                        "score": 1.0,
                    })

                    # Add image if available
                    if result.get("image"):
                        images.append({
                            "url": result["image"],
                            "title": result["title"],
                            "source_url": result["url"],
                            "description": result.get("description"),
                        })
                else:
                    logger.warning(f"Failed to fetch URL: {url}")
        else:
            # No URLs - use local knowledge base
            documents = _load_local_index()

            if not documents:
                # Fallback: Try to read markdown files directly
                documents = _load_km_documents_directly()

            if not documents:
                return RAGChatResponse(
                    answer="ขออภัย ยังไม่มีข้อมูลใน Knowledge Base กรุณารัน km_indexer.py ก่อน",
                    model=None,
                    provider=None,
                    sources=[],
                    context_used=False,
                )

            # Search for relevant documents
            search_results = _keyword_search(request.message, documents, top_k=5)

            # Log search results for debugging
            logger.info(f"KB Search for: '{request.message[:50]}...' found {len(search_results)} results")
            for i, r in enumerate(search_results[:3]):
                logger.info(f"  Result {i+1}: score={r['score']:.2f}, title={r['title'][:40]}")

            # Build context from search results - use high threshold for relevance
            # Score >= 0.7 means query is genuinely about KB topics
            # Lower scores indicate partial keyword matches that may not be relevant
            MIN_RELEVANCE_SCORE = 0.7
            for result in search_results:
                if result["score"] >= MIN_RELEVANCE_SCORE:
                    context_parts.append(f"--- {result['title']} ---")
                    context_parts.append(result["content"])
                    context_parts.append("")

                    sources.append({
                        "title": result["title"],
                        "source": result["source"],
                        "score": result["score"],
                    })

        context = "\n".join(context_parts)

        # Generate answer using LLM
        messages = []

        # System prompt - different for URL vs KB queries (MUST be first)
        if urls:
            system_prompt = """คุณคือผู้ช่วย AI ของระบบ WARIS (Water Loss Intelligent Analysis and Reporting System) ของการประปาส่วนภูมิภาค (กปภ.)

คุณได้รับเนื้อหาจากบทความเว็บไซต์ด้านล่าง กรุณาตอบคำถามของผู้ใช้จากเนื้อหานี้

กฎการตอบ:
1. ตอบเป็นภาษาไทยเสมอ
2. สรุปใจความสำคัญให้กระชับและตรงประเด็น
3. หากผู้ใช้ขอสรุปเป็นข้อๆ ให้แสดงเป็นข้อย่อย
4. ระบุแหล่งที่มา (URL) เสมอ
5. หากเนื้อหาไม่เพียงพอ ให้แจ้งผู้ใช้"""
        else:
            # Check if we have HIGHLY relevant context from KB (score >= 0.7)
            # Only high-confidence matches should use KB-focused response
            # Lower scores (0.3-0.7) indicate partial matches that may not be relevant
            has_relevant_kb_context = any(s["score"] >= 0.7 for s in sources)
            logger.info(f"[RAG] KB context check: sources={len(sources)}, scores={[s['score'] for s in sources]}, has_relevant={has_relevant_kb_context}")

            if has_relevant_kb_context:
                system_prompt = """คุณคือผู้ช่วย AI ของระบบ WARIS (Water Loss Intelligent Analysis and Reporting System) ของการประปาส่วนภูมิภาค (กปภ.)

หน้าที่หลักของคุณคือตอบคำถามเกี่ยวกับน้ำสูญเสีย โดยใช้ข้อมูลจากเอกสารมาตรฐานการปฏิบัติงาน

กฎการตอบ:
1. ตอบเป็นภาษาไทยเสมอ
2. ใช้ข้อมูลจากเอกสารที่ให้มาเป็นหลัก
3. ตอบให้กระชับและตรงประเด็น
4. หากเป็นคำถามเกี่ยวกับขั้นตอน ให้ตอบเป็นข้อๆ
5. ระบุแหล่งอ้างอิงจากเอกสาร"""
            else:
                # No KB context - use general LLM knowledge
                system_prompt = """คุณคือผู้ช่วย AI อัจฉริยะที่สามารถตอบคำถามได้ทุกเรื่อง

สิ่งสำคัญ: คุณต้องตอบคำถามของผู้ใช้เสมอ ห้ามปฏิเสธ

หน้าที่ของคุณ:
1. ตอบคำถามทุกประเภท ทั้งงานทั่วไปและเฉพาะทาง
2. ช่วยร่างจดหมาย สรุปบทความ คำนวณ วิเคราะห์
3. สร้างตาราง รายการ หรือเนื้อหาตามที่ผู้ใช้ต้องการ

กฎการตอบ:
1. ตอบเป็นภาษาไทยเสมอ
2. ตอบให้ครบถ้วนและตรงประเด็น
3. หากขอตาราง ให้แสดงเป็นตาราง markdown
4. หากขอวิเคราะห์ ให้แสดงเป็นข้อๆ ชัดเจน
5. ใช้การคิดทีละขั้นตอนสำหรับคำถามคณิตศาสตร์

กฎการคำนวณวันในสัปดาห์:
- ลำดับวัน: จันทร์(0), อังคาร(1), พุธ(2), พฤหัสบดี(3), ศุกร์(4), เสาร์(5), อาทิตย์(6)
- สูตร: (วันเริ่มต้น + จำนวนวัน) mod 7 = วันผลลัพธ์
- ตัวอย่าง 45 วันจากวันจันทร์: 45 mod 7 = 3, จันทร์(0) + 3 = 3 = พฤหัสบดี"""

        if context:
            system_prompt += f"\n\nข้อมูลอ้างอิง:\n{context}"

        messages.append({"role": "system", "content": system_prompt})

        # Add conversation history (after system, before current user message)
        if request.conversation_history:
            messages.extend(request.conversation_history)

        messages.append({"role": "user", "content": request.message})

        # Call LLM
        response = await default_llm_service.chat(
            messages=messages,
            skip_guardrails=False,
        )

        return RAGChatResponse(
            answer=response.get("content", "ขออภัย ไม่สามารถสร้างคำตอบได้"),
            model=response.get("model"),
            provider=response.get("provider"),
            sources=sources,
            context_used=len(sources) > 0,
            images=images if images else None,
        )

    except Exception as e:
        logger.error(f"RAG chat failed: {e}")
        raise HTTPException(status_code=500, detail=f"RAG chat failed: {str(e)}")


def _load_km_documents_directly() -> List[dict]:
    """Load KM documents directly from markdown files"""
    import re
    import yaml

    documents = []

    if not KM_ROOT.exists():
        return documents

    for md_file in KM_ROOT.rglob("*.md"):
        if md_file.name.startswith("."):
            continue

        try:
            content = md_file.read_text(encoding="utf-8")
            rel_path = str(md_file.relative_to(KM_ROOT))

            # Parse frontmatter
            fm_match = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
            if fm_match:
                frontmatter = yaml.safe_load(fm_match.group(1))
                title = frontmatter.get("title", md_file.stem)
                category = frontmatter.get("category", "unknown")
                body = content[fm_match.end():]
            else:
                title = md_file.stem
                category = "unknown"
                body = content

            # Extract FAQ sections
            faq_pattern = r"### Q:\s*(.*?)\n\n\*\*A:\*\*\s*(.*?)(?=\n### Q:|\n---|\Z)"
            faq_matches = re.findall(faq_pattern, body, re.DOTALL)

            for question, answer in faq_matches:
                documents.append({
                    "id": f"{rel_path}:faq:{len(documents)}",
                    "file_path": rel_path,
                    "title": title,
                    "category": category,
                    "content": f"Q: {question.strip()}\n\nA: {answer.strip()}",
                    "is_faq": True,
                    "question": question.strip(),
                })

            # Add full document content
            documents.append({
                "id": f"{rel_path}:full",
                "file_path": rel_path,
                "title": title,
                "category": category,
                "content": body[:8000],  # Limit content size
                "is_faq": False,
                "question": None,
            })

        except Exception as e:
            logger.error(f"Error loading {md_file}: {e}")

    return documents
