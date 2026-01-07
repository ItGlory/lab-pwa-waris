"""
Chat API Router - LLM-powered chat for WARIS
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json

from services.llm_service import llm_service


router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[list[ChatMessage]] = None
    context: Optional[str] = None


class ChatStatusResponse(BaseModel):
    llm_available: bool
    model: str
    available_models: list[str]


@router.get("/status", response_model=ChatStatusResponse)
async def get_chat_status():
    """Check LLM availability and configuration"""
    is_available = await llm_service.check_ollama_available()
    models = await llm_service.get_available_models() if is_available else []

    return ChatStatusResponse(
        llm_available=is_available,
        model=llm_service.model,
        available_models=models,
    )


@router.post("/stream")
async def stream_chat(request: ChatRequest):
    """
    Stream a chat response from the LLM

    Returns Server-Sent Events (SSE) stream with chunks of the response
    """
    async def generate():
        try:
            # Convert Pydantic models to dicts for the service
            history = None
            if request.conversation_history:
                history = [
                    {"role": msg.role, "content": msg.content}
                    for msg in request.conversation_history
                ]

            async for chunk in llm_service.stream_chat(
                message=request.message,
                conversation_history=history,
                context=request.context,
            ):
                # Send as SSE format
                yield f"data: {json.dumps({'content': chunk})}\n\n"

            # Send done signal
            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.post("/complete")
async def complete_chat(request: ChatRequest):
    """
    Get a complete (non-streaming) chat response

    Useful for simple queries where streaming isn't needed
    """
    try:
        # Convert Pydantic models to dicts
        history = None
        if request.conversation_history:
            history = [
                {"role": msg.role, "content": msg.content}
                for msg in request.conversation_history
            ]

        # Collect all chunks
        full_response = ""
        async for chunk in llm_service.stream_chat(
            message=request.message,
            conversation_history=history,
            context=request.context,
        ):
            full_response += chunk

        return {
            "message": full_response,
            "role": "assistant",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
