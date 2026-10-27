import asyncio
import json
import logging
from typing import Optional
from fastapi import APIRouter, Query, Request
from starlette.responses import StreamingResponse
from app.core.security import decode_access_token
from app.services.sse_service import manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/events", tags=["Real-time Events"])


@router.get("/stream")
async def sse_event_stream(
    request: Request,
    token: Optional[str] = Query(None)
):
    """
    Server-Sent Events endpoint streaming live ticket updates and responses.
    Accepts JWT in query parameter ?token=... or Authorization header for browser EventSource.
    """
    # Extract token
    auth_header = request.headers.get("Authorization")
    jwt_token = token
    if not jwt_token and auth_header and auth_header.startswith("Bearer "):
        jwt_token = auth_header.split(" ")[1]

    if not jwt_token:
        async def unauthorized_stream():
            yield f"event: error\ndata: {json.dumps({'error': 'Unauthorized: Token required'})}\n\n"
        return StreamingResponse(unauthorized_stream(), media_type="text/event-stream")

    payload = decode_access_token(jwt_token)
    if not payload:
        async def invalid_token_stream():
            yield f"event: error\ndata: {json.dumps({'error': 'Invalid or expired token'})}\n\n"
        return StreamingResponse(invalid_token_stream(), media_type="text/event-stream")

    role = payload.get("role")
    author_id = payload.get("author_id")

    # Subscribe queue
    if role == "admin":
        queue = manager.subscribe_admin()
        is_admin = True
    elif author_id:
        queue = manager.subscribe_author(author_id)
        is_admin = False
    else:
        async def no_role_stream():
            yield f"event: error\ndata: {json.dumps({'error': 'No author or admin context found'})}\n\n"
        return StreamingResponse(no_role_stream(), media_type="text/event-stream")

    async def event_generator():
        # Send initial connection confirmation
        yield f"event: connected\ndata: {json.dumps({'status': 'connected', 'role': role, 'author_id': author_id})}\n\n"
        try:
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    break

                try:
                    # Wait for next event or timeout for keep-alive ping
                    message = await asyncio.wait_for(queue.get(), timeout=20.0)
                    yield message
                except asyncio.TimeoutError:
                    # Keep-alive comment
                    yield ": ping\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if is_admin:
                manager.unsubscribe_admin(queue)
            elif author_id:
                manager.unsubscribe_author(author_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
