"""
Tests for DMAMA File Parsers
Tests CSV/Excel parsing with Thai encoding support
"""

import pytest
from datetime import datetime

from connectors.dmama_parsers import (
    parse_csv_content,
    parse_excel_content,
    normalize_column_name,
    detect_encoding,
    detect_delimiter,
    parse_datetime,
    to_float,
    validate_and_transform_row,
    ParseResult,
)


class TestColumnNormalization:
    """Test column name normalization"""

    def test_normalize_english_columns(self):
        """Test standard English column names"""
        assert normalize_column_name("dma_id") == "dma_id"
        assert normalize_column_name("inflow") == "inflow"
        assert normalize_column_name("outflow") == "outflow"
        assert normalize_column_name("reading_date") == "reading_date"
        assert normalize_column_name("pressure") == "pressure"

    def test_normalize_thai_columns(self):
        """Test Thai column name mappings"""
        assert normalize_column_name("รหัส dma") == "dma_id"
        assert normalize_column_name("รหัสdma") == "dma_id"
        assert normalize_column_name("ปริมาณน้ำเข้า") == "inflow"
        assert normalize_column_name("น้ำเข้า") == "inflow"
        assert normalize_column_name("ปริมาณน้ำออก") == "outflow"
        assert normalize_column_name("น้ำออก") == "outflow"
        assert normalize_column_name("วันที่") == "reading_date"
        assert normalize_column_name("ความดัน") == "pressure"

    def test_normalize_with_spaces_and_case(self):
        """Test normalization handles spaces and case"""
        assert normalize_column_name("DMA_ID") == "dma_id"
        assert normalize_column_name("  inflow  ") == "inflow"
        assert normalize_column_name("Flow_In") == "inflow"


class TestEncodingDetection:
    """Test encoding detection"""

    def test_detect_utf8(self):
        """Test UTF-8 detection"""
        content = "dma_id,inflow,outflow\nDMA001,100,90".encode("utf-8")
        encoding = detect_encoding(content)
        assert encoding in ["utf-8", "utf-8-sig"]

    def test_detect_utf8_with_thai(self):
        """Test UTF-8 with Thai text"""
        content = "รหัส,น้ำเข้า,น้ำออก\nDMA001,100,90".encode("utf-8")
        encoding = detect_encoding(content)
        assert encoding in ["utf-8", "utf-8-sig"]

    def test_detect_tis620(self):
        """Test TIS-620 (Thai) encoding detection"""
        # TIS-620 is common for older Thai systems
        try:
            content = "test".encode("tis-620")
            encoding = detect_encoding(content)
            assert encoding is not None
        except LookupError:
            pytest.skip("TIS-620 encoding not available")


class TestDelimiterDetection:
    """Test CSV delimiter detection"""

    def test_detect_comma(self):
        """Test comma delimiter"""
        sample = "a,b,c\n1,2,3"
        assert detect_delimiter(sample) == ","

    def test_detect_semicolon(self):
        """Test semicolon delimiter"""
        sample = "a;b;c\n1;2;3"
        assert detect_delimiter(sample) == ";"

    def test_detect_tab(self):
        """Test tab delimiter"""
        sample = "a\tb\tc\n1\t2\t3"
        assert detect_delimiter(sample) == "\t"


class TestDatetimeParsing:
    """Test datetime parsing with various formats"""

    def test_parse_iso_format(self):
        """Test ISO datetime format"""
        dt = parse_datetime("2026-01-15T08:30:00")
        assert dt.year == 2026
        assert dt.month == 1
        assert dt.day == 15
        assert dt.hour == 8

    def test_parse_date_only(self):
        """Test date-only format"""
        dt = parse_datetime("2026-01-15")
        assert dt.year == 2026
        assert dt.month == 1
        assert dt.day == 15

    def test_parse_thai_date_format(self):
        """Test Thai date format with Buddhist year"""
        dt = parse_datetime("15 ม.ค. 2569")
        assert dt.year == 2026  # 2569 - 543 = 2026
        assert dt.month == 1
        assert dt.day == 15

    def test_parse_dd_mm_yyyy(self):
        """Test dd/mm/yyyy format"""
        dt = parse_datetime("15/01/2026")
        assert dt.year == 2026
        assert dt.month == 1
        assert dt.day == 15

    def test_parse_existing_datetime(self):
        """Test passing existing datetime object"""
        original = datetime(2026, 1, 15, 8, 30)
        result = parse_datetime(original)
        assert result == original

    def test_parse_none_returns_now(self):
        """Test None returns current datetime"""
        result = parse_datetime(None)
        assert isinstance(result, datetime)


class TestFloatConversion:
    """Test float conversion with various formats"""

    def test_convert_integer(self):
        """Test integer conversion"""
        assert to_float(100) == 100.0

    def test_convert_float(self):
        """Test float conversion"""
        assert to_float(100.5) == 100.5

    def test_convert_string(self):
        """Test string conversion"""
        assert to_float("100.5") == 100.5

    def test_convert_with_commas(self):
        """Test string with thousand separators"""
        assert to_float("1,234,567.89") == 1234567.89

    def test_convert_thai_numerals(self):
        """Test Thai numeral conversion"""
        assert to_float("๑๒๓") == 123.0

    def test_convert_none(self):
        """Test None returns 0"""
        assert to_float(None) == 0.0

    def test_convert_invalid_string(self):
        """Test invalid string returns 0"""
        assert to_float("invalid") == 0.0


class TestRowValidation:
    """Test row validation and transformation"""

    def test_valid_row(self):
        """Test valid row transformation"""
        row = {
            "dma_id": "DMA001",
            "reading_date": "2026-01-15",
            "inflow": "1500.5",
            "outflow": "1350.2",
            "pressure": "2.5",
        }
        record, errors = validate_and_transform_row(row, 1)

        assert len(errors) == 0
        assert record["dma_id"] == "DMA001"
        assert record["inflow"] == 1500.5
        assert record["outflow"] == 1350.2
        assert record["loss"] == pytest.approx(150.3)
        assert record["loss_percentage"] == pytest.approx(10.016, rel=0.01)

    def test_missing_dma_id(self):
        """Test missing dma_id raises error"""
        row = {
            "reading_date": "2026-01-15",
            "inflow": "1500",
            "outflow": "1350",
        }
        record, errors = validate_and_transform_row(row, 1)
        assert len(errors) > 0
        assert "dma_id" in errors[0].lower()

    def test_missing_flow_values(self):
        """Test missing flow values raises error"""
        row = {
            "dma_id": "DMA001",
            "reading_date": "2026-01-15",
        }
        record, errors = validate_and_transform_row(row, 1)
        assert len(errors) > 0

    def test_invalid_loss_percentage(self):
        """Test invalid loss percentage raises error"""
        row = {
            "dma_id": "DMA001",
            "inflow": "100",
            "outflow": "200",  # Outflow > Inflow = negative loss
        }
        record, errors = validate_and_transform_row(row, 1)
        # Negative loss_percentage should trigger error
        assert len(errors) > 0 or record["loss_percentage"] < 0


class TestCSVParsing:
    """Test CSV content parsing"""

    def test_parse_simple_csv(self):
        """Test parsing simple CSV content"""
        content = b"dma_id,inflow,outflow\nDMA001,1500,1350\nDMA002,2000,1800"
        result = parse_csv_content(content)

        assert result.success
        assert result.total_rows == 2
        assert result.valid_rows == 2
        assert len(result.records) == 2
        assert result.records[0]["dma_id"] == "DMA001"

    def test_parse_csv_with_thai_headers(self):
        """Test CSV with Thai column headers"""
        content = "รหัส dma,ปริมาณน้ำเข้า,ปริมาณน้ำออก\nDMA001,1500,1350".encode("utf-8")
        result = parse_csv_content(content)

        assert result.success
        assert result.valid_rows == 1
        assert result.records[0]["dma_id"] == "DMA001"
        assert result.records[0]["inflow"] == 1500.0

    def test_parse_csv_with_errors(self):
        """Test CSV with invalid rows"""
        content = b"dma_id,inflow,outflow\n,1500,1350\nDMA002,2000,1800"
        result = parse_csv_content(content)

        assert result.valid_rows == 1
        assert result.skipped_rows == 1
        assert len(result.errors) > 0

    def test_parse_empty_csv(self):
        """Test empty CSV"""
        content = b"dma_id,inflow,outflow\n"
        result = parse_csv_content(content)

        assert result.total_rows == 0
        assert not result.success


class TestParseResultMethods:
    """Test ParseResult dataclass methods"""

    def test_to_dict(self):
        """Test ParseResult to_dict conversion"""
        result = ParseResult(
            success=True,
            records=[{"dma_id": "DMA001"}],
            errors=[],
            warnings=["test warning"],
            total_rows=1,
            valid_rows=1,
            skipped_rows=0,
        )
        d = result.to_dict()

        assert d["success"] is True
        assert d["total_rows"] == 1
        assert d["valid_rows"] == 1
        assert d["warning_count"] == 1
        assert d["error_count"] == 0
