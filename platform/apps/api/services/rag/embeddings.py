"""
Embedding Service
Generate vector embeddings for RAG
TOR Reference: Section 4.5.4.5
"""

from typing import List, Optional
import logging
import httpx

from core.llm_config import llm_settings

logger = logging.getLogger(__name__)

# Embedding configuration
DEFAULT_MODEL = "openai/text-embedding-ada-002"
EMBEDDING_DIM = 1536


class EmbeddingService:
    """
    Embedding Service using OpenRouter

    Generates vector embeddings for text using OpenAI's
    text-embedding-ada-002 model via OpenRouter.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = DEFAULT_MODEL,
    ):
        self.api_key = api_key or llm_settings.OPENROUTER_API_KEY
        self.base_url = llm_settings.OPENROUTER_BASE_URL
        self.model = model
        self.timeout = 30

    async def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text

        Args:
            text: Text to embed

        Returns:
            Embedding vector (1536 dimensions)
        """
        embeddings = await self.embed_batch([text])
        return embeddings[0] if embeddings else []

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts

        Args:
            texts: List of texts to embed

        Returns:
            List of embedding vectors
        """
        if not texts:
            return []

        # Clean texts
        cleaned = [self._clean_text(t) for t in texts]

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/embeddings",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://waris.pwa.co.th",
                        "X-Title": "WARIS",
                    },
                    json={
                        "model": self.model,
                        "input": cleaned,
                    },
                )
                response.raise_for_status()
                data = response.json()

                # Extract embeddings
                embeddings = []
                for item in sorted(data.get("data", []), key=lambda x: x["index"]):
                    embeddings.append(item["embedding"])

                logger.info(f"Generated {len(embeddings)} embeddings")
                return embeddings

        except httpx.HTTPStatusError as e:
            logger.error(f"Embedding API error: {e.response.status_code}")
            raise
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            raise

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text for embedding"""
        # Remove excessive whitespace
        text = " ".join(text.split())
        # Truncate if too long (max ~8000 tokens for ada-002)
        if len(text) > 30000:
            text = text[:30000]
        return text

    async def health_check(self) -> bool:
        """Check if embedding service is available"""
        try:
            # Try a simple embedding
            result = await self.embed_text("test")
            return len(result) == EMBEDDING_DIM
        except Exception:
            return False


# Alternative: Local embedding using sentence-transformers
class LocalEmbeddingService:
    """
    Local Embedding Service using sentence-transformers

    For air-gapped deployments without internet access.
    Uses multilingual models for Thai support.
    """

    def __init__(self, model_name: str = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"):
        self.model_name = model_name
        self._model = None

    def _load_model(self):
        """Lazy load the model"""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
                logger.info(f"Loaded local embedding model: {self.model_name}")
            except ImportError:
                logger.error("sentence-transformers not installed")
                raise
        return self._model

    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        model = self._load_model()
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        if not texts:
            return []
        model = self._load_model()
        embeddings = model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()


# Default service instance (uses OpenRouter)
embedding_service = EmbeddingService()
