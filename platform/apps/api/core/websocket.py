"""
WebSocket connection manager for real-time updates
"""

from typing import Dict, Set
from fastapi import WebSocket
import json
import asyncio


class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""

    def __init__(self):
        # Active connections by channel
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # User to connection mapping
        self.user_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str = "alerts", user_id: str = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()

        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)

        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str = "alerts", user_id: str = None):
        """Remove a WebSocket connection"""
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)

        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to a specific connection"""
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    async def broadcast(self, message: dict, channel: str = "alerts"):
        """Broadcast message to all connections in a channel"""
        if channel not in self.active_connections:
            return

        disconnected = set()
        for connection in self.active_connections[channel]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)

        # Clean up disconnected connections
        for conn in disconnected:
            self.active_connections[channel].discard(conn)

    async def send_to_user(self, message: dict, user_id: str):
        """Send message to all connections of a specific user"""
        if user_id not in self.user_connections:
            return

        disconnected = set()
        for connection in self.user_connections[user_id]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)

        # Clean up disconnected connections
        for conn in disconnected:
            self.user_connections[user_id].discard(conn)

    def get_connection_count(self, channel: str = "alerts") -> int:
        """Get number of active connections in a channel"""
        return len(self.active_connections.get(channel, set()))


# Global connection manager instance
manager = ConnectionManager()


async def notify_new_alert(alert: dict):
    """Notify all clients of a new alert"""
    await manager.broadcast({
        "type": "new_alert",
        "data": alert,
    }, channel="alerts")


async def notify_alert_update(alert: dict, action: str):
    """Notify all clients of an alert update"""
    await manager.broadcast({
        "type": "alert_update",
        "action": action,
        "data": alert,
    }, channel="alerts")


async def notify_dma_update(dma: dict):
    """Notify all clients of a DMA status update"""
    await manager.broadcast({
        "type": "dma_update",
        "data": dma,
    }, channel="dma")
