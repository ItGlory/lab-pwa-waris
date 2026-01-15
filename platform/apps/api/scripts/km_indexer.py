#!/usr/bin/env python3
"""
WARIS Knowledge Management Indexer for RAG
==========================================
Index KM documents into Milvus vector database for RAG retrieval

Usage:
    python km_indexer.py                      # Index all documents
    python km_indexer.py --path water-loss    # Index specific folder
    python km_indexer.py --reindex            # Force re-index all
    python km_indexer.py --status             # Check index status
    python km_indexer.py --search "NRW"       # Test search
"""

import os
import re
import sys
import json
import hashlib
import argparse
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional
import yaml

# Try to import optional dependencies
try:
    from sentence_transformers import SentenceTransformer
    HAS_EMBEDDINGS = True
except ImportError:
    HAS_EMBEDDINGS = False
    print("⚠️  sentence-transformers not installed. Using mock embeddings.")

try:
    from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
    HAS_MILVUS = True
except ImportError:
    HAS_MILVUS = False
    print("⚠️  pymilvus not installed. Using local JSON storage.")

# Constants
KM_ROOT = Path(__file__).parent.parent.parent.parent.parent / "docs" / "km"
INDEX_CACHE = KM_ROOT / ".index_cache.json"
CHUNK_SIZE = 512  # tokens (approximately)
CHUNK_OVERLAP = 50
COLLECTION_NAME = "waris_knowledge"

# Milvus config
MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT = int(os.getenv("MILVUS_PORT", "19530"))
EMBEDDING_DIM = 384  # for all-MiniLM-L6-v2


@dataclass
class DocumentChunk:
    """A chunk of document for indexing"""
    id: str
    file_path: str
    title: str
    category: str
    keywords: list[str]
    content: str
    chunk_index: int
    total_chunks: int
    heading: Optional[str] = None
    is_faq: bool = False
    question: Optional[str] = None
    answer: Optional[str] = None
    embedding: Optional[list[float]] = None
    content_hash: str = ""

    def __post_init__(self):
        self.content_hash = hashlib.md5(self.content.encode()).hexdigest()[:8]
        self.id = f"{self.file_path}:{self.chunk_index}:{self.content_hash}"


@dataclass
class IndexStats:
    """Indexing statistics"""
    total_files: int = 0
    total_chunks: int = 0
    new_chunks: int = 0
    updated_chunks: int = 0
    deleted_chunks: int = 0
    total_faq: int = 0
    indexing_time: float = 0.0


class KMIndexer:
    """Knowledge Management Document Indexer"""

    def __init__(self, km_root: Path = KM_ROOT):
        self.km_root = km_root
        self.chunks: list[DocumentChunk] = []
        self.stats = IndexStats()
        self.cache = self._load_cache()
        self.model = None

        if HAS_EMBEDDINGS:
            print("🔄 Loading embedding model...")
            self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
            print("✅ Model loaded")

    def _load_cache(self) -> dict:
        """Load index cache"""
        if INDEX_CACHE.exists():
            try:
                return json.loads(INDEX_CACHE.read_text())
            except Exception:
                pass
        return {"indexed_files": {}, "last_index": None}

    def _save_cache(self):
        """Save index cache"""
        self.cache["last_index"] = datetime.now().isoformat()
        INDEX_CACHE.write_text(json.dumps(self.cache, indent=2, ensure_ascii=False))

    def index_all(self, path: Optional[str] = None, force: bool = False) -> IndexStats:
        """Index all KM documents"""
        import time
        start_time = time.time()

        search_path = self.km_root / path if path else self.km_root

        if not search_path.exists():
            print(f"❌ Path not found: {search_path}")
            return self.stats

        md_files = list(search_path.rglob("*.md"))
        print(f"\n📚 Indexing {len(md_files)} files from {search_path}\n")

        for md_file in md_files:
            # Skip cache file
            if md_file.name.startswith("."):
                continue

            rel_path = str(md_file.relative_to(self.km_root))

            # Check if file needs re-indexing
            file_hash = self._get_file_hash(md_file)
            cached_hash = self.cache["indexed_files"].get(rel_path, {}).get("hash")

            if not force and cached_hash == file_hash:
                print(f"⏭️  Skipping (unchanged): {rel_path}")
                continue

            print(f"📄 Indexing: {rel_path}")
            file_chunks = self._process_file(md_file)
            self.chunks.extend(file_chunks)

            # Update cache
            self.cache["indexed_files"][rel_path] = {
                "hash": file_hash,
                "chunks": len(file_chunks),
                "indexed_at": datetime.now().isoformat()
            }

            self.stats.total_files += 1
            self.stats.new_chunks += len(file_chunks)

        # Generate embeddings
        if self.chunks and HAS_EMBEDDINGS:
            self._generate_embeddings()

        # Store in Milvus or local
        if self.chunks:
            self._store_chunks()

        self._save_cache()

        self.stats.indexing_time = time.time() - start_time
        self.stats.total_chunks = len(self.chunks)

        return self.stats

    def _get_file_hash(self, file_path: Path) -> str:
        """Get file content hash"""
        content = file_path.read_text(encoding="utf-8")
        return hashlib.md5(content.encode()).hexdigest()

    def _process_file(self, file_path: Path) -> list[DocumentChunk]:
        """Process a single file into chunks"""
        content = file_path.read_text(encoding="utf-8")
        rel_path = str(file_path.relative_to(self.km_root))

        # Parse frontmatter
        fm_match = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
        if not fm_match:
            return []

        try:
            frontmatter = yaml.safe_load(fm_match.group(1))
        except yaml.YAMLError:
            return []

        title = frontmatter.get("title", file_path.stem)
        category = frontmatter.get("category", "unknown")
        keywords = frontmatter.get("keywords", [])

        # Remove frontmatter from content
        body = content[fm_match.end():]

        chunks = []

        # Extract FAQ first (special handling)
        faq_chunks = self._extract_faq_chunks(body, rel_path, title, category, keywords)
        chunks.extend(faq_chunks)
        self.stats.total_faq += len(faq_chunks)

        # Chunk regular content
        regular_chunks = self._chunk_content(body, rel_path, title, category, keywords)
        chunks.extend(regular_chunks)

        # Update chunk indices
        for i, chunk in enumerate(chunks):
            chunk.chunk_index = i
            chunk.total_chunks = len(chunks)

        return chunks

    def _extract_faq_chunks(
        self,
        content: str,
        file_path: str,
        title: str,
        category: str,
        keywords: list[str]
    ) -> list[DocumentChunk]:
        """Extract FAQ as separate chunks"""
        chunks = []

        # Find FAQ section
        faq_match = re.search(r"## คำถามที่พบบ่อย.*?\n(.*?)(?=\n## [^#]|\n---|\Z)", content, re.DOTALL)
        if not faq_match:
            return chunks

        faq_content = faq_match.group(1)

        # Extract Q&A pairs
        qa_pattern = r"### Q:\s*(.*?)\n\n\*\*A:\*\*\s*(.*?)(?=\n### Q:|\Z)"
        qa_matches = re.findall(qa_pattern, faq_content, re.DOTALL)

        for question, answer in qa_matches:
            question = question.strip()
            answer = answer.strip()

            chunk = DocumentChunk(
                id="",
                file_path=file_path,
                title=title,
                category=category,
                keywords=keywords,
                content=f"Q: {question}\n\nA: {answer}",
                chunk_index=0,
                total_chunks=0,
                heading="FAQ",
                is_faq=True,
                question=question,
                answer=answer
            )
            chunks.append(chunk)

        return chunks

    def _chunk_content(
        self,
        content: str,
        file_path: str,
        title: str,
        category: str,
        keywords: list[str]
    ) -> list[DocumentChunk]:
        """Chunk content by sections"""
        chunks = []

        # Remove FAQ section from content (already processed)
        content = re.sub(r"## คำถามที่พบบ่อย.*?(?=\n## [^#]|\n---|\Z)", "", content, flags=re.DOTALL)

        # Split by headings
        sections = re.split(r"\n(#{1,3} .+)\n", content)

        current_heading = None
        current_content = []

        for i, section in enumerate(sections):
            if re.match(r"^#{1,3} ", section):
                # This is a heading
                if current_content:
                    # Save previous section
                    chunk_text = "\n".join(current_content).strip()
                    if len(chunk_text) > 100:  # Minimum chunk size
                        chunk = DocumentChunk(
                            id="",
                            file_path=file_path,
                            title=title,
                            category=category,
                            keywords=keywords,
                            content=chunk_text,
                            chunk_index=0,
                            total_chunks=0,
                            heading=current_heading
                        )
                        chunks.append(chunk)

                current_heading = section.strip("# ").strip()
                current_content = []
            else:
                current_content.append(section)

        # Save last section
        if current_content:
            chunk_text = "\n".join(current_content).strip()
            if len(chunk_text) > 100:
                chunk = DocumentChunk(
                    id="",
                    file_path=file_path,
                    title=title,
                    category=category,
                    keywords=keywords,
                    content=chunk_text,
                    chunk_index=0,
                    total_chunks=0,
                    heading=current_heading
                )
                chunks.append(chunk)

        return chunks

    def _generate_embeddings(self):
        """Generate embeddings for all chunks"""
        if not self.model:
            return

        print(f"\n🔄 Generating embeddings for {len(self.chunks)} chunks...")

        texts = [chunk.content for chunk in self.chunks]
        embeddings = self.model.encode(texts, show_progress_bar=True)

        for chunk, embedding in zip(self.chunks, embeddings):
            chunk.embedding = embedding.tolist()

        print("✅ Embeddings generated")

    def _store_chunks(self):
        """Store chunks in Milvus or local JSON"""
        if HAS_MILVUS:
            self._store_milvus()
        else:
            self._store_local()

    def _store_milvus(self):
        """Store chunks in Milvus"""
        print(f"\n🔄 Connecting to Milvus at {MILVUS_HOST}:{MILVUS_PORT}...")

        try:
            connections.connect("default", host=MILVUS_HOST, port=MILVUS_PORT)
        except Exception as e:
            print(f"❌ Cannot connect to Milvus: {e}")
            print("📁 Falling back to local storage...")
            self._store_local()
            return

        # Create collection if not exists
        if not utility.has_collection(COLLECTION_NAME):
            print(f"📦 Creating collection: {COLLECTION_NAME}")
            self._create_milvus_collection()

        collection = Collection(COLLECTION_NAME)

        # Prepare data
        data = [
            [c.id for c in self.chunks],
            [c.file_path for c in self.chunks],
            [c.title for c in self.chunks],
            [c.category for c in self.chunks],
            [json.dumps(c.keywords, ensure_ascii=False) for c in self.chunks],
            [c.content for c in self.chunks],
            [c.heading or "" for c in self.chunks],
            [c.is_faq for c in self.chunks],
            [c.question or "" for c in self.chunks],
            [c.embedding or [0.0] * EMBEDDING_DIM for c in self.chunks],
        ]

        # Insert
        collection.insert(data)
        collection.flush()

        print(f"✅ Inserted {len(self.chunks)} chunks into Milvus")

    def _create_milvus_collection(self):
        """Create Milvus collection schema"""
        fields = [
            FieldSchema(name="id", dtype=DataType.VARCHAR, max_length=256, is_primary=True),
            FieldSchema(name="file_path", dtype=DataType.VARCHAR, max_length=512),
            FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
            FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=64),
            FieldSchema(name="keywords", dtype=DataType.VARCHAR, max_length=1024),
            FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=8192),
            FieldSchema(name="heading", dtype=DataType.VARCHAR, max_length=256),
            FieldSchema(name="is_faq", dtype=DataType.BOOL),
            FieldSchema(name="question", dtype=DataType.VARCHAR, max_length=1024),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM),
        ]

        schema = CollectionSchema(fields, description="WARIS Knowledge Base")
        collection = Collection(COLLECTION_NAME, schema)

        # Create index
        index_params = {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 128}
        }
        collection.create_index("embedding", index_params)

    def _store_local(self):
        """Store chunks in local JSON file"""
        output_path = self.km_root / ".index_data.json"

        data = [
            {
                "id": c.id,
                "file_path": c.file_path,
                "title": c.title,
                "category": c.category,
                "keywords": c.keywords,
                "content": c.content,
                "heading": c.heading,
                "is_faq": c.is_faq,
                "question": c.question,
                "embedding": c.embedding,
            }
            for c in self.chunks
        ]

        output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
        print(f"✅ Saved {len(self.chunks)} chunks to {output_path}")

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """Search indexed documents"""
        if not self.model:
            print("❌ Embedding model not available")
            return []

        # Generate query embedding
        query_embedding = self.model.encode([query])[0].tolist()

        if HAS_MILVUS:
            return self._search_milvus(query_embedding, top_k)
        else:
            return self._search_local(query_embedding, top_k)

    def _search_milvus(self, query_embedding: list[float], top_k: int) -> list[dict]:
        """Search in Milvus"""
        try:
            connections.connect("default", host=MILVUS_HOST, port=MILVUS_PORT)
            collection = Collection(COLLECTION_NAME)
            collection.load()

            results = collection.search(
                data=[query_embedding],
                anns_field="embedding",
                param={"metric_type": "COSINE", "params": {"nprobe": 10}},
                limit=top_k,
                output_fields=["file_path", "title", "content", "is_faq", "question"]
            )

            return [
                {
                    "score": hit.score,
                    "file_path": hit.entity.get("file_path"),
                    "title": hit.entity.get("title"),
                    "content": hit.entity.get("content"),
                    "is_faq": hit.entity.get("is_faq"),
                    "question": hit.entity.get("question"),
                }
                for hit in results[0]
            ]
        except Exception as e:
            print(f"❌ Milvus search error: {e}")
            return self._search_local(query_embedding, top_k)

    def _search_local(self, query_embedding: list[float], top_k: int) -> list[dict]:
        """Search in local JSON"""
        import numpy as np

        data_path = self.km_root / ".index_data.json"
        if not data_path.exists():
            print("❌ No local index found. Run indexer first.")
            return []

        data = json.loads(data_path.read_text())

        # Calculate cosine similarity
        query_vec = np.array(query_embedding)
        results = []

        for item in data:
            if item.get("embedding"):
                doc_vec = np.array(item["embedding"])
                similarity = np.dot(query_vec, doc_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(doc_vec))
                results.append({
                    "score": float(similarity),
                    "file_path": item["file_path"],
                    "title": item["title"],
                    "content": item["content"][:500],
                    "is_faq": item.get("is_faq", False),
                    "question": item.get("question"),
                })

        # Sort by score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def get_status(self) -> dict:
        """Get indexing status"""
        status = {
            "last_index": self.cache.get("last_index"),
            "indexed_files": len(self.cache.get("indexed_files", {})),
            "total_chunks": sum(
                f.get("chunks", 0)
                for f in self.cache.get("indexed_files", {}).values()
            ),
        }

        # Check Milvus status
        if HAS_MILVUS:
            try:
                connections.connect("default", host=MILVUS_HOST, port=MILVUS_PORT)
                if utility.has_collection(COLLECTION_NAME):
                    collection = Collection(COLLECTION_NAME)
                    status["milvus_count"] = collection.num_entities
                    status["milvus_status"] = "connected"
                else:
                    status["milvus_status"] = "no collection"
            except Exception as e:
                status["milvus_status"] = f"error: {e}"
        else:
            status["milvus_status"] = "not installed"

        return status

    def print_stats(self):
        """Print indexing statistics"""
        print("\n" + "=" * 60)
        print("📊 INDEXING STATISTICS")
        print("=" * 60)
        print(f"Files processed: {self.stats.total_files}")
        print(f"Total chunks: {self.stats.total_chunks}")
        print(f"New chunks: {self.stats.new_chunks}")
        print(f"FAQ chunks: {self.stats.total_faq}")
        print(f"Indexing time: {self.stats.indexing_time:.2f}s")


def main():
    parser = argparse.ArgumentParser(description="WARIS KM Indexer")
    parser.add_argument("--path", help="Specific folder to index")
    parser.add_argument("--reindex", action="store_true", help="Force re-index all")
    parser.add_argument("--status", action="store_true", help="Show index status")
    parser.add_argument("--search", help="Test search query")
    parser.add_argument("--top-k", type=int, default=5, help="Number of results")

    args = parser.parse_args()

    indexer = KMIndexer()

    if args.status:
        status = indexer.get_status()
        print("\n📊 INDEX STATUS")
        print("=" * 40)
        for key, value in status.items():
            print(f"{key}: {value}")
        return

    if args.search:
        print(f"\n🔍 Searching: {args.search}\n")
        results = indexer.search(args.search, args.top_k)
        for i, result in enumerate(results, 1):
            print(f"{i}. [{result['score']:.3f}] {result['title']}")
            print(f"   File: {result['file_path']}")
            if result.get('is_faq'):
                print(f"   Q: {result.get('question', '')[:80]}...")
            print(f"   {result['content'][:200]}...")
            print()
        return

    # Run indexer
    indexer.index_all(args.path, force=args.reindex)
    indexer.print_stats()


if __name__ == "__main__":
    main()
