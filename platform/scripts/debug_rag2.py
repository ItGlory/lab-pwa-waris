#!/usr/bin/env python3
"""
Debug RAG - Check raw search results
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "api"))


async def main():
    print("🔍 Debug RAG - Raw Search Results\n")

    from services.rag.milvus_client import milvus_client
    from services.rag.embeddings import embedding_service

    # Connect
    await milvus_client.connect()

    # Get embedding
    test_text = "น้ำสูญเสียคืออะไร"
    embedding = await embedding_service.embed_text(test_text)

    # Direct search via lite client
    print("Raw search results:")
    results = milvus_client._lite_client.search(
        collection_name="waris_knowledge",
        data=[embedding],
        limit=5,
        output_fields=["content", "source", "category", "title", "chunk_index"],
    )

    for hits in results:
        for i, hit in enumerate(hits):
            print(f"\n--- Hit {i+1} ---")
            print(f"Type: {type(hit)}")
            print(f"Keys: {hit.keys() if hasattr(hit, 'keys') else 'N/A'}")
            print(f"ID: {hit.get('id', 'N/A')}")
            print(f"Distance: {hit.get('distance', 'N/A')}")
            # Print all attributes
            for k, v in hit.items():
                if k != 'entity':
                    print(f"{k}: {v}")
            entity = hit.get('entity', {})
            print(f"Source: {entity.get('source', 'N/A')}")


if __name__ == "__main__":
    asyncio.run(main())
