#!/usr/bin/env python3
"""
WARIS Knowledge Management Validator
====================================
ตรวจสอบความถูกต้องของเอกสาร Knowledge Base สำหรับ RAG Pipeline

Usage:
    python km_validator.py                    # Validate all
    python km_validator.py --path water-loss  # Validate specific folder
    python km_validator.py --fix              # Auto-fix issues
    python km_validator.py --report           # Generate report
"""

import os
import re
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional
import yaml

# Constants
KM_ROOT = Path(__file__).parent.parent.parent.parent.parent / "docs" / "km"
REQUIRED_FRONTMATTER = ["title", "category", "keywords", "updated"]
VALID_CATEGORIES = [
    "water-loss",
    "dma-management",
    "pwa-operations",
    "standards",
    "glossary",
    "scenarios",
    "index",
]
MIN_CONTENT_LENGTH = 500  # Minimum characters for content
MAX_HEADING_DEPTH = 4  # Maximum heading level (####)


@dataclass
class ValidationIssue:
    """Single validation issue"""
    file_path: str
    issue_type: str  # error, warning, info
    message: str
    line_number: Optional[int] = None
    suggestion: Optional[str] = None
    auto_fixable: bool = False


@dataclass
class ValidationResult:
    """Validation result for a single file"""
    file_path: str
    is_valid: bool
    issues: list[ValidationIssue] = field(default_factory=list)
    stats: dict = field(default_factory=dict)


@dataclass
class KMStats:
    """Statistics for KM documents"""
    total_files: int = 0
    valid_files: int = 0
    total_words: int = 0
    total_faq_questions: int = 0
    categories: dict = field(default_factory=dict)
    issues_by_type: dict = field(default_factory=dict)


class KMValidator:
    """Knowledge Management Document Validator"""

    def __init__(self, km_root: Path = KM_ROOT):
        self.km_root = km_root
        self.results: list[ValidationResult] = []
        self.stats = KMStats()

    def validate_all(self, path: Optional[str] = None) -> list[ValidationResult]:
        """Validate all KM documents"""
        search_path = self.km_root / path if path else self.km_root

        if not search_path.exists():
            print(f"❌ Path not found: {search_path}")
            return []

        md_files = list(search_path.rglob("*.md"))
        print(f"\n📚 Validating {len(md_files)} files in {search_path}\n")

        for md_file in md_files:
            result = self.validate_file(md_file)
            self.results.append(result)
            self._update_stats(result)

        return self.results

    def validate_file(self, file_path: Path) -> ValidationResult:
        """Validate a single markdown file"""
        result = ValidationResult(
            file_path=str(file_path.relative_to(self.km_root)),
            is_valid=True
        )

        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception as e:
            result.issues.append(ValidationIssue(
                file_path=result.file_path,
                issue_type="error",
                message=f"Cannot read file: {e}"
            ))
            result.is_valid = False
            return result

        # Run all validations
        self._validate_frontmatter(content, result)
        self._validate_structure(content, result)
        self._validate_content_quality(content, result)
        self._validate_links(content, result, file_path)
        self._validate_faq_section(content, result)
        self._validate_thai_content(content, result)

        # Calculate stats
        result.stats = self._calculate_file_stats(content)

        # Determine overall validity
        error_count = sum(1 for i in result.issues if i.issue_type == "error")
        result.is_valid = error_count == 0

        return result

    def _validate_frontmatter(self, content: str, result: ValidationResult):
        """Validate YAML frontmatter"""
        # Check if frontmatter exists
        if not content.startswith("---"):
            result.issues.append(ValidationIssue(
                file_path=result.file_path,
                issue_type="error",
                message="Missing YAML frontmatter",
                line_number=1,
                suggestion="Add frontmatter: ---\ntitle: ...\ncategory: ...\nkeywords: [...]\nupdated: YYYY-MM-DD\n---",
                auto_fixable=False
            ))
            return

        # Extract frontmatter
        try:
            fm_match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
            if not fm_match:
                result.issues.append(ValidationIssue(
                    file_path=result.file_path,
                    issue_type="error",
                    message="Invalid frontmatter format",
                    line_number=1
                ))
                return

            fm_content = fm_match.group(1)
            frontmatter = yaml.safe_load(fm_content)

        except yaml.YAMLError as e:
            result.issues.append(ValidationIssue(
                file_path=result.file_path,
                issue_type="error",
                message=f"Invalid YAML in frontmatter: {e}",
                line_number=1
            ))
            return

        # Check required fields
        for field in REQUIRED_FRONTMATTER:
            if field not in frontmatter:
                result.issues.append(ValidationIssue(
                    file_path=result.file_path,
                    issue_type="error",
                    message=f"Missing required frontmatter field: {field}",
                    suggestion=f"Add '{field}' to frontmatter"
                ))

        # Validate category
        if "category" in frontmatter:
            if frontmatter["category"] not in VALID_CATEGORIES:
                result.issues.append(ValidationIssue(
                    file_path=result.file_path,
                    issue_type="warning",
                    message=f"Unknown category: {frontmatter['category']}",
                    suggestion=f"Valid categories: {', '.join(VALID_CATEGORIES)}"
                ))

        # Validate keywords
        if "keywords" in frontmatter:
            keywords = frontmatter["keywords"]
            if not isinstance(keywords, list):
                result.issues.append(ValidationIssue(
                    file_path=result.file_path,
                    issue_type="error",
                    message="Keywords must be a list",
                    suggestion="Use format: keywords: [keyword1, keyword2, ...]"
                ))
            elif len(keywords) < 3:
                result.issues.append(ValidationIssue(
                    file_path=result.file_path,
                    issue_type="warning",
                    message=f"Only {len(keywords)} keywords. Consider adding more for better RAG retrieval",
                    suggestion="Add at least 3-5 relevant keywords including Thai and English terms"
                ))

        # Validate updated date
        if "updated" in frontmatter:
            try:
                date_str = str(frontmatter["updated"])
                # Support both Buddhist Era (2567) and CE (2024)
                if len(date_str) == 10:  # YYYY-MM-DD format
                    pass  # Valid format
                else:
                    result.issues.append(ValidationIssue(
                        file_path=result.file_path,
                        issue_type="warning",
                        message=f"Date format should be YYYY-MM-DD, got: {date_str}"
                    ))
            except Exception:
                pass

    def _validate_structure(self, content: str, result: ValidationResult):
        """Validate document structure"""
        lines = content.split("\n")

        # Check for main heading
        has_h1 = False
        heading_levels = []

        for i, line in enumerate(lines, 1):
            if line.startswith("# ") and not line.startswith("##"):
                has_h1 = True

            # Track heading levels
            if line.startswith("#"):
                level = len(line.split(" ")[0])
                heading_levels.append((i, level))

        if not has_h1:
            result.issues.append(ValidationIssue(
                file_path=result.file_path,
                issue_type="warning",
                message="No main heading (# ) found",
                suggestion="Add a main heading after frontmatter"
            ))

        # Check heading hierarchy
        for i, (line_num, level) in enumerate(heading_levels):
            if i > 0:
                prev_level = heading_levels[i-1][1]
                if level > prev_level + 1:
                    result.issues.append(ValidationIssue(
                        file_path=result.file_path,
                        issue_type="warning",
                        message=f"Heading level jumps from {prev_level} to {level}",
                        line_number=line_num,
                        suggestion="Don't skip heading levels (e.g., ## to ####)"
                    ))

    def _validate_content_quality(self, content: str, result: ValidationResult):
        """Validate content quality for RAG"""
        # Remove frontmatter for content analysis
        content_body = re.sub(r"^---\n.*?\n---\n", "", content, flags=re.DOTALL)

        # Check minimum length
        if len(content_body) < MIN_CONTENT_LENGTH:
            result.issues.append(ValidationIssue(
                file_path=result.file_path,
                issue_type="warning",
                message=f"Content too short ({len(content_body)} chars). Minimum: {MIN_CONTENT_LENGTH}",
                suggestion="Add more detailed content for better RAG responses"
            ))

        # Check for tables (good for structured data)
        table_count = len(re.findall(r"^\|.*\|$", content_body, re.MULTILINE))
        if table_count == 0:
            result.issues.append(ValidationIssue(
                file_path=result.file_path,
                issue_type="info",
                message="No tables found. Consider adding tables for structured data",
                suggestion="Tables help RAG retrieve specific facts"
            ))

        # Check for code blocks
        code_blocks = re.findall(r"```[\s\S]*?```", content_body)

        # Check for empty sections
        empty_sections = re.findall(r"##.*?\n\n##", content_body)
        if empty_sections:
            result.issues.append(ValidationIssue(
                file_path=result.file_path,
                issue_type="warning",
                message="Found empty sections",
                suggestion="Add content to all sections or remove empty ones"
            ))

    def _validate_links(self, content: str, result: ValidationResult, file_path: Path):
        """Validate internal links"""
        # Find markdown links
        links = re.findall(r"\[([^\]]+)\]\(([^)]+)\)", content)

        for link_text, link_url in links:
            # Skip external links
            if link_url.startswith("http"):
                continue

            # Check internal links
            if link_url.endswith(".md"):
                # Resolve relative path
                if link_url.startswith("../"):
                    target = file_path.parent / link_url
                else:
                    target = file_path.parent / link_url

                target = target.resolve()

                if not target.exists():
                    result.issues.append(ValidationIssue(
                        file_path=result.file_path,
                        issue_type="error",
                        message=f"Broken link: {link_url}",
                        suggestion=f"Fix or remove link to: {link_url}"
                    ))

    def _validate_faq_section(self, content: str, result: ValidationResult):
        """Validate FAQ section"""
        # Check if FAQ section exists
        has_faq = "## คำถามที่พบบ่อย" in content or "## FAQ" in content

        if not has_faq:
            result.issues.append(ValidationIssue(
                file_path=result.file_path,
                issue_type="warning",
                message="No FAQ section found",
                suggestion="Add '## คำถามที่พบบ่อย (FAQ)' section for better RAG Q&A matching"
            ))
            return

        # Count Q&A pairs
        qa_count = len(re.findall(r"###\s*Q:", content))

        if qa_count < 3:
            result.issues.append(ValidationIssue(
                file_path=result.file_path,
                issue_type="info",
                message=f"Only {qa_count} FAQ questions. Consider adding more",
                suggestion="Add at least 3-5 FAQ questions for comprehensive coverage"
            ))

    def _validate_thai_content(self, content: str, result: ValidationResult):
        """Validate Thai language content"""
        # Remove frontmatter
        content_body = re.sub(r"^---\n.*?\n---\n", "", content, flags=re.DOTALL)

        # Count Thai characters
        thai_chars = len(re.findall(r"[\u0E00-\u0E7F]", content_body))
        total_chars = len(content_body)

        if total_chars > 0:
            thai_ratio = thai_chars / total_chars

            if thai_ratio < 0.2:
                result.issues.append(ValidationIssue(
                    file_path=result.file_path,
                    issue_type="warning",
                    message=f"Low Thai content ratio ({thai_ratio:.1%}). Most users query in Thai",
                    suggestion="Add more Thai explanations for better Thai query matching"
                ))

    def _calculate_file_stats(self, content: str) -> dict:
        """Calculate statistics for a file"""
        content_body = re.sub(r"^---\n.*?\n---\n", "", content, flags=re.DOTALL)

        return {
            "characters": len(content_body),
            "words": len(content_body.split()),
            "lines": len(content_body.split("\n")),
            "tables": len(re.findall(r"^\|.*\|$", content_body, re.MULTILINE)) // 2,
            "faq_questions": len(re.findall(r"###\s*Q:", content)),
            "headings": len(re.findall(r"^#{1,4}\s", content_body, re.MULTILINE)),
            "links": len(re.findall(r"\[([^\]]+)\]\(([^)]+)\)", content_body)),
        }

    def _update_stats(self, result: ValidationResult):
        """Update global statistics"""
        self.stats.total_files += 1
        if result.is_valid:
            self.stats.valid_files += 1

        self.stats.total_words += result.stats.get("words", 0)
        self.stats.total_faq_questions += result.stats.get("faq_questions", 0)

        # Count issues by type
        for issue in result.issues:
            self.stats.issues_by_type[issue.issue_type] = \
                self.stats.issues_by_type.get(issue.issue_type, 0) + 1

    def print_results(self):
        """Print validation results"""
        print("=" * 60)
        print("📋 VALIDATION RESULTS")
        print("=" * 60)

        for result in self.results:
            status = "✅" if result.is_valid else "❌"
            print(f"\n{status} {result.file_path}")

            if result.issues:
                for issue in result.issues:
                    icon = {"error": "🔴", "warning": "🟡", "info": "🔵"}[issue.issue_type]
                    line_info = f" (line {issue.line_number})" if issue.line_number else ""
                    print(f"   {icon} {issue.message}{line_info}")
                    if issue.suggestion:
                        print(f"      💡 {issue.suggestion}")

        # Print summary
        print("\n" + "=" * 60)
        print("📊 SUMMARY")
        print("=" * 60)
        print(f"Total files: {self.stats.total_files}")
        print(f"Valid files: {self.stats.valid_files} ({self.stats.valid_files/max(1,self.stats.total_files)*100:.0f}%)")
        print(f"Total words: {self.stats.total_words:,}")
        print(f"Total FAQ questions: {self.stats.total_faq_questions}")
        print(f"\nIssues by type:")
        for issue_type, count in self.stats.issues_by_type.items():
            icon = {"error": "🔴", "warning": "🟡", "info": "🔵"}[issue_type]
            print(f"  {icon} {issue_type}: {count}")

    def generate_report(self, output_path: Optional[Path] = None) -> dict:
        """Generate JSON report"""
        report = {
            "generated_at": datetime.now().isoformat(),
            "km_root": str(self.km_root),
            "summary": {
                "total_files": self.stats.total_files,
                "valid_files": self.stats.valid_files,
                "total_words": self.stats.total_words,
                "total_faq_questions": self.stats.total_faq_questions,
                "issues_by_type": self.stats.issues_by_type,
            },
            "files": []
        }

        for result in self.results:
            file_report = {
                "path": result.file_path,
                "is_valid": result.is_valid,
                "stats": result.stats,
                "issues": [
                    {
                        "type": i.issue_type,
                        "message": i.message,
                        "line": i.line_number,
                        "suggestion": i.suggestion,
                        "auto_fixable": i.auto_fixable,
                    }
                    for i in result.issues
                ]
            }
            report["files"].append(file_report)

        if output_path:
            output_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))
            print(f"\n📄 Report saved to: {output_path}")

        return report


def main():
    parser = argparse.ArgumentParser(description="WARIS KM Validator")
    parser.add_argument("--path", help="Specific folder to validate")
    parser.add_argument("--report", action="store_true", help="Generate JSON report")
    parser.add_argument("--output", help="Report output path")
    parser.add_argument("--quiet", "-q", action="store_true", help="Quiet mode")

    args = parser.parse_args()

    validator = KMValidator()
    validator.validate_all(args.path)

    if not args.quiet:
        validator.print_results()

    if args.report:
        output = Path(args.output) if args.output else KM_ROOT / "validation_report.json"
        validator.generate_report(output)

    # Exit with error if any files are invalid
    if validator.stats.valid_files < validator.stats.total_files:
        sys.exit(1)


if __name__ == "__main__":
    main()
