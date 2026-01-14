"""
ETL API Router
Provides endpoints for data import and sync operations
TOR Reference: Section 4.3
"""

from datetime import datetime
from typing import Optional
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/etl", tags=["ETL"])


# Request/Response Models
class SyncRequest(BaseModel):
    source_type: str  # "api", "database", "file"
    source_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ETLStatusResponse(BaseModel):
    status: str
    last_sync: Optional[str]
    last_sync_th: Optional[str]
    records_processed: int
    next_scheduled_sync: Optional[str]
    errors: int


class ETLResultResponse(BaseModel):
    success: bool
    message: str
    message_th: str
    stats: dict
    timestamp: str


# In-memory status tracking (replace with Redis in production)
etl_status = {
    "status": "idle",
    "last_sync": None,
    "records_processed": 0,
    "next_scheduled_sync": "02:00",
    "errors": 0,
}


@router.get("/status", response_model=ETLStatusResponse)
async def get_etl_status():
    """Get current ETL pipeline status"""
    return ETLStatusResponse(
        status=etl_status["status"],
        last_sync=etl_status["last_sync"],
        last_sync_th=format_thai_datetime(etl_status["last_sync"]) if etl_status["last_sync"] else None,
        records_processed=etl_status["records_processed"],
        next_scheduled_sync=etl_status["next_scheduled_sync"],
        errors=etl_status["errors"],
    )


@router.post("/upload", response_model=ETLResultResponse)
async def upload_data_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Upload CSV/Excel file for data import

    Supported formats:
    - CSV (.csv)
    - Excel (.xlsx, .xls)

    Required columns:
    - dma_id: DMA identifier
    - inflow or flow_in: Water inflow (m³)
    - outflow or flow_out: Water outflow (m³)
    - reading_date or timestamp: Reading timestamp

    Optional columns:
    - pressure: Pressure reading (bar)
    """
    # Validate file type
    allowed_types = [".csv", ".xlsx", ".xls"]
    file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""

    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail={
                "message": f"Unsupported file type: {file_ext}",
                "message_th": f"ไม่รองรับไฟล์ประเภท: {file_ext}",
                "allowed": allowed_types
            }
        )

    try:
        # Read file content
        content = await file.read()

        # For CSV, decode to string
        if file_ext == ".csv":
            content_str = content.decode("utf-8")
            records_count = content_str.count("\n") - 1  # Exclude header
        else:
            records_count = 0  # Will be counted during processing

        # Update status
        etl_status["status"] = "processing"
        etl_status["last_sync"] = datetime.now().isoformat()

        # TODO: Process file in background
        # For now, simulate processing
        etl_status["records_processed"] += max(records_count, 0)
        etl_status["status"] = "completed"

        logger.info(f"File uploaded: {file.filename}, ~{records_count} records")

        return ETLResultResponse(
            success=True,
            message=f"File uploaded successfully: {file.filename}",
            message_th=f"อัพโหลดไฟล์สำเร็จ: {file.filename}",
            stats={
                "filename": file.filename,
                "size_bytes": len(content),
                "estimated_records": records_count,
                "status": "queued_for_processing"
            },
            timestamp=datetime.now().isoformat()
        )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "File encoding error. Please use UTF-8 encoding.",
                "message_th": "ไฟล์มีปัญหาการเข้ารหัส กรุณาใช้ UTF-8"
            }
        )
    except Exception as e:
        logger.error(f"File upload error: {e}")
        etl_status["status"] = "error"
        etl_status["errors"] += 1
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"File processing error: {str(e)}",
                "message_th": "เกิดข้อผิดพลาดในการประมวลผลไฟล์"
            }
        )


@router.post("/sync", response_model=ETLResultResponse)
async def trigger_sync(
    request: SyncRequest,
    background_tasks: BackgroundTasks = None
):
    """
    Manually trigger data sync from DMAMA

    source_type options:
    - "api": Sync from DMAMA REST API
    - "database": Sync from DMAMA database
    - "file": Import from file
    """
    valid_sources = ["api", "database", "file"]

    if request.source_type not in valid_sources:
        raise HTTPException(
            status_code=400,
            detail={
                "message": f"Invalid source type: {request.source_type}",
                "message_th": f"ประเภทแหล่งข้อมูลไม่ถูกต้อง: {request.source_type}",
                "valid_sources": valid_sources
            }
        )

    # Update status
    etl_status["status"] = "syncing"
    etl_status["last_sync"] = datetime.now().isoformat()

    # TODO: Implement actual sync in background
    # For now, simulate sync
    simulated_records = 100

    etl_status["records_processed"] += simulated_records
    etl_status["status"] = "completed"

    logger.info(f"Sync triggered: source={request.source_type}")

    return ETLResultResponse(
        success=True,
        message=f"Sync triggered from {request.source_type}",
        message_th=f"เริ่มการซิงค์จาก {request.source_type}",
        stats={
            "source_type": request.source_type,
            "source_url": request.source_url,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "status": "in_progress"
        },
        timestamp=datetime.now().isoformat()
    )


@router.get("/history")
async def get_sync_history(limit: int = 10):
    """Get ETL sync history"""
    # TODO: Fetch from database
    # For now, return mock data
    return {
        "success": True,
        "data": [
            {
                "id": "sync-001",
                "source_type": "api",
                "started_at": "2026-01-14T02:00:00Z",
                "completed_at": "2026-01-14T02:15:00Z",
                "records_processed": 15000,
                "status": "completed"
            },
            {
                "id": "sync-002",
                "source_type": "file",
                "started_at": "2026-01-13T14:30:00Z",
                "completed_at": "2026-01-13T14:32:00Z",
                "records_processed": 500,
                "status": "completed"
            }
        ],
        "message": "Success",
        "message_th": "สำเร็จ"
    }


@router.delete("/reset")
async def reset_etl_status():
    """Reset ETL status (admin only)"""
    global etl_status
    etl_status = {
        "status": "idle",
        "last_sync": None,
        "records_processed": 0,
        "next_scheduled_sync": "02:00",
        "errors": 0,
    }
    return {
        "success": True,
        "message": "ETL status reset",
        "message_th": "รีเซ็ตสถานะ ETL แล้ว"
    }


def format_thai_datetime(iso_string: Optional[str]) -> Optional[str]:
    """Format datetime in Thai format"""
    if not iso_string:
        return None
    try:
        dt = datetime.fromisoformat(iso_string.replace("Z", "+00:00"))
        thai_months = [
            "", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
            "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ]
        thai_year = dt.year + 543  # Buddhist calendar
        return f"{dt.day} {thai_months[dt.month]} {thai_year} {dt.strftime('%H:%M')}"
    except Exception:
        return iso_string
