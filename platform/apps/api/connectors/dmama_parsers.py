"""
DMAMA File Parsers
Utilities for parsing CSV/Excel files with Thai encoding support
TOR Reference: Section 4.3
"""

import csv
import io
import logging
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ParseResult:
    """Result of file parsing operation"""
    success: bool
    records: List[Dict[str, Any]]
    errors: List[str]
    warnings: List[str]
    total_rows: int
    valid_rows: int
    skipped_rows: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "total_rows": self.total_rows,
            "valid_rows": self.valid_rows,
            "skipped_rows": self.skipped_rows,
            "error_count": len(self.errors),
            "warning_count": len(self.warnings),
            "errors": self.errors[:10],  # Limit to first 10 errors
            "warnings": self.warnings[:10],
        }


# Column name mappings (Thai -> English)
COLUMN_MAPPINGS = {
    # DMA ID
    "dma_id": "dma_id",
    "รหัส dma": "dma_id",
    "รหัสdma": "dma_id",
    "dma": "dma_id",
    "รหัสพื้นที่": "dma_id",

    # Reading date
    "reading_date": "reading_date",
    "timestamp": "reading_date",
    "date": "reading_date",
    "วันที่": "reading_date",
    "วันที่อ่าน": "reading_date",
    "เวลา": "reading_date",

    # Inflow
    "inflow": "inflow",
    "flow_in": "inflow",
    "ปริมาณน้ำเข้า": "inflow",
    "น้ำเข้า": "inflow",
    "inflow_m3": "inflow",

    # Outflow
    "outflow": "outflow",
    "flow_out": "outflow",
    "ปริมาณน้ำออก": "outflow",
    "น้ำออก": "outflow",
    "outflow_m3": "outflow",

    # Pressure
    "pressure": "pressure",
    "ความดัน": "pressure",
    "แรงดัน": "pressure",
    "pressure_bar": "pressure",

    # Loss (calculated)
    "loss": "loss",
    "น้ำสูญเสีย": "loss",
    "สูญเสีย": "loss",

    # Loss percentage
    "loss_percentage": "loss_percentage",
    "loss_percent": "loss_percentage",
    "เปอร์เซ็นต์สูญเสีย": "loss_percentage",
    "%สูญเสีย": "loss_percentage",
}


def normalize_column_name(name: str) -> str:
    """Normalize column name to standard field name"""
    # Clean the name
    clean = name.lower().strip().replace(" ", "_").replace("-", "_")

    # Check mappings
    if clean in COLUMN_MAPPINGS:
        return COLUMN_MAPPINGS[clean]

    # Try without underscores
    no_underscore = clean.replace("_", "")
    for key, value in COLUMN_MAPPINGS.items():
        if key.replace("_", "") == no_underscore:
            return value

    return clean


def detect_encoding(content: bytes) -> str:
    """Detect file encoding, with priority for Thai encodings"""
    encodings = [
        "utf-8-sig",  # UTF-8 with BOM
        "utf-8",
        "tis-620",    # Thai Industrial Standard
        "windows-874",  # Thai Windows
        "iso-8859-11",  # Thai ISO
        "cp874",      # Thai Code Page
    ]

    for encoding in encodings:
        try:
            content.decode(encoding)
            logger.debug(f"Detected encoding: {encoding}")
            return encoding
        except (UnicodeDecodeError, LookupError):
            continue

    # Fallback to utf-8 with error handling
    return "utf-8"


def detect_delimiter(sample: str) -> str:
    """Detect CSV delimiter from sample"""
    delimiters = [",", ";", "\t", "|"]
    counts = {d: sample.count(d) for d in delimiters}

    # Return delimiter with highest count
    return max(counts, key=counts.get)


def parse_csv_content(
    content: bytes,
    encoding: Optional[str] = None,
    delimiter: Optional[str] = None,
) -> ParseResult:
    """
    Parse CSV content with automatic encoding and delimiter detection

    Args:
        content: Raw file bytes
        encoding: Force specific encoding (optional)
        delimiter: Force specific delimiter (optional)

    Returns:
        ParseResult with records and metadata
    """
    errors = []
    warnings = []
    records = []

    # Detect encoding
    if not encoding:
        encoding = detect_encoding(content)

    try:
        text = content.decode(encoding)
    except UnicodeDecodeError as e:
        # Try with errors='replace'
        text = content.decode(encoding, errors="replace")
        warnings.append(f"Encoding issues detected, some characters may be corrupted")

    # Detect delimiter
    if not delimiter:
        sample = text[:2000]
        delimiter = detect_delimiter(sample)

    # Parse CSV
    reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)

    # Normalize column names
    if reader.fieldnames:
        normalized_fields = [normalize_column_name(f) for f in reader.fieldnames]
        reader.fieldnames = normalized_fields

    total_rows = 0
    valid_rows = 0
    skipped_rows = 0

    for row_num, row in enumerate(reader, start=2):  # Start at 2 (1 is header)
        total_rows += 1

        try:
            # Validate required fields
            record, row_errors = validate_and_transform_row(row, row_num)

            if row_errors:
                errors.extend(row_errors)
                skipped_rows += 1
                continue

            records.append(record)
            valid_rows += 1

        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")
            skipped_rows += 1

    success = valid_rows > 0 and len(errors) < total_rows * 0.5  # Less than 50% errors

    return ParseResult(
        success=success,
        records=records,
        errors=errors,
        warnings=warnings,
        total_rows=total_rows,
        valid_rows=valid_rows,
        skipped_rows=skipped_rows,
    )


def parse_excel_content(
    content: bytes,
    sheet_name: Optional[str] = None,
) -> ParseResult:
    """
    Parse Excel file content

    Args:
        content: Raw file bytes
        sheet_name: Specific sheet to parse (optional, uses first sheet)

    Returns:
        ParseResult with records and metadata
    """
    try:
        import pandas as pd
    except ImportError:
        return ParseResult(
            success=False,
            records=[],
            errors=["pandas is required for Excel parsing"],
            warnings=[],
            total_rows=0,
            valid_rows=0,
            skipped_rows=0,
        )

    errors = []
    warnings = []
    records = []

    try:
        # Read Excel file
        df = pd.read_excel(
            io.BytesIO(content),
            sheet_name=sheet_name or 0,
            engine="openpyxl",
        )

        # Normalize column names
        df.columns = [normalize_column_name(str(col)) for col in df.columns]

        total_rows = len(df)
        valid_rows = 0
        skipped_rows = 0

        for idx, row in df.iterrows():
            row_num = idx + 2  # Account for header

            try:
                row_dict = row.to_dict()
                record, row_errors = validate_and_transform_row(row_dict, row_num)

                if row_errors:
                    errors.extend(row_errors)
                    skipped_rows += 1
                    continue

                records.append(record)
                valid_rows += 1

            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                skipped_rows += 1

        success = valid_rows > 0

        return ParseResult(
            success=success,
            records=records,
            errors=errors,
            warnings=warnings,
            total_rows=total_rows,
            valid_rows=valid_rows,
            skipped_rows=skipped_rows,
        )

    except Exception as e:
        return ParseResult(
            success=False,
            records=[],
            errors=[f"Excel parsing error: {str(e)}"],
            warnings=[],
            total_rows=0,
            valid_rows=0,
            skipped_rows=0,
        )


def validate_and_transform_row(
    row: Dict[str, Any],
    row_num: int
) -> Tuple[Dict[str, Any], List[str]]:
    """
    Validate and transform a single row

    Returns:
        Tuple of (transformed_record, list_of_errors)
    """
    errors = []

    # Check required field: dma_id
    dma_id = row.get("dma_id")
    if not dma_id or (isinstance(dma_id, str) and not dma_id.strip()):
        errors.append(f"Row {row_num}: Missing dma_id")

    # Check flow fields
    inflow = row.get("inflow")
    outflow = row.get("outflow")

    if inflow is None and outflow is None:
        errors.append(f"Row {row_num}: Missing inflow and outflow values")

    if errors:
        return {}, errors

    # Transform values
    record = {
        "dma_id": str(dma_id).strip(),
        "reading_date": parse_datetime(row.get("reading_date")),
        "inflow": to_float(inflow),
        "outflow": to_float(outflow),
        "pressure": to_float(row.get("pressure", 0)),
    }

    # Calculate loss if not provided
    if "loss" in row and row["loss"] is not None:
        record["loss"] = to_float(row["loss"])
    else:
        record["loss"] = record["inflow"] - record["outflow"]

    # Calculate loss percentage if not provided
    if "loss_percentage" in row and row["loss_percentage"] is not None:
        record["loss_percentage"] = to_float(row["loss_percentage"])
    elif record["inflow"] > 0:
        record["loss_percentage"] = (record["loss"] / record["inflow"]) * 100
    else:
        record["loss_percentage"] = 0.0

    # Validate ranges
    if record["loss_percentage"] < 0 or record["loss_percentage"] > 100:
        errors.append(f"Row {row_num}: Invalid loss percentage ({record['loss_percentage']})")

    if record["inflow"] < 0:
        errors.append(f"Row {row_num}: Negative inflow value")

    if record["outflow"] < 0:
        errors.append(f"Row {row_num}: Negative outflow value")

    return record, errors


def parse_datetime(value: Any) -> datetime:
    """Parse datetime from various formats including Thai"""
    if value is None:
        return datetime.now()

    if isinstance(value, datetime):
        return value

    if isinstance(value, (int, float)):
        # Excel serial date
        try:
            import pandas as pd
            return pd.Timestamp(value, unit="D", origin="1899-12-30").to_pydatetime()
        except Exception:
            return datetime.now()

    if isinstance(value, str):
        value = value.strip()

        # Thai date formats
        thai_months = {
            "ม.ค.": "01", "ก.พ.": "02", "มี.ค.": "03", "เม.ย.": "04",
            "พ.ค.": "05", "มิ.ย.": "06", "ก.ค.": "07", "ส.ค.": "08",
            "ก.ย.": "09", "ต.ค.": "10", "พ.ย.": "11", "ธ.ค.": "12",
            "มกราคม": "01", "กุมภาพันธ์": "02", "มีนาคม": "03",
            "เมษายน": "04", "พฤษภาคม": "05", "มิถุนายน": "06",
            "กรกฎาคม": "07", "สิงหาคม": "08", "กันยายน": "09",
            "ตุลาคม": "10", "พฤศจิกายน": "11", "ธันวาคม": "12",
        }

        # Try common formats
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%d",
            "%d/%m/%Y %H:%M:%S",
            "%d/%m/%Y",
            "%d-%m-%Y %H:%M:%S",
            "%d-%m-%Y",
            "%Y%m%d",
        ]

        for fmt in formats:
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue

        # Try Thai format: "15 ม.ค. 2567" or "15 มกราคม 2567"
        for thai, month_num in thai_months.items():
            if thai in value:
                try:
                    # Extract day and year
                    parts = value.replace(thai, month_num).split()
                    if len(parts) >= 3:
                        day = parts[0]
                        month = parts[1]
                        year = parts[2]

                        # Convert Buddhist year
                        if int(year) > 2400:
                            year = str(int(year) - 543)

                        date_str = f"{year}-{month}-{day.zfill(2)}"
                        return datetime.strptime(date_str, "%Y-%m-%d")
                except Exception:
                    continue

    return datetime.now()


def to_float(value: Any) -> float:
    """Convert value to float safely"""
    if value is None:
        return 0.0

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        # Remove common formatting
        value = value.strip()
        value = value.replace(",", "")
        value = value.replace(" ", "")

        # Handle Thai numerals
        thai_numerals = "๐๑๒๓๔๕๖๗๘๙"
        for i, thai_num in enumerate(thai_numerals):
            value = value.replace(thai_num, str(i))

        try:
            return float(value)
        except ValueError:
            return 0.0

    return 0.0


def generate_sample_csv() -> str:
    """Generate sample CSV template"""
    header = "dma_id,reading_date,inflow,outflow,pressure"
    sample_rows = [
        "DMA001,2026-01-15 08:00:00,1500.5,1350.2,2.5",
        "DMA002,2026-01-15 08:00:00,2100.0,1890.0,2.3",
        "DMA003,2026-01-15 08:00:00,800.0,720.0,2.8",
    ]
    return "\n".join([header] + sample_rows)


def generate_sample_csv_thai() -> str:
    """Generate sample CSV template with Thai headers"""
    header = "รหัส DMA,วันที่,ปริมาณน้ำเข้า,ปริมาณน้ำออก,ความดัน"
    sample_rows = [
        "DMA001,15 ม.ค. 2569 08:00,1500.5,1350.2,2.5",
        "DMA002,15 ม.ค. 2569 08:00,2100.0,1890.0,2.3",
    ]
    return "\n".join([header] + sample_rows)
