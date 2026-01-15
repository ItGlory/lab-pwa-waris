"""
ETL API Router
Provides endpoints for data import and sync operations
TOR Reference: Section 4.3
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from services.etl_scheduler import get_scheduler

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
    is_running: bool
    current_job: Optional[Dict[str, Any]]
    pending_jobs: int
    last_sync: Optional[str]
    last_sync_th: Optional[str]
    records_processed: int
    next_scheduled_sync: Optional[str]
    errors: int


class ETLResultResponse(BaseModel):
    success: bool
    message: str
    message_th: str
    job_id: Optional[str]
    stats: Dict[str, Any]
    timestamp: str


class JobResponse(BaseModel):
    id: str
    job_type: str
    status: str
    source_type: str
    created_at: str
    started_at: Optional[str]
    completed_at: Optional[str]
    records_processed: int
    records_failed: int
    error_message: Optional[str]


@router.get("/status", response_model=ETLStatusResponse)
async def get_etl_status():
    """Get current ETL pipeline status"""
    scheduler = get_scheduler()
    status = scheduler.get_status()
    history = scheduler.get_history(limit=1)

    # Get last sync info from history
    last_sync = None
    total_records = 0
    total_errors = 0

    if history:
        last_job = history[0]
        last_sync = last_job.get("completed_at") or last_job.get("started_at")
        total_records = last_job.get("records_processed", 0)
        total_errors = last_job.get("records_failed", 0)

    return ETLStatusResponse(
        status="running" if status["current_job"] else "idle",
        is_running=status["is_running"],
        current_job=status["current_job"],
        pending_jobs=status["pending_jobs"],
        last_sync=last_sync,
        last_sync_th=format_thai_datetime(last_sync) if last_sync else None,
        records_processed=total_records,
        next_scheduled_sync=status["next_scheduled_sync"],
        errors=total_errors,
    )


@router.post("/upload", response_model=ETLResultResponse)
async def upload_data_file(
    file: UploadFile = File(...),
):
    """
    Upload CSV/Excel file for data import

    Supported formats:
    - CSV (.csv)
    - Excel (.xlsx, .xls)

    Required columns:
    - dma_id: DMA identifier
    - inflow or flow_in: Water inflow (m3)
    - outflow or flow_out: Water outflow (m3)
    - reading_date or timestamp: Reading timestamp

    Optional columns:
    - pressure: Pressure reading (bar)

    Thai column names are supported:
    - รหัส DMA, ปริมาณน้ำเข้า, ปริมาณน้ำออก, วันที่, ความดัน
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

        # Validate file size (max 50MB)
        max_size = 50 * 1024 * 1024
        if len(content) > max_size:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"File too large. Maximum size is 50MB.",
                    "message_th": "ไฟล์มีขนาดใหญ่เกินไป ขนาดสูงสุดคือ 50MB"
                }
            )

        # Queue file import job
        scheduler = get_scheduler()
        job = await scheduler.queue_file_import(
            filename=file.filename,
            file_content=content,
            file_type=file_ext.lstrip("."),
        )

        logger.info(f"File upload queued: {file.filename}, job_id={job.id}")

        return ETLResultResponse(
            success=True,
            message=f"File queued for processing: {file.filename}",
            message_th=f"ไฟล์เข้าคิวรอประมวลผล: {file.filename}",
            job_id=job.id,
            stats={
                "filename": file.filename,
                "size_bytes": len(content),
                "file_type": file_ext,
                "status": "queued",
            },
            timestamp=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"File processing error: {str(e)}",
                "message_th": "เกิดข้อผิดพลาดในการประมวลผลไฟล์"
            }
        )


@router.post("/sync", response_model=ETLResultResponse)
async def trigger_sync(request: SyncRequest):
    """
    Manually trigger data sync from DMAMA

    source_type options:
    - "api": Sync from DMAMA REST API
    - "database": Sync from DMAMA database
    """
    valid_sources = ["api", "database"]

    if request.source_type not in valid_sources:
        raise HTTPException(
            status_code=400,
            detail={
                "message": f"Invalid source type: {request.source_type}",
                "message_th": f"ประเภทแหล่งข้อมูลไม่ถูกต้อง: {request.source_type}",
                "valid_sources": valid_sources
            }
        )

    try:
        scheduler = get_scheduler()
        job = await scheduler.queue_manual_sync(
            source_type=request.source_type,
            source_url=request.source_url,
            start_date=request.start_date,
            end_date=request.end_date,
        )

        logger.info(f"Sync triggered: source={request.source_type}, job_id={job.id}")

        return ETLResultResponse(
            success=True,
            message=f"Sync job queued from {request.source_type}",
            message_th=f"เริ่มการซิงค์จาก {request.source_type}",
            job_id=job.id,
            stats={
                "source_type": request.source_type,
                "source_url": request.source_url,
                "start_date": request.start_date,
                "end_date": request.end_date,
                "status": "queued",
            },
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"Sync trigger error: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Sync error: {str(e)}",
                "message_th": "เกิดข้อผิดพลาดในการซิงค์ข้อมูล"
            }
        )


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get status of a specific ETL job"""
    scheduler = get_scheduler()
    job = scheduler.get_job(job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"Job not found: {job_id}",
                "message_th": f"ไม่พบงาน: {job_id}"
            }
        )

    return {
        "success": True,
        "data": job.to_dict(),
        "message": "Success",
        "message_th": "สำเร็จ"
    }


@router.get("/history")
async def get_sync_history(limit: int = 10):
    """Get ETL sync history"""
    scheduler = get_scheduler()
    history = scheduler.get_history(limit=limit)

    return {
        "success": True,
        "data": history,
        "total": len(history),
        "message": "Success",
        "message_th": "สำเร็จ"
    }


@router.post("/scheduler/start")
async def start_scheduler():
    """Start the ETL scheduler (admin only)"""
    scheduler = get_scheduler()

    if scheduler.is_running:
        return {
            "success": True,
            "message": "Scheduler already running",
            "message_th": "ตัวกำหนดเวลากำลังทำงานอยู่แล้ว"
        }

    await scheduler.start()

    return {
        "success": True,
        "message": "Scheduler started",
        "message_th": "เริ่มตัวกำหนดเวลาแล้ว"
    }


@router.post("/scheduler/stop")
async def stop_scheduler():
    """Stop the ETL scheduler (admin only)"""
    scheduler = get_scheduler()

    if not scheduler.is_running:
        return {
            "success": True,
            "message": "Scheduler not running",
            "message_th": "ตัวกำหนดเวลาไม่ได้ทำงาน"
        }

    await scheduler.stop()

    return {
        "success": True,
        "message": "Scheduler stopped",
        "message_th": "หยุดตัวกำหนดเวลาแล้ว"
    }


@router.get("/template/csv")
async def get_csv_template():
    """Get sample CSV template for data import"""
    from connectors.dmama_parsers import generate_sample_csv, generate_sample_csv_thai

    return {
        "success": True,
        "templates": {
            "english": generate_sample_csv(),
            "thai": generate_sample_csv_thai(),
        },
        "message": "CSV templates",
        "message_th": "แม่แบบ CSV"
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
