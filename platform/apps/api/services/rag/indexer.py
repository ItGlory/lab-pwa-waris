"""
Document Indexer
Index documents into Milvus for RAG
TOR Reference: Section 4.5.4.5
"""

from typing import Dict, List, Optional
import logging
from pathlib import Path

from services.rag.milvus_client import milvus_client, MilvusClient
from services.rag.embeddings import embedding_service, EmbeddingService
from services.rag.chunker import document_chunker, DocumentChunker, DocumentChunk

logger = logging.getLogger(__name__)

# Batch size for indexing
BATCH_SIZE = 10


class DocumentIndexer:
    """
    Document Indexer for RAG

    Handles indexing documents into Milvus vector store.
    Supports incremental updates and batch processing.
    """

    def __init__(
        self,
        milvus: Optional[MilvusClient] = None,
        embedder: Optional[EmbeddingService] = None,
        chunker: Optional[DocumentChunker] = None,
    ):
        self.milvus = milvus or milvus_client
        self.embedder = embedder or embedding_service
        self.chunker = chunker or document_chunker

    async def index_document(
        self,
        content: str,
        source: str,
        category: Optional[str] = None,
        title: Optional[str] = None,
        replace: bool = True,
    ) -> Dict:
        """
        Index a single document

        Args:
            content: Document content
            source: Source identifier (file path or URL)
            category: Document category
            title: Document title
            replace: Replace existing chunks from same source

        Returns:
            Indexing result stats
        """
        # Remove existing chunks if replacing
        if replace:
            deleted = await self.milvus.delete_by_source(source)
            if deleted:
                logger.info(f"Deleted {deleted} existing chunks from {source}")

        # Chunk the document
        chunks = self.chunker.chunk_document(
            content=content,
            source=source,
            category=category,
            title=title,
        )

        if not chunks:
            return {"source": source, "chunks": 0, "status": "empty"}

        # Generate embeddings
        contents = [c.content for c in chunks]
        embeddings = await self.embedder.embed_batch(contents)

        # Insert into Milvus
        await self.milvus.insert(
            ids=[c.id for c in chunks],
            embeddings=embeddings,
            contents=contents,
            sources=[c.source for c in chunks],
            categories=[c.category for c in chunks],
            titles=[c.title for c in chunks],
            chunk_indices=[c.chunk_index for c in chunks],
        )

        return {
            "source": source,
            "chunks": len(chunks),
            "status": "indexed",
        }

    async def index_directory(
        self,
        directory: str,
        pattern: str = "**/*.md",
        category_from_path: bool = True,
    ) -> Dict:
        """
        Index all documents in a directory

        Args:
            directory: Directory path
            pattern: Glob pattern for files
            category_from_path: Extract category from parent directory name

        Returns:
            Indexing results
        """
        dir_path = Path(directory)
        if not dir_path.exists():
            raise ValueError(f"Directory not found: {directory}")

        files = list(dir_path.glob(pattern))
        logger.info(f"Found {len(files)} files to index in {directory}")

        results = {
            "directory": str(directory),
            "files_found": len(files),
            "files_indexed": 0,
            "total_chunks": 0,
            "errors": [],
        }

        for file_path in files:
            try:
                # Read file
                content = file_path.read_text(encoding="utf-8")

                # Determine category
                category = None
                if category_from_path:
                    # Use parent directory as category
                    category = file_path.parent.name

                # Index document
                result = await self.index_document(
                    content=content,
                    source=str(file_path.relative_to(dir_path)),
                    category=category,
                )

                results["files_indexed"] += 1
                results["total_chunks"] += result.get("chunks", 0)

                logger.info(f"Indexed {file_path.name}: {result['chunks']} chunks")

            except Exception as e:
                logger.error(f"Failed to index {file_path}: {e}")
                results["errors"].append({
                    "file": str(file_path),
                    "error": str(e),
                })

        return results

    async def index_knowledge_base(self, km_directory: str) -> Dict:
        """
        Index the WARIS knowledge base

        Args:
            km_directory: Path to docs/km directory

        Returns:
            Indexing results
        """
        logger.info(f"Indexing knowledge base from {km_directory}")

        return await self.index_directory(
            directory=km_directory,
            pattern="**/*.md",
            category_from_path=True,
        )

    async def reindex_all(self, km_directory: str) -> Dict:
        """
        Reindex entire knowledge base (drops and recreates)

        Args:
            km_directory: Path to docs/km directory

        Returns:
            Indexing results
        """
        logger.warning("Reindexing: Dropping existing collection")

        # Drop collection
        await self.milvus.drop_collection()

        # Reindex
        return await self.index_knowledge_base(km_directory)


# Default indexer instance
document_indexer = DocumentIndexer()
