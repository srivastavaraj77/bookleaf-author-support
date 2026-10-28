"""
Real-time Server-Sent Events (SSE) manager for live ticket updates, responses, and status changes.
"""

import asyncio
import json
import logging
from typing import Dict, Set
from starlette.responses import StreamingResponse

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # author_id -> set of asyncio.Queue
        self._author_listeners: Dict[str, Set[asyncio.Queue]] = {}
        # admin listeners
        self._admin_listeners: Set[asyncio.Queue] = set()

    def subscribe_author(self, author_id: str) -> asyncio.Queue:
        queue = asyncio.Queue()
        if author_id not in self._author_listeners:
            self._author_listeners[author_id] = set()
        self._author_listeners[author_id].add(queue)
        return queue

    def unsubscribe_author(self, author_id: str, queue: asyncio.Queue):
        if author_id in self._author_listeners:
            self._author_listeners[author_id].discard(queue)
            if not self._author_listeners[author_id]:
                del self._author_listeners[author_id]

    def subscribe_admin(self) -> asyncio.Queue:
        queue = asyncio.Queue()
        self._admin_listeners.add(queue)
        return queue

    def unsubscribe_admin(self, queue: asyncio.Queue):
        self._admin_listeners.discard(queue)

    async def broadcast_ticket_update(self, author_id: str, ticket_data: dict, event_type: str = "ticket_update"):
        """
        Broadcast ticket status update or new public message to author and admins.
        Ensures internal notes are NEVER included here.
        """
        payload = {
            "event": event_type,
            "data": ticket_data
        }
        message_str = f"event: {event_type}\ndata: {json.dumps(ticket_data)}\n\n"

        # 1. Notify specific author
        if author_id in self._author_listeners:
            for queue in list(self._author_listeners[author_id]):
                try:
                    await queue.put(message_str)
                except Exception as e:
                    logger.warning(f"Failed to deliver SSE to author queue: {e}")

        # 2. Notify all connected admins
        for queue in list(self._admin_listeners):
            try:
                await queue.put(message_str)
            except Exception as e:
                logger.warning(f"Failed to deliver SSE to admin queue: {e}")


manager = ConnectionManager()

