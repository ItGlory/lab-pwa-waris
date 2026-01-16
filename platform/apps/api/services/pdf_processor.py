"""
PDF Processor Service
4-stage pipeline for PDF document processing: Extract → Chunk → Embed → Store
POC Requirement 2.1
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional
import io
import time
import logging

import pdfplumber

from services.rag.chunker import document_chunker, DocumentChunk
from services.rag.embeddings import embedding_service
from services.rag.milvus_client import milvus_client

logger = logging.getLogger(__name__)


class ProcessingStage(str, Enum):
    """4 processing stages for PDF pipeline"""
    EXTRACT = "extract"
    CHUNK = "chunk"
    EMBED = "embed"
    STORE = "store"


@dataclass
class ProcessingProgress:
    """Progress update for SSE streaming"""
    stage: ProcessingStage
    percent: int  # 0-100
    message: str
    message_th: str
    stats: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProcessingResult:
    """Final result of PDF processing"""
    success: bool
    filename: str
    pages_extracted: int = 0
    chunks_created: int = 0
    vectors_stored: int = 0
    processing_time_ms: int = 0
    error: Optional[str] = None
    error_th: Optional[str] = None


# Progress callback type
ProgressCallback = Callable[[ProcessingProgress], None]


class PDFProcessor:
    """
    PDF Processing Pipeline

    Stages:
    1. EXTRACT - Extract text from PDF using pdfplumber
    2. CHUNK - Split text into 512-token chunks
    3. EMBED - Generate 1536-dim embeddings via OpenRouter
    4. STORE - Store vectors in Milvus
    """

    STAGES = list(ProcessingStage)

    def __init__(
        self,
        chunker=None,
        embedder=None,
        vector_store=None,
    ):
        self.chunker = chunker or document_chunker
        self.embedder = embedder or embedding_service
        self.vector_store = vector_store or milvus_client

    async def process_pdf(
        self,
        file_content: bytes,
        filename: str,
        category: str = "document",
        title: Optional[str] = None,
        on_progress: Optional[ProgressCallback] = None,
    ) -> ProcessingResult:
        """
        Process PDF through 4-stage pipeline

        Args:
            file_content: PDF file bytes
            filename: Original filename
            category: Document category for filtering
            title: Document title (defaults to filename)
            on_progress: Callback for progress updates

        Returns:
            ProcessingResult with stats
        """
        start_time = time.time()
        title = title or filename.replace(".pdf", "").replace("_", " ")

        result = ProcessingResult(
            success=False,
            filename=filename,
        )

        def emit_progress(stage: ProcessingStage, percent: int, message: str, message_th: str, stats: Dict = None):
            if on_progress:
                on_progress(ProcessingProgress(
                    stage=stage,
                    percent=percent,
                    message=message,
                    message_th=message_th,
                    stats=stats or {},
                ))

        try:
            # ========== Stage 1: EXTRACT ==========
            emit_progress(
                ProcessingStage.EXTRACT, 0,
                "Extracting text from PDF...",
                "กำลังแยกข้อความจาก PDF...",
            )

            text, page_count = await self._extract_text(file_content)
            result.pages_extracted = page_count

            if not text.strip():
                raise ValueError("No text extracted from PDF")

            emit_progress(
                ProcessingStage.EXTRACT, 100,
                f"Extracted {page_count} pages",
                f"แยกข้อความจาก {page_count} หน้า สำเร็จ",
                {"pages": page_count, "text_length": len(text)},
            )

            # ========== Stage 2: CHUNK ==========
            emit_progress(
                ProcessingStage.CHUNK, 0,
                "Splitting into chunks...",
                "กำลังแบ่งเอกสารเป็นส่วนย่อย...",
            )

            chunks = self.chunker.chunk_document(
                content=text,
                source=filename,
                category=category,
                title=title,
            )
            result.chunks_created = len(chunks)

            emit_progress(
                ProcessingStage.CHUNK, 100,
                f"Created {len(chunks)} chunks",
                f"สร้าง {len(chunks)} ส่วนย่อย สำเร็จ",
                {"chunks": len(chunks)},
            )

            # ========== Stage 3: EMBED ==========
            emit_progress(
                ProcessingStage.EMBED, 0,
                "Generating embeddings...",
                "กำลังสร้าง Embeddings...",
            )

            embeddings = await self._generate_embeddings_with_progress(
                chunks=chunks,
                on_progress=lambda pct: emit_progress(
                    ProcessingStage.EMBED, pct,
                    f"Embedding {pct}%...",
                    f"สร้าง Embeddings {pct}%...",
                    {"progress": pct},
                ),
            )

            emit_progress(
                ProcessingStage.EMBED, 100,
                f"Generated {len(embeddings)} embeddings",
                f"สร้าง {len(embeddings)} Embeddings สำเร็จ",
                {"embeddings": len(embeddings)},
            )

            # ========== Stage 4: STORE ==========
            emit_progress(
                ProcessingStage.STORE, 0,
                "Storing in vector database...",
                "กำลังบันทึกลงฐานข้อมูล Vector...",
            )

            stored_count = await self._store_vectors(chunks, embeddings)
            result.vectors_stored = stored_count

            emit_progress(
                ProcessingStage.STORE, 100,
                f"Stored {stored_count} vectors",
                f"บันทึก {stored_count} Vectors สำเร็จ",
                {"vectors": stored_count},
            )

            # ========== Complete ==========
            result.success = True
            result.processing_time_ms = int((time.time() - start_time) * 1000)

            logger.info(
                f"PDF processed: {filename} - "
                f"pages={page_count}, chunks={len(chunks)}, vectors={stored_count}, "
                f"time={result.processing_time_ms}ms"
            )

            return result

        except Exception as e:
            logger.error(f"PDF processing failed: {filename} - {e}")
            result.error = str(e)
            result.error_th = f"เกิดข้อผิดพลาด: {str(e)}"
            result.processing_time_ms = int((time.time() - start_time) * 1000)
            return result

    async def _extract_text(self, file_content: bytes) -> tuple[str, int]:
        """
        Extract text from PDF using pdfplumber

        Returns:
            Tuple of (extracted_text, page_count)
        """
        text_parts = []
        page_count = 0

        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            page_count = len(pdf.pages)

            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

        return "\n\n".join(text_parts), page_count

    async def _generate_embeddings_with_progress(
        self,
        chunks: List[DocumentChunk],
        on_progress: Optional[Callable[[int], None]] = None,
        batch_size: int = 10,
    ) -> List[List[float]]:
        """
        Generate embeddings with progress updates

        Processes in batches and reports progress
        """
        contents = [chunk.content for chunk in chunks]
        total = len(contents)
        embeddings = []

        for i in range(0, total, batch_size):
            batch = contents[i:i + batch_size]
            batch_embeddings = await self.embedder.embed_batch(batch)
            embeddings.extend(batch_embeddings)

            if on_progress:
                progress = min(100, int((i + len(batch)) / total * 100))
                on_progress(progress)

        return embeddings

    async def _store_vectors(
        self,
        chunks: List[DocumentChunk],
        embeddings: List[List[float]],
    ) -> int:
        """
        Store vectors in Milvus

        Returns:
            Number of vectors stored
        """
        ids = [chunk.id for chunk in chunks]
        contents = [chunk.content for chunk in chunks]
        sources = [chunk.source for chunk in chunks]
        categories = [chunk.category for chunk in chunks]
        titles = [chunk.title for chunk in chunks]
        chunk_indices = [chunk.chunk_index for chunk in chunks]

        count = await self.vector_store.insert(
            ids=ids,
            embeddings=embeddings,
            contents=contents,
            sources=sources,
            categories=categories,
            titles=titles,
            chunk_indices=chunk_indices,
        )

        return count


# Default processor instance
pdf_processor = PDFProcessor()
