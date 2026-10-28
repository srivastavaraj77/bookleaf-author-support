from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.models import (
    Ticket, TicketMessage, InternalNote, AIDraft, Book, Author, User
)
from app.schemas.ticket import (
    TicketResponse,
    TicketAdminDetailResponse,
    TicketStatusUpdate,
    TicketOverrideUpdate,
    TicketAssignUpdate,
    SendAdminReplyRequest,
    InternalNoteCreate,
    InternalNoteResponse,
    AIDraftResponse,
    AdminDashboardStats,
    CategoryVolume,
    OldestUnresolvedTicket,
)
from app.services.ai.service import AIService
from app.services.sse_service import manager
from app.api.v1.tickets import format_ticket_response

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


@router.get("/dashboard", response_model=AdminDashboardStats)
def get_admin_dashboard(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total = db.query(Ticket).count()
    open_cnt = db.query(Ticket).filter(Ticket.status == "Open").count()
    in_prog_cnt = db.query(Ticket).filter(Ticket.status == "In Progress").count()
    resolved_cnt = db.query(Ticket).filter(Ticket.status == "Resolved").count()
    closed_cnt = db.query(Ticket).filter(Ticket.status == "Closed").count()

    critical_cnt = db.query(Ticket).filter(
        Ticket.priority == "Critical",
        Ticket.status.in_(["Open", "In Progress"])
    ).count()

    high_cnt = db.query(Ticket).filter(
        Ticket.priority == "High",
        Ticket.status.in_(["Open", "In Progress"])
    ).count()

    # Category volume distribution
    cat_rows = (
        db.query(Ticket.category, func.count(Ticket.id))
        .group_by(Ticket.category)
        .all()
    )
    category_volume = [CategoryVolume(category=cat, count=cnt) for cat, cnt in cat_rows]

    # Oldest unresolved tickets
    unresolved = (
        db.query(Ticket)
        .filter(Ticket.status.in_(["Open", "In Progress"]))
        .order_by(Ticket.created_at.asc())
        .limit(6)
        .all()
    )

    now_utc = datetime.now(timezone.utc)
    oldest_unresolved = []
    for t in unresolved:
        age_seconds = (now_utc - t.created_at.replace(tzinfo=timezone.utc if t.created_at.tzinfo is None else t.created_at.tzinfo)).total_seconds()
        age_hours = round(max(0.0, age_seconds / 3600.0), 1)
        oldest_unresolved.append(
            OldestUnresolvedTicket(
                id=t.id,
                ticket_number=t.ticket_number,
                subject=t.subject,
                author_name=t.author.name if t.author else "Author",
                priority=t.priority,
                status=t.status,
                age_hours=age_hours,
                created_at=t.created_at
            )
        )

    # Recent tickets
    recent_tickets_raw = db.query(Ticket).order_by(Ticket.created_at.desc()).limit(10).all()
    recent_tickets = [format_ticket_response(t) for t in recent_tickets_raw]

    return AdminDashboardStats(
        total_tickets=total,
        open_tickets=open_cnt,
        in_progress_tickets=in_prog_cnt,
        resolved_tickets=resolved_cnt,
        closed_tickets=closed_cnt,
        critical_tickets=critical_cnt,
        high_priority_tickets=high_cnt,
        category_volume=category_volume,
        oldest_unresolved=oldest_unresolved,
        recent_tickets=recent_tickets
    )


@router.get("/tickets", response_model=List[TicketResponse])
def get_admin_ticket_queue(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    priority: Optional[str] = None,
    author_id: Optional[str] = None,
    book_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = Query("newest", description="newest | oldest | priority"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)

    if status_filter and status_filter != "all":
        query = query.filter(Ticket.status == status_filter)

    if category and category != "all":
        query = query.filter(Ticket.category == category)

    if priority and priority != "all":
        query = query.filter(Ticket.priority == priority)

    if author_id and author_id != "all":
        query = query.filter(Ticket.author_id == author_id)

    if book_id and book_id != "all":
        query = query.filter(Ticket.book_id == book_id)

    if search:
        s = f"%{search.strip()}%"
        query = query.join(Ticket.author).filter(
            (Ticket.subject.ilike(s)) |
            (Ticket.ticket_number.ilike(s)) |
            (Ticket.description.ilike(s)) |
            (Author.name.ilike(s))
        )

    if sort_by == "oldest":
        query = query.order_by(Ticket.created_at.asc())
    elif sort_by == "priority":
        # Custom ordering for Critical -> High -> Medium -> Low
        from sqlalchemy import case
        priority_order = case(
            (Ticket.priority == "Critical", 1),
            (Ticket.priority == "High", 2),
            (Ticket.priority == "Medium", 3),
            (Ticket.priority == "Low", 4),
            else_=5
        )
        query = query.order_by(priority_order.asc(), Ticket.created_at.asc())
    else:
        query = query.order_by(Ticket.created_at.desc())

    tickets = query.all()
    return [format_ticket_response(t) for t in tickets]


@router.get("/tickets/{ticket_id}", response_model=TicketAdminDetailResponse)
def get_admin_ticket_detail(
    ticket_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    base_response = format_ticket_response(ticket)

    # Book details if linked
    book_dict = None
    if ticket.book:
        b = ticket.book
        book_dict = {
            "book_id": b.book_id,
            "title": b.title,
            "isbn": b.isbn,
            "genre": b.genre,
            "publication_date": b.publication_date,
            "status": b.status,
            "mrp": b.mrp,
            "author_royalty_per_copy": b.author_royalty_per_copy,
            "total_copies_sold": b.total_copies_sold,
            "total_royalty_earned": b.total_royalty_earned,
            "royalty_paid": b.royalty_paid,
            "royalty_pending": b.royalty_pending,
            "last_royalty_payout_date": b.last_royalty_payout_date,
            "print_partner": b.print_partner,
            "available_on": b.available_on or [],
        }

    # Author details
    author_dict = None
    if ticket.author:
        a = ticket.author
        author_dict = {
            "author_id": a.author_id,
            "name": a.name,
            "email": a.email,
            "phone": a.phone,
            "city": a.city,
            "joined_date": a.joined_date,
        }

    # Automatically generate an AI draft if none exists yet
    if not ticket.ai_drafts:
        try:
            AIService.generate_draft_response(db, ticket, regenerate=False)
            db.refresh(ticket)
        except Exception as e:
            pass

    return {
        **base_response,
        "internal_notes": ticket.internal_notes,
        "ai_drafts": ticket.ai_drafts,
        "book_details": book_dict,
        "author_details": author_dict,
    }


@router.patch("/tickets/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    valid_statuses = ["Open", "In Progress", "Resolved", "Closed"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status. Must be one of: {valid_statuses}")

    old_status = ticket.status
    ticket.status = payload.status
    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()

    # System notice in message stream
    sys_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_role="system",
        sender_name="System",
        message=f"Ticket status was updated from '{old_status}' to '{ticket.status}' by {current_admin.full_name}."
    )
    db.add(sys_msg)
    db.commit()

    # Broadcast update
    await manager.broadcast_ticket_update(
        author_id=ticket.author_id,
        ticket_data={
            "ticket_id": ticket.id,
            "status": ticket.status,
            "updated_at": ticket.updated_at.isoformat()
        },
        event_type="status_change"
    )

    return {"message": "Status updated successfully.", "status": ticket.status}


@router.patch("/tickets/{ticket_id}/override")
def override_ticket_classification(
    ticket_id: int,
    payload: TicketOverrideUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    if payload.category:
        ticket.category = payload.category
    if payload.priority:
        ticket.priority = payload.priority

    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "message": "Classification / priority updated.",
        "category": ticket.category,
        "priority": ticket.priority,
        "ai_category": ticket.ai_category,
        "ai_priority": ticket.ai_priority
    }


@router.patch("/tickets/{ticket_id}/assign")
def assign_ticket(
    ticket_id: int,
    payload: TicketAssignUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    admin_id = payload.admin_id if payload.admin_id is not None else current_admin.id
    admin_user = db.query(User).filter(User.id == admin_id).first()

    ticket.assigned_admin_id = admin_id
    ticket.assigned_admin_name = admin_user.full_name if admin_user else current_admin.full_name
    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "message": "Ticket assigned successfully.",
        "assigned_admin_id": ticket.assigned_admin_id,
        "assigned_admin_name": ticket.assigned_admin_name
    }


@router.post("/tickets/{ticket_id}/notes", response_model=InternalNoteResponse)
def add_internal_note(
    ticket_id: int,
    payload: InternalNoteCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    note = InternalNote(
        ticket_id=ticket.id,
        admin_id=current_admin.id,
        admin_name=current_admin.full_name,
        note=payload.note.strip()
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("/tickets/{ticket_id}/reply")
async def send_admin_reply(
    ticket_id: int,
    payload: SendAdminReplyRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    # Record message
    reply_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_role="admin",
        sender_name=current_admin.full_name,
        sender_email=current_admin.email,
        message=payload.message.strip()
    )
    db.add(reply_msg)

    # Optional status update (e.g. In Progress or Resolved)
    if payload.status_change and payload.status_change in ["In Progress", "Resolved", "Closed"]:
        ticket.status = payload.status_change
    elif ticket.status == "Open":
        ticket.status = "In Progress"

    # Track AI draft linkage if sent from draft
    if payload.draft_id:
        draft = db.query(AIDraft).filter(AIDraft.id == payload.draft_id).first()
        if draft:
            draft.final_sent_content = payload.message.strip()
            draft.was_edited = (draft.draft_content.strip() != payload.message.strip())

    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(reply_msg)

    # Broadcast to author via SSE
    await manager.broadcast_ticket_update(
        author_id=ticket.author_id,
        ticket_data={
            "ticket_id": ticket.id,
            "status": ticket.status,
            "message": reply_msg.message,
            "sender_name": reply_msg.sender_name,
            "sender_role": reply_msg.sender_role,
            "created_at": reply_msg.created_at.isoformat()
        },
        event_type="new_message"
    )

    return {
        "message": "Reply sent successfully to author.",
        "reply": {
            "id": reply_msg.id,
            "message": reply_msg.message,
            "sender_name": reply_msg.sender_name,
            "created_at": reply_msg.created_at
        },
        "ticket_status": ticket.status
    }


@router.post("/tickets/{ticket_id}/draft/generate", response_model=AIDraftResponse)
def generate_or_regenerate_ai_draft(
    ticket_id: int,
    regenerate: bool = Query(True),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    draft = AIService.generate_draft_response(db, ticket, regenerate=regenerate)
    return draft

