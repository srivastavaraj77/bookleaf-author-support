import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_author, get_current_user
from app.models.models import Ticket, TicketMessage, Book, Author, User
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketMessageCreate,
    TicketMessageResponse,
)
from app.services.ai.service import AIService
from app.services.sse_service import manager

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def format_ticket_response(ticket: Ticket) -> dict:
    latest_msg = ticket.messages[-1] if ticket.messages else None
    return {
        "id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "author_id": ticket.author_id,
        "author_name": ticket.author.name if ticket.author else "Author",
        "author_email": ticket.author.email if ticket.author else None,
        "book_id": ticket.book_id,
        "book_title": ticket.book.title if ticket.book else "General / Account Level",
        "subject": ticket.subject,
        "description": ticket.description,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status,
        "ai_category": ticket.ai_category,
        "ai_priority": ticket.ai_priority,
        "ai_confidence": ticket.ai_confidence,
        "ai_reasoning": ticket.ai_reasoning,
        "ai_processing_status": ticket.ai_processing_status,
        "ai_provider": ticket.ai_provider,
        "assigned_admin_id": ticket.assigned_admin_id,
        "assigned_admin_name": ticket.assigned_admin_name,
        "attachment_filename": ticket.attachment_filename,
        "attachment_url": ticket.attachment_url,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "messages": ticket.messages,
        "latest_message": latest_msg,
    }


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    payload: TicketCreate,
    current_author: Author = Depends(get_current_author),
    db: Session = Depends(get_db)
):
    # Verify book_id if provided
    book_title = None
    if payload.book_id and payload.book_id != "general":
        book = db.query(Book).filter(
            Book.book_id == payload.book_id,
            Book.author_id == current_author.author_id
        ).first()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Book ID '{payload.book_id}' is not linked to your author profile."
            )
        book_title = book.title
    else:
        payload.book_id = None

    # Generate unique ticket number
    ticket_count = db.query(Ticket).count()
    ticket_number = f"TICK-{datetime.now().year}-{1001 + ticket_count}"

    # AI Classification & Priority Scoring with graceful fallback
    classification, provider_name, ai_status = AIService.classify_and_prioritize_ticket(
        subject=payload.subject,
        description=payload.description,
        book_title=book_title
    )

    ticket = Ticket(
        ticket_number=ticket_number,
        author_id=current_author.author_id,
        book_id=payload.book_id,
        subject=payload.subject,
        description=payload.description,
        category=classification.category,
        priority=classification.priority,
        status="Open",
        ai_category=classification.category,
        ai_priority=classification.priority,
        ai_confidence=classification.confidence,
        ai_reasoning=classification.reasoning,
        ai_processing_status=ai_status,
        ai_provider=provider_name,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Initial public message representing author query
    initial_message = TicketMessage(
        ticket_id=ticket.id,
        sender_role="author",
        sender_name=current_author.name,
        sender_email=current_author.email,
        message=payload.description,
    )
    db.add(initial_message)
    db.commit()
    db.refresh(ticket)

    # Broadcast update to connected admin sessions
    response_data = format_ticket_response(ticket)
    await manager.broadcast_ticket_update(
        author_id=current_author.author_id,
        ticket_data={
            "ticket_id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "subject": ticket.subject,
            "author_name": current_author.name,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "type": "new_ticket"
        },
        event_type="new_ticket"
    )

    return response_data


@router.get("", response_model=List[TicketResponse])
def get_my_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_author: Author = Depends(get_current_author),
    db: Session = Depends(get_db)
):
    query = db.query(Ticket).filter(Ticket.author_id == current_author.author_id)
    if status_filter and status_filter != "all":
        query = query.filter(Ticket.status == status_filter)

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return [format_ticket_response(t) for t in tickets]


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket_detail(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    # Access check: Author can only access their own ticket
    if current_user.role != "admin":
        author = db.query(Author).filter(Author.user_id == current_user.id).first()
        if not author:
            author = db.query(Author).filter(Author.email == current_user.email).first()

        if not author or author.author_id != ticket.author_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this ticket."
            )

    return format_ticket_response(ticket)


@router.post("/{ticket_id}/messages", response_model=TicketMessageResponse)
async def post_author_message(
    ticket_id: int,
    payload: TicketMessageCreate,
    current_author: Author = Depends(get_current_author),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.author_id == current_author.author_id
    ).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    if ticket.status == "Closed":
        # Reopen if closed and author posts
        ticket.status = "In Progress"

    new_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_role="author",
        sender_name=current_author.name,
        sender_email=current_author.email,
        message=payload.message.strip(),
    )
    db.add(new_msg)
    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(new_msg)

    # Broadcast to admin
    await manager.broadcast_ticket_update(
        author_id=current_author.author_id,
        ticket_data={
            "ticket_id": ticket.id,
            "status": ticket.status,
            "message": new_msg.message,
            "sender_name": new_msg.sender_name,
            "sender_role": new_msg.sender_role,
            "created_at": new_msg.created_at.isoformat(),
        },
        event_type="new_message"
    )

    return new_msg


@router.get("/{ticket_id}/updates")
def poll_ticket_updates(
    ticket_id: int,
    since: Optional[str] = Query(None, description="ISO timestamp of last known update"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Polling fallback for real-time updates.
    Returns ticket status and any messages posted after 'since'.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    if current_user.role != "admin":
        author = db.query(Author).filter(Author.user_id == current_user.id).first()
        if not author:
            author = db.query(Author).filter(Author.email == current_user.email).first()
        if not author or author.author_id != ticket.author_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    msgs_query = db.query(TicketMessage).filter(TicketMessage.ticket_id == ticket_id)
    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
            msgs_query = msgs_query.filter(TicketMessage.created_at > since_dt)
        except Exception:
            pass

    new_messages = msgs_query.order_by(TicketMessage.created_at.asc()).all()

    return {
        "ticket_id": ticket.id,
        "status": ticket.status,
        "category": ticket.category,
        "priority": ticket.priority,
        "updated_at": ticket.updated_at.isoformat(),
        "new_messages": [
            {
                "id": m.id,
                "sender_role": m.sender_role,
                "sender_name": m.sender_name,
                "message": m.message,
                "created_at": m.created_at.isoformat(),
            }
            for m in new_messages
        ]
    }


@router.post("/upload")
async def upload_attachment(
    file: UploadFile = File(...),
    current_author: Author = Depends(get_current_author)
):
    """
    Validates file extension and size, saves attachment securely.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Read content to verify size limit
    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = f"{uuid.uuid4().hex}_{os.path.basename(file.filename)}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    return {
        "filename": file.filename,
        "stored_filename": safe_filename,
        "file_url": f"/api/v1/uploads/{safe_filename}",
        "size_bytes": len(content)
    }
