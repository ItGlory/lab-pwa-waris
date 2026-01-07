"""
WebSocket Router - Real-time updates
"""

import asyncio
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from core.websocket import manager
from core.security import verify_access_token
from services.alert_service import AlertService

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/alerts")
async def websocket_alerts(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
):
    """WebSocket endpoint for real-time alert updates"""
    # Verify token if provided
    user_id = None
    if token:
        payload = verify_access_token(token)
        if payload:
            user_id = payload.get("sub")

    await manager.connect(websocket, channel="alerts", user_id=user_id)

    try:
        # Send initial alert summary
        summary = await AlertService.get_summary()
        await manager.send_personal_message({
            "type": "init",
            "data": {
                "summary": summary,
                "connected": True,
            },
        }, websocket)

        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for client messages (heartbeat, etc.)
                data = await asyncio.wait_for(
                    websocket.receive_json(),
                    timeout=30.0  # 30 second timeout
                )

                # Handle ping/pong
                if data.get("type") == "ping":
                    await manager.send_personal_message({
                        "type": "pong",
                        "timestamp": data.get("timestamp"),
                    }, websocket)

            except asyncio.TimeoutError:
                # Send heartbeat to keep connection alive
                await manager.send_personal_message({
                    "type": "heartbeat",
                }, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, channel="alerts", user_id=user_id)
    except Exception:
        manager.disconnect(websocket, channel="alerts", user_id=user_id)


@router.websocket("/ws/dma")
async def websocket_dma(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
):
    """WebSocket endpoint for real-time DMA updates"""
    user_id = None
    if token:
        payload = verify_access_token(token)
        if payload:
            user_id = payload.get("sub")

    await manager.connect(websocket, channel="dma", user_id=user_id)

    try:
        # Send connection confirmation
        await manager.send_personal_message({
            "type": "init",
            "data": {"connected": True},
        }, websocket)

        while True:
            try:
                data = await asyncio.wait_for(
                    websocket.receive_json(),
                    timeout=30.0
                )

                if data.get("type") == "ping":
                    await manager.send_personal_message({
                        "type": "pong",
                        "timestamp": data.get("timestamp"),
                    }, websocket)

            except asyncio.TimeoutError:
                await manager.send_personal_message({
                    "type": "heartbeat",
                }, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, channel="dma", user_id=user_id)
    except Exception:
        manager.disconnect(websocket, channel="dma", user_id=user_id)


@router.get("/ws/status")
async def websocket_status():
    """Get WebSocket connection statistics"""
    return {
        "alerts_connections": manager.get_connection_count("alerts"),
        "dma_connections": manager.get_connection_count("dma"),
    }
