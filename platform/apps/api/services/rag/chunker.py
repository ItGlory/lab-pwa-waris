"""
Document Chunker
Split documents into chunks for embedding
TOR Reference: Section 4.5.4.5
"""

from typing import Dict, List, Optional, Tuple
import re
import hashlib
import logging
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)

# Default chunk settings
DEFAULT_CHUNK_SIZE = 512  # tokens (approximately)
DEFAULT_CHUNK_OVERLAP = 50
CHARS_PER_TOKEN = 4  # rough estimate for Thai/English mix


@dataclass
class DocumentChunk:
    """Represents a chunk of a document"""
    id: str
    content: str
    source: str
    category: str
    title: str
    chunk_index: int
    metadata: Dict


class DocumentChunker:
    """
    Document Chunker for RAG

    Splits markdown documents into overlapping chunks
    suitable for embedding and retrieval.
    """

    def __init__(
        self,
        chunk_size: int = DEFAULT_CHUNK_SIZE,
        chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        # Approximate character limit
        self.max_chars = chunk_size * CHARS_PER_TOKEN

    def chunk_document(
        self,
        content: str,
        source: str,
        category: Optional[str] = None,
        title: Optional[str] = None,
    ) -> List[DocumentChunk]:
        """
        Split a document into chunks

        Args:
            content: Document content (markdown)
            source: Source file path
            category: Document category
            title: Document title

        Returns:
            List of DocumentChunk objects
        """
        # Parse frontmatter if present
        metadata, body = self._parse_frontmatter(content)

        # Use metadata if not provided
        if not title:
            title = metadata.get("title", Path(source).stem)
        if not category:
            category = metadata.get("category", "general")

        # Split into sections first
        sections = self._split_into_sections(body)

        # Chunk each section
        chunks = []
        chunk_index = 0

        for section_title, section_content in sections:
            section_chunks = self._chunk_text(section_content)

            for chunk_text in section_chunks:
                # Add section title as context
                if section_title:
                    chunk_text = f"## {section_title}\n\n{chunk_text}"

                chunk_id = self._generate_id(source, chunk_index)

                chunks.append(DocumentChunk(
                    id=chunk_id,
                    content=chunk_text.strip(),
                    source=source,
                    category=category,
                    title=title,
                    chunk_index=chunk_index,
                    metadata={
                        **metadata,
                        "section": section_title,
                    },
                ))
                chunk_index += 1

        logger.info(f"Chunked {source} into {len(chunks)} chunks")
        return chunks

    def _parse_frontmatter(self, content: str) -> Tuple[Dict, str]:
        """Parse YAML frontmatter from markdown"""
        metadata = {}
        body = content

        # Check for frontmatter
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter = parts[1].strip()
                body = parts[2].strip()

                # Simple YAML parsing
                for line in frontmatter.split("\n"):
                    if ":" in line:
                        key, value = line.split(":", 1)
                        key = key.strip()
                        value = value.strip()

                        # Handle arrays
                        if value.startswith("[") and value.endswith("]"):
                            value = [
                                v.strip().strip("'\"")
                                for v in value[1:-1].split(",")
                            ]

                        metadata[key] = value

        return metadata, body

    def _split_into_sections(self, content: str) -> List[Tuple[str, str]]:
        """Split content into sections by headers"""
        sections = []

        # Split by ## headers (level 2)
        pattern = r'^## (.+)$'
        parts = re.split(pattern, content, flags=re.MULTILINE)

        if len(parts) == 1:
            # No sections, return whole content
            sections.append(("", parts[0].strip()))
        else:
            # First part before any header
            if parts[0].strip():
                sections.append(("", parts[0].strip()))

            # Pair up headers and content
            for i in range(1, len(parts), 2):
                header = parts[i].strip() if i < len(parts) else ""
                body = parts[i + 1].strip() if i + 1 < len(parts) else ""
                if body:
                    sections.append((header, body))

        return sections

    def _chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks"""
        if len(text) <= self.max_chars:
            return [text] if text.strip() else []

        chunks = []
        overlap_chars = self.chunk_overlap * CHARS_PER_TOKEN

        # Split by paragraphs first
        paragraphs = text.split("\n\n")
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # If paragraph fits in current chunk
            if len(current_chunk) + len(para) + 2 <= self.max_chars:
                if current_chunk:
                    current_chunk += "\n\n"
                current_chunk += para
            else:
                # Save current chunk
                if current_chunk:
                    chunks.append(current_chunk)

                # Handle long paragraphs
                if len(para) > self.max_chars:
                    # Split by sentences
                    sentences = self._split_sentences(para)
                    current_chunk = ""

                    for sent in sentences:
                        if len(current_chunk) + len(sent) + 1 <= self.max_chars:
                            if current_chunk:
                                current_chunk += " "
                            current_chunk += sent
                        else:
                            if current_chunk:
                                chunks.append(current_chunk)
                            current_chunk = sent
                else:
                    current_chunk = para

        # Don't forget the last chunk
        if current_chunk:
            chunks.append(current_chunk)

        # Add overlap between chunks
        if len(chunks) > 1 and overlap_chars > 0:
            overlapped_chunks = [chunks[0]]
            for i in range(1, len(chunks)):
                # Get end of previous chunk as overlap
                prev_text = chunks[i - 1]
                overlap = prev_text[-overlap_chars:] if len(prev_text) > overlap_chars else prev_text

                # Find a good break point
                last_space = overlap.rfind(" ")
                if last_space > 0:
                    overlap = overlap[last_space:].strip()

                # Prepend overlap
                overlapped_chunks.append(f"...{overlap}\n\n{chunks[i]}")

            return overlapped_chunks

        return chunks

    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences (handles Thai and English)"""
        # Thai sentence endings: space before new sentence, or specific punctuation
        # English: period, question mark, exclamation
        pattern = r'(?<=[.!?。])\s+|(?<=\s)(?=[ก-๙A-Z])'
        sentences = re.split(pattern, text)
        return [s.strip() for s in sentences if s.strip()]

    def _generate_id(self, source: str, chunk_index: int) -> str:
        """Generate unique ID for a chunk"""
        content = f"{source}:{chunk_index}"
        return hashlib.md5(content.encode()).hexdigest()[:16]


# Default chunker instance
document_chunker = DocumentChunker()
