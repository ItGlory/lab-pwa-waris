"""
Chat API Router - LLM-powered chat for WARIS
Uses OpenRouter (Thai 70B+) as default with Ollama fallback
TOR Reference: Section 4.5.2, 4.5.6
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import logging

from services.llm import default_llm_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    conversation_history: Optional[List[ChatMessage]] = Field(
        default=None,
        description="Previous conversation messages"
    )
    context: Optional[str] = Field(
        default=None,
        description="Additional context (e.g., DMA data, alerts)"
    )
    model: Optional[str] = Field(
        default=None,
        description="Specific model to use (optional)"
    )
    provider: Optional[str] = Field(
        default=None,
        description="Force specific provider: 'openrouter' or 'ollama'"
    )


class ChatResponse(BaseModel):
    message: str = Field(..., description="Assistant response")
    role: str = Field(default="assistant", description="Message role")
    model: Optional[str] = Field(default=None, description="Model used")
    provider: Optional[str] = Field(default=None, description="Provider used")


class ProviderStatus(BaseModel):
    available: bool
    healthy: bool
    is_primary: bool
    default_model: str
    models_count: int = 0


class ChatStatusResponse(BaseModel):
    llm_available: bool
    active_provider: str
    fallback_enabled: bool
    openrouter: ProviderStatus
    ollama: ProviderStatus


@router.get("/status", response_model=ChatStatusResponse)
async def get_chat_status():
    """
    Check LLM availability and configuration

    Returns status of both OpenRouter and Ollama providers.
    OpenRouter is the default provider with Thai 70B+ models.
    """
    try:
        status = await default_llm_service.get_providers_status()

        return ChatStatusResponse(
            llm_available=(
                status["openrouter"]["available"] or
                status["ollama"]["available"]
            ),
            active_provider=status["active_provider"],
            fallback_enabled=status["fallback_enabled"],
            openrouter=ProviderStatus(
                available=status["openrouter"]["available"],
                healthy=status["openrouter"]["healthy"],
                is_primary=status["openrouter"]["is_primary"],
                default_model=status["openrouter"]["default_model"],
                models_count=status["openrouter"]["models_count"],
            ),
            ollama=ProviderStatus(
                available=status["ollama"]["available"],
                healthy=status["ollama"]["healthy"],
                is_primary=status["ollama"]["is_primary"],
                default_model=status["ollama"]["default_model"],
                models_count=status["ollama"]["models_count"],
            ),
        )
    except Exception as e:
        logger.error(f"Failed to get chat status: {e}")
        raise HTTPException(status_code=500, detail="Failed to check LLM status")


@router.get("/models")
async def list_available_models():
    """
    List available LLM models from all providers

    Returns models grouped by provider (openrouter, ollama).
    """
    try:
        models = await default_llm_service.list_available_models()
        return {
            "success": True,
            "data": models,
        }
    except Exception as e:
        logger.error(f"Failed to list models: {e}")
        raise HTTPException(status_code=500, detail="Failed to list models")


@router.post("/stream")
async def stream_chat(request: ChatRequest):
    """
    Stream a chat response from the LLM

    Returns Server-Sent Events (SSE) stream with response chunks.
    Uses OpenRouter (Thai 70B+) as default, falls back to Ollama.

    Response format:
    - data: {"content": "token"} - Response token
    - data: {"done": true} - Stream complete
    - data: {"error": "message"} - Error occurred
    """
    async def generate():
        try:
            # Build messages list
            messages = []

            # Add conversation history
            if request.conversation_history:
                for msg in request.conversation_history:
                    messages.append({
                        "role": msg.role,
                        "content": msg.content
                    })

            # Add context as system message if provided
            if request.context:
                context_msg = f"บริบทเพิ่มเติมสำหรับการตอบ:\n{request.context}"
                messages.append({
                    "role": "system",
                    "content": context_msg
                })

            # Add current user message
            messages.append({
                "role": "user",
                "content": request.message
            })

            # Stream response
            async for token in default_llm_service.stream_chat(
                messages=messages,
                model=request.model,
                provider=request.provider,
            ):
                yield f"data: {json.dumps({'content': token}, ensure_ascii=False)}\n\n"

            # Send done signal
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            logger.error(f"Chat streaming error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/complete", response_model=ChatResponse)
async def complete_chat(request: ChatRequest):
    """
    Get a complete (non-streaming) chat response

    Uses OpenRouter (Thai 70B+) as default provider.
    Useful for simple queries where streaming isn't needed.
    """
    try:
        # Build messages list
        messages = []

        # Add conversation history
        if request.conversation_history:
            for msg in request.conversation_history:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

        # Add context as system message if provided
        if request.context:
            context_msg = f"บริบทเพิ่มเติมสำหรับการตอบ:\n{request.context}"
            messages.append({
                "role": "system",
                "content": context_msg
            })

        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })

        # Get response
        response = await default_llm_service.chat(
            messages=messages,
            model=request.model,
            provider=request.provider,
        )

        return ChatResponse(
            message=response.get("content", ""),
            role="assistant",
            model=response.get("model"),
            provider=response.get("provider"),
        )

    except Exception as e:
        logger.error(f"Chat completion error: {e}")
        raise HTTPException(
            status_code=500,
            detail="ไม่สามารถประมวลผลคำขอได้ กรุณาลองใหม่อีกครั้ง"
        )


@router.post("/check-relevance")
async def check_domain_relevance(
    message: str = Query(..., description="Message to check")
):
    """
    Check if a message is relevant to WARIS domain

    Returns whether the query is about water loss analysis
    and provides a reminder message if off-topic.
    """
    try:
        result = await default_llm_service.check_domain_relevance(message)
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        logger.error(f"Domain check error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check relevance")
