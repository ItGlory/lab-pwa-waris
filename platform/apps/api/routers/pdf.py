"""
PDF Upload API Router
Provides endpoints for PDF document upload with 4-stage progress streaming
POC Requirement 2.1
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.pdf_processor import pdf_processor, ProcessingProgress, ProcessingResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/pdf", tags=["PDF"])


# Response Models
class PDFUploadResponse(BaseModel):
    success: bool
    message: str
    message_th: str
    filename: str
    stats: dict


class PDFStatusResponse(BaseModel):
    available: bool
    message: str
    message_th: str
    supported_extensions: list[str]
    max_size_mb: int


# Constants
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = [".pdf"]


@router.get("/status", response_model=PDFStatusResponse)
async def get_pdf_status():
    """Check PDF processing capability status"""
    return PDFStatusResponse(
        available=True,
        message="PDF processing is available",
        message_th="ระบบพร้อมประมวลผล PDF",
        supported_extensions=ALLOWED_EXTENSIONS,
        max_size_mb=50,
    )


@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    category: str = Form(default="document"),
    title: Optional[str] = Form(default=None),
):
    """
    Upload and process PDF document (non-streaming)

    - Extracts text from PDF
    - Chunks into 512-token segments
    - Generates embeddings
    - Stores in vector database

    Returns final stats without progress updates.
    """
    # Validate file extension
    filename = file.filename or "document.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Only PDF files are supported",
                "message_th": "รองรับเฉพาะไฟล์ PDF เท่านั้น",
            }
        )

    try:
        # Read file content
        content = await file.read()

        # Validate file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB",
                    "message_th": f"ไฟล์ใหญ่เกินไป ขนาดสูงสุดคือ {MAX_FILE_SIZE // (1024*1024)}MB",
                }
            )

        # Process PDF
        result = await pdf_processor.process_pdf(
            file_content=content,
            filename=filename,
            category=category,
            title=title,
        )

        if not result.success:
            raise HTTPException(
                status_code=500,
                detail={
                    "message": result.error or "Processing failed",
                    "message_th": result.error_th or "การประมวลผลล้มเหลว",
                }
            )

        return PDFUploadResponse(
            success=True,
            message="PDF processed successfully",
            message_th="ประมวลผล PDF สำเร็จ",
            filename=filename,
            stats={
                "pages_extracted": result.pages_extracted,
                "chunks_created": result.chunks_created,
                "vectors_stored": result.vectors_stored,
                "processing_time_ms": result.processing_time_ms,
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF upload error: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Processing error: {str(e)}",
                "message_th": "เกิดข้อผิดพลาดในการประมวลผล",
            }
        )


@router.post("/upload/stream")
async def upload_pdf_stream(
    file: UploadFile = File(...),
    category: str = Form(default="document"),
    title: Optional[str] = Form(default=None),
):
    """
    Upload and process PDF with SSE progress streaming

    Returns Server-Sent Events (SSE) with progress updates:
    - type: "progress" - Stage progress update
    - type: "complete" - Processing complete with final stats
    - type: "error" - Error occurred

    Event format:
    ```
    data: {"type": "progress", "stage": "extract", "percent": 50, ...}
    data: {"type": "complete", "success": true, "stats": {...}}
    data: {"type": "error", "message": "..."}
    ```
    """
    # Validate file extension
    filename = file.filename or "document.pdf"
    if not filename.lower().endswith(".pdf"):
        async def error_stream():
            yield f"data: {json.dumps({'type': 'error', 'message': 'Only PDF files are supported', 'message_th': 'รองรับเฉพาะไฟล์ PDF เท่านั้น'})}\n\n"

        return StreamingResponse(
            error_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    try:
        # Read file content
        content = await file.read()

        # Validate file size
        if len(content) > MAX_FILE_SIZE:
            async def error_stream():
                yield f"data: {json.dumps({'type': 'error', 'message': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB', 'message_th': f'ไฟล์ใหญ่เกินไป ขนาดสูงสุดคือ {MAX_FILE_SIZE // (1024*1024)}MB'})}\n\n"

            return StreamingResponse(
                error_stream(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                }
            )

        # Create SSE generator
        async def progress_stream():
            progress_events = []

            def on_progress(progress: ProcessingProgress):
                event = {
                    "type": "progress",
                    "stage": progress.stage.value,
                    "percent": progress.percent,
                    "message": progress.message,
                    "message_th": progress.message_th,
                    "stats": progress.stats,
                    "timestamp": datetime.now().isoformat(),
                }
                progress_events.append(event)

            # Start processing in background task
            process_task = asyncio.create_task(
                pdf_processor.process_pdf(
                    file_content=content,
                    filename=filename,
                    category=category,
                    title=title,
                    on_progress=on_progress,
                )
            )

            # Stream progress events as they arrive
            last_sent = 0
            while not process_task.done():
                # Yield any new progress events
                while last_sent < len(progress_events):
                    event = progress_events[last_sent]
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                    last_sent += 1

                await asyncio.sleep(0.1)  # Small delay to prevent busy waiting

            # Get final result
            result: ProcessingResult = await process_task

            # Send any remaining progress events
            while last_sent < len(progress_events):
                event = progress_events[last_sent]
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                last_sent += 1

            # Send completion event
            if result.success:
                complete_event = {
                    "type": "complete",
                    "success": True,
                    "filename": result.filename,
                    "stats": {
                        "pages_extracted": result.pages_extracted,
                        "chunks_created": result.chunks_created,
                        "vectors_stored": result.vectors_stored,
                        "processing_time_ms": result.processing_time_ms,
                    },
                    "message": "PDF processed successfully",
                    "message_th": "ประมวลผล PDF สำเร็จ",
                    "timestamp": datetime.now().isoformat(),
                }
            else:
                complete_event = {
                    "type": "error",
                    "success": False,
                    "filename": result.filename,
                    "message": result.error or "Processing failed",
                    "message_th": result.error_th or "การประมวลผลล้มเหลว",
                    "timestamp": datetime.now().isoformat(),
                }

            yield f"data: {json.dumps(complete_event, ensure_ascii=False)}\n\n"

        return StreamingResponse(
            progress_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )

    except Exception as e:
        logger.error(f"PDF stream upload error: {e}")

        async def error_stream():
            yield f"data: {json.dumps({'type': 'error', 'message': str(e), 'message_th': 'เกิดข้อผิดพลาดในการประมวลผล'})}\n\n"

        return StreamingResponse(
            error_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
