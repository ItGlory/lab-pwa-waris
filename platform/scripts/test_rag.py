#!/usr/bin/env python3
"""
Test RAG Query
ทดสอบการค้นหาข้อมูลจาก Knowledge Base
"""

import asyncio
import sys
from pathlib import Path

# Add apps/api to path
sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "api"))


async def test_rag_query(query: str):
    """Test RAG query with the given question"""
    print(f"\n🔍 Query: {query}")
    print("=" * 60)

    try:
        from services.rag import rag_retriever

        # Search for relevant documents (lower min_score for testing)
        results = await rag_retriever.retrieve(query, top_k=5, min_score=0.3)

        if not results:
            print("❌ ไม่พบข้อมูลที่เกี่ยวข้อง")
            return

        print(f"\n📚 พบ {len(results)} ผลลัพธ์:\n")

        for i, doc in enumerate(results, 1):
            print(f"--- ผลลัพธ์ที่ {i} ---")
            print(f"📁 Source: {doc.get('source', 'N/A')}")
            print(f"📂 Category: {doc.get('category', 'N/A')}")
            print(f"⭐ Score: {doc.get('score', 0):.4f}")
            print(f"📝 Content:\n{doc.get('content', '')[:500]}...")
            print()

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


async def main():
    # Test queries
    queries = [
        "น้ำสูญเสียคืออะไร",
        "DMA คืออะไร",
        "NRW มีกี่ประเภท",
        "การรั่วไหลทางกายภาพ",
    ]

    # Use command line argument if provided
    if len(sys.argv) > 1:
        queries = [" ".join(sys.argv[1:])]

    for query in queries:
        await test_rag_query(query)
        print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
