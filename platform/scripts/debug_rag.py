#!/usr/bin/env python3
"""
Debug RAG - Check each component
"""

import asyncio
import sys
from pathlib import Path

# Add apps/api to path
sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "api"))


async def main():
    print("🔍 Debug RAG Components\n")

    # 1. Check Milvus connection
    print("1️⃣ Testing Milvus connection...")
    try:
        from services.rag.milvus_client import milvus_client

        stats = await milvus_client.get_stats()
        print(f"   ✅ Connected: {stats.get('connected')}")
        print(f"   ✅ Mode: {stats.get('mode')}")
        print(f"   ✅ Collection: {stats.get('collection_name')}")
        print(f"   ✅ Documents: {stats.get('num_entities')}")
    except Exception as e:
        print(f"   ❌ Milvus Error: {e}")
        return

    # 2. Check Embeddings
    print("\n2️⃣ Testing Embeddings...")
    try:
        from services.rag.embeddings import embedding_service

        test_text = "น้ำสูญเสียคืออะไร"
        embedding = await embedding_service.embed_text(test_text)
        print(f"   ✅ Embedding generated")
        print(f"   ✅ Dimension: {len(embedding)}")
        print(f"   ✅ Sample values: {embedding[:5]}")
    except Exception as e:
        print(f"   ❌ Embedding Error: {e}")
        import traceback
        traceback.print_exc()
        return

    # 3. Test direct search
    print("\n3️⃣ Testing direct search...")
    try:
        results = await milvus_client.search(
            query_embedding=embedding,
            top_k=5,
            min_score=0.0,  # No minimum score filter
        )
        print(f"   ✅ Search completed")
        print(f"   ✅ Results found: {len(results)}")

        if results:
            for i, r in enumerate(results[:3], 1):
                print(f"\n   --- Result {i} ---")
                print(f"   Score: {r.get('score', 0):.4f}")
                print(f"   Source: {r.get('source', 'N/A')}")
                print(f"   Category: {r.get('category', 'N/A')}")
                content = r.get('content', '')[:200]
                print(f"   Content: {content}...")
    except Exception as e:
        print(f"   ❌ Search Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
