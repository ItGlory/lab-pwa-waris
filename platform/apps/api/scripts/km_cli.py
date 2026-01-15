#!/usr/bin/env python3
"""
WARIS Knowledge Management CLI Tool
====================================
ครบครันสำหรับจัดการ Knowledge Base

Usage:
    python km_cli.py validate              # ตรวจสอบเอกสาร
    python km_cli.py index                 # Index สำหรับ RAG
    python km_cli.py search "คำค้นหา"      # ค้นหาความรู้
    python km_cli.py stats                 # แสดงสถิติ
    python km_cli.py new water-loss        # สร้างเอกสารใหม่
    python km_cli.py update-dates          # อัปเดตวันที่
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
import json
import re

# Add script directory to path
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

KM_ROOT = SCRIPT_DIR.parent.parent.parent.parent / "docs" / "km"

# ANSI colors
class Colors:
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    RESET = "\033[0m"


def print_header(text: str):
    """Print styled header"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}  {text}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")


def print_error(text: str):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")


def print_warning(text: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")


def print_info(text: str):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")


def cmd_validate(args):
    """Run validation"""
    print_header("VALIDATING KNOWLEDGE BASE")

    try:
        from km_validator import KMValidator
        validator = KMValidator(KM_ROOT)
        validator.validate_all(args.path)
        validator.print_results()

        if args.report:
            output = KM_ROOT / "validation_report.json"
            validator.generate_report(output)

        return 0 if validator.stats.valid_files == validator.stats.total_files else 1
    except ImportError:
        # Fallback to subprocess
        cmd = [sys.executable, str(SCRIPT_DIR / "km_validator.py")]
        if args.path:
            cmd.extend(["--path", args.path])
        if args.report:
            cmd.append("--report")
        return subprocess.run(cmd).returncode


def cmd_index(args):
    """Run indexer"""
    print_header("INDEXING KNOWLEDGE BASE FOR RAG")

    try:
        from km_indexer import KMIndexer
        indexer = KMIndexer(KM_ROOT)
        indexer.index_all(args.path, force=args.reindex)
        indexer.print_stats()
        return 0
    except ImportError:
        cmd = [sys.executable, str(SCRIPT_DIR / "km_indexer.py")]
        if args.path:
            cmd.extend(["--path", args.path])
        if args.reindex:
            cmd.append("--reindex")
        return subprocess.run(cmd).returncode


def cmd_search(args):
    """Search knowledge base"""
    print_header(f"SEARCHING: {args.query}")

    try:
        from km_indexer import KMIndexer
        indexer = KMIndexer(KM_ROOT)
        results = indexer.search(args.query, args.top_k)

        if not results:
            print_warning("No results found")
            return 1

        for i, result in enumerate(results, 1):
            score = result.get("score", 0)
            color = Colors.GREEN if score > 0.7 else Colors.YELLOW if score > 0.5 else Colors.WHITE
            print(f"{color}{i}. [{score:.3f}] {result['title']}{Colors.RESET}")
            print(f"   📁 {result['file_path']}")
            if result.get('is_faq'):
                print(f"   {Colors.MAGENTA}Q: {result.get('question', '')[:80]}...{Colors.RESET}")
            print(f"   {result['content'][:200]}...")
            print()

        return 0
    except ImportError:
        cmd = [sys.executable, str(SCRIPT_DIR / "km_indexer.py"), "--search", args.query]
        return subprocess.run(cmd).returncode


def cmd_stats(args):
    """Show statistics"""
    print_header("KNOWLEDGE BASE STATISTICS")

    # Count files
    md_files = list(KM_ROOT.rglob("*.md"))
    md_files = [f for f in md_files if not f.name.startswith(".")]

    categories = {}
    total_words = 0
    total_faq = 0

    for md_file in md_files:
        content = md_file.read_text(encoding="utf-8")

        # Get category from frontmatter
        fm_match = re.search(r"^category:\s*(.+)$", content, re.MULTILINE)
        if fm_match:
            cat = fm_match.group(1).strip()
            categories[cat] = categories.get(cat, 0) + 1

        # Count words
        total_words += len(content.split())

        # Count FAQ
        total_faq += len(re.findall(r"### Q:", content))

    # Print stats
    print(f"{Colors.BOLD}📚 Documents:{Colors.RESET}")
    print(f"   Total files: {len(md_files)}")
    print(f"   Total words: {total_words:,}")
    print(f"   Total FAQ questions: {total_faq}")
    print()

    print(f"{Colors.BOLD}📁 Categories:{Colors.RESET}")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"   {cat}: {count} files")
    print()

    # Check index status
    cache_file = KM_ROOT / ".index_cache.json"
    if cache_file.exists():
        cache = json.loads(cache_file.read_text())
        print(f"{Colors.BOLD}🔍 Index Status:{Colors.RESET}")
        print(f"   Last indexed: {cache.get('last_index', 'Never')}")
        print(f"   Indexed files: {len(cache.get('indexed_files', {}))}")
    else:
        print_warning("Index not found. Run 'km_cli.py index' first.")

    return 0


def cmd_new(args):
    """Create new document"""
    print_header(f"CREATING NEW DOCUMENT IN: {args.category}")

    # Validate category
    valid_categories = ["water-loss", "dma-management", "pwa-operations", "standards", "glossary", "scenarios"]
    if args.category not in valid_categories:
        print_error(f"Invalid category. Valid categories: {', '.join(valid_categories)}")
        return 1

    # Get document name
    if not args.name:
        args.name = input("Document name (e.g., 05-new-topic): ").strip()

    if not args.name:
        print_error("Document name required")
        return 1

    # Create path
    doc_path = KM_ROOT / args.category / f"{args.name}.md"

    if doc_path.exists():
        print_error(f"File already exists: {doc_path}")
        return 1

    # Get title
    title = input("Document title (Thai + English): ").strip()
    if not title:
        title = args.name.replace("-", " ").title()

    # Create document
    today = datetime.now().strftime("%Y-%m-%d")
    be_year = int(today[:4]) + 543
    be_date = f"{be_year}{today[4:]}"

    template = f'''---
title: {title}
category: {args.category}
keywords: [{args.category}, keyword1, keyword2]
updated: {be_date}
---

# {title}

## คำจำกัดความ

...

## เนื้อหาหลัก

...

## ตารางข้อมูล

| หัวข้อ | รายละเอียด |
|-------|-----------|
| ... | ... |

---

## คำถามที่พบบ่อย (FAQ)

### Q: คำถาม 1?

**A:** คำตอบ 1...

### Q: คำถาม 2?

**A:** คำตอบ 2...

---

## เอกสารที่เกี่ยวข้อง (Related Documents)

- [เอกสารที่เกี่ยวข้อง](../path/to/doc.md)
'''

    # Ensure directory exists
    doc_path.parent.mkdir(parents=True, exist_ok=True)

    # Write file
    doc_path.write_text(template, encoding="utf-8")

    print_success(f"Created: {doc_path.relative_to(KM_ROOT)}")
    print_info("Remember to:")
    print("   1. Update keywords in frontmatter")
    print("   2. Add content")
    print("   3. Add at least 3-5 FAQ questions")
    print("   4. Run 'km_cli.py validate' to check")
    print("   5. Run 'km_cli.py index' to re-index")

    return 0


def cmd_update_dates(args):
    """Update dates in frontmatter"""
    print_header("UPDATING DOCUMENT DATES")

    today = datetime.now().strftime("%Y-%m-%d")
    be_year = int(today[:4]) + 543
    be_date = f"{be_year}{today[4:]}"

    md_files = list(KM_ROOT.rglob("*.md"))
    md_files = [f for f in md_files if not f.name.startswith(".")]

    updated = 0

    for md_file in md_files:
        content = md_file.read_text(encoding="utf-8")

        # Check if needs update
        if args.force or f"updated: {be_date}" not in content:
            # Update date
            new_content = re.sub(
                r"^updated:\s*.+$",
                f"updated: {be_date}",
                content,
                flags=re.MULTILINE
            )

            if new_content != content:
                if not args.dry_run:
                    md_file.write_text(new_content, encoding="utf-8")
                print(f"  📝 {md_file.relative_to(KM_ROOT)}")
                updated += 1

    if args.dry_run:
        print_warning(f"Dry run: would update {updated} files")
    else:
        print_success(f"Updated {updated} files")

    return 0


def cmd_check_links(args):
    """Check all internal links"""
    print_header("CHECKING INTERNAL LINKS")

    md_files = list(KM_ROOT.rglob("*.md"))
    md_files = [f for f in md_files if not f.name.startswith(".")]

    broken_links = []

    for md_file in md_files:
        content = md_file.read_text(encoding="utf-8")
        rel_path = md_file.relative_to(KM_ROOT)

        # Find all markdown links
        links = re.findall(r"\[([^\]]+)\]\(([^)]+\.md)\)", content)

        for link_text, link_url in links:
            # Resolve path
            if link_url.startswith("../"):
                target = md_file.parent / link_url
            else:
                target = md_file.parent / link_url

            if not target.resolve().exists():
                broken_links.append({
                    "file": str(rel_path),
                    "link_text": link_text,
                    "link_url": link_url
                })

    if broken_links:
        print_error(f"Found {len(broken_links)} broken links:")
        for link in broken_links:
            print(f"  📁 {link['file']}")
            print(f"     ❌ [{link['link_text']}]({link['link_url']})")
        return 1
    else:
        print_success("All internal links are valid")
        return 0


def cmd_list(args):
    """List all documents"""
    print_header("KNOWLEDGE BASE DOCUMENTS")

    md_files = list(KM_ROOT.rglob("*.md"))
    md_files = [f for f in md_files if not f.name.startswith(".")]
    md_files.sort()

    current_dir = None

    for md_file in md_files:
        rel_path = md_file.relative_to(KM_ROOT)
        parent = str(rel_path.parent) if rel_path.parent != Path(".") else "root"

        if parent != current_dir:
            current_dir = parent
            print(f"\n{Colors.BOLD}{Colors.CYAN}📁 {current_dir}/{Colors.RESET}")

        # Get title from frontmatter
        content = md_file.read_text(encoding="utf-8")
        title_match = re.search(r"^title:\s*(.+)$", content, re.MULTILINE)
        title = title_match.group(1) if title_match else md_file.stem

        print(f"   📄 {md_file.name} - {title}")

    print(f"\n{Colors.BOLD}Total: {len(md_files)} documents{Colors.RESET}")
    return 0


def main():
    parser = argparse.ArgumentParser(
        description="WARIS Knowledge Management CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # validate
    p_validate = subparsers.add_parser("validate", help="Validate KM documents")
    p_validate.add_argument("--path", help="Specific folder to validate")
    p_validate.add_argument("--report", action="store_true", help="Generate JSON report")

    # index
    p_index = subparsers.add_parser("index", help="Index documents for RAG")
    p_index.add_argument("--path", help="Specific folder to index")
    p_index.add_argument("--reindex", action="store_true", help="Force re-index")

    # search
    p_search = subparsers.add_parser("search", help="Search knowledge base")
    p_search.add_argument("query", help="Search query")
    p_search.add_argument("--top-k", type=int, default=5, help="Number of results")

    # stats
    p_stats = subparsers.add_parser("stats", help="Show statistics")

    # new
    p_new = subparsers.add_parser("new", help="Create new document")
    p_new.add_argument("category", help="Document category")
    p_new.add_argument("--name", help="Document filename")

    # update-dates
    p_dates = subparsers.add_parser("update-dates", help="Update dates in frontmatter")
    p_dates.add_argument("--force", action="store_true", help="Update all dates")
    p_dates.add_argument("--dry-run", action="store_true", help="Show what would be updated")

    # check-links
    p_links = subparsers.add_parser("check-links", help="Check internal links")

    # list
    p_list = subparsers.add_parser("list", help="List all documents")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    # Dispatch command
    commands = {
        "validate": cmd_validate,
        "index": cmd_index,
        "search": cmd_search,
        "stats": cmd_stats,
        "new": cmd_new,
        "update-dates": cmd_update_dates,
        "check-links": cmd_check_links,
        "list": cmd_list,
    }

    return commands[args.command](args)


if __name__ == "__main__":
    sys.exit(main())
