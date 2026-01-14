"""
Milvus Vector Store Client
For RAG knowledge base storage and retrieval
TOR Reference: Section 4.5.4.5

Supports:
- Milvus Lite (local file-based) for development
- Milvus Server (distributed) for production
"""

from typing import Any, Dict, List, Optional
import logging
import os

from pymilvus import (
    connections,
    Collection,
    CollectionSchema,
    FieldSchema,
    DataType,
    utility,
    MilvusClient as PyMilvusClient,
)

from core.config import settings

logger = logging.getLogger(__name__)

# Collection configuration
COLLECTION_NAME = "waris_knowledge"
VECTOR_DIM = 1536  # OpenAI ada-002 dimension
INDEX_TYPE = "IVF_FLAT"
METRIC_TYPE = "COSINE"
NLIST = 128

# Default Milvus Lite database path
DEFAULT_DB_PATH = "./milvus_data/waris.db"


class MilvusClient:
    """
    Milvus Vector Database Client

    Features:
    - Connection management (Lite or Server mode)
    - Collection creation/management
    - Vector insertion and search
    - Metadata filtering

    Modes:
    - Lite: Local file-based (for development)
    - Server: Distributed Milvus (for production)
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        collection_name: str = COLLECTION_NAME,
        use_lite: Optional[bool] = None,
        db_path: Optional[str] = None,
    ):
        self.host = host or settings.MILVUS_HOST
        self.port = port or settings.MILVUS_PORT
        self.collection_name = collection_name
        self._collection: Optional[Collection] = None
        self._connected = False

        # Determine mode: Lite or Server
        # Use Lite if explicitly set, or if MILVUS_USE_LITE env is set, or if localhost
        if use_lite is not None:
            self._use_lite = use_lite
        else:
            env_lite = os.getenv("MILVUS_USE_LITE", "").lower()
            self._use_lite = env_lite in ("true", "1", "yes") or self.host == "localhost"

        # Database path for Lite mode
        self._db_path = db_path or os.getenv("MILVUS_DB_PATH", DEFAULT_DB_PATH)
        self._lite_client: Optional[PyMilvusClient] = None

    async def connect(self) -> bool:
        """Connect to Milvus (Server or Lite mode)"""
        try:
            if self._use_lite:
                return await self._connect_lite()
            else:
                return await self._connect_server()
        except Exception as e:
            logger.error(f"Failed to connect to Milvus: {e}")
            self._connected = False
            return False

    async def _connect_lite(self) -> bool:
        """Connect using Milvus Lite (local file)"""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self._db_path), exist_ok=True)

            # Use PyMilvusClient for Lite mode
            self._lite_client = PyMilvusClient(self._db_path)
            self._connected = True
            logger.info(f"Connected to Milvus Lite at {self._db_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Milvus Lite: {e}")
            self._connected = False
            return False

    async def _connect_server(self) -> bool:
        """Connect to Milvus Server"""
        try:
            connections.connect(
                alias="default",
                host=self.host,
                port=self.port,
            )
            self._connected = True
            logger.info(f"Connected to Milvus Server at {self.host}:{self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Milvus Server: {e}")
            self._connected = False
            return False

    async def disconnect(self) -> None:
        """Disconnect from Milvus"""
        try:
            if self._use_lite and self._lite_client:
                self._lite_client.close()
                self._lite_client = None
            else:
                connections.disconnect("default")
            self._connected = False
            logger.info("Disconnected from Milvus")
        except Exception as e:
            logger.error(f"Error disconnecting from Milvus: {e}")

    async def ensure_collection(self) -> Collection:
        """Ensure collection exists, create if not"""
        if not self._connected:
            await self.connect()

        if self._use_lite:
            return await self._ensure_collection_lite()
        else:
            return await self._ensure_collection_server()

    async def _ensure_collection_lite(self) -> Collection:
        """Ensure collection for Lite mode"""
        if not self._lite_client:
            await self.connect()

        # Check if collection exists
        collections = self._lite_client.list_collections()
        if self.collection_name not in collections:
            # Create collection with schema
            schema = self._lite_client.create_schema(
                auto_id=False,
                enable_dynamic_field=False,
            )
            schema.add_field(field_name="id", datatype=DataType.VARCHAR, is_primary=True, max_length=100)
            schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=VECTOR_DIM)
            schema.add_field(field_name="content", datatype=DataType.VARCHAR, max_length=65535)
            schema.add_field(field_name="source", datatype=DataType.VARCHAR, max_length=500)
            schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=100)
            schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=500)
            schema.add_field(field_name="chunk_index", datatype=DataType.INT64)

            # Create index params
            index_params = self._lite_client.prepare_index_params()
            index_params.add_index(
                field_name="embedding",
                index_type="FLAT",  # Use FLAT for Lite mode
                metric_type=METRIC_TYPE,
            )

            self._lite_client.create_collection(
                collection_name=self.collection_name,
                schema=schema,
                index_params=index_params,
            )
            logger.info(f"Created new collection (Lite): {self.collection_name}")
        else:
            logger.info(f"Loaded existing collection (Lite): {self.collection_name}")

        return None  # Lite mode doesn't use Collection object

    async def _ensure_collection_server(self) -> Collection:
        """Ensure collection for Server mode"""
        if utility.has_collection(self.collection_name):
            self._collection = Collection(self.collection_name)
            self._collection.load()
            logger.info(f"Loaded existing collection: {self.collection_name}")
        else:
            self._collection = await self._create_collection_server()
            logger.info(f"Created new collection: {self.collection_name}")

        return self._collection

    async def _create_collection_server(self) -> Collection:
        """Create the knowledge collection with schema (Server mode)"""
        # Define schema
        fields = [
            FieldSchema(
                name="id",
                dtype=DataType.VARCHAR,
                is_primary=True,
                max_length=100,
            ),
            FieldSchema(
                name="embedding",
                dtype=DataType.FLOAT_VECTOR,
                dim=VECTOR_DIM,
            ),
            FieldSchema(
                name="content",
                dtype=DataType.VARCHAR,
                max_length=65535,
            ),
            FieldSchema(
                name="source",
                dtype=DataType.VARCHAR,
                max_length=500,
            ),
            FieldSchema(
                name="category",
                dtype=DataType.VARCHAR,
                max_length=100,
            ),
            FieldSchema(
                name="title",
                dtype=DataType.VARCHAR,
                max_length=500,
            ),
            FieldSchema(
                name="chunk_index",
                dtype=DataType.INT64,
            ),
        ]

        schema = CollectionSchema(
            fields=fields,
            description="WARIS knowledge base for RAG",
        )

        # Create collection
        collection = Collection(
            name=self.collection_name,
            schema=schema,
        )

        # Create index
        index_params = {
            "index_type": INDEX_TYPE,
            "metric_type": METRIC_TYPE,
            "params": {"nlist": NLIST},
        }
        collection.create_index(
            field_name="embedding",
            index_params=index_params,
        )

        collection.load()
        return collection

    async def insert(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        contents: List[str],
        sources: List[str],
        categories: List[str],
        titles: List[str],
        chunk_indices: List[int],
    ) -> int:
        """Insert documents into collection"""
        await self.ensure_collection()

        if self._use_lite:
            return await self._insert_lite(ids, embeddings, contents, sources, categories, titles, chunk_indices)
        else:
            return await self._insert_server(ids, embeddings, contents, sources, categories, titles, chunk_indices)

    async def _insert_lite(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        contents: List[str],
        sources: List[str],
        categories: List[str],
        titles: List[str],
        chunk_indices: List[int],
    ) -> int:
        """Insert documents (Lite mode)"""
        data = [
            {
                "id": ids[i],
                "embedding": embeddings[i],
                "content": contents[i],
                "source": sources[i],
                "category": categories[i] or "",
                "title": titles[i] or "",
                "chunk_index": chunk_indices[i],
            }
            for i in range(len(ids))
        ]

        result = self._lite_client.insert(
            collection_name=self.collection_name,
            data=data,
        )

        logger.info(f"Inserted {len(ids)} documents (Lite)")
        return result.get("insert_count", len(ids))

    async def _insert_server(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        contents: List[str],
        sources: List[str],
        categories: List[str],
        titles: List[str],
        chunk_indices: List[int],
    ) -> int:
        """Insert documents (Server mode)"""
        collection = self._collection

        data = [
            ids,
            embeddings,
            contents,
            sources,
            categories,
            titles,
            chunk_indices,
        ]

        result = collection.insert(data)
        collection.flush()

        logger.info(f"Inserted {len(ids)} documents")
        return result.insert_count

    async def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        category: Optional[str] = None,
        min_score: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents

        Args:
            query_embedding: Query vector
            top_k: Number of results to return
            category: Filter by category
            min_score: Minimum similarity score (0-1)

        Returns:
            List of matching documents with scores
        """
        await self.ensure_collection()

        if self._use_lite:
            return await self._search_lite(query_embedding, top_k, category, min_score)
        else:
            return await self._search_server(query_embedding, top_k, category, min_score)

    async def _search_lite(
        self,
        query_embedding: List[float],
        top_k: int,
        category: Optional[str],
        min_score: float,
    ) -> List[Dict[str, Any]]:
        """Search documents (Lite mode)"""
        # Build filter expression
        filter_expr = None
        if category:
            filter_expr = f'category == "{category}"'

        results = self._lite_client.search(
            collection_name=self.collection_name,
            data=[query_embedding],
            limit=top_k,
            filter=filter_expr,
            output_fields=["content", "source", "category", "title", "chunk_index"],
        )

        documents = []
        for hits in results:
            for hit in hits:
                # Milvus Lite with COSINE metric returns similarity directly (0-1)
                # Higher value = more similar (not distance!)
                score = hit.get("distance", 0)

                if score >= min_score:
                    entity = hit.get("entity", {})
                    documents.append({
                        "id": hit.get("id"),
                        "score": score,
                        "content": entity.get("content"),
                        "source": entity.get("source"),
                        "category": entity.get("category"),
                        "title": entity.get("title"),
                        "chunk_index": entity.get("chunk_index"),
                    })

        return documents

    async def _search_server(
        self,
        query_embedding: List[float],
        top_k: int,
        category: Optional[str],
        min_score: float,
    ) -> List[Dict[str, Any]]:
        """Search documents (Server mode)"""
        collection = self._collection

        search_params = {
            "metric_type": METRIC_TYPE,
            "params": {"nprobe": 16},
        }

        # Build filter expression
        expr = None
        if category:
            expr = f'category == "{category}"'

        results = collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            expr=expr,
            output_fields=["content", "source", "category", "title", "chunk_index"],
        )

        documents = []
        for hits in results:
            for hit in hits:
                # Convert distance to similarity score (cosine)
                score = 1 - hit.distance if METRIC_TYPE == "COSINE" else hit.distance

                if score >= min_score:
                    documents.append({
                        "id": hit.id,
                        "score": score,
                        "content": hit.entity.get("content"),
                        "source": hit.entity.get("source"),
                        "category": hit.entity.get("category"),
                        "title": hit.entity.get("title"),
                        "chunk_index": hit.entity.get("chunk_index"),
                    })

        return documents

    async def delete_by_source(self, source: str) -> int:
        """Delete all documents from a source"""
        await self.ensure_collection()

        if self._use_lite:
            # Lite mode delete
            expr = f'source == "{source}"'
            result = self._lite_client.delete(
                collection_name=self.collection_name,
                filter=expr,
            )
            return result.get("delete_count", 0) if isinstance(result, dict) else 0
        else:
            # Server mode delete
            collection = self._collection
            expr = f'source == "{source}"'
            result = collection.delete(expr)
            collection.flush()
            return result.delete_count

    async def get_stats(self) -> Dict[str, Any]:
        """Get collection statistics"""
        try:
            await self.ensure_collection()

            if self._use_lite:
                stats = self._lite_client.get_collection_stats(self.collection_name)
                return {
                    "collection_name": self.collection_name,
                    "num_entities": stats.get("row_count", 0),
                    "connected": self._connected,
                    "mode": "lite",
                }
            else:
                collection = self._collection
                return {
                    "collection_name": self.collection_name,
                    "num_entities": collection.num_entities,
                    "connected": self._connected,
                    "mode": "server",
                }
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {
                "collection_name": self.collection_name,
                "num_entities": 0,
                "connected": False,
                "error": str(e),
            }

    async def drop_collection(self) -> bool:
        """Drop the collection (use with caution)"""
        try:
            if self._use_lite:
                if self._lite_client and self.collection_name in self._lite_client.list_collections():
                    self._lite_client.drop_collection(self.collection_name)
                    logger.info(f"Dropped collection (Lite): {self.collection_name}")
                    return True
            else:
                if utility.has_collection(self.collection_name):
                    utility.drop_collection(self.collection_name)
                    logger.info(f"Dropped collection: {self.collection_name}")
                    return True
            return False
        except Exception as e:
            logger.error(f"Failed to drop collection: {e}")
            return False


# Default client instance (uses Lite mode for localhost)
milvus_client = MilvusClient()
