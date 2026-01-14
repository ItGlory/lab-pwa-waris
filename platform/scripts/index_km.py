#!/usr/bin/env python3
"""
Index Knowledge Management documents into Milvus for RAG

Usage:
    python scripts/index_km.py                    # Index all
    python scripts/index_km.py --reindex          # Drop and reindex
    python scripts/index_km.py --stats            # Show stats only
"""

import asyncio
import argparse
import sys
from pathlib import Path

# Add apps/api to path
sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "api"))


async def main():
    parser = argparse.ArgumentParser(description="Index KM documents for RAG")
    parser.add_argument(
        "--reindex",
        action="store_true",
        help="Drop collection and reindex all documents",
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Show collection stats only",
    )
    parser.add_argument(
        "--km-path",
        default="../../docs/km",
        help="Path to KM documents (relative to scripts/)",
    )
    args = parser.parse_args()

    # Resolve KM path
    script_dir = Path(__file__).parent
    km_path = (script_dir / args.km_path).resolve()

    if not km_path.exists():
        print(f"❌ KM directory not found: {km_path}")
        return 1

    print(f"📚 KM Directory: {km_path}")

    # Import services
    try:
        from services.rag import document_indexer, milvus_client
    except ImportError as e:
        print(f"❌ Failed to import RAG services: {e}")
        print("   Make sure you're in the correct environment")
        return 1

    # Stats only
    if args.stats:
        print("\n📊 Collection Stats:")
        stats = await milvus_client.get_stats()
        for key, value in stats.items():
            print(f"   {key}: {value}")
        return 0

    # Index documents
    print("\n🔄 Indexing KM documents...")

    if args.reindex:
        print("⚠️  Reindex mode: Dropping existing collection")
        result = await document_indexer.reindex_all(str(km_path))
    else:
        result = await document_indexer.index_knowledge_base(str(km_path))

    # Print results
    print("\n✅ Indexing Complete!")
    print(f"   Files found: {result.get('files_found', 0)}")
    print(f"   Files indexed: {result.get('files_indexed', 0)}")
    print(f"   Total chunks: {result.get('total_chunks', 0)}")

    if result.get("errors"):
        print(f"\n⚠️  Errors ({len(result['errors'])}):")
        for error in result["errors"]:
            print(f"   - {error['file']}: {error['error']}")

    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
